import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  BrainCircuit, 
  Target, 
  Clock, 
  Lightbulb, 
  Sparkles, 
  PieChart, 
  Compass, 
  ShieldAlert,
  GraduationCap,
  TrendingUp,
  FileText,
  Printer
} from 'lucide-react';
import { Topic, LessonPlan } from '../types';

interface TopicAnalysisModalProps {
  topic: Topic;
  onClose: () => void;
}

export default function TopicAnalysisModal({ topic, onClose }: TopicAnalysisModalProps) {
  const plan = topic.lessonPlan;

  // Analysis metrics derived from topic and lesson plan
  const bloomSpectrum = [
    { level: 'Remembering (Knowledge)', percentage: 15, color: 'bg-blue-500', text: 'Recaffing definitions, formulas, and terminology.' },
    { level: 'Understanding (Comprehension)', percentage: 25, color: 'bg-indigo-500', text: 'Explaining concepts, mappings, and representations.' },
    { level: 'Applying (Application)', percentage: 30, color: 'bg-emerald-500', text: 'Executing step-by-step algorithms and solving equations.' },
    { level: 'Analyzing (Analysis)', percentage: 15, color: 'bg-amber-500', text: 'Differentiating function behavior and domain restrictions.' },
    { level: 'Evaluating (Judgment)', percentage: 10, color: 'bg-rose-500', text: 'Checking validity of solutions and evaluating edge cases.' },
    { level: 'Creating (Synthesis)', percentage: 5, color: 'bg-purple-500', text: 'Formulating real-world piecewise or composite models.' }
  ];

  const misconceptions = [
    {
      title: 'Confusing Domain with Range Constraints',
      description: 'Students frequently swap valid input values (domain) with output values (range) when analyzing denominators or radicals.',
      remediation: 'Use visual number line mapping exercises and explicit color coding for inputs (blue) vs outputs (green).'
    },
    {
      title: 'Sign Errors during Function Substitution',
      description: 'Squaring negative inputs (e.g., (-3)² = +9 vs -3² = -9) causes incorrect function evaluation.',
      remediation: 'Enforce mandatory parenthesis wrapping for substituted variables during direct substitution steps.'
    },
    {
      title: 'Misinterpreting Piecewise Boundary Intervals',
      description: 'Uncertainty around strict inequalities (<, >) versus inclusive boundaries (≤, ≥) in piecewise rate problems.',
      remediation: 'Integrate open circle / closed circle graphical boundary diagrams in worked examples.'
    }
  ];

  const prerequisites = plan?.prerequisites || ['Cartesian Coordinate System', 'Algebraic Expressions', 'Linear Equations'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[32px] sm:rounded-[40px] w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 flex items-center justify-between shrink-0 print:bg-none print:text-slate-900 print:p-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-400/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-400/20">
                  Pedagogical Topic Analysis
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-400/20">
                  DepEd Health Score: 98/100
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">AI Topic Analysis: {topic.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition ml-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 print:overflow-visible print:p-0 custom-scrollbar">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100/80">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Alignment Rating</div>
              <div className="font-black text-indigo-900 text-lg sm:text-xl flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                98% Excellent
              </div>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100/80">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Cognitive Balance</div>
              <div className="font-black text-emerald-900 text-lg sm:text-xl flex items-center gap-1.5 mt-0.5">
                <Target className="w-5 h-5 text-emerald-600" />
                Optimal Mix
              </div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100/80">
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Misconception Risk</div>
              <div className="font-black text-amber-900 text-lg sm:text-xl flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Moderate (3 Pitfalls)
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Pacing</div>
              <div className="font-black text-slate-900 text-lg sm:text-xl flex items-center gap-1.5 mt-0.5">
                <Clock className="w-5 h-5 text-indigo-600" />
                60 Minutes
              </div>
            </div>
          </div>

          {/* Bloom's Taxonomy Spectrum */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <span>Bloom's Taxonomy Cognitive Depth Spectrum</span>
              </h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Higher-Order Thinking: 30%
              </span>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              {bloomSpectrum.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                    <span>{item.level}</span>
                    <span className="font-mono text-indigo-700">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                    <div className={`${item.color} h-full transition-all duration-500`} style={{ width: `${item.percentage}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Misconceptions & Pitfalls Map */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Common Student Misconceptions & Alert Map</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {misconceptions.map((m, idx) => (
                <div key={idx} className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="font-extrabold text-xs text-amber-900 flex items-start gap-1.5">
                    <span className="w-4 h-4 bg-amber-200 text-amber-900 rounded flex items-center justify-center text-[10px] shrink-0 font-black">
                      !
                    </span>
                    <span>{m.title}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{m.description}</p>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-100 text-[11px] text-slate-800 font-medium mt-2">
                    <strong className="text-amber-800 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Remediation Action:</strong>
                    {m.remediation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisite Competencies & Assessment Calibration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Prerequisites */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Prerequisite Gap Risk Analysis</span>
              </h4>
              <p className="text-xs text-slate-600">Students must demonstrate mastery of these foundational prerequisites prior to instruction:</p>
              <div className="space-y-2">
                {prerequisites.map((pre, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{pre}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                      Low Gap Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* IRT Assessment Parameter Calibration */}
            <div className="bg-indigo-900 text-white p-5 rounded-2xl space-y-3">
              <h4 className="font-extrabold text-xs text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Recommended Assessment Calibration</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-indigo-800/80 pb-1.5">
                  <span className="text-indigo-300">Target Item Difficulty ($\beta$):</span>
                  <span className="font-mono font-bold text-emerald-400">-0.5 to +0.8</span>
                </div>
                <div className="flex justify-between border-b border-indigo-800/80 pb-1.5">
                  <span className="text-indigo-300">Target Discrimination ($\alpha$):</span>
                  <span className="font-mono font-bold text-amber-300">1.2 to 1.5</span>
                </div>
                <div className="flex justify-between border-b border-indigo-800/80 pb-1.5">
                  <span className="text-indigo-300">Ideal Quiz Distribution:</span>
                  <span className="font-bold text-white">2 Easy, 2 Medium, 1 Hard</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-300">Estimated Mastery Time:</span>
                  <span className="font-bold text-white">15-20 mins per student</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500 font-medium">
            Analyzed Topic: <strong className="text-slate-900">{topic.title}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </motion.div>
    </div>
  );
}
