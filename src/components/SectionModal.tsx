import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  X, 
  Check, 
  AlertCircle, 
  Clock, 
  MapPin, 
  User, 
  GraduationCap, 
  Plus, 
  Edit3, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { Grade11Section } from '../data/grade11SampleData';

interface SectionModalProps {
  isOpen: boolean;
  section: Grade11Section | null;
  onClose: () => void;
  onSave: (sectionData: Partial<Grade11Section> & { name: string }) => Promise<void>;
}

export const STRAND_OPTIONS: { id: Grade11Section['trackStrand']; label: string; color: string }[] = [
  { id: 'STEM', label: 'STEM — Science, Tech, Engineering & Math', color: 'indigo' },
  { id: 'ABM', label: 'ABM — Accountancy, Business & Management', color: 'amber' },
  { id: 'HUMSS', label: 'HUMSS — Humanities & Social Sciences', color: 'sky' },
  { id: 'TVL-ICT', label: 'TVL-ICT — Technical Vocational Livelihood', color: 'emerald' },
  { id: 'GAS', label: 'GAS — General Academic Strand', color: 'purple' }
];

export const SHIFT_PRESETS = [
  '6:00 AM – 12:00 PM (Morning Shift)',
  '12:30 PM – 6:30 PM (Afternoon Shift)',
  '7:30 AM – 4:30 PM (Regular Day Shift)'
];

export default function SectionModal({
  isOpen,
  section,
  onClose,
  onSave
}: SectionModalProps) {
  const isEditing = Boolean(section);

  const [name, setName] = useState('');
  const [trackStrand, setTrackStrand] = useState<Grade11Section['trackStrand']>('STEM');
  const [adviser, setAdviser] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [scheduleTime, setScheduleTime] = useState(SHIFT_PRESETS[0]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [averageMastery, setAverageMastery] = useState<number>(85);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (section) {
      setName(section.name || '');
      setTrackStrand(section.trackStrand || 'STEM');
      setAdviser(section.adviser || '');
      setRoomNumber(section.roomNumber || '');
      setScheduleTime(section.scheduleTime || SHIFT_PRESETS[0]);
      setStudentCount(section.studentCount || 0);
      setAverageMastery(section.averageMastery || 85);
    } else {
      setName('');
      setTrackStrand('STEM');
      setAdviser('');
      setRoomNumber('Building B - Room 303');
      setScheduleTime(SHIFT_PRESETS[0]);
      setStudentCount(0);
      setAverageMastery(85);
    }
    setErrorMsg(null);
  }, [section, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Section name is required (e.g. Grade 11 - STEM C (Newton)).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSave({
        id: section?.id,
        name: name.trim(),
        trackStrand,
        adviser: adviser.trim() || 'Unassigned Adviser',
        roomNumber: roomNumber.trim() || 'To be announced',
        scheduleTime: scheduleTime.trim() || SHIFT_PRESETS[0],
        studentCount: Number(studentCount) || 0,
        averageMastery: Number(averageMastery) || 85
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save section:', err);
      setErrorMsg(err.message || 'Failed to save section. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickNameTemplate = (strand: string, mathematician: string) => {
    setName(`Grade 11 - ${strand} (${mathematician})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase rounded-md">
                  {isEditing ? 'Modify Section' : 'Create Section'}
                </span>
                <span className="text-xs text-slate-400">DepEd SHS Academic Cohort</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isEditing ? `Edit ${section?.name}` : 'Add New Class Section'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Section Official Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grade 11 - STEM C (Newton)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {/* Quick naming suggestions */}
            {!isEditing && (
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">Suggestions:</span>
                <button
                  type="button"
                  onClick={() => handleQuickNameTemplate('STEM C', 'Newton')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                >
                  STEM C (Newton)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNameTemplate('ABM B', 'Quezon')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                >
                  ABM B (Quezon)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNameTemplate('HUMSS B', 'Mabini')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                >
                  HUMSS B (Mabini)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNameTemplate('TVL-ICT B', 'Lovelace')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                >
                  TVL-ICT (Lovelace)
                </button>
              </div>
            )}
          </div>

          {/* Academic Track & Strand */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Academic Track & Strand
            </label>
            <select
              value={trackStrand}
              onChange={(e) => setTrackStrand(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {STRAND_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Adviser & Room Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Class Adviser</span>
              </label>
              <input
                type="text"
                value={adviser}
                onChange={(e) => setAdviser(e.target.value)}
                placeholder="e.g. Prof. Alan Turing, LPT"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Room / Building</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Bldg B - Room 303"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Schedule & Shift */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Class Schedule / Daily Shift</span>
            </label>
            <input
              type="text"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              placeholder="e.g. 6:00 AM – 12:00 PM (Morning Shift)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              {SHIFT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setScheduleTime(preset)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    scheduleTime === preset
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {preset.split('(')[1]?.replace(')', '') || preset}
                </button>
              ))}
            </div>
          </div>

          {/* Target Capacity & Average Mastery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Current / Target Student Count
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Average Target Mastery (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={averageMastery}
                onChange={(e) => setAverageMastery(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Section...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Section'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
