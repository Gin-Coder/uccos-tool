'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useMemo } from 'react';

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
import { useToast } from '@/hooks/use-toast';
import { generateAccountCredentials } from '@/lib/account-generator';
import { useFirestore } from '@/firebase/provider';

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
  accountPro: z.coerce
    .number()
    .positive('AccountPro doit être un nombre positif.'),
  qac: z.string().min(1, 'QAC est requis.'),
  phone: z.string().min(1, 'Téléphone est requis.'),
});

export function AccountForm() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const settingsRef = firestore ? doc(firestore, 'settings', 'rules') : null;
  const [settingsSnapshot, loadingSettings] = useDocument(settingsRef);

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
    if (!settingsSnapshot?.exists()) return null;
    return settingsSnapshot.data();
  }, [settingsSnapshot]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!settings) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description:
          "Les règles de génération ne sont pas chargées. Assurez-vous qu'un document avec l'ID 'rules' existe dans la collection 'settings'.",
      });
      return;
    }

    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Firestore n'est pas initialisé.",
      });
      return;
    }

    const generated = generateAccountCredentials(values, settings);

    try {
      await addDoc(collection(firestore, 'accounts'), {
        ...values,
        ...generated,
        middlename: values.middlename || 'none',
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
        description:
          'Impossible de sauvegarder le compte. Voir la console pour les détails.',
      });
    }
  }

  return (
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

        <Button
          type="submit"
          className="w-full"
          disabled={loadingSettings || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? 'Génération...'
            : 'Générer le compte'}
        </Button>
      </form>
    </Form>
  );
}
