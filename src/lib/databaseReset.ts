import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { UserProfile } from '../types';
import { getLocalUsers, saveLocalUser, DEFAULT_ACCOUNTS } from './localAuth';

export type DatabaseResetType = 'all' | 'results' | 'violations' | 'lessons' | 'activities';

export interface ResetOptions {
  type: DatabaseResetType;
}

/**
 * Performs a comprehensive database reset:
 * - 'all': Wipes all student activities, scores, assessments, XP, step progress, oral recitations, transcripts, study requests, presentations views, and integrity violation logs across Firestore and Local Database.
 * - 'results': Wipes all assessment quiz, diagnostic, formative, and summative score records.
 * - 'violations': Resets all Alt-Tab violation logs, tab-out counters, and penalty scores to 0.
 * - 'lessons': Resets all Lesson Plans, custom drafted/published lessons, student step progress, and slide presentation views.
 * - 'activities': Resets all Student Activity Submissions, performance tasks, daily challenges, oral recitations, and math sprint records.
 */
export async function performDatabaseReset(type: DatabaseResetType): Promise<{ success: boolean; message: string }> {
  try {
    // 1. FIREBASE FIRESTORE PURGE & RESET
    try {
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);

      for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        const userData = userDoc.data() as UserProfile;

        // Subcollection: results
        if (type === 'all' || type === 'results') {
          try {
            const resultsRef = collection(db, `users/${uid}/results`);
            const resultsSnap = await getDocs(resultsRef);
            for (const rDoc of resultsSnap.docs) {
              await deleteDoc(doc(db, `users/${uid}/results`, rDoc.id)).catch(() => {});
            }
          } catch (e) {
            console.warn(`Could not clear results for user ${uid}:`, e);
          }
        }

        // Subcollection: flashcards
        if (type === 'all' || type === 'activities') {
          try {
            const flashcardsRef = collection(db, `users/${uid}/flashcards`);
            const flashSnap = await getDocs(flashcardsRef);
            for (const fDoc of flashSnap.docs) {
              await deleteDoc(doc(db, `users/${uid}/flashcards`, fDoc.id)).catch(() => {});
            }
          } catch (e) {}
        }

        // Update User Doc fields in Firestore
        if (userData.role === 'student' || !userData.role) {
          if (type === 'all') {
            await updateDoc(doc(db, 'users', uid), {
              xp: 0,
              level: 1,
              streak: 0,
              diagnosticScores: {},
              diagnosticCompleted: false,
              diagnosticAbility: 'Proficient',
              diagnosticViolations: 0,
              formativeViolations: 0,
              violationLogs: [],
              completedQuizzes: [],
              stepProgress: {},
              oralRecitations: [],
              summativeAssessments: [],
              badges: [],
              lastActive: new Date().toISOString()
            }).catch(() => {});
          } else if (type === 'results') {
            await updateDoc(doc(db, 'users', uid), {
              diagnosticScores: {},
              diagnosticCompleted: false,
              diagnosticAbility: 'Proficient',
              completedQuizzes: [],
              summativeAssessments: []
            }).catch(() => {});
          } else if (type === 'violations') {
            await updateDoc(doc(db, 'users', uid), {
              diagnosticViolations: 0,
              formativeViolations: 0,
              violationLogs: []
            }).catch(() => {});
          } else if (type === 'lessons') {
            await updateDoc(doc(db, 'users', uid), {
              stepProgress: {}
            }).catch(() => {});
          } else if (type === 'activities') {
            await updateDoc(doc(db, 'users', uid), {
              oralRecitations: []
            }).catch(() => {});
          }
        }
      }

      // Clear top-level auxiliary collections in Firestore
      if (type === 'all' || type === 'results' || type === 'lessons' || type === 'activities') {
        const collectionsToWipe = type === 'all'
          ? ['summative_transcripts', 'oral_recitations', 'presentation_views', 'study_requests', 'chat_messages', 'teacher_reports']
          : type === 'results'
          ? ['summative_transcripts']
          : type === 'lessons'
          ? ['presentation_views']
          : ['oral_recitations', 'study_requests'];

        for (const colName of collectionsToWipe) {
          try {
            const colRef = collection(db, colName);
            const colSnap = await getDocs(colRef);
            for (const cDoc of colSnap.docs) {
              await deleteDoc(doc(db, colName, cDoc.id)).catch(() => {});
            }
          } catch (e) {
            console.warn(`Could not wipe collection ${colName}:`, e);
          }
        }
      }
    } catch (firestoreErr) {
      console.warn("Firestore reset encountered error (will continue to clear local database):", firestoreErr);
    }

    // 2. LOCAL DATABASE & LOCALSTORAGE PURGE
    try {
      const rawUsers = localStorage.getItem('mathquest_local_accounts_v1');
      let users: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [...DEFAULT_ACCOUNTS];

      if (type === 'all') {
        users = users.map(u => {
          if (u.role === 'student') {
            return {
              ...u,
              xp: 0,
              level: 1,
              streak: 0,
              diagnosticScores: {},
              diagnosticCompleted: false,
              diagnosticAbility: 'Proficient',
              diagnosticViolations: 0,
              formativeViolations: 0,
              violationLogs: [],
              completedQuizzes: [],
              stepProgress: {},
              oralRecitations: [],
              summativeAssessments: [],
              badges: [],
              lastActive: new Date().toISOString()
            };
          }
          return u;
        });
        localStorage.setItem('mathquest_local_accounts_v1', JSON.stringify(users));

        // Update active session if student
        const rawSession = localStorage.getItem('mathquest_local_auth_session_v1');
        if (rawSession) {
          const sessionUser = JSON.parse(rawSession) as UserProfile;
          if (sessionUser.role === 'student') {
            const updatedSession: UserProfile = {
              ...sessionUser,
              xp: 0,
              level: 1,
              streak: 0,
              diagnosticScores: {},
              diagnosticCompleted: false,
              diagnosticAbility: 'Proficient',
              diagnosticViolations: 0,
              formativeViolations: 0,
              violationLogs: [],
              completedQuizzes: [],
              stepProgress: {},
              oralRecitations: [],
              summativeAssessments: [],
              badges: []
            };
            localStorage.setItem('mathquest_local_auth_session_v1', JSON.stringify(updatedSession));
          }
        }

        // Remove all auxiliary cached items in localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('mathquest_results_') ||
            key.startsWith('mathquest_lesson') ||
            key.startsWith('mathquest_activity') ||
            key === 'mathquest_quiz_results' ||
            key === 'mathquest_diagnostic_exams' ||
            key === 'mathquest_violation_logs' ||
            key === 'mathquest_formative_checks' ||
            key === 'mathquest_step_progress' ||
            key === 'mathquest_xp_history' ||
            key === 'mathquest_daily_quests' ||
            key === 'mathquest_daily_challenge' ||
            key === 'mathquest_sprint_arena' ||
            key === 'mathquest_study_requests' ||
            key === 'mathquest_flashcards' ||
            key === 'mathquest_oral_recitations' ||
            key === 'mathquest_presentations' ||
            key === 'mathquest_custom_students' ||
            key === 'mathquest_lesson_plans' ||
            key === 'mathquest_custom_lessons' ||
            key === 'mathquest_ilaw_lessons' ||
            key === 'mathquest_activity_submissions' ||
            key === 'mathquest_activities' ||
            key.includes('violation') ||
            key.includes('quiz') ||
            key.includes('lesson') ||
            key.includes('activity')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } else if (type === 'results') {
        users = users.map(u => {
          if (u.role === 'student') {
            return {
              ...u,
              diagnosticScores: {},
              diagnosticCompleted: false,
              diagnosticAbility: 'Proficient',
              completedQuizzes: [],
              summativeAssessments: []
            };
          }
          return u;
        });
        localStorage.setItem('mathquest_local_accounts_v1', JSON.stringify(users));

        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.startsWith('mathquest_results_') ||
            key === 'mathquest_quiz_results' ||
            key === 'mathquest_diagnostic_exams' ||
            key === 'mathquest_formative_checks' ||
            key === 'mathquest_step_progress'
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } else if (type === 'violations') {
        users = users.map(u => ({
          ...u,
          diagnosticViolations: 0,
          formativeViolations: 0,
          violationLogs: []
        }));
        localStorage.setItem('mathquest_local_accounts_v1', JSON.stringify(users));

        const rawSession = localStorage.getItem('mathquest_local_auth_session_v1');
        if (rawSession) {
          const sessionUser = JSON.parse(rawSession) as UserProfile;
          localStorage.setItem('mathquest_local_auth_session_v1', JSON.stringify({
            ...sessionUser,
            diagnosticViolations: 0,
            formativeViolations: 0,
            violationLogs: []
          }));
        }

        localStorage.removeItem('mathquest_violation_logs');
      } else if (type === 'lessons') {
        users = users.map(u => {
          if (u.role === 'student') {
            return {
              ...u,
              stepProgress: {}
            };
          }
          return u;
        });
        localStorage.setItem('mathquest_local_accounts_v1', JSON.stringify(users));

        const rawSession = localStorage.getItem('mathquest_local_auth_session_v1');
        if (rawSession) {
          const sessionUser = JSON.parse(rawSession) as UserProfile;
          if (sessionUser.role === 'student') {
            localStorage.setItem('mathquest_local_auth_session_v1', JSON.stringify({
              ...sessionUser,
              stepProgress: {}
            }));
          }
        }

        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key === 'mathquest_lesson_plans' ||
            key === 'mathquest_custom_lessons' ||
            key === 'mathquest_ilaw_lessons' ||
            key === 'mathquest_step_progress' ||
            key === 'mathquest_presentation_progress' ||
            key === 'mathquest_user_lessons' ||
            key.includes('lesson_plan')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } else if (type === 'activities') {
        users = users.map(u => {
          if (u.role === 'student') {
            return {
              ...u,
              oralRecitations: []
            };
          }
          return u;
        });
        localStorage.setItem('mathquest_local_accounts_v1', JSON.stringify(users));

        const rawSession = localStorage.getItem('mathquest_local_auth_session_v1');
        if (rawSession) {
          const sessionUser = JSON.parse(rawSession) as UserProfile;
          if (sessionUser.role === 'student') {
            localStorage.setItem('mathquest_local_auth_session_v1', JSON.stringify({
              ...sessionUser,
              oralRecitations: []
            }));
          }
        }

        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key === 'mathquest_activity_submissions' ||
            key === 'mathquest_activities' ||
            key === 'mathquest_teacher_activities' ||
            key === 'mathquest_daily_quests' ||
            key === 'mathquest_daily_challenge' ||
            key === 'mathquest_sprint_arena' ||
            key === 'mathquest_flashcards' ||
            key === 'mathquest_oral_recitations' ||
            key.includes('activity_submission') ||
            key.includes('activity_grading')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch (localErr) {
      console.warn("Local storage reset error:", localErr);
    }

    // 3. BROADCAST GLOBAL RESET EVENT
    window.dispatchEvent(new CustomEvent('mathquest_database_reset', { detail: { type } }));

    return {
      success: true,
      message: type === 'all'
        ? 'Full System Reset complete: All activities, lesson progress, assessment scores, and integrity logs have been wiped.'
        : type === 'results'
        ? 'All assessment quiz and diagnostic results have been wiped.'
        : type === 'violations'
        ? 'All academic integrity violation logs and tab-out counters have been reset to zero.'
        : type === 'lessons'
        ? 'All Lesson Plans, customized lesson drafts, student step progress, and presentation views have been reset to baseline.'
        : 'All Student Activity Submissions, performance tasks, daily challenges, oral recitations, and math sprint records have been reset.'
    };
  } catch (err: any) {
    console.error("Critical error in performDatabaseReset:", err);
    return {
      success: false,
      message: err.message || 'An error occurred during database reset.'
    };
  }
}
