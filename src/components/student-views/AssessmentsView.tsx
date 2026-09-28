import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  FileText, 
  Award, 
  PieChart, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  ListChecks,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Zap,
  Trophy,
  Compass
} from 'lucide-react';
import { Topic, QuizResult, UserProfile, Quiz, SummativeAssessment, isValidatedOrActive } from '../../types';
import { getIntegritySettings } from '../../lib/integritySettings';
import StudentViolationReportModal from '../StudentViolationReportModal';
import QuizResultReviewModal from '../QuizResultReviewModal';

type AssessmentTabType = 'quizzes' | 'exams' | 'results' | 'quarterly' | 'performance' | 'written' | 'oral' | 'authentic';

interface AssessmentsViewProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  initialTab?: AssessmentTabType;
  onStartQuiz: (quiz: Quiz, mode?: 'diagnostic' | 'assessment') => void;
  onStartSummativeAssessment?: (assessment: SummativeAssessment) => void;
  onOpenPerformanceModal?: () => void;
}

export default function AssessmentsView({
  topics,
  results,
  profile,
  initialTab = 'quizzes',
  onStartQuiz,
  onStartSummativeAssessment,
  onOpenPerformanceModal
}: AssessmentsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<AssessmentTabType>(initialTab);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedResultForReview, setSelectedResultForReview] = useState<QuizResult | null>(null);

  const isQ1Deleted = typeof window !== 'undefined' && localStorage.getItem('mathquest_default_q1_deleted') === 'true';
  const isQ2Deleted = typeof window !== 'undefined' && localStorage.getItem('mathquest_default_q2_deleted') === 'true';
  const isPerformanceDeleted = typeof window !== 'undefined' && localStorage.getItem('mathquest_default_performance_deleted') === 'true';
  const isWrittenDeleted = typeof window !== 'undefined' && localStorage.getItem('mathquest_default_written_deleted') === 'true';
  const isOralDeleted = typeof window !== 'undefined' && localStorage.getItem('mathquest_default_oral_deleted') === 'true';
  const isAuthenticDeleted = typeof window !== 'undefined' && localStorage.getItem('mathquest_default_authentic_deleted') === 'true';

  const deletedSummativeExamIds: string[] = (() => {
    try {
      const cached = localStorage.getItem('mathquest_deleted_summative_exam_ids');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  })();

  // Filter topics
  const displayedTopics = topics.filter(t => {
    if (selectedTopicId === 'all') return true;
    return t.id === selectedTopicId;
  });

  // Collect all summative assessments
  const summativeExams: { topic: Topic; exam: SummativeAssessment; isCompleted: boolean; bestScore?: number }[] = [];
  topics.forEach(topic => {
    if (topic.summativeAssessment && !deletedSummativeExamIds.includes(topic.summativeAssessment.id)) {
      const match = results.find(r => r.quizId === topic.summativeAssessment?.id);
      summativeExams.push({
        topic,
        exam: topic.summativeAssessment,
        isCompleted: !!match,
        bestScore: match ? Math.round((match.score / match.total) * 100) : undefined
      });
    }
  });

  // Calculate assessment statistics
  const totalAttempts = results.length;
  const passedAttempts = results.filter(r => (r.score / r.total) >= 0.75).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-violet-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-violet-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>Assessment & Testing Hub</span>
            </span>
            <span className="bg-white/10 text-violet-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              DepEd Assessment Standards
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Assessments & Examinations</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Take formative competency quizzes, challenge DepEd Table of Specifications (TOS) summative exams, and review comprehensive scorecards.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-2 border-t border-white/10 mt-3">
            <span className="text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {passedAttempts} / {totalAttempts} Passed ({passRate}% Pass Rate)
            </span>
            <span className="text-amber-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {summativeExams.filter(e => e.isCompleted).length} / {summativeExams.length} Summative Exams Completed
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'quizzes'
              ? 'bg-white text-indigo-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Formative Quizzes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'exams'
              ? 'bg-white text-violet-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>Summative Exams (TOS)</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black">
            {summativeExams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'results'
              ? 'bg-white text-emerald-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-4 h-4 text-emerald-500" />
          <span>My Results & Analytics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quarterly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'quarterly' ? 'bg-white text-amber-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Quarterly Assessment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('performance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'performance' ? 'bg-white text-emerald-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-emerald-500" />
          <span>Performance Assessment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('written')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'written' ? 'bg-white text-blue-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Written Assessment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('oral')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'oral' ? 'bg-white text-teal-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span>Oral Assessment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('authentic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'authentic' ? 'bg-white text-rose-900 shadow-sm font-extrabold border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-rose-500" />
          <span>Authentic Assessment</span>
        </button>
      </div>

      {/* Diagnostic Quick Banner Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
              Grade 11 Diagnostic
            </span>
            <span className="text-xs font-bold text-slate-700">General Mathematics • Quarter 1: Functions</span>
          </div>
          <h3 className="text-base font-black text-slate-900">
            "Before starting this lesson, let's find out what you already know."
          </h3>
          <p className="text-xs text-slate-500">
            10–15 Items • Prior Knowledge & Skill Gap Diagnosis • Adaptive Learning Pathway
          </p>
        </div>

        <button
          onClick={() => {
            const firstTopic = topics[0];
            const firstQuiz = firstTopic?.quizzes[0];
            if (firstQuiz) {
              onStartQuiz(firstQuiz, 'diagnostic');
            }
          }}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Start Diagnostic Assessment</span>
        </button>
      </div>

      {/* 1. FORMATIVE QUIZZES */}
      {/* 4. QUARTERLY ASSESSMENT */}
      {activeSubTab === 'quarterly' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white p-6 rounded-3xl shadow-lg space-y-2">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              DepEd Standardized Examination
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Quarterly Assessment (Quarter 1 & 2 Comprehensive)</h2>
            <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
              Official DepEd summative quarterly examinations covering all core General Mathematics competencies, functions, rational expressions, and financial math.
            </p>
          </div>
          {isQ1Deleted && isQ2Deleted ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-bold text-sm">
              📭 No quarterly assessments are currently assigned to you.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!isQ1Deleted && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full">Quarter 1 Examination</span>
                    <span className="text-xs font-bold text-slate-500">40 Items • 60 Mins</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">General Mathematics Quarter 1 Comprehensive Exam</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Covers functions, rational functions, one-to-one functions, inverse functions, and exponential/logarithmic equations.
                  </p>
                  <button
                    onClick={() => {
                      const t = topics[0];
                      if (t && t.summativeAssessment) {
                        onStartSummativeAssessment && onStartSummativeAssessment(t.summativeAssessment);
                      } else if (t && t.quizzes[0]) {
                        onStartQuiz(t.quizzes[0], 'assessment');
                      }
                    }}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Take Quarter 1 Examination</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!isQ2Deleted && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full">Quarter 2 Examination</span>
                    <span className="text-xs font-bold text-slate-500">40 Items • 60 Mins</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">General Mathematics Quarter 2 Comprehensive Exam</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Covers simple & compound interest, annuities, stocks, bonds, business loans, and consumer mathematics.
                  </p>
                  <button
                    onClick={() => {
                      const t = topics[1] || topics[0];
                      if (t && t.quizzes[0]) {
                        onStartQuiz(t.quizzes[0], 'assessment');
                      }
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Take Quarter 2 Examination</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. PERFORMANCE ASSESSMENT */}
      {activeSubTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 rounded-3xl shadow-lg space-y-2">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              DepEd Performance Tasks (PT)
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Performance Assessment Tasks</h2>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              Output-based performance tasks evaluating real-world mathematical modeling, function sketching portfolios, and financial investment plans.
            </p>
          </div>

          <div className="space-y-4">
            {isPerformanceDeleted ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-bold text-sm">
                📭 No performance tasks are currently assigned to you.
              </div>
            ) : (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">Task #1 (30% of Grade)</span>
                  <span className="text-xs font-bold text-slate-500">Due: End of Quarter</span>
                </div>
                <h3 className="text-base font-black text-slate-900">Real-World Mathematical Modeling Portfolio</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Construct a comprehensive function model representing real-world population growth or business cost functions, complete with graphical analysis and interpretations.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onOpenPerformanceModal && onOpenPerformanceModal()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                  >
                    View Rubric & Submit Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. WRITTEN ASSESSMENT */}
      {activeSubTab === 'written' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white p-6 rounded-3xl shadow-lg space-y-2">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Written Works (WW)
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Written Assessment Exercises</h2>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              Step-by-step problem sets, algebraic proofs, equation solving, and formula derivation exercises.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">Available Written Problem Sets</h3>
            {isWrittenDeleted ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-bold text-xs">
                📭 No written assessment exercises are currently assigned to you.
              </div>
            ) : (
              <div className="space-y-3">
                {topics.slice(0, 3).map((t, idx) => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Written Work #{idx + 1}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{t.title} Problem Set</h4>
                      <p className="text-xs text-slate-500">{t.quizzes.length} Exercises • Computation & Proofs</p>
                    </div>
                    <button
                      onClick={() => {
                        if (t.quizzes[0]) onStartQuiz(t.quizzes[0], 'standard');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      Start Written Task
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. ORAL ASSESSMENT */}
      {activeSubTab === 'oral' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-800 text-white p-6 rounded-3xl shadow-lg space-y-2">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Oral Recitation & Defense
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Oral Assessment Tasks</h2>
            <p className="text-xs text-teal-100 max-w-2xl leading-relaxed">
              Interactive conceptual defense prompts and oral problem explanations evaluated by AI rubric or teacher review.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            {isOralDeleted ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-bold text-xs">
                📭 No oral recitation defense prompts are currently assigned to you.
              </div>
            ) : (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                <h3 className="font-black text-teal-900 text-sm">Oral Prompt: Explain the Vertical Line Test</h3>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Record your explanation or type a detailed conceptual defense of why the vertical line test determines whether a relation is a function.
                </p>
                <button
                  onClick={() => alert("Oral Assessment prompt activated! You can record or explain your reasoning.")}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  Start Oral Defense Prompt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. AUTHENTIC ASSESSMENT */}
      {activeSubTab === 'authentic' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-600 to-pink-800 text-white p-6 rounded-3xl shadow-lg space-y-2">
            <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Authentic Real-World Tasks
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Authentic Assessment</h2>
            <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
              Contextualized real-world mathematical scenarios reflecting authentic community problems, consumer finance, and exponential spread modeling.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            {isAuthenticDeleted ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-bold text-xs">
                📭 No authentic contextualized tasks are currently assigned to you.
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <h3 className="font-black text-rose-900 text-sm">Scenario: Opening a Small Business & Compound Interest Investment</h3>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Calculate the optimal loan repayment schedule and investment growth for a local cooperative using exponential and logarithmic compound interest models.
                </p>
                <button
                  onClick={() => {
                    const t = topics[0];
                    if (t && t.quizzes[0]) onStartQuiz(t.quizzes[0], 'assessment');
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  Launch Authentic Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Filter by Topic:
            </span>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Units ({topics.length})</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {displayedTopics.map(topic => (
              <div key={topic.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {topic.term} • {topic.week}
                    </span>
                    <h3 className="text-base font-black text-slate-900">{topic.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {topic.quizzes.length} Quizzes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {topic.quizzes.map(quiz => {
                    const activeCount = quiz.problems.filter(isValidatedOrActive).length;
                    const match = results.find(r => r.quizId === quiz.id);

                    return (
                      <div
                        key={quiz.id}
                        className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              +{quiz.xpReward} XP
                            </span>
                            {match && (
                              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                Best: {match.score}/{match.total}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{quiz.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{quiz.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
                          <button
                            onClick={() => onStartQuiz(quiz, 'diagnostic')}
                            className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Target className="w-3.5 h-3.5 text-amber-600" />
                            <span>Diagnostic (Hints)</span>
                          </button>
                          <button
                            onClick={() => onStartQuiz(quiz, 'assessment')}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Assessment (Test)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SUMMATIVE EXAMS (TABLE OF SPECIFICATIONS) */}
      {activeSubTab === 'exams' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                DepEd Table of Specifications (TOS) Format
              </h4>
              <p className="text-xs text-amber-900">
                Summative examinations test across Bloom's Taxonomy (Remembering, Understanding, Applying, Analyzing, Evaluating) with a 75%–80% proficiency benchmark.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {summativeExams.map(({ topic, exam, isCompleted, bestScore }) => (
              <div
                key={exam.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-violet-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-violet-100 text-violet-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md">
                      {topic.term} Summative Exam
                    </span>
                    {isCompleted ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Completed ({bestScore}%)
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Pending Exam
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{exam.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{exam.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 pt-1">
                    <span className="flex items-center gap-1 text-slate-500">
                      <ListChecks className="w-3.5 h-3.5 text-indigo-500" />
                      {exam.problems.length} Assessment Items
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {exam.durationMinutes} Minutes
                    </span>
                    <span>•</span>
                    <span className="text-amber-600">+{exam.xpReward} XP</span>
                    <span>•</span>
                    <span className="text-emerald-700">Benchmark: {exam.passingScorePercentage}%</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {onStartSummativeAssessment && (
                    <button
                      onClick={() => onStartSummativeAssessment(exam)}
                      className="w-full md:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{isCompleted ? 'Retake Exam' : 'Take Summative Exam'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MY RESULTS & ANALYTICS */}
      {activeSubTab === 'results' && (() => {
        const integritySettings = getIntegritySettings();
        const deductionRate = integritySettings.violationDeductionPoints;
        const diagViolations = profile.diagnosticViolations || 0;
        const formativeViolations = results.reduce((sum, r) => sum + (r.violations || 0), 0) || (profile.formativeViolations || 0);
        const totalViolations = diagViolations + formativeViolations;
        const totalDeductedPoints = totalViolations * deductionRate;

        // Diagnostic raw score check
        const diagnosticRaw = profile.diagnosticScores?.['general'] ?? (profile.diagnosticCompleted ? 12 : null);

        return (
          <div className="space-y-6">
            {/* Academic Integrity & Violation Summary Banner */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 shrink-0">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      Academic Integrity & Violation Tracking
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-extrabold">
                        Universal Rate: -{deductionRate} pt(s) / violation
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitors tab-outs and focus losses during assessments. Points are automatically deducted according to your teacher's universal penalty rate.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Violations</span>
                      <span className="text-xl font-black text-rose-400">{totalViolations} Tab-Outs</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800 mx-1" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Score Deducted</span>
                      <span className="text-xl font-black text-amber-400">-{totalDeductedPoints} Pts</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>View Alt-Tab Activity Log</span>
                  </button>
                </div>
              </div>

              {/* Individual Violation Counts per Assessment Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block">Diagnostic Violations</span>
                    <span className="text-[10px] text-slate-400">Tab-outs during baseline test</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-400 text-sm block">{diagViolations} Violation{diagViolations !== 1 ? 's' : ''}</span>
                    <span className="text-[10px] text-slate-400 font-mono">-{diagViolations * deductionRate} Points</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block">Formative Check Violations</span>
                    <span className="text-[10px] text-slate-400">Tab-outs during topic quizzes</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-400 text-sm block">{formativeViolations} Violation{formativeViolations !== 1 ? 's' : ''}</span>
                    <span className="text-[10px] text-slate-400 font-mono">-{formativeViolations * deductionRate} Points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Assessment Detailed Score Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Diagnostic Assessment Score & Violations</h3>
                    <p className="text-xs text-slate-400">Prior knowledge baseline check & academic integrity record</p>
                  </div>
                </div>
                {profile.diagnosticCompleted ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-200/60">
                    Pending Diagnostic
                  </span>
                )}
              </div>

              {diagnosticRaw !== null ? (() => {
                const diagTotal = 15;
                const diagDeduction = diagViolations * deductionRate;
                const netDiagScore = Math.max(0, diagnosticRaw - diagDeduction);
                const netDiagPct = Math.round((netDiagScore / diagTotal) * 100);

                return (
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block">
                        General Mathematics Diagnostic Baseline
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">Quarter 1 Functions & Competencies Check</h4>
                      <p className="text-xs text-slate-500">
                        Diagnosis: <strong className="text-slate-800">{profile.diagnosticAbility || 'Proficient - Grade 11 Ready'}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Violations Recorded</span>
                      <span className="text-base font-black text-rose-600 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {diagViolations} ({diagDeduction > 0 ? `-${diagDeduction} pts` : 'No Penalty'})
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Adjusted Score</span>
                      <span className="text-lg font-black text-slate-900 block">
                        {netDiagScore} / {diagTotal} <span className="text-xs font-bold text-indigo-600">({netDiagPct}%)</span>
                      </span>
                    </div>
                  </div>
                );
              })() : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">You haven't completed the Diagnostic Assessment yet.</p>
                </div>
              )}
            </div>

            {/* Formative Assessments Scorecard & Roster */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Formative Assessment Scorecards</h3>
                    <p className="text-xs text-slate-400">Individual scores, logged violations, and adjusted final grades</p>
                  </div>
                </div>
                {onOpenPerformanceModal && (
                  <button
                    onClick={onOpenPerformanceModal}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Deep Analytics
                  </button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900">No Formative Records Yet</h4>
                  <p className="text-xs text-slate-500">Take a formative quiz to record your first score!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {results.map((res, idx) => {
                    const quizViolations = res.violations || 0;
                    const quizDeduction = quizViolations * deductionRate;
                    const rawScore = res.score;
                    const netScore = Math.max(0, rawScore - quizDeduction);
                    const percent = res.total > 0 ? Math.round((netScore / res.total) * 100) : 0;
                    const isPassed = percent >= 75;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedResultForReview(res)}
                        className="p-4 bg-slate-50/80 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 hover:border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all cursor-pointer group"
                        title="Click to review question item breakdown and explanations"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 group-hover:text-indigo-900 text-sm transition-colors">
                              {res.quizId.replace('custom-', '').replace('adaptive-', 'Adaptive: ')}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                              {res.quizMode || 'Formative'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Completed {new Date(res.timestamp).toLocaleDateString()} at {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-indigo-600 font-bold group-hover:underline">• Click to Review Solutions</span>
                          </p>
                        </div>

                        {/* Violations & Deductions Badge */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-center min-w-[110px]">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Violations</span>
                            {quizViolations > 0 ? (
                              <span className="text-xs font-black text-rose-600 flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {quizViolations} (-{quizDeduction} pts)
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Clean (0)
                              </span>
                            )}
                          </div>

                          <div className="text-right min-w-[100px]">
                            <span className="font-black text-slate-900 text-base block">
                              {netScore}/{res.total}
                            </span>
                            <span className={`text-[10px] font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {percent}% ({isPassed ? 'Passed' : 'Needs Review'})
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
      {/* Student Violation Report Modal */}
      <StudentViolationReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        student={profile}
      />

      {/* Quiz Result Review Modal */}
      <QuizResultReviewModal
        isOpen={!!selectedResultForReview}
        onClose={() => setSelectedResultForReview(null)}
        result={selectedResultForReview}
        topics={topics}
      />
    </div>
  );
}
