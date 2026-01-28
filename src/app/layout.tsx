import type { Metadata } from 'next';
import './globals.css';
import { FirebaseProvider } from '@/firebase/provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Header from '@/components/layout/header';

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
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
              <Header />
              <main className="flex-grow container mx-auto p-4 md:p-8">
                {children}
              </main>
            </div>
          </FirebaseClientProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
