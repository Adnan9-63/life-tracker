import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Life Tracker',
        short_name: 'LifeTracker',
        description: 'Track my 300-day fitness and tech challenge',
        theme_color: '#000000',
        icons: [
          {
            src: 'icons.svg', // Using your existing icons.svg from your file tree
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ]
})