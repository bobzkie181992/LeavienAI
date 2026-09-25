import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz, Problem, ItemResponse, MathErrorCategory, ErrorPatternOccurrence } from '../types';
import { 
  X, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Zap, 
  Timer, 
  Flame, 
  Lightbulb, 
  RotateCcw,
  Sparkles,
  TrendingUp,
  Brain,
  Check,
  HelpCircle,
  Award,
  Users,
  Target,
  ShieldCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { 
  selectNextAdaptiveProblem, 
  updateAbilityEstimate, 
  convertThetaToAbilityBand,
  evaluateStruggleCondition,
  buildRemediationGuide,
  createItemResponseRecord,
  getItemDifficultyParameter,
  getItemDiscriminationParameter,
  RemediationGuide
} from '../utils/adaptiveEngine';
import { 
  classifyMathError, 
  detectRepeatedErrorPatterns, 
  ClassificationResult 
} from '../utils/errorClassifier';
import { generateAIMistakeGuidance, fetchAIMistakeDiagnosis } from '../utils/aiTutorCoach';
import { AIMistakeGuidance } from '../types';
import ErrorRemediationModal from './ErrorRemediationModal';
import { getLocalUser } from '../lib/localAuth';
import { logAltTabViolation } from '../lib/violationLogger';
import { playWarningSound } from '../utils/audioEffects';
import { getIntegritySettings } from '../lib/integritySettings';

export type QuizMode = 'diagnostic' | 'assessment' | 'adaptive' | 'standard' | 'timed';

interface QuizEngineProps {
  quiz: Quiz;
  availablePool?: Problem[];
  initialMode?: QuizMode;
  onClose: () => void;
  onComplete: (
    xp: number, 
    score: number, 
    total: number, 
    itemResponses: ItemResponse[], 
    abilityEstimate?: string, 
    mathAbilityDiagnosis?: string, 
    violations?: number,
    isCompetent?: boolean,
    modeUsed?: string
  ) => void;
  onSuggestAIQuiz?: () => void;
  onProceedNextLevel?: (nextQuiz: Quiz) => void;
  nextQuiz?: Quiz | null;
  collaborativeSession?: {
    partnerName: string;
    topicTitle: string;
    requestId: string;
  };
}

export default function QuizEngine({ 
  quiz, 
  availablePool, 
  initialMode, 
  onClose, 
  onComplete,
  onSuggestAIQuiz,
  onProceedNextLevel,
  nextQuiz,
  collaborativeSession
}: QuizEngineProps) {
  // Mode selection: 'diagnostic' | 'assessment' | 'adaptive' | 'standard' | 'timed'
  const [mode, setMode] = useState<QuizMode | null>(
    initialMode || 
    (quiz.quizType === 'diagnostic' ? 'diagnostic' : 
     quiz.quizType === 'assessment' ? 'assessment' : 
     quiz.id.includes('adaptive') ? 'adaptive' : null)
  );
  const [timerActivated, setTimerActivated] = useState<boolean>(false);

  // Helper to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Helper to shuffle a single problem's options and adjust the correctAnswer index
  const shuffleProblemChoices = (p: Problem): Problem => {
    const options = p.options || [];
    const correctAnswer = p.correctAnswer ?? 0;
    const correctOption = options[correctAnswer];
    
    const shuffled = shuffleArray(options);
    const newCorrectAnswer = shuffled.indexOf(correctOption);
    
    return {
      ...p,
      options: shuffled,
      correctAnswer: newCorrectAnswer >= 0 ? newCorrectAnswer : correctAnswer
    };
  };

  // Active problem set (can grow dynamically in adaptive mode)
  const [problems, setProblems] = useState<Problem[]>([]);
  useEffect(() => {
    // For every student, shuffle question order AND randomize options
    const randomizedProblems = shuffleArray(quiz.problems).map(shuffleProblemChoices);
    setProblems(randomizedProblems);
  }, [quiz.problems, mode]);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  // Diagnostic mode tracking: attempts on current question & feedback message
  const [currentProblemAttempts, setCurrentProblemAttempts] = useState<number>(0);
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [firstAttemptCorrectFlags, setFirstAttemptCorrectFlags] = useState<boolean[]>([]);

  // Progressive Hint States (0: none, 1: hint1, 2: hint2)
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);

  // Progressive AI Scaffolding & Solution Reveal State
  const [aiMistakeGuidance, setAiMistakeGuidance] = useState<AIMistakeGuidance | null>(null);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const [revealedHintTier, setRevealedHintTier] = useState<number>(0); // 0: none, 1: conceptual, 2: procedural, 3: first step

  // Adaptive IRT Engine State
  const [theta, setTheta] = useState<number>(0.0); // baseline ability theta (-3.0 to +3.0)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState<number>(0);
  const [activeRemediationGuide, setActiveRemediationGuide] = useState<RemediationGuide | null>(null);
  const [showRemediationModal, setShowRemediationModal] = useState<boolean>(false);
  const [remediationAcknowledgedForCurrent, setRemediationAcknowledgedForCurrent] = useState<boolean>(false);

  // Mathematics Error Classification & Remediation Engine State
  const [sessionErrorOccurrences, setSessionErrorOccurrences] = useState<ErrorPatternOccurrence[]>([]);
  const [classifiedErrorForCurrent, setClassifiedErrorForCurrent] = useState<ClassificationResult | null>(null);
  const [activeRemediationCategory, setActiveRemediationCategory] = useState<MathErrorCategory | null>(null);
  const [showCategoryRemediationModal, setShowCategoryRemediationModal] = useState<boolean>(false);

  const [usedProblemIds, setUsedProblemIds] = useState<Set<string>>(
    new Set(quiz.problems.map(p => p.id))
  );

  // Item response logging (Detailed IRT & response metrics)
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [itemResponses, setItemResponses] = useState<ItemResponse[]>([]);
  const [violationCount, setViolationCount] = useState<number>(0);

  const [showAltTabWarning, setShowAltTabWarning] = useState<boolean>(false);

  // Violation detection (Counts and warns when returning back to the app)
  useEffect(() => {
    if (showSummary) return;

    let wasAway = false;
    const currentUser = getLocalUser();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasAway = true;
      } else {
        if (wasAway) {
          wasAway = false;
          playWarningSound();
          setViolationCount(prev => prev + 1);
          setShowAltTabWarning(true);
          if (currentUser?.uid) {
            logAltTabViolation(
              currentUser.uid,
              quiz.quizType === 'diagnostic' || mode === 'diagnostic' ? 'Diagnostic' : 'Formative',
              quiz.title || 'Mathematics Quiz',
              currentStep + 1,
              problems[currentStep]?.question
            );
          }
        }
      }
    };

    const handleWindowBlur = () => {
      wasAway = true;
    };

    const handleWindowFocus = () => {
      if (wasAway) {
        wasAway = false;
        playWarningSound();
        setViolationCount(prev => prev + 1);
        setShowAltTabWarning(true);
        if (currentUser?.uid) {
          logAltTabViolation(
            currentUser.uid,
            quiz.quizType === 'diagnostic' || mode === 'diagnostic' ? 'Diagnostic' : 'Formative',
            quiz.title || 'Mathematics Quiz',
            currentStep + 1,
            problems[currentStep]?.question
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [showSummary, currentStep, problems, quiz, mode]);

  // Timed Mode State
  const totalTimeAllowed = quiz.problems.length * 30; // 30s per problem
  const [timeLeft, setTimeLeft] = useState<number>(totalTimeAllowed);

  // Auto-initialize timeLeft when starting quiz with timer
  useEffect(() => {
    if (mode && (mode === 'timed' || timerActivated)) {
      setTimeLeft(totalTimeAllowed);
    }
  }, [mode, timerActivated, totalTimeAllowed]);

  // Countdown timer for Timed mode & Manual Timer Activation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const isTimerRunning = (mode === 'timed' || timerActivated);
    if (isTimerRunning && timeLeft > 0 && !showSummary) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowSummary(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, timerActivated, timeLeft, showSummary]);

  const currentProblem = problems[currentStep] || quiz.problems[0];

  const handleOptionSelect = (index: number) => {
    // If solution was explicitly revealed or answered correctly, lock
    if (isSolutionRevealed || (isAnswered && isLastAnswerCorrect)) return;

    setSelectedOption(index);
    if (isAnswered && !isLastAnswerCorrect) {
      // Student selected a new option after reading hints/coaching!
      setIsAnswered(false);
      setIsLastAnswerCorrect(null);
      setDiagnosticFeedback(null);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentProblem) return;

    const isCorrect = selectedOption === currentProblem.correctAnswer;
    const responseTimeMs = Date.now() - startTime;
    const thetaBefore = theta;
    const isDiagnostic = (mode === 'diagnostic' || mode === 'standard');

    // Classify error if incorrect & generate progressive AI mistake guidance
    let errorClassification: ClassificationResult | null = null;
    let mistakeGuidance: AIMistakeGuidance | null = null;

    if (!isCorrect) {
      errorClassification = classifyMathError(currentProblem, selectedOption);
      setClassifiedErrorForCurrent(errorClassification);

      mistakeGuidance = generateAIMistakeGuidance(currentProblem, selectedOption);
      setAiMistakeGuidance(mistakeGuidance);
      setRevealedHintTier(1); // Unlocks Hint 1 (conceptual) immediately
      setIsSolutionRevealed(false); // DO NOT REVEAL COMPLETE ANSWER

      // Asynchronously enhance diagnosis if online
      fetchAIMistakeDiagnosis(currentProblem, selectedOption).then(asyncGuidance => {
        if (asyncGuidance) {
          setAiMistakeGuidance(asyncGuidance);
        }
      });

      const errRecord: ErrorPatternOccurrence = {
        category: errorClassification.category,
        problemId: currentProblem.id,
        questionText: currentProblem.question,
        competency: currentProblem.competency || quiz.title,
        selectedOptionText: currentProblem.options[selectedOption],
        correctOptionText: currentProblem.options[currentProblem.correctAnswer],
        timestamp: new Date().toISOString(),
        explanation: currentProblem.explanation,
        specificDiagnosis: errorClassification.specificDiagnosis
      };
      setSessionErrorOccurrences(prev => [...prev, errRecord]);
    } else {
      setClassifiedErrorForCurrent(null);
      setAiMistakeGuidance(null);
      setIsSolutionRevealed(true);
    }

    if (isDiagnostic) {
      // Diagnostic Mode: student learns with hints until they get the answer!
      const attemptsSoFar = currentProblemAttempts + 1;
      setCurrentProblemAttempts(attemptsSoFar);

      if (isCorrect) {
        setIsAnswered(true);
        setIsLastAnswerCorrect(true);
        setIsSolutionRevealed(true);
        setDiagnosticFeedback({
          isCorrect: true,
          text: attemptsSoFar === 1 
            ? "Correct on your first try! Outstanding mathematical reasoning." 
            : `You got it right on attempt #${attemptsSoFar}! Great persistence and guided learning.`
        });

        // Award score (full point if solved within attempts, bonus for first try)
        if (attemptsSoFar === 1) {
          setScore(s => s + 1);
          setFirstAttemptCorrectFlags(prev => [...prev, true]);
          setConsecutiveCorrect(c => c + 1);
          setConsecutiveIncorrect(0);
        } else {
          setScore(s => s + 1);
          setFirstAttemptCorrectFlags(prev => [...prev, false]);
          setConsecutiveCorrect(0);
          setConsecutiveIncorrect(c => c + 1);
        }

        const thetaAfter = updateAbilityEstimate(thetaBefore, true, currentProblem, currentStep);
        setTheta(thetaAfter);

        const responseRecord = createItemResponseRecord({
          problem: currentProblem,
          selectedOption,
          isCorrect: true,
          responseTimeMs,
          thetaBefore,
          thetaAfter,
          attemptsCount: attemptsSoFar,
          hintsUsed: Math.max(hintLevel, revealedHintTier),
          remediationProvided: remediationAcknowledgedForCurrent
        });

        setItemResponses(prev => [...prev, responseRecord]);
      } else {
        // Not correct: Progressive AI coaching guides student
        setIsLastAnswerCorrect(false);
        setIsAnswered(true);
        setIsSolutionRevealed(false); // DO NOT REVEAL THE SOLUTION
        
        setHintLevel(prev => (prev === 0 ? 1 : 2));
        const newConsecutiveIncorrect = consecutiveIncorrect + 1;
        setConsecutiveIncorrect(newConsecutiveIncorrect);
        setConsecutiveCorrect(0);

        // Check if student is repeatedly struggling (2+ failed tries)
        if (newConsecutiveIncorrect >= 2 || attemptsSoFar >= 2) {
          const guide = buildRemediationGuide(currentProblem, quiz.title);
          setActiveRemediationGuide(guide);
        }

        setDiagnosticFeedback(null);
      }
      return;
    }

    // Assessment / Adaptive / Timed Mode: Strict assessment of competency
    setIsAnswered(true);
    setIsLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setIsSolutionRevealed(true);
      setScore(s => s + 1);
      setConsecutiveCorrect(c => c + 1);
      setConsecutiveIncorrect(0);
    } else {
      setIsSolutionRevealed(false); // DO NOT REVEAL THE COMPLETE ANSWER
      const newConsecutiveIncorrect = consecutiveIncorrect + 1;
      setConsecutiveIncorrect(newConsecutiveIncorrect);
      setConsecutiveCorrect(0);

      // Trigger remediation intervention if student repeatedly struggles (2+ incorrect in a row)
      if (newConsecutiveIncorrect >= 2) {
        const guide = buildRemediationGuide(currentProblem, quiz.title);
        setActiveRemediationGuide(guide);
        setShowRemediationModal(true);
      }
    }

    // In Adaptive Mode (or general IRT), dynamically update ability theta
    const thetaAfter = updateAbilityEstimate(thetaBefore, isCorrect, currentProblem, currentStep);
    setTheta(thetaAfter);

    const responseRecord = createItemResponseRecord({
      problem: currentProblem,
      selectedOption,
      isCorrect,
      responseTimeMs,
      thetaBefore,
      thetaAfter,
      attemptsCount: 1,
      hintsUsed: Math.max(hintLevel, revealedHintTier),
      remediationProvided: remediationAcknowledgedForCurrent
    });
    if (!isCorrect && errorClassification) {
      responseRecord.errorCategory = errorClassification.category;
      responseRecord.errorFeedback = errorClassification.specificFeedback;
    }

    setItemResponses(prev => [...prev, responseRecord]);
  };

  const handleNext = () => {
    const targetStepsCount = mode === 'adaptive' ? 5 : problems.length;

    // Reset per-step diagnostic and error tracking
    setCurrentProblemAttempts(0);
    setDiagnosticFeedback(null);
    setClassifiedErrorForCurrent(null);
    setRemediationAcknowledgedForCurrent(false);
    setAiMistakeGuidance(null);
    setIsSolutionRevealed(false);
    setRevealedHintTier(0);

    // If Adaptive Mode and fewer than target steps completed, pick next adaptive problem from pool
    if (mode === 'adaptive' && currentStep + 1 < targetStepsCount) {
      const fullPool = availablePool && availablePool.length > 0 
        ? availablePool 
        : quiz.problems;

      const newUsedIds = new Set<string>(usedProblemIds);
      if (currentProblem) newUsedIds.add(currentProblem.id);

      // ADAPTIVE SELECTION:
      // - Low ability / struggle -> selects EASIER item
      // - Demonstrates mastery -> selects MORE DIFFICULT item
      // - Repeated struggle -> selects EASIER foundational item after remediation
      const nextProb = selectNextAdaptiveProblem(fullPool, newUsedIds, theta, {
        consecutiveIncorrect,
        consecutiveCorrect,
        isRemediating: Boolean(activeRemediationGuide)
      });

      if (nextProb) {
        const randomizedNextProb = shuffleProblemChoices(nextProb);
        newUsedIds.add(randomizedNextProb.id);
        setUsedProblemIds(newUsedIds);
        setProblems(prev => [...prev, randomizedNextProb]);
        setCurrentStep(s => s + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsLastAnswerCorrect(null);
        setHintLevel(0);
        setStartTime(Date.now());
        return;
      }
    }

    // Standard progression
    if (currentStep < problems.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsLastAnswerCorrect(null);
      setHintLevel(0);
      setStartTime(Date.now());
    } else {
      setShowSummary(true);
    }
  };

  const handleRetake = (targetMode?: QuizMode) => {
    setCurrentStep(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsLastAnswerCorrect(null);
    setScore(0);
    setShowSummary(false);
    setShowLedger(false);
    setHintLevel(0);
    setCurrentProblemAttempts(0);
    setDiagnosticFeedback(null);
    setItemResponses([]);
    setFirstAttemptCorrectFlags([]);
    setTheta(0.0);
    setConsecutiveCorrect(0);
    setConsecutiveIncorrect(0);
    setActiveRemediationGuide(null);
    setShowRemediationModal(false);
    setRemediationAcknowledgedForCurrent(false);
    setAiMistakeGuidance(null);
    setIsSolutionRevealed(false);
    setRevealedHintTier(0);
    setProblems(shuffleArray(quiz.problems).map(shuffleProblemChoices));
    setUsedProblemIds(new Set(quiz.problems.map(p => p.id)));
    setStartTime(Date.now());
    if (targetMode) {
      setMode(targetMode);
    }
    if (targetMode === 'timed' || mode === 'timed') {
      setTimeLeft(totalTimeAllowed);
    }
  };

  // Safe fallback hints
  const getHint1 = (p: Problem) => {
    if (p.hint1 && p.hint1.trim()) return p.hint1;
    if (p.hints && p.hints[0]) return p.hints[0];
    return `Analyze the problem statement carefully: recall key definitions and formulas for ${p.competency || p.topic}. Check which options can be eliminated immediately.`;
  };

  const getHint2 = (p: Problem) => {
    if (p.hint2 && p.hint2.trim()) return p.hint2;
    if (p.hints && p.hints[1]) return p.hints[1];
    return `Perform step-by-step substitution and verify sign changes. Pay close attention to domain restrictions or common calculation errors.`;
  };

  // Mode Selection Screen
  if (mode === null) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-6 sm:p-10 text-center shadow-2xl border border-slate-100 max-w-2xl w-full relative overflow-hidden my-6"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-8 text-left sm:text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center sm:mx-auto mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{quiz.title}</h2>
            <p className="text-slate-500 text-sm max-w-md sm:mx-auto">
              Choose your assessment mode according to your learning goal:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {/* 1. Diagnostic Quiz */}
            <button
              onClick={() => setMode('diagnostic')}
              className="p-5 rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50/60 to-white hover:border-amber-500 hover:shadow-md transition-all group relative flex flex-col justify-between"
            >
              <div className="absolute -top-3 left-4 bg-amber-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                Learning & Hints
              </div>
              <div>
                <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Diagnostic Quiz</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">
                  For students who want to <strong>learn</strong> while taking the quiz. Receive progressive hints (Strategy & Step-by-Step) and try until you get the correct answer!
                </p>
                <div className="space-y-1 text-[11px] text-amber-800 font-medium bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Progressive Hint 1 & 2</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Try until you get it right</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Worked step-by-step solutions</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Guided Practice</span>
                <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded">+{quiz.xpReward} XP</span>
              </div>
            </button>

            {/* 2. Assessment Quiz */}
            <button
              onClick={() => setMode('assessment')}
              className="p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white hover:border-indigo-500 hover:shadow-md transition-all group relative flex flex-col justify-between"
            >
              <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                Competency Test
              </div>
              <div>
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Assessment Quiz</h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-3">
                  For students who are <strong>competent</strong> and ready to test mastery. Score 75%+ to verify competency and proceed to the next level quiz!
                </p>
                <div className="space-y-1 text-[11px] text-indigo-800 font-medium bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Competency Mastery Evaluation</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> 75% Passing Standard</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Unlocks Next Level Quiz</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>Mastery Assessment</span>
                <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded">+{quiz.xpReward + 50} XP</span>
              </div>
            </button>
          </div>

          {/* Additional Options */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-3 text-left">
            {/* Adaptive Option */}
            <button
              onClick={() => setMode('adaptive')}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Adaptive Dynamic IRT Mode</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </button>

            {/* Timer Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Timer className={`w-4 h-4 ${timerActivated ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Timer Challenge (30s/Q)</span>
              </div>
              <button
                onClick={() => setTimerActivated(!timerActivated)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 relative ${
                  timerActivated ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${
                  timerActivated ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Summary / Completion View
  if (showSummary) {
    const totalQuestions = problems.length;
    let xpEarned = Math.round((score / totalQuestions) * quiz.xpReward);
    const hasBonus = (mode === 'timed' || timerActivated) && timeLeft > 0 && score > 0;
    if (hasBonus) {
      xpEarned += Math.round(xpEarned * 0.5);
    }
    if (mode === 'assessment' && score >= Math.ceil(totalQuestions * 0.75)) {
      xpEarned += 50; // Competency bonus
    }
    if (mode === 'adaptive' && score >= 3) {
      xpEarned += 50; // Adaptive mastery bonus
    }
    if (collaborativeSession) {
      xpEarned += 50; // Collaborative study bonus
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const finalAbilityBand = mode === 'adaptive' ? convertThetaToAbilityBand(theta) : undefined;
    
    const getProficiencyLevel = (scoreNum: number, total: number) => {
      const pct = (scoreNum / total) * 100;
      if (pct >= 90) return 'Expert';
      if (pct >= 75) return 'Advanced';
      if (pct >= 55) return 'Proficient';
      if (pct >= 35) return 'Developing';
      return 'Novice';
    };
    
    const diagnosis = mode === 'adaptive' ? finalAbilityBand : getProficiencyLevel(score, totalQuestions);
    const isCompetent = percentage >= 75 || diagnosis === 'Proficient' || diagnosis === 'Advanced' || diagnosis === 'Expert';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-6 sm:p-8 text-center shadow-2xl border border-slate-100 max-w-2xl w-full my-8 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Trophy / Badge Header */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 relative ${
            isCompetent ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {isCompetent ? <Trophy className="w-10 h-10" /> : <Target className="w-10 h-10" />}
            {hasBonus && (
              <div className="absolute -top-1 -right-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <Flame className="w-3 h-3" /> SPEED BONUS!
              </div>
            )}
            {collaborativeSession && (
              <div className="absolute -top-2 -left-2 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <Users className="w-3 h-3" /> +50 XP COLLAB
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            {mode === 'diagnostic' || mode === 'standard'
              ? 'Diagnostic Learning Complete!'
              : mode === 'adaptive'
              ? 'Adaptive Calibration Complete!'
              : isCompetent 
              ? 'Competency Standard Achieved!' 
              : 'Assessment Completed'}
          </h2>
          <p className="text-slate-500 text-sm mb-3">
            {quiz.title} • {mode === 'adaptive' ? 'Dynamic IRT Adaptive Assessment' : mode === 'diagnostic' ? 'Diagnostic Guided Practice' : 'Competency Assessment'}
          </p>

          {/* Adaptive Ability Display Banner */}
          {mode === 'adaptive' && (
            <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-left mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  Estimated Mathematics Ability
                </span>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                  {finalAbilityBand} (θ = {theta.toFixed(2)})
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 leading-relaxed">
                Items were dynamically selected based on item difficulty (b) and item discrimination (a) to match your real-time performance.
              </p>
            </div>
          )}

          {/* Competency & Next Level Callout */}
          {mode === 'assessment' && (
            <div className={`p-4 rounded-2xl border mb-5 text-left ${
              isCompetent 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {isCompetent ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-900">Student is Competent (Score: {percentage}%)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="text-amber-900">Competency Benchmark Not Yet Met ({percentage}% / 75%)</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {isCompetent
                  ? 'You have demonstrated the required competency mastery and unlocked the next level quiz in your curriculum pathway!'
                  : 'To build competency, take the Diagnostic Quiz to learn with progressive hints until you get every answer right.'}
              </p>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-indigo-600">{score}/{totalQuestions}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">{percentage}%</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Accuracy</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
              <div className="text-2xl font-black text-amber-600">+{xpEarned}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">XP Earned</div>
            </div>
          </div>

          {/* Item Response Ledger Drawer (Recorded Items, Theta Shifts, Difficulty & Discrimination) */}
          <div className="mb-6 text-left border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => setShowLedger(!showLedger)}
              className="w-full p-4 flex items-center justify-between bg-slate-100/70 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-800"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>View Item Selection & Response Ledger ({itemResponses.length} items recorded)</span>
              </div>
              {showLedger ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showLedger && (
              <div className="p-4 space-y-3 bg-white divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
                {itemResponses.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">#{idx + 1}. {item.competency}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {(item.responseTimeMs / 1000).toFixed(1)}s
                      </span>
                    </div>

                    <p className="text-slate-600 font-medium text-[11px] line-clamp-1">
                      {item.questionText}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-600">
                      <div>
                        <span className="text-slate-400 block font-bold">Response</span>
                        <span className="font-bold text-slate-800 truncate block">Option {String.fromCharCode(65 + item.selectedOption)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Difficulty (b)</span>
                        <span className="font-mono font-bold text-slate-800">{item.difficultyParameter?.toFixed(2)} ({item.difficultyLevel || 'med'})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Discrimination (a)</span>
                        <span className="font-mono font-bold text-slate-800">{item.discriminationParameter?.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Ability (θ Before → After)</span>
                        <span className="font-mono font-bold text-indigo-700">
                          {item.abilityEstimateBefore !== undefined ? `${item.abilityEstimateBefore.toFixed(1)} → ${item.abilityEstimateAfter?.toFixed(1)}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mathematics Error Patterns & Remediation Card */}
          {sessionErrorOccurrences.length > 0 && (
            <div className="mb-6 text-left border border-rose-200 rounded-2xl overflow-hidden bg-rose-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-black text-xs uppercase tracking-wider text-rose-900">
                    Error Diagnosis & Misconception Log ({sessionErrorOccurrences.length} detected)
                  </span>
                </div>
              </div>

              {/* Categorized list */}
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(sessionErrorOccurrences.map(e => e.category))).map(cat => {
                  const count = sessionErrorOccurrences.filter(e => e.category === cat).length;
                  const isRepeated = count >= 2;
                  return (
                    <div
                      key={cat}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                        isRepeated 
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm' 
                          : 'bg-white text-rose-900 border-rose-200'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        isRepeated ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {count}x
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Repeated error remediation prompt */}
              {detectRepeatedErrorPatterns(sessionErrorOccurrences, 2).length > 0 && (
                <div className="pt-2 border-t border-rose-200/80 space-y-2">
                  {detectRepeatedErrorPatterns(sessionErrorOccurrences, 2).map(rep => (
                    <div key={rep.category} className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-xs font-bold text-rose-950 block">
                          Repeated pattern: <strong>{rep.category}</strong> ({rep.count} instances)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Recommended: Complete the 5-stage conceptual intervention before reassessment.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveRemediationCategory(rep.category);
                          setShowCategoryRemediationModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Start Remediation</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* If Competent and Next Level Quiz is available */}
            {mode === 'assessment' && isCompetent && nextQuiz && onProceedNextLevel && (
              <button
                onClick={() => {
                  onComplete(xpEarned, score, totalQuestions, itemResponses, finalAbilityBand, diagnosis, violationCount, isCompetent, mode);
                  onProceedNextLevel(nextQuiz);
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all text-base flex items-center justify-center gap-2"
              >
                <span>Proceed to Next Level Quiz: {nextQuiz.title}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* If Not Competent in Assessment, offer Diagnostic Quiz */}
            {mode === 'assessment' && !isCompetent && (
              <button
                onClick={() => handleRetake('diagnostic')}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Take Diagnostic Quiz (With Guided Hints)</span>
              </button>
            )}

            {/* If in Diagnostic Mode, offer taking Assessment Quiz */}
            {(mode === 'diagnostic' || mode === 'standard') && (
              <button
                onClick={() => handleRetake('assessment')}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all text-base flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                <span>Ready to Prove Competency? Take Assessment Quiz</span>
              </button>
            )}

            {/* Standard Complete & Return */}
            <button
              onClick={() => onComplete(xpEarned, score, totalQuestions, itemResponses, finalAbilityBand, diagnosis, violationCount, isCompetent, mode)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Collect XP & Return to Dashboard</span>
            </button>

            {/* Retake Current */}
            <button
              onClick={() => handleRetake()}
              className="w-full py-3 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake This Quiz</span>
            </button>

            {diagnosis === 'Novice' && onSuggestAIQuiz && (
              <button
                onClick={onSuggestAIQuiz}
                className="w-full py-3 bg-rose-50 text-rose-700 font-bold rounded-2xl border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate AI Remediation Quiz</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate progress
  const targetTotal = mode === 'adaptive' ? 5 : problems.length;
  const progressPercent = ((currentStep + (isAnswered ? 1 : 0)) / targetTotal) * 100;

  // Format timer
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isTimeLow = (mode === 'timed' || timerActivated) && timeLeft <= 10;

  const currentDiff = currentProblem.difficulty || 'medium';
  const diffBadgeColor = currentDiff === 'hard' 
    ? 'bg-rose-100 text-rose-700 border-rose-200' 
    : currentDiff === 'easy' 
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
    : 'bg-amber-100 text-amber-700 border-amber-200';

  const isDiagnostic = (mode === 'diagnostic' || mode === 'standard');

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-100 bg-white relative z-10">
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          title="Exit Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Tag & Progress Bar */}
        <div className="flex-1 max-w-md mx-4 sm:mx-8">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              {mode === 'adaptive' ? (
                <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-indigo-600" />
                  Adaptive IRT Calibration (θ = {theta.toFixed(2)})
                </span>
              ) : isDiagnostic ? (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                  <Target className="w-3 h-3" /> Diagnostic (Learn with Hints)
                </span>
              ) : (
                <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> Assessment (Competency Test)
                </span>
              )}
            </span>
            <span>Question {currentStep + 1} of {targetTotal}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${isDiagnostic ? 'bg-amber-500' : 'bg-indigo-600'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {collaborativeSession && (
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Partner: {collaborativeSession.partnerName}</span>
            </div>
          )}

          {(mode === 'timed' || timerActivated) && (
            <div className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors ${
              isTimeLow ? 'bg-rose-100 text-rose-600 animate-pulse font-mono' : 'bg-slate-100 text-slate-700 font-mono'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{timeFormatted}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-indigo-600 font-bold bg-indigo-50 px-3 py-1.5 rounded-xl text-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{score} pts</span>
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 bg-slate-50/50">
        <div className="max-w-2xl mx-auto space-y-6">
          {currentProblem ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Academic Integrity Alt-Tab Alert Banner */}
              <AnimatePresence>
                {showAltTabWarning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="p-4 bg-rose-50 border-2 border-rose-500 rounded-2xl flex items-center justify-between gap-3 text-rose-900 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="text-xs">
                        <span className="font-black text-rose-900 block uppercase tracking-wider">
                          Academic Integrity Warning: Window Tab-Out Detected ({violationCount} Violation{violationCount > 1 ? 's' : ''})
                        </span>
                        <span className="text-rose-700">
                          Leaving the active test window is recorded on your official scorecard. Score deduction is applied automatically.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAltTabWarning(false)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded-xl shrink-0 cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Question Metadata Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Question {currentStep + 1}
                </span>

                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Validated Content</span>
                </span>

                <span className={`text-[11px] font-bold capitalize px-2.5 py-1 rounded-lg border ${diffBadgeColor}`}>
                  {currentDiff} (b: {getItemDifficultyParameter(currentProblem).toFixed(1)})
                </span>

                {currentProblem.competency && (
                  <span className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg truncate max-w-xs">
                    {currentProblem.competency}
                  </span>
                )}

                {/* Adaptive Indicator */}
                {mode === 'adaptive' && (
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    {consecutiveCorrect >= 2 ? (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mastery Challenge Item</span>
                      </>
                    ) : consecutiveIncorrect >= 2 ? (
                      <>
                        <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
                        <span>Scaffolded Foundational Item</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ability Calibrated Item</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Diagnostic Mode Learning Banner */}
              {isDiagnostic && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Learning Mode:</strong> Progressive hints are available. Try until you get the right answer!</span>
                  </div>
                  {currentProblemAttempts > 0 && (
                    <span className="bg-amber-200/80 px-2 py-0.5 rounded font-bold text-[10px]">
                      Attempt #{currentProblemAttempts + 1}
                    </span>
                  )}
                </div>
              )}

              {/* Question Prompt */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {currentProblem.question}
              </h2>

              {/* Multiple Choice Options */}
              <div className="grid gap-3">
                {currentProblem.options.map((option, index) => {
                  let status = 'default';
                  if (isSolutionRevealed || (isAnswered && isLastAnswerCorrect)) {
                    if (index === currentProblem.correctAnswer) status = 'correct';
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
                      onClick={() => handleOptionSelect(index)}
                      disabled={isSolutionRevealed || (isAnswered && isLastAnswerCorrect)}
                      className={`
                        w-full p-4 sm:p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group
                        ${status === 'default' && 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 active:scale-[0.99]'}
                        ${status === 'selected' && 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'}
                        ${status === 'correct' && 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'}
                        ${status === 'wrong' && 'border-rose-300 bg-rose-50/50 text-rose-950 opacity-75'}
                        ${status === 'attempt_incorrect' && 'border-amber-400 bg-amber-50/60 text-slate-900 ring-2 ring-amber-400/20'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          status === 'correct' ? 'bg-emerald-500 text-white' :
                          status === 'wrong' ? 'bg-rose-400 text-white' :
                          status === 'selected' ? 'bg-indigo-600 text-white' :
                          status === 'attempt_incorrect' ? 'bg-amber-500 text-white' :
                          'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="font-semibold text-base sm:text-lg">{option}</span>
                      </div>

                      <div>
                        {status === 'correct' && (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-100 px-2.5 py-1 rounded-lg">
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Correct</span>
                          </div>
                        )}
                        {status === 'wrong' && (
                          <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold bg-rose-100 px-2.5 py-1 rounded-lg">
                            <X className="w-4 h-4 stroke-[3]" />
                            <span>Not Correct</span>
                          </div>
                        )}
                        {status === 'attempt_incorrect' && (
                          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold bg-amber-100/90 px-2.5 py-1 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Your Choice</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Diagnostic Positive Feedback Notice on Correct Answer */}
              {diagnosticFeedback && diagnosticFeedback.isCorrect && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-2xl text-xs font-medium border flex items-start gap-2.5 bg-emerald-50 border-emerald-200 text-emerald-900"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{diagnosticFeedback.text}</div>
                </motion.div>
              )}

              {/* Pre-Answer Generic Hint (if student requests before answering) */}
              {!isAnswered && (
                <div className="pt-2">
                  {hintLevel === 0 ? (
                    <button
                      onClick={() => setHintLevel(1)}
                      className="text-amber-600 hover:text-amber-700 font-bold text-xs sm:text-sm flex items-center gap-2 py-2 px-3 hover:bg-amber-50 rounded-xl transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Need a hint before answering? (Conceptual Strategy)</span>
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-amber-950 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-0.5">
                            Conceptual Strategy Clue
                          </span>
                          <p className="text-sm leading-relaxed">{getHint1(currentProblem)}</p>
                        </div>
                      </div>

                      {hintLevel === 1 ? (
                        <button
                          onClick={() => setHintLevel(2)}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 px-3 py-1.5 hover:bg-amber-100/50 rounded-lg transition-colors ml-4 sm:ml-8"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Request Procedural Clue (Hint 2)</span>
                        </button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-amber-100/70 border border-amber-300 rounded-2xl text-amber-950 flex items-start gap-3 ml-2 sm:ml-6"
                        >
                          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block mb-0.5">
                              Procedural Guidance
                            </span>
                            <p className="text-sm leading-relaxed">{getHint2(currentProblem)}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* PROGRESSIVE AI COACHING FOR INCORRECT ATTEMPT (DOES NOT REVEAL ANSWER) */}
              {/* ========================================================================= */}
              <AnimatePresence>
                {isAnswered && !isLastAnswerCorrect && !isSolutionRevealed && aiMistakeGuidance && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-50/80 to-white border border-amber-200/90 shadow-sm space-y-4 text-left"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-200/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm sm:text-base text-slate-900">
                            AI Math Coach • Learning Feedback
                          </h4>
                          <p className="text-[11px] text-amber-900/80 font-medium">
                            Let's investigate the mistake together step-by-step
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-950 px-2.5 py-1 rounded-full border border-amber-300">
                        {aiMistakeGuidance.category}
                      </span>
                    </div>

                    {/* Empathetic Diagnostic Explanation */}
                    <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-200/80 text-amber-950 text-sm leading-relaxed flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-900 block mb-0.5 text-xs uppercase tracking-wider">
                          Diagnostic Observation:
                        </span>
                        <p className="text-amber-950 font-medium">{aiMistakeGuidance.coachingMessage}</p>
                      </div>
                    </div>

                    {/* Progressive Hints (Hint 1 -> Conceptual, Hint 2 -> Procedural, Hint 3 -> First Step) */}
                    <div className="space-y-2.5 pt-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span>Progressive Guidance Hints:</span>
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
                            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Unlock Hint 2 → Procedural Strategy</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Unlock Hint 3 → First Step</span>
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      ) : null}
                    </div>

                    {/* Interactive Action Controls */}
                    <div className="pt-3 border-t border-amber-200/60 flex flex-col sm:flex-row gap-2.5">
                      <button
                        onClick={() => {
                          setIsAnswered(false);
                          setIsLastAnswerCorrect(null);
                        }}
                        className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Apply Hints & Choose Another Option</span>
                      </button>

                      <button
                        onClick={() => setIsSolutionRevealed(true)}
                        className="py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reveal Complete Answer & Solution</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ========================================================================= */}
              {/* VERIFIED SOLUTION & EXPLANATION (ONLY REVEALED ON CORRECT OR USER REQUEST) */}
              {/* ========================================================================= */}
              <AnimatePresence>
                {(isSolutionRevealed || (isAnswered && isLastAnswerCorrect)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                      isLastAnswerCorrect
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {/* Status headline */}
                    <div className="flex items-center gap-2.5">
                      {isLastAnswerCorrect ? (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-lg text-emerald-900">Correct! Excellent Mathematical Reasoning</h4>
                            <p className="text-xs text-emerald-700">You selected the mathematically sound model.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-lg text-slate-900">Full Mathematical Solution</h4>
                            <p className="text-xs text-slate-600">
                              Correct answer is Option {String.fromCharCode(65 + currentProblem.correctAnswer)}: <strong className="underline text-indigo-900">{currentProblem.options[currentProblem.correctAnswer]}</strong>
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Step-by-Step Solution */}
                    <div className="pt-2 border-t border-black/5">
                      <span className="text-[11px] font-black uppercase tracking-wider block mb-1 opacity-70">
                        Step-by-Step Mathematical Derivation:
                      </span>
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                        {currentProblem.solution || currentProblem.explanation}
                      </div>
                    </div>

                    {/* Conceptual Explanation */}
                    {currentProblem.explanation && (
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider block mb-1 opacity-70">
                          Conceptual Explanation:
                        </span>
                        <p className="text-sm leading-relaxed opacity-90">
                          {currentProblem.explanation}
                        </p>
                      </div>
                    )}

                    {/* Classified Error & Misconception Breakdown */}
                    {classifiedErrorForCurrent && (
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-amber-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <AlertTriangle className="w-3.5 h-3.5" /> Error Category: {classifiedErrorForCurrent.category}
                          </span>
                          {sessionErrorOccurrences.filter(e => e.category === classifiedErrorForCurrent.category).length >= 2 && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                              Repeated Pattern ({sessionErrorOccurrences.filter(e => e.category === classifiedErrorForCurrent.category).length}x)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-950 font-bold leading-relaxed">
                          {classifiedErrorForCurrent.specificDiagnosis}
                        </p>
                        <p className="text-xs text-amber-900 leading-relaxed">
                          {classifiedErrorForCurrent.specificFeedback}
                        </p>
                        {classifiedErrorForCurrent.remediationTip && (
                          <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">Correction Strategy:</span>
                              <span>{classifiedErrorForCurrent.remediationTip}</span>
                            </div>
                          </div>
                        )}
                        {sessionErrorOccurrences.filter(e => e.category === classifiedErrorForCurrent.category).length >= 2 && (
                          <div className="pt-2 border-t border-amber-200 flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-bold text-amber-900">
                              Repeated {classifiedErrorForCurrent.category.toLowerCase()} detected. Remediation recommended.
                            </span>
                            <button
                              onClick={() => {
                                setActiveRemediationCategory(classifiedErrorForCurrent.category);
                                setShowCategoryRemediationModal(true);
                              }}
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Launch 5-Stage Remediation</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-20 text-center text-slate-400">Loading problem...</div>
          )}
        </div>
      </div>

      {/* TARGETED REMEDIATION MODAL / INTERVENTION (When student repeatedly struggles) */}
      <AnimatePresence>
        {showRemediationModal && activeRemediationGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 max-w-xl w-full border border-amber-200 shadow-2xl relative my-6 text-left"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full inline-block mb-1">
                    Adaptive Concept Remediation
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Targeted Review: {activeRemediationGuide.competency}
                  </h3>
                  <p className="text-xs text-slate-500">
                    You encountered difficulty on consecutive items. Let's master the core concept before continuing with scaffolded practice.
                  </p>
                </div>
              </div>

              <div className="space-y-4 my-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 text-xs">
                {/* Concept breakdown */}
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Foundational Principle:</span>
                  <p className="text-slate-700 leading-relaxed">{activeRemediationGuide.conceptSummary}</p>
                </div>

                {/* Key formulas / rules */}
                {activeRemediationGuide.keyFormulasAndRules.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Key Formulas & Rules:</span>
                    <ul className="space-y-1 text-slate-700">
                      {activeRemediationGuide.keyFormulasAndRules.map((rule, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Scaffolding reassurance */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] font-medium flex items-start gap-2">
                  <Target className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{activeRemediationGuide.scaffoldingStrategy}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowRemediationModal(false);
                  setRemediationAcknowledgedForCurrent(true);
                }}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>I've Reviewed the Concept — Continue with Scaffolded Practice</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mathematics Error 5-Stage Remediation Modal */}
      <AnimatePresence>
        {showCategoryRemediationModal && activeRemediationCategory && (
          <ErrorRemediationModal
            isOpen={showCategoryRemediationModal}
            category={activeRemediationCategory}
            triggerCount={sessionErrorOccurrences.filter(e => e.category === activeRemediationCategory).length}
            onClose={() => setShowCategoryRemediationModal(false)}
            onCompleteRemediation={(cat, scorePct) => {
              setShowCategoryRemediationModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Bottom Action Footer */}
      <div className="p-4 sm:p-6 border-t border-slate-100 bg-white relative z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {!isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className={`w-full py-4 rounded-2xl font-bold transition-all text-base sm:text-lg ${
                selectedOption === null 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : isDiagnostic
                  ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200 active:scale-95'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
              }`}
            >
              {isDiagnostic && currentProblemAttempts > 0 ? 'Check Answer Again' : 'Check Answer'}
            </button>
          ) : !isLastAnswerCorrect && !isSolutionRevealed ? (
            <div className="w-full flex items-center gap-3">
              <button
                onClick={() => {
                  setIsAnswered(false);
                  setIsLastAnswerCorrect(null);
                }}
                className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Another Answer</span>
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <span>Skip to Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 bg-indigo-600 text-white font-bold text-base sm:text-lg rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              <span>{currentStep < targetTotal - 1 ? 'Next Question' : 'View Results'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

