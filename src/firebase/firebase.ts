import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

// Это публичная клиентская конфигурация Firebase (не секрет).
// Доступ к данным защищён firestore.rules. Service account сюда не добавляем.
const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app); // сессия хранится в IndexedDB/localStorage — вход сохраняется между запусками

  // ВАЖНО: experimentalAutoDetectLongPolling заставляет Firestore сразу проверить, доступен ли
  // обычный потоковый транспорт (gRPC/WebChannel), и если сеть его режет или сильно тормозит
  // (так бывает у части провайдеров и в некоторых сетях/VPN в СНГ) — переключиться на long polling
  // без многоминутного зависания.
  //
  // Офлайн-персистентность (persistentLocalCache) намеренно НЕ используется: она хранит данные
  // в IndexedDB и требует «договариваться» между вкладками/установленным PWA за право на этот
  // кеш — если открыто одновременно и приложение на экране, и вкладка в браузере, это может
  // приводить к зависаниям само по себе. Простой кеш в памяти надёжнее и по-прежнему позволяет
  // Firestore ставить запись в очередь при кратковременном пропадании сети в рамках одной сессии.
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error('Firebase is not configured');
  return auth;
}
export function getDb(): Firestore {
  if (!db) throw new Error('Firebase is not configured');
  return db;
}
