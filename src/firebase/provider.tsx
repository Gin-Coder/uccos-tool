'use client';
import React, { createContext, useContext, useMemo } from 'react';
import { initializeFirebase } from '.';
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
  const services = useMemo(() => {
    if (typeof window !== 'undefined') {
      const result = initializeFirebase();
      return { 
        firestore: result?.firestore ?? null, 
        auth: result?.auth ?? null 
      };
    }
    // Return null services on the server
    return { firestore: null, auth: null };
  }, []);

  return (
    <FirebaseContext.Provider value={services}>
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
