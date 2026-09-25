import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  FileText, 
  Laptop, 
  Printer, 
  Info,
  ShieldCheck,
  Search
} from 'lucide-react';
import { UserProfile, AltTabViolationLog } from '../types';
import { getIntegritySettings } from '../lib/integritySettings';
import { getStudentViolationLogs } from '../lib/violationLogger';

interface StudentViolationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserProfile | null;
}

export default function StudentViolationReportModal({
  isOpen,
  onClose,
  student
}: StudentViolationReportModalProps) {
  if (!isOpen || !student) return null;

  const integritySettings = getIntegritySettings();
  const deductionRate = integritySettings.violationDeductionPoints;
  
  const diagViolations = student.diagnosticViolations || 0;
  const formViolations = student.formativeViolations || 0;
  const totalViolations = diagViolations + formViolations;
  const totalDeductedPoints = totalViolations * deductionRate;

  const violationLogs: AltTabViolationLog[] = getStudentViolationLogs(student);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[32px] border border-slate-100 max-w-3xl w-full shadow-2xl relative my-8 flex flex-col max-h-[90vh]"
          id="student-violation-report-modal"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors z-10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sticky Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-900 text-white rounded-t-[32px] space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                    Academic Integrity & Alt-Tab Audit Log
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Universal Penalty Rate: -{deductionRate} pt(s) / tab-out
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Academic Integrity & Focus Loss Report
                </h2>
                <p className="text-xs text-slate-400">
                  Detailed focus-loss telemetry and switched application audit for <strong className="text-white">{student.displayName}</strong> ({student.grade || 'Grade 11'} - {student.section || 'STEM-A'})
                </p>
              </div>
            </div>

            {/* Metric Overview Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Tab-Outs</span>
                <span className="text-xl font-black text-rose-400">{totalViolations}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Diagnostic Tab-Outs</span>
                <span className="text-xl font-black text-amber-400">{diagViolations}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Formative Tab-Outs</span>
                <span className="text-xl font-black text-indigo-400">{formViolations}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Score Deduction</span>
                <span className="text-xl font-black text-rose-500">-{totalDeductedPoints} Pts</span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>Switched Focus Activity Log</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Telemetry logs recording window blur events and detected external app switches.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>

            {violationLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Clean Academic Integrity Record</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  No Alt-Tab or focus-loss violations recorded for this student during assessments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {violationLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all text-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          log.assessmentType === 'Diagnostic'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {log.assessmentType} Violation
                        </span>
                        <span className="font-bold text-slate-900">
                          {log.assessmentTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Assessment Context:</span>
                        <p className="text-slate-800 font-bold text-xs">
                          {log.questionNumber ? `Item ${log.questionNumber}` : 'Exam Active'} {log.questionText ? `• "${log.questionText}"` : ''}
                        </p>
                        <span className="text-[10px] text-slate-500 block">
                          Time Out of Focus: <strong className="text-rose-600">{log.durationSeconds || 4} seconds</strong>
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-rose-200/80 space-y-1">
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Switched App / Window Activity:
                        </span>
                        <p className="text-slate-900 font-bold text-xs leading-snug">
                          {log.switchedAppReason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-[32px] flex items-center justify-between">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>Universal score deduction (-{deductionRate} pts/violation) automatically applied.</span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
