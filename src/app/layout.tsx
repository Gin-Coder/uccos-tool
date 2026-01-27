import type { Metadata } from 'next';
import './globals.css';
import { FirebaseProvider } from '@/firebase/provider';

export const metadata: Metadata = {
  title: 'UCCOS ADMIN TOOL',
  description: 'Admin tool for UCCOS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseProvider>{children}</FirebaseProvider>
      </body>
    </html>
  );
}
