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
  console.log('📦 Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate new service worker immediately
      self.skipWaiting().then(() => {
        console.log('⚡ Service Worker skipped waiting');
      })
    ])
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        console.log('🧹 Cleaning up old caches:', cacheNames);
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('🗑️ Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim().then(() => {
        console.log('👑 Service Worker claimed clients');
      })
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
  console.log('📨 Service Worker received message:', event.data);
  if (event.data && event.data.type === 'REFRESH_PAGE') {
    console.log('🔄 Notifying clients about update');
    // Notify all clients about the update
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        console.log('📢 Notifying client:', client.url);
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

// Check for updates every 2 minutes
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync event:', event.tag);
  if (event.tag === 'check-for-updates') {
    console.log('🔄 Checking for updates...');
    event.waitUntil(
      fetch('/').then((response) => {
        console.log('📡 Fetch response status:', response.status);
        if (response.status === 200) {
          console.log('✨ New version available, updating cache');
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
console.log('⏰ Registering periodic sync...');
self.registration.periodicSync.register('check-for-updates', {
  minInterval: 2 * 60 * 1000 // 2 minutes
}).then(() => {
  console.log('✅ Periodic sync registered successfully');
}).catch((error) => {
  console.error('❌ Periodic sync registration failed:', error);
});
