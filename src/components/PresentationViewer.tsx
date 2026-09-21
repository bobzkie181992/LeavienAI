import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Award, 
  HelpCircle, 
  Zap, 
  TrendingUp, 
  FileText, 
  Play, 
  Pause, 
  X, 
  Layers,
  ArrowRight,
  GraduationCap,
  Activity,
  Check,
  Brain
} from 'lucide-react';
import { Presentation, PresentationSlide, UserProfile } from '../types';

interface PresentationViewerProps {
  presentation: Presentation;
  profile?: UserProfile | null;
  onClose: () => void;
  onStartQuiz?: (topicId: string, quizId?: string) => void;
  onStartDiagnostic?: () => void;
  onCompletePresentation?: (presentationId: string, slidesViewed: number, totalSlides: number) => void;
}

export default function PresentationViewer({
  presentation,
  profile,
  onClose,
  onStartQuiz,
  onStartDiagnostic,
  onCompletePresentation
}: PresentationViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);
  const [selectedQuickAnswer, setSelectedQuickAnswer] = useState<number | null>(null);
  const [showQuickCheckFeedback, setShowQuickCheckFeedback] = useState(false);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set([0]));
  const [showAssessmentSuggestion, setShowAssessmentSuggestion] = useState(false);
  const [hasCompletedPresentation, setHasCompletedPresentation] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const slides = presentation.slides || [];
  const currentSlide: PresentationSlide | undefined = slides[currentSlideIndex];
  const totalSlides = slides.length;
  const progressPercent = totalSlides > 0 ? Math.round(((currentSlideIndex + 1) / totalSlides) * 100) : 0;

  // Track slide completion
  useEffect(() => {
    setCompletedSlides(prev => new Set([...prev, currentSlideIndex]));
    setRevealedSteps([]);
    setSelectedQuickAnswer(null);
    setShowQuickCheckFeedback(false);

    // Stop ongoing speech on slide change
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [currentSlideIndex]);

  // Speech Narration Handler
  const toggleSpeech = () => {
    if (!synthRef.current) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!currentSlide) return;

    const textToSpeak = currentSlide.speakerNotes || 
      `${currentSlide.title}. ${currentSlide.subtitle || ''}. ${currentSlide.content.join('. ')}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // Reached the end of presentation
      triggerPresentationCompletion();
    }
  }, [currentSlideIndex, totalSlides]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  const triggerPresentationCompletion = () => {
    if (!hasCompletedPresentation) {
      setHasCompletedPresentation(true);
      if (onCompletePresentation) {
        onCompletePresentation(presentation.id, completedSlides.size, totalSlides);
      }
    }
    setShowAssessmentSuggestion(true);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAssessmentSuggestion) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen, showAssessmentSuggestion]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Render Icon helper
  const renderSlideIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'Award': return <Award className="w-5 h-5 text-indigo-500" />;
      case 'HelpCircle': return <HelpCircle className="w-5 h-5 text-purple-500" />;
      case 'Trophy': return <Sparkles className="w-5 h-5 text-amber-500" />;
      default: return <BookOpen className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      id="presentation-viewer-container"
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none text-slate-100 overflow-hidden"
    >
      {/* Top Header Bar */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Exit Presentation"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {presentation.topicTitle}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {presentation.grade} • {presentation.section}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white truncate max-w-md">
              {presentation.title}
            </h2>
          </div>
        </div>

        {/* Center Progress Tracker */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
            <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Lecture Audio Read Aloud */}
          <button
            onClick={toggleSpeech}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isSpeaking 
                ? 'bg-amber-500 text-slate-950 animate-pulse' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Read lecture aloud"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Mute Audio' : 'Audio Lecture'}</span>
          </button>

          {/* Slide Thumbnails Drawer Toggle */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              showThumbnails 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Slide Thumbnails"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Teacher Speaker Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              showNotes 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Teacher Speaker Notes"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-all"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Presentation Stage */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentSlide && (
            <motion.div
              key={currentSlide.id || currentSlideIndex}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-5xl bg-slate-900 border border-slate-800/90 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[520px] justify-between"
            >
              {/* Decorative Subtle Background Elements */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Slide Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                      {renderSlideIcon(currentSlide.iconName)}
                    </div>
                    <div>
                      {currentSlide.subtitle && (
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          {currentSlide.subtitle}
                        </p>
                      )}
                      <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        {currentSlide.title}
                      </h1>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/40">
                    SLIDE {currentSlideIndex + 1}/{totalSlides}
                  </span>
                </div>

                <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500/50 via-purple-500/30 to-transparent mb-6" />

                {/* Slide Core Content & Layouts */}
                <div className="space-y-6">
                  {/* Bullet Points */}
                  {currentSlide.content && currentSlide.content.length > 0 && (
                    <div className="space-y-3">
                      {currentSlide.content.map((point, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="flex items-start gap-3 text-slate-200 text-sm md:text-base leading-relaxed bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/30"
                        >
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div className="flex-1 font-medium">
                            {point}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Math Formula Card (if applicable) */}
                  {currentSlide.keyFormula && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          Key Formula & Theorem
                        </span>
                      </div>
                      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-center my-2 font-mono text-lg md:text-xl font-bold text-indigo-200 shadow-inner">
                        {currentSlide.keyFormula}
                      </div>
                      {currentSlide.formulaExplanation && (
                        <p className="text-xs md:text-sm text-indigo-200/80 mt-2 font-medium">
                          {currentSlide.formulaExplanation}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Worked Example Step-by-Step Problem (if applicable) */}
                  {currentSlide.exampleProblem && (
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          Step-by-Step Worked Example
                        </span>
                        <span className="text-xs text-slate-400">
                          {currentSlide.exampleProblem.steps.length} Steps
                        </span>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-mono text-sm md:text-base text-slate-100 font-bold">
                        {currentSlide.exampleProblem.problemStatement}
                      </div>

                      {/* Interactive Step Revealer */}
                      <div className="space-y-2.5">
                        {currentSlide.exampleProblem.steps.map((step, sIdx) => {
                          const isRevealed = revealedSteps.includes(sIdx) || revealedSteps.length === currentSlide.exampleProblem?.steps.length;
                          return (
                            <div 
                              key={sIdx}
                              className={`p-3 rounded-xl border transition-all ${
                                isRevealed 
                                  ? 'bg-slate-800/90 border-slate-700 text-slate-100' 
                                  : 'bg-slate-900/40 border-slate-800/50 text-slate-500 cursor-pointer hover:border-slate-700'
                              }`}
                              onClick={() => {
                                if (!revealedSteps.includes(sIdx)) {
                                  setRevealedSteps(prev => [...prev, sIdx]);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                                  Step {sIdx + 1}
                                </span>
                                {!isRevealed && (
                                  <span className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Reveal Step
                                  </span>
                                )}
                              </div>
                              {isRevealed ? (
                                <p className="text-sm font-medium mt-1 text-slate-200">
                                  {step}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-500 italic mt-1">
                                  Click to reveal step derivation...
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Final Answer */}
                      <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Final Result:
                        </span>
                        <span className="font-mono text-sm md:text-base font-bold text-emerald-200">
                          {currentSlide.exampleProblem.finalAnswer}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quick Knowledge Check (if applicable) */}
                  {currentSlide.quickCheck && (
                    <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" />
                          Interactive Quick Knowledge Check
                        </span>
                        <span className="text-xs text-purple-300/70">
                          Select the correct answer
                        </span>
                      </div>

                      <p className="text-sm md:text-base font-semibold text-slate-100">
                        {currentSlide.quickCheck.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentSlide.quickCheck.options.map((opt, oIdx) => {
                          const isSelected = selectedQuickAnswer === oIdx;
                          const isCorrect = oIdx === currentSlide.quickCheck?.correctAnswer;
                          let btnStyle = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700";

                          if (showQuickCheckFeedback) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-600 border-emerald-400 text-white font-bold shadow-lg shadow-emerald-900/30";
                            } else if (isSelected) {
                              btnStyle = "bg-rose-600/80 border-rose-400 text-white line-through";
                            } else {
                              btnStyle = "bg-slate-900/60 border-slate-800 text-slate-500";
                            }
                          } else if (isSelected) {
                            btnStyle = "bg-indigo-600 border-indigo-400 text-white font-bold";
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={showQuickCheckFeedback}
                              onClick={() => {
                                setSelectedQuickAnswer(oIdx);
                                setShowQuickCheckFeedback(true);
                              }}
                              className={`p-3.5 rounded-xl border text-left text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {showQuickCheckFeedback && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showQuickCheckFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 text-xs md:text-sm text-slate-300"
                        >
                          <span className="font-bold text-white block mb-1">
                            {selectedQuickAnswer === currentSlide.quickCheck.correctAnswer ? '🎉 Correct Answer!' : '💡 Conceptual Explanation:'}
                          </span>
                          {currentSlide.quickCheck.explanation}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Summary Slide Callout */}
                  {currentSlide.layout === 'summary' && (
                    <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/40 p-6 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 bg-indigo-600/30 border border-indigo-400/50 rounded-2xl flex items-center justify-center mx-auto text-indigo-300">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white">
                        Module Knowledge Consolidated!
                      </h3>
                      <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto">
                        You have reviewed all conceptual slides in this presentation. Now test your cognitive recall with the attached diagnostic quiz or mastery assessment.
                      </p>
                      <button
                        onClick={triggerPresentationCompletion}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Complete & Proceed to Assessment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Bottom Bar Navigation */}
              <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentSlideIndex === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-2 text-xs md:text-sm font-bold"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Slide
                </button>

                <div className="flex items-center gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-2 transition-all rounded-full ${
                        idx === currentSlideIndex 
                          ? 'w-6 bg-indigo-500' 
                          : completedSlides.has(idx) 
                            ? 'w-2 bg-emerald-500' 
                            : 'w-2 bg-slate-700'
                      }`}
                      title={`Go to Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 text-xs md:text-sm font-bold"
                >
                  <span>{currentSlideIndex === totalSlides - 1 ? 'Finish & Quiz' : 'Next Slide'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Teacher Speaker Notes Drawer */}
      <AnimatePresence>
        {showNotes && currentSlide && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-slate-900 border-t border-slate-800 p-4 max-h-48 overflow-y-auto px-6 md:px-12 z-30"
          >
            <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                    Teacher Speaker Notes & Lecture Script
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {currentSlide.speakerNotes || 'No specific speaker notes attached for this slide. Follow standard DepEd curriculum guidelines.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNotes(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Thumbnails Drawer */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-16 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto z-30 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Slide Navigator ({totalSlides})
              </h3>
              <button
                onClick={() => setShowThumbnails(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setShowThumbnails(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                    idx === currentSlideIndex 
                      ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === currentSlideIndex ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 truncate">
                    <p className="text-xs font-bold truncate text-slate-100">{slide.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{slide.subtitle || 'Slide content'}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POST-PRESENTATION ASSESSMENT SUGGESTION MODAL */}
      <AnimatePresence>
        {showAssessmentSuggestion && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-600/30">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 inline-block mb-2">
                  Presentation Module Completed +50 XP
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-white">
                  Ready to Test Your Mastery?
                </h3>
                <p className="text-xs md:text-sm text-slate-300 mt-2">
                  You reviewed <span className="text-white font-semibold">{presentation.title}</span>. Immediate formative evaluation solidifies cognitive recall and earns extra XP.
                </p>
              </div>

              {/* Assessment Action Options */}
              <div className="space-y-3 text-left">
                {/* Topic Mastery Quiz Option */}
                <button
                  onClick={() => {
                    setShowAssessmentSuggestion(false);
                    onClose();
                    if (onStartQuiz) {
                      onStartQuiz(presentation.topicId, presentation.connectedQuizId);
                    }
                  }}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Take Topic Adaptive Quiz</p>
                      <p className="text-xs text-indigo-100 font-normal">
                        {presentation.connectedQuizTitle || 'Topic Practice Quiz'} • +100 XP
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Diagnostic Pre-Test Assessment Option */}
                {onStartDiagnostic && (
                  <button
                    onClick={() => {
                      setShowAssessmentSuggestion(false);
                      onClose();
                      onStartDiagnostic();
                    }}
                    className="w-full p-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Take Full Diagnostic Assessment</p>
                        <p className="text-xs text-slate-400 font-normal">
                          Evaluate your overall Grade 11 ability score
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Review / Done buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAssessmentSuggestion(false);
                    setCurrentSlideIndex(0);
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Review Deck
                </button>
                <button
                  onClick={() => {
                    setShowAssessmentSuggestion(false);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
                >
                  Done For Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
