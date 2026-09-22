import { Link } from 'react-router-dom';
import { Bell, CalendarDays, FileHeart, HeartPulse, LifeBuoy, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useI18n } from '@/i18n';
import type { TKey } from '@/i18n/ru';

const features: { icon: typeof Bell; title: TKey; text: TKey }[] = [
  { icon: FileHeart, title: 'landing.passport.title', text: 'landing.passport.text' },
  { icon: HeartPulse, title: 'landing.history.title', text: 'landing.history.text' },
  { icon: CalendarDays, title: 'landing.calendar.title', text: 'landing.calendar.text' },
  { icon: Bell, title: 'landing.reminders.title', text: 'landing.reminders.text' },
  { icon: LifeBuoy, title: 'landing.help.title', text: 'landing.help.text' },
  { icon: MapPin, title: 'landing.clinics.title', text: 'landing.clinics.text' },
];

export default function Landing() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <Logo />
        <Link to="/login" className="btn-quiet">{t('landing.login')}</Link>
      </header>

      <section className="pb-12 pt-14">
        <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">{t('app.tagline')}</h1>
        <p className="mt-5 max-w-md text-lg text-ink-soft">{t('app.subtitle')}</p>
        <div className="mt-8 flex max-w-sm flex-col gap-3">
          <Link to="/register" className="btn-primary">{t('landing.start')}</Link>
          <Link to="/login" className="btn-secondary">{t('landing.login')}</Link>
        </div>
        <p className="mt-4 text-sm text-ink-faint">{t('landing.free')}</p>
      </section>

      <section aria-label="Возможности">
        <ul className="divide-y divide-line border-y border-line">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 py-5">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lagoon-50 text-lagoon-600" aria-hidden="true">
                <Icon size={22} />
              </span>
              <div>
                <h2 className="font-bold">{t(title)}</h2>
                <p className="mt-0.5 text-ink-soft">{t(text)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 flex gap-5 text-sm text-ink-faint">
        <Link to="/terms" className="underline underline-offset-2">{t('auth.terms')}</Link>
        <Link to="/privacy" className="underline underline-offset-2">{t('auth.privacy')}</Link>
      </footer>
    </div>
  );
}
