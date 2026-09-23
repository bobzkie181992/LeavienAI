import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  GraduationCap, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  Save, 
  ShieldCheck, 
  IdCard,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../../types';
import { isAudioMuted, setAudioMuted } from '../../utils/audioEffects';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfileDetails?: (newName: string, grade: string, section: string, lrn?: string) => Promise<void>;
  onOpenAvatarCustomizer: () => void;
}

export default function SettingsView({
  profile,
  onUpdateProfileDetails,
  onOpenAvatarCustomizer
}: SettingsViewProps) {
  const [displayName, setDisplayName] = useState(profile.displayName || profile.email?.split('@')[0] || '');
  const [grade, setGrade] = useState(profile.grade || 'Grade 11');
  const [section, setSection] = useState(profile.section || 'STEM-A');
  const [isCustomSection, setIsCustomSection] = useState(
    !['STEM-A', 'STEM-B', 'STEM-C', 'ABM-A', 'ABM-B', 'HUMSS-A', 'TVL-ICT', 'GAS-A'].includes(profile.section || 'STEM-A')
  );
  const [customSectionInput, setCustomSectionInput] = useState(
    !['STEM-A', 'STEM-B', 'STEM-C', 'ABM-A', 'ABM-B', 'HUMSS-A', 'TVL-ICT', 'GAS-A'].includes(profile.section || 'STEM-A')
      ? (profile.section || '')
      : ''
  );
  const [lrn, setLrn] = useState(profile.lrn || '');
  const [isMuted, setIsMuted] = useState(isAudioMuted());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfileDetails) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const finalSection = isCustomSection ? (customSectionInput.trim() || 'STEM-A') : section;

    try {
      await onUpdateProfileDetails(displayName.trim() || profile.displayName || 'Student', grade, finalSection, lrn.trim() || undefined);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-slate-200 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Settings className="w-3 h-3" />
              <span>Student Preferences</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Account & Interface Settings</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Customize your student profile, academic grade & section assignment, audio effects, and learning preferences.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your profile and settings have been saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Student Profile & Academic Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">Student Identity & Enrollment</h3>
            </div>
            <button
              type="button"
              onClick={onOpenAvatarCustomizer}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customize Avatar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name / Preferred Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                DepEd Learner Reference Number (LRN)
              </label>
              <input
                type="text"
                value={lrn}
                onChange={(e) => setLrn(e.target.value)}
                placeholder="12-digit LRN (Optional)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Grade Level
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Grade 11">Grade 11 (Senior High School)</option>
                <option value="Grade 12">Grade 12 (Senior High School)</option>
                <option value="Grade 10">Grade 10 (Junior High School)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Assigned Section
              </label>
              {!isCustomSection ? (
                <div className="flex gap-2">
                  <select
                    value={section}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomSection(true);
                      } else {
                        setSection(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="STEM-A">STEM-A (Science, Tech, Eng, Math)</option>
                    <option value="STEM-B">STEM-B (Science, Tech, Eng, Math)</option>
                    <option value="STEM-C">STEM-C (Science, Tech, Eng, Math)</option>
                    <option value="ABM-A">ABM-A (Accountancy & Business)</option>
                    <option value="ABM-B">ABM-B (Accountancy & Business)</option>
                    <option value="HUMSS-A">HUMSS-A (Humanities & Social Sciences)</option>
                    <option value="TVL-ICT">TVL-ICT (Technical-Vocational)</option>
                    <option value="GAS-A">GAS-A (General Academic Strand)</option>
                    <option value="custom">+ Enter Custom Section Name</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSectionInput}
                    onChange={(e) => setCustomSectionInput(e.target.value)}
                    placeholder="Enter section name (e.g. Einstein)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomSection(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs whitespace-nowrap cursor-pointer"
                  >
                    Preset List
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audio & Immersion Controls */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900">Sound Effects & Gamification Audio</h3>
              <p className="text-xs text-slate-400">Audio fanfares for level-ups, streak bonuses, and correct answers</p>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span>{isMuted ? 'Sound Muted' : 'Sound Enabled'}</span>
            </button>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
