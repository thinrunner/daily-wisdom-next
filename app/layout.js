import { getQuoteForDate, getDayOfYear, MONTHS_RU } from '../lib/quotes';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://daily-wisdom-next.vercel.app';

export async function generateMetadata() {
  const date = new Date();
  const quote = getQuoteForDate(date);
  const day = getDayOfYear(date);
  const dateStr = `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;
  const ogImageUrl = `${BASE_URL}/api/og`;

  return {
    title: 'Мудрость дня',
    description: `«${quote.text}» — ${quote.author}`,
    manifest: '/manifest.json',
    themeColor: '#667eea',
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
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Мудрость дня" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="theme-color" content="#667eea" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </body>
    </html>
  );
}
