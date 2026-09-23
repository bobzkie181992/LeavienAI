import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Sparkles,
  HelpCircle,
  Table,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';

export interface ParsedDepEdQuestion {
  id: string;
  question: string;
  questionType: 'multiple-choice' | 'short-answer' | 'true-false';
  options: string[];
  correctAnswer: number | string;
  competency: string;
  difficulty: 'easy' | 'medium' | 'hard';
  correctFeedback: string;
  incorrectFeedback: string;
}

interface DepEdExcelImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: ParsedDepEdQuestion[]) => void;
  mode: 'diagnostic' | 'formative';
}

const SAMPLE_DEPED_QUESTIONS = [
  {
    'Question': 'Which of the following relations represents a function?',
    'Question Type': 'multiple-choice',
    'Option A': '{(1, 2), (2, 3), (3, 4)}',
    'Option B': '{(1, 5), (1, 6), (2, 7)}',
    'Option C': '{(0, 0), (0, 1), (0, 2)}',
    'Option D': '{(3, 1), (3, 2), (4, 5)}',
    'Correct Answer': 'A',
    'Learning Competency': 'M11GM-Ia-1: Represents real-life situations using functions',
    'Difficulty': 'easy',
    'Correct Feedback': '✓ Correct! Each domain value is paired with exactly one range value.',
    'Incorrect Feedback': '✗ Remember: A relation is NOT a function if an x-value repeats with different y-values.'
  },
  {
    'Question': 'Evaluate f(3) if f(x) = 2x + 1.',
    'Question Type': 'multiple-choice',
    'Option A': '5',
    'Option B': '6',
    'Option C': '7',
    'Option D': '8',
    'Correct Answer': 'C',
    'Learning Competency': 'M11GM-Ia-2: Evaluates functions accurately',
    'Difficulty': 'medium',
    'Correct Feedback': '✓ Correct! f(3) = 2(3) + 1 = 6 + 1 = 7.',
    'Incorrect Feedback': '✗ Review function evaluation by substituting x = 3 into f(x) = 2x + 1.'
  },
  {
    'Question': 'Given f(x) = x + 3 and g(x) = 2x, find (f + g)(x).',
    'Question Type': 'multiple-choice',
    'Option A': '3x + 3',
    'Option B': '2x + 3',
    'Option C': '3x + 6',
    'Option D': 'x + 6',
    'Correct Answer': 'A',
    'Learning Competency': 'M11GM-Ia-3: Performs addition and composition of functions',
    'Difficulty': 'medium',
    'Correct Feedback': '✓ Correct! (f + g)(x) = (x + 3) + (2x) = 3x + 3.',
    'Incorrect Feedback': '✗ Combine like terms: x + 2x = 3x, then add the constant 3.'
  }
];

export default function DepEdExcelImporter({
  isOpen,
  onClose,
  onImportQuestions,
  mode
}: DepEdExcelImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedDepEdQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download DepEd Template Excel file
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_DEPED_QUESTIONS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DepEd_Questions');
    XLSX.writeFile(wb, `DepEd_${mode.toUpperCase()}_Assessment_Questions_Template.xlsx`);
  };

  // Parse Excel or CSV File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMsg(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('The uploaded file contains no row data. Please use the DepEd Excel Template format.');
          setIsProcessing(false);
          return;
        }

        const extracted: ParsedDepEdQuestion[] = rawJson.map((row, idx) => {
          // Flexible Header Normalization
          const questionText = row['Question'] || row['question'] || row['Item'] || row['Item Statement'] || `DepEd Question #${idx + 1}`;
          const qType = (row['Question Type'] || row['Type'] || 'multiple-choice').toString().toLowerCase().includes('short') ? 'short-answer' : 'multiple-choice';
          
          const optA = row['Option A'] || row['Option 1'] || row['A'] || '';
          const optB = row['Option B'] || row['Option 2'] || row['B'] || '';
          const optC = row['Option C'] || row['Option 3'] || row['C'] || '';
          const optD = row['Option D'] || row['Option 4'] || row['D'] || '';

          const options = [optA, optB, optC, optD].filter(o => o !== '').map(String);
          if (options.length === 0) {
            options.push('Option A', 'Option B', 'Option C', 'Option D');
          }

          // Parse correct answer (could be "A", "B", "C", "D" or index 0..3 or exact answer text)
          let rawAns = (row['Correct Answer'] || row['Answer'] || row['Key'] || '0').toString().trim().toUpperCase();
          let correctAnswerIdx = 0;

          if (rawAns === 'A' || rawAns === '1' || rawAns === 'OPTION A') correctAnswerIdx = 0;
          else if (rawAns === 'B' || rawAns === '2' || rawAns === 'OPTION B') correctAnswerIdx = 1;
          else if (rawAns === 'C' || rawAns === '3' || rawAns === 'OPTION C') correctAnswerIdx = 2;
          else if (rawAns === 'D' || rawAns === '4' || rawAns === 'OPTION D') correctAnswerIdx = 3;
          else {
            const numVal = parseInt(rawAns, 10);
            if (!isNaN(numVal) && numVal >= 0 && numVal < options.length) {
              correctAnswerIdx = numVal;
            } else {
              // try to match text
              const foundIdx = options.findIndex(o => o.trim().toLowerCase() === rawAns.toLowerCase());
              if (foundIdx !== -1) correctAnswerIdx = foundIdx;
            }
          }

          const competency = row['Learning Competency'] || row['Competency'] || row['MELC Code'] || 'M11GM-DepEd-MELC';
          const difficulty = (row['Difficulty'] || 'medium').toString().toLowerCase() as 'easy' | 'medium' | 'hard';
          const correctFeedback = row['Correct Feedback'] || row['Explanation'] || `✓ Correct! Well done.`;
          const incorrectFeedback = row['Incorrect Feedback'] || row['Remediation'] || `✗ Review the concept in the ILAW lesson discussion.`;

          return {
            id: `excel-q-${Date.now()}-${idx}`,
            question: questionText,
            questionType: qType,
            options,
            correctAnswer: correctAnswerIdx,
            competency,
            difficulty,
            correctFeedback,
            incorrectFeedback
          };
        });

        setParsedQuestions(extracted);
        setIsProcessing(false);
      } catch (err: any) {
        setErrorMsg(`Failed to parse Excel file: ${err.message || 'Invalid format'}`);
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleConfirmImport = () => {
    if (parsedQuestions.length > 0) {
      onImportQuestions(parsedQuestions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3" />
                <span>DepEd Question Importer</span>
              </span>
              <span className="bg-white/20 text-emerald-100 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                {mode.toUpperCase()} MODE
              </span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              UPLOAD DEPED EXCEL QUESTIONS
            </h2>
            <p className="text-xs text-emerald-200">
              Bulk import DepEd-format test items from Excel spreadsheets (.xlsx, .xls, .csv).
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Action Row: Download Template & File Drag Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Step 1: Download Official Template */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>1. Download DepEd Template</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download the standardized DepEd Excel sheet structure with pre-formatted column headers for Questions, Options (A-D), Correct Answer, Competency, and Feedback.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download DepEd Excel Template (.xlsx)</span>
              </button>
            </div>

            {/* Step 2: Upload Excel File */}
            <div className="p-5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-xs uppercase tracking-wider">
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span>2. Upload DepEd Excel File</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your completed DepEd assessment spreadsheet. The system will automatically parse and validate all questions.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{file ? file.name : 'Choose Excel or CSV File'}</span>
              </button>
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Reading and parsing DepEd Excel question sheet...</p>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-950">Excel Parsing Error</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    DepEd Excel Questions Detected ({parsedQuestions.length} Items)
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Ready to Import
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Question Statement</th>
                      <th className="p-3">Options</th>
                      <th className="p-3">Answer</th>
                      <th className="p-3">Competency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {parsedQuestions.map((q, idx) => (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-black text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{q.question}</td>
                        <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate">
                          {q.options.join(' | ')}
                        </td>
                        <td className="p-3 font-black text-emerald-700">
                          {q.options[q.correctAnswer as number] || `Option ${Number(q.correctAnswer) + 1}`}
                        </td>
                        <td className="p-3 text-[10px] text-indigo-700 font-bold max-w-xs truncate">
                          {q.competency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            disabled={parsedQuestions.length === 0}
            onClick={handleConfirmImport}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all ${
              parsedQuestions.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Import {parsedQuestions.length} DepEd Questions</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
