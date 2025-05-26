'use client'

import { useState, useEffect } from 'react'

export default function UpdatePrompt() {
  // Set initial state to true for testing
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for updates every 5 minutes
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            console.log('Checking for updates...')
            await registration.update()
            // Force show update prompt for testing
            setShowUpdatePrompt(true)
          }
        } catch (error) {
          console.error('Error checking for updates:', error)
        }
      }

      // Initial check
      checkForUpdates()

      // Set up periodic checks every 5 minutes (300000 ms)
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000)

      // Listen for update events
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker updated, showing prompt')
        setShowUpdatePrompt(true)
      })

      return () => clearInterval(interval)
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    setUpdateProgress(0)

    // Simulate progress with completion
    const progressInterval = setInterval(() => {
      setUpdateProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          // Complete the update after reaching 100%
          setTimeout(() => {
            setIsUpdating(false)
            setShowUpdatePrompt(false)
            // Reload the page to apply updates
            window.location.reload()
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        // Send message to service worker to refresh
        navigator.serviceWorker.controller?.postMessage({ type: 'REFRESH_PAGE' })
      }
    } catch (error) {
      console.error('Error updating:', error)
      setIsUpdating(false)
      setUpdateProgress(0)
      clearInterval(progressInterval)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-4 max-w-sm w-full border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              ✨ New Update Available
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              A new version of AutoDrive is ready to install.
            </p>
          </div>
          {!isUpdating && (
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {isUpdating ? (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center">
              {updateProgress === 100 ? 'Update Complete!' : `Updating... ${updateProgress}%`}
            </p>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors border border-pink-200"
            >
              Later
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:from-pink-500 hover:via-pink-600 hover:to-pink-700 rounded-lg transition-colors shadow-sm"
            >
              Update Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 