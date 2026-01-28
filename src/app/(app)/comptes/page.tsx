'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection } from '@/firebase/hooks';
import type { Account, AccountFormData, GenerationSettings } from '@/types';
import { generateAccountCredentials, validateFormData } from '@/lib/generation';
import { useDoc } from '@/firebase/hooks';


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
    const validationErrors = validateFormData(formData, settings.requiredFields);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      alert("Veuillez corriger les erreurs avant de continuer.");
      return;
    }

    const { username, password, email } = generateAccountCredentials(formData, settings);

    const fullAccount: Account = {
      ...formData,
      id: '', // Will be set by firestore
      username,
      password,
      email,
      displayDate: new Date().toISOString().split('T')[0], // Default to today
      createdAt: new Date(),
    };
    onPreview(fullAccount);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(formData).map((key) => (
          <div key={key} className="flex flex-col space-y-1.5">
            <label htmlFor={key} className="text-sm font-medium capitalize">{key}</label>
            <input
              id={key}
              name={key}
              value={formData[key as keyof AccountFormData]}
              onChange={handleChange}
              className="border p-2 rounded-md"
              placeholder={key.startsWith('middle') ? 'Optionnel' : ''}
            />
            {errors[key] && <p className="text-red-500 text-sm">{errors[key]}</p>}
          </div>
        ))}
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
                <CardTitle>Comptes Générés</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {accounts && accounts.map(account => (
                        <Card key={account.id}>
                            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><strong>Nom:</strong> {account.firstname} {account.lastname}</div>
                                <div><strong>Username:</strong> {account.username}</div>
                                <div><strong>Password:</strong> {account.password}</div>
                                <div><strong>Email:</strong> {account.email}</div>
                                <div><strong>Lead:</strong> {account.lead}</div>
                                <div><strong>Leg:</strong> {account.leg}</div>
                                <div><strong>SucAcc:</strong> {account.sucAcc}</div>
                                <div><strong>Ref:</strong> {account.ref}</div>
                            </CardContent>
                        </Card>
                    ))}
                    {(!accounts || accounts.length === 0) && <p>Aucun compte généré.</p>}
                </div>
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
      await addDoc(collection(db, 'accounts'), {
        ...previewData,
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
    return <p>Impossible de charger les paramètres. Veuillez configurer les règles de génération.</p>
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
              <TabsTrigger value="json" disabled>JSON</TabsTrigger>
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
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><strong>Nom:</strong> {previewData.firstname} {previewData.lastname}</div>
                <div><strong>Username:</strong> {previewData.username}</div>
                <div><strong>Password:</strong> {previewData.password}</div>
                <div><strong>Email:</strong> {previewData.email}</div>
             </div>
            <div className="flex space-x-4">
              <Button onClick={handleSave}>Enregistrer</Button>
              <Button variant="ghost" onClick={() => setPreviewData(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AccountList />
    </div>
  );
}
