import type { Metadata } from 'next';
import './globals.css';
import { FirebaseProvider } from '@/firebase/provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'UCCOS Admin',
  description: 'Admin tool for UCCOS account management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <FirebaseProvider>
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
