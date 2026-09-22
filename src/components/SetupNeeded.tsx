import { useI18n } from '@/i18n';
import { Logo } from './Logo';

export function SetupNeeded() {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Logo />
      <h1 className="mt-8 text-2xl font-extrabold">{t('setup.title')}</h1>
      <p className="mt-3 text-ink-soft">{t('setup.text')}</p>
    </main>
  );
}
