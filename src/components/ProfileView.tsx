import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, QuizResult } from '../types';
import { 
  Trophy, 
  Award, 
  Zap, 
  Calendar, 
  Star, 
  Target, 
  Map, 
  RotateCcw, 
  TrendingUp, 
  Edit3, 
  Check, 
  X,
  Sparkles,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Flame,
  CheckCircle2,
  GraduationCap,
  Brain,
  Timer,
  Compass,
  ChevronDown,
  IdCard
} from 'lucide-react';
import { achievements } from '../data/curriculum';

interface ProfileViewProps {
  profile: UserProfile;
  results?: QuizResult[];
  onUpdateDisplayName?: (newName: string) => Promise<void>;
  onUpdateProfileDetails?: (newName: string, grade: string, section: string, lrn?: string) => Promise<void>;
  onRetakeDiagnostic?: () => void;
  onRetakeQuiz?: (quizId: string) => void;
}

const IconMap: Record<string, any> = {
  Award,
  Target,
  Map,
  Zap,
  Star
};

export default function ProfileView({ 
  profile, 
  results = [], 
  onUpdateDisplayName, 
  onUpdateProfileDetails,
  onRetakeDiagnostic,
  onRetakeQuiz 
}: ProfileViewProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.displayName);
  const [gradeInput, setGradeInput] = useState(profile.grade || 'Grade 11');
  const [sectionInput, setSectionInput] = useState(profile.section || 'STEM-A');
  const [lrnInput, setLrnInput] = useState(profile.lrn || '');
  const [savingName, setSavingName] = useState(false);

  // AI Diagnostic report state
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);

  // Categorize assessment history into the 5 target groups
  const quizzesAndExams = results.filter(r => !r.quizId.startsWith('challenge-') && !r.quizId.startsWith('adaptive-') && !r.quizId.startsWith('practice-'));
  const dailyChallenges = results.filter(r => r.quizId.startsWith('challenge-') && r.quizId.includes('challenge'));
  const adaptiveChallenges = results.filter(r => r.quizId.startsWith('adaptive-'));
  const competencyPractices = results.filter(r => r.quizId.startsWith('practice-'));
  const mixedSprints = results.filter(r => r.quizId.startsWith('challenge-') || r.quizId.toLowerCase().includes('sprint'));

  const getStats = (list: QuizResult[]) => {
    const count = list.length;
    const avgScore = count > 0 
      ? Math.round(list.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / count)
      : 0;
    return { count, avgScore };
  };

  const quizStats = getStats(quizzesAndExams);
  const dailyStats = getStats(dailyChallenges);
  const adaptiveStats = getStats(adaptiveChallenges);
  const competencyStats = getStats(competencyPractices);
  const sprintStats = getStats(mixedSprints);

  const generateAIDiagnosis = async () => {
    setIsLoadingDiagnosis(true);
    setDiagnosisError(null);
    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scores: {
            quizzesAndExams: quizStats,
            dailyChallenge: dailyStats,
            adaptiveChallenge: adaptiveStats,
            competencyPractice: competencyStats,
            mixedSprint: sprintStats
          },
          competencyScores: profile.competencyScores || {}
        })
      });
      const data = await response.json();
      if (data.success && data.diagnosis) {
        setAiDiagnosis(data.diagnosis);
      } else {
        throw new Error(data.error || 'Failed to generate diagnosis');
      }
    } catch (err: any) {
      console.error(err);
      setDiagnosisError(err?.message || 'Failed to generate AI math diagnosis. Please try again.');
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      if (onUpdateProfileDetails) {
        await onUpdateProfileDetails(nameInput.trim(), gradeInput.trim(), sectionInput.trim(), lrnInput.trim());
      } else if (onUpdateDisplayName) {
        await onUpdateDisplayName(nameInput.trim());
      }
      setIsEditingName(false);
    } catch (e) {
      console.error("Failed to save profile details:", e);
    } finally {
      setSavingName(false);
    }
  };

  // XP Progress to next level: Each level is (level * 200) XP
  const xpForCurrentLevel = (profile.level - 1) * 200;
  const xpForNextLevel = profile.level * 200;
  const levelProgress = Math.min(100, Math.max(0, 
    Math.round(((profile.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel || 200)) * 100)
  ));

  // Compute stats from results
  const totalCompleted = results.length;
  const averageScore = totalCompleted > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / totalCompleted)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 max-w-4xl mx-auto"
    >
      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-100 shrink-0">
          {profile.displayName ? profile.displayName[0].toUpperCase() : 'S'}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
            {!isEditingName ? (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{profile.displayName}</h2>
                {(onUpdateDisplayName || onUpdateProfileDetails) && (
                  <button
                    onClick={() => { 
                      setIsEditingName(true); 
                      setNameInput(profile.displayName); 
                      setGradeInput(profile.grade || 'Grade 11');
                      setSectionInput(profile.section || 'STEM-A');
                      setLrnInput(profile.lrn || '');
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full max-w-md bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Edit Student Profile</div>
                <div className="text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Learner Reference Number (LRN)</label>
                  <input
                    type="text"
                    maxLength={12}
                    value={lrnInput}
                    onChange={(e) => setLrnInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="12-digit LRN (e.g. 109283741001)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Grade Level</label>
                    <select
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                      <option value="Grade 10">Grade 10</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Section</label>
                    <input
                      type="text"
                      value={sectionInput}
                      onChange={(e) => setSectionInput(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. STEM-A"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['STEM-A', 'STEM-B', 'ABM-A', 'HUMSS-A', 'GAS-A', 'TVL-A'].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSectionInput(sec)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                            sectionInput === sec
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-left">
                  🎓 As a student, only you can choose what section and grade you belong to.
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingName}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            )}
            
            {!isEditingName && (
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full capitalize">
                {profile.role || 'Student'}
              </span>
            )}
          </div>

          {!isEditingName && (
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-4">
              <p className="text-slate-500 text-sm">{profile.email}</p>
              <span className="text-xs text-slate-300 sm:inline hidden">•</span>
              <span className="bg-slate-100 text-slate-800 text-[11px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{profile.grade || 'Grade 11'}</span>
              </span>
              <span className="bg-slate-100 text-slate-800 text-[11px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Section: {profile.section || 'STEM-A'}</span>
              </span>
              <span className="bg-indigo-50 text-indigo-800 text-[11px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-indigo-100 font-mono">
                <IdCard className="w-3.5 h-3.5 text-indigo-600" />
                <span>LRN: {profile.lrn || 'Not assigned'}</span>
              </span>
            </div>
          )}

          {/* Level Progress Bar */}
          <div className="max-w-md">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-indigo-600 font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Level {profile.level}
              </span>
              <span className="text-slate-400">
                {profile.xp} / {xpForNextLevel} XP ({levelProgress}%)
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stat Pill */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          <div className="bg-indigo-50/70 border border-indigo-100 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-lg font-black text-indigo-700">{profile.xp}</div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Total XP</div>
          </div>
          <div className="bg-amber-50/70 border border-amber-100 px-4 py-2.5 rounded-2xl text-center">
            <div className="text-lg font-black text-amber-700">{profile.streak} Days</div>
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Streak</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AI MATH DIAGNOSIS & ACTIVITY PERFORMANCE MATRIX                             */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-sm border border-slate-100 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>AI Cognitive Diagnosis Center</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Multi-dimensional evaluation of your mathematical agility across all activity vectors
              </p>
            </div>
          </div>

          <button
            onClick={generateAIDiagnosis}
            disabled={isLoadingDiagnosis}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isLoadingDiagnosis ? 'animate-spin' : ''}`} />
            <span>{isLoadingDiagnosis ? 'Formulating Diagnosis...' : 'Generate AI Cognitive Diagnosis'}</span>
          </button>
        </div>

        {/* The 5 Assessment Categories Performance Matrix */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Assessment Activity Performance Matrix
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Quiz and Exams */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                  Exams
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Quizzes & Exams</span>
                <span className="text-2xl font-black text-slate-800 block">
                  {quizStats.count > 0 ? `${quizStats.avgScore}%` : 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {quizStats.count} attempt{quizStats.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* 2. Daily Challenge */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full">
                  Daily
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Daily Challenge</span>
                <span className="text-2xl font-black text-slate-800 block">
                  {dailyStats.count > 0 ? `${dailyStats.avgScore}%` : 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {dailyStats.count} challenge{dailyStats.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* 3. Adaptive Challenge */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                  Adaptive
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Adaptive Challenge</span>
                <span className="text-2xl font-black text-slate-800 block">
                  {adaptiveStats.count > 0 ? `${adaptiveStats.avgScore}%` : 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {adaptiveStats.count} attempt{adaptiveStats.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* 4. Core Competency Practice */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                  <Map className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full">
                  Nodes
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Competency Practice</span>
                <span className="text-2xl font-black text-slate-800 block">
                  {competencyStats.count > 0 ? `${competencyStats.avgScore}%` : 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {competencyStats.count} node{competencyStats.count !== 1 ? 's' : ''} completed
                </span>
              </div>
            </div>

            {/* 5. Mixed Math Sprint */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                  <Timer className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full">
                  Sprint
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Mixed Math Sprint</span>
                <span className="text-2xl font-black text-slate-800 block">
                  {sprintStats.count > 0 ? `${sprintStats.avgScore}%` : 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {sprintStats.count} sprint{sprintStats.count !== 1 ? 's' : ''} completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Diagnostics Report Box */}
        <AnimatePresence mode="wait">
          {isLoadingDiagnosis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl flex flex-col items-center text-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <h4 className="font-bold text-indigo-900 text-sm">Formulating Mathematical Cognitive Diagnostics...</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Gemini AI is currently aggregating your assessment history across exams, sprints, and adaptive challenges to trace your active cognitive milestones.
              </p>
            </motion.div>
          )}

          {diagnosisError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-center justify-between"
            >
              <span>{diagnosisError}</span>
              <button 
                onClick={generateAIDiagnosis}
                className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}

          {aiDiagnosis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-50/70 border border-slate-100 rounded-3xl p-5 sm:p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">AI Core Cognitive Report</h4>
              </div>

              {/* Overall Assessment */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                  Overall Cognitive Evaluation
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {aiDiagnosis.overallAssessment}
                </p>
              </div>

              {/* Strengths & Remediations Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                    Mathematical Strengths
                  </span>
                  <div className="space-y-2">
                    {aiDiagnosis.strengths?.map((str: string, i: number) => (
                      <div key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-medium">
                        {str}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                    Target Remediations & Misconceptions
                  </span>
                  <div className="space-y-2">
                    {aiDiagnosis.remediations?.map((rem: string, i: number) => (
                      <div key={i} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-800 font-medium">
                        {rem}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Five Activities Detailed Diagnosis */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                  Module-Specific Diagnosis Breakdown
                </span>
                <div className="space-y-2">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-slate-900 block mb-0.5">1. Quizzes & Exams</span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {aiDiagnosis.activityDiagnosis?.quizzesAndExams}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-slate-900 block mb-0.5">2. Daily Challenges</span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {aiDiagnosis.activityDiagnosis?.dailyChallenge}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-slate-900 block mb-0.5">3. Adaptive Math Challenges</span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {aiDiagnosis.activityDiagnosis?.adaptiveChallenge}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-slate-900 block mb-0.5">4. Core Competency Practice</span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {aiDiagnosis.activityDiagnosis?.competencyPractice}
                    </p>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-slate-900 block mb-0.5">5. Mixed Math Sprints</span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {aiDiagnosis.activityDiagnosis?.mixedSprint}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                  Recommended Learning Vector Action Plan
                </span>
                <ul className="space-y-2">
                  {aiDiagnosis.actionPlan?.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Diagnostic Assessment Section */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Diagnostic Assessment Status</h3>
              <p className="text-xs text-slate-500">Baseline evaluation of Grade 11 Mathematics competencies</p>
            </div>
          </div>

          {onRetakeDiagnostic && (
            <button
              onClick={onRetakeDiagnostic}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors self-start sm:self-auto border border-indigo-200/60"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Diagnostic</span>
            </button>
          )}
        </div>

        {profile.diagnosticCompleted ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Estimated Math Ability
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-black ${
                    profile.mathAbility === 'Expert' ? 'text-violet-600' :
                    profile.mathAbility === 'Advanced' ? 'text-emerald-600' :
                    profile.mathAbility === 'Proficient' ? 'text-indigo-600' :
                    profile.mathAbility === 'Developing' ? 'text-amber-600' :
                    'text-rose-600'
                  }`}>
                    {profile.mathAbility || 'Proficient'}
                  </span>
                  <span className="text-xs text-slate-400">• Evaluated Baseline</span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                You can retake this diagnostic anytime to recalibrate your personalized learning pathway.
              </div>
            </div>

            {/* Competency Scores */}
            {profile.competencyScores && Object.keys(profile.competencyScores).length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Competency Baseline Scores
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(profile.competencyScores).map(([compName, score]) => (
                    <div key={compName} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate mr-2">{compName}</span>
                      <span className="font-black text-indigo-600 shrink-0">{score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
            <p className="text-sm text-slate-600 mb-4">
              You haven't completed the diagnostic assessment yet. Take it now to discover your baseline ability and generate a custom learning pathway!
            </p>
            {onRetakeDiagnostic && (
              <button
                onClick={onRetakeDiagnostic}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100"
              >
                Take Diagnostic Assessment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Completed Activities & Scores Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Completed Assessments</h3>
              <p className="text-xs text-slate-500">History of your quiz submissions and scores</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-slate-900">{totalCompleted}</span>
            <span className="text-xs text-slate-400 block">Total Completed</span>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.slice(-6).reverse().map((result, index) => {
              const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
              const isMastered = pct >= 80;

              return (
                <div 
                  key={result.id || index}
                  className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{result.quizId}</span>
                      {result.attemptNumber && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded">
                          Attempt #{result.attemptNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      Completed on {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-base font-black ${isMastered ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {result.score}/{result.total} ({pct}%)
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isMastered ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {isMastered ? 'Mastered' : 'Completed'}
                      </span>
                    </div>

                    {onRetakeQuiz && (
                      <button
                        onClick={() => onRetakeQuiz(result.quizId)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors border border-indigo-200 text-xs font-bold flex items-center gap-1.5"
                        title="Retake Quiz"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
            No completed quizzes yet. Start with a recommended activity or competency practice on your dashboard!
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-600" />
          <span>Achievements & Badges</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const isUnlocked = profile.badges.includes(achievement.id);
            const IconComponent = IconMap[achievement.icon] || Star;

            return (
              <div 
                key={achievement.id}
                className={`bg-white p-4 sm:p-5 rounded-3xl border flex items-center gap-4 transition-all ${
                  isUnlocked ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isUnlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm ${isUnlocked ? 'text-slate-900' : 'text-slate-400'}`}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{achievement.description}</p>
                </div>
                {isUnlocked ? (
                  <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                ) : (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    Locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
