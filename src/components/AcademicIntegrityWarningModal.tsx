import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, Clock, ArrowRight, Eye, Smartphone, Laptop } from 'lucide-react';
import { isMobileDevice } from '../lib/violationLogger';

interface AcademicIntegrityWarningModalProps {
  isOpen: boolean;
  violationCount: number;
  deductionPoints: number;
  deductionRate: number;
  assessmentTitle?: string;
  onDismiss: () => void;
}

export default function AcademicIntegrityWarningModal({
  isOpen,
  violationCount,
  deductionPoints,
  deductionRate,
  assessmentTitle,
  onDismiss
}: AcademicIntegrityWarningModalProps) {
  if (!isOpen) return null;

  const isMobile = isMobileDevice();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl border-2 border-rose-500 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-center relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Icon */}
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-rose-200 animate-bounce">
            <ShieldAlert className="w-9 h-9 text-rose-600" />
          </div>

          {/* Titles */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
              {isMobile ? (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile App Switch / Tab-Out Detected</span>
                </>
              ) : (
                <>
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Alt+Tab / Window Focus Loss Detected</span>
                </>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Academic Integrity Violation Recorded
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You navigated away from <strong className="text-slate-900">{assessmentTitle || 'the assessment'}</strong> (switched browser tabs, opened another application, or minimized the window).
            </p>
          </div>

          {/* Penalty Callout Box */}
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-rose-800">Violation Incident:</span>
              <span className="text-rose-950 px-2 py-0.5 bg-rose-200/70 rounded-md font-mono">
                #{violationCount} Logged
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-rose-800">Universal Penalty Deduction:</span>
              <span className="text-rose-700 text-sm font-extrabold">
                -{deductionPoints} Point{deductionPoints > 1 ? 's' : ''} (-{deductionRate} pt / violation)
              </span>
            </div>

            <p className="text-[11px] text-rose-700/90 leading-tight pt-1 border-t border-rose-200/60">
              ⚡ This score deduction will be subtracted directly from your final grade upon submission.
            </p>
          </div>

          {/* Audit Notice to Student & Teacher */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
              <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Report Transmitted to Faculty</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This incident has been recorded in your student academic profile and transmitted to your teacher's faculty dashboard with the exact timestamp and duration.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>I Understand • Return to Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
