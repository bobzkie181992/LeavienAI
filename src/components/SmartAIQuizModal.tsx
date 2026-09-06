import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, BookOpen, Brain, CheckCircle2, Play, AlertCircle, Loader2 } from 'lucide-react';
import { Topic, Quiz } from '../types';

interface SmartAIQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  onStartGeneratedQuiz: (quiz: Quiz) => void;
}

export default function SmartAIQuizModal({
  isOpen,
  onClose,
  topics,
  onStartGeneratedQuiz
}: SmartAIQuizModalProps) {
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || '');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Olympiad'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPreviewQuiz(null);

    const topic = topics.find(t => t.id === selectedTopicId);
    const topicTitle = topic ? topic.title : 'Grade 11 Mathematics';

    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle,
          difficulty,
          count: questionCount,
          customPrompt
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      // Convert generated quiz structure to match Quiz interface
      const rawQuiz = data.quiz;
      const formattedQuiz: Quiz = {
        id: `ai-quiz-${Date.now()}`,
        topicId: selectedTopicId,
        title: rawQuiz.title || `${topicTitle} (${difficulty} AI Quiz)`,
        description: rawQuiz.description || `Custom AI-generated quiz focused on ${topicTitle}.`,
        xpReward: questionCount * 25,
        problems: (rawQuiz.questions || []).map((q: any, idx: number) => ({
          id: q.id || `q-${idx}`,
          question: q.question,
          options: q.options || ['A', 'B', 'C', 'D'],
          correctAnswer: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          solution: q.explanation || 'Review the core theorem for this topic.',
          topic: topicTitle,
          competency: 'AI Generated Core Competency',
          difficulty: difficulty.toLowerCase() as any,
          difficultyParameter: 0.5,
          discriminationParameter: 1.0,
          cognitiveLevel: 'Application',
          misconceptionCategory: 'None',
          hint1: q.hint || 'Think about the definitions learned in Grade 11 math.',
          hint2: 'Review standard textbook formulas.',
          explanation: q.explanation || 'Review the core theorem for this topic.',
          remediation: 'Review related curriculum notes in Formula Hub.'
        }))
      };

      setPreviewQuiz(formattedQuiz);
    } catch (err: any) {
      console.error('Error generating AI quiz:', err);
      setError(err.message || 'Failed to generate quiz. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = () => {
    if (!previewQuiz) return;
    onStartGeneratedQuiz(previewQuiz);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Smart AI Quiz Generator</h2>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini 3.8 AI
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Generate custom, rigorous Grade 11 math quizzes tailored to your learning needs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!previewQuiz ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Grade 11 Mathematics Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Easy">Easy (Foundation Check)</option>
                    <option value="Medium">Medium (Standard Grade 11)</option>
                    <option value="Hard">Hard (Advanced Mastery)</option>
                    <option value="Olympiad">Olympiad (Mastery & Proofs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={3}>3 Questions (Quick Drill)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={10}>10 Questions (Deep Practice)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Custom Focus / Specific Sub-topics (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Focus on word problems involving trigonometric identities and real-world angle of elevation..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span>Gemini AI is crafting your custom quiz...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>Generate Smart AI Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                    AI Quiz Ready Successfully
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{previewQuiz.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{previewQuiz.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs font-bold text-slate-700">
                    <span>{previewQuiz.problems.length} Questions</span>
                    <span>•</span>
                    <span>{previewQuiz.xpReward} XP Reward</span>
                    <span>•</span>
                    <span>{(previewQuiz.problems.length * 2)} Mins</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview Questions:</h4>
                {previewQuiz.problems.map((q, idx) => (
                  <div key={q.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-900">Q{idx + 1}: {q.question}</p>
                    <p className="text-slate-500 text-[11px]">Correct Answer Option: <strong className="text-emerald-700">{q.options[q.correctAnswer]}</strong></p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewQuiz(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
                >
                  Generate Another
                </button>
                <button
                  type="button"
                  onClick={handleLaunch}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start AI Practice Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
