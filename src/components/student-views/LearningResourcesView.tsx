import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FolderOpen, 
  Layers, 
  FileSpreadsheet, 
  Video, 
  BookOpen, 
  Sparkles, 
  Download, 
  Zap, 
  ExternalLink,
  Sigma,
  Search,
  BookMarked
} from 'lucide-react';
import { Topic, UserProfile } from '../../types';
import StudentPresentationHub from '../StudentPresentationHub';
import InteractiveFlashcards from '../InteractiveFlashcards';
import ExplainerLibrary from '../ExplainerLibrary';

interface LearningResourcesViewProps {
  topics: Topic[];
  profile: UserProfile;
  results: any[];
  initialTab?: 'modules' | 'worksheets' | 'videos' | 'references';
  addXP: (amount: number) => void;
  onStartQuizFromPresentation: (topicId: string, quizId?: string) => void;
  onStartDiagnostic?: () => void;
  onOpenFormulaHub: () => void;
}

export default function LearningResourcesView({
  topics,
  profile,
  results,
  initialTab = 'modules',
  addXP,
  onStartQuizFromPresentation,
  onStartDiagnostic,
  onOpenFormulaHub
}: LearningResourcesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'modules' | 'worksheets' | 'videos' | 'references'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample downloadable review worksheets / formula cheatsheets
  const reviewWorksheets = [
    {
      title: 'Rational Functions & Asymptotes Mastery Worksheet',
      grade: 'Grade 11 Gen Math',
      problemsCount: 15,
      topic: 'Functions & Graphs',
      type: 'Problem Set with Step-by-Step Solutions',
      downloadUrl: '#'
    },
    {
      title: 'Simple & Compound Interest Real-World Financial Math Sheet',
      grade: 'Grade 11 Gen Math',
      problemsCount: 12,
      topic: 'Business Mathematics',
      type: 'Guided Case Study & Amortization',
      downloadUrl: '#'
    },
    {
      title: 'Trigonometric Identities & Unit Circle Reference Handout',
      grade: 'Grade 11 Gen Math',
      problemsCount: 20,
      topic: 'Trigonometry',
      type: 'Formula Cheat Sheet & Proof Exercises',
      downloadUrl: '#'
    },
    {
      title: 'Propositional Logic & Truth Table Verification Worksheet',
      grade: 'Grade 11 Gen Math',
      problemsCount: 10,
      topic: 'Logic & Reasoning',
      type: 'Formal Truth Table Grid',
      downloadUrl: '#'
    }
  ];

  const filteredWorksheets = reviewWorksheets.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-sky-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-sky-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              <span>Resource Repository</span>
            </span>
            <span className="bg-white/10 text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Grade 11 Study Materials
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Learning Resources & Media</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Access teacher slide decks, flashcard drill sets, curated video lectures, and DepEd formula references.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'modules'
              ? 'bg-white text-indigo-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Modules & Slide Decks</span>
        </button>

        <button
          onClick={() => setActiveSubTab('worksheets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'worksheets'
              ? 'bg-white text-sky-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-sky-500" />
          <span>Worksheets & Flashcards</span>
        </button>

        <button
          onClick={() => setActiveSubTab('videos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'videos'
              ? 'bg-white text-rose-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Video className="w-4 h-4 text-rose-500" />
          <span>Explainer Videos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('references')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'references'
              ? 'bg-white text-amber-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>Formula References</span>
        </button>
      </div>

      {/* 1. MODULES & SLIDE DECKS */}
      {activeSubTab === 'modules' && (
        <div>
          <StudentPresentationHub
            topics={topics}
            profile={profile}
            addXP={addXP}
            onStartQuiz={onStartQuizFromPresentation}
            onStartDiagnostic={onStartDiagnostic || (() => {})}
          />
        </div>
      )}

      {/* 2. WORKSHEETS & FLASHCARDS */}
      {activeSubTab === 'worksheets' && (
        <div className="space-y-6">
          {/* Flashcards Interactive Drill */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h3 className="text-base font-black text-slate-900">Interactive Formula & Theorem Flashcards</h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Adaptive Spaced Repetition
              </span>
            </div>
            <InteractiveFlashcards profile={profile} onRewardXP={addXP} />
          </div>

          {/* Downloadable Printable Worksheets */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Printable Study Worksheets & Handouts</h3>
                <p className="text-xs text-slate-400">Curated offline problem sets aligned with the DepEd curriculum</p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search handouts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {filteredWorksheets.map((ws, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all flex flex-col justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      {ws.topic}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{ws.title}</h4>
                    <p className="text-[11px] text-slate-500">{ws.type} • {ws.problemsCount} Practice Items</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400">{ws.grade}</span>
                    <button
                      onClick={() => alert(`Opening ${ws.title} review sheet.`)}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Review Sheet</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. VIDEOS */}
      {activeSubTab === 'videos' && (
        <div>
          <ExplainerLibrary
            topics={topics}
            results={results}
            profile={profile}
          />
        </div>
      )}

      {/* 4. REFERENCES & FORMULAS */}
      {activeSubTab === 'references' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-center py-10">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Sigma className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-black text-slate-900">Interactive Formula & Theorem Hub</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore 50+ Grade 11 formulas across Functions, Financial Math, Trigonometry, Statistics, and Logic with live calculators and AI explanations.
            </p>
          </div>
          <button
            onClick={onOpenFormulaHub}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl text-xs transition-all shadow-md shadow-amber-100 cursor-pointer inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Launch Formula Hub</span>
          </button>
        </div>
      )}
    </div>
  );
}
