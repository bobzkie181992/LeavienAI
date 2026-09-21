import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Bookmark,
  Target,
  Sparkles,
  BarChart3,
  ListChecks,
  Printer,
  X,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import {
  SummativeAssessment,
  SummativeTranscript,
  OutcomeMasteryResult,
  UserProfile,
  ItemResponse
} from '../types';

interface SummativeAssessmentModalProps {
  assessment: SummativeAssessment;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (result: {
    quizId: string;
    score: number;
    total: number;
    itemResponses: ItemResponse[];
    quizMode: 'summative';
    summativeTranscript: SummativeTranscript;
  }) => void;
  onAddXP?: (amount: number) => Promise<number>;
}

export default function SummativeAssessmentModal({
  assessment,
  profile,
  isOpen,
  onClose,
  onSaveResult,
  onAddXP
}: SummativeAssessmentModalProps) {
  // Assessment phases: 'blueprint' (TOS & Outcomes overview) | 'testing' (in progress) | 'transcript' (results & outcome analysis)
  const [phase, setPhase] = useState<'blueprint' | 'testing' | 'transcript'>('blueprint');
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState(assessment.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isUntimed, setIsUntimed] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);
  const [showItemReview, setShowItemReview] = useState(false);
  const [activeOutcomeFilter, setActiveOutcomeFilter] = useState<string | 'all'>('all');
  const [transcript, setTranscript] = useState<SummativeTranscript | null>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setPhase('blueprint');
      setCurrentProblemIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeRemaining(assessment.durationMinutes * 60);
      setIsTimerRunning(false);
      setShowSubmitWarning(false);
      setShowItemReview(false);
      setActiveOutcomeFilter('all');
      setTranscript(null);
    }
  }, [isOpen, assessment]);

  // Countdown timer in 'testing' phase
  useEffect(() => {
    let interval: any = null;
    if (phase === 'testing' && isTimerRunning && !isUntimed && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, isTimerRunning, isUntimed, timeRemaining]);

  // Format time remaining MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessment.problems.length;
  const unansweredCount = totalQuestions - answeredCount;

  // Start exam from blueprint
  const handleStartExam = () => {
    setPhase('testing');
    setIsTimerRunning(true);
  };

  // Toggle answer selection
  const handleSelectOption = (problemIdx: number, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [problemIdx]: optionIdx
    }));
  };

  // Toggle review flag
  const toggleFlag = (problemIdx: number) => {
    setFlagged((prev) => ({
      ...prev,
      [problemIdx]: !prev[problemIdx]
    }));
  };

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    calculateAndSaveResults();
  };

  // Manual submit confirmation
  const handleSubmit = () => {
    if (unansweredCount > 0) {
      setShowSubmitWarning(true);
    } else {
      calculateAndSaveResults();
    }
  };

  // Calculate scores aligned to each Intended Learning Outcome
  const calculateAndSaveResults = () => {
    setIsTimerRunning(false);
    setShowSubmitWarning(false);

    let rawScore = 0;
    const itemResponses: ItemResponse[] = [];

    // Track score per intended outcome
    const outcomeScores: Record<
      string,
      { correct: number; total: number; outcome: typeof assessment.intendedOutcomes[0] }
    > = {};

    assessment.intendedOutcomes.forEach((ilo) => {
      outcomeScores[ilo.id] = { correct: 0, total: 0, outcome: ilo };
    });

    assessment.problems.forEach((problem, index) => {
      const selected = answers[index];
      const isCorrect = selected !== undefined && selected === problem.correctAnswer;
      if (isCorrect) rawScore += 1;

      if (outcomeScores[problem.intendedOutcomeId]) {
        outcomeScores[problem.intendedOutcomeId].total += 1;
        if (isCorrect) {
          outcomeScores[problem.intendedOutcomeId].correct += 1;
        }
      }

      itemResponses.push({
        problemId: problem.id,
        isCorrect,
        topic: problem.topic,
        competency: problem.competency,
        difficultyLevel: problem.difficulty,
        difficultyParameter: problem.difficultyParameter ?? 0,
        discriminationParameter: problem.discriminationParameter ?? 1,
        selectedOption: selected ?? -1,
        responseTimeMs: Math.round((assessment.durationMinutes * 60 / totalQuestions) * 1000)
      });
    });

    const percentage = Math.round((rawScore / totalQuestions) * 100);
    const passed = percentage >= assessment.passingScorePercentage;

    // DepEd Performance Descriptor
    let depEdDescriptor: SummativeTranscript['depEdDescriptor'] = 'Did Not Meet Expectations (<75%)';
    if (percentage >= 90) {
      depEdDescriptor = 'Outstanding (90-100%)';
    } else if (percentage >= 85) {
      depEdDescriptor = 'Very Satisfactory (85-89%)';
    } else if (percentage >= 80) {
      depEdDescriptor = 'Satisfactory (80-84%)';
    } else if (percentage >= 75) {
      depEdDescriptor = 'Fairly Satisfactory (75-79%)';
    }

    // Outcome Mastery Analysis
    const outcomeMastery: OutcomeMasteryResult[] = assessment.intendedOutcomes.map((ilo) => {
      const stat = outcomeScores[ilo.id] || { correct: 0, total: 0 };
      const outPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      let status: OutcomeMasteryResult['status'] = 'Needs Remediation';
      let remediation = `Review ${ilo.title} learning materials and practice fundamental exercises.`;

      if (outPct >= 80) {
        status = 'Mastered';
        remediation = 'Strong outcome mastery demonstrated across all aligned items.';
      } else if (outPct >= 60) {
        status = 'Proficient';
        remediation = 'Good procedural understanding with minor calculation inconsistencies.';
      } else if (outPct >= 40) {
        status = 'Developing';
        remediation = 'Requires targeted remediation in algebraic manipulation and conceptual modeling.';
      }

      return {
        outcomeId: ilo.id,
        code: ilo.code,
        title: ilo.title,
        cognitiveDomain: ilo.cognitiveDomain,
        score: stat.correct,
        total: stat.total,
        percentage: outPct,
        status,
        remediationRecommendation: remediation
      };
    });

    const timeSpent = Math.max(1, assessment.durationMinutes * 60 - timeRemaining);

    const newTranscript: SummativeTranscript = {
      id: `trans_${assessment.id}_${Date.now()}`,
      userId: profile.uid,
      studentName: profile.displayName,
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      topicId: assessment.topicId,
      topicTitle: assessment.topicTitle,
      score: rawScore,
      total: totalQuestions,
      percentage,
      passed,
      depEdDescriptor,
      outcomeMastery,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
      xpEarned: passed ? assessment.xpReward : Math.round(assessment.xpReward * 0.4)
    };

    setTranscript(newTranscript);
    setPhase('transcript');

    // Save result to Firebase & update profile
    onSaveResult({
      quizId: assessment.id,
      score: rawScore,
      total: totalQuestions,
      itemResponses,
      quizMode: 'summative',
      summativeTranscript: newTranscript
    });

    if (onAddXP) {
      onAddXP(newTranscript.xpEarned);
    }
  };

  const handlePrintTranscript = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentProblem = assessment.problems[currentProblemIndex];
  const currentOutcome = assessment.intendedOutcomes.find(
    (o) => o.id === currentProblem?.intendedOutcomeId
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border border-indigo-500/40">
                  DepEd Summative Evaluation
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {assessment.gradeLevel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white line-clamp-1">
                {assessment.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === 'testing' && !isUntimed && (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-black transition-colors ${
                  timeRemaining < 300
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-indigo-300 border border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MODAL BODY (PHASE-SPECIFIC)                                               */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">

          {/* --------------------------------------------------------------------- */}
          {/* PHASE 1: BLUEPRINT & TABLE OF SPECIFICATIONS (TOS) PRE-FLIGHT         */}
          {/* --------------------------------------------------------------------- */}
          {phase === 'blueprint' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Exam Overview Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Target className="w-3 h-3 text-amber-600" />
                        <span>Outcome-Aligned Assessment</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {assessment.term}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {assessment.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {assessment.description}
                    </p>
                  </div>

                  {/* Benchmark badges */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black">
                      Passing Score: {assessment.passingScorePercentage}%
                    </div>
                    <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>+{assessment.xpReward} XP Reward</span>
                    </div>
                  </div>
                </div>

                {/* Table of Specifications (DepEd Standard Format) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Table of Specifications (TOS) & Intended Learning Outcomes
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      Total Items: {assessment.problems.length} • 100% Curriculum Alignment
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3">Competency Code</th>
                          <th className="p-3">Intended Learning Outcome (ILO)</th>
                          <th className="p-3">Cognitive Domain</th>
                          <th className="p-3 text-center">Items</th>
                          <th className="p-3 text-right">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {assessment.intendedOutcomes.map((ilo, idx) => (
                          <tr key={ilo.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="p-3 font-mono font-bold text-indigo-600 whitespace-nowrap">
                              {ilo.code}
                            </td>
                            <td className="p-3 font-medium text-slate-800">
                              <span className="font-bold block text-slate-900">{ilo.title}</span>
                              <span className="text-[11px] text-slate-500">{ilo.description}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold inline-block whitespace-nowrap">
                                {ilo.cognitiveDomain}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-700 text-center">
                              {ilo.targetItemsCount}
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-900 text-right">
                              {ilo.weightPercentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Exam Guidelines & Conditions */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Summative Evaluation Guidelines</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1">
                    <li>This assessment evaluates your final mastery against the curriculum outcomes.</li>
                    <li>Unlike formative quizzes, answers and step solutions are evaluated at the end of the exam.</li>
                    <li>You may freely navigate between questions and flag items for review before submitting.</li>
                    <li>Time limit is {assessment.durationMinutes} minutes. You will receive an official DepEd Performance Transcript upon completion.</li>
                  </ul>
                </div>

                {/* Accommodations / Untimed Mode toggle */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isUntimed}
                      onChange={(e) => setIsUntimed(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Untimed Accessibility Mode (No countdown pressure)</span>
                  </label>

                  <button
                    onClick={handleStartExam}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Begin Summative Examination</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* PHASE 2: ACTIVE EXAMINATION INTERFACE                                 */}
          {/* --------------------------------------------------------------------- */}
          {phase === 'testing' && currentProblem && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* Question Main Panel (3 cols) */}
              <div className="lg:col-span-3 space-y-5">
                {/* Active Question Box */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                  
                  {/* Item Outcome Alignment Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-indigo-100">
                        <Target className="w-3 h-3 text-indigo-600" />
                        <span>Item {currentProblemIndex + 1} of {totalQuestions}</span>
                      </span>
                      {currentOutcome && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                          Outcome: {currentOutcome.code}
                        </span>
                      )}
                      <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {currentProblem.cognitiveLevel}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleFlag(currentProblemIndex)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        flagged[currentProblemIndex]
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{flagged[currentProblemIndex] ? 'Flagged' : 'Flag for Review'}</span>
                    </button>
                  </div>

                  {/* Outcome Description Banner */}
                  {currentOutcome && (
                    <div className="text-[11px] text-indigo-900 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Measuring Intended Outcome: </strong>
                        <span>{currentOutcome.title}</span>
                      </div>
                    </div>
                  )}

                  {/* Question Stem */}
                  <div className="text-slate-900 font-bold text-base sm:text-lg leading-relaxed whitespace-pre-line">
                    {currentProblem.question}
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-3 pt-2">
                    {currentProblem.options.map((option, optIdx) => {
                      const isSelected = answers[currentProblemIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentProblemIndex, optIdx)}
                          className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all flex items-center gap-4 cursor-pointer border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md translate-x-1'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-white text-indigo-600'
                                : 'bg-white text-slate-700 border border-slate-200 shadow-xs'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span className="flex-1 leading-snug">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentProblemIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentProblemIndex === 0}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        currentProblemIndex === 0
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-700 hover:bg-slate-100 active:scale-95'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="text-xs font-bold text-slate-400">
                      Answered {answeredCount} of {totalQuestions}
                    </div>

                    {currentProblemIndex < totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentProblemIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Review & Submit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Navigation Palette (1 col) */}
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Question Palette
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500">
                      {Math.round((answeredCount / totalQuestions) * 100)}% Done
                    </span>
                  </div>

                  {/* Palette Legend */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-emerald-500" />
                      <span>Answered ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-amber-400" />
                      <span>Flagged ({Object.values(flagged).filter(Boolean).length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-slate-200" />
                      <span>Unanswered ({unansweredCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md border-2 border-indigo-600" />
                      <span>Current</span>
                    </div>
                  </div>

                  {/* Grid of Question Numbers */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {assessment.problems.map((_, idx) => {
                      const isAnswered = answers[idx] !== undefined;
                      const isFlag = flagged[idx];
                      const isCurrent = idx === currentProblemIndex;

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentProblemIndex(idx)}
                          className={`h-9 rounded-xl font-bold text-xs transition-all relative flex items-center justify-center cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 ring-offset-2'
                              : ''
                          } ${
                            isFlag
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : isAnswered
                              ? 'bg-emerald-500 text-white font-black'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isFlag && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleSubmit}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Examination</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* PHASE 3: OFFICIAL TRANSCRIPT & OUTCOME MASTERY TRANSCRIPT              */}
          {/* --------------------------------------------------------------------- */}
          {phase === 'transcript' && transcript && (
            <div className="space-y-6 max-w-4xl mx-auto print:max-w-none">
              {/* Transcript Paper Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
                
                {/* Official DepEd Header */}
                <div className="border-b-2 border-slate-900 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Official DepEd Standard Evaluation
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          {assessment.gradeLevel}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                        Summative Assessment Performance Transcript
                      </h1>
                      <p className="text-xs font-semibold text-slate-600 mt-1">
                        Evaluation of Intended Learning Outcomes & Table of Specifications
                      </p>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <button
                        onClick={handlePrintTranscript}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Transcript</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Meta Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Student Name</span>
                      <span className="font-black text-slate-900">{transcript.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Date Evaluated</span>
                      <span className="font-bold text-slate-700">
                        {new Date(transcript.completedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Time Elapsed</span>
                      <span className="font-mono font-bold text-slate-700">
                        {Math.floor(transcript.timeSpentSeconds / 60)}m {transcript.timeSpentSeconds % 60}s
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Curriculum Strand</span>
                      <span className="font-bold text-indigo-700">{transcript.topicTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Score & DepEd Descriptor Hero */}
                <div
                  className={`rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border ${
                    transcript.passed
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-600'
                      : 'bg-gradient-to-br from-amber-500 to-rose-700 text-white border-rose-600'
                  }`}
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-black uppercase tracking-wider">
                      {transcript.passed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Competency Standard Met</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-white" />
                          <span>Remediation Required</span>
                        </>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black">
                      {transcript.depEdDescriptor}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/90 max-w-md font-medium">
                      {transcript.passed
                        ? 'The learner has demonstrated mastery of the intended learning outcomes and meets the requirements for advancement.'
                        : 'The learner requires targeted scaffolding and reinforcement in developing outcome areas before progressing.'}
                    </p>
                  </div>

                  {/* Score Dial */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0 text-center min-w-[160px]">
                    <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                      {transcript.percentage}%
                    </div>
                    <div className="text-xs font-bold text-white/80 mt-1">
                      Score: {transcript.score} / {transcript.total}
                    </div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-amber-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                      +{transcript.xpEarned} XP Earned
                    </div>
                  </div>
                </div>

                {/* Outcome Achievement Matrix (Core Section) */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span>Intended Learning Outcomes Achievement Matrix</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Granular performance across each curriculum competency code
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs print:hidden">
                      <button
                        onClick={() => setActiveOutcomeFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                          activeOutcomeFilter === 'all'
                            ? 'bg-white text-indigo-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All ({transcript.outcomeMastery.length})
                      </button>
                      <button
                        onClick={() => setActiveOutcomeFilter('Mastered')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                          activeOutcomeFilter === 'Mastered'
                            ? 'bg-white text-emerald-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Mastered
                      </button>
                      <button
                        onClick={() => setActiveOutcomeFilter('Needs Remediation')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                          activeOutcomeFilter === 'Needs Remediation'
                            ? 'bg-white text-rose-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Remediation
                      </button>
                    </div>
                  </div>

                  {/* Outcome Breakdown Cards */}
                  <div className="space-y-3">
                    {transcript.outcomeMastery
                      .filter(
                        (om) =>
                          activeOutcomeFilter === 'all' || om.status === activeOutcomeFilter
                      )
                      .map((outcome) => (
                        <div
                          key={outcome.outcomeId}
                          className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all hover:bg-slate-50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                                  {outcome.code}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                                  {outcome.cognitiveDomain}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {outcome.title}
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {outcome.remediationRecommendation}
                              </p>
                            </div>

                            {/* Outcome Score & Badge */}
                            <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                  outcome.status === 'Mastered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : outcome.status === 'Proficient'
                                    ? 'bg-blue-100 text-blue-800'
                                    : outcome.status === 'Developing'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {outcome.status}
                              </span>
                              <div className="text-xs font-bold text-slate-700">
                                {outcome.score} / {outcome.total} ({outcome.percentage}%)
                              </div>
                            </div>
                          </div>

                          {/* Outcome Progress Bar */}
                          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                outcome.percentage >= 80
                                  ? 'bg-emerald-500'
                                  : outcome.percentage >= 60
                                  ? 'bg-blue-500'
                                  : outcome.percentage >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${outcome.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Detailed Item-by-Item Review Toggle */}
                <div className="pt-2 border-t border-slate-100 print:block">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowItemReview((prev) => !prev)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer print:hidden"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>{showItemReview ? 'Hide Step-by-Step Solutions' : 'Review Step-by-Step Solutions'}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setPhase('blueprint');
                          setAnswers({});
                          setFlagged({});
                          setTimeRemaining(assessment.durationMinutes * 60);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer print:hidden"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Assessment</span>
                      </button>

                      <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer print:hidden"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>

                  {/* Expandable Item-by-Item Review List */}
                  {showItemReview && (
                    <div className="mt-5 space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                        Item Solutions & Outcome Tagging:
                      </h4>

                      {assessment.problems.map((prob, idx) => {
                        const userAns = answers[idx];
                        const isCorrect = userAns === prob.correctAnswer;

                        return (
                          <div
                            key={prob.id}
                            className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-3 ${
                              isCorrect
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-rose-50/40 border-rose-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 font-bold">
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                )}
                                <span className="text-slate-900">
                                  Item {idx + 1}: {prob.question}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                {prob.outcomeCode}
                              </span>
                            </div>

                            {/* User Answer vs Correct Answer */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div
                                className={`p-2.5 rounded-xl border ${
                                  isCorrect
                                    ? 'bg-emerald-100/60 border-emerald-300 text-emerald-950 font-bold'
                                    : 'bg-rose-100/60 border-rose-300 text-rose-950 font-bold'
                                }`}
                              >
                                Your Answer:{' '}
                                {userAns !== undefined
                                  ? `${String.fromCharCode(65 + userAns)}) ${prob.options[userAns]}`
                                  : 'No Answer Selected'}
                              </div>

                              {!isCorrect && (
                                <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-300 text-emerald-950 font-bold">
                                  Correct Answer:{' '}
                                  {String.fromCharCode(65 + prob.correctAnswer)}){' '}
                                  {prob.options[prob.correctAnswer]}
                                </div>
                              )}
                            </div>

                            {/* Step Solution */}
                            <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 text-slate-800 space-y-1">
                              <span className="font-black text-indigo-900 block text-[10px] uppercase">
                                Step-by-Step Mathematical Derivation:
                              </span>
                              <p className="whitespace-pre-line font-medium leading-relaxed">
                                {prob.solution}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SUBMISSION CONFIRMATION WARNING MODAL                                     */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {showSubmitWarning && (
            <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Unanswered Questions Remaining
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    You have answered <strong className="text-indigo-600">{answeredCount}</strong> of{' '}
                    <strong>{totalQuestions}</strong> questions. There are still{' '}
                    <strong className="text-rose-600">{unansweredCount}</strong> unanswered questions.
                    Are you sure you want to submit your assessment now?
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowSubmitWarning(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Continue Answering
                  </button>

                  <button
                    onClick={calculateAndSaveResults}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Submit Anyway
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
