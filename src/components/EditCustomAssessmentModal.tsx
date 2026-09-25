import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, Trash2, Plus, Sparkles, HelpCircle, AlertCircle, Edit3, Check, RefreshCw 
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
  } | null;
  onSave: (updatedAssessment: any) => void;
}

export default function EditCustomAssessmentModal({
  isOpen,
  onClose,
  assessment,
  onSave
}: EditCustomAssessmentModalProps) {
  const [title, setTitle] = useState('');
  const [targetSection, setTargetSection] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [schedule, setSchedule] = useState('');
  const [questions, setQuestions] = useState<ParsedDepEdQuestion[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Load assessment values on open
  useEffect(() => {
    if (assessment) {
      setTitle(assessment.title);
      setTargetSection(assessment.targetSection);
      setAccessCode(assessment.accessCode);
      setSchedule(assessment.schedule);
      setQuestions(JSON.parse(JSON.stringify(assessment.questions || []))); // deep clone
      setExpandedIndex(0);
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

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qId));
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
      incorrectFeedback: 'Review basic properties.'
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
          <div className="space-y-3">
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
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {q.question || <em className="text-slate-400 font-normal">Untitled Question</em>}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-black uppercase bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded tracking-wide">
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 truncate max-w-28 hidden sm:inline">
                        {q.competency}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(q.id);
                        }}
                        className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Expanded Fields */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4 bg-white animate-in slide-in-from-top-2 duration-150">
                      {/* Question Text */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Question Stem</label>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                Choice {String.fromCharCode(65 + oIdx)}
                              </label>
                              {Number(q.correctAnswer) === oIdx && (
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full uppercase flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Correct Answer
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black border border-slate-200 text-slate-500 uppercase shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleUpdateOption(q.id, oIdx, e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Details & Metadata row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Syllabus Competency (MELC)</label>
                          <input
                            type="text"
                            value={q.competency}
                            onChange={(e) => handleUpdateQuestion(q.id, 'competency', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Correct Choice (A-D)</label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => handleUpdateQuestion(q.id, 'correctAnswer', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                          >
                            <option value={0}>Choice A</option>
                            <option value={1}>Choice B</option>
                            <option value={2}>Choice C</option>
                            <option value={3}>Choice D</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Difficulty Scale</label>
                          <select
                            value={q.difficulty}
                            onChange={(e) => handleUpdateQuestion(q.id, 'difficulty', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
                          >
                            <option value="easy">Easy (Foundational)</option>
                            <option value="medium">Medium (Analytical)</option>
                            <option value="hard">Hard (Mastery Challenge)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

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
