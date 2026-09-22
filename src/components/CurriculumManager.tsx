import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Plus, Edit2, Trash2, Save, X, Activity, Triangle, TrendingUp, HelpCircle, Database, Award, Zap, Target, Map, List, FileText, Upload, BrainCircuit, FolderCheck, Layers } from 'lucide-react';
import { useCurriculum } from '../hooks/useFirebase';
import { Topic, Quiz, LessonPlan, ImportedDocument } from '../types';
import { topics as initialTopics } from '../data/curriculum';
import QuizManager from './QuizManager';
import LessonPlanModal from './LessonPlanModal';
import ImportLessonPlanModal from './ImportLessonPlanModal';
import TopicAnalysisModal from './TopicAnalysisModal';
import DocumentLibrary from './DocumentLibrary';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const ICON_OPTIONS = ['Activity', 'Triangle', 'TrendingUp', 'BookOpen', 'Award', 'Zap', 'Target', 'Map'];
const COLOR_OPTIONS = ['blue', 'emerald', 'orange', 'indigo', 'rose', 'amber', 'purple', 'slate'];

export default function CurriculumManager() {
  const { topics, loading, saveTopic, deleteTopic, refresh } = useCurriculum();
  const [activeTab, setActiveTab] = useState<'topics' | 'library'>('topics');
  const [selectedTerm, setSelectedTerm] = useState<'All' | 'Term 1' | 'Term 2' | 'Term 3'>('All');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);
  const [managingQuizzesFor, setManagingQuizzesFor] = useState<Topic | null>(null);
  const [viewingLessonPlanFor, setViewingLessonPlanFor] = useState<Topic | null>(null);
  const [analyzingTopic, setAnalyzingTopic] = useState<Topic | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [importedDocuments, setImportedDocuments] = useState<ImportedDocument[]>([
    {
      id: 'doc-sample-1',
      fileName: 'DepEd_SSHS_General_Math_Q1W9.docx',
      format: 'DOCX',
      status: 'Published',
      uploadedAt: new Date().toISOString(),
      topicTitle: 'Surface Area & Volume of 3D Objects',
      extractedMetadata: {
        schoolName: 'SSHS National High School',
        teacherName: 'Teacher Juan Dela Cruz',
        gradeLevel: 'Grade 11 - General Mathematics',
        section: 'Grade 11 – Gauss',
        subject: 'General Mathematics',
        quarter: 'Term 1',
        dateOrWeek: 'Week 9',
        lessonTopic: 'Surface Area & Volume of 3D Objects',
        learningCompetency: 'M11GM-Ib-1: Computes surface area and volume of three-dimensional figures',
        melcInformation: 'Quarter 1 MELCs',
        contentStandards: 'Demonstrates understanding of 3D geometry rules',
        performanceStandards: 'Solves real-life spatial modeling problems',
        learningObjectives: [
          'Calculate surface area and volume of 3D solids accurately.',
          'Solve contextual DepEd engineering/architectural problems.'
        ],
        learningActivities: ['Direct derivation of 3D formulas', 'Collaborative pair exercises'],
        assessmentActivities: ['Formative board work check', '5-item practice assessment'],
        performanceTasks: '3D Box Packaging Model Project',
        learningResources: ['DepEd General Mathematics Learning Exemplars'],
        references: ['DepEd Budget of Work (BoW)'],
        assignmentEnrichment: 'Design an optimized shipping box'
      }
    }
  ]);

  const handleSeed = async () => {
    if (window.confirm('This will seed the database with initial curriculum data. Continue?')) {
      for (const topic of initialTopics) {
        await saveTopic(topic);
      }
      alert('Curriculum seeded successfully!');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopic) {
      await saveTopic(editingTopic);
      setEditingTopic(null);
      setIsAdding(false);
    }
  };

  const startNewTopic = () => {
    setEditingTopic({
      id: `topic-${Date.now()}`,
      title: '',
      description: '',
      icon: 'BookOpen',
      color: 'indigo',
      term: selectedTerm === 'All' ? 'Term 2' : selectedTerm,
      week: 'Week 1',
      weekNumber: 1,
      performanceTask: {
        assigned: false,
        title: '',
        description: '',
        weightPercentage: 20
      },
      quizzes: []
    });
    setIsAdding(true);
  };

  const filteredTopics = topics.filter(t => {
    if (selectedTerm === 'All') return true;
    return t.term === selectedTerm;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (managingQuizzesFor) {
    const currentTopic = topics.find(t => t.id === managingQuizzesFor.id) || managingQuizzesFor;
    return (
      <QuizManager 
        topic={currentTopic}
        onSave={saveTopic}
        onBack={() => setManagingQuizzesFor(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Curriculum Management & DepEd Library</h2>
          <p className="text-slate-500">Organize semester terms (up to 3 Terms), schedule weekly lessons, and manage performance tasks.</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          {topics.length === 0 && (
            <button 
              onClick={handleSeed}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl hover:bg-amber-100 transition-colors"
            >
              <Database className="w-5 h-5" />
              Seed Initial Data
            </button>
          )}
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200"
            title="Import Lesson Plan from DOCX, PDF, PPTX, XLSX, TXT, or Image"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload & Import Document</span>
          </button>
          <button 
            onClick={startNewTopic}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            New Topic
          </button>
        </div>
      </div>

      {/* Primary Tab & Term Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit font-extrabold text-xs">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 ${activeTab === 'topics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum Topics ({filteredTopics.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 ${activeTab === 'library' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <FolderCheck className="w-4 h-4" />
            <span>Document Library & Repository ({importedDocuments.length})</span>
          </button>
        </div>

        {activeTab === 'topics' && (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl font-bold text-xs">
            <span className="px-3 text-slate-400 uppercase tracking-wider text-[10px]">Filter Term:</span>
            {(['All', 'Term 1', 'Term 2', 'Term 3'] as const).map((term) => {
              const count = term === 'All' ? topics.length : topics.filter(t => t.term === term).length;
              return (
                <button
                  key={term}
                  onClick={() => setSelectedTerm(term)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    selectedTerm === term
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {term} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Term Overview Summary Banner */}
      {activeTab === 'topics' && selectedTerm !== 'All' && (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-indigo-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {selectedTerm} Curriculum Structure
              </span>
              <span className="text-slate-400 text-xs">Max 3 Terms Allowed per Semester</span>
            </div>
            <h3 className="text-xl font-bold">
              {selectedTerm === 'Term 2' ? 'Term 2: Functions, Trigonometry & Applied Measurement' : `${selectedTerm} Overview`}
            </h3>
            <p className="text-sm text-slate-300 mt-0.5">
              {filteredTopics.length} Weekly Modules • {filteredTopics.filter(t => t.performanceTask?.assigned).length} Performance Tasks Assigned
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <p className="text-xs text-slate-300 font-medium">Weekly Lessons</p>
              <p className="text-lg font-bold text-emerald-400">{filteredTopics.length} Weeks</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <p className="text-xs text-slate-300 font-medium">Performance Tasks</p>
              <p className="text-lg font-bold text-amber-300">{filteredTopics.filter(t => t.performanceTask?.assigned).length} Tasks</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'topics' ? (
        <div className="grid gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-indigo-100 transition-all">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-${topic.color}-50 text-${topic.color}-600`}>
                  <TopicIcon name={topic.icon} className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {topic.term && (
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded-md text-[10px] border border-indigo-200/60">
                        {topic.term}
                      </span>
                    )}
                    {topic.week && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-extrabold rounded-md text-[10px]">
                        {topic.week}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-slate-900">{topic.title}</h3>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed">{topic.description}</p>

                  {/* Weekly Focus */}
                  {topic.weeklyFocus && (
                    <p className="text-xs text-indigo-900 bg-indigo-50/60 px-3 py-1.5 rounded-xl border border-indigo-100/50 mt-1 inline-block">
                      <span className="font-bold">Weekly Focus:</span> {topic.weeklyFocus}
                    </p>
                  )}

                  {/* Performance Task Badge */}
                  {topic.performanceTask && topic.performanceTask.assigned && (
                    <div className="mt-2 flex items-center gap-2 text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200/70">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold">
                          Performance Task {topic.performanceTask.number ? `#${topic.performanceTask.number}` : ''}: {topic.performanceTask.title || 'Weekly Performance Task'}
                        </span>
                        {topic.performanceTask.description && (
                          <span className="text-amber-800 ml-1 block sm:inline text-[11px]">
                            — {topic.performanceTask.description} ({topic.performanceTask.weightPercentage || 20}% Weight)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap md:flex-nowrap shrink-0">
                {topic.summativeAssessment && (
                  <button 
                    onClick={() => setViewingLessonPlanFor(topic)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 rounded-xl transition-all text-xs"
                    title="View Outcome-Aligned Summative Assessment & Table of Specifications"
                  >
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>Summative & TOS</span>
                  </button>
                )}
                <button 
                  onClick={() => setViewingLessonPlanFor(topic)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 rounded-xl transition-all text-xs"
                  title="View & Edit DepEd Lesson Plan"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Lesson Plan</span>
                </button>
                <button 
                  onClick={() => setAnalyzingTopic(topic)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 rounded-xl transition-all text-xs"
                  title="AI Pedagogical Topic & Lesson Plan Analysis"
                >
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  <span>Analyze Topic</span>
                </button>
                <button 
                  onClick={() => setManagingQuizzesFor(topic)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-700 font-bold hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-xs"
                >
                  <List className="w-4 h-4" />
                  <span>Quizzes</span>
                </button>
                <button 
                  onClick={() => { setEditingTopic(topic); setIsAdding(true); }}
                  className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Edit Topic & Performance Task"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setDeletingTopic(topic)}
                  className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete Topic"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {filteredTopics.length === 0 && (
            <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[40px]">
               <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p>No topics created for {selectedTerm}. Start by adding a new topic or seeding initial data.</p>
            </div>
          )}
        </div>
      ) : (
        <DocumentLibrary
          documents={importedDocuments}
          onUploadClick={() => setShowImportModal(true)}
          onSelectDocument={(doc) => {
            const topic = topics.find(t => t.title.toLowerCase().includes(doc.topicTitle.toLowerCase()));
            if (topic) setViewingLessonPlanFor(topic);
          }}
          onDeleteDocument={(id) => {
            setImportedDocuments(prev => prev.filter(d => d.id !== id));
          }}
          onDuplicateDocument={(doc) => {
            const dup: ImportedDocument = {
              ...doc,
              id: `doc-${Date.now()}`,
              fileName: `${doc.fileName}_Copy`,
              uploadedAt: new Date().toISOString()
            };
            setImportedDocuments(prev => [dup, ...prev]);
          }}
          onReuseDocument={(doc) => {
            setShowImportModal(true);
          }}
        />
      )}

      <AnimatePresence>
        {isAdding && editingTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => { setIsAdding(false); setEditingTopic(null); }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-bold text-slate-900 mb-8">{editingTopic.id.startsWith('topic-') ? 'New Topic' : 'Edit Topic'}</h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Semester Term (Up to 3 Terms)</label>
                      <select 
                        value={editingTopic.term || 'Term 2'}
                        onChange={(e) => setEditingTopic({...editingTopic, term: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                      >
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Week Label</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Week 1"
                          value={editingTopic.week || ''}
                          onChange={(e) => setEditingTopic({...editingTopic, week: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Week Number</label>
                        <input 
                          type="number" 
                          min={1}
                          max={12}
                          value={editingTopic.weekNumber || 1}
                          onChange={(e) => setEditingTopic({...editingTopic, weekNumber: parseInt(e.target.value) || 1})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Topic Title</label>
                      <input 
                        type="text" 
                        required
                        value={editingTopic.title}
                        onChange={(e) => setEditingTopic({...editingTopic, title: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                      <textarea 
                        required
                        rows={2}
                        value={editingTopic.description}
                        onChange={(e) => setEditingTopic({...editingTopic, description: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Weekly Focus Statement</label>
                      <textarea 
                        rows={2}
                        placeholder="Core competency focus for the week..."
                        value={editingTopic.weeklyFocus || ''}
                        onChange={(e) => setEditingTopic({...editingTopic, weeklyFocus: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Performance Task Configuration */}
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 font-bold text-amber-900 text-sm cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={editingTopic.performanceTask?.assigned || false}
                            onChange={(e) => setEditingTopic({
                              ...editingTopic,
                              performanceTask: {
                                ...editingTopic.performanceTask,
                                assigned: e.target.checked,
                                weightPercentage: editingTopic.performanceTask?.weightPercentage || 20
                              }
                            })}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>Assign Weekly Performance Task</span>
                        </label>
                        {editingTopic.performanceTask?.assigned && (
                          <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                            Weight: {editingTopic.performanceTask?.weightPercentage || 20}%
                          </span>
                        )}
                      </div>

                      {editingTopic.performanceTask?.assigned && (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-1">
                              <label className="block text-[10px] font-bold text-amber-800 uppercase">Task #</label>
                              <input 
                                type="number"
                                value={editingTopic.performanceTask?.number || 1}
                                onChange={(e) => setEditingTopic({
                                  ...editingTopic,
                                  performanceTask: {
                                    ...editingTopic.performanceTask!,
                                    number: parseInt(e.target.value) || 1
                                  }
                                })}
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-amber-800 uppercase">Task Weight (%)</label>
                              <input 
                                type="number"
                                value={editingTopic.performanceTask?.weightPercentage || 20}
                                onChange={(e) => setEditingTopic({
                                  ...editingTopic,
                                  performanceTask: {
                                    ...editingTopic.performanceTask!,
                                    weightPercentage: parseInt(e.target.value) || 20
                                  }
                                })}
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-amber-800 uppercase">Task Title</label>
                            <input 
                              type="text"
                              placeholder="e.g. Piecewise Functions Real-World Modeling"
                              value={editingTopic.performanceTask?.title || ''}
                              onChange={(e) => setEditingTopic({
                                ...editingTopic,
                                performanceTask: {
                                  ...editingTopic.performanceTask!,
                                  title: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-amber-800 uppercase">Task Instructions & Rubric</label>
                            <textarea 
                              rows={2}
                              placeholder="Describe the output required from students..."
                              value={editingTopic.performanceTask?.description || ''}
                              onChange={(e) => setEditingTopic({
                                ...editingTopic,
                                performanceTask: {
                                  ...editingTopic.performanceTask!,
                                  description: e.target.value
                                }
                              })}
                              className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Icon</label>
                      <div className="grid grid-cols-4 gap-2">
                        {ICON_OPTIONS.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setEditingTopic({...editingTopic, icon})}
                            className={`p-2.5 rounded-xl border-2 flex items-center justify-center transition-all ${editingTopic.icon === icon ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                          >
                            <TopicIcon name={icon} className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Theme Color</label>
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_OPTIONS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEditingTopic({...editingTopic, color})}
                            className={`h-9 rounded-xl border-2 transition-all bg-${color}-500 ${editingTopic.color === color ? 'border-slate-900 scale-105 shadow-md' : 'border-white'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => { setIsAdding(false); setEditingTopic(null); }}
                    className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Topic
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Lesson Plan Modal */}
        {viewingLessonPlanFor && (
          <LessonPlanModal
            topic={viewingLessonPlanFor}
            isFaculty={true}
            onSaveLessonPlan={async (topicId, updatedPlan) => {
              const updatedTopic = { ...viewingLessonPlanFor, lessonPlan: updatedPlan };
              await saveTopic(updatedTopic);
              setViewingLessonPlanFor(updatedTopic);
            }}
            onClose={() => setViewingLessonPlanFor(null)}
          />
        )}

        {/* Import Lesson Plan Modal */}
        {showImportModal && (
          <ImportLessonPlanModal
            existingTopics={topics}
            onImportSuccess={async (importedTopic, docRecord) => {
              await saveTopic(importedTopic);
              if (docRecord) {
                setImportedDocuments(prev => [docRecord, ...prev]);
              }
              await refresh();
            }}
            onClose={() => setShowImportModal(false)}
          />
        )}

        {/* Topic Analysis Modal */}
        {analyzingTopic && (
          <TopicAnalysisModal
            topic={analyzingTopic}
            onClose={() => setAnalyzingTopic(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={!!deletingTopic}
        title="Delete Curriculum Topic"
        message={`Are you sure you want to delete "${deletingTopic?.title}"? All associated quizzes and lesson plan data will be removed.`}
        confirmText="Delete Topic"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingTopic}
        onConfirm={async () => {
          if (!deletingTopic) return;
          setIsDeletingTopic(true);
          try {
            await deleteTopic(deletingTopic.id);
          } finally {
            setIsDeletingTopic(false);
            setDeletingTopic(null);
          }
        }}
        onClose={() => setDeletingTopic(null)}
      />
    </div>
  );
}

function TopicIcon({ name, className }: { name: string, className?: string }) {
  const Icon = ({
    Activity,
    Triangle,
    TrendingUp,
    BookOpen,
    Award,
    Zap,
    Target,
    Map
  } as any)[name] || HelpCircle;
  return <Icon className={className} />;
}
