'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function AdminsPage() {
  const admins = [
    { id: '1', email: 'admin@example.com', role: 'superadmin' },
    { id: '2', email: 'user@example.com', role: 'admin' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Administrateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button disabled>Inviter un Administrateur</Button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          La gestion des administrateurs et l'authentification seront implémentées dans une future version.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.role}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" disabled>
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
