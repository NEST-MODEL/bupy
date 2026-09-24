import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  type Firestore,
} from 'firebase/firestore';

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
  // без многоминутного зависания. Без этой опции клиент может «висеть» по 5–10 минут перед каждым
  // запросом, пока сам не поймёт, что нужно переключиться.
  try {
    // Офлайн-кеш: показывает уже загруженные данные без сети, изменения синхронизируются позже.
    // persistentSingleTabManager проще и надёжнее multiTab — не блокируется другой открытой вкладкой/PWA.
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({ forceOwnership: false }) }),
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    // Если IndexedDB недоступен (приватный режим, ограничения браузера) — работаем без офлайн-кеша.
    db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error('Firebase is not configured');
  return auth;
}
export function getDb(): Firestore {
  if (!db) throw new Error('Firebase is not configured');
  return db;
}
