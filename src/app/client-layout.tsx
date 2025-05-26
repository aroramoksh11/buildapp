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
    if ('serviceWorker' in navigator) {
      // Register service worker
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful')

            // Listen for messages from the service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data && event.data.type === 'REFRESH_PAGE') {
                window.location.reload()
              }
            })
          },
          (err) => {
            console.log('ServiceWorker registration failed: ', err)
          }
        )
      })

      // Handle service worker updates
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }
  }, [])

  return (
    <>
      {children}
      <InstallPrompt />
      <UpdatePrompt />
    </>
  )
} 