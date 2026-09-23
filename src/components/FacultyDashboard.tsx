import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Search, GraduationCap, TrendingUp, Award, Mail, ChevronRight, X, Database, BookOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAllStudents } from '../hooks/useFirebase';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { UserProfile, QuizResult } from '../types';
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

  // Student Assessment Results View States
  const [viewingResultsStudent, setViewingResultsStudent] = useState<UserProfile | null>(null);
  const [studentResults, setStudentResults] = useState<QuizResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultsTab, setResultsTab] = useState<'diagnostic' | 'formative'>('diagnostic');
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  const fetchStudentResults = async (studentId: string) => {
    setIsLoadingResults(true);
    setStudentResults([]);
    try {
      const q = query(collection(db, `users/${studentId}/results`), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResult));
      setStudentResults(list);
    } catch (err) {
      console.error("Error fetching student results:", err);
      // Fallback local storage check if offline or firestore fails
      try {
        const allLocalResults = JSON.parse(localStorage.getItem('quiz_results_backup') || '[]');
        const filtered = allLocalResults.filter((r: any) => r.userId === studentId);
        setStudentResults(filtered);
      } catch (e) {
        setStudentResults([]);
      }
    } finally {
      setIsLoadingResults(false);
    }
  };

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
    
    // Ensure points are strictly between 1 and 100
    const validatedPoints = Math.min(100, Math.max(1, Math.round(Number(recitationPoints)) || 1));
    
    setIsSavingRecitation(true);
    try {
      const selectedTopic = topics.find(t => t.id === recitationTopicId);
      const topicTitle = selectedTopic ? selectedTopic.title : 'General Math Recitation';
      
      const facultyName = facultyProfile?.displayName || 'Faculty Instructor';
      
      await awardOralRecitation(
        isAwardingRecitation.uid,
        isAwardingRecitation.displayName,
        validatedPoints,
        recitationTopicId,
        topicTitle,
        recitationNotes,
        facultyName
      );
      
      // Reset state
      setIsAwardingRecitation(null);
      setRecitationPoints(10);
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
                          {(student.diagnosticViolations && student.diagnosticViolations > 0) && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-semibold border border-rose-100" title={`${student.diagnosticViolations} Academic Integrity Violations (Tab Switches)`}>
                              <Icons.ShieldAlert className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
                              {student.diagnosticViolations} Tab Out{(student.diagnosticViolations > 1) ? 's' : ''}
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
                          setViewingResultsStudent(student);
                          setResultsTab('diagnostic');
                          fetchStudentResults(student.uid);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="View Diagnostic & Formative Results"
                      >
                        <Icons.BarChart2 className="w-5 h-5 text-indigo-600" />
                      </button>
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
                      <option value="Grade 10">Grade 10</option>
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
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Icons.Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Student Choice: Students can choose and update what section and grade they are upon registration or in their profile.</span>
                </p>

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
                Input Oral Recitation Points
              </h2>
              <p className="text-slate-500 mb-5 text-sm">
                Record oral recitation score for <strong className="text-slate-800">{isAwardingRecitation.displayName}</strong> (1 to 100 points). Points are converted to XP (+100 XP per point).
              </p>

              <form onSubmit={handleAwardRecitation} className="space-y-4">
                {/* Points selector 1-100 */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                      Recitation Score (1 - 100 Points)
                    </label>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      +{(recitationPoints * 100).toLocaleString()} XP
                    </span>
                  </div>

                  {/* Number Input & Steppers */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRecitationPoints(prev => Math.max(1, prev - 5))}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                      title="-5 points"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecitationPoints(prev => Math.max(1, prev - 1))}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                      title="-1 point"
                    >
                      -1
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={recitationPoints || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val)) {
                            setRecitationPoints(1);
                          } else {
                            setRecitationPoints(Math.min(100, Math.max(1, val)));
                          }
                        }}
                        className="w-full py-2.5 px-3 bg-white border-2 border-amber-300 rounded-xl text-center text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-inner"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        / 100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRecitationPoints(prev => Math.min(100, prev + 1))}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                      title="+1 point"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecitationPoints(prev => Math.min(100, prev + 5))}
                      className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                      title="+5 points"
                    >
                      +5
                    </button>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {[5, 10, 20, 50, 75, 100].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setRecitationPoints(pts)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          recitationPoints === pts
                            ? 'bg-amber-500 text-white shadow-sm font-extrabold scale-105'
                            : 'bg-white/80 text-slate-600 border border-slate-200/70 hover:bg-white'
                        }`}
                      >
                        {pts} pts
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
                    rows={2}
                    value={recitationNotes}
                    onChange={(e) => setRecitationNotes(e.target.value)}
                    placeholder="e.g. Excellent recitation. Demonstrated thorough mastery of rational functions."
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
                        <span>Award {recitationPoints} Pts (+{(recitationPoints * 100).toLocaleString()} XP)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Student Progress / Results Modal */}
      <AnimatePresence>
        {viewingResultsStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl relative flex flex-col my-8 max-h-[90vh]"
            >
              {/* Header */}
              <button 
                type="button"
                onClick={() => setViewingResultsStudent(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                  <Icons.GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    {viewingResultsStudent.displayName}
                    <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                      Level {viewingResultsStudent.level}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    LRN: {viewingResultsStudent.lrn || 'N/A'} • {viewingResultsStudent.grade || 'Grade 11'} - {viewingResultsStudent.section || 'STEM-A'} • {viewingResultsStudent.email}
                  </p>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 px-6 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setResultsTab('diagnostic')}
                  className={`py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                    resultsTab === 'diagnostic'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icons.Compass className="w-4 h-4" />
                  <span>Diagnostic Assessment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultsTab('formative')}
                  className={`py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                    resultsTab === 'formative'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icons.BookOpen className="w-4 h-4" />
                  <span>Formative Quizzes ({isLoadingResults ? '...' : studentResults.length})</span>
                </button>
              </div>

              {/* Scrollable Content Panel */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/40 space-y-6">
                {resultsTab === 'diagnostic' ? (
                  <div className="space-y-6">
                    {/* Diagnostic Summary stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</span>
                        <div className="flex items-center gap-2">
                          {viewingResultsStudent.diagnosticCompleted ? (
                            <>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              <span className="font-extrabold text-slate-800 text-sm">Completed Assessment</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="font-extrabold text-slate-700 text-sm">Pending / Incomplete</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Baseline Ability</span>
                        <div className="flex items-center gap-2">
                          <Icons.TrendingUp className="w-4 h-4 text-indigo-500" />
                          <span className="font-extrabold text-slate-800 text-sm">
                            {viewingResultsStudent.diagnosticCompleted 
                              ? `Ability Estimate (θ): ${viewingResultsStudent.diagnosticAbility || '0.00'}`
                              : 'Pending Assessment'
                            }
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Academic Integrity</span>
                        <div className="flex items-center gap-2">
                          <Icons.ShieldAlert className={`w-4 h-4 ${
                            (viewingResultsStudent.diagnosticViolations || 0) > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'
                          }`} />
                          <span className="font-extrabold text-slate-800 text-sm">
                            {(viewingResultsStudent.diagnosticViolations || 0) > 0 ? (
                              <span className="text-rose-600">
                                {viewingResultsStudent.diagnosticViolations} Tab Out{(viewingResultsStudent.diagnosticViolations || 0) > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-emerald-600">No Violations Logged</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mathematical Ability Slider indicator */}
                    {viewingResultsStudent.diagnosticCompleted && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Baseline Competency Range</h4>
                        
                        <div className="relative pt-6 pb-2">
                          {/* Scale line */}
                          <div className="h-2 w-full bg-slate-100 rounded-full relative">
                            {/* Accent indicator */}
                            <div className="absolute left-1/4 right-1/4 h-2 bg-indigo-100" />
                            
                            {/* Pin */}
                            {(() => {
                              const ability = parseFloat(viewingResultsStudent.diagnosticAbility || '0');
                              // Normalise -3.0 to +3.0 onto 0% to 100%
                              const pct = Math.max(5, Math.min(95, ((ability + 3) / 6) * 100));
                              return (
                                <div 
                                  className="absolute w-5 h-5 bg-indigo-600 rounded-full border-2 border-white shadow -top-1.5 -translate-x-1/2 flex items-center justify-center group cursor-pointer"
                                  style={{ left: `${pct}%` }}
                                >
                                  <div className="absolute -top-7 bg-indigo-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">
                                    θ = {ability.toFixed(2)}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          
                          {/* Labels */}
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2.5">
                            <span>REMEDIAL (θ ≤ -1.5)</span>
                            <span>BASIC (θ = 0.0)</span>
                            <span>ADVANCED (θ ≥ +1.5)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Competency Mastery breakdown */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Baseline Topic Competency Scores</h4>
                      </div>
                      <div className="p-4 divide-y divide-slate-50">
                        {topics.map((topic) => {
                          // Extract scores
                          const score = viewingResultsStudent.diagnosticScores?.[topic.title] ?? 
                            viewingResultsStudent.diagnosticScores?.[topic.id] ?? 
                            viewingResultsStudent.competencyScores?.[topic.title] ?? 
                            viewingResultsStudent.competencyScores?.[topic.id];
                          
                          const hasScore = score !== undefined;
                          const scorePct = hasScore ? Math.round(score) : 0;
                          
                          return (
                            <div key={topic.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                              <div className="flex-1">
                                <span className="font-bold text-slate-800 block">{topic.title}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Topic Area placement status</span>
                              </div>
                              <div className="flex items-center gap-3 w-48 shrink-0">
                                {hasScore ? (
                                  <>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${
                                          scorePct >= 75 ? 'bg-emerald-500' : scorePct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${scorePct}%` }}
                                      />
                                    </div>
                                    <span className={`font-black text-right w-10 ${
                                      scorePct >= 75 ? 'text-emerald-600' : scorePct >= 50 ? 'text-amber-600' : 'text-rose-600'
                                    }`}>
                                      {scorePct}%
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic block text-right w-full">Pending Diagnostic</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isLoadingResults ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-3"
                        />
                        <span className="text-xs text-slate-500">Querying formative quiz records from Firebase...</span>
                      </div>
                    ) : studentResults.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm">
                        <Icons.Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <h4 className="font-bold text-slate-700">No Formative Quiz Attempts</h4>
                        <p className="text-xs text-slate-500 mt-1">This student has not submitted any lesson formative quizzes yet.</p>
                      </div>
                    ) : (
                      studentResults.map((result) => {
                        // Match topic ID to topic Title
                        const matchedTopic = topics.find(t => t.id === result.quizId || t.quizzes?.some(q => q.id === result.quizId));
                        const title = matchedTopic ? matchedTopic.title : result.quizId;
                        const scorePct = Math.round((result.score / result.total) * 100);
                        const isExpanded = expandedQuizId === result.id;
                        
                        return (
                          <div key={result.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Card Header clickable to expand response log */}
                            <div 
                              onClick={() => setExpandedQuizId(isExpanded ? null : (result.id || null))}
                              className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                            >
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                                  {title}
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    result.quizMode === 'adaptive'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  }`}>
                                    {result.quizMode || 'Standard'}
                                  </span>
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-medium">
                                  <span>
                                    Attempt Date: {result.timestamp ? new Date(result.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' ' + new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown Date'}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline" />
                                  {result.violations && result.violations > 0 ? (
                                    <span className="inline-flex items-center gap-1 font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                      <Icons.ShieldAlert className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
                                      {result.violations} Tab Out{(result.violations > 1) ? 's' : ''} Logged
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                      <Icons.ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                                      Secure Session
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className={`text-base font-black ${
                                    scorePct >= 75 ? 'text-emerald-600' : scorePct >= 50 ? 'text-amber-600' : 'text-rose-600'
                                  }`}>
                                    {result.score} / {result.total}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block font-bold">Score ({scorePct}%)</span>
                                </div>
                                <div className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                  {isExpanded ? (
                                    <Icons.ChevronUp className="w-4 h-4 text-slate-500" />
                                  ) : (
                                    <Icons.ChevronDown className="w-4 h-4 text-slate-500" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Response Details log */}
                            {isExpanded && (
                              <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Response Breakdown</h5>
                                {result.itemResponses && result.itemResponses.length > 0 ? (
                                  <div className="space-y-3">
                                    {result.itemResponses.map((ir, rIdx) => (
                                      <div key={rIdx} className="bg-white p-4 rounded-xl border border-slate-100 text-xs space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="font-bold text-slate-800">
                                            Q{rIdx + 1}: {ir.questionText || `Mathematics Competency Problem (ID: ${ir.itemId})`}
                                          </div>
                                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                                            ir.isCorrect 
                                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                                          }`}>
                                            {ir.isCorrect ? 'Correct' : 'Incorrect'}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                          <div className="p-2 rounded bg-slate-50 text-slate-600 text-[11px]">
                                            <span className="font-semibold text-slate-400 mr-1.5">Submitted Option:</span> 
                                            {ir.selectedOption !== undefined ? `Option ${String.fromCharCode(65 + ir.selectedOption)}` : 'No Response'}
                                          </div>
                                          <div className="p-2 rounded bg-emerald-50/40 text-emerald-800 text-[11px] font-medium">
                                            <span className="font-semibold text-emerald-600 mr-1.5">Correct Option:</span> 
                                            {ir.correctOption !== undefined ? `Option ${String.fromCharCode(65 + ir.correctOption)}` : 'N/A'}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No itemized responses stored for this attempt record.</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0 rounded-b-[32px]">
                <button
                  type="button"
                  onClick={() => setViewingResultsStudent(null)}
                  className="px-6 py-2.5 bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-900 transition-all shadow-md"
                >
                  Close Report
                </button>
              </div>
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
