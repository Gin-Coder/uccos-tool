'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useDoc } from '@/firebase/hooks';
import { doc, setDoc } from 'firebase/firestore';
import type { GenerationSettings } from '@/types';

const initialSettings: GenerationSettings = {
  usernameFormat: '',
  passwordFormat: '',
  emailDomain: '',
  allowManualDate: false,
  requiredFields: [],
};

export default function ReglesPage() {
  const db = useFirestore();
  const settingsRef = db ? doc(db, 'settings', 'rules') : null;
  const { data: initialData, loading } = useDoc<GenerationSettings>(settingsRef);
  const [settings, setSettings] = useState<GenerationSettings>(initialSettings);
  
  useEffect(() => {
    if (initialData) {
      setSettings(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!settingsRef) return;
    try {
      await setDoc(settingsRef, settings);
      alert('Règles enregistrées avec succès !');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erreur lors de l\'enregistrement des règles.');
    }
  };

  if (loading) {
    return <p>Chargement des règles...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Règles de Génération</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="usernameFormat">Format du nom d'utilisateur</Label>
          <Input id="usernameFormat" name="usernameFormat" value={settings.usernameFormat} onChange={handleInputChange} />
          <p className="text-sm text-gray-500">Variables: {`{firstname}, {lastname}, {first2}, {first3}, {SucAcc}, {Ref}`}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="passwordFormat">Format du mot de passe</Label>
          <Input id="passwordFormat" name="passwordFormat" value={settings.passwordFormat} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailDomain">Domaine Email</Label>
          <Input id="emailDomain" name="emailDomain" value={settings.emailDomain} onChange={handleInputChange} />
        </div>
        
        <Button onClick={handleSave}>Enregistrer les Règles</Button>
      </CardContent>
    </Card>
  );
}
