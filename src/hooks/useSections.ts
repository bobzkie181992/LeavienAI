import { useState, useEffect, useCallback } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { Grade11Section, GRADE_11_SECTIONS } from '../data/grade11SampleData';

const PRIMARY_STORAGE_KEY = 'leavien_grade11_sections';
const PRIMARY_DELETED_KEY = 'leavien_sections_deleted_ids';
const EVENT_NAME = 'leavien_sections_updated';

export function useSections() {
  const [sections, setSections] = useState<Grade11Section[]>(() => {
    return loadMergedLocalSections();
  });
  const [loading, setLoading] = useState(true);

  function loadMergedLocalSections(): Grade11Section[] {
    const defaults = GRADE_11_SECTIONS;
    try {
      const deletedRaw = localStorage.getItem(PRIMARY_DELETED_KEY);
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

      const localRaw = localStorage.getItem(PRIMARY_STORAGE_KEY);
      const localCustoms: Grade11Section[] = localRaw ? JSON.parse(localRaw) : [];

      const map = new Map<string, Grade11Section>();
      // Baseline defaults that have not been deleted
      for (const def of defaults) {
        if (!deletedIds.has(def.id)) {
          map.set(def.id, def);
        }
      }

      // Merge local additions / edits
      for (const custom of localCustoms) {
        if (!deletedIds.has(custom.id)) {
          map.set(custom.id, custom);
        }
      }

      return Array.from(map.values());
    } catch (e) {
      console.warn('Could not parse local sections:', e);
      return defaults;
    }
  }

  const syncFromSources = useCallback(async () => {
    setLoading(true);
    const localMerged = loadMergedLocalSections();
    setSections(localMerged);

    try {
      // Attempt remote Firestore sync
      const querySnapshot = await getDocs(collection(db, 'sections'));
      if (!querySnapshot.empty) {
        const firestoreSections = querySnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as Grade11Section));

        const defaults = GRADE_11_SECTIONS;
        const deletedRaw = localStorage.getItem(PRIMARY_DELETED_KEY);
        const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);

        const map = new Map<string, Grade11Section>();
        for (const def of defaults) {
          if (!deletedIds.has(def.id)) {
            map.set(def.id, def);
          }
        }

        for (const fSec of firestoreSections) {
          if (!deletedIds.has(fSec.id)) {
            map.set(fSec.id, fSec);
          }
        }

        const finalMerged = Array.from(map.values());
        setSections(finalMerged);

        // Keep local storage up-to-date
        localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(finalMerged));
      }
    } catch (err) {
      // Fallback cleanly to local storage if Firestore collection doesn't exist yet or offline
      console.log('Operating in local-first mode for sections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    syncFromSources();

    const handleLocalUpdate = () => {
      setSections(loadMergedLocalSections());
    };

    window.addEventListener(EVENT_NAME, handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }, [syncFromSources]);

  /**
   * Add a new section or update an existing section
   */
  const saveSection = async (sectionData: Partial<Grade11Section> & { name: string }): Promise<Grade11Section> => {
    const isNew = !sectionData.id;
    const cleanId = sectionData.id || `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const sectionToSave: Grade11Section = {
      id: cleanId,
      name: sectionData.name.trim(),
      trackStrand: sectionData.trackStrand || 'STEM',
      adviser: sectionData.adviser?.trim() || 'Unassigned Adviser',
      studentCount: typeof sectionData.studentCount === 'number' ? sectionData.studentCount : 0,
      averageMastery: typeof sectionData.averageMastery === 'number' ? sectionData.averageMastery : 80,
      roomNumber: sectionData.roomNumber?.trim() || 'To be announced',
      scheduleTime: sectionData.scheduleTime?.trim() || '6:00 AM – 12:00 PM'
    };

    // 1. Update local storage
    try {
      const existing = loadMergedLocalSections();
      const updatedList = existing.filter(s => s.id !== cleanId);
      updatedList.push(sectionToSave);

      // Remove from deleted list if present
      const deletedRaw = localStorage.getItem(PRIMARY_DELETED_KEY);
      if (deletedRaw) {
        const deletedIds = new Set<string>(JSON.parse(deletedRaw));
        if (deletedIds.has(cleanId)) {
          deletedIds.delete(cleanId);
          localStorage.setItem(PRIMARY_DELETED_KEY, JSON.stringify(Array.from(deletedIds)));
        }
      }

      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(updatedList));
      setSections(updatedList);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (e) {
      console.error('Failed to save section locally:', e);
    }

    // 2. Persist to Firestore
    try {
      const sanitized = sanitizeForFirestore(sectionToSave);
      await setDoc(doc(db, 'sections', cleanId), sanitized, { merge: true });
    } catch (err) {
      console.warn('Firestore write for section skipped (using local sync):', err);
    }

    return sectionToSave;
  };

  /**
   * Delete a section permanently
   */
  const deleteSection = async (sectionId: string): Promise<boolean> => {
    try {
      // 1. Mark as deleted in local storage
      const deletedRaw = localStorage.getItem(PRIMARY_DELETED_KEY);
      const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
      deletedIds.add(sectionId);
      localStorage.setItem(PRIMARY_DELETED_KEY, JSON.stringify(Array.from(deletedIds)));

      // 2. Remove from active local list
      const existing = loadMergedLocalSections();
      const filtered = existing.filter(s => s.id !== sectionId);
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(filtered));

      setSections(filtered);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));

      // 3. Attempt Firestore deletion
      try {
        await deleteDoc(doc(db, 'sections', sectionId));
      } catch (err) {
        console.warn('Firestore deletion skipped (saved locally):', err);
      }

      return true;
    } catch (err) {
      console.error('Failed to delete section:', err);
      throw err;
    }
  };

  /**
   * Reset sections to DepEd baseline defaults
   */
  const resetToDefaults = async () => {
    try {
      localStorage.removeItem(PRIMARY_DELETED_KEY);
      localStorage.removeItem(PRIMARY_STORAGE_KEY);
      setSections(GRADE_11_SECTIONS);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch (e) {
      console.error('Failed to reset sections:', e);
    }
  };

  return {
    sections,
    loading,
    saveSection,
    deleteSection,
    resetToDefaults,
    refreshSections: syncFromSources
  };
}
