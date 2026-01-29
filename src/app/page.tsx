'use client';
import { useFirestore } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function RootPage() {
  const db = useFirestore();
  const [status, setStatus] = useState('Vérification de la connexion à Firebase...');
  const [error, setError] = useState('');

  useEffect(() => {
    if (db) {
        // Try to read a non-existent document to test security rules & connection
        const testDocRef = doc(db, 'test-connection', '123');
        getDoc(testDocRef)
            .then(() => {
                setStatus('✅ Firebase est connecté avec succès.');
            })
            .catch((e) => {
                console.error(e);
                if (e.code === 'permission-denied') {
                    setStatus('✅ Firebase est connecté (les règles de sécurité fonctionnent).');
                } else {
                    setError(`Erreur de connexion à Firebase: ${e.message}`);
                    setStatus('❌ Connexion à Firebase échouée.');
                }
            });
    } else {
        setStatus('Initialisation de Firebase...');
    }
  }, [db]);


  return (
    <div className="flex h-96 flex-col items-center justify-center rounded-lg border bg-card p-8">
      <h1 className="text-3xl font-bold">UCCOS Admin Tool</h1>
      <p className="mt-4 text-lg text-muted-foreground">Prêt à démarrer.</p>
      <div className="mt-8 rounded-md bg-muted p-4 text-center">
        <p className="font-mono text-sm">{status}</p>
        {error && <p className="mt-2 font-mono text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
