// vite.config.js
import { defineConfig } from "file:///home/fauzan/alfilaha-react/node_modules/vite/dist/node/index.js";
import react from "file:///home/fauzan/alfilaha-react/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { ViteImageOptimizer } from "file:///home/fauzan/alfilaha-react/node_modules/vite-plugin-image-optimizer/dist/index.js";
import { VitePWA } from "file:///home/fauzan/alfilaha-react/node_modules/vite-plugin-pwa/dist/index.js";
var THEME_COLOR = "#0c7f6e";
var vite_config_default = defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      }
    },
    host: true
    // Listen on all local IPs
  },
  build: {
    rollupOptions: {
      output: {
        // Pisahkan library besar ke chunk sendiri supaya halaman publik tidak
        // mengunduh chart/editor/peta jika tidak dibuka (cache juga lebih awet
        // karena chunk vendor jarang berubah).
        manualChunks(id) {
          if (!id.includes("node_modules"))
            return;
          if (id.includes("react-router"))
            return "vendor-router";
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler"))
            return "vendor-react";
          if (id.includes("recharts") || id.includes("d3-"))
            return "vendor-charts";
          if (id.includes("framer-motion"))
            return "vendor-motion";
          if (id.includes("swiper"))
            return "vendor-swiper";
          if (id.includes("react-quill") || id.includes("quill"))
            return "vendor-editor";
          if (id.includes("qrcode.react"))
            return "vendor-qr";
          if (id.includes("browser-image-compression"))
            return "vendor-image";
          if (id.includes("fslightbox"))
            return "vendor-lightbox";
          if (id.includes("react-icons"))
            return "vendor-icons";
          return "vendor";
        }
      }
    }
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
      png: { quality: 80, compressionLevel: 8 },
      webp: { quality: 80, lossless: false }
    }),
    VitePWA({
      registerType: "prompt",
      // tandai update tersedia; jangan auto-reload
      injectRegister: false,
      // registrasi dilakukan via useRegisterSW di UpdatePrompt
      // Service worker HANYA di build produksi. Di dev ia meng-cache modul &
      // respons /api secara agresif (StaleWhileRevalidate), sehingga perubahan
      // kode/DB tidak terlihat sampai cache dibersihkan.
      devOptions: { enabled: false, suppressWarnings: true },
      includeAssets: [
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-192.png",
        "icon-maskable-512.png",
        "apple-touch-icon.png",
        "apple-touch-icon-152.png",
        "apple-touch-icon-167.png",
        "favicon.ico",
        "favicon-16.png",
        "favicon-32.png",
        "favicon-48.png",
        "offline.html"
      ],
      manifest: {
        name: "Alfilaha - Ecopesantren",
        short_name: "Alfilaha",
        // maks 12 karakter
        description: "Aplikasi Ecopesantren Alfilaha: jadwal aktivitas, tugas santri, dan informasi pondok.",
        lang: "id",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        theme_color: THEME_COLOR,
        background_color: "#ffffff",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        // batas naikkan agar bundel besar tetap ter-precache
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,svg,woff,woff2}"],
        // jangan precache seluruh folder images (besar) — di-cache saat dipakai
        globIgnores: ["**/images/**"],
        // SPA: rute tak dikenal offline tetap memakai app shell
        navigateFallback: "/index.html",
        // jangan fallback ke index.html untuk endpoint API/file upload
        navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
        runtimeCaching: [
          {
            // aset statis (js/css/font) — sajikan dari cache, perbarui di latar
            urlPattern: ({ request }) => ["style", "script", "font", "worker"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "static-assets" }
          },
          {
            // gambar & foto upload — cache agar tidak bolak-balik unduh
            urlPattern: ({ request, url }) => request.destination === "image" || url.pathname.startsWith("/uploads/"),
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60
                // 30 hari
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // endpoint publik (kategori, artikel, galeri, dll.) — dahulukan jaringan
            // endpoint privat/auth/admin sengaja TIDAK di-cache
            urlPattern: ({ request, url }) => request.method === "GET" && url.pathname.startsWith("/api/") && !/auth|login|logout|admin|santri|tugas|pendaftar|notifikasi/i.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-publik",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60
                // 1 hari
              },
              cacheableResponse: { statuses: [200] }
            }
          }
        ]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9mYXV6YW4vYWxmaWxhaGEtcmVhY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2ZhdXphbi9hbGZpbGFoYS1yZWFjdC92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9mYXV6YW4vYWxmaWxhaGEtcmVhY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgVml0ZUltYWdlT3B0aW1pemVyIH0gZnJvbSAndml0ZS1wbHVnaW4taW1hZ2Utb3B0aW1pemVyJ1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcblxuLy8gV2FybmEgdXRhbWEgcHJveWVrIChQcmltYXJ5Q29sb3ItMCBkaSB0YWlsd2luZC5jb25maWcuanMpXG5jb25zdCBUSEVNRV9DT0xPUiA9ICcjMGM3ZjZlJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTo1MDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfVxuICAgIH0sXG4gICAgaG9zdDogdHJ1ZSwgLy8gTGlzdGVuIG9uIGFsbCBsb2NhbCBJUHNcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gUGlzYWhrYW4gbGlicmFyeSBiZXNhciBrZSBjaHVuayBzZW5kaXJpIHN1cGF5YSBoYWxhbWFuIHB1YmxpayB0aWRha1xuICAgICAgICAvLyBtZW5ndW5kdWggY2hhcnQvZWRpdG9yL3BldGEgamlrYSB0aWRhayBkaWJ1a2EgKGNhY2hlIGp1Z2EgbGViaWggYXdldFxuICAgICAgICAvLyBrYXJlbmEgY2h1bmsgdmVuZG9yIGphcmFuZyBiZXJ1YmFoKS5cbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgaWYgKCFpZC5pbmNsdWRlcyhcIm5vZGVfbW9kdWxlc1wiKSkgcmV0dXJuO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LXJvdXRlclwiKSkgcmV0dXJuIFwidmVuZG9yLXJvdXRlclwiO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwicmVhY3QtZG9tXCIpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcyhcIi9yZWFjdC9cIikgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKFwic2NoZWR1bGVyXCIpXG4gICAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIFwidmVuZG9yLXJlYWN0XCI7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicmVjaGFydHNcIikgfHwgaWQuaW5jbHVkZXMoXCJkMy1cIikpXG4gICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3ItY2hhcnRzXCI7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwiZnJhbWVyLW1vdGlvblwiKSkgcmV0dXJuIFwidmVuZG9yLW1vdGlvblwiO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInN3aXBlclwiKSkgcmV0dXJuIFwidmVuZG9yLXN3aXBlclwiO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcyhcInJlYWN0LXF1aWxsXCIpIHx8IGlkLmluY2x1ZGVzKFwicXVpbGxcIikpXG4gICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3ItZWRpdG9yXCI7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwicXJjb2RlLnJlYWN0XCIpKSByZXR1cm4gXCJ2ZW5kb3ItcXJcIjtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJicm93c2VyLWltYWdlLWNvbXByZXNzaW9uXCIpKSByZXR1cm4gXCJ2ZW5kb3ItaW1hZ2VcIjtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJmc2xpZ2h0Ym94XCIpKSByZXR1cm4gXCJ2ZW5kb3ItbGlnaHRib3hcIjtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoXCJyZWFjdC1pY29uc1wiKSkgcmV0dXJuIFwidmVuZG9yLWljb25zXCI7XG4gICAgICAgICAgcmV0dXJuIFwidmVuZG9yXCI7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFZpdGVJbWFnZU9wdGltaXplcih7XG4gICAgICBqcGc6IHsgcXVhbGl0eTogODAgfSxcbiAgICAgIGpwZWc6IHsgcXVhbGl0eTogODAgfSxcbiAgICAgIHBuZzogeyBxdWFsaXR5OiA4MCwgY29tcHJlc3Npb25MZXZlbDogOCB9LFxuICAgICAgd2VicDogeyBxdWFsaXR5OiA4MCwgbG9zc2xlc3M6IGZhbHNlIH0sXG4gICAgfSksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdwcm9tcHQnLCAvLyB0YW5kYWkgdXBkYXRlIHRlcnNlZGlhOyBqYW5nYW4gYXV0by1yZWxvYWRcbiAgICAgIGluamVjdFJlZ2lzdGVyOiBmYWxzZSwgLy8gcmVnaXN0cmFzaSBkaWxha3VrYW4gdmlhIHVzZVJlZ2lzdGVyU1cgZGkgVXBkYXRlUHJvbXB0XG4gICAgICAvLyBTZXJ2aWNlIHdvcmtlciBIQU5ZQSBkaSBidWlsZCBwcm9kdWtzaS4gRGkgZGV2IGlhIG1lbmctY2FjaGUgbW9kdWwgJlxuICAgICAgLy8gcmVzcG9ucyAvYXBpIHNlY2FyYSBhZ3Jlc2lmIChTdGFsZVdoaWxlUmV2YWxpZGF0ZSksIHNlaGluZ2dhIHBlcnViYWhhblxuICAgICAgLy8ga29kZS9EQiB0aWRhayB0ZXJsaWhhdCBzYW1wYWkgY2FjaGUgZGliZXJzaWhrYW4uXG4gICAgICBkZXZPcHRpb25zOiB7IGVuYWJsZWQ6IGZhbHNlLCBzdXBwcmVzc1dhcm5pbmdzOiB0cnVlIH0sXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbXG4gICAgICAgICdpY29uLTE5Mi5wbmcnLFxuICAgICAgICAnaWNvbi01MTIucG5nJyxcbiAgICAgICAgJ2ljb24tbWFza2FibGUtMTkyLnBuZycsXG4gICAgICAgICdpY29uLW1hc2thYmxlLTUxMi5wbmcnLFxuICAgICAgICAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnLFxuICAgICAgICAnYXBwbGUtdG91Y2gtaWNvbi0xNTIucG5nJyxcbiAgICAgICAgJ2FwcGxlLXRvdWNoLWljb24tMTY3LnBuZycsXG4gICAgICAgICdmYXZpY29uLmljbycsXG4gICAgICAgICdmYXZpY29uLTE2LnBuZycsXG4gICAgICAgICdmYXZpY29uLTMyLnBuZycsXG4gICAgICAgICdmYXZpY29uLTQ4LnBuZycsXG4gICAgICAgICdvZmZsaW5lLmh0bWwnLFxuICAgICAgXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdBbGZpbGFoYSAtIEVjb3Blc2FudHJlbicsXG4gICAgICAgIHNob3J0X25hbWU6ICdBbGZpbGFoYScsIC8vIG1ha3MgMTIga2FyYWt0ZXJcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgJ0FwbGlrYXNpIEVjb3Blc2FudHJlbiBBbGZpbGFoYTogamFkd2FsIGFrdGl2aXRhcywgdHVnYXMgc2FudHJpLCBkYW4gaW5mb3JtYXNpIHBvbmRvay4nLFxuICAgICAgICBsYW5nOiAnaWQnLFxuICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBvcmllbnRhdGlvbjogJ2FueScsXG4gICAgICAgIHRoZW1lX2NvbG9yOiBUSEVNRV9DT0xPUixcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9pY29uLTE5Mi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvaWNvbi01MTIucG5nJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnknLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL2ljb24tbWFza2FibGUtMTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL2ljb24tbWFza2FibGUtNTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgd29ya2JveDoge1xuICAgICAgICAvLyBiYXRhcyBuYWlra2FuIGFnYXIgYnVuZGVsIGJlc2FyIHRldGFwIHRlci1wcmVjYWNoZVxuICAgICAgICBtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogNSAqIDEwMjQgKiAxMDI0LFxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHN2Zyx3b2ZmLHdvZmYyfSddLFxuICAgICAgICAvLyBqYW5nYW4gcHJlY2FjaGUgc2VsdXJ1aCBmb2xkZXIgaW1hZ2VzIChiZXNhcikgXHUyMDE0IGRpLWNhY2hlIHNhYXQgZGlwYWthaVxuICAgICAgICBnbG9iSWdub3JlczogWycqKi9pbWFnZXMvKionXSxcbiAgICAgICAgLy8gU1BBOiBydXRlIHRhayBkaWtlbmFsIG9mZmxpbmUgdGV0YXAgbWVtYWthaSBhcHAgc2hlbGxcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogJy9pbmRleC5odG1sJyxcbiAgICAgICAgLy8gamFuZ2FuIGZhbGxiYWNrIGtlIGluZGV4Lmh0bWwgdW50dWsgZW5kcG9pbnQgQVBJL2ZpbGUgdXBsb2FkXG4gICAgICAgIG5hdmlnYXRlRmFsbGJhY2tEZW55bGlzdDogWy9eXFwvYXBpLywgL15cXC91cGxvYWRzL10sXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgLy8gYXNldCBzdGF0aXMgKGpzL2Nzcy9mb250KSBcdTIwMTQgc2FqaWthbiBkYXJpIGNhY2hlLCBwZXJiYXJ1aSBkaSBsYXRhclxuICAgICAgICAgICAgdXJsUGF0dGVybjogKHsgcmVxdWVzdCB9KSA9PlxuICAgICAgICAgICAgICBbJ3N0eWxlJywgJ3NjcmlwdCcsICdmb250JywgJ3dvcmtlciddLmluY2x1ZGVzKHJlcXVlc3QuZGVzdGluYXRpb24pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ1N0YWxlV2hpbGVSZXZhbGlkYXRlJyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHsgY2FjaGVOYW1lOiAnc3RhdGljLWFzc2V0cycgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIGdhbWJhciAmIGZvdG8gdXBsb2FkIFx1MjAxNCBjYWNoZSBhZ2FyIHRpZGFrIGJvbGFrLWJhbGlrIHVuZHVoXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAoeyByZXF1ZXN0LCB1cmwgfSkgPT5cbiAgICAgICAgICAgICAgcmVxdWVzdC5kZXN0aW5hdGlvbiA9PT0gJ2ltYWdlJyB8fCB1cmwucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3VwbG9hZHMvJyksXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2ltYWdlcycsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAyMDAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMzAgKiAyNCAqIDYwICogNjAsIC8vIDMwIGhhcmlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFswLCAyMDBdIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgLy8gZW5kcG9pbnQgcHVibGlrIChrYXRlZ29yaSwgYXJ0aWtlbCwgZ2FsZXJpLCBkbGwuKSBcdTIwMTQgZGFodWx1a2FuIGphcmluZ2FuXG4gICAgICAgICAgICAvLyBlbmRwb2ludCBwcml2YXQvYXV0aC9hZG1pbiBzZW5nYWphIFRJREFLIGRpLWNhY2hlXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAoeyByZXF1ZXN0LCB1cmwgfSkgPT5cbiAgICAgICAgICAgICAgcmVxdWVzdC5tZXRob2QgPT09ICdHRVQnICYmXG4gICAgICAgICAgICAgIHVybC5wYXRobmFtZS5zdGFydHNXaXRoKCcvYXBpLycpICYmXG4gICAgICAgICAgICAgICEvYXV0aHxsb2dpbnxsb2dvdXR8YWRtaW58c2FudHJpfHR1Z2FzfHBlbmRhZnRhcnxub3RpZmlrYXNpL2kudGVzdCh1cmwucGF0aG5hbWUpLFxuICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2FwaS1wdWJsaWsnLFxuICAgICAgICAgICAgICBuZXR3b3JrVGltZW91dFNlY29uZHM6IDUsXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMDAsXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogMjQgKiA2MCAqIDYwLCAvLyAxIGhhcmlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFsyMDBdIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVEsU0FBUyxvQkFBb0I7QUFDaFMsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsMEJBQTBCO0FBQ25DLFNBQVMsZUFBZTtBQUd4QixJQUFNLGNBQWM7QUFHcEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLFFBSU4sYUFBYSxJQUFJO0FBQ2YsY0FBSSxDQUFDLEdBQUcsU0FBUyxjQUFjO0FBQUc7QUFDbEMsY0FBSSxHQUFHLFNBQVMsY0FBYztBQUFHLG1CQUFPO0FBQ3hDLGNBQ0UsR0FBRyxTQUFTLFdBQVcsS0FDdkIsR0FB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
