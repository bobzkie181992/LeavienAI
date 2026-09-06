import { useState } from 'react';
import { motion } from 'motion/react';
import { Topic, Quiz, isValidatedOrActive } from '../types';
import { ChevronLeft, Play, Star, Lock, Clock, Users, MessageSquare, FileText, BookOpen } from 'lucide-react';
import LessonPlanModal from './LessonPlanModal';

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
  onStartQuiz: (quiz: Quiz) => void;
  onInviteStudy?: (quiz?: Quiz) => void;
  onOpenChat?: (topicId: string, quizId?: string) => void;
}

export default function TopicDetail({ topic, onBack, onStartQuiz, onInviteStudy, onOpenChat }: TopicDetailProps) {
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

          {onInviteStudy && (
            <button
              id={`invite-study-topic-${topic.id}`}
              onClick={() => onInviteStudy()}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Invite a classmate to practice this topic"
            >
              <Users className="w-4 h-4" />
              <span>Study With Peer</span>
            </button>
          )}

          <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              {Math.floor(Math.random() * 50 + 50)}%
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Completion</div>
              <div className="text-sm font-bold text-indigo-700">Mastery Level</div>
            </div>
          </div>
        </div>
      </div>

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
              className={`bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group transition-all ${
                isAvailable ? 'hover:border-indigo-200' : 'opacity-75'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  isAvailable 
                    ? 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                    {!isAvailable && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">
                        Validation Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{quiz.description}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    {activeCount} {activeCount === 1 ? 'item' : 'items'} available
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reward</span>
                  <span className="text-sm font-bold text-amber-600">+{quiz.xpReward} XP</span>
                </div>
                {isAvailable ? (
                  <div className="flex items-center gap-2">
                    {onInviteStudy && (
                      <button
                        id={`invite-study-quiz-${quiz.id}`}
                        onClick={() => onInviteStudy(quiz)}
                        className="w-10 h-10 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                        title="Invite a classmate to study this quiz together"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      id={`start-quiz-button-${quiz.id}`}
                      onClick={() => onStartQuiz(quiz)}
                      className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg shadow-indigo-200"
                      title="Start Assessment"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  </div>
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
              <h3 className="font-bold text-slate-400 italic">Advanced Concept</h3>
              <p className="text-sm text-slate-400">Unlock by completing previous quizzes</p>
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
