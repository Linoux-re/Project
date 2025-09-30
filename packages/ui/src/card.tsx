import { PropsWithChildren } from 'react';

export function Card({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="rounded border border-slate-800 bg-slate-950/70 p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-2 text-slate-300">{children}</div>
    </div>
  );
}
