// Migrasi database untuk fitur Peternakan (Koleksi Ternak).
// Aman dijalankan ulang (idempotent): membuat tabel jika belum ada,
// membersihkan duplikat master_aksi_ternak, menanam jenis/aksi/lokasi.
// Baris `ternak` TIDAK ditanam otomatis — diisi admin via form "Tambah".
// Jalankan: node migrasi_ternak.cjs
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_alfilaha'
});

const run = (sql, params) =>
  new Promise((res, rej) => db.query(sql, params, (e, r) => (e ? rej(e) : res(r))));

async function main() {
  const ternakTables = [
    `CREATE TABLE IF NOT EXISTS jenis_ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL UNIQUE,
      kategori ENUM('individu','kelompok') NOT NULL DEFAULT 'individu',
      keterangan TEXT,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS master_aksi_ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      jenis_ternak_id INT NOT NULL,
      nama_aksi VARCHAR(255) NOT NULL,
      sub_aksi VARCHAR(100) NULL,
      sub_aksi_key VARCHAR(100) GENERATED ALWAYS AS (COALESCE(sub_aksi, '')) STORED,
      butuh_input_angka TINYINT(1) DEFAULT 0,
      label_input VARCHAR(255) NULL,
      batas_harian INT NULL,
      urutan INT NOT NULL DEFAULT 0,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jenis_ternak_id) REFERENCES jenis_ternak(id) ON DELETE CASCADE,
      UNIQUE KEY uq_master_aksi_ternak (jenis_ternak_id, nama_aksi, sub_aksi_key)
    )`,
    `CREATE TABLE IF NOT EXISTS ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      jenis_ternak_id INT NOT NULL,
      nama_tampilan VARCHAR(255) NULL,
      total INT NOT NULL DEFAULT 0,
      total_mati INT NULL DEFAULT NULL,
      lokasi_id INT NULL,
      foto VARCHAR(255) NULL,
      status_publikasi ENUM('draft','dipublikasikan') NOT NULL DEFAULT 'draft',
      deskripsi TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (jenis_ternak_id) REFERENCES jenis_ternak(id) ON DELETE CASCADE,
      FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE SET NULL,
      UNIQUE KEY uq_ternak_jenis (jenis_ternak_id)
    )`,
    `CREATE TABLE IF NOT EXISTS log_perawatan_ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ternak_id INT NOT NULL,
      master_aksi_id INT NOT NULL,
      jadwal_id INT NULL,
      aktivitas_id INT NULL,
      catatan TEXT,
      foto VARCHAR(255) NULL,
      nilai_angka INT NULL,
      diinput_oleh INT NULL,
      nama_perawat VARCHAR(255) NULL,
      role_perawat VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ternak_id) REFERENCES ternak(id) ON DELETE CASCADE,
      FOREIGN KEY (master_aksi_id) REFERENCES master_aksi_ternak(id) ON DELETE CASCADE,
      FOREIGN KEY (diinput_oleh) REFERENCES pendaftar_santri(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS aktivitas_ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aktivitas_id INT NOT NULL,
      ternak_id INT NOT NULL,
      master_aksi_id INT NULL,
      FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (ternak_id) REFERENCES ternak(id) ON DELETE CASCADE,
      FOREIGN KEY (master_aksi_id) REFERENCES master_aksi_ternak(id) ON DELETE CASCADE,
      UNIQUE KEY uq_aktivitas_ternak_aksi (aktivitas_id, ternak_id, master_aksi_id)
    )`
  ];

  for (let i = 0; i < ternakTables.length; i++) {
    await run(ternakTables[i]);
    console.log(`[Ternak Table ${i + 1}] Siap ✅`);
  }

  // Migrasi DB (idempotent, jalan tiap saat): kolom sub_aksi_key,
  // bersihkan duplikat, lalu pastikan index unik memakai sub_aksi_key.
  const cols = await run("SHOW COLUMNS FROM master_aksi_ternak LIKE 'sub_aksi_key'");
  if (!cols.length) {
    await run("ALTER TABLE master_aksi_ternak ADD COLUMN sub_aksi_key VARCHAR(100) GENERATED ALWAYS AS (COALESCE(sub_aksi, '')) STORED");
    console.log('[Migrasi] sub_aksi_key ditambah ✅');
  }
  const colBatas = await run("SHOW COLUMNS FROM master_aksi_ternak LIKE 'batas_harian'");
  if (!colBatas.length) {
    await run('ALTER TABLE master_aksi_ternak ADD COLUMN batas_harian INT NULL');
    console.log('[Migrasi] batas_harian ditambah ✅');
  }
  await run(
    `DELETE m1 FROM master_aksi_ternak m1
       JOIN master_aksi_ternak m2
         ON m1.jenis_ternak_id = m2.jenis_ternak_id
        AND m1.nama_aksi = m2.nama_aksi
        AND COALESCE(m1.sub_aksi, '') = COALESCE(m2.sub_aksi, '')
        AND m1.id > m2.id`
  );
  console.log('[Migrasi] duplikat dibersihkan ✅');
  // Index unik ini ikut menopang FK jenis_ternak_id, jadi buat index biasa
  // dulu untuk menggantikannya sebelum index unik lama boleh di-drop.
  try { await run('ALTER TABLE master_aksi_ternak ADD INDEX idx_master_aksi_ternak_jenis (jenis_ternak_id)'); } catch (_) {}
  const adaSubAksi = await run("SHOW INDEX FROM master_aksi_ternak WHERE Key_name = 'uq_master_aksi_ternak' AND Column_name = 'sub_aksi'");
  if (adaSubAksi.length) {
    await run('ALTER TABLE master_aksi_ternak DROP INDEX uq_master_aksi_ternak');
    await run('ALTER TABLE master_aksi_ternak ADD UNIQUE INDEX uq_master_aksi_ternak (jenis_ternak_id, nama_aksi, sub_aksi_key)');
    console.log('[Migrasi] index unik diganti memakai sub_aksi_key ✅');
  }

  // Seed
  const jenis = [
    ['Sapi', 'individu', 'Sapi potong/perah pondok'],
    ['Ayam', 'kelompok', 'Ayam petelur (panen telur)'],
    ['Kambing', 'individu', 'Kambing perah/ternak'],
  ];
  await run('INSERT IGNORE INTO jenis_ternak (nama, kategori, keterangan) VALUES ?', [jenis]);
  console.log('[Seed] jenis_ternak ✅');

  const jt = await run('SELECT id, nama FROM jenis_ternak');
  const idByNama = {};
  jt.forEach((r) => { idByNama[r.nama] = r.id; });

  // Data aksi per jenis
  const dataAksi = {
    Sapi: [
      ['Beri Pakan Pagi', null, 0, null, 10], ['Beri Pakan Sore', null, 0, null, 20],
      ['Beri Minum/Air', null, 0, null, 30], ['Bersihkan Kandang', 'Pagi', 0, null, 40],
      ['Bersihkan Kandang', 'Sore', 0, null, 50],
    ],
    Ayam: [
      ['Beri Pakan Pagi', null, 0, null, 10], ['Beri Pakan Sore', null, 0, null, 20],
      ['Panen Telur', null, 0, null, 25], ['Bersihkan Kandang', 'Pagi', 0, null, 40],
      ['Bersihkan Kandang', 'Sore', 0, null, 50], ['Konfirmasi Ayam Mati', null, 1, 'Jumlah ekor yang mati', 99],
    ],
    Kambing: [
      ['Beri Pakan Pagi', null, 0, null, 10], ['Beri Pakan Sore', null, 0, null, 20],
      ['Beri Minum/Air', null, 0, null, 30], ['Perah Susu', null, 0, null, 35],
      ['Bersihkan Kandang', 'Pagi', 0, null, 40], ['Bersihkan Kandang', 'Sore', 0, null, 50],
    ],
  };
  for (const nama of Object.keys(dataAksi)) {
    const jid = idByNama[nama];
    if (!jid) continue;
    for (const [namaAksi, sub, angka, label, urut] of dataAksi[nama]) {
      await run(
        `INSERT INTO master_aksi_ternak (jenis_ternak_id, nama_aksi, sub_aksi, butuh_input_angka, label_input, urutan)
         SELECT ?, ?, ?, ?, ?, ?
         WHERE NOT EXISTS (
           SELECT 1 FROM master_aksi_ternak
           WHERE jenis_ternak_id = ? AND nama_aksi = ? AND COALESCE(sub_aksi, '') = COALESCE(?, '')
         )`,
        [jid, namaAksi, sub, angka ? 1 : 0, label, urut, jid, namaAksi, sub]
      );
    }
  }
  console.log('[Seed] master_aksi_ternak ✅');

  await run("INSERT IGNORE INTO kategori (nama, aktif) VALUES ('Peternakan', 1)");
  console.log('[Seed] kategori Peternakan ✅');

  // Migrasi kolom baru untuk DB lama (idempotent): nama_tampilan & status_publikasi
  let kol = await run("SHOW COLUMNS FROM ternak LIKE 'nama_tampilan'");
  if (!kol.length) {
    await run('ALTER TABLE ternak ADD COLUMN nama_tampilan VARCHAR(255) NULL AFTER jenis_ternak_id');
    console.log('[Migrasi] ternak.nama_tampilan ditambah ✅');
  }
  kol = await run("SHOW COLUMNS FROM ternak LIKE 'status_publikasi'");
  if (!kol.length) {
    await run("ALTER TABLE ternak ADD COLUMN status_publikasi ENUM('draft','dipublikasikan') NOT NULL DEFAULT 'draft'");
    console.log('[Migrasi] ternak.status_publikasi ditambah ✅');
  }
  await run(
    `UPDATE ternak t JOIN jenis_ternak jt ON jt.id = t.jenis_ternak_id
        SET t.nama_tampilan = COALESCE(NULLIF(t.nama_tampilan,''), jt.nama),
            t.status_publikasi = IFNULL(NULLIF(t.status_publikasi,''), 'draft')`
  );
  console.log('[Migrasi] backfill nama_tampilan & status_publikasi ✅');

  const kandang = [];
  const namaKecil = { Sapi: 'Sapi', Ayam: 'Ayam', Kambing: 'Kambing' };
  for (const n of ['Sapi', 'Ayam', 'Kambing']) {
    if (!idByNama[n]) continue;
    const namaLokasi = `Kandang ${n}`;
    const [lok] = await run('SELECT id FROM lokasi WHERE nama = ?', [namaLokasi]);
    if (!lok) {
      const res = await run('INSERT INTO lokasi (nama, keterangan, aktif) VALUES (?, ?, 1)', [namaLokasi, `Kandang untuk ternak ${namaKecil[n].toLowerCase()}`, 1]);
    }
    kandang.push({ jid: idByNama[n] });
  }
  console.log('[Seed] ternak menunggu input admin (tidak di-seed otomatis) ✅');

  // Verifikasi
  const cek = await run(
    `SELECT jt.nama, (SELECT COUNT(*) FROM master_aksi_ternak m WHERE m.jenis_ternak_id = jt.id AND m.aktif = 1) AS jumlah_aksi
       FROM jenis_ternak jt ORDER BY jt.id`
  );
  console.log('Verifikasi jumlah aksi:', JSON.stringify(cek));
  db.end();
  console.log('SELESAI ✅');
}

db.connect((err) => {
  if (err) { console.error('❌ Gagal koneksi:', err.message); process.exit(1); }
  main().catch((e) => { console.error('❌', e.message); db.end(); process.exit(1); });
});