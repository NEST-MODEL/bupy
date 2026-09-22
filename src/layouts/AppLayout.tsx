import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, HeartPulse, House, LifeBuoy, UserRound } from 'lucide-react';
import { useI18n } from '@/i18n';
import type { TKey } from '@/i18n/ru';
import { Logo } from '@/components/Logo';

const items: { to: string; key: TKey; icon: typeof House; end?: boolean }[] = [
  { to: '/app', key: 'nav.home', icon: House, end: true },
  { to: '/app/calendar', key: 'nav.calendar', icon: CalendarDays },
  { to: '/app/health', key: 'nav.health', icon: HeartPulse },
  { to: '/app/help', key: 'nav.help', icon: LifeBuoy },
  { to: '/app/profile', key: 'nav.profile', icon: UserRound },
];

export function AppLayout() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen md:pl-64">
      {/* Планшет/десктоп: боковая панель */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white p-5 md:flex">
        <Logo />
        <nav aria-label={t('nav.main')} className="mt-8 flex flex-col gap-1">
          {items.map(({ to, key, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[48px] items-center gap-3 rounded-ctl px-3 font-semibold ${isActive ? 'bg-lagoon-50 text-lagoon-700' : 'text-ink-soft hover:bg-mist'}`
              }
            >
              <Icon size={22} aria-hidden="true" />
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="mx-auto w-full max-w-2xl px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))] md:pb-10">
        <Outlet />
      </main>

      {/* Телефон: нижняя навигация с учётом safe area iPhone */}
      <nav
        aria-label={t('nav.main')}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {items.map(({ to, key, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${isActive ? 'text-lagoon-700' : 'text-ink-faint'}`
                }
              >
                <Icon size={24} aria-hidden="true" />
                {t(key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
