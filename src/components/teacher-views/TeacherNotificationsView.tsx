import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Trash2, 
  CheckCheck, 
  FileCheck, 
  Award,
  Users
} from 'lucide-react';
import { TeacherNavSection } from '../TeacherSidebar';

interface TeacherNotificationsViewProps {
  onNavigateToSection: (section: TeacherNavSection) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'submission' | 'risk' | 'achievement' | 'system';
  isRead: boolean;
  actionLabel?: string;
  actionTarget?: TeacherNavSection;
}

export default function TeacherNotificationsView({
  onNavigateToSection
}: TeacherNotificationsViewProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'tn-1',
      title: 'New Student Activity Submissions Ready for Review',
      message: 'Maria Santos and Gabriel Reyes submitted their "3D Box Packaging Optimization" performance tasks.',
      timestamp: 'Today, 10:14 AM',
      type: 'submission',
      isRead: false,
      actionLabel: 'Review Submissions',
      actionTarget: 'activities-submissions'
    },
    {
      id: 'tn-2',
      title: '⚠️ Intervention Alert: 3 Learners Need Remediation',
      message: '3 students scored below the 75% benchmark on "Rational Functions Asymptote Quiz". Recommended to deploy 7-step pathway.',
      timestamp: 'Today, 8:30 AM',
      type: 'risk',
      isRead: false,
      actionLabel: 'View Class Analytics',
      actionTarget: 'analytics-progress'
    },
    {
      id: 'tn-3',
      title: 'Summative TOS Examination Generated',
      message: 'The Term 1 Table of Specifications blueprint has been successfully synchronized with the student assessment pool.',
      timestamp: 'Yesterday',
      type: 'system',
      isRead: true,
      actionLabel: 'Inspect TOS',
      actionTarget: 'assessments-exams'
    },
    {
      id: 'tn-4',
      title: 'STEM-A Reached 10-Day Math Sprint Streak',
      message: 'Section STEM-A has achieved a collective average daily active streak of 10 days. Recitation bonus XP is ready for distribution.',
      timestamp: '2 days ago',
      type: 'achievement',
      isRead: true,
      actionLabel: 'Open Leaderboard',
      actionTarget: 'analytics-class'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'submission': return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'risk': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'achievement': return <Award className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Bell className="w-3 h-3" />
              <span>Teacher Notifications & Alerts</span>
            </span>
            <span className="bg-white/10 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Live Instruction Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Faculty Notification Center</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor incoming student task submissions, diagnostic intervention alerts, class streak milestones, and syllabus updates.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {notifications.filter(n => !n.isRead).length} Unread Teacher Alerts
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mark All as Read</span>
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold rounded-xl border border-slate-200 text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="grid gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              n.isRead
                ? 'bg-white border-slate-200 shadow-xs'
                : 'bg-amber-50/40 border-amber-200/90 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                <span className="text-[10px] font-bold text-slate-400 block pt-0.5">{n.timestamp}</span>
              </div>
            </div>

            {n.actionTarget && (
              <button
                onClick={() => onNavigateToSection(n.actionTarget!)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-xs self-end md:self-center"
              >
                {n.actionLabel || 'View'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
