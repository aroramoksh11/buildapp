const CACHE_NAME = 'isikko-cache-v5';
const STATIC_CACHE = 'static-cache-v5';
const DYNAMIC_CACHE = 'dynamic-cache-v5';

// Default manifest to serve if the actual manifest.json is not accessible
const DEFAULT_MANIFEST = {
  name: "ISIKKO PWA",
  short_name: "ISIKKO",
  description: "ISIKKO Progressive Web App",
  id: "isikko-pwa",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#ffffff",
  orientation: "portrait",
  icons: [
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ],
  scope: "/",
  display_override: ["window-controls-overlay"],
  prefer_related_applications: false
};

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-512x512.png',
  '/version.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Create caches
        const staticCache = await caches.open(STATIC_CACHE);
        const dynamicCache = await caches.open(DYNAMIC_CACHE);

        // Cache static assets
        console.log('📦 Caching static assets...');
        await Promise.all(
          STATIC_ASSETS.map(async (asset) => {
            try {
              const response = await fetch(asset, {
                credentials: 'omit',
                cache: 'no-store'
              });
              if (response.ok) {
                await staticCache.put(asset, response.clone());
                console.log(`✅ Cached: ${asset}`);
              } else {
                console.warn(`⚠️ Failed to cache: ${asset} (${response.status})`);
              }
            } catch (error) {
              console.warn(`⚠️ Error caching ${asset}:`, error);
            }
          })
        );

        // Always cache a default manifest
        const manifestResponse = new Response(
          JSON.stringify(DEFAULT_MANIFEST),
          {
            headers: {
              'Content-Type': 'application/manifest+json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          }
        );
        await staticCache.put('/manifest.json', manifestResponse);
        console.log('✅ Cached default manifest');

        // Skip waiting to activate immediately
        await self.skipWaiting();
        console.log('✅ Service worker installed and activated');
      } catch (error) {
        console.error('❌ Installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Get all cache keys
        const cacheKeys = await caches.keys();
        
        // Delete old caches
        await Promise.all(
          cacheKeys.map(async (key) => {
            if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
              console.log(`🗑️ Deleting old cache: ${key}`);
              await caches.delete(key);
            }
          })
        );

        // Claim clients and update background color
        await self.clients.claim();
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_BACKGROUND',
            version: 'blue-v1'
          });
        });
        
        console.log('✅ Service worker activated and claimed clients');
      } catch (error) {
        console.error('❌ Activation failed:', error);
      }
    })()
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  // Handle manifest.json requests specially
  if (event.request.url.endsWith('/manifest.json')) {
    event.respondWith(
      (async () => {
        try {
          // Try to get from cache first
          const cache = await caches.open(STATIC_CACHE);
          const cachedResponse = await cache.match('/manifest.json');
          
          if (cachedResponse) {
            console.log('📄 Serving manifest from cache');
            return cachedResponse;
          }

          // If not in cache, try network
          try {
            const response = await fetch(event.request, {
              credentials: 'omit',
              cache: 'no-store'
            });
            
            if (response.ok) {
              // Cache the response
              await cache.put('/manifest.json', response.clone());
              console.log('📄 Cached new manifest from network');
              return response;
            }
          } catch (error) {
            console.warn('⚠️ Failed to fetch manifest:', error);
          }

          // If both cache and network fail, serve default manifest
          console.log('📄 Serving default manifest');
          return new Response(
            JSON.stringify(DEFAULT_MANIFEST),
            {
              headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            }
          );
        } catch (error) {
          console.error('❌ Error handling manifest request:', error);
          // Serve default manifest as last resort
          return new Response(
            JSON.stringify(DEFAULT_MANIFEST),
            {
              headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              }
            }
          );
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
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, try network
        const response = await fetch(event.request, {
          credentials: 'omit',
          cache: 'no-store'
        });

        // Cache successful responses
        if (response.ok) {
          await cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        // If both cache and network fail, try to serve offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match('/offline.html');
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        throw error;
      }
    })()
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'UPDATE_BACKGROUND') {
    // Broadcast background color update to all clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_BACKGROUND',
          version: event.data.version || 'blue-v1'
        });
      });
    });
  }
});
