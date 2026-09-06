import { Topic, QuizResult, UserProfile, Problem, isValidatedOrActive } from '../types';
import { 
  CompetencyBlueprint, 
  CompetencyNode, 
  KnowledgeEdge, 
  KnowledgeGraphData, 
  CompetencyMasteryStatus 
} from '../types/knowledgeMap';
import { GRADE_11_COMPETENCIES } from '../data/competencyGraph';

export function buildKnowledgeGraph(
  topics: Topic[],
  results: QuizResult[],
  profile: UserProfile
): KnowledgeGraphData {
  // 1. Gather all active problems across topics for competency problem counting
  const allProblems: Problem[] = topics.flatMap(t => 
    t.quizzes.flatMap(q => q.problems)
  ).filter(isValidatedOrActive);

  // Map competency names/IDs to available problem count
  const problemCountMap = new Map<string, number>();
  allProblems.forEach(p => {
    const key = (p.competency || '').toLowerCase().trim();
    if (key) {
      problemCountMap.set(key, (problemCountMap.get(key) || 0) + 1);
    }
  });

  // 2. Aggregate student responses from quiz results
  // We track both exact competency string matches and topic-level completion
  const competencyStats = new Map<string, { attempts: number; correct: number }>();
  
  results.forEach(res => {
    if (res.itemResponses && Array.isArray(res.itemResponses)) {
      res.itemResponses.forEach(ir => {
        const compKey = (ir.competency || '').toLowerCase().trim();
        if (compKey) {
          const current = competencyStats.get(compKey) || { attempts: 0, correct: 0 };
          current.attempts += 1;
          if (ir.isCorrect) current.correct += 1;
          competencyStats.set(compKey, current);
        }
      });
    }
  });

  // 3. Fallback: Check topic mastery for nodes if no itemResponses recorded yet
  const topicMasteryMap = new Map<string, number>();
  topics.forEach(topic => {
    let earned = 0;
    let total = 0;
    topic.quizzes.forEach(q => {
      total += q.problems.length;
      const matchingResults = results.filter(r => r.quizId === q.id);
      if (matchingResults.length > 0) {
        const best = Math.max(...matchingResults.map(r => r.score));
        earned += best;
      }
    });
    const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
    topicMasteryMap.set(topic.id, pct);
  });

  // 4. Start with blueprint nodes
  const blueprintList: CompetencyBlueprint[] = [...GRADE_11_COMPETENCIES];

  // 5. Look for any custom competencies created by faculty that aren't in blueprint
  allProblems.forEach(p => {
    if (!p.competency) return;
    const pCompNorm = p.competency.toLowerCase().trim();
    const exists = blueprintList.some(b => 
      b.name.toLowerCase().trim() === pCompNorm ||
      b.id.toLowerCase() === pCompNorm
    );
    if (!exists) {
      // Create a dynamic blueprint entry
      const topic = topics.find(t => t.id === p.topic || t.title === p.topic) || topics[0];
      const tier: 1 | 2 | 3 = p.difficulty === 'hard' ? 3 : p.difficulty === 'medium' ? 2 : 1;
      const tierLabel = tier === 1 ? 'Foundations' : tier === 2 ? 'Core Competencies' : 'Advanced Topics';
      
      blueprintList.push({
        id: `custom-${p.competency.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: p.competency,
        topicId: topic?.id || 'general',
        topicTitle: topic?.title || 'General Math',
        tier,
        tierLabel,
        prerequisiteIds: tier > 1 ? ['comp-func-ident'] : [],
        description: p.explanation || `Competency in ${topic?.title || 'Grade 11 Mathematics'}.`,
        difficulty: p.difficulty,
        difficultyParameter: p.difficultyParameter,
        cognitiveLevel: p.cognitiveLevel,
        canvasX: tier === 1 ? 140 : tier === 2 ? 470 : 820,
        canvasY: 100 + (blueprintList.length % 5) * 90
      });
    }
  });

  // 6. Calculate initial mastery percentage and attempts for every node
  const initialMastery = new Map<string, { pct: number; attempts: number; correct: number }>();

  blueprintList.forEach(bp => {
    const normName = bp.name.toLowerCase().trim();
    let stats = competencyStats.get(normName);
    
    // Fuzzy matching if exact string differs slightly
    if (!stats) {
      for (const [key, val] of competencyStats.entries()) {
        if (key.includes(normName) || normName.includes(key)) {
          stats = val;
          break;
        }
      }
    }

    let attempts = stats ? stats.attempts : 0;
    let correct = stats ? stats.correct : 0;
    let pct = 0;

    if (attempts > 0) {
      pct = Math.round((correct / attempts) * 100);
    } else {
      // Check diagnostic assessment scores if available
      if (profile.diagnosticScores) {
        const diagScore = profile.diagnosticScores[bp.topicId] ?? profile.diagnosticScores[normName];
        if (typeof diagScore === 'number' && diagScore > 0) {
          pct = Math.round(diagScore * 10); // scale 0-10 to percentage
          attempts = 1;
          correct = pct >= 70 ? 1 : 0;
        }
      }
      // Topic level fallback if student completed quizzes in this topic
      if (attempts === 0) {
        const topicPct = topicMasteryMap.get(bp.topicId) || 0;
        if (topicPct > 0) {
          // Adjust slightly by tier
          const tierFactor = bp.tier === 1 ? 1.0 : bp.tier === 2 ? 0.85 : 0.7;
          pct = Math.round(topicPct * tierFactor);
          if (pct >= 50) {
            attempts = 2;
            correct = Math.round(attempts * (pct / 100));
          }
        }
      }
    }

    initialMastery.set(bp.id, { pct: Math.min(100, Math.max(0, pct)), attempts, correct });
  });

  // 7. Evaluate prerequisites and build CompetencyNodes
  const blueprintMap = new Map(blueprintList.map(b => [b.id, b]));
  
  // Also find which nodes unlock which other nodes (forward mapping)
  const unlocksMap = new Map<string, string[]>();
  blueprintList.forEach(bp => {
    bp.prerequisiteIds.forEach(prereqId => {
      const existing = unlocksMap.get(prereqId) || [];
      existing.push(bp.name);
      unlocksMap.set(prereqId, existing);
    });
  });

  const nodes: CompetencyNode[] = blueprintList.map(bp => {
    const { pct, attempts, correct } = initialMastery.get(bp.id) || { pct: 0, attempts: 0, correct: 0 };
    
    // Check prerequisites
    const unmetPrerequisiteNames: string[] = [];
    let prerequisitesMet = true;

    bp.prerequisiteIds.forEach(prereqId => {
      const prereqBp = blueprintMap.get(prereqId);
      const prereqMastery = initialMastery.get(prereqId)?.pct || 0;
      if (prereqMastery < 70) {
        prerequisitesMet = false;
        if (prereqBp) unmetPrerequisiteNames.push(prereqBp.name);
      }
    });

    // Derive Status:
    // - mastered: >= 80%
    // - in_progress: 50% - 79%
    // - needs_review: < 50% with attempts > 0
    // - ready: attempts == 0, prerequisites met
    // - locked: attempts == 0, prerequisites not met
    let status: CompetencyMasteryStatus;
    if (pct >= 80) {
      status = 'mastered';
    } else if (pct >= 50) {
      status = 'in_progress';
    } else if (attempts > 0) {
      status = 'needs_review';
    } else if (prerequisitesMet) {
      status = 'ready';
    } else {
      status = 'locked';
    }

    // Available active problem count for this competency
    const normName = bp.name.toLowerCase().trim();
    const availableProblemsCount = problemCountMap.get(normName) || 
      allProblems.filter(p => (p.topic === bp.topicId || p.topic === bp.topicTitle) && isValidatedOrActive(p)).length;

    return {
      ...bp,
      masteryPercentage: pct,
      status,
      attemptsCount: attempts,
      correctCount: correct,
      prerequisitesMet,
      unmetPrerequisiteNames,
      unlockedCompetencyNames: unlocksMap.get(bp.id) || [],
      availableProblemsCount
    };
  });

  // 8. Build Knowledge Edges linking prerequisites to advanced topics
  const edges: KnowledgeEdge[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  nodes.forEach(targetNode => {
    targetNode.prerequisiteIds.forEach(sourceId => {
      const sourceNode = nodeMap.get(sourceId);
      if (sourceNode) {
        const isSatisfied = sourceNode.masteryPercentage >= 70;
        edges.push({
          id: `edge-${sourceId}->${targetNode.id}`,
          sourceId,
          targetId: targetNode.id,
          isSatisfied,
          sourceMastery: sourceNode.masteryPercentage,
          targetStatus: targetNode.status,
          sourceTier: sourceNode.tier,
          targetTier: targetNode.tier
        });
      }
    });
  });

  // 9. Overall Graph Statistics
  const masteredCount = nodes.filter(n => n.status === 'mastered').length;
  const inProgressCount = nodes.filter(n => n.status === 'in_progress').length;
  const needsReviewCount = nodes.filter(n => n.status === 'needs_review').length;
  const readyCount = nodes.filter(n => n.status === 'ready').length;
  const lockedCount = nodes.filter(n => n.status === 'locked').length;
  const totalMasterySum = nodes.reduce((sum, n) => sum + n.masteryPercentage, 0);
  const averageMastery = nodes.length > 0 ? Math.round(totalMasterySum / nodes.length) : 0;

  return {
    nodes,
    edges,
    stats: {
      total: nodes.length,
      mastered: masteredCount,
      inProgress: inProgressCount,
      needsReview: needsReviewCount,
      ready: readyCount,
      locked: lockedCount,
      averageMastery
    }
  };
}

// Find all ancestor IDs (prerequisites of prerequisites recursively)
export function getAncestorNodeIds(nodeId: string, nodes: CompetencyNode[]): Set<string> {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const ancestors = new Set<string>();

  function traverse(currentId: string) {
    const current = nodeMap.get(currentId);
    if (!current) return;
    current.prerequisiteIds.forEach(pId => {
      if (!ancestors.has(pId)) {
        ancestors.add(pId);
        traverse(pId);
      }
    });
  }

  traverse(nodeId);
  return ancestors;
}

// Find all descendant IDs (downstream nodes unlocked by this node recursively)
export function getDescendantNodeIds(nodeId: string, edges: KnowledgeEdge[]): Set<string> {
  const descendants = new Set<string>();

  function traverse(currentId: string) {
    edges.forEach(edge => {
      if (edge.sourceId === currentId && !descendants.has(edge.targetId)) {
        descendants.add(edge.targetId);
        traverse(edge.targetId);
      }
    });
  }

  traverse(nodeId);
  return descendants;
}

// Generate smooth cubic bezier SVG path between two coordinates
export function createBezierPath(
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): string {
  const dx = Math.abs(x2 - x1);
  const curvature = Math.max(dx * 0.5, 40);
  return `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
}
