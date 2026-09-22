import type { InputHTMLAttributes } from 'react';

export function Checkbox({ label, className = '', ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex min-h-[44px] items-center gap-3 text-sm font-medium text-ink ${className}`}>
      <input type="checkbox" className="h-6 w-6 shrink-0 accent-lagoon-600" {...rest} />
      {label}
    </label>
  );
}
