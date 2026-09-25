/**
 * Gamification Core System for Leavien AI Grade 11
 * Handles ranks, RPG level tiers, daily bounties/quests, daily check-in rewards, and avatar titles.
 */

export interface RankTier {
  level: number;
  title: string;
  tierName: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Legendary';
  minXP: number;
  perk: string;
  badgeColor: string;
  gradient: string;
  iconName: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    level: 1,
    title: 'Math Novice',
    tierName: 'Bronze',
    minXP: 0,
    perk: 'Standard Quiz Mode & Practice Pathways',
    badgeColor: 'text-amber-700 bg-amber-100 border-amber-300',
    gradient: 'from-amber-600 to-amber-800',
    iconName: 'Shield'
  },
  {
    level: 2,
    title: 'Equation Scout',
    tierName: 'Silver',
    minXP: 200,
    perk: 'Unlocks Flashcards & Adaptive Review Hub',
    badgeColor: 'text-slate-600 bg-slate-100 border-slate-300',
    gradient: 'from-slate-400 to-slate-600',
    iconName: 'Compass'
  },
  {
    level: 3,
    title: 'Polynomial Striker',
    tierName: 'Gold',
    minXP: 500,
    perk: 'Unlocks Rapid Math Sprint Arena (60s Blitz)',
    badgeColor: 'text-yellow-700 bg-yellow-100 border-yellow-400',
    gradient: 'from-amber-400 to-yellow-600',
    iconName: 'Swords'
  },
  {
    level: 4,
    title: 'Rational Strategist',
    tierName: 'Platinum',
    minXP: 1000,
    perk: '+15% Bonus XP on Streak Days & Custom Titles',
    badgeColor: 'text-cyan-700 bg-cyan-100 border-cyan-300',
    gradient: 'from-cyan-500 to-blue-600',
    iconName: 'Target'
  },
  {
    level: 5,
    title: 'Inverse Alchemist',
    tierName: 'Diamond',
    minXP: 1800,
    perk: 'Diamond Avatar Frame & AI Hint Acceleration',
    badgeColor: 'text-indigo-700 bg-indigo-100 border-indigo-300',
    gradient: 'from-blue-600 to-indigo-700',
    iconName: 'Gem'
  },
  {
    level: 6,
    title: 'Exponential Knight',
    tierName: 'Master',
    minXP: 3000,
    perk: 'Fever Mode Multiplier in Sprint Arena (x3 XP)',
    badgeColor: 'text-purple-700 bg-purple-100 border-purple-300',
    gradient: 'from-purple-600 to-pink-600',
    iconName: 'Sparkles'
  },
  {
    level: 7,
    title: 'Logarithmic Sage',
    tierName: 'Grandmaster',
    minXP: 4500,
    perk: 'Gold Name Badge on Hall of Fame Leaderboard',
    badgeColor: 'text-rose-700 bg-rose-100 border-rose-300',
    gradient: 'from-rose-600 to-red-700',
    iconName: 'Flame'
  },
  {
    level: 8,
    title: 'Gauss Vanguard',
    tierName: 'Legendary',
    minXP: 6500,
    perk: 'Hall of Fame Champion Aura & Unlimited Practice Boosts',
    badgeColor: 'text-amber-900 bg-amber-200 border-amber-400',
    gradient: 'from-amber-500 via-purple-600 to-indigo-700',
    iconName: 'Crown'
  }
];

export function getRankByLevel(level: number): RankTier {
  const safeLevel = Math.max(1, level);
  const found = RANK_TIERS.slice().reverse().find(r => safeLevel >= r.level);
  return found || RANK_TIERS[0];
}

export function getNextRank(level: number): RankTier | null {
  const current = getRankByLevel(level);
  const next = RANK_TIERS.find(r => r.level > current.level);
  return next || null;
}

// --------------------------------------------------------------------------
// DAILY QUESTS SYSTEM
// --------------------------------------------------------------------------

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  type: 'answer_problems' | 'speed_sprint' | 'flashcards' | 'daily_challenge' | 'complete_quiz';
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

interface StoredQuests {
  dateStr: string;
  quests: DailyQuest[];
  vaultClaimed: boolean;
}

const VAULT_BONUS_XP = 120;

function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateDefaultQuests(): DailyQuest[] {
  return [
    {
      id: 'quest_problems',
      title: 'Precision Calculation',
      description: 'Solve at least 4 math problems correctly in any quiz or practice',
      targetCount: 4,
      currentCount: 0,
      xpReward: 50,
      type: 'answer_problems',
      isCompleted: false,
      isClaimed: false,
      icon: 'Target'
    },
    {
      id: 'quest_sprint',
      title: 'Sprint Challenger',
      description: 'Play 1 round of the 60-second Rapid Math Sprint Arena',
      targetCount: 1,
      currentCount: 0,
      xpReward: 60,
      type: 'speed_sprint',
      isCompleted: false,
      isClaimed: false,
      icon: 'Zap'
    },
    {
      id: 'quest_cards',
      title: 'Memory Master',
      description: 'Flip and practice 5 interactive math flashcards or formula cards',
      targetCount: 5,
      currentCount: 0,
      xpReward: 40,
      type: 'flashcards',
      isCompleted: false,
      isClaimed: false,
      icon: 'BookOpen'
    }
  ];
}

export function getDailyQuestsState(userId: string): { quests: DailyQuest[]; vaultClaimed: boolean; allCompleted: boolean } {
  if (typeof window === 'undefined') {
    const q = generateDefaultQuests();
    return { quests: q, vaultClaimed: false, allCompleted: false };
  }

  const key = `mathquest_daily_quests_${userId || 'guest'}`;
  const today = getTodayDateStr();
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const parsed: StoredQuests = JSON.parse(raw);
      if (parsed.dateStr === today && Array.isArray(parsed.quests) && parsed.quests.length > 0) {
        const allCompleted = parsed.quests.every(q => q.isCompleted);
        return { quests: parsed.quests, vaultClaimed: !!parsed.vaultClaimed, allCompleted };
      }
    } catch (e) {}
  }

  // Generate fresh for today
  const fresh = generateDefaultQuests();
  const state: StoredQuests = {
    dateStr: today,
    quests: fresh,
    vaultClaimed: false
  };
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {}

  return { quests: fresh, vaultClaimed: false, allCompleted: false };
}

export function trackQuestProgress(
  userId: string,
  type: DailyQuest['type'],
  incrementBy: number = 1
): { quests: DailyQuest[]; completedJustNow: boolean } {
  if (typeof window === 'undefined') return { quests: [], completedJustNow: false };

  const key = `mathquest_daily_quests_${userId || 'guest'}`;
  const state = getDailyQuestsState(userId);
  let completedJustNow = false;

  const updatedQuests = state.quests.map(q => {
    if (q.type === type && !q.isCompleted) {
      const newCount = Math.min(q.targetCount, q.currentCount + incrementBy);
      const isCompleted = newCount >= q.targetCount;
      if (isCompleted && !q.isCompleted) {
        completedJustNow = true;
      }
      return {
        ...q,
        currentCount: newCount,
        isCompleted
      };
    }
    return q;
  });

  const saveState: StoredQuests = {
    dateStr: getTodayDateStr(),
    quests: updatedQuests,
    vaultClaimed: state.vaultClaimed
  };

  try {
    localStorage.setItem(key, JSON.stringify(saveState));
  } catch (e) {}

  return { quests: updatedQuests, completedJustNow };
}

export function claimQuestReward(userId: string, questId: string): { quests: DailyQuest[]; xpEarned: number } {
  if (typeof window === 'undefined') return { quests: [], xpEarned: 0 };

  const key = `mathquest_daily_quests_${userId || 'guest'}`;
  const state = getDailyQuestsState(userId);
  let xpEarned = 0;

  const updatedQuests = state.quests.map(q => {
    if (q.id === questId && q.isCompleted && !q.isClaimed) {
      xpEarned = q.xpReward;
      return { ...q, isClaimed: true };
    }
    return q;
  });

  const saveState: StoredQuests = {
    dateStr: getTodayDateStr(),
    quests: updatedQuests,
    vaultClaimed: state.vaultClaimed
  };

  try {
    localStorage.setItem(key, JSON.stringify(saveState));
  } catch (e) {}

  return { quests: updatedQuests, xpEarned };
}

export function claimDailyVault(userId: string): { success: boolean; xpEarned: number } {
  if (typeof window === 'undefined') return { success: false, xpEarned: 0 };

  const key = `mathquest_daily_quests_${userId || 'guest'}`;
  const state = getDailyQuestsState(userId);

  const allCompleted = state.quests.every(q => q.isCompleted);
  if (!allCompleted || state.vaultClaimed) {
    return { success: false, xpEarned: 0 };
  }

  const saveState: StoredQuests = {
    dateStr: getTodayDateStr(),
    quests: state.quests,
    vaultClaimed: true
  };

  try {
    localStorage.setItem(key, JSON.stringify(saveState));
  } catch (e) {}

  return { success: true, xpEarned: VAULT_BONUS_XP };
}

// --------------------------------------------------------------------------
// DAILY CHECK-IN MYSTERY REWARD CHEST
// --------------------------------------------------------------------------

export interface CheckInReward {
  day: number;
  xp: number;
  label: string;
}

export const CHECK_IN_TRAIL: CheckInReward[] = [
  { day: 1, xp: 35, label: '35 XP Spark' },
  { day: 2, xp: 50, label: '50 XP Crystal' },
  { day: 3, xp: 65, label: '65 XP Booster' },
  { day: 4, xp: 80, label: '80 XP Prism' },
  { day: 5, xp: 100, label: '100 XP Star' },
  { day: 6, xp: 125, label: '125 XP Relic' },
  { day: 7, xp: 200, label: '200 XP Legendary Vault!' }
];

export function getDailyCheckInStatus(userId: string): {
  canClaim: boolean;
  currentDayIndex: number;
  lastClaimDate: string | null;
} {
  if (typeof window === 'undefined') return { canClaim: true, currentDayIndex: 0, lastClaimDate: null };

  const key = `mathquest_checkin_${userId || 'guest'}`;
  const raw = localStorage.getItem(key);
  const today = getTodayDateStr();

  if (!raw) {
    return { canClaim: true, currentDayIndex: 0, lastClaimDate: null };
  }

  try {
    const data = JSON.parse(raw);
    const lastClaim = data.lastClaimDate || '';
    const dayIndex = typeof data.dayIndex === 'number' ? data.dayIndex : 0;

    if (lastClaim === today) {
      return { canClaim: false, currentDayIndex: dayIndex, lastClaimDate: lastClaim };
    }

    // Check if it's the next day or missed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (lastClaim === yesterdayStr) {
      const nextIndex = (dayIndex + 1) % CHECK_IN_TRAIL.length;
      return { canClaim: true, currentDayIndex: nextIndex, lastClaimDate: lastClaim };
    } else {
      // Missed streak: reset to day 0
      return { canClaim: true, currentDayIndex: 0, lastClaimDate: lastClaim };
    }
  } catch (e) {
    return { canClaim: true, currentDayIndex: 0, lastClaimDate: null };
  }
}

export function claimDailyCheckInReward(userId: string): {
  success: boolean;
  reward: CheckInReward;
  newStreakDay: number;
} {
  const status = getDailyCheckInStatus(userId);
  if (!status.canClaim) {
    return {
      success: false,
      reward: CHECK_IN_TRAIL[status.currentDayIndex],
      newStreakDay: status.currentDayIndex + 1
    };
  }

  const reward = CHECK_IN_TRAIL[status.currentDayIndex];
  const today = getTodayDateStr();
  const key = `mathquest_checkin_${userId || 'guest'}`;

  try {
    localStorage.setItem(key, JSON.stringify({
      lastClaimDate: today,
      dayIndex: status.currentDayIndex
    }));
  } catch (e) {}

  return {
    success: true,
    reward,
    newStreakDay: status.currentDayIndex + 1
  };
}

// --------------------------------------------------------------------------
// AVATARS & TITLES CUSTOMIZER
// --------------------------------------------------------------------------

export interface MathAvatar {
  id: string;
  name: string;
  title: string;
  iconName: string;
  themeColor: string;
  requiredLevel: number;
  bgGradient: string;
  borderClass: string;
}

export const MATH_AVATARS: MathAvatar[] = [
  {
    id: 'avatar_gauss',
    name: 'Carl Gauss',
    title: 'The Prince of Mathematicians',
    iconName: 'Crown',
    themeColor: 'indigo',
    requiredLevel: 1,
    bgGradient: 'from-indigo-500 to-indigo-700',
    borderClass: 'border-indigo-400'
  },
  {
    id: 'avatar_euler',
    name: 'Leonhard Euler',
    title: 'Function Pioneer',
    iconName: 'Compass',
    themeColor: 'blue',
    requiredLevel: 1,
    bgGradient: 'from-blue-500 to-sky-600',
    borderClass: 'border-blue-400'
  },
  {
    id: 'avatar_hypatia',
    name: 'Hypatia of Alexandria',
    title: 'Geometric Sage',
    iconName: 'Star',
    themeColor: 'emerald',
    requiredLevel: 2,
    bgGradient: 'from-emerald-500 to-teal-600',
    borderClass: 'border-emerald-400'
  },
  {
    id: 'avatar_pythagoras',
    name: 'Pythagoras',
    title: 'Harmonic Virtuoso',
    iconName: 'Triangle',
    themeColor: 'amber',
    requiredLevel: 2,
    bgGradient: 'from-amber-500 to-yellow-600',
    borderClass: 'border-amber-400'
  },
  {
    id: 'avatar_newton',
    name: 'Isaac Newton',
    title: 'Calculus Alchemist',
    iconName: 'Atom',
    themeColor: 'purple',
    requiredLevel: 3,
    bgGradient: 'from-purple-600 to-indigo-700',
    borderClass: 'border-purple-400'
  },
  {
    id: 'avatar_al_khwarizmi',
    name: 'Al-Khwarizmi',
    title: 'Algebra Mastermind',
    iconName: 'Flame',
    themeColor: 'orange',
    requiredLevel: 4,
    bgGradient: 'from-orange-500 to-red-600',
    borderClass: 'border-orange-400'
  },
  {
    id: 'avatar_noether',
    name: 'Emmy Noether',
    title: 'Symmetry Weaver',
    iconName: 'Sparkles',
    themeColor: 'pink',
    requiredLevel: 5,
    bgGradient: 'from-pink-500 to-rose-600',
    borderClass: 'border-pink-400'
  },
  {
    id: 'avatar_ramanujan',
    name: 'Srinivasa Ramanujan',
    title: 'Infinite Visionary',
    iconName: 'Infinity',
    themeColor: 'violet',
    requiredLevel: 6,
    bgGradient: 'from-violet-600 to-purple-800',
    borderClass: 'border-violet-400'
  }
];

export function getEquippedAvatar(userId: string): MathAvatar {
  if (typeof window === 'undefined') return MATH_AVATARS[0];
  const key = `mathquest_avatar_${userId || 'guest'}`;
  const savedId = localStorage.getItem(key);
  const found = MATH_AVATARS.find(a => a.id === savedId);
  return found || MATH_AVATARS[0];
}

export function setEquippedAvatar(userId: string, avatarId: string): void {
  if (typeof window === 'undefined') return;
  const key = `mathquest_avatar_${userId || 'guest'}`;
  localStorage.setItem(key, avatarId);
}

// --------------------------------------------------------------------------
// RAPID MATH SPRINT ARENA PROBLEMS POOL (Grade 11 General Math)
// --------------------------------------------------------------------------

export interface SprintProblem {
  id: string;
  prompt: string;
  topicTag: string;
  options: string[];
  correctIndex: number;
}

export const SPRINT_PROBLEMS: SprintProblem[] = [
  {
    id: 'sp_1',
    prompt: 'If f(x) = 3x - 5, what is f(4)?',
    topicTag: 'Functions',
    options: ['7', '12', '9', '17'],
    correctIndex: 0
  },
  {
    id: 'sp_2',
    prompt: 'Evaluate: 2³ × 2² = ?',
    topicTag: 'Exponentials',
    options: ['16', '32', '64', '128'],
    correctIndex: 1
  },
  {
    id: 'sp_3',
    prompt: 'What is the value of log₂(16)?',
    topicTag: 'Logarithms',
    options: ['2', '8', '4', '16'],
    correctIndex: 2
  },
  {
    id: 'sp_4',
    prompt: 'If f(x) = x² + 1, what is f(-3)?',
    topicTag: 'Functions',
    options: ['-8', '10', '-10', '7'],
    correctIndex: 1
  },
  {
    id: 'sp_5',
    prompt: 'Find the domain restriction for: f(x) = 5 / (x - 7)',
    topicTag: 'Rational Functions',
    options: ['x ≠ 0', 'x ≠ 5', 'x ≠ -7', 'x ≠ 7'],
    correctIndex: 3
  },
  {
    id: 'sp_6',
    prompt: 'If f(x) = 2x and g(x) = x + 3, what is (f ∘ g)(2)?',
    topicTag: 'Composition',
    options: ['7', '10', '12', '14'],
    correctIndex: 1
  },
  {
    id: 'sp_7',
    prompt: 'Solve for x: 3^x = 81',
    topicTag: 'Exponentials',
    options: ['3', '4', '5', '9'],
    correctIndex: 1
  },
  {
    id: 'sp_8',
    prompt: 'What is the vertical asymptote of f(x) = (2x + 1)/(x - 3)?',
    topicTag: 'Rational Functions',
    options: ['x = 3', 'x = -3', 'y = 2', 'y = 3'],
    correctIndex: 0
  },
  {
    id: 'sp_9',
    prompt: 'Evaluate: log₁₀(1000) = ?',
    topicTag: 'Logarithms',
    options: ['2', '3', '10', '100'],
    correctIndex: 1
  },
  {
    id: 'sp_10',
    prompt: 'If f(x) = 4x - 8, what is its inverse f⁻¹(0)?',
    topicTag: 'Inverse Functions',
    options: ['-2', '0', '2', '4'],
    correctIndex: 2
  },
  {
    id: 'sp_11',
    prompt: 'Calculate simple interest: P = $1,000, r = 5%, t = 2 years. I = ?',
    topicTag: 'Business Math',
    options: ['$50', '$100', '$105', '$200'],
    correctIndex: 1
  },
  {
    id: 'sp_12',
    prompt: 'Evaluate: (x² - 9)/(x - 3) at x = 5',
    topicTag: 'Rational Functions',
    options: ['8', '16', '6', '12'],
    correctIndex: 0
  },
  {
    id: 'sp_13',
    prompt: 'Solve: 5^(2x - 1) = 125',
    topicTag: 'Exponentials',
    options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
    correctIndex: 1
  },
  {
    id: 'sp_14',
    prompt: 'What is log₃(1)?',
    topicTag: 'Logarithms',
    options: ['0', '1', '3', 'Undefined'],
    correctIndex: 0
  },
  {
    id: 'sp_15',
    prompt: 'If a relation passes the Vertical Line Test, it is a...?',
    topicTag: 'Relations & Functions',
    options: ['Circle', 'Function', 'Parabola', 'One-to-many'],
    correctIndex: 1
  },
  {
    id: 'sp_16',
    prompt: 'If f(x) = |x - 4|, what is f(1)?',
    topicTag: 'Piecewise & Absolute',
    options: ['-3', '3', '5', '4'],
    correctIndex: 1
  }
];

export function getSprintHighScore(userId: string): number {
  if (typeof window === 'undefined') return 0;
  const key = `mathquest_sprint_highscore_${userId || 'guest'}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

export function saveSprintHighScore(userId: string, score: number): boolean {
  if (typeof window === 'undefined') return false;
  const current = getSprintHighScore(userId);
  if (score > current) {
    const key = `mathquest_sprint_highscore_${userId || 'guest'}`;
    localStorage.setItem(key, String(score));
    return true;
  }
  return false;
}
