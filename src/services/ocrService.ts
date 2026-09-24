import { createWorker } from 'tesseract.js';

/**
 * Распознаёт текст на фото полностью в браузере (WASM), ничего не отправляется на сервер.
 * Языковые данные (rus+eng) при первом запуске скачиваются из публичного CDN tesseract.js
 * и кешируются браузером — нужен интернет один раз, дальше работает быстрее.
 */
export async function recognizePassportText(file: File, onProgress?: (percent: number) => void): Promise<string> {
  const worker = await createWorker('rus+eng', undefined, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(Math.round(m.progress * 100));
    },
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
