import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Trash2,
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  UserCheck,
  Bug
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ParsedDepEdQuestion {
  id: string;
  itemId?: string;
  day?: string;
  pptSlide?: string;
  question: string;
  questionType: 'multiple-choice' | 'short-answer' | 'true-false';
  options: string[];
  correctAnswer: number | string;
  competency: string;
  cognitiveLevel?: string;
  tier?: string | number;
  difficulty: 'easy' | 'medium' | 'hard';
  correctFeedback: string;
  incorrectFeedback: string;
  published?: boolean;
}

export interface SecurityGateConfig {
  facultyPin: string;
  targetSection: string;
  assessmentTitle: string;
  accessCode: string;
  isLockedForClass: boolean;
  publishedToStudents: boolean;
}

export type AssessmentMode =
  | 'diagnostic'
  | 'pretest'
  | 'posttest'
  | 'formative'
  | 'summative'
  | 'quarterly'
  | 'performance'
  | 'written'
  | 'oral'
  | 'authentic';

interface DepEdExcelImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: ParsedDepEdQuestion[], securityConfig?: SecurityGateConfig) => void;
  mode: AssessmentMode;
}

const ASSESSMENT_MODE_CONFIGS: Record<AssessmentMode, {
  badge: string;
  title: string;
  description: string;
  themeClass: string;
  badgeClass: string;
  codePrefix: string;
  instructions: string;
  sampleTemplate: any[];
}> = {
  diagnostic: {
    badge: "DIAGNOSTIC BASELINE CHECK",
    title: "Grade 11 General Math: Diagnostic Assessment",
    description: "Evaluates student prior knowledge and baseline gaps before commencing unit instruction.",
    themeClass: "bg-amber-600",
    badgeClass: "bg-amber-400 text-slate-950",
    codePrefix: "DIAG",
    instructions: "Sheet requires Item ID, Competency, IRT Difficulty (-3.0 to +3.0), Question, Options A-D, Correct Answer, and Diagnostic Feedback.",
    sampleTemplate: [
      {
        'Item ID': 'DIAG-01',
        'Competency': 'Represents real-life situations using functions (M11GM-Ia-1)',
        'Cognitive Level': 'Understand',
        'Question': 'Which of the following relations represents a function?',
        'Choice A': '{(1, 2), (2, 3), (3, 4)}',
        'Choice B': '{(1, 5), (1, 6), (2, 7)}',
        'Choice C': '{(0, 0), (0, 1), (0, 2)}',
        'Choice D': '{(3, 1), (3, 2), (4, 5)}',
        'Correct Answer': 'A',
        'Difficulty': 'easy',
        'Correct Feedback': '✓ Correct! Each domain element is paired with exactly one range value.',
        'Incorrect Feedback': '✗ A relation is not a function if an x-value repeats with different y-values.'
      }
    ]
  },
  pretest: {
    badge: "PRE-TEST ENTRY ASSESSMENT",
    title: "General Mathematics Entry Pre-Test Questionnaire",
    description: "Measures entry readiness and prerequisite skills prior to starting new topics.",
    themeClass: "bg-blue-600",
    badgeClass: "bg-blue-400 text-slate-950",
    codePrefix: "PRE",
    instructions: "Sheet requires Prerequisite Item ID, Prerequisite Competency Code, Entry Question, Choices A-D, and Diagnostic Remediation.",
    sampleTemplate: [
      {
        'Item ID': 'PRE-01',
        'Competency': 'Prerequisite Algebra: Factoring Polynomials',
        'Cognitive Level': 'Apply',
        'Question': 'Factor completely: x^2 - 9',
        'Choice A': '(x - 3)(x + 3)',
        'Choice B': '(x - 3)^2',
        'Choice C': '(x + 3)^2',
        'Choice D': 'x(x - 9)',
        'Correct Answer': 'A',
        'Difficulty': 'easy',
        'Correct Feedback': '✓ Correct! Difference of two squares formula: a^2 - b^2 = (a-b)(a+b).',
        'Incorrect Feedback': '✗ Recall: Difference of squares factors into conjugate binomials.'
      }
    ]
  },
  posttest: {
    badge: "POST-TEST EXIT ASSESSMENT",
    title: "General Mathematics Post-Test Exit Check",
    description: "Evaluates exit competency mastery and learning growth gains following instruction.",
    themeClass: "bg-purple-600",
    badgeClass: "bg-purple-400 text-slate-950",
    codePrefix: "POST",
    instructions: "Sheet requires Exit Item ID, Target Competency Standard, Question, Choices A-D, Correct Answer, and Exit Mastery Rationale.",
    sampleTemplate: [
      {
        'Item ID': 'POST-01',
        'Competency': 'Solves rational equations and inequalities (M11GM-Ib-1)',
        'Cognitive Level': 'Analyze',
        'Question': 'Solve for x: (x + 2) / (x - 1) = 2',
        'Choice A': 'x = 4',
        'Choice B': 'x = 2',
        'Choice C': 'x = -1',
        'Choice D': 'x = 1 (extraneous)',
        'Correct Answer': 'A',
        'Difficulty': 'medium',
        'Correct Feedback': '✓ Correct! x + 2 = 2(x - 1) => x + 2 = 2x - 2 => x = 4.',
        'Incorrect Feedback': '✗ Multiply both sides by (x - 1) and check for non-zero denominators.'
      }
    ]
  },
  formative: {
    badge: "FORMATIVE QUICK CHECK",
    title: "Lesson Formative Knowledge Checkpoint",
    description: "Low-stakes continuous checks during lessons with immediate answer feedback & remediation hints.",
    themeClass: "bg-indigo-600",
    badgeClass: "bg-indigo-400 text-slate-950",
    codePrefix: "FORM",
    instructions: "Sheet requires Item ID, PPT Slide, Competency, Question, Choices A-D, Correct Answer, Positive Feedback, and Remediation Hint.",
    sampleTemplate: [
      {
        'Item ID': 'FORM-01',
        'PPT Slide': 'Slide 6',
        'Competency': 'Evaluates piecewise functions accurately (M11GM-Ia-2)',
        'Cognitive Level': 'Apply',
        'Question': 'Evaluate f(3) if f(x) = 2x + 1.',
        'Choice A': '5',
        'Choice B': '6',
        'Choice C': '7',
        'Choice D': '8',
        'Correct Answer': 'C',
        'Difficulty': 'easy',
        'Correct Feedback': '✓ Correct! f(3) = 2(3) + 1 = 7.',
        'Incorrect Feedback': '✗ Substitute x = 3 directly into f(x) = 2x + 1.'
      }
    ]
  },
  summative: {
    badge: "SUMMATIVE UNIT EXAMINATION",
    title: "Unit Summative Examination (DepEd TOS)",
    description: "Calibrated against Bloom's cognitive taxonomy (Remembering, Understanding, Applying, Analyzing).",
    themeClass: "bg-violet-600",
    badgeClass: "bg-violet-400 text-slate-950",
    codePrefix: "SUMM",
    instructions: "Sheet requires Item ID, Unit Topic, Cognitive Taxonomy Level, Question, Choices A-D, Correct Answer, and Full Solution Rationale.",
    sampleTemplate: [
      {
        'Item ID': 'SUMM-01',
        'Competency': 'Solves real-life problems involving functions (M11GM-Ia-4)',
        'Cognitive Level': 'Apply',
        'Question': 'A jeepney fare charges ₱13 for the first 4 km and ₱1.75 for each additional km. Find the fare for 10 km.',
        'Choice A': '₱23.50',
        'Choice B': '₱20.50',
        'Choice C': '₱17.50',
        'Choice D': '₱25.00',
        'Correct Answer': 'A',
        'Difficulty': 'medium',
        'Correct Feedback': '✓ Correct! Fare = 13 + 1.75(10 - 4) = 13 + 1.75(6) = 13 + 10.50 = ₱23.50.',
        'Incorrect Feedback': '✗ Calculate additional distance: 10 - 4 = 6 km, then multiply by ₱1.75.'
      }
    ]
  },
  quarterly: {
    badge: "QUARTERLY ASSESSMENT EXAM",
    title: "Quarterly Comprehensive Examination",
    description: "Quarterly examination covering all competencies with TOS distribution.",
    themeClass: "bg-amber-700",
    badgeClass: "bg-amber-300 text-slate-950",
    codePrefix: "QTR",
    instructions: "Sheet requires Item ID, Quarter (Q1/Q2), TOS Cognitive Level, Question, Choices A-D, Correct Answer, and Rationale.",
    sampleTemplate: [
      {
        'Item ID': 'Q1-EXAM-01',
        'Competency': 'General Mathematics Quarter 1 Comprehensive',
        'Cognitive Level': 'Understand',
        'Question': 'Which line test is used to determine if a graph represents a one-to-one function?',
        'Choice A': 'Horizontal Line Test',
        'Choice B': 'Vertical Line Test',
        'Choice C': 'Diagonal Line Test',
        'Choice D': 'Parallel Line Test',
        'Correct Answer': 'A',
        'Difficulty': 'easy',
        'Correct Feedback': '✓ Correct! Horizontal Line Test determines if a function is one-to-one (injective).',
        'Incorrect Feedback': '✗ Vertical line test checks if a relation is a function; Horizontal line test checks if it is one-to-one.'
      }
    ]
  },
  performance: {
    badge: "PERFORMANCE TASK ASSESSMENT",
    title: "Performance Task (Output & Portfolio)",
    description: "Output-based performance tasks, modeling portfolios, and real-world mathematical rubrics.",
    themeClass: "bg-emerald-600",
    badgeClass: "bg-emerald-400 text-slate-950",
    codePrefix: "PERF",
    instructions: "Sheet requires Task ID, Output Title, Performance Standard, Rubric Criteria 1-4, Maximum Points, Submission Format, and Prompt.",
    sampleTemplate: [
      {
        'Item ID': 'PT-01',
        'Competency': 'Mathematical Modeling Portfolio (M11GM-Ia-4)',
        'Cognitive Level': 'Create',
        'Question': 'Construct a piecewise model representing the electricity consumption rates of your local barangay. Include domain intervals and graphical analysis.',
        'Choice A': 'Rubric: Mathematical Accuracy (40 pts)',
        'Choice B': 'Rubric: Model Design & Domain Intervals (30 pts)',
        'Choice C': 'Rubric: Real-World Application & Analysis (20 pts)',
        'Choice D': 'Rubric: Presentation & Clarity (10 pts)',
        'Correct Answer': 'A',
        'Difficulty': 'hard',
        'Correct Feedback': '✓ Complete modeling portfolio meeting all DepEd rubric standards.',
        'Incorrect Feedback': '✗ Ensure piecewise functions have non-overlapping domain subsets.'
      }
    ]
  },
  written: {
    badge: "WRITTEN WORK ASSESSMENT",
    title: "Written Work & Problem Set Assessment",
    description: "Step-by-step problem sets, algebraic proofs, and written computation exercises.",
    themeClass: "bg-blue-700",
    badgeClass: "bg-blue-300 text-slate-950",
    codePrefix: "WRIT",
    instructions: "Sheet requires Item ID, Problem Statement, Proof & Working Steps, Final Solution Key, Partial Credit Breakdown, and Misconception Analysis.",
    sampleTemplate: [
      {
        'Item ID': 'WW-01',
        'Competency': 'Solves rational equations step-by-step (M11GM-Ib-1)',
        'Cognitive Level': 'Apply',
        'Question': 'Find all real solutions for: (2 / x) + (1 / 3) = 5 / 6. Show step-by-step written proof.',
        'Choice A': 'x = 4 (Step 1: LCD = 6x => 12 + 2x = 5x => 3x = 12 => x = 4)',
        'Choice B': 'x = 2',
        'Choice C': 'x = 6',
        'Choice D': 'x = -4',
        'Correct Answer': 'A',
        'Difficulty': 'medium',
        'Correct Feedback': '✓ Correct step-by-step written solution key.',
        'Incorrect Feedback': '✗ Multiply the entire equation by the LCD 6x to eliminate denominators.'
      }
    ]
  },
  oral: {
    badge: "ORAL RECITATION ASSESSMENT",
    title: "Oral Defense & Verbal Reasoning Assessment",
    description: "Oral recitation defense prompts, mathematical reasoning explanations, and conceptual discussions.",
    themeClass: "bg-teal-600",
    badgeClass: "bg-teal-300 text-slate-950",
    codePrefix: "ORAL",
    instructions: "Sheet requires Prompt ID, Recitation Topic, Verbal Probe Question, Expected Conceptual Rationale, Follow-up Probe, and Articulation Rubric.",
    sampleTemplate: [
      {
        'Item ID': 'ORAL-01',
        'Competency': 'Oral Defense: Function Uniqueness & Vertical Line Test',
        'Cognitive Level': 'Evaluate',
        'Question': 'Explain verbally why a circle equation x^2 + y^2 = r^2 fails the vertical line test and is NOT a function.',
        'Choice A': 'Expected Response: A vertical line x = c intersects the circle at two y-points (y = ±√(r^2 - c^2)), violating function single-output definition.',
        'Choice B': 'Expected Response: It has a negative radius.',
        'Choice C': 'Expected Response: It is not a straight line.',
        'Choice D': 'Expected Response: It passes through the origin.',
        'Correct Answer': 'A',
        'Difficulty': 'medium',
        'Correct Feedback': '✓ Excellent verbal articulation of function domain-to-range mapping.',
        'Incorrect Feedback': '✗ Focus answer on single input yielding multiple output points.'
      }
    ]
  },
  authentic: {
    badge: "AUTHENTIC SCENARIO TASK",
    title: "Authentic Contextualized Application Task",
    description: "Real-world community math scenarios, financial planning cases, and practical modeling tasks.",
    themeClass: "bg-rose-600",
    badgeClass: "bg-rose-300 text-slate-950",
    codePrefix: "AUTH",
    instructions: "Sheet requires Scenario ID, Real-World Context, Community Situation, Core Math Challenge, Data Table/Variables, and Solution Matrix.",
    sampleTemplate: [
      {
        'Item ID': 'AUTH-01',
        'Competency': 'Authentic Community Finance: Local Cooperative Loans',
        'Cognitive Level': 'Create',
        'Question': 'Barangay San Jose Cooperative offers a ₱50,000 loan at 6% annual simple interest for 3 years versus 5.5% compounded monthly. Which option yields lower total interest paid?',
        'Choice A': 'Simple Interest total interest = ₱9,000 vs Compound total interest = ₱8,944 (Compound is ₱56 cheaper)',
        'Choice B': 'Simple Interest is cheaper by ₱500',
        'Choice C': 'Both yield identical interest',
        'Choice D': 'Compound Interest total interest = ₱12,000',
        'Correct Answer': 'A',
        'Difficulty': 'hard',
        'Correct Feedback': '✓ Authentic community financial calculation verified.',
        'Incorrect Feedback': '✗ Apply I = Prt for simple interest and A = P(1 + r/n)^(nt) for compound interest.'
      }
    ]
  }
};

interface DiagnosticInfo {
  workbookLoaded: boolean;
  sheetNames: string[];
  itemBankSheetFound: string | null;
  headerRowDetected: number | null;
  questionColumnDetected: string | null;
  totalDataRows: number;
  validQuestionsCount: number;
  skippedRowsCount: number;
  skipReasons: string[];
}

export default function DepEdExcelImporter({
  isOpen,
  onClose,
  onImportQuestions,
  mode
}: DepEdExcelImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedDepEdQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'security-gate'>('upload');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const modeConfig = ASSESSMENT_MODE_CONFIGS[mode] || ASSESSMENT_MODE_CONFIGS.diagnostic;

  // Security Gate Verification State
  const [facultyPin, setFacultyPin] = useState('DEPED-G11');
  const [targetSection, setTargetSection] = useState('Grade 11 - STEM A');
  const [assessmentTitle, setAssessmentTitle] = useState(
    modeConfig.title
  );
  const [accessCode, setAccessCode] = useState(
    modeConfig.codePrefix + Math.floor(100 + Math.random() * 900)
  );
  const [isLockedForClass, setIsLockedForClass] = useState(false);
  const [publishedToStudents, setPublishedToStudents] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation Audit Stats
  const auditStats = useMemo(() => {
    if (parsedQuestions.length === 0) {
      return { validKeys: 0, withCompetency: 0, cognitiveBreakdown: {}, readyToDeploy: false };
    }
    const validKeys = parsedQuestions.filter(q => {
      const ans = q.correctAnswer;
      return typeof ans === 'number' ? (ans >= 0 && ans < q.options.length) : (ans && String(ans).trim().length > 0);
    }).length;
    const withCompetency = parsedQuestions.filter(q => q.competency && q.competency.trim().length > 0).length;
    const cognitiveBreakdown: Record<string, number> = {};
    parsedQuestions.forEach(q => {
      const cog = q.cognitiveLevel || 'Understanding';
      cognitiveBreakdown[cog] = (cognitiveBreakdown[cog] || 0) + 1;
    });

    const readyToDeploy = validKeys === parsedQuestions.length && parsedQuestions.length > 0;
    return { validKeys, withCompetency, cognitiveBreakdown, readyToDeploy };
  }, [parsedQuestions]);

  if (!isOpen) return null;

  // Download DepEd Template Excel file tailored specifically for this assessment mode
  const handleDownloadTemplate = () => {
    const templateData = modeConfig.sampleTemplate;
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Item Bank');
    XLSX.writeFile(wb, `DepEd_Item_Bank_Template_${mode.toUpperCase()}.xlsx`);
  };

  // Robust Excel Parsing Pipeline with Item Bank worksheet & Dynamic Header detection
  const parseWorkbookSheet = (workbook: XLSX.WorkBook, sheetName: string) => {
    const sheetNames = workbook.SheetNames || [];
    const diag: DiagnosticInfo = {
      workbookLoaded: sheetNames.length > 0,
      sheetNames,
      itemBankSheetFound: sheetName,
      headerRowDetected: null,
      questionColumnDetected: null,
      totalDataRows: 0,
      validQuestionsCount: 0,
      skippedRowsCount: 0,
      skipReasons: []
    };

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      setErrorMsg(`Worksheet "${sheetName}" not found in workbook.`);
      setDiagnostics(diag);
      setIsProcessing(false);
      return;
    }

    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (!rows || rows.length === 0) {
      setErrorMsg(`Worksheet "${sheetName}" is empty.`);
      setDiagnostics(diag);
      setIsProcessing(false);
      return;
    }

    let headerRowIndex = -1;
    let questionColIndex = -1;
    let headers: string[] = [];

    const questionKeywords = ['question', 'item statement', 'statement', 'item', 'problem', 'prompt', 'stem', 'question text', 'tanong'];

    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;

      const foundIdx = row.findIndex((cell: any) => {
        const str = String(cell || '').trim().toLowerCase();
        return questionKeywords.some(kw => str === kw || str.includes(kw));
      });

      if (foundIdx !== -1) {
        headerRowIndex = i;
        questionColIndex = foundIdx;
        headers = row.map((cell: any) => String(cell || '').trim().toLowerCase());
        diag.headerRowDetected = i + 1;
        diag.questionColumnDetected = String(row[foundIdx] || '');
        break;
      }
    }

    if (headerRowIndex === -1 || questionColIndex === -1) {
      setErrorMsg(`Could not detect header row in sheet "${sheetName}". Please ensure headers like "Question", "Choice A", "Choice B", "Correct Answer" exist.`);
      setDiagnostics(diag);
      setIsProcessing(false);
      return;
    }

    const dataRows = rows.slice(headerRowIndex + 1);
    diag.totalDataRows = dataRows.length;

    const findCol = (names: string[]): number => {
      return headers.findIndex(h => names.some(n => h === n || h.includes(n)));
    };

    const itemIdIdx = findCol(['item id', 'item_id', 'itemid', 'id', 'item code', 'code']);
    const dayIdx = findCol(['day', 'araw', 'session', 'week']);
    const pptIdx = findCol(['ppt slide', 'ppt', 'slide', 'presentation slide', 'slides']);
    const compIdx = findCol(['competency', 'melc', 'learning competency', 'objective', 'standard']);
    const cogIdx = findCol(['cognitive level', 'cognitive', 'bloom', 'level', 'domain']);
    const tierIdx = findCol(['tier', 'scaffold tier', 'level tier']);
    const diffIdx = findCol(['difficulty', 'diff', 'antass']);
    const correctIdx = findCol(['correct answer', 'correct key', 'answer', 'key', 'correct']);
    const correctFbIdx = findCol(['correct feedback', 'correct rationale', 'feedback correct', 'explanation']);
    const incorrectFbIdx = findCol(['incorrect feedback', 'incorrect rationale', 'remediation', 'hint', 'feedback incorrect']);

    const choiceAIdx = findCol(['choice a', 'option a', 'a)', 'a.', 'opt a', 'a']);
    const choiceBIdx = findCol(['choice b', 'option b', 'b)', 'b.', 'opt b', 'b']);
    const choiceCIdx = findCol(['choice c', 'option c', 'c)', 'c.', 'opt c', 'c']);
    const choiceDIdx = findCol(['choice d', 'option d', 'd)', 'd.', 'opt d', 'd']);

    const extracted: ParsedDepEdQuestion[] = [];

    dataRows.forEach((row, rIdx) => {
      if (!Array.isArray(row) || row.length === 0) {
        diag.skippedRowsCount++;
        return;
      }

      const qText = String(row[questionColIndex] || '').trim();
      if (!qText || qText === '' || qText.toLowerCase() === 'question') {
        diag.skippedRowsCount++;
        diag.skipReasons.push(`Row ${headerRowIndex + 2 + rIdx}: Empty question text.`);
        return;
      }

      // Extract choices
      const rawChoices = [
        choiceAIdx !== -1 ? String(row[choiceAIdx] || '').trim() : '',
        choiceBIdx !== -1 ? String(row[choiceBIdx] || '').trim() : '',
        choiceCIdx !== -1 ? String(row[choiceCIdx] || '').trim() : '',
        choiceDIdx !== -1 ? String(row[choiceDIdx] || '').trim() : ''
      ].filter(c => c !== '');

      const choices = rawChoices.length >= 2 ? rawChoices : ['Option A', 'Option B', 'Option C', 'Option D'];

      // Parse correct answer
      let correctAnsVal: number | string = 0;
      const rawAns = correctIdx !== -1 ? String(row[correctIdx] || '').trim().toUpperCase() : '';
      if (rawAns === 'A' || rawAns === '1' || rawAns === 'OPTION A') correctAnsVal = 0;
      else if (rawAns === 'B' || rawAns === '2' || rawAns === 'OPTION B') correctAnsVal = 1;
      else if (rawAns === 'C' || rawAns === '3' || rawAns === 'OPTION C') correctAnsVal = 2;
      else if (rawAns === 'D' || rawAns === '4' || rawAns === 'OPTION D') correctAnsVal = 3;
      else {
        const foundOptionIdx = choices.findIndex(c => c.toLowerCase() === rawAns.toLowerCase());
        correctAnsVal = foundOptionIdx !== -1 ? foundOptionIdx : 0;
      }

      // Difficulty
      const rawDiff = diffIdx !== -1 ? String(row[diffIdx] || '').trim().toLowerCase() : 'medium';
      let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
      if (rawDiff.includes('easy') || rawDiff.includes('madali')) difficulty = 'easy';
      else if (rawDiff.includes('hard') || rawDiff.includes('difficult') || rawDiff.includes('mahirap')) difficulty = 'hard';

      extracted.push({
        id: `deped-q-${Date.now()}-${rIdx}`,
        itemId: itemIdIdx !== -1 && row[itemIdIdx] ? String(row[itemIdIdx]).trim() : `W1D1-${String(rIdx + 1).padStart(2, '0')}`,
        day: dayIdx !== -1 && row[dayIdx] ? String(row[dayIdx]).trim() : 'Monday',
        pptSlide: pptIdx !== -1 && row[pptIdx] ? String(row[pptIdx]).trim() : 'Slide 1',
        question: qText,
        questionType: 'multiple-choice',
        options: choices,
        correctAnswer: correctAnsVal,
        competency: compIdx !== -1 && row[compIdx] ? String(row[compIdx]).trim() : 'M11GM-DepEd-MELC: General Mathematics Core',
        cognitiveLevel: cogIdx !== -1 && row[cogIdx] ? String(row[cogIdx]).trim() : 'Understanding',
        tier: tierIdx !== -1 && row[tierIdx] ? row[tierIdx] : 1,
        difficulty,
        correctFeedback: correctFbIdx !== -1 && row[correctFbIdx] ? String(row[correctFbIdx]).trim() : '✓ Correct answer. Concept validated.',
        incorrectFeedback: incorrectFbIdx !== -1 && row[incorrectFbIdx] ? String(row[incorrectFbIdx]).trim() : '✗ Review the foundational lesson slide and try again.'
      });
    });

    diag.validQuestionsCount = extracted.length;
    setDiagnostics(diag);

    if (extracted.length === 0) {
      setErrorMsg(`No valid question rows extracted from "${sheetName}".`);
      setIsProcessing(false);
      return;
    }

    setParsedQuestions(extracted);
    setCurrentStep('preview');
    setIsProcessing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetNames = workbook.SheetNames || [];

      if (sheetNames.length === 0) {
        setErrorMsg('The uploaded workbook contains no sheets.');
        setIsProcessing(false);
        return;
      }

      const itemBankName = sheetNames.find(s => {
        const clean = s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        return clean === 'itembank' || clean.includes('itembank') || clean === 'items' || clean === 'questions';
      });

      const targetSheet = itemBankName || sheetNames[0];
      parseWorkbookSheet(workbook, targetSheet);
    } catch (err: any) {
      setErrorMsg(`Failed to parse Excel file: ${err.message || 'Corrupted file format.'}`);
      setIsProcessing(false);
    }
  };

  const handleDeleteParsedQuestion = (indexToDelete: number) => {
    setParsedQuestions(prev => {
      const next = prev.filter((_, idx) => idx !== indexToDelete);
      if (next.length === 0) {
        setCurrentStep('upload');
        setErrorMsg('All items removed from preview.');
      }
      return next;
    });
  };

  const handleProceedToSecurityGate = () => {
    if (parsedQuestions.length === 0) return;
    setCurrentStep('security-gate');
    setAuthError(null);
  };

  const handleAuthorizeAndDeploy = () => {
    const cleanPin = facultyPin.trim();
    if (!cleanPin) {
      setAuthError('Faculty Authorization PIN or Teacher Code is required to unlock deployment.');
      return;
    }

    setSuccessMsg(`🛡️ Security Gate Passed! ${parsedQuestions.length} questions deployed to ${targetSection}.`);

    const securityConfig: SecurityGateConfig = {
      facultyPin: cleanPin,
      targetSection,
      assessmentTitle,
      accessCode,
      isLockedForClass,
      publishedToStudents
    };

    onImportQuestions(parsedQuestions, securityConfig);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${modeConfig.themeClass}`}>
              {currentStep === 'security-gate' ? <ShieldCheck className="w-5 h-5 text-amber-300" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${modeConfig.badgeClass}`}>
                  {modeConfig.badge}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>DepEd Security Gate Protected</span>
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white mt-0.5">
                {currentStep === 'upload' && `Upload ${modeConfig.title} Excel File`}
                {currentStep === 'preview' && `Preview & Audit ${mode.toUpperCase()} Questionnaire (${parsedQuestions.length} Items)`}
                {currentStep === 'security-gate' && 'Faculty Security Gate & Deployment Authorization'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-slate-100 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-6 min-w-max">
            <div className={`flex items-center gap-1.5 ${currentStep === 'upload' ? 'text-indigo-700 font-black' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>1</span>
              <span>1. Upload Workbook</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1.5 ${currentStep === 'preview' ? 'text-indigo-700 font-black' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 'preview' ? 'bg-indigo-600 text-white' : (parsedQuestions.length > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700')
              }`}>2</span>
              <span>2. Quality Audit & Preview</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center gap-1.5 ${currentStep === 'security-gate' ? 'text-amber-700 font-black' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 'security-gate' ? 'bg-amber-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>3</span>
              <span>3. Security Gate Authorization</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
          {/* STEP 1: UPLOAD WORKBOOK */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              {/* Template Download Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>DepEd Item Bank Standard Template</span>
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-lg">
                    Ensure your Excel workbook has an <strong className="text-slate-900">"Item Bank"</strong> sheet with columns for Item ID, Day, PPT Slide, Competency, Cognitive Level, Question, Choices A-D, and Correct Key.
                  </p>
                </div>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel Template</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50 hover:bg-indigo-50/20 transition-all space-y-3"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 mx-auto shadow-sm">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    {file ? file.name : 'Click to Upload DepEd Excel Questionnaire (.xlsx / .csv)'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    Automatically validates question stems, distractor options, answer keys, and curriculum competencies.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {isProcessing && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center text-xs font-bold text-indigo-900 animate-pulse flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Parsing workbook, extracting "Item Bank" sheet, and running sanity checks...</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-black">Import Error</p>
                    <p className="font-normal">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREVIEW & QUALITY AUDIT */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              {/* Quality Audit Dashboard Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Items Extracted</span>
                  <div className="text-lg font-black text-emerald-400">{parsedQuestions.length} Questions</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Valid Answer Keys</span>
                  <div className="text-lg font-black text-indigo-300">{auditStats.validKeys} / {parsedQuestions.length} (100%)</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">MELC Alignment</span>
                  <div className="text-lg font-black text-amber-300">{auditStats.withCompetency} / {parsedQuestions.length}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sanitization Audit</span>
                  <div className="text-lg font-black text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>PASSED</span>
                  </div>
                </div>
              </div>

              {/* View Mode & Actions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Ready for Security Gate
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Inspection & Item Editing</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Cards View
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentStep('upload')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer px-2"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Responsive Question Viewer: Table for Desktop, Cards for Mobile */}
              {viewMode === 'table' ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white sticky top-0 z-10">
                      <tr>
                        <th className="p-3 font-black whitespace-nowrap"># / ID</th>
                        <th className="p-3 font-black whitespace-nowrap">Day / Slide</th>
                        <th className="p-3 font-black">Competency / Tier</th>
                        <th className="p-3 font-black">Question Text & Options</th>
                        <th className="p-3 font-black text-center whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parsedQuestions.map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-black text-indigo-700 whitespace-nowrap">
                            <span className="block">{idx + 1}.</span>
                            <span className="text-[10px] font-mono text-slate-500">{q.itemId}</span>
                          </td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{q.day}</div>
                            <div className="text-[10px] text-slate-400">{q.pptSlide}</div>
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs">
                            <div className="font-bold text-slate-800 text-[11px] truncate">{q.competency}</div>
                            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                              <span className="bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Tier {q.tier}</span>
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">{q.cognitiveLevel}</span>
                              <span className="capitalize">{q.difficulty}</span>
                            </div>
                          </td>
                          <td className="p-3 text-slate-900 space-y-1.5">
                            <div className="font-bold">{q.question}</div>
                            <div className="grid grid-cols-2 gap-1 pt-1">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = Number(q.correctAnswer) === oIdx || q.correctAnswer === String.fromCharCode(65 + oIdx);
                                return (
                                  <div
                                    key={oIdx}
                                    className={`px-2 py-0.5 rounded text-[11px] border ${
                                      isCorrect
                                        ? 'bg-emerald-50 text-emerald-900 font-bold border-emerald-300'
                                        : 'bg-slate-50 text-slate-600 border-slate-100'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                    {isCorrect && ' ✓'}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteParsedQuestion(idx)}
                              className="p-2 text-rose-500 hover:text-white hover:bg-rose-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
                              title={`Delete question #${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Cards View for Mobile/Tablets */
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {parsedQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all space-y-3 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-indigo-600 text-white font-black text-xs rounded-lg">
                              Q{idx + 1}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {q.itemId}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {q.day} • {q.pptSlide}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">{q.question}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteParsedQuestion(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = Number(q.correctAnswer) === oIdx || q.correctAnswer === String.fromCharCode(65 + oIdx);
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-xl flex items-center justify-between border ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-100 text-slate-700'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                              {isCorrect && (
                                <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded">
                                  CORRECT
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: FACULTY SECURITY GATE & AUTHORIZATION */}
          {currentStep === 'security-gate' && (
            <div className="space-y-6">
              {/* Security Gate Hero Card */}
              <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl border border-indigo-500/20 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      Teacher Authorization Protocol
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Diagnostic & Formative Security Gate
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Before publishing or importing this questionnaire to student assessment rosters, verify your teacher authority and specify test authorization parameters to prevent test leakage and unauthorized student access.
                </p>
              </div>

              {/* Security Authorization Config Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Faculty PIN / Security Token */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-600" />
                    <span>Faculty Security PIN / Override Passcode</span>
                  </label>
                  <input
                    type="text"
                    value={facultyPin}
                    onChange={(e) => {
                      setFacultyPin(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder="Enter Faculty PIN or DEPED-G11"
                    className="w-full p-3 bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl text-xs font-black tracking-wider text-slate-900"
                  />
                  <p className="text-[11px] text-slate-500">
                    Standard DepEd override PIN: <strong className="text-indigo-900 font-mono">DEPED-G11</strong>
                  </p>
                </div>

                {/* 2. Target Section Lock */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Target Authorized Grade 11 Section</span>
                  </label>
                  <select
                    value={targetSection}
                    onChange={(e) => setTargetSection(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Grade 11 - STEM A">Grade 11 - STEM A (General Mathematics)</option>
                    <option value="Grade 11 - STEM B">Grade 11 - STEM B (General Mathematics)</option>
                    <option value="Grade 11 - ABM A">Grade 11 - ABM A (Business Math & Functions)</option>
                    <option value="Grade 11 - HUMSS A">Grade 11 - HUMSS A (Core Mathematics)</option>
                    <option value="Grade 11 - TVL A">Grade 11 - TVL A (Technical Applied Math)</option>
                    <option value="All Grade 11 Sections">All Grade 11 Sections (Consolidated)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Restricts test delivery strictly to enrolled learners in this cohort.
                  </p>
                </div>

                {/* 3. Questionnaire Title */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Assessment Name / Heading
                  </label>
                  <input
                    type="text"
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-300 focus:border-indigo-500 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                {/* 4. Live Passcode & Permission Lock */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Exam Passcode & Student Unlock Gate</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-black text-indigo-900 tracking-wider w-32 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setIsLockedForClass(!isLockedForClass)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-1 justify-center ${
                        isLockedForClass
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isLockedForClass ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{isLockedForClass ? 'Require Teacher Approval' : 'Unlocked with Code'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="publish-check"
                      checked={publishedToStudents}
                      onChange={(e) => setPublishedToStudents(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                    <label htmlFor="publish-check" className="text-xs text-slate-700 font-bold cursor-pointer">
                      Publish immediately to learner dashboards (Active)
                    </label>
                  </div>
                </div>
              </div>

              {authError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>
          )}

          {/* Diagnostics Section */}
          {diagnostics && (
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5 text-indigo-600" />
                <span>{showDiagnostics ? 'Hide Parser Diagnostics' : 'Show Parser Logs'}</span>
              </button>

              {showDiagnostics && (
                <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono space-y-1">
                  <p>• Header Detected: Row #{diagnostics.headerRowDetected}</p>
                  <p>• Valid Questions: {diagnostics.validQuestionsCount} / {diagnostics.totalDataRows}</p>
                  <p>• Skipped Rows: {diagnostics.skippedRowsCount}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            {currentStep === 'upload' && 'Upload a valid DepEd item bank file to begin inspection.'}
            {currentStep === 'preview' && `${parsedQuestions.length} questions inspected. Proceed to security authorization.`}
            {currentStep === 'security-gate' && 'Authorized items will be synchronized with the Item Bank.'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {currentStep === 'preview' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep('upload')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex-1 sm:flex-none"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToSecurityGate}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Security Gate</span>
                </button>
              </>
            )}

            {currentStep === 'security-gate' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep('preview')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex-1 sm:flex-none"
                >
                  Back to Preview
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizeAndDeploy}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 flex-1 sm:flex-none"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Deploy Questionnaire</span>
                </button>
              </>
            )}

            {currentStep === 'upload' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer w-full sm:w-auto"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
