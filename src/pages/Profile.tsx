import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useI18n, LOCALES, type Locale } from '@/i18n';
import { logout } from '@/services/authService';
import { FormError } from '@/components/FormError';

export default function Profile() {
  const { t, locale, setLocale } = useI18n();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    try { await logout(); } catch { setError(t('error.generic')); }
  }

  return (
    <>
      <h1 className="mb-5 text-3xl font-extrabold tracking-tight">{t('profile.title')}</h1>
      <div className="surface divide-y divide-line">
        <div className="p-5">
          <p className="text-sm text-ink-faint">{t('profile.account')}</p>
          <p className="mt-1 font-bold">{user?.displayName || '—'}</p>
          <p className="text-ink-soft">{user?.email}</p>
        </div>
        <div className="p-5">
          <label htmlFor="locale" className="label">Язык / Тіл / Language</label>
          <select id="locale" className="field" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
            {LOCALES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <FormError message={error} />
        <button type="button" onClick={onLogout} className="btn-secondary"><LogOut size={20} aria-hidden="true" />{t('auth.logout')}</button>
      </div>
    </>
  );
}
