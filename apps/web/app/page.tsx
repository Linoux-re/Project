import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Bienvenue dans la plateforme éducative</h2>
      <p>
        Cette version simplifiée présente un aperçu des modules essentiels : emploi du temps, devoirs, notes, messagerie,
        actualités et administration.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { href: '/dashboard', label: 'Tableau de bord' },
          { href: '/auth/login', label: 'Connexion' },
          { href: '/dashboard/eleve', label: 'Espace Élève' },
          { href: '/dashboard/prof', label: 'Espace Professeur' },
          { href: '/dashboard/parent', label: 'Espace Parent' },
          { href: '/dashboard/admin', label: 'Administration' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded border border-slate-800 p-4 hover:bg-slate-900">
            <span className="block text-lg font-semibold">{item.label}</span>
            <span className="text-sm text-slate-400">Explorer</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
