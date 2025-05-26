'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // We no longer need the prompt. Clear it up
    setDeferredPrompt(null);

    // Hide the install button based on the outcome
    if (outcome === 'accepted') {
      setShowInstallButton(false);
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 rounded-xl shadow-2xl border border-white/10 max-w-sm w-full mx-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-yellow-300">✨</span>
            Install AutoDrive
          </h3>
          <p className="text-sm text-white/90 mt-1">
            Experience the future of driving with our app!
          </p>
        </div>
        <div className="flex gap-3 ml-4">
          <button
            onClick={() => setShowInstallButton(false)}
            className="px-4 py-2 text-sm text-white/90 hover:text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstallClick}
            className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg hover:from-yellow-300 hover:to-yellow-400 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
} 