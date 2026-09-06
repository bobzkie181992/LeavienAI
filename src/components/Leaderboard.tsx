import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useLeaderboard } from '../hooks/useFirebase';
import { UserProfile } from '../types';
import { achievements } from '../data/curriculum';

export default function Leaderboard() {
  const { leaderboard, loading } = useLeaderboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Hall of Fame</h2>
        <p className="text-slate-500">The top 10 math adventurers this season.</p>
      </div>

      <div className="grid gap-3">
        {leaderboard.map((student: UserProfile, index: number) => (
          <LeaderboardRow key={student.uid} student={student} rank={index + 1} />
        ))}
      </div>
    </motion.div>
  );
}

const LeaderboardRow: React.FC<{ student: UserProfile, rank: number }> = ({ student, rank }) => {
  const isTopThree = rank <= 3;
  
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-slate-400">{rank}</span>;
  };

  const getBgColor = () => {
    if (rank === 1) return 'bg-amber-50 border-amber-200';
    if (rank === 2) return 'bg-slate-50 border-slate-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-slate-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`p-4 rounded-2xl border flex items-center gap-4 ${getBgColor()} shadow-sm relative group/row`}
    >
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative group">
        {getRankIcon()}
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 md:ml-4 top-1/2 -translate-y-1/2 w-56 md:w-64 bg-slate-900 text-white rounded-2xl p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] pointer-events-none scale-95 group-hover:scale-100 origin-left">
          <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-slate-900 transform rotate-45 rounded-sm" />
          
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-2 text-orange-400">
               <Zap className="w-5 h-5 fill-current" />
               <span className="font-bold">{student.streak} Day Streak</span>
             </div>
             
             {student.badges && student.badges.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Badges</div>
                  <div className="grid gap-2">
                    {student.badges.slice(0, 3).map(badgeId => {
                      const badge = achievements.find(a => a.id === badgeId);
                      if (!badge) return null;
                      const IconComponent = (Icons as any)[badge.icon] || Icons.Award;
                      return (
                        <div key={badgeId} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl">
                          <IconComponent className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-medium text-slate-200 truncate">{badge.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
             ) : (
                <div className="text-xs text-slate-400 italic">No badges earned yet.</div>
             )}
          </div>
        </div>
      </div>

      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
        {student.displayName[0]}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-900 truncate">{student.displayName}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Level {student.level}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-inner">
        <Zap className="w-3 h-3 text-amber-500 fill-current" />
        <span className="text-sm font-black text-slate-700">{student.xp.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
