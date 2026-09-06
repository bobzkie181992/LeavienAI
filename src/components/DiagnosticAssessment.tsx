import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Topic, Problem, LearningPathway, isValidatedOrActive } from '../types';
import * as Icons from 'lucide-react';

interface DiagnosticAssessmentProps {
  topics: Topic[];
  onComplete: (ability: string, scores: Record<string, number>, pathway?: LearningPathway) => void;
}

export default function DiagnosticAssessment({ topics, onComplete }: DiagnosticAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Generate diagnostic quiz on mount (ONLY VALIDATED or ACTIVE problems)
  const diagnosticProblems = useMemo(() => {
    const problems: (Problem & { topicId: string; topicTitle: string })[] = [];
    topics.forEach(topic => {
      // Get all VALIDATED or ACTIVE problems for this topic
      const activeProblems = topic.quizzes
        .flatMap(q => q.problems)
        .filter(isValidatedOrActive);
      // Randomly select up to 2 problems per topic
      const shuffled = [...activeProblems].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 2);
      selected.forEach(p => {
        problems.push({ ...p, topicId: topic.id, topicTitle: topic.title });
      });
    });
    return problems.sort(() => 0.5 - Math.random());
  }, [topics]);

  if (diagnosticProblems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Icons.AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Curriculum Found</h2>
        <p className="text-slate-500">The diagnostic assessment requires faculty to add curriculum topics and quizzes first.</p>
      </div>
    );
  }

  const problem = diagnosticProblems[currentStep];

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === problem.correctAnswer;
    setAnswers(prev => ({
      ...prev,
      [problem.id]: isCorrect
    }));

    if (currentStep < diagnosticProblems.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedOption(null);
    } else {
      setShowSummary(true);
    }
  };

  if (showSummary) {
    // Calculate mastery per topic
    const topicScores: Record<string, { correct: number, total: number }> = {};
    diagnosticProblems.forEach(p => {
      if (!topicScores[p.topicId]) {
        topicScores[p.topicId] = { correct: 0, total: 0 };
      }
      topicScores[p.topicId].total += 1;
      if (answers[p.id]) {
        topicScores[p.topicId].correct += 1;
      }
    });

    const finalScores: Record<string, number> = {};
    let totalCorrect = 0;
    let totalQuestions = 0;

    Object.keys(topicScores).forEach(topicId => {
      const stats = topicScores[topicId];
      finalScores[topicId] = Math.round((stats.correct / stats.total) * 100);
      totalCorrect += stats.correct;
      totalQuestions += stats.total;
    });

    const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100);
    
    let ability = 'Novice';
    if (overallPercentage >= 90) ability = 'Expert';
    else if (overallPercentage >= 75) ability = 'Advanced';
    else if (overallPercentage >= 55) ability = 'Proficient';
    else if (overallPercentage >= 35) ability = 'Developing';

    // Identify weakest topic for pathway generation
    let weakestTopicId = '';
    let lowestScore = 101;

    Object.entries(finalScores).forEach(([tId, score]) => {
      if (score < lowestScore) {
        lowestScore = score;
        weakestTopicId = tId;
      }
    });

    let generatedPathway: LearningPathway | undefined;
    if (weakestTopicId && lowestScore < 80) {
      const weakTopic = topics.find(t => t.id === weakestTopicId);
      if (weakTopic) {
        generatedPathway = {
          topicId: weakTopic.id,
          topicTitle: weakTopic.title,
          currentStepIndex: 0,
          steps: [
            { id: 's1', type: 'concept', title: 'Review Concept', isCompleted: false },
            { id: 's2', type: 'lesson', title: 'Mini Lesson', isCompleted: false },
            { id: 's3', type: 'example', title: 'Worked Example', isCompleted: false },
            { id: 's4', type: 'practice_easy', title: 'Easy Practice', isCompleted: false },
            { id: 's5', type: 'practice_moderate', title: 'Moderate Practice', isCompleted: false },
            { id: 's6', type: 'practice_difficult', title: 'Difficult Practice', isCompleted: false },
            { id: 's7', type: 'mastery', title: 'Mastery Assessment', isCompleted: false },
          ]
        };
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto py-12 px-6"
      >
        <div className="bg-white rounded-[30px] p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.LineChart className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Diagnostic Complete</h2>
            <p className="text-slate-500">We've analyzed your responses to build your personalized learning path.</p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 mb-8 text-center border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Mathematics Ability</h3>
            <div className={`text-4xl font-black ${
              ability === 'Expert' ? 'text-violet-600' :
              ability === 'Advanced' ? 'text-emerald-500' :
              ability === 'Proficient' ? 'text-blue-500' :
              ability === 'Developing' ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {ability}
            </div>
            <div className="text-slate-500 mt-2 font-medium">Overall Score: {overallPercentage}%</div>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Competency Breakdown</h3>
            {topics.map(topic => {
              if (finalScores[topic.id] === undefined) return null;
              const percentage = finalScores[topic.id];
              let status = 'Novice';
              let color = 'bg-rose-500';
              
              if (percentage >= 90) { status = 'Expert'; color = 'bg-violet-600'; }
              else if (percentage >= 75) { status = 'Advanced'; color = 'bg-emerald-500'; }
              else if (percentage >= 55) { status = 'Proficient'; color = 'bg-blue-500'; }
              else if (percentage >= 35) { status = 'Developing'; color = 'bg-amber-500'; }

              return (
                <div key={topic.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{topic.title}</div>
                  </div>
                  <div className="w-full md:w-64 flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="w-32 text-right">
                      <span className="font-bold text-slate-900">{percentage}%</span>
                      <span className="text-xs text-slate-500 ml-2">— {status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onComplete(ability, finalScores, generatedPathway)}
            className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
          >
            Start Learning
          </button>
        </div>
      </motion.div>
    );
  }

  const progress = (currentStep / diagnosticProblems.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
      <div className="px-6 py-4 bg-white border-b border-slate-100 shadow-sm z-10 flex items-center justify-between">
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Icons.ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <Icons.Target className="w-5 h-5 text-indigo-600" />
          Diagnostic Assessment
        </div>
        <div className="flex-1 max-w-md mx-8">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <div className="text-sm font-bold text-slate-400">
          {currentStep + 1} / {diagnosticProblems.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                {problem.question}
              </h2>
            </div>

            <div className="grid gap-4">
              {problem.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`
                    w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between
                    ${selectedOption === index 
                      ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50' 
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                    }
                  `}
                >
                  <span className="font-semibold text-lg">{option}</span>
                  {selectedOption === index && <Icons.CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-100 z-10">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              selectedOption === null 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
            }`}
          >
            {currentStep < diagnosticProblems.length - 1 ? 'Next Question' : 'Submit Assessment'}
            <Icons.ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
