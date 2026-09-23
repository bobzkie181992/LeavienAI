import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Target, 
  Compass, 
  Activity, 
  FileCheck, 
  TrendingUp, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  RotateCcw, 
  Award, 
  Zap, 
  Layers, 
  HelpCircle,
  Eye,
  Check,
  X,
  Clock,
  ListTree,
  ChevronDown
} from 'lucide-react';
import { Topic, QuizResult, UserProfile, Problem } from '../types';
import { ILAW_LESSON_PLANS } from '../data/ilawLessons';
import DetailedLessonPage from './DetailedLessonPage';

export type HierarchyStep = 
  | 'grade'
  | 'subject'
  | 'quarter'
  | 'competency'
  | 'ilaw'
  | 'activity'
  | 'assessment'
  | 'progress';

interface CurriculumHierarchyBrowserProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  onSaveQuizResult?: (result: Omit<QuizResult, 'timestamp'>) => void;
  onAddXP?: (amount: number) => void;
  onOpenTopicDLP?: (topic: Topic) => void;
}

export default function CurriculumHierarchyBrowser({
  topics,
  results,
  profile,
  onSaveQuizResult,
  onAddXP,
  onOpenTopicDLP
}: CurriculumHierarchyBrowserProps) {
  // Navigation State
  const [currentStep, setCurrentStep] = useState<HierarchyStep>('grade');
  const [viewDetailedLessonTopic, setViewDetailedLessonTopic] = useState<Topic | null>(null);
  const [viewMode, setViewMode] = useState<'stepper' | 'tree'>('stepper');

  // Hierarchy Selection State
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 11');
  const [selectedSubject, setSelectedSubject] = useState<string>('General Mathematics');
  const [selectedQuarter, setSelectedQuarter] = useState<'Quarter 1' | 'Quarter 2'>('Quarter 1');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id || 'functions');

  // Interactive Activity State
  const [activityParam, setActivityParam] = useState<number>(5); // e.g. distance in km or investment years
  const [activityCompleted, setActivityCompleted] = useState<boolean>(false);

  // Interactive Assessment State
  const [assessmentCurrentIndex, setAssessmentCurrentIndex] = useState<number>(0);
  const [assessmentSelectedAnswers, setAssessmentSelectedAnswers] = useState<Record<number, number>>({});
  const [assessmentShowHint, setAssessmentShowHint] = useState<boolean>(false);
  const [assessmentSubmitted, setAssessmentSubmitted] = useState<boolean>(false);
  const [assessmentScore, setAssessmentScore] = useState<number>(0);

  // Derived selected topic
  const selectedTopic = useMemo(() => {
    return topics.find(t => t.id === selectedTopicId) || topics[0];
  }, [topics, selectedTopicId]);

  // Derived lesson plan
  const selectedILAW = useMemo(() => {
    if (!selectedTopic) return null;
    return selectedTopic.lessonPlan?.ilaw 
      ? selectedTopic.lessonPlan 
      : (ILAW_LESSON_PLANS[selectedTopic.id] || selectedTopic.lessonPlan);
  }, [selectedTopic]);

  // Group topics by Quarter
  const quarter1Topics = useMemo(() => {
    return topics.filter(t => (t.term || '').toLowerCase().includes('1') || ['functions', 'rational', 'inverse', 'exponential', 'logarithmic'].includes(t.id));
  }, [topics]);

  const quarter2Topics = useMemo(() => {
    return topics.filter(t => (t.term || '').toLowerCase().includes('2') || ['interest', 'annuities', 'stocks', 'loans', 'logic-intro', 'propositions', 'proofs'].includes(t.id));
  }, [topics]);

  const activeQuarterTopics = selectedQuarter === 'Quarter 1' ? quarter1Topics : quarter2Topics;

  // Calculate mastery per topic
  const getTopicMastery = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic || !topic.quizzes) return 0;
    let earned = 0;
    let total = 0;
    topic.quizzes.forEach(q => {
      total += q.problems.length;
      const matching = results.filter(r => r.quizId === q.id);
      if (matching.length > 0) {
        earned += Math.max(...matching.map(r => r.score));
      }
    });
    return total > 0 ? Math.round((earned / total) * 100) : 0;
  };

  // Assessment Questions for the current topic
  const assessmentQuestions: Problem[] = useMemo(() => {
    if (!selectedTopic || !selectedTopic.quizzes || selectedTopic.quizzes.length === 0) {
      return [];
    }
    // Collect up to 5 problems from the first quiz
    return selectedTopic.quizzes[0].problems.slice(0, 5);
  }, [selectedTopic]);

  // Handle Assessment Submit
  const handleAssessmentSubmit = () => {
    let correctCount = 0;
    assessmentQuestions.forEach((q, idx) => {
      if (assessmentSelectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / assessmentQuestions.length) * 100);
    setAssessmentScore(scorePercentage);
    setAssessmentSubmitted(true);

    const xpEarned = scorePercentage >= 80 ? 100 : scorePercentage >= 50 ? 50 : 25;
    if (onAddXP) {
      onAddXP(xpEarned);
    }

    if (onSaveQuizResult && selectedTopic.quizzes[0]) {
      onSaveQuizResult({
        userId: profile.uid || 'student',
        quizId: selectedTopic.quizzes[0].id,
        score: correctCount,
        total: assessmentQuestions.length,
        isCompetent: scorePercentage >= 80,
        attemptNumber: 1
      });
    }

    // Auto transition to student progress step
    setCurrentStep('progress');
  };

  const handleResetAssessment = () => {
    setAssessmentCurrentIndex(0);
    setAssessmentSelectedAnswers({});
    setAssessmentShowHint(false);
    setAssessmentSubmitted(false);
    setAssessmentScore(0);
  };

  // Hierarchy Step Definitions with metadata
  const HIERARCHY_STEPS: { id: HierarchyStep; label: string; number: number; icon: any }[] = [
    { id: 'grade', label: 'Grade Level', number: 1, icon: GraduationCap },
    { id: 'subject', label: 'Subject', number: 2, icon: BookOpen },
    { id: 'quarter', label: 'Quarter', number: 3, icon: Calendar },
    { id: 'competency', label: 'Competency', number: 4, icon: Target },
    { id: 'ilaw', label: 'ILAW Lesson', number: 5, icon: Compass },
    { id: 'activity', label: 'Activities', number: 6, icon: Activity },
    { id: 'assessment', label: 'Assessment', number: 7, icon: FileCheck },
    { id: 'progress', label: 'Student Result', number: 8, icon: TrendingUp },
  ];

  const currentStepIndex = HIERARCHY_STEPS.findIndex(s => s.id === currentStep);

  if (viewDetailedLessonTopic) {
    return (
      <DetailedLessonPage
        topic={viewDetailedLessonTopic}
        profile={profile}
        onBack={() => setViewDetailedLessonTopic(null)}
        onSaveQuizResult={onSaveQuizResult}
        onAddXP={onAddXP}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & BREADCRUMBS BAR */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <ListTree className="w-3 h-3" />
                <span>DepEd 8-Level Curriculum Hierarchy</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                Step {currentStepIndex + 1} of 8
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Curriculum Roadmap Explorer
            </h2>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('stepper')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'stepper'
                  ? 'bg-white text-indigo-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Step-by-Step Flow
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-white text-indigo-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hierarchy Tree View
            </button>
          </div>
        </div>

        {/* Interactive Clickable Breadcrumbs Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => setCurrentStep('grade')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              currentStep === 'grade'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {selectedGrade}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            onClick={() => setCurrentStep('subject')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              currentStep === 'subject'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {selectedSubject}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            onClick={() => setCurrentStep('quarter')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              currentStep === 'quarter'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {selectedQuarter}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            onClick={() => setCurrentStep('competency')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer max-w-[140px] truncate ${
              currentStep === 'competency'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={selectedTopic?.title}
          >
            {selectedTopic?.title || 'Competency'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            onClick={() => setCurrentStep('ilaw')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              currentStep === 'ilaw'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ILAW Lesson
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            onClick={() => setCurrentStep('activity')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              currentStep === 'activity'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Learning Activity
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            onClick={() => setCurrentStep('assessment')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              currentStep === 'assessment'
                ? 'bg-indigo-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Quiz Assessment
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          <button
            onClick={() => setCurrentStep('progress')}
            className={`px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
              currentStep === 'progress'
                ? 'bg-emerald-600 text-white font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Student Result
          </button>
        </div>

        {/* Horizontal Visual Step Stepper */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-2">
          {HIERARCHY_STEPS.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = s.id === currentStep;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                    isCurrent ? 'bg-white text-indigo-700' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? '✓' : s.number}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <span className="text-[11px] font-bold leading-tight block truncate">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TREE VIEW MODE */}
      {viewMode === 'tree' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">
            Full 8-Level Curriculum Mindmap & Tree
          </h3>
          <p className="text-xs text-slate-500">
            Click on any branch or node to instantly navigate and drill into the curriculum level.
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            {/* Level 1: Grade */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-xs">
                Level 1: Grade 11
              </span>
              <span className="text-xs font-bold text-slate-500">Senior High School Core</span>
            </div>

            {/* Level 2: Subject */}
            <div className="ml-6 pl-4 border-l-2 border-indigo-200 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs">
                  Level 2: General Mathematics
                </span>
                <span className="text-xs text-slate-500">Core Subject (12 Units)</span>
              </div>

              {/* Level 3: Quarter */}
              <div className="ml-6 pl-4 border-l-2 border-indigo-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg">
                    Level 3: Quarter 1
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Functions, Relations & Transcendentals</span>
                </div>

                {/* Level 4: Competencies list */}
                <div className="ml-6 pl-4 border-l-2 border-amber-200 space-y-2">
                  {quarter1Topics.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => {
                        setSelectedTopicId(t.id);
                        setSelectedQuarter('Quarter 1');
                        setCurrentStep('competency');
                        setViewMode('stepper');
                      }}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        selectedTopicId === t.id
                          ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ILAW • Activity • Quiz • Results →
                      </span>
                    </div>
                  ))}
                </div>

                {/* Quarter 2 */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg">
                    Level 3: Quarter 2
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Business Mathematics & Logic</span>
                </div>
                <div className="ml-6 pl-4 border-l-2 border-amber-200 space-y-2">
                  {quarter2Topics.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => {
                        setSelectedTopicId(t.id);
                        setSelectedQuarter('Quarter 2');
                        setCurrentStep('competency');
                        setViewMode('stepper');
                      }}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        selectedTopicId === t.id
                          ? 'bg-indigo-50 border-indigo-300 font-bold text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ILAW • Activity • Quiz • Results →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STEPPER VIEW MODE - DYNAMIC RENDERER */}
      {viewMode === 'stepper' && (
        <div className="space-y-6">
          {/* STEP 1: GRADE LEVEL */}
          {currentStep === 'grade' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Hierarchy Level 1 of 8
                </span>
                <h3 className="text-xl font-black text-slate-900">Select Grade Level</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Select your Senior High School academic cohort to access official DepEd curriculum competencies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div 
                    onClick={() => {
                      setSelectedGrade('Grade 11');
                      setCurrentStep('subject');
                    }}
                    className="p-6 rounded-3xl border-2 border-indigo-500 bg-indigo-50/50 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                        11
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase">
                        Current Cohort
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        Grade 11 - Senior High School
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Core Mathematics curriculum: Functions, Business Mathematics, and Propositional Logic.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-indigo-700">
                      <span>Enter Grade 11 Curriculum</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div 
                    onClick={() => alert('Grade 12 Advanced Pre-Calculus & Statistics will unlock next school year.')}
                    className="p-6 rounded-3xl border border-slate-200 bg-slate-50 opacity-60 hover:opacity-80 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-300 text-slate-700 flex items-center justify-center font-black text-lg">
                        12
                      </div>
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold uppercase">
                        Coming Soon
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-700 text-lg">Grade 12 - Senior High School</h4>
                      <p className="text-xs text-slate-500 mt-1">Advanced Statistics & Probability, Applied Mathematics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SUBJECT */}
          {currentStep === 'subject' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Hierarchy Level 2 of 8
                </span>
                <h3 className="text-xl font-black text-slate-900">Select Grade 11 Mathematics Subject</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Select your active core subject to navigate into academic quarters and learning competencies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div
                    onClick={() => {
                      setSelectedSubject('General Mathematics');
                      setCurrentStep('quarter');
                    }}
                    className="p-6 rounded-3xl border-2 border-indigo-600 bg-indigo-50/40 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
                        Active DepEd Course
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        General Mathematics
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Functions, rational, exponential & logarithmic functions, business mathematics, and propositional logic.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center gap-1.5 text-xs font-black text-indigo-700">
                      <span>Browse Quarters (12 Units)</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedSubject('Statistics & Probability');
                      setCurrentStep('quarter');
                    }}
                    className="p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">
                        Semester 2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">Statistics & Probability</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Random variables, probability distributions, normal curve, hypothesis testing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: QUARTER */}
          {currentStep === 'quarter' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Hierarchy Level 3 of 8
                </span>
                <h3 className="text-xl font-black text-slate-900">Select Academic Quarter</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Each quarter contains targeted learning competencies aligned with the DepEd Budget of Work (BoW).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div
                    onClick={() => {
                      setSelectedQuarter('Quarter 1');
                      setSelectedTopicId(quarter1Topics[0]?.id || 'functions');
                      setCurrentStep('competency');
                    }}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 group ${
                      selectedQuarter === 'Quarter 1'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase">
                        Quarter 1 (Term 1)
                      </span>
                      <span className="text-xs font-bold text-slate-400">Weeks 1 - 9</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        Functions & Their Graphs
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Functions, Rational Functions, Inverse Functions, Exponential Functions, and Logarithmic Functions.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-700">
                      <span>{quarter1Topics.length} Learning Competencies</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setSelectedQuarter('Quarter 2');
                      setSelectedTopicId(quarter2Topics[0]?.id || 'interest');
                      setCurrentStep('competency');
                    }}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 group ${
                      selectedQuarter === 'Quarter 2'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black uppercase">
                        Quarter 2 (Term 2)
                      </span>
                      <span className="text-xs font-bold text-slate-400">Weeks 10 - 18</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                        Business Mathematics & Logic
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Simple & Compound Interest, Annuities, Stocks & Bonds, Loans, and Propositional Logic.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-700">
                      <span>{quarter2Topics.length} Learning Competencies</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: LEARNING COMPETENCY */}
          {currentStep === 'competency' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Hierarchy Level 4 of 8
                </span>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Learning Competencies ({selectedQuarter})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select a competency to open its ILAW lesson matrix, interactive activity, and quiz.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                    {activeQuarterTopics.length} Units Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {activeQuarterTopics.map((topic, idx) => {
                    const mastery = getTopicMastery(topic.id);
                    const isSelected = selectedTopicId === topic.id;

                    return (
                      <div
                        key={topic.id}
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setCurrentStep('ilaw');
                        }}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 group ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                            Unit {idx + 1}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            mastery >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            mastery >= 50 ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {mastery}% Mastered
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                            {topic.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {topic.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                          <span>Open ILAW Lesson Plan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: ILAW LESSON */}
          {currentStep === 'ilaw' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      Hierarchy Level 5 of 8 • DepEd D.O. 016, s. 2024
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      ILAW Lesson: {selectedTopic?.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTopic && (
                      <button
                        onClick={() => setViewDetailedLessonTopic(selectedTopic)}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>Open 9-Step Detailed Lesson</span>
                      </button>
                    )}

                    <button
                      onClick={() => setCurrentStep('activity')}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Activities</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 4 Pillars of ILAW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* I - Intentions */}
                  <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                        I
                      </span>
                      <h4 className="font-black text-sky-950 text-sm">Intentions (Learning Goals)</h4>
                    </div>
                    <p className="text-xs text-sky-900 leading-relaxed">
                      {selectedILAW?.ilaw?.intentions?.learningIntentions || 'Master fundamental definitions and real-world representations.'}
                    </p>
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-sky-700 uppercase block mb-1">Success Criteria:</span>
                      <ul className="text-xs text-sky-800 space-y-1 list-disc list-inside">
                        {selectedILAW?.ilaw?.intentions?.successCriteria?.slice(0, 2).map((sc: string, i: number) => (
                          <li key={i}>{sc}</li>
                        )) || <li>Model piecewise functions and evaluate values.</li>}
                      </ul>
                    </div>
                  </div>

                  {/* L - Learning Experience */}
                  <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                        L
                      </span>
                      <h4 className="font-black text-indigo-950 text-sm">Learning Experience (Concepts)</h4>
                    </div>
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      {selectedILAW?.ilaw?.learningExperience?.primingHook?.activityDescription || 'Explore mathematical representations through authentic situational modeling.'}
                    </p>
                    <div className="p-2.5 bg-white/80 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium">
                      💡 <strong>Concept Hook:</strong> {selectedILAW?.ilaw?.learningExperience?.conceptNotes?.coreIdea || 'Step-by-step mathematical derivation.'}
                    </div>
                  </div>

                  {/* A - Assessing Learning */}
                  <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                        A
                      </span>
                      <h4 className="font-black text-amber-950 text-sm">Assessing Learning (Formative)</h4>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Diagnostic checkpoints to detect misconceptions before summative testing.
                    </p>
                    <div className="text-xs text-amber-800">
                      ⚠️ <strong>Watch Out:</strong> {selectedILAW?.ilaw?.assessingLearning?.misconceptions?.[0]?.mistake || 'Verify boundary values and division by zero constraints.'}
                    </div>
                  </div>

                  {/* W - Ways Forward */}
                  <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                        W
                      </span>
                      <h4 className="font-black text-emerald-950 text-sm">Ways Forward (Real-World)</h4>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      {selectedILAW?.ilaw?.waysForward?.realWorldContext || 'Connects directly with Data Science, Engineering algorithms, and Financial Economics.'}
                    </p>
                    <div className="text-xs text-emerald-800 font-bold">
                      🚀 <strong>Career Trajectory:</strong> Software Engineering, Quantitative Finance & Architecture.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setCurrentStep('activity')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Proceed to Step 6: Learning Activities</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: ACTIVITIES */}
          {currentStep === 'activity' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    Hierarchy Level 6 of 8 • Interactive Activity
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    Learning Activity: Real-World Mathematical Modeling
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Interact with real parameters and watch how the function or formula evaluates in real time.
                  </p>
                </div>

                {/* Interactive Simulator Card */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Interactive Math Simulator: {selectedTopic?.title}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Parameter Input: {activityParam}
                    </span>
                  </div>

                  {/* Slider Control */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Input Variable ($x$ or $t$):</span>
                      <span className="text-indigo-600 font-black">{activityParam} units</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={activityParam}
                      onChange={(e) => {
                        setActivityParam(Number(e.target.value));
                        setActivityCompleted(true);
                      }}
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>1</span>
                      <span>10</span>
                      <span>20</span>
                    </div>
                  </div>

                  {/* Dynamic Computed Output Box */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Live Mathematical Evaluation:
                    </span>
                    <div className="text-sm sm:text-base font-black text-slate-900">
                      {selectedTopicId === 'functions' ? (
                        activityParam <= 4 
                          ? `f(${activityParam}) = ₱15.00 (Standard Base Fare for first 4 km)`
                          : `f(${activityParam}) = ₱15.00 + ₱2.00 × (${activityParam} - 4) = ₱${15 + (activityParam - 4) * 2}.00`
                      ) : selectedTopicId === 'interest' ? (
                        `Total Accrued Amount A = ₱10,000 × (1 + 0.05)^${activityParam} = ₱${Math.round(10000 * Math.pow(1.05, activityParam)).toLocaleString()}`
                      ) : (
                        `Computed Function Output f(${activityParam}) = ${(activityParam * 2.5 + 10).toFixed(2)} units`
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Piecewise transition triggers smoothly based on the domain boundary condition.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Activity criteria satisfied</span>
                    </span>

                    <button
                      onClick={() => {
                        if (onAddXP) onAddXP(25);
                        setCurrentStep('assessment');
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Assessment (+25 XP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 7: ASSESSMENT */}
          {currentStep === 'assessment' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                      Hierarchy Level 7 of 8 • Formative Quiz
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      Competency Assessment: {selectedTopic?.title}
                    </h3>
                  </div>
                  <span className="text-xs font-black text-slate-500">
                    Question {assessmentCurrentIndex + 1} of {assessmentQuestions.length || 1}
                  </span>
                </div>

                {assessmentQuestions.length > 0 ? (
                  <div className="space-y-5">
                    {/* Question text */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm sm:text-base font-bold text-slate-900">
                        {assessmentQuestions[assessmentCurrentIndex]?.question}
                      </p>
                    </div>

                    {/* Hint Toggle */}
                    {(assessmentQuestions[assessmentCurrentIndex]?.hint1 || assessmentQuestions[assessmentCurrentIndex]?.hint2) && (
                      <div>
                        <button
                          onClick={() => setAssessmentShowHint(!assessmentShowHint)}
                          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>{assessmentShowHint ? 'Hide Hint' : 'Show Mathematical Hint'}</span>
                        </button>
                        {assessmentShowHint && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mt-1">
                            💡 {assessmentQuestions[assessmentCurrentIndex].hint1 || assessmentQuestions[assessmentCurrentIndex].hint2}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Options */}
                    <div className="grid gap-2.5">
                      {assessmentQuestions[assessmentCurrentIndex]?.options?.map((opt, optIdx) => {
                        const isSelected = assessmentSelectedAnswers[assessmentCurrentIndex] === optIdx;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              setAssessmentSelectedAnswers({
                                ...assessmentSelectedAnswers,
                                [assessmentCurrentIndex]: optIdx
                              });
                            }}
                            className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-3 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation between questions / Submit */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        disabled={assessmentCurrentIndex === 0}
                        onClick={() => {
                          setAssessmentCurrentIndex(prev => Math.max(0, prev - 1));
                          setAssessmentShowHint(false);
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 disabled:opacity-30 cursor-pointer"
                      >
                        Previous
                      </button>

                      {assessmentCurrentIndex < assessmentQuestions.length - 1 ? (
                        <button
                          onClick={() => {
                            setAssessmentCurrentIndex(prev => prev + 1);
                            setAssessmentShowHint(false);
                          }}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleAssessmentSubmit}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Submit & See Results</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-500">No quiz questions found for this topic.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 8: STUDENT PROGRESS & RESULT */}
          {currentStep === 'progress' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Hierarchy Level 8 of 8 • Student Result
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      Competency Mastery Scorecard
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black">
                    {selectedTopic?.title}
                  </span>
                </div>

                {/* Score Summary Box */}
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-400 text-slate-950 rounded-full text-[10px] font-black uppercase">
                        {assessmentScore >= 80 ? 'Mastery Achieved' : assessmentScore >= 50 ? 'Developing' : 'Intervention Needed'}
                      </span>
                      <span className="text-xs text-indigo-200 font-bold">+100 XP Earned</span>
                    </div>
                    <h4 className="text-2xl font-black">{profile.displayName || 'Learner'}</h4>
                    <p className="text-xs text-indigo-200 max-w-sm">
                      {assessmentScore >= 80 
                        ? 'Outstanding mathematical precision! You have mastered the learning competencies for this unit.'
                        : 'Good effort! Review the step explanations below and reinforce your procedural calculations.'}
                    </p>
                  </div>

                  <div className="w-28 h-28 rounded-full bg-white/10 border-4 border-indigo-400 flex flex-col items-center justify-center shrink-0">
                    <span className="text-3xl font-black">{assessmentScore}%</span>
                    <span className="text-[10px] text-indigo-200 uppercase font-bold">Accuracy</span>
                  </div>
                </div>

                {/* Next Steps Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleResetAssessment}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentStep('competency')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Browse More Competencies
                    </button>
                    <button
                      onClick={() => {
                        // Advance to next topic in quarter
                        const currIdx = activeQuarterTopics.findIndex(t => t.id === selectedTopicId);
                        const nextTopic = activeQuarterTopics[currIdx + 1] || activeQuarterTopics[0];
                        setSelectedTopicId(nextTopic.id);
                        handleResetAssessment();
                        setCurrentStep('competency');
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Next Competency</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
