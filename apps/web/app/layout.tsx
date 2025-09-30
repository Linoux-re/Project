import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <div className="mx-auto max-w-6xl p-6">
          <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <h1 className="text-2xl font-semibold">Pronote Simplifié</h1>
            <nav className="space-x-4 text-sm uppercase tracking-widest">
              <a href="/dashboard" className="hover:underline">
                Tableau de bord
              </a>
              <a href="/auth/login" className="hover:underline">
                Connexion
              </a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
