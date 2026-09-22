import { useState, type FormEvent } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { TextField } from '@/components/TextField';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { requestPasswordReset } from '@/services/authService';
import { authErrorKey } from '@/utils/authErrors';
import { isEmail } from '@/utils/validation';

export default function ResetPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!isEmail(email)) { setError(t('validation.email')); return; }
    setError(undefined);
    setBusy(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      const key = authErrorKey(err);
      // Не раскрываем, существует ли аккаунт: «не найден» и «неверный email» считаем успехом.
      if (key === 'error.auth.invalidCredential') setSent(true);
      else setFormError(t(key));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title={t('auth.reset.title')}>
      {sent ? (
        <p role="status" className="rounded-ctl bg-lagoon-50 px-4 py-3 text-lagoon-800">{t('auth.reset.sent')}</p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <p className="text-ink-soft">{t('auth.reset.hint')}</p>
          <FormError message={formError} />
          <TextField label={t('auth.email')} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <button type="submit" className="btn-primary" disabled={busy}>{t('auth.reset.send')}</button>
        </form>
      )}
    </AuthLayout>
  );
}
