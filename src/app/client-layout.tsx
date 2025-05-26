'use client'

import { useEffect, useState } from 'react'
import InstallPrompt from '@/components/InstallPrompt'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [bgColorVersion, setBgColorVersion] = useState<string>('default');

  useEffect(() => {
    const registerServiceWorker = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('Service worker not supported');
        return;
      }

      try {
        // Unregister any existing service workers
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of existingRegistrations) {
          await registration.unregister();
        }

        // Clear existing caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );

        // Wait a bit after unregistration
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to fetch the service worker file first
        const tryFetchSW = async (retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            try {
              const response = await fetch('/sw.js', {
                method: 'GET',
                credentials: 'omit',
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                }
              });
              
              if (!response.ok) {
                throw new Error(`Failed to fetch service worker: ${response.status} ${response.statusText}`);
              }
              
              const text = await response.text();
              if (!text || text.trim().length === 0) {
                throw new Error('Service worker file is empty');
              }
              
              return true;
            } catch (error) {
              console.error(`Attempt ${i + 1} to fetch service worker failed:`, error);
              if (i === retries - 1) {
                setRegistrationError('Service worker file not found. Please refresh the page or try again later.');
                throw error;
              }
              await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
          }
        };

        // Try to fetch the service worker file
        await tryFetchSW();

        // Try to register the service worker
        const tryRegister = async (retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            try {
              const registration = await navigator.serviceWorker.register('/sw.js', {
                type: 'module',
                scope: '/',
                updateViaCache: 'none'
              });

              if (registration.installing) {
                console.log('Service worker installing');
              } else if (registration.waiting) {
                console.log('Service worker installed');
              } else if (registration.active) {
                console.log('Service worker active');
              }

              // Set up update check
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      // New content is available, refresh the page
                      window.location.reload();
                    }
                  });
                }
              });

              // Handle messages from the service worker
              navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SKIP_WAITING') {
                  registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                }
              });

              // Set up periodic update check
              const updateInterval = setInterval(async () => {
                try {
                  await registration.update();
                } catch (error) {
                  console.error('Error checking for updates:', error);
                  // Don't set error state for update failures
                }
              }, 30000); // Check every 30 seconds

              // Clean up interval on component unmount
              return () => clearInterval(updateInterval);

            } catch (error) {
              console.error(`Attempt ${i + 1} to register service worker failed:`, error);
              if (error instanceof Error && error.name === 'InvalidStateError') {
                // Force cleanup and retry
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                continue;
              }
              if (i === retries - 1) {
                setRegistrationError('Service worker registration failed. Please refresh the page or try again later.');
                throw error;
              }
              await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
          }
        };

        await tryRegister();
      } catch (error) {
        console.error('Service worker registration failed:', error);
        setRegistrationError('Service worker registration failed. Please refresh the page or try again later.');
      }
    };

    // Register service worker after a short delay
    const timeoutId = setTimeout(registerServiceWorker, 2000);

    // Check if the app is installed
    const checkIfInstalled = () => {
      const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                            (window.navigator as any).standalone === true;
      setIsInstalled(isPWAInstalled);
    };

    checkIfInstalled();
    window.addEventListener('appinstalled', checkIfInstalled);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('appinstalled', checkIfInstalled);
    };
  }, []);

  // Apply background color based on version
  useEffect(() => {
    if (bgColorVersion === 'blue-v1') {
      document.documentElement.style.setProperty('--background-start', '#1e40af');
      document.documentElement.style.setProperty('--background-end', '#3b82f6');
      document.body.classList.add('bg-blue-gradient');
    } else {
      document.documentElement.style.setProperty('--background-start', '#ffffff');
      document.documentElement.style.setProperty('--background-end', '#f8fafc');
      document.body.classList.remove('bg-blue-gradient');
    }
  }, [bgColorVersion]);

  return (
    <>
      {registrationError && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[9999]">
          <p className="text-sm">
            Service worker registration failed. Please refresh the page or try again later.
            <br />
            <span className="text-xs text-red-600">Error: {registrationError}</span>
          </p>
        </div>
      )}
      {!isInstalled && <InstallPrompt />}
      {children}
    </>
  );
} 