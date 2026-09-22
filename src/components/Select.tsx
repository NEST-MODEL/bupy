import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  children: ReactNode;
}
export function Select({ label, children, className = '', ...rest }: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className={`field ${className}`} {...rest}>{children}</select>
    </div>
  );
}
