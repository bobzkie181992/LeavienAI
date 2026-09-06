import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, Brain, Send, Loader2, CheckCircle2, Lightbulb, Calculator, HelpCircle } from 'lucide-react';

interface AIMathSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface SolutionData {
  problem: string;
  summary: string;
  steps: {
    stepNumber: number;
    title: string;
    explanation: string;
    mathExpression?: string;
  }[];
  finalAnswer: string;
  practiceTip: string;
}

export default function AIMathSolverModal({ isOpen, onClose, initialQuery = '' }: AIMathSolverModalProps) {
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solution, setSolution] = useState<SolutionData | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setProblemText(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSolution(null);

    try {
      const res = await fetch('/api/ai/solve-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemText: problemText.trim() })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to solve math problem');
      }

      setSolution(data.solution);
    } catch (err: any) {
      console.error('Error in AI solver:', err);
      setError(err.message || 'Failed to get solution from AI tutor.');
    } finally {
      setLoading(false);
    }
  };

  const sampleProblems = [
    "Find the derivative of f(x) = (3x^2 - 5x) * sin(x)",
    "Solve the trigonometric equation: 2*cos^2(x) - sin(x) - 1 = 0 for [0, 2π]",
    "Find the sum of the first 20 terms of an arithmetic sequence where a1 = 3 and d = 4",
    "Evaluate the limit: lim (x -> 3) of (x^2 - 9) / (x - 3)"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-violet-300 border border-white/20 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">AI Math Step-by-Step Tutor</h2>
                <span className="bg-violet-500/30 text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-violet-400/30">
                  Gemini 3.8 Math Expert
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Type any Grade 11 math problem or equation for instant guided walkthroughs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSolve} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Enter Your Math Problem / Equation / Question
              </label>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="e.g. Find the roots of 2x^2 - 4x - 6 = 0 or calculate the limit..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={loading || !problemText.trim()}
                  className="px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span className="hidden sm:inline">Solve Step-by-Step</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Prompts */}
            {!solution && !loading && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Or try one of these Grade 11 sample problems:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleProblems.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setProblemText(sample)}
                      className="text-left p-3 rounded-xl bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border border-slate-200 text-xs text-slate-700 transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Solution Display */}
          {solution && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-2"
            >
              <div className="p-5 bg-violet-50/70 border border-violet-200 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-violet-200 text-violet-900 rounded-full">
                  AI Solution Breakdown
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2 font-mono">{solution.problem}</h3>
                <p className="text-xs text-slate-600 mt-1">{solution.summary}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Step-by-Step Solution:</h4>
                {solution.steps?.map((step) => (
                  <div key={step.stepNumber} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs">{step.title}</h5>
                    </div>
                    <p className="text-xs text-slate-600 pl-8 leading-relaxed">{step.explanation}</p>
                    {step.mathExpression && (
                      <div className="ml-8 p-3 bg-slate-900 text-violet-200 rounded-xl font-mono text-xs overflow-x-auto">
                        {step.mathExpression}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {solution.finalAnswer && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Final Result</span>
                    <div className="text-sm font-black text-emerald-900 font-mono mt-0.5">{solution.finalAnswer}</div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                </div>
              )}

              {solution.practiceTip && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold mb-0.5">Study Tip:</strong>
                    <span>{solution.practiceTip}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
