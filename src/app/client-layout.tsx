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

  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        // First, unregister any existing service workers
        const existingRegistrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of existingRegistrations) {
          console.log('🔄 Unregistering existing service worker...');
          await reg.unregister();
        }

        if ('serviceWorker' in navigator) {
          console.log('🔄 Starting fresh service worker registration...');
          
          // Register new service worker with explicit scope and type
          const newRegistration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            type: 'module',
            updateViaCache: 'none'
          });

          console.log('📦 Service worker registration successful:', newRegistration.scope);

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
      }
    };

    registerServiceWorker();

    // Check if the app is installed
    const checkIfInstalled = () => {
      const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                            (window.navigator as any).standalone === true;
      setIsInstalled(isPWAInstalled);
    };

    checkIfInstalled();
    window.addEventListener('appinstalled', checkIfInstalled);

    return () => {
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
      {!isInstalled && <InstallPrompt />}
      {updateAvailable && <UpdatePrompt onUpdate={handleUpdate} />}
      {children}
    </>
  );
} 