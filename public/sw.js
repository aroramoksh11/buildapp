// Service Worker for AutoDrive PWA
const CACHE_NAME = 'autodrive-cache-v2';
const STATIC_CACHE = 'static-cache-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v2';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/maskable-icon-512x512.png',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...', event);
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets:', STATIC_ASSETS);
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
  console.log('🚀 Service Worker activating...', event);
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
      })
    ])
  );
});

// Fetch event - handle network requests with improved caching
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle manifest.json specially
  if (event.request.url.endsWith('manifest.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) {
            throw new Error('Manifest fetch failed');
          }
          return response;
        })
        .catch(error => {
          console.error('❌ Manifest fetch error:', error);
          return caches.match('/manifest.json');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        console.log('📦 Serving from cache:', event.request.url);
        return response;
      }

      // Clone the request because it can only be used once
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it can only be used once
          const responseToCache = response.clone();

          // Cache the response
          caches.open(DYNAMIC_CACHE).then((cache) => {
            console.log('📦 Caching new resource:', event.request.url);
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            console.log('📱 Offline navigation, serving offline page');
            return caches.match('/offline.html');
          }
          // Return a fallback for other requests
          console.log('❌ Network request failed:', event.request.url);
          return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push event received:', event);
  if (event.data) {
    const data = event.data.json();
    console.log('📨 Push data:', data);
    
    event.waitUntil(
      self.registration.showNotification('AutoDrive Update', {
        body: data.message || 'New update available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'update-notification',
        data: {
          url: data.url || '/'
        }
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event);
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Handle periodic sync
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync event:', event.tag);
  if (event.tag === 'check-for-updates') {
    event.waitUntil(
      Promise.all([
        // Check for manifest updates
        fetch('/manifest.json')
          .then(response => {
            if (!response.ok) throw new Error('Manifest fetch failed');
            return response.json();
          })
          .then(manifest => {
            console.log('📄 Manifest check completed:', manifest);
            return manifest;
          })
          .catch(error => {
            console.error('❌ Manifest check failed:', error);
          }),
        // Check for service worker updates
        self.registration.update()
          .then(() => {
            console.log('🔄 Service worker update check completed');
          })
          .catch(error => {
            console.error('❌ Service worker update failed:', error);
          })
      ])
    );
  }
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'REFRESH_PAGE') {
    console.log('🔄 Notifying clients about update');
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

// Register periodic sync
self.registration.periodicSync.register('check-for-updates', {
  minInterval: 2 * 60 * 1000 // 2 minutes
}).then(() => {
  console.log('✅ Periodic sync registered successfully');
}).catch((error) => {
  console.error('❌ Periodic sync registration failed:', error);
});
