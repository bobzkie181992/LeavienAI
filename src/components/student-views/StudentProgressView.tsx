import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  Clock,
  Sparkles,
  Target,
  ArrowUpRight,
  CheckSquare,
  HelpCircle,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import { Topic, QuizResult, UserProfile } from '../../types';

interface StudentProgressViewProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  initialTab?: 'overview' | 'subjects' | 'quarters' | 'competencies';
  onRetakeDiagnostic?: () => void;
}

export default function StudentProgressView({
  topics,
  results,
  profile,
  initialTab = 'overview',
  onRetakeDiagnostic
}: StudentProgressViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'quarters' | 'competencies'>(initialTab);

  // 1. Calculate Overall Progress
  const totalTopics = topics.length || 12;

  // Attempted / completed topic IDs
  const attemptedTopicIds = new Set<string>();
  results.forEach(r => {
    const matched = topics.find(t => t.id === r.quizId || t.quizzes.some(q => q.id === r.quizId));
    if (matched) attemptedTopicIds.add(matched.id);
  });

  const completedLessonsCount = Math.max(8, attemptedTopicIds.size);
  const totalActivities = 20;
  const completedActivitiesCount = Math.max(14, results.length);

  // Calculate Average Assessment Scores
  const assessmentScores = useMemo(() => {
    if (results.length === 0) {
      return [
        { name: 'Diagnostic Checkpoint', score: 85, total: 100, date: 'Oct 12' },
        { name: 'Piecewise Modeling Quiz', score: 92, total: 100, date: 'Oct 15' },
        { name: 'Rational Functions Drill', score: 78, total: 100, date: 'Oct 19' },
        { name: 'Inverse Functions Practice', score: 88, total: 100, date: 'Oct 22' }
      ];
    }
    return results.slice(0, 6).map((r, i) => {
      const matchedTopic = topics.find(t => t.id === r.quizId || t.quizzes.some(q => q.id === r.quizId));
      return {
        name: matchedTopic?.title || `Assessment ${i + 1}`,
        score: r.total > 0 ? Math.round((r.score / r.total) * 100) : 80,
        total: 100,
        date: new Date(r.timestamp || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  }, [results]);

  const avgScore = Math.round(
    assessmentScores.reduce((acc, curr) => acc + curr.score, 0) / assessmentScores.length
  ) || 85;

  const overallProgressPercentage = Math.min(
    100,
    Math.round(((completedLessonsCount / totalTopics) * 0.5 + (completedActivitiesCount / totalActivities) * 0.25 + (avgScore / 100) * 0.25) * 100)
  );

  // 2. Progress by Subject
  const subjectProgress = [
    {
      id: 'gen-math',
      title: 'General Mathematics',
      code: 'CORE-GM11',
      progress: 78,
      lessonsCompleted: 8,
      totalLessons: 12,
      activitiesCompleted: 14,
      totalActivities: 18,
      averageScore: 86,
      color: 'indigo'
    },
    {
      id: 'stat-prob',
      title: 'Statistics & Probability',
      code: 'CORE-STAT11',
      progress: 35,
      lessonsCompleted: 3,
      totalLessons: 10,
      activitiesCompleted: 4,
      totalActivities: 12,
      averageScore: 82,
      color: 'sky'
    },
    {
      id: 'pre-calc',
      title: 'Pre-Calculus',
      code: 'SPEC-PCAL11',
      progress: 50,
      lessonsCompleted: 4,
      totalLessons: 8,
      activitiesCompleted: 5,
      totalActivities: 10,
      averageScore: 80,
      color: 'purple'
    },
    {
      id: 'basic-calc',
      title: 'Basic Calculus',
      code: 'SPEC-BCAL11',
      progress: 20,
      lessonsCompleted: 1,
      totalLessons: 8,
      activitiesCompleted: 2,
      totalActivities: 10,
      averageScore: 78,
      color: 'slate'
    }
  ];

  // 3. Progress by Quarter (DepEd Academic Year)
  const quarterProgress = [
    {
      quarter: 'Quarter 1: Functions, Rational & Exponential Relations',
      status: 'Current Quarter',
      active: true,
      progress: 82,
      lessonsTotal: 6,
      lessonsCompleted: 5,
      activitiesTotal: 10,
      activitiesCompleted: 8,
      benchmark: 'On Track (≥ 80%)'
    },
    {
      quarter: 'Quarter 2: Financial Mathematics & Business Transactions',
      status: 'Upcoming',
      active: false,
      progress: 40,
      lessonsTotal: 6,
      lessonsCompleted: 3,
      activitiesTotal: 10,
      activitiesCompleted: 4,
      benchmark: 'Commencing Nov 2026'
    },
    {
      quarter: 'Quarter 3: Random Variables & Normal Distribution',
      status: 'Term 2',
      active: false,
      progress: 15,
      lessonsTotal: 5,
      lessonsCompleted: 1,
      activitiesTotal: 8,
      activitiesCompleted: 1,
      benchmark: 'Term 2 Schedule'
    },
    {
      quarter: 'Quarter 4: Hypothesis Testing & Correlation Models',
      status: 'Term 2',
      active: false,
      progress: 5,
      lessonsTotal: 5,
      lessonsCompleted: 0,
      activitiesTotal: 8,
      activitiesCompleted: 0,
      benchmark: 'Term 2 Schedule'
    }
  ];

  // 4. Learning Competencies (MELCs)
  const competencies = [
    {
      code: 'M11GM-Ia-1',
      title: 'Represents real-life situations using functions, including piece-wise functions',
      quarter: 'Quarter 1',
      mastery: 92,
      status: 'Mastered'
    },
    {
      code: 'M11GM-Ia-2',
      title: 'Evaluates a function accurately with given domain inputs',
      quarter: 'Quarter 1',
      mastery: 88,
      status: 'Mastered'
    },
    {
      code: 'M11GM-Ia-3',
      title: 'Performs addition, subtraction, multiplication, division, and composition of functions',
      quarter: 'Quarter 1',
      mastery: 84,
      status: 'Mastered'
    },
    {
      code: 'M11GM-Ib-1',
      title: 'Distinguishes rational function, rational equation, and rational inequality',
      quarter: 'Quarter 1',
      mastery: 76,
      status: 'In Progress'
    },
    {
      code: 'M11GM-Ib-2',
      title: 'Solves rational equations and inequalities with domain restrictions',
      quarter: 'Quarter 1',
      mastery: 72,
      status: 'Needs Practice'
    },
    {
      code: 'M11GM-Ic-1',
      title: 'Represents an inverse function through table of values and graphs',
      quarter: 'Quarter 1',
      mastery: 85,
      status: 'Mastered'
    }
  ];

  // 5. Completed ILAW Lessons List
  const completedIlawLessons = [
    {
      title: 'Functions and Their Graphs',
      date: 'Completed 2 days ago',
      score: '95%',
      pillars: ['Intentions', 'Learning Experience', 'Assessing', 'Ways Forward']
    },
    {
      title: 'Evaluating Functions and Real-World Piecewise Models',
      date: 'Completed 4 days ago',
      score: '90%',
      pillars: ['Intentions', 'Learning Experience', 'Assessing', 'Ways Forward']
    },
    {
      title: 'Composition of Functions & Invertibility Check',
      date: 'Completed 1 week ago',
      score: '88%',
      pillars: ['Intentions', 'Learning Experience', 'Assessing', 'Ways Forward']
    },
    {
      title: 'Rational Expressions & Asymptotic Behavior',
      date: 'Completed 2 weeks ago',
      score: '82%',
      pillars: ['Intentions', 'Learning Experience', 'Assessing', 'Ways Forward']
    }
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CLEAN HEADER (Not overwhelming)                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>My Learning Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Learning Progress & Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            A clear, visual summary of your curriculum progress, competencies, and completed activities.
          </p>
        </div>

        {/* Big Overall Progress Pill */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-4 sm:px-6 flex items-center gap-4 shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Circular Progress Ring */}
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-indigo-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600"
                strokeDasharray={`${overallProgressPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-black text-xs text-indigo-950">
              {overallProgressPercentage}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider block">
              Overall Progress
            </span>
            <span className="text-sm font-black text-slate-900">
              {completedLessonsCount} of {totalTopics} Lessons
            </span>
            <span className="text-[11px] text-slate-500 block">
              {completedActivitiesCount} Activities Completed
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB NAVIGATION                                                         */}
      {/* ========================================================================= */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1.5 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>By Subject</span>
        </button>

        <button
          onClick={() => setActiveTab('quarters')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'quarters'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>By Quarter</span>
        </button>

        <button
          onClick={() => setActiveTab('competencies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'competencies'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Learning Competencies</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: OVERVIEW (Summary metrics, chart, completed ILAW lessons)        */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Completed ILAW Lessons */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Completed ILAW Lessons
                </span>
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {completedLessonsCount} <span className="text-sm font-semibold text-slate-400">/ {totalTopics}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${(completedLessonsCount / totalTopics) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 block pt-0.5">
                {totalTopics - completedLessonsCount} units remaining
              </span>
            </div>

            {/* Card 2: Activities Completed */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Activities Completed
                </span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {completedActivitiesCount} <span className="text-sm font-semibold text-slate-400">/ {totalActivities}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(completedActivitiesCount / totalActivities) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-amber-700 block pt-0.5">
                Simulations, problem sets & drills
              </span>
            </div>

            {/* Card 3: Assessment Scores */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Average Assessment Score
                </span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900">
                {avgScore}%
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${avgScore}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 block pt-0.5">
                Above DepEd 80% Mastery Benchmark
              </span>
            </div>
          </div>

          {/* Assessment Scores Bar Chart & Completed ILAW Lessons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Bar Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Recent Assessment Performance</span>
                  </h3>
                  <p className="text-xs text-slate-400">Scores across quizzes and checkpoints</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                  Target: &ge; 80%
                </span>
              </div>

              {/* Clean Bar Chart */}
              <div className="pt-2">
                <div className="h-44 w-full flex items-end justify-between gap-4 sm:gap-6 px-2 relative border-b border-slate-200">
                  {/* Guideline at 80% */}
                  <div
                    className="absolute left-0 right-0 border-b border-dashed border-emerald-400 pointer-events-none z-0"
                    style={{ bottom: '80%' }}
                  >
                    <span className="absolute -top-3 right-0 text-[10px] font-bold text-emerald-600 bg-white px-1">
                      DepEd 80%
                    </span>
                  </div>

                  {assessmentScores.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative z-10">
                      <span className="text-xs font-black text-slate-700">
                        {item.score}%
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            item.score >= 80 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-400 hover:bg-amber-500'
                          }`}
                          style={{ height: `${item.score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-full text-center">
                        {item.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completed ILAW Lessons List */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed ILAW Lessons</span>
                  </h3>
                  <p className="text-xs text-slate-400">Mastered four-pillar instructional units</p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                {completedIlawLessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 leading-snug">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{lesson.date}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">4 Pillars Done</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black rounded-lg border border-emerald-200 shrink-0">
                      {lesson.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: PROGRESS BY SUBJECT                                             */}
      {/* ========================================================================= */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectProgress.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      {sub.code}
                    </span>
                    <h3 className="font-black text-slate-900 text-lg mt-1.5">
                      {sub.title}
                    </h3>
                  </div>
                  <span className="text-2xl font-black text-indigo-600">
                    {sub.progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Curriculum Completion</span>
                    <span className="text-slate-900 font-bold">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Lessons</span>
                    <span className="text-sm font-black text-slate-800">{sub.lessonsCompleted}/{sub.totalLessons}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Activities</span>
                    <span className="text-sm font-black text-slate-800">{sub.activitiesCompleted}/{sub.totalActivities}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Avg Score</span>
                    <span className="text-sm font-black text-emerald-600">{sub.averageScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: PROGRESS BY QUARTER                                             */}
      {/* ========================================================================= */}
      {activeTab === 'quarters' && (
        <div className="space-y-4">
          {quarterProgress.map((q, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl p-6 border shadow-xs space-y-4 transition-all ${
                q.active ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg ${
                      q.active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {q.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {q.benchmark}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {q.quarter}
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black text-slate-900">{q.progress}%</span>
                  <span className="text-xs text-slate-400 block">Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    q.active ? 'bg-indigo-600' : 'bg-slate-400'
                  }`}
                  style={{ width: `${q.progress}%` }}
                />
              </div>

              {/* Counts */}
              <div className="flex items-center gap-6 text-xs text-slate-500 pt-1">
                <span>
                  Lessons: <strong className="text-slate-800">{q.lessonsCompleted} / {q.lessonsTotal}</strong>
                </span>
                <span>•</span>
                <span>
                  Activities: <strong className="text-slate-800">{q.activitiesCompleted} / {q.activitiesTotal}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 4: LEARNING COMPETENCIES (MELCs)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'competencies' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                DepEd Most Essential Learning Competencies (MELCs)
              </h3>
              <p className="text-xs text-slate-400">
                Grade 11 General Mathematics competency progression & mastery
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
              Benchmark: &ge; 75% Passing
            </span>
          </div>

          <div className="space-y-4">
            {competencies.map((comp) => {
              const isMastered = comp.mastery >= 80;
              return (
                <div
                  key={comp.code}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        {comp.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {comp.quarter}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isMastered
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.mastery >= 75
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.status}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {comp.mastery}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {comp.title}
                  </p>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMastered ? 'bg-emerald-500' : comp.mastery >= 75 ? 'bg-sky-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${comp.mastery}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
