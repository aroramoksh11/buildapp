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
      try {
        if ('serviceWorker' in navigator) {
          console.log('🔄 Starting service worker registration...');

          // First, unregister any existing service workers
          const existingRegistrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of existingRegistrations) {
            console.log('🔄 Unregistering existing service worker...');
            await reg.unregister();
          }

          // Clear any existing service worker caches
          try {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('✅ Cleared existing caches');
          } catch (cacheError) {
            console.warn('⚠️ Failed to clear caches:', cacheError);
          }

          // Try to fetch the service worker first with retry logic
          let fetchRetryCount = 0;
          const maxFetchRetries = 3;
          
          const tryFetchSW = async (): Promise<Response> => {
            try {
              const response = await fetch('/sw.js', {
                method: 'GET',
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                },
                credentials: 'omit' // Don't send credentials
              });

              if (!response.ok) {
                throw new Error(`Service worker fetch failed with status ${response.status}`);
              }

              console.log('✅ Service worker file is accessible');
              return response;
            } catch (error) {
              if (fetchRetryCount < maxFetchRetries) {
                fetchRetryCount++;
                const delay = Math.pow(2, fetchRetryCount) * 1000;
                console.log(`🔄 Retry fetching service worker ${fetchRetryCount}/${maxFetchRetries} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return tryFetchSW();
              }
              throw error;
            }
          };

          try {
            await tryFetchSW();
          } catch (fetchError) {
            console.error('❌ Service worker file fetch failed:', fetchError);
            setRegistrationError('Service worker file not found. Please check your deployment.');
            return;
          }
          
          // Register service worker with retry
          let retryCount = 0;
          const maxRetries = 3;
          
          const tryRegister = async (): Promise<ServiceWorkerRegistration> => {
            try {
              // Wait for any existing service worker to be unregistered
              await new Promise(resolve => setTimeout(resolve, 1000));

              const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
                type: 'module'
              });
              
              console.log('✅ Service worker registered:', registration.scope);
              return registration;
            } catch (error) {
              if (error instanceof Error && error.name === 'InvalidStateError') {
                console.log('🔄 Service worker in invalid state, retrying after cleanup...');
                // Force cleanup and retry
                await navigator.serviceWorker.getRegistrations().then(registrations => 
                  Promise.all(registrations.map(reg => reg.unregister()))
                );
                await new Promise(resolve => setTimeout(resolve, 2000));
                return tryRegister();
              }
              
              if (retryCount < maxRetries) {
                retryCount++;
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`🔄 Retry registration ${retryCount}/${maxRetries} in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return tryRegister();
              }
              throw error;
            }
          };

          try {
            const registration = await tryRegister();
            setRegistration(registration);
            setRegistrationError(null);

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 Update available, applying automatically...');
                    // Automatically apply the update
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                });
              }
            });

            // Set up periodic update check with error handling
            const updateInterval = setInterval(async () => {
              try {
                if (registration.active) {
                  await registration.update();
                }
              } catch (error) {
                console.warn('⚠️ Update check failed:', error);
                // Don't set error state for update failures
              }
            }, 30000); // Check every 30 seconds

            // Cleanup interval on unmount
            return () => {
              clearInterval(updateInterval);
            };
          } catch (error) {
            console.error('❌ Service worker registration failed:', error);
            setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
          }
        }
      } catch (error) {
        console.error('❌ Service worker registration failed:', error);
        setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
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