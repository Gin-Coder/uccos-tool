'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, setDoc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const settingsSchema = z.object({
  usernameFormat: z.string().min(1, "Le format du nom d'utilisateur est requis."),
  passwordFormat: z.string().min(1, 'Le format du mot de passe est requis.'),
  emailFormat: z.string().min(1, "Le format de l'e-mail est requis."),
});

export function SettingsForm() {
  const { toast } = useToast();
  const firestore = getFirestore();

  // The settings are stored in a single document named 'rules' inside the 'settings' collection.
  const settingsRef = firestore ? doc(firestore, 'settings', 'rules') : null;
  const [settingsSnapshot, loadingSettings, error] = useDocument(settingsRef);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      usernameFormat: '',
      passwordFormat: '',
      emailFormat: '',
    },
  });

  useEffect(() => {
    if (settingsSnapshot?.exists()) {
      form.reset(settingsSnapshot.data() as z.infer<typeof settingsSchema>);
    }
  }, [settingsSnapshot, form]);
  
  useEffect(() => {
    if(error) {
       toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description:
          "Impossible de charger les paramètres. Assurez-vous qu'un document avec l'ID 'rules' existe dans la collection 'settings'.",
      });
    }
  }, [error, toast])

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!settingsRef) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Firestore n'est pas initialisé.",
      });
      return;
    }

    try {
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Les règles de génération ont été mises à jour.',
      });
    } catch (error) {
      console.error('Error updating settings: ', error);
      toast({
        variant: 'destructive',
        title: 'Oh oh! Une erreur est survenue.',
        description: 'Impossible de sauvegarder les paramètres.',
      });
    }
  }

  if (loadingSettings) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="usernameFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format du nom d'utilisateur</FormLabel>
              <FormControl>
                <Input placeholder="p.ex. {FIRST3}{lastname}{REF}" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format du mot de passe</FormLabel>
              <FormControl>
                <Input placeholder="p.ex. {FIRST2}success{SucAcc}@" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emailFormat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format de l'e-mail</FormLabel>
              <FormControl>
                <Input
                  placeholder="p.ex. {firstname}{qac}@sucadm1.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Le domaine de l'e-mail est géré automatiquement.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? 'Sauvegarde...'
            : 'Sauvegarder les paramètres'}
        </Button>
      </form>
    </Form>
  );
}
