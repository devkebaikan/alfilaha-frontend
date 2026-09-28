/**
 * init_jadwal_tables.cjs
 * ─────────────────────────────────────────────────────────────────────
 * Jalankan ini SEKALI untuk memastikan tabel jadwal ada di database:
 *
 *   node init_jadwal_tables.cjs
 *
 * ─────────────────────────────────────────────────────────────────────
 */
const mysql = require('mysql2');

const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'db_alfilaha',
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal koneksi:', err.message);
    process.exit(1);
  }
  console.log('✅ Terhubung ke db_alfilaha\n');

  // Pastikan kolom kelas & kamar ada di pendaftar_santri (filter + pemilih Santri Penerima)
  const pastikanKolamPendaftar = (cb) => {
    const ensureColumn = (col, done) => {
      db.query(`SHOW COLUMNS FROM pendaftar_santri LIKE '${col}'`, (err, rows) => {
        if (err) { console.log(`❌ Cek kolom ${col}: ` + err.message); return done(); }
        if (!rows || rows.length === 0) {
          db.query(`ALTER TABLE pendaftar_santri ADD COLUMN ${col} VARCHAR(100) NULL`, (err2) => {
            if (err2) console.log(`❌ Tambah kolom ${col}: ` + err2.message);
            else console.log(`✅ Kolom pendaftar_santri.${col} ditambahkan`);
            done();
          });
        } else {
          console.log(`✅ Kolom pendaftar_santri.${col} sudah ada`);
          done();
        }
      });
    };
    ensureColumn('kelas', () => ensureColumn('kamar', cb));
  };
  pastikanKolamPendaftar(() => {

  const steps = [
    {
      name: 'Cek tabel pendaftar_santri',
      sql: `SELECT COUNT(*) as total FROM pendaftar_santri`,
      onResult: (r) => console.log(`   → ${r[0].total} santri terdaftar di database`),
    },
    {
      name: 'Buat tabel activity_schedules',
      sql: `CREATE TABLE IF NOT EXISTS activity_schedules (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        nama_aktivitas   VARCHAR(255) NOT NULL,
        kategori         VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
        deskripsi        TEXT,
        pola_perulangan  ENUM('sekali','harian','mingguan','bulanan') NOT NULL DEFAULT 'mingguan',
        interval_hari    INT NOT NULL DEFAULT 7,
        tanggal_mulai    DATE NOT NULL,
        tanggal_selesai  DATE NULL,
        penanggung_jawab INT NULL,
        status           ENUM('aktif','nonaktif','selesai') NOT NULL DEFAULT 'aktif',
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (penanggung_jawab)
          REFERENCES pendaftar_santri(id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    },
    {
      name: 'Buat tabel activity_tasks',
      sql: `CREATE TABLE IF NOT EXISTS activity_tasks (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        schedule_id     INT NOT NULL,
        santri_id       INT NULL,
        nama_santri     VARCHAR(255) NULL,
        tanggal_tugas   DATE NOT NULL,
        status          ENUM('pending','selesai','dilewati') NOT NULL DEFAULT 'pending',
        catatan         TEXT NULL,
        foto_bukti      VARCHAR(255) NULL,
        diselesaikan_at TIMESTAMP NULL,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (schedule_id)
          REFERENCES activity_schedules(id)
          ON DELETE CASCADE,
        FOREIGN KEY (santri_id)
          REFERENCES pendaftar_santri(id)
          ON DELETE SET NULL,
        UNIQUE KEY uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    },
    {
      name: 'Buat relasi aktivitas_tanaman (banyak-ke-banyak)',
      sql: `CREATE TABLE IF NOT EXISTS aktivitas_tanaman (
        aktivitas_id INT NOT NULL,
        tanaman_id INT NOT NULL,
        PRIMARY KEY (aktivitas_id, tanaman_id),
        FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
        FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    },
    {
      name: 'Buat relasi aktivitas_santri (banyak-ke-banyak)',
      sql: `CREATE TABLE IF NOT EXISTS aktivitas_santri (
        aktivitas_id INT NOT NULL,
        santri_id INT NOT NULL,
        PRIMARY KEY (aktivitas_id, santri_id),
        FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
        FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    },
    {
      name: 'Buat relasi aktivitas_kegiatan (banyak-ke-banyak)',
      sql: `CREATE TABLE IF NOT EXISTS aktivitas_kegiatan (
        aktivitas_id INT NOT NULL,
        kegiatan_id INT NOT NULL,
        PRIMARY KEY (aktivitas_id, kegiatan_id),
        FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
        FOREIGN KEY (kegiatan_id) REFERENCES kegiatan_lokasi(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    },
    {
      name: 'Cek tabel activity_schedules',
      sql: `SELECT COUNT(*) as total FROM activity_schedules`,
      onResult: (r) => console.log(`   → ${r[0].total} jadwal tersimpan`),
    },
    {
      name: 'Cek tabel activity_tasks',
      sql: `SELECT COUNT(*) as total FROM activity_tasks`,
      onResult: (r) => console.log(`   → ${r[0].total} tiket tugas tersimpan`),
    },
  ];

  let i = 0;
  const runNext = () => {
    if (i >= steps.length) {
      console.log('\n🎉 Semua tabel siap! Sekarang restart server:');
      console.log('   node server-update.cjs\n');
      db.end();
      process.exit(0);
    }
    const step = steps[i++];
    process.stdout.write(`[${i}/${steps.length}] ${step.name}... `);
    db.query(step.sql, (err, results) => {
      if (err && err.code !== 'ER_TABLE_EXISTS_ERROR') {
        console.log('❌ ' + err.message);
      } else {
        console.log('✅');
        if (step.onResult && results) step.onResult(results);
      }
      runNext();
    });
  };
  runNext();
  });
});
