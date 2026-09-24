// Простой эвристический парсер распознанного текста паспорта. Ничего не придумывает —
// только извлекает то, что реально нашлось по шаблонам; остальное пользователь заполняет сам.

export interface ParsedVaccination { name: string; date: string }

export interface ParsedPassport {
  breed?: string;
  birthDate?: string; // YYYY-MM-DD
  microchipNumber?: string;
  vaccinations: ParsedVaccination[];
}

const DATE_RE = /\b(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})\b/g;
const MICROCHIP_RE = /\b(\d{15})\b/;
const KNOWN_VACCINES = [
  'нобивак', 'nobivac', 'мультикан', 'multican', 'вангард', 'vanguard', 'эурикан', 'eurican',
  'рабизин', 'rabisin', 'дефенсор', 'defensor', 'феловакс', 'felovax', 'пуревакс', 'purevax',
  'бешенств', 'rabies',
];

function toIsoDate(day: string, month: string, year: string): string | null {
  let y = year.length === 2 ? `20${year}` : year;
  const d = day.padStart(2, '0');
  const m = month.padStart(2, '0');
  const dn = Number(d), mn = Number(m), yn = Number(y);
  if (mn < 1 || mn > 12 || dn < 1 || dn > 31) return null;
  if (yn < 1990 || yn > new Date().getFullYear() + 1) return null;
  return `${y}-${m}-${d}`;
}

export function parsePassportText(raw: string): ParsedPassport {
  const text = raw.replace(/\r/g, '');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const result: ParsedPassport = { vaccinations: [] };

  // Микрочип: 15 цифр подряд.
  const chipMatch = text.match(MICROCHIP_RE);
  if (chipMatch) result.microchipNumber = chipMatch[1];

  // Дата рождения: строка с ключевым словом «рожд» рядом с датой.
  for (const line of lines) {
    if (/рожд|birth/i.test(line)) {
      const m = [...line.matchAll(DATE_RE)][0];
      if (m) {
        const iso = toIsoDate(m[1], m[2], m[3]);
        if (iso) { result.birthDate = iso; break; }
      }
    }
  }

  // Порода: строка с ключевым словом «порода» / «breed» — берём остаток строки.
  for (const line of lines) {
    const m = line.match(/(?:порода|breed)\s*[:\-]?\s*(.+)/i);
    if (m && m[1].trim().length > 1) { result.breed = m[1].trim(); break; }
  }

  // Вакцинации: строки, где есть известное название вакцины ИЛИ слово «вакцин», плюс дата в этой же строке.
  for (const line of lines) {
    const dateMatch = [...line.matchAll(DATE_RE)][0];
    if (!dateMatch) continue;
    const iso = toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]);
    if (!iso) continue;
    const lower = line.toLowerCase();
    const hasVaccineWord = /вакцин|vaccin/i.test(lower);
    const knownVaccine = KNOWN_VACCINES.find((v) => lower.includes(v));
    if (hasVaccineWord || knownVaccine) {
      const name = knownVaccine
        ? knownVaccine.charAt(0).toUpperCase() + knownVaccine.slice(1)
        : line.replace(DATE_RE, '').replace(/[:;,.\-]+/g, ' ').trim().slice(0, 60) || 'Вакцинация';
      result.vaccinations.push({ name, date: iso });
    }
  }

  return result;
}
