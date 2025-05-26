'use client'

import { useEffect, useState } from 'react'
import InstallPrompt from '@/components/InstallPrompt'
import UpdatePrompt from '@/components/UpdatePrompt'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isServiceWorkerRegistered, setIsServiceWorkerRegistered] = useState(false)

  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // First, unregister any existing service workers
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            console.log('🗑️ Unregistering old service worker:', registration.scope)
            await registration.unregister()
          }

          console.log('🔄 Starting fresh service worker registration...')
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
            type: 'module'
          })

          // Wait for the service worker to be ready
          if (registration.installing) {
            console.log('📦 Service worker installing...')
            registration.installing.addEventListener('statechange', () => {
              if (registration.installing?.state === 'installed') {
                console.log('✅ Service worker installed')
                setIsServiceWorkerRegistered(true)
              }
            })
          } else if (registration.waiting) {
            console.log('⏳ Service worker waiting...')
            setIsServiceWorkerRegistered(true)
          } else if (registration.active) {
            console.log('✅ Service worker active')
            setIsServiceWorkerRegistered(true)
          }

          // Set up update checking
          const checkForUpdates = async () => {
            try {
              if (registration.active) {
                await registration.update()
                console.log('🔄 Service worker update check completed')
              }
            } catch (error) {
              console.error('❌ Service worker update check failed:', error)
            }
          }

          // Initial check
          await checkForUpdates()

          // Set up periodic checks
          const interval = setInterval(checkForUpdates, 2 * 60 * 1000)

          // Clean up interval on unmount
          return () => clearInterval(interval)

        } catch (error) {
          console.error('❌ Service worker registration failed:', error)
          // Try again in 5 seconds if registration fails
          setTimeout(registerServiceWorker, 5000)
        }
      } else {
        console.log('❌ Service workers not supported')
      }
    }

    // Start registration process
    registerServiceWorker()

    // Clean up function
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.update()
          })
        })
      }
    }
  }, [])

  return (
    <>
      {children}
      {isServiceWorkerRegistered && (
        <>
          <InstallPrompt />
          <UpdatePrompt />
        </>
      )}
    </>
  )
} 