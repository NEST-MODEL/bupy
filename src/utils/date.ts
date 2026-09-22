export function todayStr(d = new Date()): string {
  // Локальная дата (не UTC), формат YYYY-MM-DD.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateHuman(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export function formatDateShort(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(d);
}

function ruPlural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function ageFromBirthDate(iso?: string): string | null {
  if (!iso) return null;
  const birth = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return null;
  if (months < 1) return 'меньше месяца';
  if (months < 12) return `${months} ${ruPlural(months, ['месяц', 'месяца', 'месяцев'])}`;
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const yearsStr = `${years} ${ruPlural(years, ['год', 'года', 'лет'])}`;
  if (restMonths === 0) return yearsStr;
  return `${yearsStr} ${restMonths} ${ruPlural(restMonths, ['месяц', 'месяца', 'месяцев'])}`;
}

export function daysDiffFromToday(iso: string): number {
  const today = new Date(`${todayStr()}T00:00:00`);
  const d = new Date(`${iso}T00:00:00`);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}
