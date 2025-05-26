/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/buildapp-neon\.vercel\.app\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'app-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
        }
      }
    }
  ]
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['tile.openstreetmap.org'],
    unoptimized: true
  }
}

module.exports = withPWA(nextConfig) 