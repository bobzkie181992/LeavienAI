import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sparkles, Plus, Trash2, CheckCircle2, Eye, Save, Send, HelpCircle, FileCheck, Layers, FileSpreadsheet
} from 'lucide-react';
import { GRADE_11_SUBJECTS } from '../data/grade11SampleData';
import DepEdExcelImporter, { ParsedDepEdQuestion } from './DepEdExcelImporter';

export type FormativeAssessmentType =
  | 'Quick Check'
  | 'Practice'
  | 'Exit Ticket'
  | 'Reflection'
  | 'Knowledge Check';

interface FormativeQuestionForm {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  correctAnswerFeedback: string;
  incorrectAnswerFeedback: string;
}

interface CreateFormativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessmentData: any) => void;
}

export default function CreateFormativeModal({
  isOpen,
  onClose,
  onSave
}: CreateFormativeModalProps) {
  const [title, setTitle] = useState('Lesson 1: Functions - Formative Quick Check');
  const [ilawLesson, setIlawLesson] = useState('Lesson 1: Introduction to Functions & Relations');
  const [subject, setSubject] = useState('General Mathematics');
  const [gradeLevel, setGradeLevel] = useState('Grade 11');
  const [learningCompetency, setLearningCompetency] = useState('M11GM-Ia-2: Evaluates functions accurately');
  const [assessmentType, setAssessmentType] = useState<FormativeAssessmentType>('Quick Check');
  const [targetSection, setTargetSection] = useState('Grade 11 - STEM A');
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [startDate, setStartDate] = useState('2026-09-23');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('2026-09-23');
  const [endTime, setEndTime] = useState('17:00');
  const [requiresTeacherPermission, setRequiresTeacherPermission] = useState(true);
  const [accessCode, setAccessCode] = useState('FORM11');
  const [timeMode, setTimeMode] = useState<'untimed' | 'timed' | 'strict_period'>('timed');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [targetQuestionCount, setTargetQuestionCount] = useState(5);
  const [isPreview, setIsPreview] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleImportDepEdQuestions = (imported: ParsedDepEdQuestion[]) => {
    const formatted: FormativeQuestionForm[] = imported.map((q, idx) => ({
      id: `fq-excel-${Date.now()}-${idx}`,
      question: q.question,
      options: q.options,
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      correctAnswerFeedback: q.correctFeedback || '✓ Correct! Well done evaluating this step.',
      incorrectAnswerFeedback: q.incorrectFeedback || '✗ Review the key formula in the ILAW lesson discussion.'
    }));
    setQuestions(prev => [...prev, ...formatted]);
  };

  const [questions, setQuestions] = useState<FormativeQuestionForm[]>([
    {
      id: 'fq-1',
      question: 'Evaluate f(3) if f(x) = 2x + 1.',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2, // Index 2 -> "7"
      correctAnswerFeedback: '✓ Correct! f(3) = 2(3) + 1 = 6 + 1 = 7.',
      incorrectAnswerFeedback: '✗ Review the example about evaluating functions by substituting x = 3 into f(x) = 2x + 1.'
    },
    {
      id: 'fq-2',
      question: 'Which of the following relations is NOT a function?',
      options: [
        '{(1, 2), (2, 3), (3, 4)}',
        '{(1, 5), (1, 6), (2, 7)}',
        '{(0, 0), (2, 4), (-2, 4)}',
        '{(3, 1), (4, 1), (5, 1)}'
      ],
      correctAnswer: 1, // Index 1
      correctAnswerFeedback: '✓ Correct! The domain element x = 1 is paired with two distinct range values.',
      incorrectAnswerFeedback: '✗ Remember: A relation is NOT a function if an x-value repeats with different y-values.'
    }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: FormativeQuestionForm = {
      id: `fq-${Date.now()}`,
      question: 'New formative question...',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      correctAnswerFeedback: '✓ Correct! Great job evaluating this step.',
      incorrectAnswerFeedback: '✗ Review the key formula in the ILAW lesson discussion.'
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof FormativeQuestionForm, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAction = (status: 'Draft' | 'Assigned') => {
    onSave({
      title,
      ilawLesson,
      subject,
      gradeLevel,
      learningCompetency,
      assessmentType,
      targetSection,
      scheduleEnabled,
      startDate,
      startTime,
      endDate,
      endTime,
      requiresTeacherPermission,
      accessCode,
      questions,
      status,
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header - Distinctive FORMATIVE ASSESSMENT Indigo/Blue Theme */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Teacher Authoring
              </span>
              <span className="bg-white/20 text-indigo-100 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                In-Lesson Formative
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              CREATE FORMATIVE ASSESSMENT
            </h2>
            <p className="text-xs text-indigo-200 font-bold">
              Purpose: "Check student understanding while learning during ILAW lessons."
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Formative Purpose Notice */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3 text-xs text-indigo-900">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase tracking-wider block text-indigo-950">
                Formative Assessment Purpose & Immediate Feedback:
              </span>
              <span>
                Formative checks are integrated during active ILAW lessons. They provide immediate <strong>Correct Answer Feedback</strong> and <strong>Incorrect Answer Feedback</strong> to guide low-stakes continuous practice.
              </span>
            </div>
          </div>

          {!isPreview ? (
            <div className="space-y-6">
              {/* Formative Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Assessment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Assessment Type</label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as FormativeAssessmentType)}
                    className="w-full px-3.5 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-black text-indigo-950 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Quick Check">Quick Check</option>
                    <option value="Practice">Practice</option>
                    <option value="Exit Ticket">Exit Ticket</option>
                    <option value="Reflection">Reflection</option>
                    <option value="Knowledge Check">Knowledge Check</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Associated ILAW Lesson</label>
                  <input
                    type="text"
                    value={ilawLesson}
                    onChange={(e) => setIlawLesson(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {GRADE_11_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Learning Competency</label>
                  <input
                    type="text"
                    value={learningCompetency}
                    onChange={(e) => setLearningCompetency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SCHEDULE & TEACHER PERMISSION CONTROLS */}
              <div className="p-5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>Assessment Schedule & Teacher Permission Settings</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-950">
                    Live Security Gate
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Target Class Section */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Target Section / Class</label>
                    <select
                      value={targetSection}
                      onChange={(e) => setTargetSection(e.target.value)}
                      className="w-full p-2.5 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="All Grade 11 Sections">All Grade 11 Sections</option>
                      <option value="Grade 11 - STEM A">Grade 11 - STEM A</option>
                      <option value="Grade 11 - STEM B">Grade 11 - STEM B</option>
                      <option value="Grade 11 - ABM A">Grade 11 - ABM A</option>
                      <option value="Grade 11 - HUMSS A">Grade 11 - HUMSS A</option>
                    </select>
                  </div>

                  {/* Schedule Start Time */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Start Date & Time</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  {/* Schedule End Time */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">End Date & Time</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="p-2 bg-white border border-indigo-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-indigo-200/60">
                  {/* Enable Schedule Toggle */}
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleEnabled}
                      onChange={(e) => setScheduleEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Enforce Schedule Window (Lock outside dates/times)</span>
                  </label>

                  {/* Require Teacher Permission Toggle & Code */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requiresTeacherPermission}
                        onChange={(e) => setRequiresTeacherPermission(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Require Teacher Permission / Access Code</span>
                    </label>

                    {requiresTeacherPermission && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600">Access Passcode:</span>
                        <input
                          type="text"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                          className="px-3 py-1 bg-white border border-indigo-400 rounded-lg text-xs font-black tracking-widest text-indigo-950 w-28 uppercase"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* TEACHER TIME MODE & QUESTION COUNT CONFIGURATION */}
                <div className="pt-3 border-t border-indigo-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Assessment Time Mode</label>
                    <select
                      value={timeMode}
                      onChange={(e) => setTimeMode(e.target.value as any)}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl text-xs font-black text-slate-900"
                    >
                      <option value="untimed">Self-Paced (Untimed)</option>
                      <option value="timed">Timed (Flexible Countdown)</option>
                      <option value="strict_period">Strict Period (Auto-Submit on 0:00)</option>
                    </select>
                  </div>

                  {timeMode !== 'untimed' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">Time Limit (Minutes)</label>
                      <select
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-indigo-300 rounded-xl text-xs font-black text-slate-900"
                      >
                        <option value={5}>5 Minutes (Quick Check)</option>
                        <option value={10}>10 Minutes</option>
                        <option value={15}>15 Minutes</option>
                        <option value={20}>20 Minutes</option>
                        <option value={30}>30 Minutes</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Configured Question Count</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={targetQuestionCount}
                        onChange={(e) => setTargetQuestionCount(Number(e.target.value))}
                        className="w-24 p-2 bg-white border border-indigo-300 rounded-xl text-xs font-black text-slate-900 text-center"
                      />
                      <span className="text-[11px] font-bold text-slate-500">
                        ({questions.length} items added)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formative Questions */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Formative Questions & Feedback ({questions.length})
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsExcelModalOpen(true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>📁 Upload DepEd Excel</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                          Formative Question #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Question Prompt</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      {/* Correct Answer Feedback */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Correct Answer Feedback (Immediate Explanation)</span>
                        </label>
                        <input
                          type="text"
                          value={q.correctAnswerFeedback}
                          onChange={(e) => handleUpdateQuestion(q.id, 'correctAnswerFeedback', e.target.value)}
                          className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 focus:outline-none"
                        />
                      </div>

                      {/* Incorrect Answer Feedback */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-rose-600 uppercase flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-rose-600" />
                          <span>Incorrect Answer Feedback (Remediation Hint)</span>
                        </label>
                        <input
                          type="text"
                          value={q.incorrectAnswerFeedback}
                          onChange={(e) => handleUpdateQuestion(q.id, 'incorrectAnswerFeedback', e.target.value)}
                          className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-bold text-rose-950 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Student Preview Mode */
            <div className="space-y-6">
              <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-3xl space-y-2">
                <span className="bg-indigo-600 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  Formative Check Student Preview ({assessmentType})
                </span>
                <h3 className="text-xl font-black text-slate-900">{title}</h3>
                <p className="text-xs text-slate-600">{ilawLesson} • {learningCompetency}</p>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-indigo-600">Formative Check Q{idx + 1}</span>
                    <p className="text-sm font-bold text-slate-900">{q.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>{isPreview ? 'Back to Edit' : 'Preview Student View'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('Draft')}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => handleAction('Assigned')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Assign Formative Check</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* DepEd Excel Importer Modal */}
      <DepEdExcelImporter
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportQuestions={handleImportDepEdQuestions}
        mode="formative"
      />
    </div>
  );
}
