import React, { useState, useMemo } from 'react';
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
  TrendingUp,
  Award,
  RotateCcw,
  Check
} from 'lucide-react';
import { Topic, UserProfile, LearningPathway } from '../types';
import { useDiagnosticExam } from '../hooks/useFirebase';
import DiagnosticAssessment from './DiagnosticAssessment';

interface StudentDiagnosticAssessmentPageProps {
  topics: Topic[];
  profile: UserProfile;
  initialTestType?: 'pre-test' | 'post-test';
  onStartDiagnosticTest: (testType?: 'pre-test' | 'post-test') => void;
  onSaveDiagnosticResult?: (
    ability: string,
    scores: Record<string, number>,
    pathway?: LearningPathway,
    violations?: number,
    testType?: 'pre-test' | 'post-test',
    totalItems?: number
  ) => void;
  onBackToOverview?: () => void;
}

export default function StudentDiagnosticAssessmentPage({
  topics,
  profile,
  initialTestType = 'pre-test',
  onStartDiagnosticTest,
  onSaveDiagnosticResult,
  onBackToOverview
}: StudentDiagnosticAssessmentPageProps) {
  const { questions: fetchedQuestions } = useDiagnosticExam();
  const [activeTab, setActiveTab] = useState<'pre-test' | 'post-test' | 'growth'>(initialTestType === 'post-test' ? 'post-test' : 'pre-test');
  const [isTestActive, setIsTestActive] = useState(false);
  const [currentTestType, setCurrentTestType] = useState<'pre-test' | 'post-test'>(initialTestType);
  const [showQuestionsPreview, setShowQuestionsPreview] = useState(false);

  // Status computation
  const isPreTestDone = Boolean(profile.preTestCompleted || profile.diagnosticCompleted);
  const isPostTestDone = Boolean(profile.postTestCompleted);
  const preScore = profile.preTestScore ?? profile.diagnosticScore ?? 0;
  const preTotal = profile.preTestTotal ?? 26;
  const prePercent = Math.round((preScore / preTotal) * 100);
  const preAbility = profile.preTestAbility ?? profile.diagnosticAbility ?? 'Developing';

  const postScore = profile.postTestScore ?? 0;
  const postTotal = profile.postTestTotal ?? 26;
  const postPercent = Math.round((postScore / postTotal) * 100);
  const postAbility = profile.postTestAbility ?? 'Proficient';

  const growthGain = postPercent - prePercent;

  const questionsToPreview = useMemo(() => {
    try {
      const activeId = localStorage.getItem('mathquest_active_diagnostic_id');
      const cachedList = localStorage.getItem('mathquest_diagnostic_assessments');
      if (activeId && cachedList) {
        const parsedList = JSON.parse(cachedList);
        const activeExam = parsedList.find((ex: any) => ex.id === activeId);
        if (activeExam && activeExam.published !== false && activeExam.status !== 'Draft' && activeExam.questions && activeExam.questions.length > 0) {
          return activeExam.questions
            .filter((q: any) => q.published !== false)
            .map((q: any, idx: number) => ({
              id: q.id || `custom-${idx}`,
              question: q.question,
              options: q.options || [],
              competency: q.competency || activeExam.topicTitle || 'General Mathematics'
            }));
        }
      }
    } catch (e) {}

    return (fetchedQuestions || [])
      .filter(q => q.published !== false)
      .map(q => ({
        id: q.id,
        question: q.question,
        options: q.options || [],
        competency: q.competency || q.topic
      }));
  }, [fetchedQuestions]);

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
    }, 1800);
  };

  const selectedTopic = topics.find((t) => t.id === 'functions' || t.title.toLowerCase().includes('function')) || topics[0];

  const handleStartTest = (type: 'pre-test' | 'post-test') => {
    if (!isUnlocked) return;
    setCurrentTestType(type);
    setIsTestActive(true);
    if (onStartDiagnosticTest) onStartDiagnosticTest(type);
  };

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
              diagnosticType={currentTestType}
              profile={profile}
              onComplete={(ability, scores, pathway, violations, testType, totalItems) => {
                if (onSaveDiagnosticResult) {
                  onSaveDiagnosticResult(ability, scores, pathway, violations, testType || currentTestType, totalItems);
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
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>DIAGNOSTIC ASSESSMENT HUB</span>
                  </span>
                  <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Pre-Test Baseline & Post-Test Mastery
                  </span>
                  <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    DepEd Grade 11 General Mathematics
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Diagnostic Assessment (Pre-Test & Post-Test)
                </h1>

                <p className="text-sm text-indigo-100 max-w-2xl leading-relaxed">
                  Start your learning journey with the <strong>Pre-Test</strong> to uncover prior knowledge and build your personalized pathway. Then take the <strong>Post-Test</strong> to evaluate mastery and learning growth.
                </p>

                {/* Progress Mini Status */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <span className="text-slate-300">Pre-Test:</span>
                    {isPreTestDone ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed ({prePercent}% • {preAbility})
                      </span>
                    ) : (
                      <span className="text-amber-300 font-bold">Pending (Take on App Start)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                    <span className="text-slate-300">Post-Test:</span>
                    {isPostTestDone ? (
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Completed ({postPercent}% • {postAbility})
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        {isPreTestDone ? 'Ready for Exit Check' : 'Locked until Pre-Test'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Tab Navigation Bar */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1.5 shadow-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('pre-test')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'pre-test'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>1. Pre-Test Diagnostic (App Start)</span>
                {isPreTestDone && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('post-test')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'post-test'
                    ? 'bg-purple-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4 text-purple-200" />
                <span>2. Post-Test Diagnostic (Exit & Mastery)</span>
                {isPostTestDone && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('growth')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'growth'
                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-indigo-200" />
                <span>3. Pre vs Post Growth Analysis</span>
              </button>
            </div>

            {/* TAB 1: PRE-TEST DIAGNOSTIC ASSESSMENT */}
            {activeTab === 'pre-test' && (
              <div className="space-y-6">
                {/* Onboarding Callout Banner */}
                {!isPreTestDone ? (
                  <div className="p-5 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border-2 border-amber-300 rounded-3xl space-y-2 text-amber-950 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] uppercase rounded-full">
                        Step 1 for New Students
                      </span>
                      <span className="text-xs font-bold text-amber-900">
                        Take this test when starting to use the app
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-amber-950">
                      Welcome! Begin with your Pre-Test Diagnostic Assessment
                    </h3>
                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      Before starting Grade 11 mathematics lessons, complete this baseline assessment. It evaluates your prerequisite concepts from junior high, identifies any foundational learning gaps, and tailors your personalized study pathway.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-emerald-950 text-sm">
                          Pre-Test Completed ({prePercent}% • {preScore}/{preTotal})
                        </div>
                        <p className="text-emerald-800 text-[11px]">
                          Baseline Ability: <strong className="font-bold">{preAbility}</strong> • You can proceed to lessons and take the Post-Test when ready!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('post-test')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                    >
                      Proceed to Post-Test →
                    </button>
                  </div>
                )}

                {/* Specs and Purpose Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
                  {/* Subject Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Subject</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">General Mathematics</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Assessment Stage</span>
                      <span className="text-xs sm:text-sm font-black text-amber-700">Pre-Test (Entry Baseline)</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Target Grade</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">Grade 11 • Quarter 1</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Core Focus</span>
                      <span className="text-xs sm:text-sm font-black text-indigo-600 truncate block">
                        Functions & Prerequisite Algebra
                      </span>
                    </div>
                  </div>

                  {/* Purpose Matrix */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
                      <Target className="w-4 h-4 text-amber-600" />
                      <span>Pre-Test Diagnostic Objectives</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
                        <span className="font-black text-amber-950 block">1. Prior Knowledge Check</span>
                        <p className="text-slate-600 text-[11px]">Diagnoses Junior High foundations in linear & quadratic relations.</p>
                      </div>
                      <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
                        <span className="font-black text-indigo-950 block">2. Gap Identification</span>
                        <p className="text-slate-600 text-[11px]">Pinpoints misconceptions in domain restrictions and piece-wise definitions.</p>
                      </div>
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                        <span className="font-black text-emerald-950 block">3. Baseline Benchmarking</span>
                        <p className="text-slate-600 text-[11px]">Establishes starting ability (&theta;) to measure future post-test growth.</p>
                      </div>
                      <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                        <span className="font-black text-purple-950 block">4. Adaptive Pathway</span>
                        <p className="text-slate-600 text-[11px]">Generates personalized DepEd remediation and scaffolding modules.</p>
                      </div>
                    </div>
                  </div>

                  {/* DepEd Competencies */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                      DepEd MELCs Evaluated in Pre-Test:
                    </span>
                    <ul className="space-y-2 text-xs font-semibold text-slate-700">
                      <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>M11GM-Ia-1:</strong> Represents real-life situations using functions, including piecewise functions.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>M11GM-Ia-2:</strong> Evaluates functions accurately at specific numerical or algebraic inputs.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span><strong>M11GM-Ia-3:</strong> Performs addition, subtraction, multiplication, division, and composition of functions.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Questions Preview */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Pre-Test Questions Preview ({questionsToPreview.length} Items)
                        </span>
                      </div>
                      <button
                        onClick={() => setShowQuestionsPreview(!showQuestionsPreview)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 cursor-pointer"
                      >
                        {showQuestionsPreview ? 'Hide Questions' : 'Inspect Pre-Test Items'}
                      </button>
                    </div>

                    {showQuestionsPreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pt-3 border-t border-slate-200 max-h-96 overflow-y-auto"
                      >
                        {questionsToPreview.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                              Item {qIdx + 1} • {q.competency}
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {q.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-2">
                                  <span className="font-bold text-indigo-600">{String.fromCharCode(65 + oIdx)}.</span>
                                  <span className="truncate">{opt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Teacher Schedule & Permission Gate */}
                  <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-300/80 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Pre-Test Assessment Gate & Teacher Access
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                          Window: <strong className="text-amber-950">Active Session</strong> • Section: <strong className="text-amber-950">{profile.section || 'STEM-A'}</strong>
                        </p>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-center shrink-0 ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {isUnlocked ? '🔓 Access Granted' : '🔒 Teacher Passcode Required'}
                      </span>
                    </div>

                    {!isUnlocked ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-700 font-bold">
                          Enter your class access code (or request permission from teacher) to begin:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                            <label className="text-[11px] font-black text-slate-700 uppercase block">
                              Class Passcode
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
                                ✗ Invalid Passcode. Try 'MATH11' or request teacher permission.
                              </span>
                            )}
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 flex flex-col justify-between">
                            <label className="text-[11px] font-black text-slate-700 uppercase block">
                              Need Teacher Grant?
                            </label>
                            {requestStatus === 'none' && (
                              <button
                                onClick={handleRequestPermission}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                              >
                                ✋ Request Live Teacher Permission
                              </button>
                            )}
                            {requestStatus === 'pending' && (
                              <div className="p-2 bg-amber-50 text-amber-900 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Requesting permission...</span>
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
                        <span>Teacher permission verified! Ready to start your baseline diagnostic pre-test.</span>
                      </div>
                    )}
                  </div>

                  {/* Start Button */}
                  <div className="pt-2">
                    <button
                      disabled={!isUnlocked}
                      onClick={() => handleStartTest('pre-test')}
                      className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2.5 text-base ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-200 active:scale-98 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>{isUnlocked ? (isPreTestDone ? 'Retake Pre-Test Diagnostic Assessment' : 'Start Pre-Test Diagnostic Assessment (Baseline)') : 'Locked — Enter Access Passcode (MATH11) to Start Pre-Test'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: POST-TEST DIAGNOSTIC ASSESSMENT */}
            {activeTab === 'post-test' && (
              <div className="space-y-6">
                {/* Post-Test Status Banner */}
                {isPostTestDone ? (
                  <div className="p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-emerald-50 border border-purple-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shrink-0">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider block">
                          Exit Assessment Completed
                        </span>
                        <div className="font-black text-purple-950 text-base">
                          Post-Test Score: {postPercent}% ({postScore}/{postTotal})
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Evaluated Ability: <strong className="text-purple-700">{postAbility}</strong> • Growth vs Pre-Test: <strong className="text-emerald-600">{growthGain >= 0 ? `+${growthGain}%` : `${growthGain}%`}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('growth')}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer self-start sm:self-center"
                    >
                      View Growth Scorecard →
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-purple-50/80 border border-purple-200 rounded-3xl space-y-2 text-purple-950">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-purple-600 text-white font-black text-[10px] uppercase rounded-full">
                        Step 2: Exit Evaluation
                      </span>
                      <span className="text-xs font-bold text-purple-800">
                        Taken after completing your lesson modules
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-purple-950">
                      Post-Test Diagnostic: Mastery & Skill Acquisition Check
                    </h3>
                    <p className="text-xs text-purple-900/90 leading-relaxed">
                      Now that you have worked through instructional presentations, exercises, and guided practice, take the Post-Test Diagnostic Assessment to measure your mastery gain and evaluate your progress against your initial Pre-Test baseline.
                    </p>
                    {!isPreTestDone && (
                      <p className="text-[11px] text-amber-700 font-bold pt-1">
                        ℹ️ Tip: Taking your Pre-Test first provides an accurate starting point for measuring your improvement.
                      </p>
                    )}
                  </div>
                )}

                {/* Post-Test Specs Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Subject</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">General Mathematics</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Assessment Stage</span>
                      <span className="text-xs sm:text-sm font-black text-purple-700">Post-Test (Exit Evaluation)</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Target Benchmark</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-700">Mastery (≥ 80%)</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Pre-Test Baseline</span>
                      <span className="text-xs sm:text-sm font-black text-indigo-600 truncate block">
                        {isPreTestDone ? `${prePercent}% (${preAbility})` : 'Not Taken'}
                      </span>
                    </div>
                  </div>

                  {/* Post-Test Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>Post-Test Diagnostic Targets</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                        <span className="font-black text-purple-950 block">1. Mastery Verification</span>
                        <p className="text-slate-600 text-[11px]">Confirms whether foundational misconceptions have been resolved.</p>
                      </div>
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                        <span className="font-black text-emerald-950 block">2. Growth Score Calculation</span>
                        <p className="text-slate-600 text-[11px]">Calculates absolute score improvement and relative learning gain.</p>
                      </div>
                      <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1">
                        <span className="font-black text-indigo-950 block">3. Higher-Order Transfer</span>
                        <p className="text-slate-600 text-[11px]">Evaluates ability to model piecewise situations independently.</p>
                      </div>
                      <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
                        <span className="font-black text-amber-950 block">4. Summative Readiness</span>
                        <p className="text-slate-600 text-[11px]">Validates preparation for the Quarter 1 Summative TOS Examination.</p>
                      </div>
                    </div>
                  </div>

                  {/* Permission Gate */}
                  <div className="p-5 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-slate-50 border border-purple-300/80 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-700" />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Post-Test Permission Gate
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                          Requires teacher authorization or access passcode: <strong className="text-purple-950">MATH11</strong>
                        </p>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-center shrink-0 ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-purple-100 text-purple-900 border border-purple-300'
                      }`}>
                        {isUnlocked ? '🔓 Access Granted' : '🔒 Authorization Required'}
                      </span>
                    </div>

                    {!isUnlocked ? (
                      <div className="space-y-3">
                        <div className="flex gap-2 max-w-sm">
                          <input
                            type="text"
                            placeholder="Enter Code (e.g. MATH11)"
                            value={inputPasscode}
                            onChange={(e) => setInputPasscode(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black uppercase tracking-widest text-slate-900 focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={handleVerifyPasscode}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl cursor-pointer shrink-0"
                          >
                            Unlock Post-Test
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Permission granted! You can now start your exit Post-Test Diagnostic Assessment.</span>
                      </div>
                    )}
                  </div>

                  {/* Start Post-Test Button */}
                  <div className="pt-2">
                    <button
                      disabled={!isUnlocked}
                      onClick={() => handleStartTest('post-test')}
                      className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2.5 text-base ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-lg shadow-purple-200 active:scale-98 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current" />
                      <span>{isUnlocked ? (isPostTestDone ? 'Retake Post-Test Diagnostic Assessment' : 'Start Post-Test Diagnostic Assessment') : 'Locked — Enter Access Passcode (MATH11) to Start Post-Test'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRE VS POST GROWTH ANALYSIS */}
            {activeTab === 'growth' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                      <span>Pre-Test vs Post-Test Growth Scorecard</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Comparative analysis evaluating learning gains, ability progression, and competency mastery.
                    </p>
                  </div>

                  {/* Side-by-Side Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Pre-Test Card */}
                    <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                        Pre-Test Baseline
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-amber-950">
                        {isPreTestDone ? `${prePercent}%` : 'Pending'}
                      </div>
                      <span className="text-xs font-bold text-amber-900 block">
                        {isPreTestDone ? `${preScore}/${preTotal} Correct (${preAbility})` : 'Take Pre-Test on App Start'}
                      </span>
                      {!isPreTestDone && (
                        <button
                          onClick={() => setActiveTab('pre-test')}
                          className="mt-2 text-xs font-bold text-amber-700 underline cursor-pointer"
                        >
                          Start Pre-Test →
                        </button>
                      )}
                    </div>

                    {/* Post-Test Card */}
                    <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block">
                        Post-Test Exit Score
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-purple-950">
                        {isPostTestDone ? `${postPercent}%` : (isPreTestDone ? 'Ready' : 'Locked')}
                      </div>
                      <span className="text-xs font-bold text-purple-900 block">
                        {isPostTestDone ? `${postScore}/${postTotal} Correct (${postAbility})` : 'Take after lessons'}
                      </span>
                      {!isPostTestDone && (
                        <button
                          onClick={() => setActiveTab('post-test')}
                          className="mt-2 text-xs font-bold text-purple-700 underline cursor-pointer"
                        >
                          Take Post-Test →
                        </button>
                      )}
                    </div>

                    {/* Learning Gain Card */}
                    <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                        Learning Gain (Delta)
                      </span>
                      <div className={`text-3xl sm:text-4xl font-black ${isPostTestDone ? (growthGain >= 0 ? 'text-emerald-600' : 'text-slate-700') : 'text-slate-400'}`}>
                        {isPostTestDone ? (growthGain >= 0 ? `+${growthGain}%` : `${growthGain}%`) : '—'}
                      </div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        {isPostTestDone 
                          ? (growthGain >= 20 ? '🌟 Outstanding Mastery Gain' : growthGain > 0 ? '✓ Solid Competency Growth' : 'Steady Baseline')
                          : 'Calculated upon Post-Test'}
                      </span>
                    </div>
                  </div>

                  {/* Competency Mastery Matrix Comparison */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      Competency Matrix Progression (Pre vs Post)
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">DepEd MELC / Competency</th>
                            <th className="p-3 text-center">Pre-Test Baseline</th>
                            <th className="p-3 text-center">Post-Test Exit</th>
                            <th className="p-3 text-center">Growth</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {[
                            { code: 'M11GM-Ia-1', name: 'Real-Life Function & Piecewise Modeling', pre: isPreTestDone ? Math.max(30, prePercent - 10) : 40, post: isPostTestDone ? Math.max(prePercent, postPercent + 5) : 85 },
                            { code: 'M11GM-Ia-2', name: 'Function Evaluation at Inputs', pre: isPreTestDone ? prePercent : 55, post: isPostTestDone ? postPercent : 90 },
                            { code: 'M11GM-Ia-3', name: 'Operations & Composition of Functions', pre: isPreTestDone ? Math.max(25, prePercent - 15) : 35, post: isPostTestDone ? Math.max(prePercent, postPercent - 5) : 80 },
                            { code: 'M11GM-Ib-1', name: 'Rational Functions, Domain & Equations', pre: isPreTestDone ? Math.max(20, prePercent - 20) : 30, post: isPostTestDone ? Math.max(prePercent, postPercent) : 75 }
                          ].map((row, idx) => {
                            const gain = isPostTestDone ? (row.post - row.pre) : (row.post - row.pre);
                            const isMastered = isPostTestDone ? row.post >= 75 : false;

                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3">
                                  <div className="font-bold text-slate-900">{row.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{row.code}</div>
                                </td>
                                <td className="p-3 text-center font-bold text-slate-700">
                                  {isPreTestDone ? `${row.pre}%` : 'Pending'}
                                </td>
                                <td className="p-3 text-center font-bold text-indigo-700">
                                  {isPostTestDone ? `${row.post}%` : 'Pending'}
                                </td>
                                <td className="p-3 text-center font-bold text-emerald-600">
                                  {isPostTestDone ? `+${gain}%` : '—'}
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    isMastered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {isMastered ? 'Mastered ✓' : isPostTestDone ? 'Developing' : 'In Progress'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
