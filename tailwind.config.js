/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lagoon: { 50: '#EAF4F3', 100: '#D3E8E6', 200: '#A9D2CE', 500: '#2C8580', 600: '#1E6F6A', 700: '#175A56', 800: '#124744' },
        mist: '#F4F7F6',
        ink: { DEFAULT: '#15201F', soft: '#4A5B59', faint: '#7B8B89' },
        line: '#DCE5E3',
        honey: { 100: '#FBF0D6', 500: '#D99A2B', 700: '#8A5A0B' },
        berry: { 100: '#FBE4E2', 600: '#C2453D', 700: '#9B322B' },
      },
      fontFamily: { sans: ['"Manrope Variable"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] },
      borderRadius: { card: '20px', ctl: '14px' },
      boxShadow: { soft: '0 1px 2px rgba(21,32,31,.05), 0 4px 14px rgba(21,32,31,.05)' },
      spacing: { 'safe-b': 'env(safe-area-inset-bottom)', 'safe-t': 'env(safe-area-inset-top)' },
    },
  },
  plugins: [],
};
