import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Crown, 
  Compass, 
  Star, 
  Triangle, 
  Atom, 
  Flame, 
  Sparkles, 
  Infinity as InfinityIcon,
  Check,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MATH_AVATARS, MathAvatar, getEquippedAvatar, setEquippedAvatar } from '../utils/gamification';
import { playCorrectSound, playPopSound } from '../utils/audioEffects';

interface AvatarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userLevel?: number;
  currentLevel?: number;
  onAvatarChanged?: () => void;
  onAvatarSelected?: (avatarId: string) => void;
}

export default function AvatarCustomizerModal({
  isOpen,
  onClose,
  userId,
  userLevel,
  currentLevel,
  onAvatarChanged,
  onAvatarSelected
}: AvatarCustomizerModalProps) {
  const effectiveLevel = currentLevel ?? userLevel ?? 1;
  const [selectedAvatar, setSelectedAvatar] = useState<MathAvatar>(() => getEquippedAvatar(userId));

  if (!isOpen) return null;

  const handleSelectAvatar = (avatar: MathAvatar) => {
    if (effectiveLevel < avatar.requiredLevel) return;
    playPopSound();
    setEquippedAvatar(userId, avatar.id);
    setSelectedAvatar(avatar);
    playCorrectSound();
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (e) {}
    if (onAvatarChanged) onAvatarChanged();
    if (onAvatarSelected) onAvatarSelected(avatar.id);
  };

  const getAvatarIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Crown className="w-6 h-6 text-white" />;
      case 'Compass': return <Compass className="w-6 h-6 text-white" />;
      case 'Star': return <Star className="w-6 h-6 text-white" />;
      case 'Triangle': return <Triangle className="w-6 h-6 text-white" />;
      case 'Atom': return <Atom className="w-6 h-6 text-white" />;
      case 'Flame': return <Flame className="w-6 h-6 text-white" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-white" />;
      case 'Infinity': return <InfinityIcon className="w-6 h-6 text-white" />;
      default: return <Crown className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedAvatar.bgGradient} flex items-center justify-center shadow-lg border-2 border-white/40 ring-4 ring-white/10`}>
              {getAvatarIcon(selectedAvatar.iconName)}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200 block">
                Equipped Math Persona
              </span>
              <h2 className="text-xl font-black">{selectedAvatar.name}</h2>
              <p className="text-xs text-amber-200 font-semibold italic">"{selectedAvatar.title}"</p>
            </div>
          </div>
        </div>

        {/* Avatars Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
              Select Your Math Archetype
            </h3>
            <p className="text-xs text-slate-500">
              Unlock prestigious personas as your student level increases.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MATH_AVATARS.map((avatar) => {
              const isUnlocked = userLevel >= avatar.requiredLevel;
              const isEquipped = selectedAvatar.id === avatar.id;

              return (
                <button
                  key={avatar.id}
                  disabled={!isUnlocked}
                  onClick={() => handleSelectAvatar(avatar)}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                    isEquipped
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 shadow-sm'
                      : isUnlocked
                      ? 'bg-slate-50 border-slate-200 hover:border-indigo-200 hover:bg-white active:scale-95'
                      : 'bg-slate-100/70 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center shadow-sm`}>
                      {getAvatarIcon(avatar.iconName)}
                    </div>

                    {isEquipped ? (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : !isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-md">
                        <Lock className="w-3 h-3" />
                        <span>Lvl {avatar.requiredLevel}</span>
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">{avatar.name}</h4>
                    <p className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">{avatar.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
