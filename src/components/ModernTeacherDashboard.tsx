import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
  GraduationCap,
  Layers,
  Calendar,
  CheckSquare,
  PlusCircle,
  Eye,
  Send,
  Zap,
  Filter
} from 'lucide-react';
import { UserProfile, Topic } from '../types';

interface ModernTeacherDashboardProps {
  profile: UserProfile;
  students: UserProfile[];
  topics: Topic[];
  onNavigateSection?: (section: string) => void;
  onOpenClass?: (sectionName: string) => void;
  onOpenLesson?: (lessonId: string) => void;
}

export default function ModernTeacherDashboard({
  profile,
  students,
  topics,
  onNavigateSection,
  onOpenClass,
  onOpenLesson
}: ModernTeacherDashboardProps) {
  const teacherName = profile?.displayName || 'Teacher';

  // 1. My Classes Data
  const classesList = [
    {
      id: 'stem-a',
      name: 'Grade 11 - STEM A',
      strand: 'Science, Technology, Engineering & Mathematics',
      studentCount: 35,
      attendanceRate: '98%',
      avgMastery: 86.4,
      pendingCount: 4,
      color: 'indigo',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      schedule: 'Mon / Wed / Fri • 8:00 AM - 9:30 AM'
    },
    {
      id: 'stem-b',
      name: 'Grade 11 - STEM B',
      strand: 'Science, Technology, Engineering & Mathematics',
      studentCount: 32,
      attendanceRate: '96%',
      avgMastery: 83.8,
      pendingCount: 2,
      color: 'sky',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
      schedule: 'Mon / Wed / Fri • 10:00 AM - 11:30 AM'
    },
    {
      id: 'abm-a',
      name: 'Grade 11 - ABM A',
      strand: 'Accountancy, Business & Management',
      studentCount: 30,
      attendanceRate: '94%',
      avgMastery: 81.2,
      pendingCount: 1,
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      schedule: 'Tue / Thu • 8:00 AM - 10:00 AM'
    },
    {
      id: 'humss-a',
      name: 'Grade 11 - HUMSS A',
      strand: 'Humanities & Social Sciences',
      studentCount: 28,
      attendanceRate: '92%',
      avgMastery: 79.5,
      pendingCount: 3,
      color: 'purple',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      schedule: 'Tue / Thu • 1:00 PM - 3:00 PM'
    }
  ];

  // 2. ILAW Lessons Data (Published, Draft, Assigned)
  const [lessonFilter, setLessonFilter] = useState<'all' | 'published' | 'draft' | 'assigned'>('all');

  const ilawLessons = [
    {
      id: 'ilaw-1',
      title: 'Introduction to Functions and Piecewise Modeling',
      topicCode: 'M11GM-Ia-1',
      quarter: 'Quarter 1',
      status: 'Published',
      assignedTo: 'Grade 11 - STEM A, STEM B',
      assignedDate: 'Oct 18, 2026',
      completionRate: 88,
      pillarsStatus: { I: true, L: true, A: true, W: true },
      views: 67
    },
    {
      id: 'ilaw-2',
      title: 'Rational Functions, Equations and Asymptotes',
      topicCode: 'M11GM-Ib-1',
      quarter: 'Quarter 1',
      status: 'Published',
      assignedTo: 'Grade 11 - STEM A, STEM B',
      assignedDate: 'Oct 20, 2026',
      completionRate: 72,
      pillarsStatus: { I: true, L: true, A: true, W: true },
      views: 59
    },
    {
      id: 'ilaw-3',
      title: 'Exponential Growth, Decay and Real-World Applications',
      topicCode: 'M11GM-Ie-1',
      quarter: 'Quarter 1',
      status: 'Assigned',
      assignedTo: 'Grade 11 - STEM A',
      assignedDate: 'Yesterday',
      completionRate: 45,
      pillarsStatus: { I: true, L: true, A: true, W: true },
      views: 34
    },
    {
      id: 'ilaw-4',
      title: 'Logarithmic Functions & Financial Amortization Scales',
      topicCode: 'M11GM-Ih-1',
      quarter: 'Quarter 1',
      status: 'Draft',
      assignedTo: 'Unassigned',
      assignedDate: 'Drafted 3 days ago',
      completionRate: 0,
      pillarsStatus: { I: true, L: true, A: false, W: false },
      views: 0
    },
    {
      id: 'ilaw-5',
      title: 'Simple and Compound Interest in Philippine Banking',
      topicCode: 'M11GM-IIa-1',
      quarter: 'Quarter 2',
      status: 'Draft',
      assignedTo: 'Unassigned',
      assignedDate: 'Drafted yesterday',
      completionRate: 0,
      pillarsStatus: { I: true, L: false, A: false, W: false },
      views: 0
    }
  ];

  const publishedCount = ilawLessons.filter(l => l.status === 'Published').length;
  const draftCount = ilawLessons.filter(l => l.status === 'Draft').length;
  const assignedCount = ilawLessons.filter(l => l.status === 'Assigned' || l.status === 'Published').length;

  const filteredLessons = ilawLessons.filter(l => {
    if (lessonFilter === 'published') return l.status === 'Published';
    if (lessonFilter === 'draft') return l.status === 'Draft';
    if (lessonFilter === 'assigned') return l.status === 'Assigned' || l.status === 'Published';
    return true;
  });

  // 3. Recent Activity Data (Student submissions, Completed lessons, Quiz results, Pending grading)
  const recentActivities = [
    {
      id: 'act-1',
      type: 'submission',
      title: '3D Box Packaging Optimization Performance Task',
      student: 'Maria Santos',
      section: 'Grade 11 - STEM A',
      time: '12 minutes ago',
      badgeText: 'Pending Grading',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
      actionLabel: 'Grade Rubric',
      navTarget: 'activities-submissions'
    },
    {
      id: 'act-2',
      type: 'completed-lesson',
      title: 'Completed 9-Step Lesson: Rational Functions & Graphs',
      student: 'Juan Carlos Reyes',
      section: 'Grade 11 - STEM B',
      time: '34 minutes ago',
      badgeText: 'Lesson Completed',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      actionLabel: 'View Portfolio',
      navTarget: 'classes-students'
    },
    {
      id: 'act-3',
      type: 'quiz-result',
      title: 'Formative Assessment: Piecewise Functions Checkpoint',
      student: 'Chloe Villanueva',
      section: 'Grade 11 - STEM A',
      time: '1 hour ago',
      badgeText: 'Score: 100% (5/5)',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      actionLabel: 'Inspect Answers',
      navTarget: 'assessments-formative-results'
    },
    {
      id: 'act-4',
      type: 'submission',
      title: 'Piecewise Jeepney Tariff Tariff Sheet Submission',
      student: 'Gabriel Mendoza',
      section: 'Grade 11 - STEM B',
      time: '2 hours ago',
      badgeText: 'Pending Grading',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
      actionLabel: 'Grade Rubric',
      navTarget: 'activities-submissions'
    },
    {
      id: 'act-5',
      type: 'quiz-result',
      title: 'Diagnostic Test: Rational Equations & Extraneous Roots',
      student: 'Samantha Cruz',
      section: 'Grade 11 - STEM A',
      time: '3 hours ago',
      badgeText: 'Score: 80% (4/5)',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      actionLabel: 'Inspect Answers',
      navTarget: 'assessments-diagnostic-results'
    }
  ];

  // 4. Class Performance Metrics & Charts Data
  const competencyData = [
    { code: 'M11GM-Ia-1', name: 'Functions & Piecewise Relations', mastery: 91, benchmarkMet: true },
    { code: 'M11GM-Ia-2', name: 'Evaluation of Functions', mastery: 88, benchmarkMet: true },
    { code: 'M11GM-Ia-3', name: 'Operations & Composition', mastery: 82, benchmarkMet: true },
    { code: 'M11GM-Ib-1', name: 'Rational Functions & Models', mastery: 78, benchmarkMet: false },
    { code: 'M11GM-Ib-2', name: 'Rational Equations & Inequalities', mastery: 74, benchmarkMet: false }
  ];

  const assessmentChartData = [
    { label: 'Diagnostic 1', stemA: 82, stemB: 78 },
    { label: 'Quiz 1: Functions', stemA: 89, stemB: 85 },
    { label: 'Quiz 2: Evaluation', stemA: 92, stemB: 88 },
    { label: 'Quiz 3: Rational', stemA: 79, stemB: 76 },
    { label: 'Mid-Quarter TOS', stemA: 87, stemB: 84 }
  ];

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. GREETING HEADER                                                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>Senior High School • Faculty Instruction Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, {teacherName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor class competencies, review pending student submissions, and manage DepEd ILAW lesson plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
          <button
            onClick={() => onNavigateSection?.('lessons-create')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Lesson</span>
          </button>
          <button
            onClick={() => onNavigateSection?.('activities-submissions')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Review Pending (2)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MY CLASSES                                                             */}
      {/* ========================================================================= */}
      <section aria-labelledby="my-classes-heading" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="my-classes-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>My Classes</span>
            </h2>
            <p className="text-xs text-slate-400">Active Senior High School cohort sections</p>
          </div>
          <button
            onClick={() => onNavigateSection?.('classes-sections')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>All Sections</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classesList.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${cls.badgeClass}`}>
                    Grade 11
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {cls.attendanceRate} Att.
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                    {cls.name}
                  </h3>
                  <div className="text-2xl font-black text-indigo-950 mt-1">
                    {cls.studentCount} <span className="text-xs font-bold text-slate-400">Students</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {cls.strand}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">Average Mastery</span>
                    <span className="text-slate-900 font-black">{cls.avgMastery}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${cls.avgMastery}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {cls.pendingCount} pending reviews
                </span>
                <button
                  onClick={() => {
                    if (onOpenClass) onOpenClass(cls.id);
                    else onNavigateSection?.('classes-students');
                  }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ILAW LESSONS                                                           */}
      {/* ========================================================================= */}
      <section aria-labelledby="ilaw-lessons-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h2 id="ilaw-lessons-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>ILAW Lessons</span>
            </h2>
            <p className="text-xs text-slate-400">DepEd Order No. 016, s. 2024 Daily Lesson Plans & Modules</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setLessonFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                lessonFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({ilawLessons.length})
            </button>
            <button
              onClick={() => setLessonFilter('published')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                lessonFilter === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Published</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                lessonFilter === 'published' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {publishedCount}
              </span>
            </button>
            <button
              onClick={() => setLessonFilter('draft')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                lessonFilter === 'draft'
                  ? 'bg-slate-800 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Draft</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                lessonFilter === 'draft' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {draftCount}
              </span>
            </button>
            <button
              onClick={() => setLessonFilter('assigned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                lessonFilter === 'assigned'
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Assigned</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                lessonFilter === 'assigned' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {assignedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Lesson Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => {
            const isPublished = lesson.status === 'Published';
            const isDraft = lesson.status === 'Draft';
            return (
              <div
                key={lesson.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                      {lesson.topicCode}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      isPublished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDraft
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {lesson.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Assigned to: <span className="font-semibold text-slate-600">{lesson.assignedTo}</span>
                    </p>
                  </div>

                  {/* 4 Pillars Status Badges */}
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">ILAW:</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      lesson.pillarsStatus.I ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-400'
                    }`} title="Intentions">I</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      lesson.pillarsStatus.L ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'
                    }`} title="Learning Experience">L</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      lesson.pillarsStatus.A ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'
                    }`} title="Assessing Learning">A</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      lesson.pillarsStatus.W ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                    }`} title="Ways Forward">W</span>
                  </div>

                  {/* Completion Progress Bar */}
                  {lesson.completionRate > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Student Completion</span>
                        <span className="text-indigo-600">{lesson.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${lesson.completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {lesson.assignedDate}
                  </span>
                  <button
                    onClick={() => {
                      if (onOpenLesson) onOpenLesson(lesson.id);
                      else onNavigateSection?.('lessons-my');
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{isDraft ? 'Edit Draft' : 'Open Lesson'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. RECENT ACTIVITY                                                        */}
      {/* ========================================================================= */}
      <section aria-labelledby="recent-activity-heading" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="recent-activity-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Recent Activity</span>
            </h2>
            <p className="text-xs text-slate-400">Live stream of student submissions, completed lessons, quiz results, and pending grading</p>
          </div>
          <button
            onClick={() => onNavigateSection?.('activities-submissions')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>All Submissions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {recentActivities.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === 'submission'
                    ? 'bg-amber-50 text-amber-600'
                    : item.type === 'completed-lesson'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {item.type === 'submission' ? (
                    <ClipboardList className="w-4 h-4" />
                  ) : item.type === 'completed-lesson' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {item.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${item.badgeColor}`}>
                      {item.badgeText}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{item.student}</span> • {item.section} • <span className="text-slate-400">{item.time}</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onNavigateSection?.(item.navTarget)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{item.actionLabel}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CLASS PERFORMANCE & CHARTS                                            */}
      {/* ========================================================================= */}
      <section aria-labelledby="class-performance-heading" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 id="class-performance-heading" className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Class Performance</span>
            </h2>
            <p className="text-xs text-slate-400">Class averages, lesson completions, assessment distributions, and competency mastery</p>
          </div>
          <button
            onClick={() => onNavigateSection?.('analytics-class')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Detailed Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Average Class Performance
            </span>
            <div className="text-3xl font-black text-slate-900">
              85.1%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.4% from Diagnostic Baseline</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Lesson Completion
            </span>
            <div className="text-3xl font-black text-indigo-600">
              80.0%
            </div>
            <div className="text-xs text-slate-500">
              67 of 67 students finished Module 1
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Assessment Performance
            </span>
            <div className="text-3xl font-black text-emerald-600">
              88.6%
            </div>
            <div className="text-xs text-emerald-700 font-semibold">
              92% reached DepEd &ge; 80% passing
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Competency Progress
            </span>
            <div className="text-3xl font-black text-purple-600">
              4 / 5
            </div>
            <div className="text-xs text-slate-500">
              Q1 MELCs passed mastery threshold
            </div>
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Assessment Performance Comparison (STEM A vs STEM B) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Assessment Performance (STEM A vs STEM B)</span>
                </h3>
                <p className="text-xs text-slate-400">Scores across diagnostic, formative, and mid-quarter assessments</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  STEM A
                </span>
                <span className="flex items-center gap-1 text-sky-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  STEM B
                </span>
              </div>
            </div>

            {/* SVG / HTML Bar Chart */}
            <div className="pt-2">
              <div className="h-48 w-full flex items-end justify-between gap-4 sm:gap-6 px-2 relative border-b border-slate-200">
                {/* 80% Mastery benchmark guideline */}
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-emerald-400 pointer-events-none z-0"
                  style={{ bottom: '80%' }}
                >
                  <span className="absolute -top-3 right-0 text-[10px] font-bold text-emerald-600 bg-white px-1">
                    DepEd Passing 80%
                  </span>
                </div>

                {assessmentChartData.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative z-10">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* STEM A Bar */}
                      <div className="w-1/2 bg-slate-100 rounded-t-lg h-full flex items-end">
                        <div
                          className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-t-lg transition-all duration-500"
                          style={{ height: `${item.stemA}%` }}
                          title={`STEM A: ${item.stemA}%`}
                        />
                      </div>
                      {/* STEM B Bar */}
                      <div className="w-1/2 bg-slate-100 rounded-t-lg h-full flex items-end">
                        <div
                          className="w-full bg-sky-500 hover:bg-sky-600 rounded-t-lg transition-all duration-500"
                          style={{ height: `${item.stemB}%` }}
                          title={`STEM B: ${item.stemB}%`}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center truncate max-w-full">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Competency Progress (DepEd MELCs Mastery Bars) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Competency Progress</span>
              </h3>
              <p className="text-xs text-slate-400">Quarter 1 MELCs Mastery Threshold (DepEd &ge; 75%)</p>
            </div>

            <div className="space-y-3.5 pt-1">
              {competencyData.map((comp) => (
                <div key={comp.code} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-black text-indigo-900 mr-1.5">{comp.code}</span>
                      <span className="text-slate-600 font-medium truncate inline-block max-w-[160px] align-bottom">
                        {comp.name}
                      </span>
                    </div>
                    <span className={`font-black ${comp.benchmarkMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {comp.mastery}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        comp.benchmarkMet ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${comp.mastery}%` }}
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
