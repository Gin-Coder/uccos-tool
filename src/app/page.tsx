'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase'; // Simplified firebase export

// --- Types ---
interface GenerationSettings {
  usernameFormat: string;
  passwordFormat: string;
  emailFormat: string;
}

interface AccountFormData {
  firstname: string;
  middlename: string;
  lastname: string;
  lead: string;
  leg: string;
  leaderAssoc: string;
  leaderLine: string;
  position: string;
  ref: string;
  sucAcc: string;
  accountPro: string;
  qac: string;
  phone: string;
}

interface Account extends AccountFormData {
  id: string;
  username: string;
  password: string;
  email: string;
}


// --- Account Generation Logic ---
const generateAccountCredentials = (data: any, settings: GenerationSettings) => {
  const replacements: { [key: string]: string } = {
    '{FIRST2}': data.firstname.substring(0, 2),
    '{FIRST3}': data.firstname.substring(0, 3),
    '{firstname}': data.firstname.toLowerCase(),
    '{lastname}': data.lastname.toLowerCase(),
    '{SucAcc}': String(data.sucAcc),
    '{REF}': String(data.ref),
    '{qac}': data.qac,
    '{lead}': String(data.lead),
    '{leg}': String(data.leg),
  };

  let username = settings.usernameFormat;
  let password = settings.passwordFormat;
  let email = settings.emailFormat;

  for (const placeholder in replacements) {
    const regex = new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    username = username.replace(regex, replacements[placeholder]);
    password = password.replace(regex, replacements[placeholder]);
    email = email.replace(regex, replacements[placeholder]);
  }
  
  for (const key in data) {
      const regex = new RegExp(`{${key}}`, 'gi');
      username = username.replace(regex, String(data[key]));
      password = password.replace(regex, String(data[key]));
      email = email.replace(regex, String(data[key]));
  }

  return { username, password, email };
};


export default function HomePage() {
  // --- State management ---
  const [settings, setSettings] = useState<GenerationSettings>({
    usernameFormat: '',
    passwordFormat: '',
    emailFormat: '',
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [newAccount, setNewAccount] = useState<AccountFormData>({
    firstname: '', middlename: '', lastname: '', lead: '', leg: '',
    leaderAssoc: '', leaderLine: 'UCCOS (All)', position: '7e rangée',
    ref: '', sucAcc: '', accountPro: '', qac: '', phone: '',
  });

  const [filters, setFilters] = useState({ name: '', lead: '' });

  // --- Firebase Listeners ---
  useEffect(() => {
    if (!db) {
        console.error("Firestore is not initialized. Check your Firebase config.");
        setLoading(false);
        return;
    }

    // Listener for settings
    const settingsUnsub = onSnapshot(doc(db, 'settings', 'rules'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as GenerationSettings);
      } else {
        console.warn("Settings document 'settings/rules' not found.");
      }
    }, (error) => {
        console.error("Error fetching settings:", error);
    });

    // Listener for accounts
    const accountsQuery = query(collection(db, 'accounts'), orderBy('createdAt', 'desc'));
    const accountsUnsub = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Account[];
      setAccounts(accountsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching accounts:", error);
        setLoading(false);
    });

    // Cleanup function
    return () => {
      settingsUnsub();
      accountsUnsub();
    };
  }, []);

  // --- Form Handlers ---
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if(!db) return;
    try {
        await setDoc(doc(db, 'settings', 'rules'), settings, { merge: true });
        alert('Paramètres sauvegardés !');
    } catch (error) {
        console.error("Error saving settings: ", error);
        alert('Erreur lors de la sauvegarde des paramètres.');
    }
  };

  const handleAccountFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleGenerateAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!db) return;

    if (!settings.usernameFormat) {
        alert("Erreur: Les règles de génération ne sont pas chargées.");
        return;
    }

    const generated = generateAccountCredentials(newAccount, settings);
    const accountDataToSave = {
        ...newAccount,
        ...generated,
        middlename: newAccount.middlename || 'none',
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, 'accounts'), accountDataToSave);
        alert(`Compte pour ${newAccount.firstname} ${newAccount.lastname} créé !`);
        // Reset form
        setNewAccount({
            firstname: '', middlename: '', lastname: '', lead: '', leg: '',
            leaderAssoc: '', leaderLine: 'UCCOS (All)', position: '7e rangée',
            ref: '', sucAcc: '', accountPro: '', qac: '', phone: '',
        });
    } catch (error) {
        console.error("Error adding document: ", error);
        alert('Erreur lors de la création du compte.');
    }
  };

  // --- Filtering ---
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const fullName = `${account.firstname} ${account.lastname}`.toLowerCase();
      const nameMatch = filters.name ? fullName.includes(filters.name.toLowerCase()) : true;
      const leadMatch = filters.lead ? String(account.lead) === filters.lead : true;
      return nameMatch && leadMatch;
    });
  }, [accounts, filters]);

  // --- Helpers ---
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`'${text}' copié dans le presse-papiers.`);
    });
  };

  if (!db) {
    return (
        <div className="container">
            <h1 className="text-red-500">Erreur de Configuration Firebase</h1>
            <p>Veuillez vérifier votre fichier <code>.env.local</code> et vous assurer que les clés API Firebase sont correctes.</p>
        </div>
    )
  }

  // --- Render ---
  return (
    <div className="container">
      <header className="mb-8">
        <h1>UCCOS Admin Tool</h1>
        <p>Générez et gérez les comptes UCCOS simplement.</p>
      </header>

      <main className="grid-2">
        <section>
          <h2>Générer un Compte</h2>
          <div className="card">
            <form onSubmit={handleGenerateAccount}>
                <div className="grid-2">
                    <div className="form-group">
                        <label htmlFor="firstname">Prénom</label>
                        <input id="firstname" name="firstname" value={newAccount.firstname} onChange={handleAccountFormChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastname">Nom de famille</label>
                        <input id="lastname" name="lastname" value={newAccount.lastname} onChange={handleAccountFormChange} required />
                    </div>
                </div>
                 <div className="form-group">
                    <label htmlFor="middlename">Deuxième prénom (optionnel)</label>
                    <input id="middlename" name="middlename" value={newAccount.middlename} onChange={handleAccountFormChange} />
                </div>
                 <div className="grid-2">
                    <div className="form-group">
                        <label htmlFor="lead">Lead</label>
                        <input id="lead" name="lead" type="number" value={newAccount.lead} onChange={handleAccountFormChange} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="leg">Leg</label>
                        <input id="leg" name="leg" type="number" value={newAccount.leg} onChange={handleAccountFormChange} required/>
                    </div>
                 </div>
                 <div className="form-group">
                    <label htmlFor="leaderAssoc">Leader Associé</label>
                    <input id="leaderAssoc" name="leaderAssoc" value={newAccount.leaderAssoc} onChange={handleAccountFormChange} required />
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label htmlFor="leaderLine">Ligne de Leader</label>
                        <input id="leaderLine" name="leaderLine" value={newAccount.leaderLine} onChange={handleAccountFormChange} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="position">Position</label>
                        <input id="position" name="position" value={newAccount.position} onChange={handleAccountFormChange} required/>
                    </div>
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label htmlFor="ref">Ref</label>
                        <input id="ref" name="ref" type="number" value={newAccount.ref} onChange={handleAccountFormChange} required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sucAcc">SucAcc</label>
                        <input id="sucAcc" name="sucAcc" type="number" value={newAccount.sucAcc} onChange={handleAccountFormChange} required/>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="accountPro">AccountPro</label>
                    <input id="accountPro" name="accountPro" type="number" value={newAccount.accountPro} onChange={handleAccountFormChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="qac">QAC</label>
                    <input id="qac" name="qac" value={newAccount.qac} onChange={handleAccountFormChange} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Téléphone</label>
                    <input id="phone" name="phone" value={newAccount.phone} onChange={handleAccountFormChange} required/>
                </div>

              <button type="submit">Générer le compte</button>
            </form>
          </div>

          <h2>Paramètres de Génération</h2>
          <div className="card">
             <form onSubmit={handleSaveSettings}>
                <div className="form-group">
                    <label htmlFor="usernameFormat">Format du nom d'utilisateur</label>
                    <input id="usernameFormat" name="usernameFormat" value={settings.usernameFormat} onChange={handleSettingsChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="passwordFormat">Format du mot de passe</label>
                    <input id="passwordFormat" name="passwordFormat" value={settings.passwordFormat} onChange={handleSettingsChange} />
                </div>
                 <div className="form-group">
                    <label htmlFor="emailFormat">Format de l'e-mail</label>
                    <input id="emailFormat" name="emailFormat" value={settings.emailFormat} onChange={handleSettingsChange} />
                </div>
                <button type="submit">Sauvegarder les paramètres</button>
             </form>
          </div>
        </section>

        <section>
          <h2>Comptes Générés</h2>
          <div className="card">
            <div className="grid-2 mb-4">
                 <input 
                    placeholder="Filtrer par nom..."
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({...prev, name: e.target.value}))}
                 />
                 <input 
                    placeholder="Filtrer par lead..."
                    type="number"
                    value={filters.lead}
                    onChange={(e) => setFilters(prev => ({...prev, lead: e.target.value}))}
                 />
            </div>
            <div className="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Lead</th>
                            <th>Username</th>
                            <th>Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={4} className="text-center">Chargement...</td></tr>}
                        {!loading && filteredAccounts.length === 0 && <tr><td colSpan={4} className="text-center">Aucun compte trouvé.</td></tr>}
                        {filteredAccounts.map(account => (
                            <tr key={account.id}>
                                <td>{`${account.firstname} ${account.lastname}`}</td>
                                <td>{account.lead}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <span>{account.username}</span>
                                        <button className="ghost p-1" onClick={() => copyToClipboard(account.username)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <span>{account.password}</span>
                                        <button className="ghost p-1" onClick={() => copyToClipboard(account.password)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
