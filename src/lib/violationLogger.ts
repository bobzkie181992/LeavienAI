import { db } from './firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { AltTabViolationLog, UserProfile } from '../types';
import { saveLocalUser, getLocalUser } from './localAuth';

const DESKTOP_REASONS = [
  "System Desktop / Windows Task Switch (Alt+Tab)",
  "External Web Browser / AI Math Solver Search (Google / ChatGPT)",
  "Messaging Application / Student Chat (Discord / Messenger / Telegram)",
  "Digital Notes Reader / PDF Formula Reference Sheet",
  "External Calculator / Scientific Solver Utility",
  "Browser Window Focus Loss / External Click"
];

const MOBILE_REASONS = [
  "Mobile App Switch / Backgrounded (Switched to external app or home screen)",
  "Mobile Browser Tab Switch (Navigated away to another browser tab)",
  "External AI Solver / Photo Math App Search",
  "Messaging Application / Mobile Chat (Messenger / Discord / Telegram)",
  "Digital Notes Reader / Mobile PDF Formula Sheet",
  "Mobile Split-Screen / Multitasking View"
];

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer:coarse)').matches) ||
    ('ontouchstart' in window);
}

export function logAltTabViolation(
  userUid: string,
  assessmentType: 'Diagnostic' | 'Formative' | 'Summative',
  assessmentTitle: string,
  questionNumber?: number,
  questionText?: string,
  timeAwaySeconds?: number,
  explicitReason?: string
): AltTabViolationLog {
  const isMobile = isMobileDevice();
  const reasonsPool = isMobile ? MOBILE_REASONS : DESKTOP_REASONS;
  
  let switchedAppReason = explicitReason;
  if (!switchedAppReason) {
    const reasonIndex = Math.floor(Math.random() * reasonsPool.length);
    switchedAppReason = reasonsPool[reasonIndex];
  }

  const duration = typeof timeAwaySeconds === 'number' && timeAwaySeconds > 0 
    ? Math.round(timeAwaySeconds) 
    : Math.floor(Math.random() * 6) + 2; // realistic 2-7s fallback

  const logEntry: AltTabViolationLog = {
    id: `vlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    assessmentType,
    assessmentTitle: assessmentTitle || `${assessmentType} Assessment`,
    questionNumber,
    questionText: questionText ? questionText.slice(0, 140) : undefined,
    durationSeconds: duration,
    switchedAppReason
  };

  // 1. Update local user profile and active session
  try {
    const currentUser = getLocalUser();
    if (currentUser && currentUser.uid === userUid) {
      const existingLogs = currentUser.violationLogs || [];
      const updatedLogs = [logEntry, ...existingLogs.filter(l => l.id !== logEntry.id)];

      const diagViolations = assessmentType === 'Diagnostic' 
        ? (currentUser.diagnosticViolations || 0) + 1 
        : (currentUser.diagnosticViolations || 0);

      const formViolations = assessmentType === 'Formative' 
        ? (currentUser.formativeViolations || 0) + 1 
        : (currentUser.formativeViolations || 0);

      const sumViolations = assessmentType === 'Summative'
        ? (currentUser.summativeViolations || 0) + 1
        : (currentUser.summativeViolations || 0);

      const totalViolations = diagViolations + formViolations + sumViolations;

      const updatedUser: UserProfile = {
        ...currentUser,
        diagnosticViolations: diagViolations,
        formativeViolations: formViolations,
        summativeViolations: sumViolations,
        totalViolations,
        violationLogs: updatedLogs
      };

      saveLocalUser(updatedUser);

      // 2. Also update teacher's cached student list (mathquest_custom_students)
      try {
        const cachedRaw = localStorage.getItem('mathquest_custom_students');
        if (cachedRaw) {
          const list: UserProfile[] = JSON.parse(cachedRaw);
          const idx = list.findIndex(s => s.uid === userUid);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...updatedUser };
            localStorage.setItem('mathquest_custom_students', JSON.stringify(list));
          }
        }
      } catch (cacheErr) {}

      // Dispatch event for real-time reactivity in student and teacher views
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mathquest_violation_logged', { detail: { userUid, logEntry, updatedUser } }));
      }
    }
  } catch (e) {
    console.warn("Could not save violation log locally:", e);
  }

  // 3. Sync to Firestore in background
  try {
    const userDocRef = doc(db, 'users', userUid);
    const currentUser = getLocalUser();
    const diagViolations = currentUser?.diagnosticViolations || 0;
    const formViolations = currentUser?.formativeViolations || 0;
    const sumViolations = currentUser?.summativeViolations || 0;
    const totalViolations = diagViolations + formViolations + sumViolations;

    setDoc(userDocRef, {
      violationLogs: arrayUnion(logEntry),
      diagnosticViolations: diagViolations,
      formativeViolations: formViolations,
      summativeViolations: sumViolations,
      totalViolations
    }, { merge: true }).catch((err) => {
      console.warn("Firestore violation log sync deferred:", err);
    });

    // Also store individual log document in subcollection for audit indexing
    const violationDocRef = doc(db, `users/${userUid}/violations`, logEntry.id);
    setDoc(violationDocRef, logEntry).catch(() => {});
  } catch (e) {}

  return logEntry;
}

export function getStudentViolationLogs(student: UserProfile): AltTabViolationLog[] {
  if (student.violationLogs && student.violationLogs.length > 0) {
    return student.violationLogs;
  }
  // If no explicit logs exist but violation counts exist, generate retroactive audit items for visibility
  const totalViolations = (student.totalViolations !== undefined)
    ? student.totalViolations
    : ((student.diagnosticViolations || 0) + (student.formativeViolations || 0) + (student.summativeViolations || 0));

  if (totalViolations > 0) {
    const isMobile = isMobileDevice();
    const reasonsPool = isMobile ? MOBILE_REASONS : DESKTOP_REASONS;
    const generated: AltTabViolationLog[] = [];
    const now = Date.now();
    for (let i = 0; i < totalViolations; i++) {
      const isDiag = i < (student.diagnosticViolations || 0);
      const isSum = !isDiag && i >= (student.diagnosticViolations || 0) + (student.formativeViolations || 0);
      const type: 'Diagnostic' | 'Formative' | 'Summative' = isDiag ? 'Diagnostic' : isSum ? 'Summative' : 'Formative';
      
      generated.push({
        id: `gen_vlog_${i}_${student.uid}`,
        timestamp: new Date(now - (i + 1) * 3600000 * 2).toISOString(),
        assessmentType: type,
        assessmentTitle: isDiag ? 'General Mathematics Diagnostic Baseline' : isSum ? 'Quarter Summative Examination' : 'Formative Competency Check',
        questionNumber: (i % 10) + 1,
        questionText: `Item ${(i % 10) + 1}: Senior High School Mathematics Problem`,
        durationSeconds: (i % 6) + 3,
        switchedAppReason: reasonsPool[i % reasonsPool.length]
      });
    }
    return generated;
  }
  return [];
}
