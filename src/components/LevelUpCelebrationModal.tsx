import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Sparkles, ArrowRight, Zap, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRankByLevel } from '../utils/gamification';

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  onOpenPerks?: () => void;
}

export default function LevelUpCelebrationModal({
  isOpen,
  onClose,
  newLevel,
  onOpenPerks
}: LevelUpCelebrationModalProps) {
  if (!isOpen) return null;

  const rank = getRankByLevel(newLevel);

  React.useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        className="bg-white rounded-3xl shadow-2xl border border-amber-200 max-w-md w-full overflow-hidden text-center relative"
      >
        {/* Glow Header */}
        <div className={`p-8 bg-gradient-to-br ${rank.gradient} text-white relative overflow-hidden`}>
          <div className="w-24 h-24 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto shadow-2xl border-2 border-white/40 ring-8 ring-white/10 mb-4 animate-bounce">
            <Crown className="w-12 h-12 text-amber-300" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-amber-200 mb-2 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>LEVEL UP ACHIEVED!</span>
          </div>

          <h2 className="text-4xl font-black tracking-tight text-white">Level {newLevel}</h2>
          <p className="text-base text-amber-100 font-bold mt-1">"{rank.title}"</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block mb-1">
              New Perk Unlocked
            </span>
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-amber-600 shrink-0 fill-amber-600" />
              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                {rank.perk}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Your mathematical persistence is paying off. Keep questing, solving problems, and climbing the Hall of Fame!
          </p>

          <div className="flex flex-col gap-2 pt-2">
            {onOpenPerks && (
              <button
                onClick={onOpenPerks}
                className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>View Rank Roadmap & Perks</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue the Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
