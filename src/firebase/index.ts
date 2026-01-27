'use client';
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getFirestore as getFirestoreSdk, Firestore } from 'firebase/firestore';
import { getAuth as getAuthSdk, Auth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;

  if (!firebaseConfig.apiKey) {
    if (typeof window !== 'undefined') {
        console.error("Firebase API key is missing. Please create a .env.local file with your Firebase credentials. Firebase features will be disabled.");
    }
    return null;
  }
  
  if (getApps().length) {
    app = getApp();
  } else {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

let firestore: Firestore | null = null;
export function getFirestore(): Firestore | null {
  if (firestore) {
      return firestore;
  }
  const initializedApp = getFirebaseApp();
  if (initializedApp) {
    firestore = getFirestoreSdk(initializedApp);
  }
  return firestore;
}

let auth: Auth | null = null;
export function getAuth(): Auth | null {
  if (auth) {
      return auth;
  }
  const initializedApp = getFirebaseApp();
  if (initializedApp) {
    auth = getAuthSdk(initializedApp);
  }
  return auth;
}
