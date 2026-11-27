// Офлайн-кеш. Страница — сначала сеть (чтобы после деплоя не застревала старая версия),
// хешированная статика Next — из кеша, остальное — кеш с фоновым обновлением.
const CACHE_NAME = 'wisdom-v3';
const SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-96.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function put(request, response) {
  if (response && response.ok && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    // Любая навигация ведёт на единственную страницу; параметры ссылки (?d=…&lang=…) читает клиент.
    event.respondWith(
      fetch(request)
        .then((response) => put('/', response))
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => put(request, response)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request).then((response) => put(request, response)).catch(() => cached);
      return cached || fresh;
    })
  );
});
