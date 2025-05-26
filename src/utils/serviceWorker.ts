export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);

          // Check for updates every 5 minutes
          setInterval(() => {
            registration.update();
          }, 5 * 60 * 1000);

          // Check for updates when the page becomes visible
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              registration.update();
            }
          });

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });

    // Handle messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_AVAILABLE') {
        console.log('New version available:', event.data.version);
        // You could show a notification to the user here
        window.location.reload();
      }
    });
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
} 