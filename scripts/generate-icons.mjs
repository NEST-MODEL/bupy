// Генерирует PNG-иконки из scripts/icon-source.svg (npm run icons).
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
const svg = await readFile(new URL('./icon-source.svg', import.meta.url));
await mkdir('public/icons', { recursive: true });
const targets = [
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/apple-touch-icon.png', 180],
];
for (const [file, size] of targets) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(file);
  console.log('✓', file);
}
