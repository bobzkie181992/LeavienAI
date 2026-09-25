import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Map, 
  Layers, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Search, 
  ArrowRight, 
  FileText, 
  Calendar, 
  Award,
  ChevronRight,
  Download,
  Filter,
  ListTree
} from 'lucide-react';
import { Topic, isValidatedOrActive } from '../../types';
import { topics as defaultTopics } from '../../data/curriculum';
import CurriculumHierarchyBrowser from '../CurriculumHierarchyBrowser';
import { useAcademicTerms } from '../../hooks/useFirebase';

interface TeacherCurriculumViewProps {
  topics?: Topic[];
  initialSubTab?: 'hierarchy' | 'overview' | 'ilaw' | 'competencies' | 'map';
  onSelectTopicForEdit?: (topic: Topic) => void;
}

export default function TeacherCurriculumView({
  topics = defaultTopics,
  initialSubTab = 'hierarchy',
  onSelectTopicForEdit
}: TeacherCurriculumViewProps) {
  const { terms } = useAcademicTerms();
  const [subTab, setSubTab] = useState<'hierarchy' | 'overview' | 'ilaw' | 'competencies' | 'map'>(initialSubTab);
  const [selectedTerm, setSelectedTerm] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIlawTopicId, setSelectedIlawTopicId] = useState<string>(topics[0]?.id || '');

  // Filter topics
  const filteredTopics = topics.filter(t => {
    const matchTerm = selectedTerm === 'All' || t.term === selectedTerm;
    const matchQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTerm && matchQuery;
  });

  const selectedIlawTopic = topics.find(t => t.id === selectedIlawTopicId) || topics[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-sky-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>DepEd Curriculum Management</span>
            </span>
            <span className="bg-white/10 text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Grade 11 General Mathematics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Curriculum Architecture & DepEd Alignment
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage course roadmaps, inspect DepEd Order No. 016 ILAW lesson guides, track Most Essential Learning Competencies (MELCs), and review sequence pacing.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('hierarchy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'hierarchy'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListTree className="w-4 h-4 text-amber-400" />
          <span>8-Level Hierarchy</span>
        </button>

        <button
          onClick={() => setSubTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'overview'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Curriculum Overview</span>
          <span className="px-2 py-0.5 bg-slate-800 text-sky-300 rounded-full text-[10px] font-black">
            {topics.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('ilaw')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'ilaw'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ILAW Lessons (D.O. 016)</span>
        </button>

        <button
          onClick={() => setSubTab('competencies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'competencies'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Learning Competencies</span>
        </button>

        <button
          onClick={() => setSubTab('map')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'map'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Map className="w-4 h-4 text-rose-400" />
          <span>Curriculum Map & Pacing</span>
        </button>
      </div>

      {/* 0. 8-LEVEL HIERARCHY EXPLORER */}
      {subTab === 'hierarchy' && (
        <CurriculumHierarchyBrowser
          topics={topics}
          results={[]}
          profile={{ uid: 'teacher', displayName: 'Teacher / Faculty' } as any}
        />
      )}

      {/* 1. CURRICULUM OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term Filter:</span>
              {['All', ...terms.map(t => t.name)].map(term => (
                <button
                  key={term}
                  onClick={() => setSelectedTerm(term)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTerm === term
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search unit or competency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic, index) => {
              const activeProblems = topic.quizzes.flatMap(q => q.problems).filter(isValidatedOrActive).length;

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                        {topic.term} • {topic.week}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Unit {index + 1}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base leading-snug">{topic.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{topic.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Quizzes</span>
                        <span className="text-slate-900 font-black">{topic.quizzes.length} Modules</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Question Pool</span>
                        <span className="text-slate-900 font-black">{activeProblems} Items</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedIlawTopicId(topic.id);
                          setSubTab('ilaw');
                        }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>View ILAW</span>
                      </button>
                      {onSelectTopicForEdit && (
                        <button
                          onClick={() => onSelectTopicForEdit(topic)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ILAW LESSONS (DEPED ORDER 016) */}
      {subTab === 'ilaw' && (
        <div className="space-y-6">
          {/* Unit Selector */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Unit:</span>
              <select
                value={selectedIlawTopicId}
                onChange={(e) => setSelectedIlawTopicId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.term} - {t.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Exporting DepEd D.O. 016 ILAW Daily Lesson Plan (DLP) for ${selectedIlawTopic.title}...`)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Official DLP</span>
              </button>
            </div>
          </div>

          {/* ILAW Matrix 4 Pillars */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                DepEd Order No. 016, s. 2024 Framework
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{selectedIlawTopic.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedIlawTopic.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1: Intentions */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    I
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Intentions (Learning Goals)</h3>
                    <p className="text-[10px] text-indigo-700 font-semibold">MELCs Alignment & Content Standards</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p><strong>Content Standard:</strong> Demonstrates understanding of key concepts of {selectedIlawTopic.title.toLowerCase()}.</p>
                  <p><strong>Performance Standard:</strong> Accurately constructs mathematical models and solves real-life situational problems.</p>
                  <p><strong>Key Competency:</strong> Applies step-by-step problem-solving heuristics with 80% passing proficiency.</p>
                </div>
              </div>

              {/* Pillar 2: Learning Experience */}
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-xs flex items-center justify-center">
                    L
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Learning Experience (Pedagogy)</h3>
                    <p className="text-[10px] text-sky-700 font-semibold">4A's Flow & Interactive Drills</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p><strong>Activity:</strong> Real-world scenario problem framing and conceptual hooks.</p>
                  <p><strong>Analysis:</strong> Guided inquiry, formula decomposition, and error analysis.</p>
                  <p><strong>Abstraction & Application:</strong> Board work exercises, peer discussion, and digital simulation.</p>
                </div>
              </div>

              {/* Pillar 3: Assessing Learning */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    A
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Assessing Learning (Formative & Summative)</h3>
                    <p className="text-[10px] text-emerald-700 font-semibold">DepEd D.O. 8, s. 2015 Standards</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p><strong>Formative Assessment:</strong> 5-question immediate feedback quiz with instant step hints.</p>
                  <p><strong>Summative Exam:</strong> Table of Specifications (TOS) aligned term examination.</p>
                  <p><strong>Mastery Threshold:</strong> 75%–80% proficiency benchmark.</p>
                </div>
              </div>

              {/* Pillar 4: Ways Forward */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                    W
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Ways Forward (Remediation & Enrichment)</h3>
                    <p className="text-[10px] text-amber-700 font-semibold">Adaptive Pathways & Interventions</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p><strong>Remediation:</strong> 7-step targeted learning pathway with foundational review items.</p>
                  <p><strong>Enrichment:</strong> Advanced Olympiad-style math sprint problems & real-world modeling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LEARNING COMPETENCIES */}
      {subTab === 'competencies' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Grade 11 MELCs Competency Directory</h3>
            <p className="text-xs text-slate-500">Official DepEd Most Essential Learning Competencies mapped across all terms</p>
          </div>

          <div className="space-y-3 pt-2">
            {topics.map((t, idx) => (
              <div key={t.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      M11GM-I{String.fromCharCode(97 + (idx % 10))}-1
                    </span>
                    <span className="text-xs font-black text-slate-900">{t.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Accurately applies principles of {t.title.toLowerCase()} to solve complex multistep equations and contextual word problems.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                  80% Benchmark
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CURRICULUM MAP */}
      {subTab === 'map' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">Senior High School Curriculum Pacing & Flow</h3>
            <p className="text-xs text-slate-500">Recommended 18-week progression sequence for General Mathematics</p>
          </div>

          <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-6">
            {topics.map((topic, i) => (
              <div key={topic.id} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-xs" />
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">
                      {topic.term} • {topic.week}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Week {i + 1}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{topic.title}</h4>
                  <p className="text-xs text-slate-500">{topic.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
