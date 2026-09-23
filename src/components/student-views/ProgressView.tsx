import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  BarChart3, 
  Sigma, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Trophy, 
  Target,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { Topic, QuizResult, UserProfile } from '../../types';
import LearningReports from '../LearningReports';

interface ProgressViewProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  initialTab?: 'subject' | 'competency' | 'grades';
  onRetakeDiagnostic?: () => void;
}

export default function ProgressView({
  topics,
  results,
  profile,
  initialTab = 'subject',
  onRetakeDiagnostic
}: ProgressViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'subject' | 'competency' | 'grades'>(initialTab);

  // Overall mastery calculation
  let totalProblems = 0;
  let earnedScore = 0;
  topics.forEach(t => {
    t.quizzes.forEach(q => {
      totalProblems += q.problems.length;
      const matching = results.filter(r => r.quizId === q.id);
      if (matching.length > 0) {
        earnedScore += Math.max(...matching.map(r => r.score));
      }
    });
  });

  const overallMastery = totalProblems > 0 ? Math.round((earnedScore / totalProblems) * 100) : 0;

  // DepEd Grade Simulator Calculation
  // Standard SHS Math Weight: Written Work (25%), Performance Tasks (50%), Quarterly Exam (25%)
  const writtenWorkAvg = results.length > 0 
    ? Math.min(100, Math.round(results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / results.length))
    : 80;
  const performanceTaskAvg = Math.min(100, Math.round(overallMastery * 0.9 + (profile.streak > 3 ? 10 : 5)));
  const summativeExams = results.filter(r => r.quizId.includes('summative') || r.quizId.includes('exam'));
  const examAvg = summativeExams.length > 0
    ? Math.round(summativeExams.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / summativeExams.length)
    : writtenWorkAvg;

  const initialGrade = (writtenWorkAvg * 0.25) + (performanceTaskAvg * 0.50) + (examAvg * 0.25);
  
  // DepEd Transmutation approximation formula
  const transmutedGrade = initialGrade >= 60 
    ? Math.min(100, Math.round(75 + ((initialGrade - 60) / 40) * 25))
    : Math.max(65, Math.round(initialGrade * 1.1));

  const getDepEdDescriptor = (grade: number) => {
    if (grade >= 90) return { label: 'Outstanding', color: 'text-emerald-600 bg-emerald-50' };
    if (grade >= 85) return { label: 'Very Satisfactory', color: 'text-indigo-600 bg-indigo-50' };
    if (grade >= 80) return { label: 'Satisfactory', color: 'text-blue-600 bg-blue-50' };
    if (grade >= 75) return { label: 'Fairly Satisfactory', color: 'text-amber-600 bg-amber-50' };
    return { label: 'Did Not Meet Expectations', color: 'text-rose-600 bg-rose-50' };
  };

  const gradeDescriptor = getDepEdDescriptor(transmutedGrade);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-rose-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Student Growth Engine</span>
            </span>
            <span className="bg-white/10 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Academic Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Academic Progress & Grades</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor curriculum milestone completion, competency mastery trajectories, and estimated DepEd quarterly grades.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('subject')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'subject'
              ? 'bg-white text-indigo-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          <span>Subject Progress</span>
        </button>

        <button
          onClick={() => setActiveSubTab('competency')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'competency'
              ? 'bg-white text-rose-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sigma className="w-4 h-4 text-rose-500" />
          <span>Competency Progress</span>
        </button>

        <button
          onClick={() => setActiveSubTab('grades')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'grades'
              ? 'bg-white text-emerald-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500" />
          <span>Grades & DepEd Transmutation</span>
        </button>
      </div>

      {/* 1. SUBJECT PROGRESS */}
      {activeSubTab === 'subject' && (
        <div className="space-y-6">
          {/* MY LEARNING PROGRESS Hero Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full tracking-wider">
                My Learning Progress
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Mathematics (General Mathematics)
              </h2>
              <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 rounded-full my-2" />
            </div>

            {/* Assessment & Lesson High-Level Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                  Diagnostic Assessment
                </span>
                <span className="text-2xl font-black text-amber-950">65%</span>
                <span className="text-[10px] text-amber-800 font-bold block">Pre-Learning Baseline</span>
              </div>

              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider block">
                  ILAW Lessons Progress
                </span>
                <span className="text-2xl font-black text-indigo-950">72%</span>
                <span className="text-[10px] text-indigo-800 font-bold block">Module Completion</span>
              </div>

              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                  Formative Checks
                </span>
                <span className="text-2xl font-black text-emerald-950">78%</span>
                <span className="text-[10px] text-emerald-800 font-bold block">In-Lesson Mastery</span>
              </div>
            </div>

            {/* Competency Progress Bars */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Competency Progress:
              </h3>

              <div className="space-y-2 text-xs">
                {/* Functions - 80% */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">Functions</span>
                    <span className="text-emerald-600 font-mono font-black">80%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>

                {/* Function Notation - 55% */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">Function Notation</span>
                    <span className="text-amber-600 font-mono font-black">55%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>

                {/* Evaluating Functions - 62% */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">Evaluating Functions</span>
                    <span className="text-indigo-600 font-mono font-black">62%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Lessons */}
            <div className="p-4 bg-indigo-950 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">
                  Targeted Learning Recommendations
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white/10 rounded-xl space-y-2 border border-white/10">
                  <span className="text-[10px] font-bold text-amber-300 block">Recommended for Function Notation (55%)</span>
                  <h4 className="text-xs font-black text-white">Lesson 1: Function Notation & Representations</h4>
                  <button
                    onClick={() => alert('Launching Lesson 1: Function Notation...')}
                    className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Start Recommended Lesson
                  </button>
                </div>

                <div className="p-3 bg-white/10 rounded-xl space-y-2 border border-white/10">
                  <span className="text-[10px] font-bold text-indigo-300 block">Recommended for Evaluating Functions (62%)</span>
                  <h4 className="text-xs font-black text-white">Lesson 2: Evaluating Piecewise & Polynomial Functions</h4>
                  <button
                    onClick={() => alert('Launching Lesson 2: Evaluating Functions...')}
                    className="w-full py-2 bg-indigo-400 hover:bg-indigo-300 text-slate-950 font-black text-[11px] rounded-lg transition-colors cursor-pointer"
                  >
                    Start Recommended Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Unit by Unit Progress Bars */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">General Mathematics Units Breakdown</h3>

            <div className="space-y-3 pt-1">
              {topics.map((topic, idx) => {
                let e = 0;
                let tot = 0;
                topic.quizzes.forEach(q => {
                  tot += q.problems.length;
                  const match = results.filter(r => r.quizId === q.id);
                  if (match.length > 0) e += Math.max(...match.map(r => r.score));
                });
                const pct = tot > 0 ? Math.round((e / tot) * 100) : 0;

                return (
                  <div key={topic.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">
                        {idx + 1}. {topic.title}
                      </span>
                      <span className={pct >= 80 ? 'text-emerald-600' : 'text-slate-500'}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPETENCY PROGRESS */}
      {activeSubTab === 'competency' && (
        <div>
          <LearningReports
            profile={profile}
            results={results}
            onTakeDiagnostic={onRetakeDiagnostic || (() => {})}
          />
        </div>
      )}

      {/* 3. GRADES & DEPED TRANSMUTATION */}
      {activeSubTab === 'grades' && (
        <div className="space-y-6">
          {/* Grade Summary Hero */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                Senior High School Grading Formula (DepEd D.O. 8, s. 2015)
              </span>
              <h2 className="text-2xl font-black text-slate-900">Estimated Quarterly Standing</h2>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Calculated dynamically from your formative practice quizzes, learning streak consistency, and summative exams.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-3xl border border-indigo-100/80 min-w-44 text-center">
              <span className="text-4xl font-black text-indigo-950 tracking-tight">{transmutedGrade}</span>
              <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-md mt-1 ${gradeDescriptor.color}`}>
                {gradeDescriptor.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-bold">Transmuted DepEd Grade</span>
            </div>
          </div>

          {/* 3 Component Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Written Work */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Written Work (25%)</span>
                <span className="text-lg font-black text-slate-900">{writtenWorkAvg}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quizzes, step-by-step problem sets, and formative mastery checks.
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${writtenWorkAvg}%` }} />
              </div>
            </div>

            {/* Performance Tasks */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Performance Tasks (50%)</span>
                <span className="text-lg font-black text-slate-900">{performanceTaskAvg}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                7-step pathways, active streak consistency, and flashcard drills.
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${performanceTaskAvg}%` }} />
              </div>
            </div>

            {/* Quarterly Assessment */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Quarterly Exam (25%)</span>
                <span className="text-lg font-black text-slate-900">{examAvg}%</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                DepEd Table of Specifications (TOS) summative examination score.
              </p>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${examAvg}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
