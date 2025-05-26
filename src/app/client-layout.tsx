'use client'

import { useEffect, useState } from 'react'
import InstallPrompt from '@/components/InstallPrompt'
import UpdatePrompt from '@/components/UpdatePrompt'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  useEffect(() => {
    const registerServiceWorker = async (retryCount = 0) => {
      try {
        // First, unregister any existing service workers
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of existingRegistrations) {
          console.log('🔄 Unregistering existing service worker...');
          await reg.unregister();
        }

        if ('serviceWorker' in navigator) {
          console.log('🔄 Starting fresh service worker registration...');
          
          // Try to fetch the service worker first to check if it's accessible
          try {
            const response = await fetch('/sw.js', {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
            
            if (!response.ok) {
              throw new Error(`Service worker fetch failed with status ${response.status}`);
            }
            
            console.log('✅ Service worker file is accessible');
          } catch (fetchError) {
            console.error('❌ Service worker file fetch failed:', fetchError);
            throw fetchError;
          }

          // Register new service worker with explicit scope and type
          const newRegistration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            type: 'module',
            updateViaCache: 'none'
          });

          console.log('📦 Service worker registration successful:', newRegistration.scope);
          setRegistrationError(null);

          // Wait for the service worker to be ready
          if (newRegistration.installing) {
            console.log('📦 Service worker installing...');
            newRegistration.installing.addEventListener('statechange', () => {
              if (newRegistration.installing?.state === 'installed') {
                console.log('✅ Service worker installed');
                setRegistration(newRegistration);
              }
            });
          } else if (newRegistration.waiting) {
            console.log('⏳ Service worker waiting...');
            setRegistration(newRegistration);
          } else if (newRegistration.active) {
            console.log('✅ Service worker active');
            setRegistration(newRegistration);
          }

          // Set up update checking
          const checkForUpdates = async () => {
            try {
              if (newRegistration) {
                console.log('🔄 Checking for updates...');
                await newRegistration.update();
                
                // Check if there's a new service worker waiting
                if (newRegistration.waiting) {
                  console.log('🔄 Update available!');
                  setUpdateAvailable(true);
                }
              }
            } catch (error) {
              console.error('❌ Update check failed:', error);
            }
          };

          // Check for updates every 2 minutes
          const updateInterval = setInterval(checkForUpdates, 2 * 60 * 1000);
          
          // Initial update check
          await checkForUpdates();

          // Cleanup on unmount
          return () => {
            clearInterval(updateInterval);
            if (newRegistration) {
              newRegistration.update();
            }
          };
        }
      } catch (error) {
        console.error('❌ Service worker registration failed:', error);
        setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
        
        // Retry registration up to 3 times with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`🔄 Retrying registration in ${delay}ms...`);
          setTimeout(() => registerServiceWorker(retryCount + 1), delay);
        }
      }
    };

    // Add a small delay before initial registration to ensure the page is fully loaded
    const timeoutId = setTimeout(() => {
      registerServiceWorker();
    }, 2000); // Increased delay to 2 seconds

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

  const handleUpdate = async () => {
    if (registration?.waiting) {
      try {
        console.log('🔄 Applying update...');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setUpdateAvailable(false);
        window.location.reload();
      } catch (error) {
        console.error('❌ Update application failed:', error);
      }
    }
  };

  return (
    <>
      {registrationError && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[9999]">
          <p className="text-sm">
            Service worker registration failed. Please refresh the page or try again later.
          </p>
        </div>
      )}
      {!isInstalled && <InstallPrompt />}
      {updateAvailable && <UpdatePrompt onUpdate={handleUpdate} />}
      {children}
    </>
  );
} 