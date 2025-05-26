'use client'

import { useState, useEffect } from 'react'

interface UpdatePromptProps {
  onUpdate: () => Promise<void>;
}

export default function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null)
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null)

  // Force an immediate check when component mounts
  useEffect(() => {
    const forceUpdateCheck = async () => {
      console.log('🔄 Forcing immediate update check...')
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          console.log('📱 Service worker found, checking for updates...')
          await registration.update()
          // Force show the prompt for testing
          setShowUpdatePrompt(true)
          setLastUpdateTime(new Date().toISOString())
        } else {
          console.log('❌ No service worker registration found')
        }
      } catch (error) {
        console.error('❌ Error during forced update check:', error)
      }
    }

    forceUpdateCheck()
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Received message from service worker:', event.data)
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          console.log('✨ Update available:', event.data)
          setLastUpdateTime(event.data.data.timestamp)
          setShowUpdatePrompt(true)
        }
      })

      // Check for updates every 2 minutes
      const checkForUpdates = async () => {
        const now = new Date()
        const nextCheck = new Date(now.getTime() + 2 * 60 * 1000)
        setNextCheckTime(nextCheck)
        
        console.log('⏰ Checking for updates...', {
          currentTime: now.toLocaleTimeString(),
          nextCheck: nextCheck.toLocaleTimeString()
        })

        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            console.log('📱 Service worker found, updating...')
            await registration.update()
            if (registration.waiting) {
              setShowUpdatePrompt(true)
            }
          } else {
            console.log('❌ No service worker registration found')
          }
        } catch (error) {
          console.error('❌ Error checking for updates:', error)
        }
      }

      // Initial check
      checkForUpdates()

      // Set up periodic checks every 2 minutes
      const interval = setInterval(checkForUpdates, 2 * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    setUpdateProgress(0)

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setUpdateProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Call the onUpdate prop
      await onUpdate()
      
      // Complete update after reaching 100%
      setTimeout(() => {
        setIsUpdating(false)
        setShowUpdatePrompt(false)
      }, 500)
    } catch (error) {
      console.error('Error during update:', error)
      setIsUpdating(false)
      setUpdateProgress(0)
    }
  }

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
            {nextCheckTime && (
              <p className="mt-1 text-xs text-purple-600">
                Next check: {nextCheckTime.toLocaleTimeString()}
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
              onClick={handleUpdate}
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