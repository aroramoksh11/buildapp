// Service Worker for AutoDrive PWA
const CACHE_VERSION = 'v4';
const CACHE_NAME = `autodrive-cache-${CACHE_VERSION}`;
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/sw.js',
  '/globals.css',
  '/version.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Default manifest for fallback
const DEFAULT_MANIFEST = {
  name: 'AutoDrive',
  short_name: 'AutoDrive',
  description: 'Self-Driving Car Simulator PWA',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    }
  ]
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('📦 Service worker installing...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        console.log('📦 Caching static assets...');
        
        // Cache each asset individually with error handling
        await Promise.all(
          STATIC_ASSETS.map(async (asset) => {
            try {
              const response = await fetch(asset, {
                credentials: 'same-origin',
                cache: 'no-store'
              });
              if (response.ok) {
                await cache.put(asset, response);
                console.log(`✅ Cached: ${asset}`);
              } else {
                console.warn(`⚠️ Failed to cache: ${asset} (${response.status})`);
              }
            } catch (error) {
              console.error(`❌ Error caching ${asset}:`, error);
            }
          })
        );
        
        // Ensure manifest.json is always available
        const manifestResponse = await fetch('/manifest.json', {
          credentials: 'same-origin',
          cache: 'no-store'
        }).catch(() => {
          console.log('⚠️ Using fallback manifest');
          return new Response(JSON.stringify(DEFAULT_MANIFEST), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
        
        await cache.put('/manifest.json', manifestResponse);
        console.log('✅ Service worker installed successfully');
      } catch (error) {
        console.error('❌ Cache installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service worker activating...');
  event.waitUntil(
    (async () => {
      try {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter(key => key.startsWith('autodrive-cache-') && key !== CACHE_NAME)
            .map(key => {
              console.log(`🗑️ Deleting old cache: ${key}`);
              return caches.delete(key);
            })
        );
        console.log('✅ Service worker activated');
        await self.clients.claim();
      } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
      }
    })()
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for manifest.json
  if (url.pathname === '/manifest.json') {
    event.respondWith(
      (async () => {
        try {
          // Try cache first
          const cache = await caches.open(STATIC_CACHE);
          const cachedResponse = await cache.match('/manifest.json');
          if (cachedResponse) {
            console.log('📦 Serving manifest from cache');
            return cachedResponse;
          }

          // Try network
          const response = await fetch(event.request, {
            credentials: 'same-origin',
            cache: 'no-store'
          });
          
          if (response.ok) {
            await cache.put('/manifest.json', response.clone());
            return response;
          }
          
          // Fallback to default manifest
          console.log('⚠️ Using fallback manifest');
          return new Response(JSON.stringify(DEFAULT_MANIFEST), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('❌ Manifest fetch failed:', error);
          return new Response(JSON.stringify(DEFAULT_MANIFEST), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    (async () => {
      try {
        // Try cache first
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Try network
        const response = await fetch(event.request, {
          credentials: 'same-origin',
          cache: 'no-store'
        });
        
        if (response.ok) {
          // Cache successful responses
          const cacheToUse = STATIC_ASSETS.includes(url.pathname) ? STATIC_CACHE : DYNAMIC_CACHE;
          const cache = await caches.open(cacheToUse);
          await cache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(STATIC_CACHE);
          const offlinePage = await cache.match('/offline.html');
          if (offlinePage) {
            return offlinePage;
          }
        }
        throw error;
      }
    })()
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
