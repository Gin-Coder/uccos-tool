'use client';
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
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

function getFirebaseApp() {
  if (getApps().length) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

let firestore: Firestore | null = null;
export function getFirestore() {
  if (!firestore) {
    firestore = getFirestoreSdk(getFirebaseApp());
  }
  return firestore;
}

let auth: Auth | null = null;
export function getAuth() {
  if (!auth) {
    auth = getAuthSdk(getFirebaseApp());
  }
  return auth;
}
