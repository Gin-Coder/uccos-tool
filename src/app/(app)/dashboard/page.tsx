'use client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Users } from 'lucide-react';

export default function DashboardPage() {
  const firestore = useFirestore();
  const [accountsSnapshot, loadingAccounts] = useCollection(
    firestore ? collection(firestore, 'accounts') : null
  );

  const accountCount = accountsSnapshot?.size ?? 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Aperçu de votre activité et des comptes générés."
      />
      <div className="p-4 md:p-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comptes au total
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingAccounts ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <div className="text-2xl font-bold">{accountCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Nombre total de comptes générés
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
