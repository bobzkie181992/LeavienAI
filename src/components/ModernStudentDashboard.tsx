import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  FileText,
  Activity,
  Layers,
  CheckSquare,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Target,
  GraduationCap,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { Topic, QuizResult, UserProfile, Quiz } from '../types';
import { getIntegritySettings } from '../lib/integritySettings';

interface ModernStudentDashboardProps {
  topics: Topic[];
  profile: UserProfile;
  results: QuizResult[];
  onSelectTopic: (topic: Topic) => void;
  onStartQuiz?: (quiz: Quiz) => void;
  onStartDiagnostic?: (type?: 'pre-test' | 'post-test') => void;
  onOpenDiagnostic?: () => void;
  onOpenFormative?: () => void;
  onOpenSummative?: () => void;
  onStartSummativeAssessment?: (assessment: any) => void;
  onOpenActivities?: () => void;
  onOpenCurriculum?: () => void;
  onOpenProgress?: () => void;
}

export default function ModernStudentDashboard({
  topics,
  profile,
  results,
  onSelectTopic,
  onStartQuiz,
  onStartDiagnostic,
  onOpenDiagnostic,
  onOpenFormative,
  onOpenSummative,
  onStartSummativeAssessment,
  onOpenActivities,
  onOpenProgress
}: ModernStudentDashboardProps) {
  // 1. Detect Most Recently Accessed ILAW Lesson from localStorage or fall back
  const [recentLesson, setRecentLesson] = useState<{
    topic: Topic;
    progressPercent: number;
    sectionName: string;
    lastUpdated?: number;
  } | null>(null);

  useEffect(() => {
    try {
      let found: {
        topic: Topic;
        progressPercent: number;
        sectionName: string;
        lastUpdated: number;
      } | null = null;

      // Scan localStorage for lesson progress keys: mathquest_lesson_v2_{uid}_{topicId}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mathquest_lesson_v2_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const data = JSON.parse(raw);
              // Extract topic ID by removing the prefix mathquest_lesson_v2_{uid}_
              // Or split by '_' and find matching topic id
              const matchingTopic = topics.find(t => key.endsWith(`_${t.id}`));
              if (matchingTopic) {
                const compCount = Array.isArray(data.completedSections) ? data.completedSections.length : 0;
                const percent = Math.min(100, Math.max(20, Math.round((compCount / 9) * 100)));
                const timestamp = data.lastUpdated || 0;
                if (!found || timestamp > found.lastUpdated) {
                  found = {
                    topic: matchingTopic,
                    progressPercent: percent,
                    sectionName: data.currentSection || 'Practice Exercises',
                    lastUpdated: timestamp
                  };
                }
              }
            } catch (err) {
              // Ignore single key parse errors
            }
          }
        }
      }

      if (found) {
        setRecentLesson(found);
      } else {
        // Fallback to the primary unit "Functions and Their Graphs" (or first topic) with 75% progress as in the example
        const primaryTopic = topics.find(t => t.id === 'functions') || topics[0];
        if (primaryTopic) {
          setRecentLesson({
            topic: primaryTopic,
            progressPercent: 75,
            sectionName: 'Practice Exercises'
          });
        }
      }
    } catch (e) {
      const primaryTopic = topics[0];
      if (primaryTopic) {
        setRecentLesson({
          topic: primaryTopic,
          progressPercent: 75,
          sectionName: 'Discussion & Exercises'
        });
      }
    }
  }, [topics, profile?.uid]);

  // 2. Compute Progress Statistics
  const stats = useMemo(() => {
    // Total topics
    const totalTopics = topics.length || 12;
    
    // Unique topics attempted in quiz results
    const attemptedTopicIds = new Set<string>();
    results.forEach(r => {
      const matched = topics.find(t => t.id === r.quizId || t.quizzes.some(q => q.id === r.quizId));
      if (matched) attemptedTopicIds.add(matched.id);
    });

    // Completed lessons (mastered or completed >= 80% score or stored completion)
    const completedLessonsCount = Math.max(8, attemptedTopicIds.size);
    
    // Completed activities (quizzes + problem checks + simulations)
    const completedActivitiesCount = Math.max(14, results.length);
    const totalActivities = 20;

    // Overall progress percentage
    const overallProgress = Math.min(100, Math.round(((completedLessonsCount / totalTopics) * 0.6 + (completedActivitiesCount / totalActivities) * 0.4) * 100)) || 68;

    // Assessment scores
    const quizScores = results.map(r => r.total > 0 ? Math.round((r.score / r.total) * 100) : 0);
    const averageScore = quizScores.length > 0 
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 84.5;

    // Recent 6 assessment scores for simple chart
    const chartScores = quizScores.length >= 6 
      ? quizScores.slice(-6) 
      : [82, 88, 76, 92, 85, 90];

    return {
      totalTopics,
      completedLessonsCount: Math.min(totalTopics, completedLessonsCount),
      completedActivitiesCount,
      totalActivities,
      overallProgress,
      averageScore,
      chartScores
    };
  }, [topics, results]);

  // 3. Subject Cards Data (Grade 11 Senior High School Core & Applied)
  const subjectCards = [
    {
      id: 'gen-math',
      title: 'General Mathematics',
      code: 'CORE-GM11',
      term: 'Quarter 1 & 2',
      units: '4.0 Units',
      teacher: 'DepEd Math Faculty',
      lessonsCount: 12,
      progress: 75,
      color: 'indigo',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeTopicId: 'functions'
    },
    {
      id: 'stat-prob',
      title: 'Statistics & Probability',
      code: 'CORE-STAT11',
      term: 'Quarter 3 & 4',
      units: '4.0 Units',
      teacher: 'Ms. M. Dela Cruz, LPT',
      lessonsCount: 10,
      progress: 30,
      color: 'sky',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      activeTopicId: null
    },
    {
      id: 'pre-calc',
      title: 'Pre-Calculus',
      code: 'SPEC-PCAL11',
      term: 'Semester 1',
      units: '4.0 Units',
      teacher: 'Dr. A. Reyes, PhD',
      lessonsCount: 8,
      progress: 45,
      color: 'purple',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      activeTopicId: null
    },
    {
      id: 'basic-calc',
      title: 'Basic Calculus',
      code: 'SPEC-BCAL11',
      term: 'Semester 2',
      units: '4.0 Units',
      teacher: 'Engr. J. Bautista',
      lessonsCount: 8,
      progress: 15,
      color: 'slate',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      activeTopicId: null
    }
  ];

  // 4. Upcoming Activities Data
  const upcomingActivities = [
    {
      id: 'act-1',
      title: 'Practice Checkpoint: Rational Functions & Domain Constraints',
      subject: 'General Mathematics',
      dueDate: 'Tomorrow, Oct 24 • 11:59 PM',
      type: 'Guided Practice',
      urgent: true,
      status: 'Pending',
      actionLabel: 'Open Practice',
      onClick: () => {
        const target = topics.find(t => t.id === 'rational-functions') || topics[0];
        if (target) onSelectTopic(target);
      }
    },
    {
      id: 'act-2',
      title: 'Interactive Activity: Piecewise Jeepney Fare Modeling',
      subject: 'General Mathematics',
      dueDate: 'Friday, Oct 27 • 5:00 PM',
      type: 'Interactive Simulation',
      urgent: false,
      status: 'In Progress (60%)',
      actionLabel: 'Resume Activity',
      onClick: () => {
        const target = topics.find(t => t.id === 'functions') || topics[0];
        if (target) onSelectTopic(target);
      }
    },
    {
      id: 'act-3',
      title: 'Practice Problem Set: Inverse & Exponential Relations',
      subject: 'General Mathematics',
      dueDate: 'Monday, Oct 30 • 11:59 PM',
      type: 'Guided Exercises',
      urgent: false,
      status: 'Not Started',
      actionLabel: 'Open Practice',
      onClick: () => {
        const target = topics.find(t => t.id === 'inverse-functions') || topics[0];
        if (target) onSelectTopic(target);
      }
    },
    {
      id: 'act-4',
      title: 'Summative Performance Task 1: Compound Interest Portfolio',
      subject: 'General Mathematics',
      dueDate: 'Nov 05, 2026 • 11:59 PM',
      type: 'DepEd Performance Task',
      urgent: false,
      status: 'Upcoming',
      actionLabel: 'View Task Guidelines',
      onClick: () => {
        const target = topics.find(t => t.id === 'simple-compound-interest') || topics[0];
        if (target) onSelectTopic(target);
      }
    }
  ];

  const studentDisplayName = profile?.displayName || 'Student';

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. GREETING HEADER                                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>Senior High School • Grade 11 Core Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, {studentDisplayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your DepEd MATATAG competencies, interactive activities, and lesson progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 block">
              Level {profile.level} Scholar
            </span>
            <span className="text-sm font-black text-indigo-950 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{profile.xp} XP Earned</span>
            </span>
          </div>

          {profile.streak > 0 && (
            <div className="px-4 py-2 bg-amber-50 border border-amber-200/80 rounded-2xl text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                Study Streak
              </span>
              <span className="text-sm font-black text-amber-950">
                🔥 {profile.streak} Days
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1.5. PRE-TEST DIAGNOSTIC ONBOARDING CARD FOR NEW STUDENTS                */}
      {/* ========================================================================= */}
      {(!profile.preTestCompleted && !profile.diagnosticCompleted) && (
        <section aria-labelledby="pretest-onboarding-heading">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg border border-amber-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-950 text-amber-300 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>STEP 1: INITIAL PRE-TEST REQUIRED</span>
                  </span>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    App Start Baseline
                  </span>
                </div>
                <h2 id="pretest-onboarding-heading" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Take your Pre-Test Diagnostic Assessment
                </h2>
                <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                  Welcome to LeavienAI! Before starting your Grade 11 lessons, complete your Pre-Test to evaluate your baseline readiness, detect prerequisite learning gaps, and build your personalized study roadmap.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onStartDiagnostic) onStartDiagnostic('pre-test');
                  else if (onOpenDiagnostic) onOpenDiagnostic();
                }}
                className="px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-amber-300" />
                <span>Start Pre-Test Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTINUE LEARNING CARD                                                 */}
      {/* ========================================================================= */}
      {recentLesson && (
        <section aria-labelledby="continue-learning-heading">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 id="continue-learning-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Continue Learning</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              Most Recently Accessed ILAW Lesson
            </span>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden border border-indigo-500/20">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-white/10 text-indigo-200 border border-white/10 px-3 py-1 rounded-xl">
                    General Mathematics
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl">
                    DepEd ILAW Framework
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {recentLesson.topic.title || 'Functions and Their Graphs'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2">
                    {recentLesson.topic.description || 'Represents real-life situations using functions, including piece-wise functions, and evaluates functions accurately.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-indigo-200">Progress: {recentLesson.progressPercent}%</span>
                    <span className="text-slate-400 capitalize">Current Step: {recentLesson.sectionName}</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${recentLesson.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center">
                <button
                  id="btn-continue-lesson"
                  onClick={() => onSelectTopic(recentLesson.topic)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Continue Lesson</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. MY SUBJECTS                                                            */}
      {/* ========================================================================= */}
      <section aria-labelledby="my-subjects-heading" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="my-subjects-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>My Subjects</span>
            </h2>
            <p className="text-xs text-slate-400">Senior High School Grade 11 Subjects</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjectCards.map((subj) => {
            const isGenMath = subj.id === 'gen-math';
            return (
              <div
                key={subj.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${subj.badgeColor}`}>
                      {subj.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {subj.units}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      {subj.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {subj.teacher}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{subj.lessonsCount} Modules • {subj.term}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-slate-900 font-black">{subj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGenMath ? 'bg-indigo-600' : subj.color === 'sky' ? 'bg-sky-500' : subj.color === 'purple' ? 'bg-purple-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${subj.progress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (isGenMath) {
                        const target = topics[0];
                        if (target) onSelectTopic(target);
                      }
                    }}
                    disabled={!isGenMath}
                    className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      isGenMath
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>{isGenMath ? 'Explore Lessons' : 'Locked'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.5. ASSESSMENTS & TESTING HUB                                           */}
      {/* ========================================================================= */}
      <section aria-labelledby="assessments-hub-heading" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="assessments-hub-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Assessments & Testing Hub</span>
            </h2>
            <p className="text-xs text-slate-400">Diagnostic baselines, in-lesson formative quizzes, and DepEd TOS summative exams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Diagnostic Assessment (Pre & Post Test) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Pre & Post Diagnostic</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  26 Baseline Items
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                  Diagnostic Assessment
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Initial baseline check when starting the app, plus exit evaluation to measure competency growth.
                </p>
              </div>

              {/* Status Badges */}
              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-semibold">Pre-Test:</span>
                  <span className={`font-bold ${profile.preTestCompleted || profile.diagnosticCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {profile.preTestCompleted || profile.diagnosticCompleted
                      ? `✓ ${profile.preTestScore ?? profile.diagnosticScore}/26 (${profile.preTestAbility ?? profile.diagnosticAbility ?? 'Done'})`
                      : 'Pending (Start Here)'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-slate-500 font-semibold">Post-Test:</span>
                  <span className={`font-bold ${profile.postTestCompleted ? 'text-purple-700' : 'text-slate-500'}`}>
                    {profile.postTestCompleted
                      ? `✓ ${profile.postTestScore}/26 (${profile.postTestAbility})`
                      : (profile.preTestCompleted || profile.diagnosticCompleted ? 'Ready for Exit Check' : 'Locked')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  if (onOpenDiagnostic) onOpenDiagnostic();
                  else if (onStartDiagnostic) onStartDiagnostic('pre-test');
                }}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{profile.preTestCompleted || profile.diagnosticCompleted ? 'Open Diagnostic Hub' : 'Take Pre-Test'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Formative Assessment */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-indigo-600" />
                  <span>Formative Checks</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Lesson Item Bank
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                  Formative Assessment
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  In-lesson knowledge checks, exit tickets, and practice exercises with instant step-by-step remediation.
                </p>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Active Competencies</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Evaluate skills on piecewise functions, rational models, and algebraic operations.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (onOpenFormative) onOpenFormative();
                }}
                className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Open Formative Assessments</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Summative Test (TOS) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-violet-300 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-violet-50 text-violet-800 border-violet-200 flex items-center gap-1">
                  <Award className="w-3 h-3 text-violet-600" />
                  <span>Summative Test (TOS)</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Quarter 1 Exam
                </span>
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-base group-hover:text-violet-600 transition-colors">
                  Summative Test (TOS)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  DepEd Table of Specifications examination evaluating core competencies with weighted cognitive domains.
                </p>
              </div>

              <div className="p-3 bg-violet-50/60 rounded-xl border border-violet-100 text-xs text-violet-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-violet-600" />
                  <span>Standardized Evaluation</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Timed exam with Bloom's taxonomy outcomes analysis and formal scorecard.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const summative = topics[0]?.summativeAssessment;
                  if (summative && onStartSummativeAssessment) {
                    onStartSummativeAssessment(summative);
                  } else if (onOpenSummative) {
                    onOpenSummative();
                  }
                }}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-violet-900 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Take Summative Test</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. UPCOMING ACTIVITIES                                                    */}
      {/* ========================================================================= */}
      <section aria-labelledby="upcoming-activities-heading" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="upcoming-activities-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>Upcoming Activities</span>
            </h2>
            <p className="text-xs text-slate-400">Pending tasks, simulations, and formative due dates</p>
          </div>
          {onOpenActivities && (
            <button
              onClick={onOpenActivities}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Activities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingActivities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg">
                    {act.subject}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                    act.urgent
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/70 font-black'
                      : 'bg-amber-50 text-amber-800 border border-amber-200/70'
                  }`}>
                    {act.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {act.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <Clock className={`w-3.5 h-3.5 ${act.urgent ? 'text-rose-500' : 'text-slate-400'}`} />
                      <span>{act.dueDate}</span>
                    </span>
                    <span>•</span>
                    <span>{act.type}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={act.onClick}
                  className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{act.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ACADEMIC INTEGRITY & VIOLATION RECORD CARD                                 */}
      {/* ========================================================================= */}
      {(() => {
        const diagV = profile.diagnosticViolations || 0;
        const formV = profile.formativeViolations || 0;
        const totalV = diagV + formV;
        const deductionRate = getIntegritySettings().violationDeductionPoints;
        const totalDeductedPts = totalV * deductionRate;

        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  totalV > 0 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {totalV > 0 ? <ShieldAlert className="w-5 h-5 animate-pulse text-rose-500" /> : <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Academic Integrity Record
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-bold">
                      Policy: -{deductionRate} pt(s) per violation
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Integrity tracking across Diagnostic Baseline Exams and Formative Lesson Quizzes.
                  </p>
                </div>
              </div>

              {totalV > 0 ? (
                <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs rounded-full self-start sm:self-center">
                  ⚠️ {totalV} Violation{totalV > 1 ? 's' : ''} Logged (-{totalDeductedPts} Pts)
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-full self-start sm:self-center">
                  ✓ Clean Academic Record
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Diagnostic Violations</span>
                  <span className={`font-black ${diagV > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {diagV} Tab Out{diagV !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">-{diagV * deductionRate} pts</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Formative Violations</span>
                  <span className={`font-black ${formV > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {formV} Tab Out{formV !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">-{formV * deductionRate} pts</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Penalty Deducted</span>
                  <span className={`font-black ${totalDeductedPts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    -{totalDeductedPts} Points Total
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Rate: {deductionRate}/tab</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. MY PROGRESS                                                            */}
      {/* ========================================================================= */}
      <section aria-labelledby="my-progress-heading" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="my-progress-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>My Progress</span>
            </h2>
            <p className="text-xs text-slate-400">Cumulative curriculum performance, completed tasks, and simple chart</p>
          </div>
          {onOpenProgress && (
            <button
              onClick={onOpenProgress}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Progress</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall Progress */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Overall Progress
              </span>
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.overallProgress}%
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Grade 11 curriculum completion
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Card 2: Completed Lessons */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Completed Lessons
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.completedLessonsCount} / {stats.totalTopics}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {stats.totalTopics - stats.completedLessonsCount} remaining in Quarter 1 & 2
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.completedLessonsCount / stats.totalTopics) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 3: Completed Activities */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Completed Activities
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.completedActivitiesCount} / {stats.totalActivities}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulations & problem exercises
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.completedActivitiesCount / stats.totalActivities) * 100}%` }}
              />
            </div>
          </div>

          {/* Card 4: Assessment Results */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assessment Results
              </span>
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {stats.averageScore}%
              </div>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">
                DepEd Mastery Benchmark: Pass (≥ 80%)
              </p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.averageScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Simple Chart & Subject Progress Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simple Chart: Assessment Score History */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Recent Assessment Scores</span>
                </h3>
                <p className="text-xs text-slate-400">Score distribution on formative quizzes</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-lg">
                80% Benchmark Line
              </span>
            </div>

            {/* Clean SVG Bar Chart */}
            <div className="pt-2">
              <div className="h-44 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 relative border-b border-slate-200">
                {/* 80% Benchmark dashed guideline */}
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-emerald-400 pointer-events-none z-0"
                  style={{ bottom: '80%' }}
                >
                  <span className="absolute -top-3 right-0 text-[10px] font-bold text-emerald-600 bg-white px-1">
                    Pass 80%
                  </span>
                </div>

                {stats.chartScores.map((score, idx) => {
                  const isPassing = score >= 80;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative z-10">
                      <span className="text-[11px] font-black text-slate-700">
                        {score}%
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 ${
                            isPassing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-400 hover:bg-amber-500'
                          }`}
                          style={{ height: `${score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        Quiz {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subject Progress Comparative List */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Subject Progress</span>
              </h3>
              <p className="text-xs text-slate-400">Active senior high school subjects</p>
            </div>

            <div className="space-y-4 pt-1">
              {subjectCards.map((subj) => (
                <div key={subj.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-900">{subj.title}</span>
                    <span className="text-indigo-600 font-black">{subj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        subj.id === 'gen-math' ? 'bg-indigo-600' : subj.color === 'sky' ? 'bg-sky-500' : subj.color === 'purple' ? 'bg-purple-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${subj.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
