'use client';
import React, { createContext, useContext } from 'react';
import { getAuth, getFirestore } from '.';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Firebase services are initialized on-demand within getFirestore() and getAuth()
  // No need to call them here for side-effects.

  return (
    <FirebaseContext.Provider value={null}>
        {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  return useContext(FirebaseContext);
};
