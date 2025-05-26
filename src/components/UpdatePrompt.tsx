'use client'

import { useState, useEffect } from 'react'

export default function UpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for updates every 5 minutes
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            await registration.update()
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
        setShowUpdatePrompt(true)
      })

      return () => clearInterval(interval)
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    setUpdateProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUpdateProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
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
    }
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
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
              Updating... {updateProgress}%
            </p>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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