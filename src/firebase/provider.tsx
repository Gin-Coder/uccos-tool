'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseContextValue {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const firebase = useMemo(() => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error("Firebase config is missing or incomplete. Check your .env.local file.");
        return null;
    }
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    return { app, db, auth };
  }, []);

  if (!firebase && typeof window !== 'undefined') {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <div className="rounded-lg border border-destructive bg-card p-8 text-center">
                <h1 className="text-2xl font-bold text-destructive">Erreur de configuration Firebase</h1>
                <p className="mt-4 text-card-foreground">
                    Les variables d'environnement Firebase sont manquantes ou incomplètes.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Veuillez vous assurer que votre fichier <code>.env.local</code> est correctement configuré.
                </p>
            </div>
        </div>
    );
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirestore() {
    const firebase = useFirebase();
    return firebase?.db || null;
}

export function useAuth() {
    const firebase = useFirebase();
    return firebase?.auth || null;
}
