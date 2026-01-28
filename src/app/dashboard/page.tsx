'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase/provider';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase/hooks';
import { collection, doc } from 'firebase/firestore';
import type { Account, GenerationSettings } from '@/types';

export default function DashboardPage() {
  const db = useFirestore();

  const accountsQuery = useMemoFirebase(() => (db ? collection(db, 'accounts') : null), [db]);
  const { data: accounts, loading: accountsLoading } = useCollection<Account>(accountsQuery);
  
  const settingsRef = useMemoFirebase(() => (db ? doc(db, 'settings', 'rules') : null), [db]);
  const { data: settings, loading: settingsLoading } = useDoc<GenerationSettings>(settingsRef);
  
  const accountCount = accounts ? accounts.length : 0;
  const rulesAreActive = settings && Object.keys(settings).length > 1;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Comptes Générés</CardTitle>
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <>
                <div className="text-2xl font-bold">{accountCount}</div>
                <p className="text-xs text-muted-foreground">
                  Total des comptes dans la base de données
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Règles Actives</CardTitle>
          </CardHeader>
          <CardContent>
             {settingsLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
                <>
                    <div className="text-2xl font-bold">{rulesAreActive ? 'Activées' : 'Non configurées'}</div>
                    <p className="text-xs text-muted-foreground">
                        {rulesAreActive ? 'Les règles de génération sont à jour' : 'Veuillez configurer les règles'}
                    </p>
                </>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Administrateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs avec accès admin
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
            <p>Le journal d'activité sera implémenté dans une future version.</p>
        </CardContent>
      </Card>
    </div>
  );
}
