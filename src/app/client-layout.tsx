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
    const registerServiceWorker = async () => {
      try {
        if ('serviceWorker' in navigator) {
          console.log('🔄 Starting service worker registration...');
          
          // Register service worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('✅ Service worker registered:', registration.scope);
          setRegistration(registration);
          setRegistrationError(null);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Update available!');
                  setUpdateAvailable(true);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('❌ Service worker registration failed:', error);
        setRegistrationError(error instanceof Error ? error.message : 'Registration failed');
      }
    };

    // Register service worker after a short delay
    const timeoutId = setTimeout(registerServiceWorker, 1000);

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