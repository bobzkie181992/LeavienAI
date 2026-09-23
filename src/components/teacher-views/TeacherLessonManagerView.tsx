import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit3, 
  PlusCircle, 
  FileText, 
  Sparkles, 
  Check, 
  Save, 
  Copy, 
  Trash2, 
  Eye, 
  FolderPlus,
  Send,
  Layers,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { Topic } from '../../types';

interface LessonPlanItem {
  id: string;
  title: string;
  topicTitle: string;
  term: string;
  week: string;
  status: 'Published' | 'Draft';
  updatedAt: string;
  competency: string;
  intentions: string;
  learningExperience: string;
  assessingLearning: string;
  waysForward: string;
}

interface TeacherLessonManagerViewProps {
  topics: Topic[];
  initialSubTab?: 'my' | 'create' | 'drafts' | 'published' | 'templates';
}

export default function TeacherLessonManagerView({
  topics,
  initialSubTab = 'my'
}: TeacherLessonManagerViewProps) {
  const [subTab, setSubTab] = useState<'my' | 'create' | 'drafts' | 'published' | 'templates'>(initialSubTab);

  // Lesson Plans list state
  const [lessons, setLessons] = useState<LessonPlanItem[]>([
    {
      id: 'lp-1',
      title: 'Rational Functions, Equations and Inequalities Mastery',
      topicTitle: 'Rational Functions',
      term: 'Term 1',
      week: 'Week 2',
      status: 'Published',
      updatedAt: '2 days ago',
      competency: 'M11GM-Ib-1: Distinguishes rational function, rational equation, and rational inequality.',
      intentions: 'Students master LCD clearing and domain restriction checks for extraneous roots.',
      learningExperience: 'Real-world speed/time word problems, table of values, graphing asymptotes.',
      assessingLearning: 'Formative board work, 5-problem diagnostics, and TOS summative items.',
      waysForward: 'Adaptive 7-step remediation for students scoring under 75%.'
    },
    {
      id: 'lp-2',
      title: 'Simple and Compound Interest in Practical Financial Math',
      topicTitle: 'Business Mathematics',
      term: 'Term 2',
      week: 'Week 1',
      status: 'Published',
      updatedAt: '3 days ago',
      competency: 'M11GM-IIa-1: Illustrates simple and compound interests and maturity value.',
      intentions: 'Understand compounding frequency (annual, semi-annual, quarterly, monthly).',
      learningExperience: 'Bank loan comparison simulation, amortisation schedule creation.',
      assessingLearning: 'Formative interest calculator checks, quiz with real-world scenarios.',
      waysForward: 'Advanced investment portfolio projects for high scorers.'
    },
    {
      id: 'lp-3',
      title: 'Exponential Growth and Half-life Modeling [Draft]',
      topicTitle: 'Exponential Functions',
      term: 'Term 1',
      week: 'Week 4',
      status: 'Draft',
      updatedAt: 'Today, 9:15 AM',
      competency: 'M11GM-Ie-1: Represents real-life situations using exponential functions.',
      intentions: 'Model population surges and radioactive isotope decay curves.',
      learningExperience: 'Hands-on coin toss simulation of half-life degradation.',
      assessingLearning: 'Practice problem sets on e^(kt) modeling.',
      waysForward: 'Step-by-step hint engine for logarithm inversion.'
    }
  ]);

  // Form State for creating/editing a lesson
  const [newTitle, setNewTitle] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || '');
  const [term, setTerm] = useState('Term 1');
  const [week, setWeek] = useState('Week 1');
  const [competency, setCompetency] = useState('');
  const [intentions, setIntentions] = useState('');
  const [learningExperience, setLearningExperience] = useState('');
  const [assessingLearning, setAssessingLearning] = useState('');
  const [waysForward, setWaysForward] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCreateLesson = (publishStatus: 'Published' | 'Draft') => {
    if (!newTitle.trim()) {
      alert('Please provide a lesson title.');
      return;
    }

    const matchedTopic = topics.find(t => t.id === selectedTopicId) || topics[0];

    const newLesson: LessonPlanItem = {
      id: `lp-${Date.now()}`,
      title: newTitle.trim(),
      topicTitle: matchedTopic.title,
      term,
      week,
      status: publishStatus,
      updatedAt: 'Just now',
      competency: competency.trim() || `Applies core standards for ${matchedTopic.title}.`,
      intentions: intentions.trim() || 'Students master fundamental problem solving.',
      learningExperience: learningExperience.trim() || 'Direct instruction, 4A inquiry, and practice.',
      assessingLearning: assessingLearning.trim() || 'Formative diagnostic checks with 75% passing mark.',
      waysForward: waysForward.trim() || 'Personalized 7-step remediation pathway.'
    };

    setLessons([newLesson, ...lessons]);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSubTab(publishStatus === 'Published' ? 'published' : 'drafts');
    }, 1200);

    // Reset Form
    setNewTitle('');
    setCompetency('');
    setIntentions('');
    setLearningExperience('');
    setAssessingLearning('');
    setWaysForward('');
  };

  const handleApplyTemplate = (type: string) => {
    if (type === 'ilaw') {
      setIntentions('1. Understand theoretical basis.\n2. Master step-by-step procedural calculations.\n3. Solve practical contextual word problems.');
      setLearningExperience('• Activity: Real-life scenario framing\n• Analysis: Formula breakdown & inquiry\n• Abstraction: Generalization & derivation\n• Application: Board exercises & pair work');
      setAssessingLearning('• 5-item formative quiz (Hints enabled)\n• Summative exam with DepEd TOS distribution\n• 80% competency proficiency benchmark');
      setWaysForward('• Adaptive remediation for scores <75%\n• Math Blitz speed challenge for enrichment');
    } else if (type === 'dll') {
      setIntentions('DepEd Daily Lesson Log (DLL): Content and performance standards alignment.');
      setLearningExperience('Review previous lesson, establish lesson purpose, present new examples, discuss new concepts.');
      setAssessingLearning('Evaluating learning: 5-item evaluation in notebook/quiz app.');
      setWaysForward('Additional activities for application or remediation.');
    }
  };

  const displayedLessons = lessons.filter(l => {
    if (subTab === 'drafts') return l.status === 'Draft';
    if (subTab === 'published') return l.status === 'Published';
    return true; // 'my'
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              <span>Instructional Planning Engine</span>
            </span>
            <span className="bg-white/10 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              DLP & DLL Generator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Lesson Management & DLP Studio</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Create, author, and publish DepEd ILAW Daily Lesson Plans. Manage drafts, apply official lesson templates, and link lessons directly to student diagnostic quizzes.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('my')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'my'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>My Lessons</span>
          <span className="px-2 py-0.5 bg-slate-800 text-emerald-300 rounded-full text-[10px] font-black">
            {lessons.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('create')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'create'
              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>Create Lesson</span>
        </button>

        <button
          onClick={() => setSubTab('drafts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'drafts'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Drafts ({lessons.filter(l => l.status === 'Draft').length})</span>
        </button>

        <button
          onClick={() => setSubTab('published')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'published'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Published ({lessons.filter(l => l.status === 'Published').length})</span>
        </button>

        <button
          onClick={() => setSubTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'templates'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Lesson Templates</span>
        </button>
      </div>

      {/* CREATE LESSON STUDIO */}
      {subTab === 'create' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">DepEd ILAW Daily Lesson Plan (DLP) Creator</h3>
              <p className="text-xs text-slate-500">Design your lesson according to DepEd Order No. 016, s. 2024</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyTemplate('ilaw')}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Fill ILAW Framework</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lesson plan saved successfully! Redirecting...</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Lesson Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Asymptotes & Intercepts of Rational Functions"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Curriculum Topic / Unit
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Term / Quarter
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Term 1">Term 1 (First Quarter)</option>
                <option value="Term 2">Term 2 (Second Quarter)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Target Week
              </label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {Array.from({ length: 9 }).map((_, idx) => (
                  <option key={idx} value={`Week ${idx + 1}`}>Week {idx + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Learning Competency Code
              </label>
              <input
                type="text"
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                placeholder="e.g. M11GM-Ib-1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 4 Pillars Fields */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              The 4 Pillars of ILAW Framework
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-indigo-700 uppercase">
                  1. Intentions (Objectives & Standards)
                </label>
                <textarea
                  rows={3}
                  value={intentions}
                  onChange={(e) => setIntentions(e.target.value)}
                  placeholder="Define learning goals, content standards, and real-world mastery targets..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-sky-700 uppercase">
                  2. Learning Experience (4A's Pedagogy)
                </label>
                <textarea
                  rows={3}
                  value={learningExperience}
                  onChange={(e) => setLearningExperience(e.target.value)}
                  placeholder="Activity, Analysis, Abstraction, and Application exercises..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-emerald-700 uppercase">
                  3. Assessing Learning (Formative & Summative)
                </label>
                <textarea
                  rows={3}
                  value={assessingLearning}
                  onChange={(e) => setAssessingLearning(e.target.value)}
                  placeholder="Formative exit tickets, diagnostic quizzes, and benchmark passing percentage..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-amber-700 uppercase">
                  4. Ways Forward (Remediation & Enrichment)
                </label>
                <textarea
                  rows={3}
                  value={waysForward}
                  onChange={(e) => setWaysForward(e.target.value)}
                  placeholder="Adaptive pathways for students struggling, enrichment tasks for advanced learners..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleCreateLesson('Draft')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleCreateLesson('Published')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish to Student Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* LESSONS LIST (MY, DRAFTS, PUBLISHED) */}
      {subTab !== 'create' && subTab !== 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {subTab === 'drafts' ? 'Draft Lessons' : subTab === 'published' ? 'Published Active Lessons' : 'All My Authoring Lessons'} ({displayedLessons.length})
            </h3>
            <button
              onClick={() => setSubTab('create')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Lesson Plan</span>
            </button>
          </div>

          <div className="grid gap-3">
            {displayedLessons.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                      item.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {item.term} • {item.week}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded">
                      {item.topicTitle}
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm sm:text-base">{item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.competency}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => alert(`Previewing DLP for "${item.title}"...`)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="View Full DLP"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const copy = { ...item, id: `lp-${Date.now()}`, title: `${item.title} (Copy)`, status: 'Draft' as const };
                      setLessons([copy, ...lessons]);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Duplicate Lesson"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this lesson plan?')) {
                        setLessons(lessons.filter(l => l.id !== item.id));
                      }
                    }}
                    className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEMPLATES LIBRARY */}
      {subTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              DepEd Order 016
            </span>
            <h4 className="font-black text-slate-900 text-base">ILAW Lesson Exemplar</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standard 4-pillar structure (Intentions, Learning Experience, Assessing Learning, Ways Forward).
            </p>
            <button
              onClick={() => {
                handleApplyTemplate('ilaw');
                setSubTab('create');
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Use ILAW Template
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              DepEd Standard
            </span>
            <h4 className="font-black text-slate-900 text-base">Daily Lesson Log (DLL)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Log format for teachers with at least one year of teaching experience under DepEd D.O. 42, s. 2016.
            </p>
            <button
              onClick={() => {
                handleApplyTemplate('dll');
                setSubTab('create');
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Use DLL Template
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Constructivist
            </span>
            <h4 className="font-black text-slate-900 text-base">4-A's Experiential Model</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Activity, Analysis, Abstraction, and Application sequence designed for rigorous math problem solving.
            </p>
            <button
              onClick={() => {
                handleApplyTemplate('ilaw');
                setSubTab('create');
              }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Use 4-A's Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
