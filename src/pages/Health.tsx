import { HeartPulse } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { useI18n } from '@/i18n';

export default function Health() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('health.title')}</h1>
      <EmptyState icon={<HeartPulse size={26} />} title={t('health.empty.title')} text={t('health.empty.text')} />
    </>
  );
}
