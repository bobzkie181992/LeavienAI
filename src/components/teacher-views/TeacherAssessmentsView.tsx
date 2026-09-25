import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  GraduationCap, 
  Database, 
  BarChart3, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Target, 
  Layers, 
  Download,
  Search,
  Award,
  Sparkles,
  Plus,
  FileSpreadsheet,
  UploadCloud,
  Check,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Settings,
  Sliders
} from 'lucide-react';
import { Topic, Quiz, Problem, SummativeAssessment, isValidatedOrActive } from '../../types';
import ItemBankManager from '../ItemBankManager';
import CreateDiagnosticModal from '../CreateDiagnosticModal';
import CreateFormativeModal from '../CreateFormativeModal';
import PrintableAssessmentModal from '../PrintableAssessmentModal';
import TeacherAssessmentResults from '../TeacherAssessmentResults';
import DepEdExcelImporter, { ParsedDepEdQuestion } from '../DepEdExcelImporter';
import EditCustomAssessmentModal from '../EditCustomAssessmentModal';
import { useCurriculum } from '../../hooks/useFirebase';
import { getIntegritySettings, saveIntegritySettings, IntegritySettings } from '../../lib/integritySettings';

interface TeacherAssessmentsViewProps {
  topics: Topic[];
  initialSubTab?: 'diagnostic' | 'formative' | 'bank' | 'diagnostic-results' | 'formative-results' | 'quizzes' | 'exams';
}

export default function TeacherAssessmentsView({
  topics,
  initialSubTab = 'diagnostic'
}: TeacherAssessmentsViewProps) {
  const { importProblems } = useCurriculum();
  const [subTab, setSubTab] = useState<'diagnostic' | 'formative' | 'bank' | 'diagnostic-results' | 'formative-results' | 'quizzes' | 'exams'>(initialSubTab);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isDiagnosticExcelOpen, setIsDiagnosticExcelOpen] = useState(false);
  const [isFormativeModalOpen, setIsFormativeModalOpen] = useState(false);
  const [isFormativeExcelOpen, setIsFormativeExcelOpen] = useState(false);
  const [excelSuccessNotification, setExcelSuccessNotification] = useState<string | null>(null);

  // Academic Integrity Penalty Policy State
  const [integritySettings, setIntegritySettings] = useState<IntegritySettings>(() => getIntegritySettings());
  const [isEditingIntegrity, setIsEditingIntegrity] = useState(false);
  const [tempDeductionPoints, setTempDeductionPoints] = useState<number>(integritySettings.violationDeductionPoints);

  // Custom Diagnostic Assessments List (persisted in local storage)
  const [customDiagnosticList, setCustomDiagnosticList] = useState<Array<{
    id: string;
    title: string;
    topicTitle: string;
    targetSection: string;
    questionsCount: number;
    accessCode: string;
    schedule: string;
    questions: ParsedDepEdQuestion[];
    createdAt: string;
  }>>(() => {
    try {
      const cached = localStorage.getItem('mathquest_diagnostic_assessments');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });

  // Custom Formative Assessments List (persisted in local storage)
  const [customFormativeList, setCustomFormativeList] = useState<Array<{
    id: string;
    title: string;
    topicTitle: string;
    targetSection: string;
    questionsCount: number;
    accessCode: string;
    schedule: string;
    questions: ParsedDepEdQuestion[];
    createdAt: string;
  }>>(() => {
    try {
      const cached = localStorage.getItem('mathquest_formative_assessments');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });

  const handleImportFormativeExcel = async (imported: ParsedDepEdQuestion[]) => {
    if (imported.length === 0) return;

    // 1. Convert to Problem format and save to central Item Bank
    const defaultTopic = topics[0];
    const newProblems: Problem[] = imported.map((q, idx) => ({
      id: q.itemId ? `formative-item-${q.itemId}` : `formative-item-${Date.now()}-${idx}`,
      itemId: q.itemId || `W1D1-${idx + 1}`,
      day: q.day || 'Monday',
      pptSlide: q.pptSlide || 'Slide 1',
      tier: q.tier || 1,
      question: q.question,
      options: q.options,
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      solution: q.correctFeedback || q.incorrectFeedback || '',
      topic: defaultTopic?.title || 'General Mathematics',
      competency: q.competency || 'M11GM-DepEd-MELC',
      difficulty: q.difficulty,
      difficultyParameter: q.difficulty === 'easy' ? -0.8 : q.difficulty === 'hard' ? 1.2 : 0.0,
      discriminationParameter: 1.0,
      cognitiveLevel: q.cognitiveLevel || 'Understanding',
      status: 'Active',
      assessmentType: 'formative',
      assessmentLevel: 'Level 2 - In-Lesson Check',
      misconceptionCategory: 'General Procedural Error',
      hint1: q.incorrectFeedback || 'Review key principles in the ILAW presentation.',
      hint2: q.correctFeedback || 'Apply standard formula step-by-step.',
      hints: [q.incorrectFeedback],
      explanation: q.correctFeedback || '',
      remediation: q.incorrectFeedback || ''
    }));

    if (defaultTopic && defaultTopic.quizzes && defaultTopic.quizzes.length > 0 && importProblems) {
      try {
        await importProblems(defaultTopic.id, defaultTopic.quizzes[0].id, newProblems);
      } catch (err) {
        console.warn("Could not batch import to topic quiz:", err);
      }
    }

    // 2. Create a new Formative Assessment entry from the imported Excel Item Bank
    const newFormativeId = `form-excel-${Date.now()}`;
    const newEntry = {
      id: newFormativeId,
      title: `Formative Assessment: Item Bank (${imported.length} Items)`,
      topicTitle: imported[0]?.competency ? `MELC: ${imported[0].competency.slice(0, 45)}...` : 'Grade 11 General Mathematics',
      targetSection: 'Grade 11 - STEM A',
      questionsCount: imported.length,
      accessCode: 'FORM' + Math.floor(10 + Math.random() * 90),
      schedule: 'Today (08:00 AM - 05:00 PM)',
      questions: imported,
      createdAt: new Date().toISOString()
    };

    const updatedList = [newEntry, ...customFormativeList];
    setCustomFormativeList(updatedList);
    try {
      localStorage.setItem('mathquest_formative_assessments', JSON.stringify(updatedList));
    } catch (e) {}

    // 3. Set unlocked status and access code
    setUnlockedAssessments(prev => ({ ...prev, [newFormativeId]: true }));
    setAccessCodes(prev => ({ ...prev, [newFormativeId]: newEntry.accessCode }));

    // 4. Show success banner
    setExcelSuccessNotification(`✅ Extracted ${imported.length} questions from "ITEM BANK" worksheet and saved to Formative Assessments & Item Bank!`);
    setTimeout(() => {
      setExcelSuccessNotification(null);
    }, 6000);
  };

  const handleImportDiagnosticExcel = async (imported: ParsedDepEdQuestion[]) => {
    if (imported.length === 0) return;

    // 1. Convert to Problem format and save to central Item Bank
    const defaultTopic = topics[0];
    const newProblems: Problem[] = imported.map((q, idx) => ({
      id: q.itemId ? `diagnostic-item-${q.itemId}` : `diagnostic-item-${Date.now()}-${idx}`,
      itemId: q.itemId || `W1D1-${idx + 1}`,
      day: q.day || 'Monday',
      pptSlide: q.pptSlide || 'Slide 1',
      tier: q.tier || 1,
      question: q.question,
      options: q.options,
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      solution: q.correctFeedback || q.incorrectFeedback || '',
      topic: defaultTopic?.title || 'General Mathematics',
      competency: q.competency || 'M11GM-DepEd-MELC',
      difficulty: q.difficulty,
      difficultyParameter: q.difficulty === 'easy' ? -0.8 : q.difficulty === 'hard' ? 1.2 : 0.0,
      discriminationParameter: 1.0,
      cognitiveLevel: q.cognitiveLevel || 'Understanding',
      status: 'Active',
      assessmentType: 'diagnostic',
      assessmentLevel: 'Level 1 - Diagnostic baseline Check',
      misconceptionCategory: 'General Procedural Error',
      hint1: q.incorrectFeedback || 'Review key principles in the ILAW presentation.',
      hint2: q.correctFeedback || 'Apply standard formula step-by-step.',
      hints: [q.incorrectFeedback],
      explanation: q.correctFeedback || '',
      remediation: q.incorrectFeedback || ''
    }));

    if (defaultTopic && defaultTopic.quizzes && defaultTopic.quizzes.length > 0 && importProblems) {
      try {
        await importProblems(defaultTopic.id, defaultTopic.quizzes[0].id, newProblems);
      } catch (err) {
        console.warn("Could not batch import to topic quiz:", err);
      }
    }

    // 2. Create a new Diagnostic Assessment entry
    const newDiagId = `diag-excel-${Date.now()}`;
    const newEntry = {
      id: newDiagId,
      title: `Diagnostic Assessment: Item Bank (${imported.length} Items)`,
      topicTitle: imported[0]?.competency ? `MELC: ${imported[0].competency.slice(0, 45)}...` : 'Grade 11 General Mathematics',
      targetSection: 'Grade 11 - STEM A',
      questionsCount: imported.length,
      accessCode: 'DIAG' + Math.floor(10 + Math.random() * 90),
      schedule: 'Today (08:00 AM - 05:00 PM)',
      questions: imported,
      createdAt: new Date().toISOString()
    };

    const updatedList = [newEntry, ...customDiagnosticList];
    setCustomDiagnosticList(updatedList);
    try {
      localStorage.setItem('mathquest_diagnostic_assessments', JSON.stringify(updatedList));
    } catch (e) {}

    // 3. Set unlocked status and access code
    setUnlockedAssessments(prev => ({ ...prev, [newDiagId]: true }));
    setAccessCodes(prev => ({ ...prev, [newDiagId]: newEntry.accessCode }));

    // 4. Show success banner
    setExcelSuccessNotification(`✅ Extracted ${imported.length} questions from "ITEM BANK" worksheet and saved to Diagnostic Assessments & Item Bank!`);
    setTimeout(() => {
      setExcelSuccessNotification(null);
    }, 6000);
  };

  // Live Permission & Schedule State
  const [unlockedAssessments, setUnlockedAssessments] = useState<Record<string, boolean>>({
    'diag-1': true,
    'form-1': true
  });
  const [accessCodes, setAccessCodes] = useState<Record<string, string>>({
    'diag-1': 'MATH11',
    'form-1': 'FORM11'
  });
  const [pendingRequests, setPendingRequests] = useState([
    { id: 'req-1', studentName: 'Juan Dela Cruz', lrn: '136801120001', section: 'Grade 11 - STEM A', assessmentTitle: 'Functions Diagnostic', timestamp: '8:15 AM' },
    { id: 'req-2', studentName: 'Maria Clara Santos', lrn: '136801120002', section: 'Grade 11 - STEM A', assessmentTitle: 'Formative Check #1', timestamp: '8:22 AM' }
  ]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [printableData, setPrintableData] = useState<{
    title: string;
    targetSection: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: number | string;
      competency?: string;
    }>;
  } | null>(null);

  const [defaultDiagnosticDeleted, setDefaultDiagnosticDeleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mathquest_default_diagnostic_deleted') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [defaultFormativeDeleted, setDefaultFormativeDeleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mathquest_default_formative_deleted') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [editingCustomAssessment, setEditingCustomAssessment] = useState<any | null>(null);

  const handleSaveEditedAssessment = (updated: any) => {
    const isDiag = customDiagnosticList.some(d => d.id === updated.id);
    if (isDiag) {
      const newList = customDiagnosticList.map(d => d.id === updated.id ? updated : d);
      setCustomDiagnosticList(newList);
      try {
        localStorage.setItem('mathquest_diagnostic_assessments', JSON.stringify(newList));
      } catch (e) {}
    } else {
      const newList = customFormativeList.map(f => f.id === updated.id ? updated : f);
      setCustomFormativeList(newList);
      try {
        localStorage.setItem('mathquest_formative_assessments', JSON.stringify(newList));
      } catch (e) {}
    }
  };

  const handleDeleteDiagnostic = (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom diagnostic assessment?')) {
      const updatedList = customDiagnosticList.filter(d => d.id !== id);
      setCustomDiagnosticList(updatedList);
      try {
        localStorage.setItem('mathquest_diagnostic_assessments', JSON.stringify(updatedList));
      } catch (e) {}
    }
  };

  const handleDeleteFormative = (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom formative assessment?')) {
      const updatedList = customFormativeList.filter(f => f.id !== id);
      setCustomFormativeList(updatedList);
      try {
        localStorage.setItem('mathquest_formative_assessments', JSON.stringify(updatedList));
      } catch (e) {}
    }
  };

  const handleDeleteDefaultDiagnostic = () => {
    if (window.confirm('Are you sure you want to delete this default diagnostic assessment? This action cannot be undone.')) {
      setDefaultDiagnosticDeleted(true);
      try {
        localStorage.setItem('mathquest_default_diagnostic_deleted', 'true');
      } catch (e) {}
    }
  };

  const handleDeleteDefaultFormative = () => {
    if (window.confirm('Are you sure you want to delete this default formative assessment? This action cannot be undone.')) {
      setDefaultFormativeDeleted(true);
      try {
        localStorage.setItem('mathquest_default_formative_deleted', 'true');
      } catch (e) {}
    }
  };

  const handlePrintDiagnostic = () => {
    setPrintableData({
      title: 'Grade 11 General Mathematics Quarter 1 Diagnostic Checkpoint',
      targetSection: 'Grade 11 - STEM A',
      questions: [
        {
          id: 'p-1',
          question: 'Which of the following relations represents a function?',
          options: ['{(1, 2), (2, 3), (3, 4)}', '{(1, 5), (1, 6), (2, 7)}', '{(0, 0), (0, 1), (0, 2)}', '{(3, 1), (3, 2), (4, 5)}'],
          correctAnswer: 0,
          competency: 'M11GM-Ia-1: Represents real-life situations using functions'
        },
        {
          id: 'p-2',
          question: 'Evaluate f(3) if f(x) = 2x + 1.',
          options: ['5', '6', '7', '8'],
          correctAnswer: 2,
          competency: 'M11GM-Ia-2: Evaluates functions accurately'
        },
        {
          id: 'p-3',
          question: 'Given f(x) = x + 3 and g(x) = 2x, find (f + g)(x).',
          options: ['3x + 3', '2x + 3', '3x + 6', 'x + 6'],
          correctAnswer: 0,
          competency: 'M11GM-Ia-3: Performs addition and composition of functions'
        }
      ]
    });
  };

  const handlePrintFormative = () => {
    setPrintableData({
      title: 'Lesson 1: Functions - Formative Quick Knowledge Check',
      targetSection: 'Grade 11 - STEM A',
      questions: [
        {
          id: 'pf-1',
          question: 'A jeepney fare charges ₱13 for the first 4 km and ₱1.75 for each additional km. Which equation models this piecewise situation for x > 4?',
          options: ['f(x) = 13 + 1.75(x - 4)', 'f(x) = 13 + 1.75x', 'f(x) = 13x + 1.75', 'f(x) = 1.75(x + 4)'],
          correctAnswer: 0,
          competency: 'M11GM-Ia-1'
        },
        {
          id: 'pf-2',
          question: 'Which vertical line test condition proves a graph is NOT a function?',
          options: ['Vertical line passes through no points', 'Vertical line intersects graph at exactly 1 point', 'Vertical line intersects graph at 2 or more points', 'Horizontal line intersects graph'],
          correctAnswer: 2,
          competency: 'M11GM-Ia-2'
        }
      ]
    });
  };

  const toggleUnlockStatus = (id: string) => {
    setUnlockedAssessments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const approveRequest = (reqId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    alert('Student permission granted! The student can now start the assessment.');
  };

  // Sync subTab if initialSubTab prop changes
  React.useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Collect summative assessments
  const summativeExams: { topic: Topic; exam: SummativeAssessment }[] = [];
  topics.forEach(t => {
    if (t.summativeAssessment) {
      summativeExams.push({ topic: t, exam: t.summativeAssessment });
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-violet-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-violet-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Assessment Authoring & Analytics Hub</span>
                </span>
                <span className="bg-white/10 text-violet-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Diagnostic & Formative Integrated
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Assessments & Question Bank</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Create Diagnostic Baseline Checks and In-Lesson Formative Assessments, manage Question Banks, and inspect Class Performance analytics.
              </p>
            </div>

            {/* Quick Action Authoring Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditingIntegrity(!isEditingIntegrity)}
                className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Configure points deducted per student violation"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Violation Penalty: -{integritySettings.violationDeductionPoints} pt(s) / tab-out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACADEMIC INTEGRITY DEDUCTION POLICY CONFIG CARD */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                Academic Integrity & Violation Deduction Policy
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-extrabold">
                  Active Deduction: -{integritySettings.violationDeductionPoints} pt(s) per violation
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Teacher control for student focus-loss / tab-out penalty rates in Diagnostic and Formative assessments.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingIntegrity(!isEditingIntegrity)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>{isEditingIntegrity ? 'Hide Settings' : 'Edit Penalty Rate'}</span>
          </button>
        </div>

        {/* Expanded Config Panel */}
        {isEditingIntegrity && (
          <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Points Deducted Per Violation (Tab-Out / Focus-Loss)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={tempDeductionPoints}
                    onChange={(e) => setTempDeductionPoints(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-28 p-3 bg-slate-900 border-2 border-indigo-500/50 rounded-xl text-white font-black text-center text-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-200 block">Point Deduction Rate</span>
                    Deducted from student's final score for each tab switch.
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                  {[0.5, 1, 1.5, 2, 3, 5].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setTempDeductionPoints(pts)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        tempDeductionPoints === pts
                          ? 'bg-rose-500 text-white shadow-xs font-black ring-2 ring-rose-400/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      -{pts} pt{pts > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Calculation Example Preview */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">Policy Applied Calculation Example</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  If a student answers <strong>10 questions correctly</strong> but loses focus / switches tabs <strong>3 times</strong>:
                </p>
                <div className="p-2.5 bg-slate-950 rounded-xl text-emerald-400 font-mono font-bold text-center text-xs border border-slate-800">
                  Calculated Score = 10 - (3 violations × {tempDeductionPoints} pts) = <strong className="text-white font-black text-sm">{Math.max(0, 10 - 3 * tempDeductionPoints)} / 10 Points</strong>
                </div>
                <span className="text-[10px] text-slate-500 block italic">
                  Note: The policy applies automatically across Diagnostic Exams and Formative Checkpoints.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTempDeductionPoints(integritySettings.violationDeductionPoints);
                  setIsEditingIntegrity(false);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = saveIntegritySettings({ violationDeductionPoints: tempDeductionPoints });
                  setIntegritySettings(updated);
                  setIsEditingIntegrity(false);
                  setExcelSuccessNotification(`Academic Integrity penalty rate updated to -${tempDeductionPoints} point(s) per violation.`);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                Save Policy & Update Deduction Rate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-xs">
        <button
          onClick={() => setSubTab('diagnostic')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'diagnostic'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-900" />
          <span>Diagnostic Assessments</span>
        </button>

        <button
          onClick={() => setSubTab('formative')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'formative'
              ? 'bg-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4 text-indigo-300" />
          <span>Formative Assessments</span>
        </button>

        <button
          onClick={() => setSubTab('bank')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'bank'
              ? 'bg-slate-900 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4 text-sky-400" />
          <span>Question Bank</span>
        </button>

        <button
          onClick={() => setSubTab('diagnostic-results')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'diagnostic-results'
              ? 'bg-amber-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-300" />
          <span>Diagnostic Results</span>
        </button>

        <button
          onClick={() => setSubTab('formative-results')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'formative-results'
              ? 'bg-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-300" />
          <span>Formative Results</span>
        </button>

        <button
          onClick={() => setSubTab('quizzes')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'quizzes'
              ? 'bg-slate-800 text-white shadow-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-violet-400" />
          <span>Unit Quizzes</span>
        </button>

        <button
          onClick={() => setSubTab('exams')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'exams'
              ? 'bg-slate-800 text-white shadow-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          <span>Exams (TOS)</span>
        </button>
      </div>

      {/* 1. DIAGNOSTIC ASSESSMENTS */}
      {subTab === 'diagnostic' && (
        <div className="space-y-4">
          {excelSuccessNotification && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{excelSuccessNotification}</span>
              </div>
              <button
                onClick={() => setExcelSuccessNotification(null)}
                className="text-emerald-700 hover:text-emerald-950 text-sm font-black cursor-pointer px-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-amber-900 flex-wrap">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black uppercase tracking-wider block text-amber-950">
                  DIAGNOSTIC ASSESSMENT PURPOSE:
                </span>
                <span>
                  "Find out what the student already knows before or at the beginning of learning." Output includes prior knowledge baseline, learning gaps, and recommended ILAW lessons. You can upload DepEd Excel files containing the <strong>"ITEM BANK"</strong> sheet to auto-extract diagnostic items!
                </span>
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowPermissionModal(true)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm animate-pulse"
              >
                <span>✋ Pending Student Permissions</span>
                <span className="bg-white text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {pendingRequests.length}
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Active Diagnostic Assessments ({(defaultDiagnosticDeleted ? 0 : 1) + customDiagnosticList.length})
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsDiagnosticExcelOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Excel (ITEM BANK)</span>
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Custom Imported Diagnostic Assessments from Excel */}
            {customDiagnosticList.map((cd) => (
              <div key={cd.id} className="p-5 bg-white rounded-3xl border-2 border-emerald-300 shadow-sm hover:border-emerald-500 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                        <FileSpreadsheet className="w-3 h-3" />
                        Excel Item Bank Import
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{cd.topicTitle}</span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Target: {cd.targetSection}
                      </span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {cd.questionsCount} Questions
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base">{cd.title}</h4>
                    <p className="text-xs text-slate-500">
                      Imported from DepEd Excel "ITEM BANK" worksheet. Stored in Diagnostic Assessments and centralized Item Bank.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg">Published</span>
                    
                    <button
                      onClick={() => {
                        setPrintableData({
                          title: cd.title,
                          targetSection: cd.targetSection,
                          questions: cd.questions.map(q => ({
                            id: q.id,
                            question: q.question,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            competency: q.competency
                          }))
                        });
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>🖨️ Print Test Sheet</span>
                    </button>

                    <button
                      onClick={() => setEditingCustomAssessment(cd)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
                      title="Edit Imported Item Bank Questions"
                    >
                      <span>✏️ Edit Item Bank</span>
                    </button>

                    <button
                      onClick={() => handleDeleteDiagnostic(cd.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                      title="Delete Diagnostic Assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Schedule & Passcode Live Bar */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Schedule: <strong>{cd.schedule}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Passcode: <strong className="bg-white px-2 py-0.5 rounded border border-slate-300 tracking-wider font-mono text-indigo-900">{accessCodes[cd.id] || cd.accessCode}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleUnlockStatus(cd.id)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        unlockedAssessments[cd.id]
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                    >
                      <span>{unlockedAssessments[cd.id] ? '🔓 Unlocked for Class' : '🔒 Locked (Permission Required)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!defaultDiagnosticDeleted && (
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded">
                        Quarter 1 Baseline Check
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Grade 11 • General Mathematics</span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Target: Grade 11 - STEM A
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base">Functions & Their Graphs - Pre-Lesson Diagnostic</h4>
                    <p className="text-xs text-slate-500">Evaluates baseline knowledge on function definitions, notation, domain, and range.</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-lg">Published</span>
                    
                    <button
                      onClick={handlePrintDiagnostic}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>🖨️ Print Test Sheet</span>
                    </button>

                    <button
                      onClick={() => setIsDiagnosticModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Edit Assessment
                    </button>

                    <button
                      onClick={handleDeleteDefaultDiagnostic}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                      title="Delete Diagnostic Assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Schedule & Permission Live Bar */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Schedule: <strong>Today (08:00 AM - 05:00 PM)</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <span>Passcode: <strong className="bg-white px-2 py-0.5 rounded border border-slate-300 tracking-wider font-mono text-amber-900">{accessCodes['diag-1']}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleUnlockStatus('diag-1')}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        unlockedAssessments['diag-1']
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                    >
                      <span>{unlockedAssessments['diag-1'] ? '🔓 Unlocked for STEM-A' : '🔒 Locked (Permission Required)'}</span>
                    </button>

                    <button
                      onClick={() => setShowPermissionModal(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Student Requests ({pendingRequests.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FORMATIVE ASSESSMENTS */}
      {subTab === 'formative' && (
        <div className="space-y-4">
          {excelSuccessNotification && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{excelSuccessNotification}</span>
              </div>
              <button
                onClick={() => setExcelSuccessNotification(null)}
                className="text-emerald-700 hover:text-emerald-950 text-sm font-black cursor-pointer px-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-indigo-900 flex-wrap">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black uppercase tracking-wider block text-indigo-950">
                  FORMATIVE ASSESSMENT PURPOSE & ITEM BANK INTEGRATION:
                </span>
                <span>
                  "Check student understanding while learning during ILAW lessons." Low-stakes continuous practice with immediate answer feedback and remediation hints. You can upload DepEd Excel files containing the <strong>"ITEM BANK"</strong> sheet to auto-extract questions, choices, answer keys, and feedback!
                </span>
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowPermissionModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm animate-pulse"
              >
                <span>✋ Pending Student Permissions</span>
                <span className="bg-white text-indigo-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {pendingRequests.length}
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Active Formative Checks & In-Lesson Quizzes ({(defaultFormativeDeleted ? 0 : 1) + customFormativeList.length})
            </h3>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsFormativeExcelOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload Excel (ITEM BANK)</span>
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Custom Imported Formative Assessments from Excel */}
            {customFormativeList.map((cf) => (
              <div key={cf.id} className="p-5 bg-white rounded-3xl border-2 border-emerald-300 shadow-sm hover:border-emerald-500 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                        <FileSpreadsheet className="w-3 h-3" />
                        Excel Item Bank Import
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{cf.topicTitle}</span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Target: {cf.targetSection}
                      </span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {cf.questionsCount} Questions
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base">{cf.title}</h4>
                    <p className="text-xs text-slate-500">
                      Imported from DepEd Excel "ITEM BANK" worksheet. Stored in Formative Assessments and centralized Item Bank.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg">Active</span>
                    
                    <button
                      onClick={() => {
                        setPrintableData({
                          title: cf.title,
                          targetSection: cf.targetSection,
                          questions: cf.questions.map(q => ({
                            id: q.id,
                            question: q.question,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            competency: q.competency
                          }))
                        });
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>🖨️ Print Test Sheet</span>
                    </button>

                    <button
                      onClick={() => setEditingCustomAssessment(cf)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 border border-slate-200"
                      title="Edit Imported Item Bank Questions"
                    >
                      <span>✏️ Edit Item Bank</span>
                    </button>

                    <button
                      onClick={() => handleDeleteFormative(cf.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                      title="Delete Formative Assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Schedule & Passcode Live Bar */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Schedule: <strong>{cf.schedule}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Passcode: <strong className="bg-white px-2 py-0.5 rounded border border-slate-300 tracking-wider font-mono text-indigo-900">{accessCodes[cf.id] || cf.accessCode}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleUnlockStatus(cf.id)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        unlockedAssessments[cf.id]
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                    >
                      <span>{unlockedAssessments[cf.id] ? '🔓 Unlocked for Class' : '🔒 Locked (Permission Required)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Standard Formative Check 1 */}
            {!defaultFormativeDeleted && (
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                        In-Lesson Quick Check
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">Lesson 1: Introduction to Functions</span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Target: Grade 11 - STEM A
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base">Formative Check #1: Functions & Notation</h4>
                    <p className="text-xs text-slate-500">Immediate explanation feedback on evaluating f(x) and vertical line test.</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-lg">Assigned</span>
                    
                    <button
                      onClick={handlePrintFormative}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>🖨️ Print Test Sheet</span>
                    </button>

                    <button
                      onClick={() => setIsFormativeModalOpen(true)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Edit Formative Check
                    </button>

                    <button
                      onClick={handleDeleteDefaultFormative}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 border border-rose-200"
                      title="Delete Formative Assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Schedule & Permission Live Bar */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Schedule: <strong>Today (08:00 AM - 05:00 PM)</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Passcode: <strong className="bg-white px-2 py-0.5 rounded border border-slate-300 tracking-wider font-mono text-indigo-900">{accessCodes['form-1']}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleUnlockStatus('form-1')}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                        unlockedAssessments['form-1']
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                    >
                      <span>{unlockedAssessments['form-1'] ? '🔓 Unlocked for STEM-A' : '🔒 Locked (Permission Required)'}</span>
                    </button>

                    <button
                      onClick={() => setShowPermissionModal(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Student Requests ({pendingRequests.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. QUESTION BANK */}
      {subTab === 'bank' && (
        <div>
          <ItemBankManager />
        </div>
      )}

      {/* DIAGNOSTIC RESULTS */}
      {subTab === 'diagnostic-results' && (
        <div>
          <TeacherAssessmentResults mode="diagnostic" />
        </div>
      )}

      {/* FORMATIVE RESULTS */}
      {subTab === 'formative-results' && (
        <div>
          <TeacherAssessmentResults mode="formative" />
        </div>
      )}

      {/* 1. QUIZZES */}
      {subTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Formative Unit Quizzes Across All Modules
            </h3>
          </div>

          <div className="grid gap-3">
            {topics.flatMap(t => t.quizzes.map(q => ({ quiz: q, topic: t }))).map(({ quiz, topic }) => {
              const activeCount = quiz.problems.filter(isValidatedOrActive).length;

              return (
                <div
                  key={quiz.id}
                  className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {topic.title}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {topic.term}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded">
                        +{quiz.xpReward} XP Reward
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-base">{quiz.title}</h4>
                    <p className="text-xs text-slate-500">{quiz.description}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">{activeCount} Questions</span>
                      <span className="text-[10px] text-slate-400 font-bold">Standard 5-Item Test</span>
                    </div>

                    <button
                      onClick={() => alert(`Reviewing question items for ${quiz.title}...`)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Inspect Items
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. EXAMS (TOS) */}
      {subTab === 'exams' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                DepEd Table of Specifications (TOS) Blueprint
              </h4>
              <p className="text-xs text-amber-900">
                Summative exams are calibrated against Bloom's cognitive domain: 60% Lower Order (Remembering/Understanding), 30% Application/Analysis, 10% Higher Order (Evaluation/Creation).
              </p>
            </div>
            <button
              onClick={() => alert('Generating DepEd TOS Matrix export...')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export TOS Sheet</span>
            </button>
          </div>

          <div className="grid gap-4">
            {summativeExams.map(({ topic, exam }) => (
              <div
                key={exam.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md">
                      {topic.term} Summative Examination
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{exam.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <span>{exam.durationMinutes} mins</span>
                    <span>•</span>
                    <span className="text-emerald-600">{exam.passingScorePercentage}% Passing Mark</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{exam.description}</p>

                {/* TOS Items Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Bloom's Taxonomy Cognitive Distribution ({exam.problems.length} Total Items)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Remembering (30%)</span>
                      <span className="font-black text-slate-900">Direct Definitions</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Understanding (30%)</span>
                      <span className="font-black text-slate-900">Formula Applications</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Applying (25%)</span>
                      <span className="font-black text-slate-900">Word Problems</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-bold">Analyzing (15%)</span>
                      <span className="font-black text-slate-900">Multi-step Inferences</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. QUESTION BANK & PSYCHOMETRICS */}
      {subTab === 'bank' && (
        <div>
          <ItemBankManager />
        </div>
      )}



      {/* Authoring Modals */}
      <CreateDiagnosticModal
        isOpen={isDiagnosticModalOpen}
        onClose={() => setIsDiagnosticModalOpen(false)}
        onSave={(data) => {
          alert(`Diagnostic Assessment "${data.title}" saved as ${data.status}!`);
        }}
      />

      <CreateFormativeModal
        isOpen={isFormativeModalOpen}
        onClose={() => setIsFormativeModalOpen(false)}
        onSave={(data) => {
          alert(`Formative Check "${data.title}" saved as ${data.status}!`);
        }}
      />

      {/* Formative DepEd Excel Importer Modal */}
      <DepEdExcelImporter
        isOpen={isFormativeExcelOpen}
        onClose={() => setIsFormativeExcelOpen(false)}
        onImportQuestions={handleImportFormativeExcel}
        mode="formative"
      />

      {/* Diagnostic DepEd Excel Importer Modal */}
      <DepEdExcelImporter
        isOpen={isDiagnosticExcelOpen}
        onClose={() => setIsDiagnosticExcelOpen(false)}
        onImportQuestions={handleImportDiagnosticExcel}
        mode="diagnostic"
      />

      {/* Student Permission Requests Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-950 p-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                </span>
                <h3 className="font-black text-slate-900 text-base uppercase">
                  Pending Student Access Permissions
                </h3>
              </div>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              The following students are requesting live teacher permission / unlock to take their Diagnostic or Formative assessment:
            </p>

            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-500">No pending permission requests.</p>
                <p className="text-[11px] text-slate-400">All student requests have been processed.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {pendingRequests.map(req => (
                  <div key={req.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">{req.studentName}</span>
                      <span className="text-[10px] text-slate-500 font-semibold block">LRN: {req.lrn} • {req.section}</span>
                      <span className="text-[10px] font-bold text-indigo-600 block">{req.assessmentTitle} • {req.timestamp}</span>
                    </div>

                    <button
                      onClick={() => approveRequest(req.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      Grant Access
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Queue
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DepEd Printable Test Sheet Modal */}
      {printableData && (
        <PrintableAssessmentModal
          isOpen={!!printableData}
          onClose={() => setPrintableData(null)}
          title={printableData.title}
          targetSection={printableData.targetSection}
          questions={printableData.questions}
        />
      )}

      {/* Edit Custom Imported Assessment Modal */}
      <EditCustomAssessmentModal
        isOpen={!!editingCustomAssessment}
        onClose={() => setEditingCustomAssessment(null)}
        assessment={editingCustomAssessment}
        onSave={handleSaveEditedAssessment}
      />
    </div>
  );
}
