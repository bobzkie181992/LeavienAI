import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Brain, 
  CheckCircle2, 
  Award, 
  Target, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Compass, 
  AlertCircle,
  Zap,
  Layers,
  Flame,
  Mic,
  GraduationCap,
  MessageSquare,
  Play
} from 'lucide-react';
import { UserProfile, QuizResult } from '../types';
import { useStudentOralRecitations } from '../hooks/useFirebase';

interface LearningReportsProps {
  profile: UserProfile;
  results: QuizResult[];
  onTakeDiagnostic?: () => void;
}

export default function LearningReports({ profile, results = [], onTakeDiagnostic }: LearningReportsProps) {
  const [activeReportsTab, setActiveReportsTab] = useState<'activity' | 'diagnostic' | 'formative' | 'recitations'>('activity');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook to fetch oral recitations
  const { recitations, loading: loadingRecitations } = useStudentOralRecitations(profile.uid);

  // Time utilities helper
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Filtered lists based on report interval
  const getFilteredResults = () => {
    return results.filter(r => {
      const rDate = new Date(r.timestamp);
      if (reportType === 'daily') {
        return rDate >= startOfToday;
      } else if (reportType === 'weekly') {
        return rDate >= sevenDaysAgo;
      } else {
        return rDate >= thirtyDaysAgo;
      }
    });
  };

  const currentFilteredResults = getFilteredResults();

  // Calculations for current period
  const totalActivities = currentFilteredResults.length;
  const totalPoints = currentFilteredResults.reduce((acc, r) => acc + r.score, 0);
  const totalPossible = currentFilteredResults.reduce((acc, r) => acc + r.total, 0);
  const averageAccuracy = totalPossible > 0 ? Math.round((totalPoints / totalPossible) * 100) : 0;
  const totalXPEarned = currentFilteredResults.reduce((acc, r) => acc + (50 + r.score * 10), 0);

  // Fetch AI Progress Narrative when reportType or results change
  useEffect(() => {
    if (activeReportsTab !== 'activity') return;

    const fetchNarrativeReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ai/report-narrative', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reportType,
            activityCount: totalActivities,
            avgAccuracy: averageAccuracy,
            totalXPEarned,
            skillsPracticed: currentFilteredResults.map(r => r.quizId)
          })
        });

        const data = await response.json();
        if (data.success && data.report) {
          setReportData(data.report);
        } else {
          throw new Error(data.error || 'Failed to generate learning narrative report');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error occurred generating AI academic commentary.');
      } finally {
        setLoading(false);
      }
    };

    fetchNarrativeReport();
  }, [reportType, results.length, activeReportsTab]);

  // Chart Formatted Data:
  const getChartData = (): any[] => {
    if (reportType === 'daily') {
      if (currentFilteredResults.length === 0) return [];
      return currentFilteredResults.map((r, idx) => ({
        name: `Quiz #${idx + 1}`,
        accuracy: Math.round((r.score / r.total) * 100),
        score: r.score,
        total: r.total
      }));
    } else if (reportType === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      }).reverse();

      return last7Days.map(date => {
        const dayQuizzes = results.filter(r => {
          const rDate = new Date(r.timestamp);
          return rDate.toDateString() === date.toDateString();
        });
        const count = dayQuizzes.length;
        const pts = dayQuizzes.reduce((acc, r) => acc + r.score, 0);
        const poss = dayQuizzes.reduce((acc, r) => acc + r.total, 0);
        return {
          name: days[date.getDay()],
          accuracy: poss > 0 ? Math.round((pts / poss) * 100) : 0,
          quizzes: count
        };
      });
    } else {
      const weeksData = Array.from({ length: 4 }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        const weekQuizzes = results.filter(r => {
          const rDate = new Date(r.timestamp);
          return rDate >= weekStart && rDate < weekEnd;
        });

        const count = weekQuizzes.length;
        const pts = weekQuizzes.reduce((acc, r) => acc + r.score, 0);
        const poss = weekQuizzes.reduce((acc, r) => acc + r.total, 0);

        return {
          name: `Wk ${4 - i}`,
          accuracy: poss > 0 ? Math.round((pts / poss) * 100) : 0,
          count: count
        };
      }).reverse();

      return weeksData;
    }
  };

  const chartData = getChartData();

  const getCleanQuizName = (quizId: string) => {
    if (quizId.startsWith('challenge-')) return 'Daily Math Challenge';
    if (quizId.startsWith('adaptive-')) return 'Adaptive Math Scaling';
    if (quizId.startsWith('practice-')) return 'Core Competency Practice';
    if (quizId.startsWith('diagnostic-') || quizId === 'diagnostic') return 'Diagnostic Baseline Exam';
    return 'Structured Curriculum Quiz';
  };

  // Predefined Grade 11 Mathematics core domains
  const mathDomains = [
    { id: 'functions', title: 'General Functions & Graphs', desc: 'Evaluating, combining, and graphing polynomial, piecewise, and rational representations.' },
    { id: 'rational', title: 'Rational Equations & Inequalities', desc: 'Solving algebraic structures and determining horizontal/vertical asymptotes.' },
    { id: 'inverse_expo_log', title: 'Inverse, Exponential & Logarithmic Functions', desc: 'Modeling physical growth, solving equations, and sketching logarithmic coordinates.' },
    { id: 'business_math', title: 'General Business Mathematics', desc: 'Computing simple & compound interest, annuities, amortization, stocks, and bonds.' },
    { id: 'logic', title: 'Mathematical Logic & Truth Values', desc: 'Propositional logic, conditional statements, truth tables, and formal proof methods.' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Level Assessment Navigation Sub-Tabs */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveReportsTab('activity')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5 ${
            activeReportsTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Activity & AI Commentary</span>
        </button>
        <button
          onClick={() => setActiveReportsTab('diagnostic')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5 ${
            activeReportsTab === 'diagnostic'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Diagnostic Baseline</span>
        </button>
        <button
          onClick={() => setActiveReportsTab('formative')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5 ${
            activeReportsTab === 'formative'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Formative Mastery</span>
        </button>
        <button
          onClick={() => setActiveReportsTab('recitations')}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5 ${
            activeReportsTab === 'recitations'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Classroom Recitations</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: ACTIVITY & AI PROGRESS COMMENTARY */}
        {activeReportsTab === 'activity' && (
          <motion.div
            key="activity-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header section with tabs */}
            <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Personalized Progress Diagnostic Dashboard
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Academic Performance Reports
                </h2>
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                  Monitor and track your mathematical agility, correctness averages, and daily streaks across structured intervals with instant cognitive commentary.
                </p>
              </div>

              {/* Intervals Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200/60 rounded-2xl shrink-0 self-start md:self-auto">
                <button
                  onClick={() => setReportType('daily')}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black tracking-tight transition-all ${
                    reportType === 'daily' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Daily Report
                </button>
                <button
                  onClick={() => setReportType('weekly')}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black tracking-tight transition-all ${
                    reportType === 'weekly' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Weekly Report
                </button>
                <button
                  onClick={() => setReportType('monthly')}
                  className={`px-4.5 py-2 rounded-xl text-xs font-black tracking-tight transition-all ${
                    reportType === 'monthly' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Monthly Report
                </button>
              </div>
            </div>

            {/* Aggregate metrics grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-indigo-50/40 border border-indigo-100/60 rounded-3xl space-y-2">
                <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest block">Quizzes Completed</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-indigo-600">{totalActivities}</span>
                  <span className="text-xs text-indigo-400 font-bold">attempts</span>
                </div>
                <p className="text-[10px] text-indigo-700 font-medium">In selected {reportType} window</p>
              </div>

              <div className="p-5 bg-emerald-50/40 border border-emerald-100/60 rounded-3xl space-y-2">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">Average Accuracy</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-emerald-600">{averageAccuracy}%</span>
                  <span className="text-xs text-emerald-400 font-bold">correct</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">Overall mathematical precision</p>
              </div>

              <div className="p-5 bg-amber-50/40 border border-amber-100/60 rounded-3xl space-y-2">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">Estimated XP Gained</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-amber-600">+{totalXPEarned}</span>
                  <span className="text-xs text-amber-400 font-bold">XP</span>
                </div>
                <p className="text-[10px] text-amber-700 font-medium">Points added to student profile</p>
              </div>

              <div className="p-5 bg-violet-50/40 border border-violet-100/60 rounded-3xl space-y-2">
                <span className="text-[10px] font-black text-violet-800 uppercase tracking-widest block">Streak Status</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-violet-600">{profile.streak}</span>
                  <span className="text-xs text-violet-400 font-bold">Days</span>
                </div>
                <p className="text-[10px] text-violet-700 font-medium">Consecutive learning streak</p>
              </div>
            </div>

            {/* Narrative Progress & Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Recharts Analytics Card (Span 7) */}
              <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Visual Progression Profile</h3>
                    <p className="text-[10px] text-slate-400">Score & session accuracy trends</p>
                  </div>
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {reportType === 'daily' ? 'Exercise Precision' : reportType === 'weekly' ? '7-Day Trend' : 'Weekly Average'}
                  </span>
                </div>

                {chartData.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
                    <Compass className="w-8 h-8 text-slate-300" />
                    <div>
                      <h5 className="font-bold text-slate-700 text-xs">No activity record during this window</h5>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                        Take dynamic learning challenges or perform structured quizzes on your pathway to populate beautiful progression metrics!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {reportType === 'daily' ? (
                        <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                            itemStyle={{ color: '#38bdf8' }}
                          />
                          <Bar dataKey="accuracy" name="Accuracy %" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      ) : reportType === 'weekly' ? (
                        <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                            itemStyle={{ color: '#34d399' }}
                          />
                          <Area type="monotone" dataKey="accuracy" name="Avg Accuracy %" stroke="#10b981" fillOpacity={1} fill="url(#accuracyGrad)" strokeWidth={2.5} />
                        </AreaChart>
                      ) : (
                        <LineChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                            itemStyle={{ color: '#8b5cf6' }}
                          />
                          <Line type="monotone" dataKey="accuracy" name="Weekly Accuracy %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* AI Progress Narrative Box (Span 5) */}
              <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm lg:col-span-5 space-y-4">
                <div className="border-b border-slate-50 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    AI Academic Commentary
                  </h3>
                  <p className="text-[10px] text-slate-400">Pedagogical critique on classroom learning activity</p>
                </div>

                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] text-slate-400 font-bold animate-pulse">Running diagnostic synthesis...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-1 text-center">
                    <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
                    <p className="text-xs text-rose-800 font-semibold">{error}</p>
                    <p className="text-[10px] text-rose-500">We are showcasing localized mathematical analytics below in the interim.</p>
                  </div>
                ) : reportData ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4.5"
                  >
                    {/* Narrative Text */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                        "{reportData.narrative}"
                      </p>
                    </div>

                    {/* Achievements list */}
                    {reportData.achievements?.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[9px] font-black uppercase text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                          Interval Milestone Approach
                        </span>
                        <ul className="space-y-1">
                          {reportData.achievements.map((ach: string, i: number) => (
                            <li key={i} className="text-xs text-emerald-800 font-semibold flex items-start gap-1.5 pl-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pedagogical Focus area */}
                    {reportData.pedagogicalFocus && (
                      <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                          <Target className="w-3.5 h-3.5 text-amber-600" />
                          <span>Target Growth Area</span>
                        </div>
                        <p className="text-xs text-amber-900/90 font-medium leading-relaxed">
                          {reportData.pedagogicalFocus}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="p-4 bg-slate-50 text-center rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-500">Perform an activity to unlock AI reports.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Logs Timeline */}
            <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Session Activity Log</h3>
                  <p className="text-xs text-slate-400">Chronological history of completed exercises during this interval</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {currentFilteredResults.length} records found
                </span>
              </div>

              {currentFilteredResults.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold">No quizzes or challenges found in the selected report range.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100/60 bg-slate-50/50">
                  {currentFilteredResults.map((result, idx) => {
                    const rPercent = Math.round((result.score / result.total) * 100);
                    return (
                      <div 
                        key={result.id || idx}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">
                              {getCleanQuizName(result.quizId)}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4.5">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-800 block">
                              {result.score} / {result.total} Correct
                            </span>
                            <span className="text-[10px] text-slate-400 block font-bold">
                              Precision Ratio
                            </span>
                          </div>

                          <div className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black text-center w-16 shrink-0 ${
                            rPercent >= 80 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : rPercent >= 50 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {rPercent}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: DIAGNOSTIC BASELINE DASHBOARD */}
        {activeReportsTab === 'diagnostic' && (
          <motion.div
            key="diagnostic-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Calibration & Initial Ability Index
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Diagnostic Baseline Assessment
                </h2>
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                  The entry diagnostics set your mathematical starting index, configuring the adaptive engine to supply the optimal degree of formative lesson challenges.
                </p>
              </div>

              {profile.diagnosticCompleted ? (
                <div className="space-y-8">
                  {/* General diagnostic metrics overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-3xl space-y-1 shadow-md shadow-indigo-100">
                      <span className="text-[9px] font-bold uppercase text-indigo-200 block">Baseline Ability Score</span>
                      <div className="text-2xl font-black">
                        {profile.diagnosticAbility === 'proficient' ? 'Proficient' : profile.diagnosticAbility === 'developing' ? 'Developing' : 'Advanced'}
                      </div>
                      <p className="text-[10px] text-indigo-100 leading-tight">Calibrated via IRT Maximum Likelihood</p>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Skill Index</span>
                      <div className="text-2xl font-black text-slate-800">
                        Level {profile.level} Mathlete
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">Class performance level standing</p>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Recalibration Status</span>
                      <div className="pt-1 flex justify-start">
                        <button
                          onClick={onTakeDiagnostic}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Retake Diagnostic</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Competency domain diagnostic scores */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-50 pb-2">
                      <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Mathematics Domain Diagnostics</h3>
                      <p className="text-[10px] text-slate-400">Mastery standing mapped during initial baseline assessment</p>
                    </div>

                    <div className="space-y-4">
                      {mathDomains.map((domain) => {
                        // Obtain score from user profile if saved, otherwise default to a robust estimate of 3/5
                        const score = (profile.diagnosticScores && profile.diagnosticScores[domain.id]) ?? 3;
                        const scorePercent = (score / 5) * 100;
                        const isMastered = score >= 4;
                        const isDeveloping = score >= 2 && score <= 3;

                        return (
                          <div key={domain.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1 max-w-md">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-xs text-slate-800">{domain.title}</h4>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  isMastered
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : isDeveloping
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {isMastered ? 'Mastered' : isDeveloping ? 'Developing' : 'Remediation Required'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed">{domain.desc}</p>
                            </div>

                            <div className="flex items-center gap-3.5 min-w-[120px] sm:min-w-[180px] justify-between">
                              <div className="w-full">
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isMastered ? 'bg-emerald-500' : isDeveloping ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${scorePercent}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase mt-1">
                                  <span>Novice</span>
                                  <span>Expert</span>
                                </div>
                              </div>
                              <span className="font-black text-xs text-slate-800 shrink-0 w-8 text-right">
                                {score}/5
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-6 text-center bg-slate-50 rounded-3xl border border-slate-100 max-w-lg mx-auto flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-900 text-sm">Calibrate Your MathQuest Journey</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You haven't completed your baseline diagnostic exam yet. Take it now to customize your learning pathway and unlock adaptive challenge recommendations tailored to your mathematical strengths!
                    </p>
                  </div>
                  <button
                    onClick={onTakeDiagnostic}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Baseline Diagnostic Exam</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: FORMATIVE MASTERY PROGRESS */}
        {activeReportsTab === 'formative' && (
          <motion.div
            key="formative-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Continuous Skills Evaluation Loop
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Formative Assessment Mastery
                </h2>
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                  Formative evaluations track your progress across micro-quizzes, daily practice sprints, and pathway challenge checkpoints to diagnose errors in real time.
                </p>
              </div>

              {/* Aggregated Formative Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Total Active Quizzes</span>
                  <div className="text-xl font-extrabold text-slate-800">
                    {results.filter(r => !r.quizId.includes('diagnostic')).length} Practice Quizzes
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Accuracy Standing</span>
                  <div className="text-xl font-extrabold text-slate-800">
                    {averageAccuracy}% Precision Ratio
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Active Milestones</span>
                  <div className="text-xl font-extrabold text-slate-800">
                    {results.filter(r => r.score === r.total).length} Full-Scores Achieved
                  </div>
                </div>
              </div>

              {/* Core lesson formative summaries */}
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Continuous Learning Competency Logs</h3>
                  <p className="text-[10px] text-slate-400">Average scoring profiles recorded in practice, timed math sprints, and adaptive drills</p>
                </div>

                {results.filter(r => !r.quizId.includes('diagnostic')).length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                    No formative quiz history available. Complete standard curriculum lessons to map dynamic competency progress.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* List of quizzes taken formatted cleanly */}
                    {results.filter(r => !r.quizId.includes('diagnostic')).slice(0, 8).map((res, i) => {
                      const resPercent = Math.round((res.score / res.total) * 100);
                      return (
                        <div key={res.id || i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/60 flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-xs text-slate-800">{getCleanQuizName(res.quizId)}</h4>
                            <p className="text-[9px] text-slate-400 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(res.timestamp).toLocaleDateString()}</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-700 block">
                              {res.score}/{res.total} pts
                            </span>
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              resPercent >= 80 ? 'bg-emerald-50 text-emerald-700' : resPercent >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {resPercent}% Correct
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: CLASSROOM ORAL RECITATIONS */}
        {activeReportsTab === 'recitations' && (
          <motion.div
            key="recitations-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 sm:p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                    Class Participation & Verbal Expression
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Oral Recitation Plus Points
                </h2>
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                  Earn plus points during classroom board work, lectures, and mathematical discussions. Points are converted directly into active XP to level up your avatar!
                </p>
              </div>

              {/* Cumulative stats card */}
              <div className="bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-amber-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Award className="w-5 h-5 text-amber-200" />
                    <span className="text-[10px] font-bold uppercase text-amber-100 tracking-wider">Verbal Mastery Standing</span>
                  </div>
                  <h3 className="text-2xl font-black">Oral Recitation Portfolio</h3>
                  <p className="text-xs text-amber-100/80 max-w-md">
                    Showing all verified plus points and pedagogical commentary awarded by your subject faculty.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-sm shrink-0 border border-white/10">
                  <div className="text-center">
                    <span className="text-[8px] font-black uppercase text-amber-200 tracking-widest block">Recitations</span>
                    <span className="text-3xl font-black">+{profile.oralRecitationPoints || 0}</span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <span className="text-[8px] font-black uppercase text-amber-200 tracking-widest block">XP Boost</span>
                    <span className="text-3xl font-black">+{(profile.oralRecitationPoints || 0) * 100}</span>
                  </div>
                </div>
              </div>

              {/* Logs chronological timeline list */}
              <div className="space-y-4">
                <div className="border-b border-slate-50 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Verified Recitation logs</h3>
                  <p className="text-[10px] text-slate-400">Historical trail of classroom recitations validated by MathQuest faculty</p>
                </div>

                {loadingRecitations ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] text-slate-400 font-bold">Synchronizing recitations...</p>
                  </div>
                ) : recitations.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-3xl border border-slate-100 max-w-md mx-auto flex flex-col items-center space-y-4">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                      <Mic className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-slate-900 text-sm">No Classroom Recitations Awarded</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Earn recitation plus points by actively raising your hand and discussing math problems with your instructor in class! Points logged in the faculty dashboard appear here instantly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {recitations.map((rec) => (
                      <div 
                        key={rec.id} 
                        className="bg-white p-5 rounded-2xl border border-slate-150/80 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                              <Mic className="w-3 h-3 text-amber-600" />
                              +{rec.points} Recitation Point{rec.points > 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 ml-2">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(rec.awardedAt).toLocaleDateString()}</span>
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase text-indigo-500 block">Class Topic / Lesson</span>
                            <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                              {rec.topicTitle || 'General Mathematics Session'}
                            </h4>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                            <span className="text-[8px] font-bold uppercase text-slate-400 block mb-1">Teacher Remarks</span>
                            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                              "{rec.notes}"
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl w-full sm:w-auto">
                          <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Awarded By</span>
                          <span className="text-xs font-black text-slate-700 block flex items-center gap-1 justify-start sm:justify-end">
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                            {rec.awardedBy || 'Faculty Instructor'}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-extrabold block mt-0.5">
                            +{rec.points * 100} Gamified XP Granted
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
