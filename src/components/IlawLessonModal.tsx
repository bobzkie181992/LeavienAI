import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Save, 
  BookOpen, 
  Target, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Calendar, 
  GraduationCap, 
  FileText, 
  Compass, 
  HelpCircle,
  Award,
  Zap,
  ArrowRight,
  Clock
} from 'lucide-react';
import { LessonPlan, Topic } from '../types';

interface IlawLessonModalProps {
  isOpen: boolean;
  lesson: LessonPlan | null; // null for creating new
  topics?: Topic[];
  onSave: (savedLesson: Partial<LessonPlan> & { title: string }) => Promise<void>;
  onClose: () => void;
}

export default function IlawLessonModal({
  isOpen,
  lesson,
  topics = [],
  onSave,
  onClose
}: IlawLessonModalProps) {
  const isEditing = !!lesson;

  // Active form tab
  const [activeTab, setActiveTab] = useState<'overview' | 'intentions' | 'experience' | 'assessment' | 'ways_forward' | 'schedule'>('overview');

  // Form Fields: Overview & Meta
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General Mathematics');
  const [gradeLevel, setGradeLevel] = useState('Grade 11 - General Mathematics');
  const [term, setTerm] = useState('Term 1');
  const [week, setWeek] = useState('Week 1');
  const [section, setSection] = useState('Grade 11 – Gauss (STEM-A)');
  const [duration, setDuration] = useState('60 minutes');
  const [doOrderRef, setDoOrderRef] = useState('DepEd MATATAG / D.O. No. 016, s. 2024');
  const [topicId, setTopicId] = useState('');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');

  // Pillar 1: Intentions
  const [learningIntentions, setLearningIntentions] = useState('');
  const [successCriteria, setSuccessCriteria] = useState<string[]>(['']);
  const [competencies, setCompetencies] = useState<string[]>(['']);
  const [priorKnowledge, setPriorKnowledge] = useState('');

  // Pillar 2: Learning Experience
  const [primingActivity, setPrimingActivity] = useState('');
  const [coreInstruction, setCoreInstruction] = useState('');
  const [guidedExercises, setGuidedExercises] = useState('');
  const [keyFormulas, setKeyFormulas] = useState<{ name: string; formula: string; explanation: string }[]>([]);

  // Pillar 3: Assessing Learning
  const [formativeAssessment, setFormativeAssessment] = useState('');
  const [diagnosticQuizPlan, setDiagnosticQuizPlan] = useState('');
  const [successThreshold, setSuccessThreshold] = useState('80% mastery benchmark');
  const [summativeAssessmentPlan, setSummativeAssessmentPlan] = useState('');

  // Pillar 4: Ways Forward
  const [nextSteps, setNextSteps] = useState('');
  const [remediationAction, setRemediationAction] = useState('');
  const [enrichmentChallenge, setEnrichmentChallenge] = useState('');
  const [realWorldCareers, setRealWorldCareers] = useState<string[]>([]);

  // Weekly schedule
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: 'MONDAY', date: 'Day 1', lessonTitle: '', activityType: 'Whole Class', objective: '' },
    { day: 'TUESDAY', date: 'Day 2', lessonTitle: '', activityType: 'Direct Instruction', objective: '' },
    { day: 'WEDNESDAY', date: 'Day 3', lessonTitle: '', activityType: 'Pair Work', objective: '' },
    { day: 'THURSDAY', date: 'Day 4', lessonTitle: '', activityType: 'Group Work', objective: '' },
    { day: 'FRIDAY', date: 'Day 5', lessonTitle: '', activityType: 'Individual Assessment', objective: '' }
  ]);

  // Loading & Validation state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize form when opened or lesson changes
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setSubject(lesson.subject || 'General Mathematics');
      setGradeLevel(lesson.gradeLevel || 'Grade 11 - General Mathematics');
      setTerm(lesson.term || 'Term 1');
      setWeek(lesson.week || 'Week 1');
      setSection(lesson.section || 'Grade 11 – Gauss (STEM-A)');
      setDuration(lesson.duration || '60 minutes');
      setDoOrderRef(lesson.doOrderRef || 'DepEd MATATAG / D.O. No. 016, s. 2024');
      setTopicId(lesson.topicId || '');
      setStatus(lesson.status || 'Published');

      const il = lesson.ilaw;
      setLearningIntentions(il?.intentions?.learningIntentions || '');
      setSuccessCriteria(il?.intentions?.successCriteria?.length ? il.intentions.successCriteria : ['']);
      setCompetencies(il?.intentions?.competencies?.length ? il.intentions.competencies : (lesson.learningCompetencies || ['']));
      setPriorKnowledge(il?.intentions?.priorKnowledge || '');

      setPrimingActivity(il?.learningExperience?.primingActivity || '');
      setCoreInstruction(il?.learningExperience?.coreInstruction || '');
      setGuidedExercises(il?.learningExperience?.guidedExercises || '');
      setKeyFormulas(il?.learningExperience?.keyFormulas || []);

      setFormativeAssessment(il?.assessingLearning?.formativeAssessment || '');
      setDiagnosticQuizPlan(il?.assessingLearning?.diagnosticQuizPlan || '');
      setSuccessThreshold(il?.assessingLearning?.successThreshold || '80% mastery benchmark');
      setSummativeAssessmentPlan(il?.assessingLearning?.summativeAssessmentPlan || '');

      setNextSteps(il?.waysForward?.nextSteps || '');
      setRemediationAction(il?.waysForward?.remediationAction || '');
      setEnrichmentChallenge(il?.waysForward?.enrichmentChallenge || '');
      setRealWorldCareers(il?.waysForward?.realWorldCareers || ['Software Engineering', 'Financial Analysis', 'Data Science']);

      if (lesson.weeklySchedule?.length) {
        setWeeklySchedule(lesson.weeklySchedule.map(s => ({
          day: s.day,
          date: s.date,
          lessonTitle: s.lessonTitle,
          activityType: s.activityType || 'Whole Class',
          objective: s.objective || ''
        })));
      }
    } else {
      // Defaults for new lesson
      setTitle('');
      setSubject('General Mathematics');
      setGradeLevel('Grade 11 - General Mathematics');
      setTerm('Term 1');
      setWeek('Week 1');
      setSection('Grade 11 – Gauss (STEM-A)');
      setDuration('60 minutes');
      setDoOrderRef('DepEd MATATAG / D.O. No. 016, s. 2024');
      setTopicId(topics[0]?.id || 'functions');

      setLearningIntentions('');
      setSuccessCriteria(['Demonstrate understanding of fundamental concepts.', 'Apply step-by-step mathematical procedures.', 'Solve real-world contextual problem sets.']);
      setCompetencies(['M11GM-Ia-1: Represents real-life situations using mathematical functions.']);
      setPriorKnowledge('Prerequisite basic algebra, coordinate graphing, and equation simplification.');

      setPrimingActivity('Introduce a contextual real-life dilemma or analogy to spark cognitive inquiry.');
      setCoreInstruction('Direct instruction with mathematical definitions, theorems, and teacher-led worked examples.');
      setGuidedExercises('Collaborative paired exercises and board demonstration with teacher feedback.');
      setKeyFormulas([{ name: 'Standard Equation', formula: 'f(x) = y', explanation: 'Relates domain inputs to range outputs.' }]);

      setFormativeAssessment('5-item immediate feedback check with scaffolded hints.');
      setDiagnosticQuizPlan('Adaptive diagnostic baseline quiz assessing prerequisite retention.');
      setSuccessThreshold('80% mastery benchmark');
      setSummativeAssessmentPlan('Standardized TOS-aligned unit assessment.');

      setNextSteps('Student reflection journal entry exploring real-life applications.');
      setRemediationAction('7-step targeted learning pathway with scaffolded practice sheets.');
      setEnrichmentChallenge('Higher-order modeling and speed challenge sprint problems.');
      setRealWorldCareers(['Data Analytics', 'Financial Engineering', 'Technology & Systems']);

      setWeeklySchedule([
        { day: 'MONDAY', date: 'Day 1', lessonTitle: 'Introduction & Conceptual Hook', activityType: 'Whole Class', objective: 'Understand core terminology and definitions.' },
        { day: 'TUESDAY', date: 'Day 2', lessonTitle: 'Core Formulas & Derivations', activityType: 'Direct Instruction', objective: 'Derive properties and master key formulas.' },
        { day: 'WEDNESDAY', date: 'Day 3', lessonTitle: 'Guided Collaborative Practice', activityType: 'Pair Work', objective: 'Solve multi-step practice problems with peer review.' },
        { day: 'THURSDAY', date: 'Day 4', lessonTitle: 'Contextual Word Problems', activityType: 'Group Work', objective: 'Model real-world scenarios and evaluate equations.' },
        { day: 'FRIDAY', date: 'Day 5', lessonTitle: 'Formative & Summative Check', activityType: 'Individual Assessment', objective: 'Demonstrate 80% mastery on unit checkpoint.' }
      ]);
    }
    setErrorMsg(null);
  }, [lesson, isOpen, topics]);

  if (!isOpen) return null;

  // Handler to load exemplary DepEd template
  const handleApplyDepEdTemplate = () => {
    setTitle('DepEd ILAW Lesson Plan: Rational Functions, Equations & Inequalities');
    setTerm('Term 1');
    setWeek('Week 2');
    setTopicId('rational');
    setLearningIntentions('Master rational functions, solve rational equations by clearing denominators, and verify extraneous solutions.');
    setSuccessCriteria([
      'Distinguish between rational functions, equations, and inequalities.',
      'Solve rational equations algebraically using the least common denominator (LCD).',
      'Identify vertical, horizontal, and oblique asymptotes from algebraic representations.',
      'Model real-world work-rate and distance-speed problems using rational expressions.'
    ]);
    setCompetencies([
      'M11GM-Ib-1: Distinguishes rational function, rational equation, and rational inequality.',
      'M11GM-Ib-2: Solves rational equations and inequalities.',
      'M11GM-Ib-3: Represents a rational function through table of values, graphs, and equations.'
    ]);
    setPriorKnowledge('Factoring polynomials, finding the LCD of algebraic fractions, and solving linear/quadratic equations.');
    setPrimingActivity('Work-Rate Problem: If Pipe A fills a municipal water tank in 4 hours and Pipe B fills it in 6 hours, how long does it take together? Formulate 1/4 + 1/6 = 1/t.');
    setCoreInstruction('Direct explanation: Steps to clear algebraic denominators; critical test for extraneous roots where denominator equals zero; identifying asymptotes.');
    setGuidedExercises('Board work in pairs: Clear denominators in (2x)/(x - 1) + 1 = 5/(x - 1) and test whether x = 1 is an extraneous solution.');
    setKeyFormulas([
      { name: 'Rational Function', formula: 'f(x) = P(x) / Q(x), Q(x) ≠ 0', explanation: 'Quotient of two polynomial functions with non-zero denominator.' },
      { name: 'Work Rate Model', formula: '1/t₁ + 1/t₂ = 1/t_total', explanation: 'Combined rate of collaborative completion.' }
    ]);
    setFormativeAssessment('Quick 5-item exit check on denominator restrictions and solving for extraneous roots.');
    setDiagnosticQuizPlan('5-item adaptive Rational Functions Diagnostic Quiz with progressive hints.');
    setSuccessThreshold('80% mastery benchmark');
    setSummativeAssessmentPlan('10-item unit evaluation aligned with DepEd Table of Specifications.');
    setNextSteps('Journal entry: Why are extraneous solutions common in rational equations, and how do we safeguard against them?');
    setRemediationAction('Color-coded factoring sheets and denominator isolation flashcards.');
    setEnrichmentChallenge('Investigate oblique (slant) asymptotes when degree of numerator exceeds degree of denominator by 1.');
    setRealWorldCareers(['Civil Engineering', 'Network Architecture', 'Pharmacokinetics', 'Economics']);
  };

  const handleSave = async (e?: React.FormEvent, overrideStatus?: 'Published' | 'Draft') => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a lesson title.');
      setActiveTab('overview');
      return;
    }

    const finalStatus = overrideStatus || status || 'Published';
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload: Partial<LessonPlan> & { title: string } = {
        id: lesson?.id,
        topicId: topicId || (lesson ? lesson.topicId : `topic-${Date.now()}`),
        title: title.trim(),
        subject: subject.trim(),
        gradeLevel: gradeLevel.trim(),
        term: term.trim(),
        week: week.trim(),
        section: section.trim(),
        duration: duration.trim(),
        doOrderRef: doOrderRef.trim(),
        framework: 'ILAW',
        status: finalStatus,
        updatedAt: finalStatus === 'Published' ? 'Published just now' : 'Draft saved just now',
        prerequisites: priorKnowledge ? [priorKnowledge] : ['Foundational Mathematics'],
        learningCompetencies: competencies.filter(c => c.trim().length > 0),
        objectives: {
          cognitive: learningIntentions.trim() || 'Master core mathematical concepts.',
          psychomotor: 'Perform algebraic and problem-solving operations accurately.',
          affective: 'Demonstrate persistence and critical reasoning in solving problems.'
        },
        weeklySchedule: weeklySchedule.map(s => ({
          ...s,
          lessonTitle: s.lessonTitle || title
        })),
        ilaw: {
          intentions: {
            learningIntentions: learningIntentions.trim(),
            successCriteria: successCriteria.filter(s => s.trim().length > 0),
            competencies: competencies.filter(c => c.trim().length > 0),
            priorKnowledge: priorKnowledge.trim()
          },
          learningExperience: {
            primingActivity: primingActivity.trim(),
            coreInstruction: coreInstruction.trim(),
            guidedExercises: guidedExercises.trim(),
            keyFormulas: keyFormulas.filter(f => f.name.trim() || f.formula.trim())
          },
          assessingLearning: {
            formativeAssessment: formativeAssessment.trim(),
            diagnosticQuizPlan: diagnosticQuizPlan.trim(),
            successThreshold: successThreshold.trim(),
            summativeAssessmentPlan: summativeAssessmentPlan.trim()
          },
          waysForward: {
            nextSteps: nextSteps.trim(),
            remediationAction: remediationAction.trim(),
            enrichmentChallenge: enrichmentChallenge.trim(),
            realWorldCareers: realWorldCareers.filter(r => r.trim().length > 0)
          }
        }
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error('Error saving ILAW lesson:', err);
      setErrorMsg(err.message || 'Failed to save ILAW lesson. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl sm:rounded-[36px] w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between gap-4 shrink-0 border-b border-indigo-950/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg font-black shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 tracking-wider">
                  DepEd D.O. 016, s. 2024
                </span>
                <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                  {isEditing ? 'Edit ILAW Lesson' : 'Add New ILAW Lesson'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1 leading-tight">
                {isEditing ? `Edit: ${lesson.title}` : 'Create DepEd ILAW Lesson Plan'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleApplyDepEdTemplate}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Populate with DepEd Exemplar template"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Fill Template</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 gap-1 overflow-x-auto shrink-0 select-none">
          {[
            { id: 'overview', label: '1. Overview', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'intentions', label: '2. I - Intentions', icon: <Target className="w-3.5 h-3.5 text-indigo-600" /> },
            { id: 'experience', label: '3. L - Learning Exp', icon: <Layers className="w-3.5 h-3.5 text-sky-600" /> },
            { id: 'assessment', label: '4. A - Assessing', icon: <Award className="w-3.5 h-3.5 text-emerald-600" /> },
            { id: 'ways_forward', label: '5. W - Ways Forward', icon: <Compass className="w-3.5 h-3.5 text-amber-600" /> },
            { id: 'schedule', label: '6. Weekly Schedule', icon: <Calendar className="w-3.5 h-3.5 text-purple-600" /> },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-black border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW & GENERAL DETAILS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                    Lesson Plan Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DepEd ILAW Lesson Plan: Functions & Relations"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:w-44 shrink-0">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Publish Status</label>
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setStatus('Published')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        status === 'Published'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Draft')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        status === 'Draft'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Academic Term / Quarter</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Term 1">Term 1 (Quarter 1)</option>
                    <option value="Term 2">Term 2 (Quarter 2)</option>
                    <option value="Term 3">Term 3 (Quarter 3)</option>
                    <option value="Term 4">Term 4 (Quarter 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Curriculum Week</label>
                  <select
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`).map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Linked Topic / Unit</label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.term})</option>
                    ))}
                    {!topics.some(t => t.id === topicId) && (
                      <option value={topicId || 'custom'}>Custom Unit ({title || 'New Topic'})</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Grade Level & Subject</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Class Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. Grade 11 – Gauss (STEM-A)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Period Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 60 minutes"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">DepEd Order Reference</label>
                  <input
                    type="text"
                    value={doOrderRef}
                    onChange={(e) => setDoOrderRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PILLAR I - INTENTIONS */}
          {activeTab === 'intentions' && (
            <div className="space-y-5">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  I
                </div>
                <div>
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wide">Pillar I: Intentions</h3>
                  <p className="text-xs text-indigo-900">
                    Defines what learners should know, understand, and be able to do, directly aligned with official DepEd Most Essential Learning Competencies (MELCs).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Overall Learning Intentions Statement
                </label>
                <textarea
                  rows={3}
                  value={learningIntentions}
                  onChange={(e) => setLearningIntentions(e.target.value)}
                  placeholder="e.g. Master relations, functions, piecewise evaluation, operations, and composite functions in Grade 11 General Mathematics."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700">
                    Success Criteria (I can statements)
                  </label>
                  <button
                    type="button"
                    onClick={() => setSuccessCriteria([...successCriteria, ''])}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Criterion</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {successCriteria.map((sc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-black text-slate-400">{idx + 1}.</span>
                      <input
                        type="text"
                        value={sc}
                        onChange={(e) => {
                          const updated = [...successCriteria];
                          updated[idx] = e.target.value;
                          setSuccessCriteria(updated);
                        }}
                        placeholder={`Success criterion #${idx + 1}`}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {successCriteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSuccessCriteria(successCriteria.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700">
                    DepEd MELCs Competencies Codes
                  </label>
                  <button
                    type="button"
                    onClick={() => setCompetencies([...competencies, ''])}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Competency</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {competencies.map((comp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-black text-slate-400">{idx + 1}.</span>
                      <input
                        type="text"
                        value={comp}
                        onChange={(e) => {
                          const updated = [...competencies];
                          updated[idx] = e.target.value;
                          setCompetencies(updated);
                        }}
                        placeholder="e.g. M11GM-Ia-1: Represents real-life situations using functions."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {competencies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setCompetencies(competencies.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Prior Knowledge / Prerequisites
                </label>
                <input
                  type="text"
                  value={priorKnowledge}
                  onChange={(e) => setPriorKnowledge(e.target.value)}
                  placeholder="e.g. Cartesian coordinate system, plotting points, basic linear equations"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PILLAR L - LEARNING EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-5">
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  L
                </div>
                <div>
                  <h3 className="text-xs font-black text-sky-950 uppercase tracking-wide">Pillar L: Learning Experience</h3>
                  <p className="text-xs text-sky-900">
                    Outlines student-centered pedagogy, priming motivation hooks, teacher-led modeling, and collaborative problem-solving exercises.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Priming / Motivation Activity (Cognitive Hook)
                </label>
                <textarea
                  rows={2}
                  value={primingActivity}
                  onChange={(e) => setPrimingActivity(e.target.value)}
                  placeholder="e.g. Vending machine analogy: Relate one button input producing exactly one soda item to function definitions."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Core Instruction & Direct Teaching
                </label>
                <textarea
                  rows={3}
                  value={coreInstruction}
                  onChange={(e) => setCoreInstruction(e.target.value)}
                  placeholder="e.g. Teacher models vertical line tests on coordinate planes, demonstrates step-by-step function composition f(g(x)), and explains piecewise interval models."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Guided Exercises & Collaborative Practice
                </label>
                <textarea
                  rows={2}
                  value={guidedExercises}
                  onChange={(e) => setGuidedExercises(e.target.value)}
                  placeholder="e.g. Paired problem solving on evaluating composite functions and graphing taxi fare piecewise models."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700">
                    Key Mathematical Formulas & Rules
                  </label>
                  <button
                    type="button"
                    onClick={() => setKeyFormulas([...keyFormulas, { name: '', formula: '', explanation: '' }])}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Formula</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {keyFormulas.map((kf, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => setKeyFormulas(keyFormulas.filter((_, i) => i !== idx))}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                        <input
                          type="text"
                          value={kf.name}
                          onChange={(e) => {
                            const updated = [...keyFormulas];
                            updated[idx].name = e.target.value;
                            setKeyFormulas(updated);
                          }}
                          placeholder="Formula Name (e.g. Composite Function)"
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        />
                        <input
                          type="text"
                          value={kf.formula}
                          onChange={(e) => {
                            const updated = [...keyFormulas];
                            updated[idx].formula = e.target.value;
                            setKeyFormulas(updated);
                          }}
                          placeholder="Equation (e.g. (f ∘ g)(x) = f(g(x)))"
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-700"
                        />
                      </div>
                      <input
                        type="text"
                        value={kf.explanation}
                        onChange={(e) => {
                          const updated = [...keyFormulas];
                          updated[idx].explanation = e.target.value;
                          setKeyFormulas(updated);
                        }}
                        placeholder="Pedagogical explanation of formula application..."
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600"
                      />
                    </div>
                  ))}
                  {keyFormulas.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No specific formulas added. Click "+ Add Formula" to define rules.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PILLAR A - ASSESSING LEARNING */}
          {activeTab === 'assessment' && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  A
                </div>
                <div>
                  <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wide">Pillar A: Assessing Learning</h3>
                  <p className="text-xs text-emerald-900">
                    Defines formative checks for instant feedback, diagnostic baseline evaluations, and summative mastery thresholds.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Formative Assessment Strategy
                </label>
                <textarea
                  rows={2}
                  value={formativeAssessment}
                  onChange={(e) => setFormativeAssessment(e.target.value)}
                  placeholder="e.g. Quick whiteboard check on evaluating f(g(2)) followed by a 4-graph vertical line test check."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Diagnostic Quiz Plan
                </label>
                <textarea
                  rows={2}
                  value={diagnosticQuizPlan}
                  onChange={(e) => setDiagnosticQuizPlan(e.target.value)}
                  placeholder="e.g. 5-item adaptive Functions Diagnostic Quiz with progressive hints for domain restrictions."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Mastery Success Benchmark
                  </label>
                  <input
                    type="text"
                    value={successThreshold}
                    onChange={(e) => setSuccessThreshold(e.target.value)}
                    placeholder="e.g. 80% passing proficiency threshold"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Summative Assessment Plan
                  </label>
                  <input
                    type="text"
                    value={summativeAssessmentPlan}
                    onChange={(e) => setSummativeAssessmentPlan(e.target.value)}
                    placeholder="e.g. 10-item unit examination aligned with DepEd Table of Specifications (TOS)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PILLAR W - WAYS FORWARD */}
          {activeTab === 'ways_forward' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  W
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-950 uppercase tracking-wide">Pillar W: Ways Forward</h3>
                  <p className="text-xs text-amber-900">
                    Plans differentiated interventions: remedial scaffolding for struggling learners and enrichment challenges for high performers.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Next Steps & Learner Reflection
                </label>
                <textarea
                  rows={2}
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  placeholder="e.g. Students complete a reflection log on how functional mappings model daily economic transactions (mobile loads, utility rates)."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Remediation Action Plan (For Scores &lt; 75%)
                  </label>
                  <textarea
                    rows={3}
                    value={remediationAction}
                    onChange={(e) => setRemediationAction(e.target.value)}
                    placeholder="e.g. Color-coded substitution guides for composite functions and step-by-step domain restriction templates."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Enrichment Challenge (For High Performers)
                  </label>
                  <textarea
                    rows={3}
                    value={enrichmentChallenge}
                    onChange={(e) => setEnrichmentChallenge(e.target.value)}
                    placeholder="e.g. Formulate an algorithmic piecewise function for Philippine progressive income tax brackets under TRAIN Law."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Real-World Career Applications (comma separated)
                </label>
                <input
                  type="text"
                  value={realWorldCareers.join(', ')}
                  onChange={(e) => setRealWorldCareers(e.target.value.split(',').map(s => s.trim()))}
                  placeholder="e.g. Software Engineering, Financial Analysis, Actuarial Science, Data Analytics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 6: WEEKLY SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    5-Day Daily Schedule (Monday to Friday)
                  </h3>
                  <p className="text-xs text-slate-500">Breakdown of daily instructional pacing for this unit.</p>
                </div>
              </div>

              <div className="space-y-3">
                {weeklySchedule.map((item, idx) => (
                  <div key={item.day} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 sm:w-28 shrink-0">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                        D{idx + 1}
                      </span>
                      <span className="text-xs font-black text-slate-900">{item.day}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.lessonTitle}
                        onChange={(e) => {
                          const updated = [...weeklySchedule];
                          updated[idx].lessonTitle = e.target.value;
                          setWeeklySchedule(updated);
                        }}
                        placeholder={`Lesson title for ${item.day}`}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                      <input
                        type="text"
                        value={item.objective}
                        onChange={(e) => {
                          const updated = [...weeklySchedule];
                          updated[idx].objective = e.target.value;
                          setWeeklySchedule(updated);
                        }}
                        placeholder="Daily objective or focus..."
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600"
                      />
                    </div>

                    <div className="sm:w-36 shrink-0">
                      <select
                        value={item.activityType}
                        onChange={(e) => {
                          const updated = [...weeklySchedule];
                          updated[idx].activityType = e.target.value;
                          setWeeklySchedule(updated);
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                      >
                        <option value="Whole Class">Whole Class</option>
                        <option value="Direct Instruction">Direct Instruction</option>
                        <option value="Group Work">Group Work</option>
                        <option value="Pair Work">Pair Work</option>
                        <option value="Individual Work">Individual Work</option>
                        <option value="Individual Assessment">Individual Assessment</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Bottom Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Step {['overview', 'intentions', 'experience', 'assessment', 'ways_forward', 'schedule'].indexOf(activeTab) + 1} of 6
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSave(undefined, 'Draft')}
                disabled={isSaving}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave(undefined, 'Published')}
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving ILAW Lesson...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? (status === 'Draft' ? 'Save & Publish Lesson' : 'Save Changes') : 'Publish to Student Portal'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
