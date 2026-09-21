/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, Zap, Play, AlertCircle } from 'lucide-react';
import { useAuth, useUserProfile, useQuizHistory, useCurriculum } from './hooks/useFirebase';
import { auth, googleProvider } from './lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

import StudentModule from './modules/StudentModule';
import FacultyModule from './modules/FacultyModule';
import AuthScreen from './components/AuthScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { localSignOut } from './lib/localAuth';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error: profileError, addXP, unlockBadge, createProfile, updateDisplayName, updateProfileDetails, saveDiagnosticResult, savePathwayProgress } = useUserProfile(user?.uid);
  const { results, saveResult } = useQuizHistory(user?.uid);
  const { topics, loading: topicsLoading } = useCurriculum();
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  const handleLogout = async () => {
    await localSignOut();
    try {
      await signOut(auth);
    } catch (e) {}
  };

  const handleSelectRole = async (selectedRole: 'student' | 'faculty') => {
    setIsCreatingRole(true);
    setRoleError(null);
    try {
      await createProfile(selectedRole);
    } catch (err: any) {
      console.error("Error setting role:", err);
      setRoleError(err.message || "Failed to set up profile. Please try again.");
    } finally {
      setIsCreatingRole(false);
    }
  };

  const checkAchievements = async (newXP: number, score: number, total: number, topicId: string) => {
    if (!profile) return;

    if (!profile.badges.includes('first-steps')) await unlockBadge('first-steps');
    if (score === total && !profile.badges.includes('perfect-score')) await unlockBadge('perfect-score');

    const uniqueTopics = new Set(results.map(r => r.quizId.split('-')[0]));
    uniqueTopics.add(topicId);
    if (uniqueTopics.size >= 5 && !profile.badges.includes('topic-master')) await unlockBadge('topic-master');

    if (profile.xp + newXP >= 1000 && !profile.badges.includes('math-whiz')) await unlockBadge('math-whiz');
    if (profile.xp + newXP >= 5000 && !profile.badges.includes('math-legend')) await unlockBadge('math-legend');
    if (profile.streak >= 3 && !profile.badges.includes('streak-starter')) await unlockBadge('streak-starter');
    if (profile.streak >= 7 && !profile.badges.includes('week-warrior')) await unlockBadge('week-warrior');
    if (profile.streak >= 30 && !profile.badges.includes('math-monk')) await unlockBadge('math-monk');
  };

  if (authLoading || (user && profileLoading) || (user && topicsLoading)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onProfileCreated={createProfile} />;
  }

  if (!profile && !profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center"
        >
          <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome!</h2>
          <p className="text-slate-500 mb-6">Choose your path to get started.</p>

          {roleError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{roleError}</span>
            </div>
          )}
          
          <div className="grid gap-4">
            <button 
              id="choose-student-role-btn"
              disabled={isCreatingRole}
              onClick={() => handleSelectRole('student')}
              className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-3xl text-left group hover:bg-indigo-600 transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-indigo-900 group-hover:text-white transition-colors">
                    {isCreatingRole ? 'Setting Up...' : 'Student'}
                  </div>
                  <div className="text-xs text-indigo-600 group-hover:text-indigo-100 transition-colors">Learn & Level Up</div>
                </div>
              </div>
            </button>

            <button 
              id="choose-faculty-role-btn"
              disabled={isCreatingRole}
              onClick={() => handleSelectRole('faculty')}
              className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-left group hover:bg-slate-900 transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-slate-900 group-hover:text-white transition-colors">
                    {isCreatingRole ? 'Setting Up...' : 'Faculty'}
                  </div>
                  <div className="text-xs text-slate-600 group-hover:text-slate-300 transition-colors">Manage Students & Progress</div>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const isFaculty = profile?.role === 'faculty';

  return (
    <div className="min-h-screen bg-slate-50">
      {profileError && (
        <div className="p-4 bg-rose-50 border-b border-rose-100 text-rose-700 flex items-center justify-center gap-3 relative z-50">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Connection issues detected. Using offline mode if possible.</p>
        </div>
      )}
      
      {isFaculty ? (
        <FacultyModule 
          profile={profile!} 
          onLogout={handleLogout} 
        />
      ) : (
        <StudentModule 
          profile={profile!} 
          topics={topics} 
          results={results} 
          userUid={user.uid}
          addXP={addXP}
          saveResult={saveResult}
          saveDiagnosticResult={saveDiagnosticResult}
          savePathwayProgress={savePathwayProgress}
          updateDisplayName={updateDisplayName}
          updateProfileDetails={updateProfileDetails}
          checkAchievements={checkAchievements}
          onLogout={handleLogout}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
