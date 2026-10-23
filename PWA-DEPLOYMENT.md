# PWA — Alfilaha (Ecopesantren)

Aplikasi ini sudah dikonfigurasi sebagai PWA yang bisa diinstal.

## Artefak yang dihasilkan saat build (`npm run build`)

| File | Keterangan |
| --- | --- |
| `dist/manifest.webmanifest` | Manifest PWA (disuntik `<link rel="manifest">` otomatis) |
| `dist/sw.js` | Service worker (Workbox, generateSW, `registerType: "prompt"`) |
| `dist/offline.html` | Halaman fallback offline sederhana |
| `icon-*.png`, `apple-touch-icon*.png`, `favicon.*` | Ikon PWA (any + maskable, iOS, favicon) — direktori `public/` |

Konfigurasi ada di `vite.config.js` (plugin `VitePWA`).
Component terkait di `src/Components/PWA/` (`InstallPrompt.jsx`, `UpdatePrompt.jsx`, `useInstallPrompt.js`),
dimount global di `src/main.jsx`.

## Ikon dari logo asli

Ikon dibuat dari logo asli (kotak hijau + kaligrafi) lewat `scripts/generate-icons.mjs` —
latar putih dibuang dan sudut luar diisi warna hijau kotak sehingga full-bleed tanpa piksel putih.
Cara menjalankan ulang:

```bash
node scripts/generate-icons.mjs   # atau ICON_SRC=/path/ke/logo.png node scripts/generate-icons.mjs
npm run build
```

Hasil ditulis ke `public/` (di-root, bukan `public/icons/`): `icon-192/512.png`,
`icon-maskable-192/512.png`, `apple-touch-icon.png` (180) + `-152` (iPad) + `-167` (iPad Pro),
`favicon-16/32/48.png`, dan `favicon.ico`.

## Dev / preview

Service worker juga aktif saat `npm run dev` (`devOptions.enabled: true`).
`npm run preview` untuk menguji hasil build; keduanya sudah menyajikan
`manifest.webmanifest` dengan `Content-Type: application/manifest+json` dan
`sw.js` tanpa cache panjang (terverifikasi via curl).

## Syarat produksi

1. **Harus HTTPS.** Service worker butuh secure context (localhost pengecualian).

2. **URL API (penting).** Frontend memakai `import.meta.env.VITE_PUBLIC_API`
   dengan fallback `http://localhost:5000`. Build produksi WAJIB men-set-nya
   agar aplikasi terpasang (dari domain produksi) memanggil API yang benar:

   ```bash
   VITE_PUBLIC_API=https://alfilaha.id:5000 npm run build
   ```

3. **Header web server.** Web server/backend yang menyajikan folder `dist` harus:

   - `manifest.webmanifest` → `Content-Type: application/manifest+json`,
     `Cache-Control: no-cache`
   - `sw.js` → `Cache-Control: no-cache, max-age=0` (jangan cache lama, biar update terdeteksi)
   - `index.html` (app shell) → jangan cache terlalu lama (`no-store`/`max-age=0`)
   - aset ter-hash (`/assets/*`) → boleh cache immutable

   Contoh **nginx**:

   ```nginx
   location = /manifest.webmanifest {
     add_header Content-Type application/manifest+json;
     add_header Cache-Control "no-cache";
   }
   location = /sw.js {
     add_header Cache-Control "no-cache, max-age=0";
   }
   # Aset Vite punya hash di nama file → aman di-cache selamanya.
   location /assets/ {
     add_header Cache-Control "public, max-age=31536000, immutable";
   }
   location / {
     add_header Cache-Control "no-store, must-revalidate";
     try_files $uri $uri/ /index.html;
   }
   ```

   Aktifkan juga kompresi di nginx untuk JS/CSS/JSON:

   ```nginx
   gzip on;
   gzip_comp_level 6;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/javascript application/json
              application/manifest+json image/svg+xml;
   ```

   Contoh **Express** (memakai folder `dist`):

   ```js
   const dist = path.join(__dirname, "dist");
   express.static.mime.define({ "application/manifest+json": ["webmanifest"] });
   app.use("/manifest.webmanifest", (req, res, next) => {
     res.setHeader("Content-Type", "application/manifest+json");
     res.setHeader("Cache-Control", "no-cache");
     next();
   }, express.static(dist));
   app.use("/sw.js", (req, res, next) => {
     res.setHeader("Cache-Control", "no-cache, max-age=0");
     next();
   }, express.static(dist));
   app.use(express.static(dist));
   app.get(/^(?!\/api|\/uploads).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
   ```

4. **CORS backend.** Origin produksi `https://alfilaha.id` sudah tercantum di
    `allowedOrigins` (`server-update.cjs`). Jika domain berubah,

   tambahkan origin barunya di sana.

## Perilaku yang disengaja

- `registerType: "prompt"`: saat ada versi baru, muncul banner **"Versi baru tersedia"**
  (`UpdatePrompt`) dan user memutuskan kapan memuat ulang; tidak auto-reload.
- API privat/auth/admin **tidak di-cache**; hanya endpoint publik (kategori,
  galeri, blog, paket) yang pakai `NetworkFirst` dari cache.
- Foto upload (`/uploads/*`) dan gambar di-cache `CacheFirst` 30 hari.
- Rute tak dikenal offline → memakai app shell (`index.html`).
- Ajakan pasang (`InstallPrompt`) muncul di Android/Chrome/Edge, atau panduan
  "Tambahkan ke Layar Utama" di iOS/Safari; setelah ditutup, tidak muncul 7 hari.