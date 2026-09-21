import { Problem, Quiz, Topic, ItemResponse, isValidatedOrActive } from '../types';

export interface AdaptiveStepRecord {
  problemId: string;
  questionText: string;
  competency: string;
  selectedOption: number;
  selectedOptionText: string;
  isCorrect: boolean;
  responseTimeMs: number;
  abilityEstimateBefore: number;
  abilityBandBefore: string;
  abilityEstimateAfter: number;
  abilityBandAfter: string;
  difficultyParameter: number; // IRT b parameter
  difficultyLevel: 'easy' | 'medium' | 'hard';
  discriminationParameter: number; // IRT a parameter
  remediationProvided?: boolean;
}

export interface AdaptiveState {
  currentTheta: number; // Ability parameter: typically -3.0 to +3.0
  abilityBand: 'Novice' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert';
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  remediationActive: boolean;
  stepHistory: AdaptiveStepRecord[];
}

export interface RemediationGuide {
  competency: string;
  topicTitle: string;
  problemQuestion: string;
  conceptSummary: string;
  keyFormulasAndRules: string[];
  workedSolution: string;
  scaffoldingStrategy: string;
  encouragement: string;
}

/**
 * 2-Parameter Logistic (2PL) Item Response Theory probability
 * P(theta) = 1 / (1 + exp(-1.7 * a * (theta - b)))
 */
export function calculateProbability(theta: number, b: number, a: number = 1.0): number {
  const z = 1.7 * a * (theta - b);
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

/**
 * Calculates Fisher Information for an item at a given theta
 * I(theta) = (1.7 * a)^2 * P(theta) * (1 - P(theta))
 */
export function calculateFisherInformation(theta: number, b: number, a: number = 1.0): number {
  const p = calculateProbability(theta, b, a);
  return Math.pow(1.7 * a, 2) * p * (1 - p);
}

/**
 * Converts continuous theta ability (-3 to +3) into an intuitive standard label
 */
export function convertThetaToAbilityBand(theta: number): 'Novice' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert' {
  if (theta >= 1.5) return 'Expert';
  if (theta >= 0.5) return 'Advanced';
  if (theta >= -0.5) return 'Proficient';
  if (theta >= -1.5) return 'Developing';
  return 'Novice';
}

/**
 * Derives normalized difficulty parameter (b) from problem metadata
 */
export function getItemDifficultyParameter(p: Problem): number {
  if (typeof p.difficultyParameter === 'number' && !isNaN(p.difficultyParameter)) {
    return p.difficultyParameter;
  }
  if (p.difficulty === 'hard') return 1.2;
  if (p.difficulty === 'easy') return -1.2;
  return 0.0;
}

/**
 * Derives discrimination parameter (a) from problem metadata
 */
export function getItemDiscriminationParameter(p: Problem): number {
  if (typeof p.discriminationParameter === 'number' && !isNaN(p.discriminationParameter) && p.discriminationParameter > 0) {
    return p.discriminationParameter;
  }
  return 1.0;
}

/**
 * ADAPTIVE ITEM SELECTION ALGORITHM
 * 
 * Rules:
 * 1. Does NOT select randomly.
 * 2. Low estimated ability (or recent incorrect) -> selects EASIER item (b <= theta - offset)
 * 3. Demonstrates mastery (high theta or consecutive correct) -> selects MORE DIFFICULT item (b >= theta + offset)
 * 4. Repeatedly struggles -> signals remediation requirement before continuing and selects scaffolded easier item
 */
export function selectNextAdaptiveProblem(
  availableProblems: Problem[],
  usedProblemIds: Set<string>,
  currentTheta: number,
  options?: {
    consecutiveIncorrect?: number;
    consecutiveCorrect?: number;
    targetCompetency?: string;
    targetTopicId?: string;
    isRemediating?: boolean;
  }
): Problem | null {
  const unused = availableProblems.filter(p => !usedProblemIds.has(p.id));
  if (unused.length === 0) return null;

  const consecutiveFails = options?.consecutiveIncorrect || 0;
  const consecutiveSuccesses = options?.consecutiveCorrect || 0;
  const isRemediating = options?.isRemediating || consecutiveFails >= 2;

  // Determine target difficulty b_target based on ability state & response trends
  let targetB = currentTheta;

  if (isRemediating || consecutiveFails >= 2 || currentTheta <= -1.0) {
    // Student is struggling or remediating: Target easier foundational item (b << theta)
    targetB = Math.max(-2.5, currentTheta - 0.75);
  } else if (consecutiveSuccesses >= 2 || currentTheta >= 1.0) {
    // Student demonstrates mastery: Step up difficulty to probe higher cognitive levels
    targetB = Math.min(2.5, currentTheta + 0.65);
  } else if (consecutiveFails === 1) {
    // Single mistake: Slight downward adjustment
    targetB = Math.max(-2.5, currentTheta - 0.35);
  } else if (consecutiveSuccesses === 1) {
    // Single correct: Moderate upward adjustment
    targetB = Math.min(2.5, currentTheta + 0.35);
  }

  // Rank candidate problems by:
  // 1. Difficulty proximity to targetB
  // 2. Fisher Information (measuring power at currentTheta)
  // 3. Competency match relevance (if specified)
  let bestProblem: Problem | null = null;
  let bestScore = -Infinity;

  for (const p of unused) {
    const b = getItemDifficultyParameter(p);
    const a = getItemDiscriminationParameter(p);

    // Distance penalty
    const dist = Math.abs(targetB - b);
    
    // Fisher info at current ability (higher is better)
    const info = calculateFisherInformation(currentTheta, b, a);

    // Directional alignment score
    let directionalBonus = 0;
    if (isRemediating || consecutiveFails >= 2) {
      // Heavily favor easier items with b <= currentTheta
      if (b <= currentTheta) directionalBonus += 1.5;
      if (p.difficulty === 'easy') directionalBonus += 1.0;
    } else if (consecutiveSuccesses >= 2) {
      // Heavily favor more difficult items with b >= currentTheta
      if (b >= currentTheta) directionalBonus += 1.5;
      if (p.difficulty === 'hard') directionalBonus += 1.0;
    }

    // Competency alignment bonus if target competency is provided
    let competencyBonus = 0;
    if (options?.targetCompetency && p.competency) {
      if (p.competency.toLowerCase().trim() === options.targetCompetency.toLowerCase().trim()) {
        competencyBonus = 2.0;
      }
    }

    // Score combines info maximization and distance minimization
    const compositeScore = (info * 1.5) - (dist * 1.2) + directionalBonus + competencyBonus;

    if (compositeScore > bestScore) {
      bestScore = compositeScore;
      bestProblem = p;
    }
  }

  return bestProblem || unused[0];
}

/**
 * Updates ability theta based on 2PL IRT response outcome
 */
export function updateAbilityEstimate(
  currentTheta: number,
  isCorrect: boolean,
  problem: Problem,
  stepNumber: number
): number {
  const b = getItemDifficultyParameter(problem);
  const a = getItemDiscriminationParameter(problem);
  
  // Step-size attenuation: larger adjustments early, refined convergence later
  const stepWeight = 0.85 / Math.sqrt(stepNumber + 1);
  const pSuccess = calculateProbability(currentTheta, b, a);
  
  // Directional shift based on discrepancy between response and expectation
  const residual = (isCorrect ? 1 : 0) - pSuccess;
  const delta = residual * stepWeight;
  
  const newTheta = currentTheta + delta;
  // Clamp within standard IRT range [-3.0, +3.0]
  return Math.round(Math.max(-3.0, Math.min(3.0, newTheta)) * 100) / 100;
}

/**
 * Checks if the student is repeatedly struggling and requires targeted remediation
 */
export function evaluateStruggleCondition(
  consecutiveIncorrect: number,
  history: AdaptiveStepRecord[]
): {
  isStruggling: boolean;
  consecutiveFails: number;
  strugglingCompetency?: string;
  reason?: string;
} {
  if (consecutiveIncorrect >= 2) {
    const recentMissed = history.slice(-2);
    const lastCompetency = recentMissed[recentMissed.length - 1]?.competency || 'Mathematics Competency';
    return {
      isStruggling: true,
      consecutiveFails: consecutiveIncorrect,
      strugglingCompetency: lastCompetency,
      reason: `You have encountered difficulty on ${consecutiveIncorrect} consecutive items. Let's review the core concept before continuing with scaffolded practice!`
    };
  }

  // Check recent 3 items (e.g. 0 out of 3 or 1 out of 4)
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const correctCount = last3.filter(h => h.isCorrect).length;
    if (correctCount === 0) {
      return {
        isStruggling: true,
        consecutiveFails: 3,
        strugglingCompetency: last3[last3.length - 1]?.competency,
        reason: 'Multiple incorrect responses detected. A quick pedagogical review is recommended.'
      };
    }
  }

  return {
    isStruggling: false,
    consecutiveFails: consecutiveIncorrect
  };
}

/**
 * Builds structured remediation guide when student struggles
 */
export function buildRemediationGuide(
  problem: Problem,
  topicTitle: string = 'General Mathematics'
): RemediationGuide {
  const comp = problem.competency || problem.topic || 'Grade 11 Mathematics';
  
  // Extract formula / rule from solution or hints
  const formulas: string[] = [];
  if (problem.hint1) formulas.push(problem.hint1);
  if (problem.hint2) formulas.push(problem.hint2);
  if (formulas.length === 0) {
    formulas.push(`Identify the given values and recall the standard algebraic representation for ${comp}.`);
    formulas.push('Check the domain, denominator restrictions, or base conditions carefully.');
  }

  const conceptSummary = problem.explanation || problem.remediation || 
    `When working with ${comp}, always break the problem into clear algebraic steps. Distinguish between variable substitution, simplification of terms, and verification against mathematical constraints.`;

  const workedSolution = problem.solution || problem.explanation || 
    `Correct Answer: Option ${String.fromCharCode(65 + problem.correctAnswer)} (${problem.options[problem.correctAnswer]}).\n\nReview the algebraic transformation and observe how the constraint satisfies the condition.`;

  return {
    competency: comp,
    topicTitle,
    problemQuestion: problem.question,
    conceptSummary,
    keyFormulasAndRules: formulas,
    workedSolution,
    scaffoldingStrategy: 'We are selecting an easier, foundational item next so you can rebuild mastery step-by-step.',
    encouragement: 'Learning mathematics involves learning from mistakes. Take a moment to understand the concept below, then proceed to the next question.'
  };
}

/**
 * Helper to build an exact ItemResponse record containing all required tracking properties
 */
export function createItemResponseRecord(params: {
  problem: Problem;
  selectedOption: number;
  isCorrect: boolean;
  responseTimeMs: number;
  thetaBefore: number;
  thetaAfter: number;
  attemptsCount?: number;
  hintsUsed?: number;
  remediationProvided?: boolean;
}): ItemResponse {
  const { problem, selectedOption, isCorrect, responseTimeMs, thetaBefore, thetaAfter, attemptsCount, hintsUsed, remediationProvided } = params;
  const b = getItemDifficultyParameter(problem);
  const a = getItemDiscriminationParameter(problem);
  const diffLevel: 'easy' | 'medium' | 'hard' = problem.difficulty || (b > 0.5 ? 'hard' : b < -0.5 ? 'easy' : 'medium');

  return {
    problemId: problem.id,
    questionText: problem.question,
    competency: problem.competency || problem.topic,
    selectedOption,
    selectedOptionText: problem.options[selectedOption] || '',
    isCorrect,
    difficultyParameter: b,
    difficultyLevel: diffLevel,
    discriminationParameter: a,
    responseTimeMs,
    abilityEstimateBefore: thetaBefore,
    abilityBandBefore: convertThetaToAbilityBand(thetaBefore),
    abilityEstimateAfter: thetaAfter,
    abilityBandAfter: convertThetaToAbilityBand(thetaAfter),
    attemptsCount: attemptsCount || 1,
    hintsUsed: hintsUsed || 0,
    remediationProvided: Boolean(remediationProvided)
  };
}

/**
 * Builds an adaptive quiz session from a topic, competency, or whole curriculum
 */
export function createAdaptiveQuiz(
  topics: Topic[],
  options?: {
    topicId?: string;
    competencyName?: string;
    targetProblemsCount?: number;
    initialTheta?: number;
  }
): { quiz: Quiz; initialProblem: Problem | null; allProblemsPool: Problem[] } {
  const targetCount = options?.targetProblemsCount || 5;
  const initialTheta = options?.initialTheta ?? 0.0; // Start at proficient baseline

  // Gather active problems
  let pool = topics.flatMap(t => t.quizzes.flatMap(q => q.problems)).filter(isValidatedOrActive);

  if (options?.competencyName) {
    const compNorm = options.competencyName.toLowerCase().trim();
    const filtered = pool.filter(p => (p.competency || '').toLowerCase().trim() === compNorm);
    if (filtered.length >= 3) {
      pool = filtered;
    }
  } else if (options?.topicId) {
    const filtered = pool.filter(p => p.topic === options.topicId);
    if (filtered.length >= 3) {
      pool = filtered;
    }
  }

  // Pick first problem closest to initial theta
  const initialProblem = selectNextAdaptiveProblem(pool, new Set(), initialTheta, {
    targetCompetency: options?.competencyName
  });

  const title = options?.competencyName
    ? `Adaptive Practice: ${options.competencyName}`
    : options?.topicId
    ? `Adaptive Mastery: ${topics.find(t => t.id === options.topicId)?.title || 'Topic'}`
    : 'Adaptive Mathematics Assessment';

  const quiz: Quiz = {
    id: `adaptive-${Date.now()}`,
    title,
    description: 'Dynamic item response assessment. Question difficulty automatically adjusts after every answer to match your real-time mastery level.',
    topicId: options?.topicId || 'adaptive-curriculum',
    problems: initialProblem ? [initialProblem] : pool.slice(0, targetCount),
    xpReward: 250
  };

  return { quiz, initialProblem, allProblemsPool: pool };
}

