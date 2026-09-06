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
  Flame
} from 'lucide-react';
import { UserProfile, QuizResult } from '../types';

interface LearningReportsProps {
  profile: UserProfile;
  results: QuizResult[];
}

export default function LearningReports({ profile, results = [] }: LearningReportsProps) {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time utilities helper
  const now = new Date();
  
  // Start of today (00:00:00)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Start of this week (7 days ago)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Start of this month (30 days ago)
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
  
  // Approximate XP earned in this period (Each quiz result awards ~50 XP base + score points * 10)
  const totalXPEarned = currentFilteredResults.reduce((acc, r) => acc + (50 + r.score * 10), 0);

  // Fetch AI Progress Narrative when reportType or results change
  useEffect(() => {
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
  }, [reportType, results.length]);

  // Chart Formatted Data:
  const getChartData = (): any[] => {
    if (reportType === 'daily') {
      // Show each quiz taken today
      if (currentFilteredResults.length === 0) return [];
      return currentFilteredResults.map((r, idx) => ({
        name: `Quiz #${idx + 1}`,
        accuracy: Math.round((r.score / r.total) * 100),
        score: r.score,
        total: r.total
      }));
    } else if (reportType === 'weekly') {
      // Group by the last 7 days
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
      // Monthly: Group by week chunks (Last 4 weeks)
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
    if (quizId.startsWith('practice-')) return 'Core Competency practice';
    return 'Structured Curriculum Quiz';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
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
                      itemStyle={{ color: '#a78bfa' }}
                    />
                    <Line type="monotone" dataKey="accuracy" name="Week Avg Accuracy %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gemini AI progress commentary (Span 5) */}
        <div className="bg-white p-6 rounded-[36px] border border-slate-100 shadow-sm lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">AI Progress Commentary</h3>
              <p className="text-[10px] text-slate-400">Personalized cognitive assessment</p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full"
              />
              <p className="text-[10px] text-slate-400 font-bold animate-pulse">Formulating narrative progress commentary...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-700 leading-relaxed font-semibold">{error}</p>
            </div>
          ) : reportData ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Main Narrative */}
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                  Academic Summary
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {reportData.narrative}
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

    </div>
  );
}
