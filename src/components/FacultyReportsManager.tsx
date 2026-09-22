import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  GraduationCap, 
  TrendingUp, 
  Target, 
  Users, 
  User, 
  X, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award,
  ChevronRight,
  Flame,
  Mic,
  BarChart2
} from 'lucide-react';
import { 
  UserProfile, 
  TeacherReport, 
  TeacherReportCategory, 
  AcademicQuarter, 
  PerformanceRating 
} from '../types';
import { topics } from '../data/curriculum';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface FacultyReportsManagerProps {
  students: UserProfile[];
  reports: TeacherReport[];
  loading?: boolean;
  facultyProfile?: UserProfile;
  onSaveReport: (report: Omit<TeacherReport, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => Promise<TeacherReport | void>;
  onDeleteReport: (reportId: string) => Promise<void>;
  preselectedStudent?: UserProfile | null;
  onClearPreselectedStudent?: () => void;
}

const CATEGORY_LABELS: Record<TeacherReportCategory, { label: string; icon: any; color: string }> = {
  student_progress: { label: 'Student Progress & Growth', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  diagnostic_mastery: { label: 'Diagnostic Competency Report', icon: Target, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  remediation_plan: { label: 'Remediation & Intervention Plan', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  recitation_summary: { label: 'Oral Recitation & Participation', icon: Mic, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  class_section_summary: { label: 'Class Section Quarterly Summary', icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  at_risk_alert: { label: 'Academic Early-Warning Alert', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' }
};

const RATING_COLORS: Record<PerformanceRating, { badge: string; text: string }> = {
  'Outstanding': { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'text-emerald-700' },
  'Satisfactory': { badge: 'bg-blue-100 text-blue-800 border-blue-300', text: 'text-blue-700' },
  'Developing': { badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', text: 'text-indigo-700' },
  'Needs Remediation': { badge: 'bg-amber-100 text-amber-800 border-amber-300', text: 'text-amber-700' },
  'Critical Support': { badge: 'bg-rose-100 text-rose-800 border-rose-300', text: 'text-rose-700' }
};

export default function FacultyReportsManager({
  students,
  reports,
  loading = false,
  facultyProfile,
  onSaveReport,
  onDeleteReport,
  preselectedStudent,
  onClearPreselectedStudent
}: FacultyReportsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [quarterFilter, setQuarterFilter] = useState<string>('All');
  const [sectionFilter, setSectionFilter] = useState<string>('All');
  const [ratingFilter, setRatingFilter] = useState<string>('All');

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<TeacherReport | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [deletingReport, setDeletingReport] = useState<TeacherReport | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<TeacherReportCategory>('student_progress');
  const [formQuarter, setFormQuarter] = useState<AcademicQuarter>('Quarter 1');
  const [formTargetType, setFormTargetType] = useState<'student' | 'section'>('student');
  const [formStudentUid, setFormStudentUid] = useState<string>('');
  const [formGrade, setFormGrade] = useState<string>('Grade 11');
  const [formSection, setFormSection] = useState<string>('STEM-A');
  const [formTopicId, setFormTopicId] = useState<string>('general');
  const [formRating, setFormRating] = useState<PerformanceRating>('Satisfactory');
  const [formSummary, setFormSummary] = useState('');
  const [formStrengths, setFormStrengths] = useState<string[]>(['Active participation during class problem solving']);
  const [formNewStrength, setFormNewStrength] = useState('');
  const [formGaps, setFormGaps] = useState<string[]>(['Needs more practice on complex algebraic factorization']);
  const [formNewGap, setFormNewGap] = useState('');
  const [formActionPlan, setFormActionPlan] = useState('');

  // Handle preselected student if passed
  React.useEffect(() => {
    if (preselectedStudent) {
      openAddReportForStudent(preselectedStudent);
    }
  }, [preselectedStudent]);

  const openAddReportForStudent = (student?: UserProfile) => {
    setEditingReportId(null);
    if (student) {
      setFormTargetType('student');
      setFormStudentUid(student.uid);
      setFormGrade(student.grade || 'Grade 11');
      setFormSection(student.section || 'STEM-A');
      setFormTitle(`Academic Progress Evaluation: ${student.displayName}`);
    } else {
      setFormTargetType('student');
      setFormStudentUid(students[0]?.uid || '');
      setFormGrade('Grade 11');
      setFormSection('STEM-A');
      setFormTitle('Student Mathematics Progress Report');
    }
    setFormCategory('student_progress');
    setFormQuarter('Quarter 1');
    setFormTopicId('general');
    setFormRating('Satisfactory');
    setFormSummary('Student demonstrates consistent engagement in Grade 11 General Mathematics. Shows solid conceptual grasp of basic definitions.');
    setFormStrengths(['Consistent practice streak', 'Good quiz completion rate']);
    setFormGaps(['Step-by-step documentation of intermediate solutions']);
    setFormActionPlan('Complete 3 recommended formative practice modules and participate in weekly problem-solving recitations.');
    setIsEditorOpen(true);
  };

  const openEditReport = (rep: TeacherReport) => {
    setEditingReportId(rep.id);
    setFormTitle(rep.title);
    setFormCategory(rep.category);
    setFormQuarter(rep.quarter);
    setFormTargetType(rep.targetType);
    setFormStudentUid(rep.studentUid || '');
    setFormGrade(rep.grade);
    setFormSection(rep.section);
    setFormTopicId(rep.topicId || 'general');
    setFormRating(rep.rating);
    setFormSummary(rep.summary);
    setFormStrengths(rep.strengths || []);
    setFormGaps(rep.areasForImprovement || []);
    setFormActionPlan(rep.actionPlan);
    setIsEditorOpen(true);
  };

  const handleAddStrength = () => {
    if (!formNewStrength.trim()) return;
    setFormStrengths(prev => [...prev, formNewStrength.trim()]);
    setFormNewStrength('');
  };

  const handleRemoveStrength = (idx: number) => {
    setFormStrengths(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddGap = () => {
    if (!formNewGap.trim()) return;
    setFormGaps(prev => [...prev, formNewGap.trim()]);
    setFormNewGap('');
  };

  const handleRemoveGap = (idx: number) => {
    setFormGaps(prev => prev.filter((_, i) => i !== idx));
  };

  // Smart AI Template Generation Assistant
  const handleGenerateSmartTemplate = () => {
    const targetStudent = formTargetType === 'student' ? students.find(s => s.uid === formStudentUid) : null;
    const selectedTopicObj = topics.find(t => t.id === formTopicId);
    const topicName = selectedTopicObj ? selectedTopicObj.title : 'General Mathematics & Pre-Calculus';
    const sName = targetStudent ? targetStudent.displayName : `Section ${formSection}`;
    const xp = targetStudent?.xp || 0;
    const level = targetStudent?.level || 1;
    const recitations = targetStudent?.oralRecitationPoints || 0;

    let generatedTitle = '';
    let generatedSummary = '';
    let generatedStrengths: string[] = [];
    let generatedGaps: string[] = [];
    let generatedActionPlan = '';
    let defaultRating: PerformanceRating = 'Satisfactory';

    if (formCategory === 'student_progress') {
      generatedTitle = `Quarterly Progress Evaluation: ${sName} (${topicName})`;
      if (xp >= 1000 || level >= 5) {
        defaultRating = 'Outstanding';
        generatedSummary = `${sName} exhibits exemplary mastery and academic enthusiasm in Grade 11 Mathematics (${topicName}). With ${xp.toLocaleString()} XP and Level ${level}, the learner routinely demonstrates higher-order mathematical reasoning.`;
        generatedStrengths = [
          'High problem-solving agility and accuracy',
          'Autonomous progression through advanced curriculum modules',
          'Strong peer support and recitation engagement (+ ' + recitations + ' pts)'
        ];
        generatedGaps = [
          'Maintain rigor on non-routine multi-step modeling problems',
          'Continue refining mathematical justifications and proofs'
        ];
        generatedActionPlan = 'Provide honors-level challenge problems and encourage participation as a peer tutor in collaborative study sessions.';
      } else {
        defaultRating = 'Satisfactory';
        generatedSummary = `${sName} maintains regular participation in ${topicName}. The learner has amassed ${xp} XP and Level ${level}, showing reliable foundation in fundamental properties with steady growth potential.`;
        generatedStrengths = [
          'Diligent attendance and task submission',
          'Willingness to attempt interactive practice quizzes',
          'Positive attitude during classroom recitations'
        ];
        generatedGaps = [
          'Time management during timed assessment conditions',
          'Careful verification of algebraic signs and fractional simplification'
        ];
        generatedActionPlan = 'Dedicate 15 minutes daily to the MathSprint Arena and complete the step-by-step diagnostic remediation pathway.';
      }
    } else if (formCategory === 'diagnostic_mastery') {
      generatedTitle = `Baseline Competency Evaluation: ${sName} - ${topicName}`;
      defaultRating = targetStudent?.diagnosticAbility === 'Advanced' ? 'Outstanding' : 'Developing';
      generatedSummary = `Initial baseline diagnostic assessment indicates ${sName} is performing at the ${targetStudent?.diagnosticAbility || 'Proficient'} level in ${topicName}. Key foundational competencies have been inventoried.`;
      generatedStrengths = [
        'Recognizes key formulas and standard form equations',
        'Proficient in foundational arithmetic and linear expressions'
      ];
      generatedGaps = [
        'Domain and range restrictions in rational and radical equations',
        'Interpreting asymptotic behavior from functional graphs'
      ];
      generatedActionPlan = 'Review the interactive explainer presentations and complete the targeted diagnostic remediation quiz before the unit summative exam.';
    } else if (formCategory === 'remediation_plan') {
      generatedTitle = `Remediation & Academic Intervention Plan: ${sName}`;
      defaultRating = 'Needs Remediation';
      generatedSummary = `Identified specific learning gaps in ${topicName} requiring structured scaffolding and supplementary intervention to ensure mastery of DepEd Most Essential Learning Competencies (MELCs).`;
      generatedStrengths = [
        'Responsive to guided teacher feedback',
        'Shows earnest effort during step-by-step walkthroughs'
      ];
      generatedGaps = [
        'Struggles with factoring polynomial expressions and quadratics',
        'Requires reinforcement on the properties of logarithms and exponentials'
      ];
      generatedActionPlan = '1. Schedule 2 one-on-one remediation sessions during consultation hours. 2. Retake the adaptive practice quiz after reviewing video lectures.';
    } else if (formCategory === 'recitation_summary') {
      generatedTitle = `Oral Recitation & Class Participation Log: ${sName}`;
      defaultRating = recitations >= 15 ? 'Outstanding' : 'Satisfactory';
      generatedSummary = `${sName} has earned +${recitations} recitation points in ${topicName}. Displays vocal confidence when called upon to explain problem derivations on the board.`;
      generatedStrengths = [
        'Articulates mathematical concepts with precise terminology',
        'Voluntarily presents solution steps to classmates'
      ];
      generatedGaps = [
        'Ensure chalkboard/whiteboard notation adheres strictly to standard symbols'
      ];
      generatedActionPlan = 'Encourage the student to lead student study groups and explore the Math Presentation Hub.';
    } else if (formCategory === 'class_section_summary') {
      generatedTitle = `Quarterly Section Assessment: ${formGrade} - ${formSection}`;
      defaultRating = 'Satisfactory';
      generatedSummary = `Section ${formSection} demonstrated commendable overall growth in ${topicName} for ${formQuarter}. The cohort displays healthy peer collaboration and active quiz engagement.`;
      generatedStrengths = [
        'Strong collective streak and high module completion rate',
        'Constructive peer learning in group presentation tasks'
      ];
      generatedGaps = [
        'Bimodal performance distribution on summative graphing tasks',
        'Pacing during 45-minute timed examinations'
      ];
      generatedActionPlan = 'Incorporate daily 5-minute warm-up drills at the start of each period and conduct targeted section reviews before major exams.';
    } else {
      generatedTitle = `Academic Early-Warning Notice: ${sName}`;
      defaultRating = 'Critical Support';
      generatedSummary = `Urgent academic alert for ${sName}. Quiz completion rates and assessment scores in ${topicName} fall below the 75% passing threshold. Immediate intervention is required.`;
      generatedStrengths = [
        'Enrolled in the MathQuest digital curriculum platform'
      ];
      generatedGaps = [
        'Multiple unattempted formative quizzes',
        'Low score on recent rational functions diagnostic checkpoint'
      ];
      generatedActionPlan = 'Notify parents/guardians, assign a peer study partner, and mandate completion of the introductory module by the end of the week.';
    }

    setFormTitle(generatedTitle);
    setFormRating(defaultRating);
    setFormSummary(generatedSummary);
    setFormStrengths(generatedStrengths);
    setFormGaps(generatedGaps);
    setFormActionPlan(generatedActionPlan);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSummary.trim()) return;

    setIsSaving(true);
    try {
      const targetStudent = formTargetType === 'student' 
        ? students.find(s => s.uid === formStudentUid) 
        : undefined;

      const selectedTopic = topics.find(t => t.id === formTopicId);

      const reportPayload: Omit<TeacherReport, 'id' | 'createdAt'> & { id?: string; createdAt?: string } = {
        ...(editingReportId ? { id: editingReportId } : {}),
        title: formTitle.trim(),
        category: formCategory,
        quarter: formQuarter,
        targetType: formTargetType,
        studentUid: formTargetType === 'student' ? formStudentUid : undefined,
        studentName: targetStudent ? targetStudent.displayName : undefined,
        studentLrn: targetStudent?.lrn || undefined,
        grade: formGrade,
        section: formSection,
        topicId: formTopicId,
        topicTitle: selectedTopic ? selectedTopic.title : 'General Mathematics',
        rating: formRating,
        summary: formSummary.trim(),
        strengths: formStrengths,
        areasForImprovement: formGaps,
        actionPlan: formActionPlan.trim(),
        metricsSnapshot: targetStudent ? {
          xp: targetStudent.xp,
          level: targetStudent.level,
          streak: targetStudent.streak,
          oralRecitationPoints: targetStudent.oralRecitationPoints || 0,
        } : undefined,
        teacherUid: facultyProfile?.uid || 'faculty-admin',
        teacherName: facultyProfile?.displayName || 'Faculty Instructor',
      };

      await onSaveReport(reportPayload);

      setIsEditorOpen(false);
      setSaveSuccessMessage('Teacher report saved successfully!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
      if (onClearPreselectedStudent) onClearPreselectedStudent();
    } catch (err) {
      console.error("Error saving report:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingReport) return;
    try {
      await onDeleteReport(deletingReport.id);
    } finally {
      setDeletingReport(null);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.studentName && r.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.summary && r.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.studentLrn && r.studentLrn.includes(searchTerm));
    
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesQtr = quarterFilter === 'All' || r.quarter === quarterFilter;
    const matchesSec = sectionFilter === 'All' || r.section === sectionFilter;
    const matchesRat = ratingFilter === 'All' || r.rating === ratingFilter;

    return matchesSearch && matchesCat && matchesQtr && matchesSec && matchesRat;
  });

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Faculty Academic Evaluations & Student Reports
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Progress & Intervention Reports
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Create, document, and manage standardized student progress evaluations, diagnostic competency breakdowns, and remediation action plans for Grade 11 Mathematics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="create-new-teacher-report-btn"
              onClick={() => openAddReportForStudent()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add New Report
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {saveSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm print:hidden"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{saveSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
            <div className="text-2xl font-black text-slate-900">{reports.length}</div>
            <div className="text-[11px] text-indigo-600 font-semibold">Active documents</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mastery / High</div>
            <div className="text-2xl font-black text-slate-900">
              {reports.filter(r => r.rating === 'Outstanding' || r.rating === 'Satisfactory').length}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">Proficient evaluations</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remediations</div>
            <div className="text-2xl font-black text-slate-900">
              {reports.filter(r => r.category === 'remediation_plan' || r.rating === 'Needs Remediation').length}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold">Interventions logged</div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">At-Risk Alerts</div>
            <div className="text-2xl font-black text-slate-900">
              {reports.filter(r => r.category === 'at_risk_alert' || r.rating === 'Critical Support').length}
            </div>
            <div className="text-[11px] text-rose-600 font-semibold">Priority follow-up</div>
          </div>
        </div>
      </div>

      {/* Reports Directory & Filter Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Filter Controls Toolbar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search reports by title, student name, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter By:
            </span>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="student_progress">Student Progress</option>
              <option value="diagnostic_mastery">Diagnostic Mastery</option>
              <option value="remediation_plan">Remediation Plan</option>
              <option value="recitation_summary">Oral Recitations</option>
              <option value="class_section_summary">Class Section Summary</option>
              <option value="at_risk_alert">At-Risk Early Warning</option>
            </select>

            {/* Quarter Filter */}
            <select
              value={quarterFilter}
              onChange={(e) => setQuarterFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Quarters</option>
              <option value="Quarter 1">Quarter 1</option>
              <option value="Quarter 2">Quarter 2</option>
              <option value="Quarter 3">Quarter 3</option>
              <option value="Quarter 4">Quarter 4</option>
              <option value="Midterm">Midterm</option>
              <option value="Finals">Finals</option>
            </select>

            {/* Section Filter */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Sections</option>
              <option value="STEM-A">STEM-A</option>
              <option value="STEM-B">STEM-B</option>
              <option value="ABM-1">ABM-1</option>
              <option value="HUMSS-1">HUMSS-1</option>
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Ratings</option>
              <option value="Outstanding">Outstanding</option>
              <option value="Satisfactory">Satisfactory</option>
              <option value="Developing">Developing</option>
              <option value="Needs Remediation">Needs Remediation</option>
              <option value="Critical Support">Critical Support</option>
            </select>

            {(categoryFilter !== 'All' || quarterFilter !== 'All' || sectionFilter !== 'All' || ratingFilter !== 'All' || searchTerm) && (
              <button
                onClick={() => {
                  setCategoryFilter('All');
                  setQuarterFilter('All');
                  setSectionFilter('All');
                  setRatingFilter('All');
                  setSearchTerm('');
                }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Reports Grid / Cards List */}
        <div className="p-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700 text-sm">No teacher reports found.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Create a new student progress evaluation, diagnostic assessment, or remediation plan to get started.
              </p>
              <button
                onClick={() => openAddReportForStudent()}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Create First Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((rep) => {
                const catInfo = CATEGORY_LABELS[rep.category] || CATEGORY_LABELS.student_progress;
                const CatIcon = catInfo.icon;
                const ratingInfo = RATING_COLORS[rep.rating] || RATING_COLORS['Satisfactory'];

                return (
                  <motion.div
                    key={rep.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header with Category & Rating */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${catInfo.color}`}>
                          <CatIcon className="w-3 h-3" />
                          {catInfo.label}
                        </span>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${ratingInfo.badge}`}>
                          {rep.rating}
                        </span>
                      </div>

                      {/* Title & Target */}
                      <h4 className="font-bold text-slate-900 text-base mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {rep.title}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
                        {rep.targetType === 'student' ? (
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <User className="w-3 h-3 text-indigo-500" />
                            {rep.studentName || 'Student'}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-500" />
                            Class Section: {rep.section}
                          </span>
                        )}
                        <span>•</span>
                        <span>{rep.quarter}</span>
                        <span>•</span>
                        <span className="text-slate-400">{rep.grade} - {rep.section}</span>
                      </div>

                      {/* Topic Tag if present */}
                      {rep.topicTitle && (
                        <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md mb-3">
                          Topic: {rep.topicTitle}
                        </div>
                      )}

                      {/* Summary Snippet */}
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {rep.summary}
                      </p>

                      {/* Metrics Snapshot Badge */}
                      {rep.metricsSnapshot && (
                        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-medium mb-4">
                          <span className="font-bold text-indigo-600">{rep.metricsSnapshot.xp?.toLocaleString()} XP</span>
                          <span>Lvl {rep.metricsSnapshot.level}</span>
                          <span className="flex items-center gap-0.5 text-orange-600">
                            <Flame className="w-3 h-3 fill-current" /> {rep.metricsSnapshot.streak}d streak
                          </span>
                          {rep.metricsSnapshot.oralRecitationPoints ? (
                            <span className="text-emerald-700 font-bold">
                              +{rep.metricsSnapshot.oralRecitationPoints} recitations
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        {new Date(rep.createdAt).toLocaleDateString()} by {rep.teacherName}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingReport(rep)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="View & Print Full Formal Report"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => openEditReport(rep)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs transition-colors"
                          title="Edit Report"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingReport(rep)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg text-xs transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Report Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingReportId ? 'Edit Academic Report' : 'Create Teacher Report'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standardized Grade 11 Mathematics progress & intervention documentation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Scroll Area */}
              <form onSubmit={handleSaveForm} className="overflow-y-auto pr-2 space-y-5 flex-1 pt-4">
                {/* AI Assistant Generator Bar */}
                <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
                    <span className="text-xs font-bold text-indigo-950">
                      Smart Narrative Assistant
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSmartTemplate}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Draft Evaluation
                  </button>
                </div>

                {/* Target Scope Switcher */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider col-span-2">
                    Report Target:
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormTargetType('student')}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      formTargetType === 'student'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4 text-indigo-600" />
                    <div className="text-xs">Individual Student</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTargetType('section')}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      formTargetType === 'section'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                    <div className="text-xs">Class Section Cohort</div>
                  </button>
                </div>

                {/* Student Selector if target is student */}
                {formTargetType === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Student:
                    </label>
                    <select
                      value={formStudentUid}
                      onChange={(e) => {
                        const uid = e.target.value;
                        setFormStudentUid(uid);
                        const s = students.find(item => item.uid === uid);
                        if (s) {
                          setFormGrade(s.grade || 'Grade 11');
                          setFormSection(s.section || 'STEM-A');
                          setFormTitle(`Progress Report: ${s.displayName}`);
                        }
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      {students.map(s => (
                        <option key={s.uid} value={s.uid}>
                          {s.displayName} ({s.grade || 'Grade 11'} - {s.section || 'STEM-A'}) — {s.xp} XP
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Section & Grade (for section or student) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Grade Level:
                    </label>
                    <select
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Section:
                    </label>
                    <select
                      value={formSection}
                      onChange={(e) => setFormSection(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="STEM-A">STEM-A</option>
                      <option value="STEM-B">STEM-B</option>
                      <option value="ABM-1">ABM-1</option>
                      <option value="HUMSS-1">HUMSS-1</option>
                    </select>
                  </div>
                </div>

                {/* Category & Quarter */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Report Category:
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as TeacherReportCategory)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="student_progress">Student Progress & Growth</option>
                      <option value="diagnostic_mastery">Diagnostic Competency Report</option>
                      <option value="remediation_plan">Remediation & Intervention Plan</option>
                      <option value="recitation_summary">Oral Recitation & Participation</option>
                      <option value="class_section_summary">Class Section Quarterly Summary</option>
                      <option value="at_risk_alert">Academic Early-Warning Alert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Academic Term / Quarter:
                    </label>
                    <select
                      value={formQuarter}
                      onChange={(e) => setFormQuarter(e.target.value as AcademicQuarter)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Quarter 1">Quarter 1</option>
                      <option value="Quarter 2">Quarter 2</option>
                      <option value="Quarter 3">Quarter 3</option>
                      <option value="Quarter 4">Quarter 4</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Finals">Finals</option>
                    </select>
                  </div>
                </div>

                {/* Topic & Performance Rating */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subject Topic / Competency:
                    </label>
                    <select
                      value={formTopicId}
                      onChange={(e) => setFormTopicId(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="general">General Mathematics</option>
                      {topics.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Performance Rating:
                    </label>
                    <select
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value as PerformanceRating)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Outstanding">Outstanding (90-100%)</option>
                      <option value="Satisfactory">Satisfactory (75-89%)</option>
                      <option value="Developing">Developing (60-74%)</option>
                      <option value="Needs Remediation">Needs Remediation (50-59%)</option>
                      <option value="Critical Support">Critical Support (&lt;50%)</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Report Title:
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Midterm Rational Functions Progress Evaluation"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Summary / Observations */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teacher Observation & Academic Narrative:
                  </label>
                  <textarea
                    rows={3}
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Document qualitative observations, quiz attendance, and problem-solving behaviors..."
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Strengths List */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Strengths & Competencies Mastered:
                  </label>
                  <div className="space-y-2 mb-2">
                    {formStrengths.map((str, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="flex-1 font-medium">{str}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStrength(idx)}
                          className="text-emerald-500 hover:text-emerald-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formNewStrength}
                      onChange={(e) => setFormNewStrength(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStrength(); }}}
                      placeholder="Add strength / mastery point..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddStrength}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Areas for Improvement / Gaps */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Areas for Growth / Learning Gaps:
                  </label>
                  <div className="space-y-2 mb-2">
                    {formGaps.map((gap, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="flex-1 font-medium">{gap}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGap(idx)}
                          className="text-amber-500 hover:text-amber-700 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formNewGap}
                      onChange={(e) => setFormNewGap(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGap(); }}}
                      placeholder="Add learning gap / area for remediation..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddGap}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Action Plan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Action Plan & Teacher Recommendations:
                  </label>
                  <textarea
                    rows={2}
                    value={formActionPlan}
                    onChange={(e) => setFormActionPlan(e.target.value)}
                    placeholder="Specify remediation assignments, tutorial schedules, or practice goals..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? 'Saving...' : editingReportId ? 'Update Report' : 'Save Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Formal Printable Report Modal */}
      <AnimatePresence>
        {viewingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl my-8 relative max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:p-0 print:border-none"
            >
              {/* Controls bar */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                    Official DepEd Academic Report
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Print / Export PDF
                  </button>
                  <button
                    onClick={() => setViewingReport(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="py-6 space-y-6 text-slate-800">
                {/* School Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                    Republic of the Philippines • Department of Education
                  </div>
                  <h2 className="text-xl font-black text-slate-950 mt-1 uppercase tracking-tight">
                    Senior High School Mathematics Evaluation
                  </h2>
                  <p className="text-xs font-semibold text-slate-600">
                    MathQuest Adaptive Learning Assessment Record
                  </p>
                </div>

                {/* Student / Cohort Info Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Target / Learner</span>
                    <span className="font-black text-slate-900 text-sm">
                      {viewingReport.targetType === 'student' ? viewingReport.studentName : `Section ${viewingReport.section}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Grade & Section</span>
                    <span className="font-bold text-slate-800">{viewingReport.grade} — {viewingReport.section}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Academic Period</span>
                    <span className="font-bold text-slate-800">{viewingReport.quarter}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Date Filed</span>
                    <span className="font-bold text-slate-800">{new Date(viewingReport.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Rating Banner */}
                <div className="p-4 rounded-2xl border-2 flex items-center justify-between gap-4 bg-slate-900 text-white">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Evaluation Category</span>
                    <h3 className="text-base font-black">{viewingReport.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Performance Rating</span>
                    <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black rounded-full text-xs uppercase tracking-wider inline-block mt-0.5">
                      {viewingReport.rating}
                    </span>
                  </div>
                </div>

                {/* Qualitative Narrative */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Teacher Observation & Evaluation Narrative:
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs leading-relaxed text-slate-700">
                    {viewingReport.summary}
                  </div>
                </div>

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                    <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Strengths & Mastered Competencies:
                    </h5>
                    <ul className="space-y-1.5 pl-5 list-disc text-emerald-900 text-xs">
                      {viewingReport.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                    <h5 className="font-bold text-amber-950 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Target Remediation & Growth Areas:
                    </h5>
                    <ul className="space-y-1.5 pl-5 list-disc text-amber-900 text-xs">
                      {viewingReport.areasForImprovement?.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Plan */}
                {viewingReport.actionPlan && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Intervention & Action Plan:
                    </h4>
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200 text-xs leading-relaxed text-slate-700">
                      {viewingReport.actionPlan}
                    </div>
                  </div>
                )}

                {/* Sign-off signatures */}
                <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs mt-8">
                  <div>
                    <div className="border-b border-slate-400 w-48 mb-1.5 h-8"></div>
                    <div className="font-black text-slate-900">{viewingReport.teacherName}</div>
                    <div className="text-[10px] text-slate-500">Mathematics Faculty Instructor</div>
                  </div>

                  <div>
                    <div className="border-b border-slate-400 w-48 mb-1.5 h-8"></div>
                    <div className="font-black text-slate-900">Academic Department Head</div>
                    <div className="text-[10px] text-slate-500">Senior High School Mathematics Division</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Report Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingReport}
        title="Delete Teacher Report"
        message={`Are you sure you want to permanently remove the report "${deletingReport?.title}"?`}
        confirmText="Delete Report"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeletingReport(null)}
      />
    </div>
  );
}
