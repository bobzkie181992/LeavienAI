import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  Brain, 
  Award, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Zap, 
  Flame, 
  BookOpen, 
  GraduationCap, 
  X,
  Compass,
  LineChart
} from 'lucide-react';
import { UserProfile, QuizResult } from '../types';

interface CumulativePerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  results: QuizResult[];
  latestXP?: number;
  latestScore?: number;
  latestTotal?: number;
}

export default function CumulativePerformanceModal({
  isOpen,
  onClose,
  profile,
  results = [],
  latestXP = 0,
  latestScore = 0,
  latestTotal = 0
}: CumulativePerformanceModalProps) {
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Totals & Metrics
  const totalQuizzes = results.length;
  const totalPointsEarned = results.reduce((acc, r) => acc + r.score, 0);
  const totalPointsPossible = results.reduce((acc, r) => acc + r.total, 0);
  const overallAccuracy = totalPointsPossible > 0 
    ? Math.round((totalPointsEarned / totalPointsPossible) * 100) 
    : 0;
  
  // XP metrics
  const totalXPAccumulated = profile.xp;

  // Categorize assessment history
  const quizzesAndExams = results.filter(r => !r.quizId.startsWith('challenge-') && !r.quizId.startsWith('adaptive-') && !r.quizId.startsWith('practice-'));
  const dailyChallenges = results.filter(r => r.quizId.startsWith('challenge-') && r.quizId.includes('challenge'));
  const adaptiveChallenges = results.filter(r => r.quizId.startsWith('adaptive-'));
  const competencyPractices = results.filter(r => r.quizId.startsWith('practice-'));
  const mixedSprints = results.filter(r => r.quizId.startsWith('challenge-') || r.quizId.toLowerCase().includes('sprint'));

  const getStats = (list: QuizResult[]) => {
    const count = list.length;
    const avgScore = count > 0 
      ? Math.round(list.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / count)
      : 0;
    return { count, avgScore };
  };

  const quizStats = getStats(quizzesAndExams);
  const dailyStats = getStats(dailyChallenges);
  const adaptiveStats = getStats(adaptiveChallenges);
  const competencyStats = getStats(competencyPractices);
  const sprintStats = getStats(mixedSprints);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDiagnosis = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ai/diagnose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            scores: {
              quizzesAndExams: quizStats,
              dailyChallenge: dailyStats,
              adaptiveChallenge: adaptiveStats,
              competencyPractice: competencyStats,
              mixedSprint: sprintStats
            },
            competencyScores: profile.competencyScores || {}
          })
        });
        const data = await response.json();
        if (data.success && data.diagnosis) {
          setDiagnosis(data.diagnosis);
        } else {
          throw new Error(data.error || 'Failed to generate diagnosis');
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to generate mathematical performance diagnosis.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosis();
  }, [isOpen, results]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[36px] border border-slate-100 max-w-2xl w-full shadow-2xl my-8 relative flex flex-col max-h-[85vh]"
          id="cumulative-performance-modal"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full flex items-center justify-center text-slate-500 transition-colors z-10"
            id="close-performance-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Sticky Header */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-[36px]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <LineChart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Comprehensive Diagnostic Engine
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  Student Learning & Performance Diagnostic
                </h3>
              </div>
            </div>
          </div>

          {/* Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Real-time cumulative scores */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                Cumulative Learning & Point Totals
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-indigo-50/50 border border-indigo-100/60 rounded-2xl">
                  <span className="text-2xl font-black text-indigo-600 block">
                    {totalQuizzes}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                    Quizzes Performed
                  </span>
                </div>
                
                <div className="p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl">
                  <span className="text-2xl font-black text-emerald-600 block">
                    {totalPointsEarned} <span className="text-xs font-normal text-emerald-500">/ {totalPointsPossible}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Total Score Points
                  </span>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-100/60 rounded-2xl">
                  <span className="text-2xl font-black text-amber-600 block">
                    {overallAccuracy}%
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Overall Accuracy
                  </span>
                </div>

                <div className="p-4 bg-violet-50/50 border border-violet-100/60 rounded-2xl">
                  <span className="text-2xl font-black text-violet-600 block">
                    {totalXPAccumulated} <span className="text-xs font-normal text-violet-500">XP</span>
                  </span>
                  <span className="text-[10px] font-bold text-violet-800 uppercase tracking-wider">
                    Cumulative XP Points
                  </span>
                </div>
              </div>
            </div>

            {/* Latest quiz performance toast banner */}
            {latestScore > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">Latest Activity Score Added!</h5>
                    <p className="text-[10px] text-slate-600">
                      Earned +{latestXP} XP • Precision: {latestScore}/{latestTotal} correct.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  +{latestXP} XP
                </div>
              </div>
            )}

            {/* AI Diagnosis Report Section */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">AI Math Performance Appraisal</h4>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
                  />
                  <p className="text-xs text-slate-500 font-bold animate-pulse">
                    Analyzing quiz answers & compiling mathematical diagnostics...
                  </p>
                </div>
              ) : error ? (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-center justify-between">
                  <span>{error}</span>
                  <button 
                    onClick={() => setDiagnosis(null)}
                    className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors"
                  >
                    Retry Analysis
                  </button>
                </div>
              ) : diagnosis ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-5"
                >
                  {/* Overall Assessment */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block">
                      Overall Assessment Index
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {diagnosis.overallAssessment}
                    </p>
                  </div>

                  {/* Strengths & Remediations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block">
                        Proven Strengths
                      </span>
                      {diagnosis.strengths?.map((str: string, i: number) => (
                        <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-xl text-xs text-emerald-800 font-medium">
                          • {str}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block">
                        Remediations & Target Improvement
                      </span>
                      {diagnosis.remediations?.map((rem: string, i: number) => (
                        <div key={i} className="p-3 bg-amber-50/50 border border-amber-100/60 rounded-xl text-xs text-amber-800 font-medium">
                          👉 {rem}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div className="p-4 bg-violet-50/40 border border-violet-100/60 rounded-2xl">
                    <span className="text-[10px] font-black text-violet-900 uppercase tracking-wider block mb-2">
                      Recommended Learning Steps
                    </span>
                    <ul className="space-y-1.5">
                      {diagnosis.actionPlan?.map((plan: string, i: number) => (
                        <li key={i} className="text-xs text-violet-900/95 font-semibold flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 mt-0.5 flex-shrink-0" />
                          <span>{plan}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-xs text-slate-500 mb-2">No diagnostics computed yet for this session.</p>
                </div>
              )}
            </div>

          </div>

          {/* Sticky Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-[36px] flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 text-xs active:scale-95 transition-all"
              id="confirm-diagnosis-modal-btn"
            >
              Acknowledge & Continue Learning
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
