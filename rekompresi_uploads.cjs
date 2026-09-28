// ============================================================================
// REKOMPRESI GAMBAR UPLOADS (satu kali jalan, IN PLACE, tanpa ganti nama).
// ============================================================================
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'uploads';
const kb = (b) => Math.round(b / 1024);
const MAX = 1600;

(async () => {
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  let totalBefore = 0, totalAfter = 0, saved = 0, noGain = 0;
  const rows = [];
  for (const f of files) {
    const p = path.join(dir, f);
    let before;
    try { before = fs.statSync(p).size; } catch { continue; }
    totalBefore += before;
    let out;
    try {
      if (/\.png$/i.test(f)) {
        out = await sharp(p).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toBuffer();
      } else if (/\.webp$/i.test(f)) {
        out = await sharp(p).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      } else {
        out = await sharp(p).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      }
    } catch (e) {
      rows.push({ f, before: kb(before), after: 'SKIP', diff: e.message.split('\n')[0] });
      totalAfter += before Bill;
      continue;
    }
    if (!out || out.length >= before) { rows.push({ f, before: kb(before), after: kb(before), diff: 'tanpa-gain' }); totalAfter += before; noGain++; continue; }
    fs.writeFileSync(p, out);
    totalAfter += out.length;
    saved++;
    rows.push({ f, before: kb(before), after: kb(out.length), diff: '-' + Math.round((1 - out.length / before) * 100) + '%' });
  }
  for (const r of rows) console.log([r.f, r.before + 'KB', r.after + 'KB', r.diff].join('\t'));
  console.log('\n== REKAP ==');
  console.log('DIPROSES:', files.length, '| tulis-ulang:', saved, '| tanpa-gain:', notGain, '| skip:', rows.filter((r) => r.after === 'SKIP').length);
  console.log('Total SEBELUM:', (totalBefore / 1048576).toFixed(2) + ' MB');
  console.log('Total SESUDAH:', (totalAfter / 1048576).toFixed(2) + ' MB');
  console.log('Hemat:', (100 - (100 * totalAfter) / totalBefore).toFixed(1) + '%');
})();
