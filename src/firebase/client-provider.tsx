'use client';

import { useMemo } from 'react';
import { initializeFirebase } from '.';
import { useFirebase } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setFirebase } = useFirebase();

  // The useMemo hook is critical here. It ensures that Firebase is only
  // initialized once on the client and that the same instance is reused.
  // Without it, a new Firebase app would be created on every render.
  const firebase = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    console.log('Initializing Firebase on the client...');
    return initializeFirebase();
  }, []);

  if (firebase) {
    setFirebase(firebase);
  }

  // Render children, but only on the client where Firebase is available.
  return <>{children}</>;
}
