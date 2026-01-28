'use client';
import React, { createContext, useContext } from 'react';
import { getAuth, getFirestore } from '.';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  firestore: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const firestore = getFirestore();
  const auth = getAuth();

  return (
    <FirebaseContext.Provider value={{ firestore, auth }}>
        {children}
    </FirebaseContext.Provider>
  );
};

export const useFirestore = () => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error('useFirestore must be used within a FirebaseProvider');
  }
  return context.firestore;
};

export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (context === null) {
      throw new Error('useAuth must be used within a FirebaseProvider');
    }
    return context.auth;
};
