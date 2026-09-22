import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ru, type TKey } from './ru';
import { en } from './en';
import { kk } from './kk';

export type Locale = 'ru-KZ' | 'kk-KZ' | 'en-US';
export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'ru-KZ', label: 'Русский' },
  { id: 'kk-KZ', label: 'Қазақша' },
  { id: 'en-US', label: 'English' },
];

const dictionaries: Record<Locale, Partial<Record<TKey, string>>> = { 'ru-KZ': ru, 'kk-KZ': kk, 'en-US': en };
const STORAGE_KEY = 'bupy.locale';

function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in dictionaries) return saved;
  } catch { /* localStorage может быть недоступен */ }
  return 'ru-KZ';
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
    document.documentElement.lang = l.slice(0, 2);
  }, []);

  const t = useCallback((key: TKey) => dictionaries[locale][key] ?? ru[key], [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
