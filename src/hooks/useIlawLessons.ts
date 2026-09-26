import { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { LessonPlan } from '../types';
import { ILAW_LESSON_PLANS } from '../data/ilawLessons';

const PRIMARY_STORAGE_KEY = 'leavien_ilaw_lessons';
const LEGACY_STORAGE_KEY = 'mathquest_ilaw_lessons';
const PRIMARY_DELETED_KEY = 'leavien_ilaw_deleted_ids';
const LEGACY_DELETED_KEY = 'mathquest_ilaw_deleted_ids';
const EVENT_NAME = 'leavien_ilaw_lessons_updated';
const LEGACY_EVENT_NAME = 'mathquest_ilaw_lessons_updated';

export function useIlawLessons() {
  const [lessons, setLessons] = useState<LessonPlan[]>(() => {
    // Initial sync from defaults + localStorage
    return loadMergedLocalLessons();
  });
  const [loading, setLoading] = useState(true);

  function loadMergedLocalLessons(): LessonPlan[] {
    const defaults = Object.values(ILAW_LESSON_PLANS);
    try {
      const deletedRaw = localStorage.getItem(PRIMARY_DELETED_KEY) || localStorage.getItem(LEGACY_DELETED_KEY);
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

      const localRaw = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      const localCustoms: LessonPlan[] = localRaw ? JSON.parse(localRaw) : [];

      // Start with non-deleted defaults
      const mergedMap = new Map<string, LessonPlan>();
      for (const def of defaults) {
        if (!deletedIds.has(def.id) && !deletedIds.has(def.topicId)) {
          mergedMap.set(def.id, {
            ...def,
            status: def.status || 'Published',
            updatedAt: def.updatedAt || 'Baseline DepEd Exemplar'
          });
        }
      }

      // Merge local customs / edits
      for (const custom of localCustoms) {
        if (!deletedIds.has(custom.id)) {
          mergedMap.set(custom.id, {
            ...custom,
            status: custom.status || 'Published'
          });
        }
      }

      return Array.from(mergedMap.values());
    } catch (e) {
      console.warn('Could not parse local ILAW lessons:', e);
      return defaults;
    }
  }

  const syncFromSources = useCallback(async () => {
    setLoading(true);
    const localMerged = loadMergedLocalLessons();
    setLessons(localMerged);

    try {
      // Attempt remote Firestore sync
      const querySnapshot = await getDocs(collection(db, 'ilaw_lessons'));
      if (!querySnapshot.empty) {
        const firestoreLessons = querySnapshot.docs.map(d => d.data() as LessonPlan);
        
        // Merge with defaults & local
        const defaults = Object.values(ILAW_LESSON_PLANS);
        const deletedRaw = localStorage.getItem(PRIMARY_DELETED_KEY) || localStorage.getItem(LEGACY_DELETED_KEY);
        const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

        const map = new Map<string, LessonPlan>();
        for (const def of defaults) {
          if (!deletedIds.has(def.id) && !deletedIds.has(def.topicId)) {
            map.set(def.id, {
              ...def,
              status: def.status || 'Published',
              updatedAt: def.updatedAt || 'Baseline DepEd Exemplar'
            });
          }
        }

        // Firestore lessons override or add
        for (const fLesson of firestoreLessons) {
          if (!deletedIds.has(fLesson.id)) {
            map.set(fLesson.id, {
              ...fLesson,
              status: fLesson.status || 'Published'
            });
          }
        }

        const finalMerged = Array.from(map.values());
        setLessons(finalMerged);
        
        // Save remote customs locally for offline access
        const customOnly = finalMerged.filter(l => 
          !ILAW_LESSON_PLANS[l.topicId] || ILAW_LESSON_PLANS[l.topicId]?.id !== l.id || JSON.stringify(l) !== JSON.stringify(ILAW_LESSON_PLANS[l.topicId])
        );
        try {
          localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(customOnly));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Remote Firestore ILAW lessons fetch deferred, using cached local data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncFromSources();

    const handleStorageChange = () => {
      setLessons(loadMergedLocalLessons());
    };

    window.addEventListener(EVENT_NAME, handleStorageChange);
    window.addEventListener(LEGACY_EVENT_NAME, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorageChange);
      window.removeEventListener(LEGACY_EVENT_NAME, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncFromSources]);

  const saveIlawLesson = async (lessonData: Partial<LessonPlan> & { title: string }): Promise<LessonPlan> => {
    const isNew = !lessonData.id || lessonData.id.startsWith('new-');
    const id = isNew ? `ilaw-${Date.now()}` : lessonData.id!;
    const existingLesson = lessons.find(l => l.id === id || (!isNew && l.topicId === lessonData.topicId));
    const topicId = lessonData.topicId || existingLesson?.topicId || `topic-${id}`;

    const formattedTime = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Ensure full LessonPlan structure with ILAW framework
    const completeLesson: LessonPlan = {
      ...existingLesson,
      ...lessonData,
      id,
      topicId,
      title: lessonData.title.trim(),
      gradeLevel: lessonData.gradeLevel || existingLesson?.gradeLevel || 'Grade 11 - General Mathematics',
      duration: lessonData.duration || existingLesson?.duration || '60 minutes',
      subject: lessonData.subject || existingLesson?.subject || 'General Mathematics',
      term: lessonData.term || existingLesson?.term || 'Term 1',
      week: lessonData.week || existingLesson?.week || 'Week 1',
      section: lessonData.section || existingLesson?.section || 'Grade 11 – Gauss (STEM-A)',
      doOrderRef: lessonData.doOrderRef || existingLesson?.doOrderRef || 'DepEd MATATAG / D.O. No. 016, s. 2024',
      framework: 'ILAW',
      status: lessonData.status || existingLesson?.status || 'Published',
      updatedAt: lessonData.updatedAt || formattedTime,
      dates: lessonData.dates || existingLesson?.dates || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      prerequisites: lessonData.prerequisites || existingLesson?.prerequisites || ['Foundational Algebra', 'Number Operations'],
      learningCompetencies: lessonData.learningCompetencies || existingLesson?.learningCompetencies || [
        lessonData.ilaw?.intentions?.competencies?.[0] || 'Applies mathematical models to solve real-world problems.'
      ],
      objectives: lessonData.objectives || existingLesson?.objectives || {
        cognitive: lessonData.ilaw?.intentions?.learningIntentions || 'Understand core definitions and solve equations.',
        psychomotor: 'Perform step-by-step mathematical procedures accurately.',
        affective: 'Appreciate the practical utility of mathematics in everyday decision making.'
      },
      materialsNeeded: lessonData.materialsNeeded || existingLesson?.materialsNeeded || [
        'DepEd General Mathematics Learning Exemplar',
        'Scientific calculators & graph paper',
        'Leavien AI Assessment Portal'
      ],
      keyConcepts: lessonData.keyConcepts || existingLesson?.keyConcepts || [
        { term: lessonData.title, definition: 'Foundational Grade 11 mathematical concept.' }
      ],
      workedExamples: lessonData.workedExamples || existingLesson?.workedExamples || [
        {
          title: `Sample Worked Problem: ${lessonData.title}`,
          problem: 'State and evaluate the fundamental mathematical conditions.',
          stepByStepSolution: [
            'Step 1: Identify all given variables and constraints.',
            'Step 2: Apply the appropriate mathematical formula or property.',
            'Step 3: Simplify and verify the final evaluated value.'
          ]
        }
      ],
      procedures: lessonData.procedures || existingLesson?.procedures || [
        {
          phase: 'Motivation / Priming',
          durationMinutes: 10,
          teacherActivity: lessonData.ilaw?.learningExperience?.primingActivity || 'Introduce real-world scenario priming hook.',
          studentActivity: 'Participate in group brainstorming.',
          ilawPillar: 'L - Learning Experience'
        },
        {
          phase: 'Direct Instruction',
          durationMinutes: 20,
          teacherActivity: lessonData.ilaw?.learningExperience?.coreInstruction || 'Present core definitions, formulas, and derivations.',
          studentActivity: 'Follow step-by-step demonstrations and log notes.',
          ilawPillar: 'L - Learning Experience'
        },
        {
          phase: 'Guided Practice',
          durationMinutes: 15,
          teacherActivity: lessonData.ilaw?.learningExperience?.guidedExercises || 'Guide collaborative exercises and board work.',
          studentActivity: 'Work in pairs to solve practice exercises.',
          ilawPillar: 'L - Learning Experience'
        },
        {
          phase: 'Independent Practice / Assessment',
          durationMinutes: 10,
          teacherActivity: 'Administer 5-item formative quiz and evaluate proficiency.',
          studentActivity: 'Complete formative check.',
          ilawPillar: 'A - Assessing Learning'
        },
        {
          phase: 'Generalization & Homework',
          durationMinutes: 5,
          teacherActivity: lessonData.ilaw?.waysForward?.nextSteps || 'Summarize key concepts and assign reflection.',
          studentActivity: 'Log takeaways in lesson journal.',
          ilawPillar: 'W - Ways Forward'
        }
      ],
      differentiation: lessonData.differentiation || existingLesson?.differentiation || {
        remediation: lessonData.ilaw?.waysForward?.remediationAction || 'Targeted 7-step review pathway.',
        enrichment: lessonData.ilaw?.waysForward?.enrichmentChallenge || 'Advanced modeling sprint challenges.'
      },
      assessmentPlan: lessonData.assessmentPlan || existingLesson?.assessmentPlan || lessonData.ilaw?.assessingLearning?.formativeAssessment || 'Formative diagnostic check with 75% benchmark.',
      weeklySchedule: lessonData.weeklySchedule || existingLesson?.weeklySchedule || [
        { day: 'MONDAY', date: 'Day 1', lessonTitle: `Introduction to ${lessonData.title}`, activityType: 'Whole Class' },
        { day: 'TUESDAY', date: 'Day 2', lessonTitle: 'Core Formulas and Derivations', activityType: 'Direct Instruction' },
        { day: 'WEDNESDAY', date: 'Day 3', lessonTitle: 'Guided Collaborative Practice', activityType: 'Pair Work' },
        { day: 'THURSDAY', date: 'Day 4', lessonTitle: 'Contextual Word Problems', activityType: 'Group Work' },
        { day: 'FRIDAY', date: 'Day 5', lessonTitle: 'Summative & Formative Assessment', activityType: 'Individual Work' }
      ],
      ilaw: {
        intentions: {
          learningIntentions: lessonData.ilaw?.intentions?.learningIntentions || existingLesson?.ilaw?.intentions?.learningIntentions || 'Master fundamental principles and problem solving.',
          successCriteria: lessonData.ilaw?.intentions?.successCriteria || existingLesson?.ilaw?.intentions?.successCriteria || [
            'Differentiate between core conditions and models.',
            'Evaluate expressions with high accuracy.',
            'Solve real-world contextual situational problems.'
          ],
          competencies: lessonData.ilaw?.intentions?.competencies || existingLesson?.ilaw?.intentions?.competencies || [
            'M11GM-Ia-1: Represents real-life situations using mathematical functions.'
          ],
          priorKnowledge: lessonData.ilaw?.intentions?.priorKnowledge || existingLesson?.ilaw?.intentions?.priorKnowledge || 'Foundational arithmetic and algebraic equations.'
        },
        learningExperience: {
          primingActivity: lessonData.ilaw?.learningExperience?.primingActivity || existingLesson?.ilaw?.learningExperience?.primingActivity || 'Real-world priming scenario engaging student intuition.',
          coreInstruction: lessonData.ilaw?.learningExperience?.coreInstruction || existingLesson?.ilaw?.learningExperience?.coreInstruction || 'Teacher-led conceptual modeling and algebraic derivations.',
          guidedExercises: lessonData.ilaw?.learningExperience?.guidedExercises || existingLesson?.ilaw?.learningExperience?.guidedExercises || 'Collaborative problem solving and board demonstrations.',
          keyFormulas: lessonData.ilaw?.learningExperience?.keyFormulas || existingLesson?.ilaw?.learningExperience?.keyFormulas || [
            { name: 'Core Formula', formula: 'f(x) = y', explanation: 'Mathematical transformation mapping inputs to outputs.' }
          ]
        },
        assessingLearning: {
          formativeAssessment: lessonData.ilaw?.assessingLearning?.formativeAssessment || existingLesson?.ilaw?.assessingLearning?.formativeAssessment || '5-question immediate feedback quiz with step-by-step remediation hints.',
          diagnosticQuizPlan: lessonData.ilaw?.assessingLearning?.diagnosticQuizPlan || existingLesson?.ilaw?.assessingLearning?.diagnosticQuizPlan || '5-item adaptive baseline diagnostic check.',
          successThreshold: lessonData.ilaw?.assessingLearning?.successThreshold || existingLesson?.ilaw?.assessingLearning?.successThreshold || '80% mastery benchmark.',
          summativeAssessmentPlan: lessonData.ilaw?.assessingLearning?.summativeAssessmentPlan || existingLesson?.ilaw?.assessingLearning?.summativeAssessmentPlan || '10-item unit summative exam aligned with Table of Specifications (TOS).'
        },
        waysForward: {
          nextSteps: lessonData.ilaw?.waysForward?.nextSteps || existingLesson?.ilaw?.waysForward?.nextSteps || 'Student reflection entry in learning journal on real-world connections.',
          remediationAction: lessonData.ilaw?.waysForward?.remediationAction || existingLesson?.ilaw?.waysForward?.remediationAction || 'Targeted 7-step review pathway and scaffolded substitution templates.',
          enrichmentChallenge: lessonData.ilaw?.waysForward?.enrichmentChallenge || existingLesson?.ilaw?.waysForward?.enrichmentChallenge || 'Higher-order modeling challenge and Olympiad-style math sprint.',
          realWorldCareers: lessonData.ilaw?.waysForward?.realWorldCareers || existingLesson?.ilaw?.waysForward?.realWorldCareers || ['Software Engineering', 'Financial Analysis', 'Data Science', 'Actuarial Science']
        }
      }
    };

    // 1. Remove from deleted IDs if present
    try {
      for (const delKey of [PRIMARY_DELETED_KEY, LEGACY_DELETED_KEY]) {
        const deletedRaw = localStorage.getItem(delKey);
        if (deletedRaw) {
          const deletedSet = new Set<string>(JSON.parse(deletedRaw));
          deletedSet.delete(id);
          deletedSet.delete(topicId);
          localStorage.setItem(delKey, JSON.stringify(Array.from(deletedSet)));
        }
      }
    } catch (e) {}

    // 2. Save in localStorage
    try {
      const localRaw = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      const customs: LessonPlan[] = localRaw ? JSON.parse(localRaw) : [];
      const existingIdx = customs.findIndex(c => c.id === id || c.topicId === topicId);
      if (existingIdx >= 0) {
        customs[existingIdx] = completeLesson;
      } else {
        customs.unshift(completeLesson);
      }
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(customs));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(customs));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    // 3. Update React state immediately
    setLessons(prev => {
      const idx = prev.findIndex(l => l.id === id || l.topicId === topicId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = completeLesson;
        return updated;
      }
      return [completeLesson, ...prev];
    });

    // 4. Background save to Firestore
    try {
      await setDoc(doc(db, 'ilaw_lessons', id), sanitizeForFirestore(completeLesson), { merge: true });
    } catch (err) {
      console.warn('Remote Firestore ILAW lesson sync skipped (saved locally):', err);
    }

    // 5. Notify other components
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: completeLesson }));
    window.dispatchEvent(new CustomEvent(LEGACY_EVENT_NAME, { detail: completeLesson }));

    return completeLesson;
  };

  const deleteIlawLesson = async (lessonId: string): Promise<void> => {
    // 1. Find lesson to delete
    const lesson = lessons.find(l => l.id === lessonId);
    const topicId = lesson?.topicId;

    // 2. Mark as deleted in localStorage so defaults don't reappear
    try {
      for (const delKey of [PRIMARY_DELETED_KEY, LEGACY_DELETED_KEY]) {
        const deletedRaw = localStorage.getItem(delKey);
        const deletedSet = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
        deletedSet.add(lessonId);
        if (topicId) deletedSet.add(topicId);
        localStorage.setItem(delKey, JSON.stringify(Array.from(deletedSet)));
      }

      // Remove from custom local storage list
      for (const storKey of [PRIMARY_STORAGE_KEY, LEGACY_STORAGE_KEY]) {
        const localRaw = localStorage.getItem(storKey);
        if (localRaw) {
          const customs: LessonPlan[] = JSON.parse(localRaw);
          const filtered = customs.filter(c => c.id !== lessonId && c.topicId !== topicId);
          localStorage.setItem(storKey, JSON.stringify(filtered));
        }
      }
    } catch (e) {}

    // 3. Update React state immediately
    setLessons(prev => prev.filter(l => l.id !== lessonId && l.topicId !== topicId));

    // 4. Remote Firestore deletion
    try {
      await deleteDoc(doc(db, 'ilaw_lessons', lessonId));
    } catch (err) {
      console.warn('Remote Firestore ILAW lesson delete skipped:', err);
    }

    // 5. Notify other components
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { deletedId: lessonId } }));
    window.dispatchEvent(new CustomEvent(LEGACY_EVENT_NAME, { detail: { deletedId: lessonId } }));
  };

  const duplicateIlawLesson = async (lessonId: string): Promise<LessonPlan | null> => {
    const source = lessons.find(l => l.id === lessonId);
    if (!source) return null;

    const clone: Partial<LessonPlan> & { title: string } = {
      ...source,
      id: `ilaw-${Date.now()}`,
      topicId: source.topicId ? `${source.topicId}-copy-${Date.now().toString().slice(-4)}` : `topic-${Date.now()}`,
      title: `${source.title} (Copy)`,
      status: 'Draft',
      updatedAt: 'Just now (Cloned Draft)'
    };

    return await saveIlawLesson(clone);
  };

  const togglePublishStatus = async (lessonId: string): Promise<LessonPlan | null> => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;

    const newStatus = lesson.status === 'Draft' ? 'Published' : 'Draft';
    return await saveIlawLesson({
      ...lesson,
      status: newStatus,
      updatedAt: newStatus === 'Published' ? 'Published just now' : 'Moved to draft'
    });
  };

  const resetToDefaults = async (): Promise<void> => {
    try {
      localStorage.removeItem(PRIMARY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(PRIMARY_DELETED_KEY);
      localStorage.removeItem(LEGACY_DELETED_KEY);
    } catch (e) {}

    const defaults = Object.values(ILAW_LESSON_PLANS).map(d => ({
      ...d,
      status: 'Published' as const,
      updatedAt: 'Baseline DepEd Exemplar'
    }));
    setLessons(defaults);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { reset: true } }));
    window.dispatchEvent(new CustomEvent(LEGACY_EVENT_NAME, { detail: { reset: true } }));
  };

  return {
    lessons,
    loading,
    saveIlawLesson,
    deleteIlawLesson,
    duplicateIlawLesson,
    togglePublishStatus,
    resetToDefaults,
    refreshLessons: syncFromSources
  };
}
