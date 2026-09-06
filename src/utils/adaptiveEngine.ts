import { Problem, Quiz, Topic, isValidatedOrActive } from '../types';

export interface AdaptiveState {
  currentTheta: number; // Ability parameter: typically -3.0 to +3.0
  abilityBand: 'Novice' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert';
  stepHistory: {
    problemId: string;
    competency: string;
    question: string;
    isCorrect: boolean;
    difficultyParameter: number;
    thetaAfter: number;
  }[];
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
 * Converts continuous theta ability (-3 to +3) into an intuitive label
 */
export function convertThetaToAbilityBand(theta: number): 'Novice' | 'Developing' | 'Proficient' | 'Advanced' | 'Expert' {
  if (theta >= 1.5) return 'Expert';
  if (theta >= 0.5) return 'Advanced';
  if (theta >= -0.5) return 'Proficient';
  if (theta >= -1.5) return 'Developing';
  return 'Novice';
}

/**
 * Selects the next optimal problem from available pool based on current theta
 */
export function selectNextAdaptiveProblem(
  availableProblems: Problem[],
  usedProblemIds: Set<string>,
  currentTheta: number
): Problem | null {
  const unused = availableProblems.filter(p => !usedProblemIds.has(p.id));
  if (unused.length === 0) return null;

  // Find the problem whose difficulty parameter b is closest to student's current ability theta
  // and has high discrimination parameter a
  let bestProblem = unused[0];
  let minDiff = Infinity;

  for (const p of unused) {
    const b = p.difficultyParameter ?? (p.difficulty === 'hard' ? 1.0 : p.difficulty === 'easy' ? -1.0 : 0.0);
    const diff = Math.abs(currentTheta - b);
    if (diff < minDiff) {
      minDiff = diff;
      bestProblem = p;
    }
  }

  return bestProblem;
}

/**
 * Updates ability theta based on response outcome
 */
export function updateAbilityEstimate(
  currentTheta: number,
  isCorrect: boolean,
  problem: Problem,
  stepNumber: number
): number {
  const b = problem.difficultyParameter ?? (problem.difficulty === 'hard' ? 1.0 : problem.difficulty === 'easy' ? -1.0 : 0.0);
  const a = problem.discriminationParameter ?? 1.0;
  
  // Step-size attenuation: larger adjustments in early steps, finer convergence later
  const stepWeight = 0.8 / Math.sqrt(stepNumber + 1);
  const pSuccess = calculateProbability(currentTheta, b, a);
  
  // Directional shift based on discrepancy between response and expectation
  const residual = (isCorrect ? 1 : 0) - pSuccess;
  const delta = residual * stepWeight;
  
  const newTheta = currentTheta + delta;
  // Clamp within realistic IRT range [-3.0, +3.0]
  return Math.round(Math.max(-3.0, Math.min(3.0, newTheta)) * 100) / 100;
}

/**
 * Builds an adaptive quiz session from a topic, competency, or the whole curriculum
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
  const initialProblem = selectNextAdaptiveProblem(pool, new Set(), initialTheta);

  const title = options?.competencyName
    ? `Adaptive Practice: ${options.competencyName}`
    : options?.topicId
    ? `Adaptive Mastery: ${topics.find(t => t.id === options.topicId)?.title || 'Topic'}`
    : 'Adaptive Mathematics Challenge';

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
