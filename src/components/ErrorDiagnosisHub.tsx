import React from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { 
  MathErrorCategory, 
  ErrorPatternOccurrence, 
  UserProfile 
} from '../types';

interface ErrorDiagnosisHubProps {
  profile: UserProfile;
  recentErrors?: ErrorPatternOccurrence[];
  onLaunchRemediation: (category: MathErrorCategory, count: number) => void;
  onOpenTopic?: (topicId: string) => void;
}

const ALL_ERROR_CATEGORIES: {
  category: MathErrorCategory;
  description: string;
  icon: any;
  color: string;
  badgeBg: string;
}[] = [
  {
    category: 'Sign error',
    description: 'Inverting signs during distribution, squaring, or transposition across inequalities.',
    icon: Icons.Minus,
    color: 'text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-800'
  },
  {
    category: 'Formula error',
    description: 'Misremembering or misapplying standard formulas, log laws, or interest equations.',
    icon: Icons.Binary,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-800'
  },
  {
    category: 'Computational error',
    description: 'Minor arithmetic calculation slips during numerical multiplications or fraction addition.',
    icon: Icons.Calculator,
    color: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  {
    category: 'Conceptual misunderstanding',
    description: 'Gaps regarding mathematical definitions, function uniqueness, or domain existence.',
    icon: Icons.Brain,
    color: 'text-purple-600',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  {
    category: 'Incorrect procedure',
    description: 'Executing operations out of order, composition reversal, or omitting extraneous root checks.',
    icon: Icons.GitCommit,
    color: 'text-orange-600',
    badgeBg: 'bg-orange-50 border-orange-200 text-orange-800'
  },
  {
    category: 'Misreading the problem',
    description: 'Solving for the wrong variable, confusing domain with range, or missing constraint qualifiers.',
    icon: Icons.Eye,
    color: 'text-cyan-600',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800'
  },
  {
    category: 'Algebraic manipulation error',
    description: 'Illegal cancellations, missing middle terms in binomial expansions, or exponent rule violations.',
    icon: Icons.Variable,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800'
  }
];

export default function ErrorDiagnosisHub({
  profile,
  recentErrors = [],
  onLaunchRemediation
}: ErrorDiagnosisHubProps) {
  // Aggregate frequencies from profile and recent errors
  const frequencies: Record<string, number> = { ...(profile.errorFrequencies || {}) };
  recentErrors.forEach(err => {
    frequencies[err.category] = (frequencies[err.category] || 0) + 1;
  });

  const resolved = new Set(profile.resolvedErrors || []);

  // Find categories with repeated occurrences (>= 2)
  const repeatedErrors = Object.entries(frequencies)
    .filter(([cat, count]) => count >= 2 && !resolved.has(cat))
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Icons.AlertTriangle className="w-3.5 h-3.5" />
                <span>Diagnostic Error Engine</span>
              </span>
              <span className="text-xs text-indigo-200 font-medium">Classifying 7 Core DepEd Error Categories</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
              Common Mathematics Error Classification & Remediation
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              When the system identifies recurring error patterns in your practice sessions, it triggers targeted, 5-phase pedagogical remediation (AI diagnosis, explanation, worked example, practice drill, and reassessment).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {repeatedErrors.length > 0 && (
              <button
                onClick={() => onLaunchRemediation(repeatedErrors[0][0] as MathErrorCategory, repeatedErrors[0][1])}
                className="px-6 py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Icons.Zap className="w-4 h-4 fill-current" />
                <span>Fix Priority Error: {repeatedErrors[0][0]}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Repeated Errors Warning Banner if any */}
      {repeatedErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-800">
            <Icons.AlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm sm:text-base">
              Action Recommended: {repeatedErrors.length} Repeated Error Pattern{repeatedErrors.length > 1 ? 's' : ''} Detected
            </h3>
          </div>
          <p className="text-xs text-rose-700">
            You have repeatedly made the following errors across recent questions. Launching remediation provides targeted practice to resolve the underlying misconception.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {repeatedErrors.map(([cat, count]) => (
              <div 
                key={cat}
                className="p-3.5 rounded-2xl bg-white border border-rose-200 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-bold text-xs text-slate-900">{cat}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium ml-3.5 block mt-0.5">
                    Occurred {count} times
                  </span>
                </div>

                <button
                  onClick={() => onLaunchRemediation(cat as MathErrorCategory, count)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1"
                >
                  <Icons.Play className="w-3 h-3 fill-current" />
                  <span>Remediate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7 Standard Category Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Icons.Layers className="w-5 h-5 text-indigo-600" />
            <span>The 7 Mathematics Error Categories</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Continuous Pattern Monitoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_ERROR_CATEGORIES.map(item => {
            const count = frequencies[item.category] || 0;
            const isResolved = resolved.has(item.category);
            const IconComp = item.icon;

            return (
              <div
                key={item.category}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <IconComp className={`w-5 h-5 ${item.color}`} />
                    </div>
                    {isResolved ? (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Icons.Check className="w-3 h-3" /> Resolved
                      </span>
                    ) : count >= 2 ? (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Icons.AlertTriangle className="w-3 h-3" /> {count}x Repeated
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">
                        {count === 0 ? 'No errors' : `${count} error`}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mb-1">
                    {item.category}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    5-Stage Module
                  </span>
                  <button
                    onClick={() => onLaunchRemediation(item.category, count)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>{count >= 2 ? 'Start Remediation' : 'Review Rules'}</span>
                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Classified Error Instances Table */}
      {recentErrors.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Icons.History className="w-5 h-5 text-indigo-600" />
              <span>Recent Error Classifications</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Logged during quizzes</span>
          </div>

          <div className="grid gap-3">
            {recentErrors.slice(-5).reverse().map((err, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-lg text-[10px] uppercase">
                    {err.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{err.competency}</span>
                </div>

                <p className="font-bold text-slate-800 text-xs sm:text-sm">
                  {err.questionText}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-100 text-rose-900">
                    <span className="font-bold block text-[10px] uppercase text-rose-600">Selected Answer:</span>
                    <span className="truncate block">{err.selectedOptionText}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-100 text-emerald-900">
                    <span className="font-bold block text-[10px] uppercase text-emerald-600">Correct Answer:</span>
                    <span className="truncate block">{err.correctOptionText}</span>
                  </div>
                </div>

                {err.specificDiagnosis && (
                  <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200">
                    💡 <strong>AI Diagnosis:</strong> {err.specificDiagnosis}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
