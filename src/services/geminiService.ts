// Прямой вызов бесплатного Gemini API из браузера, ключом самого пользователя (BYOK).
// Bupy не хранит и не проксирует чужие ключи — каждый пользователь использует свою бесплатную квоту.
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const BASE_RULES = `Ты — Bupy Help, справочный помощник по первой помощи домашним животным (кошки и собаки) внутри приложения Bupy.
Строгие правила:
- Ты НЕ ветеринар и никогда не ставишь диагноз. Не говори «у вашего питомца точно…».
- Давай краткие, практичные и безопасные советы по первой помощи на основе общепринятых рекомендаций.
- Всегда заканчивай ответ рекомендацией обратиться к ветеринару, если ситуация потенциально серьёзная.
- При признаках угрозы жизни (затруднённое дыхание, потеря сознания, судороги, сильное кровотечение, отравление) прямо и заметно пиши: «🚨 Срочно обратитесь к ветеринару» в начале ответа.
- Никогда не советуй конкретные дозировки лекарств для людей животным.
- Если вопрос не связан со здоровьем или уходом за питомцем — вежливо откажись и предложи задать вопрос по теме питомца.
- Отвечай на русском языке, кратко (не более 6-8 предложений), простым языком, без markdown-таблиц.`;

export interface PetContext {
  species: 'dog' | 'cat';
  name: string;
  breed?: string;
  sex?: 'male' | 'female';
  ageText?: string;
  weightText?: string;
  neutered?: boolean;
  features?: string;
}

function buildSystemInstruction(pet?: PetContext): string {
  if (!pet) return BASE_RULES;
  const facts = [
    `вид: ${pet.species === 'dog' ? 'собака' : 'кошка'}`,
    pet.breed && `порода: ${pet.breed}`,
    pet.sex && `пол: ${pet.sex === 'male' ? 'мальчик' : 'девочка'}`,
    pet.ageText && `возраст: ${pet.ageText}`,
    pet.weightText && `вес: ${pet.weightText}`,
    pet.neutered ? 'стерилизован(а)/кастрирован' : undefined,
    pet.features && `особенности: ${pet.features}`,
  ].filter(Boolean).join(', ');
  return `${BASE_RULES}

Контекст (используй, если это уместно для ответа, но не упоминай, что тебе «дали контекст»):
Питомца зовут ${pet.name}. О нём известно: ${facts}.`;
}

export type GeminiErrorKind = 'key' | 'rate' | 'network' | 'generic';
export class GeminiError extends Error {
  kind: GeminiErrorKind;
  constructor(kind: GeminiErrorKind, message: string) { super(message); this.kind = kind; }
}

const EXTRACT_PROMPT = `Ты распознаёшь ветеринарный паспорт домашнего животного по фотографии. Извлеки ТОЛЬКО то, что реально чётко видно на фото. Никогда не выдумывай и не додумывай данные — если поле не видно чётко, верни null.
Верни СТРОГО JSON без markdown и без пояснений, ровно по такой схеме:
{"breed": string|null, "birthDate": "YYYY-MM-DD"|null, "microchipNumber": string|null, "vaccinations": [{"name": string, "date": "YYYY-MM-DD"}]}
vaccinations — только записи, где на фото видна и дата, и явно название вакцины/отметка о вакцинации. Если таких записей не видно — верни пустой массив. Не добавляй никаких полей, кроме перечисленных.`;

export interface ExtractedPassport {
  breed: string | null;
  birthDate: string | null;
  microchipNumber: string | null;
  vaccinations: { name: string; date: string }[];
}

function isIsoDate(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function extractPassportData(apiKey: string, imageBase64: string, mimeType: string): Promise<ExtractedPassport> {
  let res: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40_000);
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: EXTRACT_PROMPT }, { inlineData: { mimeType, data: imageBase64 } }],
          }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.1, responseMimeType: 'application/json' },
        }),
      });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    throw new GeminiError('network', 'network');
  }

  if (res.status === 400 || res.status === 401 || res.status === 403) throw new GeminiError('key', 'invalid key');
  if (res.status === 429) throw new GeminiError('rate', 'rate limited');
  if (!res.ok) throw new GeminiError('generic', `HTTP ${res.status}`);

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiError('generic', 'bad json');
  }
  const obj = parsed as Record<string, unknown>;
  const vaccinationsRaw = Array.isArray(obj.vaccinations) ? obj.vaccinations : [];
  return {
    breed: typeof obj.breed === 'string' && obj.breed.trim() ? obj.breed.trim() : null,
    birthDate: isIsoDate(obj.birthDate) ? obj.birthDate : null,
    microchipNumber: typeof obj.microchipNumber === 'string' && obj.microchipNumber.trim() ? obj.microchipNumber.trim() : null,
    vaccinations: vaccinationsRaw
      .filter((v): v is { name: unknown; date: unknown } => typeof v === 'object' && v !== null)
      .filter((v) => typeof v.name === 'string' && v.name.trim() && isIsoDate(v.date))
      .map((v) => ({ name: (v.name as string).trim(), date: v.date as string })),
  };
}

export async function askBupyHelp(apiKey: string, question: string, pet?: PetContext): Promise<string> {
  let res: Response;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemInstruction(pet) }] },
          contents: [{ role: 'user', parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
        }),
      });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    throw new GeminiError('network', 'network');
  }

  if (res.status === 400 || res.status === 401 || res.status === 403) {
    throw new GeminiError('key', 'invalid key');
  }
  if (res.status === 429) {
    throw new GeminiError('rate', 'rate limited');
  }
  if (!res.ok) {
    throw new GeminiError('generic', `HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!text.trim()) throw new GeminiError('generic', 'empty response');
  return text.trim();
}
