import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kz.bupy.app',
  appName: 'Bupy',
  webDir: 'dist',
  // bundledWebRuntime не нужен — Capacitor подхватывает уже собранный Vite-бандл из dist/.
};

export default config;
