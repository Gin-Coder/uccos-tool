'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useState, useMemo } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateAccountCredentials } from '@/lib/account-generator';
import { getFirestore } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

const formSchema = z.object({
  firstname: z.string().min(1, 'Prénom est requis.'),
  middlename: z.string().optional(),
  lastname: z.string().min(1, 'Nom de famille est requis.'),
  lead: z.coerce.number().positive('Lead doit être un nombre positif.'),
  leg: z.coerce.number().positive('Leg doit être un nombre positif.'),
  leaderAssoc: z.string().min(1, 'Leader associé est requis.'),
  leaderLine: z.string().min(1, 'Ligne de leader est requise.'),
  position: z.string().min(1, 'Position est requise.'),
  ref: z.coerce.number().positive('Ref doit être un nombre positif.'),
  sucAcc: z.coerce.number().positive('SucAcc doit être un nombre positif.'),
  accountPro: z.coerce.number().positive('AccountPro doit être un nombre positif.'),
  qac: z.string().min(1, 'QAC est requis.'),
  phone: z.string().min(1, 'Téléphone est requis.'),
});

type Account = z.infer<typeof formSchema> & {
  id: string;
  generated: {
    username: string;
    password: string;
    email: string;
  };
};

export default function UccosAdminTool() {
  const { toast } = useToast();
  const firestore = getFirestore();

  const [accountsSnapshot, loadingAccounts] = useCollection(
    firestore ? query(collection(firestore, 'accounts'), orderBy('createdAt', 'desc')) : null
  );
  const [settingsSnapshot, loadingSettings] = useCollection(
    firestore ? collection(firestore, 'settings') : null
  );

  const [nameFilter, setNameFilter] = useState('');
  const [leadFilter, setLeadFilter] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: '',
      middlename: '',
      lastname: '',
      leaderLine: 'UCCOS (All)',
      position: '7e rangée',
    },
  });

  const settings = useMemo(() => {
    if (!settingsSnapshot?.docs[0]) return null;
    return settingsSnapshot.docs[0].data();
  }, [settingsSnapshot]);

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
      const leadMatch = leadFilter ? String(account.lead) === leadFilter : true;
      return nameMatch && leadMatch;
    });
  }, [accounts, nameFilter, leadFilter]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!settings) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Les règles de génération ne sont pas chargées. Veuillez vérifier votre configuration Firebase.',
      });
      return;
    }

    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Firestore n\'est pas initialisé.',
        });
        return;
    }

    const generated = generateAccountCredentials(values, settings);

    try {
      await addDoc(collection(firestore, 'accounts'), {
        ...values,
        middlename: values.middlename || 'none',
        generated,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Compte créé',
        description: `Le compte pour ${values.firstname} ${values.lastname} a été généré avec succès.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Oh oh! Une erreur est survenue.',
        description: 'Impossible de sauvegarder le compte. Voir la console pour les détails.',
      });
    }
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${fieldName} copié!`,
      description: `${text} a été copié dans le presse-papiers.`,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Toaster />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold">UCCOS Admin Tool</h1>
        <p className="text-muted-foreground">
          Générateur de comptes et base de données en temps réel.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Générer un nouveau compte</CardTitle>
              <CardDescription>
                Remplissez le formulaire pour créer un nouveau compte UCCOS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middlename"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deuxième prénom (optionnel)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de famille</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lead"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="leg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leg</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="leaderAssoc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leader Associé</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leaderLine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ligne de Leader</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ref</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sucAcc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SucAcc</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="accountPro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AccountPro</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qac"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QAC</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loadingSettings || form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Génération...' : 'Générer le compte'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>Comptes Générés</CardTitle>
              <CardDescription>
                Liste de tous les comptes UCCOS générés en temps réel.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                 <div className="max-h-[600px] overflow-auto">
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
                            <TableCell colSpan={4} className="text-center">Chargement...</TableCell>
                            </TableRow>
                        ) : filteredAccounts.length > 0 ? (
                            filteredAccounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell className="font-medium">{`${account.firstname} ${account.lastname}`}</TableCell>
                                <TableCell>{account.lead}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span>{account.generated.username}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(account.generated.username, 'Username')} >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                     <div className="flex items-center gap-2">
                                        <span>{account.generated.password}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(account.generated.password, 'Password')} >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={4} className="text-center">Aucun compte trouvé.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
