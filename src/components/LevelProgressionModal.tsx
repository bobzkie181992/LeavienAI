import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Trophy, 
  Crown, 
  Shield, 
  Compass, 
  Swords, 
  Target, 
  Gem, 
  Sparkles, 
  Flame, 
  Lock, 
  CheckCircle2,
  ChevronRight,
  Zap
} from 'lucide-react';
import { RANK_TIERS, RankTier, getRankByLevel, getNextRank } from '../utils/gamification';

interface LevelProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  currentXP: number;
  onOpenAvatars?: () => void;
}

export default function LevelProgressionModal({
  isOpen,
  onClose,
  currentLevel,
  currentXP,
  onOpenAvatars
}: LevelProgressionModalProps) {
  if (!isOpen) return null;

  const currentRank = getRankByLevel(currentLevel);
  const nextRank = getNextRank(currentLevel);

  // Compute XP needed for next level: Math.floor(Math.sqrt(newXP / 100)) + 1
  // Conversely, XP for level L is (L - 1)^2 * 100
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
  const levelProgress = Math.min(
    100,
    Math.max(0, Math.round(((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100))
  );

  const getTierIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-5 h-5 ${isUnlocked ? 'text-amber-500' : 'text-slate-400'}`;
    switch (iconName) {
      case 'Shield': return <Shield className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Swords': return <Swords className={className} />;
      case 'Target': return <Target className={className} />;
      case 'Gem': return <Gem className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Crown': return <Crown className={className} />;
      default: return <Trophy className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className={`p-6 text-white relative bg-gradient-to-r ${currentRank.gradient}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
              <Crown className="w-8 h-8 text-amber-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full text-white">
                  Rank Tier {currentRank.tierName}
                </span>
                <span className="text-xs font-bold text-amber-200">
                  Level {currentLevel}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-0.5">{currentRank.title}</h2>
              <p className="text-xs text-white/80 mt-1">Perk: {currentRank.perk}</p>
            </div>
          </div>

          {/* Level Progress Gauge */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white/90">
              <span>Current Progress to Level {currentLevel + 1}</span>
              <span>{currentXP} / {xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            {nextRank && (
              <p className="text-[11px] text-amber-200">
                ⚡ Only {Math.max(0, xpForNextLevel - currentXP)} XP needed to advance to Level {currentLevel + 1}!
              </p>
            )}
          </div>
        </div>

        {/* Rank Roadmap List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
            Leavien AI Progression Tree
          </h3>

          <div className="space-y-2.5">
            {RANK_TIERS.map((tier) => {
              const isUnlocked = currentLevel >= tier.level;
              const isCurrent = currentLevel === tier.level;

              return (
                <div
                  key={tier.level}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    isCurrent
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
                      : isUnlocked
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-900 shadow-md'
                        : isUnlocked
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {getTierIcon(tier.iconName, isUnlocked)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900">{tier.title}</h4>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${tier.badgeColor}`}>
                          Lvl {tier.level} • {tier.tierName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{tier.perk}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isCurrent ? (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">
                        Current Rank
                      </span>
                    ) : isUnlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Lvl {tier.level}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Earn XP by taking quizzes, daily quests, and speed sprints.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
}
