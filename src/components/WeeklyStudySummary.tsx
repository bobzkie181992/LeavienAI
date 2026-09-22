import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Topic, QuizResult, UserProfile } from '../types';

interface WeeklyStudySummaryProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  onSelectTopic?: (topic: Topic) => void;
}

export default function WeeklyStudySummary({
  topics,
  results,
  profile,
  onSelectTopic
}: WeeklyStudySummaryProps) {
  const [weeklyGoalTopics, setWeeklyGoalTopics] = useState<number>(3);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Calculate start of current week (Monday at 00:00:00)
  const weekStart = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    // In JS, 0 is Sunday, 1 is Monday...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  // Filter results completed within this week
  const thisWeekResults = useMemo(() => {
    return results.filter(r => {
      if (!r.timestamp) return false;
      const resDate = new Date(r.timestamp);
      return resDate >= weekStart;
    });
  }, [results, weekStart]);

  // Analyze topics engaged or completed this week
  const weeklyTopicStats = useMemo(() => {
    const map = new Map<string, {
      topic: Topic;
      quizCount: number;
      totalScore: number;
      totalQuestions: number;
      isMastered: boolean;
      lastAttempt: Date;
    }>();

    thisWeekResults.forEach(r => {
      // Find matching topic
      const topic = topics.find(t => t.id === r.quizId || t.quizzes.some(q => q.id === r.quizId));
      if (!topic) return;

      const existing = map.get(topic.id);
      const attemptDate = new Date(r.timestamp);
      const passed = r.total > 0 && (r.score / r.total) >= 0.7;

      if (!existing) {
        map.set(topic.id, {
          topic,
          quizCount: 1,
          totalScore: r.score,
          totalQuestions: r.total,
          isMastered: passed,
          lastAttempt: attemptDate
        });
      } else {
        existing.quizCount += 1;
        existing.totalScore += r.score;
        existing.totalQuestions += r.total;
        if (passed) existing.isMastered = true;
        if (attemptDate > existing.lastAttempt) {
          existing.lastAttempt = attemptDate;
        }
      }
    });

    return Array.from(map.values());
  }, [thisWeekResults, topics]);

  // Aggregate metrics
  const completedTopicsCount = weeklyTopicStats.filter(s => s.isMastered).length;
  const engagedTopicsCount = weeklyTopicStats.length;
  const totalQuestionsThisWeek = thisWeekResults.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalCorrectThisWeek = thisWeekResults.reduce((acc, r) => acc + (r.score || 0), 0);
  const accuracyThisWeek = totalQuestionsThisWeek > 0 
    ? Math.round((totalCorrectThisWeek / totalQuestionsThisWeek) * 100) 
    : 0;

  // Percentage progress towards weekly goal
  const progressPercent = Math.min(100, Math.round((completedTopicsCount / weeklyGoalTopics) * 100));

  // Daily activity distribution (Mon through Sun)
  const daysOfWeek = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

    return days.map((dayName, idx) => {
      // Check if any results occurred on this day of current week
      const targetDate = new Date(weekStart);
      targetDate.setDate(weekStart.getDate() + idx);
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + 1);

      const hasActivity = thisWeekResults.some(r => {
        const d = new Date(r.timestamp);
        return d >= targetDate && d < nextDate;
      });

      const isToday = idx === currentDayIdx;
      const isPastOrToday = idx <= currentDayIdx;

      return {
        name: dayName,
        hasActivity,
        isToday,
        isPastOrToday
      };
    });
  }, [thisWeekResults, weekStart]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6 transition-all">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Icons.CalendarCheck className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Weekly Study Summary
              </h3>
              <span className="text-[11px] font-semibold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 px-2 py-0.5 rounded-full">
                This Week
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Track your weekly topic mastery and regular mathematics learning habit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-300 font-medium">Weekly Target:</span>
            <select 
              value={weeklyGoalTopics}
              onChange={(e) => setWeeklyGoalTopics(Number(e.target.value))}
              className="bg-slate-800 text-white font-bold border-none rounded-lg py-0.5 px-2 text-xs focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              <option value={1}>1 Topic</option>
              <option value={2}>2 Topics</option>
              <option value={3}>3 Topics</option>
              <option value={4}>4 Topics</option>
              <option value={5}>5 Topics</option>
            </select>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            title={isExpanded ? "Collapse summary" : "Expand summary"}
            aria-label="Toggle weekly summary"
          >
            {isExpanded ? (
              <Icons.ChevronUp className="w-4 h-4" />
            ) : (
              <Icons.ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar & Key Stats */}
      <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                Weekly Topics Mastery Progress:
              </span>
              <span className="font-extrabold text-indigo-600 text-base">
                {completedTopicsCount} / {weeklyGoalTopics} Topics
              </span>
              {progressPercent >= 100 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Icons.CheckCircle2 className="w-3.5 h-3.5" /> Goal Achieved!
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {progressPercent}% of Weekly Goal Completed
            </div>
          </div>

          {/* Styled Animated Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner">
            <motion.div 
              className={`h-full rounded-full transition-all duration-700 ${
                progressPercent >= 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200' 
                  : progressPercent >= 50
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500'
                  : 'bg-gradient-to-r from-amber-500 to-indigo-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 3 Quick Micro-Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/60">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Icons.Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>Topics Practiced</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {engagedTopicsCount}
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Icons.FileCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Quizzes Taken</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {thisWeekResults.length}
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Icons.HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Problems Solved</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {totalQuestionsThisWeek}
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Icons.Percent className="w-3.5 h-3.5 text-purple-500" />
              <span>Weekly Accuracy</span>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {accuracyThisWeek}%
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details: Daily Study Habit + Completed Topics List */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Day of the week streak indicators */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weekly Study Habit
              </span>
              <span className="text-xs text-slate-400">
                {daysOfWeek.filter(d => d.hasActivity).length} active days this week
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    day.hasActivity 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold shadow-xs'
                      : day.isToday
                      ? 'bg-indigo-50/70 border-indigo-200 text-indigo-700 font-semibold'
                      : 'bg-slate-50 border-slate-200/60 text-slate-400'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider mb-1">
                    {day.name}
                  </span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center">
                    {day.hasActivity ? (
                      <Icons.Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    ) : day.isToday ? (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed & Engaged Topics List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Topics Covered This Week ({weeklyTopicStats.length})
              </span>
              {weeklyTopicStats.length === 0 && (
                <span className="text-xs text-amber-600 font-medium">
                  Take a quiz to log progress for this week!
                </span>
              )}
            </div>

            {weeklyTopicStats.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {weeklyTopicStats.map((stat) => {
                  const accuracy = stat.totalQuestions > 0 
                    ? Math.round((stat.totalScore / stat.totalQuestions) * 100) 
                    : 0;

                  return (
                    <div
                      key={stat.topic.id}
                      onClick={() => onSelectTopic && onSelectTopic(stat.topic)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        onSelectTopic ? 'cursor-pointer hover:shadow-md hover:border-indigo-300' : ''
                      } ${
                        stat.isMastered 
                          ? 'bg-emerald-50/50 border-emerald-200' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          stat.isMastered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {stat.isMastered ? (
                            <Icons.Award className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Icons.BookOpen className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {stat.topic.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{stat.quizCount} {stat.quizCount === 1 ? 'quiz' : 'quizzes'}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{accuracy}% accuracy</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {stat.isMastered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            <Icons.Check className="w-3 h-3" /> Mastered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <Icons.Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  No topic activities recorded yet for this week.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Start an adaptive quiz or topic module to see your weekly progress bar fill up!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
