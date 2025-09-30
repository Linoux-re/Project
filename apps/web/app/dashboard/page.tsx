async function fetchDashboard(role: string) {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:4000'}/dashboard?role=${role}`, {
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer stub-token',
    },
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function DashboardPage({ searchParams }: { searchParams: { role?: string } }) {
  const role = searchParams.role ?? 'ELEVE';
  const data = await fetchDashboard(role);
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Tableau de bord {role.toLowerCase()}</h2>
        <div className="space-x-2 text-sm uppercase">
          {['ELEVE', 'PARENT', 'PROF', 'STAFF_VIE_SCOLAIRE', 'ADMIN'].map((r) => (
            <a key={r} href={`?role=${r}`} className="rounded border border-slate-700 px-3 py-1 hover:bg-slate-900">
              {r}
            </a>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {data?.widgets?.map((widget: any) => (
          <div key={widget.type} className="rounded border border-slate-800 bg-slate-950/50 p-4">
            <h3 className="text-lg font-semibold">{widget.title}</h3>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-400">{JSON.stringify(widget.data, null, 2)}</pre>
          </div>
        )) ?? <p>Aucune donnée disponible</p>}
      </div>
    </section>
  );
}
