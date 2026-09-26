import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit3, 
  PlusCircle, 
  FileText, 
  Sparkles, 
  Check, 
  Save, 
  Copy, 
  Trash2, 
  Eye, 
  Send, 
  Layers, 
  Calendar, 
  Clock, 
  BookOpen, 
  RotateCcw, 
  AlertOctagon, 
  Loader2,
  Search,
  Filter,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
  Target,
  GraduationCap,
  ArrowRight,
  Compass,
  Zap,
  HelpCircle,
  Globe
} from 'lucide-react';
import { Topic, LessonPlan } from '../../types';
import { useIlawLessons } from '../../hooks/useIlawLessons';
import IlawLessonModal from '../IlawLessonModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal';

interface TeacherLessonManagerViewProps {
  topics: Topic[];
  initialSubTab?: 'my' | 'create' | 'drafts' | 'published' | 'templates';
}

export default function TeacherLessonManagerView({
  topics,
  initialSubTab = 'my'
}: TeacherLessonManagerViewProps) {
  const {
    lessons,
    loading: ilawLoading,
    saveIlawLesson,
    deleteIlawLesson,
    duplicateIlawLesson,
    togglePublishStatus,
    resetToDefaults
  } = useIlawLessons();

  const [subTab, setSubTab] = useState<'my' | 'create' | 'drafts' | 'published' | 'templates'>(initialSubTab);

  // Sync subTab if initialSubTab prop changes
  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>('All');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('All');

  // Modal states
  const [isIlawModalOpen, setIsIlawModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<LessonPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewingLesson, setPreviewingLesson] = useState<LessonPlan | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  // Reset confirmation modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Form State for "Create Lesson" sub-tab inline editor
  const [newTitle, setNewTitle] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || 'functions');
  const [term, setTerm] = useState('Term 1');
  const [week, setWeek] = useState('Week 1');
  const [section, setSection] = useState('Grade 11 – Gauss (STEM-A)');
  const [duration, setDuration] = useState('60 minutes');
  const [competency, setCompetency] = useState('');
  const [intentions, setIntentions] = useState('');
  const [learningExperience, setLearningExperience] = useState('');
  const [assessingLearning, setAssessingLearning] = useState('');
  const [waysForward, setWaysForward] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter lessons based on subTab, search, term, topic
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      // Sub-tab filter
      if (subTab === 'drafts' && l.status !== 'Draft') return false;
      if (subTab === 'published' && l.status === 'Draft') return false;

      // Quarter / Term filter
      if (selectedTermFilter !== 'All') {
        const lessonTerm = (l.term || '').toLowerCase();
        const filterTerm = selectedTermFilter.toLowerCase();
        if (!lessonTerm.includes(filterTerm)) return false;
      }

      // Topic filter
      if (selectedTopicFilter !== 'All') {
        if (l.topicId !== selectedTopicFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchTopic = (topics.find(t => t.id === l.topicId)?.title || '').toLowerCase().includes(q);
        const matchComp = (l.learningCompetencies || []).some(c => c.toLowerCase().includes(q)) || 
                          (l.ilaw?.intentions?.competencies || []).some(c => c.toLowerCase().includes(q));
        const matchIntentions = (l.ilaw?.intentions?.learningIntentions || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTopic && !matchComp && !matchIntentions) return false;
      }

      return true;
    });
  }, [lessons, subTab, selectedTermFilter, selectedTopicFilter, searchQuery, topics]);

  // Handlers for Add, Edit, Delete
  const handleOpenCreateModal = () => {
    setEditingLesson(null);
    setIsIlawModalOpen(true);
  };

  const handleEditLesson = (lesson: LessonPlan) => {
    setEditingLesson(lesson);
    setIsIlawModalOpen(true);
  };

  const handleSaveModalLesson = async (savedData: Partial<LessonPlan> & { title: string }) => {
    const isEdit = !!editingLesson;
    const saved = await saveIlawLesson(savedData);
    showToast(isEdit ? `Updated "${saved.title}" successfully!` : `Created "${saved.title}" successfully!`);
    setIsIlawModalOpen(false);
    setEditingLesson(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLesson) return;
    setIsDeleting(true);
    try {
      await deleteIlawLesson(deletingLesson.id);
      showToast(`ILAW Lesson "${deletingLesson.title}" has been deleted.`, 'info');
      setDeletingLesson(null);
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      showToast(err.message || 'Failed to delete lesson.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (lesson: LessonPlan) => {
    const cloned = await duplicateIlawLesson(lesson.id);
    if (cloned) {
      showToast(`Duplicated "${lesson.title}" as draft copy!`);
      setSubTab('drafts');
    }
  };

  const handleTogglePublish = async (lesson: LessonPlan) => {
    const updated = await togglePublishStatus(lesson.id);
    if (updated) {
      const isNowPublished = updated.status === 'Published';
      showToast(
        isNowPublished
          ? `Published "${updated.title}" to student portal!`
          : `Moved "${updated.title}" to drafts.`,
        'success'
      );
    }
  };

  // Inline "Create Lesson" tab submit
  const handleCreateInlineLesson = async (targetStatus: 'Published' | 'Draft') => {
    if (!newTitle.trim()) {
      alert('Please provide a lesson title.');
      return;
    }

    setIsSubmittingForm(true);
    const matchedTopic = topics.find(t => t.id === selectedTopicId) || topics[0];

    try {
      const newPlan: Partial<LessonPlan> & { title: string } = {
        title: newTitle.trim(),
        topicId: selectedTopicId || matchedTopic?.id || 'functions',
        term,
        week,
        section,
        duration,
        status: targetStatus,
        updatedAt: targetStatus === 'Published' ? 'Published just now' : 'Draft saved just now',
        learningCompetencies: competency.trim() ? [competency.trim()] : [
          `M11GM-Ia-1: Applies core mathematical models for ${matchedTopic?.title || 'General Mathematics'}.`
        ],
        objectives: {
          cognitive: intentions.trim() || 'Understand core definitions, formulate equations, and solve problems.',
          psychomotor: 'Perform step-by-step mathematical procedures accurately.',
          affective: 'Appreciate the practical utility of mathematics in everyday decision making.'
        },
        ilaw: {
          intentions: {
            learningIntentions: intentions.trim() || 'Master fundamental principles and problem solving.',
            successCriteria: [
              'Differentiate between core conditions and models.',
              'Evaluate expressions with high accuracy.',
              'Solve real-world contextual situational problems.'
            ],
            competencies: competency.trim() ? [competency.trim()] : [
              'M11GM-Ia-1: Represents real-life situations using mathematical functions.'
            ],
            priorKnowledge: 'Prerequisite foundational arithmetic and algebraic equations.'
          },
          learningExperience: {
            primingActivity: learningExperience.trim() || 'Real-world priming scenario engaging student intuition.',
            coreInstruction: 'Teacher-led conceptual modeling, theorem discussions, and algebraic derivations.',
            guidedExercises: 'Collaborative problem solving, paired exercises, and board demonstrations.',
            keyFormulas: [
              { name: 'Standard Equation', formula: 'f(x) = y', explanation: 'Relates domain inputs to range outputs.' }
            ]
          },
          assessingLearning: {
            formativeAssessment: assessingLearning.trim() || '5-item immediate feedback check with scaffolded hints.',
            diagnosticQuizPlan: '5-item adaptive baseline diagnostic check.',
            successThreshold: '80% mastery benchmark.',
            summativeAssessmentPlan: '10-item unit summative exam aligned with Table of Specifications (TOS).'
          },
          waysForward: {
            nextSteps: waysForward.trim() || 'Student reflection entry in learning journal on real-world connections.',
            remediationAction: 'Targeted 7-step review pathway and scaffolded substitution templates.',
            enrichmentChallenge: 'Higher-order modeling challenge and Olympiad-style math sprint.',
            realWorldCareers: ['Data Analytics', 'Software Engineering', 'Financial Mathematics']
          }
        }
      };

      const saved = await saveIlawLesson(newPlan);
      setSaveSuccess(true);
      showToast(targetStatus === 'Published' ? `Published "${saved.title}"!` : `Saved "${saved.title}" as draft!`);

      // Reset form
      setNewTitle('');
      setCompetency('');
      setIntentions('');
      setLearningExperience('');
      setAssessingLearning('');
      setWaysForward('');

      setTimeout(() => {
        setSaveSuccess(false);
        setSubTab(targetStatus === 'Published' ? 'published' : 'drafts');
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save inline lesson:', err);
      showToast(err.message || 'Failed to save lesson plan.', 'error');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleApplyTemplate = (type: string) => {
    if (type === 'ilaw') {
      setIntentions('1. Understand theoretical definitions.\n2. Master step-by-step procedural calculations.\n3. Solve practical contextual word problems.');
      setLearningExperience('• Activity: Real-life scenario framing & inquiry\n• Analysis: Formula breakdown and step derivation\n• Abstraction: Generalization & mathematical modeling\n• Application: Board exercises & pair work');
      setAssessingLearning('• 5-item formative quiz with hints enabled\n• Summative exam with DepEd TOS distribution\n• 80% competency proficiency benchmark');
      setWaysForward('• Adaptive 7-step remediation for scores <75%\n• Math Blitz speed challenge for enrichment');
    } else if (type === 'dll') {
      setIntentions('DepEd Daily Lesson Log (DLL): Content and performance standards alignment with MELCs.');
      setLearningExperience('Review previous lesson, establish lesson purpose, present new examples, discuss new concepts, develop mastery through board work.');
      setAssessingLearning('Evaluating learning: 5-item formative check in notebook/quiz app. Additional activities for application.');
      setWaysForward('Remediation activities for learners who scored below 80%. Enrichment activities for mastery.');
    } else if (type === '4a') {
      setIntentions('Experiential Learning Model: Real-world inquiry leading to abstract algebraic mastery.');
      setLearningExperience('• Activity: Collaborative puzzle or hands-on data gathering\n• Analysis: Questioning why the model works\n• Abstraction: Formalizing the formula\n• Application: Real-world case study');
      setAssessingLearning('Formative checkpoint evaluation with 80% mastery target.');
      setWaysForward('Personalized learning pathway for differentiated learner needs.');
    }
  };

  const handlePerformResetLessons = async () => {
    setIsResetting(true);
    setResetMessage(null);
    try {
      await resetToDefaults();
      setResetMessage('Baseline DepEd ILAW lesson exemplars restored successfully.');
      showToast('Restored default DepEd ILAW lesson exemplars.', 'info');
      setTimeout(() => {
        setIsResetting(false);
        setIsResetModalOpen(false);
        setResetMessage(null);
      }, 1200);
    } catch (e: any) {
      setIsResetting(false);
      setResetMessage('Failed to reset lessons: ' + (e.message || ''));
    }
  };

  const handlePrintDLP = (lesson: LessonPlan) => {
    setPreviewingLesson(lesson);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const draftCount = lessons.filter(l => l.status === 'Draft').length;
  const publishedCount = lessons.filter(l => l.status !== 'Draft').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-black backdrop-blur-md ${
              feedbackToast.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-500/50'
                : feedbackToast.type === 'info'
                ? 'bg-slate-900/90 text-sky-200 border-sky-500/50'
                : 'bg-slate-900/90 text-emerald-200 border-emerald-500/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast.message}</span>
            <button
              onClick={() => setFeedbackToast(null)}
              className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                <span>Instructional Planning Engine</span>
              </span>
              <span className="bg-white/10 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                DepEd D.O. No. 016, s. 2024
              </span>
              <span className="bg-indigo-500/20 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ILAW Framework (I-L-A-W)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              DepEd ILAW Lesson Management & DLP Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Create, author, edit, and publish official DepEd ILAW Daily Lesson Plans. Synchronized in real-time across teacher instructional records and the student curriculum portal.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New ILAW Lesson</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5"
              title="Reset lessons to DepEd baseline exemplars"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Reset Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('my')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'my'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>My Lessons</span>
          <span className="px-2 py-0.5 bg-slate-800 text-emerald-300 rounded-full text-[10px] font-black">
            {lessons.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('create')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'create'
              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Create Lesson</span>
        </button>

        <button
          onClick={() => setSubTab('drafts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'drafts'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Drafts</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black">
            {draftCount}
          </span>
        </button>

        <button
          onClick={() => setSubTab('published')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'published'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Published</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-black">
            {publishedCount}
          </span>
        </button>

        <button
          onClick={() => setSubTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'templates'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Lesson Templates</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR (for listing tabs) */}
      {subTab !== 'create' && subTab !== 'templates' && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by lesson title, curriculum unit, competency code, or ILAW pillars..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Quarter:</span>
              {['All', 'Term 1', 'Term 2', 'Term 3', 'Term 4'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTermFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedTermFilter === t
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {t === 'All' ? 'All Quarters' : t}
                </button>
              ))}
            </div>

            <div className="w-full md:w-48 shrink-0">
              <select
                value={selectedTopicFilter}
                onChange={(e) => setSelectedTopicFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="All">All Curriculum Topics</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LESSON STUDIO */}
      {subTab === 'create' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-md">
                  Authoring Studio
                </span>
                <span className="text-xs text-slate-400 font-bold">DepEd Order No. 016, s. 2024</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                DepEd ILAW Daily Lesson Plan (DLP) Creator
              </h3>
              <p className="text-xs text-slate-500">
                Author a new ILAW lesson with the 4 pillars (Intentions, Learning Experience, Assessing Learning, Ways Forward).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Open Full ILAW Studio Modal</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('ilaw')}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer border border-indigo-100"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Fill ILAW</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lesson plan saved successfully! Redirecting...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Lesson Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Asymptotes, Domain & Graphing of Rational Functions"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Curriculum Topic / Unit
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title} ({t.term})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Term / Quarter
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Term 1">Term 1 (First Quarter)</option>
                <option value="Term 2">Term 2 (Second Quarter)</option>
                <option value="Term 3">Term 3 (Third Quarter)</option>
                <option value="Term 4">Term 4 (Fourth Quarter)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Week
              </label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {Array.from({ length: 10 }).map((_, idx) => (
                  <option key={idx} value={`Week ${idx + 1}`}>Week {idx + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Learning Competency Code (MELCs)
              </label>
              <input
                type="text"
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                placeholder="e.g. M11GM-Ib-1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 4 Pillars Fields */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>The 4 Pillars of DepEd ILAW Instructional Framework</span>
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('dll')}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Use DLL structure
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('4a')}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Use 4-A's structure
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                    I
                  </span>
                  <label className="text-[11px] font-bold text-indigo-950 uppercase tracking-wide">
                    1. Intentions (Objectives & Standards)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={intentions}
                  onChange={(e) => setIntentions(e.target.value)}
                  placeholder="Define learning goals, content standards, and real-world mastery targets..."
                  className="w-full p-3 bg-white border border-indigo-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-md bg-sky-600 text-white font-black text-[10px] flex items-center justify-center">
                    L
                  </span>
                  <label className="text-[11px] font-bold text-sky-950 uppercase tracking-wide">
                    2. Learning Experience (4A's Pedagogy)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={learningExperience}
                  onChange={(e) => setLearningExperience(e.target.value)}
                  placeholder="Activity, Analysis, Abstraction, and Application exercises..."
                  className="w-full p-3 bg-white border border-sky-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                    A
                  </span>
                  <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide">
                    3. Assessing Learning (Formative & Summative)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={assessingLearning}
                  onChange={(e) => setAssessingLearning(e.target.value)}
                  placeholder="Formative exit tickets, diagnostic quizzes, and benchmark passing percentage..."
                  className="w-full p-3 bg-white border border-emerald-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-black text-[10px] flex items-center justify-center">
                    W
                  </span>
                  <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">
                    4. Ways Forward (Remediation & Enrichment)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={waysForward}
                  onChange={(e) => setWaysForward(e.target.value)}
                  placeholder="Adaptive pathways for students struggling, enrichment tasks for advanced learners..."
                  className="w-full p-3 bg-white border border-amber-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmittingForm}
              onClick={() => handleCreateInlineLesson('Draft')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmittingForm}
              onClick={() => handleCreateInlineLesson('Published')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmittingForm ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Student Portal</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* LESSONS LIST (MY, DRAFTS, PUBLISHED) */}
      {subTab !== 'create' && subTab !== 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                {subTab === 'drafts'
                  ? 'Draft Lessons'
                  : subTab === 'published'
                  ? 'Published Active Lessons'
                  : 'All Authored & DepEd ILAW Lessons'} ({filteredLessons.length})
              </h3>
              {searchQuery && (
                <span className="text-[10px] text-slate-400 font-bold">
                  (Filtered by "{searchQuery}")
                </span>
              )}
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New ILAW Lesson</span>
            </button>
          </div>

          {ilawLoading ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading DepEd ILAW lessons...</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="py-12 px-6 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">No ILAW Lessons Found</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchQuery || selectedTermFilter !== 'All' || selectedTopicFilter !== 'All'
                    ? 'No lesson plans match your current filters. Clear your search or create a new lesson.'
                    : subTab === 'drafts'
                    ? 'You have no draft lesson plans. All your lessons are currently published!'
                    : 'There are currently no lesson plans here. Click below to author your first lesson!'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create ILAW Lesson</span>
                </button>
                {(searchQuery || selectedTermFilter !== 'All' || selectedTopicFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTermFilter('All');
                      setSelectedTopicFilter('All');
                    }}
                    className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLessons.map((item, idx) => {
                const il = item.ilaw;
                const isDraft = item.status === 'Draft';
                const topic = topics.find(t => t.id === item.topicId);
                const isExpanded = expandedLessonId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-950 font-black text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>

                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                              isDraft ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}>
                              {isDraft ? <Clock className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                              <span>{isDraft ? 'Draft' : 'Published'}</span>
                            </span>

                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {item.term || 'Term 1'} • {item.week || 'Week 1'}
                            </span>

                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {topic?.title || item.topicId}
                            </span>

                            <span className="text-[10px] font-medium text-slate-400">
                              {item.section || 'Grade 11'} • {item.duration || '60 mins'}
                            </span>

                            {item.updatedAt && (
                              <span className="text-[10px] text-slate-400 hidden md:inline">
                                • {item.updatedAt}
                              </span>
                            )}
                          </div>

                          <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                            {item.title}
                          </h3>

                          {item.learningCompetencies && item.learningCompetencies.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {item.learningCompetencies.slice(0, 2).map((comp, ci) => (
                                <span key={ci} className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded font-mono">
                                  {comp.length > 70 ? comp.slice(0, 68) + '...' : comp}
                                </span>
                              ))}
                              {item.learningCompetencies.length > 2 && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  +{item.learningCompetencies.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isDraft
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                            title={isDraft ? 'Publish to student portal' : 'Unpublish and move to drafts'}
                          >
                            {isDraft ? (
                              <>
                                <Send className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Publish</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>To Draft</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setPreviewingLesson(item)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            title="Preview Full DepEd Daily Lesson Plan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditLesson(item)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Edit this ILAW lesson plan"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            title="Duplicate as new draft"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingLesson(item)}
                            className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            title="Delete this ILAW lesson plan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 4 Pillars Matrix Grid Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                        {/* Pillar 1: Intentions */}
                        <div className="p-3.5 bg-indigo-50/50 border border-indigo-100/80 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                              I
                            </span>
                            <span className="text-[11px] font-black text-indigo-950 uppercase tracking-wide">
                              Intentions
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                            {il?.intentions?.learningIntentions || item.objectives?.cognitive || 'Master fundamental concepts and solve equations.'}
                          </p>
                          <div className="text-[10px] font-bold text-indigo-700 pt-0.5">
                            ✓ {il?.intentions?.successCriteria?.length || 3} Success Criteria
                          </div>
                        </div>

                        {/* Pillar 2: Learning Experience */}
                        <div className="p-3.5 bg-sky-50/50 border border-sky-100/80 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-sky-600 text-white font-black text-[10px] flex items-center justify-center">
                              L
                            </span>
                            <span className="text-[11px] font-black text-sky-950 uppercase tracking-wide">
                              Learning Exp
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                            {il?.learningExperience?.primingActivity || 'Priming hook, guided derivations & collaborative exercises.'}
                          </p>
                          <div className="text-[10px] font-bold text-sky-700 pt-0.5">
                            ⚙ {il?.learningExperience?.keyFormulas?.length || 1} Key Formulas
                          </div>
                        </div>

                        {/* Pillar 3: Assessing Learning */}
                        <div className="p-3.5 bg-emerald-50/50 border border-emerald-100/80 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                              A
                            </span>
                            <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wide">
                              Assessing
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                            {il?.assessingLearning?.formativeAssessment || item.assessmentPlan || '5-item formative quiz with hints.'}
                          </p>
                          <div className="text-[10px] font-black text-emerald-700 pt-0.5">
                            ★ Benchmark: {il?.assessingLearning?.successThreshold || '80%'}
                          </div>
                        </div>

                        {/* Pillar 4: Ways Forward */}
                        <div className="p-3.5 bg-amber-50/50 border border-amber-100/80 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-black text-[10px] flex items-center justify-center">
                              W
                            </span>
                            <span className="text-[11px] font-black text-amber-950 uppercase tracking-wide">
                              Ways Forward
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                            {il?.waysForward?.remediationAction || item.differentiation?.remediation || 'Adaptive 7-step remediation review.'}
                          </p>
                          <div className="text-[10px] font-bold text-amber-700 pt-0.5">
                            🚀 {il?.waysForward?.realWorldCareers?.length || 3} Career Pathways
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse In-Card Details Toggle */}
                      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setExpandedLessonId(isExpanded ? null : item.id)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer py-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>Hide Full Syllabus & Schedule</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>View 5-Day Weekly Schedule & Detailed Objectives</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintDLP(item)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer py-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print DepEd DLP</span>
                        </button>
                      </div>

                      {/* Expanded In-Card Details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-3 border-t border-slate-100 space-y-4 overflow-hidden"
                        >
                          {/* Objectives Triple */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                              <span className="text-[10px] font-black uppercase text-indigo-700 block mb-1">
                                Cognitive Objective
                              </span>
                              <p className="text-xs text-slate-700 font-medium">
                                {item.objectives?.cognitive || il?.intentions?.learningIntentions || 'Master fundamental concepts.'}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                              <span className="text-[10px] font-black uppercase text-emerald-700 block mb-1">
                                Psychomotor Objective
                              </span>
                              <p className="text-xs text-slate-700 font-medium">
                                {item.objectives?.psychomotor || 'Execute procedural calculations and formulas accurately.'}
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                              <span className="text-[10px] font-black uppercase text-amber-700 block mb-1">
                                Affective Objective
                              </span>
                              <p className="text-xs text-slate-700 font-medium">
                                {item.objectives?.affective || 'Demonstrate perseverance and precision in problem solving.'}
                              </p>
                            </div>
                          </div>

                          {/* 5-Day Weekly Schedule */}
                          {item.weeklySchedule && item.weeklySchedule.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                                5-Day DepEd Weekly Sequence
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                                {item.weeklySchedule.map((dayItem, dIdx) => (
                                  <div key={dIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-slate-900">{dayItem.day}</span>
                                      <span className="text-[9px] font-bold text-slate-400">{dayItem.activityType}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-800 line-clamp-2">
                                      {dayItem.lessonTitle}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bottom Row inside card: Materials & Reference */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                            <div>
                              <span className="font-bold text-slate-700">Reference: </span>
                              <span>{item.doOrderRef || 'DepEd MATATAG / D.O. No. 016, s. 2024'}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-700">Materials: </span>
                              <span>{item.materialsNeeded?.join(', ') || 'DepEd General Mathematics Exemplar'}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TEMPLATES LIBRARY */}
      {subTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                DepEd Order No. 016, s. 2024
              </span>
              <h4 className="font-black text-slate-900 text-lg">DepEd ILAW Lesson Exemplar</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Official 4-pillar DepEd standard: <b>Intentions</b>, <b>Learning Experience</b>, <b>Assessing Learning</b>, and <b>Ways Forward</b> with diagnostic integration.
              </p>
            </div>
            <button
              onClick={() => {
                handleApplyTemplate('ilaw');
                setSubTab('create');
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Use ILAW Template
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                DepEd Standard (D.O. 42, s. 2016)
              </span>
              <h4 className="font-black text-slate-900 text-lg">Daily Lesson Log (DLL)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Streamlined log format for senior teachers featuring objectives, content, learning resources, step-by-step procedures, remarks, and learner reflection.
              </p>
            </div>
            <button
              onClick={() => {
                handleApplyTemplate('dll');
                setSubTab('create');
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Use DLL Template
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-100">
                Constructivist Pedagogy
              </span>
              <h4 className="font-black text-slate-900 text-lg">4-A's Experiential Model</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Activity, Analysis, Abstraction, and Application sequence designed for rigorous, problem-centered mathematical investigations.
              </p>
            </div>
            <button
              onClick={() => {
                handleApplyTemplate('4a');
                setSubTab('create');
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Use 4-A's Template
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit ILAW Lesson Modal */}
      <IlawLessonModal
        isOpen={isIlawModalOpen}
        lesson={editingLesson}
        topics={topics}
        onSave={handleSaveModalLesson}
        onClose={() => {
          setIsIlawModalOpen(false);
          setEditingLesson(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingLesson}
        title="Delete ILAW Lesson Plan"
        message={`Are you sure you want to permanently delete "${deletingLesson?.title}"? This will remove all 4-pillar configurations, competencies, and weekly schedules from the instructional system and student portal.`}
        confirmText="Delete Lesson Plan"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingLesson(null)}
      />

      {/* Full DLP View / Print Preview Modal */}
      <AnimatePresence>
        {previewingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">DepEd Daily Lesson Plan (DLP)</h3>
                    <p className="text-xs text-slate-300">Official Format • DepEd Order No. 016, s. 2024</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print DLP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const l = previewingLesson;
                      setPreviewingLesson(null);
                      handleEditLesson(l);
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewingLesson(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Body Content */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 font-sans text-xs">
                {/* Official DepEd Header Banner */}
                <div className="text-center border-b border-slate-300 pb-4 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Republic of the Philippines • Department of Education
                  </p>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Senior High School • General Mathematics Grade 11
                  </p>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 pt-1">
                    DAILY LESSON PLAN (DLP) — ILAW INSTRUCTIONAL FRAMEWORK
                  </h2>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Quarter / Term</span>
                    <span className="font-black text-slate-900">{previewingLesson.term || 'Term 1'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Week & Dates</span>
                    <span className="font-black text-slate-900">{previewingLesson.week || 'Week 1'} ({previewingLesson.dates || 'Current'})</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Grade & Section</span>
                    <span className="font-black text-slate-900">{previewingLesson.section || 'Grade 11 Gauss (STEM)'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Duration</span>
                    <span className="font-black text-slate-900">{previewingLesson.duration || '60 minutes'}</span>
                  </div>
                </div>

                {/* Title & Competency */}
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Topic: {previewingLesson.title}
                  </h3>
                  {previewingLesson.learningCompetencies?.map((c, ci) => (
                    <p key={ci} className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      MELCs: {c}
                    </p>
                  ))}
                </div>

                {/* I. Objectives */}
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                    I. Objectives (Standard Blooms Taxonomy)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                      <span className="font-black text-indigo-900 text-[10px] uppercase block mb-1">A. Cognitive</span>
                      <p className="text-slate-800">{previewingLesson.objectives?.cognitive || previewingLesson.ilaw?.intentions?.learningIntentions || 'Understand core definitions.'}</p>
                    </div>
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <span className="font-black text-emerald-900 text-[10px] uppercase block mb-1">B. Psychomotor</span>
                      <p className="text-slate-800">{previewingLesson.objectives?.psychomotor || 'Execute procedural calculations accurately.'}</p>
                    </div>
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span className="font-black text-amber-900 text-[10px] uppercase block mb-1">C. Affective</span>
                      <p className="text-slate-800">{previewingLesson.objectives?.affective || 'Demonstrate resilience and mathematical precision.'}</p>
                    </div>
                  </div>
                </div>

                {/* II. 4 Pillars of ILAW Framework */}
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                    II. DepEd ILAW 4-Pillar Pedagogical Execution
                  </h4>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-indigo-900 text-xs uppercase">
                        <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-[10px]">I</span>
                        <span>Pillar 1: Intentions (Learning Intentions & Success Criteria)</span>
                      </div>
                      <p className="text-slate-700 pl-6.5 leading-relaxed font-medium">
                        {previewingLesson.ilaw?.intentions?.learningIntentions || 'Master fundamental concepts.'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-sky-900 text-xs uppercase">
                        <span className="w-5 h-5 rounded bg-sky-600 text-white flex items-center justify-center text-[10px]">L</span>
                        <span>Pillar 2: Learning Experience (4A's Pedagogy & Worked Problems)</span>
                      </div>
                      <p className="text-slate-700 pl-6.5 leading-relaxed font-medium">
                        {previewingLesson.ilaw?.learningExperience?.primingActivity || 'Priming hook & guided derivations.'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-emerald-900 text-xs uppercase">
                        <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px]">A</span>
                        <span>Pillar 3: Assessing Learning (Diagnostic & Formative Checks)</span>
                      </div>
                      <p className="text-slate-700 pl-6.5 leading-relaxed font-medium">
                        {previewingLesson.ilaw?.assessingLearning?.formativeAssessment || '5-item formative quiz with hints enabled.'}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs uppercase">
                        <span className="w-5 h-5 rounded bg-amber-600 text-white flex items-center justify-center text-[10px]">W</span>
                        <span>Pillar 4: Ways Forward (Remediation & Enrichment Pathways)</span>
                      </div>
                      <p className="text-slate-700 pl-6.5 leading-relaxed font-medium">
                        {previewingLesson.ilaw?.waysForward?.remediationAction || 'Targeted 7-step remediation review.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* III. Weekly Schedule */}
                {previewingLesson.weeklySchedule && previewingLesson.weeklySchedule.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                      III. 5-Day Weekly Instructional Plan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {previewingLesson.weeklySchedule.map((d, di) => (
                        <div key={di} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="font-black text-slate-900 block text-[10px]">{d.day}</span>
                          <span className="text-[9px] font-bold text-slate-400 block">{d.activityType}</span>
                          <p className="text-xs font-semibold text-slate-800">{d.lessonTitle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Restore Baseline ILAW Lessons</h3>
                  <p className="text-xs text-rose-600 font-bold">DepEd Exemplar Baseline Restoration</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100">
                Are you sure you want to reset all ILAW lesson plans? This will restore the default DepEd General Mathematics exemplars across all curriculum topics.
              </p>

              {resetMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs">
                  {resetMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handlePerformResetLessons}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Confirm Reset</span>
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
