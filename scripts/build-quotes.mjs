#!/usr/bin/env node
// Собирает content/quotes/*.mjs в lib/generated/quotes-<lang>.json.
// Проверяет базу (объём, дубликаты, переводы) и раскладывает цитаты по дням так,
// чтобы один автор и одно настроение не шли подряд. Порядок детерминирован.

import { createHash } from 'node:crypto';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'content/quotes');
const outDir = join(root, 'lib/generated');

const LANGS = ['ru', 'en', 'he', 'ro'];
const MOODS = [
  'calm', 'strength', 'joy', 'action', 'peace', 'growth', 'inner', 'courage',
  'creativity', 'nature', 'cosmos', 'love', 'vitality', 'truth', 'purpose', 'journey',
];
const MIN_QUOTES = 366;      // хватает на любой год, включая високосный
const MAX_LENGTH = 180;      // длиннее — не помещается на карточке
const MAX_SOURCE = 60;       // подпись с источником — одна короткая строка
const AUTHOR_GAP = 10;       // минимум дней между цитатами одного автора

const errors = [];
const authors = {};
const quotes = [];

for (const file of readdirSync(srcDir).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = await import(pathToFileURL(join(srcDir, file)).href);
  for (const [slug, names] of Object.entries(mod.authors || {})) {
    for (const lang of LANGS) {
      if (!names[lang]?.trim()) errors.push(`${file}: у автора «${slug}» нет имени на ${lang}`);
    }
    authors[slug] ??= names;
  }
  (mod.quotes || []).forEach((q, i) => quotes.push({ ...q, where: `${file} #${i + 1}` }));
}

const normalize = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const seen = new Map();

for (const q of quotes) {
  if (!MOODS.includes(q.mood)) errors.push(`${q.where}: неизвестное настроение «${q.mood}»`);
  if (!authors[q.author]) errors.push(`${q.where}: неизвестный автор «${q.author}»`);
  if (q.source !== undefined) {
    for (const lang of LANGS) {
      const src = q.source?.[lang];
      if (typeof src !== 'string' || !src.trim()) errors.push(`${q.where}: источник указан, но не на ${lang}`);
      else if (src.length > MAX_SOURCE) errors.push(`${q.where}: источник на ${lang} длиннее ${MAX_SOURCE} символов`);
    }
  }
  for (const lang of LANGS) {
    const text = q[lang];
    if (typeof text !== 'string' || !text.trim()) {
      errors.push(`${q.where}: нет текста на ${lang}`);
      continue;
    }
    if (text.length > MAX_LENGTH) errors.push(`${q.where}: ${lang} длиннее ${MAX_LENGTH} символов (${text.length})`);
    const key = `${lang}:${normalize(text)}`;
    if (seen.has(key)) errors.push(`${q.where}: дубликат (${lang}) с ${seen.get(key)}`);
    else seen.set(key, q.where);
  }
}

if (quotes.length < MIN_QUOTES) {
  errors.push(`цитат ${quotes.length}, нужно не меньше ${MIN_QUOTES} — иначе они повторятся в течение года`);
}

if (errors.length) {
  console.error(`База цитат не прошла проверку (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

// Постоянный идентификатор цитаты (для «Избранного»): не зависит от порядка и от правок переводов,
// меняется только вместе с английским текстом.
const ids = new Set();
for (const q of quotes) {
  q.id = createHash('sha1').update(normalize(q.en)).digest('hex').slice(0, 8);
  if (ids.has(q.id)) {
    console.error(`${q.where}: совпал идентификатор ${q.id}`);
    process.exit(1);
  }
  ids.add(q.id);
}

// Детерминированное перемешивание (mulberry32), затем жадная расстановка.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = rng(20260101);
const pool = [...quotes];
for (let i = pool.length - 1; i > 0; i--) {
  const j = Math.floor(random() * (i + 1));
  [pool[i], pool[j]] = [pool[j], pool[i]];
}

const ordered = [];
while (pool.length) {
  const recentAuthors = new Set(ordered.slice(-AUTHOR_GAP).map((q) => q.author));
  const lastMood = ordered.at(-1)?.mood;
  // При нехватке вариантов сначала жертвуем настроением, потом — интервалом между авторами.
  let pick = pool.findIndex((q) => !recentAuthors.has(q.author) && q.mood !== lastMood);
  if (pick < 0) pick = pool.findIndex((q) => !recentAuthors.has(q.author));
  if (pick < 0) pick = pool.findIndex((q) => q.author !== ordered.at(-1)?.author);
  if (pick < 0) pick = 0;
  ordered.push(pool.splice(pick, 1)[0]);
}

mkdirSync(outDir, { recursive: true });
for (const lang of LANGS) {
  const data = ordered.map((q) => ({
    id: q.id,
    text: q[lang],
    author: authors[q.author][lang],
    // у «Чжуан-цзы» или «Мэн-цзы» книга названа именем автора — второй раз его не пишем
    ...(q.source && q.source[lang] !== authors[q.author][lang] && { source: q.source[lang] }),
    mood: q.mood,
  }));
  writeFileSync(join(outDir, `quotes-${lang}.json`), JSON.stringify(data));
}

console.log(`Цитат: ${ordered.length}, авторов: ${new Set(ordered.map((q) => q.author)).size} → lib/generated/`);
