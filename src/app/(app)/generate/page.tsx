import { PageHeader } from '@/components/PageHeader';
import { AccountForm } from '@/components/features/account-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function GenerateAccountPage() {
  return (
    <>
      <PageHeader
        title="Générer un compte"
        description="Remplissez le formulaire pour créer un nouveau compte UCCOS."
      />
      <main className="p-4 md:p-8">
        <Card className="max-w-2xl mx-auto">
           <CardHeader>
              <CardTitle>Nouveau compte</CardTitle>
              <CardDescription>
                Les informations d'identification seront générées automatiquement.
              </CardDescription>
            </CardHeader>
          <CardContent>
            <AccountForm />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
