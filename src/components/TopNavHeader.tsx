import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Search,
  Bell,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Volume2,
  VolumeX,
  X,
  BookOpen,
  CheckSquare,
  Award,
  Users,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { UserProfile, Topic } from '../types';

interface TopNavHeaderProps {
  role: 'student' | 'faculty';
  profile: UserProfile;
  currentSectionTitle: string;
  breadcrumbPath: { label: string; action?: () => void }[];
  onOpenMobileSidebar: () => void;
  onNavigateNotifications: () => void;
  onNavigateSettings: () => void;
  onLogout: () => void;
  topics?: Topic[];
  onSelectTopic?: (topic: Topic) => void;
  onNavigateSection?: (section: string) => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export default function TopNavHeader({
  role,
  profile,
  currentSectionTitle,
  breadcrumbPath,
  onOpenMobileSidebar,
  onNavigateNotifications,
  onNavigateSettings,
  onLogout,
  topics = [],
  onSelectTopic,
  onNavigateSection,
  isMuted = false,
  onToggleSound
}: TopNavHeaderProps) {
  // Popover States
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter topics / items for search
  const searchResults = searchQuery.trim()
    ? topics.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.quizzes.some((q) => q.title.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const isStudent = role === 'student';

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        
        {/* ========================================================================= */}
        {/* 1. LEFT SIDE: Mobile Toggle, Role Badge, & Breadcrumb                    */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-1 sm:-ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 transition-transform"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Role Indicator Badge */}
          <div className="shrink-0">
            {isStudent ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs flex items-center gap-1.5 border border-indigo-400/30">
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">STUDENT</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs flex items-center gap-1.5 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">TEACHER</span>
              </span>
            )}
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="min-w-0 hidden md:flex items-center gap-1 text-xs font-semibold text-slate-500 overflow-x-auto scrollbar-none">
            {breadcrumbPath.map((item, index) => {
              const isLast = index === breadcrumbPath.length - 1;
              return (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  {item.action && !isLast ? (
                    <button
                      onClick={item.action}
                      className="hover:text-indigo-600 truncate transition-colors cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span className={isLast ? 'font-black text-slate-900 truncate' : 'truncate'}>
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Mobile Current Section Title Fallback */}
          <span className="text-xs font-black text-slate-900 truncate md:hidden">
            {currentSectionTitle}
          </span>
        </div>

        {/* ========================================================================= */}
        {/* 2. CENTER: Global Search Bar                                              */}
        {/* ========================================================================= */}
        <div className="hidden lg:block flex-1 max-w-xs xl:max-w-md relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isStudent ? "Search topics, quizzes, formulas..." : "Search classes, students, lessons..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Live Results Overlay */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1"
              >
                <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Matching Curriculum Topics ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (onSelectTopic) onSelectTopic(topic);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                          {topic.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{topic.description}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 shrink-0" />
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-xs text-slate-500 text-center">
                    No matching lessons found for "{searchQuery}".
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* 3. RIGHT SIDE: Notifications & Profile Menu                                */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Sound Toggle */}
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
          )}

          {/* Notifications Dropdown Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer relative min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-amber-500 rounded-full absolute top-2 right-2 ring-2 ring-white animate-pulse" />
            </button>

            {/* Notifications Popover Menu */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Recent Alerts</span>
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      3 New
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-0.5">
                      <p className="font-bold text-indigo-950">New ILAW Lesson Assigned</p>
                      <p className="text-[11px] text-slate-500">Evaluating Piecewise Functions is now available.</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
                      <p className="font-bold text-slate-900">Diagnostic Checkpoint Passed</p>
                      <p className="text-[11px] text-slate-500">Score: 88/100 • Mastered Competency M11GM-Ia-1.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      onNavigateNotifications();
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center block"
                  >
                    View All Notifications
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown Button */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-200 active:scale-95"
            >
              <div className={`w-8 h-8 rounded-xl font-black text-white flex items-center justify-center text-xs shadow-xs ${
                isStudent ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' : 'bg-gradient-to-br from-teal-600 to-emerald-700'
              }`}>
                {profile.displayName?.charAt(0) || (isStudent ? 'S' : 'T')}
              </div>

              <div className="text-left hidden sm:block">
                <span className="text-xs font-black text-slate-900 block leading-tight max-w-[100px] truncate">
                  {profile.displayName || (isStudent ? 'Student' : 'Faculty')}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  {isStudent ? 'Grade 11 Student' : 'Mathematics Faculty'}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User Profile Menu Dropdown */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3"
                >
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className={`w-10 h-10 rounded-2xl font-black text-white flex items-center justify-center text-sm shadow-xs ${
                      isStudent ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}>
                      {profile.displayName?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {profile.displayName || 'User'}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">
                        {isStudent ? `LRN: ${profile.lrn || '12849102911'}` : 'Faculty Instructor'}
                      </p>
                      <span className={`inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isStudent ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        ROLE: {role.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateSettings();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateNotifications();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Bell className="w-4 h-4 text-slate-400" />
                      <span>Notifications</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 font-bold text-rose-600 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
}
