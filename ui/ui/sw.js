// Minimal service worker for offline caching (PWA)
const CACHE_NAME = 'booktracker-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/book-detail.html',
  '/profile.html',
  '/stats.html',
  '/assets/css/style.css',
  '/assets/js/main.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
