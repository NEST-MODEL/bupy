import type { TKey } from './ru';
// Подготовленная локаль: часть ключей переведена, остальные берутся из ru.
export const en: Partial<Record<TKey, string>> = {
  'app.tagline': 'Everything about your pet’s health — in one place.',
  'app.subtitle': 'Passport, vaccines, tests, medications and daily care — in one app.',
  'nav.home': 'Home',
  'nav.calendar': 'Calendar',
  'nav.health': 'Health',
  'nav.help': 'Help',
  'nav.profile': 'Profile',
  'landing.start': 'Start for free',
  'landing.login': 'Sign in',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.submit.login': 'Sign in',
  'auth.submit.register': 'Create account',
  'auth.logout': 'Sign out',
};
