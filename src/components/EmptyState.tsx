import type { ReactNode } from 'react';

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600" aria-hidden="true">{icon}</div>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1.5 max-w-xs text-sm text-ink-soft">{text}</p>
      {action && <div className="mt-5 w-full max-w-xs">{action}</div>}
    </div>
  );
}
