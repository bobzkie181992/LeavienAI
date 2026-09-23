import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  GraduationCap,
  Target,
  Compass,
  Activity,
  FileCheck,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Award,
  Zap,
  HelpCircle,
  Check,
  X,
  Clock,
  Layers,
  FileText,
  Lightbulb,
  ExternalLink,
  Download,
  Share2,
  Save,
  MessageSquare,
  Eye,
  Sliders,
  Play,
  Flame,
  Bookmark,
  ChevronDown,
  Info
} from 'lucide-react';
import { Topic, Problem, QuizResult, UserProfile } from '../types';
import { ILAW_LESSON_PLANS } from '../data/ilawLessons';
import FormativeCheckWidget from './FormativeCheckWidget';

export type LessonSectionId =
  | 'diagnostic'
  | 'introduction'
  | 'discussion'
  | 'formative-1'
  | 'activity'
  | 'practice'
  | 'formative-2'
  | 'reflection'
  | 'exit-ticket'
  | 'progress';

interface LessonSectionMeta {
  id: LessonSectionId;
  label: string;
  shortLabel: string;
  description: string;
  icon: any;
}

export const LESSON_SECTIONS: LessonSectionMeta[] = [
  { id: 'diagnostic', label: 'Diagnostic Checkpoint', shortLabel: 'Diagnostic', description: 'Prior knowledge check', icon: Target },
  { id: 'introduction', label: 'Introduction', shortLabel: 'Intro', description: 'Real-world hook & context', icon: Sparkles },
  { id: 'discussion', label: 'Lesson Content', shortLabel: 'Lesson', description: 'Core definitions & concepts', icon: BookOpen },
  { id: 'formative-1', label: 'Formative Check #1', shortLabel: 'Formative Check 1', description: 'Knowledge check', icon: FileCheck },
  { id: 'activity', label: 'Learning Activity', shortLabel: 'Activity', description: 'Interactive exercise', icon: Activity },
  { id: 'practice', label: 'Practice Exercises', shortLabel: 'Practice', description: 'Guided problem solving', icon: Sliders },
  { id: 'formative-2', label: 'Formative Check #2', shortLabel: 'Formative Check 2', description: 'Progress check', icon: FileCheck },
  { id: 'reflection', label: 'Reflection', shortLabel: 'Reflection', description: 'Self-reflection & notes', icon: Lightbulb },
  { id: 'exit-ticket', label: 'Exit Ticket', shortLabel: 'Exit Ticket', description: 'End-of-lesson ticket', icon: Award },
  { id: 'progress', label: 'Learning Progress', shortLabel: 'Progress', description: 'Competency progress summary', icon: TrendingUp },
];

interface DetailedLessonPageProps {
  topic: Topic;
  profile: UserProfile;
  onBack: () => void;
  onSaveQuizResult?: (result: Omit<QuizResult, 'timestamp'>) => void;
  onAddXP?: (amount: number) => void;
  onStartFullQuiz?: () => void;
}

interface StoredLessonProgress {
  currentSection: LessonSectionId;
  completedSections: LessonSectionId[];
  activityCompleted: boolean;
  activityParam: number;
  practiceAnswers: Record<number, number>;
  assessmentAnswers: Record<number, number>;
  assessmentScore: number | null;
  assessmentCompleted: boolean;
  reflectionText: string;
  reflectionSaved: boolean;
  lastUpdated: number;
}

export default function DetailedLessonPage({
  topic,
  profile,
  onBack,
  onSaveQuizResult,
  onAddXP,
  onStartFullQuiz
}: DetailedLessonPageProps) {
  const storageKey = `mathquest_lesson_v2_${profile?.uid || 'guest'}_${topic.id}`;

  // State management
  const [currentSection, setCurrentSection] = useState<LessonSectionId>('introduction');
  const [completedSections, setCompletedSections] = useState<LessonSectionId[]>(['introduction']);
  const [hasLoadedSavedProgress, setHasLoadedSavedProgress] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);

  // Section-specific states
  // 1. Objectives
  const [checkedObjectives, setCheckedObjectives] = useState<Record<string, boolean>>({});

  // 2. Examples: revealed steps for each worked example
  const [revealedExampleSteps, setRevealedExampleSteps] = useState<Record<number, number>>({ 0: 1, 1: 1 });

  // 3. Interactive Activity
  const [activityParam, setActivityParam] = useState<number>(5);
  const [activityCompleted, setActivityCompleted] = useState<boolean>(false);
  const [activityChallengeAnswer, setActivityChallengeAnswer] = useState<string>('');
  const [activityChallengeFeedback, setActivityChallengeFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // 4. Practice Exercises
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number>>({});
  const [showPracticeExplanation, setShowPracticeExplanation] = useState<Record<number, boolean>>({});

  // 5. Assessment
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
  const [assessmentSubmitted, setAssessmentSubmitted] = useState<boolean>(false);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [assessmentHintOpen, setAssessmentHintOpen] = useState<Record<number, boolean>>({});

  // 6. Reflection
  const [reflectionText, setReflectionText] = useState<string>('');
  const [reflectionSaved, setReflectionSaved] = useState<boolean>(false);

  // Topic & ILAW resolution
  const fallbackPlan = ILAW_LESSON_PLANS[topic.id];
  const lessonPlan = topic.lessonPlan?.ilaw ? topic.lessonPlan : (fallbackPlan || topic.lessonPlan);
  const ilaw = lessonPlan?.ilaw || fallbackPlan?.ilaw;

  // Metadata attributes
  const lessonTitle = topic.title || 'Introduction to Functions and Relations';
  const subjectName = 'General Mathematics';
  const gradeLevel = 'Grade 11';
  const quarter = topic.term || 'Quarter 1';
  const competencyCode = topic.weeklyFocus || (topic.id === 'functions' ? 'M11GM-Ia-1 to M11GM-Ia-4' : 'M11GM-DepEd-MELCs');
  const competencyDescription = topic.description || 'Represents real-life situations using functions, including piece-wise functions, and evaluates functions accurately.';

  // Assessment questions: up to 5 questions from topic quizzes or synthesized standard DepEd questions
  const assessmentQuestions: Problem[] = useMemo(() => {
    if (topic.quizzes && topic.quizzes.length > 0 && topic.quizzes[0].problems.length > 0) {
      return topic.quizzes[0].problems.slice(0, 5);
    }
    // Fallback standard problems
    return [
      {
        id: `${topic.id}-q1`,
        topic: topic.id,
        question: `Which of the following relations represents a valid function for ${topic.title}?`,
        options: [
          '{(1, 2), (2, 3), (3, 4), (4, 5)}',
          '{(1, 2), (1, 3), (2, 4), (3, 5)}',
          '{(2, 5), (2, 7), (2, 9), (2, 11)}',
          '{(0, 1), (0, -1), (1, 2), (1, -2)}'
        ],
        correctAnswer: 0,
        explanation: 'In a function, every element in the domain corresponds to exactly one element in the range. No x-value is repeated with different y-values.',
        difficulty: 'EASY'
      },
      {
        id: `${topic.id}-q2`,
        topic: topic.id,
        question: 'Given the piecewise fare function f(d) = 15 for d ≤ 4, and f(d) = 15 + 2(d - 4) for d > 4, what is f(10)?',
        options: ['₱25.00', '₱27.00', '₱29.00', '₱35.00'],
        correctAnswer: 1,
        explanation: 'Since 10 > 4, f(10) = 15 + 2(10 - 4) = 15 + 2(6) = 15 + 12 = ₱27.00.',
        difficulty: 'MEDIUM'
      }
    ];
  }, [topic]);

  // Practice Exercises
  const practiceProblems = useMemo(() => [
    {
      id: 1,
      title: 'Practice Problem 1: Concept Verification',
      problem: `If f(x) = 3x² - 5x + 2, evaluate f(-2).`,
      options: [
        'f(-2) = 12',
        'f(-2) = 24',
        'f(-2) = 20',
        'f(-2) = 0'
      ],
      correctIndex: 1,
      hint: 'Substitute x = -2: 3(-2)² - 5(-2) + 2 = 3(4) + 10 + 2',
      solution: 'f(-2) = 3(-2)² - 5(-2) + 2 = 3(4) + 10 + 2 = 12 + 10 + 2 = 24.'
    },
    {
      id: 2,
      title: 'Practice Problem 2: Piecewise Domain Condition',
      problem: `A photocopy shop charges ₱1.50 per page for the first 50 pages, and ₱1.00 per page for every page in excess of 50. How much is the total cost for 75 pages?`,
      options: [
        '₱100.00',
        '₱112.50',
        '₱150.00',
        '₱75.00'
      ],
      correctIndex: 0,
      hint: 'Total = (50 pages × ₱1.50) + ((75 - 50) pages × ₱1.00)',
      solution: 'First 50 pages cost 50 × ₱1.50 = ₱75.00. The excess 25 pages cost 25 × ₱1.00 = ₱25.00. Total = ₱75 + ₱25 = ₱100.00.'
    },
    {
      id: 3,
      title: 'Practice Problem 3: Contextual Application',
      problem: `Which test determines whether a graph represents a function?`,
      options: [
        'Horizontal Line Test',
        'Vertical Line Test',
        'Diagonal Line Test',
        'Origin Reflection Test'
      ],
      correctIndex: 1,
      hint: 'If any vertical line intersects the curve more than once, it is not a function.',
      solution: 'The Vertical Line Test states that a graph represents a function if and only if no vertical line intersects the graph at more than one point.'
    }
  ], [topic]);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data: StoredLessonProgress = JSON.parse(saved);
        if (data.currentSection) {
          setCurrentSection(data.currentSection);
        }
        if (Array.isArray(data.completedSections)) {
          setCompletedSections(data.completedSections);
        }
        if (data.activityCompleted !== undefined) setActivityCompleted(data.activityCompleted);
        if (data.activityParam !== undefined) setActivityParam(data.activityParam);
        if (data.practiceAnswers) setPracticeAnswers(data.practiceAnswers);
        if (data.assessmentAnswers) setAssessmentAnswers(data.assessmentAnswers);
        if (data.assessmentCompleted !== undefined) setAssessmentSubmitted(data.assessmentCompleted);
        if (data.assessmentScore !== undefined) setAssessmentScore(data.assessmentScore);
        if (data.reflectionText) setReflectionText(data.reflectionText);
        if (data.reflectionSaved !== undefined) setReflectionSaved(data.reflectionSaved);
        if (data.lastUpdated) {
          setLastSavedTimestamp(data.lastUpdated);
          setShowResumeBanner(true);
        }
      }
    } catch (e) {
      console.warn('Could not read lesson progress from storage', e);
    } finally {
      setHasLoadedSavedProgress(true);
    }
  }, [storageKey]);

  // Persist progress changes
  const persistProgress = (
    nextSection?: LessonSectionId,
    newCompleted?: LessonSectionId[],
    extra?: Partial<StoredLessonProgress>
  ) => {
    try {
      const sectionToSave = nextSection || currentSection;
      const completedToSave = newCompleted || completedSections;
      const payload: StoredLessonProgress = {
        currentSection: sectionToSave,
        completedSections: Array.from(new Set([...completedToSave, sectionToSave])),
        activityCompleted,
        activityParam,
        practiceAnswers,
        assessmentAnswers,
        assessmentScore,
        assessmentCompleted: assessmentSubmitted,
        reflectionText,
        reflectionSaved,
        lastUpdated: Date.now(),
        ...extra
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSavedTimestamp(payload.lastUpdated);
    } catch (e) {
      console.warn('Failed to save lesson progress', e);
    }
  };

  // Mark section complete and go to next
  const handleMarkCompleteAndNext = (current: LessonSectionId) => {
    const currentIndex = LESSON_SECTIONS.findIndex(s => s.id === current);
    const updatedCompleted = Array.from(new Set([...completedSections, current]));
    setCompletedSections(updatedCompleted);

    if (currentIndex < LESSON_SECTIONS.length - 1) {
      const nextId = LESSON_SECTIONS[currentIndex + 1].id;
      setCurrentSection(nextId);
      persistProgress(nextId, updatedCompleted);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      persistProgress(current, updatedCompleted);
    }
  };

  const handleNavigateToSection = (targetSection: LessonSectionId) => {
    setCurrentSection(targetSection);
    persistProgress(targetSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Assessment Submit Handler
  const handleAssessmentSubmit = () => {
    let correct = 0;
    assessmentQuestions.forEach((q, idx) => {
      if (assessmentAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const percentage = Math.round((correct / assessmentQuestions.length) * 100);
    setAssessmentScore(percentage);
    setAssessmentSubmitted(true);

    const xp = percentage >= 80 ? 100 : percentage >= 50 ? 50 : 25;
    if (onAddXP) onAddXP(xp);

    if (onSaveQuizResult && topic.quizzes[0]) {
      onSaveQuizResult({
        userId: profile.uid || 'student',
        quizId: topic.quizzes[0].id,
        score: correct,
        total: assessmentQuestions.length,
        isCompetent: percentage >= 80,
        attemptNumber: 1
      });
    }

    const updatedCompleted = Array.from(new Set([...completedSections, 'formative-2' as LessonSectionId]));
    setCompletedSections(updatedCompleted);
    persistProgress('formative-2', updatedCompleted, {
      assessmentCompleted: true,
      assessmentScore: percentage
    });
  };

  // Save Reflection Handler
  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;
    setReflectionSaved(true);
    if (onAddXP) onAddXP(20);
    const updatedCompleted = Array.from(new Set([...completedSections, 'reflection' as LessonSectionId]));
    setCompletedSections(updatedCompleted);
    persistProgress('reflection', updatedCompleted, {
      reflectionText,
      reflectionSaved: true
    });
  };

  // Restart lesson progress
  const handleRestartLesson = () => {
    if (confirm('Are you sure you want to restart this lesson? Your current step will be reset to Introduction.')) {
      setCurrentSection('introduction');
      setCompletedSections(['introduction']);
      setActivityCompleted(false);
      setActivityChallengeFeedback(null);
      setActivityChallengeAnswer('');
      setPracticeAnswers({});
      setShowPracticeExplanation({});
      setAssessmentAnswers({});
      setAssessmentSubmitted(false);
      setAssessmentScore(null);
      setReflectionText('');
      setReflectionSaved(false);
      localStorage.removeItem(storageKey);
      setShowResumeBanner(false);
    }
  };

  // Calculate overall percentage
  const progressPercentage = Math.round((completedSections.length / LESSON_SECTIONS.length) * 100);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        {/* Back and Breadcrumb Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Topics</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>{gradeLevel}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span>{subjectName}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-indigo-600">{quarter}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartLesson}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset progress to start fresh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Lesson</span>
            </button>

            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{progressPercentage}% Complete</span>
            </span>
          </div>
        </div>

        {/* Lesson Title & DepEd Competency Metadata */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-wider">
              {subjectName}
            </span>
            <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-black uppercase tracking-wider">
              {quarter}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              DepEd MELCs: {competencyCode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {lessonTitle}
          </h1>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-start gap-3">
            <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-slate-900">Learning Competency: </strong>
              <span>{competencyDescription}</span>
            </div>
          </div>
        </div>

        {/* Resume where left off alert banner */}
        {showResumeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 font-medium"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Welcome back!</strong> Resumed where you left off at{' '}
                <span className="font-bold underline capitalize">{currentSection}</span>.{' '}
                {lastSavedTimestamp && `(Last saved ${new Date(lastSavedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
              </span>
            </div>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="text-emerald-700 hover:text-emerald-900 font-black cursor-pointer text-xs"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Horizontal Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Lesson Navigation Progress</span>
            <span className="text-indigo-600 font-black">{completedSections.length} of {LESSON_SECTIONS.length} Sections Done</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: SIDEBAR NAVIGATION + ACTIVE SECTION CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LESSON PROGRESS NAVIGATION (Sticky on desktop) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Lesson Progress
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Continue Flow
              </span>
            </div>

            {/* Step list with ✓, ●, ○ states */}
            <div className="space-y-1.5">
              {LESSON_SECTIONS.map((sec, idx) => {
                const isCompleted = completedSections.includes(sec.id);
                const isCurrent = currentSection === sec.id;
                const Icon = sec.icon;

                return (
                  <button
                    key={sec.id}
                    onClick={() => handleNavigateToSection(sec.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between group border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                        : isCompleted
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* State marker: ✓ (done), ● (current), ○ (upcoming) */}
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                        isCurrent
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                      </span>

                      <div className="min-w-0">
                        <div className={`text-xs font-black truncate ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-950' : 'text-slate-800'}`}>
                          {sec.label}
                        </div>
                        <div className={`text-[10px] truncate ${isCurrent ? 'text-indigo-100' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {sec.description}
                        </div>
                      </div>
                    </div>

                    <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Quick Action in Sidebar */}
            <div className="pt-2 border-t border-slate-100">
              <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/70 text-xs text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Continuous Resume Enabled</span>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Your inputs, activity state, and scores are automatically saved to your profile.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE LESSON SECTION CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* 1. DIAGNOSTIC CHECKPOINT */}
            {currentSection === 'diagnostic' && (
              <motion.div
                key="sec-diagnostic"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      Step 1 • Prior Knowledge Check
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Diagnostic Checkpoint: Functions
                    </h2>
                  </div>
                  <Target className="w-6 h-6 text-amber-500" />
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-200 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Pre-Lesson Check
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    "Before starting this lesson, let's find out what you already know."
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This baseline check measures prior understanding of relation concepts, domain-range pairs, and substitution before jumping into deep function evaluation.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleMarkCompleteAndNext('diagnostic')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Complete Diagnostic & Proceed to Introduction</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. INTRODUCTION */}
            {currentSection === 'introduction' && (
              <motion.div
                key="sec-introduction"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 1 • Real-World Context
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Introduction & Situational Hook
                    </h2>
                  </div>
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>

                {/* Engaging Hook Story */}
                <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/80 rounded-2xl border border-indigo-100 space-y-3">
                  <span className="text-[11px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Real-Life Philippine Scenario: The Jeepney Fare Matrix</span>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Have you ever rode a traditional public jeepney in your town or city? Notice how the fare system works:
                    You pay a standard base fare of <strong>₱15.00</strong> for the first 4 kilometers. If your destination is beyond 4 kilometers, an additional <strong>₱2.00</strong> is charged for every succeeding kilometer.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    How can we express this ride cost mathematically? This is where the concept of <strong>relations and piecewise functions</strong> enters real life!
                  </p>
                </div>

                {/* Essential Questions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600" />
                    <span>Essential Questions to Answer</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                      <strong>1. What makes a relation a function?</strong> Why can one input not yield multiple outputs in physical systems?
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                      <strong>2. How do piecewise functions work?</strong> How do conditions change equations across different domains?
                    </div>
                  </div>
                </div>

                {/* Navigation Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleMarkCompleteAndNext('introduction')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Mark as Read & Continue to Objectives</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. LEARNING OBJECTIVES */}
            {currentSection === 'objectives' && (
              <motion.div
                key="sec-objectives"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 2 • Learning Targets
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Official DepEd Learning Objectives
                    </h2>
                  </div>
                  <Target className="w-6 h-6 text-indigo-500" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  By the end of this lesson, you are expected to demonstrate mastery of the following competencies:
                </p>

                {/* 3 Domain Targets: Cognitive, Psychomotor, Affective */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      Cognitive Domain
                    </span>
                    <h4 className="font-bold text-sky-950 text-sm">Knowledge & Concepts</h4>
                    <p className="text-xs text-sky-900 leading-relaxed">
                      {lessonPlan?.objectives?.cognitive || 'Define relations and functions, distinguish functions from mere relations, and explain domain and range.'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                      Psychomotor Domain
                    </span>
                    <h4 className="font-bold text-indigo-950 text-sm">Skills & Execution</h4>
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      {lessonPlan?.objectives?.psychomotor || 'Construct piecewise functions from real-world situations and evaluate function outputs given domain inputs.'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Affective Domain
                    </span>
                    <h4 className="font-bold text-emerald-950 text-sm">Values & Attitude</h4>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {lessonPlan?.objectives?.affective || 'Demonstrate precision, analytical perseverance, and appreciation of math in consumer financial decisions.'}
                    </p>
                  </div>
                </div>

                {/* Interactive Success Criteria Checklist */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Student Success Criteria (Self-Checklist)
                  </h4>
                  <div className="space-y-2">
                    {[
                      'I can accurately apply the vertical line test on any Cartesian graph.',
                      'I can substitute values into piecewise conditions without boundary confusion.',
                      'I can write a piecewise cost function representing real-life tariffs or fares.'
                    ].map((item, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200/80 cursor-pointer text-xs font-medium text-slate-700 hover:border-indigo-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={!!checkedObjectives[idx]}
                          onChange={(e) => setCheckedObjectives(prev => ({ ...prev, [idx]: e.target.checked }))}
                          className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('introduction')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Introduction
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('introduction')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Proceed to Lesson Discussion</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. LESSON DISCUSSION */}
            {currentSection === 'discussion' && (
              <motion.div
                key="sec-discussion"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 3 • Comprehensive Theory
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Lesson Discussion & Core Concepts
                    </h2>
                  </div>
                  <BookOpen className="w-6 h-6 text-indigo-500" />
                </div>

                {/* Definition 1 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded">
                      Definition 1
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Relation vs. Function
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    A <strong>relation</strong> is any set of ordered pairs $(x, y)$. The set of all first coordinates ($x$) is called the <strong>domain</strong>, and the set of all second coordinates ($y$) is called the <strong>range</strong>.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 font-medium">
                    ✨ <strong>The Function Rule:</strong> A relation is a <strong>function</strong> if each element in the domain corresponds to <em>exactly one</em> element in the range. In other words, no single input $x$ can have two different outputs $y$.
                  </div>
                </div>

                {/* Definition 2: The Vertical Line Test */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded">
                      Theorem
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      The Vertical Line Test
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    A graph in the Cartesian coordinate plane represents a function if and only if <strong>no vertical line</strong> intersects the graph in more than one point.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                      ✓ <strong>Parabola opening upwards ($y = x²$):</strong> Any vertical line intersects at at most 1 point. <em>Valid Function.</em>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900">
                      ✗ <strong>Circle ($x² + y² = r²$):</strong> Vertical lines intersect at 2 points. <em>Not a Function.</em>
                    </div>
                  </div>
                </div>

                {/* Definition 3: Piecewise Functions */}
                <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded">
                      Core Concept
                    </span>
                    <h3 className="text-base font-black text-slate-900">
                      Piecewise-Defined Functions
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    A <strong>piecewise function</strong> is a function defined by multiple sub-functions, where each sub-function applies to a specific interval or sub-domain.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-mono text-slate-900">
                    f(x) = {'{\n'}
                    &nbsp;&nbsp;15, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if 0 &lt; x ≤ 4{'\n'}
                    &nbsp;&nbsp;15 + 2(x - 4), &nbsp;&nbsp;&nbsp;&nbsp;if x &gt; 4{'\n'}
                    {'}'}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('introduction')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Introduction
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('discussion')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Proceed to Formative Check #1</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. WORKED EXAMPLES */}
            {currentSection === 'examples' && (
              <motion.div
                key="sec-examples"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 4 • Step-by-Step Problem Solving
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Worked Examples & Demonstrations
                    </h2>
                  </div>
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>

                {/* Example 1 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-black rounded-lg">
                      Example 1: Function Evaluation
                    </span>
                    <span className="text-xs font-bold text-slate-400">Basic Level</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    Evaluate $f(x) = 2x² - 3x + 5$ at $x = -3$.
                  </h4>

                  {/* Step-by-step interactive reveal */}
                  <div className="space-y-2 pt-1">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800">
                      <strong>Step 1 (Substitute):</strong> Replace every occurrence of $x$ with $(-3)$:<br />
                      <span className="font-mono text-indigo-700">f(-3) = 2(-3)² - 3(-3) + 5</span>
                    </div>

                    {(revealedExampleSteps[0] || 1) >= 2 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-800">
                        <strong>Step 2 (Exponents & Multiplication):</strong> Calculate $(-3)² = 9$, then $2(9) = 18$ and $-3(-3) = +9$:<br />
                        <span className="font-mono text-indigo-700">f(-3) = 18 + 9 + 5</span>
                      </motion.div>
                    )}

                    {(revealedExampleSteps[0] || 1) >= 3 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold">
                        <strong>Step 3 (Final Sum):</strong> 18 + 9 + 5 = 32.<br />
                        Therefore, <span className="font-mono underline">f(-3) = 32</span>.
                      </motion.div>
                    )}
                  </div>

                  {(revealedExampleSteps[0] || 1) < 3 && (
                    <button
                      onClick={() => setRevealedExampleSteps(prev => ({ ...prev, 0: (prev[0] || 1) + 1 }))}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal Next Step ({revealedExampleSteps[0] || 1}/3)</span>
                    </button>
                  )}
                </div>

                {/* Example 2: Piecewise Application */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-lg">
                      Example 2: Contextual Piecewise Problem
                    </span>
                    <span className="text-xs font-bold text-slate-400">Contextual Level</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    A tricycle charges ₱20 for the first kilometer and ₱5 for each additional kilometer. Write the cost function $C(d)$ and find the fare for 6 km.
                  </h4>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 space-y-2">
                    <p><strong>Solution:</strong></p>
                    <p>1. When $d \le 1$, cost is flat: $C(d) = 20$.</p>
                    <p>2. When $d &gt; 1$, the additional distance is $(d - 1)$ km at ₱5/km: $C(d) = 20 + 5(d - 1)$.</p>
                    <p className="pt-1 font-bold text-indigo-700">
                      For d = 6: Since 6 &gt; 1, C(6) = 20 + 5(6 - 1) = 20 + 5(5) = 20 + 25 = ₱45.00.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('discussion')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Discussion
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('discussion')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Proceed to Interactive Activity</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. FORMATIVE CHECK #1 */}
            {currentSection === 'formative-1' && (
              <motion.div
                key="sec-formative-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <FormativeCheckWidget
                  title="FORMATIVE CHECK #1"
                  subtitle="Quick Knowledge Check: Functions & Evaluation"
                  onNextStep={() => handleMarkCompleteAndNext('formative-1')}
                />
              </motion.div>
            )}

            {/* 5. INTERACTIVE ACTIVITY */}
            {currentSection === 'activity' && (
              <motion.div
                key="sec-activity"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 5 • Interactive Simulation
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Interactive Math Simulator & Manipulative
                    </h2>
                  </div>
                  <Activity className="w-6 h-6 text-indigo-500" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  Experiment with different distance parameters to visualize how the piecewise fare rule dynamically computes outputs.
                </p>

                {/* Simulator Widget */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                      Trip Distance Slider ($d$ in km):
                    </span>
                    <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                      {activityParam} km
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={activityParam}
                    onChange={(e) => {
                      setActivityParam(Number(e.target.value));
                      setActivityCompleted(true);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-slate-400">
                    <span>1 km (Base Fare Range)</span>
                    <span>4 km (Boundary)</span>
                    <span>25 km (Long Distance)</span>
                  </div>

                  {/* Computed output card */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Live Formula Execution:
                    </span>

                    <div className="text-base sm:text-lg font-black text-slate-900">
                      {activityParam <= 4 ? (
                        <span className="text-emerald-700">
                          f({activityParam}) = ₱15.00 (Standard Base Fare applies because {activityParam} km ≤ 4 km)
                        </span>
                      ) : (
                        <span className="text-indigo-700">
                          f({activityParam}) = ₱15.00 + ₱2.00 × ({activityParam} - 4) = ₱{15 + (activityParam - 4) * 2}.00
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Notice how the formula automatically switches branches at the $d = 4$ boundary point.</span>
                    </div>
                  </div>

                  {/* Interactive Challenge within Activity */}
                  <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                    <h5 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                      Quick Challenge Question:
                    </h5>
                    <p className="text-xs text-indigo-900">
                      If a passenger traveled 12 kilometers, what is the exact total fare in Pesos?
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Enter amount (e.g. 31)"
                        value={activityChallengeAnswer}
                        onChange={(e) => setActivityChallengeAnswer(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 w-44"
                      />
                      <button
                        onClick={() => {
                          const clean = activityChallengeAnswer.replace(/[^0-9]/g, '');
                          if (clean === '31') {
                            setActivityChallengeFeedback('correct');
                            setActivityCompleted(true);
                          } else {
                            setActivityChallengeFeedback('incorrect');
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                      >
                        Verify
                      </button>
                    </div>
                    {activityChallengeFeedback === 'correct' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                        <Check className="w-4 h-4" /> Correct! 15 + 2(12 - 4) = 15 + 16 = ₱31.00.
                      </span>
                    )}
                    {activityChallengeFeedback === 'incorrect' && (
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                        <X className="w-4 h-4" /> Try again! Remember to subtract 4 from 12 first.
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('formative-1')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Formative Check #1
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('activity')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Proceed to Practice Exercises</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 6. PRACTICE EXERCISES */}
            {currentSection === 'practice' && (
              <motion.div
                key="sec-practice"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 6 • Guided Practice
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Practice Exercises & Immediate Feedback
                    </h2>
                  </div>
                  <Sliders className="w-6 h-6 text-indigo-500" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  Select your answer for each problem below to get instant verification and comprehensive step-by-step explanations.
                </p>

                <div className="space-y-4">
                  {practiceProblems.map((prob, pIdx) => {
                    const selected = practiceAnswers[pIdx];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === prob.correctIndex;

                    return (
                      <div key={prob.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-indigo-700">
                            {prob.title}
                          </span>
                          {isAnswered && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isCorrect ? '✓ Correct' : '✗ Review Answer'}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-slate-900">
                          {prob.problem}
                        </p>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {prob.options.map((opt, oIdx) => {
                            const isSelectedOption = selected === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  setPracticeAnswers(prev => ({ ...prev, [pIdx]: oIdx }));
                                  setShowPracticeExplanation(prev => ({ ...prev, [pIdx]: true }));
                                }}
                                className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                                  isSelectedOption
                                    ? oIdx === prob.correctIndex
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                      : 'bg-rose-50 border-rose-400 text-rose-950'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation reveal */}
                        {showPracticeExplanation[pIdx] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1 text-indigo-950"
                          >
                            <span className="font-bold text-indigo-900 block">Explanation:</span>
                            <p>{prob.solution}</p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('activity')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Activity
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('practice')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Proceed to Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 7. ASSESSMENT */}
            {currentSection === 'assessment' && (
              <motion.div
                key="sec-assessment"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 7 • Mastery Check
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Lesson Competency Assessment
                    </h2>
                  </div>
                  <FileCheck className="w-6 h-6 text-indigo-500" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  Complete this formative assessment to verify your mastery. A score of <strong>80% or higher</strong> grants full competency validation and bonus XP!
                </p>

                {/* Score summary if submitted */}
                {assessmentSubmitted && assessmentScore !== null && (
                  <div className={`p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                    assessmentScore >= 80
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider">Assessment Result</span>
                      <h3 className="text-xl font-black">
                        Score: {assessmentScore}% {assessmentScore >= 80 ? '🎉 Competency Mastered!' : '💪 Keep Practicing!'}
                      </h3>
                      <p className="text-xs mt-0.5">
                        {assessmentScore >= 80
                          ? 'Outstanding work! You have successfully mastered this lesson according to DepEd criteria.'
                          : 'Review the explanations below and try re-evaluating the worked examples.'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setAssessmentSubmitted(false);
                        setAssessmentAnswers({});
                      }}
                      className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  </div>
                )}

                {/* Question List */}
                <div className="space-y-4">
                  {assessmentQuestions.map((q, qIdx) => {
                    const selected = assessmentAnswers[qIdx];

                    return (
                      <div key={q.id || qIdx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-indigo-700 uppercase">
                            Question {qIdx + 1} of {assessmentQuestions.length}
                          </span>
                          {assessmentSubmitted && (
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                              selected === q.correctAnswer ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {selected === q.correctAnswer ? 'Correct' : 'Incorrect'}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-slate-900">
                          {q.question}
                        </p>

                        {/* Options */}
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selected === oIdx;
                            const isCorrectOpt = oIdx === q.correctAnswer;

                            let optionStyle = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300';
                            if (assessmentSubmitted) {
                              if (isCorrectOpt) {
                                optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                              } else if (isSelected) {
                                optionStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                              }
                            } else if (isSelected) {
                              optionStyle = 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={assessmentSubmitted}
                                onClick={() => setAssessmentAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                              >
                                <span>{opt}</span>
                                {assessmentSubmitted && isCorrectOpt && (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation after submission */}
                        {assessmentSubmitted && q.explanation && (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                            <strong>Explanation: </strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!assessmentSubmitted && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleAssessmentSubmit}
                      disabled={Object.keys(assessmentAnswers).length === 0}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md cursor-pointer transition-all"
                    >
                      Submit Assessment & Record Result
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('practice')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Practice
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('practice')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Proceed to Reflection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 7. FORMATIVE CHECK #2 */}
            {currentSection === 'formative-2' && (
              <motion.div
                key="sec-formative-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <FormativeCheckWidget
                  title="FORMATIVE CHECK #2"
                  subtitle="Progress Check: Problem Solving & Applications"
                  questions={[
                    {
                      id: 'fcheck-3',
                      title: 'Piecewise Evaluation',
                      question: 'For f(x) = { 15 if x ≤ 4; 15 + 2(x - 4) if x > 4 }, evaluate f(6).',
                      options: ['15', '17', '19', '21'],
                      correctAnswer: 2, // Index 2 -> 19
                      explanation: 'Since 6 > 4, f(6) = 15 + 2(6 - 4) = 15 + 2(2) = 19.',
                      remediationHint: 'Since x = 6 is greater than 4, use the second formula: 15 + 2(6 - 4).',
                      competency: 'M11GM-Ia-2: Evaluates piecewise functions accurately'
                    },
                    {
                      id: 'fcheck-4',
                      title: 'Operations on Functions',
                      question: 'If f(x) = x + 3 and g(x) = 2x, what is (f + g)(2)?',
                      options: ['7', '9', '11', '13'],
                      correctAnswer: 1, // Index 1 -> 9
                      explanation: 'f(2) = 5, g(2) = 4. (f + g)(2) = 5 + 4 = 9.',
                      remediationHint: 'Calculate f(2) = 5 and g(2) = 4, then sum them together.',
                      competency: 'M11GM-Ia-3: Performs addition and composition of functions'
                    }
                  ]}
                  onNextStep={() => handleMarkCompleteAndNext('formative-2')}
                />
              </motion.div>
            )}

            {/* 8. REFLECTION */}
            {currentSection === 'reflection' && (
              <motion.div
                key="sec-reflection"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 8 • Metacognition & Synthesis
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Learner Reflection & Key Takeaways
                    </h2>
                  </div>
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                </div>

                <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                  <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider">
                    Reflection Prompts:
                  </h4>
                  <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside leading-relaxed">
                    <li>What was the most important concept you discovered today?</li>
                    <li>Which problem required the most effort, and what strategy helped you solve it?</li>
                    <li>How can you connect functions to your chosen SHS academic or TVL strand?</li>
                  </ul>
                </div>

                {/* Reflection Note Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Your Learning Journal Entry:</span>
                    {reflectionSaved && (
                      <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved to your portfolio (+20 XP)
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={4}
                    value={reflectionText}
                    onChange={(e) => {
                      setReflectionText(e.target.value);
                      setReflectionSaved(false);
                    }}
                    placeholder="Write your reflections, insights, and formulas you want to remember here..."
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveReflection}
                      disabled={!reflectionText.trim()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Reflection</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('formative-2')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Formative Check #2
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('reflection')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Proceed to Learning Resources</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 9. EXIT TICKET */}
            {currentSection === 'exit-ticket' && (
              <motion.div
                key="sec-exit-ticket"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 9 • Lesson Completion Ticket
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Lesson Exit Ticket
                    </h2>
                  </div>
                  <Award className="w-6 h-6 text-amber-500" />
                </div>

                <div className="p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-indigo-200 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    End-of-Lesson Check
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    What is the single most essential takeaway from this lesson?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Summarize how evaluating functions is applied when calculating real-world costs like piecewise jeepney fares or electric utility bills.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => handleNavigateToSection('reflection')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Reflection
                  </button>
                  <button
                    onClick={() => handleMarkCompleteAndNext('exit-ticket')}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span>Submit Exit Ticket & View Progress</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 10. LEARNING PROGRESS */}
            {currentSection === 'progress' && (
              <motion.div
                key="sec-progress"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block">
                    Lesson Completed!
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Learning Progress Summary
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    You have successfully completed all 10 steps of the Grade 11 ILAW Lesson for General Mathematics!
                  </p>
                </div>

                {/* Progress Stats Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Steps Finished</span>
                    <span className="text-xl font-black text-slate-900">10 / 10 (100%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">XP Earned</span>
                    <span className="text-xl font-black text-indigo-600">+120 XP</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Competency Status</span>
                    <span className="text-xl font-black text-emerald-600">Validated</span>
                  </div>
                </div>

                {/* Return Action */}
                <div className="pt-4 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={onBack}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Return to Curriculum Overview</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
            {currentSection === 'resources' && (
              <motion.div
                key="sec-resources"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Section 9 • Supplementary Materials
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Learning Resources & References
                    </h2>
                  </div>
                  <Layers className="w-6 h-6 text-indigo-500" />
                </div>

                <p className="text-xs sm:text-sm text-slate-600">
                  Access official DepEd modules, video lectures, and formula reference sheets to solidify your mastery.
                </p>

                {/* Resource Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-900 text-sm">DepEd Learner's Material (LM)</h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      General Mathematics Learner's Module, Quarter 1, Unit 1: Functions and Their Graphs (pp. 1-25).
                    </p>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">Official DepEd Curriculum</span>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-sm">Video Explainer & Lecture</h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      High-yield concept breakdown covering piecewise evaluations and real-life modeling.
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Available in Video Hub</span>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-slate-900 text-sm">Formula Quick Sheet</h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      Summary sheet of function evaluations, operations, piecewise notation, and vertical line criteria.
                    </p>
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Printable Reference</span>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-slate-900 text-sm">DepEd Order No. 016, s. 2024</h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      Pedagogical guidelines and standard 4-pillar ILAW instructional framework.
                    </p>
                    <span className="text-[10px] font-bold text-purple-700 uppercase block">Policy Reference</span>
                  </div>
                </div>

                {/* Lesson Completion Card */}
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-400" />
                    <h3 className="text-lg font-black">Congratulations! Lesson Complete</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    You have navigated all 9 sections of <strong>{lessonTitle}</strong>. Your progress has been automatically saved to your profile and portfolio.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={onBack}
                      className="px-5 py-2.5 bg-white text-slate-950 font-black rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Return to Curriculum
                    </button>
                    {onStartFullQuiz && (
                      <button
                        onClick={onStartFullQuiz}
                        className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Take Full Topic Quiz
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-start items-center">
                  <button
                    onClick={() => handleNavigateToSection('reflection')}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                  >
                    ← Previous: Reflection
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
