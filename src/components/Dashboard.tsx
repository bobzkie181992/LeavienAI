import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, UserProfile, QuizResult, Quiz, StudyRequest, isValidatedOrActive } from '../types';
import * as Icons from 'lucide-react';
import { createAdaptiveQuiz } from '../utils/adaptiveEngine';
import { buildKnowledgeGraph } from '../utils/knowledgeMapUtils';
import MasteryChart from './MasteryChart';

interface DashboardProps {
  topics: Topic[];
  profile: UserProfile;
  results: QuizResult[];
  onSelectTopic: (topic: Topic) => void;
  onStartChallenge: () => void;
  onStartPathway: () => void;
  onStartCompetencyPractice?: (quiz: Quiz) => void;
  onStartAdaptivePractice?: (competencyName?: string) => void;
  onRetakeQuiz?: (quizId: string) => void;
  onRetakeDiagnostic?: () => void;
  onOpenStudyRequests?: () => void;
  onSendStudyRequest?: (topicId?: string, quizId?: string) => void;
  incomingStudyRequests?: StudyRequest[];
  outgoingStudyRequests?: StudyRequest[];
  onStartCollaborativePractice?: (request: StudyRequest) => void;
  onOpenPeerChat?: (peerId?: string, topicId?: string) => void;
  unreadChatCount?: number;
  onOpenAIQuizModal?: () => void;
  onOpenAIMathSolver?: (initialQuery?: string) => void;
  onOpenFormulaHub?: () => void;
  onOpenDailyChallenge?: () => void;
  onOpenExplainerLibrary?: () => void;
  onOpenReports?: () => void;
}

export default function Dashboard({ 
  topics, 
  profile, 
  results, 
  onSelectTopic, 
  onStartChallenge, 
  onStartPathway,
  onStartCompetencyPractice,
  onStartAdaptivePractice,
  onRetakeQuiz,
  onRetakeDiagnostic,
  onOpenStudyRequests,
  onSendStudyRequest,
  incomingStudyRequests = [],
  outgoingStudyRequests = [],
  onStartCollaborativePractice,
  onOpenPeerChat,
  unreadChatCount = 0,
  onOpenAIQuizModal,
  onOpenAIMathSolver,
  onOpenFormulaHub,
  onOpenDailyChallenge,
  onOpenExplainerLibrary,
  onOpenReports
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'competencies' | 'completed'>('overview');
  const [completedFilter, setCompletedFilter] = useState<'all' | 'mastered' | 'needs_work'>('all');

  const pendingIncomingRequests = useMemo(() => {
    return incomingStudyRequests.filter(r => r.status === 'pending');
  }, [incomingStudyRequests]);

  const acceptedOutgoingRequests = useMemo(() => {
    return outgoingStudyRequests.filter(r => r.status === 'accepted');
  }, [outgoingStudyRequests]);

  // Build the Knowledge Graph for competency-level mastery
  const graphData = useMemo(() => {
    return buildKnowledgeGraph(topics, results, profile);
  }, [topics, results, profile]);

  const allCompetencyNodes = graphData.nodes;
  const masteredCompetencies = allCompetencyNodes.filter(n => n.masteryPercentage >= 80 || n.status === 'mastered');
  const weakCompetencies = allCompetencyNodes
    .filter(n => n.attempts > 0 && n.masteryPercentage < 70)
    .sort((a, b) => a.masteryPercentage - b.masteryPercentage);

  const computedWeaknesses = useMemo(() => {
    const list: { name: string; score: number; source: string; topicTitle: string; difficulty: 'easy' | 'medium' | 'hard' }[] = [];
    const addedNames = new Set<string>();

    // 1. From Knowledge Graph (Weak Competencies)
    weakCompetencies.forEach(node => {
      const normName = node.name.toLowerCase().trim();
      if (!addedNames.has(normName)) {
        list.push({
          name: node.name,
          score: node.masteryPercentage,
          source: 'Quiz History',
          topicTitle: node.topicTitle || 'General Math',
          difficulty: (node.difficulty as 'easy' | 'medium' | 'hard') || 'medium'
        });
        addedNames.add(normName);
      }
    });

    // 2. From Profile competencyScores (Diagnostic or active competency estimations)
    if (profile.competencyScores) {
      Object.entries(profile.competencyScores).forEach(([name, score]) => {
        const normName = name.toLowerCase().trim();
        if (score < 70 && !addedNames.has(normName)) {
          // Find matching topic
          let topicTitle = 'General Math';
          for (const topic of topics) {
            const hasComp = topic.quizzes.some(q => q.problems.some(p => p.competency?.toLowerCase().trim() === normName));
            if (hasComp) {
              topicTitle = topic.title;
              break;
            }
          }
          list.push({
            name,
            score: Math.round(score),
            source: 'Diagnostic Profile',
            topicTitle,
            difficulty: 'medium'
          });
          addedNames.add(normName);
        }
      });
    }

    // 3. From low accuracy on individual topics/quizzes recently taken
    results.forEach(res => {
      const accuracy = res.total > 0 ? Math.round((res.score / res.total) * 100) : 0;
      if (accuracy < 70) {
        // Find which quiz and topic this corresponds to
        for (const topic of topics) {
          const q = topic.quizzes.find(quiz => quiz.id === res.quizId);
          if (q) {
            const firstComp = q.problems[0]?.competency || q.title;
            const normName = firstComp.toLowerCase().trim();
            if (!addedNames.has(normName)) {
              list.push({
                name: firstComp,
                score: accuracy,
                source: 'Recent Quizzes',
                topicTitle: topic.title,
                difficulty: q.problems[0]?.difficulty || 'medium'
              });
              addedNames.add(normName);
            }
          }
        }
      }
    });

    // Sort so lowest score is first (critical priority)
    return list.sort((a, b) => a.score - b.score).slice(0, 3);
  }, [weakCompetencies, profile.competencyScores, results, topics]);

  // Calculate best scores per quiz
  const bestScores = new Map<string, { score: number; total: number; attempts: number; latestTimestamp: string }>();
  results.forEach(r => {
    const current = bestScores.get(r.quizId);
    if (!current) {
      bestScores.set(r.quizId, { 
        score: r.score, 
        total: r.total, 
        attempts: 1, 
        latestTimestamp: r.timestamp 
      });
    } else {
      bestScores.set(r.quizId, {
        score: Math.max(current.score, r.score),
        total: r.total,
        attempts: current.attempts + 1,
        latestTimestamp: new Date(r.timestamp) > new Date(current.latestTimestamp) ? r.timestamp : current.latestTimestamp
      });
    }
  });

  // Calculate mastery per topic
  const topicMastery = topics.map(topic => {
    let earned = 0;
    let total = 0;
    let completedQuizzes = 0;
    topic.quizzes.forEach(q => {
      total += q.problems.length;
      const best = bestScores.get(q.id);
      if (best) {
        earned += best.score;
        completedQuizzes++;
      }
    });
    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { 
      topic, 
      percentage, 
      earned, 
      total,
      completedQuizzes,
      totalQuizzes: topic.quizzes.length
    };
  });

  // Overall Mastery
  const totalEarned = topicMastery.reduce((acc, curr) => acc + curr.earned, 0);
  const totalPossible = topicMastery.reduce((acc, curr) => acc + curr.total, 0);
  const overallMastery = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  const totalQuizzesCompleted = results.length;

  // Level & XP Progress
  const xpForCurrentLevel = (profile.level - 1) * 200;
  const xpForNextLevel = profile.level * 200;
  const levelProgress = Math.min(100, Math.max(0, 
    Math.round(((profile.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel || 200)) * 100)
  ));

  // Recent scores (last 5, sorted newest first)
  const recentScores = [...results]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Helper to resolve quiz name
  const getQuizName = (quizId: string) => {
    for (const t of topics) {
      const q = t.quizzes.find(quiz => quiz.id === quizId);
      if (q) return q.title;
    }
    return quizId.replace('adaptive-', 'Adaptive Practice: ').replace('custom-', '');
  };

  // Completed quizzes list
  const completedList = Array.from(bestScores.entries()).map(([quizId, data]) => {
    const topic = topics.find(t => t.quizzes.some(q => q.id === quizId));
    const quizTitle = getQuizName(quizId);
    const percentage = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
    return {
      quizId,
      quizTitle,
      topicTitle: topic?.title || 'General Math',
      bestScore: data.score,
      total: data.total,
      percentage,
      attempts: data.attempts,
      latestTimestamp: data.latestTimestamp,
      isMastered: percentage >= 80
    };
  }).sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());

  // Filtered completed list
  const filteredCompleted = completedList.filter(item => {
    if (completedFilter === 'mastered') return item.isMastered;
    if (completedFilter === 'needs_work') return item.percentage < 70;
    return true;
  });

  // Recommended activities logic
  const topWeakCompetency = weakCompetencies[0];

  const handleLaunchAdaptivePractice = (competencyName?: string) => {
    if (onStartAdaptivePractice) {
      onStartAdaptivePractice(competencyName);
    } else if (onStartCompetencyPractice) {
      const { quiz } = createAdaptiveQuiz(topics, { competencyName });
      onStartCompetencyPractice(quiz);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* ========================================================================= */}
      {/* 1. OVERVIEW STATS & PROGRESS BANNER                                       */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Overall Mastery Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Overall Mastery
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                overallMastery >= 90 ? 'bg-violet-100 text-violet-800' :
                overallMastery >= 75 ? 'bg-emerald-100 text-emerald-800' :
                overallMastery >= 55 ? 'bg-indigo-100 text-indigo-800' :
                overallMastery >= 35 ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {overallMastery >= 90 ? 'Expert' : overallMastery >= 75 ? 'Advanced' : overallMastery >= 55 ? 'Proficient' : overallMastery >= 35 ? 'Developing' : 'Novice'}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-slate-900">{overallMastery}%</span>
              <span className="text-xs font-semibold text-slate-400">
                {masteredCompetencies.length} / {allCompetencyNodes.length} Competencies
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>

        {/* Math Ability & Diagnostic Status Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Diagnostic Ability
              </span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icons.Brain className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-black text-slate-900 mb-1">
              {profile.mathAbility || profile.diagnosticAbility || 'Pending'}
            </div>
            <p className="text-xs text-slate-400">
              {profile.diagnosticCompleted ? 'Baseline evaluated' : 'Assessment pending'}
            </p>
          </div>

          {onRetakeDiagnostic && (
            <button
              onClick={onRetakeDiagnostic}
              className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 pt-2 border-t border-slate-100"
            >
              <Icons.RotateCcw className="w-3.5 h-3.5" />
              <span>{profile.diagnosticCompleted ? 'Retake Diagnostic' : 'Take Diagnostic'}</span>
            </button>
          )}
        </div>

        {/* Level & XP Progress Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Progress
              </span>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Level {profile.level}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-black text-slate-900">{profile.xp}</span>
              <span className="text-xs text-slate-400">/ {xpForNextLevel} XP</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {xpForNextLevel - profile.xp} XP to Level {profile.level + 1}
            </p>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Streak & Activities Done Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Streak & History
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Icons.Flame className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-2xl font-black text-slate-900">{profile.streak} Days</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">{totalQuizzesCompleted} Total Quizzes Completed</p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Completed Submissions:</span>
              <span className="font-bold text-slate-900">{totalQuizzesCompleted}</span>
            </div>
            {onOpenReports && (
              <button
                onClick={onOpenReports}
                className="w-full text-center text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 mt-1 border border-indigo-100/50 cursor-pointer"
              >
                <Icons.TrendingUp className="w-3.5 h-3.5" />
                <span>View Learning Reports</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1.5. SMART AI & MATH TOOLS CENTER                                         */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-indigo-900 via-violet-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Gemini AI Powered
              </span>
              <span className="text-xs text-indigo-200 font-medium">Grade 11 Mathematics Advanced Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Active Learning & Smart AI Hub</h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              Generate custom quizzes, solve math problems with step-by-step AI guidance, review formulas, and complete daily challenges.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 shrink-0">
            {onOpenAIQuizModal && (
              <button
                onClick={onOpenAIQuizModal}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex flex-col items-center text-center transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow">
                  <Icons.Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">AI Quiz Gen</span>
                <span className="text-[10px] text-indigo-200">Custom topics</span>
              </button>
            )}

            {onOpenAIMathSolver && (
              <button
                onClick={onOpenAIMathSolver}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex flex-col items-center text-center transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-400 text-slate-950 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow">
                  <Icons.Brain className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">AI Tutor</span>
                <span className="text-[10px] text-indigo-200">Step-by-step</span>
              </button>
            )}

            {onOpenFormulaHub && (
              <button
                onClick={onOpenFormulaHub}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex flex-col items-center text-center transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-400 text-slate-950 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow">
                  <Icons.BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Formula Hub</span>
                <span className="text-[10px] text-indigo-200">Theorems & refs</span>
              </button>
            )}

            {onOpenDailyChallenge && (
              <button
                onClick={onOpenDailyChallenge}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex flex-col items-center text-center transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow">
                  <Icons.Trophy className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Daily Challenge</span>
                <span className="text-[10px] text-indigo-200">+50 XP Bonus</span>
              </button>
            )}

            {onOpenExplainerLibrary && (
              <button
                onClick={onOpenExplainerLibrary}
                className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex flex-col items-center text-center transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-400 text-slate-950 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow">
                  <Icons.Video className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white">Explainer Videos</span>
                <span className="text-[10px] text-indigo-200">Weak-area guides</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. RECOMMENDED ACTIVITIES HUB                                             */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Icons.Sparkles className="w-6 h-6 text-indigo-600" />
              <span>Recommended Activities</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalized practice tailored to your mastery level and learning pathway
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onOpenPeerChat && (
              <button
                id="dashboard-open-peer-chat-btn"
                onClick={() => onOpenPeerChat()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Direct messaging & collaborative study chat with classmates"
              >
                <Icons.MessageSquare className="w-4 h-4" />
                <span>Classmate Chat</span>
                {unreadChatCount > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            )}

            {onOpenStudyRequests && (
              <button
                id="dashboard-open-study-requests-btn"
                onClick={onOpenStudyRequests}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Collaborative peer study requests"
              >
                <Icons.Users className="w-4 h-4 text-indigo-600" />
                <span>Study Requests</span>
                {pendingIncomingRequests.length > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {pendingIncomingRequests.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Incoming Study Request Interactive Notification Banner */}
        {pendingIncomingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                <Icons.Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                    Study Invitation
                  </span>
                  <span className="text-xs text-indigo-200">
                    {pendingIncomingRequests.length} request{pendingIncomingRequests.length > 1 ? 's' : ''} awaiting response
                  </span>
                </div>
                <h3 className="font-black text-base">
                  {pendingIncomingRequests[0].fromUserName} invited you to study "{pendingIncomingRequests[0].topicTitle}"!
                </h3>
                {pendingIncomingRequests[0].message && (
                  <p className="text-xs text-indigo-100 italic mt-0.5 line-clamp-1">
                    "{pendingIncomingRequests[0].message}"
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onStartCollaborativePractice && (
                <button
                  id="banner-accept-study-practice-btn"
                  onClick={() => onStartCollaborativePractice(pendingIncomingRequests[0])}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <Icons.Play className="w-3.5 h-3.5 fill-current" />
                  <span>Accept & Practice</span>
                </button>
              )}
              {onOpenStudyRequests && (
                <button
                  onClick={onOpenStudyRequests}
                  className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl transition-colors shadow-sm"
                >
                  View All ({pendingIncomingRequests.length})
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Accepted Outgoing Request Notification Banner */}
        {acceptedOutgoingRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
                <Icons.CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                  Partner Accepted
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">
                  {acceptedOutgoingRequests[0].toUserName} accepted your request to study {acceptedOutgoingRequests[0].topicTitle}!
                </h3>
                <p className="text-xs text-slate-500">
                  Ready for collaborative practice. Both students earn a +50 XP peer bonus!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onStartCollaborativePractice && (
                <button
                  id="banner-launch-collab-btn"
                  onClick={() => onStartCollaborativePractice(acceptedOutgoingRequests[0])}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
                >
                  <Icons.Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Practice</span>
                </button>
              )}
              {onOpenStudyRequests && (
                <button
                  onClick={onOpenStudyRequests}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors"
                >
                  Manage Requests
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Adaptive Mathematics Practice */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-indigo-100 flex items-center gap-1">
                  <Icons.TrendingUp className="w-3 h-3" /> Adaptive Algorithm
                </span>
                <span className="text-xs font-bold text-indigo-200">+250 XP</span>
              </div>
              <h3 className="text-xl font-black mb-1.5">Adaptive Math Challenge</h3>
              <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                Questions dynamically adjust difficulty in real-time based on your answers to test your exact ability band.
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={() => handleLaunchAdaptivePractice()}
                className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl text-sm hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow"
              >
                <Icons.Play className="w-4 h-4 fill-current" />
                <span>Start Adaptive Session</span>
              </button>
            </div>
            <Icons.Brain className="absolute -bottom-6 -right-6 w-36 h-36 text-indigo-700/30 pointer-events-none" />
          </div>

          {/* Card 2: Weak Area Targeted Remediation (or Next Prerequisite) */}
          {topWeakCompetency ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200/80 text-rose-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Icons.AlertTriangle className="w-3 h-3" /> Weak Area ({topWeakCompetency.masteryPercentage}%)
                  </span>
                  <span className="text-xs font-bold text-rose-600">High Priority</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  {topWeakCompetency.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {topWeakCompetency.topicTitle} • Scored below 70%. Targeted remediation will reinforce key formulas and avoid misconceptions.
                </p>
              </div>

              <button
                onClick={() => handleLaunchAdaptivePractice(topWeakCompetency.name)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow shadow-rose-200"
              >
                <Icons.Zap className="w-4 h-4" />
                <span>Practice Weak Area</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Icons.CheckCircle2 className="w-3 h-3" /> Foundations Solid
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Next Step</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Core Competency Practice</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  All foundational prerequisites are clear! Continue expanding into Tier 2 Core Competencies.
                </p>
              </div>

              <button
                onClick={() => handleLaunchAdaptivePractice('Perform operations and compositions on functions')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                <Icons.ArrowRight className="w-4 h-4" />
                <span>Advance to Core Topics</span>
              </button>
            </div>
          )}

          {/* Card 3: Active Learning Pathway or Daily Challenge */}
          {profile.activePathway ? (
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Icons.Route className="w-3 h-3" /> Step {profile.activePathway.currentStepIndex + 1} of {profile.activePathway.steps.length}
                  </span>
                  <span className="text-xs text-violet-200 font-bold">In Progress</span>
                </div>
                <h3 className="text-lg font-black mb-1">{profile.activePathway.topicTitle}</h3>
                <p className="text-xs text-violet-100 leading-relaxed mb-4 line-clamp-2">
                  {profile.activePathway.steps[profile.activePathway.currentStepIndex]?.title || 'Continue your diagnostic learning sequence.'}
                </p>
              </div>

              <button
                onClick={onStartPathway}
                className="w-full py-3 bg-white text-violet-900 font-bold rounded-xl text-sm hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
              >
                <Icons.Play className="w-4 h-4 fill-current" />
                <span>Resume Pathway</span>
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Icons.Flame className="w-3 h-3" /> Daily Challenge
                  </span>
                  <span className="text-xs font-bold text-amber-700">Double XP</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Mixed Math Sprint</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Complete 5 questions across all Grade 11 domains to maintain your daily streak and earn bonus XP.
                </p>
              </div>

              <button
                onClick={onStartChallenge}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow shadow-amber-200"
              >
                <Icons.Zap className="w-4 h-4" />
                <span>Start Daily Sprint</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5. AI SMART LEARNING RECOMMENDATIONS HUB (WEAKNESS REMEDIATION)         */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Icons.GraduationCap className="w-6 h-6 text-indigo-600" />
              <span>AI Smart Recommendations (Weakness Remediation)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalized adaptive suggestions and academic resources targeting your exact conceptual weaknesses
            </p>
          </div>
        </div>

        {computedWeaknesses.length === 0 ? (
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50/50 border border-indigo-100 rounded-3xl p-8 text-center max-w-3xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Icons.ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1.5">No Academic Weaknesses Detected!</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5 max-w-xl mx-auto">
              Outstanding work! You have maintained excellent proficiency scores across all attempted topics. Keep testing your conceptual limits via random adaptive practices or standard daily challenges.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleLaunchAdaptivePractice()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>Launch Random Adaptive Session</span>
              </button>
              {onOpenFormulaHub && (
                <button
                  onClick={onOpenFormulaHub}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Explore Formula Hub
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {computedWeaknesses.map((weakness, idx) => {
              const isCritical = weakness.score < 50;
              const matchingVideo = (() => {
                const norm = weakness.name.toLowerCase();
                if (norm.includes('limit') || norm.includes('continuity')) {
                  return { id: 'v1', title: 'Limits & Continuity Visualized in 3 Minutes' };
                }
                if (norm.includes('derivative') || norm.includes('calculus') || norm.includes('differentiat')) {
                  return { id: 'v2', title: 'The Derivative Power Rule Explained Visually' };
                }
                if (norm.includes('trig') || norm.includes('identit') || norm.includes('pythagorean')) {
                  return { id: 'v3', title: 'Trigonometric Identities: Sin²θ + Cos²θ = 1' };
                }
                if (norm.includes('sequence') || norm.includes('series') || norm.includes('arithmetic') || norm.includes('geometric')) {
                  return { id: 'v4', title: 'Arithmetic & Geometric Sequences Quick Review' };
                }
                if (norm.includes('quadratic') || norm.includes('vertex') || norm.includes('parabola')) {
                  return { id: 'v5', title: 'Quadratic Functions & Vertex Form Masterclass' };
                }
                if (norm.includes('statistics') || norm.includes('probabilit') || norm.includes('standard deviation') || norm.includes('variance')) {
                  return { id: 'v6', title: 'Standard Deviation & Variance in Statistics' };
                }
                return null;
              })();

              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-rose-100 hover:shadow-md transition-all duration-300 relative group"
                >
                  <div>
                    {/* Header: Badge & Accuracy Score */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isCritical ? 'Critical Priority' : 'Needs Review'}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        Source: <span className="text-slate-600 font-black">{weakness.source}</span>
                      </span>
                    </div>

                    {/* Title and Category */}
                    <h3 className="font-black text-slate-900 text-base mb-1 line-clamp-2" title={weakness.name}>
                      {weakness.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold mb-3 flex items-center gap-1">
                      <Icons.BookOpen className="w-3 h-3 text-indigo-500" />
                      <span>{weakness.topicTitle}</span>
                    </p>

                    {/* Progress Bar of Mastery */}
                    <div className="space-y-1 mb-5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">Mastery Level</span>
                        <span className={isCritical ? 'text-rose-600' : 'text-amber-600'}>{weakness.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${weakness.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Actionable Roadmap list */}
                    <div className="space-y-2 mb-6">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Remediation Plan:
                      </span>
                      <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                        <Icons.CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Practice with simplified items to clear common misconceptions.</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                        <Icons.CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>Review derivations step-by-step using standard visual guidelines.</span>
                      </div>
                    </div>
                  </div>

                  {/* Remediation Action Panel */}
                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <button
                      onClick={() => handleLaunchAdaptivePractice(weakness.name)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Icons.Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Adaptive Remediation</span>
                    </button>

                    {onOpenAIMathSolver && (
                      <button
                        onClick={() => onOpenAIMathSolver(`Provide a comprehensive, beginner-friendly tutorial explaining: "${weakness.name}". Please outline: 1) The core algebraic definition & equations, 2) Two detailed step-by-step examples with explanations, and 3) Three common pitfalls or misconceptions that Grade 11 students usually fall into.`)}
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Icons.Brain className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Ask AI Tutor Guide</span>
                      </button>
                    )}

                    {matchingVideo && onOpenExplainerLibrary && (
                      <button
                        onClick={onOpenExplainerLibrary}
                        className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title={`Watch matching video: "${matchingVideo.title}" in Explainer Library`}
                      >
                        <Icons.Video className="w-3.5 h-3.5 text-rose-500" />
                        <span>Watch Video Guide</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 1.8. COMPETENCY MASTERY RADAR PROFILE                                     */}
      {/* ========================================================================= */}
      {profile.competencyScores && Object.keys(profile.competencyScores).length > 0 && (
        <section className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Icons.Sigma className="w-6 h-6 text-indigo-600" />
                <span>Competency Mastery Radar</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Multi-dimensional visualization of real-time learning achievements and target areas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <MasteryChart competencyScores={profile.competencyScores} />
            </div>

            <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Icons.Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                Mathematical Insights & Analytics
              </h3>
              
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="font-semibold text-indigo-900 block">Overall Performance Matrix</span>
                  You have successfully mastered <span className="font-black text-indigo-700">{masteredCompetencies.length}</span> out of <span className="font-bold">{allCompetencyNodes.length}</span> core Grade 11 math competencies.
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="font-semibold text-emerald-900 block">Current Mastery Index</span>
                  Your mathematical ability index is currently estimated at <span className="font-black text-emerald-700">{overallMastery}%</span> accuracy across all active quiz assessments.
                </div>

                {weakCompetencies.length > 0 && (
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <span className="font-semibold text-rose-900 block">Target Improvement Vector</span>
                    Consider prioritizing <span className="font-black text-rose-700">{weakCompetencies[0].name}</span> in your next adaptive session to balance your profile.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. WEAK AREAS (IF ANY)                                                    */}
      {/* ========================================================================= */}
      {weakCompetencies.length > 0 && (
        <section className="bg-rose-50/70 rounded-3xl p-6 border border-rose-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-800">
              <Icons.TrendingDown className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold">Weak Areas & Misconceptions</h3>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
              {weakCompetencies.length} Competencies Need Review
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakCompetencies.map(node => (
              <div 
                key={node.id}
                className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {node.topicTitle}
                    </span>
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {node.masteryPercentage}%
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{node.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {node.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleLaunchAdaptivePractice(node.name)}
                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-rose-200"
                  >
                    <Icons.RotateCcw className="w-3.5 h-3.5" />
                    <span>Practice</span>
                  </button>
                  {onOpenPeerChat ? (
                    <button
                      onClick={() => onOpenPeerChat(undefined, node.topicId)}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 border border-indigo-200"
                      title="Open peer chat and propose practicing this topic"
                    >
                      <Icons.MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Chat & Study</span>
                    </button>
                  ) : onSendStudyRequest ? (
                    <button
                      onClick={() => onSendStudyRequest(node.topicId)}
                      className="px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 border border-slate-200"
                      title="Invite a classmate to study this topic together"
                    >
                      <Icons.Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Study Partner</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. VISUAL KNOWLEDGE MAP (COMPETENCY MASTERY NETWORK)                      */}
      {/* ========================================================================= */}
      {/* Knowledge Map removed */}

      {/* ========================================================================= */}
      {/* 5. COMPETENCY MASTERY BREAKDOWN (IF TOGGLED OR EXPANDED)                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeTab === 'competencies' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Competency Mastery Matrix</h3>
                <p className="text-xs text-slate-400">All Grade 11 learning competencies with mastery percentages and practice links</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {masteredCompetencies.length} of {allCompetencyNodes.length} Mastered
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {allCompetencyNodes.map(node => (
                <div 
                  key={node.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>{node.tierLabel}</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        node.status === 'mastered' ? 'bg-emerald-100 text-emerald-800' :
                        node.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' :
                        node.status === 'needs_review' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {node.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1">{node.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{node.description}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Mastery</span>
                      <span className="text-slate-900">{node.masteryPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full ${
                          node.masteryPercentage >= 80 ? 'bg-emerald-500' :
                          node.masteryPercentage >= 50 ? 'bg-indigo-600' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${node.masteryPercentage}%` }}
                      />
                    </div>

                    <button
                      onClick={() => handleLaunchAdaptivePractice(node.name)}
                      className="w-full py-2 bg-white hover:bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Icons.Play className="w-3 h-3 fill-current" />
                      <span>Practice Competency</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. CURRICULUM UNITS & MODULES GRID                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Curriculum Units</h2>
              <p className="text-sm text-slate-500">Grade 11 Mathematics core modules and lessons</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {topics.length} Units Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {topicMastery.map(({ topic, percentage, completedQuizzes, totalQuizzes }, index) => {
              const IconComponent = (Icons as any)[topic.icon] || Icons.Book;
              return (
                <motion.button
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectTopic(topic)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {completedQuizzes > 0 && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        percentage >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {percentage}% Mastered
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{topic.title}</h3>
                  <div className="h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-400' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {completedQuizzes} / {totalQuizzes} Quizzes Completed
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icons.ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. RECENT SCORES & COMPLETED ACTIVITIES SIDEBAR                           */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          {/* Recent Scores Card */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Recent Scores</h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Latest 5</span>
            </div>
            
            {recentScores.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                No recent scores recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentScores.map((score, i) => {
                  const percent = Math.round((score.score / score.total) * 100);
                  const isPerfect = percent === 100;
                  return (
                    <div key={i} className="p-3 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div className="overflow-hidden mr-2">
                        <div className="font-bold text-slate-900 text-sm truncate">
                          {getQuizName(score.quizId)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(score.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-black ${
                          isPerfect ? 'text-amber-500' : percent >= 70 ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                          {percent}%
                        </span>
                        {((score as any).violations || 0) > 0 && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-1.5 py-0.5 rounded-full" title={`Violations: ${(score as any).violations}`}>
                            !
                          </span>
                        )}

                        {onRetakeQuiz && (
                          <button
                            onClick={() => onRetakeQuiz(score.quizId)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Retake Quiz"
                          >
                            <Icons.RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Completed Activities Quick Hub */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Completed Activities</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {completedList.length}
              </span>
            </div>

            {completedList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                Take your first quiz or practice session to view completed history!
              </div>
            ) : (
              <div className="space-y-3">
                {completedList.slice(0, 4).map(item => (
                  <div key={item.quizId} className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="truncate mr-2">
                      <div className="font-bold text-slate-800 text-xs truncate">{item.quizTitle}</div>
                      <div className="text-[10px] text-slate-400">
                        Best: {item.bestScore}/{item.total} ({item.percentage}%) • {item.attempts} attempt{item.attempts > 1 ? 's' : ''}
                      </div>
                    </div>

                    {onRetakeQuiz && (
                      <button
                        onClick={() => onRetakeQuiz(item.quizId)}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Icons.RotateCcw className="w-3 h-3" />
                        <span>Retake</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </motion.div>
  );
}
