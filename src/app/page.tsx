'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    redirect('/comptes');
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirection...</p>
    </div>
  );
}
