import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, GripVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import { Topic, Quiz, Problem, ItemStatus } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface QuizManagerProps {
  topic: Topic;
  onSave: (topic: Topic) => Promise<void>;
  onBack: () => void;
}

export default function QuizManager({ topic, onSave, onBack }: QuizManagerProps) {
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [deletingProblemId, setDeletingProblemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const startNewQuiz = () => {
    setEditingQuiz({
      id: `quiz-${Date.now()}`,
      title: '',
      description: '',
      topicId: topic.id,
      problems: [],
      xpReward: 100
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz) return;
    
    const existingIndex = topic.quizzes.findIndex(q => q.id === editingQuiz.id);
    const newQuizzes = [...topic.quizzes];
    
    if (existingIndex >= 0) {
      newQuizzes[existingIndex] = editingQuiz;
    } else {
      newQuizzes.push(editingQuiz);
    }
    
    await onSave({ ...topic, quizzes: newQuizzes });
    setEditingQuiz(null);
  };

  const confirmDeleteQuiz = async () => {
    if (!deletingQuizId) return;
    setIsDeleting(true);
    try {
      await onSave({
        ...topic,
        quizzes: topic.quizzes.filter(q => q.id !== deletingQuizId)
      });
    } finally {
      setIsDeleting(false);
      setDeletingQuizId(null);
    }
  };

  const confirmDeleteProblem = () => {
    if (!deletingProblemId || !editingQuiz) return;
    setEditingQuiz({
      ...editingQuiz,
      problems: editingQuiz.problems.filter(p => p.id !== deletingProblemId)
    });
    setDeletingProblemId(null);
  };

  const startNewProblem = () => {
    setEditingProblem({
      id: `problem-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      solution: '',
      topic: topic.title,
      competency: '',
      difficulty: 'medium',
      difficultyParameter: 0,
      discriminationParameter: 1,
      cognitiveLevel: 'Understanding',
      misconceptionCategory: '',
      hint1: '',
      hint2: '',
      hints: [],
      explanation: '',
      remediation: '',
      status: 'Draft'
    });
  };

  const handleSaveProblem = () => {
    if (!editingProblem || !editingQuiz) return;
    const existingIndex = editingQuiz.problems.findIndex(p => p.id === editingProblem.id);
    const newProblems = [...editingQuiz.problems];
    
    if (existingIndex >= 0) {
      newProblems[existingIndex] = editingProblem;
    } else {
      newProblems.push(editingProblem);
    }
    
    setEditingQuiz({ ...editingQuiz, problems: newProblems });
    setEditingProblem(null);
  };

  const handleDeleteProblem = (problemId: string) => {
    setDeletingProblemId(problemId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Quizzes for {topic.title}</h2>
          <p className="text-slate-500">Manage the learning material for this topic.</p>
        </div>
      </div>

      {!editingQuiz ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={startNewQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Quiz
            </button>
          </div>

          <div className="grid gap-4">
            {topic.quizzes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[30px]">
                <p>No quizzes added yet.</p>
              </div>
            ) : (
              topic.quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{quiz.title}</h3>
                    <p className="text-sm text-slate-500">{quiz.problems.length} Problems • {quiz.xpReward} XP Reward</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingQuiz(quiz)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setDeletingQuizId(quiz.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[30px] p-6 sm:p-8 shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900">{editingQuiz.id.startsWith('quiz-') ? 'Create Quiz' : 'Edit Quiz'}</h3>
            <button 
              onClick={() => setEditingQuiz(null)}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSaveQuiz} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Quiz Title</label>
                <input 
                  type="text" 
                  required
                  value={editingQuiz.title}
                  onChange={(e) => setEditingQuiz({...editingQuiz, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">XP Reward</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="10"
                  value={editingQuiz.xpReward}
                  onChange={(e) => setEditingQuiz({...editingQuiz, xpReward: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
              <textarea 
                required
                rows={2}
                value={editingQuiz.description}
                onChange={(e) => setEditingQuiz({...editingQuiz, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-slate-900">Problems</h4>
                <button 
                  type="button"
                  onClick={startNewProblem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Problem
                </button>
              </div>

              <div className="space-y-4">
                {editingQuiz.problems.map((problem, index) => {
                  const status = problem.status || 'Active';
                  return (
                    <div key={problem.id} className="p-4 bg-slate-50 rounded-2xl flex gap-4 group">
                      <div className="text-slate-300 mt-1 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'Validated' ? 'bg-blue-100 text-blue-800' :
                            status === 'For Validation' ? 'bg-amber-100 text-amber-800' :
                            status === 'Inactive' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            b={problem.difficultyParameter} • a={problem.discriminationParameter}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 mb-1">
                          {index + 1}. {problem.question}
                        </div>
                        <div className="text-sm text-slate-500 line-clamp-1">
                          Ans: {problem.options[problem.correctAnswer]} • <span className="italic">{problem.competency}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button"
                          onClick={() => setEditingProblem(problem)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteProblem(problem.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="submit"
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Quiz
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Problem Editor Modal */}
      <AnimatePresence>
        {editingProblem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[30px] p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                {editingProblem.id.startsWith('problem-') ? 'New Problem' : 'Edit Problem'}
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Item Status (Workflow)
                  </label>
                  <select
                    value={editingProblem.status || 'Draft'}
                    onChange={(e) => setEditingProblem({ ...editingProblem, status: e.target.value as ItemStatus })}
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  >
                    <option value="Draft">Draft (Authoring)</option>
                    <option value="For Validation">For Validation (Review Required)</option>
                    <option value="Validated">Validated (Psychometrically Approved)</option>
                    <option value="Active">Active (Official Assessments)</option>
                    <option value="Inactive">Inactive (Deactivated/Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Question</label>
                  <textarea 
                    rows={2}
                    value={editingProblem.question}
                    onChange={(e) => setEditingProblem({...editingProblem, question: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                    placeholder="E.g., Solve for x: 2x + 5 = 15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Options</label>
                  <div className="space-y-3">
                    {editingProblem.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingProblem({...editingProblem, correctAnswer: i})}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            editingProblem.correctAnswer === i 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...editingProblem.options];
                            newOptions[i] = e.target.value;
                            setEditingProblem({...editingProblem, options: newOptions});
                          }}
                          className={`flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 ${
                            editingProblem.correctAnswer === i ? 'font-bold text-emerald-900' : ''
                          }`}
                          placeholder={`Option ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 ml-11">Click the checkmark to mark the correct answer.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Mathematical Solution</label>
                  <textarea 
                    rows={2}
                    value={editingProblem.solution}
                    onChange={(e) => setEditingProblem({...editingProblem, solution: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    placeholder="Step-by-step mathematical solution..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Competency</label>
                    <input 
                      type="text"
                      value={editingProblem.competency}
                      onChange={(e) => setEditingProblem({...editingProblem, competency: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Cognitive Level</label>
                    <input 
                      type="text"
                      value={editingProblem.cognitiveLevel}
                      onChange={(e) => setEditingProblem({...editingProblem, cognitiveLevel: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Difficulty</label>
                    <select
                      value={editingProblem.difficulty}
                      onChange={(e) => {
                        const diff = e.target.value as 'easy' | 'medium' | 'hard';
                        const param = diff === 'easy' ? -1 : diff === 'medium' ? 0 : 1.5;
                        setEditingProblem({ ...editingProblem, difficulty: diff, difficultyParameter: param });
                      }}
                      className="w-full px-3 py-2 bg-white rounded-lg text-xs font-bold"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">b (Difficulty)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingProblem.difficultyParameter}
                      onChange={(e) => setEditingProblem({ ...editingProblem, difficultyParameter: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">a (Discrimination)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingProblem.discriminationParameter}
                      onChange={(e) => setEditingProblem({ ...editingProblem, discriminationParameter: parseFloat(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-white rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Misconception Category</label>
                  <input 
                    type="text"
                    value={editingProblem.misconceptionCategory || ''}
                    onChange={(e) => setEditingProblem({...editingProblem, misconceptionCategory: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g., Sign error or order of operations"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Explanation (Non-technical)</label>
                  <textarea 
                    rows={2}
                    value={editingProblem.explanation}
                    onChange={(e) => setEditingProblem({...editingProblem, explanation: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Explain why the correct answer is right conceptually..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Remediation Advice</label>
                  <input 
                    type="text"
                    value={editingProblem.remediation || ''}
                    onChange={(e) => setEditingProblem({...editingProblem, remediation: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="Study recommendations if incorrect..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Hint 1</label>
                    <textarea 
                      rows={2}
                      value={editingProblem.hint1}
                      onChange={(e) => setEditingProblem({...editingProblem, hint1: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                      placeholder="First gentle nudge..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Hint 2</label>
                    <textarea 
                      rows={2}
                      value={editingProblem.hint2}
                      onChange={(e) => setEditingProblem({...editingProblem, hint2: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                      placeholder="More explicit clue..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    onClick={() => setEditingProblem(null)}
                    className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProblem}
                    disabled={!editingProblem.question || editingProblem.options.some(o => !o)}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Quiz Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingQuizId}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? All problems and questions within it will be deleted."
        confirmText="Delete Quiz"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteQuiz}
        onClose={() => setDeletingQuizId(null)}
      />

      {/* Delete Problem Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingProblemId}
        title="Delete Question Item"
        message="Are you sure you want to delete this question item from the quiz?"
        confirmText="Delete Item"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteProblem}
        onClose={() => setDeletingProblemId(null)}
      />
    </div>
  );
}
