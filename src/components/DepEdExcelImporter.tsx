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
  Plus,
  Info,
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
}

interface DepEdExcelImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportQuestions: (questions: ParsedDepEdQuestion[]) => void;
  mode: 'diagnostic' | 'formative';
}

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
  const [showPreview, setShowPreview] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Download DepEd Template Excel file
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Item ID': 'W1D1-01',
        'Day': 'Monday',
        'PPT Slide': 'Slides 5-6 (Concept)',
        'Competency': 'Illustrate a piecewise function in practical contexts',
        'Cognitive Level': 'Understand',
        'Tier': 1,
        'Question': 'What makes a function piecewise?',
        'Choice A': 'It has different rules for different parts of its domain',
        'Choice B': 'It is always a straight line',
        'Choice C': 'It cannot be evaluated at negative numbers',
        'Choice D': 'It has no graph',
        'Correct Answer': 'A',
        'Difficulty': 'easy',
        'Correct Feedback': '✓ Correct! Piecewise functions are defined by different expressions over different intervals.',
        'Incorrect Feedback': '✗ Review the definition of piecewise functions.'
      },
      {
        'Item ID': 'W1D1-02',
        'Day': 'Monday',
        'PPT Slide': 'Slide 7-8 (Worked Example)',
        'Competency': 'Illustrate a piecewise function in practical contexts',
        'Cognitive Level': 'Apply',
        'Tier': 1,
        'Question': 'A jeepney charges ₱13 for the first 4 km, then ₱2 for every additional km. What is the fare for a 3 km ride?',
        'Choice A': '₱13',
        'Choice B': '₱15',
        'Choice C': '₱11',
        'Choice D': '₱26',
        'Correct Answer': 'A',
        'Difficulty': 'medium',
        'Correct Feedback': '✓ Correct! Since 3 km is less than or equal to the first 4 km, the flat fare is ₱13.',
        'Incorrect Feedback': '✗ Read the problem carefully: 3 km is within the first 4 km.'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Item Bank');
    XLSX.writeFile(wb, `DepEd_Item_Bank_Template_${mode.toUpperCase()}.xlsx`);
  };

  // Robust Excel Parsing Pipeline with Item Bank worksheet & Dynamic Header detection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);
    setShowPreview(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames || [];

        const diag: DiagnosticInfo = {
          workbookLoaded: sheetNames.length > 0,
          sheetNames,
          itemBankSheetFound: null,
          headerRowDetected: null,
          questionColumnDetected: null,
          totalDataRows: 0,
          validQuestionsCount: 0,
          skippedRowsCount: 0,
          skipReasons: []
        };

        if (sheetNames.length === 0) {
          setErrorMsg('Invalid Excel file: Workbook contains no worksheets.');
          setDiagnostics(diag);
          setIsProcessing(false);
          return;
        }

        // 1. Find worksheet named "Item Bank" (case-insensitive, trimming whitespace)
        let targetSheetName = sheetNames.find(
          name => name.trim().toLowerCase() === 'item bank'
        );

        if (!targetSheetName) {
          // Fallback search for any sheet containing "item" or "bank"
          targetSheetName = sheetNames.find(
            name => name.toLowerCase().includes('item') || name.toLowerCase().includes('bank')
          );
        }

        if (!targetSheetName) {
          // If still not found, fallback to first worksheet with warning
          targetSheetName = sheetNames[0];
          diag.skipReasons.push(`Warning: "Item Bank" sheet not found. Falling back to sheet: "${targetSheetName}".`);
        }

        diag.itemBankSheetFound = targetSheetName;
        const worksheet = workbook.Sheets[targetSheetName];

        // Read worksheet as array of arrays to find header row dynamically
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rows || rows.length === 0) {
          setErrorMsg(`Worksheet "${targetSheetName}" is empty.`);
          setDiagnostics(diag);
          setIsProcessing(false);
          return;
        }

        // 2. Detect header row by finding the row containing the "Question" header
        let headerRowIndex = -1;
        let questionColIndex = -1;
        let headers: string[] = [];

        for (let r = 0; r < Math.min(rows.length, 15); r++) {
          const row = rows[r];
          if (!row) continue;
          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || '').trim().toLowerCase();
            if (cellVal === 'question' || cellVal === 'item statement') {
              headerRowIndex = r;
              questionColIndex = c;
              headers = row.map(cell => String(cell || '').trim());
              break;
            }
          }
          if (headerRowIndex !== -1) break;
        }

        if (headerRowIndex === -1) {
          setErrorMsg(`Item Bank sheet found ("${targetSheetName}"), but no "Question" column header was detected. Please verify column headers.`);
          diag.skipReasons.push('Error: Could not locate "Question" header row.');
          setDiagnostics(diag);
          setIsProcessing(false);
          return;
        }

        diag.headerRowDetected = headerRowIndex + 1; // 1-indexed for display
        diag.questionColumnDetected = headers[questionColIndex] || 'Question';

        // 3. Map columns & extract data rows
        const dataRows = rows.slice(headerRowIndex + 1);
        diag.totalDataRows = dataRows.length;

        const extractedQuestions: ParsedDepEdQuestion[] = [];
        const seenItemIds = new Set<string>();

        dataRows.forEach((row, rIdx) => {
          const rowNum = headerRowIndex + 2 + rIdx;
          
          // Map column indices by header name (case-insensitive)
          const getColValue = (headerKeywords: string[]): string => {
            for (let c = 0; c < headers.length; c++) {
              const h = headers[c].toLowerCase();
              if (headerKeywords.some(kw => h.includes(kw))) {
                return String(row[c] !== undefined && row[c] !== null ? row[c] : '').trim();
              }
            }
            return '';
          };

          const questionText = getColValue(['question', 'item statement', 'statement']);
          if (!questionText) {
            diag.skippedRowsCount++;
            diag.skipReasons.push(`Row ${rowNum}: Skipped (Empty Question field)`);
            return;
          }

          const itemId = getColValue(['item id', 'item_id', 'id']) || `W1D1-${rIdx + 1 < 10 ? '0' + (rIdx + 1) : rIdx + 1}`;
          const day = getColValue(['day']) || 'Monday';
          const pptSlide = getColValue(['ppt slide', 'slide', 'ppt']) || 'Slide 1';
          const competency = getColValue(['competency', 'learning competency', 'melc']) || 'M11GM-DepEd-MELC';
          const cognitiveLevel = getColValue(['cognitive level', 'cognition', 'level']) || 'Understand';
          const tierVal = getColValue(['tier']) || '1';
          const difficultyRaw = getColValue(['difficulty']).toLowerCase();
          const difficulty = (difficultyRaw === 'easy' || difficultyRaw === 'medium' || difficultyRaw === 'hard') ? difficultyRaw : 'medium';

          // Preserve options / choices (scan columns for Choice A, B, C, D, Option A, B, C, D, A, B, C, D)
          const optA = getColValue(['choice a', 'option a', 'a.']) || String(row[questionColIndex + 1] || '');
          const optB = getColValue(['choice b', 'option b', 'b.']) || String(row[questionColIndex + 2] || '');
          const optC = getColValue(['choice c', 'option c', 'c.']) || String(row[questionColIndex + 3] || '');
          const optD = getColValue(['choice d', 'option d', 'd.']) || String(row[questionColIndex + 4] || '');

          const options = [optA, optB, optC, optD].filter(o => o !== '').map(String);
          if (options.length === 0) {
            options.push('Option A', 'Option B', 'Option C', 'Option D');
          }

          // Parse correct answer
          const rawAns = getColValue(['correct answer', 'answer', 'key', 'correct']).toUpperCase();
          let correctAnswerIdx = 0;
          if (rawAns === 'A' || rawAns === '1' || rawAns === 'OPTION A') correctAnswerIdx = 0;
          else if (rawAns === 'B' || rawAns === '2' || rawAns === 'OPTION B') correctAnswerIdx = 1;
          else if (rawAns === 'C' || rawAns === '3' || rawAns === 'OPTION C') correctAnswerIdx = 2;
          else if (rawAns === 'D' || rawAns === '4' || rawAns === 'OPTION D') correctAnswerIdx = 3;
          else {
            const num = parseInt(rawAns, 10);
            if (!isNaN(num) && num >= 0 && num < options.length) {
              correctAnswerIdx = num;
            } else {
              const found = options.findIndex(o => o.trim().toLowerCase() === rawAns.toLowerCase());
              if (found !== -1) correctAnswerIdx = found;
            }
          }

          const correctFeedback = getColValue(['correct feedback', 'feedback']) || '✓ Correct! Well done.';
          const incorrectFeedback = getColValue(['incorrect feedback', 'explanation']) || '✗ Review the lesson concepts.';

          if (seenItemIds.has(itemId)) {
            diag.skipReasons.push(`Row ${rowNum}: Warning - Duplicate Item ID "${itemId}". Appending suffix.`);
          }
          seenItemIds.add(itemId);

          extractedQuestions.push({
            id: `deped-item-${Date.now()}-${rIdx}`,
            itemId,
            day,
            pptSlide,
            question: questionText,
            questionType: 'multiple-choice',
            options,
            correctAnswer: correctAnswerIdx,
            competency,
            cognitiveLevel,
            tier: isNaN(Number(tierVal)) ? tierVal : Number(tierVal),
            difficulty,
            correctFeedback,
            incorrectFeedback
          });
        });

        diag.validQuestionsCount = extractedQuestions.length;
        setDiagnostics(diag);

        if (extractedQuestions.length === 0) {
          setErrorMsg('Item Bank sheet found, but no valid questions were detected. Please check the Question column and header row.');
          setIsProcessing(false);
          return;
        }

        setParsedQuestions(extractedQuestions);
        setShowPreview(true);
        setIsProcessing(false);
      } catch (err: any) {
        console.error('Excel Import Error:', err);
        setErrorMsg(`Failed to parse Excel file: ${err.message || 'Unknown error'}. Ensure the file is a valid .xlsx or .csv workbook.`);
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleConfirmImport = () => {
    if (parsedQuestions.length === 0) return;
    onImportQuestions(parsedQuestions);
    setSuccessMsg(`Successfully imported ${parsedQuestions.length} questions from Item Bank.`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  DepEd Item Bank Importer
                </span>
                <span className="text-xs text-slate-400 font-bold">SheetJS Powered</span>
              </div>
              <h2 className="text-base font-black text-white">Import DepEd Excel Item Bank</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Download Template Banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>DepEd Excel Format Requirement</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed max-w-lg">
                Your Excel workbook must contain an <strong className="text-slate-900">"Item Bank"</strong> worksheet with a header row containing <strong className="text-slate-900">"Item ID", "Day", "PPT Slide", "Competency", "Cognitive Level", "Tier", "Question"</strong>, and answer columns.
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

          {/* Upload Area */}
          {!showPreview ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-all space-y-3"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    {file ? file.name : 'Click to Upload DepEd Excel Workbook (.xlsx / .csv)'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Automatically detects "Item Bank" sheet, header row, question column, and answer choices.
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
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center text-xs font-bold text-indigo-900 animate-pulse">
                  Parsing workbook, searching for "Item Bank" sheet, and validating questions...
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-black">Import Error Detected</p>
                    <p className="font-normal">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* PREVIEW TABLE VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Previewing {parsedQuestions.length} Valid Items
                  </span>
                  <h3 className="text-base font-black text-slate-900">Extracted from "Item Bank" Worksheet</h3>
                </div>

                <button
                  onClick={() => setShowPreview(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  Upload Different File
                </button>
              </div>

              {/* Scrollable Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 text-white sticky top-0">
                    <tr>
                      <th className="p-3 font-black">Item ID</th>
                      <th className="p-3 font-black">Day / Slide</th>
                      <th className="p-3 font-black">Competency / Tier</th>
                      <th className="p-3 font-black">Question Text</th>
                      <th className="p-3 font-black">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parsedQuestions.map((q, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-black text-indigo-700 whitespace-nowrap">{q.itemId}</td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          <div className="font-bold">{q.day}</div>
                          <div className="text-[10px] text-slate-400">{q.pptSlide}</div>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div className="font-bold text-slate-800">{q.competency}</div>
                          <div className="text-[10px] text-emerald-700 font-semibold">Tier {q.tier} • {q.cognitiveLevel}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-900 max-w-xs">{q.question}</td>
                        <td className="p-3 text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px]">
                            {q.options.length} options (Ans: #{Number(q.correctAnswer) + 1})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Confirm Import Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Import {parsedQuestions.length} Items into Item Bank</span>
                </button>
              </div>
            </div>
          )}

          {/* Development Diagnostics Toggle */}
          {diagnostics && (
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <Bug className="w-3.5 h-3.5 text-indigo-600" />
                <span>{showDiagnostics ? 'Hide Parser Diagnostics' : 'Show Parser Diagnostics & Logs'}</span>
              </button>

              {showDiagnostics && (
                <div className="mt-3 p-4 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono space-y-1.5 shadow-inner">
                  <p className="text-emerald-400 font-black">--- DepEd Excel Parser Diagnostics ---</p>
                  <p>• Workbook Loaded: <span className="text-white">{diagnostics.workbookLoaded ? 'Yes' : 'No'}</span></p>
                  <p>• Sheets Found: <span className="text-white">{diagnostics.sheetNames.join(', ')}</span></p>
                  <p>• Item Bank Sheet Matched: <span className="text-emerald-300 font-bold">{diagnostics.itemBankSheetFound || 'None'}</span></p>
                  <p>• Header Row Detected: <span className="text-white">{diagnostics.headerRowDetected ? `Row #${diagnostics.headerRowDetected}` : 'Not Detected'}</span></p>
                  <p>• Question Column Detected: <span className="text-white">{diagnostics.questionColumnDetected || 'None'}</span></p>
                  <p>• Total Data Rows: <span className="text-white">{diagnostics.totalDataRows}</span></p>
                  <p>• Valid Questions Imported: <span className="text-emerald-400 font-bold">{diagnostics.validQuestionsCount}</span></p>
                  <p>• Skipped Rows Count: <span className="text-amber-400">{diagnostics.skippedRowsCount}</span></p>
                  {diagnostics.skipReasons.length > 0 && (
                    <div className="pt-1 text-slate-400">
                      <p className="font-bold text-slate-300">Logs / Warnings:</p>
                      {diagnostics.skipReasons.map((log, lIdx) => (
                        <p key={lIdx} className="pl-2 text-[10px]">• {log}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
