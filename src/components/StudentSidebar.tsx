import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  BarChart3, 
  FolderOpen, 
  TrendingUp, 
  Bell, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  GraduationCap, 
  Sparkles, 
  Flame, 
  Trophy, 
  Zap, 
  LogOut, 
  X,
  FileText,
  ListTodo,
  Layers,
  Award,
  Video,
  FileSpreadsheet,
  Sigma,
  PieChart,
  User,
  ShieldCheck,
  Compass,
  ListTree
} from 'lucide-react';
import { UserProfile } from '../types';

export type StudentNavSection = 
  | 'dashboard'
  | 'curriculum'
  | 'curriculum-hierarchy'
  | 'curriculum-overview'
  | 'curriculum-ilaw'
  | 'curriculum-subjects'
  | 'curriculum-competencies'
  | 'activities'
  | 'activities-todo'
  | 'activities-in-progress'
  | 'activities-completed'
  | 'assessments'
  | 'assessments-diagnostic'
  | 'assessments-formative'
  | 'assessments-quizzes'
  | 'assessments-exams'
  | 'assessments-results'
  | 'resources'
  | 'resources-modules'
  | 'resources-worksheets'
  | 'resources-videos'
  | 'resources-references'
  | 'progress'
  | 'progress-subject'
  | 'progress-competency'
  | 'progress-grades'
  | 'notifications'
  | 'settings';

interface StudentSidebarProps {
  currentSection: StudentNavSection;
  onNavigate: (section: StudentNavSection) => void;
  profile: UserProfile;
  unreadNotificationsCount?: number;
  pendingActivitiesCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
  onOpenLevelProgression: () => void;
  onOpenQuests: () => void;
}

interface NavGroupItem {
  id: StudentNavSection;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  subItems?: {
    id: StudentNavSection;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[];
}

export default function StudentSidebar({
  currentSection,
  onNavigate,
  profile,
  unreadNotificationsCount = 3,
  pendingActivitiesCount = 4,
  isOpenMobile,
  onCloseMobile,
  onLogout,
  onOpenLevelProgression,
  onOpenQuests
}: StudentSidebarProps) {
  // Expanded groups state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    curriculum: true,
    activities: false,
    assessments: false,
    resources: false,
    progress: false
  });

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const navItems: NavGroupItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />
    },
    {
      id: 'curriculum',
      label: 'Curriculum',
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
      subItems: [
        { id: 'curriculum-hierarchy', label: '8-Level Hierarchy', icon: <ListTree className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'curriculum-overview', label: 'Overview', icon: <Layers className="w-3.5 h-3.5" /> },
        { id: 'curriculum-ilaw', label: 'ILAW Lessons', icon: <Compass className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'curriculum-subjects', label: 'My Subjects', icon: <GraduationCap className="w-3.5 h-3.5" /> },
        { id: 'curriculum-competencies', label: 'Learning Competencies', icon: <Sigma className="w-3.5 h-3.5" /> }
      ]
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
      badge: pendingActivitiesCount > 0 ? pendingActivitiesCount : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      subItems: [
        { id: 'activities-todo', label: 'To Do', icon: <ListTodo className="w-3.5 h-3.5 text-amber-500" />, badge: pendingActivitiesCount },
        { id: 'activities-in-progress', label: 'In Progress', icon: <Zap className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'activities-completed', label: 'Completed', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> }
      ]
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: <BarChart3 className="w-4 h-4 text-violet-500" />,
      subItems: [
        { id: 'assessments-diagnostic', label: 'Diagnostic Assessment', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'assessments-formative', label: 'Formative Assessment', icon: <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> },
        { id: 'assessments-quizzes', label: 'Quizzes', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'assessments-exams', label: 'Exams (TOS)', icon: <Award className="w-3.5 h-3.5 text-amber-500" /> },
        { id: 'assessments-results', label: 'My Results', icon: <PieChart className="w-3.5 h-3.5" /> }
      ]
    },
    {
      id: 'resources',
      label: 'Learning Resources',
      icon: <FolderOpen className="w-4 h-4 text-sky-500" />,
      subItems: [
        { id: 'resources-modules', label: 'Modules & Slides', icon: <Layers className="w-3.5 h-3.5" /> },
        { id: 'resources-worksheets', label: 'Worksheets & Flashcards', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { id: 'resources-videos', label: 'Videos', icon: <Video className="w-3.5 h-3.5 text-rose-500" /> },
        { id: 'resources-references', label: 'References & Formulas', icon: <BookOpen className="w-3.5 h-3.5" /> }
      ]
    },
    {
      id: 'progress',
      label: 'My Progress',
      icon: <TrendingUp className="w-4 h-4 text-rose-500" />,
      subItems: [
        { id: 'progress-subject', label: 'Subject Progress', icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { id: 'progress-competency', label: 'Competency Progress', icon: <Sigma className="w-3.5 h-3.5" /> },
        { id: 'progress-grades', label: 'Grades & Transcript', icon: <Award className="w-3.5 h-3.5 text-emerald-500" /> }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4 text-amber-500" />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 text-slate-500" />
    }
  ];

  const handleSelect = (section: StudentNavSection) => {
    onNavigate(section);
    onCloseMobile();
  };

  const isItemActive = (item: NavGroupItem) => {
    if (currentSection === item.id) return true;
    if (item.subItems?.some(sub => sub.id === currentSection)) return true;
    return false;
  };

  const isSubItemActive = (subId: StudentNavSection) => {
    return currentSection === subId;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200/90 z-40 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-slate-900 tracking-tight">LeavienAI</span>
                <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <GraduationCap className="w-2.5 h-2.5" />
                  STUDENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold truncate">
                {profile.grade || 'Grade 11'} • {profile.section || 'STEM-A'}
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Quick Status Strip */}
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-amber-50/50 border-b border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onOpenLevelProgression();
              onCloseMobile();
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-xl border border-indigo-100/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer font-bold text-slate-800"
            title="View RPG Level Progress"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Lvl {profile.level}</span>
          </button>

          <button
            onClick={() => {
              onOpenQuests();
              onCloseMobile();
            }}
            className="flex items-center gap-1 px-2 py-1 bg-white rounded-xl border border-orange-100 shadow-xs hover:border-orange-300 transition-all cursor-pointer font-bold text-orange-700"
            title="Daily Streak & Quests"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{profile.streak}d streak</span>
          </button>

          <span className="font-black text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-lg text-[11px]">
            {profile.xp} XP
          </span>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const hasSub = item.subItems && item.subItems.length > 0;
            const isGroupExpanded = !!expandedGroups[item.id];
            const groupActive = isItemActive(item);

            return (
              <div key={item.id} className="space-y-0.5">
                {/* Main Item Button */}
                <div className="flex items-center justify-between group">
                  <button
                    onClick={() => {
                      if (hasSub) {
                        toggleGroup(item.id);
                        // Navigate to primary sub-item if group is clicked
                        if (item.subItems && item.subItems[0]) {
                          handleSelect(item.subItems[0].id);
                        }
                      } else {
                        handleSelect(item.id);
                      }
                    }}
                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                      groupActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-950'
                    }`}
                  >
                    <span className={groupActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        groupActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Accordion Arrow for sub-menus */}
                  {hasSub && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(item.id);
                      }}
                      className={`p-1.5 rounded-xl ml-1 transition-colors cursor-pointer ${
                        groupActive ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isGroupExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Sub-items (Hierarchical List) */}
                {hasSub && isGroupExpanded && (
                  <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-indigo-100 ml-4 my-1">
                    {item.subItems!.map((sub) => {
                      const isSubActive = isSubItemActive(sub.id);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelect(sub.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer text-left ${
                            isSubActive
                              ? 'bg-indigo-50 text-indigo-900 font-extrabold border border-indigo-200/80'
                              : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={isSubActive ? 'text-indigo-600' : 'text-slate-400'}>
                              {sub.icon}
                            </span>
                            <span className="truncate">{sub.label}</span>
                          </div>

                          {sub.badge && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[9px] font-black">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer User Profile Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div 
              onClick={() => handleSelect('settings')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                {(profile.displayName || profile.email?.split('@')[0] || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {profile.displayName || profile.email?.split('@')[0] || 'Student'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile.email || 'Learner Account'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0 ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
