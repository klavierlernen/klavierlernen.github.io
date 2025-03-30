const CACHE_NAME = 'midi-pwa-v1';
const urlsToCache = [
  'https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js',
  'https://raw.githubusercontent.com/JP0024/piano.github.io/main/tick.mp3',
  'https://raw.githubusercontent.com/JP0024/piano.github.io/main/gong-2-232435.mp3',
  'https://raw.githubusercontent.com/JP0024/piano.github.io/3d35e0a8d4eb3e018151018e36e225dc7a856ecd/mixkit-relaxing-harp-sweep-2628.wav'
];

// Install
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Service Worker: Caching files');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
