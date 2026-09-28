require('dotenv').config();
const mysql = require('mysql2/promise');

const MIGRATION_VERSION = '20260925_consolidated';
const LOCK_NAME = 'alfilaha_schema_migrations';
let db;

const run = (sql, params = []) => db.query(sql, params).then(([rows]) => rows);

async function tableExists(table) {
  const rows = await run(
    'SELECT 1 AS found FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    [table]
  );
  return rows.length > 0;
}

async function columnInfo(table, column) {
  const rows = await run(
    'SELECT COLUMN_NAME, IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column]
  );
  return rows[0] || null;
}

async function hasIndex(table, index) {
  const rows = await run(
    'SELECT 1 AS found FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1',
    [table, index]
  );
  return rows.length > 0;
}

async function indexColumns(table, index) {
  const rows = await run(
    'SELECT COLUMN_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? ORDER BY SEQ_IN_INDEX',
    [table, index]
  );
  return rows.map((row) => row.COLUMN_NAME);
}

async function hasForeignKey(table, column, referencedTable, referencedColumn) {
  const rows = await run(
    `SELECT 1 AS found
       FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
        AND REFERENCED_TABLE_NAME = ?
        AND REFERENCED_COLUMN_NAME = ?
      LIMIT 1`,
    [table, column, referencedTable, referencedColumn]
  );
  return rows.length > 0;
}

async function addColumn(table, column, definition) {
  if (!(await columnInfo(table, column))) {
    await run(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function addForeignKey(table, column, referencedTable, referencedColumn, onDelete = 'SET NULL') {
  if (!(await hasForeignKey(table, column, referencedTable, referencedColumn))) {
    const constraint = `fk_${table}_${column}`;
    await run(
      `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraint}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${referencedTable}\` (\`${referencedColumn}\`) ON DELETE ${onDelete}`
    );
  }
}

async function ensureForeignKey(table, column, referencedTable, referencedColumn, onDelete = 'SET NULL') {
  if (await hasForeignKey(table, column, referencedTable, referencedColumn)) return;
  const orphans = await run(
    `SELECT 1 AS invalid
       FROM \`${table}\`
      WHERE \`${column}\` IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM \`${referencedTable}\` WHERE \`${referencedTable}\`.id = \`${table}\`.\`${column}\`
        )
      LIMIT 1`
  );
  if (orphans.length) {
    console.warn(`FK ${table}.${column} dilewati karena ada data yatim.`);
    return;
  }
  return addForeignKey(table, column, referencedTable, referencedColumn, onDelete);
}

async function createCoreTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS reservasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      whatsapp VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      instansi VARCHAR(100),
      tanggal VARCHAR(50) NOT NULL,
      jumlah VARCHAR(100) NOT NULL,
      pesan TEXT,
      status VARCHAR(20) DEFAULT 'Pending'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS paket_wisata (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_paket VARCHAR(100) NOT NULL,
      harga VARCHAR(50) NOT NULL,
      deskripsi TEXT,
      gambar VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      date VARCHAR(100) NOT NULL,
      description TEXT,
      image VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      excerpt TEXT,
      content LONGTEXT,
      image VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      number VARCHAR(20),
      email VARCHAR(100) NOT NULL,
      address TEXT,
      message TEXT,
      status VARCHAR(20) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      nama_lengkap VARCHAR(100),
      role VARCHAR(50) DEFAULT 'Petugas'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS galeri (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS pendaftar_santri (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      tempat_lahir VARCHAR(100) NOT NULL,
      tanggal_lahir DATE NOT NULL,
      jenis_kelamin ENUM('L', 'P') NOT NULL,
      alamat TEXT NOT NULL,
      no_wa VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      program_id INT NULL,
      status_pendaftaran ENUM('Menunggu Verifikasi', 'Diterima', 'Ditolak') DEFAULT 'Menunggu Verifikasi',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS layanan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS tanaman (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      jenis VARCHAR(100),
      lokasi VARCHAR(255),
      deskripsi TEXT,
      gambar VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_lengkap VARCHAR(255) NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('santri', 'guru', 'petugas') NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS program_pendaftaran (
      id INT AUTO_INCREMENT PRIMARY KEY,
      judul VARCHAR(255) NOT NULL,
      jenis VARCHAR(100) NOT NULL,
      nama VARCHAR(255) NOT NULL,
      status ENUM('aktif', 'non_aktif') DEFAULT 'aktif',
      batas_akhir DATE NOT NULL,
      poster VARCHAR(255),
      keterangan TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const sql of tables) await run(sql);
  await addColumn('paket_wisata', 'gambar', 'VARCHAR(255) NULL');
  await addColumn('admin_users', 'nama_lengkap', 'VARCHAR(100) NULL');
  await addColumn('admin_users', 'role', "VARCHAR(50) DEFAULT 'Petugas'");
  await addColumn('pendaftar_santri', 'kelas', 'VARCHAR(100) NULL');
  await addColumn('pendaftar_santri', 'kamar', 'VARCHAR(100) NULL');
  await addColumn('pendaftar_santri', 'program_id', 'INT NULL');
  if (!(await hasIndex('pendaftar_santri', 'idx_pendaftar_santri_program_id'))) {
    await run('CREATE INDEX idx_pendaftar_santri_program_id ON pendaftar_santri (program_id)');
  }
  await ensureForeignKey('pendaftar_santri', 'program_id', 'program_pendaftaran', 'id', 'SET NULL');
  await addColumn('users', 'nama_lengkap', 'VARCHAR(255) NULL');
  await addColumn('users', 'status', "ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
  await addColumn('users', 'created_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await addColumn('users', 'updated_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await addColumn('program_pendaftaran', 'poster', 'VARCHAR(255) NULL');
  await addColumn('program_pendaftaran', 'keterangan', 'TEXT NULL');
}

async function createScheduleTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS activity_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_aktivitas VARCHAR(255) NOT NULL,
      kategori VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
      deskripsi TEXT,
      pola_pengulangan ENUM('sekali', 'harian', 'mingguan', 'bulanan', 'berulang') NOT NULL DEFAULT 'mingguan',
      interval_hari INT NOT NULL DEFAULT 7,
      tanggal_mulai DATE NOT NULL,
      tanggal_selesai DATE NULL,
      penanggung_jawab INT NULL,
      status ENUM('aktif', 'nonaktif', 'selesai') NOT NULL DEFAULT 'aktif',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      kategori_id INT NULL,
      lokasi_id INT NULL,
      jam_mulai TIME NULL,
      jam_selesai TIME NULL,
      FOREIGN KEY (penanggung_jawab) REFERENCES pendaftar_santri(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS activity_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      schedule_id INT NOT NULL,
      santri_id INT NULL,
      nama_santri VARCHAR(255) NULL,
      tanggal_tugas DATE NOT NULL,
      status ENUM('pending', 'selesai', 'dilewati') NOT NULL DEFAULT 'pending',
      catatan TEXT NULL,
      foto_bukti VARCHAR(255) NULL,
      diselesaikan_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schedule_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE SET NULL,
      UNIQUE KEY uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const sql of tables) await run(sql);
  await addColumn('activity_schedules', 'kategori_id', 'INT NULL');
  await addColumn('activity_schedules', 'lokasi_id', 'INT NULL');
  await addColumn('activity_schedules', 'jam_mulai', 'TIME NULL');
  await addColumn('activity_schedules', 'jam_selesai', 'TIME NULL');
  await ensureForeignKey('activity_schedules', 'kategori_id', 'kategori', 'id');
  await ensureForeignKey('activity_schedules', 'lokasi_id', 'lokasi', 'id');

  if (!(await hasIndex('activity_tasks', 'uq_schedule_santri_tanggal'))) {
    await run('ALTER TABLE activity_tasks ADD UNIQUE KEY uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)');
  }
  if (await hasIndex('activity_tasks', 'uq_schedule_tanggal')) {
    await run('ALTER TABLE activity_tasks DROP INDEX uq_schedule_tanggal');
  }
}

async function createLocationTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS kategori (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL UNIQUE,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS lokasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL UNIQUE,
      keterangan TEXT,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS kegiatan_lokasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lokasi_id INT NOT NULL,
      nama VARCHAR(255) NOT NULL,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE CASCADE,
      UNIQUE KEY uq_lokasi_nama (lokasi_id, nama)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];
  for (const sql of tables) await run(sql);

  await addColumn('kegiatan_lokasi', 'nama_lower', 'VARCHAR(255) GENERATED ALWAYS AS (LOWER(TRIM(nama))) STORED');
  if (!(await hasIndex('kegiatan_lokasi', 'uq_lokasi_nama_lower'))) {
    await run('ALTER TABLE kegiatan_lokasi ADD UNIQUE KEY uq_lokasi_nama_lower (lokasi_id, nama_lower)');
  }
}

async function createRelationTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS aktivitas_kegiatan (
      aktivitas_id INT NOT NULL,
      kegiatan_id INT NOT NULL,
      PRIMARY KEY (aktivitas_id, kegiatan_id),
      FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (kegiatan_id) REFERENCES kegiatan_lokasi(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS aktivitas_tanaman (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aktivitas_id INT NOT NULL,
      tanaman_id INT NOT NULL,
      aksi VARCHAR(50) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_aktivitas_tanaman_aksi (aktivitas_id, tanaman_id, aksi),
      KEY idx_at_aktivitas (aktivitas_id),
      KEY idx_at_tanaman (tanaman_id),
      FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS aktivitas_santri (
      aktivitas_id INT NOT NULL,
      santri_id INT NOT NULL,
      PRIMARY KEY (aktivitas_id, santri_id),
      FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const sql of tables) await run(sql);

  if (!(await hasIndex('aktivitas_tanaman', 'idx_at_aktivitas'))) {
    await run('ALTER TABLE aktivitas_tanaman ADD INDEX idx_at_aktivitas (aktivitas_id)');
  }
  if (!(await hasIndex('aktivitas_tanaman', 'idx_at_tanaman'))) {
    await run('ALTER TABLE aktivitas_tanaman ADD INDEX idx_at_tanaman (tanaman_id)');
  }
  await addColumn('aktivitas_tanaman', 'aksi', 'VARCHAR(50) NULL');
  if (!(await columnInfo('aktivitas_tanaman', 'id'))) {
    await run('ALTER TABLE aktivitas_tanaman DROP PRIMARY KEY, ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST');
  }
  if (!(await hasIndex('aktivitas_tanaman', 'uq_aktivitas_tanaman_aksi'))) {
    await run('ALTER TABLE aktivitas_tanaman ADD UNIQUE KEY uq_aktivitas_tanaman_aksi (aktivitas_id, tanaman_id, aksi)');
  }
  await addColumn('tanaman', 'lokasi_id', 'INT NULL');
  await ensureForeignKey('tanaman', 'lokasi_id', 'lokasi', 'id');
}

async function createCareTables() {
  await run(`CREATE TABLE IF NOT EXISTS log_perawatan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanaman_id INT NOT NULL,
    santri_id INT NULL,
    role_perawat VARCHAR(50) NULL,
    jenis_tindakan ENUM('siram', 'pupuk', 'panen') NOT NULL,
    waktu_tindakan TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gambar VARCHAR(255) NULL,
    nama_perawat VARCHAR(255) NULL,
    jadwal_id INT NULL,
    laporan_singkat TEXT NULL,
    FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  if (await columnInfo('log_perawatan', 'perawat_id')) {
    if (!(await columnInfo('log_perawatan', 'santri_id'))) {
      await run('ALTER TABLE log_perawatan CHANGE perawat_id santri_id INT NULL');
    }
  }
  await addColumn('log_perawatan', 'santri_id', 'INT NULL');
  await addColumn('log_perawatan', 'nama_perawat', 'VARCHAR(255) NULL');
  await addColumn('log_perawatan', 'role_perawat', 'VARCHAR(50) NULL');
  await addColumn('log_perawatan', 'gambar', 'VARCHAR(255) NULL');
  await addColumn('log_perawatan', 'jadwal_id', 'INT NULL');
  await addColumn('log_perawatan', 'laporan_singkat', 'TEXT NULL');
  if ((await columnInfo('log_perawatan', 'santri_id'))?.IS_NULLABLE === 'NO') {
    await run('ALTER TABLE log_perawatan MODIFY COLUMN santri_id INT NULL');
  }
  await ensureForeignKey('log_perawatan', 'santri_id', 'pendaftar_santri', 'id');
  await ensureForeignKey('log_perawatan', 'jadwal_id', 'activity_schedules', 'id');

  await run(`CREATE TABLE IF NOT EXISTS foto_perkembangan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanaman_id INT NOT NULL,
    santri_id INT NOT NULL,
    gambar VARCHAR(255) NOT NULL,
    waktu_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE,
    FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

async function createLivestockTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS jenis_ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL UNIQUE,
      kategori ENUM('individu', 'kelompok') NOT NULL DEFAULT 'individu',
      keterangan TEXT,
      aktif TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      jenis_ternak_id INT NOT NULL,
      nama_tampilan VARCHAR(255) NULL,
      total INT NOT NULL DEFAULT 0,
      total_mati INT NULL,
      lokasi_id INT NULL,
      foto VARCHAR(255) NULL,
      status_publikasi ENUM('draft', 'dipublikasikan') NOT NULL DEFAULT 'draft',
      deskripsi TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (jenis_ternak_id) REFERENCES jenis_ternak(id) ON DELETE CASCADE,
      FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE SET NULL,
      UNIQUE KEY uq_ternak_jenis (jenis_ternak_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS aktivitas_ternak (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aktivitas_id INT NOT NULL,
      ternak_id INT NOT NULL,
      master_aksi_id INT NULL,
      FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (ternak_id) REFERENCES ternak(id) ON DELETE CASCADE,
      FOREIGN KEY (master_aksi_id) REFERENCES master_aksi_ternak(id) ON DELETE CASCADE,
      UNIQUE KEY uq_aktivitas_ternak_aksi (aktivitas_id, ternak_id, master_aksi_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  ];

  for (const sql of tables) await run(sql);
  await addColumn('master_aksi_ternak', 'batas_harian', 'INT NULL');
  await addColumn('master_aksi_ternak', 'sub_aksi_key', "VARCHAR(100) GENERATED ALWAYS AS (COALESCE(sub_aksi, '')) STORED");
  if (!(await hasIndex('master_aksi_ternak', 'idx_master_aksi_ternak_jenis'))) {
    await run('ALTER TABLE master_aksi_ternak ADD INDEX idx_master_aksi_ternak_jenis (jenis_ternak_id)');
  }

  const columns = await indexColumns('master_aksi_ternak', 'uq_master_aksi_ternak');
  if (columns.length && columns[columns.length - 1] === 'sub_aksi') {
    const duplicates = await run(
      `SELECT jenis_ternak_id, nama_aksi, COALESCE(sub_aksi, '') AS sub_aksi_key, COUNT(*) AS jumlah
         FROM master_aksi_ternak
        GROUP BY jenis_ternak_id, nama_aksi, COALESCE(sub_aksi, '')
       HAVING COUNT(*) > 1`
    );
    if (duplicates.length) {
      throw new Error('Duplikat master_aksi_ternak ditemukan; migrasi dihentikan tanpa menghapus data.');
    }
    await run('ALTER TABLE master_aksi_ternak DROP INDEX uq_master_aksi_ternak');
    columns.length = 0;
  }
  if (!columns.length) {
    const duplicates = await run(
      `SELECT jenis_ternak_id, nama_aksi, COALESCE(sub_aksi, '') AS sub_aksi_key, COUNT(*) AS jumlah
         FROM master_aksi_ternak
        GROUP BY jenis_ternak_id, nama_aksi, COALESCE(sub_aksi, '')
       HAVING COUNT(*) > 1`
    );
    if (duplicates.length) {
      throw new Error('Duplikat master_aksi_ternak ditemukan; migrasi dihentikan tanpa menghapus data.');
    }
    await run('ALTER TABLE master_aksi_ternak ADD UNIQUE KEY uq_master_aksi_ternak (jenis_ternak_id, nama_aksi, sub_aksi_key)');
  }

  await addColumn('ternak', 'nama_tampilan', 'VARCHAR(255) NULL');
  await addColumn('ternak', 'status_publikasi', "ENUM('draft', 'dipublikasikan') NOT NULL DEFAULT 'draft'");
}

async function seedBaseline() {
  await run(
    'INSERT IGNORE INTO jenis_ternak (nama, kategori, keterangan) VALUES ?',
    [[['Sapi', 'individu', 'Sapi potong/perah pondok'], ['Ayam', 'kelompok', 'Ayam petelur (panen telur)'], ['Kambing', 'individu', 'Kambing perah/ternak']]]
  );
  const jenis = await run('SELECT id, nama FROM jenis_ternak');
  const ids = Object.fromEntries(jenis.map((row) => [row.nama, row.id]));
  const actions = [
    ['Sapi', 'Beri Pakan Pagi', null, 0, null, 10], ['Sapi', 'Beri Pakan Sore', null, 0, null, 20],
    ['Sapi', 'Beri Minum/Air', null, 0, null, 30], ['Sapi', 'Bersihkan Kandang', 'Pagi', 0, null, 40],
    ['Sapi', 'Bersihkan Kandang', 'Sore', 0, null, 50], ['Ayam', 'Beri Pakan Pagi', null, 0, null, 10],
    ['Ayam', 'Beri Pakan Sore', null, 0, null, 20], ['Ayam', 'Panen Telur', null, 0, null, 25],
    ['Ayam', 'Bersihkan Kandang', 'Pagi', 0, null, 40], ['Ayam', 'Bersihkan Kandang', 'Sore', 0, null, 50],
    ['Ayam', 'Konfirmasi Ayam Mati', null, 1, 'Jumlah ekor yang mati', 99], ['Kambing', 'Beri Pakan Pagi', null, 0, null, 10],
    ['Kambing', 'Beri Pakan Sore', null, 0, null, 20], ['Kambing', 'Beri Minum/Air', null, 0, null, 30],
    ['Kambing', 'Perah Susu', null, 0, null, 35], ['Kambing', 'Bersihkan Kandang', 'Pagi', 0, null, 40],
    ['Kambing', 'Bersihkan Kandang', 'Sore', 0, null, 50]
  ];
  for (const [jenisNama, nama, sub, angka, label, urutan] of actions) {
    const jenisId = ids[jenisNama];
    if (!jenisId) continue;
    await run(
      `INSERT INTO master_aksi_ternak
        (jenis_ternak_id, nama_aksi, sub_aksi, butuh_input_angka, label_input, urutan)
       SELECT ?, ?, ?, ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM master_aksi_ternak
           WHERE jenis_ternak_id = ? AND nama_aksi = ? AND COALESCE(sub_aksi, '') = COALESCE(?, '')
        )`,
      [jenisId, nama, sub, angka, label, urutan, jenisId, nama, sub]
    );
  }
  await run("INSERT IGNORE INTO kategori (nama, aktif) VALUES ('Peternakan', 1)");
  for (const nama of ['Sapi', 'Ayam', 'Kambing']) {
    await run(
      `INSERT INTO lokasi (nama, keterangan, aktif)
       SELECT ?, ?, 1 WHERE NOT EXISTS (SELECT 1 FROM lokasi WHERE nama = ?)`,
      [`Kandang ${nama}`, `Kandang untuk ternak ${nama.toLowerCase()}`, `Kandang ${nama}`]
    );
  }
  await run(
    `UPDATE ternak t
       JOIN jenis_ternak jt ON jt.id = t.jenis_ternak_id
        SET t.nama_tampilan = COALESCE(NULLIF(t.nama_tampilan, ''), jt.nama),
            t.status_publikasi = IFNULL(NULLIF(t.status_publikasi, ''), 'draft')`
  );
}

async function verify() {
  const required = [
    'users', 'program_pendaftaran', 'activity_schedules', 'activity_tasks', 'kategori', 'lokasi',
    'kegiatan_lokasi', 'aktivitas_tanaman', 'ternak', 'jenis_ternak', 'master_aksi_ternak'
  ];
  for (const table of required) {
    if (!(await tableExists(table))) throw new Error(`Tabel wajib belum tersedia: ${table}`);
  }
  const [count] = await run('SELECT COUNT(*) AS jumlah FROM ternak');
  return Number(count.jumlah);
}

async function migrate() {
  let locked = false;
  db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_alfilaha'
  });
  try {
    const [lockRows] = await db.query('SELECT GET_LOCK(?, 30) AS acquired', [LOCK_NAME]);
    if (Number(lockRows[0].acquired) !== 1) throw new Error('Lock migrasi database tidak dapat diperoleh.');
    locked = true;

    await createCoreTables();
    await createLocationTables();
    await createScheduleTables();
    await createRelationTables();
    await createCareTables();
    await createLivestockTables();
    await seedBaseline();
    const ternakCount = await verify();

    await run(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(100) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );
    await run('INSERT IGNORE INTO schema_migrations (version) VALUES (?)', [MIGRATION_VERSION]);
    console.log(`Migrasi ${MIGRATION_VERSION} selesai. Data peternakan tersimpan: ${ternakCount}.`);
  } finally {
    if (locked && db) await db.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]);
    if (db) await db.end();
  }
}

migrate().catch((error) => {
  console.error(`Migrasi database gagal: ${error.message}`);
  process.exitCode = 1;
});
