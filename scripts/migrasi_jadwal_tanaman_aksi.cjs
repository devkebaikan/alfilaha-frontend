/**
 * Migrasi: jadwal Aktivitas Pondok berbasis tanaman + aksi.
 *
 * 1) aktivitas_tanaman  → tambah kolom `id` (PK baru), `aksi`, unik (aktivitas_id, tanaman_id, aksi)
 *    supaya satu jadwal bisa menampung beberapa aksi per tanaman (siram/pupuk/panen).
 * 2) log_perawatan      → tambah `jadwal_id` (asal jadwal) & `laporan_singkat`.
 *
 * Idempotent — aman dijalankan berulang.
 */
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_alfilaha',
});

const q = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (e, r) => (e ? reject(e) : resolve(r)))
  );

async function adaKolom(tabel, kolom) {
  const rows = await q(`SHOW COLUMNS FROM ${tabel} LIKE ?`, [kolom]);
  return rows.length > 0;
}

async function adaIndex(tabel, nama) {
  const rows = await q(`SHOW INDEX FROM ${tabel} WHERE Key_name = ?`, [nama]);
  return rows.length > 0;
}

async function jalankan(sql, label) {
  try {
    await q(sql);
    console.log(`[Migrasi] ${label} ✅`);
  } catch (e) {
    console.log(`[Migrasi] ${label} dilewati (${e.message.split('code')[0]})`);
  }
}

(async () => {
  // ── 1) aktivitas_tanaman ────────────────────────────────────────────────
  if (!(await adaKolom('aktivitas_tanaman', 'id'))) {
    if (!(await adaKolom('aktivitas_tanaman', 'aksi'))) {
      await jalankan(
        'ALTER TABLE aktivitas_tanaman ADD COLUMN aksi VARCHAR(50) NULL',
        'aktivitas_tanaman: tambah kolom aksi'
      );
    }
    // Index pendukung FK (agar DROP PRIMARY KEY diperbolehkan)
    if (!(await adaIndex('aktivitas_tanaman', 'idx_at_aktivitas'))) {
      await jalankan(
        'ALTER TABLE aktivitas_tanaman ADD INDEX idx_at_aktivitas (aktivitas_id)',
        'aktivitas_tanaman: index aktivitas_id'
      );
    }
    if (!(await adaIndex('aktivitas_tanaman', 'idx_at_tanaman'))) {
      await jalankan(
        'ALTER TABLE aktivitas_tanaman ADD INDEX idx_at_tanaman (tanaman_id)',
        'aktivitas_tanaman: index tanaman_id'
      );
    }
    await jalankan(
      'ALTER TABLE aktivitas_tanaman DROP PRIMARY KEY, ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST',
      'aktivitas_tanaman: ganti PK -> id auto_increment'
    );
  } else if (!(await adaKolom('aktivitas_tanaman', 'aksi'))) {
    await jalankan(
      'ALTER TABLE aktivitas_tanaman ADD COLUMN aksi VARCHAR(50) NULL',
      'aktivitas_tanaman: tambah kolom aksi'
    );
  } else {
    console.log('[Migrasi] aktivitas_tanaman: kolom id & aksi sudah ada.');
  }

  if (!(await adaIndex('aktivitas_tanaman', 'uq_aktivitas_tanaman_aksi'))) {
    await jalankan(
      'ALTER TABLE aktivitas_tanaman ADD UNIQUE INDEX uq_aktivitas_tanaman_aksi (aktivitas_id, tanaman_id, aksi)',
      'aktivitas_tanaman: unik (aktivitas_id, tanaman_id, aksi)'
    );
  } else {
    console.log('[Migrasi] aktivitas_tanaman: index unik aksi sudah ada.');
  }

  // ── 2) log_perawatan ────────────────────────────────────────────────────
  if (!(await adaKolom('log_perawatan', 'jadwal_id'))) {
    await jalankan(
      'ALTER TABLE log_perawatan ADD COLUMN jadwal_id INT NULL, ADD COLUMN laporan_singkat TEXT NULL',
      'log_perawatan: tambah jadwal_id & laporan_singkat'
    );
  } else if (!(await adaKolom('log_perawatan', 'laporan_singkat'))) {
    await jalankan(
      'ALTER TABLE log_perawatan ADD COLUMN laporan_singkat TEXT NULL',
      'log_perawatan: tambah laporan_singkat'
    );
  } else {
    console.log('[Migrasi] log_perawatan: kolom jadwal_id & laporan_singkat sudah ada.');
  }

  const fk = await q(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'log_perawatan'
       AND COLUMN_NAME = 'jadwal_id' AND REFERENCED_TABLE_NAME = 'activity_schedules'`
  );
  if (fk.length === 0) {
    await jalankan(
      'ALTER TABLE log_perawatan ADD CONSTRAINT fk_log_perawatan_jadwal FOREIGN KEY (jadwal_id) REFERENCES activity_schedules(id) ON DELETE SET NULL',
      'log_perawatan: FK jadwal_id -> activity_schedules'
    );
  } else {
    console.log('[Migrasi] log_perawatan: FK jadwal_id sudah ada.');
  }

  console.log('\n✅ Migrasi selesai.');
  process.exit(0);
})().catch((e) => {
  console.error('❌ Migrasi gagal:', e.message);
  process.exit(1);
});