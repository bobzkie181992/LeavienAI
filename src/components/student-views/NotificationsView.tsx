import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Gift, 
  Flame, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Trash2,
  CheckCheck
} from 'lucide-react';
import { UserProfile } from '../../types';

interface NotificationsViewProps {
  profile: UserProfile;
  onOpenQuests: () => void;
  onNavigateToCurriculum: () => void;
  onNavigateToExams: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'quest' | 'streak' | 'exam' | 'curriculum' | 'system';
  isRead: boolean;
  actionLabel?: string;
  action?: () => void;
}

export default function NotificationsView({
  profile,
  onOpenQuests,
  onNavigateToCurriculum,
  onNavigateToExams
}: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'Daily Quests Ready!',
      message: 'New daily bounties and XP bonuses are available for claiming. Answer 5 problems to complete today\'s math quest.',
      timestamp: 'Today, 8:00 AM',
      type: 'quest',
      isRead: false,
      actionLabel: 'Open Daily Quests',
      action: onOpenQuests
    },
    {
      id: 'n-2',
      title: '🔥 Maintain Your Study Streak',
      message: `You are on a ${profile.streak}-day streak! Complete any quiz today before midnight to keep your momentum going.`,
      timestamp: 'Today, 9:30 AM',
      type: 'streak',
      isRead: false,
      actionLabel: 'Go to Practice',
      action: onNavigateToCurriculum
    },
    {
      id: 'n-3',
      title: 'DepEd Order No. 016 ILAW Lessons Available',
      message: 'All 12 General Mathematics units now have synchronized ILAW lesson guides (Intentions, Learning Experience, Assessing Learning, Ways Forward).',
      timestamp: 'Yesterday',
      type: 'curriculum',
      isRead: false,
      actionLabel: 'View ILAW Lessons',
      action: onNavigateToCurriculum
    },
    {
      id: 'n-4',
      title: 'Summative Examinations (TOS Aligned)',
      message: 'Take your Term 1 and Term 2 Table of Specifications summative exams to benchmark your Bloom\'s cognitive mastery.',
      timestamp: '2 days ago',
      type: 'exam',
      isRead: true,
      actionLabel: 'View Exams',
      action: onNavigateToExams
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
      case 'quest': return <Gift className="w-4 h-4 text-amber-500" />;
      case 'streak': return <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />;
      case 'exam': return <GraduationCap className="w-4 h-4 text-violet-500" />;
      case 'curriculum': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Bell className="w-3 h-3" />
              <span>Student Notification Center</span>
            </span>
            <span className="bg-white/10 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Real-Time Updates
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Notifications & Announcements</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Stay informed about your study quests, upcoming assessments, teacher materials, and gamification rewards.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {notifications.filter(n => !n.isRead).length} Unread Notifications
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

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-400">You have no new notifications right now.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.isRead
                  ? 'bg-white border-slate-100 shadow-xs'
                  : 'bg-indigo-50/40 border-indigo-200/90 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  item.isRead ? 'bg-slate-100' : 'bg-white shadow-xs border border-indigo-100'
                }`}>
                  {getIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{item.message}</p>
                  <span className="text-[10px] font-bold text-slate-400 block pt-0.5">{item.timestamp}</span>
                </div>
              </div>

              {item.action && (
                <button
                  onClick={item.action}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-xs self-end sm:self-center"
                >
                  {item.actionLabel || 'View'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
