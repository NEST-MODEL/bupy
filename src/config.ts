// Общий (дефолтный) ключ Gemini API на весь проект, задаётся через переменную окружения сборки
// VITE_GEMINI_API_KEY (GitHub Actions → Variables). Он окажется в публичном JS-бандле — это
// осознанный выбор владельца проекта ради простоты (не нужно, чтобы каждый пользователь заводил
// свой ключ). Персональный ключ, если пользователь его вставит в Профиле, имеет приоритет.
export const GEMINI_DEFAULT_KEY: string | undefined = import.meta.env.VITE_GEMINI_API_KEY || undefined;
