import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, collection, addDoc, query, where, getDocs, orderBy, limit, deleteDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile, QuizResult, Topic, LearningPathway, Problem, ItemStatus, ItemStats, StudyRequest, VideoLecture } from '../types';
import { topics as initialTopics } from '../data/curriculum';

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
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
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Profile doesn't exist, we'll let the UI handle role selection before creating it
          setProfile(null);
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to connect to database");
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

  const createProfile = async (role: 'student' | 'faculty', customDisplayName?: string, lrn?: string) => {
    if (!uid) return;
    const newProfile: UserProfile = {
      uid,
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
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  const updateDisplayName = async (newName: string) => {
    if (!uid || !profile) return;
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, { displayName: newName });
      setProfile(prev => prev ? { ...prev, displayName: newName } : null);
    } catch (err) {
      console.error("Error updating display name:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  const updateProfileDetails = async (newName: string, grade: string, section: string, lrn?: string) => {
    if (!uid || !profile) return;
    try {
      const docRef = doc(db, 'users', uid);
      const updateData: Record<string, any> = { displayName: newName, grade, section };
      if (lrn !== undefined) {
        updateData.lrn = lrn;
      }
      await updateDoc(docRef, updateData);
      setProfile(prev => prev ? { ...prev, displayName: newName, grade, section, ...(lrn !== undefined ? { lrn } : {}) } : null);
    } catch (err) {
      console.error("Error updating profile details:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  const addXP = async (amount: number) => {
    if (!uid || !profile) return;
    try {
      const docRef = doc(db, 'users', uid);
      
      // Streak Logic
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
      
      await updateDoc(docRef, {
        xp: increment(totalAmount),
        level: newLevel,
        streak: newStreak,
        lastActive: now.toISOString()
      });

      setProfile(prev => prev ? { 
        ...prev, 
        xp: prev.xp + totalAmount, 
        level: newLevel,
        streak: newStreak,
        lastActive: now.toISOString()
      } : null);
      
      return bonusXP;
    } catch (err) {
      console.error("Error adding XP:", err);
      return 0;
    }
  };

  const unlockBadge = async (badgeId: string) => {
    if (!uid || !profile || profile.badges.includes(badgeId)) return;
    try {
      const docRef = doc(db, 'users', uid);
      const newBadges = [...profile.badges, badgeId];
      await updateDoc(docRef, {
        badges: newBadges
      });
      setProfile(prev => prev ? { ...prev, badges: newBadges } : null);
    } catch (err) {
      console.error("Error unlocking badge:", err);
    }
  };

  const saveDiagnosticResult = async (ability: string, scores: Record<string, number>, pathway?: LearningPathway) => {
    if (!uid || !profile) return;
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        diagnosticCompleted: true,
        diagnosticAbility: ability,
        diagnosticScores: scores,
        ...(pathway ? { activePathway: pathway } : {})
      });
      setProfile(prev => prev ? {
        ...prev,
        diagnosticCompleted: true,
        diagnosticAbility: ability,
        diagnosticScores: scores,
        ...(pathway ? { activePathway: pathway } : {})
      } : null);
    } catch (err) {
      console.error("Error saving diagnostic:", err);
    }
  };

  const savePathwayProgress = async (pathway: LearningPathway | null) => {
    if (!uid || !profile) return;
    try {
      const docRef = doc(db, 'users', uid);
      if (pathway === null) {
        await updateDoc(docRef, { activePathway: null });
        setProfile(prev => prev ? { ...prev, activePathway: undefined } : null);
      } else {
        await updateDoc(docRef, { activePathway: pathway });
        setProfile(prev => prev ? { ...prev, activePathway: pathway } : null);
      }
    } catch (err) {
      console.error("Error saving pathway:", err);
    }
  };

  return { profile, loading, error, addXP, unlockBadge, createProfile, updateDisplayName, updateProfileDetails, saveDiagnosticResult, savePathwayProgress };
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
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const addStudent = async (studentData: Partial<UserProfile>) => {
    // This creates a placeholder student record
    const dummyId = Math.random().toString(36).substring(7);
    const newStudent: UserProfile = {
      uid: dummyId,
      displayName: studentData.displayName || 'New Student',
      email: studentData.email || '',
      role: 'student',
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date().toISOString(),
      badges: [],
      ...studentData
    };
    await setDoc(doc(db, 'users', dummyId), newStudent);
    setStudents(prev => [...prev, newStudent]);
  };

  const deleteStudent = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setStudents(prev => prev.filter(s => s.uid !== uid));
    } catch (err) {
      console.error("Error deleting student:", err);
      throw err;
    }
  };

  const editStudent = async (uid: string, updates: Partial<UserProfile>) => {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, updates);
      setStudents(prev => prev.map(s => s.uid === uid ? { ...s, ...updates } : s));
    } catch (err) {
      console.error("Error updating student:", err);
      throw err;
    }
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

  return { students, loading, addStudent, deleteStudent, editStudent, exportResearchData };
}

export function useQuizHistory(uid: string | undefined) {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (!uid) return;
    const fetchResults = async () => {
      const q = query(collection(db, `users/${uid}/results`));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResult));
      setResults(data);
    };
    fetchResults();
  }, [uid]);

  const saveResult = async (result: Omit<QuizResult, 'timestamp'>) => {
    if (!uid) return;
    
    // Calculate attempt number
    const previousAttempts = results.filter(r => r.quizId === result.quizId).length;
    const attemptNumber = previousAttempts + 1;

    const res = { ...result, attemptNumber, timestamp: new Date().toISOString() };
    
    // Remove undefined values to prevent Firestore errors
    Object.keys(res).forEach(key => {
      if ((res as any)[key] === undefined) {
        delete (res as any)[key];
      }
    });

    const docRef = await addDoc(collection(db, `users/${uid}/results`), res);
    const savedResult = { ...res, id: docRef.id } as QuizResult;
    setResults(prev => [...prev, savedResult]);
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

export function useStudyRequests(userId: string | undefined) {
  const [incomingRequests, setIncomingRequests] = useState<StudyRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<StudyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);

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

    const unsubIncoming = onSnapshot(
      qIncoming,
      (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as StudyRequest));
        // Sort newest first
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setIncomingRequests(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to incoming study requests:", err);
        setLoading(false);
      }
    );

    const unsubOutgoing = onSnapshot(
      qOutgoing,
      (snapshot) => {
        const items = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as StudyRequest));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOutgoingRequests(items);
      },
      (err) => {
        console.error("Error subscribing to outgoing study requests:", err);
      }
    );

    return () => {
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
    const payload: Omit<StudyRequest, 'id'> = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'study_requests'), payload);
    return docRef.id;
  };

  const respondToStudyRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    const docRef = doc(db, 'study_requests', requestId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  };

  const cancelStudyRequest = async (requestId: string) => {
    const docRef = doc(db, 'study_requests', requestId);
    await updateDoc(docRef, {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });
  };

  const completeStudyRequest = async (requestId: string) => {
    try {
      const docRef = doc(db, 'study_requests', requestId);
      await updateDoc(docRef, {
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error marking study request as completed:", err);
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
    const fetchPeers = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const snap = await getDocs(q);
        let studentUsers = snap.docs
          .map(d => d.data() as UserProfile)
          .filter(u => u.uid !== currentUserId);

        // Demo peer fallback if not enough real accounts exist yet
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

        // Merge real students first, and supplement with sample peers if none or few
        if (studentUsers.length === 0) {
          studentUsers = defaultSamplePeers;
        } else {
          // If there are real users, also include sample peers who don't collide with existing IDs
          const existingUids = new Set(studentUsers.map(s => s.uid));
          defaultSamplePeers.forEach(sp => {
            if (!existingUids.has(sp.uid)) {
              studentUsers.push(sp);
            }
          });
        }

        setPeers(studentUsers);
      } catch (err) {
        console.error("Error fetching peers:", err);
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

