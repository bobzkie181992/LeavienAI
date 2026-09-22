import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, 
  HelpCircle, Download, Upload, FileText, X, BarChart2, Clock, 
  Layers, ShieldCheck, Eye, ShieldAlert, Sparkles, RefreshCw, Power,
  Stethoscope, GraduationCap, Info, Compass
} from 'lucide-react';
import { 
  Topic, Quiz, Problem, ItemStatus, ItemStats, 
  AssessmentType, DIAGNOSTIC_LEVELS, FORMATIVE_LEVELS 
} from '../types';
import { useCurriculum, useItemStatistics } from '../hooks/useFirebase';
import AIGenerateQuestionModal, { GeneratedQuestionPayload } from './AIGenerateQuestionModal';

const STATUS_ORDER: ItemStatus[] = ['Draft', 'For Validation', 'Validated', 'Active', 'Inactive'];

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bg: string; border: string; desc: string }> = {
  'Draft': {
    label: 'Draft',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    desc: 'Authoring & initial drafting'
  },
  'For Validation': {
    label: 'For Validation',
    color: 'text-amber-800',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    desc: 'Under review by faculty/psychometrician'
  },
  'Validated': {
    label: 'Validated',
    color: 'text-blue-800',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    desc: 'Approved psychometrically; ready for live'
  },
  'Active': {
    label: 'Active',
    color: 'text-emerald-800',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    desc: 'Live in official student assessments'
  },
  'Inactive': {
    label: 'Inactive',
    color: 'text-rose-800',
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    desc: 'Archived / excluded from assessments'
  }
};

interface FlatItem extends Problem {
  topicId: string;
  topicTitle: string;
  quizId: string;
  quizTitle: string;
}

export default function ItemBankManager() {
  const { topics, loading: topicsLoading, saveProblem, deleteProblem, updateProblemStatus, importProblems } = useCurriculum();
  const { statsMap, loading: statsLoading, refreshStats } = useItemStatistics();

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('All');
  const [selectedAssessmentLevel, setSelectedAssessmentLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editingItem, setEditingItem] = useState<{
    item: Problem;
    topicId: string;
    quizId: string;
    isNew: boolean;
  } | null>(null);

  const [inspectingStatsItem, setInspectingStatsItem] = useState<FlatItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);

  const handleAIGeneratedItem = async (q: GeneratedQuestionPayload) => {
    // Find matching topic or use default
    const matchedTopic = topics.find(t => t.title.toLowerCase().includes(q.topic.toLowerCase())) || topics[0];
    const targetTopicId = matchedTopic ? matchedTopic.id : (topics[0]?.id || 'topic-1');
    const targetQuizId = matchedTopic?.quizzes[0]?.id || (topics[0]?.quizzes[0]?.id || 'quiz-1');

    const newProblem: Problem = {
      id: `problem-${Date.now()}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctIndex,
      solution: q.explanation,
      topic: q.topic,
      competency: q.competency,
      assessmentType: q.assessmentType || 'formative',
      assessmentLevel: q.assessmentLevel,
      difficulty: q.difficulty,
      difficultyParameter: q.difficultyParameter ?? (q.difficulty === 'easy' ? -1 : q.difficulty === 'hard' ? 1.5 : 0),
      discriminationParameter: q.discriminationParameter ?? 1.2,
      cognitiveLevel: q.cognitiveLevel ? (q.cognitiveLevel.charAt(0).toUpperCase() + q.cognitiveLevel.slice(1)) : 'Applying',
      misconceptionCategory: q.misconceptions?.[0]?.misconception || '',
      hint1: q.hint1 || '',
      hint2: q.hint2 || '',
      hints: q.hint1 && q.hint2 ? [q.hint1, q.hint2] : [],
      explanation: q.explanation,
      remediation: `Review foundational concepts and formulas for ${q.topic}.`,
      status: 'Active'
    };

    // Open item editor so teacher can review/adjust
    setEditingItem({
      item: newProblem,
      topicId: targetTopicId,
      quizId: targetQuizId,
      isNew: true
    });
  };

  // Flatten all items across topics and quizzes
  const allItems: FlatItem[] = useMemo(() => {
    const list: FlatItem[] = [];
    topics.forEach(topic => {
      topic.quizzes.forEach(quiz => {
        const defaultType = quiz.quizType === 'diagnostic' ? 'diagnostic' : 'formative';
        quiz.problems.forEach(problem => {
          list.push({
            ...problem,
            status: problem.status || 'Active', // Default legacy items to Active
            assessmentType: problem.assessmentType || (defaultType as AssessmentType),
            assessmentLevel: problem.assessmentLevel || (defaultType === 'diagnostic' ? 'Level 2 - Core Concept Baseline' : 'Level 2 - Guided Skill Application'),
            topicId: topic.id,
            topicTitle: topic.title,
            quizId: quiz.id,
            quizTitle: quiz.title
          });
        });
      });
    });
    return list;
  }, [topics]);

  // Counts by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allItems.length };
    STATUS_ORDER.forEach(status => {
      counts[status] = allItems.filter(item => (item.status || 'Active') === status).length;
    });
    return counts;
  }, [allItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const itemStatus = item.status || 'Active';
      if (selectedStatus !== 'All' && itemStatus !== selectedStatus) return false;
      if (selectedTopicId !== 'All' && item.topicId !== selectedTopicId) return false;
      if (selectedDifficulty !== 'All' && item.difficulty !== selectedDifficulty) return false;
      if (selectedAssessmentType !== 'All' && item.assessmentType !== selectedAssessmentType) return false;
      if (selectedAssessmentLevel !== 'All') {
        const lvl = (item.assessmentLevel || '').toLowerCase();
        const target = selectedAssessmentLevel.toLowerCase();
        if (!lvl.includes(target)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuestion = item.question.toLowerCase().includes(q);
        const matchesCompetency = item.competency.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesSolution = (item.solution || '').toLowerCase().includes(q);
        const matchesLevel = (item.assessmentLevel || '').toLowerCase().includes(q);
        if (!matchesQuestion && !matchesCompetency && !matchesId && !matchesSolution && !matchesLevel) {
          return false;
        }
      }
      return true;
    });
  }, [allItems, selectedStatus, selectedTopicId, selectedDifficulty, selectedAssessmentType, selectedAssessmentLevel, searchQuery]);

  // Handlers
  const handleQuickStatusChange = async (item: FlatItem, newStatus: ItemStatus) => {
    try {
      await updateProblemStatus(item.topicId, item.quizId, item.id, newStatus);
    } catch (err) {
      alert('Error updating item status: ' + (err as Error).message);
    }
  };

  const handleDeleteItem = async (item: FlatItem) => {
    if (window.confirm(`Are you sure you want to permanently delete item "${item.id}"? This cannot be undone.`)) {
      try {
        await deleteProblem(item.topicId, item.quizId, item.id);
      } catch (err) {
        alert('Error deleting item: ' + (err as Error).message);
      }
    }
  };

  const handleOpenNewItem = () => {
    if (topics.length === 0) {
      alert('Please create at least one curriculum topic first.');
      return;
    }
    const defaultTopic = topics[0];
    const defaultQuiz = defaultTopic.quizzes[0];
    if (!defaultQuiz) {
      alert(`The topic "${defaultTopic.title}" does not have any quizzes. Please add a quiz first in Curriculum Manager.`);
      return;
    }

    const newItem: Problem = {
      id: `item-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      solution: '',
      topic: defaultTopic.title,
      competency: '',
      difficulty: 'medium',
      difficultyParameter: 0.0,
      discriminationParameter: 1.0,
      cognitiveLevel: 'Understanding',
      misconceptionCategory: '',
      hint1: '',
      hint2: '',
      hints: [],
      explanation: '',
      remediation: '',
      status: 'Draft',
      assessmentType: 'formative',
      assessmentLevel: 'Level 2 - Guided Skill Application'
    };

    setEditingItem({
      item: newItem,
      topicId: defaultTopic.id,
      quizId: defaultQuiz.id,
      isNew: true
    });
  };

  const handleExportCSV = () => {
    if (allItems.length === 0) {
      alert('No items in the item bank to export.');
      return;
    }

    const headers = [
      'Item ID',
      'Status',
      'Assessment Type',
      'Assessment Level',
      'Topic',
      'Competency',
      'Difficulty Level',
      'Difficulty Parameter (b)',
      'Discrimination Parameter (a)',
      'Cognitive Level',
      'Question',
      'Option A',
      'Option B',
      'Option C',
      'Option D',
      'Correct Answer Index (0-3)',
      'Solution',
      'Misconception Category',
      'Hint 1',
      'Hint 2',
      'Explanation',
      'Remediation'
    ];

    const escapeCSV = (str: string | undefined | number) => {
      if (str === undefined || str === null) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = allItems.map(item => [
      escapeCSV(item.id),
      escapeCSV(item.status || 'Active'),
      escapeCSV(item.assessmentType || 'formative'),
      escapeCSV(item.assessmentLevel || 'Level 2 - Guided Skill Application'),
      escapeCSV(item.topicTitle),
      escapeCSV(item.competency),
      escapeCSV(item.difficulty),
      item.difficultyParameter,
      item.discriminationParameter,
      escapeCSV(item.cognitiveLevel),
      escapeCSV(item.question),
      escapeCSV(item.options[0] || ''),
      escapeCSV(item.options[1] || ''),
      escapeCSV(item.options[2] || ''),
      escapeCSV(item.options[3] || ''),
      item.correctAnswer,
      escapeCSV(item.solution),
      escapeCSV(item.misconceptionCategory),
      escapeCSV(item.hint1),
      escapeCSV(item.hint2),
      escapeCSV(item.explanation),
      escapeCSV(item.remediation)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `item_bank_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-900">Item Bank & Psychometrics</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider">
              Diagnostic & Formative
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Author, classify diagnostic/formative assessment levels, calibrate psychometrics, and track performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAIGenerateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-100 transition-all text-sm active:scale-95"
            title="Generate AI assessment question"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate Item
          </button>
          <button
            onClick={() => refreshStats()}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
            title="Refresh Empirical Student Statistics"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Stats
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Import Items
          </button>
          <button
            onClick={handleOpenNewItem}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Official Assessment Guard Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          <strong className="font-bold">Official Assessment Guard:</strong> Only items in{' '}
          <span className="font-bold underline">Validated</span> or{' '}
          <span className="font-bold underline">Active</span> status are delivered to students in Diagnostic Assessments, Dynamic Learning Pathways, and official topic challenges. Items in Draft or Inactive status remain protected in the bank.
        </div>
      </div>

      {/* Lifecycle Workflow Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            Item Lifecycle Pipeline
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Total Bank Size: <strong className="text-slate-900 font-bold">{allItems.length}</strong> items
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedStatus === 'All'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="text-xs opacity-70 font-semibold">View All</div>
            <div className="text-xl font-black mt-0.5">{statusCounts['All'] || 0}</div>
          </button>

          {STATUS_ORDER.map(status => {
            const conf = STATUS_CONFIG[status];
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? `${conf.bg} ${conf.color} ${conf.border} ring-2 ring-indigo-500 shadow-sm`
                    : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{conf.label}</span>
                  {status === 'Active' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <div className="text-xl font-black mt-0.5">{statusCounts[status] || 0}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search question, item ID, competency, assessment level, or solution..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Assessment Type Filter */}
          <select
            value={selectedAssessmentType}
            onChange={e => {
              setSelectedAssessmentType(e.target.value);
              setSelectedAssessmentLevel('All');
            }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Assessment Types</option>
            <option value="diagnostic">🩺 Diagnostic Assessment</option>
            <option value="formative">📝 Formative Assessment</option>
          </select>

          {/* Assessment Level Filter */}
          <select
            value={selectedAssessmentLevel}
            onChange={e => setSelectedAssessmentLevel(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Assessment Levels</option>
            {selectedAssessmentType === 'diagnostic' ? (
              <>
                <option value="Level 1">Level 1 - Prerequisite / Foundational</option>
                <option value="Level 2">Level 2 - Core Concept Baseline</option>
                <option value="Level 3">Level 3 - Intermediate Analytical</option>
                <option value="Level 4">Level 4 - Advanced Mastery / Challenge</option>
              </>
            ) : selectedAssessmentType === 'formative' ? (
              <>
                <option value="Level 1">Level 1 - Recall & Concept Check</option>
                <option value="Level 2">Level 2 - Guided Skill Application</option>
                <option value="Level 3">Level 3 - Problem Solving & Remediation</option>
                <option value="Level 4">Level 4 - Mastery & Synthesis</option>
              </>
            ) : (
              <>
                <option value="Level 1">Level 1 (Prerequisite / Recall)</option>
                <option value="Level 2">Level 2 (Core Baseline / Guided Skill)</option>
                <option value="Level 3">Level 3 (Analytical / Problem Solving)</option>
                <option value="Level 4">Level 4 (Advanced Mastery / Synthesis)</option>
              </>
            )}
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopicId}
            onChange={e => setSelectedTopicId(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Topics</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Assessment Items Found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-1">
              {searchQuery || selectedStatus !== 'All' || selectedAssessmentType !== 'All' || selectedAssessmentLevel !== 'All'
                ? 'Try adjusting your search query, assessment level, or status filters.'
                : 'Get started by creating a new item or importing items via CSV.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={handleOpenNewItem}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors"
              >
                + Add First Item
              </button>
            </div>
          </div>
        ) : (
          filteredItems.map(item => {
            const statusConf = STATUS_CONFIG[item.status || 'Active'];
            const stats = statsMap[item.id];
            const isLive = item.status === 'Active' || item.status === 'Validated';
            const isDiagnostic = item.assessmentType === 'diagnostic';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-indigo-200 transition-all p-5 sm:p-6 group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left info */}
                  <div className="flex-1 space-y-3">
                    {/* Badges bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${statusConf.bg} ${statusConf.color} ${statusConf.border} flex items-center gap-1.5`}>
                        {item.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.status === 'Inactive' ? <Power className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {statusConf.label}
                      </span>

                      {/* Assessment Type & Level Badge */}
                      <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-2xs ${
                        isDiagnostic 
                          ? 'bg-purple-50 text-purple-800 border-purple-200' 
                          : 'bg-cyan-50 text-cyan-900 border-cyan-200'
                      }`}>
                        {isDiagnostic ? (
                          <>
                            <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                            <span>Diagnostic</span>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-3.5 h-3.5 text-cyan-700" />
                            <span>Formative</span>
                          </>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="font-bold">{item.assessmentLevel || (isDiagnostic ? 'Level 2 - Core Concept Baseline' : 'Level 2 - Guided Skill Application')}</span>
                      </span>

                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                        ID: {item.id}
                      </span>

                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                        {item.topicTitle}
                      </span>

                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                        item.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {item.difficulty.toUpperCase()} (b = {item.difficultyParameter})
                      </span>

                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg">
                        Discrim a = {item.discriminationParameter}
                      </span>

                      {!isLive && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Excluded from Students
                        </span>
                      )}
                    </div>

                    {/* Question text */}
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {item.question}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        <strong className="text-slate-700">Competency:</strong> {item.competency || 'Not specified'} • <strong className="text-slate-700">Cognitive:</strong> {item.cognitiveLevel || 'Understanding'}
                      </p>
                    </div>

                    {/* Options Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {item.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                            item.correctAnswer === optIdx
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            item.correctAnswer === optIdx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {item.correctAnswer === optIdx && (
                            <span className="text-[10px] uppercase tracking-wider text-emerald-700 ml-auto font-black">
                              Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Solution and Misconception summary */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                      {item.solution && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Solution documented</span>
                        </div>
                      )}
                      {item.misconceptionCategory && (
                        <div className="flex items-center gap-1.5 text-amber-700">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Misconception: {item.misconceptionCategory}</span>
                        </div>
                      )}
                      {(item.hint1 || item.hint2 || (item.hints && item.hints.length > 0)) && (
                        <div className="flex items-center gap-1.5 text-indigo-600">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Hints configured</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Empirical stats & Action buttons */}
                  <div className="lg:w-72 flex flex-col gap-3 lg:border-l lg:border-slate-100 lg:pl-5">
                    {/* Stats summary chip */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Empirical Stats
                        </span>
                        <button
                          onClick={() => setInspectingStatsItem(item)}
                          className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <BarChart2 className="w-3.5 h-3.5" /> Deep Review
                        </button>
                      </div>

                      {stats ? (
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-400 font-bold">N</div>
                            <div className="text-sm font-black text-slate-800">{stats.timesAnswered}</div>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-400 font-bold">p-val</div>
                            <div className="text-sm font-black text-slate-800">{stats.pValue}</div>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-400 font-bold">Disc.</div>
                            <div className="text-sm font-black text-slate-800">{stats.discriminationIndex}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic py-1">
                          No live student attempts yet. (IRT a = {item.discriminationParameter}, b = {item.difficultyParameter})
                        </div>
                      )}
                    </div>

                    {/* Status transition actions */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Workflow Status
                      </label>
                      <select
                        value={item.status || 'Active'}
                        onChange={e => handleQuickStatusChange(item, e.target.value as ItemStatus)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        {STATUS_ORDER.map(st => (
                          <option key={st} value={st}>
                            Status: {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Buttons row */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setEditingItem({
                          item: { ...item },
                          topicId: item.topicId,
                          quizId: item.quizId,
                          isNew: false
                        })}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>

                      {item.status === 'Active' ? (
                        <button
                          onClick={() => handleQuickStatusChange(item, 'Inactive')}
                          title="Deactivate item"
                          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Power className="w-3.5 h-3.5" /> Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickStatusChange(item, 'Active')}
                          title="Activate item for official assessments"
                          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item)}
                        title="Delete permanently"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* EDIT / CREATE ITEM MODAL */}
      <AnimatePresence>
        {editingItem && (
          <ItemEditorModal
            editingItem={editingItem}
            topics={topics}
            onOpenAIGenerate={() => setIsAIGenerateOpen(true)}
            onClose={() => setEditingItem(null)}
            onSave={async (topicId, quizId, savedProblem) => {
              try {
                await saveProblem(topicId, quizId, savedProblem);
                setEditingItem(null);
              } catch (err) {
                alert('Failed to save item: ' + (err as Error).message);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* PSYCHOMETRIC ITEM STATS MODAL */}
      <AnimatePresence>
        {inspectingStatsItem && (
          <ItemStatsModal
            item={inspectingStatsItem}
            stats={statsMap[inspectingStatsItem.id]}
            onClose={() => setInspectingStatsItem(null)}
          />
        )}
      </AnimatePresence>

      {/* IMPORT ITEMS MODAL */}
      <AnimatePresence>
        {isImportModalOpen && (
          <ItemImportModal
            topics={topics}
            onClose={() => setIsImportModalOpen(false)}
            onImport={async (targetTopicId, targetQuizId, importedItems) => {
              try {
                await importProblems(targetTopicId, targetQuizId, importedItems);
                setIsImportModalOpen(false);
                alert(`Successfully imported ${importedItems.length} items!`);
              } catch (err) {
                alert('Import error: ' + (err as Error).message);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* AI GENERATE QUESTION MODAL */}
      <AIGenerateQuestionModal
        isOpen={isAIGenerateOpen}
        onClose={() => setIsAIGenerateOpen(false)}
        defaultAssessmentType="formative"
        defaultAssessmentLevel="Level 2 - Guided Skill Application"
        availableTopics={topics.map(t => t.title)}
        onQuestionGenerated={handleAIGeneratedItem}
        title="AI Assessment Item Generator"
        subtitle="Generate DepEd curriculum-aligned diagnostic or formative items with psychometric calibrations, distractors, and multi-tier scaffolding."
      />
    </div>
  );
}

// ==========================================
// ITEM EDITOR MODAL COMPONENT
// ==========================================
interface ItemEditorModalProps {
  editingItem: {
    item: Problem;
    topicId: string;
    quizId: string;
    isNew: boolean;
  };
  topics: Topic[];
  onOpenAIGenerate?: () => void;
  onClose: () => void;
  onSave: (topicId: string, quizId: string, item: Problem) => Promise<void>;
}

function ItemEditorModal({ editingItem, topics, onOpenAIGenerate, onClose, onSave }: ItemEditorModalProps) {
  const [topicId, setTopicId] = useState(editingItem.topicId);
  const [quizId, setQuizId] = useState(editingItem.quizId);
  const [item, setItem] = useState<Problem>({
    ...editingItem.item,
    assessmentType: editingItem.item.assessmentType || 'formative',
    assessmentLevel: editingItem.item.assessmentLevel || 'Level 2 - Guided Skill Application',
    hints: editingItem.item.hints || []
  });
  const [isSaving, setIsSaving] = useState(false);

  // Available quizzes for selected topic
  const availableQuizzes = useMemo(() => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.quizzes : [];
  }, [topics, topicId]);

  // Selected level description helper
  const selectedLevelInfo = useMemo(() => {
    if (item.assessmentType === 'diagnostic') {
      const match = DIAGNOSTIC_LEVELS.find(l => l.id === item.assessmentLevel || item.assessmentLevel?.includes(l.id.split(' - ')[0]));
      return match || DIAGNOSTIC_LEVELS[1];
    } else {
      const match = FORMATIVE_LEVELS.find(l => l.id === item.assessmentLevel || item.assessmentLevel?.includes(l.id.split(' - ')[0]));
      return match || FORMATIVE_LEVELS[1];
    }
  }, [item.assessmentType, item.assessmentLevel]);

  const handleAssessmentTypeChange = (type: AssessmentType) => {
    const defaultLevel = type === 'diagnostic' 
      ? 'Level 2 - Core Concept Baseline' 
      : 'Level 2 - Guided Skill Application';
    setItem(prev => ({
      ...prev,
      assessmentType: type,
      assessmentLevel: defaultLevel
    }));
  };

  const handleAssessmentLevelChange = (levelId: string) => {
    let diff: 'easy' | 'medium' | 'hard' = item.difficulty;
    let bParam = item.difficultyParameter;
    let cognitive = item.cognitiveLevel || 'Understanding';

    if (item.assessmentType === 'diagnostic') {
      if (levelId.startsWith('Level 1')) {
        diff = 'easy';
        bParam = -1.0;
        cognitive = 'Remembering';
      } else if (levelId.startsWith('Level 2')) {
        diff = 'medium';
        bParam = 0.0;
        cognitive = 'Understanding';
      } else if (levelId.startsWith('Level 3')) {
        diff = 'medium';
        bParam = 0.8;
        cognitive = 'Applying';
      } else if (levelId.startsWith('Level 4')) {
        diff = 'hard';
        bParam = 1.8;
        cognitive = 'Analyzing';
      }
    } else {
      if (levelId.startsWith('Level 1')) {
        diff = 'easy';
        bParam = -0.8;
        cognitive = 'Remembering';
      } else if (levelId.startsWith('Level 2')) {
        diff = 'medium';
        bParam = 0.2;
        cognitive = 'Applying';
      } else if (levelId.startsWith('Level 3')) {
        diff = 'medium';
        bParam = 1.0;
        cognitive = 'Analyzing';
      } else if (levelId.startsWith('Level 4')) {
        diff = 'hard';
        bParam = 1.9;
        cognitive = 'Creating';
      }
    }

    setItem(prev => ({
      ...prev,
      assessmentLevel: levelId,
      difficulty: diff,
      difficultyParameter: bParam,
      cognitiveLevel: cognitive
    }));
  };

  const handleAddExtraHint = () => {
    setItem(prev => ({
      ...prev,
      hints: [...(prev.hints || []), '']
    }));
  };

  const handleUpdateExtraHint = (index: number, text: string) => {
    setItem(prev => {
      const copy = [...(prev.hints || [])];
      copy[index] = text;
      return { ...prev, hints: copy };
    });
  };

  const handleRemoveExtraHint = (index: number) => {
    setItem(prev => {
      const copy = [...(prev.hints || [])];
      copy.splice(index, 1);
      return { ...prev, hints: copy };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.question.trim()) {
      alert('Question cannot be empty');
      return;
    }
    if (item.options.some(opt => !opt.trim())) {
      alert('Please fill out all 4 answer options');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(topicId, quizId, item);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-3xl shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {editingItem.isNew ? 'Create New Assessment Item' : 'Edit Assessment Item'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Classify the assessment level (diagnostic vs formative), competency, psychometrics, and hints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenAIGenerate && (
              <button
                type="button"
                onClick={onOpenAIGenerate}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-purple-100 transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Auto-Fill</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessment Type & Evaluation Level Configuration Card */}
          <div className="p-5 bg-linear-to-r from-indigo-50/70 via-purple-50/50 to-blue-50/70 rounded-3xl border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Assessment Purpose & Evaluation Level *
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Determines Question Purpose
              </span>
            </div>

            {/* Assessment Type Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAssessmentTypeChange('diagnostic')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  item.assessmentType === 'diagnostic'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50/40'
                }`}
              >
                <Stethoscope className={`w-5 h-5 mt-0.5 shrink-0 ${item.assessmentType === 'diagnostic' ? 'text-white' : 'text-purple-600'}`} />
                <div>
                  <div className="text-xs font-black">Diagnostic Assessment</div>
                  <div className={`text-[11px] mt-0.5 ${item.assessmentType === 'diagnostic' ? 'text-purple-100' : 'text-slate-500'}`}>
                    Baseline evaluation, pre-requisite discovery & knowledge gap diagnosis
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleAssessmentTypeChange('formative')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  item.assessmentType === 'formative'
                    ? 'bg-cyan-700 text-white border-cyan-700 shadow-md shadow-cyan-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-cyan-50/40'
                }`}
              >
                <GraduationCap className={`w-5 h-5 mt-0.5 shrink-0 ${item.assessmentType === 'formative' ? 'text-white' : 'text-cyan-700'}`} />
                <div>
                  <div className="text-xs font-black">Formative Assessment</div>
                  <div className={`text-[11px] mt-0.5 ${item.assessmentType === 'formative' ? 'text-cyan-100' : 'text-slate-500'}`}>
                    Lesson checkpoints, active practice drills & progressive mastery checks
                  </div>
                </div>
              </button>
            </div>

            {/* Assessment Level Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {item.assessmentType === 'diagnostic' ? 'Diagnostic Assessment Level *' : 'Formative Assessment Level *'}
              </label>
              <select
                value={item.assessmentLevel || (item.assessmentType === 'diagnostic' ? 'Level 2 - Core Concept Baseline' : 'Level 2 - Guided Skill Application')}
                onChange={e => handleAssessmentLevelChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {item.assessmentType === 'diagnostic' ? (
                  DIAGNOSTIC_LEVELS.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.title} ({lvl.targetGroup})
                    </option>
                  ))
                ) : (
                  FORMATIVE_LEVELS.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.title} ({lvl.targetGroup})
                    </option>
                  ))
                )}
              </select>

              {/* Dynamic Level Guidance Explainer */}
              {selectedLevelInfo && (
                <div className="mt-2.5 p-3 bg-white/90 rounded-2xl border border-indigo-100 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">{selectedLevelInfo.title}: </span>
                    <span className="text-slate-600">{selectedLevelInfo.description} </span>
                    <span className="text-indigo-700 font-bold block mt-0.5">Target: {selectedLevelInfo.targetGroup}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status & Placement */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Item Status (Workflow)
              </label>
              <select
                value={item.status || 'Draft'}
                onChange={e => setItem({ ...item, status: e.target.value as ItemStatus })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_ORDER.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Topic
              </label>
              <select
                value={topicId}
                onChange={e => {
                  const newTid = e.target.value;
                  setTopicId(newTid);
                  const newTopic = topics.find(t => t.id === newTid);
                  if (newTopic && newTopic.quizzes[0]) {
                    setQuizId(newTopic.quizzes[0].id);
                    setItem(prev => ({ ...prev, topic: newTopic.title }));
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Assigned Quiz
              </label>
              <select
                value={quizId}
                onChange={e => setQuizId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {availableQuizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Question Formulation *
            </label>
            <textarea
              required
              rows={3}
              value={item.question}
              onChange={e => setItem({ ...item, question: e.target.value })}
              placeholder="E.g., If f(x) = 3x² - 5x + 2, evaluate f(-3)."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Options with radio for correctAnswer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Options & Correct Answer Selection *
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Click the radio icon next to the option that represents the keyed correct answer.
            </p>
            <div className="space-y-3">
              {item.options.map((opt, idx) => {
                const isKeyed = item.correctAnswer === idx;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setItem({ ...item, correctAnswer: idx })}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                        isKeyed
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </button>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={e => {
                        const newOpts = [...item.options];
                        newOpts[idx] = e.target.value;
                        setItem({ ...item, options: newOpts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className={`flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 ${
                        isKeyed ? 'font-bold text-emerald-900 border-emerald-300 bg-emerald-50/40' : ''
                      }`}
                    />
                    {isKeyed && (
                      <span className="text-xs font-black text-emerald-700 uppercase tracking-wider px-2">
                        Key
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Competency & Cognitive Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assign Competency *
              </label>
              <input
                type="text"
                required
                value={item.competency}
                onChange={e => setItem({ ...item, competency: e.target.value })}
                placeholder="E.g., Evaluate functions at a given value"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cognitive Level
              </label>
              <select
                value={item.cognitiveLevel || 'Understanding'}
                onChange={e => setItem({ ...item, cognitiveLevel: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Remembering">Remembering</option>
                <option value="Understanding">Understanding</option>
                <option value="Applying">Applying</option>
                <option value="Analyzing">Analyzing</option>
                <option value="Evaluating">Evaluating</option>
                <option value="Creating">Creating</option>
              </select>
            </div>
          </div>

          {/* IRT Psychometric Parameters (Difficulty & Discrimination) */}
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
            <div className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Item Response Theory (2-PL IRT) Parameters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={item.difficulty}
                  onChange={e => {
                    const diff = e.target.value as 'easy' | 'medium' | 'hard';
                    const defaultParam = diff === 'easy' ? -1.0 : diff === 'medium' ? 0.0 : 1.5;
                    setItem({ ...item, difficulty: diff, difficultyParameter: defaultParam });
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Difficulty Parameter (b): <span className="text-indigo-600 font-mono font-black">{item.difficultyParameter}</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="-3.5"
                  max="3.5"
                  value={item.difficultyParameter}
                  onChange={e => setItem({ ...item, difficultyParameter: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400">Scale: -3.0 (very easy) to +3.0 (very hard)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discrimination Parameter (a): <span className="text-indigo-600 font-mono font-black">{item.discriminationParameter}</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="3.0"
                  value={item.discriminationParameter}
                  onChange={e => setItem({ ...item, discriminationParameter: parseFloat(e.target.value) || 1.0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400">Optimal range: 0.8 to 2.0</span>
              </div>
            </div>
          </div>

          {/* Mathematical Solution */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mathematical Solution (Step-by-step)
            </label>
            <textarea
              rows={3}
              value={item.solution}
              onChange={e => setItem({ ...item, solution: e.target.value })}
              placeholder="Step 1: Substitute -3 for x: f(-3) = 3(-3)² - 5(-3) + 2&#10;Step 2: Calculate (-3)² = 9, so 3(9) = 27&#10;Step 3: 27 + 15 + 2 = 44"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Misconception */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Misconception Category & Distractor Rationale
            </label>
            <input
              type="text"
              value={item.misconceptionCategory}
              onChange={e => setItem({ ...item, misconceptionCategory: e.target.value })}
              placeholder="E.g., Sign error when squaring negative numbers (-3)² = -9 instead of +9"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Scaffolded Hints */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Scaffolded Adaptive Hints
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Hint 1 (Gentle Nudge)</span>
                <input
                  type="text"
                  value={item.hint1}
                  onChange={e => setItem({ ...item, hint1: e.target.value })}
                  placeholder="E.g., Make sure to place parentheses around the negative input."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">Hint 2 (Concrete Clue)</span>
                <input
                  type="text"
                  value={item.hint2}
                  onChange={e => setItem({ ...item, hint2: e.target.value })}
                  placeholder="E.g., Remember that (-3)² = 9 and -5 * (-3) = +15."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Extra hints */}
            {item.hints && item.hints.map((hintText, hIdx) => (
              <div key={hIdx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={hintText}
                  onChange={e => handleUpdateExtraHint(hIdx, e.target.value)}
                  placeholder={`Hint ${hIdx + 3}`}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExtraHint(hIdx)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddExtraHint}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-1"
            >
              + Add Another Hint
            </button>
          </div>

          {/* Explanation & Remediation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Conceptual Explanation
              </label>
              <textarea
                rows={2}
                value={item.explanation}
                onChange={e => setItem({ ...item, explanation: e.target.value })}
                placeholder="High-level conceptual takeaway for the student..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Remediation Advice
              </label>
              <textarea
                rows={2}
                value={item.remediation}
                onChange={e => setItem({ ...item, remediation: e.target.value })}
                placeholder="Topic or lesson student should review if incorrect..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Assessment Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ==========================================
// PSYCHOMETRIC ITEM STATS MODAL
// ==========================================
function ItemStatsModal({ item, stats, onClose }: { item: FlatItem; stats: ItemStats | undefined; onClose: () => void }) {
  const totalAnswers = stats ? stats.timesAnswered : 0;
  const pVal = stats ? stats.pValue : null;
  const discIndex = stats ? stats.discriminationIndex : null;

  // Rating for difficulty
  let diffLabel = 'Uncalibrated';
  let diffColor = 'text-slate-600';
  if (pVal !== null && totalAnswers >= 3) {
    if (pVal > 0.80) {
      diffLabel = 'Very Easy (p > 0.80)';
      diffColor = 'text-emerald-700';
    } else if (pVal >= 0.50) {
      diffLabel = 'Moderate / Ideal Difficulty (0.50 - 0.80)';
      diffColor = 'text-blue-700';
    } else if (pVal >= 0.30) {
      diffLabel = 'Challenging (0.30 - 0.49)';
      diffColor = 'text-amber-700';
    } else {
      diffLabel = 'Very Difficult (p < 0.30)';
      diffColor = 'text-rose-700';
    }
  }

  // Rating for discrimination
  let discLabel = 'Uncalibrated';
  let discColor = 'text-slate-600';
  if (discIndex !== null && totalAnswers >= 3) {
    if (discIndex >= 0.40) {
      discLabel = 'Excellent Discrimination (r ≥ 0.40)';
      discColor = 'text-emerald-700';
    } else if (discIndex >= 0.30) {
      discLabel = 'Good Discrimination (0.30 - 0.39)';
      discColor = 'text-blue-700';
    } else if (discIndex >= 0.20) {
      discLabel = 'Acceptable (0.20 - 0.29)';
      discColor = 'text-amber-700';
    } else {
      discLabel = 'Poor / Needs Review (r < 0.20)';
      discColor = 'text-rose-700';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-black text-slate-900">Psychometric Item Diagnostics</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">Item ID: {item.id} • {item.topicTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Question snapshot */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Question</div>
            <div className="font-bold text-slate-900 text-sm">{item.question}</div>
            <div className="text-xs text-indigo-700 mt-1 font-semibold">Competency: {item.competency}</div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">Total Attempts</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalAnswers}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">Facility (p-val)</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {pVal !== null ? pVal : '—'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">Discrim. (r)</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {discIndex !== null ? discIndex : '—'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs text-slate-400 font-bold uppercase">Avg Response</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats && stats.avgResponseTimeMs > 0 ? `${(stats.avgResponseTimeMs / 1000).toFixed(1)}s` : '—'}
              </div>
            </div>
          </div>

          {/* Diagnostic Evaluation Cards */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty Classification</div>
                <div className={`text-sm font-bold ${diffColor}`}>{diffLabel}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Calibrated b-parameter: {item.difficultyParameter} | Theoretical Category: {item.difficulty}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discrimination Index Evaluation</div>
                <div className={`text-sm font-bold ${discColor}`}>{discLabel}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Assigned a-parameter: {item.discriminationParameter}
                </div>
              </div>
            </div>
          </div>

          {/* Distractor Frequency Distribution */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Distractor Analysis & Option Selection Frequency
            </div>
            <div className="space-y-2">
              {item.options.map((opt, idx) => {
                const count = stats ? stats.optionCounts[idx] || 0 : 0;
                const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                const isKey = item.correctAnswer === idx;

                return (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 font-medium">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="truncate max-w-sm text-slate-800">{opt}</span>
                        {isKey && (
                          <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                            Keyed Answer
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-700">
                        {count} ({percentage}%)
                      </div>
                    </div>
                    {/* Bar */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isKey ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {item.misconceptionCategory && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold">Tracked Misconception:</strong> {item.misconceptionCategory}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800"
          >
            Close Diagnostics
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// ITEM IMPORT MODAL COMPONENT (CSV & JSON)
// ==========================================
interface ItemImportModalProps {
  topics: Topic[];
  onClose: () => void;
  onImport: (topicId: string, quizId: string, items: Problem[]) => Promise<void>;
}

function ItemImportModal({ topics, onClose, onImport }: ItemImportModalProps) {
  const [topicId, setTopicId] = useState(topics[0]?.id || '');
  const [quizId, setQuizId] = useState(topics[0]?.quizzes[0]?.id || '');
  const [rawText, setRawText] = useState('');
  const [importStatus, setImportStatus] = useState<ItemStatus>('For Validation');
  const [parsedPreview, setParsedPreview] = useState<Problem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const availableQuizzes = useMemo(() => {
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.quizzes : [];
  }, [topics, topicId]);

  const handleDownloadSampleCSV = () => {
    const sampleHeaders = 'Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswerIndex,Competency,Difficulty,DifficultyParameter,DiscriminationParameter,Solution,Misconception,Hint1,Hint2,Status\n';
    const sampleRows = [
      '"If f(x) = x^2 - 4, what is f(3)?","5","-5","7","1",0,"Evaluate functions at given values","easy",-0.8,1.1,"f(3) = 3^2 - 4 = 9 - 4 = 5","Squaring subtraction error","Substitute 3 into the function","3 squared is 9","Validated"',
      '"Simplify log10(1000)","2","3","10","100",1,"Evaluate logarithms","easy",-1.0,1.2,"10^3 = 1000 so log10(1000) = 3","Confusing log with division","10 to what power is 1000?","Count zeros in 1000","Validated"'
    ].join('\n');

    const blob = new Blob([sampleHeaders + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_assessment_items.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleJSON = () => {
    const sampleData = [
      {
        id: "item-sample-1",
        question: "What is the domain of f(x) = 1/(x - 2)?",
        options: ["All real numbers except x = 2", "All real numbers", "x > 2", "x < 2"],
        correctAnswer: 0,
        competency: "Find domain of rational functions",
        difficulty: "medium",
        difficultyParameter: 0.2,
        discriminationParameter: 1.4,
        cognitiveLevel: "Understanding",
        solution: "The denominator cannot be zero. x - 2 = 0 implies x = 2. Thus domain is all real numbers except 2.",
        misconceptionCategory: "Ignoring division by zero restrictions",
        hint1: "Can a fraction have zero in the denominator?",
        hint2: "Set x - 2 = 0 to find the restricted value.",
        status: "Validated"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_assessment_items.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseContent(text);
    };
    reader.readAsText(file);
  };

  const parseContent = (content: string) => {
    setParseError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setParsedPreview([]);
      return;
    }

    // Try JSON first
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        const validItems: Problem[] = list.map((obj, i) => ({
          id: obj.id || `import-${Date.now()}-${i}`,
          question: obj.question || '',
          options: Array.isArray(obj.options) && obj.options.length >= 4 ? obj.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
          correctAnswer: typeof obj.correctAnswer === 'number' ? obj.correctAnswer : 0,
          solution: obj.solution || '',
          topic: topics.find(t => t.id === topicId)?.title || 'Math',
          competency: obj.competency || 'General Competency',
          difficulty: ['easy', 'medium', 'hard'].includes(obj.difficulty) ? obj.difficulty : 'medium',
          difficultyParameter: typeof obj.difficultyParameter === 'number' ? obj.difficultyParameter : 0,
          discriminationParameter: typeof obj.discriminationParameter === 'number' ? obj.discriminationParameter : 1.0,
          cognitiveLevel: obj.cognitiveLevel || 'Understanding',
          misconceptionCategory: obj.misconceptionCategory || '',
          hint1: obj.hint1 || '',
          hint2: obj.hint2 || '',
          hints: obj.hints || [],
          explanation: obj.explanation || obj.solution || '',
          remediation: obj.remediation || '',
          status: obj.status || importStatus
        }));
        setParsedPreview(validItems);
        return;
      } catch (err) {
        // Fall back to CSV parsing
      }
    }

    // CSV Parse
    try {
      const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        setParseError('CSV must contain a header row and at least one item row.');
        return;
      }

      // Simple CSV regex that respects quoted strings
      const parseCSVLine = (line: string) => {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            if (inQuotes && line[i + 1] === char) {
              cur += char;
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const rows = lines.slice(1);
      const items: Problem[] = [];

      rows.forEach((rowStr, idx) => {
        const cols = parseCSVLine(rowStr);
        if (cols.length >= 6) {
          const q = cols[0];
          const opts = [cols[1] || '', cols[2] || '', cols[3] || '', cols[4] || ''];
          const ansIndex = parseInt(cols[5]) || 0;
          const comp = cols[6] || 'General Competency';
          const diff = (['easy', 'medium', 'hard'].includes(cols[7]?.toLowerCase()) ? cols[7].toLowerCase() : 'medium') as 'easy' | 'medium' | 'hard';
          const diffParam = parseFloat(cols[8]) || (diff === 'easy' ? -1 : diff === 'medium' ? 0 : 1);
          const discParam = parseFloat(cols[9]) || 1.0;
          const sol = cols[10] || '';
          const misc = cols[11] || '';
          const h1 = cols[12] || '';
          const h2 = cols[13] || '';
          const status = (cols[14] as ItemStatus) || importStatus;

          items.push({
            id: `import-${Date.now()}-${idx}`,
            question: q,
            options: opts,
            correctAnswer: Math.min(3, Math.max(0, ansIndex)),
            solution: sol,
            topic: topics.find(t => t.id === topicId)?.title || 'Math',
            competency: comp,
            difficulty: diff,
            difficultyParameter: diffParam,
            discriminationParameter: discParam,
            cognitiveLevel: 'Understanding',
            misconceptionCategory: misc,
            hint1: h1,
            hint2: h2,
            hints: [],
            explanation: sol,
            remediation: '',
            status: STATUS_ORDER.includes(status) ? status : importStatus
          });
        }
      });

      if (items.length === 0) {
        setParseError('No valid rows found in CSV. Please verify column formatting.');
      } else {
        setParsedPreview(items);
      }
    } catch (err) {
      setParseError('Error parsing items: ' + (err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-3xl shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Import Assessment Items</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload CSV or JSON files to bulk populate the official item bank.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Target destination */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Destination Topic
              </label>
              <select
                value={topicId}
                onChange={e => {
                  setTopicId(e.target.value);
                  const t = topics.find(topic => topic.id === e.target.value);
                  if (t && t.quizzes[0]) setQuizId(t.quizzes[0].id);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Destination Quiz
              </label>
              <select
                value={quizId}
                onChange={e => setQuizId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              >
                {availableQuizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Assign Default Status
              </label>
              <select
                value={importStatus}
                onChange={e => setImportStatus(e.target.value as ItemStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
              >
                {STATUS_ORDER.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Template downloads */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-xs text-indigo-900 font-bold">
              Need a starting format? Download standard templates:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50"
              >
                Sample CSV Template
              </button>
              <button
                type="button"
                onClick={handleDownloadSampleJSON}
                className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50"
              >
                Sample JSON Template
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">Choose CSV or JSON File</div>
            <p className="text-xs text-slate-400 mt-0.5">Drag and drop or browse files</p>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {/* Or Paste Raw Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Or Paste CSV / JSON Content Directly:
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={e => {
                setRawText(e.target.value);
                parseContent(e.target.value);
              }}
              placeholder="Paste raw CSV or JSON item array here..."
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {parseError}
            </div>
          )}

          {/* Parsed Preview */}
          {parsedPreview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ready to Import ({parsedPreview.length} Items Validated)
                </span>
                <span className="text-xs text-emerald-700 font-bold">
                  Status: {importStatus}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {parsedPreview.map((item, i) => (
                  <div key={i} className="p-2.5 bg-white flex items-center justify-between gap-3">
                    <div className="truncate flex-1">
                      <strong className="text-slate-900">{i + 1}. {item.question}</strong>
                      <div className="text-slate-400 text-[11px] truncate">
                        Key: {item.options[item.correctAnswer]} • Competency: {item.competency} • IRT b: {item.difficultyParameter}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                      {item.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-sm"
          >
            Cancel
          </button>
          <button
            disabled={parsedPreview.length === 0}
            onClick={() => onImport(topicId, quizId, parsedPreview)}
            className="px-7 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-100"
          >
            Import {parsedPreview.length} Items
          </button>
        </div>
      </motion.div>
    </div>
  );
}
