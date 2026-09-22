import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/i18n';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, type = 'text', className = '', ...rest }: Props) {
  const id = useId();
  const { t } = useI18n();
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && shown ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`field ${isPassword ? 'pr-14' : ''} ${error ? 'field-error' : ''} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? t('auth.hidePassword') : t('auth.showPassword')}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-ctl text-ink-soft hover:bg-lagoon-50"
          >
            {shown ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-berry-700">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}
