import './globals.css';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://daily-wisdom-next.vercel.app';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Мудрость дня' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport = {
  themeColor: '#1a1a2e',
  viewportFit: 'cover',
};

const registerSW = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: registerSW }} />
      </body>
    </html>
  );
}
