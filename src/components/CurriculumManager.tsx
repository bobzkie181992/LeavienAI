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
      quizzes: []
    });
    setIsAdding(true);
  };

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
    // Find the latest topic data in case it was updated
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
          <p className="text-slate-500">Design learning paths, import educational documents, and manage ILAW lesson plans.</p>
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

      {/* Primary Tab Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-fit font-extrabold text-xs">
        <button
          onClick={() => setActiveTab('topics')}
          className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 ${activeTab === 'topics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Topics ({topics.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 ${activeTab === 'library' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FolderCheck className="w-4 h-4" />
          <span>Document Library & Repository ({importedDocuments.length})</span>
        </button>
      </div>

      {activeTab === 'topics' ? (
        <div className="grid gap-6">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${topic.color}-50 text-${topic.color}-600`}>
                  <TopicIcon name={topic.icon} className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{topic.title}</h3>
                  <p className="text-sm text-slate-500">{topic.quizzes.length} Quizzes • {topic.description}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

          {topics.length === 0 && (
            <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[40px]">
               <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p>No topics created yet. Start by adding a new one or seeding initial data.</p>
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
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
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
                        rows={3}
                        value={editingTopic.description}
                        onChange={(e) => setEditingTopic({...editingTopic, description: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Icon</label>
                      <div className="grid grid-cols-4 gap-2">
                        {ICON_OPTIONS.map(icon => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setEditingTopic({...editingTopic, icon})}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all ${editingTopic.icon === icon ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
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
                            className={`h-10 rounded-xl border-2 transition-all bg-${color}-500 ${editingTopic.color === color ? 'border-slate-900 scale-110 shadow-lg' : 'border-white'}`}
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
