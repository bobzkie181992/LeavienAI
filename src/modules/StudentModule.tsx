import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu,
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
  AlertCircle,
  Home,
  CheckSquare,
  BarChart3,
  FolderOpen,
  Bell,
  Settings
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

import StudentSidebar, { StudentNavSection } from '../components/StudentSidebar';
import TopNavHeader from '../components/TopNavHeader';
import StudentDiagnosticAssessmentPage from '../components/StudentDiagnosticAssessmentPage';
import StudentFormativeAssessmentPage from '../components/StudentFormativeAssessmentPage';
import CurriculumView from '../components/student-views/CurriculumView';
import ActivitiesView from '../components/student-views/ActivitiesView';
import AssessmentsView from '../components/student-views/AssessmentsView';
import LearningResourcesView from '../components/student-views/LearningResourcesView';
import ProgressView from '../components/student-views/ProgressView';
import StudentProgressView from '../components/student-views/StudentProgressView';
import NotificationsView from '../components/student-views/NotificationsView';
import SettingsView from '../components/student-views/SettingsView';

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
import WeeklyStudySummary from '../components/WeeklyStudySummary';
import ModernStudentDashboard from '../components/ModernStudentDashboard';
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
  // Navigation Section State
  const [currentSection, setCurrentSection] = useState<StudentNavSection>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    if (quizId.startsWith('adaptive-')) {
      handleStartAdaptivePractice();
      return;
    }

    for (const topic of topics) {
      const q = topic.quizzes.find(quiz => quiz.id === quizId);
      if (q) {
        const activeProblems = q.problems.filter(isValidatedOrActive);
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

  // Helper for sequential progression
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

  // Compute section breadcrumb label
  const getSectionTitle = (sec: StudentNavSection) => {
    switch (sec) {
      case 'dashboard': return 'Dashboard';
      case 'curriculum':
      case 'curriculum-hierarchy': return 'Curriculum • 8-Level Hierarchy';
      case 'curriculum-overview': return 'Curriculum • Overview';
      case 'curriculum-ilaw': return 'Curriculum • DepEd ILAW Lessons';
      case 'curriculum-subjects': return 'Curriculum • My Subjects';
      case 'curriculum-competencies': return 'Curriculum • Learning Competencies';
      case 'activities':
      case 'activities-todo': return 'Activities • To Do';
      case 'activities-in-progress': return 'Activities • In Progress';
      case 'activities-completed': return 'Activities • Completed Archive';
      case 'assessments':
      case 'assessments-diagnostic': return 'Assessments • Diagnostic Assessment';
      case 'assessments-formative': return 'Assessments • Formative Assessment';
      case 'assessments-quizzes': return 'Assessments • Quizzes';
      case 'assessments-exams': return 'Assessments • Summative Exams (TOS)';
      case 'assessments-results': return 'Assessments • My Results';
      case 'resources':
      case 'resources-modules': return 'Learning Resources • Modules & Slides';
      case 'resources-worksheets': return 'Learning Resources • Worksheets & Flashcards';
      case 'resources-videos': return 'Learning Resources • Videos';
      case 'resources-references': return 'Learning Resources • References & Formulas';
      case 'progress':
      case 'progress-subject': return 'My Progress • Subject Progress';
      case 'progress-competency': return 'My Progress • Competency Progress';
      case 'progress-grades': return 'My Progress • Grades & Transcript';
      case 'notifications': return 'Notifications';
      case 'settings': return 'Settings & Preferences';
      default: return 'Student Portal';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Left Sidebar Component */}
      <StudentSidebar
        currentSection={currentSection}
        onNavigate={(sec) => {
          setCurrentSection(sec);
          setSelectedTopic(null);
          setActiveQuiz(null);
          setIsTakingDiagnostic(false);
          setIsViewingPathway(false);
          setActiveSummativeAssessment(null);
        }}
        profile={profile}
        unreadNotificationsCount={3}
        pendingActivitiesCount={topics.flatMap(t => t.quizzes).filter(q => !results.some(r => r.quizId === q.id)).length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={() => setShowLogoutConfirm(true)}
        onOpenLevelProgression={() => {
          playPopSound();
          setIsLevelProgressionOpen(true);
        }}
        onOpenQuests={() => {
          playPopSound();
          setIsDailyQuestsOpen(true);
        }}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navigation Header */}
        <TopNavHeader
          role="student"
          profile={profile}
          currentSectionTitle={getSectionTitle(currentSection)}
          breadcrumbPath={[
            { label: 'Student Portal', action: () => setCurrentSection('dashboard') },
            { label: getSectionTitle(currentSection).split('•')[0].trim() },
            ...(selectedTopic ? [{ label: selectedTopic.title }] : [])
          ]}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateNotifications={() => setCurrentSection('notifications')}
          onNavigateSettings={() => setCurrentSection('settings')}
          onLogout={() => setShowLogoutConfirm(true)}
          topics={topics}
          onSelectTopic={(t) => setSelectedTopic(t)}
          isMuted={isMuted}
          onToggleSound={toggleSound}
        />

        {/* Secondary Sub-Bar: Quick Gamification Metrics */}
        <div className="bg-slate-100/80 border-b border-slate-200/80 px-4 sm:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            {/* Quests Button */}
            <button
              onClick={() => {
                playPopSound();
                setIsDailyQuestsOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100/90 text-amber-900 transition-all font-bold text-[11px] relative active:scale-95 cursor-pointer shrink-0"
              title="Daily Quests & Check-In Bounty"
            >
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>Quests</span>
              {pendingQuestsToClaim > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {pendingQuestsToClaim}
                </span>
              )}
            </button>

            {/* Blitz Arena */}
            <button
              onClick={() => {
                playPopSound();
                setIsSprintArenaOpen(true);
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-900 transition-all font-bold text-[11px] active:scale-95 cursor-pointer shrink-0"
              title="60-Second Math Blitz Arena"
            >
              <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span>Blitz Arena</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Streak */}
            <div 
              className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/80 cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => setIsDailyQuestsOpen(true)}
              title={`${profile.streak} day streak! Click to view daily bonuses`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span className="text-[11px] font-black text-orange-800">{profile.streak}d Streak</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80">
              <Trophy className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-black text-indigo-800">{profile.xp} XP</span>
            </div>

            {/* Level Progression */}
            <button
              onClick={() => {
                playPopSound();
                setIsLevelProgressionOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 px-2.5 py-1 rounded-full border border-indigo-200 text-indigo-900 font-black text-[11px] transition-all active:scale-95 cursor-pointer"
              title="View Level Progression"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>Level {profile.level}</span>
            </button>
          </div>
        </div>

        {/* Main View Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {/* Interactive Testing/Study Modes Take Priority */}
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

                    if (score > 0) {
                      try {
                        confetti({
                          particleCount: 90,
                          spread: 70,
                          origin: { y: 0.6 }
                        });
                      } catch (e) {}
                      playCorrectSound();
                    }

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
                  profile={profile}
                  onBack={() => setSelectedTopic(null)}
                  isSummativeCompleted={results.some(r => r.quizId === selectedTopic.summativeAssessment?.id)}
                  onSaveQuizResult={saveResult}
                  onAddXP={addXP}
                  onStartSummativeAssessment={(summative) => {
                    setActiveSummativeAssessment(summative);
                  }}
                  onStartQuiz={(quiz, preferredMode) => {
                    let activeProblems = quiz.problems.filter(isValidatedOrActive);
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
            ) : currentSection.startsWith('curriculum') ? (
              <motion.div
                key={`sec-curriculum-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CurriculumView
                  topics={topics}
                  results={results}
                  profile={profile}
                  initialTab={
                    currentSection === 'curriculum-ilaw' ? 'ilaw' :
                    currentSection === 'curriculum-subjects' ? 'subjects' :
                    currentSection === 'curriculum-competencies' ? 'competencies' :
                    currentSection === 'curriculum-overview' ? 'overview' :
                    'hierarchy'
                  }
                  onSelectTopic={setSelectedTopic}
                  onOpenTopicDLP={setSelectedTopic}
                  onStartCompetencyPractice={handleStartAdaptivePractice}
                  onSaveQuizResult={saveResult}
                  onAddXP={addXP}
                />
              </motion.div>
            ) : currentSection.startsWith('activities') ? (
              <motion.div
                key={`sec-activities-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ActivitiesView
                  topics={topics}
                  results={results}
                  profile={profile}
                  initialTab={
                    currentSection === 'activities-in-progress' ? 'in-progress' :
                    currentSection === 'activities-completed' ? 'completed' :
                    'todo'
                  }
                  onStartQuiz={(quiz, mode) => {
                    setQuizInitialMode(mode || 'standard');
                    setActiveQuiz(quiz);
                  }}
                  onStartPathway={() => setIsViewingPathway(true)}
                  onStartChallenge={handleStartChallenge}
                  onRetakeDiagnostic={handleRetakeDiagnostic}
                  onSelectTopic={setSelectedTopic}
                />
              </motion.div>
            ) : currentSection === 'assessments-diagnostic' ? (
              <motion.div
                key="sec-assessments-diagnostic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StudentDiagnosticAssessmentPage
                  topics={topics}
                  profile={profile}
                  onStartDiagnosticTest={() => setIsTakingDiagnostic(true)}
                  onSaveDiagnosticResult={saveDiagnosticResult}
                  onBackToOverview={() => setCurrentSection('dashboard')}
                />
              </motion.div>
            ) : currentSection === 'assessments-formative' ? (
              <motion.div
                key="sec-assessments-formative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StudentFormativeAssessmentPage
                  topics={topics}
                  profile={profile}
                  onBackToOverview={() => setCurrentSection('dashboard')}
                />
              </motion.div>
            ) : currentSection.startsWith('assessments') ? (
              <motion.div
                key={`sec-assessments-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AssessmentsView
                  topics={topics}
                  results={results}
                  profile={profile}
                  initialTab={
                    currentSection === 'assessments-exams' ? 'exams' :
                    currentSection === 'assessments-results' ? 'results' :
                    'quizzes'
                  }
                  onStartQuiz={(quiz, mode) => {
                    setQuizInitialMode(mode || 'standard');
                    setActiveQuiz(quiz);
                  }}
                  onStartSummativeAssessment={(summative) => {
                    setActiveSummativeAssessment(summative);
                  }}
                  onOpenPerformanceModal={() => setIsPerformanceModalOpen(true)}
                />
              </motion.div>
            ) : currentSection.startsWith('resources') ? (
              <motion.div
                key={`sec-resources-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LearningResourcesView
                  topics={topics}
                  profile={profile}
                  results={results}
                  initialTab={
                    currentSection === 'resources-worksheets' ? 'worksheets' :
                    currentSection === 'resources-videos' ? 'videos' :
                    currentSection === 'resources-references' ? 'references' :
                    'modules'
                  }
                  addXP={addXP}
                  onStartQuizFromPresentation={handleStartQuizFromPresentation}
                  onOpenFormulaHub={() => setIsFormulaHubOpen(true)}
                />
              </motion.div>
            ) : currentSection.startsWith('progress') ? (
              <motion.div
                key={`sec-progress-${currentSection}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <StudentProgressView
                  topics={topics}
                  results={results}
                  profile={profile}
                  initialTab={
                    currentSection === 'progress-subject' ? 'subjects' :
                    currentSection === 'progress-competency' ? 'competencies' :
                    currentSection === 'progress-grades' ? 'quarters' :
                    'overview'
                  }
                  onRetakeDiagnostic={handleRetakeDiagnostic}
                />
              </motion.div>
            ) : currentSection === 'notifications' ? (
              <motion.div
                key="sec-notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <NotificationsView
                  profile={profile}
                  onOpenQuests={() => setIsDailyQuestsOpen(true)}
                  onNavigateToCurriculum={() => setCurrentSection('curriculum-ilaw')}
                  onNavigateToExams={() => setCurrentSection('assessments-exams')}
                />
              </motion.div>
            ) : currentSection === 'settings' ? (
              <motion.div
                key="sec-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SettingsView
                  profile={profile}
                  onUpdateProfileDetails={updateProfileDetails}
                  onOpenAvatarCustomizer={() => setIsAvatarCustomizerOpen(true)}
                />
              </motion.div>
            ) : (
              /* Default: Dashboard */
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <ModernStudentDashboard
                  topics={topics}
                  profile={profile}
                  results={results}
                  onSelectTopic={setSelectedTopic}
                  onStartDiagnostic={handleRetakeDiagnostic}
                  onOpenActivities={() => setCurrentSection('activities-todo')}
                  onOpenCurriculum={() => setCurrentSection('curriculum-hierarchy')}
                  onOpenProgress={() => setCurrentSection('progress')}
                />

                <WeeklyStudySummary
                  topics={topics}
                  results={results}
                  profile={profile}
                  onSelectTopic={setSelectedTopic}
                />
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
                  onOpenExplainerLibrary={() => setCurrentSection('resources-videos')}
                  onOpenReports={() => setCurrentSection('progress-competency')}
                  onOpenPresentations={() => setCurrentSection('resources-modules')}
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
            )}
          </AnimatePresence>
        </main>
      </div>

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

      {/* Cumulative Performance Modal */}
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

      {/* Daily Quests & Check-In Modal */}
      <DailyQuestsModal
        isOpen={isDailyQuestsOpen}
        onClose={() => setIsDailyQuestsOpen(false)}
        userId={currentUserId}
        userXP={profile.xp}
        userStreak={profile.streak}
        onRewardXP={(amount) => handleGamifiedRewardXP(amount, 'Daily Quest Reward!')}
      />

      {/* 60s Math Sprint Blitz Arena */}
      <MathSprintArena
        isOpen={isSprintArenaOpen}
        onClose={() => setIsSprintArenaOpen(false)}
        userId={currentUserId}
        onRewardXP={(amount) => handleGamifiedRewardXP(amount, 'Sprint Blitz Victory!')}
      />

      {/* RPG Level Progression & Perks Roadmap */}
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

      {/* Avatar Archetype Customizer */}
      <AvatarCustomizerModal
        isOpen={isAvatarCustomizerOpen}
        onClose={() => setIsAvatarCustomizerOpen(false)}
        userId={currentUserId}
        currentLevel={profile.level}
        onAvatarSelected={() => {
          setAvatarRev(r => r + 1);
        }}
      />

      {/* Level-Up Celebration Fanfare Modal */}
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

      {/* Summative Assessment Fullscreen Modal */}
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
                    Focus Integrity Log
                  </span>
                </div>
                <p className="text-xs text-rose-700 font-semibold leading-relaxed">
                  Focus Warning Counter: <strong className="text-rose-900 text-sm font-extrabold">{tabOutCount}</strong>
                </p>
                <p className="text-[10px] text-rose-600/90 leading-tight">
                  Please stay focused on your test questions. Navigating away during formal classroom assessments is logged for subject teachers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setShowAltTabWarning(false);
                }}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black rounded-2xl shadow-lg shadow-rose-100 transition-all text-xs tracking-wider uppercase cursor-pointer"
              >
                I understand, return to exam
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={showLogoutConfirm}
        title="Sign Out of LeavienAI"
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
    </div>
  );
}
