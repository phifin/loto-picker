// Service Worker for Loto Tân Tân PWA
//
// __CACHE_VERSION__ được thay bằng commit SHA khi deploy (GitHub Actions).

const CACHE_NAME = 'loto-tan-tan-__CACHE_VERSION__';

// Precache shell + toàn bộ JS để app chạy offline ngay từ lần mở đầu
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/styles.css',
  './assets/css/base.css',
  './assets/css/themes.css',
  './assets/css/theme-toggle.css',
  './assets/css/mode-selection.css',
  './assets/css/board-selection.css',
  './assets/css/preview.css',
  './assets/css/game-controls.css',
  './assets/css/numpad.css',
  './assets/css/board.css',
  './assets/css/responsive.css',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './src/app.js',
  './src/core/gameState.js',
  './src/core/gameLogic.js',
  './src/core/multiBoard.js',
  './src/data/boards.js',
  './src/services/storage.js',
  './src/services/themeManager.js',
  './src/services/installPrompt.js',
  './src/events/eventHandlers.js',
  './src/ui/uiManager.js',
  './src/ui/screenManager.js',
  './src/ui/boardListRenderer.js',
  './src/ui/boardRenderer.js',
  './src/ui/virtualNumpad.js'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache failed for some assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('./index.html');
        });
      })
  );
});
