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
  Sliders,
  EyeOff,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info
} from 'lucide-react';
import { Topic, Quiz, Problem, SummativeAssessment, isValidatedOrActive } from '../../types';
import CreateDiagnosticModal from '../CreateDiagnosticModal';
import CreateFormativeModal from '../CreateFormativeModal';
import PrintableAssessmentModal from '../PrintableAssessmentModal';
import TeacherAssessmentResults from '../TeacherAssessmentResults';
import DepEdExcelImporter, { ParsedDepEdQuestion, SecurityGateConfig } from '../DepEdExcelImporter';
import EditCustomAssessmentModal from '../EditCustomAssessmentModal';
import { useCurriculum } from '../../hooks/useFirebase';
import { getIntegritySettings, saveIntegritySettings, IntegritySettings } from '../../lib/integritySettings';

interface TeacherAssessmentsViewProps {
  topics: Topic[];
  initialSubTab?: 'diagnostic' | 'formative' | 'diagnostic-results' | 'formative-results' | 'exams';
}

export default function TeacherAssessmentsView({
  topics,
  initialSubTab = 'diagnostic'
}: TeacherAssessmentsViewProps) {
  const { importProblems, deleteProblem, saveTopic } = useCurriculum();
  const [subTab, setSubTab] = useState<'diagnostic' | 'formative' | 'diagnostic-results' | 'formative-results' | 'exams'>(initialSubTab);
  const [expandedSummativeExamId, setExpandedSummativeExamId] = useState<string | null>(null);
  const [expandedDiagnosticId, setExpandedDiagnosticId] = useState<string | null>(null);
  const [expandedFormativeId, setExpandedFormativeId] = useState<string | null>(null);
  const [expandedDefaultDiagnostic, setExpandedDefaultDiagnostic] = useState<boolean>(false);
  const [defaultDiagnosticQuestions, setDefaultDiagnosticQuestions] = useState<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    competency: string;
  }>>([
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
  ]);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isDiagnosticExcelOpen, setIsDiagnosticExcelOpen] = useState(false);
  const [isFormativeModalOpen, setIsFormativeModalOpen] = useState(false);
  const [isFormativeExcelOpen, setIsFormativeExcelOpen] = useState(false);
  const [excelSuccessNotification, setExcelSuccessNotification] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

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

  // Active Exam Activation State
  const [activeDiagnosticId, setActiveDiagnosticId] = useState<string>(() => {
    try {
      return localStorage.getItem('mathquest_active_diagnostic_id') || 'diag-1';
    } catch (e) {
      return 'diag-1';
    }
  });

  const [activeFormativeId, setActiveFormativeId] = useState<string>(() => {
    try {
      return localStorage.getItem('mathquest_active_formative_id') || 'form-1';
    } catch (e) {
      return 'form-1';
    }
  });

  const handleSetActiveDiagnostic = (id: string) => {
    setActiveDiagnosticId(id);
    try {
      localStorage.setItem('mathquest_active_diagnostic_id', id);
      window.dispatchEvent(new CustomEvent('mathquest_active_assessment_changed', { detail: { type: 'diagnostic', id } }));
    } catch (e) {}
  };

  const handleSetActiveFormative = (id: string) => {
    setActiveFormativeId(id);
    try {
      localStorage.setItem('mathquest_active_formative_id', id);
      window.dispatchEvent(new CustomEvent('mathquest_active_assessment_changed', { detail: { type: 'formative', id } }));
    } catch (e) {}
  };

  const handleImportFormativeExcel = async (imported: ParsedDepEdQuestion[], securityConfig?: SecurityGateConfig) => {
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
    const targetSec = securityConfig?.targetSection || 'Grade 11 - STEM A';
    const customTitle = securityConfig?.assessmentTitle || `Formative Assessment: Item Bank (${imported.length} Items)`;
    const assignedCode = securityConfig?.accessCode || 'FORM' + Math.floor(10 + Math.random() * 90);
    const isLocked = securityConfig ? securityConfig.isLockedForClass : false;
    const isPub = securityConfig ? securityConfig.publishedToStudents : true;

    const newEntry = {
      id: newFormativeId,
      title: customTitle,
      topicTitle: imported[0]?.competency ? `MELC: ${imported[0].competency.slice(0, 45)}...` : 'Grade 11 General Mathematics',
      targetSection: targetSec,
      questionsCount: imported.length,
      accessCode: assignedCode,
      schedule: 'Today (08:00 AM - 05:00 PM)',
      questions: imported.map(q => ({ ...q, published: isPub })),
      published: isPub,
      status: isPub ? 'Published' : 'Draft',
      createdAt: new Date().toISOString()
    };

    const updatedList = [newEntry, ...customFormativeList];
    setCustomFormativeList(updatedList);
    try {
      localStorage.setItem('mathquest_formative_assessments', JSON.stringify(updatedList));
    } catch (e) {}

    // 3. Set unlocked status and access code
    setUnlockedAssessments(prev => ({ ...prev, [newFormativeId]: !isLocked }));
    setAccessCodes(prev => ({ ...prev, [newFormativeId]: assignedCode }));

    // 4. Show success banner
    setExcelSuccessNotification(`🛡️ Security Gate Authorized: Deployed ${imported.length} formative questions to ${targetSec}!`);
    setTimeout(() => {
      setExcelSuccessNotification(null);
    }, 6000);
  };

  const handleImportDiagnosticExcel = async (imported: ParsedDepEdQuestion[], securityConfig?: SecurityGateConfig) => {
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
    const targetSec = securityConfig?.targetSection || 'Grade 11 - STEM A';
    const customTitle = securityConfig?.assessmentTitle || `Diagnostic Assessment: Item Bank (${imported.length} Items)`;
    const assignedCode = securityConfig?.accessCode || 'DIAG' + Math.floor(10 + Math.random() * 90);
    const isLocked = securityConfig ? securityConfig.isLockedForClass : false;
    const isPub = securityConfig ? securityConfig.publishedToStudents : true;

    const newEntry = {
      id: newDiagId,
      title: customTitle,
      topicTitle: imported[0]?.competency ? `MELC: ${imported[0].competency.slice(0, 45)}...` : 'Grade 11 General Mathematics',
      targetSection: targetSec,
      questionsCount: imported.length,
      accessCode: assignedCode,
      schedule: 'Today (08:00 AM - 05:00 PM)',
      questions: imported.map(q => ({ ...q, published: isPub })),
      published: isPub,
      status: isPub ? 'Published' : 'Draft',
      createdAt: new Date().toISOString()
    };

    const updatedList = [newEntry, ...customDiagnosticList];
    setCustomDiagnosticList(updatedList);
    try {
      localStorage.setItem('mathquest_diagnostic_assessments', JSON.stringify(updatedList));
    } catch (e) {}

    // 3. Set unlocked status and access code
    setUnlockedAssessments(prev => ({ ...prev, [newDiagId]: !isLocked }));
    setAccessCodes(prev => ({ ...prev, [newDiagId]: assignedCode }));

    // 4. Show success banner
    setExcelSuccessNotification(`🛡️ Security Gate Authorized: Deployed ${imported.length} diagnostic questions to ${targetSec}!`);
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

  const handleToggleDiagnosticPublished = (id: string) => {
    const updated = customDiagnosticList.map(d => {
      if (d.id === id) {
        const nextPublished = d.published === false ? true : false;
        return { ...d, published: nextPublished, status: nextPublished ? 'Published' : 'Draft' };
      }
      return d;
    });
    setCustomDiagnosticList(updated);
    try {
      localStorage.setItem('mathquest_diagnostic_assessments', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleToggleFormativePublished = (id: string) => {
    const updated = customFormativeList.map(f => {
      if (f.id === id) {
        const nextPublished = f.published === false ? true : false;
        return { ...f, published: nextPublished, status: nextPublished ? 'Published' : 'Draft' };
      }
      return f;
    });
    setCustomFormativeList(updated);
    try {
      localStorage.setItem('mathquest_formative_assessments', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteDiagnostic = (id: string) => {
    const target = customDiagnosticList.find(d => d.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Remove Diagnostic Assessment',
      message: `Are you sure you want to delete "${target?.title || 'this assessment'}" and all its imported questions?`,
      confirmLabel: 'Yes, Delete Assessment',
      onConfirm: () => {
        const updatedList = customDiagnosticList.filter(d => d.id !== id);
        setCustomDiagnosticList(updatedList);
        try {
          localStorage.setItem('mathquest_diagnostic_assessments', JSON.stringify(updatedList));
        } catch (e) {}
        if (activeDiagnosticId === id) {
          setActiveDiagnosticId('diag-1');
          try {
            localStorage.setItem('mathquest_active_diagnostic_id', 'diag-1');
          } catch (e) {}
        }
        setExcelSuccessNotification('Diagnostic assessment successfully removed.');
        setTimeout(() => setExcelSuccessNotification(null), 3500);
      }
    });
  };

  const handleDeleteCustomDiagnosticQuestion = (assessmentId: string, questionIndex: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Diagnostic Question',
      message: 'Are you sure you want to remove this question from the diagnostic questionnaire?',
      confirmLabel: 'Yes, Delete Question',
      onConfirm: () => {
        const updatedList = customDiagnosticList.map(d => {
          if (d.id === assessmentId) {
            const nextQuestions = d.questions.filter((_, idx) => idx !== questionIndex);
            return {
              ...d,
              questions: nextQuestions,
              questionsCount: nextQuestions.length
            };
          }
          return d;
        });
        setCustomDiagnosticList(updatedList);
        try {
          localStorage.setItem('mathquest_diagnostic_assessments', JSON.stringify(updatedList));
        } catch (e) {}
        setExcelSuccessNotification('Question successfully deleted from diagnostic assessment.');
        setTimeout(() => setExcelSuccessNotification(null), 3000);
      }
    });
  };

  const handleDeleteDefaultDiagnosticQuestion = (questionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question from the baseline diagnostic assessment?',
      confirmLabel: 'Yes, Delete Question',
      onConfirm: () => {
        setDefaultDiagnosticQuestions(prev => prev.filter(q => q.id !== questionId));
        setExcelSuccessNotification('Question removed from baseline diagnostic.');
        setTimeout(() => setExcelSuccessNotification(null), 3000);
      }
    });
  };

  const handleDeleteCustomFormativeQuestion = (assessmentId: string, questionIndex: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Formative Question',
      message: 'Are you sure you want to remove this question from the formative questionnaire?',
      confirmLabel: 'Yes, Delete Question',
      onConfirm: () => {
        const updatedList = customFormativeList.map(f => {
          if (f.id === assessmentId) {
            const nextQuestions = f.questions.filter((_, idx) => idx !== questionIndex);
            return {
              ...f,
              questions: nextQuestions,
              questionsCount: nextQuestions.length
            };
          }
          return f;
        });
        setCustomFormativeList(updatedList);
        try {
          localStorage.setItem('mathquest_formative_assessments', JSON.stringify(updatedList));
        } catch (e) {}
        setExcelSuccessNotification('Question successfully deleted from formative assessment.');
        setTimeout(() => setExcelSuccessNotification(null), 3000);
      }
    });
  };

  const handleDeleteFormative = (id: string) => {
    const target = customFormativeList.find(f => f.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Remove Formative Assessment',
      message: `Are you sure you want to delete "${target?.title || 'this assessment'}" and all its imported questions?`,
      confirmLabel: 'Yes, Delete Assessment',
      onConfirm: () => {
        const updatedList = customFormativeList.filter(f => f.id !== id);
        setCustomFormativeList(updatedList);
        try {
          localStorage.setItem('mathquest_formative_assessments', JSON.stringify(updatedList));
        } catch (e) {}
        if (activeFormativeId === id) {
          setActiveFormativeId('form-1');
          try {
            localStorage.setItem('mathquest_active_formative_id', 'form-1');
          } catch (e) {}
        }
        setExcelSuccessNotification('Formative assessment successfully removed.');
        setTimeout(() => setExcelSuccessNotification(null), 3500);
      }
    });
  };

  const handleDeleteDefaultDiagnostic = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Default Diagnostic',
      message: 'Are you sure you want to delete the default baseline diagnostic assessment?',
      confirmLabel: 'Yes, Delete Baseline Diagnostic',
      onConfirm: () => {
        setDefaultDiagnosticDeleted(true);
        try {
          localStorage.setItem('mathquest_default_diagnostic_deleted', 'true');
        } catch (e) {}
        setExcelSuccessNotification('Default baseline diagnostic removed.');
        setTimeout(() => setExcelSuccessNotification(null), 3000);
      }
    });
  };

  const handleDeleteDefaultFormative = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Default Formative',
      message: 'Are you sure you want to delete the default formative checkpoint?',
      confirmLabel: 'Yes, Delete Formative',
      onConfirm: () => {
        setDefaultFormativeDeleted(true);
        try {
          localStorage.setItem('mathquest_default_formative_deleted', 'true');
        } catch (e) {}
        setExcelSuccessNotification('Default formative checkpoint removed.');
        setTimeout(() => setExcelSuccessNotification(null), 3000);
      }
    });
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
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Assessments & Diagnostics Hub</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Create Diagnostic Baseline Checks and In-Lesson Formative Assessments, configure Summative Exams (TOS), and inspect Class Performance analytics.
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
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1.5 overflow-x-auto shadow-xs no-scrollbar">
        <button
          onClick={() => setSubTab('diagnostic')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            subTab === 'formative'
              ? 'bg-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4 text-indigo-300" />
          <span>Formative Assessments</span>
        </button>

        <button
          onClick={() => setSubTab('exams')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            subTab === 'exams'
              ? 'bg-amber-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-300" />
          <span>Summative Tests (TOS)</span>
        </button>

        <button
          onClick={() => setSubTab('diagnostic-results')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            subTab === 'diagnostic-results'
              ? 'bg-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-300" />
          <span>Diagnostic Results</span>
        </button>

        <button
          onClick={() => setSubTab('formative-results')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            subTab === 'formative-results'
              ? 'bg-indigo-600 text-white shadow-sm font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-300" />
          <span>Formative Results</span>
        </button>
      </div>

      {/* 1. DIAGNOSTIC ASSESSMENTS */}
      {subTab === 'diagnostic' && (
        <div className="space-y-5">
          {excelSuccessNotification && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span className="leading-snug">{excelSuccessNotification}</span>
              </div>
              <button
                onClick={() => setExcelSuccessNotification(null)}
                className="text-emerald-700 hover:text-emerald-950 text-sm font-black cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Diagnostic Purpose Notice */}
          <div className="p-5 sm:p-6 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-amber-950 shadow-xs">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-xs uppercase tracking-wider text-amber-950 block">
                  Diagnostic Assessment Purpose & Item Bank
                </span>
                <p className="text-amber-900 leading-relaxed text-xs">
                  Determine prior knowledge and learning gaps before beginning topic instruction. Upload DepEd Excel files with the <strong>"ITEM BANK"</strong> sheet to automatically populate questions, learning competencies, and answer keys.
                </p>
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowPermissionModal(true)}
                className="w-full md:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0 hover:scale-[1.02]"
              >
                <Clock className="w-4 h-4" />
                <span>Pending Access Requests</span>
                <span className="bg-white text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {pendingRequests.length}
                </span>
              </button>
            )}
          </div>

          {/* Assessment List Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Active Diagnostic Questionnaires</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {(defaultDiagnosticDeleted ? 0 : 1) + customDiagnosticList.length} Available
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage deployed baseline diagnostic exams, examine question pools, and configure student accessibility.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsDiagnosticExcelOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import DepEd Excel (ITEM BANK)</span>
              </button>
            </div>
          </div>

          <div className="grid gap-5">
            {/* Custom Imported Diagnostic Assessments from Excel */}
            {customDiagnosticList.map((cd) => (
              <div key={cd.id} className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-emerald-300 shadow-sm hover:border-emerald-500 transition-all space-y-4">
                {/* Header & Action Toolbar */}
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Excel Item Bank Import
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md truncate max-w-[240px]">
                        {cd.topicTitle}
                      </span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        Target: {cd.targetSection}
                      </span>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        {cd.questionsCount} Questions
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-lg sm:text-xl leading-snug tracking-tight">
                      {cd.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Imported from DepEd Excel "ITEM BANK" worksheet. Integrated into Diagnostic Assessments and centralized Item Bank.
                    </p>
                  </div>

                  {/* Clean Structured Action Toolbar */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2 w-full xl:w-auto xl:min-w-[280px] shrink-0 justify-end">
                    {/* Status Row */}
                    <div className="flex items-center gap-2">
                      {activeDiagnosticId === cd.id ? (
                        <span className="flex-1 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap">
                          <span>⭐ Active Diagnostic Exam</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActiveDiagnostic(cd.id)}
                          className="flex-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs transition-colors cursor-pointer border border-slate-300 text-center whitespace-nowrap"
                          title="Set this assessment as active exam for students"
                        >
                          Set as Active Exam
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleDiagnosticPublished(cd.id)}
                        className={`px-3 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap ${
                          cd.published !== false && cd.status !== 'Draft'
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                        }`}
                        title={cd.published !== false && cd.status !== 'Draft' ? 'Published to students (Click to unpublish)' : 'Draft (Click to publish to students)'}
                      >
                        {cd.published !== false && cd.status !== 'Draft' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Management Action Buttons Row */}
                    <div className="flex items-center gap-2">
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
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                      >
                        <span>🖨️ Print Sheet</span>
                      </button>

                      <button
                        onClick={() => setEditingCustomAssessment(cd)}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300 whitespace-nowrap"
                        title="Edit Item Bank Questions"
                      >
                        <span>✏️ Edit Items</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDiagnostic(cd.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 border border-rose-200 whitespace-nowrap"
                        title="Delete this diagnostic questionnaire"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Items Breakdown & Question Manager */}
                <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                        Diagnostic Question Pool ({cd.questions?.length || 0} Questions)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedDiagnosticId(expandedDiagnosticId === cd.id ? null : cd.id)}
                      className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs hover:bg-amber-50 transition-colors"
                    >
                      <span>{expandedDiagnosticId === cd.id ? 'Hide Question Pool' : 'View & Manage Questions'}</span>
                      {expandedDiagnosticId === cd.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {expandedDiagnosticId === cd.id && (
                    <div className="pt-3 space-y-3 border-t border-amber-200/60 animate-in fade-in">
                      {(!cd.questions || cd.questions.length === 0) ? (
                        <div className="p-5 text-center bg-white rounded-2xl border border-amber-200 text-xs text-amber-800 font-medium">
                          No questions found in this diagnostic assessment.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {cd.questions.map((q: any, qIdx: number) => (
                            <div key={q.id || `diag-q-${qIdx}`} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                      Question {qIdx + 1}
                                    </span>
                                    {q.itemId && (
                                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                        ID: {q.itemId}
                                      </span>
                                    )}
                                    {q.competency && (
                                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md max-w-full sm:max-w-md truncate">
                                        {q.competency}
                                      </span>
                                    )}
                                    {q.difficulty && (
                                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                        q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                        q.difficulty === 'hard' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                        'bg-amber-50 text-amber-800 border-amber-200'
                                      }`}>
                                        {q.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold text-slate-900 leading-relaxed pt-1">
                                    {q.question}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomDiagnosticQuestion(cd.id, qIdx)}
                                  className="w-full sm:w-auto justify-center px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                                  title="Delete question from this diagnostic assessment"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete Question</span>
                                </button>
                              </div>

                              {/* Multiple Choice Options Grid */}
                              {q.options && Array.isArray(q.options) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {q.options.map((opt: string, optIdx: number) => {
                                    const isCorrect = (typeof q.correctAnswer === 'number' && q.correctAnswer === optIdx) ||
                                                      (typeof q.correctAnswer === 'string' && (q.correctAnswer === opt || q.correctAnswer === String(optIdx)));
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`p-3 rounded-xl text-xs flex items-center justify-between border transition-all ${
                                          isCorrect
                                            ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 pr-2">
                                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                          }`}>
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span className="leading-snug break-words">{opt}</span>
                                        </div>
                                        {isCorrect && (
                                          <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            CORRECT
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Schedule & Passcode Live Bar */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Schedule: <strong className="text-slate-900">{cd.schedule}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Passcode: <strong className="bg-white px-2.5 py-1 rounded-lg border border-slate-300 tracking-wider font-mono text-indigo-950 text-xs">{accessCodes[cd.id] || cd.accessCode}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => toggleUnlockStatus(cd.id)}
                      className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                        unlockedAssessments[cd.id]
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      <span>{unlockedAssessments[cd.id] ? '🔓 Unlocked for Class' : '🔒 Locked (Permission Required)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Default Baseline Diagnostic */}
            {!defaultDiagnosticDeleted && (
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                        Quarter 1 Baseline Check
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                        Grade 11 • General Mathematics
                      </span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        Target: Grade 11 - STEM A
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-lg sm:text-xl leading-snug tracking-tight">
                      Functions & Their Graphs - Pre-Lesson Diagnostic
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Evaluates baseline knowledge on function definitions, notation, domain, and range before commencing Unit 1.
                    </p>
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2 w-full xl:w-auto xl:min-w-[280px] shrink-0 justify-end">
                    <div className="flex items-center gap-2">
                      {activeDiagnosticId === 'diag-1' ? (
                        <span className="flex-1 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap">
                          <span>⭐ Active Diagnostic Exam</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActiveDiagnostic('diag-1')}
                          className="flex-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs transition-colors cursor-pointer border border-slate-300 text-center whitespace-nowrap"
                          title="Set this assessment as active exam"
                        >
                          Set as Active Exam
                        </button>
                      )}

                      <span className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs rounded-xl flex items-center gap-1 whitespace-nowrap">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Published
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrintDiagnostic}
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                      >
                        <span>🖨️ Print Sheet</span>
                      </button>

                      <button
                        onClick={() => setIsDiagnosticModalOpen(true)}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300 whitespace-nowrap"
                      >
                        <span>✏️ Edit Test</span>
                      </button>

                      <button
                        onClick={handleDeleteDefaultDiagnostic}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 border border-rose-200 whitespace-nowrap"
                        title="Delete Baseline Diagnostic"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Default Diagnostic Questions Breakdown */}
                <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                        Diagnostic Question Pool ({defaultDiagnosticQuestions.length} Questions)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedDefaultDiagnostic(!expandedDefaultDiagnostic)}
                      className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs hover:bg-amber-50 transition-colors"
                    >
                      <span>{expandedDefaultDiagnostic ? 'Hide Question Pool' : 'View & Manage Questions'}</span>
                      {expandedDefaultDiagnostic ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {expandedDefaultDiagnostic && (
                    <div className="pt-3 space-y-3 border-t border-amber-200/60 animate-in fade-in">
                      {defaultDiagnosticQuestions.length === 0 ? (
                        <div className="p-5 text-center bg-white rounded-2xl border border-amber-200 text-xs text-amber-800 font-medium">
                          No questions remaining in baseline diagnostic.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {defaultDiagnosticQuestions.map((q, qIdx) => (
                            <div key={q.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-400 transition-all space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-amber-950 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                      Question {qIdx + 1}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md max-w-full sm:max-w-md truncate">
                                      {q.competency}
                                    </span>
                                  </div>
                                  <p className="text-sm font-bold text-slate-900 leading-relaxed pt-1">
                                    {q.question}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteDefaultDiagnosticQuestion(q.id)}
                                  className="w-full sm:w-auto justify-center px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                                  title="Delete question from baseline diagnostic"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete Question</span>
                                </button>
                              </div>

                              {/* Options */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-xl text-xs flex items-center justify-between border transition-all ${
                                      optIdx === q.correctAnswer
                                        ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 pr-2">
                                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                        optIdx === q.correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span className="leading-snug break-words">{opt}</span>
                                    </div>
                                    {optIdx === q.correctAnswer && (
                                      <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        CORRECT
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Schedule & Permission Live Bar */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Schedule: <strong className="text-slate-900">Today (08:00 AM - 05:00 PM)</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Passcode: <strong className="bg-white px-2.5 py-1 rounded-lg border border-slate-300 tracking-wider font-mono text-amber-950 text-xs">{accessCodes['diag-1']}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={() => toggleUnlockStatus('diag-1')}
                      className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                        unlockedAssessments['diag-1']
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      <span>{unlockedAssessments['diag-1'] ? '🔓 Unlocked for STEM-A' : '🔒 Locked (Permission Required)'}</span>
                    </button>

                    <button
                      onClick={() => setShowPermissionModal(true)}
                      className="flex-1 sm:flex-initial justify-center px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
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
        <div className="space-y-5">
          {excelSuccessNotification && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="leading-snug">{excelSuccessNotification}</span>
              </div>
              <button
                onClick={() => setExcelSuccessNotification(null)}
                className="text-emerald-700 hover:text-emerald-950 text-sm font-black cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Formative Purpose Notice */}
          <div className="p-5 sm:p-6 bg-indigo-50 border border-indigo-200 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-indigo-950 shadow-xs">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-700">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-xs uppercase tracking-wider text-indigo-950 block">
                  Formative Assessment Purpose & In-Lesson Checkpoints
                </span>
                <p className="text-indigo-900 leading-relaxed text-xs">
                  Low-stakes continuous checks during ILAW lessons to verify student understanding with immediate answer feedback and remediation hints. Import DepEd Excel <strong>"ITEM BANK"</strong> to deploy full lesson quizzes with feedback.
                </p>
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowPermissionModal(true)}
                className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0 hover:scale-[1.02]"
              >
                <Clock className="w-4 h-4" />
                <span>Pending Access Requests</span>
                <span className="bg-white text-indigo-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {pendingRequests.length}
                </span>
              </button>
            )}
          </div>

          {/* Formative Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>Active Formative Checks & Quizzes</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {(defaultFormativeDeleted ? 0 : 1) + customFormativeList.length} Available
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage in-lesson knowledge checks, monitor active checkpoints, and configure student visibility.
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsFormativeExcelOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import DepEd Excel (ITEM BANK)</span>
              </button>
            </div>
          </div>

          <div className="grid gap-5">
            {/* Custom Imported Formative Assessments from Excel */}
            {customFormativeList.map((cf) => (
              <div key={cf.id} className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-emerald-300 shadow-sm hover:border-emerald-500 transition-all space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Excel Item Bank Import
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md truncate max-w-[240px]">
                        {cf.topicTitle}
                      </span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        Target: {cf.targetSection}
                      </span>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        {cf.questionsCount} Questions
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-lg sm:text-xl leading-snug tracking-tight">
                      {cf.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Imported from DepEd Excel "ITEM BANK" worksheet. Integrated into Formative Assessments and centralized Item Bank.
                    </p>
                  </div>

                  {/* Clean Structured Action Toolbar */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2 w-full xl:w-auto xl:min-w-[280px] shrink-0 justify-end">
                    <div className="flex items-center gap-2">
                      {activeFormativeId === cf.id ? (
                        <span className="flex-1 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap">
                          <span>⭐ Active Formative Exam</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActiveFormative(cf.id)}
                          className="flex-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs transition-colors cursor-pointer border border-slate-300 text-center whitespace-nowrap"
                          title="Set this assessment as active formative exam"
                        >
                          Set as Active Exam
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleFormativePublished(cf.id)}
                        className={`px-3 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap ${
                          cf.published !== false && cf.status !== 'Draft'
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                        }`}
                        title={cf.published !== false && cf.status !== 'Draft' ? 'Published to students (Click to unpublish)' : 'Draft (Click to publish to students)'}
                      >
                        {cf.published !== false && cf.status !== 'Draft' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
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
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                      >
                        <span>🖨️ Print Sheet</span>
                      </button>

                      <button
                        onClick={() => setEditingCustomAssessment(cf)}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300 whitespace-nowrap"
                        title="Edit Item Bank Questions"
                      >
                        <span>✏️ Edit Items</span>
                      </button>

                      <button
                        onClick={() => handleDeleteFormative(cf.id)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 border border-rose-200 whitespace-nowrap"
                        title="Delete this formative assessment"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formative Items Breakdown & Question Manager */}
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-200/80 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                        Formative Question Pool ({cf.questions?.length || 0} Questions)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedFormativeId(expandedFormativeId === cf.id ? null : cf.id)}
                      className="text-xs font-bold text-indigo-900 hover:text-indigo-950 flex items-center gap-1.5 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-indigo-300 shadow-2xs hover:bg-indigo-50 transition-colors"
                    >
                      <span>{expandedFormativeId === cf.id ? 'Hide Question Pool' : 'View & Manage Questions'}</span>
                      {expandedFormativeId === cf.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {expandedFormativeId === cf.id && (
                    <div className="pt-3 space-y-3 border-t border-indigo-200/60 animate-in fade-in">
                      {(!cf.questions || cf.questions.length === 0) ? (
                        <div className="p-5 text-center bg-white rounded-2xl border border-indigo-200 text-xs text-indigo-800 font-medium">
                          No questions found in this formative assessment.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {cf.questions.map((q: any, qIdx: number) => (
                            <div key={q.id || `form-q-${qIdx}`} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 transition-all space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-indigo-950 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                                      Question {qIdx + 1}
                                    </span>
                                    {q.itemId && (
                                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                        ID: {q.itemId}
                                      </span>
                                    )}
                                    {q.competency && (
                                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md max-w-full sm:max-w-md truncate">
                                        {q.competency}
                                      </span>
                                    )}
                                    {q.difficulty && (
                                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                        q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                        q.difficulty === 'hard' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                                        'bg-indigo-50 text-indigo-800 border-indigo-200'
                                      }`}>
                                        {q.difficulty}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-bold text-slate-900 leading-relaxed pt-1">
                                    {q.question}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomFormativeQuestion(cf.id, qIdx)}
                                  className="w-full sm:w-auto justify-center px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                                  title="Delete question from this formative assessment"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Delete Question</span>
                                </button>
                              </div>

                              {/* Options */}
                              {q.options && Array.isArray(q.options) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                  {q.options.map((opt: string, optIdx: number) => {
                                    const isCorrect = (typeof q.correctAnswer === 'number' && q.correctAnswer === optIdx) ||
                                                      (typeof q.correctAnswer === 'string' && (q.correctAnswer === opt || q.correctAnswer === String(optIdx)));
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`p-3 rounded-xl text-xs flex items-center justify-between border transition-all ${
                                          isCorrect
                                            ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 pr-2">
                                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                          }`}>
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span className="leading-snug break-words">{opt}</span>
                                        </div>
                                        {isCorrect && (
                                          <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            CORRECT
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Schedule & Passcode Live Bar */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Schedule: <strong className="text-slate-900">{cf.schedule}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Passcode: <strong className="bg-white px-2.5 py-1 rounded-lg border border-slate-300 tracking-wider font-mono text-indigo-950 text-xs">{accessCodes[cf.id] || cf.accessCode}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => toggleUnlockStatus(cf.id)}
                      className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                        unlockedAssessments[cf.id]
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
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
              <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all space-y-4">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        In-Lesson Quick Check
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                        Lesson 1: Introduction to Functions
                      </span>
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        Target: Grade 11 - STEM A
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-lg sm:text-xl leading-snug tracking-tight">
                      Formative Check #1: Functions & Notation
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Immediate explanation feedback on evaluating f(x) and vertical line test.
                    </p>
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2 w-full xl:w-auto xl:min-w-[280px] shrink-0 justify-end">
                    <div className="flex items-center gap-2">
                      {activeFormativeId === 'form-1' ? (
                        <span className="flex-1 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap">
                          <span>⭐ Active Formative Exam</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetActiveFormative('form-1')}
                          className="flex-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs transition-colors cursor-pointer border border-slate-300 text-center whitespace-nowrap"
                          title="Set this assessment as active exam"
                        >
                          Set as Active Exam
                        </button>
                      )}

                      <span className="px-3 py-2 bg-indigo-50 text-indigo-800 border border-indigo-200 font-black text-xs rounded-xl flex items-center gap-1 whitespace-nowrap">
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                        Assigned
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrintFormative}
                        className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                      >
                        <span>🖨️ Print Sheet</span>
                      </button>

                      <button
                        onClick={() => setIsFormativeModalOpen(true)}
                        className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300 whitespace-nowrap"
                      >
                        <span>✏️ Edit Check</span>
                      </button>

                      <button
                        onClick={handleDeleteDefaultFormative}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 border border-rose-200 whitespace-nowrap"
                        title="Delete Formative Assessment"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Schedule & Permission Live Bar */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-slate-700 font-bold">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Schedule: <strong className="text-slate-900">Today (08:00 AM - 05:00 PM)</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Award className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Passcode: <strong className="bg-white px-2.5 py-1 rounded-lg border border-slate-300 tracking-wider font-mono text-indigo-950 text-xs">{accessCodes['form-1']}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={() => toggleUnlockStatus('form-1')}
                      className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                        unlockedAssessments['form-1']
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                    >
                      <span>{unlockedAssessments['form-1'] ? '🔓 Unlocked for STEM-A' : '🔒 Locked (Permission Required)'}</span>
                    </button>

                    <button
                      onClick={() => setShowPermissionModal(true)}
                      className="flex-1 sm:flex-initial justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
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
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Bloom's Taxonomy Cognitive Distribution ({exam.problems.length} Total Items)
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedSummativeExamId(expandedSummativeExamId === exam.id ? null : exam.id)}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 cursor-pointer"
                    >
                      {expandedSummativeExamId === exam.id ? 'Hide Question Bank Items' : `View & Manage Questions (${exam.problems.length})`}
                    </button>
                  </div>
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

                {/* Expanded Individual Summative Questions with Delete Buttons */}
                {expandedSummativeExamId === exam.id && (
                  <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                        Summative Examination Question Pool ({exam.problems.length} Questions)
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Click delete to remove any summative question permanently.
                      </span>
                    </div>

                    {exam.problems.length === 0 ? (
                      <div className="p-6 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                        No questions currently in this summative assessment.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {exam.problems.map((prob, pIdx) => (
                          <div
                            key={prob.id || pIdx}
                            className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                                  {pIdx + 1}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {prob.question}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                                {prob.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border ${
                                      prob.correctAnswer === oIdx
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                        : 'bg-white border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                                      prob.correctAnswer === oIdx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span className="truncate">{opt}</span>
                                    {prob.correctAnswer === oIdx && (
                                      <span className="text-[9px] uppercase font-black text-emerald-700 ml-auto">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-3 pl-8 text-[11px] text-slate-500 font-semibold flex-wrap">
                                <span>Comp: <strong className="text-slate-700">{prob.competency || prob.outcomeCode || 'General Math'}</strong></span>
                                <span>•</span>
                                <span className="capitalize">Diff: <strong className="text-slate-700">{prob.difficulty}</strong></span>
                                <span>•</span>
                                <span>Cognitive: <strong className="text-slate-700">{prob.cognitiveLevel || 'Understanding'}</strong></span>
                              </div>
                            </div>

                            <div className="w-full md:w-auto shrink-0 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Delete Summative Question',
                                    message: `Are you sure you want to delete question #${pIdx + 1} ("${prob.question.slice(0, 50)}...") from ${exam.title}?`,
                                    confirmLabel: 'Yes, Delete Question',
                                    onConfirm: async () => {
                                      try {
                                        await deleteProblem(topic.id, `summative-${exam.id}`, prob.id);
                                        setExcelSuccessNotification('Summative question successfully deleted.');
                                        setTimeout(() => setExcelSuccessNotification(null), 3000);
                                      } catch (err) {
                                        console.error('Error deleting summative question:', err);
                                      }
                                    }
                                  });
                                }}
                                className="w-full md:w-auto justify-center px-3 py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="Delete this summative question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Question</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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
        onDelete={(id) => {
          const isDiag = customDiagnosticList.some(d => d.id === id);
          if (isDiag) {
            handleDeleteDiagnostic(id);
          } else {
            handleDeleteFormative(id);
          }
          setEditingCustomAssessment(null);
        }}
      />

      {/* In-App Delete Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(null);
                  action();
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{confirmModal.confirmLabel || 'Delete Permanently'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
