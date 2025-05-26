'use client'

import { useState, useEffect } from 'react'

export default function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          console.log('Update available:', event.data)
          setLastUpdateTime(event.data.data.timestamp)
          handleAutomaticUpdate()
        }
      })

      // Check for updates every 2 minutes
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            console.log('Checking for updates...')
            await registration.update()
          }
        } catch (error) {
          console.error('Error checking for updates:', error)
        }
      }

      // Initial check
      checkForUpdates()

      // Set up periodic checks every 2 minutes
      const interval = setInterval(checkForUpdates, 2 * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [])

  const handleAutomaticUpdate = async () => {
    // Save any important state to localStorage before update
    const currentState = {
      // Add any important state that needs to persist
      lastUpdateCheck: new Date().toISOString(),
      // Add other state as needed
    }
    localStorage.setItem('appState', JSON.stringify(currentState))

    setIsUpdating(true)
    setUpdateProgress(0)

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        // Start progress animation
        const progressInterval = setInterval(() => {
          setUpdateProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              // Complete update after reaching 100%
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

        // Trigger the update
        await registration.update()
        navigator.serviceWorker.controller?.postMessage({ type: 'REFRESH_PAGE' })
      }
    } catch (error) {
      console.error('Error during automatic update:', error)
      setIsUpdating(false)
      setUpdateProgress(0)
    }
  }

  // Restore state after page reload
  useEffect(() => {
    const savedState = localStorage.getItem('appState')
    if (savedState) {
      const state = JSON.parse(savedState)
      // Restore any saved state
      console.log('Restored state:', state)
    }
  }, [])

  if (!showUpdatePrompt && !isUpdating) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 backdrop-blur-sm rounded-xl shadow-2xl p-4 max-w-sm w-full border border-pink-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {isUpdating ? '🚀 Updating AutoDrive' : '✨ New Update Available'}
            </h3>
            <p className="mt-1 text-sm text-gray-700">
              {isUpdating
                ? 'Please wait while we update your app...'
                : 'A new version of AutoDrive is ready to install.'}
            </p>
            {lastUpdateTime && (
              <p className="mt-1 text-xs text-pink-600">
                Last update: {new Date(lastUpdateTime).toLocaleString()}
              </p>
            )}
          </div>
          {!isUpdating && (
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="text-pink-400 hover:text-pink-600 transition-colors"
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
            <div className="w-full bg-pink-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-pink-600 text-center font-medium">
              {updateProgress === 100 ? '🎉 Update Complete!' : `Updating... ${updateProgress}%`}
            </p>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-pink-600 bg-white hover:bg-pink-50 rounded-lg transition-colors border border-pink-200 shadow-sm"
            >
              Later
            </button>
            <button
              onClick={handleAutomaticUpdate}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 hover:from-pink-600 hover:via-pink-700 hover:to-purple-700 rounded-lg transition-colors shadow-sm"
            >
              Update Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 