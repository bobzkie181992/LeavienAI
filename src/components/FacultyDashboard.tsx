import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, GraduationCap, TrendingUp, Award, Mail, ChevronRight, X, Database, BookOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAllStudents } from '../hooks/useFirebase';
import { UserProfile } from '../types';

import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function FacultyDashboard() {
  const { students, loading, addStudent, deleteStudent, editStudent, exportResearchData } = useAllStudents();
  const [deletingStudentUid, setDeletingStudentUid] = useState<string | null>(null);
  const [deletingStudentName, setDeletingStudentName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState<UserProfile | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentLrn, setNewStudentLrn] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('Grade 11');
  const [newStudentSection, setNewStudentSection] = useState('STEM-A');

  const handleExportData = async () => {
    try {
      const data = await exportResearchData();
      if (data.length === 0) {
        alert('No research data available to export.');
        return;
      }
      
      const headers = [
        'Student ID',
        'Item ID',
        'Competency',
        'Response Option',
        'Is Correct',
        'Item Difficulty',
        'Item Discrimination',
        'Ability Estimate',
        'Response Time (ms)',
        'Assessment Attempt',
        'Date/Time',
        'Mastery Status',
        'Grade',
        'Section'
      ];
      
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.studentId,
          row.itemId,
          `"${row.competency}"`,
          row.responseOption,
          row.isCorrect,
          row.itemDifficulty,
          row.itemDiscrimination,
          row.abilityEstimate,
          row.responseTimeMs,
          row.assessmentAttempt,
          row.dateTime,
          row.masteryStatus
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `research_data_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      alert('Error exporting data. See console for details.');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.lrn && s.lrn.includes(searchTerm));
    const matchesGrade = gradeFilter === 'All' || (s.grade || 'Grade 11') === gradeFilter;
    const matchesSection = sectionFilter === 'All' || (s.section || 'STEM-A') === sectionFilter;
    return matchesSearch && matchesGrade && matchesSection;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName) return;
    await addStudent({ 
      displayName: newStudentName, 
      email: newStudentEmail,
      lrn: newStudentLrn,
      grade: newStudentGrade,
      section: newStudentSection
    });
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentLrn('');
    setNewStudentGrade('Grade 11');
    setNewStudentSection('STEM-A');
    setIsAddingStudent(false);
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingStudent || !newStudentName) return;
    await editStudent(isEditingStudent.uid, { 
      displayName: newStudentName, 
      email: newStudentEmail,
      lrn: newStudentLrn,
      grade: newStudentGrade,
      section: newStudentSection
    });
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentLrn('');
    setNewStudentGrade('Grade 11');
    setNewStudentSection('STEM-A');
    setIsEditingStudent(null);
  };

  const openDeleteConfirm = (student: UserProfile) => {
    setDeletingStudentUid(student.uid);
    setDeletingStudentName(student.displayName);
  };

  const confirmDeleteStudent = async () => {
    if (!deletingStudentUid) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deletingStudentUid);
    } finally {
      setIsDeleting(false);
      setDeletingStudentUid(null);
      setDeletingStudentName('');
    }
  };

  const openEditModal = (student: UserProfile) => {
    setIsEditingStudent(student);
    setNewStudentName(student.displayName);
    setNewStudentEmail(student.email || '');
    setNewStudentLrn(student.lrn || '');
    setNewStudentGrade(student.grade || 'Grade 11');
    setNewStudentSection(student.section || 'STEM-A');
  };

  const handleSeedStudents = async () => {
    if (window.confirm('This will add sample students to the database. Continue?')) {
      const sampleStudents = [
        { displayName: 'Alice Chen', email: 'alice@example.com', lrn: '109283741001', grade: 'Grade 11', section: 'STEM-A', xp: 450, level: 3, streak: 5, badges: ['first-steps', 'perfect-score'] },
        { displayName: 'Marcus Johnson', email: 'marcus@example.com', lrn: '109283741002', grade: 'Grade 11', section: 'STEM-B', xp: 1200, level: 4, streak: 12, badges: ['first-steps', 'math-whiz'] },
        { displayName: 'Sarah Williams', email: 'sarah@example.com', lrn: '109283741003', grade: 'Grade 12', section: 'ABM-1', xp: 850, level: 3, streak: 2, badges: ['first-steps'] },
      ];
      
      for (const s of sampleStudents) {
        await addStudent(s);
      }
      alert('Sample students added!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Users className="w-6 h-6 text-indigo-600" />} 
          label="Total Students" 
          value={students.length.toString()} 
          color="indigo"
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />} 
          label="Avg. Mastery Level" 
          value={(students.reduce((acc, s) => acc + s.level, 0) / (students.length || 1)).toFixed(1)} 
          color="emerald"
        />
        <StatCard 
          icon={<Award className="w-6 h-6 text-amber-600" />} 
          label="Top Streak" 
          value={Math.max(...students.map(s => s.streak), 0).toString()} 
          color="amber"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-xs"
              >
                <Icons.Download className="w-4 h-4" />
                Export Data
              </button>
              {students.length === 0 && (
                <button 
                  onClick={handleSeedStudents}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 font-bold rounded-xl hover:bg-amber-100 transition-colors text-xs"
                >
                  <Database className="w-4 h-4" />
                  Seed Sample Students
                </button>
              )}
              <button 
                onClick={() => setIsAddingStudent(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-xs shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>

          {/* Grade & Section Filters */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter By:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Grades</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Sections</option>
              <option value="STEM-A">STEM-A</option>
              <option value="STEM-B">STEM-B</option>
              <option value="ABM-1">ABM-1</option>
              <option value="HUMSS-1">HUMSS-1</option>
            </select>

            {(gradeFilter !== 'All' || sectionFilter !== 'All') && (
              <button
                onClick={() => { setGradeFilter('All'); setSectionFilter('All'); }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">LRN</th>
                <th className="px-6 py-4">Grade & Section</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">XP</th>
                <th className="px-6 py-4">Badges</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.uid} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                        {student.displayName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{student.displayName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.lrn ? (
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block tracking-wider">
                        {student.lrn}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {student.grade || 'Grade 11'}
                      </span>
                      <span className="inline-block ml-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                        {student.section || 'STEM-A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                      Lvl {student.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{student.xp.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {student.badges.slice(0, 3).map((badge, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center">
                          <Award className="w-3 h-3 text-indigo-600" />
                        </div>
                      ))}
                      {student.badges.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                          +{student.badges.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(student)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Student"
                      >
                        <Icons.Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => openDeleteConfirm(student)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Student"
                      >
                        <Icons.Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 opacity-20" />
                    </div>
                    No students found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Student Modal */}
      <AnimatePresence>
        {(isAddingStudent || isEditingStudent) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setIsAddingStudent(false);
                  setIsEditingStudent(null);
                }}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                {isEditingStudent ? (
                  <Icons.Edit2 className="w-8 h-8 text-indigo-600" />
                ) : (
                  <UserPlus className="w-8 h-8 text-indigo-600" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isEditingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                {isEditingStudent ? 'Update student profile details, grade level, and section.' : 'Create a profile for your student with grade and section details.'}
              </p>

              <form onSubmit={isEditingStudent ? handleEditStudent : handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Learner Reference Number (LRN)</label>
                  <input 
                    type="text" 
                    maxLength={12}
                    value={newStudentLrn}
                    onChange={(e) => setNewStudentLrn(e.target.value.replace(/\D/g, ''))}
                    placeholder="12-digit LRN (e.g. 109283741001)"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Grade Level</label>
                    <select
                      value={newStudentGrade}
                      onChange={(e) => setNewStudentGrade(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Section</label>
                    <input
                      type="text"
                      required
                      value={newStudentSection}
                      onChange={(e) => setNewStudentSection(e.target.value)}
                      placeholder="e.g. STEM-A"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {isEditingStudent ? 'Save Changes' : 'Create Student Profile'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={!!deletingStudentUid}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${deletingStudentName || 'this student'}? All associated progress history will be removed.`}
        confirmText="Delete Student"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDeleteStudent}
        onClose={() => setDeletingStudentUid(null)}
      />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
        <div className={`text-2xl font-black text-${color}-600`}>{value}</div>
      </div>
    </div>
  );
}
