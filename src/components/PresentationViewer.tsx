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
  Brain, 
  Edit2, 
  Trash2, 
  PenTool, 
  Radio, 
  ExternalLink, 
  Presentation as PresentationIcon, 
  Monitor,
  ZoomIn,
  ZoomOut,
  Download,
  Sliders,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import { Presentation, PresentationSlide, UserProfile } from '../types';
import { generateSlideImage } from '../utils/pptxConverter';

interface PresentationViewerProps {
  presentation: Presentation;
  profile?: UserProfile | null;
  initialSlideIndex?: number;
  onClose: () => void;
  onStartQuiz?: (topicId: string, quizId?: string) => void;
  onStartDiagnostic?: () => void;
  onCompletePresentation?: (presentationId: string, slidesViewed: number, totalSlides: number) => void;
}

export default function PresentationViewer({
  presentation,
  profile,
  initialSlideIndex,
  onClose,
  onStartQuiz,
  onStartDiagnostic,
  onCompletePresentation
}: PresentationViewerProps) {
  const storageKey = `mathquest_pres_prog_${profile?.uid || 'guest'}_${presentation.id}`;

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(() => {
    if (initialSlideIndex !== undefined && initialSlideIndex >= 0) {
      return initialSlideIndex;
    }
    try {
      const saved = localStorage.getItem(`mathquest_pres_prog_${profile?.uid || 'guest'}_${presentation.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastViewedSlide && typeof parsed.lastViewedSlide === 'number') {
          return Math.max(0, parsed.lastViewedSlide - 1);
        }
      }
    } catch {}
    return 0;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);
  const [selectedQuickAnswer, setSelectedQuickAnswer] = useState<number | null>(null);
  const [showQuickCheckFeedback, setShowQuickCheckFeedback] = useState(false);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set([0]));
  const [showAssessmentSuggestion, setShowAssessmentSuggestion] = useState(false);
  const [hasCompletedPresentation, setHasCompletedPresentation] = useState(false);

  // PowerPoint & Presenter Tools State (Default to slide_image to display converted PowerPoint PDF images)
  const [viewMode, setViewMode] = useState<'slide_image' | 'interactive' | 'powerpoint'>('slide_image');
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#ef4444');
  const [isDrawing, setIsDrawing] = useState(false);

  // Mobile Touch Swipe Handling
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideCanvasRef = useRef<HTMLCanvasElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const slides = presentation.slides || [];
  const currentSlide: PresentationSlide | undefined = slides[currentSlideIndex];
  const totalSlides = slides.length;
  const progressPercent = totalSlides > 0 ? Math.round(((currentSlideIndex + 1) / totalSlides) * 100) : 0;

  // Clear pen canvas on slide change
  const clearPenCanvas = () => {
    const canvas = slideCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Track slide completion
  useEffect(() => {
    setCompletedSlides(prev => new Set([...prev, currentSlideIndex]));
    setRevealedSteps([]);
    setSelectedQuickAnswer(null);
    setShowQuickCheckFeedback(false);
    clearPenCanvas();

    // Stop ongoing speech on slide change
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [currentSlideIndex]);

  // Laser Mouse Tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLaserActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setLaserPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Mobile Touch Swipe Navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    if (e.changedTouches && e.changedTouches[0]) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;

      // Ensure horizontal swipe is dominant and significant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        if (deltaX > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Download PPTX / Resource Handler
  const handleDownloadPPTX = () => {
    if (presentation.downloadUrl) {
      window.open(presentation.downloadUrl, '_blank');
      return;
    }
    // Generate text/slide deck summary fallback download
    const fileName = presentation.originalFileName || `${presentation.title.replace(/\s+/g, '_')}.pptx`;
    const content = `PowerPoint Presentation: ${presentation.title}\nTopic: ${presentation.topicTitle}\nGrade: ${presentation.grade}\nSection: ${presentation.section}\n\n` +
      slides.map((s, idx) => `--- Slide ${idx + 1}: ${s.title} ---\n${s.subtitle || ''}\n\n${s.content.join('\n')}\n\n${s.keyFormula ? 'Formula: ' + s.keyFormula : ''}\n\nNotes: ${s.speakerNotes || 'N/A'}\n`).join('\n\n');
    
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Persist student progress whenever slide changes
  useEffect(() => {
    try {
      const progressData = {
        presentationId: presentation.id,
        lastViewedSlide: currentSlideIndex + 1,
        totalSlides: totalSlides,
        presentationStarted: true,
        presentationCompleted: currentSlideIndex === totalSlides - 1 || completedSlides.size >= totalSlides,
        lastViewedDate: new Date().toISOString(),
        percentage: progressPercent,
        slidesViewedCount: completedSlides.size
      };
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    } catch {}
  }, [currentSlideIndex, totalSlides, completedSlides, presentation.id, storageKey, progressPercent]);

  // Pen Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPenActive || !slideCanvasRef.current) return;
    setIsDrawing(true);
    const canvas = slideCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isPenActive || !slideCanvasRef.current) return;
    const canvas = slideCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

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
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold animate-pulse">
                <Radio className="w-3 h-3 text-rose-400" />
                Live Presentation Mode
              </span>
            </div>
            <h2 className="text-sm font-bold text-white truncate max-w-md">
              {presentation.title}
            </h2>
          </div>
        </div>

        {/* Center View Mode Switcher & Progress Tracker */}
        <div className="hidden md:flex items-center gap-4">
          {/* PowerPoint / Converted Image / Interactive Deck Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setViewMode('slide_image')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'slide_image' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="View Converted PDF Slide Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Slide Image</span>
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'interactive' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="View Interactive Math Elements"
            >
              <PresentationIcon className="w-3.5 h-3.5" />
              <span>Interactive</span>
            </button>
            {(presentation.embedUrl || presentation.powerpointUrl) && (
              <button
                onClick={() => setViewMode('powerpoint')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'powerpoint' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="View Native PowerPoint Embed"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PowerPoint</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
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
          {/* Laser Pointer Tool */}
          <button
            onClick={() => {
              setIsLaserActive(!isLaserActive);
              if (isPenActive) setIsPenActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isLaserActive 
                ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-lg shadow-rose-600/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Toggle Laser Pointer"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${isLaserActive ? 'bg-white animate-ping' : 'bg-rose-500'}`} />
            <span className="hidden lg:inline">Laser Pointer</span>
          </button>

          {/* Pen Drawing Tool */}
          <button
            onClick={() => {
              setIsPenActive(!isPenActive);
              if (isLaserActive) setIsLaserActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isPenActive 
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Toggle Drawing Pen"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Pen Draw</span>
          </button>

          {isPenActive && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              {['#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(color => (
                <button
                  key={color}
                  onClick={() => setPenColor(color)}
                  className={`w-4 h-4 rounded-full transition-transform ${penColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={clearPenCanvas}
                className="ml-1 text-[10px] font-bold text-slate-400 hover:text-rose-400 px-1.5 py-0.5 rounded"
                title="Clear Drawing"
              >
                Clear
              </button>
            </div>
          )}

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
      <div 
        className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-y-auto"
        onMouseMove={handleMouseMove}
      >
        {/* Laser Pointer Red Glow Follower */}
        {isLaserActive && (
          <div 
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
          >
            <div className="w-6 h-6 rounded-full bg-rose-500/40 animate-ping absolute inset-0" />
            <div className="w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-[0_0_15px_#ef4444]" />
          </div>
        )}

        {/* Pen Canvas Overlay */}
        <canvas
          ref={slideCanvasRef}
          width={1024}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 m-auto z-40 max-w-5xl h-auto pointer-events-auto rounded-3xl ${
            isPenActive ? 'cursor-crosshair border-2 border-amber-400/50' : 'pointer-events-none'
          }`}
        />

        {/* 1. RENDERED SLIDE IMAGE MODE (CONVERTED FROM PPTX -> PDF -> SLIDE IMAGE) */}
        {viewMode === 'slide_image' ? (
          <AnimatePresence mode="wait">
            {currentSlide && (
              <div 
                className="w-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <motion.div
                  key={`slide-img-${currentSlide.id || currentSlideIndex}`}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full max-w-5xl relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center group"
                >
                  <img
                    src={
                      currentSlide.imageUrl ||
                      (presentation.slideImages && presentation.slideImages[currentSlideIndex]) ||
                      generateSlideImage(currentSlide, totalSlides, presentation.subject, presentation.topicTitle)
                    }
                    alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                    className="w-full h-auto object-contain max-h-[72vh] rounded-3xl select-none"
                    draggable={false}
                  />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-bold text-white shadow-lg pointer-events-none">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>PowerPoint → PDF → Rendered Slide Image</span>
                  </div>

                  {/* Bottom Bar Info on Hover */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm">
                      {currentSlide.title} • Slide {currentSlideIndex + 1} of {totalSlides}
                    </span>
                    <button
                      onClick={() => setViewMode('interactive')}
                      className="pointer-events-auto text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-500/50 px-3 py-1 rounded-full backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <PresentationIcon className="w-3 h-3" />
                      <span>Switch to Interactive Mode</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        ) : viewMode === 'powerpoint' ? (
          <div className="w-full max-w-5xl h-[580px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">PowerPoint (.PPTX) Native Reader & Viewer</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                  {presentation.originalFileName || `${presentation.title}.pptx`}
                </span>
              </div>
              {presentation.powerpointUrl && (
                <a 
                  href={presentation.powerpointUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in Office 365
                </a>
              )}
            </div>

            <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 relative">
              {presentation.embedUrl ? (
                <iframe 
                  src={presentation.embedUrl}
                  className="w-full h-full rounded-2xl border-none"
                  title="PowerPoint Presentation Embed"
                  allowFullScreen
                />
              ) : presentation.powerpointUrl ? (
                <iframe 
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presentation.powerpointUrl)}`}
                  className="w-full h-full rounded-2xl border-none"
                  title="Office Web Viewer"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 max-w-lg">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                    <Monitor className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">PowerPoint Slide Deck Synchronized</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    This PowerPoint deck (<span className="text-white font-medium">{presentation.originalFileName || presentation.title}</span>) has been converted into interactive, audio-narrated STEM slides for live student presentation!
                  </p>
                  <button
                    onClick={() => setViewMode('interactive')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                  >
                    View Formatted Slide Deck ({totalSlides} Slides)
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
          {currentSlide && (
            <div 
              className="w-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
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
            </div>
          )}
        </AnimatePresence>
        )}
      </div>

      {/* EMBEDDED PRESENTATION VIEWER BOTTOM CONTROLS DOCK */}
      <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-3 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md z-30 shadow-2xl">
        {/* ◀ Previous  4 / 15  Next ▶ */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>◀ Previous</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700 font-mono text-xs font-black text-slate-200">
            <span className="text-white">{currentSlideIndex + 1}</span>
            <span className="text-slate-500">/</span>
            <span>{totalSlides}</span>
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md shadow-indigo-600/30"
          >
            <span>{currentSlideIndex === totalSlides - 1 ? 'Finish' : 'Next ▶'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Secondary Toolbar: [Thumbnails] [Zoom] [Fullscreen] [Download PPTX] */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end overflow-x-auto py-1">
          {/* Thumbnails Navigation */}
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showThumbnails
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
            title="Open Slide Thumbnails"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thumbnails</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.75, +(prev - 0.15).toFixed(2)))}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span 
              onClick={() => setZoomLevel(1.0)}
              className="px-2 font-mono font-bold text-[11px] text-slate-300 cursor-pointer hover:text-white"
              title="Reset Fit (100%)"
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, +(prev + 0.15).toFixed(2)))}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Mode */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          {/* Download Original PPTX */}
          <button
            onClick={handleDownloadPPTX}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
            title="Download Original PowerPoint (.pptx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">PPTX</span>
          </button>
        </div>
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

            <div className="space-y-2.5">
              {slides.map((slide, idx) => {
                const thumbImgUrl =
                  slide.imageUrl ||
                  (presentation.slideImages && presentation.slideImages[idx]) ||
                  generateSlideImage(slide, totalSlides, presentation.subject, presentation.topicTitle);

                return (
                  <button
                    key={slide.id || idx}
                    onClick={() => {
                      setCurrentSlideIndex(idx);
                      setShowThumbnails(false);
                    }}
                    className={`w-full p-2 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer group ${
                      idx === currentSlideIndex 
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10' 
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {/* Visual Slide Image Thumbnail Preview */}
                    <div className="w-20 aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0 relative shadow-inner">
                      <img 
                        src={thumbImgUrl} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                      />
                      <span className={`absolute bottom-1 right-1 text-[9px] font-mono font-black px-1.5 py-0.2 rounded-md ${
                        idx === currentSlideIndex ? 'bg-indigo-600 text-white' : 'bg-slate-900/90 text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 truncate">
                      <p className="text-xs font-bold truncate text-slate-100 group-hover:text-white">{slide.title}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{slide.subtitle || `Slide ${idx + 1} of ${totalSlides}`}</p>
                    </div>
                  </button>
                );
              })}
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
