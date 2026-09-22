import type { TKey } from './ru';
// Подготовленная локаль: часть ключей переведена, остальные берутся из ru.
// Перед релизом казахские тексты стоит проверить носителю языка.
export const kk: Partial<Record<TKey, string>> = {
  'app.tagline': 'Үй жануарыңыздың денсаулығы — бір жерде.',
  'nav.home': 'Басты бет',
  'nav.calendar': 'Күнтізбе',
  'nav.health': 'Денсаулық',
  'nav.help': 'Көмекші',
  'nav.profile': 'Профиль',
  'landing.start': 'Тегін бастау',
  'landing.login': 'Кіру',
  'auth.email': 'Email',
  'auth.password': 'Құпиясөз',
  'auth.logout': 'Шығу',
};
