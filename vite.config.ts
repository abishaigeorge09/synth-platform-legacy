import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'logos/synth-icon-green.svg',
        'logos/icon-152.png',
        'logos/icon-180.png',
        'logos/icon-192.png',
        'logos/icon-512.png',
        'logos/icon-maskable-512.png',
      ],
      manifest: {
        name: 'synth. — Coach data platform',
        short_name: 'synth.',
        description: 'Every data signal. One platform. synth. unifies every coaching tool into one dashboard for coaches and athletes.',
        theme_color: '#059669',
        background_color: '#fafaf9',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/app',
        shortcuts: [
          { name: 'Open mobile app', short_name: 'Mobile', url: '/app' },
          { name: 'Coach dashboard', short_name: 'Coach', url: '/coach/dashboard' },
          { name: 'Athlete view', short_name: 'Athlete', url: '/athlete/today' },
        ],
        icons: [
          {
            src: '/logos/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logos/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logos/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/logos/synth-icon-green.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    // Keep chunking on Vite/Rollup defaults.
    // Our previous manualChunks strategy created circular chunks
    // (e.g. vendor -> vendor-react -> vendor) which can lead to runtime
    // "React is undefined" style crashes in production.
    chunkSizeWarningLimit: 700,
  },
})
