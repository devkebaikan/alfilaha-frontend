/**
 * setup_db.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Jalankan SEKALI untuk mempersiapkan semua tabel sistem jadwal aktivitas.
 *
 *   node setup_db.cjs
 *
 * Script ini IDEMPOTENT — aman dijalankan ulang, tidak akan menghapus data.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const mysql = require('mysql2');

const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'db_alfilaha',
  multipleStatements: true,
});

// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    name: 'Buat tabel activity_schedules (master jadwal)',
    sql: `
      CREATE TABLE IF NOT EXISTS activity_schedules (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        nama_aktivitas   VARCHAR(255) NOT NULL,
        kategori         VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
        deskripsi        TEXT,
        pola_perulangan  ENUM('sekali','harian','mingguan','bulanan') NOT NULL DEFAULT 'mingguan',
        interval_hari    INT NOT NULL DEFAULT 7
          COMMENT 'Jumlah hari antar pengulangan. Otomatis diisi sesuai pola.',
        tanggal_mulai    DATE NOT NULL,
        tanggal_selesai  DATE NULL
          COMMENT 'NULL = tidak ada batas akhir (berlangsung selamanya)',
        penanggung_jawab INT NULL
          COMMENT 'FK ke pendaftar_santri.id — bisa NULL jika belum ditentukan',
        status           ENUM('aktif','nonaktif','selesai') NOT NULL DEFAULT 'aktif',
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (penanggung_jawab)
          REFERENCES pendaftar_santri(id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'Buat tabel activity_tasks (transaksi tiket tugas)',
    sql: `
      CREATE TABLE IF NOT EXISTS activity_tasks (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        schedule_id     INT NOT NULL
          COMMENT 'FK ke activity_schedules — cascade delete',
        santri_id       INT NULL
          COMMENT 'Snapshot FK ke santri — NULL jika santri dihapus',
        nama_santri     VARCHAR(255) NULL
          COMMENT 'Snapshot nama agar histori tidak berubah saat PJ diganti',
        tanggal_tugas   DATE NOT NULL
          COMMENT 'Tanggal jatuh tempo tiket ini',
        status          ENUM('pending','selesai','dilewati') NOT NULL DEFAULT 'pending',
        catatan         TEXT NULL
          COMMENT 'Laporan singkat dari santri saat menyelesaikan tugas',
        foto_bukti      VARCHAR(255) NULL
          COMMENT 'Filename foto yang diupload sebagai bukti',
        diselesaikan_at TIMESTAMP NULL
          COMMENT 'Waktu tepat saat tugas ditandai selesai',
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (schedule_id)
          REFERENCES activity_schedules(id)
          ON DELETE CASCADE,
        FOREIGN KEY (santri_id)
          REFERENCES pendaftar_santri(id)
          ON DELETE SET NULL,
        UNIQUE KEY uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)
          COMMENT 'Mencegah tiket duplikat: satu tiket per santri per jadwal per tanggal'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: 'Tambah kolom santri_data ke pendaftaran login (sudah ada di server)',
    sql: null, // Tidak perlu ALTER — kolom nama, username, status sudah ada
  },
];
// ─────────────────────────────────────────────────────────────────────────────

db.connect((err) => {
  if (err) {
    console.error('❌  Gagal koneksi ke MySQL:', err.message);
    console.error('    Pastikan MySQL berjalan dan kredensial di .env sudah benar.');
    process.exit(1);
  }
  console.log('✅  Terhubung ke database:', process.env.DB_NAME || 'db_alfilaha');
  console.log('');

  const toRun = STEPS.filter((s) => s.sql !== null);
  let idx = 0;

  const runNext = () => {
    if (idx >= toRun.length) {
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('🎉  Setup selesai! Semua tabel sudah siap.');
      console.log('');
      console.log('Langkah selanjutnya:');
      console.log('  1. Jalankan server  →  node server-update.cjs');
      console.log('  2. Jalankan frontend →  npm run dev');
      console.log('  3. Login admin  →  /admin');
      console.log('  4. Buka tab "Jadwal Aktivitas" → buat jadwal pertama');
      console.log('  5. Login santri →  /login-santri → /dashboard-santri');
      console.log('═══════════════════════════════════════════════════');
      db.end();
      process.exit(0);
    }

    const step = toRun[idx];
    process.stdout.write(`[${idx + 1}/${toRun.length}] ${step.name}... `);

    db.query(step.sql, (err) => {
      if (err && err.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.log('❌  GAGAL');
        console.error('    Error:', err.message);
      } else {
        console.log('✅');
      }
      idx++;
      runNext();
    });
  };

  runNext();
});
