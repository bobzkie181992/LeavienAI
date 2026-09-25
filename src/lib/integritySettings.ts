import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface IntegritySettings {
  violationDeductionPoints: number; // Penalty points per violation (e.g. 1 point)
  maxWarningLimit: number;
}

const SETTINGS_STORAGE_KEY = 'mathquest_integrity_settings_v1';
const INTEGRITY_EVENT_NAME = 'mathquest_integrity_settings_event';

const DEFAULT_SETTINGS: IntegritySettings = {
  violationDeductionPoints: 1, // Default 1 point per violation
  maxWarningLimit: 3
};

export function getIntegritySettings(): IntegritySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        violationDeductionPoints: typeof parsed.violationDeductionPoints === 'number' ? parsed.violationDeductionPoints : 1,
        maxWarningLimit: typeof parsed.maxWarningLimit === 'number' ? parsed.maxWarningLimit : 3
      };
    }
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

export function saveIntegritySettings(settings: Partial<IntegritySettings>): IntegritySettings {
  const current = getIntegritySettings();
  const updated: IntegritySettings = {
    ...current,
    ...settings
  };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(INTEGRITY_EVENT_NAME, { detail: updated }));
    }
    // Also sync to Firestore
    setDoc(doc(db, 'system_settings', 'academic_integrity'), updated, { merge: true }).catch(err => {
      console.warn("Could not sync integrity settings to Firestore:", err);
    });
  } catch (e) {
    console.error("Error saving integrity settings:", e);
  }
  return updated;
}

export function subscribeIntegritySettings(callback: (settings: IntegritySettings) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: any) => {
    callback(e.detail);
  };
  window.addEventListener(INTEGRITY_EVENT_NAME, handler);
  return () => {
    window.removeEventListener(INTEGRITY_EVENT_NAME, handler);
  };
}

export async function syncIntegritySettingsFromFirestore(): Promise<IntegritySettings> {
  try {
    const docRef = doc(db, 'system_settings', 'academic_integrity');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const remoteData = snap.data() as IntegritySettings;
      saveIntegritySettings(remoteData);
      return remoteData;
    }
  } catch (e) {}
  return getIntegritySettings();
}
