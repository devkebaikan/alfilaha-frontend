/**
 * migrate_jadwal_updates.cjs
 * Jalankan sekali: node migrate_jadwal_updates.cjs
 * Update tabel activity_schedules untuk mendukung fitur baru:
 * - Multi-santri assignment
 * - Time input (waktu_mulai)
 * - Dynamic sub-tugas (sub_tugas)
 * - New pattern system (sekali, berulang)
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
    // Add new columns to activity_schedules
    `ALTER TABLE activity_schedules 
     ADD COLUMN IF NOT EXISTS sub_tugas VARCHAR(255) NULL COMMENT 'Sub-tugas spesifik berdasarkan kategori' AFTER kategori,
     ADD COLUMN IF NOT EXISTS waktu_mulai TIME NOT NULL DEFAULT '08:00' COMMENT 'Jam pelaksanaan tugas' AFTER tanggal_mulai,
     MODIFY COLUMN pola_perulangan ENUM('sekali','berulang') NOT NULL DEFAULT 'berulang',
     MODIFY COLUMN penanggung_jawab VARCHAR(500) NULL COMMENT 'CSV dari santri IDs (multi-santri support)',
     DROP FOREIGN KEY IF EXISTS activity_schedules_ibfk_1`,

    // Update the unique key in activity_tasks to support multiple santri per schedule
    `ALTER TABLE activity_tasks 
     DROP INDEX IF EXISTS uq_schedule_tanggal,
     ADD UNIQUE KEY IF NOT EXISTS uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)`
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
        console.log('\n🎉 Migrasi update selesai! Tabel activity_schedules & activity_tasks sudah diupdate.');
        db.end();
        process.exit(0);
      }
    });
  });
});