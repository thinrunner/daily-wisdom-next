import { parseDayKey } from './quotes';

export const LANGUAGES = [
  { code: 'ru', label: 'RU', name: 'Русский', locale: 'ru_RU' },
  { code: 'en', label: 'EN', name: 'English', locale: 'en_US' },
  { code: 'he', label: 'HE', name: 'עברית', locale: 'he_IL', rtl: true },
  { code: 'ro', label: 'RO', name: 'Română', locale: 'ro_RO' },
];

export const DEFAULT_LANG = 'ru';

export function isLang(code) {
  return LANGUAGES.some((l) => l.code === code);
}

export function isRTL(lang) {
  return LANGUAGES.some((l) => l.code === lang && l.rtl);
}

const MONTHS = {
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  he: ['בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני', 'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר'],
  ro: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
};

const DAYS = {
  ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  he: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'],
  ro: ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'],
};

export function formatDate(key, lang) {
  const { y, m, d } = parseDayKey(key);
  return `${d} ${MONTHS[lang][m - 1]} ${y}`;
}

export function formatWeekday(key, lang) {
  return DAYS[lang][parseDayKey(key).weekday];
}

// Цитата в кавычках, принятых в языке.
export function quoted(text, author, lang) {
  const [open, close] = { ru: ['«', '»'], en: ['“', '”'], he: ['"', '"'], ro: ['„', '”'] }[lang];
  return `${open}${text}${close} — ${author}`;
}

export const UI = {
  ru: {
    appName: 'Мудрость дня',
    description: 'Одна цитата на каждый день',
    share: 'Поделиться',
    copyLink: 'Копировать ссылку',
    copied: 'Ссылка скопирована',
    close: 'Закрыть',
    language: 'Язык',
    showDay: 'Показать цитату за',
    installIOS: 'Нажми «Поделиться» внизу Safari, затем «На экран Домой»',
    installAndroid: 'Добавь на главный экран — новая цитата каждый день',
    installButton: 'Установить приложение',
  },
  en: {
    appName: 'Daily Wisdom',
    description: 'One quote for every day',
    share: 'Share',
    copyLink: 'Copy link',
    copied: 'Link copied',
    close: 'Close',
    language: 'Language',
    showDay: 'Show the quote for',
    installIOS: 'Tap Share in Safari, then “Add to Home Screen”',
    installAndroid: 'Add to your home screen — a new quote every day',
    installButton: 'Install app',
  },
  he: {
    appName: 'חוכמה יומית',
    description: 'ציטוט אחד לכל יום',
    share: 'שיתוף',
    copyLink: 'העתקת קישור',
    copied: 'הקישור הועתק',
    close: 'סגירה',
    language: 'שפה',
    showDay: 'הצגת הציטוט של',
    installIOS: 'לחצו על ״שיתוף״ בספארי ואז על ״הוספה למסך הבית״',
    installAndroid: 'הוסיפו למסך הבית — ציטוט חדש בכל יום',
    installButton: 'התקנת האפליקציה',
  },
  ro: {
    appName: 'Înțelepciunea zilei',
    description: 'Un citat pentru fiecare zi',
    share: 'Distribuie',
    copyLink: 'Copiază linkul',
    copied: 'Link copiat',
    close: 'Închide',
    language: 'Limbă',
    showDay: 'Arată citatul din',
    installIOS: 'Apasă „Partajează” în Safari, apoi „Adaugă pe ecranul principal”',
    installAndroid: 'Adaugă pe ecranul principal — un citat nou în fiecare zi',
    installButton: 'Instalează aplicația',
  },
};
