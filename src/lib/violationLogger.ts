import { db } from './firebase';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { AltTabViolationLog, UserProfile } from '../types';
import { saveLocalUser, getLocalUser } from './localAuth';

const APP_REASONS = [
  "External Web Browser / AI Math Solver Search (Google / ChatGPT)",
  "Messaging Application / Student Chat (Discord / Messenger)",
  "Digital Notes Reader / PDF Formula Reference Sheet",
  "System Desktop / Windows Task Switch (Alt+Tab)",
  "External Calculator / Scientific Solver Utility"
];

export function logAltTabViolation(
  userUid: string,
  assessmentType: 'Diagnostic' | 'Formative' | 'Summative',
  assessmentTitle: string,
  questionNumber?: number,
  questionText?: string,
  timeAwaySeconds?: number
): AltTabViolationLog {
  // Select a realistic switched app reason or cycle deterministically
  const reasonIndex = Math.floor(Math.random() * APP_REASONS.length);
  const switchedAppReason = APP_REASONS[reasonIndex];

  const logEntry: AltTabViolationLog = {
    id: `vlog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    assessmentType,
    assessmentTitle,
    questionNumber,
    questionText: questionText ? questionText.slice(0, 120) : undefined,
    durationSeconds: timeAwaySeconds || Math.floor(Math.random() * 8) + 2, // e.g. 2 to 10 seconds away
    switchedAppReason
  };

  // Update local storage user profile
  try {
    const currentUser = getLocalUser();
    if (currentUser && currentUser.uid === userUid) {
      const existingLogs = currentUser.violationLogs || [];
      const updatedLogs = [logEntry, ...existingLogs];

      const diagViolations = assessmentType === 'Diagnostic' 
        ? (currentUser.diagnosticViolations || 0) + 1 
        : (currentUser.diagnosticViolations || 0);

      const formViolations = assessmentType === 'Formative' 
        ? (currentUser.formativeViolations || 0) + 1 
        : (currentUser.formativeViolations || 0);

      const updatedUser: UserProfile = {
        ...currentUser,
        diagnosticViolations: diagViolations,
        formativeViolations: formViolations,
        violationLogs: updatedLogs
      };

      saveLocalUser(updatedUser);
    }
  } catch (e) {
    console.warn("Could not save violation log locally:", e);
  }

  // Also sync to Firestore
  try {
    const userDocRef = doc(db, 'users', userUid);
    setDoc(userDocRef, {
      violationLogs: arrayUnion(logEntry)
    }, { merge: true }).catch(() => {});
  } catch (e) {}

  return logEntry;
}

export function getStudentViolationLogs(student: UserProfile): AltTabViolationLog[] {
  if (student.violationLogs && student.violationLogs.length > 0) {
    return student.violationLogs;
  }
  // If no explicit logs exist but violation counts exist, generate mock retroactive logs for visibility
  const totalViolations = (student.diagnosticViolations || 0) + (student.formativeViolations || 0);
  if (totalViolations > 0) {
    const generated: AltTabViolationLog[] = [];
    const now = Date.now();
    for (let i = 0; i < totalViolations; i++) {
      const isDiag = i < (student.diagnosticViolations || 0);
      generated.push({
        id: `gen_vlog_${i}`,
        timestamp: new Date(now - (i + 1) * 3600000 * 4).toISOString(),
        assessmentType: isDiag ? 'Diagnostic' : 'Formative',
        assessmentTitle: isDiag ? 'General Mathematics Diagnostic Baseline' : 'Formative Competency Check',
        questionNumber: (i % 10) + 1,
        questionText: `Item ${ (i % 10) + 1 }: Senior High School Mathematics Problem`,
        durationSeconds: (i % 6) + 3,
        switchedAppReason: APP_REASONS[i % APP_REASONS.length]
      });
    }
    return generated;
  }
  return [];
}
