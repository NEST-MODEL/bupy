# Bupy — здоровье вашего питомца в одном месте

PWA для владельцев кошек и собак: профиль питомца, ветпаспорт, прививки, анализы, лекарства, календарь, напоминания, Bupy Help и ветклиники.
Стек: React + TypeScript + Vite + Tailwind CSS + Firebase (Auth + Firestore). **Только бесплатные сервисы, без банковской карты.**

## Статус разработки

| Этап | Что входит | Статус |
|---|---|---|
| 1. Каркас | Vite/React/TS/Tailwind, роутинг, i18n, дизайн-система, PWA, логотип, иконки, лендинг, нижняя навигация | ✅ готово |
| 2. Firebase | Регистрация/вход/сброс пароля/выход, сессия, Firestore rules, тесты правил, конфигурация | ✅ готово |
| 3. Ядро | Онбординг, питомцы (несколько, переключатель, архив/удаление), dashboard, вакцинации, лекарства (+ дневник приёма), календарь | ✅ готово |
| 4. Остальное | OCR паспорта, Bupy Help, клиники (OSM), напоминания, экспорт, документация, финальный zip | ⏳ |

Раздел «Помощник» (Bupy Help) пока пустой — без выдуманных инструкций, появится на этапе 4.

## Быстрый старт

```bash
npm install
cp .env.example .env     # затем заполните значения (см. ниже)
npm run dev
```

Без `.env` приложение покажет экран «Осталось подключить Firebase».

## Настройка Firebase (бесплатно, без карты)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**. Google Analytics можно отключить. Тариф остаётся **Spark** (бесплатный) — ничего не привязывайте.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (production mode). Регион выберите ближайший (например, `eur3`); регион потом не изменить.
4. **Project settings → Your apps → Web (`</>`)** → зарегистрируйте приложение и скопируйте конфиг в `.env`:
   `apiKey → VITE_FIREBASE_API_KEY`, `authDomain → VITE_FIREBASE_AUTH_DOMAIN`, `projectId → VITE_FIREBASE_PROJECT_ID`, `appId → VITE_FIREBASE_APP_ID`.
5. **Rules.** Вариант А — через консоль: Firestore → Rules → вставьте содержимое `firebase/firestore.rules` → Publish.
   Вариант Б — CLI:
   ```bash
   npx firebase login
   npx firebase use --add          # выберите проект
   npx firebase deploy --only firestore:rules
   ```
6. **Storage не включайте** (см. ниже почему).
7. После деплоя добавьте свой домен: Authentication → Settings → **Authorized domains**.

## Тесты

```bash
npm test            # быстрые unit-тесты (без Firebase)
npm run test:rules  # тесты Security Rules на локальном эмуляторе (нужны Java 11+ и firebase-tools)
```

Тесты правил используют проект `demo-bupy` и эмулятор — production Firebase они не затрагивают.

## Сборка и деплой

```bash
npm run build       # результат в dist/
```

Бесплатные варианты (карта не нужна):
- **Firebase Hosting** (Spark): `npx firebase deploy --only hosting`
- **Cloudflare Pages**: подключите репозиторий, build command `npm run build`, output `dist`; переменные `VITE_FIREBASE_*` — в настройках проекта.
- **GitHub Pages**: выложите содержимое `dist/` (маршруты на hash, `base: './'`, поэтому работает и на подпути).

## Что изменено из-за требования «100% бесплатно»

- **Firebase Storage не используется.** С 3 февраля 2026 Cloud Storage for Firebase требует тариф Blaze (привязку карты), даже в пределах бесплатной квоты. Фото питомца будет храниться как сжатое превью (~30–60 КБ) прямо в документе Firestore; документы и анализы — только текстовые данные. Файл `firebase/storage.rules` подготовлен «на будущее», но в `firebase.json` не подключён.
- **Cloud Functions и серверные push не используются** (нужен Blaze). Напоминания — локальные/браузерные.
- **Маршруты на hash (`#/app`)** — чтобы SPA работала на любом бесплатном статическом хостинге без настройки редиректов.

## Структура

```
src/            components, features, pages, layouts, services, firebase, i18n, utils, types
firebase/       firestore.rules, storage.rules (не подключён), firestore.indexes.json
tests/          unit-тесты и тесты Security Rules
docs/           ARCHITECTURE.md, FIREBASE.md, COST_CONTROL.md
scripts/        генерация PNG-иконок из SVG (npm run icons)
```
