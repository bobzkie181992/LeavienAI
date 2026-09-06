import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz, Problem, ItemResponse } from '../types';
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
  ArrowRight,
  TrendingUp,
  Brain,
  Check,
  HelpCircle,
  Award,
  Users
} from 'lucide-react';
import { 
  selectNextAdaptiveProblem, 
  updateAbilityEstimate, 
  convertThetaToAbilityBand 
} from '../utils/adaptiveEngine';

interface QuizEngineProps {
  quiz: Quiz;
  availablePool?: Problem[];
  initialMode?: 'adaptive' | 'standard' | 'timed';
  onClose: () => void;
  onComplete: (xp: number, score: number, total: number, itemResponses: ItemResponse[], abilityEstimate?: string, mathAbilityDiagnosis?: string, violations?: number) => void;
  onSuggestAIQuiz?: () => void;
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
  collaborativeSession
}: QuizEngineProps) {
  // Mode selection: 'adaptive' | 'standard' | 'timed'
  const [mode, setMode] = useState<'adaptive' | 'standard' | 'timed' | null>(
    initialMode || (quiz.id.includes('adaptive') ? 'adaptive' : null)
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

  // Active problem set (can grow dynamically in adaptive mode)
  const [problems, setProblems] = useState<Problem[]>([]);
  useEffect(() => {
    if (mode === 'adaptive') {
      setProblems(quiz.problems);
    } else {
      setProblems(shuffleArray(quiz.problems).map(p => {
        const options = p.options;
        const correctAnswer = p.correctAnswer;
        const correctOption = options[correctAnswer];
        
        // Shuffle options and update correctAnswer index
        const shuffled = shuffleArray(options);
        const newCorrectAnswer = shuffled.indexOf(correctOption);
        
        return { ...p, options: shuffled, correctAnswer: newCorrectAnswer };
      }));
    }
  }, [quiz.problems, mode]);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Progressive Hint States (0: none, 1: hint1, 2: hint2)
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);

  // Adaptive Testing State
  const [theta, setTheta] = useState<number>(0.0); // baseline theta
  const [usedProblemIds, setUsedProblemIds] = useState<Set<string>>(
    new Set(quiz.problems.map(p => p.id))
  );
  const [adaptiveHistory, setAdaptiveHistory] = useState<{
    problemId: string;
    competency: string;
    isCorrect: boolean;
    difficulty: string;
    b: number;
    thetaAfter: number;
  }[]>([]);

  // Item response logging
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [itemResponses, setItemResponses] = useState<ItemResponse[]>([]);
  const [violationCount, setViolationCount] = useState<number>(0);

  // Violation detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setViolationCount(prev => prev + 1);
        alert("Warning: Leaving the quiz page is prohibited. This will be logged as a violation.");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered || !currentProblem) return;
    setIsAnswered(true);

    const isCorrect = selectedOption === currentProblem.correctAnswer;
    setIsLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setHintLevel(1);
    }

    const responseTimeMs = Date.now() - startTime;
    const b = currentProblem.difficultyParameter ?? (currentProblem.difficulty === 'hard' ? 1.0 : currentProblem.difficulty === 'easy' ? -1.0 : 0.0);
    const a = currentProblem.discriminationParameter ?? 1.0;

    // In Adaptive Mode, dynamically update ability theta
    let updatedTheta = theta;
    if (mode === 'adaptive') {
      updatedTheta = updateAbilityEstimate(theta, isCorrect, currentProblem, currentStep);
      setTheta(updatedTheta);

      setAdaptiveHistory(prev => [
        ...prev,
        {
          problemId: currentProblem.id,
          competency: currentProblem.competency || currentProblem.topic,
          isCorrect,
          difficulty: currentProblem.difficulty,
          b,
          thetaAfter: updatedTheta
        }
      ]);
    }

    setItemResponses(prev => [
      ...prev,
      {
        problemId: currentProblem.id,
        competency: currentProblem.competency,
        selectedOption,
        isCorrect,
        difficultyParameter: b,
        discriminationParameter: a,
        responseTimeMs
      }
    ]);
  };

  const handleNext = () => {
    const targetStepsCount = mode === 'adaptive' ? 5 : problems.length;

    // If Adaptive Mode and fewer than 5 problems completed, pick next adaptive problem from pool
    if (mode === 'adaptive' && currentStep + 1 < targetStepsCount) {
      const fullPool = availablePool && availablePool.length > 0 
        ? availablePool 
        : quiz.problems;

      const newUsedIds = new Set<string>(usedProblemIds);
      if (currentProblem) newUsedIds.add(currentProblem.id);

      const nextProb = selectNextAdaptiveProblem(fullPool, newUsedIds, theta);

      if (nextProb) {
        newUsedIds.add(nextProb.id);
        setUsedProblemIds(newUsedIds);
        setProblems(prev => [...prev, nextProb]);
        setCurrentStep(s => s + 1);
        setSelectedOption(null);
        setIsAnswered(false);
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
      setHintLevel(0);
      setStartTime(Date.now());
    } else {
      setShowSummary(true);
    }
  };

  const handleRetake = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowSummary(false);
    setHintLevel(0);
    setItemResponses([]);
    setAdaptiveHistory([]);
    setTheta(0.0);
    setProblems(quiz.problems);
    setUsedProblemIds(new Set(quiz.problems.map(p => p.id)));
    setStartTime(Date.now());
    if (mode === 'timed') {
      setTimeLeft(totalTimeAllowed);
    }
  };

  // Safe fallback hints so hints NEVER fail
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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-6 sm:p-10 text-center shadow-2xl border border-slate-100 max-w-2xl w-full relative overflow-hidden"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{quiz.title}</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">{quiz.description}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Adaptive Mode */}
            <button
              onClick={() => setMode('adaptive')}
              className="text-left p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white hover:border-indigo-500 hover:shadow-md transition-all group relative flex flex-col justify-between"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                Recommended
              </div>
              <div>
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Adaptive Mode</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Questions dynamically adjust in difficulty after each response to test your exact mastery band.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Dynamic IRT</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </button>

            {/* Standard Mode */}
            <button
              onClick={() => setMode('standard')}
              className="text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Standard Mode</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Learn at your own pace with step-by-step guidance, progressive hints, and thorough solutions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Self-Paced</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">{quiz.xpReward} XP</span>
              </div>
            </button>

            {/* Timed Mode */}
            <button
              onClick={() => {
                setMode('timed');
                setTimeLeft(totalTimeAllowed);
              }}
              className="text-left p-5 rounded-2xl border-2 border-rose-100 bg-rose-50/20 hover:border-rose-400 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Timer className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Timed Challenge</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Race against the clock! Fast-paced problem solving with bonus XP for speed.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs font-bold text-rose-600">
                <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> +50% XP</span>
                <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded">{totalTimeAllowed}s</span>
              </div>
            </button>
          </div>

          {/* Active Timer Option */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-200/85 rounded-2xl flex items-center justify-between gap-4 max-w-md mx-auto text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                timerActivated ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-950 text-xs">Activate Quiz Timer</h4>
                <p className="text-[10px] text-slate-500 leading-normal">Enables a countdown timer (30 seconds per question) for your selected quiz session.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setTimerActivated(!timerActivated);
              }}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 relative ${
                timerActivated ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                timerActivated ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
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
    if (mode === 'adaptive' && score >= 3) {
      xpEarned += 50; // Adaptive mastery bonus
    }
    if (collaborativeSession) {
      xpEarned += 50; // Collaborative study bonus
    }

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const finalAbilityBand = mode === 'adaptive' ? convertThetaToAbilityBand(theta) : undefined;
    
    const getProficiencyLevel = (score: number, total: number) => {
      const percentage = (score / total) * 100;
      if (percentage >= 90) return 'Expert';
      if (percentage >= 75) return 'Advanced';
      if (percentage >= 55) return 'Proficient';
      if (percentage >= 35) return 'Developing';
      return 'Novice';
    }
    
    const diagnosis = mode === 'adaptive' ? finalAbilityBand : getProficiencyLevel(score, totalQuestions);
    const canAdvance = (diagnosis === 'Advanced' || diagnosis === 'Proficient') && percentage >= 80;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-6 sm:p-8 text-center shadow-2xl border border-slate-100 max-w-lg w-full my-8 relative"
        >
          {/* Trophy Header */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Trophy className="w-10 h-10 text-amber-600" />
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
            {mode === 'adaptive' && (
              <div className="absolute -bottom-2 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ADAPTIVE
              </div>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            {percentage >= 80 ? 'Mastery Achieved!' : percentage >= 50 ? 'Assessment Completed!' : 'Good Effort!'}
          </h2>
          <p className="text-slate-500 text-sm mb-2">
            {quiz.title} • {mode === 'adaptive' ? 'Adaptive Diagnostic Engine' : mode === 'timed' ? 'Timed Run' : 'Standard Study Session'}
          </p>
          <div className="mb-4 flex gap-2 justify-center">
            <div className="p-2 bg-indigo-50 text-indigo-800 text-xs font-bold rounded-lg inline-block">
              Proficiency Level: {diagnosis}
            </div>
            {canAdvance && (
              <div className="p-2 bg-green-50 text-green-800 text-xs font-bold rounded-lg inline-block">
                Ready for next level!
              </div>
            )}
          </div>

          {collaborativeSession && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 mb-5 flex items-center justify-center gap-2 text-xs font-bold text-indigo-800">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Studied together with {collaborativeSession.partnerName}!</span>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="text-2xl font-black text-indigo-600">{score}/{totalQuestions}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</div>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">{percentage}%</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Accuracy</div>
            </div>
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100">
              <div className="text-2xl font-black text-amber-600">+{xpEarned}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">XP Earned</div>
            </div>
          </div>

          {/* Adaptive Ability Breakdown (If in Adaptive Mode) */}
          {mode === 'adaptive' && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Estimated Ability (IRT)
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  finalAbilityBand === 'Expert' ? 'bg-violet-100 text-violet-800' :
                  finalAbilityBand === 'Advanced' ? 'bg-emerald-100 text-emerald-800' :
                  finalAbilityBand === 'Proficient' ? 'bg-indigo-100 text-indigo-800' :
                  finalAbilityBand === 'Developing' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {finalAbilityBand} (θ: {theta > 0 ? `+${theta}` : theta})
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 leading-relaxed mb-3">
                The adaptive engine adjusted difficulty in real-time across {totalQuestions} questions based on your responses.
              </p>
              
              {/* Question difficulty steps */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-indigo-100">
                {adaptiveHistory.map((step, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 p-1.5 rounded-lg text-center text-[10px] font-bold border ${
                      step.isCorrect ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800' : 'bg-rose-100/70 border-rose-300 text-rose-800'
                    }`}
                    title={`Q${i + 1}: ${step.difficulty} (b: ${step.b}) - ${step.isCorrect ? 'Correct' : 'Incorrect'}`}
                  >
                    Q{i + 1}
                    <div className="text-[8px] font-mono">{step.difficulty[0].toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Retake vs Collect */}
          <div className="space-y-3">
            <button
              onClick={() => onComplete(xpEarned, score, totalQuestions, itemResponses, finalAbilityBand, diagnosis, violationCount)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all text-base flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5" />
              Collect Rewards & Return
            </button>

            <button
              onClick={handleRetake}
              className="w-full py-3.5 bg-white text-indigo-600 font-bold rounded-2xl border-2 border-indigo-100 hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </button>
            {diagnosis === 'Novice' && onSuggestAIQuiz && (
              <button
                onClick={onSuggestAIQuiz}
                className="w-full py-3.5 bg-rose-50 text-rose-700 font-bold rounded-2xl border-2 border-rose-100 hover:bg-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Generate AI Remediation Quiz
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

        {/* Progress Bar & Adaptive Status */}
        <div className="flex-1 max-w-md mx-4 sm:mx-8">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
            <span>Question {currentStep + 1} of {targetTotal}</span>
            {mode === 'adaptive' && (
              <span className="text-indigo-600 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> Adaptive ({convertThetaToAbilityBand(theta)})
              </span>
            )}
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-600"
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-10 bg-slate-50/50">
        <div className="max-w-2xl mx-auto space-y-6">
          {currentProblem ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Question Metadata Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  Step {currentStep + 1}
                </span>

                <span className={`text-[11px] font-bold capitalize px-2.5 py-1 rounded-lg border ${diffBadgeColor}`}>
                  {currentDiff} Level
                  {currentProblem.difficultyParameter !== undefined && (
                    <span className="ml-1 opacity-75 font-mono">(b: {currentProblem.difficultyParameter > 0 ? `+${currentProblem.difficultyParameter}` : currentProblem.difficultyParameter})</span>
                  )}
                </span>

                {currentProblem.competency && (
                  <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg truncate max-w-xs">
                    {currentProblem.competency}
                  </span>
                )}
              </div>

              {/* Question Prompt */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {currentProblem.question}
              </h2>

              {/* Multiple Choice Options */}
              <div className="grid gap-3">
                {currentProblem.options.map((option, index) => {
                  let status = 'default';
                  if (isAnswered) {
                    if (index === currentProblem.correctAnswer) status = 'correct';
                    else if (index === selectedOption) status = 'wrong';
                  } else if (selectedOption === index) {
                    status = 'selected';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      disabled={isAnswered}
                      className={`
                        w-full p-4 sm:p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group
                        ${status === 'default' && 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/20 active:scale-[0.99]'}
                        ${status === 'selected' && 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'}
                        ${status === 'correct' && 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'}
                        ${status === 'wrong' && 'border-rose-500 bg-rose-50 text-rose-950 opacity-80'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          status === 'correct' ? 'bg-emerald-500 text-white' :
                          status === 'wrong' ? 'bg-rose-500 text-white' :
                          status === 'selected' ? 'bg-indigo-600 text-white' :
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
                            <span>Incorrect</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Progressive Hints Section */}
              {(!isAnswered || (isAnswered && isLastAnswerCorrect === false)) && (
                <div className="pt-2">
                  {hintLevel === 0 ? (
                    <button
                      onClick={() => setHintLevel(1)}
                      className="text-amber-600 hover:text-amber-700 font-bold text-sm flex items-center gap-2 py-2 px-3 hover:bg-amber-50 rounded-xl transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>Need a hint? (Level 1: Strategy Clue)</span>
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      {/* Hint 1 */}
                      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-950 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-0.5">
                            Hint 1: Conceptual Strategy
                          </span>
                          <p className="text-sm leading-relaxed">{getHint1(currentProblem)}</p>
                        </div>
                      </div>

                      {/* Hint 2 request or display */}
                      {hintLevel === 1 ? (
                        <button
                          onClick={() => setHintLevel(2)}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5 px-3 py-1.5 hover:bg-amber-100/50 rounded-lg transition-colors ml-8"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Still stuck? Request Step-by-Step Guidance (Hint 2)</span>
                        </button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-amber-100/60 border border-amber-300 rounded-2xl text-amber-950 flex items-start gap-3 ml-4"
                        >
                          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block mb-0.5">
                              Hint 2: Step-by-Step Guidance
                            </span>
                            <p className="text-sm leading-relaxed">{getHint2(currentProblem)}</p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Immediate Feedback: Solution & Explanation Box */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                      selectedOption === currentProblem.correctAnswer
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {/* Status headline */}
                    <div className="flex items-center gap-2">
                      {selectedOption === currentProblem.correctAnswer ? (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-lg text-emerald-900">Correct! Excellent Reasoning</h4>
                            <p className="text-xs text-emerald-700">You selected the right mathematical model.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-black text-lg text-rose-900">Not Quite Correct</h4>
                            <p className="text-xs text-rose-700">
                              Correct answer is: <strong className="underline">{currentProblem.options[currentProblem.correctAnswer]}</strong>
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Step-by-Step Solution */}
                    <div className="pt-2 border-t border-black/5">
                      <span className="text-[11px] font-black uppercase tracking-wider block mb-1 opacity-70">
                        Step-by-Step Mathematical Solution:
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

                    {/* Misconception Analysis & Remediation */}
                    {(currentProblem.misconceptionCategory || currentProblem.remediation) && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1.5 text-amber-950">
                        {currentProblem.misconceptionCategory && (
                          <div>
                            <span className="font-bold text-amber-800">Target Misconception: </span>
                            <span>{currentProblem.misconceptionCategory}</span>
                          </div>
                        )}
                        {currentProblem.remediation && (
                          <div>
                            <span className="font-bold text-amber-800">Remediation Tip: </span>
                            <span>{currentProblem.remediation}</span>
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
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
              }`}
            >
              Check Answer
            </button>
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
