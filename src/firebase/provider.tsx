'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import type { FirebaseInstances } from '.';

// Define the shape of the context state
interface FirebaseContextState {
  firebase: FirebaseInstances | null;
  setFirebase: (firebase: FirebaseInstances | null) => void;
}

// Create the context with a default undefined value
const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined
);

// Custom hook to use the Firebase context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirestore() {
    const { firebase } = useFirebase();
    return firebase?.db || null;
}

export function useAuth() {
    const { firebase } = useFirebase();
    return firebase?.auth || null;
}


// Provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);
  
  return (
    <FirebaseContext.Provider value={{ firebase, setFirebase }}>
      {children}
    </FirebaseContext.Provider>
  );
}
