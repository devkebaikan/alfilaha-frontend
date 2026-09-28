/**
 * Generator ikon PWA dari logo asli — versi BACKGROUND TRANSPARAN.
 *
 * - Memotong bbox kotak hijau + logo,
 * - mengubah semua area DI LUAR bentuk rounded-square (termasuk 4 sudut luar)
 *   menjadi alpha channel (transparan), dengan tepi anti-aliasing semi-transparan,
 * - menghasilkan ukuran "any" (transparan) + sinkron maskable (tetap opaque hijau).
 *
 * Jalankan:        node scripts/generate-icons.mjs
 * Sumber default: /home/fauzan/Gambar/667b6720-b04a-42c1-a7fd-9ea9e8223898.jpeg
 *                 (override via env ICON_SRC)
 * Butuh devDependency `sharp` (sudah ada di proyek).
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = process.env.ICON_SRC || "/home/fauzan/Gambar/667b6720-b04a-42c1-a7fd-9ea9e8223898.jpeg";
const OUT_DIR = path.resolve("public");

// alpha dari luminance: lum <= L0 solid (255), lum >= L1 transparan (0), di antaranya gradien halus
const L0 = 140;
const L1 = 235;

function buildIco(entries) {
  let offset = 6 + 16 * entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dirs = entries.map((e) => {
    const buf = Buffer.alloc(16);
    buf[0] = e.width >= 256 ? 0 : e.width;
    buf[1] = e.height >= 256 ? 0 : e.height;
    buf[2] = 0;
    buf[3] = 0;
    buf.writeUInt16LE(1, 4);
    buf.writeUInt16LE(32, 6);
    buf.writeUInt32LE(e.data.length, 8);
    buf.writeUInt32LE(offset, 12);
    offset += e.data.length;
    return buf;
  });
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.data)]);
}

const meta = await sharp(SRC).metadata();
const w = meta.width,
  h = meta.height;
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const ch = info.channels;
if (ch !== 3) throw new Error("sumber harus RGB (3 kanal)");

const at = (x, y) => {
  const i = (y * w + x) * ch;
  return [data[i], data[i + 1], data[i + 2]];
};

// 1) bbox konten (kotak hijau + logo): piksel dengan salah satu kanal < 150
let cX0 = w, cY0 = h, cX1 = -1, cY1 = -1;
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const [r, g, b] = at(x, y);
    if (r < 150 || g < 150 || b < 150) {
      if (x < cX0) cX0 = x;
      if (x > cX1) cX1 = x;
      if (y < cY0) cY0 = y;
      if (y > cY1) cY1 = y;
    }
  }
const cw = cX1 - cX0 + 1,
  chh = cY1 - cY0 + 1;
const S = Math.max(cw, chh);
const ox = Math.floor((S - cw) / 2),
  oy = Math.floor((S - chh) / 2);
console.log(`konten: ${cw}x${chh}  canvas: ${S}  offset: ${ox},${oy}`);

// 2) kanvas RGBA transparan: di luar rounded-square -> alpha 0
const rgba = Buffer.alloc(S * S * 4);
for (let y = 0; y < chh; y++)
  for (let x = 0; x < cw; x++) {
    const [r, g, b] = at(cX0 + x, cY0 + y);
    const lum = (r + g + b) / 3;
    let a;
    if (lum <= L0) a = 255;
    else if (lum >= L1) a = 0;
    else a = Math.round(((L1 - lum) / (L1 - L0)) * 255);
    const o = ((oy + y) * S + (ox + x)) * 4;
    rgba[o] = r;
    rgba[o + 1] = g;
    rgba[o + 2] = b;
    rgba[o + 3] = a;
  }

// 3) master transparan 1024
const master1024 = await sharp(rgba, { raw: { width: S, height: S, channels: 4 } })
  .resize(1024, 1024, { kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toBuffer();
fs.writeFileSync(path.join(OUT_DIR, "icon-transparent.png"), master1024);

// 4) logo (kaligrafi gelap) bbox untuk penengahan maskable
let lX0 = 1e9, lY0 = 1e9, lX1 = -1, lY1 = -1;
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const [r, g, b] = at(x, y);
    if ((r + g + b) / 3 < 70) {
      const cx = x - cX0, cy = y - cY0;
      if (cx < lX0) lX0 = cx;
      if (cx > lX1) lX1 = cx;
      if (cy < lY0) lY0 = cy;
      if (cy > lY1) lY1 = cy;
    }
  }
const logoCX = (lX0 + lX1) / 2,
  logoCY = (lY0 + lY1) / 2;
const ratio = 1024 / S;

// 5) master OPAQUE (green filler) untuk maskable: warna isi = kotak hijau
const greens = [];
for (let y = cY0; y <= cY1; y++)
  for (let x = cX0; x <= cX1; x++) {
    const [r, g, b] = at(x, y);
    if (g >= 100 && r < g * 0.75 && b >= g * 0.65 && b <= g * 1.15 && r < 90) greens.push([r, g, b]);
  }
greens.sort((a, b) => a[1] * 10000 + a[0] - (b[1] * 10000 + b[0]));
const G = greens[Math.floor(greens.length / 2)];
const greenCanvas = Buffer.alloc(S * S * 3, 0);
for (let i = 0; i < S * S; i++) {
  greenCanvas[i * 3] = G[0];
  greenCanvas[i * 3 + 1] = G[1];
  greenCanvas[i * 3 + 2] = G[2];
}
const padL = Math.round(S / 2 - logoCX);
const padT = Math.round(S / 2 - logoCY);
const masterOpaque = await sharp(greenCanvas, { raw: { width: S, height: S, channels: 3 } })
  .composite([{ input: rgba, raw: { width: S, height: S, channels: 4 }, left: 0, top: 0 }])
  .resize(1024, 1024, { fit: "fill" })
  .png({ compressionLevel: 9 })
  .toBuffer();

// 6) tulis semua ukuran
console.log("Menulis set ikon ke public/ ...");
const square = (size, file) =>
  sharp(master1024).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(path.join(OUT_DIR, file));

const maskable = async (size, file) => {
  const inner = Math.round(size * 0.8);
  const buf = await sharp(masterOpaque).resize(inner, inner, { fit: "fill" }).png().toBuffer();
  const top = Math.round(size / 2 - (logoCY + padT) * ratio * (inner / 1024));
  const left = Math.round(size / 2 - (logoCX + padL) * ratio * (inner / 1024));
  await sharp({
    create: { width: size, height: size, channels: 3, background: { r: G[0], g: G[1], b: G[2] } },
  })
    .composite([{ input: buf, top, left }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, file));
};

await square(512, "icon-512.png");
await square(192, "icon-192.png");
await square(180, "apple-touch-icon.png");
await square(152, "apple-touch-icon-152.png");
await square(167, "apple-touch-icon-167.png");
await square(16, "favicon-16.png");
await square(32, "favicon-32.png");
await square(48, "favicon-48.png");
await maskable(512, "icon-maskable-512.png");
await maskable(192, "icon-maskable-192.png");

const p16 = await sharp(path.join(OUT_DIR, "favicon-16.png")).png().toBuffer();
const p32 = await sharp(path.join(OUT_DIR, "favicon-32.png")).png().toBuffer();
const p48 = await sharp(path.join(OUT_DIR, "favicon-48.png")).png().toBuffer();
fs.writeFileSync(
  path.join(OUT_DIR, "favicon.ico"),
  buildIco([
    { width: 16, height: 16, data: p16 },
    { width: 32, height: 32, data: p32 },
    { width: 48, height: 48, data: p48 },
  ]),
);

console.log("Selesai. Set transparan (any/iOS/favicon) + maskable opaque siap dipakai.");