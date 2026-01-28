'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, query, orderBy, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc } from '@/firebase/hooks';
import type { Account, AccountFormData, GenerationSettings } from '@/types';
import { generateAccountCredentials, validateFormData } from '@/lib/generation';

function AccountForm({ settings, onPreview }: { settings: GenerationSettings, onPreview: (data: Account) => void }) {
  const [formData, setFormData] = useState<AccountFormData>({
    firstname: '',
    middlename: '',
    lastname: '',
    lead: '',
    leg: '',
    sucAcc: '',
    ref: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreview = () => {
    const validationErrors = validateFormData(formData, settings.requiredFields || []);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      alert("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    const { username, password, email } = generateAccountCredentials(formData, settings);

    const fullAccount: Account = {
      ...formData,
      id: '', // Will be set by firestore
      username,
      password,
      email,
      displayDate: new Date().toISOString().split('T')[0], // TODO: Handle manual date
      createdAt: new Date(), // This will be replaced by serverTimestamp on save
    };
    onPreview(fullAccount);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(formData).map((key) => {
            const fieldKey = key as keyof AccountFormData;
            const isRequired = settings.requiredFields?.includes(fieldKey);
            return (
              <div key={key} className="flex flex-col space-y-1.5">
                <Label htmlFor={key} className="capitalize">{key} {isRequired && '*'}</Label>
                <Input
                  id={key}
                  name={key}
                  value={formData[fieldKey]}
                  onChange={handleChange}
                  className="border p-2 rounded-md"
                  placeholder={!isRequired ? 'Optionnel' : ''}
                />
                {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
              </div>
            )
        })}
      </div>
      <Button onClick={handlePreview}>Prévisualiser</Button>
    </div>
  );
}


function AccountList() {
    const db = useFirestore();
    const accountsQuery = db ? query(collection(db, 'accounts'), orderBy('createdAt', 'desc')) : null;
    const { data: accounts, loading } = useCollection<Account>(accountsQuery);

    if (loading) return <p>Chargement des comptes...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comptes Générés Récemment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {accounts && accounts.map(account => (
                    <Card key={account.id} className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                            <p><strong>Nom:</strong> {account.firstname} {account.lastname}</p>
                            <p><strong>Username:</strong> {account.username}</p>
                            <p><strong>Password:</strong> {account.password}</p>
                            <p><strong>Email:</strong> {account.email}</p>
                            <p><strong>Lead/Leg:</strong> {account.lead}/{account.leg}</p>
                            <p><strong>SucAcc:</strong> {account.sucAcc}</p>
                            <p><strong>Ref:</strong> {account.ref}</p>
                            <p><strong>Phone:</strong> {account.phone}</p>
                        </div>
                    </Card>
                ))}
                {(!accounts || accounts.length === 0) && <p>Aucun compte n'a été généré pour le moment.</p>}
            </CardContent>
        </Card>
    );
}

export default function ComptesPage() {
  const [previewData, setPreviewData] = useState<Account | null>(null);
  const db = useFirestore();

  const settingsRef = db ? doc(db, 'settings', 'rules') : null;
  const { data: settings, loading: settingsLoading } = useDoc<GenerationSettings>(settingsRef);

  const handleSave = async () => {
    if (!previewData || !db) return;
    try {
      // Omit id from the saved data
      const { id, ...dataToSave } = previewData;
      await addDoc(collection(db, 'accounts'), {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
      alert('Compte enregistré avec succès !');
      setPreviewData(null);
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Erreur lors de l\'enregistrement du compte.');
    }
  };

  if (settingsLoading) {
    return <p>Chargement des paramètres...</p>
  }
  
  if (!settings) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Erreur de configuration</CardTitle>
                <CardDescription>
                    Impossible de charger les paramètres. Veuillez configurer les règles de génération dans la page "Règles" avant de créer un compte.
                </CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Créer un Compte</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="form">
            <TabsList>
              <TabsTrigger value="form">Formulaire</TabsTrigger>
              <TabsTrigger value="json" disabled>Import JSON (bientôt)</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="pt-4">
               <AccountForm settings={settings} onPreview={setPreviewData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Prévisualisation</CardTitle>
            <CardDescription>Veuillez vérifier les informations avant d'enregistrer.</CardDescription>
          </Header>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm p-4 bg-muted rounded-md">
                <p><strong>Nom:</strong> {previewData.firstname} {previewData.lastname}</p>
                <p><strong>Username:</strong> <span className="font-mono">{previewData.username}</span></p>
                <p><strong>Password:</strong> <span className="font-mono">{previewData.password}</span></p>
                <p><strong>Email:</strong> <span className="font-mono">{previewData.email}</span></p>
                <p><strong>Lead/Leg:</strong> {previewData.lead}/{previewData.leg}</p>
                <p><strong>SucAcc:</strong> {previewData.sucAcc}</p>
                <p><strong>Ref:</strong> {previewData.ref}</p>
                <p><strong>Phone:</strong> {previewData.phone}</p>
             </div>
            <div className="flex space-x-4 pt-4">
              <Button onClick={handleSave}>Enregistrer le Compte</Button>
              <Button variant="outline" onClick={() => setPreviewData(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AccountList />
    </div>
  );
}
