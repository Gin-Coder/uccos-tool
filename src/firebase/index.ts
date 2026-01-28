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

interface FirebaseServices {
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
}

export function initializeFirebase(): FirebaseServices | null {
    if (!firebaseConfig.apiKey) {
        if (typeof window !== 'undefined') {
            console.error("Firebase API key is missing. Please create a .env.local file with your Firebase credentials. Firebase features will be disabled.");
        }
        return null;
    }
  
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestoreSdk(app);
    const auth = getAuthSdk(app);

    return { app, firestore, auth };
}
