'use client'

import { useEffect } from 'react'
import InstallPrompt from '@/components/InstallPrompt'
import UpdatePrompt from '@/components/UpdatePrompt'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔄 Registering service worker...')
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          })
          
          if (registration.installing) {
            console.log('📦 Service worker installing...')
            registration.installing.addEventListener('statechange', () => {
              if (registration.installing?.state === 'installed') {
                console.log('✅ Service worker installed')
              }
            })
          } else if (registration.waiting) {
            console.log('⏳ Service worker waiting...')
          } else if (registration.active) {
            console.log('✅ Service worker active')
          }

          // Check for updates every 2 minutes
          setInterval(async () => {
            try {
              await registration.update()
              console.log('🔄 Service worker update check completed')
            } catch (error) {
              console.error('❌ Service worker update check failed:', error)
            }
          }, 2 * 60 * 1000)

        } catch (error) {
          console.error('❌ Service worker registration failed:', error)
        }
      } else {
        console.log('❌ Service workers not supported')
      }
    }

    registerServiceWorker()
  }, [])

  return (
    <>
      {children}
      <InstallPrompt />
      <UpdatePrompt />
    </>
  )
} 