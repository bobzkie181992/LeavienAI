import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Check, 
  AlertCircle, 
  X, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Clock, 
  Loader2, 
  FileCheck, 
  Download,
  Trash2,
  RefreshCw,
  Target,
  GraduationCap
} from 'lucide-react';
import { Topic, LessonPlan } from '../types';
import { parseDocxFile, ParsedDocxLesson } from '../utils/docxIlawParser';

interface ImportIlawDocxModalProps {
  isOpen: boolean;
  topics: Topic[];
  onClose: () => void;
  onImportComplete: (importedLessons: (Partial<LessonPlan> & { title: string })[]) => Promise<void>;
}

export default function ImportIlawDocxModal({
  isOpen,
  topics,
  onClose,
  onImportComplete
}: ImportIlawDocxModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Parsed files list
  const [parsedFiles, setParsedFiles] = useState<ParsedDocxLesson[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [previewTab, setPreviewTab] = useState<'structured' | 'raw'>('structured');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    const docxFiles = Array.from(files).filter(f => 
      f.name.endsWith('.docx') || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    if (docxFiles.length === 0) {
      setErrorMsg('Please upload valid Microsoft Word (.docx) documents.');
      return;
    }

    setIsParsing(true);
    setErrorMsg(null);

    try {
      const results: ParsedDocxLesson[] = [];
      for (const file of docxFiles) {
        const parsed = await parseDocxFile(file);
        results.push(parsed);
      }

      setParsedFiles(prev => [...prev, ...results]);
      setActiveFileIndex(parsedFiles.length); // focus on the newly uploaded file
    } catch (err: any) {
      console.error('Error parsing docx file:', err);
      setErrorMsg(err.message || 'Failed to extract text from DOCX file. Make sure the file is not corrupted or password protected.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    setParsedFiles(prev => prev.filter((_, i) => i !== index));
    if (activeFileIndex >= index && activeFileIndex > 0) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };

  const handleUpdateCurrentField = (field: string, value: any) => {
    if (!parsedFiles[activeFileIndex]) return;

    setParsedFiles(prev => {
      const updated = [...prev];
      const target = { ...updated[activeFileIndex] };
      const lesson = { ...target.lesson };

      if (field === 'title') lesson.title = value;
      else if (field === 'term') lesson.term = value;
      else if (field === 'week') lesson.week = value;
      else if (field === 'topicId') lesson.topicId = value;
      else if (field === 'intentions' && lesson.ilaw) {
        lesson.ilaw.intentions.learningIntentions = value;
      } else if (field === 'learningExperience' && lesson.ilaw) {
        lesson.ilaw.learningExperience.primingActivity = value;
      } else if (field === 'assessingLearning' && lesson.ilaw) {
        lesson.ilaw.assessingLearning.formativeAssessment = value;
      } else if (field === 'waysForward' && lesson.ilaw) {
        lesson.ilaw.waysForward.remediationAction = value;
      }

      target.lesson = lesson;
      updated[activeFileIndex] = target;
      return updated;
    });
  };

  const handleConfirmImport = async (status: 'Published' | 'Draft') => {
    if (parsedFiles.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payloads = parsedFiles.map(p => ({
        ...p.lesson,
        status,
        updatedAt: status === 'Published' ? 'Imported & Published from DOCX' : 'Imported Draft from DOCX'
      }));

      await onImportComplete(payloads);
      onClose();
    } catch (err: any) {
      console.error('Error saving imported lessons:', err);
      setErrorMsg(err.message || 'Failed to save imported lessons.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentParsed = parsedFiles[activeFileIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase rounded-md">
                  Mammoth DOCX Parser
                </span>
                <span className="text-xs text-slate-400">DepEd Order No. 016, s. 2024</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Import ILAW Lesson Plans from Word (.docx)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            <div className="space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                {isParsing ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  {isParsing ? 'Parsing Word Document...' : 'Drag & drop DepEd .docx files here, or click to browse'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Supports DepEd Daily Lesson Plans (DLP), Daily Lesson Logs (DLL), and ILAW documents. Multiple files supported.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-700">
                  .DOCX Format
                </span>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-700">
                  Auto-Extract 4 Pillars
                </span>
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-700">
                  MELCs Alignment
                </span>
              </div>
            </div>
          </div>

          {/* Parsed Files Review Area */}
          {parsedFiles.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-black text-slate-900 text-sm">
                    Parsed Documents ({parsedFiles.length})
                  </h4>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {parsedFiles.map((file, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFileIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        activeFileIndex === idx
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="max-w-[120px] truncate">{file.fileName}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                        file.confidence >= 70 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {file.confidence}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Document Editor / Preview */}
              {currentParsed && (
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                        {activeFileIndex + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{currentParsed.fileName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({Math.round(currentParsed.fileSize / 1024)} KB)</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Extraction Confidence: <b className="text-emerald-700">{currentParsed.confidence}%</b> (All 4 pillars detected)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setPreviewTab('structured')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            previewTab === 'structured' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          ILAW Structure
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTab('raw')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            previewTab === 'raw' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                          }`}
                        >
                          Raw Text
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(activeFileIndex)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {previewTab === 'structured' ? (
                    <div className="space-y-4">
                      {/* Title & Metadata Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Extracted Title
                          </label>
                          <input
                            type="text"
                            value={currentParsed.lesson.title}
                            onChange={(e) => handleUpdateCurrentField('title', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Quarter / Term
                          </label>
                          <select
                            value={currentParsed.lesson.term || 'Term 1'}
                            onChange={(e) => handleUpdateCurrentField('term', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="Term 1">Term 1 (Quarter 1)</option>
                            <option value="Term 2">Term 2 (Quarter 2)</option>
                            <option value="Term 3">Term 3 (Quarter 3)</option>
                            <option value="Term 4">Term 4 (Quarter 4)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Curriculum Week
                          </label>
                          <select
                            value={currentParsed.lesson.week || 'Week 1'}
                            onChange={(e) => handleUpdateCurrentField('week', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            {Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`).map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 4 Pillars Matrix Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Pillar 1: Intentions */}
                        <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                              I
                            </span>
                            <span className="text-[11px] font-black text-indigo-950 uppercase">
                              1. Intentions (Objectives)
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={currentParsed.lesson.ilaw?.intentions.learningIntentions || ''}
                            onChange={(e) => handleUpdateCurrentField('intentions', e.target.value)}
                            className="w-full p-2.5 bg-white border border-indigo-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Pillar 2: Learning Experience */}
                        <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-sky-600 text-white font-black text-[10px] flex items-center justify-center">
                              L
                            </span>
                            <span className="text-[11px] font-black text-sky-950 uppercase">
                              2. Learning Experience (Procedures)
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={currentParsed.lesson.ilaw?.learningExperience.primingActivity || ''}
                            onChange={(e) => handleUpdateCurrentField('learningExperience', e.target.value)}
                            className="w-full p-2.5 bg-white border border-sky-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>

                        {/* Pillar 3: Assessing Learning */}
                        <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                              A
                            </span>
                            <span className="text-[11px] font-black text-emerald-950 uppercase">
                              3. Assessing Learning (Formative)
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={currentParsed.lesson.ilaw?.assessingLearning.formativeAssessment || ''}
                            onChange={(e) => handleUpdateCurrentField('assessingLearning', e.target.value)}
                            className="w-full p-2.5 bg-white border border-emerald-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Pillar 4: Ways Forward */}
                        <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-black text-[10px] flex items-center justify-center">
                              W
                            </span>
                            <span className="text-[11px] font-black text-amber-950 uppercase">
                              4. Ways Forward (Remediation)
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={currentParsed.lesson.ilaw?.waysForward.remediationAction || ''}
                            onChange={(e) => handleUpdateCurrentField('waysForward', e.target.value)}
                            className="w-full p-2.5 bg-white border border-amber-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 font-mono text-xs text-slate-700 max-h-64 overflow-y-auto whitespace-pre-wrap">
                      {currentParsed.rawText}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {parsedFiles.length > 0
              ? `Ready to import ${parsedFiles.length} DepEd ILAW lesson plan${parsedFiles.length > 1 ? 's' : ''}`
              : 'Upload .docx files to begin extraction'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {parsedFiles.length > 0 && (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleConfirmImport('Draft')}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save as Drafts
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleConfirmImport('Published')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Imported Lessons...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Import & Publish All ({parsedFiles.length})</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
