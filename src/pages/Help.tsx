import { LifeBuoy, TriangleAlert } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { useI18n } from '@/i18n';

export default function Help() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold tracking-tight">{t('help.title')}</h1>
      <div role="note" className="mb-5 flex gap-3 rounded-card border border-honey-500/40 bg-honey-100 p-4 text-sm text-honey-700">
        <TriangleAlert size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-bold">{t('help.disclaimer')}</p>
          <p className="mt-1">{t('help.urgent')}</p>
        </div>
      </div>
      <EmptyState icon={<LifeBuoy size={26} />} title={t('help.empty.title')} text={t('help.empty.text')} />
    </>
  );
}
