import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  Edit3, 
  ClipboardList, 
  FileText, 
  Users, 
  BarChart3, 
  FolderOpen, 
  Bell, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  X, 
  Zap,
  PlusCircle,
  FileCheck,
  GraduationCap,
  Sparkles,
  Layers,
  Database,
  Award,
  CheckCircle2,
  Clock,
  Search
} from 'lucide-react';
import { UserProfile } from '../types';

export type TeacherNavSection = 
  | 'dashboard'
  // Curriculum & Lessons (Merged)
  | 'curriculum-overview'
  | 'curriculum-ilaw'
  | 'curriculum-hierarchy'
  | 'curriculum-competencies'
  | 'curriculum-map'
  | 'lessons-my'
  | 'lessons-create'
  | 'lessons-import'
  | 'lessons-drafts'
  | 'lessons-published'
  | 'lessons-templates'
  // Activities
  | 'activities-create'
  | 'activities-active'
  | 'activities-submissions'
  // Assessments
  | 'assessments-diagnostic'
  | 'assessments-formative'
  | 'assessments-bank'
  | 'assessments-create'
  | 'assessments-diagnostic-results'
  | 'assessments-formative-results'
  | 'assessments-quizzes'
  | 'assessments-exams'
  // My Classes
  | 'classes-sections'
  | 'classes-students'
  // Analytics
  | 'analytics-class'
  | 'analytics-progress'
  | 'analytics-competency'
  | 'analytics-reports'
  // Resources
  | 'resources-teaching'
  | 'resources-worksheets'
  | 'resources-shared'
  // General
  | 'notifications'
  | 'settings';

interface TeacherSidebarProps {
  currentSection: TeacherNavSection;
  onNavigate: (section: TeacherNavSection) => void;
  profile: UserProfile;
  studentsCount?: number;
  pendingSubmissionsCount?: number;
  unreadNotificationsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout: () => void;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  children: {
    id: TeacherNavSection;
    label: string;
    badge?: string | number;
  }[];
}

export default function TeacherSidebar({
  currentSection,
  onNavigate,
  profile,
  studentsCount = 0,
  pendingSubmissionsCount = 3,
  unreadNotificationsCount = 4,
  isOpenMobile = false,
  onCloseMobile,
  onLogout
}: TeacherSidebarProps) {
  // Navigation groups definition: Unified Curriculum & Lesson Management
  const navGroups: NavGroup[] = [
    {
      id: 'curriculum-lessons',
      label: 'Curriculum & Lessons',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      defaultOpen: currentSection.startsWith('curriculum') || currentSection.startsWith('lessons'),
      children: [
        { id: 'curriculum-overview', label: 'Curriculum Overview' },
        { id: 'lessons-my', label: 'DepEd ILAW Lessons & DLP' },
        { id: 'lessons-create', label: 'Create ILAW Lesson' },
        { id: 'lessons-drafts', label: 'Draft Lessons' },
        { id: 'lessons-published', label: 'Published Lessons' },
        { id: 'curriculum-competencies', label: 'MELCs Competencies' },
        { id: 'curriculum-map', label: 'Curriculum Progression Map' },
        { id: 'curriculum-hierarchy', label: 'Curriculum Structure Tree' },
        { id: 'lessons-templates', label: 'Lesson Templates' }
      ]
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: <ClipboardList className="w-4 h-4 text-amber-400" />,
      defaultOpen: currentSection.startsWith('activities'),
      badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined,
      children: [
        { id: 'activities-create', label: 'Create Activity' },
        { id: 'activities-active', label: 'Active Activities' },
        { id: 'activities-submissions', label: 'Submissions', badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined }
      ]
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: <FileText className="w-4 h-4 text-violet-400" />,
      defaultOpen: currentSection.startsWith('assessments'),
      children: [
        { id: 'assessments-diagnostic', label: 'Diagnostic Assessments' },
        { id: 'assessments-formative', label: 'Formative Assessments' },
        { id: 'assessments-bank', label: 'Question Bank' },
        { id: 'assessments-diagnostic-results', label: 'Diagnostic Results' },
        { id: 'assessments-formative-results', label: 'Formative Results' },
        { id: 'assessments-quizzes', label: 'Quizzes' },
        { id: 'assessments-exams', label: 'Exams (TOS)' }
      ]
    },
    {
      id: 'classes',
      label: 'My Classes',
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      defaultOpen: currentSection.startsWith('classes'),
      badge: studentsCount > 0 ? studentsCount : undefined,
      children: [
        { id: 'classes-sections', label: 'Sections' },
        { id: 'classes-students', label: 'Students', badge: studentsCount > 0 ? studentsCount : undefined }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4 text-rose-400" />,
      defaultOpen: currentSection.startsWith('analytics'),
      children: [
        { id: 'analytics-class', label: 'Class Performance' },
        { id: 'analytics-progress', label: 'Student Progress' },
        { id: 'analytics-competency', label: 'Competency Tracking' },
        { id: 'analytics-reports', label: 'Assessment Reports' }
      ]
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: <FolderOpen className="w-4 h-4 text-teal-400" />,
      defaultOpen: currentSection.startsWith('resources'),
      children: [
        { id: 'resources-teaching', label: 'Teaching Materials' },
        { id: 'resources-worksheets', label: 'Worksheets' },
        { id: 'resources-shared', label: 'Shared Resources' }
      ]
    }
  ];

  // Open/collapsed state for each accordion
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      curriculum: true,
      lessons: true,
      activities: false,
      assessments: false,
      classes: false,
      analytics: false,
      resources: false
    };
    // Ensure active section's group is open
    navGroups.forEach(group => {
      if (group.children.some(c => c.id === currentSection)) {
        initial[group.id] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSelect = (sec: TeacherNavSection) => {
    onNavigate(sec);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-800 select-none">
      {/* 1. Header & Branding */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-400/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-white tracking-tight leading-none">Leavien AI</h1>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-2.5 h-2.5" />
                TEACHER
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Faculty & Instruction Portal</p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl lg:hidden cursor-pointer hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 3. Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Dashboard Link (Always at top) */}
        <button
          onClick={() => handleSelect('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentSection === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Home className={`w-4 h-4 ${currentSection === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </div>
          <span className="text-[10px] text-indigo-200/70 font-semibold">Overview</span>
        </button>

        {/* Section Accordions */}
        {navGroups.map((group) => {
          const isGroupOpen = !!openGroups[group.id];
          const hasActiveChild = group.children.some(c => c.id === currentSection);

          return (
            <div key={group.id} className="pt-1">
              {/* Accordion Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  hasActiveChild
                    ? 'text-indigo-300 bg-slate-900/70 font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1 rounded-lg bg-slate-900 border border-slate-800">
                    {group.icon}
                  </div>
                  <span className="truncate">{group.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {group.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/30">
                      {group.badge}
                    </span>
                  )}
                  {isGroupOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Accordion Children */}
              <AnimatePresence initial={false}>
                {isGroupOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden pl-7 pr-1 pt-1 space-y-0.5"
                  >
                    {group.children.map((child) => {
                      const isChildActive = currentSection === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleSelect(child.id)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                            isChildActive
                              ? 'bg-indigo-600/90 text-white font-black shadow-xs'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 font-medium'
                          }`}
                        >
                          <span className="truncate">{child.label}</span>
                          {child.badge && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                              isChildActive ? 'bg-white text-indigo-900' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            }`}>
                              {child.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Divider */}
        <div className="pt-2 border-t border-slate-800/80 my-1" />

        {/* Notifications Link */}
        <button
          onClick={() => handleSelect('notifications')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentSection === 'notifications'
              ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-950/60'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bell className={`w-4 h-4 ${currentSection === 'notifications' ? 'text-white' : 'text-amber-400'}`} />
            <span>Notifications</span>
          </div>
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Settings Link */}
        <button
          onClick={() => handleSelect('settings')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentSection === 'settings'
              ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-950/60'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/90'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className={`w-4 h-4 ${currentSection === 'settings' ? 'text-white' : 'text-slate-400'}`} />
            <span>Settings</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Config</span>
        </button>
      </div>

      {/* 4. Footer & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all cursor-pointer border border-transparent hover:border-rose-900/40"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Sign Out</span>
          </div>
          <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Leave</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-72 h-screen sticky top-0 hidden lg:block shrink-0 z-30 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Sidebar Slide-Out */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
