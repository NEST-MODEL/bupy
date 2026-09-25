// Защита от зависаний: если сетевой запрос (Firestore, Auth, внешний API) не отвечает достаточно
// долго — прерываем ожидание и показываем понятную ошибку, вместо того чтобы UI висел бесконечно
// (например, кнопка "Добавить" оставалась бы серой навсегда). Сам запрос в фоне может ещё
// завершиться позже, но пользователь получает контроль немедленно и может повторить попытку.
export class TimeoutError extends Error {
  constructor() { super('timeout'); this.name = 'TimeoutError'; }
}

export function withTimeout<T>(promise: Promise<T>, ms = 15_000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError()), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}
