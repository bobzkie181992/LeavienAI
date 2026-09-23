import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckSquare, 
  ListTodo, 
  Zap, 
  ShieldCheck, 
  Play, 
  Clock, 
  Award, 
  Flame, 
  CheckCircle2, 
  RotateCcw, 
  Star, 
  Target,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Topic, QuizResult, UserProfile, Quiz, LearningPathway } from '../../types';

interface ActivitiesViewProps {
  topics: Topic[];
  results: QuizResult[];
  profile: UserProfile;
  initialTab?: 'todo' | 'in-progress' | 'completed';
  onStartQuiz: (quiz: Quiz, mode?: 'diagnostic' | 'assessment') => void;
  onStartPathway?: () => void;
  onStartChallenge?: () => void;
  onRetakeDiagnostic?: () => void;
  onSelectTopic: (topic: Topic) => void;
}

export default function ActivitiesView({
  topics,
  results,
  profile,
  initialTab = 'todo',
  onStartQuiz,
  onStartPathway,
  onStartChallenge,
  onRetakeDiagnostic,
  onSelectTopic
}: ActivitiesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'todo' | 'in-progress' | 'completed'>(initialTab);

  // Derive completed quiz IDs
  const completedQuizIds = new Set(results.map(r => r.quizId));

  // Compute To-Do items
  const todoQuizzes: { quiz: Quiz; topic: Topic }[] = [];
  const inProgressQuizzes: { quiz: Quiz; topic: Topic; bestScore: number; total: number }[] = [];

  topics.forEach(topic => {
    topic.quizzes.forEach(quiz => {
      const matchingResults = results.filter(r => r.quizId === quiz.id);
      if (matchingResults.length === 0) {
        todoQuizzes.push({ quiz, topic });
      } else {
        const best = Math.max(...matchingResults.map(r => r.score));
        const total = matchingResults[0]?.total || 5;
        const percent = total > 0 ? (best / total) * 100 : 0;
        if (percent < 80) {
          inProgressQuizzes.push({ quiz, topic, bestScore: best, total });
        }
      }
    });
  });

  // Recent completed activities sorted newest first
  const completedList = [...results]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              <span>Student Activity Center</span>
            </span>
            <span className="bg-white/10 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Tasks & Quests
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Activities & Assignments</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Track your tasks across To Do, In Progress, and Completed milestones. Stay consistent to maintain your streak and maximize your Grade 11 math mastery.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('todo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'todo'
              ? 'bg-white text-emerald-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListTodo className="w-4 h-4 text-amber-500" />
          <span>To Do</span>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black">
            {todoQuizzes.length + (!profile.diagnosticCompleted ? 1 : 0)}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('in-progress')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'in-progress'
              ? 'bg-white text-indigo-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-indigo-500" />
          <span>In Progress</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black">
            {inProgressQuizzes.length + (profile.activePathway ? 1 : 0)}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeSubTab === 'completed'
              ? 'bg-white text-emerald-900 shadow-sm font-extrabold border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Completed Archive</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black">
            {completedList.length}
          </span>
        </button>
      </div>

      {/* 1. TO DO TAB */}
      {activeSubTab === 'todo' && (
        <div className="space-y-4">
          {/* Priority Callouts */}
          {!profile.diagnosticCompleted && onRetakeDiagnostic && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  High Priority
                </span>
                <h3 className="text-base font-black">Initial Diagnostic Assessment</h3>
                <p className="text-xs text-amber-100">
                  Calibrate your math ability baseline and unlock personalized 7-step learning pathways.
                </p>
              </div>
              <button
                onClick={onRetakeDiagnostic}
                className="px-5 py-2.5 bg-white text-amber-900 font-bold rounded-xl text-xs hover:bg-amber-50 transition-all shrink-0 cursor-pointer shadow"
              >
                Start Diagnostic
              </button>
            </div>
          )}

          {/* Daily Challenge Card */}
          {onStartChallenge && (
            <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-5 rounded-3xl shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Flame className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">Daily Mixed Math Challenge</h3>
                    <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.2 rounded-md">
                      +200 XP
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200">5 quick multi-topic problems to extend your {profile.streak}-day streak.</p>
                </div>
              </div>
              <button
                onClick={onStartChallenge}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0"
              >
                Launch Challenge
              </button>
            </div>
          )}

          {/* Unattempted Quizzes Roster */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Pending Unit Quizzes ({todoQuizzes.length})
            </h3>

            {todoQuizzes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900">All Quizzes Attempted!</h4>
                <p className="text-xs text-slate-500">Check the In Progress tab to perfect your scores to 80%+ mastery.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {todoQuizzes.map(({ quiz, topic }) => (
                  <div
                    key={quiz.id}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        {topic.title}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{quiz.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{quiz.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                      <span className="text-amber-600 font-bold">+{quiz.xpReward} XP</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onStartQuiz(quiz, 'diagnostic')}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Hints Mode
                        </button>
                        <button
                          onClick={() => onStartQuiz(quiz, 'assessment')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Test Mode
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. IN PROGRESS TAB */}
      {activeSubTab === 'in-progress' && (
        <div className="space-y-4">
          {/* Active 7-Step Pathway */}
          {profile.activePathway && onStartPathway && (
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 rounded-3xl shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                  Step {profile.activePathway.currentStepIndex + 1} of {profile.activePathway.steps.length}
                </span>
                <span className="text-xs font-bold text-violet-200">Adaptive Learning Pathway</span>
              </div>
              <h3 className="text-lg font-black">{profile.activePathway.competencyName || profile.activePathway.topicTitle}</h3>
              <p className="text-xs text-violet-100">
                {profile.activePathway.steps[profile.activePathway.currentStepIndex]?.title || 'Continue your targeted competency progression.'}
              </p>
              <button
                onClick={onStartPathway}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-violet-900 font-black text-xs rounded-xl hover:bg-violet-50 transition-all cursor-pointer shadow"
              >
                Resume 7-Step Pathway
              </button>
            </div>
          )}

          {/* Quizzes with <80% score needing mastery */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Quizzes in Progress (Below 80% Benchmark) ({inProgressQuizzes.length})
            </h3>

            {inProgressQuizzes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900">No Quizzes Need Remediation!</h4>
                <p className="text-xs text-slate-500">All your attempted quizzes meet or exceed the 80% mastery threshold.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inProgressQuizzes.map(({ quiz, topic, bestScore, total }) => {
                  const percent = Math.round((bestScore / total) * 100);
                  return (
                    <div
                      key={quiz.id}
                      className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{topic.title}</span>
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            {bestScore}/{total} ({percent}%)
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{quiz.title}</h4>
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                        <button
                          onClick={() => onStartQuiz(quiz, 'diagnostic')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Review with Hints
                        </button>
                        <button
                          onClick={() => onStartQuiz(quiz, 'assessment')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                        >
                          Retake Assessment
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. COMPLETED ARCHIVE TAB */}
      {activeSubTab === 'completed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Attempt History ({completedList.length} Sessions)
            </h3>
          </div>

          {completedList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900">No Completed Activities Yet</h4>
              <p className="text-xs text-slate-500">Take your first quiz in the To Do tab to start building your record!</p>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {completedList.map((res, rIdx) => {
                const percent = Math.round((res.score / res.total) * 100);
                const isMastered = percent >= 80;

                return (
                  <div
                    key={rIdx}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isMastered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isMastered ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {res.quizId.replace('custom-', '').replace('adaptive-', 'Adaptive: ')}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(res.timestamp).toLocaleDateString()} at {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-black text-slate-900 text-sm block">
                          {res.score}/{res.total} ({percent}%)
                        </span>
                        <span className={`text-[10px] font-bold ${isMastered ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isMastered ? 'Mastered' : 'Reviewed'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
