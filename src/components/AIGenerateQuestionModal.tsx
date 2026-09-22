import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Brain, CheckCircle2, AlertCircle, 
  HelpCircle, Stethoscope, GraduationCap, ChevronRight, 
  RefreshCw, Check, Compass, BookOpen, Layers
} from 'lucide-react';
import { DIAGNOSTIC_LEVELS, FORMATIVE_LEVELS } from '../types';

export interface GeneratedQuestionPayload {
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
  competency: string;
  assessmentType: 'diagnostic' | 'formative' | 'summative';
  assessmentLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cognitiveLevel: 'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating';
  explanation: string;
  hint1?: string;
  hint2?: string;
  misconceptions?: Array<{ choiceIndex: number; misconception: string; remediation: string }>;
  difficultyParameter?: number;
  discriminationParameter?: number;
}

interface AIGenerateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAssessmentType?: 'diagnostic' | 'formative';
  defaultAssessmentLevel?: string;
  defaultTopic?: string;
  availableTopics?: string[];
  onQuestionGenerated: (question: GeneratedQuestionPayload) => Promise<void> | void;
  title?: string;
  subtitle?: string;
}

const DEFAULT_MATH_TOPICS = [
  'Functions and Their Graphs',
  'Rational Functions, Equations, & Inequalities',
  'Inverse Functions',
  'Exponential Functions, Equations, & Inequalities',
  'Logarithmic Functions, Equations, & Inequalities',
  'Simple and Compound Interest',
  'Simple and General Annuities',
  'Basic Concepts of Stocks and Bonds',
  'Business and Consumer Loans',
  'Propositional Logic and Syllogisms',
  'Methods of Proof and Disproof'
];

export default function AIGenerateQuestionModal({
  isOpen,
  onClose,
  defaultAssessmentType = 'diagnostic',
  defaultAssessmentLevel,
  defaultTopic,
  availableTopics = DEFAULT_MATH_TOPICS,
  onQuestionGenerated,
  title,
  subtitle
}: AIGenerateQuestionModalProps) {
  const [assessmentType, setAssessmentType] = useState<'diagnostic' | 'formative'>(defaultAssessmentType);
  const [assessmentLevel, setAssessmentLevel] = useState<string>(
    defaultAssessmentLevel || 
    (defaultAssessmentType === 'diagnostic' ? 'Level 2 - Core Concept Baseline' : 'Level 2 - Guided Skill Application')
  );
  const [topic, setTopic] = useState<string>(defaultTopic || availableTopics[0] || 'Rational Functions');
  const [competency, setCompetency] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cognitiveLevel, setCognitiveLevel] = useState<'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating'>('applying');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestionPayload | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Sync props if modal opens
  React.useEffect(() => {
    if (isOpen) {
      setAssessmentType(defaultAssessmentType);
      setAssessmentLevel(
        defaultAssessmentLevel || 
        (defaultAssessmentType === 'diagnostic' ? 'Level 2 - Core Concept Baseline' : 'Level 2 - Guided Skill Application')
      );
      if (defaultTopic) setTopic(defaultTopic);
      setError(null);
      setGeneratedQuestion(null);
    }
  }, [isOpen, defaultAssessmentType, defaultAssessmentLevel, defaultTopic]);

  if (!isOpen) return null;

  const currentLevels = assessmentType === 'diagnostic' ? DIAGNOSTIC_LEVELS : FORMATIVE_LEVELS;
  const currentLevelInfo = currentLevels.find(lvl => lvl.id === assessmentLevel) || currentLevels[1];

  const handleAssessmentTypeChange = (newType: 'diagnostic' | 'formative') => {
    setAssessmentType(newType);
    if (newType === 'diagnostic') {
      setAssessmentLevel('Level 2 - Core Concept Baseline');
    } else {
      setAssessmentLevel('Level 2 - Guided Skill Application');
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/generate-assessment-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentType,
          assessmentLevel,
          topic,
          competency,
          difficulty,
          cognitiveLevel,
          customPrompt
        })
      });

      const data = await res.json();
      if (!data.success || !data.question) {
        throw new Error(data.error || 'Failed to generate assessment question');
      }

      const q = data.question;
      const formatted: GeneratedQuestionPayload = {
        question: q.question,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        topic: q.topic || topic,
        competency: q.competency || competency || `Demonstrates Grade 11 understanding of ${topic}`,
        assessmentType: assessmentType,
        assessmentLevel: assessmentLevel,
        difficulty: q.difficulty || difficulty,
        cognitiveLevel: q.cognitiveLevel || cognitiveLevel,
        explanation: q.explanation || 'Detailed mathematical verification and calculation.',
        hint1: q.hint1 || '',
        hint2: q.hint2 || '',
        misconceptions: q.misconceptions || [],
        difficultyParameter: typeof q.difficultyParameter === 'number' ? q.difficultyParameter : (difficulty === 'easy' ? -1 : difficulty === 'hard' ? 1.5 : 0),
        discriminationParameter: typeof q.discriminationParameter === 'number' ? q.discriminationParameter : 1.2
      };

      setGeneratedQuestion(formatted);
    } catch (err: any) {
      console.error('AI question generation error:', err);
      setError(err.message || 'An error occurred while generating question. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyQuestion = async () => {
    if (!generatedQuestion) return;
    setIsApplying(true);
    try {
      await onQuestionGenerated(generatedQuestion);
      onClose();
    } catch (err: any) {
      console.error('Failed to apply question:', err);
      setError(err.message || 'Failed to save generated question.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[28px] sm:rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
              assessmentType === 'diagnostic' 
                ? 'bg-purple-600 text-white shadow-purple-100' 
                : 'bg-cyan-600 text-white shadow-cyan-100'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <span>{title || (assessmentType === 'diagnostic' ? 'AI Diagnostic Question Generator' : 'AI Formative Question Generator')}</span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  assessmentType === 'diagnostic' 
                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                    : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                }`}>
                  {assessmentType}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {subtitle || 'Synthesizes curriculum-aligned Grade 11 math items with step-by-step solutions, scaffolded hints, and misconception diagnostics.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Assessment Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleAssessmentTypeChange('diagnostic')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                assessmentType === 'diagnostic'
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${assessmentType === 'diagnostic' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Diagnostic Assessment</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Evaluate prerequisite readiness & detect cognitive learning gaps.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleAssessmentTypeChange('formative')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                assessmentType === 'formative'
                  ? 'bg-cyan-50 border-cyan-300 ring-2 ring-cyan-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${assessmentType === 'formative' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-900">Formative Assessment</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Target active skill application, guided practice & lesson comprehension.
                </div>
              </div>
            </button>
          </div>

          {/* Configuration Form Grid */}
          <div className="bg-slate-50/80 p-4 sm:p-5 rounded-3xl border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assessment Level */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Target Assessment Level *</span>
                </label>
                <select
                  value={assessmentLevel}
                  onChange={(e) => setAssessmentLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {currentLevels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.title} ({lvl.targetGroup})
                    </option>
                  ))}
                </select>
                {currentLevelInfo && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    {currentLevelInfo.description}
                  </p>
                )}
              </div>

              {/* Topic */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Curriculum Topic *</span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  {availableTopics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">Easy (Foundational)</option>
                  <option value="medium">Medium (Standard Core)</option>
                  <option value="hard">Hard (Advanced Rigor)</option>
                </select>
              </div>

              {/* Cognitive Level */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cognitive Level</label>
                <select
                  value={cognitiveLevel}
                  onChange={(e) => setCognitiveLevel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="remembering">Remembering</option>
                  <option value="understanding">Understanding</option>
                  <option value="applying">Applying</option>
                  <option value="analyzing">Analyzing</option>
                  <option value="evaluating">Evaluating</option>
                  <option value="creating">Creating</option>
                </select>
              </div>

              {/* Target Competency */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Target Competency (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. M11GM-Ia-1 or Word Problem"
                  value={competency}
                  onChange={(e) => setCompetency(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Custom Guidance */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Specific Pedagogical Focus / Custom Prompt (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Include real-world word problem context about travel time or business profit..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Mathematical Question...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{generatedQuestion ? 'Regenerate New Question' : 'Generate Question with AI'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Question Preview Card */}
          {generatedQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border-2 border-indigo-200 p-5 sm:p-6 shadow-md space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Generated Preview
                  </span>
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg">
                    {generatedQuestion.assessmentLevel}
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                    {generatedQuestion.topic}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-bold uppercase">
                  {generatedQuestion.difficulty} • {generatedQuestion.cognitiveLevel}
                </div>
              </div>

              {/* Question Statement */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Question Formulation
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {generatedQuestion.question}
                </p>
                {generatedQuestion.competency && (
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    <strong className="text-slate-700">Competency:</strong> {generatedQuestion.competency}
                  </p>
                )}
              </div>

              {/* Multiple Choice Options */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Options (Choice {String.fromCharCode(65 + generatedQuestion.correctIndex)} is correct)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {generatedQuestion.options.map((opt, optIdx) => {
                    const isCorrect = generatedQuestion.correctIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-slate-50/80 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Mathematical Explanation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Step-by-Step Mathematical Solution
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-line">
                  {generatedQuestion.explanation}
                </p>
              </div>

              {/* Hints Preview */}
              {(generatedQuestion.hint1 || generatedQuestion.hint2) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedQuestion.hint1 && (
                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                      <span className="font-bold text-indigo-900 block mb-0.5">Hint Tier 1:</span>
                      <p className="text-indigo-800">{generatedQuestion.hint1}</p>
                    </div>
                  )}
                  {generatedQuestion.hint2 && (
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs">
                      <span className="font-bold text-purple-900 block mb-0.5">Hint Tier 2:</span>
                      <p className="text-purple-800">{generatedQuestion.hint2}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all"
          >
            Cancel
          </button>

          {generatedQuestion && (
            <button
              type="button"
              onClick={handleApplyQuestion}
              disabled={isApplying}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isApplying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Apply & Save Generated Question</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
