import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/i18n';

export function Terms() {
  const { t } = useI18n();
  return (
    <LegalShell title={t('terms.title')}>
      <p>Bupy — сервис для хранения информации о здоровье домашних животных: профиль питомца, прививки, анализы, лекарства и события.</p>
      <p>Вы отвечаете за точность вносимых данных. Bupy не ставит диагнозы и не заменяет ветеринарного врача. Раздел Bupy Help — справочный.</p>
      <p>Сервис предоставляется «как есть». Мы можем менять функции по мере развития приложения.</p>
    </LegalShell>
  );
}

export function Privacy() {
  const { t } = useI18n();
  return (
    <LegalShell title={t('privacy.title')}>
      <p>Мы храним email, имя и данные ваших питомцев только для работы приложения. Данные доступны только вашему аккаунту.</p>
      <p>Вы можете экспортировать данные и удалить аккаунт в разделе «Мой профиль».</p>
      <p>Фото ветеринарного паспорта распознаётся прямо на вашем устройстве и не отправляется на сторонние серверы распознавания.</p>
    </LegalShell>
  );
}

function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto max-w-xl px-5 pb-12 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <Link to="/" aria-label={t('auth.back')} className="-ml-2 flex h-11 w-11 items-center justify-center rounded-ctl text-ink-soft hover:bg-lagoon-50">
        <ArrowLeft size={22} aria-hidden="true" />
      </Link>
      <h1 className="mb-4 mt-6 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mb-6 rounded-ctl bg-honey-100 px-4 py-3 text-sm text-honey-700">{t('legal.draft')}</p>
      <div className="space-y-4 text-ink-soft">{children}</div>
    </main>
  );
}
