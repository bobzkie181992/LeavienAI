import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  Layers, 
  Search, 
  Key, 
  ShieldCheck, 
  UserCheck, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ArrowRight,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  User,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { UserProfile } from '../../types';
import { Grade11Section } from '../../data/grade11SampleData';
import { useSections } from '../../hooks/useSections';
import FacultyDashboard from '../FacultyDashboard';
import SectionModal from '../SectionModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal';

interface TeacherClassesViewProps {
  students: UserProfile[];
  profile?: UserProfile;
  initialSubTab?: 'grade11' | 'sections' | 'students';
  onAddReportForStudent?: (student: UserProfile) => void;
}

export default function TeacherClassesView({
  students,
  profile,
  initialSubTab = 'students',
  onAddReportForStudent
}: TeacherClassesViewProps) {
  const { sections, loading: sectionsLoading, saveSection, deleteSection, resetToDefaults } = useSections();

  const [subTab, setSubTab] = useState<'grade11' | 'sections' | 'students'>(initialSubTab);
  const [selectedStrandFilter, setSelectedStrandFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRosterSection, setActiveRosterSection] = useState<string>('All');

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Grade11Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Grade11Section | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers for Add, Edit, Delete
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: Grade11Section) => {
    setEditingSection(sec);
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (sectionData: Partial<Grade11Section> & { name: string }) => {
    const isEdit = Boolean(editingSection);
    const saved = await saveSection(sectionData);
    showToast(isEdit ? `Updated section "${saved.name}" successfully!` : `Created section "${saved.name}" successfully!`);
  };

  const handleConfirmDeleteSection = async () => {
    if (!deletingSection) return;
    setIsDeleting(true);
    try {
      await deleteSection(deletingSection.id);
      showToast(`Section "${deletingSection.name}" has been deleted.`, 'info');
      setDeletingSection(null);
    } catch (err: any) {
      console.error('Failed to delete section:', err);
      showToast(err.message || 'Failed to delete section', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewRosterForSection = (sectionName: string) => {
    setActiveRosterSection(sectionName);
    setSubTab('students');
  };

  // Helper to get real enrolled student count from active students list
  const getEnrolledCount = (sec: Grade11Section) => {
    const matched = students.filter(s => {
      if (!s.section) return false;
      const cleanS = s.section.toLowerCase();
      const cleanName = sec.name.toLowerCase();
      const cleanId = sec.id.toLowerCase();
      return cleanS === cleanName || cleanS === cleanId || cleanName.includes(cleanS) || cleanS.includes(sec.trackStrand.toLowerCase());
    });
    return matched.length > 0 ? matched.length : sec.studentCount || 0;
  };

  // Filtered sections
  const filteredSections = useMemo(() => {
    return sections.filter(sec => {
      // Strand filter
      if (selectedStrandFilter !== 'All' && sec.trackStrand !== selectedStrandFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sec.name.toLowerCase().includes(q);
        const matchAdviser = (sec.adviser || '').toLowerCase().includes(q);
        const matchRoom = (sec.roomNumber || '').toLowerCase().includes(q);
        const matchStrand = (sec.trackStrand || '').toLowerCase().includes(q);
        if (!matchName && !matchAdviser && !matchRoom && !matchStrand) return false;
      }
      return true;
    });
  }, [sections, selectedStrandFilter, searchQuery]);

  const getStrandBadgeColor = (strand: string) => {
    switch (strand) {
      case 'STEM': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ABM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HUMSS': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'TVL-ICT': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'GAS': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-black backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-900/90 text-rose-100 border-rose-500/50'
                : toastMessage.type === 'info'
                ? 'bg-slate-900/90 text-sky-200 border-sky-500/50'
                : 'bg-slate-900/90 text-emerald-200 border-emerald-500/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.message}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Classroom Administration</span>
              </span>
              <span className="bg-white/10 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {sections.length} Active Sections
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Class Rosters & Section Management</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Create, edit, and organize Senior High School sections across STEM, ABM, HUMSS, TVL-ICT, and GAS strands, assign advisers, set schedules, and monitor student rosters.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleOpenAddSection}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Section</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('sections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'sections'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Sections & Strands ({sections.length})</span>
        </button>

        <button
          onClick={() => setSubTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'students'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Student Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setSubTab('grade11')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'grade11'
              ? 'bg-slate-900 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span>Grade 11 Overview</span>
        </button>
      </div>

      {/* 1. SECTIONS & STRANDS VIEW */}
      {subTab === 'sections' && (
        <div className="space-y-5">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Sections</span>
              <p className="text-2xl font-black text-slate-900">{sections.length}</p>
              <p className="text-[11px] text-slate-500">Across 5 academic strands</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Total Students</span>
              <p className="text-2xl font-black text-indigo-600">{students.length || 240}</p>
              <p className="text-[11px] text-slate-500">Enrolled in active rosters</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Average Mastery</span>
              <p className="text-2xl font-black text-emerald-600">84.2%</p>
              <p className="text-[11px] text-emerald-700 font-bold">DepEd Target: ≥80%</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Morning / PM Shifts</span>
              <p className="text-2xl font-black text-slate-900">2 Shifts</p>
              <p className="text-[11px] text-slate-500">Balanced room utilization</p>
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search section by name, adviser, room, or strand..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto shrink-0">
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-1">Strand:</span>
                {['All', 'STEM', 'ABM', 'HUMSS', 'TVL-ICT', 'GAS'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStrandFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedStrandFilter === st
                        ? 'bg-slate-900 text-white font-black shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddSection}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Section</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Reset all sections to default DepEd SHS baseline?')) {
                      await resetToDefaults();
                      showToast('Restored default sections.');
                    }
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Reset to default sections"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sections Grid */}
          {filteredSections.length === 0 ? (
            <div className="py-12 px-6 bg-white rounded-3xl border border-slate-200 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">No Sections Found</h3>
                <p className="text-xs text-slate-500">
                  {searchQuery || selectedStrandFilter !== 'All'
                    ? 'No sections match your search or filter. Try clearing filters.'
                    : 'You currently have no class sections created.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSection}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Section</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSections.map((sec) => {
                const count = getEnrolledCount(sec);
                const badgeColor = getStrandBadgeColor(sec.trackStrand);

                return (
                  <div
                    key={sec.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                          {sec.trackStrand} Track
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSection(sec)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit section details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingSection(sec)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Section Title & Info */}
                      <div>
                        <h4 className="font-black text-slate-900 text-base leading-snug group-hover:text-indigo-950 transition-colors">
                          {sec.name}
                        </h4>

                        <div className="space-y-1 pt-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{sec.adviser || 'Unassigned Adviser'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{sec.roomNumber || 'Room unassigned'}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{sec.scheduleTime || 'Regular Day Shift'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Student Count & Mastery Progress */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{count} Students</span>
                        </span>
                        <span className="text-indigo-600 font-black">{sec.averageMastery || 85}% Mastery</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.min(100, sec.averageMastery || 85)}%` }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewRosterForSection(sec.name)}
                        className="w-full py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200/70"
                      >
                        <span>View Class Roster</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. STUDENT DIRECTORY VIEW */}
      {subTab === 'students' && (
        <div>
          <FacultyDashboard facultyProfile={profile} />
        </div>
      )}

      {/* 3. GRADE 11 OVERVIEW */}
      {subTab === 'grade11' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900">Grade 11 Academic Cohort Diagnostics</h3>
            <p className="text-xs text-slate-500">Cross-sectional performance analytics across all Senior High School sections.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Enrolled</span>
              <p className="text-2xl font-black text-indigo-600">{students.length || 24}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Average Mastery</span>
              <p className="text-2xl font-black text-emerald-600">82.4%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Passing Rate</span>
              <p className="text-2xl font-black text-sky-600">88%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Intervention Count</span>
              <p className="text-2xl font-black text-amber-600">3</p>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Section Modal */}
      <SectionModal
        isOpen={isSectionModalOpen}
        section={editingSection}
        onClose={() => {
          setIsSectionModalOpen(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
      />

      {/* Confirm Delete Section Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingSection)}
        title="Delete Class Section"
        message={`Are you sure you want to delete "${deletingSection?.name}"? Any students assigned to this section will remain in the database, but this section will be removed from your active class list.`}
        confirmText="Delete Section"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteSection}
        onClose={() => setDeletingSection(null)}
      />
    </div>
  );
}
