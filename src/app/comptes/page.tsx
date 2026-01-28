'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase/hooks';
import type { Account, AccountFormData, GenerationSettings } from '@/types';
import { generateAccountCredentials, validateFormData } from '@/lib/generation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


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


function EditAccountDialog({ account, onOpenChange, onSave }: { account: Account | null, onOpenChange: (isOpen: boolean) => void, onSave: (data: Partial<Account>) => void }) {
    const [formData, setFormData] = useState<Partial<Account>>({});

    const editableFields: (keyof Account)[] = ['firstname', 'lastname', 'middlename', 'phone', 'lead', 'leg', 'sucAcc', 'ref', 'username', 'password', 'email', 'displayDate'];

    useEffect(() => {
        if (account) {
            setFormData(account);
        }
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = () => {
        onSave(formData);
    }

    if (!account) return null;

    return (
        <Dialog open={!!account} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Modifier le compte</DialogTitle>
                    <DialogDescription>
                        Mettez à jour les informations du compte. Cliquez sur "Sauvegarder" pour appliquer les changements.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    {editableFields.map(key => (
                         <div key={key} className="space-y-2">
                             <Label htmlFor={`edit-${key}`} className="capitalize">{key}</Label>
                             <Input 
                                id={`edit-${key}`}
                                name={key}
                                value={(formData[key] as string) || ''}
                                onChange={handleChange}
                            />
                         </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button type="button" onClick={handleSaveChanges}>Sauvegarder les changements</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AccountList() {
    const db = useFirestore();
    const accountsQuery = useMemoFirebase(() => db ? query(collection(db, 'accounts'), orderBy('createdAt', 'desc')) : null, [db]);
    const { data: accounts, loading } = useCollection<Account>(accountsQuery);
    
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

    const handleUpdateAccount = async (updatedData: Partial<Account>) => {
        if (!editingAccount || !db) return;
        try {
            const accountRef = doc(db, 'accounts', editingAccount.id);
            const { id, ...dataToUpdate } = updatedData;
            await updateDoc(accountRef, dataToUpdate);
            alert('Compte mis à jour avec succès !');
            setEditingAccount(null);
        } catch (error) {
            console.error('Error updating account:', error);
            alert('Erreur lors de la mise à jour du compte.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletingAccount || !db) return;
        try {
            await deleteDoc(doc(db, 'accounts', deletingAccount.id));
            alert('Compte supprimé avec succès !');
            setDeletingAccount(null);
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Erreur lors de la suppression du compte.');
        }
    };

    if (loading) return <div className="text-center p-8">Chargement des comptes...</div>;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Comptes Générés</CardTitle>
                    <CardDescription>Liste de tous les comptes enregistrés dans la base de données.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom & Email</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Password</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts && accounts.map(account => (
                                <TableRow key={account.id}>
                                    <TableCell>
                                        <div className="font-medium">{account.firstname} {account.lastname}</div>
                                        <div className="text-sm text-muted-foreground">{account.email}</div>
                                    </TableCell>
                                    <TableCell><span className="font-mono">{account.username}</span></TableCell>
                                    <TableCell><span className="font-mono">{account.password}</span></TableCell>
                                    <TableCell className="text-sm">
                                      <div>Lead/Leg: {account.lead}/{account.leg}</div>
                                      <div>Suc/Ref: {account.sucAcc}/{account.ref}</div>
                                    </TableCell>
                                    <TableCell>
                                        {account.createdAt?.toDate ? account.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Ouvrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingAccount(account)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Modifier</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setDeletingAccount(account)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Supprimer</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {(!accounts || accounts.length === 0) && !loading && <p className="p-8 text-center text-muted-foreground">Aucun compte n'a été généré pour le moment.</p>}
                </CardContent>
            </Card>

            <EditAccountDialog 
                account={editingAccount} 
                onOpenChange={(isOpen) => !isOpen && setEditingAccount(null)}
                onSave={handleUpdateAccount}
            />

            <AlertDialog open={!!deletingAccount} onOpenChange={(isOpen) => !isOpen && setDeletingAccount(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce compte ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le compte de <span className="font-bold">{deletingAccount?.firstname} {deletingAccount?.lastname}</span> sera définitivement supprimé de la base de données.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">Confirmer la suppression</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function ComptesPage() {
  const [previewData, setPreviewData] = useState<Account | null>(null);
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => db ? doc(db, 'settings', 'rules') : null, [db]);
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
          </CardHeader>
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
