import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Eye, 
  Lock, 
  ArrowRight, 
  Check, 
  Calendar, 
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { Presentation, Topic } from '../types';
import { validatePPTXFile, convertPPTXToPresentation, formatBytes } from '../utils/pptxConverter';
import { usePresentations } from '../hooks/useFirebase';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  facultyUid?: string;
  facultyName?: string;
  onSavePresentation?: (pres: Omit<Presentation, 'id' | 'createdAt'>) => Promise<any>;
  initialTopicId?: string;
  editPresentation?: Presentation | null;
}

export default function UploadResourceModal({
  isOpen,
  onClose,
  topics,
  facultyUid = 'faculty-1',
  facultyName = 'Professor',
  onSavePresentation,
  initialTopicId,
  editPresentation
}: UploadResourceModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addPresentation, updatePresentation } = usePresentations();

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState(editPresentation?.title || '');
  const [grade, setGrade] = useState(editPresentation?.grade || 'Grade 11');
  const [subject, setSubject] = useState(editPresentation?.subject || 'General Mathematics');
  const [quarter, setQuarter] = useState(editPresentation?.quarter || 'Quarter 1');
  const [selectedTopicId, setSelectedTopicId] = useState(editPresentation?.topicId || initialTopicId || (topics[0]?.id || 'functions'));
  const [description, setDescription] = useState(editPresentation?.description || '');
  const [isAvailableToStudents, setIsAvailableToStudents] = useState<boolean>(
    editPresentation?.isAvailableToStudents !== undefined ? editPresentation.isAvailableToStudents : true
  );

  // Upload & Conversion State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'validating' | 'converting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<{
    fileName: string;
    fileSize: string;
    slideCount?: number;
    uploadDate: string;
    linkedLessonTitle: string;
  } | null>(null);

  const [convertedDeck, setConvertedDeck] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentTopic = topics.find(t => t.id === selectedTopicId);
  const currentTopicTitle = currentTopic?.title || 'Introduction to Functions';

  // Handle File Selection with Real Validation
  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    setUploadStage('validating');
    setUploadProgress(15);

    const validation = await validatePPTXFile(file);

    if (!validation.isValid) {
      setUploadStage('error');
      setErrorMessage(validation.error || 'Failed to validate PowerPoint file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadProgress(40);

    // Auto-fill title if empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Begin Conversion Simulation / Client & Server Parsing
    try {
      setUploadStage('converting');
      setUploadProgress(65);

      // Perform conversion
      const conversion = await convertPPTXToPresentation(file, {
        title: title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        description: description || `PowerPoint presentation resource for ${currentTopicTitle}.`,
        topicId: selectedTopicId,
        topicTitle: currentTopicTitle,
        subject,
        grade,
        quarter,
        ilawLessonTitle: currentTopicTitle
      });

      setUploadProgress(95);

      if (!conversion.success || conversion.slides.length === 0) {
        throw new Error(conversion.error || 'Slide conversion encountered an error.');
      }

      setConvertedDeck(conversion);
      setUploadProgress(100);
      setUploadStage('success');

      // Set validation summary display
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      setValidationSummary({
        fileName: file.name,
        fileSize: validation.fileSizeFormatted || formatBytes(file.size),
        slideCount: conversion.totalSlides || validation.slideCount || 15,
        uploadDate: formattedDate,
        linkedLessonTitle: currentTopicTitle
      });
    } catch (convErr: any) {
      console.error('Conversion error:', convErr);
      setUploadStage('error');
      setErrorMessage(convErr.message || 'Upload failure: Unable to convert PowerPoint slides.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide a resource title.');
      return;
    }

    if (!selectedFile && !editPresentation) {
      setErrorMessage('Please upload a PowerPoint (.pptx) file.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let slidesToSave = editPresentation?.slides || [];
      let totalSlidesCount = editPresentation?.totalSlides || 15;
      let originalFileNameToSave = editPresentation?.originalFileName || selectedFile?.name || 'Lesson_Presentation.pptx';
      let fileSizeToSave = editPresentation?.fileSize || (selectedFile ? formatBytes(selectedFile.size) : '2.8 MB');
      let fileSizeBytesToSave = editPresentation?.fileSizeBytes || selectedFile?.size || 2936012;

      if (convertedDeck && convertedDeck.slides && convertedDeck.slides.length > 0) {
        slidesToSave = convertedDeck.slides;
        totalSlidesCount = convertedDeck.totalSlides;
      }

      const presentationPayload: Omit<Presentation, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim() || `PowerPoint learning presentation for ${currentTopicTitle}.`,
        topicId: selectedTopicId,
        topicTitle: currentTopicTitle,
        subject,
        grade,
        section: editPresentation?.section || 'STEM-A',
        quarter,
        ilawLessonId: selectedTopicId,
        ilawLessonTitle: currentTopicTitle,
        fileSize: fileSizeToSave,
        fileSizeBytes: fileSizeBytesToSave,
        visibility: isAvailableToStudents ? 'students' : 'private',
        isAvailableToStudents,
        originalFileName: originalFileNameToSave,
        format: 'PPTX',
        conversionStatus: 'ready',
        slides: slidesToSave,
        totalSlides: totalSlidesCount,
        connectedQuizId: editPresentation?.connectedQuizId || `${selectedTopicId}-quiz-1`,
        connectedQuizTitle: editPresentation?.connectedQuizTitle || `${currentTopicTitle} Assessment`,
        suggestedAssessmentType: 'both',
        uploadedAt: new Date().toISOString(),
        convertedAt: new Date().toISOString()
      };

      // Instant optimistic save - non-blocking execution
      if (onSavePresentation) {
        onSavePresentation(presentationPayload);
      } else if (editPresentation?.id) {
        updatePresentation(editPresentation.id, presentationPayload);
      } else {
        addPresentation(presentationPayload as any);
      }
      onClose();
    } catch (saveErr: any) {
      console.error('Save presentation error:', saveErr);
      setErrorMessage('Failed to save presentation resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-sky-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                Learning Resources • Teacher Portal
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {editPresentation ? 'Edit PowerPoint Resource' : 'Upload PowerPoint Presentation'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* FILE UPLOAD DROPZONE */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              PowerPoint File (.pptx) <span className="text-rose-500">*</span>
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/70 scale-[1.01]'
                  : uploadStage === 'error'
                  ? 'border-rose-300 bg-rose-50/50'
                  : uploadStage === 'success'
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : editPresentation ? `Current File: ${editPresentation.originalFileName || 'presentation.pptx'}` : 'Click to browse or drag & drop PowerPoint'}
                </p>
                <p className="text-xs text-slate-500">
                  Accepts <span className="font-semibold text-slate-700">.pptx</span> files up to 50 MB
                </p>
              </div>

              {selectedFile && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                  {formatBytes(selectedFile.size)} • Ready for conversion
                </span>
              )}
            </div>

            {/* UPLOAD PROGRESS BAR */}
            {uploadStage !== 'idle' && uploadStage !== 'error' && uploadStage !== 'success' && (
              <div className="space-y-2 p-3.5 bg-indigo-50/90 rounded-2xl border border-indigo-100 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>
                      {uploadProgress < 30 && 'Step 1/3: Uploading & validating PowerPoint (.pptx)...'}
                      {uploadProgress >= 30 && uploadProgress < 75 && 'Step 2/3: Converting presentation to vector PDF document...'}
                      {uploadProgress >= 75 && 'Step 3/3: Rendering PDF pages into high-resolution slide images...'}
                    </span>
                  </span>
                  <span className="font-mono text-indigo-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-indigo-200/80 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-0.5">
                  <span className={uploadProgress >= 20 ? 'text-indigo-600' : ''}>1. PPTX Upload</span>
                  <span className={uploadProgress >= 50 ? 'text-indigo-600' : ''}>2. PDF Conversion</span>
                  <span className={uploadProgress >= 85 ? 'text-emerald-600' : ''}>3. Slide Image Render</span>
                </div>
              </div>
            )}

            {/* ERROR MESSAGE DISPLAY */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-black">Validation Error: </strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* SUCCESS BANNER & SUMMARY DISPLAY */}
            {uploadStage === 'success' && validationSummary && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>✓ PowerPoint → PDF → Slide Images Converted</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    Ready to Present
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Filename</span>
                    <span className="font-bold text-slate-800 truncate block" title={validationSummary.fileName}>
                      {validationSummary.fileName}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Slide Images</span>
                    <span className="font-bold text-indigo-700">
                      {validationSummary.slideCount} Images Rendered
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">File Size</span>
                    <span className="font-bold text-slate-800">
                      {validationSummary.fileSize}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Upload Date</span>
                    <span className="font-bold text-slate-800">
                      {validationSummary.uploadDate}
                    </span>
                  </div>
                </div>

                {/* Converted Slide Images Visual Strip */}
                {convertedDeck && convertedDeck.slides && convertedDeck.slides.length > 0 && (
                  <div className="pt-2 border-t border-emerald-200/60">
                    <p className="text-[11px] font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rendered Slide Previews ({convertedDeck.slides.length} slides):</span>
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      {convertedDeck.slides.slice(0, 5).map((sl: any, idx: number) => (
                        <div key={idx} className="w-24 aspect-[16/9] rounded-lg overflow-hidden border border-emerald-200 bg-slate-900 shrink-0 relative shadow-sm">
                          <img src={sl.imageUrl} alt="" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold bg-slate-900/90 text-white px-1 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                      {convertedDeck.slides.length > 5 && (
                        <div className="w-16 aspect-[16/9] rounded-lg border border-dashed border-emerald-300 bg-white flex items-center justify-center text-[10px] font-bold text-emerald-700 shrink-0">
                          +{convertedDeck.slides.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-emerald-800 flex items-center gap-1.5 font-medium pt-1">
                  <span>Linked ILAW Lesson:</span>
                  <strong className="text-emerald-950 font-black">{validationSummary.linkedLessonTitle}</strong>
                </div>
              </motion.div>
            )}
          </div>

          {/* RESOURCE TITLE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Functions and Their Graphs"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* CURRICULUM SELECTORS: GRADE, SUBJECT, QUARTER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Grade Level
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="Senior High School">Senior High School (All)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="General Mathematics">General Mathematics</option>
                <option value="Pre-Calculus">Pre-Calculus</option>
                <option value="Basic Calculus">Basic Calculus</option>
                <option value="Statistics and Probability">Statistics and Probability</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Quarter
              </label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Quarter 1">Quarter 1</option>
                <option value="Quarter 2">Quarter 2</option>
                <option value="Quarter 3">Quarter 3</option>
                <option value="Quarter 4">Quarter 4</option>
              </select>
            </div>
          </div>

          {/* ILAW LESSON ATTACHMENT */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Attach to ILAW Lesson <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-medium text-indigo-600">Appears inside student lesson cycle</span>
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {topics.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.term || 'Quarter 1'})
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Description / Notes for Students
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Comprehensive PowerPoint slide deck covering relations, functions, vertical line test, and piecewise modeling."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* VISIBILITY CHECKBOX */}
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between cursor-pointer" onClick={() => setIsAvailableToStudents(!isAvailableToStudents)}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="visibilityCheckbox"
                checked={isAvailableToStudents}
                onChange={(e) => setIsAvailableToStudents(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
              <div>
                <label htmlFor="visibilityCheckbox" className="text-xs font-black text-slate-900 cursor-pointer block">
                  ☑ Available to students
                </label>
                <p className="text-[11px] text-slate-500">
                  When enabled, Grade 11 students enrolled in this subject can view the presentation directly in their ILAW lesson.
                </p>
              </div>
            </div>
            {isAvailableToStudents ? (
              <Eye className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400 shrink-0" />
            )}
          </div>

          {/* MODAL ACTIONS */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Resource...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editPresentation ? 'Update Resource' : 'Publish PowerPoint Resource'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
