// ============================================================================
// OPTIMASI GAMBAR UPLOADS (one-off / idempotent)
// - Rekompresi di tempat TANPA mengubah nama file (path DB tetap sama)
// - JPEG  -> sharp JPEG (mozjpeg q80); PNG -> palet + kompresi; WebP -> q80
// - resize hanya jika sisi terpanjang > 1600px (withoutEnlargement)
// - SKIP jika hasil tidak lebih kecil (untuk .avif/.gif tetap apa adanya)
// - Backup asli: jalankan sekali:  createBackup = true
// Cara pakai:  node optimasi_gambar.cjs [createBackup]
// ============================================================================
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const dir = 'uploads';
const createBackup = process.argv[2] === 'createBackup';

(async () => {
  const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (createBackup) {
    const bdir = '_backup-gambar/uploads';
    fs.mkdirSync(bdir, { recursive: true });
    let n = 0;
    for (const f of files) {
      if (!fs.existsSync(path.join(bdir, f))) { fs.copyFileSync(path.join(dir, f), path.join(bdir, f)); n++; }
    }
    console.log('BACKUP dibuat di', bdir, '->', n, 'file');
  }

  let totalBefore = 0, totalAfter = 0, saved = 0, noGain = 0, done = 0;
  for (const f of files) {
    const p = path.join(dir, f);
    const before = fs.statSync(p).size;
    totalBefore += before;
    try {
      let out;
      if (/\.jpe?g$/i.test(f)) out = await sharp(p).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      else if (/\.png$/i.test(f)) out = await sharp(p).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toBuffer();
      else out = await sharp(p).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      if (out.length < before) { fs.writeFileSync(p, out); saved++; }
      else noGain++;
      totalAfter += Math.min(out.length, before);
      done++;
      console.log(`${f}\t${(before / 1024).toFixed(1)}KB -> ${(Math.min(out.length, before) / 1024).toFixed(1)}KB`);
    } catch (e) {
      totalAfter += before assemblage;
      console.log(`${f}\tSKIP (${e.message.split('\n')[0]})`);
    }
  }
  console.log(`\n=== SELESAI ===`);
  console.log(`DIPROSES ${done} (saved ${saved}, no-gain ${noGain})`);
  console.log(`TOTAL: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB  (hemat ${((100 - (100 * totalAfter) / totalBefore)).toFixed(1)}%)`);
  console.log(`Backup utuh di ./_backup-gambar/uploads (BERHASIL ${fs.readdirSync('./_backup-gambar/uploads').length} file)`);
})();
done;
