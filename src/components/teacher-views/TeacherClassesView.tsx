import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  Layers, 
  Search, 
  Key, 
  ShieldCheck, 
  UserCheck, 
  Trophy, 
  CheckCircle2, 
  Clock,
  Filter,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../../types';
import { GRADE_11_SECTIONS, GRADE_11_STUDENTS } from '../../data/grade11SampleData';
import FacultyDashboard from '../FacultyDashboard';

interface TeacherClassesViewProps {
  students: UserProfile[];
  profile?: UserProfile;
  initialSubTab?: 'grade11' | 'sections' | 'students';
  onAddReportForStudent?: (student: UserProfile) => void;
}

export default function TeacherClassesView({
  students,
  profile,
  initialSubTab = 'students',
  onAddReportForStudent
}: TeacherClassesViewProps) {
  const [subTab, setSubTab] = useState<'grade11' | 'sections' | 'students'>(initialSubTab);
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract sections
  const sectionsList = ['STEM-A', 'STEM-B', 'STEM-C', 'ABM-A', 'ABM-B', 'HUMSS-A', 'TVL-ICT', 'GAS-A'];

  const getSectionCount = (sec: string) => {
    return students.filter(s => s.section === sec).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Classroom Administration</span>
            </span>
            <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Grade 11 Enrolled Cohort
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Class Rosters & Student Records</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor Grade 11 enrollment, filter across Senior High School sections and academic strands, manage LRN records, and reset student PIN credentials.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'students'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Student Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setSubTab('sections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'sections'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Sections & Strands</span>
        </button>

        <button
          onClick={() => setSubTab('grade11')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'grade11'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span>Grade 11 Overview</span>
        </button>
      </div>

      {/* 1. STUDENT DIRECTORY */}
      {subTab === 'students' && (
        <div>
          <FacultyDashboard facultyProfile={profile} />
        </div>
      )}

      {/* 2. SECTIONS & STRANDS */}
      {subTab === 'sections' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GRADE_11_SECTIONS.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      {sec.trackStrand} Track
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {sec.roomNumber}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-base">{sec.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Adviser: {sec.adviser}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Sched: {sec.scheduleTime}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">{sec.studentCount} Students</span>
                    <span className="text-indigo-600">{sec.averageMastery}% Mastery</span>
                  </div>
                  <button
                    onClick={() => setSubTab('students')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>View Class Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GRADE 11 OVERVIEW */}
      {subTab === 'grade11' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900">Grade 11 Academic Cohort Diagnostics</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Enrolled</span>
              <p className="text-2xl font-black text-indigo-600">{students.length || 24}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Mastery</span>
              <p className="text-2xl font-black text-emerald-600">82.4%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Passing Rate</span>
              <p className="text-2xl font-black text-sky-600">88%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Intervention Count</span>
              <p className="text-2xl font-black text-amber-600">3</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
