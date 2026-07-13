import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@auth': path.resolve(__dirname, 'src/auth'),
      '@surfaces': path.resolve(__dirname, 'src/surfaces'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
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
        // Main entry chunk crossed Workbox's default 2 MiB precache limit
        // as the app grew. Bump to 4 MiB so the SW continues to precache
        // the full launch surface without warning out of generation.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Take control of any open tab the moment a new SW lands. Without
        // these two, registerType: 'autoUpdate' downloads the new bundle
        // but waits for every tab to close before activating, so a coach
        // who keeps the app open during a deploy keeps running yesterday's
        // JS even after the server has the fix. AG hit this with the Build
        // race fix (PR #32) — server had the new code, the open tab kept
        // the stale chunk.
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  // Dev-only: forward `/api/anthropic/*` to Anthropic so directClient.ts
  // can bypass CORS during `npm run dev`. The browser can't call
  // api.anthropic.com directly even with the dangerous-allow-browser
  // header (that's an SDK flag, not a CORS bypass). The proxy strips the
  // `/api/anthropic` prefix and forwards to api.anthropic.com server-
  // side from Vite, so the Anthropic key set via VITE_ANTHROPIC_API_KEY
  // never has to round-trip through the browser's CORS gate.
  //
  // Production never uses this — `isDirectKeyConfigured()` is gated to
  // import.meta.env.DEV and prod hits the claude-chat Edge Function.
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        secure: true,
      },
    },
  },
  build: {
    // Keep chunking on Vite/Rollup defaults.
    // Our previous manualChunks strategy created circular chunks
    // (e.g. vendor -> vendor-react -> vendor) which can lead to runtime
    // "React is undefined" style crashes in production.
    chunkSizeWarningLimit: 700,
  },
})
