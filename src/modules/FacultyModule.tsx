import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Users, LogOut, Zap, Database, Video } from 'lucide-react';
import { UserProfile } from '../types';

import FacultyDashboard from '../components/FacultyDashboard';
import CurriculumManager from '../components/CurriculumManager';
import ItemBankManager from '../components/ItemBankManager';
import FacultyVideoManager from '../components/FacultyVideoManager';
import { topics } from '../data/curriculum';

import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface FacultyModuleProps {
  profile: UserProfile;
  onLogout: () => void;
}

export default function FacultyModule({ profile, onLogout }: FacultyModuleProps) {
  const [activeTab, setActiveTab] = useState<'faculty' | 'curriculum' | 'items' | 'videos'>('faculty');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Faculty Hub</h1>
              <p className="text-xs text-slate-400 font-medium">LeavienAI Grade 11 Admin</p>
            </div>
          </div>

          {/* Header Tab Switcher for Desktop */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'faculty'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Students & Research
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'videos'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4" />
              Video Lectures
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'curriculum'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'items'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              Item Bank
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'curriculum' ? (
            <motion.div key="curriculum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <CurriculumManager />
            </motion.div>
          ) : activeTab === 'items' ? (
            <motion.div key="items" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <ItemBankManager />
            </motion.div>
          ) : activeTab === 'videos' ? (
            <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <FacultyVideoManager topics={topics} />
            </motion.div>
          ) : (
            <motion.div key="faculty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <FacultyDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-10 shadow-lg md:hidden">
        <NavButton 
          active={activeTab === 'faculty'} 
          onClick={() => setActiveTab('faculty')}
          icon={<Users className="w-5 h-5" />}
          label="Students"
        />
        <NavButton 
          active={activeTab === 'videos'} 
          onClick={() => setActiveTab('videos')}
          icon={<Video className="w-5 h-5" />}
          label="Videos"
        />
        <NavButton 
          active={activeTab === 'curriculum'} 
          onClick={() => setActiveTab('curriculum')}
          icon={<BookOpen className="w-5 h-5" />}
          label="Curriculum"
        />
        <NavButton 
          active={activeTab === 'items'} 
          onClick={() => setActiveTab('items')}
          icon={<Database className="w-5 h-5" />}
          label="Item Bank"
        />
      </nav>

      <ConfirmDeleteModal
        isOpen={showLogoutConfirm}
        title="Sign Out of Faculty Hub"
        message="Are you sure you want to log out of the MathAdapt AI Faculty Management Portal?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="logout"
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-indigo-50' : ''}`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
