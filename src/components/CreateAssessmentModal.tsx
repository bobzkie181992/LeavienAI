import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sparkles, Plus, Trash2, CheckCircle2, Eye, Save, Send, HelpCircle, FileCheck, Layers, FileSpreadsheet,
  Trophy, Zap, FileText, Compass, Award, Target, BookOpen, Check
} from 'lucide-react';
import { GRADE_11_SUBJECTS } from '../data/grade11SampleData';
import DepEdExcelImporter, { ParsedDepEdQuestion, AssessmentMode } from './DepEdExcelImporter';

export interface AssessmentQuestionForm {
  id: string;
  question: string;
  questionType?: 'multiple-choice' | 'short-answer' | 'true-false' | 'rubric' | 'oral-probe';
  options: string[];
  correctAnswer: string | number;
  explanation?: string;
  correctFeedback?: string;
  incorrectFeedback?: string;
  competency?: string;
  cognitiveLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  rubricCriteria?: {
    accuracyPts: number;
    designPts: number;
    applicationPts: number;
    presentationPts: number;
  };
  proofSteps?: string;
  oralExpectedPoints?: string;
  authenticScenario?: string;
}

interface CreateAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessmentData: any) => void;
  category?: AssessmentMode;
}

const CATEGORY_UI_CONFIGS: Record<AssessmentMode, {
  title: string;
  defaultTitle: string;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  icon: any;
  description: string;
  defaultInstructions: string;
}> = {
  diagnostic: {
    title: "Create Baseline Diagnostic Assessment",
    defaultTitle: "Grade 11 General Mathematics Quarter 1 Diagnostic Checkpoint",
    bgGradient: "from-amber-900 via-amber-950 to-slate-900",
    badgeBg: "bg-amber-400 text-slate-950",
    badgeText: "DIAGNOSTIC BASELINE",
    icon: Sparkles,
    description: "Assess prior knowledge and baseline readiness before unit instruction.",
    defaultInstructions: "Complete all baseline items carefully. Results establish your initial diagnostic competency profile."
  },
  pretest: {
    title: "Create Entry Pre-Test Assessment",
    defaultTitle: "General Mathematics Entry Readiness Pre-Test",
    bgGradient: "from-blue-900 via-slate-900 to-slate-950",
    badgeBg: "bg-blue-400 text-slate-950",
    badgeText: "PRE-TEST ENTRY",
    icon: Sparkles,
    description: "Evaluate prerequisite algebraic skills prior to beginning General Mathematics units.",
    defaultInstructions: "Answer all prerequisite questions to evaluate entry skill readiness."
  },
  posttest: {
    title: "Create Exit Post-Test Assessment",
    defaultTitle: "General Mathematics Unit Exit Post-Test",
    bgGradient: "from-purple-900 via-slate-900 to-slate-950",
    badgeBg: "bg-purple-400 text-slate-950",
    badgeText: "POST-TEST EXIT",
    icon: Award,
    description: "Measure exit mastery growth gains compared against pre-test baseline data.",
    defaultInstructions: "Demonstrate your unit mastery across all learning competency standards."
  },
  formative: {
    title: "Create In-Lesson Formative Check",
    defaultTitle: "Lesson Formative Quick Knowledge Check",
    bgGradient: "from-indigo-900 via-indigo-950 to-slate-900",
    badgeBg: "bg-indigo-400 text-slate-950",
    badgeText: "FORMATIVE CHECK",
    icon: Target,
    description: "Low-stakes continuous checks during ILAW lessons with immediate feedback.",
    defaultInstructions: "Answer quick check questions. Immediate explanation feedback will be provided."
  },
  summative: {
    title: "Create Summative Unit Exam (TOS)",
    defaultTitle: "Unit Summative Examination (Table of Specifications)",
    bgGradient: "from-violet-900 via-slate-900 to-slate-950",
    badgeBg: "bg-violet-400 text-slate-950",
    badgeText: "SUMMATIVE TOS EXAM",
    icon: FileText,
    description: "Comprehensive unit examination calibrated against Bloom's cognitive taxonomy.",
    defaultInstructions: "Refer to unit formulas and solve each item within the allotted exam duration."
  },
  quarterly: {
    title: "Create Quarterly Examination",
    defaultTitle: "Quarter 1 Comprehensive Examination",
    bgGradient: "from-amber-800 via-slate-900 to-slate-950",
    badgeBg: "bg-amber-300 text-slate-950",
    badgeText: "QUARTERLY EXAM",
    icon: Trophy,
    description: "Official DepEd quarterly exam evaluating all quarter competencies.",
    defaultInstructions: "Read all problem stems carefully and select the best mathematical solution."
  },
  performance: {
    title: "Create Performance Task & Portfolio",
    defaultTitle: "Performance Task #1: Mathematical Modeling Portfolio",
    bgGradient: "from-emerald-900 via-slate-900 to-slate-950",
    badgeBg: "bg-emerald-400 text-slate-950",
    badgeText: "PERFORMANCE TASK",
    icon: Zap,
    description: "Output-based mathematical modeling tasks, rubrics, and portfolio projects.",
    defaultInstructions: "Construct your mathematical model according to the 4-dimension DepEd rubric."
  },
  written: {
    title: "Create Written Work & Problem Set",
    defaultTitle: "Written Work #1: Step-by-Step Problem Set",
    bgGradient: "from-blue-800 via-slate-900 to-slate-950",
    badgeBg: "bg-blue-300 text-slate-950",
    badgeText: "WRITTEN WORK",
    icon: FileText,
    description: "Algebraic proofs, calculation workings, and step-by-step problem sets.",
    defaultInstructions: "Show complete written solutions and verify all algebraic proof steps."
  },
  oral: {
    title: "Create Oral Defense & Recitation Prompt",
    defaultTitle: "Oral Recitation & Conceptual Defense Prompt",
    bgGradient: "from-teal-800 via-slate-900 to-slate-950",
    badgeBg: "bg-teal-300 text-slate-950",
    badgeText: "ORAL RECITATION",
    icon: Compass,
    description: "Oral recitation prompts, verbal defense reasoning, and conceptual articulation.",
    defaultInstructions: "Prepare to explain your mathematical reasoning verbally during defense."
  },
  authentic: {
    title: "Create Authentic Contextualized Task",
    defaultTitle: "Authentic Task #1: Barangay Cooperative Financial Project",
    bgGradient: "from-rose-800 via-slate-900 to-slate-950",
    badgeBg: "bg-rose-300 text-slate-950",
    badgeText: "AUTHENTIC SCENARIO",
    icon: CheckCircle2,
    description: "Real-world community math scenarios, financial cases, and practical modeling.",
    defaultInstructions: "Analyze the authentic community financial data and derive the optimal solution."
  }
};

export default function CreateAssessmentModal({
  isOpen,
  onClose,
  onSave,
  category = 'formative'
}: CreateAssessmentModalProps) {
  const uiConfig = CATEGORY_UI_CONFIGS[category] || CATEGORY_UI_CONFIGS.formative;
  const CategoryIcon = uiConfig.icon;

  const [title, setTitle] = useState(uiConfig.defaultTitle);
  const [subject, setSubject] = useState('General Mathematics');
  const [gradeLevel, setGradeLevel] = useState('Grade 11');
  const [competency, setCompetency] = useState('M11GM-Ia-1: Represents real-life situations using functions');
  const [instructions, setInstructions] = useState(uiConfig.defaultInstructions);
  const [targetSection, setTargetSection] = useState('Grade 11 - STEM A');
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [accessCode, setAccessCode] = useState(category.slice(0, 4).toUpperCase() + Math.floor(10 + Math.random() * 90));
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(category === 'quarterly' || category === 'summative' ? 60 : 20);
  const [isPreview, setIsPreview] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const [questions, setQuestions] = useState<AssessmentQuestionForm[]>([
    {
      id: `q-${Date.now()}-1`,
      question: category === 'performance'
        ? 'Construct a piecewise model representing local jeepney base fares and per-kilometer rates.'
        : category === 'oral'
        ? 'Explain verbally why a relation with repeating x-values with different y-values fails to be a function.'
        : category === 'written'
        ? 'Solve the rational equation step-by-step: (2/x) + (1/3) = 5/6. Show complete proof.'
        : category === 'authentic'
        ? 'Analyze Barangay San Jose Cooperative ₱50,000 loan interest options over 3 years.'
        : 'Which of the following relations represents a function?',
      questionType: category === 'performance' ? 'rubric' : category === 'oral' ? 'oral-probe' : 'multiple-choice',
      options: category === 'performance'
        ? ['Accuracy (40 pts)', 'Design (30 pts)', 'Application (20 pts)', 'Presentation (10 pts)']
        : category === 'oral'
        ? ['Key Point: Single Output per Domain Value', 'Key Point: Vertical Line Test', 'Key Point: Injective Mapping', 'Key Point: Uniqueness']
        : ['{(1, 2), (2, 3), (3, 4)}', '{(1, 5), (1, 6), (2, 7)}', '{(0, 0), (0, 1), (0, 2)}', '{(3, 1), (3, 2), (4, 5)}'],
      correctAnswer: 0,
      explanation: 'Detailed solution steps and rationale for full credit.',
      correctFeedback: '✓ Correct! Standard concept verified.',
      incorrectFeedback: '✗ Review key principles in the ILAW presentation.',
      competency: 'M11GM-Ia-1',
      cognitiveLevel: 'Understanding',
      difficulty: 'medium',
      rubricCriteria: { accuracyPts: 40, designPts: 30, applicationPts: 20, presentationPts: 10 },
      proofSteps: 'Step 1: LCD = 6x\nStep 2: 12 + 2x = 5x\nStep 3: 3x = 12 => x = 4.',
      oralExpectedPoints: 'Student must explicitly state that each domain x-value maps to exactly one y-value.',
      authenticScenario: 'Barangay Cooperative Financial Loan Analysis'
    }
  ]);

  useEffect(() => {
    setTitle(uiConfig.defaultTitle);
    setInstructions(uiConfig.defaultInstructions);
    setAccessCode(category.slice(0, 4).toUpperCase() + Math.floor(10 + Math.random() * 90));
  }, [category]);

  if (!isOpen) return null;

  const handleImportDepEdQuestions = (imported: ParsedDepEdQuestion[]) => {
    const formatted: AssessmentQuestionForm[] = imported.map((q, idx) => ({
      id: `q-excel-${Date.now()}-${idx}`,
      question: q.question,
      questionType: q.questionType || 'multiple-choice',
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.correctFeedback || q.incorrectFeedback || 'Imported from DepEd Excel Item Bank.',
      correctFeedback: q.correctFeedback || '✓ Correct answer.',
      incorrectFeedback: q.incorrectFeedback || '✗ Review key principles.',
      competency: q.competency || 'M11GM-DepEd-MELC',
      cognitiveLevel: q.cognitiveLevel || 'Understanding',
      difficulty: q.difficulty || 'medium'
    }));
    setQuestions(prev => [...prev, ...formatted]);
  };

  const handleAddQuestion = () => {
    const newQ: AssessmentQuestionForm = {
      id: `q-added-${Date.now()}-${questions.length}`,
      question: `New ${category} assessment question...`,
      questionType: category === 'performance' ? 'rubric' : category === 'oral' ? 'oral-probe' : 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Provide explanation/solution steps.',
      correctFeedback: '✓ Correct answer.',
      incorrectFeedback: '✗ Review concept.',
      competency: 'M11GM-Ia-1',
      difficulty: 'medium',
      cognitiveLevel: 'Understanding'
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof AssessmentQuestionForm, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveAssessment = (status: 'Draft' | 'Published') => {
    onSave({
      id: `${category}-${Date.now()}`,
      category,
      title,
      subject,
      gradeLevel,
      topicTitle: competency,
      targetSection,
      schedule: scheduleEnabled ? 'Today (08:00 AM - 05:00 PM)' : 'Self-Paced Anytime',
      accessCode,
      timeLimitMinutes,
      questionsCount: questions.length,
      questions,
      status,
      published: status === 'Published',
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Dynamic Category Header */}
        <div className={`bg-gradient-to-r ${uiConfig.bgGradient} p-6 text-white flex items-center justify-between shrink-0 shadow-md`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-xs">
              <CategoryIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${uiConfig.badgeBg}`}>
                  {uiConfig.badgeText}
                </span>
                <span className="text-[10px] bg-white/10 text-slate-200 font-bold px-2 py-0.5 rounded-full">
                  DepEd Authoring Hub
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1 leading-snug">
                {uiConfig.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl mt-0.5">
                {uiConfig.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Quick Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-3 text-xs flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800 uppercase">Specific Assessment Category:</span>
            <span className="bg-white px-3 py-1 rounded-xl border border-slate-300 font-bold text-slate-900 uppercase">
              {category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import DepEd Excel ({category.toUpperCase()})</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreview ? 'Edit Form' : 'Student Preview'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isPreview ? (
            /* Student Preview Mode */
            <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${uiConfig.badgeBg}`}>
                    {uiConfig.badgeText} PREVIEW
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{title}</h3>
                  <p className="text-xs text-slate-500">{instructions}</p>
                </div>
                <span className="bg-indigo-100 text-indigo-900 font-black text-xs px-3 py-1.5 rounded-xl">
                  {questions.length} Items • {timeLimitMinutes} Mins
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-xs font-black text-slate-500 uppercase">Question {idx + 1}</span>
                    <p className="text-sm font-bold text-slate-900">{q.question}</p>

                    {category === 'performance' && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                        <span className="font-black text-emerald-900 block">Performance Rubric Dimensions</span>
                        <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold">
                          <span>Accuracy: {q.rubricCriteria?.accuracyPts || 40} pts</span>
                          <span>Model Design: {q.rubricCriteria?.designPts || 30} pts</span>
                          <span>Application: {q.rubricCriteria?.applicationPts || 20} pts</span>
                          <span>Presentation: {q.rubricCriteria?.presentationPts || 10} pts</span>
                        </div>
                      </div>
                    )}

                    {category === 'oral' && (
                      <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs space-y-1">
                        <span className="font-black text-teal-900 block">Oral Defense Expected Response Probes</span>
                        <p className="text-slate-700 italic">{q.oralExpectedPoints || 'Verbal explanation required.'}</p>
                      </div>
                    )}

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="p-2.5 bg-slate-100 rounded-xl text-xs font-medium text-slate-800 border border-slate-200">
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Authoring Form Mode */
            <div className="space-y-6">
              {/* Basic Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assessment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Section & Class</label>
                  <input
                    type="text"
                    value={targetSection}
                    onChange={(e) => setTargetSection(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Learning Competency (DepEd MELC)</label>
                  <input
                    type="text"
                    value={competency}
                    onChange={(e) => setCompetency(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Passcode</label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Time Limit (Mins)</label>
                    <input
                      type="number"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 15)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Student Instructions & Prompt</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Questions Pool Manager */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Assessment Questions Pool ({questions.length} Items)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Question Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-black text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                          Item #{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Item</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Question Text / Task Stem</label>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Options or Specific Fields */}
                      {category === 'performance' ? (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
                          <span className="font-black text-emerald-900 block uppercase">Rubric Criteria Weighting (100 Total Points)</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-600 font-bold block">Accuracy Pts</span>
                              <input
                                type="number"
                                value={q.rubricCriteria?.accuracyPts || 40}
                                onChange={(e) => handleUpdateQuestion(q.id, 'rubricCriteria', { ...q.rubricCriteria, accuracyPts: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 bg-white border rounded-lg font-black"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-600 font-bold block">Design Pts</span>
                              <input
                                type="number"
                                value={q.rubricCriteria?.designPts || 30}
                                onChange={(e) => handleUpdateQuestion(q.id, 'rubricCriteria', { ...q.rubricCriteria, designPts: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 bg-white border rounded-lg font-black"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-600 font-bold block">Application Pts</span>
                              <input
                                type="number"
                                value={q.rubricCriteria?.applicationPts || 20}
                                onChange={(e) => handleUpdateQuestion(q.id, 'rubricCriteria', { ...q.rubricCriteria, applicationPts: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 bg-white border rounded-lg font-black"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-600 font-bold block">Presentation Pts</span>
                              <input
                                type="number"
                                value={q.rubricCriteria?.presentationPts || 10}
                                onChange={(e) => handleUpdateQuestion(q.id, 'rubricCriteria', { ...q.rubricCriteria, presentationPts: parseInt(e.target.value) || 0 })}
                                className="w-full p-2 bg-white border rounded-lg font-black"
                              />
                            </div>
                          </div>
                        </div>
                      ) : category === 'oral' ? (
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-teal-800 uppercase">Expected Response Probes & Conceptual Points</label>
                          <textarea
                            rows={2}
                            value={q.oralExpectedPoints || ''}
                            onChange={(e) => handleUpdateQuestion(q.id, 'oralExpectedPoints', e.target.value)}
                            className="w-full p-2.5 bg-white border border-teal-200 rounded-xl text-xs text-slate-900"
                            placeholder="Specify expected verbal reasoning points..."
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const next = [...q.options];
                                  next[optIdx] = e.target.value;
                                  handleUpdateQuestion(q.id, 'options', next);
                                }}
                                className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 sm:p-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveAssessment('Draft')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveAssessment('Published')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Publish Assessment to Class</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* DepEd Excel Importer Sub-modal */}
      <DepEdExcelImporter
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportQuestions={handleImportDepEdQuestions}
        mode={category}
      />
    </div>
  );
}
