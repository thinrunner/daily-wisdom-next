import WisdomApp from './WisdomApp';
import { quoteForDay } from '../lib/quotes';
import { QUOTES_BY_LANG, resolveShareParams } from '../lib/quotes-server';
import { LANGUAGES, UI, formatDate, quoted } from '../lib/i18n';

// Метаданные считаются на каждый запрос: превью ссылки показывает цитату того дня и языка,
// которыми поделились (?d=YYYY-MM-DD&lang=xx), а без параметров — сегодняшнюю.
export async function generateMetadata({ searchParams }) {
  const { lang, day, explicit } = resolveShareParams(await searchParams);
  const quote = quoteForDay(QUOTES_BY_LANG[lang], day);
  const ui = UI[lang];
  const description = quoted(quote.text, quote.author, lang);
  const image = `/api/og?d=${day}&lang=${lang}`;

  return {
    title: ui.appName,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      title: ui.appName,
      description,
      url: explicit ? `/?d=${day}&lang=${lang}` : '/',
      siteName: ui.appName,
      images: [{ url: image, width: 1200, height: 630, alt: `${ui.appName} · ${formatDate(day, lang)}` }],
      locale: LANGUAGES.find((l) => l.code === lang).locale,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: ui.appName, description, images: [image] },
  };
}

export default function HomePage() {
  return <WisdomApp />;
}
