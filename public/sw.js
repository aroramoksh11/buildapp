// Service Worker for AutoDrive PWA
const CACHE_NAME = 'autodrive-cache-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Add other static assets here
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate new service worker immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request because it can only be used once
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response because it can only be used once
        const responseToCache = response.clone();

        // Cache the response
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REFRESH_PAGE') {
    // Notify all clients about the update
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          data: {
            timestamp: new Date().toISOString(),
            version: CACHE_NAME
          }
        });
      });
    });
  }
});

// Check for updates every 5 minutes
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-for-updates') {
    event.waitUntil(
      fetch('/').then((response) => {
        if (response.status === 200) {
          // New version available, update cache
          return caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
          });
        }
      })
    );
  }
});

// Register periodic sync
self.registration.periodicSync.register('check-for-updates', {
  minInterval: 5 * 60 * 1000 // 5 minutes
}).catch((error) => {
  console.error('Periodic sync registration failed:', error);
});
