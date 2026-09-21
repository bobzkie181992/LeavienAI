import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Trophy, 
  User, 
  LogOut, 
  Zap, 
  Play, 
  MessageSquare, 
  Video, 
  Layers, 
  TrendingUp,
  Volume2,
  VolumeX,
  Gift,
  Sparkles,
  Crown,
  Flame,
  Swords,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  Quiz, 
  Topic as TopicType, 
  QuizResult, 
  LearningPathway, 
  Problem,
  isValidatedOrActive,
  SummativeAssessment 
} from '../types';

import Dashboard from '../components/Dashboard';
import QuizEngine from '../components/QuizEngine';
import TopicDetail from '../components/TopicDetail';
import ProfileView from '../components/ProfileView';
import Leaderboard from '../components/Leaderboard';
import DiagnosticAssessment from '../components/DiagnosticAssessment';
import PathwayEngine from '../components/PathwayEngine';
import PeerChatModal from '../components/PeerChatModal';
import SmartAIQuizModal from '../components/SmartAIQuizModal';
import AIMathSolverModal from '../components/AIMathSolverModal';
import MathFormulaHub from '../components/MathFormulaHub';
import DailyChallengeModal from '../components/DailyChallengeModal';
import ExplainerLibrary from '../components/ExplainerLibrary';
import CumulativePerformanceModal from '../components/CumulativePerformanceModal';
import InteractiveFlashcards from '../components/InteractiveFlashcards';
import LearningReports from '../components/LearningReports';
import StudentPresentationHub from '../components/StudentPresentationHub';
import DailyQuestsModal from '../components/DailyQuestsModal';
import MathSprintArena from '../components/MathSprintArena';
import LevelProgressionModal from '../components/LevelProgressionModal';
import AvatarCustomizerModal from '../components/AvatarCustomizerModal';
import LevelUpCelebrationModal from '../components/LevelUpCelebrationModal';
import SummativeAssessmentModal from '../components/SummativeAssessmentModal';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { usePeers } from '../hooks/useFirebase';
import { usePeerChat } from '../hooks/usePeerChat';
import { createAdaptiveQuiz } from '../utils/adaptiveEngine';
import { 
  getRankByLevel, 
  getEquippedAvatar, 
  getDailyQuestsState, 
  trackQuestProgress 
} from '../utils/gamification';
import { 
  playLevelUpFanfare, 
  playCorrectSound, 
  playPopSound, 
  isAudioMuted, 
  setAudioMuted,
  playWarningSound
} from '../utils/audioEffects';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface StudentModuleProps {
  profile: UserProfile;
  topics: TopicType[];
  results: QuizResult[];
  userUid: string;
  addXP: (amount: number) => void;
  saveResult: (result: Omit<QuizResult, 'timestamp'>) => void;
  saveDiagnosticResult: (ability: string, scores: Record<string, number>, pathway?: LearningPathway, violations?: number) => void;
  savePathwayProgress: (pathway: LearningPathway | null) => void;
  updateDisplayName?: (newName: string) => Promise<void>;
  updateProfileDetails?: (newName: string, grade: string, section: string, lrn?: string) => Promise<void>;
  checkAchievements: (newXP: number, score: number, total: number, topicId: string) => void;
  onLogout: () => void;
}

export default function StudentModule({ 
  profile, 
  topics, 
  results, 
  userUid, 
  addXP, 
  saveResult, 
  saveDiagnosticResult, 
  savePathwayProgress,
  updateDisplayName,
  updateProfileDetails,
  checkAchievements, 
  onLogout 
}: StudentModuleProps) {
  const [activeTab, setActiveTab] = useState<'learn' | 'presentations' | 'explainers' | 'flashcards' | 'reports' | 'profile' | 'leaderboard'>('learn');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicType | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizInitialMode, setQuizInitialMode] = useState<'diagnostic' | 'assessment' | 'adaptive' | 'standard' | 'timed' | undefined>(undefined);
  const [isViewingPathway, setIsViewingPathway] = useState(false);
  const [isTakingDiagnostic, setIsTakingDiagnostic] = useState(false);
  const [activeSummativeAssessment, setActiveSummativeAssessment] = useState<SummativeAssessment | null>(null);

  const currentUserId = userUid || profile.uid;
  const { peers } = usePeers(currentUserId);
  const [isAIQuizModalOpen, setIsAIQuizModalOpen] = useState(false);
  const [isAISolverModalOpen, setIsAISolverModalOpen] = useState(false);
  const [solverInitialQuery, setSolverInitialQuery] = useState('');
  const [isFormulaHubOpen, setIsFormulaHubOpen] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);

  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [latestQuizDetails, setLatestQuizDetails] = useState<{ xp: number; score: number; total: number } | null>(null);

  // Gamification Modals & State
  const [isDailyQuestsOpen, setIsDailyQuestsOpen] = useState(false);
  const [isSprintArenaOpen, setIsSprintArenaOpen] = useState(false);
  const [isLevelProgressionOpen, setIsLevelProgressionOpen] = useState(false);
  const [isAvatarCustomizerOpen, setIsAvatarCustomizerOpen] = useState(false);
  const [levelUpCelebration, setLevelUpCelebration] = useState<{ isOpen: boolean; newLevel: number } | null>(null);
  const [floatingXPToast, setFloatingXPToast] = useState<{ show: boolean; amount: number; message?: string } | null>(null);
  const [isMuted, setIsMuted] = useState(() => isAudioMuted());
  const [avatarRev, setAvatarRev] = useState(0);

  const prevLevelRef = useRef<number>(profile.level);

  const equippedAvatar = useMemo(() => {
    return getEquippedAvatar(currentUserId);
  }, [currentUserId, avatarRev]);

  // Tab switching & Alt-Tab detection state
  const [tabOutCount, setTabOutCount] = useState(0);
  const [showAltTabWarning, setShowAltTabWarning] = useState(false);

  useEffect(() => {
    const isTesting = !!(activeQuiz || isTakingDiagnostic || activeSummativeAssessment || isSprintArenaOpen || isDailyChallengeOpen);
    
    if (!isTesting) {
      setTabOutCount(0);
      setShowAltTabWarning(false);
      return;
    }

    let blurTimeout: any;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        playWarningSound();
        setTabOutCount(prev => prev + 1);
        setShowAltTabWarning(true);
      }
    };

    const handleWindowBlur = () => {
      blurTimeout = setTimeout(() => {
        playWarningSound();
        setTabOutCount(prev => prev + 1);
        setShowAltTabWarning(true);
      }, 400); // 400ms buffer to allow normal system delays
    };

    const handleWindowFocus = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };
  }, [activeQuiz, isTakingDiagnostic, activeSummativeAssessment, isSprintArenaOpen, isDailyChallengeOpen]);


  const currentRank = useMemo(() => {
    return getRankByLevel(profile.level);
  }, [profile.level]);

  const dailyQuestsState = useMemo(() => {
    return getDailyQuestsState(currentUserId);
  }, [currentUserId, profile.xp]);

  const pendingQuestsToClaim = dailyQuestsState.quests.filter(q => q.isCompleted && !q.isClaimed).length;

  // Level Up Detection & Celebration
  useEffect(() => {
    if (prevLevelRef.current && profile.level > prevLevelRef.current) {
      setLevelUpCelebration({ isOpen: true, newLevel: profile.level });
      playLevelUpFanfare();
    }
    prevLevelRef.current = profile.level;
  }, [profile.level]);

  const handleGamifiedRewardXP = (amount: number, message?: string) => {
    addXP(amount);
    setFloatingXPToast({ show: true, amount, message });
    setTimeout(() => setFloatingXPToast(null), 3000);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

  // Pool of all active problems across curriculum
  const allProblemsPool: Problem[] = topics
    .flatMap(topic => topic.quizzes.flatMap(quiz => quiz.problems))
    .filter(isValidatedOrActive);

  // Handler for Daily Challenge
  const handleStartChallenge = () => {
    if (allProblemsPool.length === 0) {
      alert("No active problems are available yet! Check back soon.");
      return;
    }

    const shuffled = [...allProblemsPool].sort(() => 0.5 - Math.random());
    const challengeProblems = shuffled.slice(0, 5);

    const challengeQuiz: Quiz = {
      id: `challenge-${Date.now()}`,
      title: 'Daily Math Challenge',
      description: 'A 5-question mix testing core mathematical competencies. Earn double XP and extend your streak!',
      topicId: 'daily-challenge',
      problems: challengeProblems,
      xpReward: 200
    };

    setQuizInitialMode('standard');
    setActiveQuiz(challengeQuiz);
  };

  // Handler for Adaptive Practice
  const handleStartAdaptivePractice = (competencyName?: string) => {
    if (allProblemsPool.length === 0) {
      alert("No problems available for adaptive practice yet.");
      return;
    }

    const { quiz } = createAdaptiveQuiz(topics, {
      competencyName,
      targetProblemsCount: 5
    });

    setQuizInitialMode('adaptive');
    setActiveQuiz(quiz);
  };

  // Handler for Retaking a Quiz
  const handleRetakeQuiz = (quizId: string) => {
    // Check if it's an adaptive session
    if (quizId.startsWith('adaptive-')) {
      handleStartAdaptivePractice();
      return;
    }

    // Otherwise find the quiz in topics
    for (const topic of topics) {
      const q = topic.quizzes.find(quiz => quiz.id === quizId);
      if (q) {
        const activeProblems = q.problems.filter(isValidatedOrActive);
        
        // Use consistent item bank supplementation
        let problemsToRun = [...activeProblems];
        if (problemsToRun.length < 5) {
          const supplement = allProblemsPool
            .filter(p => p.topic === q.topicId && !problemsToRun.some(ap => ap.id === p.id))
            .slice(0, 5 - problemsToRun.length);
          problemsToRun = [...problemsToRun, ...supplement];
        }

        if (problemsToRun.length === 0) {
          alert("No active items found in this quiz.");
          return;
        }
        setQuizInitialMode('standard');
        setActiveQuiz({ ...q, problems: problemsToRun });
        return;
      }
    }

    // Fallback if not found: start adaptive practice
    handleStartAdaptivePractice();
  };

  // Handler for Retaking Diagnostic
  const handleRetakeDiagnostic = () => {
    setSelectedTopic(null);
    setActiveQuiz(null);
    setIsViewingPathway(false);
    setIsTakingDiagnostic(true);
  };

  // Handler for Starting Quiz from Presentation
  const handleStartQuizFromPresentation = (topicId: string, quizId?: string) => {
    setSelectedTopic(null);
    setIsViewingPathway(false);
    setIsTakingDiagnostic(false);

    const topic = topics.find(t => t.id === topicId);
    let quizToRun: Quiz | null = null;

    if (quizId && topic) {
      quizToRun = topic.quizzes.find(q => q.id === quizId) || null;
    }

    if (!quizToRun && topic) {
      quizToRun = topic.quizzes.find(q => q.problems.some(isValidatedOrActive)) || null;
    }

    if (!quizToRun) {
      const { quiz } = createAdaptiveQuiz(topics, {
        topicId: topicId,
        targetProblemsCount: 5
      });
      quizToRun = quiz;
    }

    const activeProblems = quizToRun.problems.filter(isValidatedOrActive);
    let problemsToRun = [...activeProblems];
    if (problemsToRun.length < 5) {
      const supplement = (topic?.quizzes.flatMap(q => q.problems) || allProblemsPool)
        .filter(p => p.topic === topicId && !problemsToRun.some(ap => ap.id === p.id))
        .slice(0, 5 - problemsToRun.length);
      problemsToRun = [...problemsToRun, ...supplement];
    }

    setQuizInitialMode('adaptive');
    setActiveQuiz({
      ...quizToRun,
      problems: problemsToRun.length > 0 ? problemsToRun : allProblemsPool.slice(0, 5)
    });
  };

  // Helper to determine the next level quiz in sequence for competency progression
  const getNextLevelQuiz = (currentQuiz: Quiz | null): Quiz | null => {
    if (!currentQuiz) return null;
    const currentTopic = topics.find(t => t.id === currentQuiz.topicId || t.quizzes.some(q => q.id === currentQuiz.id));
    if (!currentTopic) return null;

    const currentQuizIndex = currentTopic.quizzes.findIndex(q => q.id === currentQuiz.id);
    if (currentQuizIndex !== -1 && currentQuizIndex < currentTopic.quizzes.length - 1) {
      const candidate = currentTopic.quizzes[currentQuizIndex + 1];
      let activeProblems = candidate.problems.filter(isValidatedOrActive);
      if (activeProblems.length < 5) {
        const supplement = allProblemsPool
          .filter(p => p.topic === candidate.topicId && !activeProblems.some(ap => ap.id === p.id))
          .slice(0, 5 - activeProblems.length);
        activeProblems = [...activeProblems, ...supplement];
      }
      return { ...candidate, problems: activeProblems };
    }

    // If last quiz in current topic, check first quiz of next topic
    const currentTopicIndex = topics.findIndex(t => t.id === currentTopic.id);
    if (currentTopicIndex !== -1 && currentTopicIndex < topics.length - 1) {
      const nextTopic = topics[currentTopicIndex + 1];
      if (nextTopic.quizzes && nextTopic.quizzes.length > 0) {
        const candidate = nextTopic.quizzes[0];
        let activeProblems = candidate.problems.filter(isValidatedOrActive);
        if (activeProblems.length < 5) {
          const supplement = allProblemsPool
            .filter(p => p.topic === candidate.topicId && !activeProblems.some(ap => ap.id === p.id))
            .slice(0, 5 - activeProblems.length);
          activeProblems = [...activeProblems, ...supplement];
        }
        return { ...candidate, problems: activeProblems };
      }
    }

    return null;
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">LeavienAI</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block -mt-1 hidden sm:block">
                Grade 11 Adaptive Learning
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Daily Quests Trigger Button */}
            <button
              id="header-daily-quests-trigger"
              onClick={() => {
                playPopSound();
                setIsDailyQuestsOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100/90 text-amber-900 transition-all font-bold text-xs relative active:scale-95 shadow-sm"
              title="Daily Quests & Check-In Bounty"
            >
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Quests</span>
              {pendingQuestsToClaim > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {pendingQuestsToClaim}
                </span>
              )}
            </button>

            {/* Rapid Math Blitz Trigger */}
            <button
              id="header-sprint-arena-trigger"
              onClick={() => {
                playPopSound();
                setIsSprintArenaOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-900 transition-all font-bold text-xs active:scale-95 shadow-sm"
              title="60-Second Math Blitz Arena"
            >
              <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span>Blitz</span>
            </button>

            {/* Streak Counter */}
            <div 
              className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => setIsDailyQuestsOpen(true)}
              title={`${profile.streak} day streak! Click to view daily bonuses`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span className="text-xs font-bold text-orange-700">{profile.streak}d</span>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <Trophy className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700">{profile.xp} XP</span>
            </div>

            {/* Level Crest Trigger */}
            <button
              id="header-level-crest-trigger"
              onClick={() => {
                playPopSound();
                setIsLevelProgressionOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-900 font-bold text-xs transition-all active:scale-95 shadow-sm"
              title="View Level Progression & Unlocked Perks"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Lvl {profile.level}</span>
              <span className="hidden lg:inline text-[10px] text-indigo-600 font-black uppercase">
                {currentRank.tierName}
              </span>
            </button>

            {/* Audio Mute Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title={isMuted ? "Unmute Game Audio" : "Mute Game Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-0.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 pb-28">
        <AnimatePresence mode="wait">
          {isViewingPathway && profile.activePathway ? (
            <motion.div
              key="pathway"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PathwayEngine
                pathway={profile.activePathway}
                topic={topics.find(t => t.id === profile.activePathway!.topicId) || topics[0]}
                allTopics={topics}
                profile={profile}
                onUpdatePathway={savePathwayProgress}
                onClose={() => setIsViewingPathway(false)}
                addXP={addXP}
                saveResult={(result) => saveResult({ ...result, userId: userUid })}
              />
            </motion.div>
          ) : activeQuiz ? (
            <motion.div
              key={`quiz-${activeQuiz.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <QuizEngine 
                quiz={activeQuiz} 
                availablePool={allProblemsPool}
                initialMode={quizInitialMode}
                nextQuiz={getNextLevelQuiz(activeQuiz)}
                onProceedNextLevel={(nextQuiz) => {
                  setActiveQuiz(nextQuiz);
                  setQuizInitialMode('assessment');
                }}
                onSuggestAIQuiz={() => {
                  setActiveQuiz(null);
                  setIsAIQuizModalOpen(true);
                }}
                onClose={() => {
                  setActiveQuiz(null);
                  setQuizInitialMode(undefined);
                }}
                onComplete={(xp, score, total, itemResponses, abilityEstimate, mathAbilityDiagnosis, violations, isCompetent, modeUsed) => {
                  addXP(xp);
                  saveResult({
                    userId: userUid,
                    quizId: activeQuiz.id,
                    score,
                    total,
                    itemResponses,
                    abilityEstimate,
                    mathAbilityDiagnosis,
                    violations,
                    isCompetent,
                    quizMode: (modeUsed as any) || quizInitialMode
                  });
                  checkAchievements(xp, score, total, activeQuiz.topicId);

                  // Gamification: Trigger confetti celebration on victory
                  if (score > 0) {
                    try {
                      confetti({
                        particleCount: 90,
                        spread: 70,
                        origin: { y: 0.6 }
                      });
                    } catch (e) {
                      // ignore in iframe if canvas blocked
                    }
                    playCorrectSound();
                  }

                  // Gamification: Update daily quest metrics
                  trackQuestProgress(currentUserId, 'answer_problems', score);
                  trackQuestProgress(currentUserId, 'complete_quiz', 1);
                  handleGamifiedRewardXP(xp, `Quiz Complete! +${xp} XP`);

                  setLatestQuizDetails({ xp, score, total });
                  setIsPerformanceModalOpen(true);
                  setActiveQuiz(null);
                  setQuizInitialMode(undefined);
                }}
              />
            </motion.div>
          ) : selectedTopic ? (
            <motion.div
              key={`topic-${selectedTopic.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TopicDetail 
                topic={selectedTopic} 
                onBack={() => setSelectedTopic(null)}
                isSummativeCompleted={results.some(r => r.quizId === selectedTopic.summativeAssessment?.id)}
                onStartSummativeAssessment={(summative) => {
                  setActiveSummativeAssessment(summative);
                }}
                onStartQuiz={(quiz, preferredMode) => {
                  let activeProblems = quiz.problems.filter(isValidatedOrActive);
                  
                  // Supplement with item bank if fewer than 5 active problems
                  if (activeProblems.length < 5) {
                    const supplement = allProblemsPool
                      .filter(p => p.topic === quiz.topicId && !activeProblems.some(ap => ap.id === p.id))
                      .slice(0, 5 - activeProblems.length);
                    activeProblems = [...activeProblems, ...supplement];
                  }

                  if (activeProblems.length === 0) {
                    alert("No active items are currently available in this quiz.");
                    return;
                  }
                  setQuizInitialMode(preferredMode || 'diagnostic');
                  setActiveQuiz({ ...quiz, problems: activeProblems });
                }}
              />
            </motion.div>
          ) : isTakingDiagnostic && topics.some(t => t.quizzes.some(q => q.problems.some(isValidatedOrActive))) ? (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DiagnosticAssessment 
                topics={topics}
                onComplete={(ability, scores, pathway, violations) => {
                  saveDiagnosticResult(ability, scores, pathway, violations);
                  setIsTakingDiagnostic(false);
                  if (pathway) {
                    setIsViewingPathway(true);
                  }
                }}
                onCancel={() => setIsTakingDiagnostic(false)}
              />
            </motion.div>
          ) : activeTab === 'learn' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Dashboard 
                topics={topics}
                profile={profile}
                results={results}
                onSelectTopic={setSelectedTopic} 
                onStartChallenge={handleStartChallenge}
                onStartPathway={() => setIsViewingPathway(true)}
                onStartCompetencyPractice={(quiz) => {
                  setSelectedTopic(null);
                  setQuizInitialMode('adaptive');
                  setActiveQuiz(quiz);
                }}
                onStartAdaptivePractice={handleStartAdaptivePractice}
                onRetakeQuiz={handleRetakeQuiz}
                onRetakeDiagnostic={handleRetakeDiagnostic}
                onOpenAIQuizModal={() => setIsAIQuizModalOpen(true)}
                onOpenAIMathSolver={(query) => {
                  setSolverInitialQuery(query || '');
                  setIsAISolverModalOpen(true);
                }}
                onOpenFormulaHub={() => setIsFormulaHubOpen(true)}
                onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
                onOpenExplainerLibrary={() => setActiveTab('explainers')}
                onOpenReports={() => setActiveTab('reports')}
                onOpenPresentations={() => setActiveTab('presentations')}
                onOpenDailyQuests={() => {
                  playPopSound();
                  setIsDailyQuestsOpen(true);
                }}
                onOpenSprintArena={() => {
                  playPopSound();
                  setIsSprintArenaOpen(true);
                }}
                onOpenLevelProgression={() => {
                  playPopSound();
                  setIsLevelProgressionOpen(true);
                }}
                onOpenAvatarCustomizer={() => {
                  playPopSound();
                  setIsAvatarCustomizerOpen(true);
                }}
                onStartSummativeAssessment={(summative) => {
                  setActiveSummativeAssessment(summative);
                }}
              />
            </motion.div>
          ) : activeTab === 'presentations' ? (
            <motion.div
              key="presentations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <StudentPresentationHub
                topics={topics}
                profile={profile}
                addXP={addXP}
                onStartQuiz={handleStartQuizFromPresentation}
                onStartDiagnostic={handleRetakeDiagnostic}
              />
            </motion.div>
          ) : activeTab === 'explainers' ? (
            <motion.div
              key="explainers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ExplainerLibrary
                topics={topics}
                results={results}
                profile={profile}
              />
            </motion.div>
          ) : activeTab === 'flashcards' ? (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <InteractiveFlashcards
                profile={profile}
                onRewardXP={addXP}
              />
            </motion.div>
          ) : activeTab === 'reports' ? (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LearningReports
                profile={profile}
                results={results}
                onTakeDiagnostic={() => setIsTakingDiagnostic(true)}
              />
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Leaderboard />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProfileView 
                profile={profile}
                results={results}
                onUpdateDisplayName={updateDisplayName}
                onUpdateProfileDetails={updateProfileDetails}
                onRetakeDiagnostic={handleRetakeDiagnostic}
                onRetakeQuiz={handleRetakeQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Smart AI Quiz Generator Modal */}
      <SmartAIQuizModal
        isOpen={isAIQuizModalOpen}
        onClose={() => setIsAIQuizModalOpen(false)}
        topics={topics}
        onStartGeneratedQuiz={(quiz) => {
          setSelectedTopic(null);
          setQuizInitialMode('standard');
          setActiveQuiz(quiz);
        }}
      />

      {/* AI Step-by-Step Math Solver Modal */}
      <AIMathSolverModal
        isOpen={isAISolverModalOpen}
        onClose={() => {
          setIsAISolverModalOpen(false);
          setSolverInitialQuery('');
        }}
        initialQuery={solverInitialQuery}
      />

      {/* Math Formula & Theorem Hub */}
      <MathFormulaHub
        isOpen={isFormulaHubOpen}
        onClose={() => setIsFormulaHubOpen(false)}
        onOpenSolverWithPrompt={() => {
          setIsAISolverModalOpen(true);
        }}
      />

      {/* Daily Math Challenge Modal */}
      <DailyChallengeModal
        isOpen={isDailyChallengeOpen}
        onClose={() => setIsDailyChallengeOpen(false)}
        currentUser={profile}
        onRewardXP={(xp) => addXP(xp)}
      />

      {/* Cumulative Performance & Performance Diagnosis Modal */}
      <CumulativePerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => {
          setIsPerformanceModalOpen(false);
          setLatestQuizDetails(null);
        }}
        profile={profile}
        results={results}
        latestXP={latestQuizDetails?.xp}
        latestScore={latestQuizDetails?.score}
        latestTotal={latestQuizDetails?.total}
      />

      {/* Gamification: Daily Quests & Check-In Modal */}
      <DailyQuestsModal
        isOpen={isDailyQuestsOpen}
        onClose={() => setIsDailyQuestsOpen(false)}
        userId={currentUserId}
        userXP={profile.xp}
        userStreak={profile.streak}
        onRewardXP={(amount) => handleGamifiedRewardXP(amount, 'Daily Quest Reward!')}
      />

      {/* Gamification: 60s Math Sprint Blitz Arena */}
      <MathSprintArena
        isOpen={isSprintArenaOpen}
        onClose={() => setIsSprintArenaOpen(false)}
        userId={currentUserId}
        onRewardXP={(amount) => handleGamifiedRewardXP(amount, 'Sprint Blitz Victory!')}
      />

      {/* Gamification: RPG Level Progression & Perks Roadmap */}
      <LevelProgressionModal
        isOpen={isLevelProgressionOpen}
        onClose={() => setIsLevelProgressionOpen(false)}
        currentLevel={profile.level}
        currentXP={profile.xp}
        onOpenAvatars={() => {
          setIsLevelProgressionOpen(false);
          setIsAvatarCustomizerOpen(true);
        }}
      />

      {/* Gamification: Avatar Archetype Customizer */}
      <AvatarCustomizerModal
        isOpen={isAvatarCustomizerOpen}
        onClose={() => setIsAvatarCustomizerOpen(false)}
        userId={currentUserId}
        currentLevel={profile.level}
        onAvatarSelected={() => {
          setAvatarRev(r => r + 1);
        }}
      />

      {/* Gamification: Level-Up Celebration Fanfare Modal */}
      {levelUpCelebration && (
        <LevelUpCelebrationModal
          isOpen={levelUpCelebration.isOpen}
          newLevel={levelUpCelebration.newLevel}
          onClose={() => setLevelUpCelebration(null)}
          onOpenPerks={() => {
            setLevelUpCelebration(null);
            setIsLevelProgressionOpen(true);
          }}
        />
      )}

      {/* Floating Gamified XP Toast */}
      <AnimatePresence>
        {floatingXPToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-amber-400/40 flex items-center gap-2 text-xs font-black">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-amber-300">+{floatingXPToast.amount} XP</span>
              {floatingXPToast.message && (
                <span className="text-slate-300 font-medium border-l border-white/20 pl-2">
                  {floatingXPToast.message}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Navigation Bar */}
      {!activeQuiz && !isTakingDiagnostic && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex justify-around items-center z-20 shadow-lg sm:max-w-lg sm:mx-auto sm:mb-6 sm:rounded-2xl sm:border">
          <NavButton 
            active={activeTab === 'learn'} 
            onClick={() => { setActiveTab('learn'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<BookOpen className="w-5 h-5" />}
            label="Dashboard"
          />
          <NavButton 
            active={activeTab === 'presentations'} 
            onClick={() => { setActiveTab('presentations'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<Layers className="w-5 h-5" />}
            label="Slides"
          />
          <NavButton 
            active={activeTab === 'explainers'} 
            onClick={() => { setActiveTab('explainers'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<Video className="w-5 h-5" />}
            label="Explainers"
          />
          <NavButton 
            active={activeTab === 'flashcards'} 
            onClick={() => { setActiveTab('flashcards'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<Zap className="w-5 h-5" />}
            label="Cards"
          />
          <NavButton 
            active={activeTab === 'reports'} 
            onClick={() => { setActiveTab('reports'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<TrendingUp className="w-5 h-5" />}
            label="Reports"
          />
          <NavButton 
            active={activeTab === 'leaderboard'} 
            onClick={() => { setActiveTab('leaderboard'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<Trophy className="w-5 h-5" />}
            label="Rankings"
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => { setActiveTab('profile'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<User className="w-5 h-5" />}
            label="Profile"
          />
        </nav>
      )}

      {activeSummativeAssessment && (
        <SummativeAssessmentModal
          isOpen={!!activeSummativeAssessment}
          assessment={activeSummativeAssessment}
          profile={profile}
          onClose={() => setActiveSummativeAssessment(null)}
          onSaveResult={(res) => {
            saveResult({
              ...res,
              userId: userUid
            });
            trackQuestProgress(currentUserId, 'answer_problems', res.score);
            trackQuestProgress(currentUserId, 'complete_quiz', 1);
            checkAchievements(
              profile.xp + res.summativeTranscript.xpEarned,
              res.score,
              res.total,
              activeSummativeAssessment.topicId
            );
            handleGamifiedRewardXP(
              res.summativeTranscript.xpEarned,
              `Summative Exam Complete! +${res.summativeTranscript.xpEarned} XP`
            );
          }}
          onAddXP={async (amount) => {
            addXP(amount);
            return amount;
          }}
        />
      )}

      {/* Tab Out & Alt-Tab Warning Overlay */}
      <AnimatePresence>
        {showAltTabWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative border-t-8 border-rose-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-12 -mt-12 -z-10 opacity-60" />
              
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-rose-600 animate-pulse" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                Academic Window Leaving Detected!
              </h2>
              
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                You have navigated away from your active mathematical assessment window (by switching tabs, opening another app, or using Alt+Tab). 
              </p>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                  <span className="text-xs font-black uppercase text-rose-800 tracking-wider">
                    Violation Warning Roster
                  </span>
                </div>
                <p className="text-xs text-rose-700 font-semibold leading-relaxed">
                  Focus Warning Counter: <strong className="text-rose-900 text-sm font-extrabold">{tabOutCount}</strong>
                </p>
                <p className="text-[10px] text-rose-600/90 leading-tight">
                  Please stay focused on your test questions. Navigating away during formal classroom assessments is strictly logged by your subject teacher.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setShowAltTabWarning(false);
                }}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black rounded-2xl shadow-lg shadow-rose-100 transition-all text-xs tracking-wider uppercase"
              >
                I understand, return to exam
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={showLogoutConfirm}
        title="Sign Out of MathAdapt AI"
        message="Are you sure you want to log out? Your progress, XP, and badges are securely saved."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="logout"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
        active ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
      }`}
    >
      <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] sm:text-[11px] whitespace-nowrap">{label}</span>
    </button>
  );
}
