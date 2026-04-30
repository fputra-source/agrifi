self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  return self.clients.claim();
});

// Fetch listener ini WAJIB ada agar Chrome menganggap PWA ini sah
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request).catch(function() {
      return new Response('Offline');
  }));
});
