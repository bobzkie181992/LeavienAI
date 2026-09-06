import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBUD0yFlzvlby4oJOWMiWppIFHt2LkkcKU",
  authDomain: "united-spirit-hsjh2.firebaseapp.com",
  projectId: "united-spirit-hsjh2",
  storageBucket: "united-spirit-hsjh2.firebasestorage.app",
  messagingSenderId: "90298753360",
  appId: "1:90298753360:web:aa3fbf0137848e59b28c55"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, "ai-studio-mathquestgrade11-4fec97b8-2c8c-4029-81d1-2c083144f31d");

// Enable offline persistence to handle transient network drops
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Firebase persistence: Multiple tabs open, persistence disabled.");
  } else if (err.code === 'unimplemented') {
    console.warn("Firebase persistence: Browser doesn't support offline persistence.");
  }
});

export const googleProvider = new GoogleAuthProvider();
