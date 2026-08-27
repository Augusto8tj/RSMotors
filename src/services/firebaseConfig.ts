import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const metaEnv = (import.meta as any).env || {};

// Default Firebase Configuration
// If environment variables exist, they are utilized; otherwise fallback gracefully for client-side demo and sandbox
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyAutoFleetSaaS2026',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || 'autofleet-saas.firebaseapp.com',
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || 'autofleet-saas',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || 'autofleet-saas.appspot.com',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: metaEnv.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (err) {
  console.warn('Firebase SDK initialized in offline/sandbox mode', err);
}

export { app, db, auth, storage };
