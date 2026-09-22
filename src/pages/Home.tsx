import { PawPrint } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { useI18n } from '@/i18n';

export default function Home() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('home.title')}</h1>
      <EmptyState icon={<PawPrint size={26} />} title={t('home.empty.title')} text={t('home.empty.text')} />
      <p className="mt-4 text-center text-sm text-ink-faint">{t('common.comingSoon')}</p>
    </>
  );
}
