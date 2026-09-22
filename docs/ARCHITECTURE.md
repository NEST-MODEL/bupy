# Архитектура

- **Frontend:** React 18 + TypeScript + Vite, Tailwind CSS, React Router (HashRouter — работает на любом статическом хостинге).
- **Backend:** только Firebase Auth + Firestore из браузера. Своего сервера нет.
- **PWA:** `vite-plugin-pwa` (Workbox), manifest, иконки, offline shell. Запросы Firebase service worker не кеширует — за офлайн отвечает Firestore SDK.
- **i18n:** `src/i18n` — словарь `ru-KZ` полный, `kk-KZ` и `en-US` частично (остальное берётся из ru). Все пользовательские тексты — через `t('ключ')`.
- **Слои:** `pages` (экраны) → `features`/`components` (UI) → `services` (Firebase-вызовы) → `firebase` (инициализация). Компоненты не обращаются к Firebase напрямую.
- **Дизайн:** палитра lagoon (тёмно-бирюзовый), шрифт Manrope (self-hosted через @fontsource — работает офлайн), крупные touch targets (≥ 44–52 px), safe areas iPhone, `prefers-reduced-motion`.
