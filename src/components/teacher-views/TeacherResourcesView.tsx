import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FolderOpen, 
  Layers, 
  Video, 
  FileSpreadsheet, 
  Share2, 
  Upload, 
  Download, 
  PlusCircle, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { Topic, UserProfile } from '../../types';
import FacultyPresentationManager from '../FacultyPresentationManager';
import FacultyVideoManager from '../FacultyVideoManager';

interface TeacherResourcesViewProps {
  topics: Topic[];
  profile: UserProfile;
  initialSubTab?: 'materials' | 'worksheets' | 'shared';
}

export default function TeacherResourcesView({
  topics,
  profile,
  initialSubTab = 'materials'
}: TeacherResourcesViewProps) {
  const [subTab, setSubTab] = useState<'materials' | 'worksheets' | 'shared'>(initialSubTab);
  const [materialType, setMaterialType] = useState<'presentations' | 'videos'>('presentations');

  const sharedFiles = [
    {
      title: 'DepEd Grade 11 General Mathematics Curriculum Guide (CG)',
      type: 'PDF Document',
      size: '2.4 MB',
      updatedBy: 'Math Department Head',
      updatedAt: 'Aug 2026'
    },
    {
      title: 'Senior High School Table of Specifications (TOS) Template',
      type: 'Excel Spreadsheet',
      size: '850 KB',
      updatedBy: 'Teacher Juan Dela Cruz',
      updatedAt: 'Sep 2026'
    },
    {
      title: 'DepEd Order No. 016, s. 2024 ILAW Exemplar Compendium',
      type: 'DOCX Format',
      size: '4.1 MB',
      updatedBy: 'Curriculum Coordinator',
      updatedAt: 'Sep 2026'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-teal-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              <span>Instructional Resource Repository</span>
            </span>
            <span className="bg-white/10 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Teaching Media & Assets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Teaching Materials & Shared Resources</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage interactive slide presentations, curate explainer video lectures, author downloadable student worksheets, and collaborate on shared department assets.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'materials'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-teal-400" />
          <span>Teaching Materials (Slides & Videos)</span>
        </button>

        <button
          onClick={() => setSubTab('worksheets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'worksheets'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Printable Worksheets</span>
        </button>

        <button
          onClick={() => setSubTab('shared')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'shared'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Share2 className="w-4 h-4 text-indigo-400" />
          <span>Shared Resources</span>
        </button>
      </div>

      {/* 1. TEACHING MATERIALS (SLIDES & VIDEOS) */}
      {subTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit gap-1">
            <button
              onClick={() => setMaterialType('presentations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                materialType === 'presentations'
                  ? 'bg-white text-indigo-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Slide Presentations
            </button>
            <button
              onClick={() => setMaterialType('videos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                materialType === 'videos'
                  ? 'bg-white text-rose-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Video Lectures
            </button>
          </div>

          {materialType === 'presentations' ? (
            <FacultyPresentationManager 
              topics={topics} 
              facultyName={profile.displayName} 
              facultyUid={profile.uid} 
            />
          ) : (
            <FacultyVideoManager topics={topics} />
          )}
        </div>
      )}

      {/* 2. WORKSHEETS */}
      {subTab === 'worksheets' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Printable Math Worksheets & Problem Sets</h3>
              <p className="text-xs text-slate-500">Offline diagnostic and remediation printouts aligned with DepEd MELCs</p>
            </div>
            <button
              onClick={() => alert('Generating printable worksheet PDF...')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate New Worksheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {topics.map(t => (
              <div
                key={t.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{t.title} Problem Sheet</h4>
                  <span className="text-[10px] text-slate-400">{t.term} • 15 Formative Problems + Answer Key</span>
                </div>
                <button
                  onClick={() => alert(`Downloading worksheet for ${t.title}...`)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-200 text-xs transition-colors cursor-pointer"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SHARED RESOURCES */}
      {subTab === 'shared' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Mathematics Department Shared Cloud Drive</h3>
                <p className="text-xs text-slate-500">Official syllabi, curriculum guides, and TOS blueprints</p>
              </div>
              <button
                onClick={() => alert('Uploading department file...')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
            </div>

            <div className="grid gap-3 pt-2">
              {sharedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{file.title}</h4>
                      <p className="text-[10px] text-slate-400">
                        {file.type} • {file.size} • Uploaded by {file.updatedBy} ({file.updatedAt})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Downloading ${file.title}...`)}
                    className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
