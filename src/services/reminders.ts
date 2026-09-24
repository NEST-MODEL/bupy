// Напоминания работают ТОЛЬКО пока вкладка/PWA Bupy открыта в браузере — это ограничение
// платформы, а не недоработка: настоящий фоновый push без сервера бесплатно недоступен
// (Cloud Functions/FCM с сервером требуют Blaze). Честно предупреждаем об этом в интерфейсе.
const PREF_KEY = 'bupy.reminders.enabled';

export function remindersSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}
export function remindersEnabled(): boolean {
  try { return localStorage.getItem(PREF_KEY) === '1' && Notification.permission === 'granted'; } catch { return false; }
}
export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!remindersSupported()) return 'unsupported';
  return Notification.permission;
}
export async function enableReminders(): Promise<boolean> {
  if (!remindersSupported()) return false;
  const perm = await Notification.requestPermission();
  const granted = perm === 'granted';
  try { localStorage.setItem(PREF_KEY, granted ? '1' : '0'); } catch { /* ignore */ }
  return granted;
}
export function disableReminders(): void {
  try { localStorage.setItem(PREF_KEY, '0'); } catch { /* ignore */ }
}

interface ScheduledItem { key: string; title: string; body: string; at: number }
const notifiedToday = new Set<string>();

/** Планирует показ уведомлений для оставшихся на сегодня пунктов (сбрасывается при перезагрузке страницы). */
export function scheduleTodayReminders(items: ScheduledItem[]): void {
  if (!remindersEnabled()) return;
  const now = Date.now();
  for (const item of items) {
    if (item.at <= now || notifiedToday.has(item.key)) continue;
    const delay = item.at - now;
    if (delay > 24 * 60 * 60 * 1000) continue; // подстраховка от слишком дальних таймеров
    window.setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(item.title, { body: item.body, icon: './icons/icon-192.png', tag: item.key });
      }
      notifiedToday.add(item.key);
    }, delay);
  }
}
