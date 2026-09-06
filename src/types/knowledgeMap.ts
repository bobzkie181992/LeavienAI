export type CompetencyMasteryStatus = 'mastered' | 'in_progress' | 'needs_review' | 'ready' | 'locked';

export interface CompetencyBlueprint {
  id: string;
  name: string;
  topicId: string;
  topicTitle: string;
  tier: 1 | 2 | 3;
  tierLabel: 'Foundations' | 'Core Competencies' | 'Advanced Topics';
  prerequisiteIds: string[];
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyParameter: number;
  cognitiveLevel: string;
  iconName?: string;
  // Normalized layout position on canvas [0..1000, 0..600]
  canvasX: number;
  canvasY: number;
}

export interface CompetencyNode extends CompetencyBlueprint {
  masteryPercentage: number;
  status: CompetencyMasteryStatus;
  attemptsCount: number;
  correctCount: number;
  prerequisitesMet: boolean;
  unmetPrerequisiteNames: string[];
  unlockedCompetencyNames: string[];
  availableProblemsCount: number;
}

export interface KnowledgeEdge {
  id: string;
  sourceId: string;
  targetId: string;
  isSatisfied: boolean;
  sourceMastery: number;
  targetStatus: CompetencyMasteryStatus;
  sourceTier: number;
  targetTier: number;
}

export interface KnowledgeGraphData {
  nodes: CompetencyNode[];
  edges: KnowledgeEdge[];
  stats: {
    total: number;
    mastered: number;
    inProgress: number;
    needsReview: number;
    ready: number;
    locked: number;
    averageMastery: number;
  };
}

export interface GraphFilter {
  tier: 'all' | 1 | 2 | 3;
  topicId: string;
  status: 'all' | CompetencyMasteryStatus;
  searchQuery: string;
}
