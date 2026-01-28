'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  doc,
  onSnapshot,
  DocumentData,
  Query,
  query,
  collection,
  getDocs,
  DocumentReference,
  CollectionReference,
  getDoc,
} from 'firebase/firestore';

// A utility to stabilize memoization of Firestore references/queries.
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}

export function useDoc<T>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      // If the ref isn't ready, we are still in a "loading" state
      // from the perspective of the page. Don't change the state,
      // just wait for the ref to become available.
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null); // Document does not exist
        }
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err);
        console.error(`Error fetching document at ${ref.path}:`, err);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}

export function useCollection<T>(q: Query | CollectionReference | null) {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!q) {
            // If the query isn't ready, we are still in a "loading" state.
            // Don't change the state, just wait for the query to become available.
            return;
        }

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                setLoading(false);
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setData(items);
                setError(null);
            },
            (err) => {
                setLoading(false);
                setError(err);
                console.error(`Error fetching collection:`, err);
            }
        );

        return () => unsubscribe();
    }, [q]);

    return { data, loading, error };
}
