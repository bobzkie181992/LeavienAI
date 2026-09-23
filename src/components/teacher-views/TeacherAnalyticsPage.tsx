import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Target,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  FileText,
  ChevronDown,
  ArrowUpRight,
  BookOpen,
  Award,
  Layers,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Eye,
  CheckSquare,
  Search,
  Info
} from 'lucide-react';
import { UserProfile, Topic } from '../../types';

interface TeacherAnalyticsPageProps {
  students: UserProfile[];
  topics: Topic[];
  profile?: UserProfile;
  initialSubTab?: 'class' | 'students-attention' | 'competencies' | 'submissions';
}

export default function TeacherAnalyticsPage({
  students,
  topics,
  profile,
  initialSubTab = 'class'
}: TeacherAnalyticsPageProps) {
  // Navigation subtabs
  const [activeTab, setActiveTab] = useState<'class' | 'students-attention' | 'competencies' | 'submissions'>(initialSubTab);

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('General Mathematics');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Quarter 1');
  const [selectedLesson, setSelectedLesson] = useState<string>('All');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('All');

  // Filter Options
  const classesList = ['All', 'Grade 11 - STEM A', 'Grade 11 - STEM B', 'Grade 11 - ABM A', 'Grade 11 - HUMSS A'];
  const subjectsList = ['General Mathematics', 'Statistics & Probability', 'Pre-Calculus', 'Basic Calculus'];
  const quartersList = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];
  const lessonsList = [
    'All',
    'Functions & Piecewise Relations',
    'Rational Functions & Equations',
    'Inverse Functions',
    'Exponential Growth & Decay',
    'Logarithmic Functions'
  ];
  const assessmentsList = [
    'All',
    'Diagnostic Checkpoint',
    'Formative Quiz 1',
    'Formative Quiz 2',
    'Mid-Quarter TOS Summative Exam',
    'Performance Task Rubric'
  ];

  // 1. Overall Aggregated Class Metrics (Adjusts dynamically with filters)
  const classAverage = useMemo(() => {
    if (selectedClass === 'Grade 11 - STEM A') return 87.2;
    if (selectedClass === 'Grade 11 - STEM B') return 84.5;
    if (selectedClass === 'Grade 11 - ABM A') return 81.3;
    if (selectedClass === 'Grade 11 - HUMSS A') return 79.8;
    return 84.8;
  }, [selectedClass]);

  const studentCompletionRate = useMemo(() => {
    if (selectedQuarter === 'Quarter 2') return 48.0;
    if (selectedQuarter === 'Quarter 3' || selectedQuarter === 'Quarter 4') return 12.0;
    return 86.5;
  }, [selectedQuarter]);

  const lessonCompletion = useMemo(() => {
    if (selectedQuarter === 'Quarter 2') return 42.0;
    if (selectedQuarter === 'Quarter 3' || selectedQuarter === 'Quarter 4') return 8.0;
    return 81.4;
  }, [selectedQuarter]);

  const assessmentPerformance = useMemo(() => {
    if (selectedAssessment === 'Diagnostic Checkpoint') return 78.4;
    if (selectedAssessment === 'Mid-Quarter TOS Summative Exam') return 83.2;
    return 88.6;
  }, [selectedAssessment]);

  // 2. Students who may need attention (At-Risk / Low Mastery)
  const atRiskStudents = [
    {
      id: 's-1',
      name: 'Joshua Ramirez',
      section: 'Grade 11 - STEM A',
      lrn: '12849102911',
      averageScore: 68,
      status: 'Critical Intervention',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
      troubleTopic: 'Rational Equations & Inequalities',
      missingSubmissions: 3,
      lastActive: '3 days ago',
      interventionNote: 'Struggles with extraneous solutions check and clearing algebraic LCD.'
    },
    {
      id: 's-2',
      name: 'Kaye Andrea David',
      section: 'Grade 11 - STEM B',
      lrn: '12849102918',
      averageScore: 71,
      status: 'Needs Remediation',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      troubleTopic: 'Inverse Functions & Domain Restrictions',
      missingSubmissions: 2,
      lastActive: 'Yesterday',
      interventionNote: 'Failed 1-to-1 horizontal line test diagnostic; recommended for 7-step remediation.'
    },
    {
      id: 's-3',
      name: 'Mark Lester Aquino',
      section: 'Grade 11 - STEM A',
      lrn: '12849102925',
      averageScore: 73,
      status: 'Needs Remediation',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      troubleTopic: 'Exponential Modeling & Logarithmic Scales',
      missingSubmissions: 1,
      lastActive: '5 hours ago',
      interventionNote: 'Score drop after word problem modeling; requires visual graphing scaffolding.'
    },
    {
      id: 's-4',
      name: 'Princess Nicole Reyes',
      section: 'Grade 11 - STEM B',
      lrn: '12849102932',
      averageScore: 74,
      status: 'Moderate Support',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
      troubleTopic: 'Piecewise Step Tariff Calculations',
      missingSubmissions: 1,
      lastActive: 'Today',
      interventionNote: 'Minor calculation error in boundary intervals ($x \\le 4$ vs $x > 4$).'
    }
  ];

  // 3. Activity Submission Status
  const activitySubmissions = [
    {
      id: 'sub-1',
      activityTitle: '3D Box Packaging Optimization Performance Task',
      subject: 'General Mathematics',
      quarter: 'Quarter 1',
      type: 'Performance Task',
      totalAssigned: 67,
      submitted: 61,
      graded: 55,
      pendingGrading: 6,
      dueDate: 'Oct 24, 2026',
      status: 'Active Review'
    },
    {
      id: 'sub-2',
      activityTitle: 'Piecewise Jeepney Tariff Tariff Sheet Submission',
      subject: 'General Mathematics',
      quarter: 'Quarter 1',
      type: 'Worksheet',
      totalAssigned: 67,
      submitted: 65,
      graded: 63,
      pendingGrading: 2,
      dueDate: 'Oct 20, 2026',
      status: 'Almost Complete'
    },
    {
      id: 'sub-3',
      activityTitle: 'Rational Asymptote GeoGebra Graphing Portfolio',
      subject: 'General Mathematics',
      quarter: 'Quarter 1',
      type: 'Real-World Case Study',
      totalAssigned: 67,
      submitted: 58,
      graded: 48,
      pendingGrading: 10,
      dueDate: 'Oct 28, 2026',
      status: 'In Progress'
    },
    {
      id: 'sub-4',
      activityTitle: 'Compound Interest Loan Calculator Spreadsheet',
      subject: 'General Mathematics',
      quarter: 'Quarter 2',
      type: 'Performance Task',
      totalAssigned: 67,
      submitted: 32,
      graded: 20,
      pendingGrading: 12,
      dueDate: 'Nov 12, 2026',
      status: 'Open for Submission'
    }
  ];

  // 4. Competency Mastery Data
  const competenciesMastery = [
    {
      code: 'M11GM-Ia-1',
      name: 'Represents real-life situations using functions, including piece-wise functions',
      quarter: 'Quarter 1',
      classAverage: 91.5,
      studentsMastered: 61,
      studentsRemediating: 6,
      benchmark: 'Mastered (≥ 80%)'
    },
    {
      code: 'M11GM-Ia-2',
      name: 'Evaluates a function accurately with given domain inputs',
      quarter: 'Quarter 1',
      classAverage: 88.2,
      studentsMastered: 58,
      studentsRemediating: 9,
      benchmark: 'Mastered (≥ 80%)'
    },
    {
      code: 'M11GM-Ia-3',
      name: 'Performs operations and composition of functions',
      quarter: 'Quarter 1',
      classAverage: 82.4,
      studentsMastered: 54,
      studentsRemediating: 13,
      benchmark: 'Mastered (≥ 80%)'
    },
    {
      code: 'M11GM-Ib-1',
      name: 'Distinguishes rational function, rational equation, and rational inequality',
      quarter: 'Quarter 1',
      classAverage: 77.8,
      studentsMastered: 48,
      studentsRemediating: 19,
      benchmark: 'In Progress (Target 80%)'
    },
    {
      code: 'M11GM-Ib-2',
      name: 'Solves rational equations and inequalities with domain restrictions',
      quarter: 'Quarter 1',
      classAverage: 73.6,
      studentsMastered: 42,
      studentsRemediating: 25,
      benchmark: 'Focus Remediation Needed'
    }
  ];

  // Filtered At Risk Students
  const filteredAtRisk = atRiskStudents.filter((s) => {
    if (selectedClass !== 'All' && s.section !== selectedClass) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. HEADER BANNER                                                          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>Academic Intelligence & Psychometrics</span>
            </span>
            <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Live Cohort Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Teacher Analytics & Class Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Filter class metrics by Class, Subject, Quarter, Lesson, and Assessment. Monitor at-risk students for early intervention and track real-time activity submission rubrics.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. COMPREHENSIVE FILTER BAR                                               */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Data Filters</span>
          </span>
          <button
            onClick={() => {
              setSelectedClass('All');
              setSelectedSubject('General Mathematics');
              setSelectedQuarter('Quarter 1');
              setSelectedLesson('All');
              setSelectedAssessment('All');
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {/* Filter 1: Class */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Class</label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {classesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter 2: Subject */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Subject</label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter 3: Quarter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Quarter</label>
            <div className="relative">
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {quartersList.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter 4: Lesson */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Lesson</label>
            <div className="relative">
              <select
                value={selectedLesson}
                onChange={(e) => setSelectedLesson(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {lessonsList.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter 5: Assessment */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[11px] font-bold text-slate-600 block">Assessment</label>
            <div className="relative">
              <select
                value={selectedAssessment}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {assessmentsList.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. KEY METRICS DISPLAY (Class Average, Completion, Assessments, etc.)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Class Average */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Class Average
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {classAverage}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.2% above DepEd 80% passing</span>
          </div>
        </div>

        {/* Metric 2: Student Completion Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student Completion Rate
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {studentCompletionRate}%
          </div>
          <div className="text-xs text-slate-500">
            {Math.round((studentCompletionRate / 100) * 67)} of 67 students active
          </div>
        </div>

        {/* Metric 3: Lesson Completion */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lesson Completion
            </span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-600">
            {lessonCompletion}%
          </div>
          <div className="text-xs text-slate-500">
            ILAW 4-Pillar Modules Completed
          </div>
        </div>

        {/* Metric 4: Assessment Performance */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assessment Performance
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">
            {assessmentPerformance}%
          </div>
          <div className="text-xs text-slate-500">
            Weighted TOS Diagnostic & Formative
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SUB-TABS (At-Risk Attention, Competency Mastery, Submissions)          */}
      {/* ========================================================================= */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1.5 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('class')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'class'
              ? 'bg-slate-900 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span>Class Performance & Visual Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('students-attention')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'students-attention'
              ? 'bg-slate-900 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Students Needing Attention ({filteredAtRisk.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('competencies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'competencies'
              ? 'bg-slate-900 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4 text-sky-400" />
          <span>Competency Mastery Progress</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-slate-900 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-amber-400" />
          <span>Activity Submission Status</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. TAB 1: VISUAL CHARTS & CLASS PERFORMANCE                               */}
      {/* ========================================================================= */}
      {activeTab === 'class' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Chart: Assessment Comparison */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Assessment Score Distribution by Unit</span>
                </h3>
                <p className="text-xs text-slate-400">Comparing Class Mean vs DepEd 80% Mastery Benchmark</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-indigo-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  Class Mean
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Benchmark
                </span>
              </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="pt-2">
              <div className="h-56 w-full flex items-end justify-between gap-4 sm:gap-8 px-4 relative border-b border-slate-200">
                {/* 80% Guideline */}
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-emerald-400 pointer-events-none z-0"
                  style={{ bottom: '80%' }}
                >
                  <span className="absolute -top-3.5 right-2 text-[10px] font-bold text-emerald-600 bg-white px-1">
                    DepEd Passing 80%
                  </span>
                </div>

                {[
                  { label: 'Piecewise Modeling', mean: 92 },
                  { label: 'Evaluation of Functions', mean: 88 },
                  { label: 'Operations & Composition', mean: 82 },
                  { label: 'Rational Equations', mean: 74 },
                  { label: 'Inverse Functions', mean: 85 },
                  { label: 'Exponential Modeling', mean: 79 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative z-10">
                    <span className="text-xs font-black text-slate-700">
                      {item.mean}%
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          item.mean >= 80 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-400 hover:bg-amber-500'
                        }`}
                        style={{ height: `${item.mean}%` }}
                        title={`${item.label}: ${item.mean}%`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center truncate max-w-full">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Intervention Diagnostics</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Class mean is strongest in <strong>Piecewise Modeling (92%)</strong> and lowest in <strong>Rational Equations (74%)</strong>.
              </p>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                <span className="font-black text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Recommended Action:
                </span>
                <p className="text-amber-900">
                  Assign 7-step remediation on clearing extraneous roots in Rational Functions before the Mid-Quarter TOS Exam.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Mastery Target Reached</span>
                <span className="text-slate-900 font-bold">5 of 6 Units</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '83%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 2: STUDENTS WHO MAY NEED ATTENTION                                 */}
      {/* ========================================================================= */}
      {activeTab === 'students-attention' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Students Who May Need Attention</span>
              </h3>
              <p className="text-xs text-slate-400">
                Flagged learners scoring below DepEd 75% or missing critical formative/summative submissions
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 self-start sm:self-auto">
              {filteredAtRisk.length} Flagged Learners
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredAtRisk.map((student) => (
              <div
                key={student.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 font-black flex items-center justify-center text-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{student.name}</h4>
                      <p className="text-xs text-slate-400">
                        {student.section} • LRN: {student.lrn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${student.statusColor}`}>
                      {student.status}
                    </span>
                    <span className="text-sm font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                      {student.averageScore}% Avg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Struggle Concept</span>
                    <span className="font-bold text-slate-800">{student.troubleTopic}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Missing Submissions</span>
                    <span className="font-bold text-rose-600">{student.missingSubmissions} Tasks Overdue</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-xl flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{student.interventionNote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB 3: COMPETENCY MASTERY PROGRESS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'competencies' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Learning Competency Mastery & Progress</span>
              </h3>
              <p className="text-xs text-slate-400">
                Department of Education MELCs breakdown with mastery and remediation counts
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 self-start sm:self-auto">
              Cohort: 67 Students
            </span>
          </div>

          <div className="space-y-4">
            {competenciesMastery.map((comp) => {
              const isPassing = comp.classAverage >= 80;
              return (
                <div
                  key={comp.code}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-lg border border-indigo-200">
                        {comp.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {comp.quarter}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isPassing ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.benchmark}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {comp.classAverage}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">
                    {comp.name}
                  </p>

                  {/* Visual Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPassing ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${comp.classAverage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-1">
                      <span>{comp.studentsMastered} students mastered</span>
                      <span className="text-amber-700">{comp.studentsRemediating} students needing review</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB 4: ACTIVITY SUBMISSION STATUS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-600" />
                <span>Activity Submission Status & Pending Rubrics</span>
              </h3>
              <p className="text-xs text-slate-400">
                Track submitted performance tasks, problem sets, and pending teacher evaluations
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 self-start sm:self-auto">
              Total Pending: 20 Submissions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activitySubmissions.map((act) => {
              const submitRate = Math.round((act.submitted / act.totalAssigned) * 100);
              return (
                <div
                  key={act.id}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {act.type}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Due: {act.dueDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      {act.activityTitle}
                    </h4>

                    {/* Submission Progress */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Submission Rate</span>
                        <span className="text-slate-900 font-bold">{act.submitted} / {act.totalAssigned} ({submitRate}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${submitRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                      {act.pendingGrading} to grade
                    </span>
                    <button
                      className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Review Rubric</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
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
