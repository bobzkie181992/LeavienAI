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
  ShieldCheck,
  Check,
  IdCard,
  Info,
  ExternalLink,
  Database,
  ChevronDown
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';
import { localSignIn, localSignUp, getLocalUsers } from '../lib/localAuth';

interface AuthScreenProps {
  onProfileCreated?: (role: 'student' | 'faculty', displayName?: string, lrn?: string, customUid?: string) => Promise<void>;
}

export default function AuthScreen({ onProfileCreated }: AuthScreenProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [lrn, setLrn] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAccountsList, setShowAccountsList] = useState(false);
  const [localAccounts, setLocalAccounts] = useState<UserProfile[]>([]);
  const [unregisteredEmail, setUnregisteredEmail] = useState<string | null>(null);
  const [autoCreateNew, setAutoCreateNew] = useState(true);

  useEffect(() => {
    setLocalAccounts(getLocalUsers());
  }, [tab]);

  // 1. Google Sign-In (Optional)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setUnregisteredEmail(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please use Local Database sign-in below.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Firebase domain is not authorized. Please use the Local Database sign-in form below.");
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Local Database Sign In
  const handleLocalSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email/LRN and password.");
      return;
    }
    setLoading(true);
    setError(null);
    setUnregisteredEmail(null);

    try {
      // If autoCreateNew is enabled, pass current role so new accounts enter seamlessly
      const profile = await localSignIn(email, password, {
        autoCreateRole: autoCreateNew ? role : undefined
      });
      if (onProfileCreated && profile.role) {
        await onProfileCreated(profile.role, profile.displayName, profile.lrn, profile.uid);
      }
    } catch (err: any) {
      console.error("Local sign-in error:", err);
      if (err.code === 'ACCOUNT_NOT_FOUND') {
        setUnregisteredEmail(err.identifier || email.trim());
        setError(null);
      } else {
        setError(err.message || "Sign-in failed. Please verify your credentials or register a new account.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick register for account not found
  const handleQuickRegister = async (chosenRole: 'student' | 'faculty') => {
    const target = (unregisteredEmail || email).trim();
    if (!target || !password) {
      setError("Please ensure email and password are provided.");
      return;
    }
    setLoading(true);
    setError(null);

    const defaultRawName = target.includes('@') 
      ? target.split('@')[0].replace(/[._]/g, ' ') 
      : `Student ${target}`;
    const capitalizedName = defaultRawName.charAt(0).toUpperCase() + defaultRawName.slice(1);

    try {
      const newProfile = await localSignUp({
        displayName: displayName.trim() || capitalizedName,
        email: target.includes('@') ? target : `${target}@student.mathquest.internal`,
        lrn: !target.includes('@') ? target : undefined,
        password: password.trim(),
        role: chosenRole,
        grade: chosenRole === 'student' ? 'Grade 11' : undefined,
        section: chosenRole === 'student' ? 'STEM-A' : undefined
      });

      setUnregisteredEmail(null);
      if (onProfileCreated) {
        await onProfileCreated(chosenRole, newProfile.displayName, newProfile.lrn, newProfile.uid);
      }
    } catch (err: any) {
      console.error("Quick registration error:", err);
      setError(err.message || "Failed to create account.");
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

    setLoading(true);
    setError(null);
    try {
      const newProfile = await localSignUp({
        displayName: displayName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        lrn: lrn.trim() || undefined,
        grade: role === 'student' ? 'Grade 11' : undefined,
        section: role === 'student' ? 'STEM-A' : undefined
      });

      if (onProfileCreated) {
        await onProfileCreated(role, displayName.trim(), lrn.trim(), newProfile.uid);
      }
    } catch (err: any) {
      console.error("Local sign-up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account: UserProfile) => {
    setEmail(account.email || account.lrn || '');
    if (account.password || account.temporaryPassword) {
      setPassword(account.password || account.temporaryPassword || '');
    }
    setShowAccountsList(false);
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
            className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed font-medium">{error}</span>
          </motion.div>
        )}

        {/* Unregistered Account Quick-Register Banner */}
        {unregisteredEmail && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-slate-800 text-xs space-y-3 shadow-xs"
          >
            <div className="flex items-center gap-2 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>No account found for "{unregisteredEmail}"</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Create this account now using your entered password:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleQuickRegister('student')}
                disabled={loading}
                className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Register as Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRegister('faculty')}
                disabled={loading}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Register as Faculty</span>
              </button>
            </div>
            <div className="text-center pt-1 border-t border-indigo-100">
              <button
                type="button"
                onClick={() => {
                  if (unregisteredEmail.includes('@')) {
                    const cleanName = unregisteredEmail.split('@')[0].replace(/[._]/g, ' ');
                    setDisplayName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
                  }
                  setTab('signup');
                  setUnregisteredEmail(null);
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Or fill custom profile details in Create Account tab &rarr;
              </button>
            </div>
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
                  {localAccounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAccountsList(!showAccountsList)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Saved Accounts ({localAccounts.length})</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showAccountsList ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Stored Accounts Quick Selector */}
                {showAccountsList && localAccounts.length > 0 && (
                  <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto space-y-1 text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Select Account to Auto-fill:</div>
                    {localAccounts.map((acc) => (
                      <button
                        key={acc.uid}
                        type="button"
                        onClick={() => handleSelectAccount(acc)}
                        className="w-full p-2 hover:bg-white rounded-lg text-left text-xs flex items-center justify-between transition-colors border border-transparent hover:border-slate-200 shadow-none hover:shadow-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-800 truncate">{acc.displayName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{acc.email || `LRN: ${acc.lrn}`}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                          acc.role === 'faculty' ? 'bg-slate-200 text-slate-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {acc.role}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

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

              <div className="flex items-center justify-between text-xs py-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoCreateNew}
                    onChange={(e) => setAutoCreateNew(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Auto-create account if new</span>
                </label>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Jordan Lee"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Learner Reference Number (LRN)
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-digit LRN (e.g. 109283741001)"
                      value={lrn}
                      onChange={(e) => setLrn(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all tracking-wider"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">12-digit unique Philippine student ID</p>
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
                    placeholder="jordan@school.edu"
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

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Role
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
                      <div className="text-[10px] text-slate-500 font-normal">Learn & Level Up</div>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Creating Local Account...' : 'Register Local Account & Enter'}
                <Sparkles className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-3 text-sm shadow-sm active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

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
