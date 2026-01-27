'use client';
import React, { createContext, useContext } from 'react';
import { getAuth, getFirestore } from '.';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Initialize Firebase services here so it's only done once
  getFirestore();
  getAuth();

  return (
    <FirebaseContext.Provider value={null}>
        {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  return useContext(FirebaseContext);
};
