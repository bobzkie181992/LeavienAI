import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  Target, 
  FileText, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { UserProfile, Topic } from '../../types';
import FacultyRankingsView from '../FacultyRankingsView';
import FacultyReportsManager from '../FacultyReportsManager';
import TeacherAnalyticsPage from './TeacherAnalyticsPage';

interface TeacherAnalyticsViewProps {
  students: UserProfile[];
  topics: Topic[];
  profile?: UserProfile;
  initialSubTab?: 'class' | 'progress' | 'competency' | 'reports' | 'interactive';
  preselectedStudentForReport?: UserProfile | null;
  onClearPreselectedStudent?: () => void;
  reports?: any[];
  reportsLoading?: boolean;
  saveReport?: (report: any) => Promise<any>;
  deleteReport?: (reportId: string) => Promise<void>;
  studentsLoading?: boolean;
}

export default function TeacherAnalyticsView({
  students,
  topics,
  profile,
  initialSubTab = 'class',
  preselectedStudentForReport,
  onClearPreselectedStudent,
  reports = [],
  reportsLoading = false,
  saveReport = async () => {},
  deleteReport = async () => {},
  studentsLoading = false
}: TeacherAnalyticsViewProps) {
  const [subTab, setSubTab] = useState<'class' | 'progress' | 'competency' | 'reports' | 'interactive'>(
    initialSubTab === 'class' ? 'interactive' : initialSubTab
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-rose-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>Academic Intelligence & Analytics</span>
            </span>
            <span className="bg-white/10 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Real-Time Learning Metrics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Class Performance & Competency Tracking</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Analyze leaderboard standings, award oral recitation bonus XP, track student competency progression against DepEd MELCs, and author formal narrative reports.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('interactive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'interactive'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-rose-400" />
          <span>Interactive Class Analytics</span>
        </button>

        <button
          onClick={() => setSubTab('class')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'class'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Class Performance & Rankings</span>
        </button>

        <button
          onClick={() => setSubTab('progress')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'progress'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Student Progress Trajectories</span>
        </button>

        <button
          onClick={() => setSubTab('competency')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'competency'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4 text-sky-400" />
          <span>Competency Tracking (MELCs)</span>
        </button>

        <button
          onClick={() => setSubTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === 'reports'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Assessment Reports & Feedback</span>
        </button>
      </div>

      {/* 0. INTERACTIVE ANALYTICS & FILTERING */}
      {subTab === 'interactive' && (
        <TeacherAnalyticsPage
          students={students}
          topics={topics}
          profile={profile}
        />
      )}

      {/* 1. CLASS PERFORMANCE & RANKINGS */}
      {subTab === 'class' && (
        <div>
          <FacultyRankingsView 
            students={students} 
            loading={studentsLoading} 
          />
        </div>
      )}

      {/* 2. STUDENT PROGRESS */}
      {subTab === 'progress' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Student Progress & Mastery Overview</h3>
              <p className="text-xs text-slate-500">Live streak, level, and assessment score metrics</p>
            </div>
          </div>

          <div className="grid gap-3">
            {students.slice(0, 10).map((s) => (
              <div
                key={s.uid}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 font-black flex items-center justify-center">
                    {(s.displayName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{s.displayName || s.email}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold">{s.section || 'STEM-A'} • LRN: {s.lrn || 'Pending'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm">{s.xp || 0} XP</span>
                    <span className="text-[10px] text-amber-600 font-bold block">{s.streak || 0} Day Streak</span>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs">
                    Lvl {s.level || 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. COMPETENCY TRACKING (MELCS) */}
      {subTab === 'competency' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-900">Most Essential Learning Competencies (MELCs) Class Heatmap</h3>

          <div className="space-y-4">
            {topics.map((t, i) => {
              const mockMastery = 75 + ((i * 7) % 20);

              return (
                <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{t.title}</span>
                    <span className={mockMastery >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                      {mockMastery}% Class Average
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${mockMastery >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${mockMastery}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ASSESSMENT REPORTS */}
      {subTab === 'reports' && (
        <div>
          <FacultyReportsManager
            students={students}
            reports={reports}
            loading={reportsLoading}
            facultyProfile={profile}
            onSaveReport={saveReport}
            onDeleteReport={deleteReport}
            preselectedStudent={preselectedStudentForReport}
            onClearPreselectedStudent={onClearPreselectedStudent}
          />
        </div>
      )}
    </div>
  );
}
