import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Users, 
  LogOut, 
  Zap, 
  Database, 
  Video, 
  Layers, 
  HelpCircle, 
  Trophy, 
  FileText,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';

import FacultyDashboard from '../components/FacultyDashboard';
import FacultyRankingsView from '../components/FacultyRankingsView';
import FacultyReportsManager from '../components/FacultyReportsManager';
import CurriculumManager from '../components/CurriculumManager';
import ItemBankManager from '../components/ItemBankManager';
import FacultyVideoManager from '../components/FacultyVideoManager';
import FacultyPresentationManager from '../components/FacultyPresentationManager';
import DiagnosticManager from '../components/DiagnosticManager';
import { topics } from '../data/curriculum';
import { useAllStudents, useTeacherReports } from '../hooks/useFirebase';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface FacultyModuleProps {
  profile: UserProfile;
  onLogout: () => void;
}

type TabType = 'faculty' | 'rankings' | 'reports' | 'materials' | 'curriculum' | 'items' | 'diagnostic';
type MaterialSubTab = 'presentations' | 'videos';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  description: string;
}

export default function FacultyModule({ profile, onLogout }: FacultyModuleProps) {
  const [activeTab, setActiveTab] = useState<TabType>('faculty');
  const [materialSubTab, setMaterialSubTab] = useState<MaterialSubTab>('presentations');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [reportPreselectedStudent, setReportPreselectedStudent] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { students, loading: studentsLoading } = useAllStudents();
  const { reports, loading: reportsLoading, saveReport, deleteReport } = useTeacherReports();

  const handleOpenAddReportForStudent = (student?: UserProfile) => {
    setReportPreselectedStudent(student || null);
    setActiveTab('reports');
    setIsMobileMenuOpen(false);
  };

  const navItems: NavItem[] = [
    {
      id: 'faculty',
      label: 'Students',
      icon: <Users className="w-4 h-4" />,
      badge: students.length > 0 ? `${students.length}` : undefined,
      description: 'Manage profiles, LRNs, and progress'
    },
    {
      id: 'rankings',
      label: 'Rankings',
      icon: <Trophy className="w-4 h-4 text-amber-400" />,
      description: 'Leaderboard, badges, and oral points'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      badge: reports.length > 0 ? `${reports.length}` : undefined,
      description: 'Student progress & narrative reports'
    },
    {
      id: 'materials',
      label: 'Learning Materials',
      icon: <FolderOpen className="w-4 h-4 text-emerald-400" />,
      description: 'Slide decks & video lectures'
    },
    {
      id: 'curriculum',
      label: 'Curriculum',
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      description: 'Topics, quizzes & learning pathways'
    },
    {
      id: 'items',
      label: 'Item Bank',
      icon: <Database className="w-4 h-4 text-violet-400" />,
      description: 'Question items & psychometrics'
    },
    {
      id: 'diagnostic',
      label: 'Diagnostic',
      icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
      description: 'Adaptive diagnostic assessments'
    }
  ];

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'faculty': return { title: 'Student Management', subtitle: 'View learner records, credentials, and progress tracking' };
      case 'rankings': return { title: 'Class Rankings & Leaderboard', subtitle: 'XP standings, achievements, and oral recitation awards' };
      case 'reports': return { title: 'Narrative Reports & Feedback', subtitle: 'Generate, edit, and export personalized student evaluations' };
      case 'materials':
        return materialSubTab === 'presentations'
          ? { title: 'Learning Materials — Slide Decks', subtitle: 'Manage slide presentations and view student viewing analytics' }
          : { title: 'Learning Materials — Video Lectures', subtitle: 'Curate video lessons and YouTube lecture resources' };
      case 'curriculum': return { title: 'Curriculum & Topics', subtitle: 'Manage Grade 11 Mathematics modules and quizzes' };
      case 'items': return { title: 'Question Item Bank', subtitle: 'Create, author, and calibrate assessment questions' };
      case 'diagnostic': return { title: 'Diagnostic Assessment Manager', subtitle: 'Configure diagnostic tests and misconception rules' };
      default: return { title: 'Faculty Dashboard', subtitle: 'MathQuest Admin Portal' };
    }
  };

  const activeTabMeta = getActiveTabTitle();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="w-72 bg-slate-900 text-slate-100 flex-col h-screen sticky top-0 border-r border-slate-800 z-30 hidden lg:flex shrink-0 shadow-2xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3.5 bg-slate-950/40">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40 ring-1 ring-indigo-400/30 shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-tight">Faculty Hub</h1>
            <p className="text-[11px] text-slate-400 font-medium">MathQuest Grade 11 Admin</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-5 py-4 border-b border-slate-800/60 bg-slate-900/80">
          <div className="flex items-center gap-3 p-2.5 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-sm shrink-0">
              {profile.displayName?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                <span className="truncate">{profile.displayName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </div>
              <div className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-indigo-800/50">
                Faculty Admin
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400/90">
            Management Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all relative group text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 group-hover:text-white group-hover:bg-slate-700'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <span className="block truncate">{item.label}</span>
                    <span className={`block text-[10px] font-normal truncate ${isActive ? 'text-indigo-100/80' : 'text-slate-400'}`}>
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ml-1 ${
                    isActive 
                      ? 'bg-white text-indigo-700' 
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-rose-950/50 hover:border-rose-800/60 text-slate-300 hover:text-rose-200 rounded-2xl border border-slate-700/50 text-xs font-bold transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
              <span>Sign Out</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </button>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Faculty Hub</h1>
            <p className="text-[10px] text-slate-400">MathQuest Grade 11 Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 bg-slate-900 text-slate-100 h-full flex flex-col p-4 shadow-2xl border-r border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-sm text-white">Sidebar Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile in Drawer */}
              <div className="mb-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                  {profile.displayName?.charAt(0).toUpperCase() || 'F'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{profile.displayName}</div>
                  <div className="text-[10px] text-indigo-300">Faculty Admin</div>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-left ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 mt-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-3 text-rose-300 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header Bar for Active Tab Title */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-20 shadow-xs hidden lg:block">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{activeTabMeta.title}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{activeTabMeta.subtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>{profile.displayName}</span>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'rankings' ? (
              <motion.div key="rankings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <FacultyRankingsView 
                  students={students}
                  loading={studentsLoading}
                  onOpenAddReport={(student) => handleOpenAddReportForStudent(student)}
                />
              </motion.div>
            ) : activeTab === 'reports' ? (
              <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <FacultyReportsManager 
                  students={students}
                  reports={reports}
                  loading={reportsLoading}
                  facultyProfile={profile}
                  onSaveReport={saveReport}
                  onDeleteReport={deleteReport}
                  preselectedStudent={reportPreselectedStudent}
                  onClearPreselectedStudent={() => setReportPreselectedStudent(null)}
                />
              </motion.div>
            ) : activeTab === 'materials' ? (
              <motion.div key="materials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }} className="space-y-6">
                {/* Learning Materials Sub-Navigation Switcher */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-2">
                  <button
                    onClick={() => setMaterialSubTab('presentations')}
                    className={`flex-1 min-w-[180px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
                      materialSubTab === 'presentations'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    <Layers className={`w-4 h-4 ${materialSubTab === 'presentations' ? 'text-white' : 'text-emerald-500'}`} />
                    <span>Slide Presentations</span>
                  </button>

                  <button
                    onClick={() => setMaterialSubTab('videos')}
                    className={`flex-1 min-w-[180px] flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs transition-all ${
                      materialSubTab === 'videos'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    <Video className={`w-4 h-4 ${materialSubTab === 'videos' ? 'text-white' : 'text-rose-500'}`} />
                    <span>Video Lectures</span>
                  </button>
                </div>

                {/* Selected Learning Material Manager */}
                {materialSubTab === 'presentations' ? (
                  <FacultyPresentationManager topics={topics} facultyName={profile.displayName} facultyUid={profile.uid} />
                ) : (
                  <FacultyVideoManager topics={topics} />
                )}
              </motion.div>
            ) : activeTab === 'curriculum' ? (
              <motion.div key="curriculum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <CurriculumManager />
              </motion.div>
            ) : activeTab === 'items' ? (
              <motion.div key="items" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <ItemBankManager />
              </motion.div>
            ) : activeTab === 'diagnostic' ? (
              <motion.div key="diagnostic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <DiagnosticManager />
              </motion.div>
            ) : (
              <motion.div key="faculty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                <FacultyDashboard facultyProfile={profile} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ConfirmDeleteModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Faculty Hub"
        message="Are you sure you want to log out of the MathQuest Faculty Management Portal?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="logout"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
