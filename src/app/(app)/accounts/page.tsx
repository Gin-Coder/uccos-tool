import { PageHeader } from '@/components/PageHeader';
import { AccountsTable } from '@/components/features/accounts-table';
import { Card, CardContent } from '@/components/ui/card';

export default function AccountsPage() {
  return (
    <>
      <PageHeader
        title="Comptes Générés"
        description="Liste de tous les comptes UCCOS générés en temps réel."
      />
      <main className="p-4 md:p-8">
        <Card>
          <CardContent>
            <AccountsTable />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
