import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { VitePWA } from 'vite-plugin-pwa'

// Warna utama proyek (PrimaryColor-0 di tailwind.config.js)
const THEME_COLOR = '#0c7f6e'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    },
    host: true, // Listen on all local IPs
  },
  build: {
    rollupOptions: {
      output: {
        // Pisahkan library besar ke chunk sendiri supaya halaman publik tidak
        // mengunduh chart/editor/peta jika tidak dibuka (cache juga lebih awet
        // karena chunk vendor jarang berubah).
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router")) return "vendor-router";
          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          )
            return "vendor-react";
          if (id.includes("recharts") || id.includes("d3-"))
            return "vendor-charts";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("swiper")) return "vendor-swiper";
          if (id.includes("react-quill") || id.includes("quill"))
            return "vendor-editor";
          if (id.includes("qrcode.react")) return "vendor-qr";
          if (id.includes("browser-image-compression")) return "vendor-image";
          if (id.includes("fslightbox")) return "vendor-lightbox";
          if (id.includes("react-icons")) return "vendor-icons";
          return "vendor";
        },
      },
    },
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { quality: 80, compressionLevel: 8 },
      webp: { quality: 80, lossless: false },
    }),
    VitePWA({
      registerType: 'prompt', // tandai update tersedia; jangan auto-reload
      injectRegister: false, // registrasi dilakukan via useRegisterSW di UpdatePrompt
      // Service worker HANYA di build produksi. Di dev ia meng-cache modul &
      // respons /api secara agresif (StaleWhileRevalidate), sehingga perubahan
      // kode/DB tidak terlihat sampai cache dibersihkan.
      devOptions: { enabled: false, suppressWarnings: true },
      includeAssets: [
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-192.png',
        'icon-maskable-512.png',
        'apple-touch-icon.png',
        'apple-touch-icon-152.png',
        'apple-touch-icon-167.png',
        'favicon.ico',
        'favicon-16.png',
        'favicon-32.png',
        'favicon-48.png',
        'offline.html',
      ],
      manifest: {
        name: 'Alfilaha - Ecopesantren',
        short_name: 'Alfilaha', // maks 12 karakter
        description:
          'Aplikasi Ecopesantren Alfilaha: jadwal aktivitas, tugas santri, dan informasi pondok.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: THEME_COLOR,
        background_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // batas naikkan agar bundel besar tetap ter-precache
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        // jangan precache seluruh folder images (besar) — di-cache saat dipakai
        globIgnores: ['**/images/**'],
        // SPA: rute tak dikenal offline tetap memakai app shell
        navigateFallback: '/index.html',
        // jangan fallback ke index.html untuk endpoint API/file upload
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          {
            // aset statis (js/css/font) — sajikan dari cache, perbarui di latar
            urlPattern: ({ request }) =>
              ['style', 'script', 'font', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-assets' },
          },
          {
            // gambar & foto upload — cache agar tidak bolak-balik unduh
            urlPattern: ({ request, url }) =>
              request.destination === 'image' || url.pathname.startsWith('/uploads/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // endpoint publik (kategori, artikel, galeri, dll.) — dahulukan jaringan
            // endpoint privat/auth/admin sengaja TIDAK di-cache
            urlPattern: ({ request, url }) =>
              request.method === 'GET' &&
              url.pathname.startsWith('/api/') &&
              !/auth|login|logout|admin|santri|tugas|pendaftar|notifikasi/i.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-publik',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 1 hari
              },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
})
