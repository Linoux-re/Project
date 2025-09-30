'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('eleve@example.com');
  const [password, setPassword] = useState('password');
  const [result, setResult] = useState<string>('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const res = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <section className="max-w-md space-y-6">
      <h2 className="text-2xl font-semibold">Connexion</h2>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="block text-sm text-slate-400" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-slate-400" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          />
        </div>
        <button className="w-full rounded bg-indigo-500 px-3 py-2 font-semibold text-white hover:bg-indigo-600">Se connecter</button>
      </form>
      {result && (
        <pre className="overflow-auto rounded border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">{result}</pre>
      )}
    </section>
  );
}
