import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  Clock, 
  ShieldCheck, 
  FileText,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { QuizResult, Topic, Quiz } from '../types';
import { getIntegritySettings } from '../lib/integritySettings';

interface QuizResultReviewModalProps {
  result: QuizResult | null;
  topics: Topic[];
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizResultReviewModal({
  result,
  topics,
  isOpen,
  onClose
}: QuizResultReviewModalProps) {
  if (!isOpen || !result) return null;

  const deductionRate = getIntegritySettings().violationDeductionPoints;
  const violations = result.violations || 0;
  const deduction = violations * deductionRate;
  const rawScore = result.score;
  const netScore = Math.max(0, rawScore - deduction);
  const total = result.total || 10;
  const percentage = total > 0 ? Math.round((netScore / total) * 100) : 0;
  const isPassed = percentage >= 75;

  // Find matching quiz from topics
  let matchedQuiz: Quiz | undefined;
  for (const topic of topics) {
    const q = topic.quizzes.find(qu => qu.id === result.quizId || qu.title.toLowerCase() === result.quizId.toLowerCase());
    if (q) {
      matchedQuiz = q;
      break;
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl relative overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  {result.quizMode || 'Formative Quiz'} Review
                </span>
                <span className="text-slate-300 text-xs">
                  {new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {matchedQuiz?.title || result.quizId.replace('custom-', '').replace('adaptive-', 'Adaptive Practice: ')}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Score & Summary Banner */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Raw Score</span>
              <span className="text-lg font-black text-slate-900">{rawScore} / {total}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Violations</span>
              <span className={`text-sm font-black flex items-center justify-center gap-1 ${violations > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {violations > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {violations} {deduction > 0 ? `(-${deduction}pts)` : ''}
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Net Score</span>
              <span className="text-lg font-black text-indigo-600">{netScore} / {total}</span>
            </div>

            <div className={`p-4 rounded-2xl border text-center shadow-2xs ${isPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <span className="text-[10px] font-black uppercase tracking-wider block mb-1">Percentage</span>
              <span className="text-lg font-black">{percentage}% ({isPassed ? 'Passed' : 'Needs Review'})</span>
            </div>
          </div>

          {/* Item Responses / Question Breakdown */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Question Item Breakdown & Solutions</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {matchedQuiz?.problems?.length || result.itemResponses?.length || 0} Questions Evaluated
              </span>
            </div>

            {matchedQuiz && matchedQuiz.problems && matchedQuiz.problems.length > 0 ? (
              <div className="space-y-4">
                {matchedQuiz.problems.map((prob, idx) => {
                  const itemResp = result.itemResponses?.find(ir => ir.problemId === prob.id);
                  const studentAnswerIdx = itemResp ? itemResp.selectedOption : undefined;
                  const isCorrect = itemResp ? itemResp.isCorrect : studentAnswerIdx === prob.correctAnswer;

                  return (
                    <div 
                      key={prob.id || idx}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isCorrect 
                          ? 'bg-emerald-50/40 border-emerald-200/80' 
                          : 'bg-rose-50/40 border-rose-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                          {prob.competency || 'General Math'}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        {prob.question}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {prob.options.map((opt, oIdx) => {
                          const isOptionCorrect = oIdx === prob.correctAnswer;
                          const isStudentChoice = studentAnswerIdx === oIdx;

                          let badgeStyle = 'bg-white border-slate-200 text-slate-700';
                          if (isOptionCorrect) {
                            badgeStyle = 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold';
                          } else if (isStudentChoice && !isOptionCorrect) {
                            badgeStyle = 'bg-rose-100 border-rose-300 text-rose-950 font-bold';
                          }

                          return (
                            <div 
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${badgeStyle}`}
                            >
                              <span className="w-5 h-5 rounded-md bg-slate-100 font-black text-[10px] flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1 truncate">{opt}</span>
                              {isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                              {isStudentChoice && !isOptionCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation / Remediation */}
                      <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs space-y-1 mt-2">
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[10px] block">
                          Step-by-Step Solution & Explanation:
                        </span>
                        <p className="text-slate-600 leading-relaxed">
                          {prob.explanation || 'Review the core formula and verify each algebraic substitution step.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : result.itemResponses && result.itemResponses.length > 0 ? (
              <div className="space-y-3">
                {result.itemResponses.map((resItem, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">Question {idx + 1}</span>
                      <span className={`font-bold ${resItem.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {resItem.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-slate-700">Selected Option Index: {resItem.selectedOption}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900">Detailed Question Data Not Available</h4>
                <p className="text-xs text-slate-500">This assessment score record was successfully recorded.</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              Close Review
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
