'use client';

import {
  collection,
  query,
  orderBy,
  type DocumentData,
} from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useState, useMemo } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getFirestore } from '@/firebase';

interface Account extends DocumentData {
  id: string;
  firstname: string;
  lastname: string;
  lead: number;
  generated: {
    username: string;
    password: string;
    email: string;
  };
}

export function AccountsTable() {
  const { toast } = useToast();
  const firestore = getFirestore();

  const [accountsSnapshot, loadingAccounts] = useCollection(
    firestore
      ? query(collection(firestore, 'accounts'), orderBy('createdAt', 'desc'))
      : null
  );

  const [nameFilter, setNameFilter] = useState('');
  const [leadFilter, setLeadFilter] = useState('');

  const accounts = useMemo(() => {
    return accountsSnapshot?.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Account[] | undefined;
  }, [accountsSnapshot]);

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    return accounts.filter((account) => {
      const fullName = `${account.firstname} ${account.lastname}`.toLowerCase();
      const nameMatch = nameFilter
        ? fullName.includes(nameFilter.toLowerCase())
        : true;
      const leadMatch = leadFilter
        ? String(account.lead) === leadFilter
        : true;
      return nameMatch && leadMatch;
    });
  }, [accounts, nameFilter, leadFilter]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${fieldName} copié!`,
      description: `${text} a été copié dans le presse-papiers.`,
    });
  };

  return (
    <div>
      <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          placeholder="Filtrer par nom..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Input
          placeholder="Filtrer par lead..."
          type="number"
          value={leadFilter}
          onChange={(e) => setLeadFilter(e.target.value)}
        />
      </div>
      <div className="max-h-[600px] overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingAccounts ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{`${account.firstname} ${account.lastname}`}</TableCell>
                  <TableCell>{account.lead}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{account.generated.username}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          copyToClipboard(
                            account.generated.username,
                            'Username'
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{account.generated.password}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          copyToClipboard(
                            account.generated.password,
                            'Password'
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Aucun compte trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
