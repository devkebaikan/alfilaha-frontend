const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_alfilaha'
});

console.log('🔄 Memulai migrasi struktur lokasi/area...');

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal koneksi ke database:', err);
    process.exit(1);
  }
  console.log('✅ Berhasil terhubung ke MySQL');

  // 1. Buat tabel kategori
  const createKategori = `
    CREATE TABLE IF NOT EXISTS kategori (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL UNIQUE,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 2. Buat tabel lokasi
  const createLokasi = `
    CREATE TABLE IF NOT EXISTS lokasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL UNIQUE,
      keterangan TEXT,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 3. Buat tabel kegiatan_lokasi
  const createKegiatanLokasi = `
    CREATE TABLE IF NOT EXISTS kegiatan_lokasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lokasi_id INT NOT NULL,
      nama VARCHAR(255) NOT NULL,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE CASCADE,
      UNIQUE KEY uq_lokasi_nama (lokasi_id, nama)
    )
  `;

  // 4. Update tabel tanaman - tambah lokasi_id
  const updateTanaman = `
    ALTER TABLE tanaman 
    ADD COLUMN lokasi_id INT NULL,
    ADD FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE SET NULL
  `;

  // 5. Update tabel activity_schedules - tambah kategori_id dan lokasi_id
  const updateActivitySchedules = `
    ALTER TABLE activity_schedules
    ADD COLUMN kategori_id INT NULL,
    ADD COLUMN lokasi_id INT NULL,
    ADD COLUMN deskripsi TEXT NULL,
    ADD COLUMN jam_mulai TIME NULL,
    ADD COLUMN jam_selesai TIME NULL,
    ADD FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL,
    ADD FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE SET NULL
  `;

  // 6. Buat tabel aktivitas_tanaman (relasi many-to-many)
  const createAktivitasTanaman = `
    CREATE TABLE IF NOT EXISTS aktivitas_tanaman (
      aktivitas_id INT NOT NULL,
      tanaman_id INT NOT NULL,
      PRIMARY KEY (aktivitas_id, tanaman_id),
      FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE
    )
  `;

  // 7. Buat tabel aktivitas_santri (relasi many-to-many)
  const createAktivitasSantri = `
    CREATE TABLE IF NOT EXISTS aktivitas_santri (
      aktivitas_id INT NOT NULL,
      santri_id INT NOT NULL,
      PRIMARY KEY (aktivitas_id, santri_id),
      FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE CASCADE
    )
  `;

  // Eksekusi migrasi secara sequential
  const migrations = [
    { name: 'kategori', sql: createKategori },
    { name: 'lokasi', sql: createLokasi },
    { name: 'kegiatan_lokasi', sql: createKegiatanLokasi },
    { name: 'tanaman_lokasi_id', sql: updateTanaman },
    { name: 'activity_schedules_updates', sql: updateActivitySchedules },
    { name: 'aktivitas_tanaman', sql: createAktivitasTanaman },
    { name: 'aktivitas_santri', sql: createAktivitasSantri },
  ];

  function runMigrations(index) {
    if (index >= migrations.length) {
      console.log('✅ Semua migrasi selesai!');
      db.end();
      return;
    }

    const migration = migrations[index];
    console.log(`🔄 Menjalankan: ${migration.name}...`);

    db.query(migration.sql, (err) => {
      if (err) {
        // Ignore error jika kolom sudah ada
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ⚠️  ${migration.name} sudah ada, skip...`);
        } else {
          console.error(`  ❌ Gagal ${migration.name}:`, err.message);
        }
      } else {
        console.log(`  ✅ ${migration.name} berhasil dibuat/diupdate`);
      }
      runMigrations(index + 1);
    });
  }

  // 8. Migrasi kategori dari data yang sudah ada
  function migrateExistingCategories() {
    console.log('🔄 Migrasi kategori dari jadwal yang sudah ada...');
    
    // Ambil semua kategori unik dari activity_schedules
    db.query('SELECT DISTINCT kategori FROM activity_schedules WHERE kategori IS NOT NULL', (err, results) => {
      if (err) {
        console.error('❌ Gagal mengambil kategori yang ada:', err.message);
        return;
      }

      if (results.length === 0) {
        console.log('  ℹ️  Tidak ada kategori yang perlu dimigrasi');
        return;
      }

      let completed = 0;
      results.forEach((row) => {
        const kategoriName = row.kategori;
        
        // Cek apakah kategori sudah ada di tabel kategori
        db.query('SELECT id FROM kategori WHERE nama = ?', [kategoriName], (err, catResults) => {
          if (err) {
            console.error(`  ❌ Gagal cek kategori ${kategoriName}:`, err.message);
            return;
          }

          if (catResults.length === 0) {
            // Insert kategori baru
            db.query('INSERT INTO kategori (nama) VALUES (?)', [kategoriName], (err) => {
              if (err) {
                console.error(`  ❌ Gagal insert kategori ${kategoriName}:`, err.message);
              } else {
                console.log(`  ✅ Kategori "${kategoriName}" ditambahkan`);
                completed++;
              }
            });
          } else {
            console.log(`  ℹ️  Kategori "${kategoriName}" sudah ada`);
            completed++;
          }
        });
      });

      // Hubungkan jadwal lama ke kategori_id
      setTimeout(() => {
        db.query('SELECT id, nama FROM kategori', (err, kategoriMap) => {
          if (err) {
            console.error('❌ Gagal mengambil kategori map:', err.message);
            return;
          }

          const kategoriIdMap = {};
          kategoriMap.forEach(k => {
            kategoriIdMap[k.nama] = k.id;
          });

          let updated = 0;
          results.forEach((row) => {
            const kategoriId = kategoriIdMap[row.kategori];
            if (kategoriId) {
              db.query('UPDATE activity_schedules SET kategori_id = ? WHERE kategori = ?', [kategoriId, row.kategori], (err) => {
                if (err) {
                  console.error(`  ❌ Gagal update kategori_id untuk kategori ${row.kategori}:`, err.message);
                } else {
                  updated++;
                }
              });
            }
          });

          console.log(`  ✅ ${updated} jadwal dihubungkan ke kategori baru`);
          console.log('✅ Migrasi kategori selesai!');
        });
      }, 1000);
    });
  }

  // Jalankan migrasi
  runMigrations(0);

  // Jalankan migrasi kategori setelah semua tabel selesai
  setTimeout(() => {
    migrateExistingCategories();
  }, 2000);
});