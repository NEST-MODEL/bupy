# Деплой

## GitHub Pages (используется сейчас)

Настроено через GitHub Actions (`.github/workflows/deploy.yml`): при пуше в `main` автоматически собирается `npm run build` и публикуется на GitHub Pages.

Нужно один раз настроить:
1. Repo → **Settings → Pages → Source: GitHub Actions**.
2. Repo → **Settings → Secrets and variables → Actions → Variables** — добавить `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` (значения из Firebase Console → Project settings → Your apps → Web).
3. Firebase Console → **Authentication → Settings → Authorized domains** — добавить `<username>.github.io`.

Дальше — просто `git push`, сайт обновляется сам за 1-2 минуты.

## Альтернативы (тоже бесплатно, без карты)

- **Cloudflare Pages** — подключить репозиторий, build command `npm run build`, output `dist`, переменные `VITE_FIREBASE_*` в настройках проекта. Плюс: отдаёт статику через собственный CDN, часто быстрее для пользователей вне США/ЕС.
- **Firebase Hosting** (тариф Spark) — `npx firebase deploy --only hosting` после `npm run build`.

Во всех случаях: **base: './'** и HashRouter в коде означают, что сайт одинаково работает что в корне домена, что на подпути (`/bupy/`) — ничего дополнительно настраивать не нужно.

## Откат / повторный деплой

Если сборка на GitHub Actions упала — вкладка **Actions** покажет, на каком шаге. Частые причины: не заданы переменные `VITE_FIREBASE_*`, синтаксическая ошибка в коде (сборка `npm run build` упадёт так же и локально — проверяйте `npm run build` перед пушем при больших изменениях).
