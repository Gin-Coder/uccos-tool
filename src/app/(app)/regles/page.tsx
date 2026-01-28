'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/hooks';
import { doc, setDoc } from 'firebase/firestore';
import type { GenerationSettings, AccountFormData } from '@/types';

const initialSettings: GenerationSettings = {
  usernameFormat: '',
  passwordFormat: '',
  emailDomain: '',
  allowManualDate: false,
  requiredFields: [],
};

const allPossibleFields = [
    'firstname', 'lastname', 'lead', 'leg', 'sucAcc', 'ref', 'phone', 'middlename'
] as const;


export default function ReglesPage() {
  const db = useFirestore();
  const settingsRef = db ? doc(db, 'settings', 'rules') : null;
  const { data: initialData, loading } = useDoc<GenerationSettings>(settingsRef);
  const [settings, setSettings] = useState<GenerationSettings>(initialSettings);
  
  useEffect(() => {
    if (initialData) {
      // Ensure requiredFields is always an array
      const saneData = {...initialData, requiredFields: initialData.requiredFields || []};
      setSettings(saneData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleRequiredFieldChange = (field: keyof AccountFormData, checked: boolean) => {
    setSettings(prev => {
        const currentFields = prev.requiredFields || [];
        if (checked) {
            return { ...prev, requiredFields: [...currentFields, field] };
        } else {
            return { ...prev, requiredFields: currentFields.filter(f => f !== field) };
        }
    });
  }

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
          <p className="text-sm text-gray-500">Variables: {`{firstname}, {lastname}, {first2}, {first3}, {SucAcc}, {Ref}, {lead}, {leg}`}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="passwordFormat">Format du mot de passe</Label>
          <Input id="passwordFormat" name="passwordFormat" value={settings.passwordFormat} onChange={handleInputChange} />
          <p className="text-sm text-gray-500">Utilisez les mêmes variables que pour le nom d'utilisateur.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailDomain">Domaine Email</Label>
          <Input id="emailDomain" name="emailDomain" value={settings.emailDomain} onChange={handleInputChange} placeholder="example.com" />
        </div>
        
        <div className="flex items-center space-x-2">
            <Checkbox id="allowManualDate" name="allowManualDate" checked={settings.allowManualDate} onCheckedChange={(checked) => handleCheckboxChange('allowManualDate', checked as boolean)} />
            <Label htmlFor="allowManualDate">Autoriser la date manuelle</Label>
        </div>

        <div className="space-y-2">
            <Label>Champs obligatoires</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg border p-4">
                {allPossibleFields.map(field => (
                    <div key={field} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`required-${field}`} 
                            checked={settings.requiredFields?.includes(field)} 
                            onCheckedChange={(checked) => handleRequiredFieldChange(field, checked as boolean)}
                        />
                        <Label htmlFor={`required-${field}`} className="capitalize">{field}</Label>
                    </div>
                ))}
            </div>
        </div>
        
        <Button onClick={handleSave}>Enregistrer les Règles</Button>
      </CardContent>
    </Card>
  );
}
