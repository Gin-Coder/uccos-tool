import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Comptes Générés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Total des comptes dans la base de données
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Règles Actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Activées</div>
            <p className="text-xs text-muted-foreground">
              Les règles de génération sont à jour
            </p>
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
