import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  Printer, 
  Edit3, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  Target, 
  CheckCircle2, 
  Lightbulb, 
  FileText, 
  GraduationCap, 
  Layers, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BrainCircuit,
  Table,
  Calendar
} from 'lucide-react';
import { Topic, LessonPlan, LessonProcedureStep } from '../types';
import TopicAnalysisModal from './TopicAnalysisModal';

interface LessonPlanModalProps {
  topic: Topic;
  isFaculty?: boolean;
  onSaveLessonPlan?: (topicId: string, updatedPlan: LessonPlan) => Promise<void>;
  onClose: () => void;
}

export default function LessonPlanModal({ topic, isFaculty = false, onSaveLessonPlan, onClose }: LessonPlanModalProps) {
  // Ensure default lesson plan object if none exists yet
  const defaultPlan: LessonPlan = topic.lessonPlan || {
    id: `lp-${topic.id}`,
    topicId: topic.id,
    title: `Lesson Plan: ${topic.title}`,
    gradeLevel: 'Grade 11 - General Mathematics',
    duration: '60 minutes',
    subject: 'General Mathematics',
    prerequisites: ['Algebraic Concepts', 'Equations & Graphing'],
    learningCompetencies: [
      `M11GM-Topic-${topic.id}: Understands and applies principles of ${topic.title} to solve real-world problems.`
    ],
    objectives: {
      cognitive: `Identify core definitions and solve fundamental equations related to ${topic.title}.`,
      psychomotor: `Perform step-by-step algebraic manipulations and construct graphical solutions accurately.`,
      affective: `Demonstrate persistence and collaboration when solving multi-step mathematical problems.`
    },
    materialsNeeded: ['Graphing Tools / Calculators', 'Student Practice Worksheets', 'LeavienAI Assessment Portal'],
    keyConcepts: [
      { term: topic.title, definition: topic.description, formula: 'f(x) = y' }
    ],
    workedExamples: [
      {
        title: `Sample Problem on ${topic.title}`,
        problem: `Apply the principles of ${topic.title} to determine the value of the unknown variable in a standard equation.`,
        stepByStepSolution: [
          'Step 1: Identify the given values and state the relevant formula.',
          'Step 2: Substitute the known quantities into the general equation.',
          'Step 3: Simplify and isolate the target variable.',
          'Step 4: Verify the solution by plugging the value back into the original statement.'
        ]
      }
    ],
    procedures: [
      {
        phase: 'Motivation / Priming',
        durationMinutes: 10,
        teacherActivity: `Introduce a real-world scenario demonstrating the practical application of ${topic.title}.`,
        studentActivity: 'Students brainstorm inputs and discuss real-life connections in small groups.',
        assessmentStrategy: 'Classroom polling and active discussion diagnostic.'
      },
      {
        phase: 'Direct Instruction',
        durationMinutes: 20,
        teacherActivity: `Present core rules, key formulas, and step-by-step worked examples for ${topic.title}.`,
        studentActivity: 'Students take notes and follow teacher demonstrations on their devices.',
        assessmentStrategy: 'Formative board work checks.'
      },
      {
        phase: 'Guided Practice',
        durationMinutes: 15,
        teacherActivity: 'Assign collaborative peer exercises with varying difficulty parameters.',
        studentActivity: 'Students work in pairs using peer chat and study tools to solve problems.',
        assessmentStrategy: 'Teacher observations and targeted group feedback.'
      },
      {
        phase: 'Independent Practice / Assessment',
        durationMinutes: 10,
        teacherActivity: 'Direct students to complete the adaptive quiz module in the LeavienAI app.',
        studentActivity: 'Students complete independent diagnostic practice problems on their devices.',
        assessmentStrategy: 'Automated real-time quiz results in Faculty Hub.'
      },
      {
        phase: 'Generalization & Homework',
        durationMinutes: 5,
        teacherActivity: 'Summarize key mathematical takeaways and assign reflection exercises.',
        studentActivity: 'Students log key formulas in their study journal and submit exit tickets.',
        assessmentStrategy: 'Exit ticket check.'
      }
    ],
    differentiation: {
      remediation: 'Provide step-by-step scaffolded templates and visual aids for struggling learners.',
      enrichment: 'Offer multi-variable extensions and higher-order application challenges for advanced learners.'
    },
    assessmentPlan: 'Formative evaluation via adaptive practice quiz; Summative chapter assessment.',
    reflectionNotes: 'Ensure students review foundational prerequisites prior to engaging with complex problems.'
  };

  const [plan, setPlan] = useState<LessonPlan>(defaultPlan);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<'do16' | 'ilaw' | 'overview' | 'objectives' | 'concepts' | 'procedures' | 'differentiation'>('do16');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onSaveLessonPlan) return;
    setIsSaving(true);
    try {
      await onSaveLessonPlan(topic.id, plan);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving lesson plan:", err);
      alert("Failed to save lesson plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    // Simulate smart DepEd lesson plan generator
    setTimeout(() => {
      setPlan(prev => ({
        ...prev,
        title: `DepEd Compliant Lesson Plan: ${topic.title}`,
        learningCompetencies: [
          `M11GM-Ia-1: Represents real-life situations using ${topic.title}.`,
          `M11GM-Ia-2: Evaluates mathematical models and performs algebraic operations on ${topic.title}.`,
          `M11GM-Ia-3: Solves contextualized real-world problems involving ${topic.title} with high precision.`
        ],
        objectives: {
          cognitive: `Formulate and evaluate algebraic expressions related to ${topic.title} accurately.`,
          psychomotor: `Construct precise mathematical representations and verify solutions using step-by-step algorithms.`,
          affective: `Value mathematical precision and appreciate the role of ${topic.title} in economics, science, and daily life.`
        },
        differentiation: {
          remediation: `Provide color-coded step-by-step algorithm sheets and peer-guided tutoring for students needing reinforcement.`,
          enrichment: `Assign real-world optimization problems and algorithmic modeling projects for high-performing students.`
        }
      }));
      setIsGeneratingAI(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[32px] sm:rounded-[40px] w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 print:bg-none print:text-slate-900 print:p-0 print:mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-indigo-200 border border-white/10 shrink-0 print:hidden">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-400/20 print:text-slate-600 print:border-slate-200">
                  {plan.subject}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-400/20 print:text-slate-600 print:border-slate-200">
                  {plan.gradeLevel}
                </span>
                <span className="px-2.5 py-0.5 bg-amber-500/30 text-amber-200 text-[10px] font-black uppercase tracking-widest rounded-md border border-amber-400/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>ILAW Framework</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">{plan.title}</h2>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center print:hidden">
            <button
              onClick={() => setShowAnalysis(true)}
              className="px-3.5 py-2 bg-purple-600/80 hover:bg-purple-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm border border-purple-400/30"
              title="Analyze Topic & Lesson Plan"
            >
              <BrainCircuit className="w-4 h-4 text-purple-200" />
              <span>Analyze Topic</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {isFaculty && onSaveLessonPlan && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-900/40"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Lesson Plan</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all ml-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {!isEditing && (
          <div className="flex bg-slate-50 border-b border-slate-200 px-6 overflow-x-auto shrink-0 print:hidden">
            <button
              onClick={() => setActiveTab('do16')}
              className={`py-3.5 px-4 font-extrabold text-xs transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'do16'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-4 h-4 text-indigo-600" />
              <span>DepEd D.O. 016 Weekly Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('ilaw')}
              className={`py-3.5 px-4 font-extrabold text-xs transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'ilaw'
                  ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ILAW Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 px-4 font-extrabold text-xs transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Overview & Metadata</span>
            </button>
            <button
              onClick={() => setActiveTab('objectives')}
              className={`py-3.5 px-4 font-extrabold text-xs transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'objectives'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Competencies & Objectives</span>
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`py-3.5 px-4 font-extrabold text-xs transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'concepts'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Concepts & Examples</span>
            </button>
            <button
              onClick={() => setActiveTab('procedures')}
              className={`py-3.5 px-4 font-extrabold text-xs transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'procedures'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Lesson Procedures (5Es)</span>
            </button>
            <button
              onClick={() => setActiveTab('differentiation')}
              className={`py-3.5 px-4 font-extrabold text-xs transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'differentiation'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Differentiation & Notes</span>
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 print:overflow-visible print:p-0">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>DepEd Lesson Plan Editor</span>
                </div>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAI ? 'Generating...' : 'Auto-Refine with AI'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={plan.title}
                    onChange={e => setPlan({ ...plan, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration / Time Allotment</label>
                  <input
                    type="text"
                    required
                    value={plan.duration}
                    onChange={e => setPlan({ ...plan, duration: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Objectives Section */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Learning Objectives</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Cognitive Objective (Knowledge)</label>
                  <textarea
                    rows={2}
                    value={plan.objectives.cognitive}
                    onChange={e => setPlan({ ...plan, objectives: { ...plan.objectives, cognitive: e.target.value } })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Psychomotor Objective (Skills)</label>
                  <textarea
                    rows={2}
                    value={plan.objectives.psychomotor}
                    onChange={e => setPlan({ ...plan, objectives: { ...plan.objectives, psychomotor: e.target.value } })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Affective Objective (Attitude/Values)</label>
                  <textarea
                    rows={2}
                    value={plan.objectives.affective}
                    onChange={e => setPlan({ ...plan, objectives: { ...plan.objectives, affective: e.target.value } })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Differentiation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Remediation Strategy</label>
                  <textarea
                    rows={3}
                    value={plan.differentiation.remediation}
                    onChange={e => setPlan({ ...plan, differentiation: { ...plan.differentiation, remediation: e.target.value } })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Enrichment Activity</label>
                  <textarea
                    rows={3}
                    value={plan.differentiation.enrichment}
                    onChange={e => setPlan({ ...plan, differentiation: { ...plan.differentiation, enrichment: e.target.value } })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Lesson Plan'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* DepEd D.O. No. 016, s.2026 Official Weekly Lesson Plan Table */}
              {(activeTab === 'do16' || window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  {/* Header Info Banner */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>DepEd Official Template (D.O. No. 016, s.2026)</span>
                      </div>
                      <h3 className="text-xl font-black">DepEd Term & Weekly Lesson Matrix</h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Weekly schedule grid formatted as per Department of Education Order No. 016, s.2026.
                      </p>
                    </div>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-2 shrink-0 print:hidden"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Document</span>
                    </button>
                  </div>

                  {/* Document Paper Container for DepEd D.O. 016 Table */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-300 shadow-md space-y-6 text-slate-900 font-serif">
                    {/* DepEd Order Header */}
                    <div className="text-center space-y-1">
                      <h2 className="text-2xl font-black tracking-widest font-mono uppercase text-slate-900">LESSON PLAN</h2>
                      <p className="text-xs font-serif italic text-slate-700">(As per D.O. No. 016, s.2026)</p>
                    </div>

                    {/* Grid Table */}
                    <div className="overflow-x-auto border-2 border-slate-900 rounded-lg">
                      <table className="w-full text-left border-collapse font-serif text-xs">
                        <thead>
                          {/* Header Row: Term & Dates vs Days */}
                          <tr className="border-b-2 border-slate-900 bg-slate-100">
                            <th className="p-3 border-r-2 border-slate-900 font-bold text-center underline italic text-slate-900 w-1/6 align-middle bg-slate-200/60">
                              <div className="text-sm font-extrabold">{plan.term || 'Term 1'}, {plan.week || 'Week 9'}</div>
                              <div className="text-[11px] font-normal">{plan.dates || 'Aug. 10-14, 2026'}</div>
                            </th>
                            {(plan.weeklySchedule && plan.weeklySchedule.length === 5 
                              ? plan.weeklySchedule 
                              : [
                                  { day: 'MONDAY', date: 'Aug. 10, 2026', lessonTitle: `Understanding ${topic.title} & Core Definitions` },
                                  { day: 'TUESDAY', date: 'Aug. 11, 2026', lessonTitle: `Key Properties, Formulas & Graphical Representations` },
                                  { day: 'WEDNESDAY', date: 'Aug. 12, 2026', lessonTitle: `Step-by-Step Problem Solving & Calculations` },
                                  { day: 'THURSDAY', date: 'Aug. 13, 2026', lessonTitle: `Collaborative Application & Contextual Modeling` },
                                  { day: 'FRIDAY', date: 'Aug. 14, 2026', lessonTitle: `Real-Life Word Problems & Formative Assessment` }
                                ]
                            ).map((item, idx) => (
                              <th key={idx} className="p-3 border-r border-slate-900 last:border-r-0 text-center font-bold uppercase tracking-wider text-slate-900 w-1/6">
                                <div>{item.day}</div>
                                <div className="text-[11px] font-normal italic lowercase first-letter:uppercase mt-0.5">{item.date}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Lesson Title Row */}
                          <tr className="border-b-2 border-slate-900">
                            <td className="p-3 border-r-2 border-slate-900 font-bold italic bg-slate-50 text-slate-900 align-top">
                              Lesson Title
                            </td>
                            {(plan.weeklySchedule && plan.weeklySchedule.length === 5 
                              ? plan.weeklySchedule 
                              : [
                                  { day: 'MONDAY', date: 'Aug. 10, 2026', lessonTitle: `Understanding ${topic.title} & Core Definitions` },
                                  { day: 'TUESDAY', date: 'Aug. 11, 2026', lessonTitle: `Key Properties, Formulas & Graphical Representations` },
                                  { day: 'WEDNESDAY', date: 'Aug. 12, 2026', lessonTitle: `Step-by-Step Problem Solving & Calculations` },
                                  { day: 'THURSDAY', date: 'Aug. 13, 2026', lessonTitle: `Collaborative Application & Contextual Modeling` },
                                  { day: 'FRIDAY', date: 'Aug. 14, 2026', lessonTitle: `Real-Life Word Problems & Formative Assessment` }
                                ]
                            ).map((item, idx) => (
                              <td key={idx} className="p-3 border-r border-slate-900 last:border-r-0 align-top font-medium text-slate-900 leading-relaxed">
                                {item.lessonTitle}
                              </td>
                            ))}
                          </tr>

                          {/* Learning Area Row */}
                          <tr className="border-b-2 border-slate-900">
                            <td className="p-3 border-r-2 border-slate-900 font-bold italic bg-slate-50 text-slate-900 align-middle">
                              Learning Area
                            </td>
                            <td colSpan={5} className="p-3 font-black text-center text-sm uppercase tracking-wider text-slate-900 bg-slate-50/30">
                              {plan.subject || 'GENERAL MATHEMATICS'}
                            </td>
                          </tr>

                          {/* Grade Level and Section Row */}
                          <tr className="border-b-2 border-slate-900">
                            <td className="p-3 border-r-2 border-slate-900 font-bold italic bg-slate-50 text-slate-900 align-middle">
                              Grade Level and Section
                            </td>
                            <td colSpan={5} className="p-3 font-semibold text-center text-slate-900 bg-white">
                              <div>{plan.section || 'Grade 11 – Gauss (6:00 AM – 7:00 AM)'}</div>
                            </td>
                          </tr>

                          {/* References Row */}
                          <tr>
                            <td className="p-3 border-r-2 border-slate-900 font-bold italic bg-slate-50 text-slate-900 align-top">
                              <div>References</div>
                              <div className="text-[10px] font-normal text-slate-600 not-italic">(books, websites, toolkits, etc.)</div>
                            </td>
                            <td colSpan={5} className="p-3 font-medium text-slate-900 bg-white align-top">
                              <ul className="list-disc list-inside space-y-1">
                                {(plan.references && plan.references.length > 0
                                  ? plan.references
                                  : [
                                      'DepEd SSHS General Mathematics – Budget of Work (BoW);',
                                      'DepEd SSHS General Mathematics Learning Exemplar;',
                                      'Mathematics in the Modern World learning materials.'
                                    ]
                                ).map((ref, idx) => (
                                  <li key={idx}>{ref}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {/* ILAW Framework Tab */}
              {(activeTab === 'ilaw' || window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  {/* ILAW Banner */}
                  <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-2 text-amber-200 text-xs font-black uppercase tracking-widest mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>DepEd Pedagogical Framework</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black">ILAW Framework Lesson Matrix</h3>
                    <p className="text-xs text-amber-100/90 mt-1 max-w-2xl font-medium">
                      Structuring learning through <strong>I</strong>ntentions, <strong>L</strong>earning Experience, <strong>A</strong>ssessing Learning, and <strong>W</strong>ays Forward.
                    </p>
                  </div>

                  {/* 4 Pillars Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pillar 1: INTENTIONS */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 p-6 rounded-3xl border border-amber-200/80 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md">
                            I
                          </div>
                          <div>
                            <h4 className="font-black text-amber-950 text-base">INTENTIONS</h4>
                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Layunin at Kompetensya</p>
                          </div>
                        </div>
                        <Target className="w-6 h-6 text-amber-600/60" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs text-amber-950">
                        <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/60 shadow-xs">
                          <span className="font-extrabold text-amber-900 block mb-1">Target DepEd Competency:</span>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                            {plan.learningCompetencies.map((comp, i) => (
                              <li key={i}>{comp}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-200/60 space-y-2">
                          <span className="font-extrabold text-amber-900 block">Tri-Domain Learning Intentions:</span>
                          <div className="space-y-1.5 text-slate-700">
                            <div><strong className="text-indigo-900">Cognitive:</strong> {plan.objectives.cognitive}</div>
                            <div><strong className="text-emerald-900">Psychomotor:</strong> {plan.objectives.psychomotor}</div>
                            <div><strong className="text-amber-900">Affective:</strong> {plan.objectives.affective}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 2: LEARNING EXPERIENCE */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 p-6 rounded-3xl border border-indigo-200/80 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md">
                            L
                          </div>
                          <div>
                            <h4 className="font-black text-indigo-950 text-base">LEARNING EXPERIENCE</h4>
                            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Karanasan sa Pagkatuto</p>
                          </div>
                        </div>
                        <BookOpen className="w-6 h-6 text-indigo-600/60" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs text-indigo-950">
                        <div className="bg-white/80 p-3.5 rounded-2xl border border-indigo-200/60">
                          <span className="font-extrabold text-indigo-900 block mb-1">Interactive Lesson Sequence:</span>
                          <div className="space-y-2">
                            {plan.procedures.slice(0, 3).map((proc, idx) => (
                              <div key={idx} className="border-b border-indigo-100 pb-1.5 last:border-none">
                                <span className="font-bold text-indigo-700 text-[11px]">{proc.phase} ({proc.durationMinutes} mins)</span>
                                <p className="text-slate-700 text-[11px] font-medium">{proc.teacherActivity}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/80 p-3.5 rounded-2xl border border-indigo-200/60">
                          <span className="font-extrabold text-indigo-900 block mb-1">Worked Problem Example:</span>
                          <p className="font-semibold text-slate-800 text-[11px]">{plan.workedExamples[0]?.problem || 'Standard step-by-step mathematical demonstration.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 3: ASSESSING LEARNING */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-6 rounded-3xl border border-emerald-200/80 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md">
                            A
                          </div>
                          <div>
                            <h4 className="font-black text-emerald-950 text-base">ASSESSING LEARNING</h4>
                            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Pagtatasa sa Pagkatuto</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-600/60" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs text-emerald-950">
                        <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-200/60">
                          <span className="font-extrabold text-emerald-900 block mb-1">Formative & Summative Check:</span>
                          <p className="text-slate-700 font-medium">{plan.assessmentPlan}</p>
                        </div>

                        <div className="bg-white/80 p-3.5 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-emerald-900 block">Assessment Target:</span>
                            <span className="text-slate-600 text-[11px]">5-Item Diagnostic Quiz & Step Verification</span>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                            80% Mastery Benchmark
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 4: WAYS FORWARD */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/40 p-6 rounded-3xl border border-purple-200/80 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shadow-md">
                            W
                          </div>
                          <div>
                            <h4 className="font-black text-purple-950 text-base">WAYS FORWARD</h4>
                            <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Hakbang Mula Rito</p>
                          </div>
                        </div>
                        <GraduationCap className="w-6 h-6 text-purple-600/60" />
                      </div>

                      <div className="space-y-3 pt-2 text-xs text-purple-950">
                        <div className="bg-white/80 p-3.5 rounded-2xl border border-purple-200/60 space-y-1.5">
                          <span className="font-extrabold text-purple-900 block">Differentiated Growth Pathways:</span>
                          <div>
                            <strong className="text-amber-800">Remediation:</strong>
                            <p className="text-slate-700 font-medium mt-0.5">{plan.differentiation.remediation}</p>
                          </div>
                          <div className="pt-1">
                            <strong className="text-indigo-800">Enrichment:</strong>
                            <p className="text-slate-700 font-medium mt-0.5">{plan.differentiation.enrichment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Overview Tab */}
              {(activeTab === 'overview' || window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</div>
                      <div className="font-extrabold text-slate-900 text-sm">{plan.subject}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Level</div>
                      <div className="font-extrabold text-slate-900 text-sm">{plan.gradeLevel}</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</div>
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {plan.duration}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic Unit</div>
                      <div className="font-extrabold text-slate-900 text-sm truncate">{topic.title}</div>
                    </div>
                  </div>

                  {/* Prerequisites & Materials */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/80 space-y-2">
                      <h4 className="font-extrabold text-xs text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>Prerequisite Knowledge</span>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {plan.prerequisites.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/80 space-y-2">
                      <h4 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>Instructional Materials</span>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                        {plan.materialsNeeded.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Objectives & Competencies Tab */}
              {(activeTab === 'objectives' || window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  {/* DepEd Competencies */}
                  <div className="space-y-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      <span>DepEd Learning Competencies</span>
                    </h3>
                    <div className="space-y-2">
                      {plan.learningCompetencies.map((comp, idx) => (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-medium flex items-start gap-2.5">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-700 font-bold rounded-md flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Objectives Triad */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 space-y-2">
                      <div className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Cognitive Domain (Head)</div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">{plan.objectives.cognitive}</p>
                    </div>
                    <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Psychomotor Domain (Hands)</div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">{plan.objectives.psychomotor}</p>
                    </div>
                    <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100 space-y-2">
                      <div className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Affective Domain (Heart)</div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">{plan.objectives.affective}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Concepts & Examples Tab */}
              {(activeTab === 'concepts' || window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <span>Key Mathematical Concepts & Formulas</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {plan.keyConcepts.map((concept, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900">{concept.term}</span>
                            {concept.formula && (
                              <span className="bg-indigo-100 text-indigo-800 font-mono text-xs font-bold px-2 py-0.5 rounded">
                                {concept.formula}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{concept.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Worked Examples */}
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span>Step-by-Step Worked Examples</span>
                    </h3>
                    {plan.workedExamples.map((ex, idx) => (
                      <div key={idx} className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-3">
                        <div className="font-bold text-sm text-indigo-300">{ex.title}</div>
                        <div className="text-xs bg-slate-800 p-3 rounded-xl border border-slate-700 font-medium">
                          <strong className="text-slate-400 block mb-1">Problem Statement:</strong>
                          {ex.problem}
                        </div>
                        <div className="space-y-1.5 pl-1">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solution Steps:</div>
                          {ex.stepByStepSolution.map((step, sIdx) => (
                            <div key={sIdx} className="text-xs text-slate-300 font-mono flex items-start gap-2">
                              <span className="text-indigo-400 font-bold shrink-0">›</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedures Tab */}
              {(activeTab === 'procedures' || window.matchMedia('print').matches) && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    <span>Detailed Lesson Procedures (5Es / DepEd Standard)</span>
                  </h3>
                  <div className="space-y-3">
                    {plan.procedures.map((proc, idx) => (
                      <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            {proc.phase}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {proc.durationMinutes} mins
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <strong className="text-slate-500 uppercase text-[10px] tracking-wider block mb-1">Teacher's Activity:</strong>
                            <p className="text-slate-800 leading-relaxed">{proc.teacherActivity}</p>
                          </div>
                          <div>
                            <strong className="text-slate-500 uppercase text-[10px] tracking-wider block mb-1">Students' Activity:</strong>
                            <p className="text-slate-800 leading-relaxed">{proc.studentActivity}</p>
                          </div>
                        </div>
                        {proc.assessmentStrategy && (
                          <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 font-medium">
                            <strong className="font-bold">Assessment Strategy:</strong> {proc.assessmentStrategy}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Differentiation Tab */}
              {(activeTab === 'differentiation' || window.matchMedia('print').matches) && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 space-y-2">
                      <h4 className="font-extrabold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Remediation Strategy</span>
                      </h4>
                      <p className="text-xs text-slate-800 leading-relaxed">{plan.differentiation.remediation}</p>
                    </div>
                    <div className="bg-indigo-50/60 p-5 rounded-2xl border border-indigo-100 space-y-2">
                      <h4 className="font-extrabold text-xs text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Enrichment Challenge</span>
                      </h4>
                      <p className="text-xs text-slate-800 leading-relaxed">{plan.differentiation.enrichment}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Assessment Plan & Exit Strategy</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{plan.assessmentPlan}</p>
                  </div>

                  {plan.reflectionNotes && (
                    <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 italic">
                      <strong className="font-bold not-italic text-slate-800 block mb-1">Teacher Reflection & Notes:</strong>
                      "{plan.reflectionNotes}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs font-medium text-slate-500">
            Topic: <span className="font-bold text-slate-900">{topic.title}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Lesson Plan
          </button>
        </div>

        {showAnalysis && (
          <TopicAnalysisModal
            topic={topic}
            onClose={() => setShowAnalysis(false)}
          />
        )}
      </motion.div>
    </div>
  );
}
