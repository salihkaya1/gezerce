import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Gezerce – Istanbul Gezi Planlayıcısı',
        short_name: 'Gezerce',
        description: "Istanbul'u keşfet. Yapay zeka destekli gezi planlayıcısı.",
        theme_color: '#1A1726',
        background_color: '#1A1726',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-maps-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'openweather-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 } },
          },
          {
            urlPattern: /^https:\/\/maps\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-maps-static-cache', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
