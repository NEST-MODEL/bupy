import { useI18n } from '@/i18n';

export function Spinner() {
  const { t } = useI18n();
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center text-ink-soft">
      <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-lagoon-200 border-t-lagoon-600" aria-hidden="true" />
      {t('common.loading')}
    </div>
  );
}
