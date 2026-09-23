import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Save, 
  Check, 
  GraduationCap, 
  Award, 
  Sliders, 
  School, 
  User,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../../types';

interface TeacherSettingsViewProps {
  profile: UserProfile;
}

export default function TeacherSettingsView({ profile }: TeacherSettingsViewProps) {
  const [teacherName, setTeacherName] = useState(profile.displayName || profile.email?.split('@')[0] || 'Teacher');
  const [schoolName, setSchoolName] = useState('SSHS Senior High School Department');
  const [subject, setSubject] = useState('Grade 11 - General Mathematics');
  const [academicYear, setAcademicYear] = useState('SY 2026-2027');
  const [currentTerm, setCurrentTerm] = useState('Term 1');
  const [writtenWorkWeight, setWrittenWorkWeight] = useState(25);
  const [performanceTaskWeight, setPerformanceTaskWeight] = useState(50);
  const [quarterlyExamWeight, setQuarterlyExamWeight] = useState(25);
  const [passingThreshold, setPassingThreshold] = useState(75);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const totalWeight = writtenWorkWeight + performanceTaskWeight + quarterlyExamWeight;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-200 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span>Faculty Settings</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Grading Weights & Academic Configuration</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Customize official DepEd grading weights (DepEd D.O. 8, s. 2015), active academic quarter, passing thresholds, and faculty profile credentials.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Teacher settings and grading weights updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. DepEd Grading Formula Weights */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">DepEd Order No. 8, s. 2015 Grading Weights</h3>
              <p className="text-xs text-slate-500">Core senior high school mathematics component distribution</p>
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
              totalWeight === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              Total: {totalWeight}% (Must equal 100%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Written Work (WW) Weight
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={writtenWorkWeight}
                  onChange={(e) => setWrittenWorkWeight(Number(e.target.value))}
                  min={10}
                  max={60}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <p className="text-[10px] text-slate-400">Quizzes, formative checks & step problems</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Performance Tasks (PT) Weight
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={performanceTaskWeight}
                  onChange={(e) => setPerformanceTaskWeight(Number(e.target.value))}
                  min={20}
                  max={70}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <p className="text-[10px] text-slate-400">Pathways, models, real-world case tasks</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Quarterly Assessment (QA) Weight
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={quarterlyExamWeight}
                  onChange={(e) => setQuarterlyExamWeight(Number(e.target.value))}
                  min={10}
                  max={40}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
              <p className="text-[10px] text-slate-400">Table of Specifications (TOS) exam</p>
            </div>
          </div>
        </div>

        {/* 2. School Term & Active Context */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">Academic Term & Passing Benchmark</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                School Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Active Term / Quarter
              </label>
              <select
                value={currentTerm}
                onChange={(e) => setCurrentTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
              >
                <option value="Term 1">Term 1 (First Quarter)</option>
                <option value="Term 2">Term 2 (Second Quarter)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Minimum Passing Benchmark
              </label>
              <select
                value={passingThreshold}
                onChange={(e) => setPassingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
              >
                <option value={75}>75% (Standard DepEd Passing Threshold)</option>
                <option value={80}>80% (Advanced STEM Competency Threshold)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Teacher Profile */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">Faculty Credentials & Subject Assignment</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Teacher Name
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Assigned Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Teacher Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
