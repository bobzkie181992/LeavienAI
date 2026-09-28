import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, Trash2, Plus, Sparkles, HelpCircle, AlertCircle, Edit3, Check, RefreshCw, EyeOff 
} from 'lucide-react';
import { ParsedDepEdQuestion } from './DepEdExcelImporter';

interface EditCustomAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: {
    id: string;
    title: string;
    topicTitle: string;
    targetSection: string;
    questionsCount: number;
    accessCode: string;
    schedule: string;
    questions: ParsedDepEdQuestion[];
    createdAt: string;
    published?: boolean;
    status?: string;
  } | null;
  onSave: (updatedAssessment: any) => void;
  onDelete?: (assessmentId: string) => void;
}

export default function EditCustomAssessmentModal({
  isOpen,
  onClose,
  assessment,
  onSave,
  onDelete
}: EditCustomAssessmentModalProps) {
  const [title, setTitle] = useState('');
  const [targetSection, setTargetSection] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [schedule, setSchedule] = useState('');
  const [published, setPublished] = useState<boolean>(true);
  const [questions, setQuestions] = useState<ParsedDepEdQuestion[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Load assessment values on open
  useEffect(() => {
    if (assessment) {
      setTitle(assessment.title);
      setTargetSection(assessment.targetSection);
      setAccessCode(assessment.accessCode);
      setSchedule(assessment.schedule);
      setPublished(assessment.published !== false && assessment.status !== 'Draft');
      setQuestions(JSON.parse(JSON.stringify(assessment.questions || []))); // deep clone
      setExpandedIndex(0);
      setShowRemoveConfirm(false);
    }
  }, [assessment, isOpen]);

  if (!isOpen || !assessment) return null;

  const handleUpdateQuestion = (qId: string, field: keyof ParsedDepEdQuestion, value: any) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, [field]: value } : q));
  };

  const handleUpdateOption = (qId: string, optionIdx: number, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const nextOpts = [...q.options];
        nextOpts[optionIdx] = value;
        return { ...q, options: nextOpts };
      }
      return q;
    }));
  };

  const handleToggleQuestionPublished = (qId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        return { ...q, published: q.published === false ? true : false };
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const handleConfirmRemoveAssessment = () => {
    if (onDelete && assessment) {
      onDelete(assessment.id);
    }
    onClose();
  };

  const handleAddQuestion = () => {
    const newQ: ParsedDepEdQuestion = {
      id: `q-added-${Date.now()}-${questions.length}`,
      question: 'New custom question item text?',
      questionType: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      competency: 'M11GM-Ia-1',
      difficulty: 'medium',
      correctFeedback: 'Excellent explanation!',
      incorrectFeedback: 'Review basic properties.',
      published: true
    };
    setQuestions(prev => [...prev, newQ]);
    setExpandedIndex(questions.length); // Expand the newly added question
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Assessment title cannot be empty.');
      return;
    }
    if (questions.length === 0) {
      alert('Assessment must have at least 1 question.');
      return;
    }

    onSave({
      ...assessment,
      title,
      targetSection,
      accessCode,
      schedule,
      questionsCount: questions.length,
      questions,
      published,
      status: published ? 'Published' : 'Draft',
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header - Amber/Indigo Diagnostic edit theme */}
        <div className="bg-gradient-to-r from-amber-600 via-indigo-900 to-indigo-950 p-6 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Assessment Editor
              </span>
              <span className="bg-white/10 text-slate-200 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                Item Bank Editor
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Edit Imported ITEM BANK Questions
            </h2>
            <p className="text-xs text-indigo-200">
              Customize diagnostic questions, multiple-choice options, answers, and syllabus competencies.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Assessment Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Target Section</label>
              <input
                type="text"
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Passcode Access</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tracking-wider font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Schedule Duration</label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1 flex items-end">
              <div className="p-2.5 bg-indigo-50 text-indigo-900 rounded-xl border border-indigo-100 text-xs w-full flex items-center justify-between font-bold">
                <span>Total Assessment Questions:</span>
                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg font-black">{questions.length}</span>
              </div>
            </div>

            {/* Assessment Student Visibility Toggle */}
            <div className="sm:col-span-2 space-y-1 flex items-end">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs w-full flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Student Visibility Status
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {published ? 'Published to Students' : 'Not Published (Draft)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPublished(!published)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                    published 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  }`}
                >
                  {published ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{published ? 'Published to Student' : 'Not Published'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Question List Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Imported Question Bank Items ({questions.length})
            </h3>
            <button
              onClick={handleAddQuestion}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Question</span>
            </button>
          </div>

          {/* Question List Map */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isExpanded = expandedIndex === idx;

              return (
                <div 
                  key={q.id} 
                  className={`border rounded-2xl overflow-hidden transition-all shadow-xs ${
                    isExpanded ? 'border-indigo-500 bg-white ring-2 ring-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  {/* Question Header Accordion */}
                  <div 
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {q.question || <em className="text-slate-400 font-normal">Untitled Question</em>}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0 justify-end">
                      {/* Published to Student Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleQuestionPublished(q.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          q.published !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                        }`}
                        title={q.published !== false ? 'Click to hide this question from students' : 'Click to publish this question to students'}
                      >
                        {q.published !== false ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-700 px-2 py-1 rounded-md tracking-wide">
                        {q.difficulty}
                      </span>
                      {q.competency && (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md truncate max-w-32 hidden md:inline">
                          {q.competency}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(q.id);
                        }}
                        className="p-1.5 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Expanded Fields */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-slate-100 space-y-4 bg-white animate-in slide-in-from-top-2 duration-150">
                      {/* Question Text */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Question Stem & Prompt</label>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                        />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                Option {String.fromCharCode(65 + oIdx)}
                              </label>
                              {Number(q.correctAnswer) === oIdx && (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" /> Correct Answer
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border uppercase shrink-0 ${
                                Number(q.correctAnswer) === oIdx 
                                  ? 'bg-emerald-600 text-white border-emerald-700' 
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption(q.id, oIdx, e.target.value)}
                                className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  Number(q.correctAnswer) === oIdx
                                    ? 'border-emerald-400 text-emerald-950 bg-emerald-50/30'
                                    : 'border-slate-300 text-slate-800'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Details & Metadata row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Curriculum Competency (MELC)</label>
                          <input
                            type="text"
                            value={q.competency}
                            onChange={(e) => handleUpdateQuestion(q.id, 'competency', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Correct Key (A-D)</label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => handleUpdateQuestion(q.id, 'correctAnswer', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value={0}>Option A</option>
                            <option value={1}>Option B</option>
                            <option value={2}>Option C</option>
                            <option value={3}>Option D</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Difficulty Rating</label>
                          <select
                            value={q.difficulty}
                            onChange={(e) => handleUpdateQuestion(q.id, 'difficulty', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="easy">Easy (Foundational)</option>
                            <option value="medium">Medium (Analytical)</option>
                            <option value="hard">Hard (Mastery Challenge)</option>
                          </select>
                        </div>
                      </div>

                      {/* Explicit Delete Question Button inside editor */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-semibold">
                          Item ID: <strong className="text-slate-800 font-mono">{q.itemId || q.id}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Question #{idx + 1}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* In-Modal Remove Assessment Confirmation */}
        {showRemoveConfirm && (
          <div className="p-4 mx-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Are you sure you want to permanently remove <strong>"{title}"</strong> and all {questions.length} questions?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveAssessment}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowRemoveConfirm(true)}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Permanently remove this assessment from the list"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Remove Assessment</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Item Bank Changes</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
