# Bupy — здоровье вашего питомца в одном месте

PWA для владельцев кошек и собак: профиль питомца, ветпаспорт (со сканом через OCR), прививки, анализы, лекарства, календарь, напоминания, Bupy Help (справочник + опциональный бесплатный ИИ) и поиск ветклиник на OpenStreetMap.
Стек: React + TypeScript + Vite + Tailwind CSS + Firebase (Auth + Firestore). **Только бесплатные сервисы, без банковской карты.**

## Статус разработки

| Этап | Что входит | Статус |
|---|---|---|
| 1. Каркас | Vite/React/TS/Tailwind, роутинг, i18n, дизайн-система, PWA, логотип, иконки, лендинг, нижняя навигация | ✅ |
| 2. Firebase | Регистрация/вход/сброс пароля/выход, сессия, Firestore rules, тесты правил | ✅ |
| 3. Ядро | Питомцы (несколько, переключатель, архив/удаление), dashboard, вакцинации, лекарства (+ дневник приёма), календарь | ✅ |
| 4. Остальное | OCR паспорта, Bupy Help (+опц. бесплатный ИИ), ветклиники (OSM), напоминания, экспорт, документация, Capacitor | ✅ |

## Быстрый старт

```bash
npm install
cp .env.example .env     # затем заполните значения (см. ниже)
npm run dev
```

Без `.env` приложение покажет экран «Осталось подключить Firebase».

## Настройка Firebase (бесплатно, без карты)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**. Тариф остаётся **Spark** (бесплатный) — ничего не привязывайте.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (production mode).
4. **Project settings → Your apps → Web (`</>`)** → скопируйте конфиг в `.env`.
5. Правила: Firestore → Rules → вставьте содержимое `firebase/firestore.rules` → Publish (или `npx firebase deploy --only firestore:rules`).
6. Storage не включайте — см. `docs/COST_CONTROL.md`.
7. Authentication → Settings → **Authorized domains** — добавьте домен деплоя.

## Bupy Help с бесплатным ИИ (опционально)

Статический справочник первой помощи работает всегда, без всего дополнительного. Чтобы включить ответы на свободные вопросы через бесплатный Gemini API — см. **`docs/GEMINI_SETUP.md`**: каждый пользователь подключает свой собственный бесплатный ключ в Профиле, ключ хранится только в его браузере.

## Тесты

```bash
npm test            # unit-тесты
npm run test:rules  # тесты Security Rules на локальном эмуляторе (нужны Java 11+ и firebase-tools)
```

## Сборка, деплой, мобильные приложения

```bash
npm run build        # результат в dist/
npm run cap:android  # обёртка Capacitor для Android (нужен Android Studio)
npm run cap:ios      # обёртка Capacitor для iOS (нужен macOS + Xcode)
```

Подробности — `docs/DEPLOYMENT.md` (GitHub Pages / Cloudflare Pages / Firebase Hosting) и `docs/MOBILE.md` (PWA на телефон + нативная сборка через Capacitor).

## Что изменено из-за требования «100% бесплатно»

- **Firebase Storage не используется** (с 2026 требует Blaze). Фото питомца — сжатое превью в Firestore; фото ветпаспорта для OCR не сохраняется вовсе, обрабатывается локально.
- **Cloud Functions и серверные push не используются.** Напоминания — только пока приложение открыто в браузере (foreground), это честно объяснено в интерфейсе (Профиль → Напоминания).
- **ИИ в Bupy Help — по модели «свой ключ» (BYOK)**, не встроенный ключ проекта: код публичный на GitHub, единый встроенный ключ был бы виден всем и делил бы одну маленькую бесплатную квоту на всех пользователей. См. `docs/GEMINI_SETUP.md`.
- **Ветклиники** — OpenStreetMap (Nominatim + Overpass), без Google Maps API.
- **Маршруты на hash (`#/app`)** — чтобы SPA работала на любом бесплатном статическом хостинге без настройки редиректов.

## Известные ограничения (честно, без приукрашивания)

- Удаление питомца не удаляет каскадно его вакцинации/лекарства/события (ограничение Security Rules без Cloud Functions) — см. `docs/FIREBASE.md`.
- Напоминания не приходят, если Bupy полностью закрыт (не открыт ни во вкладке, ни как установленное PWA) — честное ограничение бесплатной архитектуры без сервера.
- OCR паспорта — эвристический парсер, не идеальный; требует проверки пользователем перед сохранением (это осознанный принцип, а не баг).

## Структура

```
src/            components, features, pages, layouts, services, firebase, i18n, utils, types, data
firebase/       firestore.rules, storage.rules (не подключён), firestore.indexes.json
tests/          unit-тесты и тесты Security Rules
docs/           ARCHITECTURE, FIREBASE, DEPLOYMENT, SECURITY, MOBILE, COST_CONTROL, OCR, BUPY_HELP, GEMINI_SETUP
scripts/        генерация PNG-иконок из SVG (npm run icons)
```
