import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  FileText, 
  Search, 
  Filter, 
  Zap, 
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  GraduationCap,
  Monitor
} from 'lucide-react';
import { Presentation, Topic, UserProfile } from '../types';
import { usePresentations } from '../hooks/useFirebase';
import PresentationViewer from './PresentationViewer';

interface StudentPresentationHubProps {
  topics: Topic[];
  profile: UserProfile;
  addXP: (amount: number) => void;
  onStartQuiz: (topicId: string, quizId?: string) => void;
  onStartDiagnostic: () => void;
}

export default function StudentPresentationHub({
  topics,
  profile,
  addXP,
  onStartQuiz,
  onStartDiagnostic
}: StudentPresentationHubProps) {
  const { presentations, loading, recordPresentationView } = usePresentations();
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All');

  // Filter presentations
  const filteredPresentations = presentations.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopicFilter === 'All' || p.topicId === selectedTopicFilter;
    return matchesSearch && matchesTopic;
  });

  const handleStartPresentation = (pres: Presentation) => {
    setSelectedPresentation(pres);

    // Record view start
    recordPresentationView({
      presentationId: pres.id,
      presentationTitle: pres.title,
      topicId: pres.topicId,
      topicTitle: pres.topicTitle,
      studentUid: profile.uid,
      studentName: profile.displayName || 'Student Hero',
      grade: profile.grade || 'Grade 11',
      section: profile.section || 'STEM-A',
      startedAt: new Date().toISOString(),
      slidesViewed: 1,
      totalSlides: pres.slides?.length || pres.totalSlides,
      isCompleted: false
    });
  };

  const handleCompletePresentation = (presId: string, slidesViewed: number, totalSlides: number) => {
    addXP(50); // Give student +50 XP for completing presentation

    const pres = presentations.find(p => p.id === presId) || selectedPresentation;
    if (pres) {
      recordPresentationView({
        presentationId: pres.id,
        presentationTitle: pres.title,
        topicId: pres.topicId,
        topicTitle: pres.topicTitle,
        studentUid: profile.uid,
        studentName: profile.displayName || 'Student Hero',
        grade: profile.grade || 'Grade 11',
        section: profile.section || 'STEM-A',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        slidesViewed,
        totalSlides,
        isCompleted: true
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-900/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Slide Modules & Assessments</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Curriculum Slide Decks & Quizzes
          </h2>
          <p className="text-xs md:text-sm text-indigo-100 font-normal leading-relaxed">
            Review comprehensive faculty slide decks complete with step-by-step mathematical derivations, audio narration, and interactive checkpoints. When finished, take the connected assessment to test your mastery!
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/20 to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search presentation decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="All">All Topics</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Earn +50 XP per completed deck</span>
        </div>
      </div>

      {/* Presentations Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading presentations...</p>
        </div>
      ) : filteredPresentations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No presentations available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery ? 'Try adjusting your search criteria.' : 'Faculty will publish presentation modules for your class soon.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresentations.map((presentation) => (
            <motion.div
              key={presentation.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Topic and Slide Count Tags */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {presentation.topicTitle}
                    </span>
                    {(presentation.embedUrl || presentation.powerpointUrl) && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 flex items-center gap-1">
                        <Monitor className="w-2.5 h-2.5" />
                        PPT
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {presentation.slides?.length || presentation.totalSlides} SLIDES
                  </span>
                </div>

                <h3 className="text-base md:text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {presentation.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-3 mt-2 font-normal leading-relaxed">
                  {presentation.description}
                </p>

                {/* Connected Assessment Callout */}
                <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl border border-indigo-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Suggested Assessment
                    </p>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {presentation.connectedQuizTitle || 'Topic Practice Quiz'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleStartPresentation(presentation)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Presentation</span>
                </button>

                <button
                  onClick={() => onStartQuiz(presentation.topicId, presentation.connectedQuizId)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  title="Direct to Quiz"
                >
                  <GraduationCap className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ACTIVE PRESENTATION PLAYER */}
      {selectedPresentation && (
        <PresentationViewer
          presentation={selectedPresentation}
          profile={profile}
          onClose={() => setSelectedPresentation(null)}
          onStartQuiz={(topicId, quizId) => {
            setSelectedPresentation(null);
            onStartQuiz(topicId, quizId);
          }}
          onStartDiagnostic={() => {
            setSelectedPresentation(null);
            onStartDiagnostic();
          }}
          onCompletePresentation={handleCompletePresentation}
        />
      )}
    </div>
  );
}
