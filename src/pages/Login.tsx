import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { TextField } from '@/components/TextField';
import { FormError } from '@/components/FormError';
import { useI18n } from '@/i18n';
import { login } from '@/services/authService';
import { authErrorKey } from '@/utils/authErrors';
import { isEmail } from '@/utils/validation';

export default function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = t('validation.email');
    if (!password) next.password = t('validation.required');
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch (err) {
      setFormError(t(authErrorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title={t('auth.login.title')}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormError message={formError} />
        <TextField label={t('auth.email')} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <TextField label={t('auth.password')} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <Link to="/reset" className="btn-quiet self-start -ml-3">{t('auth.forgot')}</Link>
        <button type="submit" className="btn-primary" disabled={busy}>{t('auth.submit.login')}</button>
        <Link to="/register" className="btn-quiet">{t('auth.toRegister')}</Link>
      </form>
    </AuthLayout>
  );
}
