import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, Quiz, isValidatedOrActive, SummativeAssessment, UserProfile, QuizResult } from '../types';
import { 
  ChevronLeft, 
  Star, 
  Lock, 
  Clock, 
  MessageSquare, 
  FileText, 
  Target, 
  Award, 
  Lightbulb, 
  Sparkles, 
  GraduationCap, 
  ListChecks, 
  CheckCircle2,
  BookOpen,
  CheckSquare,
  Square,
  Eye,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Briefcase,
  Compass,
  Check,
  Zap
} from 'lucide-react';
import LessonPlanModal from './LessonPlanModal';
import { ILAW_LESSON_PLANS } from '../data/ilawLessons';
import { TOPIC_QUICK_CHECKS } from '../data/topicQuickChecks';
import DetailedLessonPage from './DetailedLessonPage';

interface TopicDetailProps {
  topic: Topic;
  profile?: UserProfile;
  onBack: () => void;
  onStartQuiz: (quiz: Quiz, mode?: 'diagnostic' | 'assessment') => void;
  onOpenChat?: (topicId: string, quizId?: string) => void;
  onStartSummativeAssessment?: (assessment: SummativeAssessment) => void;
  isSummativeCompleted?: boolean;
  onSaveQuizResult?: (result: Omit<QuizResult, 'timestamp'>) => void;
  onAddXP?: (amount: number) => void;
}

export default function TopicDetail({ 
  topic, 
  profile,
  onBack, 
  onStartQuiz, 
  onOpenChat,
  onStartSummativeAssessment,
  isSummativeCompleted,
  onSaveQuizResult,
  onAddXP
}: TopicDetailProps) {
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<'detailed-lesson' | 'ilaw-lesson' | 'quizzes'>('detailed-lesson');
  const [selectedPillar, setSelectedPillar] = useState<'ALL' | 'I' | 'L' | 'A' | 'W'>('ALL');

  // Interactive ILAW Success Criteria Checklist
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});

  // Interactive Worked Problem Step-by-Step Reveal
  const [revealedSteps, setRevealedSteps] = useState<number>(1);

  // Interactive Formative Quick Check
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuickCheckSubmitted, setIsQuickCheckSubmitted] = useState<boolean>(false);

  // Student Reflection Note
  const [reflectionNote, setReflectionNote] = useState<string>('');
  const [isReflectionSaved, setIsReflectionSaved] = useState<boolean>(false);

  // Resolve authoritative ILAW Lesson Plan (merge with ILAW_LESSON_PLANS fallback)
  const fallbackPlan = ILAW_LESSON_PLANS[topic.id];
  const lessonPlan = topic.lessonPlan?.ilaw ? topic.lessonPlan : (fallbackPlan || topic.lessonPlan);
  const ilaw = lessonPlan?.ilaw || fallbackPlan?.ilaw;

  const quickCheck = TOPIC_QUICK_CHECKS[topic.id];

  const successCriteriaList = ilaw?.intentions.successCriteria || [
    `Understand key definitions and representations for ${topic.title}.`,
    `Apply mathematical models and formulas to evaluate given inputs.`,
    `Solve contextual problems aligned with DepEd Grade 11 standards.`
  ];

  const checkedCount = Object.values(checkedCriteria).filter(Boolean).length;
  const totalCriteria = successCriteriaList.length;
  const progressPercent = totalCriteria > 0 ? Math.round((checkedCount / totalCriteria) * 100) : 0;

  const workedExample = lessonPlan?.workedExamples?.[0] || fallbackPlan?.workedExamples?.[0];
  const totalSteps = workedExample?.stepByStepSolution?.length || 0;

  const toggleCriteria = (idx: number) => {
    setCheckedCriteria(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleRevealNextStep = () => {
    if (revealedSteps < totalSteps) {
      setRevealedSteps(prev => prev + 1);
    }
  };

  const handleRevealAllSteps = () => {
    setRevealedSteps(totalSteps);
  };

  const handleResetSteps = () => {
    setRevealedSteps(1);
  };

  const handleSaveReflection = () => {
    if (reflectionNote.trim()) {
      setIsReflectionSaved(true);
      setTimeout(() => setIsReflectionSaved(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
    >
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button 
          id="back-to-topics-button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back to Syllabus</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id={`open-full-lesson-plan-${topic.id}`}
            onClick={() => setShowLessonPlan(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Open DepEd D.O. 016 & ILAW Full Matrix Lesson Plan"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full DepEd DLP Matrix</span>
          </button>

          {onOpenChat && (
            <button
              id={`chat-study-topic-${topic.id}`}
              onClick={() => onOpenChat(topic.id)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Chat with classmates about this topic"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Peer Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Topic Title & Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>DepEd ILAW Framework</span>
            </span>
            <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
              Grade 11 Mathematics • {topic.term || 'Term 1'} • {topic.week || 'Week 1'}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              DepEd D.O. 016 s. 2026 Aligned
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{topic.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {topic.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-1 border-t border-white/10 mt-3">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Compass className="w-3.5 h-3.5" />
              4 ILAW Pillars (I • L • A • W)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <ListChecks className="w-3.5 h-3.5" />
              {topic.quizzes.length} Formative Practice Quizzes
            </span>
            {topic.summativeAssessment && (
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                Summative Exam ({topic.summativeAssessment.passingScorePercentage}% Pass Benchmark)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Switcher: Detailed Interactive Lesson vs DepEd ILAW Lesson Guide vs Quizzes & Assessments */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1.5 overflow-x-auto scrollbar-none">
        <button
          id="tab-detailed-lesson"
          onClick={() => setActiveTab('detailed-lesson')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'detailed-lesson'
              ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Detailed Lesson (9 Steps)</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'detailed-lesson' ? 'bg-white text-indigo-900' : 'bg-amber-100 text-amber-900'
          }`}>
            Progress Saved
          </span>
        </button>

        <button
          id="tab-ilaw-lesson-guide"
          onClick={() => setActiveTab('ilaw-lesson')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'ilaw-lesson'
              ? 'bg-white text-indigo-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>DepEd ILAW DLP Matrix</span>
        </button>

        <button
          id="tab-quizzes-assessments"
          onClick={() => setActiveTab('quizzes')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'quizzes'
              ? 'bg-white text-indigo-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4 text-indigo-600" />
          <span>Quizzes & Assessments</span>
          <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black">
            {topic.quizzes.length + (topic.summativeAssessment ? 1 : 0)} Tests
          </span>
        </button>
      </div>

      {/* TAB 0: DETAILED INTERACTIVE LESSON PAGE (9-STEP PROGRESS FLOW) */}
      {activeTab === 'detailed-lesson' && (
        <DetailedLessonPage
          topic={topic}
          profile={profile || ({ uid: 'student', displayName: 'Student' } as any)}
          onBack={onBack}
          onSaveQuizResult={onSaveQuizResult}
          onAddXP={onAddXP}
          onStartFullQuiz={() => setActiveTab('quizzes')}
        />
      )}

      {/* TAB 1: DEPED ILAW LESSON GUIDE */}
      {activeTab === 'ilaw-lesson' && (
        <div className="space-y-6">
          {/* Pillar Selector Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Filter ILAW Pillar:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { key: 'ALL', label: 'All 4 Pillars', color: 'bg-slate-900 text-white' },
                { key: 'I', label: 'I • Intentions', color: 'bg-amber-500 text-white' },
                { key: 'L', label: 'L • Learning Experience', color: 'bg-indigo-600 text-white' },
                { key: 'A', label: 'A • Assessing Learning', color: 'bg-emerald-600 text-white' },
                { key: 'W', label: 'W • Ways Forward', color: 'bg-purple-600 text-white' }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPillar(p.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedPillar === p.key
                      ? p.color + ' shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* PILLAR 1: INTENTIONS (Layunin at Pamantayan) */}
          {(selectedPillar === 'ALL' || selectedPillar === 'I') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-sm relative overflow-hidden space-y-5"
            >
              <div className="flex items-center justify-between border-b border-amber-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                    I
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Pillar 1
                      </span>
                      <h2 className="text-xl font-black text-slate-900">INTENTIONS</h2>
                    </div>
                    <p className="text-xs text-amber-900 font-bold">Layunin, Pamantayan at Kompetensya</p>
                  </div>
                </div>
                <Target className="w-7 h-7 text-amber-500/70" />
              </div>

              {/* Core Learning Intention Statement */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
                <span className="text-xs font-extrabold text-amber-900 block mb-1">
                  Primary Learning Intention:
                </span>
                <p className="text-slate-800 text-sm font-medium leading-relaxed">
                  {ilaw?.intentions.learningIntentions || topic.weeklyFocus || topic.description}
                </p>
              </div>

              {/* DepEd MELCs Competencies */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  Official DepEd Most Essential Learning Competencies (MELCs):
                </span>
                <div className="space-y-1.5">
                  {(ilaw?.intentions.competencies || lessonPlan?.learningCompetencies || []).map((comp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs">
                      <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-black flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive "I Can" Success Criteria Checklist */}
              <div className="bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 p-5 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      <span>Interactive "I Can" Success Criteria</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Check off competencies as you master them throughout this lesson.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-900">
                      {checkedCount} of {totalCriteria} Mastered ({progressPercent}%)
                    </span>
                    <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {successCriteriaList.map((crit, idx) => {
                    const isChecked = !!checkedCriteria[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCriteria(idx)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked 
                            ? 'bg-amber-100/70 border-amber-300 text-amber-950' 
                            : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 text-amber-600 shrink-0">
                          {isChecked ? <CheckSquare className="w-5 h-5 text-amber-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div className="text-xs font-medium leading-relaxed">
                          <strong className="text-amber-900 mr-1">I can:</strong>
                          <span className={isChecked ? 'font-semibold' : ''}>{crit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prior Knowledge Prerequisites */}
              {(ilaw?.intentions.priorKnowledge || lessonPlan?.prerequisites?.length) && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Prerequisite Foundational Knowledge:
                  </span>
                  <p className="text-slate-800 font-medium">
                    {ilaw?.intentions.priorKnowledge || lessonPlan?.prerequisites.join(', ')}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* PILLAR 2: LEARNING EXPERIENCE (Karanasan sa Pagkatuto) */}
          {(selectedPillar === 'ALL' || selectedPillar === 'L') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-indigo-200 shadow-sm relative overflow-hidden space-y-6"
            >
              <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                    L
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        Pillar 2
                      </span>
                      <h2 className="text-xl font-black text-slate-900">LEARNING EXPERIENCE</h2>
                    </div>
                    <p className="text-xs text-indigo-900 font-bold">Karanasan at Pagtuklas sa Pagkatuto</p>
                  </div>
                </div>
                <BookOpen className="w-7 h-7 text-indigo-500/70" />
              </div>

              {/* Real-World Priming Hook */}
              {ilaw?.learningExperience.primingActivity && (
                <div className="bg-gradient-to-r from-indigo-50/80 to-violet-50/80 p-5 rounded-2xl border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Real-World Priming Hook (Situational Motivation)</span>
                  </div>
                  <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                    {ilaw.learningExperience.primingActivity}
                  </p>
                </div>
              )}

              {/* Key Mathematical Formulas & Models */}
              {ilaw?.learningExperience.keyFormulas && ilaw.learningExperience.keyFormulas.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                    Essential Mathematical Formulas & Governing Equations:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ilaw.learningExperience.keyFormulas.map((kf, kfIdx) => (
                      <div key={kfIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs">{kf.name}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 font-mono font-bold text-[11px] rounded-md">
                            {kf.formula}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{kf.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Step-by-Step Worked Demonstration */}
              {workedExample && (
                <div className="bg-white rounded-2xl p-5 border-2 border-indigo-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Teacher Demonstration
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {workedExample.title || 'Worked Problem Example'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        onClick={handleRevealNextStep}
                        disabled={revealedSteps >= totalSteps}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Reveal Next Step ({revealedSteps}/{totalSteps})</span>
                      </button>
                      <button
                        onClick={handleRevealAllSteps}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] cursor-pointer transition-all"
                      >
                        Show All
                      </button>
                      <button
                        onClick={handleResetSteps}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
                        title="Reset steps"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900">
                    <span className="text-slate-500 font-normal block mb-1">Problem Statement:</span>
                    {workedExample.problem}
                  </div>

                  {/* Progressive Steps */}
                  <div className="space-y-2 pt-1">
                    {workedExample.stepByStepSolution?.slice(0, revealedSteps).map((step, sIdx) => (
                      <motion.div
                        key={sIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 text-xs font-medium text-slate-800 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </motion.div>
                    ))}

                    {revealedSteps < totalSteps && (
                      <div className="text-center py-2">
                        <button
                          onClick={handleRevealNextStep}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{totalSteps - revealedSteps} more step(s) hidden — click to test your thinking first</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Guided Collaborative Practice Prompt */}
              {ilaw?.learningExperience.guidedExercises && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <span className="font-extrabold text-slate-900 block">Guided Practice & Pair Activity:</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{ilaw.learningExperience.guidedExercises}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* PILLAR 3: ASSESSING LEARNING (Pagtatasa sa Pagkatuto) */}
          {(selectedPillar === 'ALL' || selectedPillar === 'A') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm relative overflow-hidden space-y-6"
            >
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Pillar 3
                      </span>
                      <h2 className="text-xl font-black text-slate-900">ASSESSING LEARNING</h2>
                    </div>
                    <p className="text-xs text-emerald-900 font-bold">Pagtatasa at Pagsukat sa Pagkatuto</p>
                  </div>
                </div>
                <CheckCircle2 className="w-7 h-7 text-emerald-500/70" />
              </div>

              {/* Embedded Interactive Formative Quick Check */}
              {quickCheck && (
                <div className="bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 p-5 rounded-2xl border-2 border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      Interactive Formative Quick Check
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Instant Concept Feedback</span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {quickCheck.question}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {quickCheck.options.map((opt, oIdx) => {
                      const isSelected = selectedOption === oIdx;
                      const isCorrect = oIdx === quickCheck.correctIndex;
                      let optionStyle = 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800';

                      if (isQuickCheckSubmitted) {
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isSelected && !isCorrect) {
                          optionStyle = 'bg-rose-100/80 border-rose-400 text-rose-950 font-bold';
                        } else {
                          optionStyle = 'bg-slate-50 border-slate-200 opacity-60 text-slate-500';
                        }
                      } else if (isSelected) {
                        optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isQuickCheckSubmitted}
                          onClick={() => setSelectedOption(oIdx)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${optionStyle}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Banner */}
                  {isQuickCheckSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                        selectedOption === quickCheck.correctIndex
                          ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="font-extrabold flex items-center gap-1.5">
                        {selectedOption === quickCheck.correctIndex ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct! Excellent mathematical reasoning.</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="w-4 h-4 text-rose-600" />
                            <span>Keep practicing! Review the explanation below:</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-700 font-medium pt-0.5">{quickCheck.explanation}</p>
                    </motion.div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => setIsQuickCheckSubmitted(true)}
                        disabled={selectedOption === null}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Submit Quick Check
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Assessment Pathway Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Diagnostic Quiz Card */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                      Diagnostic Practice
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Practice with Progressive Hints</h4>
                    <p className="text-[11px] text-slate-600">
                      Learn adaptively. If you make a mistake, progressive scaffolding hints will guide you step-by-step.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('quizzes');
                      if (topic.quizzes[0]) onStartQuiz(topic.quizzes[0], 'diagnostic');
                    }}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Launch Diagnostic Practice</span>
                  </button>
                </div>

                {/* Competency Assessment Card */}
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider">
                      Competency Assessment
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Level Assessment Tests</h4>
                    <p className="text-[11px] text-slate-600">
                      Prove your mastery under official testing conditions to earn XP and unlock higher difficulty levels.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('quizzes')}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Level Quizzes</span>
                  </button>
                </div>
              </div>

              {/* Benchmark Standard */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">DepEd Mastery Benchmark:</span>
                  <span className="text-slate-600 text-[11px]">
                    {ilaw?.assessingLearning.successThreshold || '75%-80% passing threshold for competency achievement.'}
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold rounded-lg text-xs">
                  75%-80% Standard
                </span>
              </div>
            </motion.div>
          )}

          {/* PILLAR 4: WAYS FORWARD (Hakbang Mula Rito) */}
          {(selectedPillar === 'ALL' || selectedPillar === 'W') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-200 shadow-sm relative overflow-hidden space-y-6"
            >
              <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">
                    W
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        Pillar 4
                      </span>
                      <h2 className="text-xl font-black text-slate-900">WAYS FORWARD</h2>
                    </div>
                    <p className="text-xs text-purple-900 font-bold">Hakbang Mula Rito at Kinabukasan</p>
                  </div>
                </div>
                <GraduationCap className="w-7 h-7 text-purple-500/70" />
              </div>

              {/* Philippine Career Pathways */}
              {ilaw?.waysForward.realWorldCareers && ilaw.waysForward.realWorldCareers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <span>Real-World Philippine Career Pathways:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ilaw.waysForward.realWorldCareers.map((career, crIdx) => (
                      <span
                        key={crIdx}
                        className="px-3.5 py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold"
                      >
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Differentiated Pathways (Remediation vs Enrichment) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Remediation */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5 text-xs">
                  <span className="font-extrabold text-amber-900 block uppercase tracking-wider text-[10px]">
                    Remediation & Review Pathway:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {ilaw?.waysForward.remediationAction || lessonPlan?.differentiation.remediation}
                  </p>
                </div>

                {/* Enrichment */}
                <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-1.5 text-xs">
                  <span className="font-extrabold text-indigo-900 block uppercase tracking-wider text-[10px]">
                    Enrichment & Challenge Pathway:
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {ilaw?.waysForward.enrichmentChallenge || lessonPlan?.differentiation.enrichment}
                  </p>
                </div>
              </div>

              {/* Metacognitive Reflection Journal Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                    <span>Learner Metacognitive Reflection Log</span>
                  </span>
                  {isReflectionSaved && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Check className="w-3 h-3" /> Note Saved
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600">
                  {ilaw?.waysForward.nextSteps || 'How does mastering this mathematical topic help solve real challenges in your home, community, or future profession?'}
                </p>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={reflectionNote}
                    onChange={(e) => setReflectionNote(e.target.value)}
                    placeholder="Write your study takeaway or real-world application reflection here..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveReflection}
                      disabled={!reflectionNote.trim()}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Save Journal Reflection
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom Call to Action to Quizzes */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 p-6 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-white">Finished Studying the ILAW Lesson?</h3>
              <p className="text-xs text-indigo-200">
                Proceed to the Quizzes & Assessments tab to test your mastery and earn XP.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('quizzes');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Go to Quizzes & Assessments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: QUIZZES & ASSESSMENTS */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Summative Assessment (Aligned to DepEd Table of Specifications) */}
          {topic.summativeAssessment && onStartSummativeAssessment && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-lg border border-indigo-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
                      <Target className="w-3 h-3 text-slate-950" />
                      <span>Summative Assessment</span>
                    </span>
                    <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                      DepEd Table of Specifications (TOS)
                    </span>
                    {isSummativeCompleted && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {topic.summativeAssessment.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {topic.summativeAssessment.description}
                    </p>
                  </div>

                  {/* Competency outcomes pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-400 text-[11px] font-bold">Targeted Outcomes:</span>
                    {topic.summativeAssessment.intendedOutcomes.map((ilo) => (
                      <span
                        key={ilo.id}
                        title={ilo.title}
                        className="font-mono text-[10px] font-bold bg-white/10 hover:bg-white/20 text-indigo-200 px-2 py-0.5 rounded-md transition-colors"
                      >
                        {ilo.code}
                      </span>
                    ))}
                  </div>

                  {/* Assessment Meta Badges */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5 text-indigo-300">
                      <ListChecks className="w-4 h-4" />
                      {topic.summativeAssessment.problems.length} Assessment Items
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {topic.summativeAssessment.durationMinutes} Minutes
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Award className="w-4 h-4" />
                      +{topic.summativeAssessment.xpReward} XP
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      Passing: {topic.summativeAssessment.passingScorePercentage}%
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
                  <button
                    id={`start-summative-btn-${topic.id}`}
                    onClick={() => onStartSummativeAssessment(topic.summativeAssessment!)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{isSummativeCompleted ? 'Retake Summative Exam' : 'Take Summative Assessment'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formative Quizzes Section Header */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Formative Practice & Level Quizzes</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Diagnostic (learn with hints) vs Assessment (competency test)
            </span>
          </div>

          {/* Quiz List */}
          <div className="grid gap-4">
            {topic.quizzes.map((quiz, index) => {
              const activeCount = quiz.problems.filter(isValidatedOrActive).length;
              const isAvailable = activeCount > 0;

              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all ${
                    isAvailable ? 'hover:border-indigo-200' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                      isAvailable 
                        ? 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                        {!isAvailable && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                            Validation Pending
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          +{quiz.xpReward} XP
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{quiz.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="text-slate-400 font-medium">
                          {activeCount} {activeCount === 1 ? 'item' : 'items'} available
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-500" /> Hints in Diagnostic
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-indigo-700 font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3 text-indigo-500" /> Advance in Assessment
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-end">
                    {isAvailable ? (
                      <>
                        {/* Diagnostic Mode Button (Learn with Hints) */}
                        <button 
                          id={`start-diagnostic-quiz-${quiz.id}`}
                          onClick={() => onStartQuiz(quiz, 'diagnostic')}
                          className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                          title="Diagnostic Quiz: Learn with progressive hints until you get the answer"
                        >
                          <Target className="w-4 h-4 text-amber-600" />
                          <span>Diagnostic (Hints)</span>
                        </button>

                        {/* Assessment Mode Button (Prove Competency) */}
                        <button 
                          id={`start-assessment-quiz-${quiz.id}`}
                          onClick={() => onStartQuiz(quiz, 'assessment')}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-md shadow-indigo-200 active:scale-95 cursor-pointer"
                          title="Assessment Quiz: Test competency to proceed to the next level quiz"
                        >
                          <Award className="w-4 h-4" />
                          <span>Assessment (Test)</span>
                        </button>
                      </>
                    ) : (
                      <div 
                        className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center cursor-not-allowed"
                        title="Awaiting validated items"
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Locked Progression Challenge */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-400 italic">Next Level Progression Challenge</h3>
                  <p className="text-sm text-slate-400">Pass the Assessment Quiz with 75%+ score to unlock the next level</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for full Detailed Lesson Plan / D.O. 016 Matrix */}
      {showLessonPlan && (
        <LessonPlanModal
          topic={topic}
          isFaculty={false}
          onClose={() => setShowLessonPlan(false)}
        />
      )}
    </motion.div>
  );
}
