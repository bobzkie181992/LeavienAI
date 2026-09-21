import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trophy, 
  Gift, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Target, 
  Zap, 
  BookOpen, 
  Award,
  ChevronRight,
  Clock,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  DailyQuest, 
  getDailyQuestsState, 
  claimQuestReward, 
  claimDailyVault,
  getDailyCheckInStatus,
  claimDailyCheckInReward,
  CHECK_IN_TRAIL
} from '../utils/gamification';
import { playChestOpenSound, playCorrectSound, playPopSound } from '../utils/audioEffects';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userXP: number;
  userStreak: number;
  onRewardXP: (amount: number) => void;
}

export default function DailyQuestsModal({
  isOpen,
  onClose,
  userId,
  userXP,
  userStreak,
  onRewardXP
}: DailyQuestsModalProps) {
  const [questState, setQuestState] = useState(() => getDailyQuestsState(userId));
  const [checkInStatus, setCheckInStatus] = useState(() => getDailyCheckInStatus(userId));
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}
  };

  const handleClaimQuest = (quest: DailyQuest) => {
    playPopSound();
    const { quests, xpEarned } = claimQuestReward(userId, quest.id);
    if (xpEarned > 0) {
      playChestOpenSound();
      triggerConfetti();
      onRewardXP(xpEarned);
      setClaimedNotice(`+${xpEarned} XP Claimed for ${quest.title}!`);
      setTimeout(() => setClaimedNotice(null), 3500);
      setQuestState(getDailyQuestsState(userId));
    }
  };

  const handleClaimVault = () => {
    playPopSound();
    const { success, xpEarned } = claimDailyVault(userId);
    if (success && xpEarned > 0) {
      playChestOpenSound();
      triggerConfetti();
      onRewardXP(xpEarned);
      setClaimedNotice(`🎉 Super Bounty Unlocked! +${xpEarned} Bonus XP!`);
      setTimeout(() => setClaimedNotice(null), 4000);
      setQuestState(getDailyQuestsState(userId));
    }
  };

  const handleClaimCheckIn = () => {
    playPopSound();
    const res = claimDailyCheckInReward(userId);
    if (res.success) {
      playChestOpenSound();
      triggerConfetti();
      onRewardXP(res.reward.xp);
      setClaimedNotice(`🌟 Day ${res.newStreakDay} Check-In: +${res.reward.xp} XP Claimed!`);
      setTimeout(() => setClaimedNotice(null), 3500);
      setCheckInStatus(getDailyCheckInStatus(userId));
    }
  };

  const allQuestsDone = questState.quests.every(q => q.isCompleted);
  const vaultAvailable = allQuestsDone && !questState.vaultClaimed;

  const getQuestIcon = (iconName: string) => {
    switch (iconName) {
      case 'Target': return <Target className="w-5 h-5 text-indigo-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-blue-600" />;
      default: return <Award className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-200 block">
                Daily Math Expeditions
              </span>
              <h2 className="text-2xl font-black tracking-tight">Quests & Check-In Vault</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Flame className="w-4 h-4 fill-amber-300" />
              <span>{userStreak} Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-200">
              <Trophy className="w-4 h-4" />
              <span>{userXP} Total XP</span>
            </div>
            <div className="ml-auto text-indigo-200/80 text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Resets at Midnight</span>
            </div>
          </div>
        </div>

        {/* Notice Toast */}
        <AnimatePresence>
          {claimedNotice && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{claimedNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 7-Day Check-in Trail */}
          <section className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>7-Day Attendance Trail</span>
                </h3>
                <p className="text-[11px] text-slate-500">Log in daily to claim escalating XP chests!</p>
              </div>

              {checkInStatus.canClaim ? (
                <button
                  id="claim-daily-checkin-btn"
                  onClick={handleClaimCheckIn}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-orange-200 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claim Day {checkInStatus.currentDayIndex + 1}</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Claimed Today</span>
                </span>
              )}
            </div>

            {/* Trail Steps */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
              {CHECK_IN_TRAIL.map((item, idx) => {
                const isClaimedPast = !checkInStatus.canClaim && idx <= checkInStatus.currentDayIndex;
                const isCurrentActive = checkInStatus.canClaim && idx === checkInStatus.currentDayIndex;

                return (
                  <div
                    key={item.day}
                    className={`rounded-xl p-2 text-center border flex flex-col items-center justify-between transition-all ${
                      isCurrentActive
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400 shadow-sm'
                        : isClaimedPast
                        ? 'bg-emerald-50 border-emerald-200 opacity-90'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                      D{item.day}
                    </span>
                    <div className="my-1">
                      {isClaimedPast ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Gift className={`w-4 h-4 mx-auto ${isCurrentActive ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-800">
                      +{item.xp}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Daily Quests List */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Today's 3 Quests</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {questState.quests.filter(q => q.isCompleted).length} / {questState.quests.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {questState.quests.map((quest) => {
                const percent = Math.min(100, Math.round((quest.currentCount / quest.targetCount) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      quest.isClaimed
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : quest.isCompleted
                        ? 'bg-indigo-50/70 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-indigo-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          quest.isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-100'
                        }`}>
                          {quest.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : getQuestIcon(quest.icon)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{quest.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-tight">{quest.description}</p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {quest.isClaimed ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                            Claimed
                          </span>
                        ) : quest.isCompleted ? (
                          <button
                            id={`claim-quest-${quest.id}`}
                            onClick={() => handleClaimQuest(quest)}
                            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            <span>Claim +{quest.xpReward} XP</span>
                          </button>
                        ) : (
                          <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                            +{quest.xpReward} XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${quest.isCompleted ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Daily Vault Bounty Chest */}
          <section className={`rounded-2xl p-4 border transition-all ${
            questState.vaultClaimed
              ? 'bg-slate-50 border-slate-200'
              : vaultAvailable
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200'
              : 'bg-slate-100/80 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  vaultAvailable ? 'bg-white/20 text-yellow-300' : 'bg-slate-200 text-slate-400'
                }`}>
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-black ${vaultAvailable ? 'text-white' : 'text-slate-900'}`}>
                      Grand Daily Math Vault
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                      +120 BONUS XP
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${vaultAvailable ? 'text-purple-100' : 'text-slate-500'}`}>
                    Complete all 3 quests today to unlock this supreme treasure chest!
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {questState.vaultClaimed ? (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked Today</span>
                  </span>
                ) : vaultAvailable ? (
                  <button
                    id="claim-vault-reward-btn"
                    onClick={handleClaimVault}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                    <span>Open Vault!</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                    <Lock className="w-4 h-4" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Every quest completed builds your permanent Math Master rank.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
