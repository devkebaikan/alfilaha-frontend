// Migrasi sekali-jalan (idempoten): tarik kegiatan lama yang terkubur di
// keterangan lokasi (format "panen, pupuk, menyiram") menjadi baris
// kegiatan_lokasi. Tidak mengubah keterangan asli.
//
// AMAN dijalankan ulang: lokasi yang sudah punya >= 1 kegiatan tidak disentuh,
// dan insert memakai cek case-insensitive sehingga tidak akan membuat duplikat.
//
// Jalankan:  node migrate_kegiatan_lama.cjs
const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_alfilaha",
});

const normalize = (s) => s.trim().replace(/\s+/g, " ");

const jalankan = async () => {
  const [lokasiRows] = await db.promise().query("SELECT id, nama, keterangan FROM lokasi");
  const ringkasan = [];
  let totalKegiatan = 0;

  for (const lok of lokasiRows) {
    const keterangan = (lok.keterangan || "").trim();
    if (!keterangan) continue;

    const daftar = keterangan
      .split(",")
      .map(normalize)
      .filter((n) => n.length > 0);

    const sudahPunyaKegiatan = await cekPunyaKegiatan(lok.id);
    if (sudahPunyaKegiatan) {
      ringkasan.push({ id: lok.id, nama: lok.nama, keterangan, diproses: false, alasan: "sudah punya kegiatan" });
      continue;
    }

    const baru = [];
    for (const nama of daftar) {
      const ada = await cekAdaKegiatan(lok.id, nama);
      if (!ada) {
        await db
          .promise()
          .query(
            "INSERT INTO kegiatan_lokasi (lokasi_id, nama, aktif) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE id = id",
            [lok.id, nama]
          );
        baru.push(nama);
      }
    }

    if (baru.length > 0) {
      totalKegiatan += baru.length;
      ringkasan.push({ id: lok.id, nama: lok.nama, keterangan, diproses: true, ditambahkan: baru });
    } else {
      ringkasan.push({ id: lok.id, nama: lok.nama, keterangan, diproses: false, alasan: "tidak ada daftar koma di keterangan" });
    }
  }

  console.log(JSON.stringify({ totalKegiatanDitambahkan: totalKegiatan, detail: ringkasan }, null, 2));
  process.exit(0);
};

const cekPunyaKegiatan = async (lokasiId) => {
  const [rows] = await db.promise().query("SELECT COUNT(*) AS c FROM kegiatan_lokasi WHERE lokasi_id = ?", [lokasiId]);
  return rows[0].c > 0;
};

const cekAdaKegiatan = async (lokasiId, nama) => {
  const [rows] = await db.promise().query(
    "SELECT COUNT(*) AS c FROM kegiatan_lokasi WHERE lokasi_id = ? AND LOWER(TRIM(nama)) = LOWER(TRIM(?))",
    [lokasiId, nama]
  );
  return rows[0].c > 0;
};

db.connect((err) => {
  if (err) {
    console.error("Gagal konek database:", err.message);
    process.exit(1);
  }
  jalankan().catch((e) => {
    console.error("Migrasi gagal:", e.message);
    process.exit(1);
  });
});