import type { TKey } from '@/i18n/ru';

/** Преобразует код ошибки Firebase Auth в ключ i18n. Технические сообщения пользователю не показываем. */
export function authErrorKey(err: unknown): TKey {
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'error.auth.invalidCredential';
    case 'auth/email-already-in-use':
      return 'error.auth.emailInUse';
    case 'auth/weak-password':
      return 'error.auth.weakPassword';
    case 'auth/too-many-requests':
      return 'error.auth.tooMany';
    case 'auth/user-disabled':
      return 'error.auth.disabled';
    case 'auth/network-request-failed':
      return 'error.network';
    default:
      return 'error.generic';
  }
}
