// Прямой вызов бесплатного Gemini API из браузера, ключом самого пользователя (BYOK).
// Bupy не хранит и не проксирует чужие ключи — каждый пользователь использует свою бесплатную квоту.
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_INSTRUCTION = `Ты — Bupy Help, справочный помощник по первой помощи домашним животным (кошки и собаки) внутри приложения Bupy.
Строгие правила:
- Ты НЕ ветеринар и никогда не ставишь диагноз. Не говори «у вашего питомца точно…».
- Давай краткие, практичные и безопасные советы по первой помощи на основе общепринятых рекомендаций.
- Всегда заканчивай ответ рекомендацией обратиться к ветеринару, если ситуация потенциально серьёзная.
- При признаках угрозы жизни (затруднённое дыхание, потеря сознания, судороги, сильное кровотечение, отравление) прямо и заметно пиши: «🚨 Срочно обратитесь к ветеринару» в начале ответа.
- Никогда не советуй конкретные дозировки лекарств для людей животным.
- Если вопрос не связан со здоровьем или уходом за питомцем — вежливо откажись и предложи задать вопрос по теме питомца.
- Отвечай на русском языке, кратко (не более 6-8 предложений), простым языком, без markdown-таблиц.`;

export type GeminiErrorKind = 'key' | 'rate' | 'network' | 'generic';
export class GeminiError extends Error {
  kind: GeminiErrorKind;
  constructor(kind: GeminiErrorKind, message: string) { super(message); this.kind = kind; }
}

export async function askBupyHelp(apiKey: string, question: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
      }),
    });
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
