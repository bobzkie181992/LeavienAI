import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Save, 
  Check, 
  GraduationCap, 
  Award, 
  Sliders, 
  School, 
  User,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  X,
  Star,
  Loader2,
  Database,
  RotateCcw,
  AlertOctagon,
  RefreshCw,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useAcademicTerms } from '../../hooks/useFirebase';
import { getIntegritySettings, saveIntegritySettings } from '../../lib/integritySettings';
import { performDatabaseReset, DatabaseResetType } from '../../lib/databaseReset';

interface TeacherSettingsViewProps {
  profile: UserProfile;
}

export default function TeacherSettingsView({ profile }: TeacherSettingsViewProps) {
  const [teacherName, setTeacherName] = useState(profile.displayName || profile.email?.split('@')[0] || 'Teacher');
  const [schoolName, setSchoolName] = useState('SSHS Senior High School Department');
  const [subject, setSubject] = useState('Grade 11 - General Mathematics');
  const [academicYear, setAcademicYear] = useState('SY 2026-2027');
  const [currentTerm, setCurrentTerm] = useState('Quarter 1');
  const [writtenWorkWeight, setWrittenWorkWeight] = useState(25);
  const [performanceTaskWeight, setPerformanceTaskWeight] = useState(50);
  const [quarterlyExamWeight, setQuarterlyExamWeight] = useState(25);
  const [passingThreshold, setPassingThreshold] = useState(75);
  const [universalDeductionPoints, setUniversalDeductionPoints] = useState<number>(() => getIntegritySettings().violationDeductionPoints);
  const [testViolations, setTestViolations] = useState<number>(2);
  const [testRawScore, setTestRawScore] = useState<number>(10);
  const [isSaved, setIsSaved] = useState(false);

  // Database Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetType, setResetType] = useState<DatabaseResetType>('all');
  const [confirmInput, setConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatusMessage, setResetStatusMessage] = useState<string | null>(null);

  // Dynamic Academic Terms state
  const { terms, loading: termsLoading, saveAcademicTerm, deleteAcademicTerm, setActiveTerm } = useAcademicTerms();
  const [newTermName, setNewTermName] = useState('');
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editingTermName, setEditingTermName] = useState('');
  const [termsError, setTermsError] = useState<string | null>(null);

  // Sync active term
  useEffect(() => {
    const active = terms.find(t => t.active);
    if (active) {
      setCurrentTerm(active.name);
    }
  }, [terms]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveIntegritySettings({ violationDeductionPoints: universalDeductionPoints });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePerformReset = async () => {
    setIsResetting(true);
    setResetStatusMessage(null);

    try {
      const result = await performDatabaseReset(resetType);
      if (result.success) {
        setResetStatusMessage(result.message);
      } else {
        setResetStatusMessage(result.message || 'Database reset encountered an issue.');
      }

      setTimeout(() => {
        setIsResetting(false);
        setIsResetModalOpen(false);
        setConfirmInput('');
        if (resetType === 'all') {
          window.location.reload();
        }
      }, 1800);
    } catch (err) {
      setIsResetting(false);
      setResetStatusMessage('An error occurred during database reset. Please try again.');
    }
  };

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    setTermsError(null);
    if (!newTermName.trim()) return;

    if (terms.some(t => t.name.toLowerCase() === newTermName.trim().toLowerCase())) {
      setTermsError('A term with this name already exists.');
      return;
    }

    try {
      await saveAcademicTerm({
        name: newTermName.trim(),
        active: terms.length === 0 // Active by default if it is the first term
      });
      setNewTermName('');
    } catch (err: any) {
      setTermsError('Failed to add academic term.');
    }
  };

  const handleStartEdit = (termId: string, currentName: string) => {
    setEditingTermId(termId);
    setEditingTermName(currentName);
    setTermsError(null);
  };

  const handleSaveEdit = async (termId: string) => {
    setTermsError(null);
    if (!editingTermName.trim()) return;

    if (terms.some(t => t.id !== termId && t.name.toLowerCase() === editingTermName.trim().toLowerCase())) {
      setTermsError('Another term with this name already exists.');
      return;
    }

    try {
      const existing = terms.find(t => t.id === termId);
      await saveAcademicTerm({
        id: termId,
        name: editingTermName.trim(),
        active: existing?.active || false
      });
      setEditingTermId(null);
    } catch (err) {
      setTermsError('Failed to update academic term.');
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    setTermsError(null);
    if (terms.length <= 1) {
      setTermsError('Cannot delete the last remaining academic term.');
      return;
    }

    if (confirm('Are you sure you want to delete this Academic Quarter or Term? This cannot be undone.')) {
      try {
        await deleteAcademicTerm(termId);
      } catch (err) {
        setTermsError('Failed to delete academic term.');
      }
    }
  };

  const totalWeight = writtenWorkWeight + performanceTaskWeight + quarterlyExamWeight;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-200 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span>Faculty Settings</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Grading Weights & Academic Configuration</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Customize official DepEd grading weights (DepEd D.O. 8, s. 2015), manage active academic quarters/terms, passing thresholds, and faculty profile credentials.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Teacher settings and grading weights updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* 1. DepEd Grading Formula Weights */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">DepEd Order No. 8, s. 2015 Grading Weights</h3>
                <p className="text-xs text-slate-500">Core senior high school mathematics component distribution</p>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                totalWeight === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                Total: {totalWeight}% (Must equal 100%)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Written Work (WW) Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={writtenWorkWeight}
                    onChange={(e) => setWrittenWorkWeight(Number(e.target.value))}
                    min={10}
                    max={60}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Quizzes, formative checks & step problems</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Performance Tasks (PT) Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={performanceTaskWeight}
                    onChange={(e) => setPerformanceTaskWeight(Number(e.target.value))}
                    min={20}
                    max={70}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Pathways, models, real-world case tasks</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  Quarterly Assessment (QA) Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quarterlyExamWeight}
                    onChange={(e) => setQuarterlyExamWeight(Number(e.target.value))}
                    min={10}
                    max={40}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400">Table of Specifications (TOS) exam</p>
              </div>
            </div>
          </div>

          {/* Universal Academic Integrity & Score Violation Deduction Settings */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Universal Academic Integrity Score Violation Deduction Policy
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-extrabold">
                      Universal Setting
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Applies universally to ALL students. Every student's score is automatically deducted based on how many violations they take.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Universal Point Deduction Per Violation (Tab-Out / Focus Loss)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={universalDeductionPoints}
                    onChange={(e) => setUniversalDeductionPoints(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-28 p-3 bg-slate-950 border-2 border-indigo-500/60 rounded-2xl text-white font-black text-center text-2xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-slate-100 block">Deduction Points per Tab Out</span>
                    Deducted automatically from every student's score according to their total violations.
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Preset Rates:</span>
                  {[0.5, 1, 1.5, 2, 3, 5].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setUniversalDeductionPoints(pts)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        universalDeductionPoints === pts
                          ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-400/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      -{pts} pt{pts > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Universal Deduction Rule Matrix & Live Test Simulator */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">
                  Universal Student Deduction Formula & Test Calculator
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Formula: <code className="bg-slate-900 text-emerald-400 px-2 py-0.5 rounded font-mono">Deduction = Student Violations × {universalDeductionPoints} Pts</code>
                </p>

                {/* Interactive Test Calculator */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase block">Simulate Universal Student Score Deduction:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Input Student Score:</label>
                      <input
                        type="number"
                        min="0"
                        value={testRawScore}
                        onChange={(e) => setTestRawScore(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Input Violations Taken:</label>
                      <input
                        type="number"
                        min="0"
                        value={testViolations}
                        onChange={(e) => setTestViolations(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs"
                      />
                    </div>
                  </div>

                  {/* Calculated Result Box */}
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Penalty Deduction:</span>
                      <strong className="text-rose-400 font-black text-sm">-{testViolations * universalDeductionPoints} Points</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Final Adjusted Score:</span>
                      <strong className="text-emerald-400 font-black text-sm">
                        {Math.max(0, testRawScore - (testViolations * universalDeductionPoints))} / {testRawScore}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. School Term & Active Context */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">Academic Term & Passing Benchmark</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  School Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Active Term / Quarter
                </label>
                {termsLoading ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-bold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                    <span>Loading terms...</span>
                  </div>
                ) : (
                  <select
                    value={currentTerm}
                    onChange={(e) => {
                      setCurrentTerm(e.target.value);
                      const targetObj = terms.find(t => t.name === e.target.value);
                      if (targetObj) {
                        setActiveTerm(targetObj.id);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    {terms.map(t => (
                      <option key={t.id} value={t.name}>{t.name} {t.active ? '(Active)' : ''}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Minimum Passing Benchmark
                </label>
                <select
                  value={passingThreshold}
                  onChange={(e) => setPassingThreshold(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <option value={75}>75% (Standard DepEd Passing Threshold)</option>
                  <option value={80}>80% (Advanced STEM Competency Threshold)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Teacher Profile */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">Faculty Credentials & Subject Assignment</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Assigned Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 4. Database Reset & Maintenance Settings */}
          <div className="bg-rose-50/70 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-200/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Database Administration & System Reset</h3>
                  <p className="text-xs text-slate-600">
                    Reset local database records, purge student quiz submissions, or clear academic integrity violation logs.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setResetType('all');
                  setIsResetModalOpen(true);
                }}
                className="p-4 bg-white hover:bg-rose-600 hover:text-white border border-rose-200 rounded-2xl text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 group-hover:text-rose-100">Full System Reset</span>
                  <RotateCcw className="w-4 h-4 text-rose-500 group-hover:text-white transition-colors" />
                </div>
                <div className="font-black text-slate-900 group-hover:text-white text-xs mb-1">Reset All in Database</div>
                <p className="text-[10px] text-slate-500 group-hover:text-rose-100 leading-tight">
                  Wipe all student results, violation logs, custom accounts & restore pristine defaults.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetType('lessons');
                  setIsResetModalOpen(true);
                }}
                className="p-4 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-2xl text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 group-hover:text-emerald-100">Lesson Plans & Progress</span>
                  <BookOpen className="w-4 h-4 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <div className="font-black text-slate-900 group-hover:text-white text-xs mb-1">Reset Lessons & Progress</div>
                <p className="text-[10px] text-slate-500 group-hover:text-emerald-100 leading-tight">
                  Reset custom drafted lesson plans, student step completion, and presentation views.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetType('activities');
                  setIsResetModalOpen(true);
                }}
                className="p-4 bg-white hover:bg-sky-600 hover:text-white border border-sky-200 rounded-2xl text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 group-hover:text-sky-100">Activities & Tasks</span>
                  <Award className="w-4 h-4 text-sky-500 group-hover:text-white transition-colors" />
                </div>
                <div className="font-black text-slate-900 group-hover:text-white text-xs mb-1">Reset Activities & Submissions</div>
                <p className="text-[10px] text-slate-500 group-hover:text-sky-100 leading-tight">
                  Clear student performance task submissions, problem sets, daily challenges & quests.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetType('results');
                  setIsResetModalOpen(true);
                }}
                className="p-4 bg-white hover:bg-amber-600 hover:text-white border border-amber-200 rounded-2xl text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 group-hover:text-amber-100">Assessment Scores</span>
                  <RefreshCw className="w-4 h-4 text-amber-500 group-hover:text-white transition-colors" />
                </div>
                <div className="font-black text-slate-900 group-hover:text-white text-xs mb-1">Clear Assessment Results</div>
                <p className="text-[10px] text-slate-500 group-hover:text-amber-100 leading-tight">
                  Clear all diagnostic and formative quiz attempt scores across all students.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetType('violations');
                  setIsResetModalOpen(true);
                }}
                className="p-4 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-2xl text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 group-hover:text-indigo-100">Integrity Logs</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-500 group-hover:text-white transition-colors" />
                </div>
                <div className="font-black text-slate-900 group-hover:text-white text-xs mb-1">Reset Violation Logs</div>
                <p className="text-[10px] text-slate-500 group-hover:text-indigo-100 leading-tight">
                  Reset tab-out counters and purge Alt-Tab activity log records for all students.
                </p>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Teacher Settings</span>
            </button>
          </div>
        </form>

        {/* Right Sidebar: Dynamic Quarters & Terms CRUD Manager */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-900">Manage Academic Terms</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add, edit, and delete academic quarters or evaluation terms dynamically. Mark a term as active to update the entire school dashboard.
            </p>
          </div>

          {termsError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold">
              {termsError}
            </div>
          )}

          {/* Inline Add Form */}
          <form onSubmit={handleAddTerm} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Quarter 5 or Semester 1"
              value={newTermName}
              onChange={(e) => setNewTermName(e.target.value)}
              maxLength={40}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
            />
            <button
              type="submit"
              disabled={termsLoading || !newTermName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          </form>

          {/* Terms List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {termsLoading ? (
              <div className="text-center py-8 text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Loading terms...</span>
              </div>
            ) : terms.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No academic terms configured. Add one above.
              </div>
            ) : (
              terms.map((t) => {
                const isEditing = editingTermId === t.id;

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      t.active
                        ? 'bg-indigo-50/50 border-indigo-200/80 shadow-xs'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingTermName}
                          onChange={(e) => setEditingTermName(e.target.value)}
                          maxLength={40}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(t.id)}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTermId(null)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-800 truncate">
                              {t.name}
                            </span>
                            {t.active && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-0.5 shrink-0">
                                <Star className="w-2 h-2 fill-current" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Added {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!t.active && (
                            <button
                              type="button"
                              onClick={() => setActiveTerm(t.id)}
                              className="px-2 py-1 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Set Active Term"
                            >
                              Make Active
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(t.id, t.name)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Term Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTerm(t.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Term"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Database Administration & System Reset Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {resetType === 'all' && 'Confirm Reset All in Database'}
                      {resetType === 'lessons' && 'Confirm Reset Lessons & Progress'}
                      {resetType === 'activities' && 'Confirm Reset Activities & Submissions'}
                      {resetType === 'results' && 'Confirm Clear Assessment Results'}
                      {resetType === 'violations' && 'Confirm Reset Violation Logs'}
                    </h3>
                    <p className="text-xs text-rose-600 font-bold">
                      Warning: Irreversible Database Action
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setConfirmInput('');
                    setResetStatusMessage(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                {resetType === 'all' && (
                  <p className="leading-relaxed bg-rose-50 p-3.5 rounded-2xl border border-rose-100 text-rose-950 font-medium">
                    This action will clear all student assessment scores, lesson progress, activity submissions, diagnostic results, formative quiz records, and Alt-Tab violation logs from the database, and restore default accounts.
                  </p>
                )}
                {resetType === 'lessons' && (
                  <p className="leading-relaxed bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-emerald-950 font-medium">
                    This action will reset custom drafted lesson plans, restore standard DepEd Grade 11 ILAW lesson templates, reset student step completion progress, and clear slide presentation views.
                  </p>
                )}
                {resetType === 'activities' && (
                  <p className="leading-relaxed bg-sky-50 p-3.5 rounded-2xl border border-sky-100 text-sky-950 font-medium">
                    This action will purge all student performance task submissions, problem sets, oral recitation recordings, daily challenge records, and math sprint leaderboard entries.
                  </p>
                )}
                {resetType === 'results' && (
                  <p className="leading-relaxed bg-amber-50 p-3.5 rounded-2xl border border-amber-100 text-amber-950 font-medium">
                    This action will purge all student diagnostic and formative assessment score submissions across the roster.
                  </p>
                )}
                {resetType === 'violations' && (
                  <p className="leading-relaxed bg-indigo-50 p-3.5 rounded-2xl border border-indigo-100 text-indigo-950 font-medium">
                    This action will reset student Alt-Tab violation counters to zero and delete focus loss activity logs.
                  </p>
                )}

                <div className="space-y-1.5 pt-2">
                  <label className="block text-[11px] font-black uppercase text-slate-700">
                    Type <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono">RESET</code> to confirm:
                  </label>
                  <input
                    type="text"
                    placeholder="RESET"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-black uppercase text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {resetStatusMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs">
                    {resetStatusMessage}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setConfirmInput('');
                    setResetStatusMessage(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={confirmInput.trim().toUpperCase() !== 'RESET' || isResetting}
                  onClick={handlePerformReset}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting Database...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Execute Reset</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
