import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, Problem, LearningPathway, isValidatedOrActive, AIMistakeGuidance } from '../types';
import * as Icons from 'lucide-react';
import { generateLearningPathway } from '../utils/pathwayGenerator';
import { generateAIMistakeGuidance, fetchAIMistakeDiagnosis } from '../utils/aiTutorCoach';
import { playPopSound, playWarningSound } from '../utils/audioEffects';
import { useDiagnosticExam } from '../hooks/useFirebase';

interface DiagnosticAssessmentProps {
  topics: Topic[];
  onComplete: (ability: string, scores: Record<string, number>, pathway?: LearningPathway, violations?: number) => void;
  onCancel?: () => void;
}

interface CompetencyDiagnosticItem {
  competencyIndex: number;
  competencyName: string;
  topicId: string;
  topicTitle: string;
  score: number;
  total: number;
  percentage: number;
  status: 'Mastered' | 'Developing' | 'Needs Intervention';
}

export default function DiagnosticAssessment({ topics, onComplete, onCancel }: DiagnosticAssessmentProps) {
  const { questions: fetchedQuestions, settings: diagnosticSettings, loading: loadingQuestions } = useDiagnosticExam();

  const [assessmentPhase, setAssessmentPhase] = useState<'intro' | 'testing' | 'summary'>('intro');
  const [violationCount, setViolationCount] = useState<number>(0);
  const [showAltTabWarning, setShowAltTabWarning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState<Record<string, boolean>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<boolean | null>(null);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState<number>(0);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [feedbackNotice, setFeedbackNotice] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [aiMistakeGuidance, setAiMistakeGuidance] = useState<AIMistakeGuidance | null>(null);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const [revealedHintTier, setRevealedHintTier] = useState<number>(0);


  // Next-Level Transition / Competency Placement Assessment states
  const [isTakingBooster, setIsTakingBooster] = useState(false);
  const [boosterStep, setBoosterStep] = useState(0);
  const [selectedBoosterOption, setSelectedBoosterOption] = useState<number | null>(null);
  const [boosterAnswers, setBoosterAnswers] = useState<number[]>([]);
  const [boosterIsSubmitted, setBoosterIsSubmitted] = useState(false);
  const [boosterFinished, setBoosterFinished] = useState(false);
  const [boosterScore, setBoosterScore] = useState(0);

  useEffect(() => {
    if (assessmentPhase !== 'testing' && !isTakingBooster) {
      return;
    }

    let blurTimeout: any;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        playWarningSound();
        setViolationCount(prev => prev + 1);
        setShowAltTabWarning(true);
      }
    };

    const handleWindowBlur = () => {
      blurTimeout = setTimeout(() => {
        playWarningSound();
        setViolationCount(prev => prev + 1);
        setShowAltTabWarning(true);
      }, 400); // 400ms buffer to allow normal system delays
    };

    const handleWindowFocus = () => {
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
    };
  }, [assessmentPhase, isTakingBooster]);

  // Premium Next-Level Transition Questions List (Grade 11/12 Mathematics Bridge)
  const boosterQuestions = useMemo(() => [
    {
      id: "booster_1",
      topic: "Inverse, Exponential & Logarithmic Functions",
      prerequisiteFor: "Differential Calculus, Population Growth & Radioactive half-lives",
      question: "To model population growth or continuous decay, you must master exponential properties. Solve for x: 3^(2x - 1) = 27.",
      options: ["x = 1", "x = 2", "x = 1.5", "x = 3"],
      correct: 1,
      explanation: "Since 27 can be expressed as 3^3, we can equate the exponents: 2x - 1 = 3. Solving for x yields 2x = 4, which simplifies to x = 2."
    },
    {
      id: "booster_2",
      topic: "Rational Equations & Functions",
      prerequisiteFor: "Advanced curve sketching, finding infinite limits and asymptotes",
      question: "In Calculus, locating points of infinite discontinuity is essential. Determine the vertical asymptote of f(x) = (x^2 - 4) / (x^2 - 5x + 6).",
      options: ["x = 2 and x = 3", "x = 3 only", "x = 2 only", "No vertical asymptote"],
      correct: 1,
      explanation: "Factoring yields f(x) = [(x - 2)(x + 2)] / [(x - 2)(x - 3)]. The common factor (x - 2) cancels out, producing a removable point discontinuity (hole) at x = 2. Thus, the only vertical asymptote is x = 3 only."
    },
    {
      id: "booster_3",
      topic: "General Functions & Composites",
      prerequisiteFor: "The Definition of the Derivative (Difference Quotient)",
      question: "The difference quotient [f(x+h) - f(x)] / h is the formal foundation of rates of change. If f(x) = 2x^2 + 3, simplify this quotient.",
      options: ["2h", "4x + 2h", "4x", "4x + h"],
      correct: 1,
      explanation: "Expanding f(x+h) gives 2(x^2 + 2xh + h^2) + 3 = 2x^2 + 4xh + 2h^2 + 3. Subtracting f(x) leaves 4xh + 2h^2. Dividing by h results in 4x + 2h."
    },
    {
      id: "booster_4",
      topic: "Mathematical Logic & Proofs",
      prerequisiteFor: "Mathematical Induction, Real Analysis, & Logical rigor",
      question: "Advanced proofs rely heavily on contrapositive equivalence. What is the contrapositive of: 'If x^2 is even, then x is even'?",
      options: [
        "If x is even, then x^2 is even.",
        "If x is odd, then x^2 is odd.",
        "If x^2 is odd, then x is odd.",
        "If x is even, then x^2 is odd."
      ],
      correct: 1,
      explanation: "The contrapositive of 'If P then Q' is 'If not Q then not P'. Negating both components yields: 'If x is not even (odd), then x^2 is not even (odd)'."
    },
    {
      id: "booster_5",
      topic: "General Business Mathematics",
      prerequisiteFor: "Continuous financial modeling, integrals of continuous streams",
      question: "To model continuously compounding financial systems, we use Euler's constant (e). If P dollars is invested at rate r compounded continuously, what is the balance after t years?",
      options: [
        "A(t) = P(1 + r)^t",
        "A(t) = P * e^(rt)",
        "A(t) = P * e^(t)",
        "A(t) = P(1 + r/n)^(nt)"
      ],
      correct: 1,
      explanation: "Continuous compounding is modeled by the classic exponential equation A(t) = P * e^(rt), where e is the base of natural logarithms."
    }
  ], []);

  // Generate diagnostic problem set covering key Grade 11 General Mathematics competencies
  const diagnosticProblems = useMemo(() => {
    if (!fetchedQuestions || fetchedQuestions.length === 0) return [];
    
    // Shuffle or maintain stable slice based on teacher-configured settings
    const shuffled = [...fetchedQuestions].sort(() => 0.5 - Math.random());
    const limit = diagnosticSettings?.itemsCount || 10;
    
    return shuffled.slice(0, limit).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct,
      explanation: q.explanation,
      hint1: q.hint1 || '',
      hint2: q.hint2 || '',
      topicId: q.topic.toLowerCase().replace(/\s+/g, '-'),
      topicTitle: q.topic,
      competencyLabel: q.competency,
      competency: q.competency,
      status: 'Active' as const,
      hints: [q.hint1 || '', q.hint2 || '']
    }));
  }, [fetchedQuestions, diagnosticSettings]);

  if (loadingQuestions) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mb-4 animate-spin"
        />
        <h3 className="text-lg font-bold text-slate-800">Loading Diagnostic Assessment...</h3>
        <p className="text-slate-500 text-sm mt-1">Preparing baseline questions based on teacher curriculum rules.</p>
      </div>
    );
  }

  if (diagnosticProblems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm my-12">
        <Icons.AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Curriculum Items Available</h2>
        <p className="text-slate-500 text-sm mb-6">
          The diagnostic assessment requires validated Grade 11 Mathematics items. Please check topic quizzes or consult faculty.
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    );
  }

  const problem = diagnosticProblems[currentStep];

  const getHint1 = (p: Problem) => {
    if (p.hint1 && p.hint1.trim()) return p.hint1;
    if (p.hints && p.hints[0]) return p.hints[0];
    return `Analyze the problem statement: identify given variables and recall core formulas for ${p.competency || p.topic}. Rule out choices that violate mathematical constraints.`;
  };

  const getHint2 = (p: Problem) => {
    if (p.hint2 && p.hint2.trim()) return p.hint2;
    if (p.hints && p.hints[1]) return p.hints[1];
    return `Substitute the values step-by-step into the algebraic equation and verify signs and domain restrictions carefully.`;
  };

  const getHint3 = (p: Problem) => {
    if (p.hint3 && p.hint3.trim()) return p.hint3;
    if (p.hints && p.hints[2]) return p.hints[2];
    return `First step: Set up the initial equation or relation, carefully check your signs, and isolate the primary variable.`;
  };

  const handleOptionSelect = (index: number) => {
    if (isSolutionRevealed || (isAnswered && isLastAnswerCorrect)) return;
    setSelectedOption(index);
    if (isAnswered && !isLastAnswerCorrect) {
      setIsAnswered(false);
      setIsLastAnswerCorrect(null);
      setFeedbackNotice(null);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || !problem) return;

    const attemptsSoFar = attemptsOnCurrent + 1;
    setAttemptsOnCurrent(attemptsSoFar);

    const isCorrect = selectedOption === problem.correctAnswer;
    
    // Record first attempt for baseline ability and competency diagnostic
    if (firstAttemptCorrect[problem.id] === undefined) {
      setFirstAttemptCorrect(prev => ({
        ...prev,
        [problem.id]: isCorrect && attemptsSoFar === 1
      }));
    }

    if (isCorrect) {
      setIsAnswered(true);
      setIsLastAnswerCorrect(true);
      setIsSolutionRevealed(true);
      setFeedbackNotice({
        isCorrect: true,
        text: attemptsSoFar === 1 
          ? "🎉 Correct! Outstanding mathematical reasoning on your first attempt." 
          : `🎉 Correct on attempt #${attemptsSoFar}! Great job using the progressive hints to work through the solution.`
      });
      setAiMistakeGuidance(null);
    } else {
      // Diagnostic mode: progressive hints and AI guidance, do NOT reveal complete answer!
      setIsLastAnswerCorrect(false);
      setIsAnswered(true);
      setIsSolutionRevealed(false);

      const guidance = generateAIMistakeGuidance(problem, selectedOption);
      setAiMistakeGuidance(guidance);
      setRevealedHintTier(1);

      // Async fetch enhanced diagnosis
      fetchAIMistakeDiagnosis(problem, selectedOption).then(asyncG => {
        if (asyncG) setAiMistakeGuidance(asyncG);
      });

      setFeedbackNotice(null);
    }
  };

  const handleNext = () => {
    setAttemptsOnCurrent(0);
    setHintLevel(0);
    setRevealedHintTier(0);
    setFeedbackNotice(null);
    setAiMistakeGuidance(null);
    setIsSolutionRevealed(false);
    setIsAnswered(false);
    setIsLastAnswerCorrect(null);
    setSelectedOption(null);

    if (currentStep < diagnosticProblems.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setAssessmentPhase('summary');
    }
  };

  // =========================================================================
  // 1. INTRODUCTORY SCREEN
  // =========================================================================
  if (assessmentPhase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100"
        >
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Icons.Target className="w-4 h-4 text-amber-600" />
                <span>Initial Diagnostic Assessment</span>
              </span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1">
                <Icons.ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>Validated Content + 2PL IRT</span>
              </span>
            </div>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip for Now
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
            Diagnostic Mathematics Assessment
          </h1>
          
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 sm:p-5 mb-6 text-amber-950">
            <p className="text-sm sm:text-base font-semibold leading-relaxed">
              The purpose of this diagnostic test is <span className="underline decoration-amber-500 font-black">NOT simply to calculate a raw score</span>.
            </p>
            <p className="text-xs sm:text-sm text-amber-900 mt-1.5 leading-relaxed">
              It determines your <strong className="font-bold">estimated mathematics ability</strong> and identifies specific <strong className="font-bold">competencies where you need support</strong> to generate a customized learning pathway.
            </p>
          </div>

          {/* Assessment Methodology Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2.5">
                <Icons.Brain className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Ability Estimation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Determines your mathematical level: <em className="font-medium text-slate-700">Novice, Developing, Proficient, Advanced, or Expert</em>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2.5">
                <Icons.Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">3-Tier Status</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Categorizes each competency as <span className="text-emerald-700 font-bold">Mastered (≥80%)</span>, <span className="text-amber-700 font-bold">Developing (50-79%)</span>, or <span className="text-rose-700 font-bold">Needs Intervention (&lt;50%)</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold mb-2.5">
                <Icons.Compass className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Study Roadmap</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Recommends exactly what you should study next with targeted mini-lessons and guided practice.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              id="start-diagnostic-assessment-btn"
              onClick={() => setAssessmentPhase('testing')}
              className="w-full sm:flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <Icons.Play className="w-5 h-5 fill-current" />
              <span>Begin Diagnostic Assessment ({diagnosticProblems.length} Items)</span>
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // 2. DIAGNOSTIC RESULTS & SUMMARY SCREEN
  // =========================================================================
  if (assessmentPhase === 'summary') {
    // 1. Group problem results by competency
    const competencyStatsMap = new Map<string, { topicId: string; topicTitle: string; correct: number; total: number }>();
    
    diagnosticProblems.forEach(p => {
      const compName = p.competencyLabel || p.competency || p.topicTitle;
      if (!competencyStatsMap.has(compName)) {
        competencyStatsMap.set(compName, {
          topicId: p.topicId,
          topicTitle: p.topicTitle,
          correct: 0,
          total: 0
        });
      }
      const entry = competencyStatsMap.get(compName)!;
      entry.total += 1;
      if (firstAttemptCorrect[p.id]) {
        entry.correct += 1;
      }
    });

    const competencyReportItems: CompetencyDiagnosticItem[] = [];
    const finalScores: Record<string, number> = {};
    let totalFirstAttemptCorrect = 0;
    let totalQuestionsCount = diagnosticProblems.length;

    let compIdx = 1;
    competencyStatsMap.forEach((stats, compName) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      finalScores[compName] = percentage;
      finalScores[stats.topicId] = percentage;
      totalFirstAttemptCorrect += stats.correct;

      let status: 'Mastered' | 'Developing' | 'Needs Intervention' = 'Developing';
      if (percentage >= 80) {
        status = 'Mastered';
      } else if (percentage < 50) {
        status = 'Needs Intervention';
      }

      competencyReportItems.push({
        competencyIndex: compIdx++,
        competencyName: compName,
        topicId: stats.topicId,
        topicTitle: stats.topicTitle,
        score: stats.correct,
        total: stats.total,
        percentage,
        status
      });
    });

    // Overall Ability Estimation
    const overallPercentage = totalQuestionsCount > 0 ? Math.round((totalFirstAttemptCorrect / totalQuestionsCount) * 100) : 0;
    
    let estimatedAbility = 'Novice';
    if (overallPercentage >= 85) estimatedAbility = 'Expert';
    else if (overallPercentage >= 70) estimatedAbility = 'Advanced';
    else if (overallPercentage >= 55) estimatedAbility = 'Proficient';
    else if (overallPercentage >= 35) estimatedAbility = 'Developing';

    // Group competencies by status for recommendations
    const needsInterventionList = competencyReportItems.filter(c => c.status === 'Needs Intervention');
    const developingList = competencyReportItems.filter(c => c.status === 'Developing');
    const masteredList = competencyReportItems.filter(c => c.status === 'Mastered');

    // Generate Targeted Learning Pathway starting with the lowest-scoring competency
    const weakestCompetency = [...competencyReportItems].sort((a, b) => a.percentage - b.percentage)[0];
    
    let generatedPathway: LearningPathway | undefined;
    if (weakestCompetency) {
      generatedPathway = generateLearningPathway(
        weakestCompetency.competencyName,
        topics,
        weakestCompetency.percentage
      );
    }

    // =========================================================================
    // SUB-VIEW A: ACTIVE NEXT-LEVEL COMPETENCY BOOSTER CHALLENGE
    // =========================================================================
    if (isTakingBooster) {
      const q = boosterQuestions[boosterStep];
      const boosterProgress = ((boosterStep + 1) / boosterQuestions.length) * 100;
      return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
          {/* Top Navigation Bar */}
          <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 shadow-sm z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <button 
                onClick={() => {
                  setIsTakingBooster(false);
                  setBoosterStep(0);
                  setSelectedBoosterOption(null);
                  setBoosterAnswers([]);
                  setBoosterIsSubmitted(false);
                }} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Cancel Assessment"
              >
                <Icons.ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div className="flex items-center gap-2">
                <Icons.Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span className="text-sm font-black tracking-tight text-slate-900">Next-Level Transition Challenge</span>
              </div>
            </div>

            <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-8">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${boosterProgress}%` }}
                />
              </div>
            </div>

            <div className="text-xs sm:text-sm font-bold text-slate-400 shrink-0">
              Item {boosterStep + 1} of {boosterQuestions.length}
            </div>
          </div>

          {/* Question Content Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Prerequisite and Prep label */}
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                  <Icons.Award className="w-24 h-24 text-indigo-900" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Icons.Award className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider">
                    Booster Domain: {q.topic}
                  </span>
                </div>
                <p className="text-xs text-indigo-950 font-bold leading-relaxed">
                  Required Competency for: <span className="underline decoration-indigo-400">{q.prerequisiteFor}</span>
                </p>
              </div>

              {/* Question Statement */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {q.question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="grid gap-3">
                {q.options.map((opt, oIdx) => {
                  let optStyle = "border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/20";
                  if (selectedBoosterOption === oIdx) {
                    optStyle = "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500/20";
                  }
                  if (boosterIsSubmitted) {
                    if (oIdx === q.correct) {
                      optStyle = "border-emerald-500 bg-emerald-50 text-emerald-950";
                    } else if (selectedBoosterOption === oIdx) {
                      optStyle = "border-rose-300 bg-rose-50/50 text-rose-950 opacity-75";
                    }
                  }
                  return (
                    <button
                      key={oIdx}
                      disabled={boosterIsSubmitted}
                      onClick={() => setSelectedBoosterOption(oIdx)}
                      className={`w-full p-4 sm:p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          boosterIsSubmitted && oIdx === q.correct ? 'bg-emerald-500 text-white' :
                          boosterIsSubmitted && selectedBoosterOption === oIdx ? 'bg-rose-400 text-white' :
                          selectedBoosterOption === oIdx ? 'bg-indigo-600 text-white' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="font-semibold text-slate-800 text-sm sm:text-base">
                          {opt}
                        </span>
                      </div>
                      {boosterIsSubmitted && oIdx === q.correct && <Icons.CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {boosterIsSubmitted && selectedBoosterOption === oIdx && oIdx !== q.correct && <Icons.XCircle className="w-5 h-5 text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Explainer Insight Box */}
              {boosterIsSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-sm"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icons.Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Booster Mathematical Proof</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="px-4 sm:px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3 z-10">
            {!boosterIsSubmitted ? (
              <button
                disabled={selectedBoosterOption === null}
                onClick={() => {
                  setBoosterIsSubmitted(true);
                  if (selectedBoosterOption === q.correct) {
                    setBoosterScore(prev => prev + 1);
                  }
                  setBoosterAnswers(prev => [...prev, selectedBoosterOption!]);
                }}
                className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl text-xs uppercase tracking-wider disabled:opacity-50 hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
              >
                Verify Competency
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedBoosterOption(null);
                  setBoosterIsSubmitted(false);
                  if (boosterStep + 1 < boosterQuestions.length) {
                    setBoosterStep(prev => prev + 1);
                  } else {
                    setBoosterFinished(true);
                    setIsTakingBooster(false);
                  }
                }}
                className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-slate-800 active:scale-95 transition-all"
              >
                {boosterStep + 1 < boosterQuestions.length ? "Proceed to Next Question" : "View Final Report"}
              </button>
            )}
          </div>
        </div>
      );
    }

    // =========================================================================
    // SUB-VIEW B: BOOSTER CHALLENGE RESULTS REPORT
    // =========================================================================
    if (boosterFinished) {
      const boostPercent = Math.round((boosterScore / boosterQuestions.length) * 100);
      let rating = "Silver Standard (Developing)";
      let ratingDesc = "You are building foundational competencies. Review your conceptual breakdowns and work through the custom-guided curriculum pathways to establish competitive speed under exam conditions.";
      let badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
      
      if (boosterScore === 5) {
        rating = "🏆 Platinum Elite Preparatory (100% Competitive)";
        ratingDesc = "Sensational score! You possess flawless conceptual agility and analytical mechanics. You are fully prepared to lead group learning activities and tackle university-level calculus modeling!";
        badgeColor = "bg-indigo-100 text-indigo-800 border-indigo-200";
      } else if (boosterScore >= 3) {
        rating = "⭐ Gold Transition Ready (Sufficiently Competitive)";
        ratingDesc = "Superb job! You possess sufficient mathematical literacy to transition smoothly to Grade 12 advanced pre-calculus, analytic curves, and Euler exponential continuous modeling.";
        badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
      }

      return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
          <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-2xl border border-slate-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Icons.Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Placement Booster Report
              </h2>
              <p className="text-slate-500 text-xs max-w-md mx-auto mt-1 leading-relaxed">
                Evaluating structural competency and readiness for high-tier university algebraic and calculus progressions.
              </p>
            </div>

            {/* Score Showcase */}
            <div className="bg-slate-50 rounded-[24px] p-6 sm:p-8 mb-8 border border-slate-200 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Booster Placement Score:
              </span>
              <div className="text-5xl font-black text-indigo-600 mb-2">
                {boosterScore} / {boosterQuestions.length}
              </div>
              <p className="text-xs text-slate-500 font-bold mb-4">{boostPercent}% Overall Transition Performance</p>
              
              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${badgeColor} mb-3`}>
                <span>{rating}</span>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {ratingDesc}
              </p>
            </div>

            {/* Question-by-Question Review */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                Booster Itemized Review
              </h3>
              <div className="space-y-3">
                {boosterQuestions.map((bq, idx) => {
                  const isCorrect = boosterAnswers[idx] === bq.correct;
                  return (
                    <div key={bq.id} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Item {idx + 1} • {bq.topic}
                          </span>
                          <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                            {bq.question}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 italic mb-2 leading-relaxed">
                        Your submission: <span className="font-semibold text-slate-700">{bq.options[boosterAnswers[idx] ?? 0]}</span> | Correct answer: <span className="font-semibold text-emerald-700">{bq.options[bq.correct]}</span>
                      </p>
                      <div className="bg-white/80 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-900 font-bold">Concept Insight:</strong> {bq.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                const finalBoosterScores = { ...finalScores, boosterScore, boosterPercent: boostPercent };
                onComplete(estimatedAbility, finalBoosterScores, generatedPathway, violationCount);
                setBoosterFinished(false);
              }}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all text-center"
            >
              Finish Challenge & Save to Dashboard (+150 XP!)
            </button>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Icons.Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
              Diagnostic Assessment Results
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Evaluation of mathematical proficiency and identification of competencies requiring targeted learning support.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* MATHEMATICS ABILITY ESTIMATE BOX                                          */}
          {/* ========================================================================= */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 mb-8 border border-slate-200/80 text-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
              Mathematics Ability:
            </span>
            <div className={`text-4xl sm:text-5xl font-black tracking-tight ${
              estimatedAbility === 'Expert' ? 'text-violet-600' :
              estimatedAbility === 'Advanced' ? 'text-emerald-600' :
              estimatedAbility === 'Proficient' ? 'text-blue-600' :
              estimatedAbility === 'Developing' ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {estimatedAbility}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Overall Diagnostic First-Attempt Baseline: {overallPercentage}% accuracy across Grade 11 domains
            </p>
          </div>

          {/* ========================================================================= */}
          {/* COMPETENCY BREAKDOWN (EXACT 3-TIER STATUS)                                */}
          {/* ========================================================================= */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Competency Breakdown
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {competencyReportItems.length} Evaluated
              </span>
            </div>

            <div className="grid gap-3">
              {competencyReportItems.map((comp) => {
                const isMastered = comp.status === 'Mastered';
                const isDeveloping = comp.status === 'Developing';
                const isIntervention = comp.status === 'Needs Intervention';

                return (
                  <div 
                    key={comp.competencyIndex} 
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isMastered ? 'bg-emerald-50/40 border-emerald-200/70' :
                      isDeveloping ? 'bg-amber-50/40 border-amber-200/70' :
                      'bg-rose-50/40 border-rose-200/70'
                    }`}
                  >
                    <div className="flex-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                        Competency {comp.competencyIndex}:
                      </span>
                      <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {comp.competencyName}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Domain: {comp.topicTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <span className="text-lg font-black text-slate-900">
                        {comp.percentage}%
                      </span>
                      <span className="text-slate-300 font-bold">—</span>
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                        isMastered ? 'bg-emerald-100 text-emerald-800' :
                        isDeveloping ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {isMastered && <Icons.CheckCircle2 className="w-3.5 h-3.5" />}
                        {isDeveloping && <Icons.Clock className="w-3.5 h-3.5" />}
                        {isIntervention && <Icons.AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{comp.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SYSTEM RECOMMENDATION & PREREQUISITE GAP ANALYSIS                           */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 rounded-[32px] p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-indigo-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest">
                Prerequisite Gap Analysis
              </span>
              <span className="text-xs text-indigo-200 font-bold">Grade 11 → Grade 12 Transition</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black mb-3 flex items-center gap-2 tracking-tight">
              <Icons.Sparkles className="w-5 h-5 text-amber-400" />
              <span>Next-Level Mathematics Prerequisites</span>
            </h3>

            <p className="text-xs sm:text-sm text-indigo-100/90 mb-6 leading-relaxed">
              To be highly competitive and successful in advanced Grade 12 calculus sequences and engineering/business math, your prerequisite skills require key reinforcements:
            </p>

            <div className="space-y-4 mb-8">
              {needsInterventionList.length > 0 ? (
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                    <Icons.AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Calculus Blocker Warning (Needs Immediate Action)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You have structural gaps in: <strong className="text-rose-300 font-bold">{needsInterventionList.map(c => c.competencyName).join(', ')}</strong>. 
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    * Without master level control of this topic, finding the algebraic limits, computing limits of rational functions containing discontinuities, or resolving exponential derivatives will be extremely difficult. Start with foundational pathway worksheets.
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                    <Icons.CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Prerequisite Solid Base Locked</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    Your baseline domains meet transition-ready standards! Your understanding of core Grade 11 math functions is structurally sound enough to approach composite derivative applications.
                  </p>
                </div>
              )}

              {developingList.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                    <Icons.Clock className="w-4 h-4 shrink-0" />
                    <span>Calculus Competitiveness Boost Points</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    Review and speed practice on: <strong className="text-amber-300 font-bold">{developingList.map(c => c.competencyName).join(', ')}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    * Work with the AI Coach on composite function steps to boost speed. Mastery here yields algebraic precision in university-level derivative chain rule applications.
                  </p>
                </div>
              )}
            </div>

            {/* HIGH VALUE: AUTOMATIC COMPETENCY PLACEMENT MINI-ASSESSMENT PROMOTION */}
            <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-400/20 mb-8 text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-[11px] font-black uppercase text-indigo-300 tracking-widest">
                  Auto-Generated Assessment Ready
                </span>
              </div>
              <h4 className="text-sm font-black text-white">
                Take the Next-Level Transition & Competency Assessment
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prove you are transition-ready for Grade 12! Solve 5 challenging pre-calculus & business math booster items to earn your official <strong className="text-white font-black">Math Readiness Rating</strong> and claim <strong className="text-indigo-300">+150 bonus XP</strong>!
              </p>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setIsTakingBooster(true);
                  setBoosterStep(0);
                  setSelectedBoosterOption(null);
                  setBoosterAnswers([]);
                  setBoosterIsSubmitted(false);
                  setBoosterFinished(false);
                  setBoosterScore(0);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-xs rounded-xl transition-all uppercase tracking-wider shadow-md hover:shadow-indigo-500/20 active:scale-95"
              >
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>Launch Competency Placement Challenge</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {generatedPathway && (
                <button
                  id="start-recommended-pathway-btn"
                  onClick={() => onComplete(estimatedAbility, finalScores, generatedPathway, violationCount)}
                  className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Icons.Route className="w-4 h-4" />
                  <span>Start Recommended Learning Pathway ({weakestCompetency?.topicTitle || 'Math'})</span>
                </button>
              )}
              <button
                id="complete-diagnostic-save-btn"
                onClick={() => onComplete(estimatedAbility, finalScores, undefined, violationCount)}
                className="px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Go to Student Dashboard</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // 3. ACTIVE DIAGNOSTIC TEST (PROBLEM SOLVING & PROGRESSIVE GUIDANCE)
  // =========================================================================
  const progress = ((currentStep + 1) / diagnosticProblems.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-100 shadow-sm z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <button 
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                setAssessmentPhase('intro');
              }
            }} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            title="Exit Diagnostic Test"
          >
            <Icons.ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <Icons.Target className="w-5 h-5 text-amber-600" />
            <span className="hidden sm:inline">Diagnostic Assessment</span>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
              Guided
            </span>
          </div>
        </div>

        <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-8">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="text-xs sm:text-sm font-bold text-slate-400 shrink-0">
          Item {currentStep + 1} of {diagnosticProblems.length}
        </div>
      </div>

      {/* Question Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Topic & Competency Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
                Competency: {problem.competencyLabel || problem.competency || problem.topicTitle}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {attemptsOnCurrent > 0 ? `Attempt #${attemptsOnCurrent + 1}` : 'Diagnostic Evaluation'}
              </span>
            </div>

            {/* Problem Statement */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {problem.question}
              </h2>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {problem.options.map((option, index) => {
                let status = 'default';
                if (isSolutionRevealed || (isAnswered && isLastAnswerCorrect)) {
                  if (index === problem.correctAnswer) status = 'correct';
                  else if (index === selectedOption) status = 'wrong';
                } else if (isAnswered && !isLastAnswerCorrect) {
                  if (index === selectedOption) status = 'attempt_incorrect';
                  else status = 'default';
                } else if (selectedOption === index) {
                  status = 'selected';
                }

                return (
                  <button
                    key={index}
                    id={`diagnostic-option-${index}`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isSolutionRevealed || (isAnswered && isLastAnswerCorrect)}
                    className={`
                      w-full p-4 sm:p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between
                      ${status === 'default' && 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/20'}
                      ${status === 'selected' && 'border-amber-600 bg-amber-50 ring-2 ring-amber-500/20'}
                      ${status === 'correct' && 'border-emerald-500 bg-emerald-50 text-emerald-950'}
                      ${status === 'wrong' && 'border-rose-300 bg-rose-50/50 text-rose-950 opacity-75'}
                      ${status === 'attempt_incorrect' && 'border-amber-400 bg-amber-50/60 text-slate-900 ring-2 ring-amber-400/20'}
                    `}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        status === 'correct' ? 'bg-emerald-500 text-white' :
                        status === 'wrong' ? 'bg-rose-400 text-white' :
                        status === 'selected' ? 'bg-amber-600 text-white' :
                        status === 'attempt_incorrect' ? 'bg-amber-500 text-white' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base leading-relaxed">
                        {option}
                      </span>
                    </div>

                    {status === 'correct' && <Icons.CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {status === 'wrong' && <Icons.XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                    {status === 'attempt_incorrect' && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                        Your Choice
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Supportive Feedback Box (Correct Answer) */}
            <AnimatePresence>
              {feedbackNotice && feedbackNotice.isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-2xl border text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-900"
                >
                  <p className="leading-relaxed">{feedbackNotice.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pre-Answer Clue (if requested) */}
            {!isAnswered && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Icons.Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Diagnostic Learning Guidance</span>
                  </span>
                  {hintLevel === 0 && (
                    <button
                      onClick={() => setHintLevel(1)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
                    >
                      Need a Hint?
                    </button>
                  )}
                </div>

                {hintLevel >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-950"
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                      <Icons.HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Hint 1: Conceptual Strategy</span>
                    </div>
                    <p className="leading-relaxed">{getHint1(problem)}</p>
                    {hintLevel === 1 && (
                      <button
                        onClick={() => setHintLevel(2)}
                        className="mt-2 text-xs font-bold text-amber-800 hover:text-amber-900 underline"
                      >
                        Show Step-by-Step Guidance (Hint 2)
                      </button>
                    )}
                  </motion.div>
                )}

                {hintLevel >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 text-xs sm:text-sm text-indigo-950"
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-indigo-900">
                      <Icons.Compass className="w-4 h-4 text-indigo-600" />
                      <span>Hint 2: Step-by-Step Calculation</span>
                    </div>
                    <p className="leading-relaxed">{getHint2(problem)}</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* PROGRESSIVE AI COACHING FOR INCORRECT ATTEMPT */}
            {/* ========================================================================= */}
            <AnimatePresence>
              {isAnswered && !isLastAnswerCorrect && !isSolutionRevealed && aiMistakeGuidance && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-50/80 to-white border border-amber-200/90 shadow-sm space-y-4 text-left"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-200/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                        <Icons.Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">
                          AI Math Coach • Step-by-Step Guidance
                        </h4>
                        <p className="text-[11px] text-amber-900/80 font-medium">
                          Let's investigate this mistake together
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-950 px-2.5 py-1 rounded-full border border-amber-300">
                      {aiMistakeGuidance.category}
                    </span>
                  </div>

                  {/* Diagnostic Explanation */}
                  <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-200/80 text-amber-950 text-sm leading-relaxed flex items-start gap-3">
                    <Icons.Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900 block mb-0.5 text-xs uppercase tracking-wider">
                        Diagnostic Observation:
                      </span>
                      <p className="text-amber-950 font-medium">{aiMistakeGuidance.coachingMessage}</p>
                    </div>
                  </div>

                  {/* Progressive Hints */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Icons.Layers className="w-3.5 h-3.5 text-amber-600" />
                      <span>Progressive Scaffolding:</span>
                    </span>

                    {/* Hint 1: Conceptual */}
                    <div className="p-3.5 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black flex items-center justify-center">1</span>
                          <span>Hint 1: Conceptual Principle</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          Core Concept
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6.5">
                        {aiMistakeGuidance.hint1Conceptual}
                      </p>
                    </div>

                    {/* Hint 2: Procedural */}
                    {revealedHintTier >= 2 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">2</span>
                            <span>Hint 2: Procedural Strategy</span>
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            Method
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6.5">
                          {aiMistakeGuidance.hint2Procedural}
                        </p>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setRevealedHintTier(2)}
                        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Icons.HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Unlock Hint 2 → Procedural Strategy</span>
                        </span>
                        <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}

                    {/* Hint 3: First Step */}
                    {revealedHintTier >= 3 ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black flex items-center justify-center">3</span>
                            <span>Hint 3: First Step</span>
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                            Step 1
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed pl-6.5 font-medium">
                          {aiMistakeGuidance.hint3FirstStep}
                        </p>
                      </motion.div>
                    ) : revealedHintTier >= 2 ? (
                      <button
                        onClick={() => setRevealedHintTier(3)}
                        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Icons.HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Unlock Hint 3 → First Step</span>
                        </span>
                        <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => {
                        setIsAnswered(false);
                        setIsLastAnswerCorrect(null);
                      }}
                      className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Icons.RotateCcw className="w-3.5 h-3.5" />
                      <span>Try Another Option</span>
                    </button>

                    <button
                      onClick={() => setIsSolutionRevealed(true)}
                      className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Icons.BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reveal Complete Solution</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Worked Solution (Revealed on Correct Answer or User Request) */}
            <AnimatePresence>
              {(isSolutionRevealed || (isAnswered && isLastAnswerCorrect)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs sm:text-sm text-left"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Icons.BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>Full Mathematical Solution & Derivation:</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                      Correct Answer: Option {String.fromCharCode(65 + problem.correctAnswer)} ({problem.options[problem.correctAnswer]})
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line font-mono bg-white p-3 rounded-xl border border-slate-200/70">
                    {problem.solution || problem.explanation || "Review the step-by-step substitution and algebraic properties applied above."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="px-4 sm:px-6 py-4 bg-white border-t border-slate-100 shadow-sm z-10 flex items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          {isAnswered && !isLastAnswerCorrect && !isSolutionRevealed
            ? 'Review the AI feedback or select another choice.'
            : isAnswered 
            ? 'Item evaluated. Click next to proceed.' 
            : 'Select an answer to evaluate.'}
        </div>

        <div>
          {!isAnswered ? (
            <button
              id="check-diagnostic-answer-btn"
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-200 active:scale-95 flex items-center gap-2"
            >
              <span>{attemptsOnCurrent > 0 ? 'Check Answer Again' : 'Check Answer'}</span>
              <Icons.ArrowRight className="w-4 h-4" />
            </button>
          ) : !isLastAnswerCorrect && !isSolutionRevealed ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAnswered(false);
                  setIsLastAnswerCorrect(null);
                }}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-200 active:scale-95 flex items-center gap-2"
              >
                <Icons.RotateCcw className="w-4 h-4" />
                <span>Try Another Answer</span>
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>Skip</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="next-diagnostic-problem-btn"
              onClick={handleNext}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95 flex items-center gap-2"
            >
              <span>{currentStep === diagnosticProblems.length - 1 ? 'View Diagnostic Report' : 'Next Item'}</span>
              <Icons.ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alt-Tab/Browser Loss focus warning popup during diagnostic */}
      <AnimatePresence>
        {showAltTabWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] max-w-md w-full p-8 text-center shadow-2xl relative border border-rose-100"
            >
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Icons.AlertTriangle className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Academic Integrity Logged!
              </h2>
              
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                You have navigated away from the active Diagnostic Assessment window (switched tabs, opened another application, or clicked elsewhere).
              </p>

              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                  <span className="text-xs font-black uppercase text-rose-800 tracking-wider">
                    Violation Warning Active
                  </span>
                </div>
                <p className="text-xs text-rose-700 font-semibold leading-relaxed text-left">
                  Leaving Assessment Instance count: <strong className="text-rose-950 text-sm font-black">{violationCount}</strong>
                </p>
                <p className="text-[10px] text-rose-600/90 leading-tight text-left">
                  This action is recorded in your student progress card. Multiple leaves can invalidate your baseline competency scores.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setShowAltTabWarning(false);
                }}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black rounded-2xl shadow-lg shadow-rose-100 transition-all text-xs tracking-wider uppercase"
              >
                Return & Resume Assessment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
