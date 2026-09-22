import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useI18n } from '@/i18n';

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label={t('auth.back')} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-ctl text-ink-soft hover:bg-lagoon-50">
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <Logo size={32} />
        <span className="w-11" aria-hidden="true" />
      </div>
      <h1 className="mb-6 mt-10 text-3xl font-extrabold tracking-tight">{title}</h1>
      {children}
    </main>
  );
}
