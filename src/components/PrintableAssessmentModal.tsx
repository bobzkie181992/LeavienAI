import React from 'react';
import { motion } from 'motion/react';
import { Printer, X, FileText, CheckCircle2, Download, HelpCircle, GraduationCap } from 'lucide-react';
import { Problem } from '../types';

interface PrintableAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subject?: string;
  gradeLevel?: string;
  quarter?: string;
  targetSection?: string;
  instructions?: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number | string;
    competency?: string;
    explanation?: string;
  }>;
}

export default function PrintableAssessmentModal({
  isOpen,
  onClose,
  title,
  subject = 'General Mathematics',
  gradeLevel = 'Grade 11',
  quarter = 'Quarter 1',
  targetSection = 'All Sections',
  instructions = 'Read each question carefully. Write the letter of the correct answer on the answer sheet provided.',
  questions
}: PrintableAssessmentModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWorksheet = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - DepEd Worksheet</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; font-weight: bold; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 24px; background: #f8fafc; }
    .instructions { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
    .question { margin-bottom: 24px; font-size: 14px; page-break-inside: avoid; }
    .options { margin-left: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
    .option { border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; background: #fff; }
    .key { margin-top: 40px; border-top: 2px dashed #94a3b8; padding-top: 20px; page-break-before: always; }
  </style>
</head>
<body>
  <div class="header">
    <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b;">Department of Education • Region III</p>
    <p style="font-size: 13px; font-weight: bold; text-transform: uppercase;">Senior High School Program</p>
    <h2 style="font-size: 18px; text-transform: uppercase; margin: 8px 0;">${subject} • ${gradeLevel} (${quarter})</h2>
    <h1 style="font-size: 22px; text-transform: uppercase;">${title}</h1>
  </div>
  <div class="fields">
    <div>Name: _____________________________________________</div>
    <div>Date: ________________________</div>
    <div>LRN: _____________________________________________</div>
    <div>Section: ${targetSection}</div>
    <div>Score: ________ / ${questions.length}</div>
  </div>
  <div class="instructions">
    <strong>GENERAL INSTRUCTIONS:</strong> ${instructions}
  </div>
  <div>
    ${questions.map((q, idx) => `
      <div class="question">
        <strong>${idx + 1}. ${q.question}</strong>
        ${q.competency ? `<div style="font-size: 12px; color: #64748b; font-style: italic; margin-top: 4px;">Competency: ${q.competency}</div>` : ''}
        <div class="options">
          ${q.options.map((opt, oIdx) => `<div class="option"><strong>${String.fromCharCode(65 + oIdx)}.</strong> ${opt}</div>`).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  <div class="key">
    <h3 style="text-align: center; margin-bottom: 16px;">*** TEACHER'S ANSWER KEY & SPECIFICATIONS ***</h3>
    <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
      ${questions.map((q, idx) => `
        <li style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; text-align: center; font-weight: bold;">
          Q#${idx + 1}: <span style="color: #059669; font-size: 16px;">${typeof q.correctAnswer === 'number' ? String.fromCharCode(65 + q.correctAnswer) : q.correctAnswer}</span>
        </li>
      `).join('')}
    </ul>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_worksheet.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Modal Controls Bar (Hidden during Print) */}
        <div className="print:hidden bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  DepEd Print Ready
                </span>
                <span className="text-xs text-slate-400 font-bold">{questions.length} Items</span>
              </div>
              <h2 className="text-base font-black text-white">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadWorksheet}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Worksheet</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SHEET CONTAINER (Visible both in UI & in Paper Print) */}
        <div id="printable-assessment-sheet" className="p-8 sm:p-12 text-slate-900 font-sans space-y-6">
          
          {/* DepEd School Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <p className="text-xs font-serif uppercase tracking-widest text-slate-600">Department of Education • Region III</p>
            <p className="text-sm font-bold uppercase text-slate-800">Division of City Schools • Senior High School Program</p>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">{subject} • {gradeLevel}</h1>
            <p className="text-xs font-semibold text-slate-700">{quarter} Examination / Assessment Questionnaire</p>
          </div>

          {/* Student & Class Information Fields */}
          <div className="grid grid-cols-2 gap-4 text-xs font-bold border border-slate-300 p-4 rounded-xl bg-slate-50/50">
            <div>Name: _____________________________________________</div>
            <div>Date: ________________________</div>
            <div>LRN: _____________________________________________</div>
            <div>Section: {targetSection}</div>
            <div>Score: ________ / {questions.length}</div>
            <div>Teacher: ______________________</div>
          </div>

          {/* Instructions Box */}
          <div className="p-3 bg-slate-100 rounded-xl text-xs space-y-1 border border-slate-200">
            <span className="font-black uppercase tracking-wider block text-slate-900">GENERAL INSTRUCTIONS:</span>
            <p className="text-slate-800">{instructions}</p>
          </div>

          {/* Questions List */}
          <div className="space-y-6 pt-2">
            {questions.map((q, idx) => (
              <div key={q.id || idx} className="space-y-2 text-xs break-inside-avoid">
                <div className="flex items-start gap-2 font-bold text-slate-900">
                  <span className="font-black shrink-0">{idx + 1}.</span>
                  <p className="leading-relaxed">{q.question}</p>
                </div>

                {q.competency && (
                  <div className="ml-5 text-[10px] text-slate-500 font-semibold italic">
                    Competency: {q.competency}
                  </div>
                )}

                {/* Multiple Choice Options Grid */}
                <div className="ml-5 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium text-slate-800">
                  {q.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx); // A, B, C, D
                    return (
                      <div key={oIdx} className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 bg-white">
                        <span className="w-5 h-5 rounded-full bg-slate-100 font-black text-[10px] text-slate-700 flex items-center justify-center border border-slate-300 shrink-0">
                          {letter}
                        </span>
                        <span className="text-xs">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Teacher's Answer Key & TOS Summary Section (Break for print) */}
          <div className="pt-8 border-t-2 border-dashed border-slate-300 break-before-page space-y-4">
            <div className="text-center font-black uppercase text-xs tracking-wider text-slate-800">
              *** TEACHER'S ANSWER KEY & TABLE OF SPECIFICATIONS (OFFICIAL COPY) ***
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {questions.map((q, idx) => {
                let ansLetter = 'A';
                if (typeof q.correctAnswer === 'number') {
                  ansLetter = String.fromCharCode(65 + q.correctAnswer);
                } else if (typeof q.correctAnswer === 'string') {
                  ansLetter = q.correctAnswer.toUpperCase();
                }

                return (
                  <div key={idx} className="p-2 border border-emerald-200 bg-emerald-50/50 rounded-lg flex items-center justify-between font-bold">
                    <span className="text-slate-600">Q#{idx + 1}:</span>
                    <span className="text-emerald-800 font-black text-sm bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      {ansLetter}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-xs font-bold text-center">
            <div>
              <div className="border-b border-slate-900 pb-1 font-black">Subject Teacher Signature</div>
              <div className="text-[10px] text-slate-500 mt-1">Prepared & Verified</div>
            </div>
            <div>
              <div className="border-b border-slate-900 pb-1 font-black">School Principal / Head Teacher</div>
              <div className="text-[10px] text-slate-500 mt-1">Approved for Administration</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
