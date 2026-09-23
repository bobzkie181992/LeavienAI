import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  BookOpen, 
  Users, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  IdCard,
  ExternalLink,
  Database,
  GraduationCap
} from 'lucide-react';
import { UserProfile } from '../types';
import { localSignIn, localSignUp, getLocalUsers } from '../lib/localAuth';

interface AuthScreenProps {
  onProfileCreated?: (
    role: 'student' | 'faculty', 
    displayName?: string, 
    lrn?: string, 
    customUid?: string,
    grade?: string,
    section?: string
  ) => Promise<void>;
}

export default function AuthScreen({ onProfileCreated }: AuthScreenProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [lrn, setLrn] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [grade, setGrade] = useState('Grade 11');
  const [section, setSection] = useState('STEM-A');
  const [customSection, setCustomSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAccounts, setLocalAccounts] = useState<UserProfile[]>([]);

  useEffect(() => {
    setLocalAccounts(getLocalUsers());
  }, [tab]);

  // 1. Local Database Sign In
  const handleLocalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email/LRN and password.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const profile = await localSignIn(email, password);
      if (onProfileCreated && profile.role) {
        await onProfileCreated(
          profile.role, 
          profile.displayName, 
          profile.lrn, 
          profile.uid,
          profile.grade,
          profile.section
        );
      }
    } catch (err: any) {
      console.error("Local sign-in error:", err);
      setError(err.message || "Sign-in failed. Please verify your credentials or register a new account.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Local Database Sign Up (Create Account)
  const handleLocalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError("Please complete all required fields (Name, Email, and Password).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const finalSection = role === 'student' 
      ? (section === 'custom' ? (customSection.trim() || 'STEM-A') : section.trim())
      : undefined;
    const finalGrade = role === 'student' ? grade.trim() : undefined;

    setLoading(true);
    setError(null);
    try {
      const newProfile = await localSignUp({
        displayName: displayName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        lrn: lrn.trim() || undefined,
        grade: finalGrade,
        section: finalSection
      });

      if (onProfileCreated) {
        await onProfileCreated(
          role, 
          displayName.trim(), 
          lrn.trim(), 
          newProfile.uid,
          finalGrade,
          finalSection
        );
      }
    } catch (err: any) {
      console.error("Local sign-up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[36px] shadow-xl p-6 sm:p-10 border border-slate-100 relative overflow-hidden"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">LeavienAI</h1>
          <p className="text-slate-500 text-sm mt-1">Grade 11 Mathematics Mastery & Diagnostics</p>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-bold">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Local Database Auth Active
            </span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'signin' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === 'signup' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex flex-col gap-2"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
            {error.includes("No account found") && (
              <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                <span className="text-[11px] text-rose-700">Want to register this account?</span>
                <button
                  type="button"
                  onClick={() => {
                    if (email && email.includes('@')) {
                      const clean = email.split('@')[0].replace(/[._]/g, ' ');
                      setDisplayName(clean.charAt(0).toUpperCase() + clean.slice(1));
                    }
                    setError(null);
                    setTab('signup');
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
                >
                  Create Account Now
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {tab === 'signin' ? (
            <motion.form 
              key="signin"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLocalSignIn}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address or 12-digit LRN
                  </label>
                </div>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. amora@gmail.com, bobzkie181992@gmail.com, or LRN"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end text-xs py-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (email && email.includes('@')) {
                      const clean = email.split('@')[0].replace(/[._]/g, ' ');
                      setDisplayName(clean.charAt(0).toUpperCase() + clean.slice(1));
                    }
                    setTab('signup');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Create Account
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In with Local Database'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Accounts Helper */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Quick Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('amora@gmail.com');
                      setPassword('password123');
                    }}
                    className="p-2 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-indigo-950 truncate">Amora (Student)</div>
                    <div className="text-[10px] text-indigo-600 truncate">amora@gmail.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('bobzkie181992@gmail.com');
                      setPassword('password123');
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-left transition-colors"
                  >
                    <div className="text-xs font-bold text-slate-900 truncate">Prof. Bob (Faculty)</div>
                    <div className="text-[10px] text-slate-500 truncate">bobzkie181992...</div>
                  </button>
                </div>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleLocalSignUp}
              className="space-y-4"
            >
              {/* Role Selection at top of Registration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      role === 'student'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs">Student</div>
                      <div className="text-[10px] text-slate-500 font-normal">Learn & Choose Class</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      role === 'faculty'
                        ? 'border-slate-900 bg-slate-900 text-white font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-xs">Faculty</div>
                      <div className="text-[10px] text-slate-400 font-normal">Curriculum & Stats</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder={role === 'student' ? 'e.g. Jordan Lee' : 'e.g. Prof. Roberto Santos'}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* ONLY Students choose what section and grade they are */}
              {role === 'student' ? (
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Class Enrollment</span>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Student Choice
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Choose what section and grade you are in. You can also update this anytime in your student profile.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Grade Level
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
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
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
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

                  {section === 'custom' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Custom Section Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 11 - Einstein or Grade 11 – Gauss"
                        value={customSection}
                        onChange={(e) => setCustomSection(e.target.value)}
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
                        placeholder="12-digit LRN (e.g. 109283741001)"
                        value={lrn}
                        onChange={(e) => setLrn(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-indigo-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-wider"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Optional 12-digit DepEd student number</p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">Faculty Role</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Faculty oversee curriculum, question bank, and analytics across all grade levels and sections. Only students are enrolled in specific grades and sections.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={role === 'student' ? 'student@school.edu' : 'faculty@school.edu'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : `Register ${role === 'student' ? 'Student' : 'Faculty'} Account & Enter`}
                <Sparkles className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Database Status Footer */}
        <div className="pt-4 text-center border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Local Accounts: {localAccounts.length}
          </span>
          <a
            href="https://console.firebase.google.com/project/united-spirit-hsjh2/authentication/users"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <span>Firebase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
