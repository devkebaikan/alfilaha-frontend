import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    },
    host: true, // Listen on all local IPs
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 50 },
      jpeg: { quality: 50 },
      png: { quality: 60, compressionLevel: 8 },
      webp: { quality: 50, lossless: false },
    }),
  ],
})
