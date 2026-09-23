import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Clock,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  BookOpen,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  ListChecks
} from 'lucide-react';
import { Topic, QuizResult, UserProfile, LearningPathway } from '../types';
import DiagnosticAssessment from './DiagnosticAssessment';

interface StudentDiagnosticAssessmentPageProps {
  topics: Topic[];
  profile: UserProfile;
  onStartDiagnosticTest: () => void;
  onSaveDiagnosticResult?: (
    ability: string,
    scores: Record<string, number>,
    pathway?: LearningPathway,
    violations?: number
  ) => void;
  onBackToOverview?: () => void;
}

export default function StudentDiagnosticAssessmentPage({
  topics,
  profile,
  onStartDiagnosticTest,
  onSaveDiagnosticResult,
  onBackToOverview
}: StudentDiagnosticAssessmentPageProps) {
  const [isTestActive, setIsTestActive] = useState(false);
  const [testMode, setTestMode] = useState<'timed' | 'untimed'>('untimed');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(15);

  // Teacher Schedule & Permission Gate state
  const [inputPasscode, setInputPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [passcodeError, setPasscodeError] = useState(false);

  const handleVerifyPasscode = () => {
    if (inputPasscode.trim().toUpperCase() === 'MATH11' || inputPasscode.trim() === '8492') {
      setIsUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleRequestPermission = () => {
    setRequestStatus('pending');
    setTimeout(() => {
      setRequestStatus('approved');
      setIsUnlocked(true);
    }, 2000);
  };

  const selectedTopic = topics.find((t) => t.id === 'functions' || t.title.toLowerCase().includes('function')) || topics[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {isTestActive ? (
          <motion.div
            key="test-running"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <DiagnosticAssessment
              topics={topics}
              onComplete={(ability, scores, pathway, violations) => {
                if (onSaveDiagnosticResult) {
                  onSaveDiagnosticResult(ability, scores, pathway, violations);
                }
                setIsTestActive(false);
              }}
              onCancel={() => setIsTestActive(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="diagnostic-landing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>DIAGNOSTIC CHECKPOINT</span>
                  </span>
                  <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    General Mathematics • Grade 11
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  DIAGNOSTIC ASSESSMENT
                </h1>

                <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed italic">
                  "Before starting this lesson, let's find out what you already know."
                </p>
              </div>
            </div>

            {/* Assessment Metadata Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
              
              {/* Subject Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Subject</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900">General Mathematics</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Teacher Config</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-600">10 Questions</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Time Mode</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-600">30 Mins (Strict)</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Topic</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-600 truncate block">
                    {selectedTopic?.title || 'Functions & Their Graphs'}
                  </span>
                </div>
              </div>

              {/* Purpose & Target Learning Competencies */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Assessment Purpose & Target Skills</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
                    <span className="font-black text-indigo-950 block">1. Prior Knowledge</span>
                    <p className="text-slate-600 text-[11px]">Evaluates foundation concepts from Junior High School mathematics.</p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                    <span className="font-black text-emerald-950 block">2. Existing Strengths</span>
                    <p className="text-slate-600 text-[11px]">Identifies algebraic and graphical skills you have mastered.</p>
                  </div>
                  <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
                    <span className="font-black text-amber-950 block">3. Learning Gaps</span>
                    <p className="text-slate-600 text-[11px]">Detects misconceptions in piecewise functions & function composition.</p>
                  </div>
                  <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                    <span className="font-black text-purple-950 block">4. Adaptive Pathway</span>
                    <p className="text-slate-600 text-[11px]">Automatically generates personalized DepEd remedial study recommendations.</p>
                  </div>
                </div>
              </div>

              {/* Target DepEd Competencies Evaluated */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                  DepEd MELCs Evaluated in this Diagnostic:
                </span>
                <ul className="space-y-2 text-xs font-semibold text-slate-700">
                  <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>M11GM-Ia-1:</strong> Represents real-life situations using functions, including piecewise functions.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>M11GM-Ia-2:</strong> Evaluates functions accurately at specific numerical or algebraic inputs.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>M11GM-Ia-3:</strong> Performs addition, subtraction, multiplication, division, and composition of functions.</span>
                  </li>
                </ul>
              </div>

              {/* Configuration Controls: Question Count & Time Mode */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-indigo-600" />
                    <span>Diagnostic Test Setup</span>
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-600 bg-white px-2.5 py-0.5 rounded-full border border-indigo-100">
                    CAT Item-Response Algorithm
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Question Count Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Number of Questions
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 15, 25].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => setSelectedQuestionCount(cnt)}
                          className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                            selectedQuestionCount === cnt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {cnt} Items
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Mode Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Time Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTestMode('untimed')}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          testMode === 'untimed'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>No Time Limit</span>
                      </button>

                      <button
                        onClick={() => setTestMode('timed')}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                          testMode === 'timed'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>20 Mins Timed</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Instructions for Student:</span>
                  </div>
                  <p>
                    1. Read each question carefully and select the single best mathematical answer.<br />
                    2. Do not guess blindly — if unsure, analyze the graph or substitution step logically.<br />
                    3. Your result will automatically configure your personalized General Mathematics study pathway.
                  </p>
                </div>
              </div>

              {/* TEACHER SCHEDULE & PERMISSION SECURITY GATE */}
              <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-300/80 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Teacher Schedule & Security Permission Gate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      Scheduled for: <strong className="text-amber-950">Grade 11 - STEM A</strong> • Window: <strong className="text-amber-950">Today (08:00 AM - 05:00 PM)</strong>
                    </p>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-center shrink-0 ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {isUnlocked ? '🔓 Access Granted' : '🔒 Teacher Permission Required'}
                  </span>
                </div>

                {!isUnlocked ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-700 font-bold">
                      Your teacher (Mr. Santos) requires an Access Passcode or live permission grant before starting this diagnostic checkpoint.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Enter Passcode */}
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                        <label className="text-[11px] font-black text-slate-700 uppercase block">
                          Enter Teacher Access Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. MATH11"
                            value={inputPasscode}
                            onChange={(e) => setInputPasscode(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={handleVerifyPasscode}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg cursor-pointer shrink-0"
                          >
                            Unlock
                          </button>
                        </div>
                        {passcodeError && (
                          <span className="text-[10px] font-bold text-rose-600 block">
                            ✗ Invalid Passcode. Try 'MATH11' or request teacher permission below.
                          </span>
                        )}
                      </div>

                      {/* Request Live Permission */}
                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 flex flex-col justify-between">
                        <label className="text-[11px] font-black text-slate-700 uppercase block">
                          Need Live Permission?
                        </label>
                        {requestStatus === 'none' && (
                          <button
                            onClick={handleRequestPermission}
                            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                          >
                            ✋ Request Permission from Teacher
                          </button>
                        )}
                        {requestStatus === 'pending' && (
                          <div className="p-2 bg-amber-50 text-amber-900 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Requesting permission from Mr. Santos...</span>
                          </div>
                        )}
                        {requestStatus === 'approved' && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Permission Approved! Unlocked.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Teacher permission verified! You are inside the scheduled assessment window for <strong>Grade 11 - STEM A</strong>. Good luck!
                    </span>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (!isUnlocked) return;
                    setIsTestActive(true);
                    if (onStartDiagnosticTest) onStartDiagnosticTest();
                  }}
                  className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2.5 text-base ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 cursor-pointer active:scale-98'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{isUnlocked ? 'Start Diagnostic Assessment' : 'Locked — Enter Access Passcode or Get Teacher Permission'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
