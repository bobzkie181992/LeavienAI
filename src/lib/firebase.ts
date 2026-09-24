import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, doc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyBUD0yFlzvlby4oJOWMiWppIFHt2LkkcKU",
  authDomain: firebaseAppletConfig.authDomain || "united-spirit-hsjh2.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "united-spirit-hsjh2",
  storageBucket: firebaseAppletConfig.storageBucket || "united-spirit-hsjh2.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "90298753360",
  appId: firebaseAppletConfig.appId || "1:90298753360:web:aa3fbf0137848e59b28c55"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use in-memory local caching to avoid IndexedDB iframe transaction abortion and assertion crashes
export const db = initializeFirestore(
  app,
  {
    localCache: memoryLocalCache(),
  },
  firebaseAppletConfig.firestoreDatabaseId || "ai-studio-mathquestgrade11-4fec97b8-2c8c-4029-81d1-2c083144f31d"
);

// Validate connection to Firestore as recommended in skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: Client appears offline.");
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();

/**
 * Creates a student Firebase Authentication account using a secondary Firebase App instance.
 * This guarantees that creating a student account does NOT sign out or disrupt the faculty's active session.
 */
export async function createStudentAuthAccount(
  email: string, 
  password: string, 
  displayName: string
): Promise<string | null> {
  const secondaryAppName = `student_auth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let secondaryApp = null;
  try {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    if (cred.user) {
      await updateProfile(cred.user, { displayName });
      return cred.user.uid;
    }
    return null;
  } finally {
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch (err) {
        console.warn("Failed to clean up secondary Firebase App instance:", err);
      }
    }
  }
}

/**
 * Recursively removes all `undefined` values from objects and arrays to prevent Firestore
 * "Function addDoc() / setDoc() / updateDoc() called with invalid data. Unsupported field value: undefined" errors.
 */
export function sanitizeForFirestore<T>(val: T): T {
  if (val === undefined) {
    return null as any;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as any;
  }
  // Allow Firestore FieldValue / Timestamp instances to pass through
  if (val.constructor && val.constructor.name !== 'Object' && val.constructor.name !== '') {
    return val;
  }
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      cleaned[k] = sanitizeForFirestore(v);
    }
  }
  return cleaned as T;
}

