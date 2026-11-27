// Только для сервера: тянет базы всех языков сразу.
// Клиент грузит один язык — см. loadQuotes в app/WisdomApp.js.
import ru from './generated/quotes-ru.json';
import en from './generated/quotes-en.json';
import he from './generated/quotes-he.json';
import ro from './generated/quotes-ro.json';
import { dayKey, parseDayKey } from './quotes';
import { DEFAULT_LANG, isLang } from './i18n';

export const QUOTES_BY_LANG = { ru, en, he, ro };

// «Сегодня» для превью ссылки без даты: сервер живёт в UTC, аудитория — в Израиле.
export function todayKey(timeZone = 'Asia/Jerusalem') {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch {
    return dayKey();
  }
}

export function resolveShareParams(params) {
  const first = (v) => (Array.isArray(v) ? v[0] : v);
  const lang = isLang(first(params?.lang)) ? first(params.lang) : DEFAULT_LANG;
  const d = first(params?.d);
  const explicit = Boolean(parseDayKey(d));
  return { lang, day: explicit ? d : todayKey(), explicit };
}
