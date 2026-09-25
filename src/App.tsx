/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, Zap, Play, AlertCircle, GraduationCap, ArrowLeft, IdCard } from 'lucide-react';
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
  const [pendingRole, setPendingRole] = useState<'student' | 'faculty' | null>(null);
  const [studentGrade, setStudentGrade] = useState('Grade 11');
  const [studentSection, setStudentSection] = useState('STEM-A');
  const [studentCustomSection, setStudentCustomSection] = useState('');
  const [studentLrn, setStudentLrn] = useState('');

  const handleLogout = async () => {
    await localSignOut();
    try {
      await signOut(auth);
    } catch (e) {}
  };

  const handleSelectRole = async (selectedRole: 'student' | 'faculty') => {
    if (selectedRole === 'student') {
      setPendingRole('student');
      return;
    }

    setIsCreatingRole(true);
    setRoleError(null);
    try {
      await createProfile('faculty');
    } catch (err: any) {
      console.error("Error setting role:", err);
      setRoleError(err.message || "Failed to set up profile. Please try again.");
    } finally {
      setIsCreatingRole(false);
    }
  };

  const handleCompleteStudentSetup = async () => {
    setIsCreatingRole(true);
    setRoleError(null);
    const finalSection = studentSection === 'custom' 
      ? (studentCustomSection.trim() || 'STEM-A') 
      : studentSection.trim();

    try {
      await createProfile(
        'student',
        undefined,
        studentLrn.trim() || undefined,
        undefined,
        studentGrade.trim(),
        finalSection
      );
    } catch (err: any) {
      console.error("Error setting up student profile:", err);
      setRoleError(err.message || "Failed to set up student profile. Please try again.");
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
          className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-8 sm:p-10 text-center"
        >
          {roleError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{roleError}</span>
            </div>
          )}

          {pendingRole === 'student' ? (
            <div className="text-left space-y-4">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg shadow-indigo-200">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Student Enrollment</h2>
                <p className="text-xs text-slate-500 mt-1">Choose what section and grade you belong to</p>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Grade Level
                    </label>
                    <select
                      value={studentGrade}
                      onChange={(e) => setStudentGrade(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                      <option value="Grade 10">Grade 10</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Section
                    </label>
                    <select
                      value={studentSection}
                      onChange={(e) => setStudentSection(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="STEM-A">STEM-A</option>
                      <option value="STEM-B">STEM-B</option>
                      <option value="STEM-C">STEM-C</option>
                      <option value="ABM-A">ABM-A</option>
                      <option value="ABM-B">ABM-B</option>
                      <option value="HUMSS-A">HUMSS-A</option>
                      <option value="HUMSS-B">HUMSS-B</option>
                      <option value="GAS-A">GAS-A</option>
                      <option value="TVL-A">TVL-A</option>
                      <option value="custom">✏️ Other / Custom...</option>
                    </select>
                  </div>
                </div>

                {studentSection === 'custom' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Custom Section Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 11 - Einstein or Grade 11 – Gauss"
                      value={studentCustomSection}
                      onChange={(e) => setStudentCustomSection(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Learner Reference Number (LRN)
                  </label>
                  <div className="relative">
                    <IdCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-digit LRN (optional)"
                      value={studentLrn}
                      onChange={(e) => setStudentLrn(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-wider"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isCreatingRole}
                  onClick={handleCompleteStudentSetup}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isCreatingRole ? 'Setting Up...' : 'Confirm & Enter Leavien AI'}
                </button>

                <button
                  type="button"
                  disabled={isCreatingRole}
                  onClick={() => setPendingRole(null)}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose Different Role</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome!</h2>
              <p className="text-slate-500 mb-6">Choose your path to get started.</p>
              
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
                        Student
                      </div>
                      <div className="text-xs text-indigo-600 group-hover:text-indigo-100 transition-colors">Choose grade & section to learn</div>
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
                        Faculty
                      </div>
                      <div className="text-xs text-slate-600 group-hover:text-slate-300 transition-colors">Manage Students & Progress</div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
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
