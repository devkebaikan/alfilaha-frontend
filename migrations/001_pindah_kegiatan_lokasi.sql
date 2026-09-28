-- 001_pindah_kegiatan_lokasi.sql
--
-- Tujuan:
--   Data lokasi sebelum adanya tabel kegiatan_lokasi menyimpan nama kegiatan
--   sebagai teks bebas di kolom `lokasi.keterangan` (mis. "panen, pupuk, menyiram").
--   Migrasi ini memindahkan teks tersebut menjadi baris kegiatan_lokasi
--   (id, lokasi_id, nama) SUMBER-nya adalah tabel kegiatan_lokasi untuk
--   form jadwal, kartu kegiatan di jadwal, dan halaman detail lokasi.
--
-- Aturan:
--   * Hanya lokasi AKTIF (aktif = 1) dengan keterangan tidak kosong.
--   * Hanya lokasi yang BELUM punya kegiatan_lokasi sama sekali
--     (NOT EXISTS) supaya simpanan baru tidak pernah diduplikasi.
--   * Dipisah koma; token di-TRIM; mendukung sampai 12 item per lokasi.
--   * Idempoten: jalankan ulang aman berkat UNIQUE KEY (lokasi_id, nama)
--     dan (lokasi_id, nama_lower) pada tabel kegiatan_lokasi.
--
-- RENCANA (data saat ini, sebelum dijalankan):
--   SELECT id, nama, aktif, keterangan FROM lokasi
--   -- id=1  'Perkebunan Alfilaha' (Kebun 2, aktif)  -> 1 kegiatan: "Perkebunan Alfilaha"
--   -- id=31 'Masjid Alfilaha '          (Masjid, aktif) -> 1 kegiatan: "Masjid Alfilaha"
--   agar: id 2 & 4 (aktif=0) TIDAK ikut diproses.
--   Note: tidak ada keterangan berisi koma saat ini, sehingga tiap lokasi
--   menghasilkan tepat 1 kegiatan (bukan 3 seperti contoh "panen, pupuk, menyiram").

-- 1) Pratinjau (RENCANA - jangan dijalankan di produksi kecuali untuk review):
-- SELECT l.id, l.nama, l.keterangan,
--        TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(l.keterangan, ',', s.n), ',', -1)) AS kegiatan
-- FROM lokasi l
-- JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
--       UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
--       UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) s
--   ON s.n <= LENGTH(l.keterangan) - LENGTH(REPLACE(l.keterangan, ',', '')) + 1
-- WHERE l.aktif = 1
--   AND l.keterangan IS NOT NULL
--   AND LENGTH(TRIM(l.keterangan)) > 0
--   AND NOT EXISTS (SELECT 1 FROM kegiatan_lokasi k WHERE k.lokasi_id = l.id)
-- ORDER BY l.id, s.n;

-- 2) Eksekusi migrasi:
INSERT INTO kegiatan_lokasi (lokasi_id, nama, aktif)
SELECT l.id,
       TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(l.keterangan, ',', s.n), ',', -1)),
       1
FROM lokasi l
JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
      UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) s
  ON s.n <= LENGTH(l.keterangan) - LENGTH(REPLACE(l.keterangan, ',', '')) + 1
WHERE l.aktif = 1
  AND l.keterangan IS NOT NULL
  AND LENGTH(TRIM(l.keterangan)) > 0
  AND NOT EXISTS (
    SELECT 1 FROM kegiatan_lokasi k WHERE k.lokasi_id = l.id
  )
ON DUPLICATE KEY UPDATE id = id;

-- 3) Verifikasi hasil:
-- SELECT id, lokasi_id, nama, aktif FROM kegiatan_lokasi
-- WHERE lokasi_id IN (SELECT id FROM lokasi WHERE aktif = 1) ORDER BY lokasi_id, nama;