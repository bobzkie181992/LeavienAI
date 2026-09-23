import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Sparkles, Plus, Trash2, CheckCircle2, Eye, Save, Send, AlertCircle, HelpCircle, FileText, FileSpreadsheet
} from 'lucide-react';
import { GRADE_11_SUBJECTS } from '../data/grade11SampleData';
import DepEdExcelImporter, { ParsedDepEdQuestion } from './DepEdExcelImporter';

interface DiagnosticQuestionForm {
  id: string;
  question: string;
  questionType: 'multiple-choice' | 'true-false' | 'matching' | 'short-answer';
  options: string[];
  correctAnswer: string | number;
  difficulty: 'easy' | 'medium' | 'hard';
  competency: string;
  explanation: string;
}

interface CreateDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessmentData: any) => void;
}

export default function CreateDiagnosticModal({
  isOpen,
  onClose,
  onSave
}: CreateDiagnosticModalProps) {
  const [title, setTitle] = useState('Grade 11 General Mathematics Quarter 1 Diagnostic');
  const [gradeLevel, setGradeLevel] = useState('Grade 11');
  const [subject, setSubject] = useState('General Mathematics');
  const [quarter, setQuarter] = useState('Quarter 1');
  const [topic, setTopic] = useState('Functions & Their Graphs');
  const [competencies, setCompetencies] = useState('M11GM-Ia-1, M11GM-Ia-2, M11GM-Ia-3');
  const [instructions, setInstructions] = useState('Before starting this lesson, let\'s find out what you already know.');
  const [targetSection, setTargetSection] = useState('Grade 11 - STEM A');
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [startDate, setStartDate] = useState('2026-09-23');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('2026-09-23');
  const [endTime, setEndTime] = useState('17:00');
  const [requiresTeacherPermission, setRequiresTeacherPermission] = useState(true);
  const [accessCode, setAccessCode] = useState('MATH11');
  const [timeMode, setTimeMode] = useState<'untimed' | 'timed' | 'strict_period'>('timed');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [targetQuestionCount, setTargetQuestionCount] = useState(10);
  const [isPreview, setIsPreview] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleImportDepEdQuestions = (imported: ParsedDepEdQuestion[]) => {
    const formatted: DiagnosticQuestionForm[] = imported.map((q, idx) => ({
      id: `dq-excel-${Date.now()}-${idx}`,
      question: q.question,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      competency: q.competency,
      explanation: q.correctFeedback || q.incorrectFeedback
    }));
    setQuestions(prev => [...prev, ...formatted]);
  };

  const [questions, setQuestions] = useState<DiagnosticQuestionForm[]>([
    {
      id: 'dq-1',
      question: 'Which statement best describes a function?',
      questionType: 'multiple-choice',
      options: [
        'A relation where each input has exactly one output',
        'A relation where multiple inputs share all outputs',
        'An equation with two variables and no solution',
        'A set of ordered pairs with repeating first elements'
      ],
      correctAnswer: 0,
      difficulty: 'easy',
      competency: 'M11GM-Ia-1',
      explanation: 'By definition, a function pairs each domain value with exactly one range value.'
    },
    {
      id: 'dq-2',
      question: 'Evaluate f(3) if f(x) = 2x + 1.',
      questionType: 'short-answer',
      options: ['5', '6', '7', '8'],
      correctAnswer: '7',
      difficulty: 'medium',
      competency: 'M11GM-Ia-2',
      explanation: 'f(3) = 2(3) + 1 = 6 + 1 = 7.'
    }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const newQ: DiagnosticQuestionForm = {
      id: `dq-${Date.now()}`,
      question: 'New diagnostic question...',
      questionType: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      difficulty: 'medium',
      competency: 'M11GM-Ia-1',
      explanation: 'Provide solution steps for student diagnosis.'
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof DiagnosticQuestionForm, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAction = (status: 'Draft' | 'Published') => {
    onSave({
      title,
      gradeLevel,
      subject,
      quarter,
      topic,
      competencies,
      instructions,
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
        {/* Header - Distinctive DIAGNOSTIC ASSESSMENT Yellow/Amber Theme */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-6 text-slate-950 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-slate-950 text-amber-400 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Teacher Authoring
              </span>
              <span className="bg-amber-400/30 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                Pre-Learning Baseline
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
              CREATE DIAGNOSTIC ASSESSMENT
            </h2>
            <p className="text-xs text-amber-950 font-bold">
              Purpose: "Find out what the student already knows before or at the beginning of learning."
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Diagnostic Purpose Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase tracking-wider block text-amber-950">
                Diagnostic Assessment Rules & Output:
              </span>
              <span>
                Diagnostic assessments measure prior knowledge and existing skills. The resulting analytics yield student <strong>Strengths</strong>, <strong>Prior Knowledge</strong>, <strong>Learning Gaps</strong>, and <strong>Recommended ILAW Lessons</strong>. Diagnostic results are not treated as high-stakes final grades.
              </span>
            </div>
          </div>

          {!isPreview ? (
            <div className="space-y-6">
              {/* Metadata Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Assessment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {GRADE_11_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Quarter</label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Quarter 1">Quarter 1</option>
                    <option value="Quarter 2">Quarter 2</option>
                    <option value="Quarter 3">Quarter 3</option>
                    <option value="Quarter 4">Quarter 4</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Topic / Domain</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Learning Competencies (Codes)</label>
                  <input
                    type="text"
                    value={competencies}
                    onChange={(e) => setCompetencies(e.target.value)}
                    placeholder="e.g. M11GM-Ia-1, M11GM-Ia-2"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Student Instructions</label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SCHEDULE & TEACHER PERMISSION CONTROLS */}
              <div className="p-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Assessment Schedule & Teacher Permission Settings</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950">
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
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
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
                        className="p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-xs"
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
                        className="p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="p-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-200/60">
                  {/* Enable Schedule Toggle */}
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleEnabled}
                      onChange={(e) => setScheduleEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
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
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
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
                          className="px-3 py-1 bg-white border border-amber-400 rounded-lg text-xs font-black tracking-widest text-amber-950 w-28 uppercase"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* TEACHER TIME MODE & QUESTION COUNT CONFIGURATION */}
                <div className="pt-3 border-t border-amber-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Assessment Time Mode</label>
                    <select
                      value={timeMode}
                      onChange={(e) => setTimeMode(e.target.value as any)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900"
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
                        className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={20}>20 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes (1 Hour)</option>
                        <option value={90}>90 Minutes (1.5 Hours)</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 block">Configured Question Count</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={targetQuestionCount}
                        onChange={(e) => setTargetQuestionCount(Number(e.target.value))}
                        className="w-24 p-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900 text-center"
                      />
                      <span className="text-[11px] font-bold text-slate-500">
                        ({questions.length} items added)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnostic Questions Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Diagnostic Questions ({questions.length})
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
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                          Question #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={q.questionType}
                            onChange={(e) => handleUpdateQuestion(q.id, 'questionType', e.target.value)}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True or False</option>
                            <option value="matching">Matching</option>
                            <option value="short-answer">Short Answer</option>
                          </select>

                          <select
                            value={q.difficulty}
                            onChange={(e) => handleUpdateQuestion(q.id, 'difficulty', e.target.value)}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>

                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Learning Competency</label>
                          <input
                            type="text"
                            value={q.competency}
                            onChange={(e) => handleUpdateQuestion(q.id, 'competency', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Correct Answer / Index</label>
                          <input
                            type="text"
                            value={q.correctAnswer}
                            onChange={(e) => handleUpdateQuestion(q.id, 'correctAnswer', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Student Preview Mode */
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-200 rounded-3xl space-y-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  Student Assessment Preview
                </span>
                <h3 className="text-xl font-black text-slate-900">{title}</h3>
                <p className="text-xs text-slate-600">{instructions}</p>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-amber-600">Q{idx + 1}. ({q.questionType.toUpperCase()})</span>
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
            <Eye className="w-4 h-4 text-amber-600" />
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
              onClick={() => handleAction('Published')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Publish Assessment</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* DepEd Excel Importer Modal */}
      <DepEdExcelImporter
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportQuestions={handleImportDepEdQuestions}
        mode="diagnostic"
      />
    </div>
  );
}
