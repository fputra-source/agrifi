const CACHE_NAME = 'agrifi-pwa-v3';
// ZETTBOT FIX: Tambahkan semua variasi path root untuk GitHub Pages
const ASSETS_TO_CACHE = [
  './',
  './?',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Cache dibuka');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Abaikan request API ke Apps Script atau API eksternal lainnya
  if (event.request.url.includes('script.google.com') || event.request.url.includes('ui-avatars.com') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Fallback ke cache saat offline
        return caches.match(event.request).then((cachedResponse) => {
          // Jika file tidak ada di cache, arahkan ke index.html sebagai fallback SPA
          return cachedResponse || caches.match('./index.html');
        });
      })
  );
});
