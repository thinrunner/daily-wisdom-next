import { getQuoteForDate, getDayOfYear, MONTHS_RU } from '../lib/quotes';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://daily-wisdom-next.vercel.app';

function getDayInTimezone(offsetHours = 2) {
  const now = new Date();
  const local = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
  const start = new Date(Date.UTC(local.getUTCFullYear(), 0, 0));
  const diff = local - start;
  return Math.floor(diff / 86400000);
}

export async function generateMetadata() {
  const day = getDayInTimezone(2);
  const date = new Date();
  const quote = getQuoteForDate(date);
  const dateStr = `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;

  const ogImageUrl = `${BASE_URL}/api/og?day=${day}&v=${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;

  return {
    title: 'Мудрость дня',
    description: `«${quote.text}» — ${quote.author}`,
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Мудрость дня',
    },
    openGraph: {
      title: 'Мудрость дня',
      description: `«${quote.text}» — ${quote.author}`,
      url: BASE_URL,
      siteName: 'Мудрость дня',
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `Мудрость дня · ${dateStr}`,
      }],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Мудрость дня',
      description: `«${quote.text}» — ${quote.author}`,
      images: [ogImageUrl],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* PWA — критично для Android Chrome */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* PWA — iOS Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Мудрость дня" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#1a1a2e" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('SW registered:', reg.scope);
              }).catch(function(err) {
                console.log('SW failed:', err);
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}
