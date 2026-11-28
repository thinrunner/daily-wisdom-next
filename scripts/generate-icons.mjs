#!/usr/bin/env node
// Растеризует знак из lib/logo.mjs в иконки PWA. Запуск: npm run generate-icons
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { icon } from '../lib/logo.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public/icons');
mkdirSync(out, { recursive: true });

const png = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toFile(join(out, file));

const rounded = icon();                                // обычные иконки: скруглённая плитка
const maskable = icon({ rounded: false, scale: 0.92 }); // система сама обрежет форму — знак в безопасной зоне
const apple = icon({ rounded: false });                // iOS скругляет сам, прозрачность не допускается

await Promise.all([
  ...[72, 96, 128, 144, 152, 192, 384, 512].map((s) => png(rounded, s, `icon-${s}.png`)),
  ...[192, 512].map((s) => png(maskable, s, `icon-maskable-${s}.png`)),
  png(apple, 180, 'apple-touch-icon.png'),
]);
writeFileSync(join(root, 'app/icon.svg'), rounded);
console.log('Иконки обновлены: public/icons, app/icon.svg');
