import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, GraduationCap, TrendingUp, Award, Mail, ChevronRight, X, Database, BookOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAllStudents } from '../hooks/useFirebase';
import { UserProfile } from '../types';
import { topics } from '../data/curriculum';

import ConfirmDeleteModal from './ConfirmDeleteModal';

interface FacultyDashboardProps {
  facultyProfile?: UserProfile;
}

export default function FacultyDashboard({ facultyProfile }: FacultyDashboardProps = {}) {
  const { students, loading, addStudent, deleteStudent, editStudent, exportResearchData, awardOralRecitation } = useAllStudents();
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
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newStudentGrade, setNewStudentGrade] = useState('Grade 11');
  const [newStudentSection, setNewStudentSection] = useState('STEM-A');
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [studentActionError, setStudentActionError] = useState<string | null>(null);

  // Oral Recitation Award state
  const [isAwardingRecitation, setIsAwardingRecitation] = useState<UserProfile | null>(null);
  const [recitationPoints, setRecitationPoints] = useState<number>(1);
  const [recitationTopicId, setRecitationTopicId] = useState<string>('general');
  const [recitationNotes, setRecitationNotes] = useState<string>('');
  const [isSavingRecitation, setIsSavingRecitation] = useState<boolean>(false);

  // Credentials view and copy slip modal
  const [createdStudentCredentials, setCreatedStudentCredentials] = useState<{
    displayName: string;
    email: string;
    lrn?: string;
    password?: string;
    grade?: string;
    section?: string;
  } | null>(null);
  const [viewingCredentialsStudent, setViewingCredentialsStudent] = useState<UserProfile | null>(null);
  const [showViewingPassword, setShowViewingPassword] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

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

  const handleGeneratePassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const pass = `Math@${randomNum}`;
    setNewStudentPassword(pass);
    setShowPassword(true);
  };

  const copyCredentialsSlip = (name: string, email: string, lrn?: string, password?: string) => {
    const text = [
      `📚 MathQuest Grade 11 — Student Login Credentials`,
      `Student: ${name}`,
      `Email / ID: ${email || (lrn ? `${lrn}@student.mathquest.internal` : 'N/A')}`,
      ...(lrn ? [`LRN: ${lrn}`] : []),
      ...(password ? [`Password: ${password}`] : []),
      `Portal: Sign in at MathQuest using your Email/LRN and Password.`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    if (newStudentPassword.trim() && newStudentPassword.trim().length < 6) {
      setStudentActionError("Password must be at least 6 characters long.");
      return;
    }

    setIsSavingStudent(true);
    setStudentActionError(null);
    try {
      const added = await addStudent({ 
        displayName: newStudentName.trim(), 
        email: newStudentEmail.trim(),
        lrn: newStudentLrn.trim(),
        grade: newStudentGrade,
        section: newStudentSection.trim(),
        password: newStudentPassword.trim() || undefined
      });

      const effectiveEmail = newStudentEmail.trim() || (newStudentLrn.trim() ? `${newStudentLrn.trim()}@student.mathquest.internal` : '');
      
      // If a password was provided, trigger the credentials confirmation slip
      if (newStudentPassword.trim()) {
        setCreatedStudentCredentials({
          displayName: newStudentName.trim(),
          email: effectiveEmail,
          lrn: newStudentLrn.trim(),
          password: newStudentPassword.trim(),
          grade: newStudentGrade,
          section: newStudentSection.trim()
        });
      }

      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentLrn('');
      setNewStudentPassword('');
      setShowPassword(false);
      setNewStudentGrade('Grade 11');
      setNewStudentSection('STEM-A');
      setIsAddingStudent(false);
    } catch (err: any) {
      console.error("Error adding student:", err);
      setStudentActionError(err.message || "Failed to add student. Please try again.");
    } finally {
      setIsSavingStudent(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingStudent || !newStudentName.trim()) return;
    if (newStudentPassword.trim() && newStudentPassword.trim().length < 6) {
      setStudentActionError("Password must be at least 6 characters long.");
      return;
    }

    setIsSavingStudent(true);
    setStudentActionError(null);
    try {
      await editStudent(isEditingStudent.uid, { 
        displayName: newStudentName.trim(), 
        email: newStudentEmail.trim(),
        lrn: newStudentLrn.trim(),
        grade: newStudentGrade,
        section: newStudentSection.trim(),
        password: newStudentPassword.trim() || undefined
      });
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentLrn('');
      setNewStudentPassword('');
      setShowPassword(false);
      setNewStudentGrade('Grade 11');
      setNewStudentSection('STEM-A');
      setIsEditingStudent(null);
    } catch (err: any) {
      console.error("Error editing student:", err);
      setStudentActionError(err.message || "Failed to update student.");
    } finally {
      setIsSavingStudent(false);
    }
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

  const openAddModal = () => {
    setIsAddingStudent(true);
    setIsEditingStudent(null);
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentLrn('');
    setNewStudentPassword('');
    setShowPassword(false);
    setNewStudentGrade('Grade 11');
    setNewStudentSection('STEM-A');
    setStudentActionError(null);
  };

  const openEditModal = (student: UserProfile) => {
    setIsEditingStudent(student);
    setIsAddingStudent(false);
    setNewStudentName(student.displayName);
    setNewStudentEmail(student.email || '');
    setNewStudentLrn(student.lrn || '');
    setNewStudentPassword(student.temporaryPassword || student.password || '');
    setShowPassword(false);
    setNewStudentGrade(student.grade || 'Grade 11');
    setNewStudentSection(student.section || 'STEM-A');
    setStudentActionError(null);
  };

  const handleAwardRecitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAwardingRecitation) return;
    
    setIsSavingRecitation(true);
    try {
      const selectedTopic = topics.find(t => t.id === recitationTopicId);
      const topicTitle = selectedTopic ? selectedTopic.title : 'General Math Recitation';
      
      const facultyName = facultyProfile?.displayName || 'Faculty Instructor';
      
      await awardOralRecitation(
        isAwardingRecitation.uid,
        isAwardingRecitation.displayName,
        recitationPoints,
        recitationTopicId,
        topicTitle,
        recitationNotes,
        facultyName
      );
      
      // Reset state
      setIsAwardingRecitation(null);
      setRecitationPoints(1);
      setRecitationTopicId('general');
      setRecitationNotes('');
    } catch (err) {
      console.error("Error awarding recitation points:", err);
    } finally {
      setIsSavingRecitation(false);
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
              <a 
                href="https://console.firebase.google.com/project/united-spirit-hsjh2/authentication/users"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 text-amber-800 font-bold rounded-xl hover:bg-amber-100 transition-colors text-xs border border-amber-200/70 shadow-sm"
                title="Open Firebase Console to view and manage registered Auth accounts"
              >
                <Icons.ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                Firebase Auth Console
              </a>
              <button 
                onClick={openAddModal}
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
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{student.displayName}</span>
                          {(student.temporaryPassword || student.password) && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-100" title="Login credentials configured">
                              <Icons.Key className="w-2.5 h-2.5" />
                              Pass Set
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.email || 'No email'}
                        </div>
                        {student.oralRecitationPoints ? (
                          <div className="mt-1 flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200" title="Oral Recitation Points">
                              <Icons.Mic className="w-3 h-3 text-amber-600" />
                              Recitations: +{student.oralRecitationPoints} pts
                            </span>
                          </div>
                        ) : null}
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
                        onClick={() => {
                          setIsAwardingRecitation(student);
                          setRecitationPoints(1);
                          setRecitationTopicId('general');
                          setRecitationNotes('');
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Award Oral Recitation Plus Points"
                      >
                        <Icons.Mic className="w-5 h-5" />
                      </button>
                      {(student.temporaryPassword || student.password) && (
                        <button 
                          onClick={() => {
                            setViewingCredentialsStudent(student);
                            setShowViewingPassword(false);
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="View & Copy Student Login Credentials"
                        >
                          <Icons.Key className="w-5 h-5" />
                        </button>
                      )}
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
                  setStudentActionError(null);
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

              {studentActionError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <Icons.AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{studentActionError}</span>
                </div>
              )}

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

                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {isEditingStudent ? 'Account Password (Optional)' : 'Student Password'}
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                    >
                      <Icons.Sparkles className="w-3 h-3" />
                      Auto-generate
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      placeholder={isEditingStudent ? "Leave blank to keep current password" : "Min. 6 characters (or click Auto-generate)"}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm pr-11 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 ml-1">
                    {isEditingStudent 
                      ? "Enter a new password (min. 6 chars) to update, or leave blank to keep unchanged." 
                      : "Password for the student to log into MathQuest. Minimum 6 characters."}
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isSavingStudent}
                  className="w-full py-3.5 mt-2 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSavingStudent ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Student...</span>
                    </>
                  ) : (
                    <span>{isEditingStudent ? 'Save Changes' : 'Create Student Profile'}</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Credentials Slip / Card Modal */}
      <AnimatePresence>
        {(createdStudentCredentials || viewingCredentialsStudent) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100"
            >
              <button 
                onClick={() => {
                  setCreatedStudentCredentials(null);
                  setViewingCredentialsStudent(null);
                }}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 text-emerald-600">
                <Icons.Key className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {createdStudentCredentials ? 'Student Account Created' : 'Student Login Credentials'}
              </h3>
              <p className="text-slate-500 text-xs mb-5">
                Share these login details with the student so they can access their MathQuest portal.
              </p>

              {(() => {
                const creds = createdStudentCredentials || {
                  displayName: viewingCredentialsStudent?.displayName || '',
                  email: viewingCredentialsStudent?.email || '',
                  lrn: viewingCredentialsStudent?.lrn,
                  password: viewingCredentialsStudent?.temporaryPassword || viewingCredentialsStudent?.password || '(Set by student or teacher)',
                  grade: viewingCredentialsStudent?.grade,
                  section: viewingCredentialsStudent?.section
                };
                const displayPass = creds.password || '••••••••';

                return (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Student</span>
                        <span className="font-bold text-slate-800 text-sm">{creds.displayName}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Login ID / Email</span>
                        <span className="font-mono font-bold text-indigo-600 text-xs break-all">{creds.email || 'N/A'}</span>
                      </div>

                      {creds.lrn && (
                        <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">LRN</span>
                          <span className="font-mono font-bold text-slate-800 text-xs">{creds.lrn}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Password</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {showViewingPassword ? displayPass : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowViewingPassword(!showViewingPassword)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={showViewingPassword ? "Hide" : "Show"}
                          >
                            {showViewingPassword ? <Icons.EyeOff className="w-3.5 h-3.5" /> : <Icons.Eye className="w-3.5 h-3.5 text-slate-500" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => copyCredentialsSlip(creds.displayName, creds.email, creds.lrn, creds.password)}
                        className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-indigo-100"
                      >
                        {copiedSuccess ? (
                          <>
                            <Icons.Check className="w-4 h-4 text-emerald-300" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Icons.Copy className="w-4 h-4" />
                            <span>Copy Login Slip</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCreatedStudentCredentials(null);
                          setViewingCredentialsStudent(null);
                        }}
                        className="py-3 px-5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all text-xs"
                      >
                        Done
                      </button>
                    </div>

                    <div className="pt-2 text-center">
                      <a
                        href="https://console.firebase.google.com/project/united-spirit-hsjh2/authentication/users"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      >
                        <Icons.ExternalLink className="w-3 h-3" />
                        <span>Manage accounts in Firebase Console</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Oral Recitation Award Modal */}
      <AnimatePresence>
        {isAwardingRecitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                type="button"
                onClick={() => setIsAwardingRecitation(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                <Icons.Mic className="w-8 h-8 text-amber-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                Award Recitation Points
              </h2>
              <p className="text-slate-500 mb-6 text-sm">
                Award classroom plus points to <strong className="text-slate-800">{isAwardingRecitation.displayName}</strong>. Points will be converted into XP (+100 XP per point).
              </p>

              <form onSubmit={handleAwardRecitation} className="space-y-5">
                {/* Points selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
                    Select Plus Points
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 5].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setRecitationPoints(pts)}
                        className={`py-3 text-center rounded-xl font-extrabold text-sm border transition-all ${
                          recitationPoints === pts
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100 scale-[1.03]'
                            : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        +{pts} Pt{pts > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Class Topic / Lesson
                  </label>
                  <select
                    value={recitationTopicId}
                    onChange={(e) => setRecitationTopicId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-slate-800"
                  >
                    <option value="general">General / Unassigned</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Feedback / Teacher's Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={recitationNotes}
                    onChange={(e) => setRecitationNotes(e.target.value)}
                    placeholder="e.g. Excellent participation. Answered the complex logarithmic rational equation correctly."
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAwardingRecitation(null)}
                    className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRecitation}
                    className="flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    {isSavingRecitation ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Icons.Award className="w-4 h-4" />
                        <span>Award +{(recitationPoints * 100).toLocaleString()} XP</span>
                      </>
                    )}
                  </button>
                </div>
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
