import { PageHeader } from '@/components/PageHeader';
import { SettingsForm } from '@/components/features/settings-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Gérez les règles de génération de compte."
      />
      <main className="p-4 md:p-8 grid gap-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Règles de génération</CardTitle>
            <CardDescription>
              Modifiez les formats pour générer les noms d'utilisateur, mots de
              passe et adresses e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
        </Card>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Placeholders disponibles</AlertTitle>
          <AlertDescription>
            <p>
              Vous pouvez utiliser les placeholders suivants dans vos règles de
              génération :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              <li>
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {'{FIRST2}'}
                </code>{' '}
                - 2 premières lettres du prénom
              </li>
              <li>
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {'{FIRST3}'}
                </code>{' '}
                - 3 premières lettres du prénom
              </li>
              <li>
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {'{firstname}'}
                </code>{' '}
                - Prénom en minuscule
              </li>
              <li>
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {'{lastname}'}
                </code>{' '}
                - Nom de famille en minuscule
              </li>
              <li>
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {'{SucAcc}'}
                </code>
                ,{' '}
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {'{REF}'}
                </code>
                ,{' '}
                <code className="font-mono bg-muted px-1 py-0.5 rounded">
                  {'{qac}'}
                </code>{' '}
                - Valeurs des champs correspondants
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </main>
    </>
  );
}
