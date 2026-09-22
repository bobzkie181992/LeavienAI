import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { useDiagnosticExam } from '../hooks/useFirebase';
import { DiagnosticQuestion, DIAGNOSTIC_LEVELS, FORMATIVE_LEVELS } from '../types';
import AIGenerateQuestionModal, { GeneratedQuestionPayload } from './AIGenerateQuestionModal';

export default function DiagnosticManager() {
  const { questions, settings, loading, saveQuestion, deleteQuestion, saveSettings, seedAllCurriculumDiagnosticQuestions } = useDiagnosticExam();
  
  // Settings edit state
  const [itemsCount, setItemsCount] = useState<number>(settings.itemsCount || 10);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Question form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DiagnosticQuestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');

  // Form Fields
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [topicName, setTopicName] = useState('Rational Functions');
  const [competencyName, setCompetencyName] = useState('');
  const [assessmentType, setAssessmentType] = useState<'diagnostic' | 'formative' | 'summative'>('diagnostic');
  const [assessmentLevel, setAssessmentLevel] = useState('Level 2 - Core Concept Baseline');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cognitiveLevel, setCognitiveLevel] = useState<'remembering' | 'understanding' | 'applying' | 'analyzing' | 'evaluating' | 'creating'>('applying');
  const [explanationText, setExplanationText] = useState('');
  const [hint1Text, setHint1Text] = useState('');
  const [hint2Text, setHint2Text] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize form with default/existing values
  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectIndex(0);
    setTopicName('Rational Functions');
    setCompetencyName('');
    setAssessmentType('diagnostic');
    setAssessmentLevel('Level 2 - Core Concept Baseline');
    setDifficulty('medium');
    setCognitiveLevel('applying');
    setExplanationText('');
    setHint1Text('');
    setHint2Text('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (q: DiagnosticQuestion) => {
    setEditingQuestion(q);
    setQuestionText(q.question);
    setOptionA(q.options[0] || '');
    setOptionB(q.options[1] || '');
    setOptionC(q.options[2] || '');
    setOptionD(q.options[3] || '');
    setCorrectIndex(q.correct);
    setTopicName(q.topic);
    setCompetencyName(q.competency);
    setAssessmentType(q.assessmentType || 'diagnostic');
    setAssessmentLevel(q.assessmentLevel || 'Level 2 - Core Concept Baseline');
    setDifficulty(q.difficulty || 'medium');
    setCognitiveLevel(q.cognitiveLevel || 'applying');
    setExplanationText(q.explanation);
    setHint1Text(q.hint1 || '');
    setHint2Text(q.hint2 || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Synchronize local settings when settings loaded from Firebase
  React.useEffect(() => {
    if (settings && settings.itemsCount) {
      setItemsCount(settings.itemsCount);
    }
  }, [settings]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCount < 1) {
      alert("Exam must have at least 1 item.");
      return;
    }
    setIsUpdatingSettings(true);
    try {
      await saveSettings(itemsCount);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2000);
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to save settings.");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validations
    if (!questionText.trim()) return setFormError("Question text is required.");
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      return setFormError("All 4 option choices must be filled.");
    }
    if (!competencyName.trim()) return setFormError("Competency target is required.");
    if (!explanationText.trim()) return setFormError("Concept explanation is required.");

    setIsSaving(true);
    try {
      await saveQuestion({
        id: editingQuestion?.id,
        question: questionText.trim(),
        options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
        correct: correctIndex,
        topic: topicName.trim(),
        competency: competencyName.trim(),
        assessmentType,
        assessmentLevel,
        difficulty,
        cognitiveLevel,
        explanation: explanationText.trim(),
        hint1: hint1Text.trim() || undefined,
        hint2: hint2Text.trim() || undefined
      });
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to persist diagnostic question.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyAIGeneratedQuestion = async (q: GeneratedQuestionPayload) => {
    if (isFormOpen) {
      // Auto-fill form fields
      setQuestionText(q.question);
      setOptionA(q.options[0] || '');
      setOptionB(q.options[1] || '');
      setOptionC(q.options[2] || '');
      setOptionD(q.options[3] || '');
      setCorrectIndex(q.correctIndex);
      setTopicName(q.topic);
      setCompetencyName(q.competency);
      setAssessmentType(q.assessmentType || 'diagnostic');
      setAssessmentLevel(q.assessmentLevel);
      setDifficulty(q.difficulty);
      setCognitiveLevel(q.cognitiveLevel);
      setExplanationText(q.explanation);
      setHint1Text(q.hint1 || '');
      setHint2Text(q.hint2 || '');
      setFormError(null);
    } else {
      // Save directly to Firestore diagnostic pool
      const newQuestion: DiagnosticQuestion = {
        id: `diag-q-${Date.now()}`,
        question: q.question,
        options: q.options,
        correct: q.correctIndex,
        topic: q.topic,
        competency: q.competency,
        assessmentType: (q.assessmentType === 'formative' ? 'formative' : 'diagnostic'),
        assessmentLevel: q.assessmentLevel || 'Level 2 - Core Concept Baseline',
        difficulty: q.difficulty || 'medium',
        cognitiveLevel: q.cognitiveLevel || 'applying',
        explanation: q.explanation,
        hint1: q.hint1 || undefined,
        hint2: q.hint2 || undefined
      };
      await saveQuestion(newQuestion);
    }
  };

  const handleDelete = async (id: string, text: string) => {
    if (window.confirm(`Are you sure you want to delete this diagnostic question?\n\n"${text.substring(0, 60)}..."`)) {
      try {
        await deleteQuestion(id);
      } catch (err) {
        console.error("Error deleting question:", err);
      }
    }
  };

  // Mapped Topics for curriculum categorization
  const availableTopics = [
    "Rational Functions",
    "Composite Functions",
    "Logarithmic Functions",
    "Exponential Modeling",
    "Business Mathematics",
    "Mathematical Logic",
    "Rational Equations",
    "Trigonometric Equations",
    "Compound Interest",
    "Propositional Logic"
  ];

  // Active level metadata helper
  const selectedLevelInfo = useMemo(() => {
    if (assessmentType === 'diagnostic') {
      return DIAGNOSTIC_LEVELS.find(l => l.id === assessmentLevel) || DIAGNOSTIC_LEVELS[1];
    } else if (assessmentType === 'formative') {
      return FORMATIVE_LEVELS.find(l => l.id === assessmentLevel) || FORMATIVE_LEVELS[1];
    }
    return null;
  }, [assessmentType, assessmentLevel]);

  // Filtering Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.competency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.assessmentLevel || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTopic = topicFilter === 'All' || q.topic === topicFilter;
      const matchesLevel = levelFilter === 'All' || (q.assessmentLevel || 'Level 2').toLowerCase().includes(levelFilter.toLowerCase());
      
      return matchesSearch && matchesTopic && matchesLevel;
    });
  }, [questions, searchQuery, topicFilter, levelFilter]);

  const level1Count = useMemo(() => questions.filter(q => (q.assessmentLevel || '').toLowerCase().includes('level 1')).length, [questions]);
  const level2Count = useMemo(() => questions.filter(q => (q.assessmentLevel || '').toLowerCase().includes('level 2')).length, [questions]);
  const level3Count = useMemo(() => questions.filter(q => (q.assessmentLevel || '').toLowerCase().includes('level 3')).length, [questions]);
  const level4Count = useMemo(() => questions.filter(q => (q.assessmentLevel || '').toLowerCase().includes('level 4')).length, [questions]);

  const handleSeedAllQuestions = async () => {
    if (!window.confirm("Do you want to sync all 200 curriculum diagnostic questions (50 items each across Levels 1 to 4) to the assessment database?")) {
      return;
    }
    setIsSeeding(true);
    const ok = await seedAllCurriculumDiagnosticQuestions(true);
    setIsSeeding(false);
    if (ok) {
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Settings Panel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Icons.Stethoscope className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">Diagnostic Assessment Parameters</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-xl">
            Configure how many questions are randomly pulled from the pool of items below when a student takes their baseline diagnostic exam to determine their prerequisite readiness.
          </p>
        </div>

        <form onSubmit={handleUpdateSettings} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 shrink-0 self-start md:self-auto">
          <div className="flex flex-col pl-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Assessment Length</label>
            <input 
              type="number" 
              min={1} 
              max={Math.max(1, questions.length)}
              value={itemsCount}
              onChange={(e) => setItemsCount(parseInt(e.target.value) || 10)}
              className="bg-transparent border-none p-0 focus:ring-0 text-slate-800 font-black text-sm w-20"
            />
          </div>
          <button
            type="submit"
            disabled={isUpdatingSettings}
            className={`px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              settingsSuccess 
                ? 'bg-emerald-500 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100'
            }`}
          >
            {isUpdatingSettings ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : settingsSuccess ? (
              <>
                <Icons.Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Icons.Save className="w-4 h-4" />
                <span>Apply Length</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main questions section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Icons.FileQuestion className="w-5 h-5 text-indigo-600" />
              <span>Curated Diagnostic Question Pool</span>
              <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                {questions.length} Items Total
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Manage the master set of diagnostic items categorized by assessment level (Level 1 to Level 4).
            </p>
          </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSeedAllQuestions}
                disabled={isSeeding}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 active:scale-95 ${
                  seedSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
                title="Synchronize all 200 diagnostic questions (50 each for Levels 1 to 4)"
              >
                {isSeeding ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : seedSuccess ? (
                  <Icons.Check className="w-4 h-4" />
                ) : (
                  <Icons.Database className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {isSeeding 
                    ? 'Syncing 200 Questions...' 
                    : seedSuccess 
                    ? '200 Questions Synced!' 
                    : 'Sync 200 Question Pool (50/Level)'}
                </span>
              </button>

              <button
                onClick={() => setIsAIGenerateOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-purple-100 flex items-center gap-2 active:scale-95"
              >
                <Icons.Sparkles className="w-4 h-4" />
                <span>AI Generate Question</span>
              </button>

              <button
                onClick={openAddModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Icons.Plus className="w-4 h-4" />
                <span>Add Manual</span>
              </button>
            </div>
        </div>

        {/* Assessment Levels Breakdown Cards */}
        <div className="p-4 sm:p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => setLevelFilter(levelFilter === 'Level 1' ? 'All' : 'Level 1')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              levelFilter === 'Level 1'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Level 1</span>
              <span className="text-xs font-bold text-slate-700">{level1Count} / 50</span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate">Prerequisite / Foundational</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (level1Count / 50) * 100)}%` }} 
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLevelFilter(levelFilter === 'Level 2' ? 'All' : 'Level 2')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              levelFilter === 'Level 2'
                ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Level 2</span>
              <span className="text-xs font-bold text-slate-700">{level2Count} / 50</span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate">Core Concept Baseline</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (level2Count / 50) * 100)}%` }} 
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLevelFilter(levelFilter === 'Level 3' ? 'All' : 'Level 3')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              levelFilter === 'Level 3'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Level 3</span>
              <span className="text-xs font-bold text-slate-700">{level3Count} / 50</span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate">Intermediate Analytical</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (level3Count / 50) * 100)}%` }} 
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLevelFilter(levelFilter === 'Level 4' ? 'All' : 'Level 4')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              levelFilter === 'Level 4'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Level 4</span>
              <span className="text-xs font-bold text-slate-700">{level4Count} / 50</span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-1 truncate">Advanced Mastery / Challenge</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (level4Count / 50) * 100)}%` }} 
              />
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by question, competency, level, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Levels</option>
              <option value="Level 1">Level 1 - Prerequisite / Foundational</option>
              <option value="Level 2">Level 2 - Core Concept Baseline</option>
              <option value="Level 3">Level 3 - Intermediate Analytical</option>
              <option value="Level 4">Level 4 - Advanced Mastery / Challenge</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Topic:</span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
            >
              <option value="All">All Topics</option>
              {availableTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions list */}
        <div className="divide-y divide-slate-100">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Icons.Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h4 className="font-bold text-slate-600">No Questions Match Filters</h4>
              <p className="text-xs text-slate-500 mt-1">Try tweaking your search keywords, assessment level, or topic filter.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q.id} className="p-6 hover:bg-slate-50/30 transition-colors flex flex-col md:flex-row gap-6 justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Assessment Level Badge */}
                    <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <Icons.Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                      <span>{q.assessmentLevel || 'Level 2 - Core Concept Baseline'}</span>
                    </span>

                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-lg">
                      {q.topic}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-lg">
                      Comp: {q.competency}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                    {q.options.map((opt, oIdx) => (
                      <div 
                        key={oIdx} 
                        className={`px-3.5 py-2 rounded-xl text-xs flex items-center justify-between border ${
                          oIdx === q.correct 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold' 
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {oIdx === q.correct && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">Correct</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-100 flex gap-2">
                      <Icons.Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-700">Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Edit Item"
                  >
                    <Icons.Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id, q.question)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete Item"
                  >
                    <Icons.Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]"
            >
                {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Icons.PlusCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingQuestion ? 'Edit Diagnostic Question' : 'Add Curated Diagnostic Question'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAIGenerateOpen(true)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Icons.Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Auto-Fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                  >
                    <Icons.X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                    <Icons.AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Assessment Type & Level Selector */}
                <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-purple-900 uppercase tracking-wider mb-1">Assessment Type</label>
                      <select
                        value={assessmentType}
                        onChange={(e) => {
                          const newType = e.target.value as any;
                          setAssessmentType(newType);
                          if (newType === 'diagnostic') {
                            setAssessmentLevel('Level 2 - Core Concept Baseline');
                          } else if (newType === 'formative') {
                            setAssessmentLevel('Level 2 - Guided Skill Application');
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-900 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="diagnostic">Diagnostic Assessment</option>
                        <option value="formative">Formative Assessment</option>
                        <option value="summative">Summative Assessment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-purple-900 uppercase tracking-wider mb-1">
                        {assessmentType === 'diagnostic' ? 'Diagnostic Assessment Level' : 'Formative Assessment Level'}
                      </label>
                      <select
                        value={assessmentLevel}
                        onChange={(e) => setAssessmentLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-900 focus:ring-2 focus:ring-purple-500"
                      >
                        {(assessmentType === 'diagnostic' ? DIAGNOSTIC_LEVELS : FORMATIVE_LEVELS).map(lvl => (
                          <option key={lvl.id} value={lvl.id}>
                            {lvl.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedLevelInfo && (
                    <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Icons.Info className="w-3.5 h-3.5 text-purple-600" />
                        <span>{selectedLevelInfo.title} ({selectedLevelInfo.targetGroup})</span>
                      </div>
                      <p className="text-[11px] text-purple-700 leading-relaxed">
                        {selectedLevelInfo.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Topic and Competency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Topic / Lesson Area</label>
                    <select
                      value={topicName}
                      onChange={(e) => setTopicName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    >
                      {availableTopics.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Competency</label>
                    <input
                      type="text"
                      placeholder="e.g. Composition of algebraic functions"
                      value={competencyName}
                      onChange={(e) => setCompetencyName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Question Statement</label>
                  <textarea
                    rows={3}
                    placeholder="Provide the mathematics word problem or algebraic question..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Choices */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Response Options</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
                      <span className="text-xs font-bold text-slate-400">A</span>
                      <input
                        type="text"
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        placeholder="Choice A"
                        required
                        className="w-full bg-transparent border-none p-0 text-xs focus:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
                      <span className="text-xs font-bold text-slate-400">B</span>
                      <input
                        type="text"
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Choice B"
                        required
                        className="w-full bg-transparent border-none p-0 text-xs focus:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
                      <span className="text-xs font-bold text-slate-400">C</span>
                      <input
                        type="text"
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        placeholder="Choice C"
                        required
                        className="w-full bg-transparent border-none p-0 text-xs focus:ring-0"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
                      <span className="text-xs font-bold text-slate-400">D</span>
                      <input
                        type="text"
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        placeholder="Choice D"
                        required
                        className="w-full bg-transparent border-none p-0 text-xs focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Correct Option Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Correct Option Index</label>
                  <select
                    value={correctIndex}
                    onChange={(e) => setCorrectIndex(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                {/* Step-by-Step Explanation */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Concept Explanation (Visible upon submission or reveal)</label>
                  <textarea
                    rows={3}
                    placeholder="Explain how to arrive at the correct answer step-by-step..."
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Hints (Optional but highly recommended) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hint Tier 1 (Helpful Clue)</label>
                    <input
                      type="text"
                      placeholder="e.g. Try to isolate variables first..."
                      value={hint1Text}
                      onChange={(e) => setHint1Text(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hint Tier 2 (Detailed Guidance)</label>
                    <input
                      type="text"
                      placeholder="e.g. Set log properties product rule..."
                      value={hint2Text}
                      onChange={(e) => setHint2Text(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Icons.Save className="w-4 h-4" />
                        <span>Save Question</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generate Question Modal */}
      <AIGenerateQuestionModal
        isOpen={isAIGenerateOpen}
        onClose={() => setIsAIGenerateOpen(false)}
        defaultAssessmentType={assessmentType}
        defaultAssessmentLevel={assessmentLevel}
        defaultTopic={topicName}
        availableTopics={availableTopics}
        onQuestionGenerated={handleApplyAIGeneratedQuestion}
        title={isFormOpen ? "AI Generate / Auto-Fill Form" : "AI Diagnostic Question Generator"}
        subtitle="Generates mathematically sound Grade 11 diagnostic items with rigorous DepEd competency alignment, distractors, and step-by-step solutions."
      />
    </div>
  );
}
