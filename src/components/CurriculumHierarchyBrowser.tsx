import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Target, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Search, 
  ListTree, 
  Award, 
  Clock, 
  Folder, 
  FileCode,
  GraduationCap
} from 'lucide-react';
import { Topic, UserProfile } from '../types';

interface CurriculumHierarchyBrowserProps {
  topics: Topic[];
  results?: any[];
  profile?: UserProfile;
}

interface HierarchyLevel {
  level: number;
  name: string;
  code: string;
  type: string;
  description: string;
  badge: string;
}

export default function CurriculumHierarchyBrowser({
  topics,
  results = [],
  profile
}: CurriculumHierarchyBrowserProps) {
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    'level-1': true,
    'level-2': true
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleLevel = (id: string) => {
    setExpandedLevels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hierarchyFramework: HierarchyLevel[] = [
    {
      level: 1,
      name: 'Senior High School Core Subject',
      code: 'SHS-GENMATH-11',
      type: 'Department Curriculum Standard',
      description: 'DepEd K to 12 Grade 11 General Mathematics Curriculum Framework',
      badge: 'Level 1 Core Domain'
    },
    {
      level: 2,
      name: 'Academic Terms / Quarters',
      code: 'Q1 - Q4',
      type: 'Pacing Structure',
      description: '4 Academic Quarters (Quarter 1 Functions, Quarter 2 Business Math, Quarter 3 Logic, Quarter 4 Advanced Topics)',
      badge: 'Level 2 Pacing'
    },
    {
      level: 3,
      name: 'Curriculum Units & Main Topics',
      code: `TOPICS (${topics.length})`,
      type: 'Subject Modules',
      description: 'Functions, Rational Expressions, Exponential Functions, Logarithms, Simple & Compound Interest, Propositional Logic',
      badge: 'Level 3 Units'
    },
    {
      level: 4,
      name: 'DepEd Order No. 016 ILAW Daily Lesson Plans (DLP)',
      code: 'D.O. 016 s.2024',
      type: 'Lesson Plans',
      description: 'Intentions (I), Learning Experience (L), Assessing Learning (A), and Ways Forward (W) framework',
      badge: 'Level 4 DLP'
    },
    {
      level: 5,
      name: 'Most Essential Learning Competencies (MELCs)',
      code: 'M11GM-MELCs',
      type: 'Learning Standards',
      description: 'Specific observable skills mandated by DepEd curriculum guidelines',
      badge: 'Level 5 MELCs'
    },
    {
      level: 6,
      name: 'Diagnostic Baseline & Assessment Checkpoints',
      code: '2PL IRT Pool',
      type: 'Assessment System',
      description: '20-item diagnostic baseline checkpoints and formative check widgets',
      badge: 'Level 6 Checkpoints'
    },
    {
      level: 7,
      name: 'Adaptive Remediation & AI Guidance',
      code: 'AI Coach',
      type: 'Differentiated Instruction',
      description: 'Conceptual, procedural, and first-step hint scaffolding with personalized study guides',
      badge: 'Level 7 Scaffolding'
    },
    {
      level: 8,
      name: 'Student Mastery & Competency Records',
      code: 'Mastery DB',
      type: 'Analytics & Transcripts',
      description: '3-tier competency placement (Mastered, Developing, Needs Intervention) and Table of Specifications',
      badge: 'Level 8 Transcripts'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Information Banner */}
      <div className="p-5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-sky-500/10 border border-indigo-200 rounded-3xl flex items-start gap-3.5 text-slate-800">
        <ListTree className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <span>DepEd 8-Level Curriculum Architecture</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              Interactive Hierarchy
            </span>
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Explore how Senior High School General Mathematics is structured from top-level Department Standards down to individual student competency transcripts.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter hierarchy framework or competencies..."
          className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* 8-Level Tree Explorer */}
      <div className="space-y-3">
        {hierarchyFramework.map((lvl) => {
          const levelId = `level-${lvl.level}`;
          const isExpanded = expandedLevels[levelId];

          return (
            <div
              key={lvl.level}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
            >
              {/* Level Header Row */}
              <div
                onClick={() => toggleLevel(levelId)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-2xl bg-indigo-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    L{lvl.level}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.2 rounded-md">
                        {lvl.badge}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {lvl.code}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base mt-0.5 truncate">
                      {lvl.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-400 hidden sm:inline">
                    {lvl.type}
                  </span>
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Level Expanded Content */}
              {isExpanded && (
                <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-150">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {lvl.description}
                  </p>

                  {/* Level 3 Specific Topics List */}
                  {lvl.level === 3 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                      {topics.map((t) => (
                        <div key={t.id} className="p-3 bg-white rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
                          <div className="truncate">
                            <span className="font-bold text-slate-900 block truncate">{t.title}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{t.term || 'Quarter 1'}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-black text-[9px] rounded-md shrink-0">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Level 4 ILAW DLP Details */}
                  {lvl.level === 4 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-black text-indigo-600 block uppercase">I - Intentions</span>
                        <span className="text-[11px] text-slate-600 font-bold">Goals & Success Criteria</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-black text-emerald-600 block uppercase">L - Learning</span>
                        <span className="text-[11px] text-slate-600 font-bold">Priming & Instruction</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-black text-amber-600 block uppercase">A - Assessing</span>
                        <span className="text-[11px] text-slate-600 font-bold">Formative & Diagnostics</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-black text-violet-600 block uppercase">W - Ways Forward</span>
                        <span className="text-[11px] text-slate-600 font-bold">Remediation & Enrichment</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
