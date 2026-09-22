import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { TextField } from '@/components/TextField';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { register } from '@/services/authService';
import { authErrorKey } from '@/utils/authErrors';
import { isEmail, isStrongEnough } from '@/utils/validation';

interface Errors { firstName?: string; email?: string; password?: string; confirm?: string; consent?: string }

export default function Register() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const next: Errors = {};
    if (!form.firstName.trim()) next.firstName = t('validation.required');
    if (!isEmail(form.email)) next.email = t('validation.email');
    if (!isStrongEnough(form.password)) next.password = t('validation.passwordShort');
    if (form.confirm !== form.password) next.confirm = t('validation.passwordMismatch');
    if (!consent) next.consent = t('validation.consent');
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, locale });
      navigate('/app', { replace: true });
    } catch (err) {
      setFormError(t(authErrorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title={t('auth.register.title')}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <TextField label={t('auth.firstName')} autoComplete="given-name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
        <TextField label={t('auth.lastName')} autoComplete="family-name" value={form.lastName} onChange={set('lastName')} />
        <TextField label={t('auth.email')} type="email" inputMode="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField label={t('auth.password')} type="password" autoComplete="new-password" hint={t('auth.passwordHint')} value={form.password} onChange={set('password')} error={errors.password} />
        <TextField label={t('auth.passwordConfirm')} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />

        <div>
          <label className="flex min-h-[44px] items-start gap-3 text-sm text-ink-soft">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={errors.consent ? true : undefined} className="mt-0.5 h-6 w-6 shrink-0 accent-lagoon-600" />
            <span>
              {t('auth.agree.prefix')} <Link to="/terms" className="font-semibold text-lagoon-700 underline">{t('auth.terms')}</Link> {t('auth.and')}{' '}
              <Link to="/privacy" className="font-semibold text-lagoon-700 underline">{t('auth.privacy')}</Link>
            </span>
          </label>
          {errors.consent && <p role="alert" className="mt-1 text-sm text-berry-700">{errors.consent}</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={busy}>{t('auth.submit.register')}</button>
        <Link to="/login" className="btn-quiet">{t('auth.toLogin')}</Link>
      </form>
    </AuthLayout>
  );
}
