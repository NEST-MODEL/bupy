// Ключ Gemini API хранится ТОЛЬКО в localStorage этого браузера — на устройство пользователя,
// никогда не уходит на серверы Bupy (их нет) и не попадает в Firestore. Каждый пользователь
// использует свой собственный бесплатный ключ и свою собственную бесплатную квоту.
const key = (uid: string) => `bupy.geminiKey.${uid}`;

export function getGeminiKey(uid: string): string | null {
  try { return localStorage.getItem(key(uid)); } catch { return null; }
}
export function setGeminiKey(uid: string, value: string): void {
  try { localStorage.setItem(key(uid), value.trim()); } catch { /* хранилище недоступно */ }
}
export function clearGeminiKey(uid: string): void {
  try { localStorage.removeItem(key(uid)); } catch { /* ignore */ }
}
