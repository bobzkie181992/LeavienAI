import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Zap,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { UserProfile, Topic } from '../types';
import FormativeCheckWidget, { FormativeQuestion } from './FormativeCheckWidget';

interface FormativeAssessmentItem {
  id: string;
  title: string;
  type: 'Quick Check' | 'Exit Ticket' | 'Practice' | 'Reflection' | 'Knowledge Check';
  ilawLesson: string;
  subject: string;
  competency: string;
  targetSection: string;
  scheduleWindow: string;
  questions: FormativeQuestion[];
  status: 'assigned' | 'completed';
  score?: number;
  total?: number;
}

const SAMPLE_FORMATIVE_ASSESSMENTS: FormativeAssessmentItem[] = [
  {
    id: 'formative-1',
    title: 'Lesson 1: Quick Knowledge Check on Functions',
    type: 'Quick Check',
    ilawLesson: 'Lesson 1: Introduction to Functions & Relations',
    subject: 'General Mathematics',
    competency: 'M11GM-Ia-1: Represents real-life situations using functions',
    targetSection: 'Grade 11 - STEM A',
    scheduleWindow: 'Today • 8:00 AM - 5:00 PM',
    status: 'assigned',
    questions: [
      {
        id: 'f-1',
        question: 'Which of the following relations represents a function?',
        options: [
          '{(1, 2), (2, 3), (3, 4)}',
          '{(1, 5), (1, 6), (2, 7)}',
          '{(0, 0), (0, 1), (0, 2)}',
          '{(3, 1), (3, 2), (4, 5)}'
        ],
        correctAnswer: 0,
        explanation: 'In {(1, 2), (2, 3), (3, 4)}, each domain value x is paired with exactly one range value y.',
        remediationHint: 'A relation is a function if no domain element x repeats with different y-values.',
        competency: 'M11GM-Ia-1'
      },
      {
        id: 'f-2',
        question: 'What is the value of f(3) if f(x) = 2x + 1?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
        explanation: 'Substitute x = 3: f(3) = 2(3) + 1 = 6 + 1 = 7.',
        remediationHint: 'Replace x with 3 in 2x + 1.',
        competency: 'M11GM-Ia-2'
      }
    ]
  },
  {
    id: 'formative-2',
    title: 'Lesson 2: Exit Ticket - Evaluating Piecewise Functions',
    type: 'Exit Ticket',
    ilawLesson: 'Lesson 2: Piecewise Functions & Real-World Modeling',
    subject: 'General Mathematics',
    competency: 'M11GM-Ia-2: Evaluates functions accurately',
    targetSection: 'Grade 11 - STEM A',
    scheduleWindow: 'Today • 8:00 AM - 5:00 PM',
    status: 'assigned',
    questions: [
      {
        id: 'f-3',
        question: 'A jeepney fare charges ₱13 for the first 4 km and ₱1.75 for each additional km. Which equation models this piecewise situation for x > 4?',
        options: [
          'f(x) = 13 + 1.75(x - 4)',
          'f(x) = 13 + 1.75x',
          'f(x) = 13x + 1.75',
          'f(x) = 1.75(x + 4)'
        ],
        correctAnswer: 0,
        explanation: 'For x > 4, the additional distance is (x - 4) km, so fare = 13 + 1.75(x - 4).',
        remediationHint: 'Subtract the initial 4 km from total distance x before multiplying by ₱1.75.',
        competency: 'M11GM-Ia-1'
      }
    ]
  }
];

interface StudentFormativeAssessmentPageProps {
  profile: UserProfile;
  topics: Topic[];
  onBackToOverview?: () => void;
}

export default function StudentFormativeAssessmentPage({
  profile,
  topics,
  onBackToOverview
}: StudentFormativeAssessmentPageProps) {
  const [assessments, setAssessments] = useState<FormativeAssessmentItem[]>(() => {
    const list = [...SAMPLE_FORMATIVE_ASSESSMENTS];
    try {
      const cached = localStorage.getItem('mathquest_formative_assessments');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((cf: any) => {
            // Check if already in list to avoid duplicates
            if (!list.some(item => item.id === cf.id)) {
              list.unshift({
                id: cf.id,
                title: cf.title,
                type: 'Knowledge Check',
                ilawLesson: cf.topicTitle,
                subject: 'General Mathematics',
                competency: cf.topicTitle,
                targetSection: cf.targetSection,
                scheduleWindow: cf.schedule,
                status: 'assigned',
                questions: cf.questions.map((q: any, idx: number) => ({
                  id: q.id || `q-excel-${idx}`,
                  question: q.question,
                  options: q.options,
                  correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
                  explanation: q.correctFeedback || '✓ Correct! Well done evaluating this step.',
                  remediationHint: q.incorrectFeedback || '✗ Review the key formula in the ILAW lesson discussion.',
                  competency: q.competency || 'M11GM-DepEd-MELC'
                }))
              });
            }
          });
        }
      }
    } catch (e) {}
    return list;
  });
  const [selectedAssessment, setSelectedAssessment] = useState<FormativeAssessmentItem | null>(null);

  // Passcode & Permission Gate
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeError, setPasscodeError] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const handleStartFormative = (item: FormativeAssessmentItem) => {
    setSelectedAssessment(item);
    setIsUnlocked(false);
    setPasscode('');
    setPasscodeError(false);
    setPermissionRequested(false);
  };

  const handleVerifyPasscode = () => {
    const entered = passcode.trim().toUpperCase();
    
    // Check standard hardcoded passcodes
    const isStandardMatch = entered === 'FORM11' || entered === '8492' || entered === 'MATH11';
    
    // Check dynamic local storage passcode for this assessment if applicable
    let isCustomMatch = false;
    try {
      const cached = localStorage.getItem('mathquest_formative_assessments');
      if (cached && selectedAssessment) {
        const parsed = JSON.parse(cached);
        const match = parsed.find((p: any) => p.id === selectedAssessment.id);
        if (match && match.accessCode && entered === match.accessCode.toUpperCase()) {
          isCustomMatch = true;
        }
      }
    } catch (e) {}

    if (isStandardMatch || isCustomMatch) {
      setIsUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleRequestPermission = () => {
    setPermissionRequested(true);
    setTimeout(() => {
      setIsUnlocked(true);
    }, 1800);
  };

  const handleCompleteCheck = (score: number, total: number) => {
    if (!selectedAssessment) return;
    setAssessments((prev) =>
      prev.map((a) => (a.id === selectedAssessment.id ? { ...a, status: 'completed', score, total } : a))
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>FORMATIVE CHECKPOINT</span>
            </span>
            <span className="bg-white/10 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Assessment FOR Learning • Grade 11
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FORMATIVE ASSESSMENTS & QUICK CHECKS
          </h1>

          <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
            Short, non-graded knowledge checks, exit tickets, and practice exercises designed to help you check understanding and receive instant step-by-step feedback.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedAssessment ? (
        <div className="space-y-6">
          {/* Back & Assessment Title Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSelectedAssessment(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              ← Back to Formative List
            </button>
            <span className="text-xs font-black uppercase px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {selectedAssessment.type}
            </span>
          </div>

          {/* Security Gate or Active Quiz */}
          {!isUnlocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto text-center"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">{selectedAssessment.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedAssessment.competency}</p>
              </div>

              {/* Target Section & Schedule Badge */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs flex items-center justify-between font-bold text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Scheduled: {selectedAssessment.scheduleWindow}</span>
                </div>
                <span className="bg-amber-200 px-2.5 py-0.5 rounded-full text-[10px] text-amber-950 uppercase">
                  {selectedAssessment.targetSection}
                </span>
              </div>

              {/* Access Passcode Entry */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Enter Teacher Access Code or Passcode
                </label>
                <div className="flex items-center gap-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    placeholder="FORM11"
                    className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm font-black tracking-widest uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleVerifyPasscode}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Unlock
                  </button>
                </div>

                {passcodeError && (
                  <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Incorrect passcode. Try 'FORM11' or request permission below.
                  </p>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <button
                    disabled={permissionRequested}
                    onClick={handleRequestPermission}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {permissionRequested ? '✋ Permission Request Sent to Teacher...' : '✋ Request Permission from Teacher'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <FormativeCheckWidget
              title={selectedAssessment.type.toUpperCase()}
              subtitle={selectedAssessment.title}
              questions={selectedAssessment.questions}
              onComplete={handleCompleteCheck}
              onNextStep={() => setSelectedAssessment(null)}
            />
          )}
        </div>
      ) : (
        /* Formative Assessments List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {a.type}
                  </span>
                  {a.status === 'completed' ? (
                    <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Score: {a.score}/{a.total}
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Assigned
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug">{a.title}</h3>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">{a.ilawLesson}</p>

                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{a.scheduleWindow}</span>
                  </div>
                  <span className="text-indigo-600">{a.targetSection}</span>
                </div>
              </div>

              <button
                onClick={() => handleStartFormative(a)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{a.status === 'completed' ? 'Retake Formative Check' : 'Start Formative Check'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
