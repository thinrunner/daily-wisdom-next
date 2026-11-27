// Тёмная палитра — насыщенные, глубокие, приятные для глаз цвета
export const MOOD_THEMES = {
  calm:       ['#1a1a2e', '#16213e'], // ночной синий
  strength:   ['#3b1f3f', '#4e2354'], // тёмный фиолет
  joy:        ['#1e3d2f', '#265c40'], // тёмный зелёный
  action:     ['#1c2a4a', '#243660'], // тёмный индиго
  peace:      ['#1a3030', '#1f3d3a'], // тёмный изумруд
  growth:     ['#1b2f45', '#1e3d5c'], // тёмный морской
  inner:      ['#2b1d42', '#3a2457'], // тёмный пурпур
  courage:    ['#3a2010', '#4f2e14'], // тёмный янтарь
  creativity: ['#3a1a3a', '#4e2052'], // тёмная слива
  nature:     ['#1a2e1c', '#1e3d22'], // тёмный лес
  cosmos:     ['#0e0e1f', '#141428'], // глубокий космос
  love:       ['#3a1a24', '#52202e'], // тёмная роза
  vitality:   ['#1a3024', '#1f4530'], // тёмный малахит
  truth:      ['#192840', '#1e3354'], // тёмный сапфир
  purpose:    ['#1a3028', '#1e4034'], // тёмный нефрит
  journey:    ['#312515', '#45341c'], // тёмная бронза
};

export const DEFAULT_THEME = MOOD_THEMES.calm;

export function themeFor(quote) {
  return (quote && MOOD_THEMES[quote.mood]) || DEFAULT_THEME;
}

// Календарный день задаётся ключом «YYYY-MM-DD» — без часовых поясов и времени.
const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDayKey(key) {
  const match = typeof key === 'string' ? DAY_KEY.exec(key) : null;
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const utc = new Date(Date.UTC(y, m - 1, d));
  // отсекаем несуществующие даты вроде 2026-02-31
  if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== m - 1 || utc.getUTCDate() !== d) return null;
  return { y, m, d, weekday: utc.getUTCDay(), dayNumber: Math.floor(utc.getTime() / 86400000) };
}

export function shiftDayKey(key, days) {
  const p = parseDayKey(key);
  const utc = new Date((p.dayNumber + days) * 86400000);
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0');
  const d = String(utc.getUTCDate()).padStart(2, '0');
  return `${utc.getUTCFullYear()}-${m}-${d}`;
}

export function dayOfYear(key) {
  const p = parseDayKey(key);
  return p.dayNumber - Math.floor(Date.UTC(p.y, 0, 1) / 86400000) + 1;
}

export function daysInYear(key) {
  const { y } = parseDayKey(key);
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365;
}

// Цитаты идут по сплошному счёту дней, а не по дню года: при базе в 366+ цитат
// ни одна не повторится раньше чем через год, и на стыке лет нет скачка.
export function quoteForDay(quotes, key) {
  const p = parseDayKey(key);
  if (!p || !quotes?.length) return null;
  return quotes[p.dayNumber % quotes.length];
}
