import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Zap, 
  Flame, 
  Search, 
  Users, 
  Sparkles, 
  ArrowUp, 
  ChevronRight, 
  ShieldCheck, 
  ThumbsUp, 
  HelpCircle,
  RefreshCw,
  Award
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useLeaderboard } from '../hooks/useFirebase';
import { UserProfile } from '../types';
import { achievements } from '../data/curriculum';
import { getRankByLevel, getEquippedAvatar } from '../utils/gamification';
import { playPopSound, playCorrectSound } from '../utils/audioEffects';

interface ClassLeaderboardProps {
  currentUser?: UserProfile;
  onNavigateToPractice?: () => void;
  onOpenBlitzArena?: () => void;
  onOpenDailyQuests?: () => void;
}

export default function ClassLeaderboard({
  currentUser,
  onNavigateToPractice,
  onOpenBlitzArena,
  onOpenDailyQuests
}: ClassLeaderboardProps) {
  const { leaderboard, loading, refreshLeaderboard } = useLeaderboard();
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowToEarnXP, setShowHowToEarnXP] = useState(false);
  const [cheeredUids, setCheeredUids] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Available sections
  const sections = useMemo(() => {
    const set = new Set<string>();
    leaderboard.forEach(s => {
      if (s.section) set.add(s.section);
    });
    return Array.from(set).sort();
  }, [leaderboard]);

  // Filtered leaderboard
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(student => {
      // Exclude faculty
      if (student.role === 'faculty') return false;

      // Section filter
      if (selectedSection !== 'all' && student.section !== selectedSection) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = student.displayName?.toLowerCase().includes(query);
        const matchesLRN = student.lrn?.toLowerCase().includes(query);
        const matchesSection = student.section?.toLowerCase().includes(query);
        return matchesName || matchesLRN || matchesSection;
      }

      return true;
    });
  }, [leaderboard, selectedSection, searchQuery]);

  // Find current user's rank in the filtered list
  const currentUserIndex = useMemo(() => {
    if (!currentUser) return -1;
    return filteredLeaderboard.findIndex(s => s.uid === currentUser.uid);
  }, [filteredLeaderboard, currentUser]);

  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : null;
  const studentAhead = currentUserIndex > 0 ? filteredLeaderboard[currentUserIndex - 1] : null;
  const xpDifferenceAhead = (studentAhead && currentUser) ? Math.max(1, (studentAhead.xp || 0) - (currentUser.xp || 0) + 1) : 0;

  // Top 3 Podium
  const topThree = useMemo(() => {
    return filteredLeaderboard.slice(0, 3);
  }, [filteredLeaderboard]);

  const highestXP = filteredLeaderboard.length > 0 ? (filteredLeaderboard[0].xp || 1) : 1;

  // Total class XP
  const totalClassXP = useMemo(() => {
    return filteredLeaderboard.reduce((acc, curr) => acc + (curr.xp || 0), 0);
  }, [filteredLeaderboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    playPopSound();
    await refreshLeaderboard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCheer = (studentUid: string) => {
    playCorrectSound();
    setCheeredUids(prev => ({
      ...prev,
      [studentUid]: (prev[studentUid] || 0) + 1
    }));
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full shadow-sm"
        />
        <p className="text-sm font-semibold text-slate-500">Loading Class XP Standings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-700/50">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Competitive Math League • Grade 11</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Class-Wide XP Leaderboard
              <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-sm text-indigo-200 max-w-xl">
              Track real-time XP rankings, celebrate top math scholars, and challenge your classmates for the coveted Season Crown.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              id="leaderboard-refresh-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs border border-white/15 transition-all backdrop-blur-sm"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Live Sync'}</span>
            </button>

            <button
              id="leaderboard-rules-btn"
              onClick={() => {
                playPopSound();
                setShowHowToEarnXP(!showHowToEarnXP);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-400/30 transition-all active:scale-95"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Earn XP</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">Total Scholars</span>
            <div className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{filteredLeaderboard.length}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">Class Total XP</span>
            <div className="text-lg font-black text-amber-300 mt-0.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{totalClassXP.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">Top Score</span>
            <div className="text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>{(filteredLeaderboard[0]?.xp || 0).toLocaleString()} XP</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">Your Standing</span>
            <div className="text-lg font-black text-emerald-300 mt-0.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{currentUserRank ? `#${currentUserRank}` : 'Unranked'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How To Earn XP Collapsible Guide */}
      <AnimatePresence>
        {showHowToEarnXP && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-black text-amber-900 text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
                  How to Climb the Math Leaderboard
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  XP reflects your mathematical mastery, continuous practice, and dedication.
                </p>
              </div>
              <button 
                onClick={() => setShowHowToEarnXP(false)}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-200/60 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Summative Exams
                </span>
                <p className="text-slate-600 text-[11px]">Earn +200 to +500 XP per validated DepEd quarterly exam.</p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Adaptive Practice
                </span>
                <p className="text-slate-600 text-[11px]">Earn +50 to +100 XP answering IRT adaptive math items.</p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  60s Math Blitz
                </span>
                <p className="text-slate-600 text-[11px]">Earn +30 to +90 XP in rapid-fire mental arithmetic duels.</p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Daily Quests & Streaks
                </span>
                <p className="text-slate-600 text-[11px]">Earn +40 to +80 XP daily check-ins plus streak multipliers.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Student's Standings / Competitive Gap Card */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-2 border-indigo-200 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-16 -mt-16 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md relative flex-shrink-0">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                {currentUserRank && currentUserRank <= 3 && (
                  <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 rounded-full p-1 shadow-sm">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                    You
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{currentUser.displayName}</h3>
                  {currentUser.section && (
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {currentUser.section}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slate-600 font-medium">
                  <span className="font-bold text-indigo-700">
                    Rank {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                    {(currentUser.xp || 0).toLocaleString()} Total XP
                  </span>
                  <span>•</span>
                  <span className="text-slate-500 font-bold">
                    Level {currentUser.level} ({getRankByLevel(currentUser.level).tierName})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-orange-600 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                    {currentUser.streak || 0}d Streak
                  </span>
                </div>
              </div>
            </div>

            {/* Motivation Action Callout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {currentUserRank === 1 ? (
                <div className="bg-amber-100/80 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Class Champion! You hold 1st Place!</span>
                </div>
              ) : studentAhead ? (
                <div className="bg-white px-4 py-2.5 rounded-2xl border border-indigo-200 shadow-2xs text-xs">
                  <div className="text-slate-500 font-medium flex items-center gap-1">
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Next Rank (#{(currentUserRank || 2) - 1}):</span>
                    <strong className="text-slate-900">{studentAhead.displayName}</strong>
                  </div>
                  <div className="text-indigo-700 font-bold mt-0.5">
                    +{xpDifferenceAhead} XP needed to overtake
                  </div>
                </div>
              ) : (
                <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-600">
                  Complete quizzes to raise your rank!
                </div>
              )}

              <div className="flex items-center gap-2">
                {onOpenBlitzArena && (
                  <button
                    onClick={onOpenBlitzArena}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>60s Blitz</span>
                  </button>
                )}
                {onNavigateToPractice && (
                  <button
                    onClick={onNavigateToPractice}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Practice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Podium: Top 3 Champions Pedestal */}
      {topThree.length >= 2 && (
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800/40">
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-amber-400 tracking-wide uppercase flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 fill-current" />
              Classroom Podium Champions
              <Crown className="w-5 h-5 fill-current" />
            </h2>
            <p className="text-xs text-indigo-200">The highest scoring math adventurers in the current cohort</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-4 pb-2">
            {/* 2nd Place (Left) */}
            {topThree[1] ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-3">
                  <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center text-lg sm:text-2xl font-black text-slate-200">
                      {topThree[1].displayName[0]}
                    </div>
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-black text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white">
                    <Medal className="w-3 h-3 text-slate-600" />
                    <span>#2</span>
                  </div>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[100px] sm:max-w-[140px]">
                  {topThree[1].displayName}
                </h4>
                <div className="text-[11px] text-slate-400 font-medium">
                  {topThree[1].section || 'STEM-A'}
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-black text-xs border border-slate-700 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-current" />
                  <span>{topThree[1].xp.toLocaleString()} XP</span>
                </div>

                {/* Pedestal Block */}
                <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl mt-4 border-t-2 border-slate-400 flex flex-col items-center justify-center text-slate-400 shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-slate-300">2</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Silver</span>
                </div>
              </motion.div>
            ) : <div />}

            {/* 1st Place (Center - Elevated) */}
            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col items-center text-center -mt-6 sm:-mt-8"
              >
                <div className="relative mb-3">
                  <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-1 shadow-2xl animate-pulse">
                    <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-2xl sm:text-3xl font-black text-amber-400">
                      {topThree[0].displayName[0]}
                    </div>
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-white">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>#1 CHAMP</span>
                  </div>
                </div>

                <h4 className="font-black text-sm sm:text-base text-amber-300 truncate max-w-[110px] sm:max-w-[160px]">
                  {topThree[0].displayName}
                </h4>
                <div className="text-[11px] text-amber-200/80 font-bold">
                  {topThree[0].section || 'STEM-A'} • Lvl {topThree[0].level}
                </div>
                <div className="mt-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs sm:text-sm border border-amber-400/40 flex items-center gap-1 shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span>{topThree[0].xp.toLocaleString()} XP</span>
                </div>

                {/* Pedestal Block */}
                <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-900/60 via-amber-800/40 to-amber-700/60 rounded-t-2xl mt-4 border-t-4 border-amber-400 flex flex-col items-center justify-center text-amber-300 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-400/5 animate-pulse" />
                  <span className="text-3xl sm:text-4xl font-black text-amber-300 relative z-10">1</span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 relative z-10">Gold Honor</span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place (Right) */}
            {topThree[2] ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-3">
                  <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-800 p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center text-lg sm:text-2xl font-black text-amber-200">
                      {topThree[2].displayName[0]}
                    </div>
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-black text-[11px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white">
                    <Medal className="w-3 h-3 text-amber-300" />
                    <span>#3</span>
                  </div>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[100px] sm:max-w-[140px]">
                  {topThree[2].displayName}
                </h4>
                <div className="text-[11px] text-slate-400 font-medium">
                  {topThree[2].section || 'STEM-A'}
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-black text-xs border border-slate-700 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-current" />
                  <span>{topThree[2].xp.toLocaleString()} XP</span>
                </div>

                {/* Pedestal Block */}
                <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-slate-900 to-amber-950/60 rounded-t-2xl mt-4 border-t-2 border-amber-600 flex flex-col items-center justify-center text-amber-600 shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-amber-500">3</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Bronze</span>
                </div>
              </motion.div>
            ) : <div />}
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              playPopSound();
              setSelectedSection('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSection === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Cohort ({leaderboard.filter(u => u.role !== 'faculty').length})
          </button>

          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => {
                playPopSound();
                setSelectedSection(sec);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSection === sec
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec} ({leaderboard.filter(u => u.role !== 'faculty' && u.section === sec).length})
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or LRN..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Leaderboard Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-sm">
              Standings Roster ({filteredLeaderboard.length} Students)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Sorted by Total XP
          </span>
        </div>

        {filteredLeaderboard.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No students match this search filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSection('all');
              }}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeaderboard.map((student, index) => {
              const rank = index + 1;
              const isCurrentUser = currentUser?.uid === student.uid;
              const rankTier = getRankByLevel(student.level || 1);
              const progressPercentage = Math.min(100, Math.round(((student.xp || 0) / highestXP) * 100));
              const cheersCount = cheeredUids[student.uid] || 0;

              return (
                <motion.div
                  key={student.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.5, index * 0.03) }}
                  className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isCurrentUser 
                      ? 'bg-indigo-50/70 hover:bg-indigo-50 border-l-4 border-l-indigo-600' 
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left: Rank & Student Profile */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black flex-shrink-0">
                      {rank === 1 ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shadow-xs">
                          <Crown className="w-4 h-4 fill-amber-400 text-amber-600" />
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center shadow-xs">
                          <Medal className="w-4 h-4 text-slate-500" />
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs">
                          <Medal className="w-4 h-4 text-amber-600" />
                        </div>
                      ) : (
                        <span className="text-xs font-black text-slate-400">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* Student Initial Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                      {student.displayName ? student.displayName[0].toUpperCase() : 'S'}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {student.displayName}
                        </h4>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-black uppercase">
                            You
                          </span>
                        )}
                        {student.section && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {student.section}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                        <span className="text-indigo-600 font-bold">
                          Lvl {student.level} • {rankTier.tierName}
                        </span>

                        {student.streak && student.streak > 0 && (
                          <span className="flex items-center gap-0.5 text-orange-600 font-bold">
                            <Flame className="w-3 h-3 fill-orange-500 text-orange-600" />
                            {student.streak}d
                          </span>
                        )}

                        {student.mathAbility && (
                          <span className="hidden md:inline px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">
                            {student.mathAbility}
                          </span>
                        )}

                        {student.badges && student.badges.length > 0 && (
                          <span className="hidden sm:inline text-[11px] text-slate-400">
                            🏆 {student.badges.length} badges
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: XP Bar & Score Counter */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    {/* Relative Progress Bar (Desktop) */}
                    <div className="hidden md:flex flex-col items-end w-32">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 mt-1">
                        {progressPercentage}% of #1
                      </span>
                    </div>

                    {/* Total XP Badge */}
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 shadow-2xs">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs sm:text-sm font-black text-slate-800">
                        {(student.xp || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">
                        XP
                      </span>
                    </div>

                    {/* Cheer Button */}
                    {!isCurrentUser ? (
                      <button
                        onClick={() => handleCheer(student.uid)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                        title="Send a cheer to this classmate!"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[11px]">{cheersCount > 0 ? `+${cheersCount}` : 'Cheer'}</span>
                      </button>
                    ) : (
                      <div className="w-16 text-right text-[11px] font-bold text-indigo-600 hidden sm:block">
                        Your Rank
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
