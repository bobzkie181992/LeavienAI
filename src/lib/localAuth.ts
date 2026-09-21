/**
 * Local Database Authentication Engine
 * Stores user accounts and active sessions directly in the local database (localStorage & IndexedDB),
 * with automatic synchronization with Firestore users collection when connected.
 */

import { UserProfile } from '../types';
import { db, auth, sanitizeForFirestore } from './firebase';
import { doc, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

const LOCAL_USERS_KEY = 'mathquest_local_accounts_v1';
const CURRENT_SESSION_KEY = 'mathquest_local_auth_session_v1';
const AUTH_EVENT_NAME = 'mathquest_local_auth_event';

// Initial pre-configured accounts (e.g. administrator / faculty / sample student)
const DEFAULT_ACCOUNTS: UserProfile[] = [];

export function getLocalUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    let users: UserProfile[] = [];
    if (!raw) {
      // Check legacy custom students cache to import them
      const legacyRaw = localStorage.getItem('mathquest_custom_students');
      const initial = [...DEFAULT_ACCOUNTS];
      if (legacyRaw) {
        try {
          const legacyStudents = JSON.parse(legacyRaw) as UserProfile[];
          initial.push(...legacyStudents);
        } catch (e) {}
      }
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(initial));
      return initial;
    } else {
      users = JSON.parse(raw);
    }

    // Ensure all default accounts (Admin and Amora) exist in local database
    let changed = false;
    for (const defAcc of DEFAULT_ACCOUNTS) {
      const exists = users.some(u => 
        (u.email && defAcc.email && u.email.toLowerCase() === defAcc.email.toLowerCase()) || 
        u.uid === defAcc.uid
      );
      if (!exists) {
        users.push(defAcc);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch (err) {
    console.error("Error reading local users database:", err);
    return DEFAULT_ACCOUNTS;
  }
}

export function saveLocalUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Error saving local users database:", err);
  }
}

export function saveLocalUser(profile: UserProfile): void {
  const users = getLocalUsers();
  const index = users.findIndex(u => u.uid === profile.uid || (profile.email && u.email?.toLowerCase() === profile.email.toLowerCase()));
  if (index >= 0) {
    users[index] = { ...users[index], ...profile };
  } else {
    users.push(profile);
  }
  saveLocalUsers(users);

  // If this is the current active session user, update session as well
  const current = getLocalSession();
  if (current && current.uid === profile.uid) {
    saveLocalSession({ ...current, ...profile });
  }
}

export function deleteLocalUser(uid: string): void {
  const users = getLocalUsers().filter(u => u.uid !== uid);
  saveLocalUsers(users);
}

export function getLocalSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (err) {
    return null;
  }
}

export function saveLocalSession(profile: UserProfile): void {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(profile));
    notifyAuthChange(profile);
  } catch (err) {
    console.error("Error saving local session:", err);
  }
}

export function clearLocalSession(): void {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
    notifyAuthChange(null);
  } catch (err) {
    console.error("Error clearing local session:", err);
  }
}

export function notifyAuthChange(profile: UserProfile | null): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: profile }));
  }
}

export function onLocalAuthStateChange(callback: (profile: UserProfile | null) => void): () => void {
  const handler = (event: any) => {
    callback(event.detail);
  };
  window.addEventListener(AUTH_EVENT_NAME, handler);
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handler);
  };
}

/**
 * Sign in using the local database
 * Supports login with either Email Address or 12-digit LRN along with password.
 */
export async function localSignIn(
  identifier: string, 
  password: string,
  options?: { autoCreateRole?: 'student' | 'faculty'; autoCreateDisplayName?: string }
): Promise<UserProfile> {
  const trimmedId = identifier.trim();
  const idLower = trimmedId.toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedId || !trimmedPassword) {
    throw new Error("Please provide both email/LRN and password.");
  }

  const users = getLocalUsers();

  // 1. Search local accounts by Email, LRN, or derived student email
  let matchedUser = users.find(u => {
    const emailMatch = u.email && u.email.toLowerCase() === idLower;
    const lrnMatch = u.lrn && u.lrn === trimmedId;
    const derivedMatch = u.lrn && `${u.lrn}@student.mathquest.internal` === idLower;
    return emailMatch || lrnMatch || derivedMatch;
  });

  // 2. If not found locally, query Firestore 'users' collection
  if (!matchedUser) {
    try {
      const usersRef = collection(db, 'users');
      // Try by email
      const qEmail = query(usersRef, where('email', '==', trimmedId));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        matchedUser = snapEmail.docs[0].data() as UserProfile;
      } else if (!trimmedId.includes('@')) {
        // Try by LRN
        const qLrn = query(usersRef, where('lrn', '==', trimmedId));
        const snapLrn = await getDocs(qLrn);
        if (!snapLrn.empty) {
          matchedUser = snapLrn.docs[0].data() as UserProfile;
        }
      }

      // Broad match in case of case differences
      if (!matchedUser) {
        const allDocs = await getDocs(usersRef);
        for (const d of allDocs.docs) {
          const u = d.data() as UserProfile;
          if ((u.email && u.email.toLowerCase() === idLower) || (u.lrn && u.lrn === trimmedId)) {
            matchedUser = u;
            break;
          }
        }
      }

      if (matchedUser) {
        saveLocalUser(matchedUser);
      }
    } catch (firestoreErr) {
      console.warn("Firestore lookup failed during localSignIn:", firestoreErr);
    }
  }

  // 3. Special handling for Admin/Faculty email if first time logging in
  if (!matchedUser && idLower === 'bobzkie181992@gmail.com') {
    const adminUser: UserProfile = {
      uid: 'faculty_bobzkie',
      displayName: 'Prof. Bob',
      email: 'bobzkie181992@gmail.com',
      role: 'faculty',
      password: trimmedPassword,
      temporaryPassword: trimmedPassword,
      xp: 0,
      level: 5,
      streak: 1,
      lastActive: new Date().toISOString(),
      badges: ['topic-master']
    };
    saveLocalUser(adminUser);
    matchedUser = adminUser;
  }

  // 4. Auto-create account if requested and not found
  if (!matchedUser && options?.autoCreateRole) {
    const defaultRawName = options.autoCreateDisplayName || 
      (trimmedId.includes('@') ? trimmedId.split('@')[0].replace(/[._]/g, ' ') : `Student ${trimmedId}`);
    const defaultName = defaultRawName.charAt(0).toUpperCase() + defaultRawName.slice(1);

    return await localSignUp({
      displayName: defaultName,
      email: trimmedId.includes('@') ? trimmedId : `${trimmedId}@student.mathquest.internal`,
      lrn: !trimmedId.includes('@') ? trimmedId : undefined,
      password: trimmedPassword,
      role: options.autoCreateRole,
      grade: options.autoCreateRole === 'student' ? 'Grade 11' : undefined,
      section: options.autoCreateRole === 'student' ? 'STEM-A' : undefined
    });
  }

  if (!matchedUser) {
    const err = new Error(`No account found matching "${trimmedId}". Please check your details or create an account.`);
    (err as any).code = 'ACCOUNT_NOT_FOUND';
    (err as any).identifier = trimmedId;
    throw err;
  }

  // 5. Validate password
  const storedPassword = matchedUser.password || matchedUser.temporaryPassword;
  if (storedPassword && storedPassword !== trimmedPassword) {
    // If it was seeded with a default initial password, adopt the user's chosen password
    if (storedPassword === 'password123' || storedPassword === 'faculty123') {
      matchedUser.password = trimmedPassword;
      matchedUser.temporaryPassword = trimmedPassword;
      saveLocalUser(matchedUser);
    } else {
      throw new Error("Invalid password. Please verify and try again.");
    }
  } else if (!storedPassword) {
    matchedUser.password = trimmedPassword;
    matchedUser.temporaryPassword = trimmedPassword;
    saveLocalUser(matchedUser);
  }

  // Update last active
  matchedUser = {
    ...matchedUser,
    lastActive: new Date().toISOString()
  };
  saveLocalUser(matchedUser);
  saveLocalSession(matchedUser);

  return matchedUser;
}

/**
 * Register a new account directly in the local database
 */
export async function localSignUp(params: {
  displayName: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  lrn?: string;
  grade?: string;
  section?: string;
}): Promise<UserProfile> {
  const { displayName, email, password, role, lrn, grade, section } = params;

  if (!displayName.trim() || !email.trim() || !password.trim()) {
    throw new Error("Please complete all required fields (Name, Email, and Password).");
  }

  if (password.trim().length < 4) {
    throw new Error("Password must be at least 4 characters long.");
  }

  const users = getLocalUsers();
  const emailLower = email.trim().toLowerCase();
  const trimmedLrn = lrn?.trim();

  // Check uniqueness in local database
  const exists = users.find(u => 
    (u.email && u.email.toLowerCase() === emailLower) || 
    (trimmedLrn && u.lrn && u.lrn === trimmedLrn)
  );

  if (exists) {
    throw new Error(`An account with email "${email}" or LRN "${trimmedLrn}" already exists. Please sign in instead.`);
  }

  const newUid = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const newProfile: UserProfile = {
    uid: newUid,
    displayName: displayName.trim(),
    email: email.trim(),
    password: password.trim(),
    temporaryPassword: password.trim(),
    role,
    lrn: trimmedLrn || undefined,
    grade: grade || (role === 'student' ? 'Grade 11' : undefined),
    section: section || (role === 'student' ? 'STEM-A' : undefined),
    xp: role === 'student' ? 50 : 0,
    level: 1,
    streak: 1,
    lastActive: new Date().toISOString(),
    badges: role === 'student' ? ['first-steps'] : []
  };

  // Save to local database
  saveLocalUser(newProfile);

  // Try saving to Firestore users collection in parallel for persistence across browsers
  try {
    await setDoc(doc(db, 'users', newUid), sanitizeForFirestore(newProfile));
  } catch (firestoreErr) {
    console.warn("Could not save to Firestore, stored securely in local database:", firestoreErr);
  }

  // Set as current active session
  saveLocalSession(newProfile);

  return newProfile;
}

/**
 * Sign out of current local session
 */
export async function localSignOut(): Promise<void> {
  clearLocalSession();
  try {
    await auth.signOut();
  } catch (e) {}
}
