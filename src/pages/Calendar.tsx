import { CalendarDays } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { useI18n } from '@/i18n';

export default function Calendar() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('calendar.title')}</h1>
      <EmptyState icon={<CalendarDays size={26} />} title={t('calendar.empty.title')} text={t('calendar.empty.text')} />
    </>
  );
}
