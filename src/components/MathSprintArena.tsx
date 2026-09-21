import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Timer, 
  Flame, 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  X, 
  Award, 
  ArrowRight,
  ShieldAlert,
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  SPRINT_PROBLEMS, 
  SprintProblem, 
  getSprintHighScore, 
  saveSprintHighScore,
  trackQuestProgress
} from '../utils/gamification';
import { 
  playCorrectSound, 
  playComboSound, 
  playLevelUpFanfare, 
  playPopSound,
  isAudioMuted,
  setAudioMuted
} from '../utils/audioEffects';

interface MathSprintArenaProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onRewardXP: (amount: number) => void;
}

export default function MathSprintArena({
  isOpen,
  onClose,
  userId,
  onRewardXP
}: MathSprintArenaProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [shuffledProblems, setShuffledProblems] = useState<SprintProblem[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);
  const [highScore, setHighScore] = useState(() => getSprintHighScore(userId));
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [muted, setMuted] = useState(() => isAudioMuted());

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Shuffle problems when opening
  const prepareGame = () => {
    const shuffled = [...SPRINT_PROBLEMS].sort(() => Math.random() - 0.5);
    setShuffledProblems(shuffled);
    setCurrentProblemIndex(0);
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setSelectedOption(null);
    setIsCorrectFeedback(null);
    setIsNewHighScore(false);
  };

  const handleStartGame = () => {
    playPopSound();
    prepareGame();
    setGameState('playing');
  };

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // When time hits 0
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) {
      handleGameOver();
    }
  }, [timeLeft, gameState]);

  const handleGameOver = () => {
    setGameState('gameover');
    const isNew = saveSprintHighScore(userId, score);
    if (isNew) {
      setIsNewHighScore(true);
      setHighScore(score);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    // Award XP based on score (10 XP per point + bonus for high combo)
    const earnedXP = score * 10 + Math.floor(maxCombo * 5);
    if (earnedXP > 0) {
      onRewardXP(earnedXP);
    }

    // Advance daily quest
    trackQuestProgress(userId, 'speed_sprint', 1);

    playLevelUpFanfare();
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || gameState !== 'playing') return;

    setSelectedOption(index);
    const problem = shuffledProblems[currentProblemIndex];
    const isCorrect = index === problem.correctIndex;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Multiplier: 1x, 2x for combo >= 3, 3x for combo >= 5
      const multiplier = newCombo >= 5 ? 3 : newCombo >= 3 ? 2 : 1;
      setScore(prev => prev + 1 * multiplier);

      setIsCorrectFeedback(true);
      if (newCombo >= 3) {
        playComboSound(newCombo);
      } else {
        playCorrectSound();
      }

      // Quest progress for solving math problem
      trackQuestProgress(userId, 'answer_problems', 1);
    } else {
      setCombo(0);
      setIsCorrectFeedback(false);
      playPopSound();
    }

    // Advance to next problem after short delay
    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrectFeedback(null);
      if (currentProblemIndex < shuffledProblems.length - 1) {
        setCurrentProblemIndex(prev => prev + 1);
      } else {
        // Re-shuffle to keep going if problems exhausted within 60s
        const reShuffled = [...SPRINT_PROBLEMS].sort(() => Math.random() - 0.5);
        setShuffledProblems(reShuffled);
        setCurrentProblemIndex(0);
      }
    }, 450);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setAudioMuted(next);
  };

  if (!isOpen) return null;

  const currentProblem = shuffledProblems[currentProblemIndex] || SPRINT_PROBLEMS[0];
  const isFeverMode = combo >= 5;
  const isComboActive = combo >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`bg-slate-900 text-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col relative border transition-all duration-300 ${
          isFeverMode 
            ? 'border-amber-400 ring-4 ring-amber-500/30 shadow-amber-500/20 shadow-2xl' 
            : 'border-slate-800'
        }`}
      >
        {/* Top Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 block">
                Sprint Arena
              </span>
              <h3 className="text-sm font-black text-white">60-Second Math Blitz</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={muted ? "Unmute" : "Mute Sound Effects"}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game State Views */}
        {gameState === 'intro' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20 ring-4 ring-white/10">
              <Flame className="w-10 h-10 text-white animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Ready for the Math Blitz?</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Test your mathematical reflexes! Answer as many Grade 11 math challenges as you can in 60 seconds.
              </p>
            </div>

            {/* Rules / Mechanics */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <span className="text-amber-400 text-xs font-black block mb-1">⏱️ 60 SECONDS</span>
                <p className="text-[11px] text-slate-400">Pure rapid-fire calculation against the clock.</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <span className="text-orange-400 text-xs font-black block mb-1">🔥 COMBO x2 & x3</span>
                <p className="text-[11px] text-slate-400">Chain correct answers for Fever Mode multiplier.</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <span className="text-indigo-400 text-xs font-black block mb-1">🏆 EARN XP</span>
                <p className="text-[11px] text-slate-400">10 XP per point + bonus for high combo streaks.</p>
              </div>
            </div>

            {highScore > 0 && (
              <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Personal Best Record: <strong className="text-white">{highScore} pts</strong></span>
              </div>
            )}

            <div>
              <button
                id="start-math-sprint-btn"
                onClick={handleStartGame}
                className="w-full max-w-xs mx-auto py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>START SPRINT (60s)</span>
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="p-6 space-y-5">
            {/* Live Stats Bar */}
            <div className="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  timeLeft <= 10 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-indigo-400'
                }`}>
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Remaining</span>
                  <span className={`text-xl font-black ${timeLeft <= 10 ? 'text-rose-400' : 'text-white'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Combo Multiplier */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className={`w-4 h-4 ${isFeverMode ? 'text-amber-400 fill-amber-400 animate-bounce' : isComboActive ? 'text-orange-400 fill-orange-400' : 'text-slate-500'}`} />
                  <span className={`text-xs font-black ${isFeverMode ? 'text-amber-300' : isComboActive ? 'text-orange-300' : 'text-slate-400'}`}>
                    {isFeverMode ? 'FEVER x3' : isComboActive ? 'COMBO x2' : 'COMBO x1'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {combo} Streak
                </span>
              </div>

              {/* Score */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Score</span>
                <span className="text-2xl font-black text-amber-400">{score}</span>
              </div>
            </div>

            {/* Fever Mode Alert Banner */}
            <AnimatePresence>
              {isFeverMode && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs py-1.5 px-3 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/30"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>FEVER MODE ACTIVE! TRIPLE POINTS ON EVERY CORRECT ANSWER!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Problem Card */}
            <div className={`p-6 rounded-3xl bg-slate-800/80 border transition-all duration-200 relative overflow-hidden ${
              isCorrectFeedback === true
                ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-950/20'
                : isCorrectFeedback === false
                ? 'border-rose-500 ring-2 ring-rose-500/40 bg-rose-950/20'
                : 'border-slate-700/80'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                  {currentProblem.topicTag}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Problem #{currentProblemIndex + 1}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed mb-6">
                {currentProblem.prompt}
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3">
                {currentProblem.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isAnswer = currentProblem.correctIndex === idx;

                  let btnStyle = 'bg-slate-700/70 hover:bg-slate-700 text-white border-slate-600';
                  if (selectedOption !== null) {
                    if (isAnswer) {
                      btnStyle = 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400';
                    } else if (isSelected && !isAnswer) {
                      btnStyle = 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400';
                    } else {
                      btnStyle = 'bg-slate-800 text-slate-500 border-slate-700 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-2xl border font-bold text-sm sm:text-base transition-all text-center flex items-center justify-center active:scale-95 ${btnStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl ring-4 ring-white/10">
              <Trophy className="w-10 h-10 text-amber-300" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white">Sprint Completed!</h2>
              <p className="text-xs text-slate-400">Great mathematical energy and speed!</p>
            </div>

            {isNewHighScore && (
              <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 p-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>NEW PERSONAL BEST RECORD!</span>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Final Score</span>
                <span className="text-2xl font-black text-amber-400">{score}</span>
              </div>
              <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Max Streak</span>
                <span className="text-2xl font-black text-orange-400">{maxCombo}🔥</span>
              </div>
              <div className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">XP Earned</span>
                <span className="text-2xl font-black text-emerald-400">+{score * 10 + Math.floor(maxCombo * 5)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStartGame}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
              >
                Exit Arena
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
