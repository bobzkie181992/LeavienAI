import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Flame, 
  Zap, 
  Award, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  FileText, 
  ArrowUpDown, 
  GraduationCap, 
  TrendingUp, 
  ChevronRight, 
  Sparkles, 
  Mic, 
  CheckCircle2, 
  UserPlus, 
  BarChart3,
  Users
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { UserProfile, QuizResult } from '../types';
import { achievements } from '../data/curriculum';

interface FacultyRankingsViewProps {
  students: UserProfile[];
  loading?: boolean;
  onOpenAddReport?: (student?: UserProfile) => void;
  onOpenStudentResults?: (student: UserProfile) => void;
  onOpenAwardRecitation?: (student: UserProfile) => void;
}

type SortCriteria = 'xp' | 'level' | 'streak' | 'recitations' | 'diagnostic' | 'name';

export default function FacultyRankingsView({
  students,
  loading = false,
  onOpenAddReport,
  onOpenStudentResults,
  onOpenAwardRecitation
}: FacultyRankingsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortCriteria>('xp');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<UserProfile | null>(null);

  // Filter students based on search and dropdowns
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.lrn && s.lrn.includes(searchTerm)) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGrade = gradeFilter === 'All' || (s.grade || 'Grade 11') === gradeFilter;
    const matchesSection = sectionFilter === 'All' || (s.section || 'STEM-A') === sectionFilter;
    return matchesSearch && matchesGrade && matchesSection;
  });

  // Sort students according to selected criteria
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'xp') {
      diff = (b.xp || 0) - (a.xp || 0);
    } else if (sortBy === 'level') {
      diff = (b.level || 1) - (a.level || 1);
    } else if (sortBy === 'streak') {
      diff = (b.streak || 0) - (a.streak || 0);
    } else if (sortBy === 'recitations') {
      diff = (b.oralRecitationPoints || 0) - (a.oralRecitationPoints || 0);
    } else if (sortBy === 'diagnostic') {
      const getDiagScore = (u: UserProfile) => {
        if (!u.diagnosticScores) return 0;
        return Object.values(u.diagnosticScores).reduce((sum, v) => sum + v, 0);
      };
      diff = getDiagScore(b) - getDiagScore(a);
    } else if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.displayName.localeCompare(b.displayName)
        : b.displayName.localeCompare(a.displayName);
    }
    return sortDirection === 'desc' ? diff : -diff;
  });

  // Calculate cohort statistics
  const totalRanked = sortedStudents.length;
  const topScorer = sortedStudents[0];
  const avgXP = totalRanked > 0 
    ? Math.round(sortedStudents.reduce((acc, s) => acc + (s.xp || 0), 0) / totalRanked) 
    : 0;
  const maxStreak = totalRanked > 0 
    ? Math.max(...sortedStudents.map(s => s.streak || 0)) 
    : 0;
  const totalRecitationPoints = sortedStudents.reduce((acc, s) => acc + (s.oralRecitationPoints || 0), 0);

  // Top 3 for podium
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  const handleExportRankingsCSV = () => {
    if (sortedStudents.length === 0) return;
    const headers = [
      'Rank',
      'Student Name',
      'LRN',
      'Grade',
      'Section',
      'XP',
      'Level',
      'Day Streak',
      'Oral Recitation Points',
      'Diagnostic Ability',
      'Badges Count',
      'Last Active'
    ];

    const rows = sortedStudents.map((s, idx) => [
      idx + 1,
      `"${s.displayName.replace(/"/g, '""')}"`,
      s.lrn || 'N/A',
      s.grade || 'Grade 11',
      s.section || 'STEM-A',
      s.xp || 0,
      s.level || 1,
      s.streak || 0,
      s.oralRecitationPoints || 0,
      s.diagnosticAbility || s.mathAbility || 'Unassessed',
      (s.badges || []).length,
      s.lastActive || 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_rankings_${gradeFilter}_${sectionFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintRankings = () => {
    window.print();
  };

  const toggleSort = (criterion: SortCriteria) => {
    if (sortBy === criterion) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(criterion);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Academic Leaderboard & Student Rankings
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Performance Standings
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Real-time student rankings across Grade 11 Mathematics cohorts. Evaluate leaderboard positions, oral recitation standings, and academic velocity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="export-rankings-csv-btn"
              onClick={handleExportRankingsCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-sm border border-white/10 flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Roster (CSV)
            </button>
            <button
              id="print-rankings-btn"
              onClick={handlePrintRankings}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print Rankings Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Performer</div>
            <div className="text-base font-black text-slate-900 truncate">
              {topScorer ? topScorer.displayName : '—'}
            </div>
            <div className="text-xs text-amber-600 font-semibold">
              {topScorer ? `${topScorer.xp.toLocaleString()} XP` : '0 XP'}
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Average XP</div>
            <div className="text-xl font-black text-slate-900">
              {avgXP.toLocaleString()}
            </div>
            <div className="text-xs text-indigo-600 font-semibold">
              Across {totalRanked} students
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest Streak</div>
            <div className="text-xl font-black text-slate-900">
              {maxStreak} <span className="text-xs font-medium text-slate-400">days</span>
            </div>
            <div className="text-xs text-rose-600 font-semibold">
              Consistent practice
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recitation Points</div>
            <div className="text-xl font-black text-slate-900">
              +{totalRecitationPoints} <span className="text-xs font-medium text-slate-400">pts</span>
            </div>
            <div className="text-xs text-emerald-600 font-semibold">
              Oral participation total
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Only when sorted by XP and >= 3 students exist) */}
      {sortBy === 'xp' && sortedStudents.length >= 3 && (
        <div className="bg-gradient-to-b from-indigo-50/70 to-slate-50 border border-indigo-100/80 rounded-3xl p-6 sm:p-8 print:hidden">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
              Honor Roll • Top 3 Podium
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto">
            {/* 2nd Place */}
            {top2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="order-2 md:order-1 bg-white p-5 rounded-2xl border-2 border-slate-200 text-center shadow-sm relative pt-8"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow">
                  2
                </div>
                <div className="w-14 h-14 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center font-black text-slate-600 text-lg border-2 border-slate-200">
                  {top2.displayName[0]}
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{top2.displayName}</h4>
                <p className="text-xs text-slate-500 mb-2">{top2.section || 'STEM-A'}</p>
                <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-slate-700 font-black text-xs">
                  {top2.xp.toLocaleString()} XP
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-[10px] text-slate-500 font-semibold">Lvl {top2.level}</span>
                  <span className="text-[10px] text-orange-600 font-semibold flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-current" /> {top2.streak}d
                  </span>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {top1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white p-6 rounded-3xl border-2 border-amber-300 text-center shadow-md relative pt-10 pb-7 -mt-2"
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center font-black text-base border-2 border-white shadow-lg ring-4 ring-amber-100">
                  <Crown className="w-5 h-5 text-amber-950 fill-current" />
                </div>
                <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-3 flex items-center justify-center font-black text-amber-800 text-xl border-2 border-amber-300 shadow-inner">
                  {top1.displayName[0]}
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                  1st Place Leader
                </div>
                <h4 className="font-black text-slate-900 text-base truncate">{top1.displayName}</h4>
                <p className="text-xs text-slate-500 mb-2">{top1.grade || 'Grade 11'} • {top1.section || 'STEM-A'}</p>
                <div className="inline-block px-4 py-1.5 bg-amber-400 text-amber-950 rounded-full font-black text-sm shadow-sm">
                  {top1.xp.toLocaleString()} XP
                </div>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className="text-xs font-bold text-amber-900">Level {top1.level}</span>
                  <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" /> {top1.streak} Days
                  </span>
                  {top1.oralRecitationPoints ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5">
                      <Mic className="w-3 h-3" /> +{top1.oralRecitationPoints}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="order-3 bg-white p-5 rounded-2xl border-2 border-amber-100 text-center shadow-sm relative pt-8"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow">
                  3
                </div>
                <div className="w-14 h-14 bg-amber-50 rounded-full mx-auto mb-3 flex items-center justify-center font-black text-amber-700 text-lg border-2 border-amber-200">
                  {top3.displayName[0]}
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{top3.displayName}</h4>
                <p className="text-xs text-slate-500 mb-2">{top3.section || 'STEM-A'}</p>
                <div className="inline-block px-3 py-1 bg-amber-50 rounded-full text-amber-800 font-black text-xs border border-amber-200/60">
                  {top3.xp.toLocaleString()} XP
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-[10px] text-slate-500 font-semibold">Lvl {top3.level}</span>
                  <span className="text-[10px] text-orange-600 font-semibold flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-current" /> {top3.streak}d
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Main Ranking Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search ranked student by name or LRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Action: Add Report */}
            {onOpenAddReport && (
              <button
                onClick={() => onOpenAddReport()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm shrink-0"
              >
                <FileText className="w-4 h-4" />
                Create Teacher Report
              </button>
            )}
          </div>

          {/* Filters and Sorters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filters:
              </span>
              
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Grades</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Sections</option>
                <option value="STEM-A">STEM-A</option>
                <option value="STEM-B">STEM-B</option>
                <option value="ABM-1">ABM-1</option>
                <option value="HUMSS-1">HUMSS-1</option>
              </select>

              {(gradeFilter !== 'All' || sectionFilter !== 'All' || searchTerm) && (
                <button
                  onClick={() => { setGradeFilter('All'); setSectionFilter('All'); setSearchTerm(''); }}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Sort Dropdown & Toggles */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> Sort:
              </span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => toggleSort('xp')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'xp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  XP
                </button>
                <button
                  onClick={() => toggleSort('level')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'level' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Level
                </button>
                <button
                  onClick={() => toggleSort('streak')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'streak' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Streak
                </button>
                <button
                  onClick={() => toggleSort('recitations')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    sortBy === 'recitations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Recitations
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Header */}
        <div className="hidden print:block p-6 border-b border-slate-200 text-center">
          <h2 className="text-xl font-black text-slate-900">Leavien AI Grade 11 — Official Student Rankings</h2>
          <p className="text-xs text-slate-600">
            Cohort: {gradeFilter} | Section: {sectionFilter} | Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Rankings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/60">
                <th className="px-6 py-4 w-16 text-center">Rank</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Section & LRN</th>
                <th className="px-6 py-4 text-center">Level & Mastery</th>
                <th className="px-6 py-4 text-right">Total XP</th>
                <th className="px-6 py-4 text-center">Streak</th>
                <th className="px-6 py-4 text-center">Oral Pts</th>
                <th className="px-6 py-4 text-right print:hidden">Faculty Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map((student, index) => {
                const rank = index + 1;
                const isTop1 = rank === 1;
                const isTop2 = rank === 2;
                const isTop3 = rank === 3;
                const isTop10 = rank <= 10;
                
                // Percentile calculation
                const percentile = totalRanked > 1 
                  ? Math.round(((totalRanked - rank) / (totalRanked - 1)) * 100) 
                  : 100;

                return (
                  <tr 
                    key={student.uid} 
                    className={`hover:bg-indigo-50/30 transition-colors group ${
                      isTop1 ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {isTop1 ? (
                          <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-xs shadow-sm ring-2 ring-amber-200">
                            <Crown className="w-4 h-4 fill-current" />
                          </div>
                        ) : isTop2 ? (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs shadow-sm">
                            2
                          </div>
                        ) : isTop3 ? (
                          <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs shadow-sm">
                            3
                          </div>
                        ) : (
                          <div className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs ${
                            isTop10 ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500'
                          }`}>
                            #{rank}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isTop1 
                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {student.displayName[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                            <span className="truncate">{student.displayName}</span>
                            {isTop1 && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase">
                                Top 1
                              </span>
                            )}
                            {percentile >= 90 && !isTop1 && (
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                                Top {100 - percentile}%
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {student.email || 'No email registered'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Section & LRN */}
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-slate-700">
                        {student.grade || 'Grade 11'} — <span className="text-indigo-600 font-bold">{student.section || 'STEM-A'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        LRN: {student.lrn || 'Not assigned'}
                      </div>
                    </td>

                    {/* Level & Ability */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        Level {student.level}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-medium">
                        {student.mathAbility || student.diagnosticAbility || 'Active Learner'}
                      </div>
                    </td>

                    {/* Total XP */}
                    <td className="px-6 py-4 text-right">
                      <div className="text-base font-black text-slate-900">
                        {student.xp.toLocaleString()} <span className="text-xs text-indigo-600">XP</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {(student.badges || []).length} badges unlocked
                      </div>
                    </td>

                    {/* Day Streak */}
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        student.streak >= 7 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                          : student.streak > 0 
                            ? 'bg-slate-100 text-slate-700' 
                            : 'text-slate-400'
                      }`}>
                        <Flame className={`w-3.5 h-3.5 ${student.streak > 0 ? 'fill-current text-orange-500' : ''}`} />
                        {student.streak}d
                      </div>
                    </td>

                    {/* Oral Points */}
                    <td className="px-6 py-4 text-center">
                      {student.oralRecitationPoints ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
                          <Mic className="w-3 h-3 text-emerald-600" />
                          +{student.oralRecitationPoints}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Quick Faculty Actions */}
                    <td className="px-6 py-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        {onOpenAddReport && (
                          <button
                            onClick={() => onOpenAddReport(student)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all"
                            title="Add/Generate Teacher Report for this student"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {onOpenStudentResults && (
                          <button
                            onClick={() => onOpenStudentResults(student)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                            title="View Quiz and Assessment History"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        )}
                        {onOpenAwardRecitation && (
                          <button
                            onClick={() => onOpenAwardRecitation(student)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all"
                            title="Award Oral Recitation Points"
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
                    <p className="font-semibold text-slate-600">No student rankings match your filter.</p>
                    <p className="text-xs mt-1">Try selecting a different grade, section, or clear your search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
