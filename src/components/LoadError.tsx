import { RotateCw } from 'lucide-react';
import { useI18n } from '@/i18n';

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="surface flex flex-col items-center gap-3 p-6 text-center">
      <p className="text-ink-soft">{t('error.load')}</p>
      <button type="button" onClick={onRetry} className="btn-secondary !w-auto px-4">
        <RotateCw size={18} aria-hidden="true" /> {t('common.retry')}
      </button>
    </div>
  );
}
