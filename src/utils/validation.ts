const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD = 8;

export const isEmail = (v: string) => EMAIL_RE.test(v.trim());
export const isStrongEnough = (v: string) => v.length >= MIN_PASSWORD;
