import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
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
  // Офлайн-кеш Firestore: показывает уже загруженные данные без сети, изменения синхронизируются позже.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error('Firebase is not configured');
  return auth;
}
export function getDb(): Firestore {
  if (!db) throw new Error('Firebase is not configured');
  return db;
}
