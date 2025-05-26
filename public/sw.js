// Service Worker with Auto Update
const CACHE_NAME = 'autodrive-cache-v2';
const BG_COLOR_VERSION = 'blue-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('📦 Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Cache opened');
      return cache.addAll([
        '/',
        '/manifest.json',
        '/globals.css'
      ]);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔄 Service worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service worker activated');
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            data: {
              bgColorVersion: BG_COLOR_VERSION,
              timestamp: new Date().toISOString()
            }
          });
        });
      });
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Check for updates every 30 seconds
setInterval(() => {
  self.registration.update();
}, 30000);
