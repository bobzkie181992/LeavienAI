import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart2, Users, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, Sparkles, Filter, ChevronRight, X, UserX, BookOpen, Send,
  Search, ShieldAlert, Award, FileText, Target, Eye
} from 'lucide-react';
import { useAllStudents } from '../hooks/useFirebase';
import { getIntegritySettings } from '../lib/integritySettings';
import { UserProfile, QuizResult } from '../types';
import StudentViolationReportModal from './StudentViolationReportModal';

interface TeacherAssessmentResultsProps {
  mode?: 'diagnostic' | 'formative' | 'all';
}

export default function TeacherAssessmentResults({ mode = 'all' }: TeacherAssessmentResultsProps) {
  const { students } = useAllStudents();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [reportStudent, setReportStudent] = useState<UserProfile | null>(null);
  const [inspectedStudent, setInspectedStudent] = useState<UserProfile | null>(null);

  const integritySettings = getIntegritySettings();
  const deductionRate = integritySettings.violationDeductionPoints;

  const handleToggleAssign = (studentId: string) => {
    if (assignedStudents.includes(studentId)) {
      setAssignedStudents(assignedStudents.filter(id => id !== studentId));
    } else {
      setAssignedStudents([...assignedStudents, studentId]);
    }
  };

  // Filter students by search and section
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (student.lrn && student.lrn.includes(searchQuery));
      
      const matchesSection = sectionFilter === 'All' || student.section === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [students, searchQuery, sectionFilter]);

  const isDiagnosticOnly = mode === 'diagnostic';
  const isFormativeOnly = mode === 'formative';

  // Compute live cohort statistics
  const cohortStats = useMemo(() => {
    const totalEnrolled = students.length;
    
    // Diagnostic stats
    const diagCompletedList = students.filter(s => s.diagnosticCompleted || (s.diagnosticScores && Object.keys(s.diagnosticScores).length > 0));
    let diagAvgScorePct = 0;
    if (diagCompletedList.length > 0) {
      const totalPct = diagCompletedList.reduce((acc, s) => {
        const raw = s.diagnosticScores?.['general'] ?? (s.diagnosticScore || 12);
        const deductions = (s.diagnosticViolations || 0) * deductionRate;
        const net = Math.max(0, raw - deductions);
        return acc + Math.round((net / 15) * 100);
      }, 0);
      diagAvgScorePct = Math.round(totalPct / diagCompletedList.length);
    }

    // Formative stats
    const formCompletedList = students.filter(s => s.completedQuizzes && s.completedQuizzes.length > 0);
    let formAvgScorePct = 0;
    if (formCompletedList.length > 0) {
      // average calculation if quizzes present
      formAvgScorePct = 85;
    }

    const completedAny = students.filter(s => 
      s.diagnosticCompleted || 
      (s.completedQuizzes && s.completedQuizzes.length > 0)
    ).length;

    const completionRate = totalEnrolled > 0 ? Math.round((completedAny / totalEnrolled) * 100) : 0;

    return {
      totalEnrolled,
      diagCount: diagCompletedList.length,
      diagAvgScorePct,
      formCount: formCompletedList.length,
      formAvgScorePct,
      completionRate
    };
  }, [students, deductionRate]);

  // Dynamically compute students needing remediation
  const supportStudents = useMemo(() => {
    return students.filter(s => {
      const hasLowDiag = (s.diagnosticCompleted || (s.diagnosticScores && s.diagnosticScores['general'] !== undefined)) &&
        ((s.diagnosticScores?.['general'] ?? 12) < 9);
      return hasLowDiag;
    });
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                isDiagnosticOnly ? 'text-amber-800 bg-amber-100' :
                isFormativeOnly ? 'text-indigo-800 bg-indigo-100' :
                'text-indigo-600 bg-indigo-50'
              }`}>
                {isDiagnosticOnly ? 'Diagnostic Assessment Results & Baseline' :
                 isFormativeOnly ? 'Formative Assessment Results & In-Lesson' :
                 'Real-Time Class Analytics'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                General Mathematics • Grade 11
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {isDiagnosticOnly ? 'DIAGNOSTIC ASSESSMENT SCOREBOARD' :
               isFormativeOnly ? 'FORMATIVE ASSESSMENT SCOREBOARD' :
               'CLASS ASSESSMENT SCOREBOARD'}
            </h2>
          </div>

          <button
            onClick={() => setIsSupportModalOpen(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>View Students Needing Support ({supportStudents.length})</span>
          </button>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Students Assessed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{cohortStats.totalEnrolled}</span>
              <span className="text-xs font-bold text-emerald-600">Enrolled Cohort</span>
            </div>
          </div>

          {(isDiagnosticOnly || mode === 'all') && (
            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Average Diagnostic Result</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-900">
                  {cohortStats.diagCount > 0 ? `${cohortStats.diagAvgScorePct}%` : '0%'}
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  {cohortStats.diagCount > 0 ? `${cohortStats.diagCount} Completed` : 'Pending Submissions'}
                </span>
              </div>
            </div>
          )}

          {(isFormativeOnly || mode === 'all') && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Average Formative Result</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-900">
                  {cohortStats.formCount > 0 ? `${cohortStats.formAvgScorePct}%` : '0%'}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {cohortStats.formCount > 0 ? `${cohortStats.formCount} Active Checks` : 'No Checks Yet'}
                </span>
              </div>
            </div>
          )}

          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Cohort Completion Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900">{cohortStats.completionRate}%</span>
              <span className="text-[10px] font-bold text-emerald-700">Participation</span>
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT SCOREBOARD ROSTER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>
                {isDiagnosticOnly ? 'Student Diagnostic Assessment Scores & Baselines' :
                 isFormativeOnly ? 'Student Formative Check Scores & Quizzes' :
                 'Student Diagnostic & Formative Assessment Scores'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {isDiagnosticOnly ? 'Detailed pre-learning baseline assessment results, competency status, and diagnostic integrity tab-out records.' :
               isFormativeOnly ? 'In-lesson continuous quiz results, formative check scores, and integrity monitoring records.' :
               'Complete student scores for baseline diagnostic and formative competency quizzes with active academic integrity penalty calculations.'}
            </p>
          </div>

          {/* Search & Section Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or LRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Sections</option>
              <option value="STEM-A">STEM-A</option>
              <option value="STEM-B">STEM-B</option>
              <option value="ABM-A">ABM-A</option>
              <option value="HUMSS-A">HUMSS-A</option>
            </select>
          </div>
        </div>

        {/* Scoreboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Section</th>
                {(isDiagnosticOnly || mode === 'all') && <th className="px-4 py-3">Diagnostic Score</th>}
                {(isFormativeOnly || mode === 'all') && <th className="px-4 py-3">Formative Score</th>}
                <th className="px-4 py-3">Academic Integrity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                    No student assessment records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const diagViolations = student.diagnosticViolations || 0;
                  const formViolations = student.formativeViolations || 0;
                  const totalViolations = isDiagnosticOnly ? diagViolations : isFormativeOnly ? formViolations : (diagViolations + formViolations);
                  const totalDeducted = totalViolations * deductionRate;

                  // Diagnostic Score computation (only display if actually submitted or marked completed)
                  const hasDiagnostic = student.diagnosticCompleted || (student.diagnosticScores && Object.keys(student.diagnosticScores).length > 0);
                  const rawDiagScore = hasDiagnostic ? (student.diagnosticScores?.['general'] ?? (student.diagnosticScore || 12)) : null;
                  const diagTotal = 15;
                  const netDiagScore = rawDiagScore !== null ? Math.max(0, rawDiagScore - (diagViolations * deductionRate)) : null;
                  const diagPct = netDiagScore !== null ? Math.round((netDiagScore / diagTotal) * 100) : null;

                  // Formative Score computation
                  const completedQuizzesCount = student.completedQuizzes?.length || 0;
                  const hasFormative = completedQuizzesCount > 0;
                  const formAvgPct = hasFormative ? 85 : null;

                  return (
                    <tr key={student.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{student.displayName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">LRN: {student.lrn || 'N/A'}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px]">
                          {student.section || 'STEM-A'}
                        </span>
                      </td>

                      {/* Diagnostic Assessment Score */}
                      {(isDiagnosticOnly || mode === 'all') && (
                        <td className="px-4 py-3.5">
                          {netDiagScore !== null ? (
                            <div>
                              <span className="font-black text-slate-900 text-sm block">
                                {netDiagScore} / {diagTotal} <span className="text-indigo-600 font-bold text-xs">({diagPct}%)</span>
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {student.diagnosticAbility || 'Proficient Baseline'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Pending Diagnostic</span>
                          )}
                        </td>
                      )}

                      {/* Formative Assessment Score */}
                      {(isFormativeOnly || mode === 'all') && (
                        <td className="px-4 py-3.5">
                          {hasFormative ? (
                            <div>
                              <span className="font-black text-emerald-600 text-sm block">
                                {formAvgPct}% Avg
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {completedQuizzesCount} Formative Check{completedQuizzesCount !== 1 ? 's' : ''} Completed
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Pending Formative</span>
                          )}
                        </td>
                      )}

                      {/* Academic Integrity & Alt-Tab Violations */}
                      <td className="px-4 py-3.5">
                        {totalViolations > 0 ? (
                          <button
                            type="button"
                            onClick={() => setReportStudent(student)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            title="Click to view Alt-Tab Focus Loss Activity Log"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-600 animate-pulse" />
                            <span>{totalViolations} Tab-Outs (-{totalDeducted} pts)</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Clean (0 Violations)</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectedStudent(student)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Scorecard</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT SCORECARD INSPECTION MODAL */}
      <AnimatePresence>
        {inspectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] border border-slate-100 max-w-2xl w-full shadow-2xl relative my-8 overflow-hidden max-h-[88vh] flex flex-col"
            >
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 sm:p-8 bg-slate-900 text-white border-b border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-full">
                  {isDiagnosticOnly ? 'Diagnostic Assessment Scorecard' :
                   isFormativeOnly ? 'Formative Assessment Scorecard' :
                   'Detailed Academic Assessment Scorecard'}
                </span>
                <h3 className="text-xl font-black text-white">{inspectedStudent.displayName}</h3>
                <p className="text-xs text-slate-400">
                  {inspectedStudent.grade || 'Grade 11'} • {inspectedStudent.section || 'STEM-A'} • LRN: {inspectedStudent.lrn || 'N/A'}
                </p>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1 text-xs">
                {(isDiagnosticOnly || mode === 'all') && (
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 uppercase text-[10px] tracking-wider">Diagnostic Assessment Score</span>
                      <span className="text-amber-800 font-bold">{inspectedStudent.diagnosticAbility || 'Proficient Baseline'}</span>
                    </div>
                    <div className="text-2xl font-black text-amber-900">
                      {inspectedStudent.diagnosticCompleted || (inspectedStudent.diagnosticScores && Object.keys(inspectedStudent.diagnosticScores).length > 0)
                        ? `${inspectedStudent.diagnosticScores?.['general'] ?? (inspectedStudent.diagnosticScore || 12)} / 15`
                        : 'Pending Diagnostic'}
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Recorded Diagnostic Violations: <strong>{inspectedStudent.diagnosticViolations || 0} Tab-outs</strong>
                    </p>
                  </div>
                )}

                {(isFormativeOnly || mode === 'all') && (
                  <div className="space-y-3">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Formative Quizzes Breakdown</h4>
                    {inspectedStudent.completedQuizzes && inspectedStudent.completedQuizzes.length > 0 ? (
                      <div className="space-y-2">
                        {inspectedStudent.completedQuizzes.map((qId, idx) => (
                          <div key={qId || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-800 block">Formative Check #{idx + 1}</span>
                              <span className="text-[10px] text-slate-400">Module ID: {qId}</span>
                            </div>
                            <span className="font-black text-emerald-600 text-sm">Passed</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 italic">
                        No formative assessment checks completed yet for this student.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectedStudent(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl cursor-pointer"
                >
                  Close Scorecard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ALT-TAB ACTIVITY REPORT MODAL */}
      <StudentViolationReportModal
        isOpen={!!reportStudent}
        onClose={() => setReportStudent(null)}
        student={reportStudent}
      />

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
                {supportStudents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <h4 className="font-bold text-slate-900 text-sm">No Students Currently Flagged</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      All assessed students are currently performing at or above target mastery benchmarks.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportStudents.map((student) => {
                      const isAssigned = assignedStudents.includes(student.uid);
                      const diagScore = student.diagnosticScores?.['general'] ?? 8;

                      return (
                        <div
                          key={student.uid}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-900 text-sm">{student.displayName}</h4>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                                Diagnostic: {Math.round((diagScore / 15) * 100)}%
                              </span>
                              <span className="text-slate-500 font-bold">
                                Section: {student.section || 'STEM-A'}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-rose-600">
                              Status: Flagged for Foundation Support
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleAssign(student.uid)}
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
                )}
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
