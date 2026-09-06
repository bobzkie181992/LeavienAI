import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { LearningPathway, PathwayStep, Topic, Quiz, QuizResult, ItemResponse, isValidatedOrActive } from '../types';
import QuizEngine from './QuizEngine';

interface PathwayEngineProps {
  pathway: LearningPathway;
  topic: Topic;
  onUpdatePathway: (pathway: LearningPathway | null) => void;
  onClose: () => void;
  addXP: (amount: number) => void;
  saveResult: (result: Omit<QuizResult, 'timestamp'>) => void;
}

export default function PathwayEngine({ pathway, topic, onUpdatePathway, onClose, addXP, saveResult }: PathwayEngineProps) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const currentStep = pathway.steps[pathway.currentStepIndex];

  const markStepComplete = () => {
    addXP(10); // Reward for completing a step
    
    if (pathway.currentStepIndex >= pathway.steps.length - 1) {
      // Pathway is complete
      onUpdatePathway(null); // Or keep it and mark as fully completed
      onClose();
    } else {
      const newPathway = { ...pathway };
      newPathway.steps[pathway.currentStepIndex].isCompleted = true;
      newPathway.currentStepIndex += 1;
      onUpdatePathway(newPathway);
    }
  };

  const handleStartPractice = (difficultyLevel: 'easy' | 'medium' | 'hard' | 'mixed') => {
    let filteredProblems = [];
    const allTopicProblems = topic.quizzes
      .flatMap(q => q.problems)
      .filter(isValidatedOrActive);
    
    if (difficultyLevel === 'mixed') {
       filteredProblems = [...allTopicProblems].sort(() => 0.5 - Math.random()).slice(0, 5);
    } else {
       filteredProblems = allTopicProblems.filter(p => p.difficulty === difficultyLevel);
       if (filteredProblems.length === 0) {
          // Fallback if no problems of that difficulty exist
          filteredProblems = [...allTopicProblems].sort(() => 0.5 - Math.random());
       }
       filteredProblems = filteredProblems.slice(0, 3); // Shorter for practice
    }

    const practiceQuiz: Quiz = {
      id: `pathway-practice-${Date.now()}`,
      title: `${currentStep.title} - ${topic.title}`,
      description: 'Pathway practice session.',
      topicId: topic.id,
      problems: filteredProblems,
      xpReward: difficultyLevel === 'mixed' ? 100 : 50
    };

    setActiveQuiz(practiceQuiz);
  };

  const handleQuizComplete = (xp: number, score: number, total: number, itemResponses: ItemResponse[]) => {
    addXP(xp);
    if (activeQuiz) {
      saveResult({
        userId: 'current-user',
        quizId: activeQuiz.id,
        score,
        total,
        itemResponses
      });
    }
    setActiveQuiz(null);
    
    const percentage = (score / total) * 100;
    if (percentage >= 70) {
       // Passed the practice/assessment, move to next step
       markStepComplete();
    } else {
       alert(`You scored ${Math.round(percentage)}%. You need at least 70% to move to the next step. Try again!`);
    }
  };

  if (activeQuiz) {
    return (
      <QuizEngine 
        quiz={activeQuiz} 
        onClose={() => setActiveQuiz(null)}
        onComplete={handleQuizComplete}
      />
    );
  }

  const renderStepContent = (step: PathwayStep) => {
    switch (step.type) {
      case 'concept':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Review Concept: {topic.title}</h3>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 prose prose-slate">
              <p>Welcome to the first step of your personalized learning pathway. We noticed you needed a bit of a refresher on <strong>{topic.title}</strong>.</p>
              <p>Before we jump into practice, it's critical to ensure you understand the foundational rules of this topic. Take your time to review your notes, textbook, or class materials on this competency.</p>
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mt-4 flex gap-3 text-indigo-900">
                <Icons.Info className="w-6 h-6 shrink-0 text-indigo-600" />
                <p className="text-sm m-0">When you feel confident that you understand the core definitions, click continue.</p>
              </div>
            </div>
            <button onClick={markStepComplete} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              I've Reviewed the Concept
            </button>
          </div>
        );
      case 'lesson':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Mini Lesson</h3>
            <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden shadow-xl">
              <Icons.PlayCircle className="w-16 h-16 text-white/50 mb-4" />
              <p className="font-bold">Video Lesson Placeholder</p>
              <p className="text-sm text-slate-400">A short instructional video would play here.</p>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
            </div>
            <button onClick={markStepComplete} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Continue
            </button>
          </div>
        );
      case 'example':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Worked Example</h3>
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Example Problem</h4>
              <p className="text-lg text-slate-900 mb-6 italic">"This is where a step-by-step worked example from the item bank would be displayed, guiding the student through the logic without testing them."</p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">1</div>
                  <p className="text-slate-600 pt-1">First step of the solution process.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">2</div>
                  <p className="text-slate-600 pt-1">Second step of the solution process.</p>
                </div>
              </div>
            </div>
            <button onClick={markStepComplete} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              I Understand this Example
            </button>
          </div>
        );
      case 'practice_easy':
        return (
          <div className="space-y-6 text-center py-8">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Icons.Brain className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Easy Practice</h3>
             <p className="text-slate-500 max-w-md mx-auto">Time to test your knowledge with some straightforward application problems.</p>
             <button onClick={() => handleStartPractice('easy')} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4">
              Start Easy Practice
            </button>
          </div>
        );
      case 'practice_moderate':
        return (
          <div className="space-y-6 text-center py-8">
             <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Icons.Target className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Moderate Practice</h3>
             <p className="text-slate-500 max-w-md mx-auto">Let's turn up the difficulty. These questions require multiple steps.</p>
             <button onClick={() => handleStartPractice('medium')} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4">
              Start Moderate Practice
            </button>
          </div>
        );
      case 'practice_difficult':
        return (
          <div className="space-y-6 text-center py-8">
             <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Icons.Flame className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Difficult Practice</h3>
             <p className="text-slate-500 max-w-md mx-auto">The ultimate challenge. Complex problems with high discrimination parameters.</p>
             <button onClick={() => handleStartPractice('hard')} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4">
              Start Difficult Practice
            </button>
          </div>
        );
      case 'mastery':
        return (
           <div className="space-y-6 text-center py-8">
             <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Icons.Medal className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Mastery Assessment</h3>
             <p className="text-slate-500 max-w-md mx-auto">Prove you've mastered {topic.title} to complete this learning pathway.</p>
             <button onClick={() => handleStartPractice('mixed')} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4">
              Take Mastery Assessment
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar / Progress Tracker */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-medium mb-6 transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <Icons.Map className="w-5 h-5" />
            <span className="font-bold text-sm tracking-widest uppercase">Learning Pathway</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">{pathway.topicTitle}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
           <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-slate-100 -z-10" />
           {pathway.steps.map((step, idx) => {
             const isPast = idx < pathway.currentStepIndex;
             const isCurrent = idx === pathway.currentStepIndex;
             const isFuture = idx > pathway.currentStepIndex;
             
             let iconColor = 'bg-white text-slate-300 border-2 border-slate-200';
             if (isPast) iconColor = 'bg-emerald-500 text-white border-2 border-emerald-500';
             if (isCurrent) iconColor = 'bg-indigo-600 text-white border-2 border-indigo-600 shadow-md shadow-indigo-200';
             
             return (
               <div key={step.id} className={`flex items-start gap-4 ${isFuture ? 'opacity-50' : ''}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${iconColor}`}>
                   {isPast ? <Icons.Check className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                 </div>
                 <div>
                   <div className={`font-bold ${isCurrent ? 'text-indigo-900' : 'text-slate-700'}`}>{step.title}</div>
                   <div className="text-xs text-slate-400 mt-0.5 capitalize">{step.type.replace('_', ' ')}</div>
                 </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 relative">
        <header className="md:hidden bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 -ml-2 text-slate-400">
               <Icons.ArrowLeft className="w-5 h-5" />
             </button>
             <span className="font-bold text-slate-900">Pathway: {pathway.topicTitle}</span>
          </div>
          <div className="text-sm font-bold text-indigo-600">
            Step {pathway.currentStepIndex + 1} / {pathway.steps.length}
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center">
          <motion.div 
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
             {renderStepContent(currentStep)}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
