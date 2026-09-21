import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { 
  MathErrorCategory, 
  ErrorRemediationModule, 
  Problem,
  UserProfile 
} from '../types';
import { generateErrorRemediationPlan } from '../utils/errorClassifier';

interface ErrorRemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: MathErrorCategory;
  competencyName?: string;
  triggerCount?: number;
  profile?: UserProfile;
  onCompleteRemediation?: (category: MathErrorCategory, xpEarned: number) => void;
}

export default function ErrorRemediationModal({
  isOpen,
  onClose,
  category,
  competencyName,
  triggerCount = 2,
  profile,
  onCompleteRemediation
}: ErrorRemediationModalProps) {
  const [activeStage, setActiveStage] = useState<number>(0); // 0: AI Diagnosis, 1: Short Explanation, 2: Worked Example, 3: Practice, 4: Reassessment, 5: Certification
  const [practiceIndex, setPracticeIndex] = useState<number>(0);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<number | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [practiceCompletedCount, setPracticeCompletedCount] = useState<number>(0);

  const [reassessIndex, setReassessIndex] = useState<number>(0);
  const [selectedReassessOption, setSelectedReassessOption] = useState<number | null>(null);
  const [reassessAnswers, setReassessAnswers] = useState<boolean[]>([]);
  const [showReassessFeedback, setShowReassessFeedback] = useState<boolean>(false);

  const plan: ErrorRemediationModule = React.useMemo(() => {
    return generateErrorRemediationPlan(category, competencyName);
  }, [category, competencyName]);

  if (!isOpen) return null;

  const currentPracticeProblem = plan.practiceQuestions[practiceIndex];
  const currentReassessProblem = plan.reassessmentQuestions[reassessIndex];

  const handlePracticeSubmit = () => {
    if (selectedPracticeOption === null || !currentPracticeProblem) return;
    const isCorrect = selectedPracticeOption === currentPracticeProblem.correctAnswer;
    
    if (isCorrect) {
      setPracticeFeedback({
        isCorrect: true,
        text: `Correct! ${currentPracticeProblem.explanation}`
      });
      setPracticeCompletedCount(prev => prev + 1);
    } else {
      setPracticeFeedback({
        isCorrect: false,
        text: `Not quite. ${currentPracticeProblem.hint1 || 'Review the explanation above and try another option.'}`
      });
    }
  };

  const handlePracticeNext = () => {
    setSelectedPracticeOption(null);
    setPracticeFeedback(null);
    if (practiceIndex < plan.practiceQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1);
    } else {
      // Advance to Reassessment
      setActiveStage(4);
    }
  };

  const handleReassessSubmit = () => {
    if (selectedReassessOption === null || !currentReassessProblem) return;
    const isCorrect = selectedReassessOption === currentReassessProblem.correctAnswer;
    setReassessAnswers(prev => [...prev, isCorrect]);
    setShowReassessFeedback(true);
  };

  const handleReassessNext = () => {
    setSelectedReassessOption(null);
    setShowReassessFeedback(false);
    if (reassessIndex < plan.reassessmentQuestions.length - 1) {
      setReassessIndex(prev => prev + 1);
    } else {
      // Reassessment complete -> show certification
      setActiveStage(5);
      if (onCompleteRemediation) {
        const correctCount = reassessAnswers.filter(Boolean).length;
        const xp = correctCount >= 2 ? 150 : 75;
        onCompleteRemediation(category, xp);
      }
    }
  };

  const reassessScore = reassessAnswers.filter(Boolean).length;
  const reassessTotal = plan.reassessmentQuestions.length;
  const isReassessPassed = reassessScore >= 2;

  const stages = [
    { title: 'AI Misconception', icon: Icons.Brain, short: 'Diagnosis' },
    { title: 'Explanation', icon: Icons.BookOpen, short: 'Rules' },
    { title: 'Worked Example', icon: Icons.CheckCircle2, short: 'Example' },
    { title: 'Practice Questions', icon: Icons.Sparkles, short: 'Practice' },
    { title: 'Reassessment', icon: Icons.Target, short: 'Benchmark' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Icons.AlertTriangle className="w-3 h-3" />
              <span>Repeated Error Pattern ({triggerCount}x)</span>
            </span>
            <span className="text-xs text-rose-200 font-semibold">AI Guided Remediation Flow</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Remediation: {category}
          </h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            {plan.triggerReason}
          </p>

          {/* 5-Step Progress Flow Indicator */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 pt-3 border-t border-white/10">
            {stages.map((stage, idx) => {
              const IconComp = stage.icon;
              const isActive = activeStage === idx;
              const isPast = activeStage > idx;

              return (
                <button
                  key={idx}
                  disabled={!isPast && !isActive}
                  onClick={() => setActiveStage(idx)}
                  className={`flex flex-col items-center p-1.5 rounded-xl transition-all text-center ${
                    isActive ? 'bg-white text-slate-900 shadow-md font-bold' :
                    isPast ? 'bg-white/20 text-white hover:bg-white/30' :
                    'bg-white/5 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <IconComp className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs font-black">{idx + 1}</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] truncate w-full">{stage.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <AnimatePresence mode="wait">
            {/* STAGE 0: AI MISCONCEPTION DIAGNOSIS */}
            {activeStage === 0 && (
              <motion.div
                key="stage-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Icons.Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block mb-1">
                      Step 1: AI Root Cause Diagnosis
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      Why does this {category.toLowerCase()} occur?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {plan.misconceptionAnalysis}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Icons.Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>How this remediation will help you</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Review the exact mathematical rules that prevent this mistake.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Analyze a side-by-side comparison of the common pitfall versus the correct solution.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Solve 3 targeted practice questions with immediate guidance.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Pass the Reassessment test to certify that you have eliminated this error.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setActiveStage(1)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-2"
                  >
                    <span>Proceed to Short Explanation</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 1: SHORT EXPLANATION */}
            {activeStage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Icons.BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Step 2: Core Rules</span>
                    <h3 className="text-lg font-black text-slate-900">{plan.shortExplanation.title}</h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.shortExplanation.rules.map((rule, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {rule}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Icons.Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Key Rule of Thumb</span>
                    <p className="text-xs text-amber-900 mt-0.5 leading-relaxed font-semibold">
                      {plan.shortExplanation.keyTakeaways}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveStage(0)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStage(2)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-2"
                  >
                    <span>View Worked Example</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: WORKED EXAMPLE */}
            {activeStage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Icons.CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Step 3: Worked Example</span>
                    <h3 className="text-lg font-black text-slate-900">{plan.workedExample.title}</h3>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-4 font-mono text-sm sm:text-base border border-slate-800 shadow-inner">
                  {plan.workedExample.problemText}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block mb-1">
                      Pitfall to Avoid
                    </span>
                    <p className="text-xs text-rose-900 leading-relaxed font-semibold">
                      {plan.workedExample.commonMistake}
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-1">
                      Correct Strategic Approach
                    </span>
                    <p className="text-xs text-emerald-900 leading-relaxed font-semibold">
                      {plan.workedExample.correctMethod}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Step-by-Step Solution Breakdown:
                  </span>
                  {plan.workedExample.stepByStep.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Icons.ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveStage(1)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveStage(3)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-2"
                  >
                    <span>Start Practice Questions</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 3: PRACTICE QUESTIONS */}
            {activeStage === 3 && currentPracticeProblem && (
              <motion.div
                key={`practice-${practiceIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Step 4: Targeted Practice (Item {practiceIndex + 1} of {plan.practiceQuestions.length})
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Reinforcing {category} Elimination
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {practiceCompletedCount} solved
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4">
                    {currentPracticeProblem.question}
                  </p>

                  <div className="grid gap-2.5">
                    {currentPracticeProblem.options.map((opt, oIdx) => {
                      const isSelected = selectedPracticeOption === oIdx;
                      const isCorrectAnswer = oIdx === currentPracticeProblem.correctAnswer;
                      const hasFeedback = practiceFeedback !== null;

                      let btnStyle = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800';
                      if (hasFeedback) {
                        if (isCorrectAnswer) {
                          btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isSelected && !practiceFeedback.isCorrect) {
                          btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={hasFeedback && practiceFeedback.isCorrect}
                          onClick={() => {
                            setSelectedPracticeOption(oIdx);
                            setPracticeFeedback(null);
                          }}
                          className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {hasFeedback && isCorrectAnswer && (
                            <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {practiceFeedback && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    practiceFeedback.isCorrect 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    {practiceFeedback.isCorrect ? (
                      <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Icons.AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block mb-0.5">
                        {practiceFeedback.isCorrect ? 'Outstanding!' : 'Need Guidance?'}
                      </span>
                      <span>{practiceFeedback.text}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveStage(2)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Back to Example
                  </button>

                  {!practiceFeedback?.isCorrect ? (
                    <button
                      disabled={selectedPracticeOption === null}
                      onClick={handlePracticeSubmit}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow transition-all"
                    >
                      Check Practice Answer
                    </button>
                  ) : (
                    <button
                      onClick={handlePracticeNext}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-2"
                    >
                      <span>{practiceIndex < plan.practiceQuestions.length - 1 ? 'Next Practice Item' : 'Advance to Reassessment'}</span>
                      <Icons.ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STAGE 4: REASSESSMENT */}
            {activeStage === 4 && currentReassessProblem && (
              <motion.div
                key={`reassess-${reassessIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Step 5: Calibration Reassessment (Item {reassessIndex + 1} of {plan.reassessmentQuestions.length})
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Verifying Error Pattern Resolution
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    Benchmark Mode
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4">
                    {currentReassessProblem.question}
                  </p>

                  <div className="grid gap-2.5">
                    {currentReassessProblem.options.map((opt, oIdx) => {
                      const isSelected = selectedReassessOption === oIdx;
                      const isCorrect = oIdx === currentReassessProblem.correctAnswer;

                      let btnStyle = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800';
                      if (showReassessFeedback) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={showReassessFeedback}
                          onClick={() => setSelectedReassessOption(oIdx)}
                          className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {showReassessFeedback && (
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong className="font-bold block mb-1">Explanation:</strong>
                    <span>{currentReassessProblem.explanation}</span>
                  </div>
                )}

                <div className="flex justify-end items-center pt-3 border-t border-slate-100">
                  {!showReassessFeedback ? (
                    <button
                      disabled={selectedReassessOption === null}
                      onClick={handleReassessSubmit}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow transition-all"
                    >
                      Confirm Reassessment Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleReassessNext}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow flex items-center gap-2"
                    >
                      <span>{reassessIndex < plan.reassessmentQuestions.length - 1 ? 'Next Question' : 'View Reassessment Results'}</span>
                      <Icons.ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STAGE 5: CERTIFICATION */}
            {activeStage === 5 && (
              <motion.div
                key="stage-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg ${
                  isReassessPassed 
                    ? 'bg-emerald-100 text-emerald-600 shadow-emerald-200' 
                    : 'bg-amber-100 text-amber-600 shadow-amber-200'
                }`}>
                  {isReassessPassed ? (
                    <Icons.Award className="w-10 h-10" />
                  ) : (
                    <Icons.RotateCcw className="w-10 h-10" />
                  )}
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Reassessment Outcome
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {isReassessPassed ? 'Remediation Demonstrated!' : 'Additional Practice Suggested'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
                    {isReassessPassed
                      ? `You successfully eliminated the ${category.toLowerCase()} pattern by scoring ${reassessScore}/${reassessTotal} on the benchmark assessment.`
                      : `You scored ${reassessScore}/${reassessTotal}. Review the worked examples and attempt the practice items once more.`}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto flex items-center justify-around">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Benchmark Score</span>
                    <div className="text-2xl font-black text-slate-900">{Math.round((reassessScore / reassessTotal) * 100)}%</div>
                  </div>
                  <div className="w-px h-10 bg-slate-200" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">XP Awarded</span>
                    <div className="text-2xl font-black text-indigo-600">+{isReassessPassed ? 150 : 50} XP</div>
                  </div>
                  <div className="w-px h-10 bg-slate-200" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                    <div className="text-xs font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                      {isReassessPassed ? 'Resolved' : 'In Progress'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-3">
                  {!isReassessPassed && (
                    <button
                      onClick={() => {
                        setActiveStage(2);
                        setPracticeIndex(0);
                        setSelectedPracticeOption(null);
                        setPracticeFeedback(null);
                        setReassessIndex(0);
                        setSelectedReassessOption(null);
                        setReassessAnswers([]);
                      }}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                    >
                      Review Worked Examples Again
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow"
                  >
                    Complete & Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
