import { useState } from 'react';
import { motion } from 'motion/react';
import { Topic, Quiz, isValidatedOrActive, SummativeAssessment } from '../types';
import { 
  ChevronLeft, 
  Play, 
  Star, 
  Lock, 
  Clock, 
  MessageSquare, 
  FileText, 
  Target, 
  Award,
  Lightbulb,
  Sparkles,
  GraduationCap,
  ListChecks,
  CheckCircle2
} from 'lucide-react';
import LessonPlanModal from './LessonPlanModal';

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
  onStartQuiz: (quiz: Quiz, mode?: 'diagnostic' | 'assessment') => void;
  onOpenChat?: (topicId: string, quizId?: string) => void;
  onStartSummativeAssessment?: (assessment: SummativeAssessment) => void;
  isSummativeCompleted?: boolean;
}

export default function TopicDetail({ 
  topic, 
  onBack, 
  onStartQuiz, 
  onOpenChat,
  onStartSummativeAssessment,
  isSummativeCompleted
}: TopicDetailProps) {
  const [showLessonPlan, setShowLessonPlan] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <button 
        id="back-to-topics-button"
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Topics</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{topic.title}</h2>
          <p className="text-slate-500 max-w-xl">{topic.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id={`lesson-plan-topic-${topic.id}`}
            onClick={() => setShowLessonPlan(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="View DepEd Lesson Plan & Study Guide"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lesson Plan & Study Guide</span>
          </button>
          {onOpenChat && (
            <button
              id={`chat-study-topic-${topic.id}`}
              onClick={() => onOpenChat(topic.id)}
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Chat with classmates about this topic"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Peer Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Summative Assessment (Aligned to Intended Learning Outcomes & DepEd Table of Specifications) */}
      {topic.summativeAssessment && onStartSummativeAssessment && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-lg border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-sm">
                  <Target className="w-3 h-3 text-slate-950" />
                  <span>Summative Assessment</span>
                </span>
                <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  DepEd Table of Specifications (TOS)
                </span>
                {isSummativeCompleted && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {topic.summativeAssessment.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {topic.summativeAssessment.description}
                </p>
              </div>

              {/* Competency outcomes pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 text-[11px] font-bold">Targeted Outcomes:</span>
                {topic.summativeAssessment.intendedOutcomes.map((ilo) => (
                  <span
                    key={ilo.id}
                    title={ilo.title}
                    className="font-mono text-[10px] font-bold bg-white/10 hover:bg-white/20 text-indigo-200 px-2 py-0.5 rounded-md transition-colors"
                  >
                    {ilo.code}
                  </span>
                ))}
              </div>

              {/* Assessment Meta Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <ListChecks className="w-4 h-4" />
                  {topic.summativeAssessment.problems.length} Assessment Items
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {topic.summativeAssessment.durationMinutes} Minutes
                </span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Award className="w-4 h-4" />
                  +{topic.summativeAssessment.xpReward} XP
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  Passing: {topic.summativeAssessment.passingScorePercentage}%
                </span>
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
              <button
                id={`start-summative-btn-${topic.id}`}
                onClick={() => onStartSummativeAssessment(topic.summativeAssessment!)}
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{isSummativeCompleted ? 'Retake Summative Exam' : 'Take Summative Assessment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formative Quizzes Section Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          <span>Formative Practice & Level Quizzes</span>
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Diagnostic (hints) and standard competency quizzes
        </span>
      </div>

      {/* Quiz List with Diagnostic (Hints & Learning) and Assessment (Competency) options */}
      <div className="grid gap-4">
        {topic.quizzes.map((quiz, index) => {
          const activeCount = quiz.problems.filter(isValidatedOrActive).length;
          const isAvailable = activeCount > 0;

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all ${
                isAvailable ? 'hover:border-indigo-200' : 'opacity-75'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                  isAvailable 
                    ? 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                    {!isAvailable && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                        Validation Pending
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      +{quiz.xpReward} XP
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{quiz.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="text-slate-400 font-medium">
                      {activeCount} {activeCount === 1 ? 'item' : 'items'} available
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" /> Hints in Diagnostic
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-700 font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3 text-indigo-500" /> Advance in Assessment
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 justify-end">
                {isAvailable ? (
                  <>
                    {/* Diagnostic Mode Button (Learn with Hints) */}
                    <button 
                      id={`start-diagnostic-quiz-${quiz.id}`}
                      onClick={() => onStartQuiz(quiz, 'diagnostic')}
                      className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
                      title="Diagnostic Quiz: Learn with progressive hints until you get the answer"
                    >
                      <Target className="w-4 h-4 text-amber-600" />
                      <span>Diagnostic (Hints)</span>
                    </button>

                    {/* Assessment Mode Button (Prove Competency & Proceed to Next Level) */}
                    <button 
                      id={`start-assessment-quiz-${quiz.id}`}
                      onClick={() => onStartQuiz(quiz, 'assessment')}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow-md shadow-indigo-200 active:scale-95"
                      title="Assessment Quiz: Test competency to proceed to the next level quiz"
                    >
                      <Award className="w-4 h-4" />
                      <span>Assessment (Test)</span>
                    </button>
                  </>
                ) : (
                  <div 
                    className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center cursor-not-allowed"
                    title="Awaiting validated items"
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Locked Placeholder */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-dashed border-slate-200 flex items-center justify-between opacity-60 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-400 italic">Next Level Progression Challenge</h3>
              <p className="text-sm text-slate-400">Pass the Assessment Quiz with 75%+ score to unlock the next level</p>
            </div>
          </div>
        </div>
      </div>

      {showLessonPlan && (
        <LessonPlanModal
          topic={topic}
          isFaculty={false}
          onClose={() => setShowLessonPlan(false)}
        />
      )}
    </motion.div>
  );
}
