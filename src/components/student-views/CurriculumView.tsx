import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Layers, 
  Compass, 
  GraduationCap, 
  Sigma, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  Award,
  ChevronRight,
  BookMarked,
  ShieldCheck,
  Zap,
  ListTree
} from 'lucide-react';
import { Topic, QuizResult, UserProfile } from '../../types';
import { ILAW_LESSON_PLANS } from '../../data/ilawLessons';
import { GRADE_11_SUBJECTS } from '../../data/grade11SampleData';
import { SubjectCard } from '../ui/SubjectCard';
import CurriculumHierarchyBrowser from '../CurriculumHierarchyBrowser';

interface CurriculumViewProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  initialTab?: 'hierarchy' | 'overview' | 'ilaw' | 'subjects' | 'competencies';
  onSelectTopic: (topic: Topic) => void;
  onOpenTopicDLP: (topic: Topic) => void;
  onStartCompetencyPractice?: (competencyName: string) => void;
  onSaveQuizResult?: (result: Omit<QuizResult, 'timestamp'>) => void;
  onAddXP?: (amount: number) => void;
}

export default function CurriculumView({
  topics,
  results,
  profile,
  initialTab = 'hierarchy',
  onSelectTopic,
  onOpenTopicDLP,
  onStartCompetencyPractice,
  onSaveQuizResult,
  onAddXP
}: CurriculumViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'hierarchy' | 'overview' | 'ilaw' | 'subjects' | 'competencies'>(initialTab);
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>('all');

  // Filter topics by term if selected
  const filteredTopics = topics.filter(t => {
    if (selectedTermFilter === 'all') return true;
    return (t.term || '').toLowerCase().includes(selectedTermFilter.toLowerCase());
  });

  // Calculate mastery per topic
  const getTopicStats = (topic: Topic) => {
    let earned = 0;
    let total = 0;
    let completedCount = 0;
    topic.quizzes.forEach(q => {
      total += q.problems.length;
      const matchingResults = results.filter(r => r.quizId === q.id);
      if (matchingResults.length > 0) {
        const best = Math.max(...matchingResults.map(r => r.score));
        earned += best;
        completedCount++;
      }
    });
    const percent = total > 0 ? Math.round((earned / total) * 100) : 0;
    return { earned, total, percent, completedCount, totalQuizzes: topic.quizzes.length };
  };

  // Grade 11 Core Subjects definition
  const grade11Subjects = [
    {
      code: 'GEN-MATH-11',
      title: 'General Mathematics',
      status: 'Active Subject',
      teacher: 'Faculty / Subject Teacher',
      units: '12 Comprehensive Units',
      description: 'Functions and graphs, business mathematics (simple & compound interest, annuities), and formal propositional logic.',
      color: 'from-indigo-600 to-violet-600',
      isCurrent: true
    },
    {
      code: 'STAT-PROB-11',
      title: 'Statistics & Probability',
      status: 'Core Semester 2',
      teacher: 'Faculty / Subject Teacher',
      units: '8 Modules',
      description: 'Random variables, discrete & continuous probability distributions, normal curve parameters, sampling, and hypothesis testing.',
      color: 'from-emerald-600 to-teal-600',
      isCurrent: false
    },
    {
      code: 'PRE-CALC-11',
      title: 'Pre-Calculus (STEM Track)',
      status: 'Elective Track',
      teacher: 'STEM Faculty',
      units: '10 Modules',
      description: 'Conic sections (parabola, ellipse, hyperbola), systems of nonlinear equations, series, and circular trigonometric functions.',
      color: 'from-purple-600 to-indigo-600',
      isCurrent: false
    },
    {
      code: 'BASIC-CALC-11',
      title: 'Basic Calculus (STEM Track)',
      status: 'Senior Track',
      teacher: 'STEM Faculty',
      units: '9 Modules',
      description: 'Limits and continuity, derivatives of algebraic and transcendental functions, and real-world optimization problems.',
      color: 'from-blue-600 to-cyan-600',
      isCurrent: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>DepEd Curriculum Portal</span>
            </span>
            <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Grade 11 Senior High School
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Curriculum & ILAW Matrix</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Explore the official DepEd Grade 11 Mathematics curriculum structured under the D.O. 016 ILAW Framework (Intentions, Learning Experience, Assessing Learning, Ways Forward).
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'hierarchy', label: '8-Level Hierarchy Explorer', icon: <ListTree className="w-4 h-4 text-amber-500" /> },
          { id: 'overview', label: 'Curriculum Overview', icon: <Layers className="w-4 h-4" /> },
          { id: 'ilaw', label: 'DepEd ILAW Lessons', icon: <Compass className="w-4 h-4 text-amber-500" /> },
          { id: 'subjects', label: 'My Subjects', icon: <GraduationCap className="w-4 h-4 text-indigo-500" /> },
          { id: 'competencies', label: 'Learning Competencies (MELCs)', icon: <Sigma className="w-4 h-4 text-emerald-500" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === tab.id
                ? 'bg-white text-indigo-900 shadow-sm font-extrabold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 0. 8-LEVEL CURRICULUM HIERARCHY EXPLORER */}
      {activeSubTab === 'hierarchy' && (
        <CurriculumHierarchyBrowser
          topics={topics}
          results={results}
          profile={profile}
          onSaveQuizResult={onSaveQuizResult}
          onAddXP={onAddXP}
          onOpenTopicDLP={onOpenTopicDLP}
        />
      )}

      {/* 1. CURRICULUM OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Term Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Filter by Academic Term:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All Terms (12 Units)' },
                { id: 'term 1', label: 'Term 1 (Foundations)' },
                { id: 'term 2', label: 'Term 2 (Trig & Stats)' },
                { id: 'term 3', label: 'Term 3 (Business Math)' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTermFilter(tf.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTermFilter === tf.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic, index) => {
              const stats = getTopicStats(topic);
              const plan = topic.lessonPlan?.ilaw ? topic.lessonPlan : (ILAW_LESSON_PLANS[topic.id] || topic.lessonPlan);

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md">
                        {topic.term || 'Term 1'} • {topic.week || `Unit ${index + 1}`}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        stats.percent >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        stats.percent >= 50 ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {stats.percent}% Mastered
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{stats.completedCount} of {stats.totalQuizzes} Practice Quizzes</span>
                        <span>{stats.percent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => onSelectTopic(topic)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Lesson Guide</span>
                    </button>

                    <button
                      onClick={() => onOpenTopicDLP(topic)}
                      className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="Open Full DepEd D.O. 016 Lesson Plan Matrix"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>DLP Matrix</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DEPED ILAW LESSONS MATRIX */}
      {activeSubTab === 'ilaw' && (
        <div className="space-y-5">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                DepEd Order No. 016 s. 2026 Pedagogical Structure
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Every lesson features 4 synchronized pillars: <strong>I</strong>ntentions (MELCs), <strong>L</strong>earning Experience (Priming & Formulas), <strong>A</strong>ssessing Learning (Quick checks & Tests), and <strong>W</strong>ays Forward (Careers & Remediation).
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {topics.map((topic, idx) => {
              const ilawPlan = ILAW_LESSON_PLANS[topic.id] || topic.lessonPlan;
              const ilawData = ilawPlan?.ilaw;

              return (
                <div 
                  key={topic.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:border-amber-200 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {topic.term} • {topic.week}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">{topic.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectTopic(topic)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Interactive Lesson Guide</span>
                      </button>
                      <button
                        onClick={() => onOpenTopicDLP(topic)}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>DLP Matrix</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Pillars Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Pillar I */}
                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-1">
                      <span className="font-extrabold text-amber-900 flex items-center gap-1 text-[11px]">
                        <Target className="w-3 h-3" />
                        <span>I • Intentions</span>
                      </span>
                      <p className="text-slate-700 text-[11px] line-clamp-3">
                        {ilawData?.intentions.learningIntentions || topic.description}
                      </p>
                    </div>

                    {/* Pillar L */}
                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                      <span className="font-extrabold text-indigo-900 flex items-center gap-1 text-[11px]">
                        <BookOpen className="w-3 h-3" />
                        <span>L • Experience</span>
                      </span>
                      <p className="text-slate-700 text-[11px] line-clamp-3">
                        {ilawData?.learningExperience.primingActivity || 'Real-world mathematical modeling & worked steps.'}
                      </p>
                    </div>

                    {/* Pillar A */}
                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                      <span className="font-extrabold text-emerald-900 flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>A • Assessment</span>
                      </span>
                      <p className="text-slate-700 text-[11px] line-clamp-3">
                        {ilawData?.assessingLearning.formativeAssessment || 'Formative quizzes & 75%-80% passing benchmark.'}
                      </p>
                    </div>

                    {/* Pillar W */}
                    <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1">
                      <span className="font-extrabold text-purple-900 flex items-center gap-1 text-[11px]">
                        <GraduationCap className="w-3 h-3" />
                        <span>W • Ways Forward</span>
                      </span>
                      <p className="text-slate-700 text-[11px] line-clamp-3">
                        {ilawData?.waysForward.realWorldCareers ? ilawData.waysForward.realWorldCareers.slice(0, 2).join(', ') : 'Engineering & Finance pathways.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MY SUBJECTS */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Department of Education • Senior High School
            </span>
            <h2 className="text-xl font-black">Grade 11 Curriculum Subjects</h2>
            <p className="text-xs text-slate-300">
              Enrolled Core & Applied subjects for Grade 11 SHS students (STEM, ABM, HUMSS, TVL-ICT tracks).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GRADE_11_SUBJECTS.map((sub) => (
              <SubjectCard
                key={sub.id}
                title={sub.title}
                code={sub.code}
                description={sub.description}
                topicCount={sub.unitCount}
                completedCount={sub.completedUnits}
                progressPercent={sub.masteryPercent}
                colorTheme={sub.color === 'emerald' ? 'emerald' : sub.color === 'amber' ? 'amber' : 'indigo'}
                onClick={() => setActiveSubTab('overview')}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. LEARNING COMPETENCIES (MELCs) */}
      {activeSubTab === 'competencies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Most Essential Learning Competencies (MELCs)</h3>
                <p className="text-xs text-slate-400">DepEd Senior High School General Mathematics standard competency roster</p>
              </div>
            </div>

            <div className="grid gap-2.5 pt-2">
              {topics.flatMap(t => {
                const ilaw = ILAW_LESSON_PLANS[t.id]?.ilaw || t.lessonPlan?.ilaw;
                const comps = ilaw?.intentions.competencies || t.lessonPlan?.learningCompetencies || [t.title];
                return comps.map(c => ({ competency: c, topic: t }));
              }).map((item, cIdx) => (
                <div 
                  key={cIdx}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {cIdx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.topic.title}
                      </span>
                      <p className="font-bold text-slate-900 leading-snug">{item.competency}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onStartCompetencyPractice) {
                        onStartCompetencyPractice(item.competency);
                      } else {
                        onSelectTopic(item.topic);
                      }
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold rounded-xl border border-indigo-200 text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Practice</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
