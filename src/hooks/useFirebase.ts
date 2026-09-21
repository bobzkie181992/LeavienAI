import { useEffect, useState } from 'react';
import { auth, db, createStudentAuthAccount, sanitizeForFirestore } from '../lib/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, QuizResult, Topic, LearningPathway, Problem, ItemStatus, ItemStats, StudyRequest, VideoLecture, Presentation, PresentationViewRecord } from '../types';
import { topics as initialTopics } from '../data/curriculum';
import { initialPresentations } from '../data/presentations';
import { 
  getLocalSession, 
  onLocalAuthStateChange, 
  getLocalUsers, 
  saveLocalUser, 
  deleteLocalUser 
} from '../lib/localAuth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AppAuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppAuthUser | null>(() => {
    const session = getLocalSession();
    if (session) {
      return {
        uid: session.uid,
        email: session.email || null,
        displayName: session.displayName || null,
      };
    }
    return auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName
    } : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial check of local session
    const session = getLocalSession();
    if (session) {
      setUser({
        uid: session.uid,
        email: session.email || null,
        displayName: session.displayName || null,
      });
      setLoading(false);
    }

    // 2. Listen to local database authentication changes
    const unsubLocal = onLocalAuthStateChange((profile) => {
      if (profile) {
        setUser({
          uid: profile.uid,
          email: profile.email || null,
          displayName: profile.displayName || null,
        });
      } else {
        if (auth.currentUser) {
          setUser({
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName
          });
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // 3. Listen to Firebase auth state changes (e.g. Google Sign-In)
    const unsubFirebase = auth.onAuthStateChanged((fbUser) => {
      const currentLocal = getLocalSession();
      if (currentLocal) {
        setUser({
          uid: currentLocal.uid,
          email: currentLocal.email || null,
          displayName: currentLocal.displayName || null,
        });
      } else if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubLocal();
      unsubFirebase();
    };
  }, []);

  return { user, loading };
}

export function useUserProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      // Check local database first for instant loading
      const localUsers = getLocalUsers();
      const localMatch = localUsers.find(u => u.uid === uid);
      if (localMatch) {
        setProfile(localMatch);
        setLoading(false);
      }

      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const remoteData = docSnap.data() as UserProfile;
          setProfile(remoteData);
          saveLocalUser(remoteData);
        } else if (localMatch) {
          setProfile(localMatch);
        } else {
          // Profile doesn't exist, we'll let the UI handle role selection before creating it
          setProfile(null);
        }
      } catch (err: any) {
        console.warn("Could not fetch remote profile, fallback to local:", err);
        if (localMatch) {
          setProfile(localMatch);
        } else {
          try {
            const cached = localStorage.getItem(`mathquest_profile_${uid}`);
            if (cached) {
              setProfile(JSON.parse(cached));
              setLoading(false);
              return;
            }
          } catch (e) {}
          setError(err.message || "Failed to connect to database");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  const createProfile = async (
    role: 'student' | 'faculty', 
    customDisplayName?: string, 
    lrn?: string,
    targetUid?: string
  ) => {
    const activeUid = targetUid || uid || auth.currentUser?.uid;
    if (!activeUid) return;
    const newProfile: UserProfile = {
      uid: activeUid,
      displayName: customDisplayName || auth.currentUser?.displayName || (role === 'student' ? 'Student Hero' : 'Professor'),
      email: auth.currentUser?.email || '',
      role,
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date().toISOString(),
      badges: [],
      ...(role === 'student' ? { grade: 'Grade 11', section: 'STEM-A', lrn: lrn || '' } : {})
    };
    saveLocalUser(newProfile);
    setProfile(newProfile);
    try {
      const docRef = doc(db, 'users', activeUid);
      await setDoc(docRef, newProfile);
      try {
        localStorage.setItem(`mathquest_profile_${activeUid}`, JSON.stringify(newProfile));
      } catch (e) {}
    } catch (err) {
      console.warn("Could not save profile to remote Firestore, stored in local database:", err);
      try {
        localStorage.setItem(`mathquest_profile_${activeUid}`, JSON.stringify(newProfile));
      } catch (e) {}
    }
  };

  const updateDisplayName = async (newName: string) => {
    if (!uid || !profile) return;
    const updated = { ...profile, displayName: newName };
    saveLocalUser(updated);
    setProfile(updated);
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { displayName: newName });
    } catch (err) {
      console.warn("Error updating remote display name, saved locally:", err);
    }
  };

  const updateProfileDetails = async (newName: string, grade: string, section: string, lrn?: string) => {
    if (!uid || !profile) return;
    const updated: UserProfile = { 
      ...profile, 
      displayName: newName, 
      grade, 
      section, 
      ...(lrn !== undefined ? { lrn } : {}) 
    };
    saveLocalUser(updated);
    setProfile(updated);
    try {
      const docRef = doc(db, 'users', uid);
      const updateData: Record<string, any> = { displayName: newName, grade, section };
      if (lrn !== undefined) {
        updateData.lrn = lrn;
      }
      await updateDoc(docRef, updateData);
    } catch (err) {
      console.warn("Error updating remote profile details, saved locally:", err);
    }
  };

  const addXP = async (amount: number) => {
    if (!uid || !profile) return;
    try {
      const now = new Date();
      const lastActiveDate = new Date(profile.lastActive);
      
      const isSameDay = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const isYesterday = (d1: Date, d2: Date) => {
        const yesterday = new Date(d1);
        yesterday.setDate(yesterday.getDate() - 1);
        return isSameDay(yesterday, d2);
      };

      let newStreak = profile.streak;
      let bonusXP = 0;

      if (isYesterday(now, lastActiveDate)) {
        newStreak += 1;
        bonusXP = newStreak * 5; // Bonus XP for streak
      } else if (!isSameDay(now, lastActiveDate)) {
        newStreak = 1;
        bonusXP = 5; // Initial streak bonus
      }

      const totalAmount = amount + bonusXP;
      const newXP = profile.xp + totalAmount;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
      
      const updated: UserProfile = {
        ...profile,
        xp: newXP,
        level: newLevel,
        streak: newStreak,
        lastActive: now.toISOString()
      };
      saveLocalUser(updated);
      setProfile(updated);

      try {
        const docRef = doc(db, 'users', uid);
        await updateDoc(docRef, {
          xp: increment(totalAmount),
          level: newLevel,
          streak: newStreak,
          lastActive: now.toISOString()
        });
      } catch (e) {
        console.warn("Remote XP update deferred:", e);
      }
      
      return bonusXP;
    } catch (err) {
      console.error("Error adding XP:", err);
      return 0;
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (!uid || !profile || profile.badges.includes(badgeId)) return;
    const newBadges = [...profile.badges, badgeId];
    const updated = { ...profile, badges: newBadges };
    saveLocalUser(updated);
    setProfile(updated);
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { badges: newBadges });
    } catch (err) {
      console.warn("Remote badge update deferred:", err);
    }
  };

  const saveDiagnosticResult = async (ability: string, scores: Record<string, number>, pathway?: LearningPathway) => {
    if (!uid || !profile) return;
    const updated: UserProfile = {
      ...profile,
      diagnosticCompleted: true,
      diagnosticAbility: ability,
      diagnosticScores: scores,
      mathAbility: ability,
      competencyScores: scores,
      ...(pathway ? { activePathway: pathway } : {})
    };
    saveLocalUser(updated);
    setProfile(updated);
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, sanitizeForFirestore({
        diagnosticCompleted: true,
        diagnosticAbility: ability,
        diagnosticScores: scores,
        mathAbility: ability,
        competencyScores: scores,
        ...(pathway ? { activePathway: pathway } : {})
      }));
    } catch (err) {
      console.warn("Remote diagnostic save deferred:", err);
    }
  };

  const savePathwayProgress = async (pathway: LearningPathway | null) => {
    if (!uid || !profile) return;
    const updated: UserProfile = {
      ...profile,
      activePathway: pathway || undefined
    };
    saveLocalUser(updated);
    setProfile(updated);
    try {
      const docRef = doc(db, 'users', uid);
      if (pathway === null) {
        await updateDoc(docRef, { activePathway: null });
      } else {
        await updateDoc(docRef, { activePathway: sanitizeForFirestore(pathway) });
      }
    } catch (err) {
      console.warn("Remote pathway progress deferred:", err);
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateDisplayName,
    updateProfileDetails,
    addXP,
    unlockBadge,
    saveDiagnosticResult,
    savePathwayProgress
  };
}

export function useAllStudents() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data() as UserProfile);

        // Merge with local accounts database
        try {
          const localStudents = getLocalUsers().filter(u => u.role === 'student');
          const existingUids = new Set(data.map(s => s.uid));
          for (const s of localStudents) {
            if (!existingUids.has(s.uid)) {
              data.push(s);
            }
          }
        } catch (e) {}

        setStudents(data);
      } catch (err) {
        console.error("Error fetching students from Firestore, loading from local database:", err);
        try {
          const localStudents = getLocalUsers().filter(u => u.role === 'student');
          setStudents(localStudents);
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const addStudent = async (studentData: Partial<UserProfile> & { password?: string }) => {
    let authUid: string | null = null;
    const rawEmail = studentData.email?.trim();
    const rawLrn = studentData.lrn?.trim();
    // Derive valid student email if none was provided
    const targetEmail = rawEmail || (rawLrn ? `${rawLrn}@student.mathquest.internal` : '');
    const studentPassword = studentData.password?.trim() || studentData.temporaryPassword?.trim();

    if (studentPassword && studentPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // Attempt Firebase Auth account registration in background if possible
    if (targetEmail && studentPassword) {
      try {
        authUid = await createStudentAuthAccount(targetEmail, studentPassword, studentData.displayName || 'New Student');
      } catch (authErr: any) {
        console.warn("Could not create Firebase Auth account for student (using local database):", authErr);
      }
    }

    // Use the Auth UID if created, otherwise generate standard unique ID
    const dummyId = authUid || ('student_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
    const newStudent: UserProfile = {
      uid: dummyId,
      displayName: studentData.displayName || 'New Student',
      email: targetEmail || '',
      lrn: rawLrn,
      temporaryPassword: studentPassword || undefined,
      password: studentPassword || undefined,
      role: 'student',
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date().toISOString(),
      badges: [],
      ...studentData
    };

    // Save directly to local database for immediate local authentication
    saveLocalUser(newStudent);

    try {
      await setDoc(doc(db, 'users', dummyId), sanitizeForFirestore(newStudent));
    } catch (err) {
      console.warn("Could not save student to Firestore remote, saved locally:", err);
    }

    try {
      const cached: UserProfile[] = JSON.parse(localStorage.getItem('mathquest_custom_students') || '[]');
      cached.push(newStudent);
      localStorage.setItem('mathquest_custom_students', JSON.stringify(cached));
    } catch (e) {}

    setStudents(prev => [...prev, newStudent]);
    return newStudent;
  };

  const deleteStudent = async (uid: string) => {
    deleteLocalUser(uid);
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (err) {
      console.warn("Could not delete from Firestore remote, removed locally:", err);
    }
    try {
      const cached: UserProfile[] = JSON.parse(localStorage.getItem('mathquest_custom_students') || '[]');
      const filtered = cached.filter(s => s.uid !== uid);
      localStorage.setItem('mathquest_custom_students', JSON.stringify(filtered));
    } catch (e) {}
    setStudents(prev => prev.filter(s => s.uid !== uid));
  };

  const editStudent = async (uid: string, updates: Partial<UserProfile> & { password?: string }) => {
    const studentPassword = updates.password?.trim() || updates.temporaryPassword?.trim();
    if (studentPassword && studentPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    const cleanUpdates = {
      ...updates,
      ...(studentPassword ? { temporaryPassword: studentPassword, password: studentPassword } : {})
    };

    saveLocalUser({ uid, ...cleanUpdates } as UserProfile);

    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, sanitizeForFirestore(cleanUpdates));
    } catch (err) {
      console.warn("Could not update in Firestore remote, updated locally:", err);
    }
    try {
      const cached: UserProfile[] = JSON.parse(localStorage.getItem('mathquest_custom_students') || '[]');
      const updated = cached.map(s => s.uid === uid ? { ...s, ...cleanUpdates } : s);
      localStorage.setItem('mathquest_custom_students', JSON.stringify(updated));
    } catch (e) {}
    setStudents(prev => prev.map(s => s.uid === uid ? { ...s, ...cleanUpdates } : s));
  };

  const exportResearchData = async () => {
    try {
      // Get all students to map uids to ability estimates or just fetch from users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        usersMap.set(doc.id, doc.data());
      });

      // Get all results for all students (using collectionGroup 'results' is possible, but we don't have it indexed)
      // Since 'results' is a subcollection of 'users', and we have users, we can fetch them per user.
      const allRows: any[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const userData = userDoc.data();
        const resultsSnapshot = await getDocs(collection(db, `users/${uid}/results`));
        
        resultsSnapshot.docs.forEach(resDoc => {
          const resData = resDoc.data();
          if (resData.itemResponses && Array.isArray(resData.itemResponses)) {
            resData.itemResponses.forEach((ir: any) => {
              allRows.push({
                studentId: uid,
                itemId: ir.problemId,
                competency: ir.competency || '',
                responseOption: ir.selectedOption,
                isCorrect: ir.isCorrect ? 1 : 0,
                itemDifficulty: ir.difficultyParameter,
                itemDiscrimination: ir.discriminationParameter,
                abilityEstimate: resData.abilityEstimate || userData.diagnosticAbility || '',
                responseTimeMs: ir.responseTimeMs || 0,
                assessmentAttempt: resData.attemptNumber || 1,
                dateTime: resData.timestamp,
                masteryStatus: userData.activePathway ? userData.activePathway.currentStepIndex : 'completed'
              });
            });
          }
        });
      }
      
      return allRows;
    } catch (err) {
      console.error("Error exporting research data:", err);
      throw err;
    }
  };

  const awardOralRecitation = async (
    studentUid: string,
    studentName: string,
    points: number,
    topicId: string,
    topicTitle: string,
    notes: string,
    facultyName: string
  ) => {
    const recitationId = 'recitation_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const recitation = {
      id: recitationId,
      userId: studentUid,
      studentName,
      points,
      topicId,
      topicTitle,
      notes,
      awardedBy: facultyName,
      awardedAt: new Date().toISOString()
    };

    // 1. Save recitation doc
    try {
      await setDoc(doc(db, 'oral_recitations', recitationId), recitation);
    } catch (err) {
      console.warn("Could not save recitation doc remotely:", err);
    }

    // Save to local storage cache for students
    try {
      const cached = JSON.parse(localStorage.getItem(`mathquest_recitations_${studentUid}`) || '[]');
      cached.push(recitation);
      localStorage.setItem(`mathquest_recitations_${studentUid}`, JSON.stringify(cached));
    } catch (e) {}

    // 2. Update Student Profile XP and Recitation Points
    const targetStudent = students.find(s => s.uid === studentUid);
    if (targetStudent) {
      const currentXP = targetStudent.xp || 0;
      const currentPoints = targetStudent.oralRecitationPoints || 0;
      
      const addedXP = points * 100;
      const newXP = currentXP + addedXP;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
      const newPoints = currentPoints + points;

      const updatedStudent: UserProfile = {
        ...targetStudent,
        xp: newXP,
        level: newLevel,
        oralRecitationPoints: newPoints
      };

      // Save locally
      saveLocalUser(updatedStudent);

      // Update Firestore
      try {
        await updateDoc(doc(db, 'users', studentUid), {
          xp: newXP,
          level: newLevel,
          oralRecitationPoints: newPoints
        });
      } catch (err) {
        console.warn("Could not update student xp/points remotely:", err);
      }

      // Update local state list of students
      setStudents(prev => prev.map(s => s.uid === studentUid ? updatedStudent : s));
    }
  };

  return { students, loading, addStudent, deleteStudent, editStudent, exportResearchData, awardOralRecitation };
}

export function useStudentOralRecitations(uid: string | undefined) {
  const [recitations, setRecitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'oral_recitations'),
      where('userId', '==', uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecitations(docs.sort((a: any, b: any) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime()));
      setLoading(false);
    }, (err) => {
      console.warn("Could not load recitations, using local fallback:", err);
      try {
        const cached = localStorage.getItem(`mathquest_recitations_${uid}`);
        if (cached) {
          setRecitations(JSON.parse(cached));
        }
      } catch (e) {}
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  return { recitations, loading };
}

export function useQuizHistory(uid: string | undefined) {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (!uid) return;
    const fetchResults = async () => {
      try {
        const q = query(collection(db, `users/${uid}/results`));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResult));
        setResults(data);
        try {
          localStorage.setItem(`mathquest_results_${uid}`, JSON.stringify(data));
        } catch (e) {}
      } catch (err) {
        console.warn("Could not fetch remote results, checking local cache:", err);
        const cached = localStorage.getItem(`mathquest_results_${uid}`);
        if (cached) {
          try {
            setResults(JSON.parse(cached));
          } catch (e) {}
        }
      }
    };
    fetchResults();
  }, [uid]);

  const saveResult = async (result: Omit<QuizResult, 'timestamp'>) => {
    if (!uid) return;
    
    // Calculate attempt number
    const previousAttempts = results.filter(r => r.quizId === result.quizId).length;
    const attemptNumber = previousAttempts + 1;

    const res = { ...result, attemptNumber, timestamp: new Date().toISOString() };
    
    // Deeply remove all undefined values to prevent Firestore unsupported field value: undefined errors
    const sanitizedRes = sanitizeForFirestore(res);

    try {
      const docRef = await addDoc(collection(db, `users/${uid}/results`), sanitizedRes);
      
      // If summative transcript exists, also record in top-level summative_transcripts collection for institutional reporting
      if (sanitizedRes.summativeTranscript) {
        try {
          await addDoc(collection(db, 'summative_transcripts'), {
            ...sanitizedRes.summativeTranscript,
            resultDocId: docRef.id,
            syncedAt: new Date().toISOString()
          });
        } catch (subErr) {
          console.warn("Could not save to top-level summative_transcripts collection:", subErr);
        }
      }

      const savedResult = { ...sanitizedRes, id: docRef.id } as QuizResult;
      setResults(prev => {
        const updated = [...prev, savedResult];
        try {
          localStorage.setItem(`mathquest_results_${uid}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } catch (err) {
      console.warn("Firestore saveResult fallback to local storage:", err);
      const localId = 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const savedResult = { ...sanitizedRes, id: localId } as QuizResult;
      setResults(prev => {
        const updated = [...prev, savedResult];
        try {
          localStorage.setItem(`mathquest_results_${uid}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  return { results, saveResult };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data() as UserProfile);
        setLeaderboard(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return { leaderboard, loading };
}

export function useCurriculum() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'curriculum'));
      const querySnapshot = await getDocs(q);
      let data = querySnapshot.docs.map(doc => doc.data() as Topic);
      if (data.length === 0 && initialTopics.length > 0) {
        // Automatically seed initial topics so students and faculty immediately have rich curriculum items
        for (const topic of initialTopics) {
          try {
            await setDoc(doc(db, 'curriculum', topic.id), topic);
          } catch (e) {
            console.error("Auto-seed error for topic:", topic.id, e);
          }
        }
        data = initialTopics;
      }
      setTopics(data);
    } catch (err) {
      console.error("Error fetching curriculum:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const saveTopic = async (topic: Topic) => {
    try {
      await setDoc(doc(db, 'curriculum', topic.id), topic);
      setTopics(prev => {
        const index = prev.findIndex(t => t.id === topic.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = topic;
          return next;
        }
        return [...prev, topic];
      });
    } catch (err) {
      console.error("Error saving topic:", err);
      throw err;
    }
  };

  const deleteTopic = async (topicId: string) => {
    try {
      await deleteDoc(doc(db, 'curriculum', topicId));
      setTopics(prev => prev.filter(t => t.id !== topicId));
    } catch (err) {
      console.error("Error deleting topic:", err);
      throw err;
    }
  };

  const saveProblem = async (topicId: string, quizId: string, problem: Problem) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) throw new Error("Topic not found");
    const quizIndex = topic.quizzes.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error("Quiz not found");

    const updatedQuizzes = [...topic.quizzes];
    const quiz = updatedQuizzes[quizIndex];
    const problemIndex = quiz.problems.findIndex(p => p.id === problem.id);
    const updatedProblems = [...quiz.problems];

    if (problemIndex >= 0) {
      updatedProblems[problemIndex] = problem;
    } else {
      updatedProblems.push(problem);
    }

    updatedQuizzes[quizIndex] = { ...quiz, problems: updatedProblems };
    const updatedTopic = { ...topic, quizzes: updatedQuizzes };
    await saveTopic(updatedTopic);
  };

  const deleteProblem = async (topicId: string, quizId: string, problemId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) throw new Error("Topic not found");
    const quizIndex = topic.quizzes.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error("Quiz not found");

    const updatedQuizzes = [...topic.quizzes];
    const quiz = updatedQuizzes[quizIndex];
    updatedQuizzes[quizIndex] = {
      ...quiz,
      problems: quiz.problems.filter(p => p.id !== problemId)
    };
    const updatedTopic = { ...topic, quizzes: updatedQuizzes };
    await saveTopic(updatedTopic);
  };

  const updateProblemStatus = async (topicId: string, quizId: string, problemId: string, status: ItemStatus) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) throw new Error("Topic not found");
    const quizIndex = topic.quizzes.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error("Quiz not found");

    const updatedQuizzes = [...topic.quizzes];
    const quiz = updatedQuizzes[quizIndex];
    const problemIndex = quiz.problems.findIndex(p => p.id === problemId);
    if (problemIndex === -1) throw new Error("Problem not found");

    const updatedProblems = [...quiz.problems];
    updatedProblems[problemIndex] = { ...updatedProblems[problemIndex], status };
    updatedQuizzes[quizIndex] = { ...quiz, problems: updatedProblems };
    const updatedTopic = { ...topic, quizzes: updatedQuizzes };
    await saveTopic(updatedTopic);
  };

  const importProblems = async (topicId: string, quizId: string, newProblems: Problem[]) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) throw new Error("Topic not found");
    const quizIndex = topic.quizzes.findIndex(q => q.id === quizId);
    if (quizIndex === -1) throw new Error("Quiz not found");

    const updatedQuizzes = [...topic.quizzes];
    const quiz = updatedQuizzes[quizIndex];
    const existingIds = new Set(quiz.problems.map(p => p.id));
    const mergedProblems = [...quiz.problems];

    newProblems.forEach(p => {
      if (existingIds.has(p.id)) {
        const idx = mergedProblems.findIndex(item => item.id === p.id);
        if (idx >= 0) mergedProblems[idx] = p;
      } else {
        mergedProblems.push(p);
      }
    });

    updatedQuizzes[quizIndex] = { ...quiz, problems: mergedProblems };
    const updatedTopic = { ...topic, quizzes: updatedQuizzes };
    await saveTopic(updatedTopic);
  };

  return { 
    topics, 
    loading, 
    saveTopic, 
    deleteTopic, 
    saveProblem, 
    deleteProblem, 
    updateProblemStatus, 
    importProblems, 
    refresh: fetchTopics 
  };
}

export function useItemStatistics() {
  const [statsMap, setStatsMap] = useState<Record<string, ItemStats>>({});
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const problemAggregate: Record<string, {
        timesAnswered: number;
        timesCorrect: number;
        totalResponseTimeMs: number;
        optionCounts: [number, number, number, number];
        scores: { isCorrect: boolean; totalPercent: number }[];
      }> = {};

      for (const userDoc of usersSnapshot.docs) {
        const uid = userDoc.id;
        const resultsSnapshot = await getDocs(collection(db, `users/${uid}/results`));
        
        resultsSnapshot.docs.forEach(resDoc => {
          const resData = resDoc.data();
          const totalPercent = resData.total > 0 ? (resData.score / resData.total) * 100 : 50;

          if (resData.itemResponses && Array.isArray(resData.itemResponses)) {
            resData.itemResponses.forEach((ir: any) => {
              const pid = ir.problemId;
              if (!problemAggregate[pid]) {
                problemAggregate[pid] = {
                  timesAnswered: 0,
                  timesCorrect: 0,
                  totalResponseTimeMs: 0,
                  optionCounts: [0, 0, 0, 0],
                  scores: []
                };
              }
              const agg = problemAggregate[pid];
              agg.timesAnswered += 1;
              if (ir.isCorrect) agg.timesCorrect += 1;
              agg.totalResponseTimeMs += (ir.responseTimeMs || 0);
              if (typeof ir.selectedOption === 'number' && ir.selectedOption >= 0 && ir.selectedOption <= 3) {
                agg.optionCounts[ir.selectedOption] += 1;
              }
              agg.scores.push({
                isCorrect: !!ir.isCorrect,
                totalPercent
              });
            });
          }
        });
      }

      const calculatedMap: Record<string, ItemStats> = {};
      Object.entries(problemAggregate).forEach(([pid, agg]) => {
        const pValue = agg.timesAnswered > 0 ? agg.timesCorrect / agg.timesAnswered : 0;
        const avgResponseTimeMs = agg.timesAnswered > 0 ? agg.totalResponseTimeMs / agg.timesAnswered : 0;
        
        // Approximate discrimination index via point biserial correlation between correctness and test score
        let discriminationIndex = 0.4; // default baseline if few attempts
        if (agg.scores.length >= 3) {
          const meanTotal = agg.scores.reduce((sum, s) => sum + s.totalPercent, 0) / agg.scores.length;
          const correctScores = agg.scores.filter(s => s.isCorrect);
          const incorrectScores = agg.scores.filter(s => !s.isCorrect);
          
          if (correctScores.length > 0 && incorrectScores.length > 0) {
            const meanCorrect = correctScores.reduce((sum, s) => sum + s.totalPercent, 0) / correctScores.length;
            const meanIncorrect = incorrectScores.reduce((sum, s) => sum + s.totalPercent, 0) / incorrectScores.length;
            // Normalized discrimination difference between correct and incorrect groups
            discriminationIndex = Math.min(1.0, Math.max(-0.5, (meanCorrect - meanIncorrect) / 100));
          }
        }

        calculatedMap[pid] = {
          problemId: pid,
          timesAnswered: agg.timesAnswered,
          timesCorrect: agg.timesCorrect,
          pValue: Math.round(pValue * 100) / 100,
          avgResponseTimeMs: Math.round(avgResponseTimeMs),
          optionCounts: agg.optionCounts,
          discriminationIndex: Math.round(discriminationIndex * 100) / 100
        };
      });

      setStatsMap(calculatedMap);
    } catch (err) {
      console.error("Error fetching item statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { statsMap, loading, refreshStats: fetchStats };
}

// Local storage fallback for study requests
const LOCAL_STUDY_REQUESTS_KEY = 'mathquest_local_study_requests_v1';

function getLocalStudyRequests(): StudyRequest[] {
  try {
    const raw = localStorage.getItem(LOCAL_STUDY_REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalStudyRequest(req: StudyRequest) {
  try {
    const all = getLocalStudyRequests();
    const idx = all.findIndex(r => r.id === req.id);
    if (idx >= 0) {
      all[idx] = req;
    } else {
      all.unshift(req);
    }
    localStorage.setItem(LOCAL_STUDY_REQUESTS_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event('mathquest_study_requests_updated'));
  } catch (err) {
    console.warn("Failed to save local study request:", err);
  }
}

export function useStudyRequests(userId: string | undefined) {
  const [incomingRequests, setIncomingRequests] = useState<StudyRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<StudyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync local requests
  const syncLocalRequests = () => {
    if (!userId) return;
    const all = getLocalStudyRequests();
    const incoming = all.filter(r => r.toUserId === userId);
    const outgoing = all.filter(r => r.fromUserId === userId);
    incoming.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    outgoing.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setIncomingRequests(incoming);
    setOutgoingRequests(outgoing);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    syncLocalRequests();

    // Listen to local update events
    const handleLocalUpdate = () => syncLocalRequests();
    window.addEventListener('mathquest_study_requests_updated', handleLocalUpdate);

    // Real-time listener for incoming requests
    const qIncoming = query(
      collection(db, 'study_requests'),
      where('toUserId', '==', userId)
    );

    // Real-time listener for outgoing requests
    const qOutgoing = query(
      collection(db, 'study_requests'),
      where('fromUserId', '==', userId)
    );

    let unsubIncoming: () => void = () => {};
    let unsubOutgoing: () => void = () => {};

    try {
      unsubIncoming = onSnapshot(
        qIncoming,
        (snapshot) => {
          const cloudItems = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as StudyRequest));

          // Merge cloud with local
          const localIncoming = getLocalStudyRequests().filter(r => r.toUserId === userId);
          const map = new Map<string, StudyRequest>();
          localIncoming.forEach(r => map.set(r.id, r));
          cloudItems.forEach(r => map.set(r.id, r));

          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setIncomingRequests(merged);
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore incoming study requests listener note:", err?.message || err);
          syncLocalRequests();
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn("Could not attach incoming requests listener:", e);
      syncLocalRequests();
    }

    try {
      unsubOutgoing = onSnapshot(
        qOutgoing,
        (snapshot) => {
          const cloudItems = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as StudyRequest));

          const localOutgoing = getLocalStudyRequests().filter(r => r.fromUserId === userId);
          const map = new Map<string, StudyRequest>();
          localOutgoing.forEach(r => map.set(r.id, r));
          cloudItems.forEach(r => map.set(r.id, r));

          const merged = Array.from(map.values());
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOutgoingRequests(merged);
        },
        (err) => {
          console.warn("Firestore outgoing study requests listener note:", err?.message || err);
          syncLocalRequests();
        }
      );
    } catch (e) {
      console.warn("Could not attach outgoing requests listener:", e);
    }

    return () => {
      window.removeEventListener('mathquest_study_requests_updated', handleLocalUpdate);
      unsubIncoming();
      unsubOutgoing();
    };
  }, [userId]);

  const sendStudyRequest = async (data: {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    topicId: string;
    topicTitle: string;
    quizId?: string;
    quizTitle?: string;
    message?: string;
  }) => {
    const newId = 'sr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const payload: StudyRequest = {
      id: newId,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveLocalStudyRequest(payload);

    try {
      await addDoc(collection(db, 'study_requests'), sanitizeForFirestore(payload));
    } catch (err) {
      console.warn("Firestore study request cloud sync skipped (saved locally):", err);
    }
    return newId;
  };

  const respondToStudyRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    const all = getLocalStudyRequests();
    const req = all.find(r => r.id === requestId);
    if (req) {
      req.status = status;
      req.updatedAt = new Date().toISOString();
      saveLocalStudyRequest(req);
    }

    try {
      const docRef = doc(db, 'study_requests', requestId);
      await updateDoc(docRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore study request update skipped (saved locally):", err);
    }
  };

  const cancelStudyRequest = async (requestId: string) => {
    const all = getLocalStudyRequests();
    const req = all.find(r => r.id === requestId);
    if (req) {
      req.status = 'cancelled';
      req.updatedAt = new Date().toISOString();
      saveLocalStudyRequest(req);
    }

    try {
      const docRef = doc(db, 'study_requests', requestId);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore cancel study request skipped:", err);
    }
  };

  const completeStudyRequest = async (requestId: string) => {
    const all = getLocalStudyRequests();
    const req = all.find(r => r.id === requestId);
    if (req) {
      req.status = 'completed';
      req.updatedAt = new Date().toISOString();
      saveLocalStudyRequest(req);
    }

    try {
      const docRef = doc(db, 'study_requests', requestId);
      await updateDoc(docRef, {
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Firestore complete study request skipped:", err);
    }
  };

  const pendingIncomingCount = incomingRequests.filter(r => r.status === 'pending').length;

  return {
    incomingRequests,
    outgoingRequests,
    pendingIncomingCount,
    loading,
    sendStudyRequest,
    respondToStudyRequest,
    cancelStudyRequest,
    completeStudyRequest
  };
}

export function usePeers(currentUserId: string | undefined) {
  const [peers, setPeers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defaultSamplePeers: UserProfile[] = [
      {
        uid: 'sample-student-1',
        displayName: 'Alex Chen',
        email: 'alex.chen@school.edu',
        role: 'student',
        xp: 450,
        level: 3,
        streak: 4,
        lastActive: new Date().toISOString(),
        badges: ['first-quiz', 'streak-3'],
        mathAbility: 'Proficient'
      },
      {
        uid: 'sample-student-2',
        displayName: 'Maria Santos',
        email: 'maria.santos@school.edu',
        role: 'student',
        xp: 720,
        level: 4,
        streak: 7,
        lastActive: new Date().toISOString(),
        badges: ['first-quiz', 'streak-7', 'perfect-score'],
        mathAbility: 'Advanced'
      },
      {
        uid: 'sample-student-3',
        displayName: 'Liam Reyes',
        email: 'liam.reyes@school.edu',
        role: 'student',
        xp: 320,
        level: 2,
        streak: 2,
        lastActive: new Date().toISOString(),
        badges: ['first-quiz'],
        mathAbility: 'Developing'
      }
    ];

    const fetchPeers = async () => {
      setLoading(true);
      // 1. Gather local accounts
      const localStudents = getLocalUsers()
        .filter(u => u.role === 'student' && u.uid !== currentUserId);

      // Start with combined local + default sample peers
      const peerMap = new Map<string, UserProfile>();
      defaultSamplePeers.forEach(sp => peerMap.set(sp.uid, sp));
      localStudents.forEach(ls => peerMap.set(ls.uid, ls));

      setPeers(Array.from(peerMap.values()));

      // 2. Query Firestore if available
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const snap = await getDocs(q);
        snap.docs.forEach(d => {
          const u = d.data() as UserProfile;
          if (u.uid && u.uid !== currentUserId) {
            peerMap.set(u.uid, u);
          }
        });
        setPeers(Array.from(peerMap.values()));
      } catch (err) {
        console.warn("Firestore peers lookup note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeers();
  }, [currentUserId]);

  return { peers, loading };
}

export function useVideoLectures() {
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'videoLectures'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: VideoLecture[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as VideoLecture);
      });
      // Fallback sample lectures if none exist yet
      if (items.length === 0) {
        items.push(
          {
            id: 'sample-lec-1',
            title: 'Introduction to Limits and Continuity',
            description: 'Core concepts of limits, left-hand and right-hand limits, and continuous functions for Grade 11 STEM.',
            youtubeId: 'kfokwixpHbs',
            topicId: 'limits',
            topicTitle: 'Limits & Continuity',
            grade: 'Grade 11',
            section: 'STEM-A',
            createdAt: new Date().toISOString()
          },
          {
            id: 'sample-lec-2',
            title: 'Derivative Rules & Instantaneous Rates of Change',
            description: 'Master the power rule, product rule, and quotient rule with step-by-step faculty guidance.',
            youtubeId: 'ANyVdBEDpjI',
            topicId: 'calculus',
            topicTitle: 'Differential Calculus',
            grade: 'Grade 11',
            section: 'STEM-A',
            createdAt: new Date().toISOString()
          }
        );
      }
      setLectures(items);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching video lectures:", err);
      // Fallback sample lectures on error
      setLectures([
        {
          id: 'sample-lec-1',
          title: 'Introduction to Limits and Continuity',
          description: 'Core concepts of limits, left-hand and right-hand limits, and continuous functions for Grade 11 STEM.',
          youtubeId: 'kfokwixpHbs',
          topicId: 'limits',
          topicTitle: 'Limits & Continuity',
          grade: 'Grade 11',
          section: 'STEM-A',
          createdAt: new Date().toISOString()
        }
      ]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addLecture = async (lecture: Omit<VideoLecture, 'id' | 'createdAt'>) => {
    try {
      const newRef = doc(collection(db, 'videoLectures'));
      const newLecture: VideoLecture = {
        ...lecture,
        id: newRef.id,
        createdAt: new Date().toISOString()
      };
      await setDoc(newRef, newLecture);
    } catch (err) {
      console.error("Error adding video lecture:", err);
      throw err;
    }
  };

  const deleteLecture = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'videoLectures', id));
    } catch (err) {
      console.error("Error deleting video lecture:", err);
      throw err;
    }
  };

  return { lectures, loading, addLecture, deleteLecture };
}

export function usePresentations(gradeFilter?: string, sectionFilter?: string, topicFilter?: string) {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'presentations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Presentation[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Presentation);
      });

      // If database is currently empty, serve the default curriculum presentations
      if (items.length === 0) {
        setPresentations(initialPresentations);
      } else {
        setPresentations(items);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching presentations:", err);
      // Fallback to initial presentations if offline or rules issue
      setPresentations(initialPresentations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPresentation = async (presentation: Omit<Presentation, 'id' | 'createdAt'>) => {
    try {
      const newRef = doc(collection(db, 'presentations'));
      const newPresentation: Presentation = {
        ...presentation,
        id: newRef.id,
        createdAt: new Date().toISOString(),
        viewsCount: 0,
        completionsCount: 0
      };
      await setDoc(newRef, newPresentation);
      return newPresentation;
    } catch (err) {
      console.error("Error adding presentation:", err);
      // Fallback local update if offline
      const newPresentation: Presentation = {
        ...presentation,
        id: `pres-${Date.now()}`,
        createdAt: new Date().toISOString(),
        viewsCount: 0,
        completionsCount: 0
      };
      setPresentations(prev => [newPresentation, ...prev]);
      return newPresentation;
    }
  };

  const updatePresentation = async (id: string, updates: Partial<Presentation>) => {
    try {
      const docRef = doc(db, 'presentations', id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error("Error updating presentation:", err);
      setPresentations(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const deletePresentation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'presentations', id));
    } catch (err) {
      console.error("Error deleting presentation:", err);
      setPresentations(prev => prev.filter(p => p.id !== id));
    }
  };

  const recordPresentationView = async (record: Omit<PresentationViewRecord, 'id'>) => {
    try {
      const viewRef = doc(collection(db, 'presentation_views'));
      const viewData: PresentationViewRecord = {
        ...record,
        id: viewRef.id
      };
      await setDoc(viewRef, viewData);

      // Increment presentation stats
      const presRef = doc(db, 'presentations', record.presentationId);
      const updates: any = { viewsCount: increment(1) };
      if (record.isCompleted) {
        updates.completionsCount = increment(1);
      }
      await updateDoc(presRef, updates).catch(() => {});
    } catch (err) {
      console.error("Error recording presentation view:", err);
    }
  };

  const filteredPresentations = presentations.filter(p => {
    if (gradeFilter && gradeFilter !== 'All' && p.grade !== gradeFilter) return false;
    if (sectionFilter && sectionFilter !== 'All' && p.section !== sectionFilter) return false;
    if (topicFilter && topicFilter !== 'All' && p.topicId !== topicFilter) return false;
    return true;
  });

  return { 
    presentations: filteredPresentations, 
    allPresentations: presentations,
    loading, 
    addPresentation, 
    updatePresentation, 
    deletePresentation, 
    recordPresentationView 
  };
}

export function usePresentationAnalytics() {
  const [viewRecords, setViewRecords] = useState<PresentationViewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'presentation_views'), orderBy('startedAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: PresentationViewRecord[] = [];
      snapshot.forEach(doc => {
        records.push({ id: doc.id, ...doc.data() } as PresentationViewRecord);
      });
      setViewRecords(records);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching presentation analytics:", err);
      setViewRecords([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { viewRecords, loading };
}


