import { describe, expect, it } from 'vitest';
import { authErrorKey } from '@/utils/authErrors';
import { isEmail, isStrongEnough } from '@/utils/validation';
import { ru } from '@/i18n/ru';

describe('validation', () => {
  it('validates email', () => {
    expect(isEmail('a@b.kz')).toBe(true);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('')).toBe(false);
  });
  it('requires 8+ char passwords', () => {
    expect(isStrongEnough('1234567')).toBe(false);
    expect(isStrongEnough('12345678')).toBe(true);
  });
});

describe('authErrorKey', () => {
  it('maps known Firebase codes to i18n keys that exist', () => {
    const codes = ['auth/invalid-credential', 'auth/email-already-in-use', 'auth/weak-password', 'auth/too-many-requests', 'auth/network-request-failed', 'auth/unknown'];
    for (const code of codes) expect(ru[authErrorKey({ code })]).toBeTruthy();
  });
  it('never leaks technical messages', () => {
    expect(authErrorKey(new Error('boom'))).toBe('error.generic');
  });
});
