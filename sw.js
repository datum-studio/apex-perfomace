const CACHE_NAME = 'apex-v1';
const ASSETS = [
  '/apex-perfomace/',
  '/apex-perfomace/index.html',
  '/apex-perfomace/dashboard.html',
  '/apex-perfomace/style.css',
  '/apex-perfomace/firebase-config.js',
  '/apex-perfomace/icon-192.png',
  '/apex-perfomace/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase requests — sempre da rede
  if (e.request.url.includes('firestore') || e.request.url.includes('firebase') || e.request.url.includes('googleapis')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Assets — cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
