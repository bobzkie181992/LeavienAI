import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Brain, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Database, 
  Activity, 
  Award, 
  Compass, 
  FileCheck,
  Cpu,
  HelpCircle,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface ResearchValidityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResearchValidityModal({ isOpen, onClose }: ResearchValidityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Assessment Research Validity Framework</h2>
                <span className="bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Psychometric Standard
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Core Architectural Triad for Scientifically Valid Math Education
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Statement Banner */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950">
            <h3 className="font-black text-sm uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Pedagogical & Psychometric Commitment</span>
            </h3>
            <p className="text-xs sm:text-sm text-indigo-900 leading-relaxed font-medium">
              LeavienAI is engineered on a strict scientific triad: <strong className="font-bold">Validated Mathematics Content + IRT Adaptive Assessment + AI Personalized Support</strong>. The system does <span className="underline decoration-indigo-400 font-bold">NOT</span> rely on arbitrary or unverified generative math questions to score students, preserving psychometric construct validity and alignment with official Grade 11 curriculum standards.
            </p>
          </div>

          {/* The 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Pillar 1
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-2 mb-1.5">
                  Validated Mathematics Content
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Expert-authored, teacher-reviewed Grade 11 problem bank.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Curriculum-mapped to DepEd competencies (e.g. M11GM-Ia-1).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Calibrated distractor keys targeting known algebraic misconceptions.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-slate-400">
                Guarantees Construct Validity
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-black mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                  Pillar 2
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-2 mb-1.5">
                  IRT Adaptive Assessment
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                    <span>2-Parameter Logistic (2PL) Item Response Theory model.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                    <span>Dynamic item selection based on Fisher Information & latent ability (&theta;).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                    <span>Item parameters: Difficulty (b), Discrimination (a), and Response Time tracking.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-slate-400">
                Guarantees Measurement Precision
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Pillar 3
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-2 mb-1.5">
                  AI Personalized Support
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Socratic hints & progressive conceptual scaffolding.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Automated struggle remediation when 2+ errors are detected.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>Personalized pathway recommendations: &quot;What to study next&quot;.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-slate-400">
                Empowers Learning Scaffolding
              </div>
            </div>
          </div>

          {/* Comparison Matrix */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-xs text-slate-700 uppercase tracking-wider">
              Research Validity Contrast
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
              <div className="p-4 bg-emerald-50/30 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>LeavienAI Assessment Architecture</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Assessments pull exclusively from a curated, teacher-calibrated item bank. Every item has proven psychometric parameters (a, b) and aligned competencies. AI serves strictly as a tutor and scaffolding guide.
                </p>
              </div>

              <div className="p-4 bg-rose-50/30 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                  <X className="w-4 h-4 text-rose-600" />
                  <span>Unreliable Gen-AI Only Approach (Rejected)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Allowing AI to randomly invent test questions and self-judge student correctness causes mathematical hallucinations, uncalibrated difficulty spikes, and zero research validity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Understood & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
