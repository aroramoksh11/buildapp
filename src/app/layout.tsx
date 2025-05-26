import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from './client-layout'

// Configure Inter font with local fallback
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif'
  ],
  preload: false // Disable preloading to prevent build-time fetching
})

export const metadata: Metadata = {
  title: 'AutoDrive - Self-Driving Car Simulator',
  description: 'Experience the future of transportation with our self-driving car simulator PWA.',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AutoDrive'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AutoDrive" />
        <meta name="application-name" content="AutoDrive" />
      </head>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-white to-slate-50`}>
        <ClientLayout>
          <div className="min-h-screen">
            {children}
          </div>
        </ClientLayout>
      </body>
    </html>
  )
}
