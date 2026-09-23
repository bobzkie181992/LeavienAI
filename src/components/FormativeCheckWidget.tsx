import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  Target,
  BarChart2,
  Info
} from 'lucide-react';

export interface FormativeQuestion {
  id: string;
  title?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  remediationHint: string;
  competency: string;
}

interface FormativeCheckWidgetProps {
  title?: string;
  subtitle?: string;
  questions?: FormativeQuestion[];
  onComplete?: (score: number, total: number) => void;
  onNextStep?: () => void;
}

const DEFAULT_FORMATIVE_QUESTIONS: FormativeQuestion[] = [
  {
    id: 'fcheck-1',
    title: 'Evaluating Functions Check',
    question: 'What is the value of f(3) if f(x) = 2x + 1?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2, // Index 2 -> "7"
    explanation: 'f(3) = 2(3) + 1 = 6 + 1 = 7.',
    remediationHint: 'Review the example about evaluating functions by substituting x = 3 into f(x) = 2x + 1.',
    competency: 'M11GM-Ia-2: Evaluates functions accurately'
  },
  {
    id: 'fcheck-2',
    title: 'Function Representations',
    question: 'Which of the following relations is NOT a function?',
    options: [
      '{(1, 2), (2, 3), (3, 4)}',
      '{(1, 5), (1, 6), (2, 7)}',
      '{(0, 0), (2, 4), (-2, 4)}',
      '{(3, 1), (4, 1), (5, 1)}'
    ],
    correctAnswer: 1, // Index 1 -> repeated x=1
    explanation: 'The set {(1, 5), (1, 6), (2, 7)} has the domain element x = 1 paired with two different range values (5 and 6), violating the definition of a function.',
    remediationHint: 'A relation is NOT a function if an x-value repeats with different y-values.',
    competency: 'M11GM-Ia-1: Represents real-life situations using functions'
  }
];

interface AnswerRecord {
  selected: number;
  isCorrect: boolean;
}

export default function FormativeCheckWidget({
  title = 'FORMATIVE CHECK',
  subtitle = 'Continuous Learning & Quick Knowledge Check',
  questions = DEFAULT_FORMATIVE_QUESTIONS,
  onComplete,
  onNextStep
}: FormativeCheckWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answersState, setAnswersState] = useState<Record<number, AnswerRecord>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex] || DEFAULT_FORMATIVE_QUESTIONS[0];
  const isCorrect = selectedOption === currentQ.correctAnswer;

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);

    const newAnswers: Record<number, AnswerRecord> = {
      ...answersState,
      [currentIndex]: { selected: selectedOption, isCorrect }
    };
    setAnswersState(newAnswers);

    if (currentIndex === questions.length - 1) {
      const correctCount = Object.values(newAnswers).filter((a: AnswerRecord) => a.isCorrect).length;
      if (onComplete) {
        onComplete(correctCount, questions.length);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  // Metrics for summary
  const totalAnswered = Object.keys(answersState).length;
  const correctCount = Object.values(answersState).filter((a: AnswerRecord) => a.isCorrect).length;
  const incorrectCount = totalAnswered - correctCount;
  const accuracyPercent = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Non-punitive Low-Stakes Notice */}
      <div className="flex items-center justify-between gap-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs">
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Low-Stakes Practice Check</span>
        </div>
        <span className="text-[10px] font-black uppercase text-indigo-600 bg-white px-2.5 py-0.5 rounded-full border border-indigo-100">
          Formative • Non-Graded
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key={`question-${currentIndex}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            {/* Question Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-black uppercase tracking-wider">
                <span>{title} • Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-indigo-600">{currentQ.competency.split(':')[0]}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isAnswerCorrect = idx === currentQ.correctAnswer;

                let optionClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300';
                if (isSelected) {
                  optionClass = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-black shadow-xs';
                }
                if (isSubmitted) {
                  if (isAnswerCorrect) {
                    optionClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black';
                  } else if (isSelected && !isCorrect) {
                    optionClass = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${optionClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full border text-xs font-black flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSubmitted && isAnswerCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Submit Action */}
            {!isSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmit}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                  selectedOption !== null
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 active:scale-98'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Submit Formative Answer
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2"
              >
                {/* Immediate Feedback Box */}
                {isCorrect ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>✓ Correct!</span>
                    </div>
                    <p className="text-xs text-emerald-950 font-mono font-bold leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>✗ Not quite.</span>
                    </div>
                    <p className="text-xs text-rose-950 font-medium leading-relaxed">
                      {currentQ.remediationHint}
                    </p>
                  </div>
                )}

                {/* Navigation Row */}
                <div className="flex items-center gap-3">
                  {!isCorrect && (
                    <button
                      onClick={handleRetryQuestion}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Formative Check'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Formative Check Summary Screen */
          <motion.div
            key="formative-summary"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block">
                Formative Summary
              </span>
              <h3 className="text-xl font-black text-slate-900">Formative Check Complete!</h3>
              <p className="text-xs text-slate-500">Continuous learning feedback recorded for your study progress.</p>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Answered</span>
                <span className="text-lg font-black text-slate-900">{totalAnswered}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Correct</span>
                <span className="text-lg font-black text-emerald-600">{correctCount}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">Incorrect</span>
                <span className="text-lg font-black text-rose-500">{incorrectCount}</span>
              </div>
            </div>

            {/* Accuracy Progress Bar */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Formative Accuracy Rate</span>
                <span className="text-indigo-600 font-mono font-black">{accuracyPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${accuracyPercent}%` }}
                />
              </div>
            </div>

            {/* Competency Practiced */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Competencies Practiced:
              </span>
              <p className="text-xs font-bold text-slate-800">
                {questions.map((q) => q.competency).filter((v, i, a) => a.indexOf(v) === i).join(' • ')}
              </p>
            </div>

            {/* Action CTA */}
            {onNextStep && (
              <button
                onClick={onNextStep}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Continue Lesson Activity</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
