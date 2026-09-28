/**
 * migrate_jadwal.cjs
 * Jalankan sekali: node migrate_jadwal.cjs
 * Membuat tabel activity_schedules (master) dan activity_tasks (transaksi)
 */
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_alfilaha'
});

db.connect((err) => {
  if (err) { console.error('❌ Gagal koneksi:', err); process.exit(1); }
  console.log('✅ Terhubung ke db_alfilaha');

  const queries = [
    // ── MASTER JADWAL ─────────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS activity_schedules (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      nama_aktivitas   VARCHAR(255) NOT NULL,
      kategori         VARCHAR(100) NOT NULL,
      sub_tugas        VARCHAR(255) NULL COMMENT 'Sub-tugas spesifik berdasarkan kategori',
      deskripsi        TEXT,
      pola_perulangan  ENUM('sekali','berulang') NOT NULL DEFAULT 'berulang',
      interval_hari    INT NOT NULL DEFAULT 7 COMMENT 'Jumlah hari antar pengulangan',
      tanggal_mulai    DATE NOT NULL,
      waktu_mulai      TIME NOT NULL DEFAULT '08:00' COMMENT 'Jam pelaksanaan tugas',
      tanggal_selesai  DATE NULL COMMENT 'NULL = tidak ada batas akhir',
      penanggung_jawab VARCHAR(500) NULL COMMENT 'CSV dari santri IDs (multi-santri support)',
      status           ENUM('aktif','nonaktif','selesai') NOT NULL DEFAULT 'aktif',
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // ── TRANSAKSI TIKET TUGAS ─────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS activity_tasks (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      schedule_id     INT NOT NULL,
      santri_id       INT NULL COMMENT 'Siapa yang bertanggung jawab saat tiket dibuat',
      nama_santri     VARCHAR(255) NULL COMMENT 'Snapshot nama agar histori tidak berubah',
      tanggal_tugas   DATE NOT NULL COMMENT 'Tanggal jatuh tempo tiket ini',
      status          ENUM('pending','selesai','dilewati') NOT NULL DEFAULT 'pending',
      catatan         TEXT NULL,
      foto_bukti      VARCHAR(255) NULL,
      diselesaikan_at TIMESTAMP NULL,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schedule_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (santri_id)   REFERENCES pendaftar_santri(id)   ON DELETE SET NULL,
      UNIQUE KEY uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)
    )`
  ];

  let done = 0;
  queries.forEach((q, i) => {
    db.query(q, (err) => {
      if (err) {
        console.error(`❌ Query ${i + 1} gagal:`, err.message);
      } else {
        console.log(`✅ Query ${i + 1} berhasil`);
      }
      done++;
      if (done === queries.length) {
        console.log('\n🎉 Migrasi selesai! Tabel activity_schedules & activity_tasks siap.');
        db.end();
        process.exit(0);
      }
    });
  });
});
