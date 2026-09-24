# Мобильные версии (PWA + Capacitor)

## PWA (основной способ, работает уже сейчас)

Bupy — полноценный PWA. Работает на любом смартфоне без сборки нативного приложения:

- **Android (Chrome):** меню (⋮) → «Установить приложение» / «Добавить на главный экран».
- **iPhone/iPad (только Safari):** кнопка «Поделиться» → «На экран «Домой»». На iOS это единственный браузер, из которого можно поставить PWA на домашний экран — из Chrome на iPhone так нельзя (это ограничение самой iOS, не Bupy).

После установки Bupy открывается в полноэкранном режиме, без адресной строки, с собственной иконкой.

## Capacitor: обёртка в нативное приложение (Android/iOS)

Для публикации в Google Play / App Store потребуется собрать нативную обёртку через [Capacitor](https://capacitorjs.com/). Зависимости уже добавлены в `package.json` (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`), конфигурация — в `capacitor.config.ts`.

Нативные проекты (`android/`, `ios/`) **не включены в репозиторий** (они в `.gitignore`) — их нужно сгенерировать один раз локально:

```bash
npm install
npm run build

npx cap add android
npx cap add ios      # только на macOS

npm run cap:android  # собирает и открывает Android Studio
npm run cap:ios      # собирает и открывает Xcode (только на macOS)
```

### Android

- Нужен установленный [Android Studio](https://developer.android.com/studio) (бесплатно).
- `npx cap open android` откроет проект в Android Studio — дальше обычная сборка APK/AAB через Android Studio (Build → Generate Signed Bundle/APK).
- Собрать APK для тестирования можно бесплатно. Публикация в Google Play требует одноразового взноса разработчика (Google берёт его отдельно от Bupy — сама сборка приложения бесплатна).

### iOS

- Нужен **macOS с установленным Xcode** — без Mac собрать iOS-приложение локально нельзя, это ограничение самой Apple, а не Bupy.
- `npx cap open ios` откроет проект в Xcode.
- Для запуска на реальном iPhone и тем более для публикации в App Store нужен платный Apple Developer Program (у Apple, не у Bupy). Веб-версия (PWA) при этом остаётся полностью бесплатной и работает на iPhone уже сейчас без всего этого.

### Синхронизация после изменений в коде

Каждый раз после `npm run build` нужно `npx cap sync`, чтобы Capacitor обновил веб-содержимое в нативных проектах (это уже включено в `npm run cap:android` / `npm run cap:ios`).
