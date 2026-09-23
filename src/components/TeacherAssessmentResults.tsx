import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, Users, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, Sparkles, Filter, ChevronRight, X, UserX, BookOpen, Send
} from 'lucide-react';

interface StudentSupportRecord {
  id: string;
  name: string;
  diagnosticScore: number;
  formativeScore: number;
  weakCompetency: string;
  recommendedLesson: string;
}

const SAMPLE_SUPPORT_STUDENTS: StudentSupportRecord[] = [
  {
    id: 's-1',
    name: 'Juan Dela Cruz',
    diagnosticScore: 45,
    formativeScore: 52,
    weakCompetency: 'Function Notation',
    recommendedLesson: 'Lesson 1: Introduction to Function Notation'
  },
  {
    id: 's-2',
    name: 'Maria Santos',
    diagnosticScore: 50,
    formativeScore: 58,
    weakCompetency: 'Evaluating Functions',
    recommendedLesson: 'Lesson 2: Evaluating Functions & Piecewise Fares'
  },
  {
    id: 's-3',
    name: 'Pedro Reyes',
    diagnosticScore: 40,
    formativeScore: 50,
    weakCompetency: 'Function Notation',
    recommendedLesson: 'Lesson 1: Introduction to Function Notation'
  },
  {
    id: 's-4',
    name: 'Ana Ramos',
    diagnosticScore: 55,
    formativeScore: 60,
    weakCompetency: 'Evaluating Functions',
    recommendedLesson: 'Lesson 2: Evaluating Functions & Piecewise Fares'
  },
  {
    id: 's-5',
    name: 'Jose Rizal Jr.',
    diagnosticScore: 42,
    formativeScore: 55,
    weakCompetency: 'Domain & Range',
    recommendedLesson: 'Lesson 3: Domain and Range of Algebraic Functions'
  }
];

export default function TeacherAssessmentResults() {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);

  const handleToggleAssign = (studentId: string) => {
    if (assignedStudents.includes(studentId)) {
      setAssignedStudents(assignedStudents.filter(id => id !== studentId));
    } else {
      setAssignedStudents([...assignedStudents, studentId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Real-Time Class Analytics
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                General Mathematics • Grade 11
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              CLASS PERFORMANCE
            </h2>
          </div>

          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>View Students Needing Support</span>
          </button>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Students Assessed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">35</span>
              <span className="text-xs font-bold text-emerald-600">/ 36 Enrolled</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Average Diagnostic Result</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900">64%</span>
              <span className="text-[10px] font-bold text-amber-700">Pre-Lesson Baseline</span>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Average Formative Result</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-900">78%</span>
              <span className="text-xs font-bold text-emerald-600">+14% Growth</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Completion Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900">98%</span>
              <span className="text-[10px] font-bold text-emerald-700">On-Time Submission</span>
            </div>
          </div>
        </div>

        {/* Competency Analysis Progress Bars */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Competency Analysis
            </h3>
            <span className="text-xs font-bold text-slate-400">Class Average</span>
          </div>

          <div className="space-y-3">
            {/* Functions - 78% */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 font-bold">Functions</span>
                <span className="text-emerald-600 font-mono font-black">78%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: '78%' }}
                />
              </div>
            </div>

            {/* Function Notation - 49% */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 font-bold">Function Notation</span>
                <span className="text-rose-600 font-mono font-black">49%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: '49%' }}
                />
              </div>
            </div>

            {/* Evaluating Functions - 55% */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 font-bold">Evaluating Functions</span>
                <span className="text-amber-600 font-mono font-black">55%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: '55%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Learning Gaps & Interventions Callout */}
        <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Identified Learning Gaps & Actionable Interventions</span>
          </div>

          <ul className="space-y-2 text-xs font-bold text-slate-800">
            <li className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-rose-100">
              <span className="text-rose-950 font-black">
                • 14 students need additional support with Function Notation.
              </span>
              <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                High Priority
              </span>
            </li>
            <li className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-rose-100">
              <span className="text-rose-950 font-black">
                • 11 students need additional support with Evaluating Functions.
              </span>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Medium Priority
              </span>
            </li>
          </ul>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Support Roster & Send Remediation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Students Needing Support Modal / Drawer */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="bg-rose-600 p-6 text-white flex items-center justify-between">
                <div className="space-y-1">
                  <span className="bg-white/20 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                    Targeted Intervention Roster
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Students Needing Additional Support
                  </h3>
                  <p className="text-xs text-rose-100">
                    Automated analysis from Diagnostic & Formative checks.
                  </p>
                </div>

                <button
                  onClick={() => setIsSupportModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="space-y-3">
                  {SAMPLE_SUPPORT_STUDENTS.map((student) => {
                    const isAssigned = assignedStudents.includes(student.id);

                    return (
                      <div
                        key={student.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900 text-sm">{student.name}</h4>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                              Diag: {student.diagnosticScore}%
                            </span>
                            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                              Formative: {student.formativeScore}%
                            </span>
                          </div>
                          <p className="text-xs font-bold text-rose-600">
                            Weak Competency: {student.weakCompetency}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Recommended: {student.recommendedLesson}
                          </p>
                        </div>

                        <button
                          onClick={() => handleToggleAssign(student.id)}
                          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isAssigned
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isAssigned ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Remediation Assigned</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Assign Remediation</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  Close Roster
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
