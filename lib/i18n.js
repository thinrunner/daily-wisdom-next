export const LANGUAGES = [
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'he', label: 'HE', name: 'עברית', rtl: true },
  { code: 'ro', label: 'RO', name: 'Română' },
];

export const MONTHS = {
  ru: ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  he: ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],
  ro: ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"],
};

export const DAYS = {
  ru: ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"],
  en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  he: ["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","שבת"],
  ro: ["Duminică","Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă"],
};

export const UI = {
  ru: {
    appName: 'Мудрость дня',
    share: 'Поделиться',
    saveImage: 'Сохранить картинку',
    copyLink: 'Копировать ссылку',
    copied: '✓ Ссылка скопирована!',
    installTitle: 'Мудрость дня',
    installIOS: 'Нажми ⬆ Поделиться внизу Safari, затем «На экран Домой»',
    installAndroid: 'Добавь на главный экран — новая цитата каждый день',
    installButton: 'Установить приложение',
    dayCounter: 'Мудрость дня',
    recent: 'Недавние',
    musicTitle: 'Музыка для настроения',
  },
  en: {
    appName: 'Daily Wisdom',
    share: 'Share',
    saveImage: 'Save image',
    copyLink: 'Copy link',
    copied: '✓ Link copied!',
    installTitle: 'Daily Wisdom',
    installIOS: 'Tap ⬆ Share in Safari, then "Add to Home Screen"',
    installAndroid: 'Add to home screen — a new quote every day',
    installButton: 'Install app',
    dayCounter: 'Daily Wisdom',
    recent: 'Recent',
    musicTitle: 'Music for the mood',
  },
  he: {
    appName: 'חוכמה יומית',
    share: 'שתף',
    saveImage: 'שמור תמונה',
    copyLink: 'העתק קישור',
    copied: '✓ !הקישור הועתק',
    installTitle: 'חוכמה יומית',
    installIOS: 'לחץ על ⬆ שתף בספארי, ואז "הוסף למסך הבית"',
    installAndroid: 'הוסף למסך הבית — ציטוט חדש כל יום',
    installButton: 'התקן אפליקציה',
    dayCounter: 'חוכמה יומית',
    recent: 'אחרונים',
    musicTitle: 'מוזיקה למצב הרוח',
  },
  ro: {
    appName: 'Înțelepciunea zilei',
    share: 'Distribuie',
    saveImage: 'Salvează imagine',
    copyLink: 'Copiază link',
    copied: '✓ Link copiat!',
    installTitle: 'Înțelepciunea zilei',
    installIOS: 'Apasă ⬆ Distribuie în Safari, apoi „Adaugă pe ecranul principal"',
    installAndroid: 'Adaugă pe ecranul principal — un citat nou în fiecare zi',
    installButton: 'Instalează aplicația',
    dayCounter: 'Înțelepciunea zilei',
    recent: 'Recente',
    musicTitle: 'Muzică pentru starea de spirit',
  },
};

export function isRTL(lang) {
  return lang === 'he';
}

export function getDateStr(date, lang) {
  const day = date.getDate();
  const month = MONTHS[lang][date.getMonth()];
  const year = date.getFullYear();
  if (lang === 'he') return `${day} ${month} ${year}`;
  return `${day} ${month} ${year}`;
}
