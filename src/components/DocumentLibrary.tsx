import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  Copy, 
  Eye, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Sparkles, 
  FileCode, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Printer,
  FileSpreadsheet,
  FileCheck,
  X
} from 'lucide-react';
import { ImportedDocument, DocumentFormat, DocumentStatus, Topic } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface DocumentLibraryProps {
  documents: ImportedDocument[];
  onUploadClick: () => void;
  onSelectDocument: (doc: ImportedDocument) => void;
  onDeleteDocument: (id: string) => void;
  onDuplicateDocument: (doc: ImportedDocument) => void;
  onReuseDocument: (doc: ImportedDocument) => void;
}

export default function DocumentLibrary({
  documents,
  onUploadClick,
  onSelectDocument,
  onDeleteDocument,
  onDuplicateDocument,
  onReuseDocument
}: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<ImportedDocument | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<ImportedDocument | null>(null);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.extractedMetadata.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = selectedFormat === 'ALL' || doc.format === selectedFormat;
    const matchesStatus = selectedStatus === 'ALL' || doc.status === selectedStatus;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  const getFormatBadge = (format: DocumentFormat) => {
    switch (format) {
      case 'DOCX':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-extrabold text-[10px]">DOCX</span>;
      case 'PDF':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-extrabold text-[10px]">PDF</span>;
      case 'PPTX':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-extrabold text-[10px]">PPTX</span>;
      case 'XLSX':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-extrabold text-[10px]">XLSX</span>;
      case 'IMAGE':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-extrabold text-[10px]">IMAGE</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-extrabold text-[10px]">{format}</span>;
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Published':
        return <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Published</span>;
      case 'Draft':
        return <span className="bg-amber-100 text-amber-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" /> Draft</span>;
      case 'Archived':
        return <span className="bg-slate-100 text-slate-600 font-extrabold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1"><Archive className="w-3 h-3" /> Archived</span>;
      default:
        return <span className="bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">Imported</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-black text-xs tracking-widest uppercase">
              <BookOpen className="w-4 h-4" />
              <span>DepEd ILAW Repository</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Teacher Document & Lesson Plan Library</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Manage uploaded educational documents, preview extracted content, audit DepEd D.O. 016 compliance, and reuse lesson plans across school quarters.
            </p>
          </div>
          <button
            onClick={onUploadClick}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition flex items-center justify-center gap-2 shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Import Document</span>
          </button>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search documents or lesson titles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Format:</span>
          </div>
          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Formats</option>
            <option value="DOCX">DOCX Word</option>
            <option value="PDF">PDF</option>
            <option value="PPTX">PowerPoint</option>
            <option value="XLSX">Excel</option>
            <option value="IMAGE">Printed Images</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-sm">No Educational Documents Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload DOCX, PDF, PPTX, or Image files to automatically parse and store them in your DepEd ILAW library.
          </p>
          <button
            onClick={onUploadClick}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-indigo-700 transition"
          >
            Upload Document Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {getFormatBadge(doc.format)}
                  {getStatusBadge(doc.status)}
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-1">
                    {doc.fileName}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    Topic: {doc.topicTitle}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-[11px] space-y-1 text-slate-700 font-serif border border-slate-100">
                  <p><strong>Grade:</strong> {doc.extractedMetadata.gradeLevel}</p>
                  <p className="line-clamp-1 font-mono text-[10px] text-indigo-700 font-bold">
                    {doc.extractedMetadata.learningCompetency}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    title="Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicateDocument(doc)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    title="Duplicate Document"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingDoc(doc)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onReuseDocument(doc)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1"
                >
                  <span>Reuse Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-3xl shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setPreviewDoc(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{previewDoc.fileName}</h3>
                  <p className="text-xs text-slate-500 font-medium">Uploaded {new Date(previewDoc.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-extrabold text-slate-900 text-sm mb-2">Extracted Metadata Overview</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 font-serif">
                    <p><strong>School:</strong> {previewDoc.extractedMetadata.schoolName}</p>
                    <p><strong>Teacher:</strong> {previewDoc.extractedMetadata.teacherName}</p>
                    <p><strong>Grade:</strong> {previewDoc.extractedMetadata.gradeLevel}</p>
                    <p><strong>Section:</strong> {previewDoc.extractedMetadata.section}</p>
                  </div>
                </div>

                {previewDoc.lessonPlan?.ilaw && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-sm">ILAW Framework Conversion</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <strong className="text-indigo-900 block font-sans uppercase text-[10px]">Intentions</strong>
                        <p className="text-slate-700 font-serif mt-1">{previewDoc.lessonPlan.ilaw.intentions.learningIntentions}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-900 block font-sans uppercase text-[10px]">Learning Experience</strong>
                        <p className="text-slate-700 font-serif mt-1">{previewDoc.lessonPlan.ilaw.learningExperience.primingActivity}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={!!deletingDoc}
        title="Delete Document"
        message={`Are you sure you want to delete "${deletingDoc?.fileName}" from the library? This action cannot be undone.`}
        confirmText="Delete Document"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deletingDoc) {
            onDeleteDocument(deletingDoc.id);
            setDeletingDoc(null);
          }
        }}
        onClose={() => setDeletingDoc(null)}
      />
    </div>
  );
}
