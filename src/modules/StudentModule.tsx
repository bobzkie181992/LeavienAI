import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Trophy, User, LogOut, Zap, Play, Users, MessageSquare, Video, Layers, TrendingUp } from 'lucide-react';
import { 
  UserProfile, 
  Quiz, 
  Topic as TopicType, 
  QuizResult, 
  LearningPathway, 
  Problem,
  StudyRequest,
  isValidatedOrActive 
} from '../types';

import Dashboard from '../components/Dashboard';
import QuizEngine from '../components/QuizEngine';
import TopicDetail from '../components/TopicDetail';
import ProfileView from '../components/ProfileView';
import Leaderboard from '../components/Leaderboard';
import DiagnosticAssessment from '../components/DiagnosticAssessment';
import PathwayEngine from '../components/PathwayEngine';
import StudyRequestsModal from '../components/StudyRequestsModal';
import PeerChatModal from '../components/PeerChatModal';
import SmartAIQuizModal from '../components/SmartAIQuizModal';
import AIMathSolverModal from '../components/AIMathSolverModal';
import MathFormulaHub from '../components/MathFormulaHub';
import DailyChallengeModal from '../components/DailyChallengeModal';
import ExplainerLibrary from '../components/ExplainerLibrary';
import CumulativePerformanceModal from '../components/CumulativePerformanceModal';
import InteractiveFlashcards from '../components/InteractiveFlashcards';
import LearningReports from '../components/LearningReports';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useStudyRequests, usePeers } from '../hooks/useFirebase';
import { usePeerChat } from '../hooks/usePeerChat';
import { createAdaptiveQuiz } from '../utils/adaptiveEngine';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface StudentModuleProps {
  profile: UserProfile;
  topics: TopicType[];
  results: QuizResult[];
  userUid: string;
  addXP: (amount: number) => void;
  saveResult: (result: Omit<QuizResult, 'timestamp'>) => void;
  saveDiagnosticResult: (ability: string, scores: Record<string, number>, pathway?: LearningPathway) => void;
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
  const [activeTab, setActiveTab] = useState<'learn' | 'explainers' | 'flashcards' | 'reports' | 'profile' | 'leaderboard'>('learn');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicType | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizInitialMode, setQuizInitialMode] = useState<'adaptive' | 'standard' | 'timed' | undefined>(undefined);
  const [isViewingPathway, setIsViewingPathway] = useState(false);
  const [isTakingDiagnostic, setIsTakingDiagnostic] = useState(false);

  // Collaborative Study Requests State & Hooks
  const currentUserId = userUid || profile.uid;
  const {
    incomingRequests,
    outgoingRequests,
    pendingIncomingCount,
    sendStudyRequest,
    respondToStudyRequest,
    cancelStudyRequest,
    completeStudyRequest
  } = useStudyRequests(currentUserId);

  const { peers } = usePeers(currentUserId);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isAIQuizModalOpen, setIsAIQuizModalOpen] = useState(false);
  const [isAISolverModalOpen, setIsAISolverModalOpen] = useState(false);
  const [solverInitialQuery, setSolverInitialQuery] = useState('');
  const [isFormulaHubOpen, setIsFormulaHubOpen] = useState(false);
  const [isDailyChallengeOpen, setIsDailyChallengeOpen] = useState(false);
  const [preselectedTopicId, setPreselectedTopicId] = useState<string | undefined>(undefined);
  const [preselectedQuizId, setPreselectedQuizId] = useState<string | undefined>(undefined);
  const [activeCollaborativeSession, setActiveCollaborativeSession] = useState<{
    partnerName: string;
    topicTitle: string;
    requestId: string;
  } | null>(null);

  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [latestQuizDetails, setLatestQuizDetails] = useState<{ xp: number; score: number; total: number } | null>(null);

  // Pool of all active problems across curriculum
  const allProblemsPool: Problem[] = topics
    .flatMap(topic => topic.quizzes.flatMap(quiz => quiz.problems))
    .filter(isValidatedOrActive);

  // Handler to launch collaborative practice from an accepted or pending request
  const handleStartCollaborativePractice = (request: StudyRequest) => {
    const topic = topics.find(t => t.id === request.topicId);
    let quizToRun: Quiz | null = null;
    
    if (request.quizId && topic) {
      quizToRun = topic.quizzes.find(q => q.id === request.quizId) || null;
    }
    
    if (!quizToRun && topic) {
      quizToRun = topic.quizzes.find(q => q.problems.some(isValidatedOrActive)) || null;
    }

    if (!quizToRun) {
      const { quiz } = createAdaptiveQuiz(topics, {
        topicId: request.topicId,
        targetProblemsCount: 5
      });
      quizToRun = quiz;
    }

    const activeProblems = quizToRun.problems.filter(isValidatedOrActive);
    if (activeProblems.length === 0) {
      const fallbackProblems = (topic?.quizzes.flatMap(q => q.problems) || allProblemsPool)
        .filter(isValidatedOrActive)
        .slice(0, 5);
      quizToRun = {
        ...quizToRun,
        problems: fallbackProblems.length > 0 ? fallbackProblems : allProblemsPool.slice(0, 5)
      };
    } else {
      quizToRun = { ...quizToRun, problems: activeProblems };
    }

    const isIncoming = request.toUserId === currentUserId;
    const partnerName = isIncoming ? request.fromUserName : request.toUserName;

    // If incoming request is still pending, automatically accept it
    if (request.status === 'pending' && isIncoming) {
      respondToStudyRequest(request.id, 'accepted').catch(console.error);
    }

    setActiveCollaborativeSession({
      partnerName,
      topicTitle: request.topicTitle,
      requestId: request.id
    });

    setIsStudyModalOpen(false);
    setSelectedTopic(null);
    setQuizInitialMode('standard');
    setActiveQuiz(quizToRun);
  };

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

            {/* Peer Study Requests Trigger */}
            <button
              id="study-requests-header-trigger"
              onClick={() => {
                setPreselectedTopicId(undefined);
                setPreselectedQuizId(undefined);
                setIsStudyModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 transition-all font-bold text-xs relative active:scale-95 shadow-sm"
              title="Collaborative Study Requests"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Study Requests</span>
              {pendingIncomingCount > 0 && (
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {pendingIncomingCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <Zap className="w-3.5 h-3.5 text-orange-600 fill-current" />
              <span className="text-xs font-bold text-orange-700">{profile.streak}d</span>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
              <Trophy className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700">{profile.xp} XP</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <span className="text-xs font-bold text-amber-800">Lvl {profile.level}</span>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1"
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
                topic={topics.find(t => t.id === profile.activePathway!.topicId)!}
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
                collaborativeSession={activeCollaborativeSession || undefined}
                onSuggestAIQuiz={() => {
                  setActiveQuiz(null);
                  setIsAIQuizModalOpen(true);
                }}
                onClose={() => {
                  setActiveQuiz(null);
                  setQuizInitialMode(undefined);
                  setActiveCollaborativeSession(null);
                }}
                onComplete={(xp, score, total, itemResponses, abilityEstimate, mathAbilityDiagnosis, violations) => {
                  addXP(xp);
                  saveResult({
                    userId: userUid,
                    quizId: activeQuiz.id,
                    score,
                    total,
                    itemResponses,
                    abilityEstimate,
                    mathAbilityDiagnosis,
                    violations
                  });
                  checkAchievements(xp, score, total, activeQuiz.topicId);

                  // If this was an active collaborative session, complete the request in Firestore
                  if (activeCollaborativeSession) {
                    completeStudyRequest(activeCollaborativeSession.requestId).catch(console.error);
                    setActiveCollaborativeSession(null);
                  }

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
                onStartQuiz={(quiz) => {
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
                  setQuizInitialMode('standard');
                  setActiveQuiz({ ...quiz, problems: activeProblems });
                }}
                onInviteStudy={(quiz) => {
                  setPreselectedTopicId(selectedTopic.id);
                  setPreselectedQuizId(quiz?.id);
                  setIsStudyModalOpen(true);
                }}
              />
            </motion.div>
          ) : (!profile.diagnosticCompleted || isTakingDiagnostic) && topics.some(t => t.quizzes.some(q => q.problems.some(isValidatedOrActive))) ? (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DiagnosticAssessment 
                topics={topics}
                onComplete={(ability, scores, pathway) => {
                  saveDiagnosticResult(ability, scores, pathway);
                  setIsTakingDiagnostic(false);
                  if (pathway) {
                    setIsViewingPathway(true);
                  }
                }}
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
                onOpenStudyRequests={() => {
                  setPreselectedTopicId(undefined);
                  setPreselectedQuizId(undefined);
                  setIsStudyModalOpen(true);
                }}
                onSendStudyRequest={(topicId, quizId) => {
                  setPreselectedTopicId(topicId);
                  setPreselectedQuizId(quizId);
                  setIsStudyModalOpen(true);
                }}
                incomingStudyRequests={incomingRequests}
                outgoingStudyRequests={outgoingRequests}
                onStartCollaborativePractice={handleStartCollaborativePractice}
                onOpenAIQuizModal={() => setIsAIQuizModalOpen(true)}
                onOpenAIMathSolver={(query) => {
                  setSolverInitialQuery(query || '');
                  setIsAISolverModalOpen(true);
                }}
                onOpenFormulaHub={() => setIsFormulaHubOpen(true)}
                onOpenDailyChallenge={() => setIsDailyChallengeOpen(true)}
                onOpenExplainerLibrary={() => setActiveTab('explainers')}
                onOpenReports={() => setActiveTab('reports')}
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

      {/* Collaborative Study Requests Modal */}
      <StudyRequestsModal
        isOpen={isStudyModalOpen}
        onClose={() => setIsStudyModalOpen(false)}
        currentUser={profile}
        peers={peers}
        topics={topics}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        onSendRequest={sendStudyRequest}
        onRespondRequest={respondToStudyRequest}
        onCancelRequest={cancelStudyRequest}
        onStartCollaborativePractice={handleStartCollaborativePractice}
        initialTopicId={preselectedTopicId}
        initialQuizId={preselectedQuizId}
      />

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

      {/* Bottom Floating Navigation Bar */}
      {!activeQuiz && !isTakingDiagnostic && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2.5 flex justify-around items-center z-20 shadow-lg sm:max-w-md sm:mx-auto sm:mb-6 sm:rounded-2xl sm:border">
          <NavButton 
            active={activeTab === 'learn'} 
            onClick={() => { setActiveTab('learn'); setSelectedTopic(null); setActiveQuiz(null); setIsTakingDiagnostic(false); }}
            icon={<BookOpen className="w-5 h-5" />}
            label="Dashboard"
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
            icon={<Layers className="w-5 h-5" />}
            label="Flashcards"
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
