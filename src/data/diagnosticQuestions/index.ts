import { DiagnosticQuestion, DiagnosticAssessmentLevel } from '../../types';
import { level1DiagnosticQuestions } from './level1';
import { level2DiagnosticQuestions } from './level2';
import { level3DiagnosticQuestions } from './level3';
import { level4DiagnosticQuestions } from './level4';

export {
  level1DiagnosticQuestions,
  level2DiagnosticQuestions,
  level3DiagnosticQuestions,
  level4DiagnosticQuestions
};

export const allDiagnosticQuestions: DiagnosticQuestion[] = [
  ...level1DiagnosticQuestions,
  ...level2DiagnosticQuestions,
  ...level3DiagnosticQuestions,
  ...level4DiagnosticQuestions
];

export function getDiagnosticQuestionsByLevel(level: DiagnosticAssessmentLevel): DiagnosticQuestion[] {
  return allDiagnosticQuestions.filter(q => q.assessmentLevel === level);
}

export function getDiagnosticCountsByLevel(): Record<DiagnosticAssessmentLevel, number> {
  return {
    'Level 1 - Prerequisite / Foundational': level1DiagnosticQuestions.length,
    'Level 2 - Core Concept Baseline': level2DiagnosticQuestions.length,
    'Level 3 - Intermediate Analytical': level3DiagnosticQuestions.length,
    'Level 4 - Advanced Mastery / Challenge': level4DiagnosticQuestions.length
  };
}
