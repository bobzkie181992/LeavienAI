import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { 
  LearningPathway, 
  PathwayStep, 
  Topic, 
  Quiz, 
  Problem,
  QuizResult, 
  ItemResponse, 
  UserProfile,
  isValidatedOrActive 
} from '../types';
import QuizEngine from './QuizEngine';
import { 
  getCompetencyDetail, 
  generateLearningPathway, 
  findNextCompetencyToStudy 
} from '../utils/pathwayGenerator';

interface PathwayEngineProps {
  pathway: LearningPathway;
  topic: Topic;
  allTopics: Topic[];
  profile?: UserProfile;
  onUpdatePathway: (pathway: LearningPathway | null) => void;
  onClose: () => void;
  addXP: (amount: number) => void;
  saveResult: (result: Omit<QuizResult, 'timestamp'>) => void;
}

export default function PathwayEngine({ 
  pathway, 
  topic, 
  allTopics, 
  profile,
  onUpdatePathway, 
  onClose, 
  addXP, 
  saveResult 
}: PathwayEngineProps) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeQuizStepIndex, setActiveQuizStepIndex] = useState<number | null>(null);
  
  // Interactive mini-lesson checkpoint state
  const [selectedCheckpointOption, setSelectedCheckpointOption] = useState<number | null>(null);
  const [hasSubmittedCheckpoint, setHasSubmittedCheckpoint] = useState<boolean>(false);

  // Mastery completion state
  const [masteryResult, setMasteryResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    nextCompetency?: {
      nextCompetencyName: string;
      nextCompetencyId: string;
      topicId: string;
      reason: string;
    };
  } | null>(null);

  const competencyTarget = pathway.competencyName || pathway.topicTitle;
  const detail = useMemo(() => {
    return getCompetencyDetail(competencyTarget, allTopics);
  }, [competencyTarget, allTopics]);

  const currentStep = pathway.steps[pathway.currentStepIndex] || pathway.steps[0];

  // Advance step inside the current pathway
  const markStepComplete = (customScore?: number) => {
    addXP(25); // Reward for completing a step
    
    const updatedSteps = pathway.steps.map((step, idx) => {
      if (idx === pathway.currentStepIndex) {
        return { ...step, isCompleted: true, score: customScore };
      }
      return step;
    });

    if (pathway.currentStepIndex >= pathway.steps.length - 1) {
      // Step 7 complete - already handled by mastery completion screen
    } else {
      const nextIndex = pathway.currentStepIndex + 1;
      const newPathway: LearningPathway = {
        ...pathway,
        currentStepIndex: nextIndex,
        steps: updatedSteps
      };
      onUpdatePathway(newPathway);
      // Reset checkpoint states for next steps
      setSelectedCheckpointOption(null);
      setHasSubmittedCheckpoint(false);
    }
  };

  // Jump to specific step
  const handleJumpToStep = (index: number) => {
    if (index < pathway.currentStepIndex || pathway.steps[index]?.isCompleted) {
      const newPathway: LearningPathway = {
        ...pathway,
        currentStepIndex: index
      };
      onUpdatePathway(newPathway);
      setMasteryResult(null);
      setSelectedCheckpointOption(null);
      setHasSubmittedCheckpoint(false);
    }
  };

  // Launch Practice or Assessment Quizzes
  const handleStartPractice = (difficultyLevel: 'easy' | 'medium' | 'hard' | 'mastery') => {
    // Collect all relevant validated problems from the topic or full pool
    const allTopicProblems = topic.quizzes
      .flatMap(q => q.problems)
      .filter(isValidatedOrActive);

    // Also search all topics for matching competency problems
    const matchingCompetencyProblems = allTopics
      .flatMap(t => t.quizzes.flatMap(q => q.problems))
      .filter(isValidatedOrActive)
      .filter(p => 
        p.competency && (
          p.competency.toLowerCase().includes(detail.competencyName.toLowerCase()) ||
          detail.competencyName.toLowerCase().includes(p.competency.toLowerCase()) ||
          p.topic.toLowerCase().includes(detail.topicTitle.toLowerCase())
        )
      );

    const problemPool = matchingCompetencyProblems.length >= 3 
      ? matchingCompetencyProblems 
      : allTopicProblems;

    let selectedProblems: Problem[] = [];

    if (difficultyLevel === 'easy') {
      selectedProblems = problemPool.filter(p => p.difficulty === 'easy' || (p.difficultyParameter ?? 0) <= -0.3);
      if (selectedProblems.length < 3) {
        selectedProblems = [...problemPool].sort((a, b) => (a.difficultyParameter ?? 0) - (b.difficultyParameter ?? 0));
      }
      selectedProblems = selectedProblems.slice(0, 3);
    } else if (difficultyLevel === 'medium') {
      selectedProblems = problemPool.filter(p => p.difficulty === 'medium' || ((p.difficultyParameter ?? 0) > -0.3 && (p.difficultyParameter ?? 0) <= 0.5));
      if (selectedProblems.length < 3) {
        selectedProblems = [...problemPool].sort((a, b) => Math.abs(a.difficultyParameter ?? 0) - Math.abs(b.difficultyParameter ?? 0));
      }
      selectedProblems = selectedProblems.slice(0, 3);
    } else if (difficultyLevel === 'hard') {
      selectedProblems = problemPool.filter(p => p.difficulty === 'hard' || (p.difficultyParameter ?? 0) > 0.5);
      if (selectedProblems.length < 3) {
        selectedProblems = [...problemPool].sort((a, b) => (b.difficultyParameter ?? 0) - (a.difficultyParameter ?? 0));
      }
      selectedProblems = selectedProblems.slice(0, 3);
    } else {
      // Mastery assessment (5 calibrated items across difficulty range)
      const easyPool = problemPool.filter(p => p.difficulty === 'easy' || (p.difficultyParameter ?? 0) < 0);
      const medPool = problemPool.filter(p => p.difficulty === 'medium' || ((p.difficultyParameter ?? 0) >= 0 && (p.difficultyParameter ?? 0) <= 0.7));
      const hardPool = problemPool.filter(p => p.difficulty === 'hard' || (p.difficultyParameter ?? 0) > 0.7);

      selectedProblems = [
        ...(easyPool.slice(0, 1)),
        ...(medPool.slice(0, 2)),
        ...(hardPool.slice(0, 2))
      ];

      if (selectedProblems.length < 5) {
        const remaining = problemPool.filter(p => !selectedProblems.some(sp => sp.id === p.id));
        selectedProblems = [...selectedProblems, ...remaining].slice(0, 5);
      }
    }

    // Fallback if item bank has fewer questions
    if (selectedProblems.length === 0) {
      selectedProblems = allTopicProblems.slice(0, difficultyLevel === 'mastery' ? 5 : 3);
    }

    const practiceQuiz: Quiz = {
      id: `pathway-${difficultyLevel}-${Date.now()}`,
      title: `${currentStep.title}`,
      description: `Targeted learning pathway drill for ${detail.competencyName}.`,
      topicId: detail.topicId,
      problems: selectedProblems,
      xpReward: difficultyLevel === 'mastery' ? 150 : 60
    };

    setActiveQuizStepIndex(pathway.currentStepIndex);
    setActiveQuiz(practiceQuiz);
  };

  // Handle quiz completion inside pathway
  const handleQuizComplete = (
    xp: number, 
    score: number, 
    total: number, 
    itemResponses: ItemResponse[]
  ) => {
    addXP(xp);
    if (activeQuiz) {
      saveResult({
        userId: profile?.uid || 'current-user',
        quizId: activeQuiz.id,
        score,
        total,
        itemResponses,
        quizMode: 'adaptive'
      });
    }

    const percentage = total > 0 ? (score / total) * 100 : 100;
    setActiveQuiz(null);

    if (activeQuizStepIndex === 6 || currentStep.type === 'mastery') {
      // STEP 7: Mastery Assessment Evaluation
      const passed = percentage >= 75; // 75% or 4/5 questions to pass mastery
      
      let nextCompInfo: any = undefined;
      if (passed) {
        nextCompInfo = findNextCompetencyToStudy(
          detail.competencyName,
          profile?.diagnosticScores,
          profile?.competencyScores,
          allTopics
        );
      }

      setMasteryResult({
        score,
        total,
        percentage,
        passed,
        nextCompetency: nextCompInfo
      });

      if (passed) {
        // Mark pathway step 7 complete
        const updatedSteps = pathway.steps.map((s, i) => 
          i === 6 ? { ...s, isCompleted: true, score: percentage } : s
        );
        onUpdatePathway({
          ...pathway,
          masteryDemonstrated: true,
          steps: updatedSteps
        });
      }
    } else {
      // Regular practice step (Steps 4, 5, 6)
      if (percentage >= 66) {
        // Passed practice step
        markStepComplete(percentage);
      } else {
        alert(`You scored ${Math.round(percentage)}% (${score}/${total}). We recommend retrying this practice step or reviewing the worked example before moving on.`);
      }
    }
  };

  // Transition to the Next Competency Pathway
  const handleAdvanceToNextCompetency = () => {
    if (!masteryResult?.nextCompetency) {
      onClose();
      return;
    }

    const nextComp = masteryResult.nextCompetency;
    const newPathway = generateLearningPathway(nextComp.nextCompetencyName, allTopics);
    
    // Save new active pathway
    onUpdatePathway(newPathway);
    setMasteryResult(null);
    setSelectedCheckpointOption(null);
    setHasSubmittedCheckpoint(false);
  };

  // If active quiz is running
  if (activeQuiz) {
    return (
      <QuizEngine 
        quiz={activeQuiz} 
        onClose={() => setActiveQuiz(null)}
        onComplete={handleQuizComplete}
      />
    );
  }

  // Render Step 1: Review Concept
  const renderConceptStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
            1
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
              Pillar 1: Concept Foundations
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Review Core Concept: {detail.competencyName}
            </h3>
          </div>
        </div>

        {/* Definition Box */}
        <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-sm">
            <Icons.BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Formal Definition</span>
          </div>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            {detail.conceptSummary.definition}
          </p>
        </div>

        {/* Rules & Theorems */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Fundamental Rules & Properties
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {detail.conceptSummary.rules.map((rule, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                    {rule.label}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.note}</p>
                </div>
                <div className="bg-slate-900 text-amber-300 font-mono text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 self-start sm:self-center">
                  {rule.formulaOrRule}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Restrictions */}
        {detail.conceptSummary.domainRestrictions && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3 text-amber-900">
            <Icons.AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block text-amber-800">
                Critical Domain Restrictions & Conditions
              </span>
              <p className="text-xs sm:text-sm text-amber-900/90 mt-1">
                {detail.conceptSummary.domainRestrictions}
              </p>
            </div>
          </div>
        )}

        {/* Misconception Alert */}
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/80 flex items-start gap-3 text-rose-900">
          <Icons.ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-xs uppercase tracking-wider block text-rose-800">
              Common Student Misconception to Avoid
            </span>
            <p className="text-xs sm:text-sm text-rose-900/90 mt-1">
              {detail.conceptSummary.commonMisconception}
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => markStepComplete()}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
      >
        <span>I Have Reviewed the Concept — Proceed to Mini Lesson</span>
        <Icons.ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  // Render Step 2: Mini Lesson & Checkpoint
  const renderLessonStep = () => {
    const cp = detail.miniLesson.checkpointQuestion;
    const isCorrect = selectedCheckpointOption === cp.correctAnswer;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
              2
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Pillar 2: Instructional Lesson
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {detail.miniLesson.title}
              </h3>
            </div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {detail.miniLesson.summary}
          </p>

          {/* Key Takeaways */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <Icons.CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Core Instructional Takeaways</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {detail.miniLesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Checkpoint Question */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icons.HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Concept Checkpoint Question
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Verify understanding before advancing</span>
            </div>

            <p className="text-sm sm:text-base font-bold text-white">
              {cp.question}
            </p>

            <div className="space-y-2">
              {cp.options.map((opt, optIdx) => {
                const isSelected = selectedCheckpointOption === optIdx;
                let btnStyle = 'bg-white/10 hover:bg-white/15 border-white/20 text-white';
                if (hasSubmittedCheckpoint) {
                  if (optIdx === cp.correctAnswer) {
                    btnStyle = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/30 border-rose-400 text-rose-200';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-indigo-600 border-indigo-400 text-white font-bold ring-2 ring-indigo-400';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => {
                      if (!hasSubmittedCheckpoint) {
                        setSelectedCheckpointOption(optIdx);
                      }
                    }}
                    disabled={hasSubmittedCheckpoint}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {hasSubmittedCheckpoint && optIdx === cp.correctAnswer && (
                      <Icons.Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {!hasSubmittedCheckpoint ? (
              <button
                onClick={() => setHasSubmittedCheckpoint(true)}
                disabled={selectedCheckpointOption === null}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Submit Checkpoint Answer
              </button>
            ) : (
              <div className={`p-4 rounded-xl text-xs sm:text-sm border ${isCorrect ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/60 border-rose-500/40 text-rose-200'}`}>
                <p className="font-bold mb-1">
                  {isCorrect ? '✅ Correct Understanding!' : '❌ Let\'s Review the Explanation:'}
                </p>
                <p className="text-xs opacity-90">{cp.explanation}</p>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => markStepComplete()}
          disabled={!hasSubmittedCheckpoint}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <span>Complete Mini Lesson — Proceed to Worked Example</span>
          <Icons.ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Render Step 3: Worked Example
  const renderExampleStep = () => {
    const ex = detail.workedExample;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
              3
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 px-2.5 py-0.5 rounded-full">
                Pillar 3: Annotated Worked Model
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Step-by-Step Worked Example
              </h3>
            </div>
          </div>

          {/* Problem Statement Box */}
          <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-2 border border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              Exemplar Problem Statement
            </span>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-200">
              {ex.problemStatement}
            </div>
            <p className="text-xs text-slate-400">Objective: {ex.goal}</p>
          </div>

          {/* Step-by-Step Walkthrough */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Rigorous Solution Derivation
            </h4>
            <div className="space-y-3">
              {ex.steps.map((step) => (
                <div key={step.stepNumber} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{step.title}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 font-mono text-xs sm:text-sm font-bold text-indigo-950">
                    {step.mathematicalExpression}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Final Answer */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block">
                Domain Verification Check
              </span>
              <p className="text-xs text-emerald-800 mt-0.5">{ex.domainCheck}</p>
            </div>
            <div className="bg-emerald-600 text-white font-black font-mono text-sm px-4 py-2 rounded-xl shrink-0">
              Final: {ex.finalAnswer}
            </div>
          </div>
        </div>

        <button 
          onClick={() => markStepComplete()}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <span>I Understand This Worked Example — Start Easy Practice</span>
          <Icons.ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Render Step 4: Easy Practice
  const renderEasyPracticeStep = () => (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <Icons.Sparkles className="w-10 h-10" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          Step 4 of 7: Easy Practice
        </span>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Foundational Guided Drill
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Test your conceptual grasp with 3 foundational problems (IRT parameter b ≤ -0.3). Receive instant hints and step-by-step guidance.
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Question Count:</span>
          <span className="text-indigo-600 font-mono">3 Calibrated Items</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Passing Criterion:</span>
          <span className="text-emerald-600 font-mono">≥ 66% (2/3 Correct)</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>XP Reward:</span>
          <span className="text-amber-600 font-mono">+60 XP</span>
        </div>
      </div>

      <button 
        onClick={() => handleStartPractice('easy')}
        className="w-full max-w-md mx-auto py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
      >
        <Icons.Play className="w-5 h-5 fill-current" />
        <span>Start Easy Practice</span>
      </button>
    </div>
  );

  // Render Step 5: Moderate Practice
  const renderModeratePracticeStep = () => (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm text-center space-y-6">
      <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <Icons.Target className="w-10 h-10" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          Step 5 of 7: Moderate Practice
        </span>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Intermediate Application Drill
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Step up the complexity with 3 multi-step algebraic problems (-0.3 &lt; b ≤ 0.5). Strengthen your problem-solving endurance.
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Question Count:</span>
          <span className="text-indigo-600 font-mono">3 Calibrated Items</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Passing Criterion:</span>
          <span className="text-amber-600 font-mono">≥ 66% (2/3 Correct)</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>XP Reward:</span>
          <span className="text-amber-600 font-mono">+60 XP</span>
        </div>
      </div>

      <button 
        onClick={() => handleStartPractice('medium')}
        className="w-full max-w-md mx-auto py-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
      >
        <Icons.Play className="w-5 h-5 fill-current" />
        <span>Start Moderate Practice</span>
      </button>
    </div>
  );

  // Render Step 6: Difficult Practice
  const renderDifficultPracticeStep = () => (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm text-center space-y-6">
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <Icons.Flame className="w-10 h-10" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
          Step 6 of 7: Difficult Practice
        </span>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Rigorous Advanced Challenge
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Master high-difficulty items (b &gt; 0.5) featuring intricate algebraic transformations and subtle domain constraints.
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Question Count:</span>
          <span className="text-indigo-600 font-mono">3 Calibrated Items</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Passing Criterion:</span>
          <span className="text-rose-600 font-mono">≥ 66% (2/3 Correct)</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>XP Reward:</span>
          <span className="text-amber-600 font-mono">+60 XP</span>
        </div>
      </div>

      <button 
        onClick={() => handleStartPractice('hard')}
        className="w-full max-w-md mx-auto py-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
      >
        <Icons.Play className="w-5 h-5 fill-current" />
        <span>Start Difficult Practice</span>
      </button>
    </div>
  );

  // Render Step 7: Mastery Assessment
  const renderMasteryStep = () => {
    if (masteryResult) {
      // Show result card
      if (masteryResult.passed) {
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-100">
              <Icons.Trophy className="w-12 h-12" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                🎉 Competency Mastered!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {detail.competencyName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                You demonstrated verified mastery with a score of <strong className="text-slate-900">{Math.round(masteryResult.percentage)}%</strong> ({masteryResult.score}/{masteryResult.total}).
              </p>
            </div>

            {/* Next Competency Progression Box */}
            {masteryResult.nextCompetency && (
              <div className="p-5 bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl text-white text-left space-y-3 border border-indigo-800 shadow-md">
                <div className="flex items-center gap-2">
                  <Icons.Compass className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    System Recommendation: Next Competency in Pathway
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">
                    {masteryResult.nextCompetency.nextCompetencyName}
                  </h4>
                  <p className="text-xs text-indigo-200 mt-1">
                    {masteryResult.nextCompetency.reason}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleAdvanceToNextCompetency}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>🚀 Advance to Next Competency: {masteryResult.nextCompetency.nextCompetencyName}</span>
                    <Icons.ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      } else {
        // Did not pass threshold
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Icons.AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                Needs More Practice (Score: {Math.round(masteryResult.percentage)}%)
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Mastery Threshold Not Met
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                You scored {masteryResult.score}/{masteryResult.total} ({Math.round(masteryResult.percentage)}%). A score of at least 75% is required to demonstrate verified mastery and unlock the next competency.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <button
                onClick={() => handleJumpToStep(2)} // jump to worked example
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Review Worked Example
              </button>
              <button
                onClick={() => handleStartPractice('mastery')}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-indigo-200"
              >
                Retake Assessment
              </button>
            </div>
          </div>
        );
      }
    }

    // Default Step 7 intro view
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Icons.Medal className="w-10 h-10" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Final Step 7 of 7: Mastery Benchmark
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Competency Mastery Assessment
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Prove your mastery of {detail.competencyName}. Passing this 5-question benchmark (≥ 75%) certifies your proficiency and unlocks your next learning competency.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Assessment Length:</span>
            <span className="text-indigo-600 font-mono">5 Calibrated Questions</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Mastery Threshold:</span>
            <span className="text-emerald-600 font-mono">≥ 75% Score</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Completion Outcome:</span>
            <span className="text-indigo-600 font-mono">Auto-advance to next competency</span>
          </div>
        </div>

        <button 
          onClick={() => handleStartPractice('mastery')}
          className="w-full max-w-md mx-auto py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <Icons.Trophy className="w-5 h-5 text-amber-300" />
          <span>Take Mastery Assessment</span>
        </button>
      </div>
    );
  };

  const renderCurrentStepContent = () => {
    switch (currentStep.type) {
      case 'concept':
        return renderConceptStep();
      case 'lesson':
        return renderLessonStep();
      case 'example':
        return renderExampleStep();
      case 'practice_easy':
        return renderEasyPracticeStep();
      case 'practice_moderate':
        return renderModeratePracticeStep();
      case 'practice_difficult':
        return renderDifficultPracticeStep();
      case 'mastery':
        return renderMasteryStep();
      default:
        return renderConceptStep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col md:flex-row overflow-hidden">
      {/* ========================================================================= */}
      {/* SIDEBAR: 7-STEP LEARNING PATHWAY TRACKER                                  */}
      {/* ========================================================================= */}
      <div className="w-full md:w-88 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.03)] z-10 hidden md:flex">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-bold text-xs mb-5 transition-colors"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            <span>Exit to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 text-indigo-600 mb-1.5">
            <Icons.Route className="w-4 h-4 text-indigo-600" />
            <span className="font-black text-[10px] tracking-widest uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
              7-Step Learning Pathway
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 leading-snug">
            {detail.competencyName}
          </h2>
          <span className="text-xs text-slate-400 font-medium block mt-0.5">
            Module: {detail.topicTitle}
          </span>
        </div>
        
        {/* Step List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
          <div className="absolute left-[39px] top-8 bottom-8 w-0.5 bg-slate-100 -z-10" />
          {pathway.steps.map((step, idx) => {
            const isPast = idx < pathway.currentStepIndex || step.isCompleted;
            const isCurrent = idx === pathway.currentStepIndex;
            const isFuture = idx > pathway.currentStepIndex && !step.isCompleted;
            
            let circleColor = 'bg-white text-slate-400 border-2 border-slate-200';
            if (isPast) circleColor = 'bg-emerald-500 text-white border-2 border-emerald-500 shadow-sm';
            if (isCurrent) circleColor = 'bg-indigo-600 text-white border-2 border-indigo-600 shadow-md shadow-indigo-200 ring-4 ring-indigo-50';
            
            return (
              <button
                key={step.id}
                onClick={() => handleJumpToStep(idx)}
                disabled={isFuture}
                className={`w-full text-left flex items-start gap-3.5 transition-all p-2 rounded-xl ${isCurrent ? 'bg-indigo-50/60' : isPast ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${circleColor}`}>
                  {isPast ? (
                    <Icons.Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <span className="text-xs font-black">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-indigo-950 font-black' : isPast ? 'text-slate-800' : 'text-slate-500'}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 capitalize flex items-center gap-1.5">
                    <span>Step {idx + 1}</span>
                    {step.isCompleted && (
                      <span className="text-emerald-600 font-bold">• Completed</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 flex items-center gap-2">
          <Icons.ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Demonstrating mastery automatically unlocks the next competency.</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT WORKSPACE                                                    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
              <Icons.ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-xs font-black text-slate-900 block truncate">
                {detail.competencyName}
              </span>
              <span className="text-[10px] text-indigo-600 font-bold">
                Step {pathway.currentStepIndex + 1} of {pathway.steps.length}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
            Pathway
          </span>
        </header>
        
        {/* Step Content View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 flex items-center justify-center">
          <motion.div 
            key={`${pathway.topicId}-${currentStep.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl"
          >
            {renderCurrentStepContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
