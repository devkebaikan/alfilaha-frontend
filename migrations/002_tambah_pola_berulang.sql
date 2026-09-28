-- 002_tambah_pola_berulang.sql
--
-- Bug: form jadwal mengirim pola_perulangan = 'berulang' (UI: "Ulangi Setiap N Hari"),
-- namun kolom activity_schedules.pola_perulangan hanya menerima
-- ENUM('sekali','harian','mingguan','bulanan') sehingga MySQL menolak dengan
-- "Data truncated for column 'pola_perulangan'" dan POST /api/jadwal gagal 500.
--
-- Perbaikan: perluas ENUM dengan 'berulang' (hanya menambah nilai baru,
-- aman untuk data lama; logika generate tiket server.js memang generik
-- berdasarkan interval_hari, bukan nilai enum-nya).
--
-- Jalankan:
--   ALTER TABLE activity_schedules
--     MODIFY pola_perulangan ENUM('sekali','harian','mingguan','bulanan','berulang')
--     NOT NULL DEFAULT 'mingguan';

ALTER TABLE activity_schedules
  MODIFY pola_perulangan ENUM('sekali','harian','mingguan','bulanan','berulang')
  NOT NULL DEFAULT 'mingguan';

-- Verifikasi:
-- SHOW COLUMNS FROM activity_schedules LIKE 'pola_perulangan';