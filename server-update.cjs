const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
require('dotenv').config();

// ── Storage Multer + optimasi gambar via sharp ─────────────────────────────
// File disimpan dengan NAMA & FORMAT ASLI (ext tetap, nama = Date.now+ext),
// jadi req.file.filename, path DB, dan Content-Type browser tetap konsisten.
// Gambar yang bisa diproses (JPG/PNG/WebP): auto-rotate (perbaiki orientasi
// exif), resize max sisi 1600px (TANPA memperbesar -- warna/tampilan utuh),
// re-encode kualitas 80 agar ringan; dibuat juga salinan thumbnail ±400px.
// File non-gambar (PDF dll) disimpan apa adanya.
const DIR_UPLOAD = './uploads';
const MAX_SISI = 1600;
const KUALITAS = 80;

function ekstensiImage(nama) {
  return /\.(jpe?g|png|webp)$/i.test(nama);
}

function encFormater(format) {
  if (format === 'png') return 'png';
  if (format === 'webp') return 'webp';
  return 'jpeg';
}

function encOptions(format) {
  if (format === 'png') return { compressionLevel: 9, palette: true };
  if (format === 'webp') return { quality: KUALITAS };
  return { quality: KUALITAS, mozjpeg: true };
}

const sharpStorage = {
  _handleFile: function (req, file, cb) {
    if (!fs.existsSync(DIR_UPLOAD)) fs.mkdirSync(DIR_UPLOAD, { recursive: true });
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const nama = Date.now() + ext;
    const jalur = path.join(DIR_UPLOAD, nama);
    const chunks = [];
    file.stream.on('data', (c) => chunks.push(c));
    file.stream.on('error', (e) => cb(e));
    file.stream.on('end', async () => {
      const bufAwal = Buffer.concat(chunks);
      if (!ekstensiImage(nama) || !/^image\//.test(file.mimetype)) {
        return fs.writeFile(jalur, bufAwal, (e) =>
          e ? cb(e) : cb(null, { filename: nama, size: bufAwal.length, path: jalur })
        );
      }
      try {
        const metadata = await sharp(bufAwal, { failOn: 'none' }).metadata();
        const formatAman = ['jpeg', 'png', 'webp'].includes(metadata.format) ? metadata.format : 'jpeg';
        // 1) Resize + re-encode (tanpa enlargement) → file utama
        const bufUkur = await sharp(bufAwal, { failOn: 'none' })
          .rotate()
          .resize({ width: MAX_SISI, height: MAX_SISI, fit: 'inside', withoutEnlargement: true })
          [encFormater(formatAman)](encOptions(formatAman))
          .toBuffer();
        const lebihRingan = bufUkur.length < bufAwal.length;
        const bufTulis = lebihRingan ? bufUkur : bufAwal;
        fs.writeFile(jalur, bufTulis, async (e) => {
          if (e) return cb(e);
          // 2) Thumbnail ±400px (aspek dipertahankan, tanpa memperbesar)
          const bagian = path.parse(nama);
          const jalurThumb = path.join(DIR_UPLOAD, `${bagian.name}-thumb${bagian.ext}`);
          try {
            const bufThumb = await sharp(bufAwal, { failOn: 'none' })
              .rotate()
              .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
              [encFormater(formatAman)](encOptions(formatAman))
              .toBuffer();
            fs.writeFile(jalurThumb, bufThumb, () => {});
          } catch (errThumb) { /* thumbnail opsional, gagal => lewati */ }
          cb(null, { filename: nama, size: bufTulis.length, path: jalur });
        });
      } catch (errImg) {
        fs.writeFile(jalur, bufAwal, (e) =>
          e ? cb(e) : cb(null, { filename: nama, size: bufAwal.length, path: jalur })
        );
      }
    });
  },
  _removeFile: function (req, file, cb) {
    if (!file || !file.path) return cb(null);
    fs.unlink(file.path, (e) => {
      if (file.path) {
        const bagian = path.parse(file.path);
        fs.unlink(path.join(bagian.dir, `${bagian.name}-thumb${bagian.ext}`), () => {});
      }
      cb(e || null);
    });
  }
};
const upload = multer({ storage: sharpStorage });

// Multer khusus foto bukti tugas: validasi tipe (JPG/PNG/WebP) + maks 5 MB.
// Dipisah dari `upload` karena instance itu dipakai banyak route lain.
const uploadTugas = multer({
  storage: sharpStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    const TIPE_IZIN = ['image/jpeg', 'image/png', 'image/webp'];
    if (TIPE_IZIN.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file gambar JPG/PNG/WebP yang berlaku untuk bukti tugas'));
  }
});

// Multer khusus foto profil/ternak dari dashboard admin: validasi tipe
// (JPG/PNG/WebP) + maks 5 MB, mengikuti pola uploadTugas.
const uploadFoto = multer({
  storage: sharpStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    const TIPE_IZIN = ['image/jpeg', 'image/png', 'image/webp'];
    if (TIPE_IZIN.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Hanya file gambar JPG/PNG/WebP yang diperbolehkan'));
  }
});
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET wajib dikonfigurasi di environment.');
const app = express();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://alfilaha.id']; 

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads', {
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  }
}));

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_alfilaha'
});

const runQuery = (sql, params = []) => new Promise((resolve, reject) => {
  db.query(sql, params, (error, results) => {
    if (error) reject(error);
    else resolve(results);
  });
});

db.on('error', (error) => {
  console.error('[Database] Koneksi bermasalah:', error.message);
});

const RUN_LEGACY_DATABASE_BOOTSTRAP = false;
if (RUN_LEGACY_DATABASE_BOOTSTRAP) {
  db.connect((err) => {
  if (err) { console.error('❌ Gagal koneksi ke database:', err); return; }
  console.log('✅ Berhasil terhubung ke MySQL (db_alfilaha)');
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS reservasi (id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(100) NOT NULL, whatsapp VARCHAR(20) NOT NULL, email VARCHAR(100), instansi VARCHAR(100), tanggal VARCHAR(50) NOT NULL, jumlah VARCHAR(100) NOT NULL, pesan TEXT, status VARCHAR(20) DEFAULT 'Pending')`,
    `CREATE TABLE IF NOT EXISTS paket_wisata (id INT AUTO_INCREMENT PRIMARY KEY, nama_paket VARCHAR(100) NOT NULL, harga VARCHAR(50) NOT NULL, deskripsi TEXT, gambar VARCHAR(255))`,
    `CREATE TABLE IF NOT EXISTS events (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, category VARCHAR(100) NOT NULL, date VARCHAR(100) NOT NULL, description TEXT, image VARCHAR(255))`,
    `CREATE TABLE IF NOT EXISTS blogs (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, date VARCHAR(100) NOT NULL, excerpt TEXT, content LONGTEXT, image VARCHAR(255))`,
    `CREATE TABLE IF NOT EXISTS appointments (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, number VARCHAR(20), email VARCHAR(100) NOT NULL, address TEXT, message TEXT, status VARCHAR(20) DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS admin_users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS galeri (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, category VARCHAR(100) NOT NULL, image_url VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS pendaftar_santri (id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(255) NOT NULL, tempat_lahir VARCHAR(100) NOT NULL, tanggal_lahir DATE NOT NULL, jenis_kelamin ENUM('L', 'P') NOT NULL, alamat TEXT NOT NULL, no_wa VARCHAR(20) NOT NULL, email VARCHAR(255), username VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, status_pendaftaran ENUM('Menunggu Verifikasi', 'Diterima', 'Ditolak') DEFAULT 'Menunggu Verifikasi', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
  ,
    `CREATE TABLE IF NOT EXISTS layanan (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, image VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS tanaman (id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(255) NOT NULL, jenis VARCHAR(100), lokasi VARCHAR(255), deskripsi TEXT, gambar VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, nama_lengkap VARCHAR(100), role VARCHAR(50) DEFAULT 'user')`,
    `CREATE TABLE IF NOT EXISTS log_perawatan (id INT AUTO_INCREMENT PRIMARY KEY, tanaman_id INT NOT NULL, santri_id INT NULL, jenis_tindakan ENUM('siram', 'pupuk', 'panen') NOT NULL, nama_perawat VARCHAR(255), role_perawat VARCHAR(50), waktu_tindakan TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE, FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE SET NULL)`,
    `CREATE TABLE IF NOT EXISTS foto_perkembangan (id INT AUTO_INCREMENT PRIMARY KEY, tanaman_id INT NOT NULL, santri_id INT NOT NULL, gambar VARCHAR(255) NOT NULL, waktu_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE, FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE CASCADE)`
  ];
  
  tables.forEach(q => db.query(q, (err) => { if (err) console.error(err); }));
  
  // Update paket_wisata table if needed
  db.query("ALTER TABLE paket_wisata ADD COLUMN gambar VARCHAR(255)", (err) => {
    // Ignore error if column already exists
  });

  // ── AUTO-MIGRASI schema (idempotent, aman dijalankan ulang) ─────────────
  
  // Cek jika tabel riwayat_perawatan ada dan migrasi ke log_perawatan
  db.query("SHOW TABLES LIKE 'riwayat_perawatan'", (err, rows) => {
    if (err) { console.error('[Migrasi] cek riwayat_perawatan gagal:', err.message); return; }
    if (rows && rows.length > 0) {
      console.log('[Migrasi] Tabel riwayat_perawatan ditemukan, mencoba migrasi ke log_perawatan...');
      
      // Coba drop semua foreign key constraints yang bermasalah
      db.query("ALTER TABLE riwayat_perawatan DROP FOREIGN KEY riwayat_perawatan_ibfk_1", (err1) => {
        if (err1) console.log('[Migrasi] Tidak bisa drop riwayat_perawatan_ibfk_1:', err1.message);
        else console.log('[Migrasi] Foreign key riwayat_perawatan_ibfk_1 dihapus ✅');
      });
      
      db.query("ALTER TABLE riwayat_perawatan DROP FOREIGN KEY riwayat_perawatan_ibfk_2", (err2) => {
        if (err2) console.log('[Migrasi] Tidak bisa drop riwayat_perawatan_ibfk_2:', err2.message);
        else console.log('[Migrasi] Foreign key riwayat_perawatan_ibfk_2 dihapus ✅');
      });
      
      // Migrasi data dari riwayat_perawatan ke log_perawatan
      db.query("INSERT INTO log_perawatan (tanaman_id, santri_id, jenis_tindakan, nama_perawat, role_perawat, waktu_tindakan) SELECT tanaman_id, user_id as santri_id, jenis_aksi as jenis_tindakan, nama_perawat, role_perawat, waktu_aksi as waktu_tindakan FROM riwayat_perawatan WHERE NOT EXISTS (SELECT 1 FROM log_perawatan WHERE log_perawatan.tanaman_id = riwayat_perawatan.tanaman_id AND log_perawatan.waktu_tindakan = riwayat_perawatan.waktu_aksi)", (err3) => {
        if (err3) console.log('[Migrasi] Migrasi data gagal:', err3.message);
        else console.log('[Migrasi] Data berhasil dimigrasi dari riwayat_perawatan ke log_perawatan ✅');
      });
      
      // Drop tabel lama setelah migrasi berhasil
      setTimeout(() => {
        db.query("DROP TABLE IF EXISTS riwayat_perawatan", (err4) => {
          if (err4) console.log('[Migrasi] Tidak bisa drop tabel riwayat_perawatan:', err4.message);
          else console.log('[Migrasi] Tabel riwayat_perawatan berhasil dihapus ✅');
        });
      }, 2000);
    }
  });
  
  // Cek dan tambahkan kolom yang hilang di log_perawatan
  db.query("SHOW COLUMNS FROM log_perawatan LIKE 'nama_perawat'", (err, rows) => {
    if (err) { console.error('[Migrasi] cek nama_perawat gagal:', err.message); return; }
    if (!rows || rows.length === 0) {
      db.query("ALTER TABLE log_perawatan ADD COLUMN nama_perawat VARCHAR(255)", (err2) => {
        if (err2) console.error('[Migrasi] tambah nama_perawat gagal:', err2.message);
        else console.log('[Migrasi] log_perawatan: nama_perawat ditambah ✅');
      });
    }
  });
  
  db.query("SHOW COLUMNS FROM log_perawatan LIKE 'role_perawat'", (err, rows) => {
    if (err) { console.error('[Migrasi] cek role_perawat gagal:', err.message); return; }
    if (!rows || rows.length === 0) {
      db.query("ALTER TABLE log_perawatan ADD COLUMN role_perawat VARCHAR(50)", (err2) => {
        if (err2) console.error('[Migrasi] tambah role_perawat gagal:', err2.message);
        else console.log('[Migrasi] log_perawatan: role_perawat ditambah ✅');
      });
    }
  });
  
  // log_perawatan: kolom perawat_id → santri_id dan boleh NULL (utk internal user)
  db.query("SHOW COLUMNS FROM log_perawatan LIKE 'perawat_id'", (err, rows) => {
    if (err) { console.error('[Migrasi] cek perawat_id gagal:', err.message); return; }
    if (rows && rows.length > 0) {
      db.query("ALTER TABLE log_perawatan CHANGE perawat_id santri_id INT NULL", (err2) => {
        if (err2) console.error('[Migrasi] rename perawat_id->santri_id gagal:', err2.message);
        else console.log('[Migrasi] log_perawatan: perawat_id -> santri_id (nullable) ✅');
      });
    } else {
      // Pastikan santri_id nullable jika kolom sudah bernama santri_id
      db.query("SHOW COLUMNS FROM log_perawatan LIKE 'santri_id'", (e3, r3) => {
        if (r3 && r3.length > 0 && r3[0].Null === 'NO') {
          db.query("ALTER TABLE log_perawatan MODIFY santri_id INT NULL", (e4) => {
            if (e4) console.error('[Migrasi] santri_id nullable gagal:', e4.message);
            else console.log('[Migrasi] log_perawatan: santri_id dibuat nullable ✅');
          });
        }
      });
    }
  });

  // aktivitas_tanaman: pastikan kolom `id` (PK baru) & `aksi` ada, dgn unik (aktivitas_id, tanaman_id, aksi)
  db.query("SHOW COLUMNS FROM aktivitas_tanaman LIKE 'id'", (errAT, rowsAT) => {
    if (errAT) { console.error('[Migrasi] cek aktivitas_tanaman gagal:', errAT.message); return; }
    if (!rowsAT || rowsAT.length === 0) {
      const step1 = () => {
        db.query("ALTER TABLE aktivitas_tanaman ADD COLUMN aksi VARCHAR(50) NULL", (e1) => {
          if (e1 && !String(e1.message).includes('Duplicate')) console.error('[Migrasi] tambah aksi gagal:', e1.message);
        });
      };
      db.query("SHOW COLUMNS FROM aktivitas_tanaman LIKE 'aksi'", (eA, rA) => {
        if (eA) return;
        if (!rA || rA.length === 0) step1();
        // Index pendukung FK agar DROP PRIMARY KEY diperbolehkan
        db.query("SHOW INDEX FROM aktivitas_tanaman WHERE Key_name='idx_at_aktivitas'", (eI1, rI1) => {
          if (eI1) return;
          if (!rI1 || rI1.length === 0) db.query("ALTER TABLE aktivitas_tanaman ADD INDEX idx_at_aktivitas (aktivitas_id)", () => {});
        });
        db.query("SHOW INDEX FROM aktivitas_tanaman WHERE Key_name='idx_at_tanaman'", (eI2, rI2) => {
          if (eI2) return;
          if (!rI2 || rI2.length === 0) db.query("ALTER TABLE aktivitas_tanaman ADD INDEX idx_at_tanaman (tanaman_id)", () => {});
        });
        db.query("ALTER TABLE aktivitas_tanaman DROP PRIMARY KEY, ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST", (e2) => {
          if (e2) console.error('[Migrasi] ganti PK aktivitas_tanaman gagal:', e2.message);
          else {
            console.log('[Migrasi] aktivitas_tanaman: PK baru id auto_increment ✅');
            db.query("ALTER TABLE aktivitas_tanaman ADD UNIQUE INDEX uq_aktivitas_tanaman_aksi (aktivitas_id, tanaman_id, aksi)", (e3) => {
              if (e3 && !String(e3.message).includes('Duplicate')) console.error('[Migrasi] unik aksi gagal:', e3.message);
            });
          }
        });
      });
    } else {
      // kolom `id` sudah ada → tidak perlu migrasi
    }
  });
  db.query("SHOW COLUMNS FROM aktivitas_tanaman LIKE 'aksi'", (errAksi, rAksi) => {
    if (errAksi || !rAksi || rAksi.length === 0) {
      db.query("ALTER TABLE aktivitas_tanaman ADD COLUMN aksi VARCHAR(50) NULL", (e1) => {
        if (e1 && !String(e1.message).includes('Duplicate')) console.error('[Migrasi] tambah aksi (2) gagal:', e1.message);
      });
    }
  });

  // log_perawatan: pastikan kolom jadwal_id & laporan_singkat ada
  db.query("SHOW COLUMNS FROM log_perawatan LIKE 'jadwal_id'", (errJ, rowsJ) => {
    if (errJ) { console.error('[Migrasi] cek jadwal_id gagal:', errJ.message); return; }
    if (!rowsJ || rowsJ.length === 0) {
      db.query("ALTER TABLE log_perawatan ADD COLUMN jadwal_id INT NULL, ADD COLUMN laporan_singkat TEXT NULL", (e) => {
        if (e) console.error('[Migrasi] tambah jadwal_id/laporan_singkat gagal:', e.message);
        else console.log('[Migrasi] log_perawatan: jadwal_id & laporan_singkat ditambah ✅');
      });
    }
  });
  db.query("SHOW COLUMNS FROM log_perawatan LIKE 'laporan_singkat'", (errL, rowsL) => {
    if (errL) return;
    if (!rowsL || rowsL.length === 0) {
      db.query("ALTER TABLE log_perawatan ADD COLUMN laporan_singkat TEXT NULL", (e) => {
        if (!e) console.log('[Migrasi] log_perawatan: laporan_singkat ditambah ✅');
      });
    }
  });

  // admin_users: pastikan kolom nama_lengkap & role ada
  db.query("SHOW COLUMNS FROM admin_users LIKE 'nama_lengkap'", (err, rows) => {
    if (err) return;
    if (!rows || rows.length === 0) {
      db.query("ALTER TABLE admin_users ADD COLUMN nama_lengkap VARCHAR(100), ADD COLUMN role VARCHAR(50) DEFAULT 'Petugas'", (err2) => {
        if (err2) console.error('[Migrasi] tambah kolom admin_users gagal:', err2.message);
        else console.log('[Migrasi] admin_users: ditambah nama_lengkap & role ✅');
      });
    }
  });

  // pendaftar_santri: pastikan kolom kelas & kamar ada (untuk pemilih Santri Penerima)
  db.query("SHOW COLUMNS FROM pendaftar_santri LIKE 'kelas'", (err, rows) => {
    if (err) { console.error('[Migrasi] cek kolom kelas gagal:', err.message); return; }
    if (!rows || rows.length === 0) {
      db.query("ALTER TABLE pendaftar_santri ADD COLUMN kelas VARCHAR(100) NULL", (err2) => {
        if (err2) console.error('[Migrasi] tambah kolom kelas gagal:', err2.message);
        else console.log('[Migrasi] pendaftar_santri: kolom kelas ditambah ✅');
      });
    }
  });
  db.query("SHOW COLUMNS FROM pendaftar_santri LIKE 'kamar'", (err, rows) => {
    if (err) { console.error('[Migrasi] cek kolom kamar gagal:', err.message); return; }
    if (!rows || rows.length === 0) {
      db.query("ALTER TABLE pendaftar_santri ADD COLUMN kamar VARCHAR(100) NULL", (err2) => {
        if (err2) console.error('[Migrasi] tambah kolom kamar gagal:', err2.message);
        else console.log('[Migrasi] pendaftar_santri: kolom kamar ditambah ✅');
      });
    }
  });

  // Dev aid: log jumlah santri per status saat server start
  db.query("SELECT status_pendaftaran, COUNT(*) AS c FROM pendaftar_santri GROUP BY status_pendaftaran", (errLog, rowsLog) => {
    if (errLog) { console.error('[Startup] Gagal hitung statusSantri:', errLog.message); return; }
    console.log('[Startup] Santri per status:', (rowsLog || []).map(r => `${r.status_pendaftaran}=${r.c}`).join(' | ') || 'kosong');
  });
  });
}

app.get('/api/test', async (req, res) => {
  try {
    await runQuery('SELECT 1 AS ready');
    res.json({ status: 'ok', database: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'unavailable', error: error.message });
  }
});

// Test endpoint khusus jadwal
app.get('/api/jadwal-test', (req, res, next) => authenticateAdminToken(req, res, next), (req, res) => {
  db.query('SHOW TABLES LIKE "activity_schedules"', (err, r1) => {
    db.query('SHOW TABLES LIKE "activity_tasks"', (err2, r2) => {
      db.query('SELECT COUNT(*) as c FROM pendaftar_santri', (err3, r3) => {
        res.json({
          activity_schedules_exists: r1 && r1.length > 0,
          activity_tasks_exists: r2 && r2.length > 0,
          total_santri: r3 && r3[0] ? r3[0].c : 0,
          server: 'OK'
        });
      });
    });
  });
});

// ==========================================
// API PENDAFTARAN SANTRI
// ==========================================
app.post("/api/pendaftaran", async (req, res, next) => {
  try {
    const {
      nama,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      no_wa,
      email,
      username,
      password,
      confirm_password,
      program_id,
      terms1,
      terms2
    } = req.body;
    const programId = Number.parseInt(String(program_id || ''), 10);

    if (![nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_wa, username, password].every((value) => String(value || '').trim())) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }
    if (!Number.isInteger(programId) || programId <= 0) {
      return res.status(400).json({ message: 'Program pendaftaran wajib dipilih.' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Konfirmasi password tidak sama.' });
    }
    if (terms1 !== true || terms2 !== true) {
      return res.status(400).json({ message: 'Persetujuan pernyataan dan syarat & ketentuan wajib disetujui.' });
    }

    const existingUsers = await runQuery('SELECT id FROM pendaftar_santri WHERE username = ?', [username]);
    if (existingUsers.length) return res.status(400).json({ message: 'Username sudah digunakan.' });

    const availablePrograms = await runQuery(
      "SELECT id FROM program_pendaftaran WHERE id = ? AND status = 'aktif' AND batas_akhir >= CURDATE()",
      [programId]
    );
    if (!availablePrograms.length) return res.status(400).json({ message: 'Program pendaftaran tidak tersedia.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await runQuery(
      `INSERT INTO pendaftar_santri
        (nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_wa, email, username, password, program_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_wa, email, username, hashedPassword, programId]
    );
    const token = jwt.sign(
      { id: result.insertId, username, kind: 'santri' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    return res.status(201).json({
      message: 'Pendaftaran Berhasil',
      token,
      user: {
        id: result.insertId,
        nama,
        username,
        program_id: programId,
        role: 'Santri',
        status: 'Menunggu Verifikasi',
        status_pendaftaran: 'Menunggu Verifikasi'
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username sudah digunakan.' });
    }
    return next(error);
  }
});

// LOGIN SANTRI
app.post("/api/pendaftaran/login", (req, res) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM pendaftar_santri WHERE username = ?", [username], async (err, results) => {
    if (err) return res.status(500).json({ message: "Terjadi kesalahan server saat login." });
    if (results.length === 0) return res.status(401).json({ message: "Username tidak ditemukan!" });
    
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Password salah!" });
    
    const token = jwt.sign({ id: user.id, username: user.username, kind: 'santri' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ 
      message: "Login berhasil", 
      token, 
      user: { 
        id: user.id, 
        nama: user.nama, 
        username: user.username, 
        role: 'Santri',
        status: user.status_pendaftaran, 
        status_pendaftaran: user.status_pendaftaran 
      } 
    });
  });
});

const verifyToken = (token, cb) => {
  if (!token || typeof token !== 'string') return cb(null);
  jwt.verify(token, JWT_SECRET, (error, payload) => {
    if (error || !payload || !payload.id) return cb(null);
    const role = typeof payload.role === 'string' ? payload.role.trim().toLowerCase() : '';
    const rawKind = payload.kind || (role === 'admin' ? 'admin' : role === 'santri' ? 'santri' : null);
    const kind = typeof rawKind === 'string' ? rawKind.trim().toLowerCase() : null;
    if (!['santri', 'internal', 'admin'].includes(kind)) {
      const hasRoleClaim = Object.prototype.hasOwnProperty.call(payload, 'role');
      const hasKindClaim = Object.prototype.hasOwnProperty.call(payload, 'kind');
      if (!hasRoleClaim && !hasKindClaim) {
        return cb({ ...payload, kind: null, legacyAdminCandidate: true });
      }
      return cb(null);
    }
    return cb({ ...payload, kind });
  });
};

const authenticateSantriToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Akses ditolak. Belum login.' });

  verifyToken(token, (payload) => {
    if (!payload || !['santri', 'internal', 'admin'].includes(payload.kind)) {
      return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
    }

    if (payload.kind === 'santri') {
      db.query(
        'SELECT id, nama, username, status_pendaftaran FROM pendaftar_santri WHERE id = ? AND username = ?',
        [payload.id, payload.username],
        (error, results) => {
          if (error) return res.status(500).json({ message: 'Terjadi kesalahan database.' });
          if (!results.length) return res.status(404).json({ message: 'User tidak ditemukan.' });
          const student = results[0];
          req.user = {
            id: student.id,
            nama: student.nama,
            username: student.username,
            role: 'Santri',
            status: student.status_pendaftaran,
            status_pendaftaran: student.status_pendaftaran,
            userType: 'santri'
          };
          return next();
        }
      );
      return;
    }

    if (payload.kind === 'internal') {
      db.query(
        'SELECT id, username, nama_lengkap, role, status FROM users WHERE id = ? AND username = ?',
        [payload.id, payload.username],
        (error, results) => {
          if (error) return res.status(500).json({ message: 'Terjadi kesalahan database.' });
          if (!results.length) return res.status(404).json({ message: 'User tidak ditemukan.' });
          const internal = results[0];
          if (internal.status !== 'approved') return res.status(403).json({ message: 'Akun belum disetujui.' });
          req.user = {
            id: internal.id,
            username: internal.username,
            nama: internal.nama_lengkap || internal.username,
            role: internal.role,
            status: internal.status,
            status_pendaftaran: 'Diterima',
            userType: 'internal'
          };
          return next();
        }
      );
      return;
    }

    db.query(
      'SELECT id, username, nama_lengkap, role FROM admin_users WHERE id = ? AND username = ?',
      [payload.id, payload.username],
      (error, results) => {
        if (error) return res.status(500).json({ message: 'Terjadi kesalahan database.' });
        if (!results.length) return res.status(404).json({ message: 'Admin tidak ditemukan.' });
        const admin = results[0];
        req.user = {
          id: admin.id,
          username: admin.username,
          nama: admin.nama_lengkap || admin.username,
          role: 'admin',
          status: 'Diterima',
          status_pendaftaran: 'Diterima',
          userType: 'admin'
        };
        return next();
      }
    );
  });
};

// Middleware admin: hanya token dari admin_users yang boleh lewat
const authenticateAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Akses ditolak. Belum login.' });

  verifyToken(token, (payload) => {
    if (!payload || (payload.kind !== 'admin' && payload.legacyAdminCandidate !== true)) {
      return res.status(403).json({ message: 'Akses ditolak. Endpoint ini khusus admin.' });
    }

    db.query(
      'SELECT id, username, nama_lengkap, role FROM admin_users WHERE id = ? AND username = ?',
      [payload.id, payload.username],
      (error, results) => {
        if (error) return res.status(500).json({ message: 'Terjadi kesalahan database.' });
        if (!results.length) return res.status(403).json({ message: 'Akses ditolak. Endpoint ini khusus admin.' });
        const admin = results[0];
        req.user = {
          id: admin.id,
          username: admin.username,
          nama: admin.nama_lengkap || admin.username,
          role: 'admin',
          status: 'Diterima',
          userType: 'admin'
        };
        return next();
      }
    );
  });
};

const authenticateIdentity = authenticateSantriToken;

// GET identitas akun yang sedang login (santri maupun admin)
app.get('/api/me', authenticateIdentity, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    nama: req.user.nama,
    role: req.user.role,
    status: req.user.status,
    status_pendaftaran: req.user.status_pendaftaran
  });
});

// Middleware to validate santri status for care actions
const validateSantriStatus = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Akses ditolak. Belum login." });
  
  if (req.user.status_pendaftaran !== 'Diterima') {
    return res.status(403).json({ 
      message: "Maaf, Anda belum diterima sebagai santri. Silakan tunggu konfirmasi dari admin.",
      status: req.user.status_pendaftaran
    });
  }
  
  next();
};

app.get("/api/pendaftaran/status", authenticateSantriToken, (req, res) => {
  if (req.user.userType !== 'santri') return res.status(403).json({ message: 'Endpoint ini khusus akun santri.' });
  const sql = "SELECT id, nama, tempat_lahir, DATE_FORMAT(tanggal_lahir, '%Y-%m-%d') as tanggal_lahir, jenis_kelamin, alamat, no_wa, email, username, status_pendaftaran FROM pendaftar_santri WHERE id = ?";
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Terjadi kesalahan." });
    if (results.length === 0) return res.status(404).json({ message: "Data tidak ditemukan." });
    res.json(results[0]);
  });
});

app.get('/api/pendaftar_santri', authenticateAdminToken, (req, res) => {
  db.query(
    `SELECT p.id, p.nama, p.tempat_lahir, p.tanggal_lahir, p.jenis_kelamin,
            p.alamat, p.no_wa, p.email, p.username, p.kelas, p.kamar,
            p.status_pendaftaran, p.program_id, p.created_at,
            pr.judul AS program_judul, pr.nama AS program_nama
       FROM pendaftar_santri p
       LEFT JOIN program_pendaftaran pr ON pr.id = p.program_id
      ORDER BY p.id DESC`,
    (error, results) => {
      if (error) return res.status(500).json({ message: 'Gagal mengambil data pendaftar.' });
      return res.json(results);
    }
  );
});
app.put('/api/pendaftar_santri/:id/status', authenticateAdminToken, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const status = String(req.body?.status || '').trim();
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'ID pendaftar tidak valid.' });
  if (!['Menunggu Verifikasi', 'Diterima', 'Ditolak'].includes(status)) {
    return res.status(400).json({ message: 'Status pendaftar tidak valid.' });
  }
  db.query(
    'UPDATE pendaftar_santri SET status_pendaftaran = ? WHERE id = ?',
    [status, id],
    (error, result) => {
      if (error) return res.status(500).json({ message: 'Gagal memperbarui status pendaftar.' });
      if (!result.affectedRows) return res.status(404).json({ message: 'Pendaftar tidak ditemukan.' });
      return res.json({ message: 'Berhasil' });
    }
  );
});
app.delete('/api/pendaftar_santri/:id', authenticateAdminToken, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'ID pendaftar tidak valid.' });
  db.query('DELETE FROM pendaftar_santri WHERE id = ?', [id], (error, result) => {
    if (error) return res.status(500).json({ message: 'Gagal menghapus pendaftar.' });
    if (!result.affectedRows) return res.status(404).json({ message: 'Pendaftar tidak ditemukan.' });
    return res.json({ message: 'Berhasil' });
  });
});

// GALERI
const GALERI_CATEGORIES = [
  'Lahan Pertanian',
  'Kegiatan Santri',
  'Edukasi',
  'Panen',
  'Camping',
  'Kegiatan Masyarakat',
];

// Hapus file gambar di ./uploads (dipakai saat ganti/hapus foto agar tidak ada file sisa)
const removeUpload = (filename) => {
  if (!filename) return;
  try {
    const filepath = path.join(DIR_UPLOAD, path.basename(filename));
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log('🗑️ File gambar dihapus:', filepath);
    }
  } catch (error) {
    console.error('Gagal menghapus file gambar:', error.message);
  }
};

app.get('/api/galeri', (req, res) => {
  db.query("SELECT * FROM galeri ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post('/api/galeri', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, description, category } = req.body || {};
  const image_url = req.file ? req.file.filename : null;

  if (!image_url) return res.status(400).json({ error: 'Gambar wajib diunggah' });
  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Judul wajib diisi' });
  if (!GALERI_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Kategori tidak valid' });

  db.query("INSERT INTO galeri (title, description, category, image_url) VALUES (?, ?, ?, ?)", [String(title).trim(), description || null, category, image_url], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Foto berhasil ditambahkan', id: results?.insertId });
  });
});

// Ubah Foto Galeri (gambar opsional — bila tidak dikirim, gambar lama dipertahankan)
app.put('/api/galeri/:id', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, description, category } = req.body || {};

  if (!title || !String(title).trim()) return res.status(400).json({ error: 'Judul wajib diisi' });
  if (!GALERI_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Kategori tidak valid' });

  db.query('SELECT image_url FROM galeri WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Foto tidak ditemukan' });

    const oldImage = rows[0].image_url;
    const newImage = req.file ? req.file.filename : null;
    // Hanya sentuh kolom description bila memang dikirim, supaya deskripsi lama tidak ikut terhapus
    const hasDescription = Object.prototype.hasOwnProperty.call(req.body, 'description');

    const finish = (err, imageUrl) => {
      if (err) {
        // Bila update gagal tapi file baru sudah tersimpan, jangan biarkan file yatim
        if (newImage) removeUpload(newImage);
        return res.status(500).json({ error: err.message });
      }
      if (newImage) removeUpload(oldImage);
      res.json({ message: 'Foto berhasil diperbarui', image_url: imageUrl });
    };

    if (newImage) {
      db.query(
        'UPDATE galeri SET title = ?, category = ?, image_url = ? WHERE id = ?',
        [String(title).trim(), category, newImage, req.params.id],
        (err) => finish(err, newImage),
      );
    } else if (hasDescription) {
      db.query(
        'UPDATE galeri SET title = ?, description = ?, category = ? WHERE id = ?',
        [String(title).trim(), description || null, category, req.params.id],
        (err) => finish(err, oldImage),
      );
    } else {
      db.query(
        'UPDATE galeri SET title = ?, category = ? WHERE id = ?',
        [String(title).trim(), category, req.params.id],
        (err) => finish(err, oldImage),
      );
    }
  });
});

app.delete('/api/galeri/:id', authenticateAdminToken, (req, res) => {
  db.query('SELECT image_url FROM galeri WHERE id = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Foto tidak ditemukan, mungkin sudah dihapus' });
    }

    const imageUrl = rows[0].image_url;
    db.query('DELETE FROM galeri WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      removeUpload(imageUrl);
      res.json({ message: 'Foto berhasil dihapus' });
    });
  });
});

// RESERVASI
app.get('/api/reservasi', authenticateAdminToken, (req, res) => {
  db.query("SELECT * FROM reservasi ORDER BY id DESC", (err, results) => {
    res.json(results);
  });
});
app.post('/api/reservasi', (req, res) => {
  const { nama, whatsapp, email, instansi, tanggal, jumlah, pesan } = req.body;
  db.query("INSERT INTO reservasi (nama, whatsapp, email, instansi, tanggal, jumlah, pesan) VALUES (?, ?, ?, ?, ?, ?, ?)", [nama, whatsapp, email, instansi, tanggal, jumlah, pesan], () => {
    res.json({ message: "Berhasil" });
  });
});
app.put('/api/reservasi/:id/status', authenticateAdminToken, (req, res) => {
  db.query("UPDATE reservasi SET status = ? WHERE id = ?", [req.body.status, req.params.id], () => {
    res.json({ message: "Berhasil" });
  });
});
app.delete('/api/reservasi/:id', authenticateAdminToken, (req, res) => {
  db.query("DELETE FROM reservasi WHERE id = ?", [req.params.id], () => {
    res.json({ message: "Berhasil" });
  });
});

// PAKET WISATA
app.get('/api/paket', (req, res) => {
  db.query("SELECT * FROM paket_wisata", (err, results) => {
    res.json(results);
  });
});
app.put('/api/paket/:id', authenticateAdminToken, upload.single('gambar'), (req, res) => {
  const { nama_paket, harga, deskripsi } = req.body;
  if (req.file) {
    db.query("UPDATE paket_wisata SET nama_paket = ?, harga = ?, deskripsi = ?, gambar = ? WHERE id = ?", [nama_paket, harga, deskripsi, req.file.filename, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  } else {
    db.query("UPDATE paket_wisata SET nama_paket = ?, harga = ?, deskripsi = ? WHERE id = ?", [nama_paket, harga, deskripsi, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  }
});
app.post('/api/paket', authenticateAdminToken, upload.single('gambar'), (req, res) => {
  const { nama_paket, harga, deskripsi } = req.body;
  const gambar = req.file ? req.file.filename : null;
  db.query("INSERT INTO paket_wisata (nama_paket, harga, deskripsi, gambar) VALUES (?, ?, ?, ?)", [nama_paket, harga, deskripsi, gambar], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil" });
  });
});
app.delete('/api/paket/:id', authenticateAdminToken, (req, res) => {
  db.query("DELETE FROM paket_wisata WHERE id = ?", [req.params.id], () => {
    res.json({ message: "Berhasil" });
  });
});

// EVENTS
app.get('/api/events', (req, res) => {
  db.query("SELECT * FROM events ORDER BY id DESC", (err, results) => {
    res.json(results);
  });
});
app.post('/api/events', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, category, date, description } = req.body;
  db.query("INSERT INTO events (title, category, date, description, image) VALUES (?, ?, ?, ?, ?)", [title, category, date, description, req.file ? req.file.filename : null], () => {
    res.json({ message: "Berhasil" });
  });
});
app.put('/api/events/:id', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, category, date, description } = req.body;
  if (req.file) {
    db.query("UPDATE events SET title=?, category=?, date=?, description=?, image=? WHERE id=?", [title, category, date, description, req.file.filename, req.params.id], () => {
      res.json({ message: "Berhasil" });
    });
  } else {
    db.query("UPDATE events SET title=?, category=?, date=?, description=? WHERE id=?", [title, category, date, description, req.params.id], () => {
      res.json({ message: "Berhasil" });
    });
  }
});
app.delete('/api/events/:id', authenticateAdminToken, (req, res) => {
  db.query("DELETE FROM events WHERE id = ?", [req.params.id], () => {
    res.json({ message: "Berhasil" });
  });
});

// BLOGS
app.get('/api/blogs', (req, res) => {
  db.query("SELECT * FROM blogs ORDER BY id DESC", (err, results) => {
    res.json(results);
  });
});
app.post('/api/blogs', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, date, excerpt, content } = req.body;
  const image = req.file ? req.file.filename : null;
  db.query("INSERT INTO blogs (title, date, excerpt, content, image) VALUES (?, ?, ?, ?, ?)", [title, date, excerpt, content, image], () => {
    res.json({ message: "Berhasil" });
  });
});
app.put('/api/blogs/:id', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, date, excerpt, content } = req.body;
  if (req.file) {
    db.query("UPDATE blogs SET title=?, date=?, excerpt=?, content=?, image=? WHERE id=?", [title, date, excerpt, content, req.file.filename, req.params.id], () => {
      res.json({ message: "Berhasil" });
    });
  } else {
    db.query("UPDATE blogs SET title=?, date=?, excerpt=?, content=? WHERE id=?", [title, date, excerpt, content, req.params.id], () => {
      res.json({ message: "Berhasil" });
    });
  }
});
app.delete('/api/blogs/:id', authenticateAdminToken, (req, res) => {
  db.query("DELETE FROM blogs WHERE id = ?", [req.params.id], () => {
    res.json({ message: "Berhasil" });
  });
});


// LAYANAN
app.get('/api/layanan', (req, res) => {
  db.query("SELECT * FROM layanan ORDER BY id DESC", (err, results) => {
    res.json(results);
  });
});

app.get('/api/layanan/:id', (req, res) => {
  db.query("SELECT * FROM layanan WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(results[0]);
  });
});
app.post('/api/layanan', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;
  db.query("INSERT INTO layanan (title, description, image) VALUES (?, ?, ?)", [title, description, image], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil" });
  });
});
app.put('/api/layanan/:id', authenticateAdminToken, upload.single('image'), (req, res) => {
  const { title, description } = req.body;
  if (req.file) {
    db.query("UPDATE layanan SET title=?, description=?, image=? WHERE id=?", [title, description, req.file.filename, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  } else {
    db.query("UPDATE layanan SET title=?, description=? WHERE id=?", [title, description, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  }
});
app.delete('/api/layanan/:id', authenticateAdminToken, (req, res) => {
  db.query("DELETE FROM layanan WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil" });
  });
});

// APPOINTMENTS
app.get('/api/appointments', authenticateAdminToken, (req, res) => {
  db.query("SELECT * FROM appointments ORDER BY id DESC", (err, results) => {
    res.json(results);
  });
});
app.post('/api/appointments', (req, res) => {
  const { name, number, email, address, message } = req.body;
  db.query("INSERT INTO appointments (name, number, email, address, message) VALUES (?, ?, ?, ?, ?)", [name, number, email, address, message], () => {
    res.json({ message: "Berhasil" });
  });
});
app.put('/api/appointments/:id/status', authenticateAdminToken, (req, res) => {
  db.query("UPDATE appointments SET status = ? WHERE id = ?", [req.body.status, req.params.id], () => {
    res.json({ message: "Berhasil" });
  });
});
app.delete('/api/appointments/:id', authenticateAdminToken, (req, res) => {
  db.query("DELETE FROM appointments WHERE id = ?", [req.params.id], () => {
    res.json({ message: "Berhasil" });
  });
});

// TANAMAN
// Aksi perawatan global (siram/pupuk/panen). Jika nanti butuh aksi khusus per tanaman,
// bisa ditambahkan tabel aksi_perawatan; untuk sekarang dipakai 3 aksi default ini.
const AKSI_PERAWATAN = ['siram', 'pupuk', 'panen'];

app.get('/api/tanaman', (req, res) => {
  db.query(
    "SELECT t.*, l.nama AS nama_lokasi FROM tanaman t LEFT JOIN lokasi l ON l.id = t.lokasi_id ORDER BY t.id DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});
app.get('/api/tanaman/:id', (req, res) => {
  db.query("SELECT * FROM tanaman WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(results[0]);
  });
});
// Daftar aksi perawatan yang tersedia untuk sebuah tanaman (default global)
app.get('/api/tanaman/:id/aksi', (req, res) => {
  db.query("SELECT id FROM tanaman WHERE id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ message: "Tanaman tidak ditemukan" });
    res.json({ aksi: AKSI_PERAWATAN });
  });
});
app.post('/api/tanaman', authenticateAdminToken, upload.single('gambar'), (req, res) => {
  const { nama, jenis, lokasi, lokasi_id, deskripsi } = req.body;
  const gambar = req.file ? req.file.filename : null;
  const lid = lokasi_id ? parseInt(String(lokasi_id).trim(), 10) : null;
  db.query("INSERT INTO tanaman (nama, jenis, lokasi, lokasi_id, deskripsi, gambar) VALUES (?, ?, ?, ?, ?, ?)",
    [nama, jenis, lokasi, Number.isFinite(lid) ? lid : null, deskripsi, gambar], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil", id: results.insertId });
  });
});
app.put('/api/tanaman/:id', authenticateAdminToken, upload.single('gambar'), (req, res) => {
  const { nama, jenis, lokasi, lokasi_id, deskripsi } = req.body;
  const lid = lokasi_id ? parseInt(String(lokasi_id).trim(), 10) : null;
  const lokasiIdFixed = Number.isFinite(lid) ? lid : null;
  if (req.file) {
    db.query("UPDATE tanaman SET nama=?, jenis=?, lokasi=?, lokasi_id=?, deskripsi=?, gambar=? WHERE id=?",
      [nama, jenis, lokasi, lokasiIdFixed, deskripsi, req.file.filename, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  } else {
    db.query("UPDATE tanaman SET nama=?, jenis=?, lokasi=?, lokasi_id=?, deskripsi=? WHERE id=?",
      [nama, jenis, lokasi, lokasiIdFixed, deskripsi, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil" });
    });
  }
});
app.delete('/api/tanaman/:id', authenticateAdminToken, (req, res) => {
  db.query("DELETE FROM tanaman WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil" });
  });
});

// ── PETERNAKAN (Koleksi Ternak) ─────────────────────────────────────────────
// Daftar aksi perawatan ternak TIDAK di-hardcode: diambil dari master_aksi_ternak,
// sehingga menambah/mengubah aksi cukup lewat database tanpa ubah kode program.
const BULAN_PENDEK = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const JAM_PENANDA = {
  'Beri Pakan Pagi': '± 07.00',
  'Beri Pakan Sore': '± 17.00',
};

function resolusiJenisTernak(jenisSlug, cb) {
  if (!jenisSlug) return cb('Jenis ternak diperlukan');
  db.query(
    `SELECT jt.id, jt.nama, jt.kategori,
            t.id AS ternak_id, t.nama_tampilan, t.status_publikasi, t.total, t.total_mati, t.lokasi_id, t.foto, t.deskripsi,
            l.nama AS lokasi
       FROM jenis_ternak jt
       JOIN ternak t ON t.jenis_ternak_id = jt.id
       LEFT JOIN lokasi l ON l.id = t.lokasi_id
      WHERE LOWER(jt.nama) = LOWER(?)`,
    [String(jenisSlug).trim()],
    (err, rows) => {
      if (err) return cb(null, err);
      if (!rows || !rows.length) return cb(null, null);
      cb(rows[0]);
    }
  );
}

// GET /api/ternak — daftar ternak yang DIPUBLIKASIKAN (halaman index Koleksi Ternak)
app.get('/api/ternak', (req, res) => {
  db.query(
    `SELECT t.id, t.jenis_ternak_id, t.status_publikasi, t.total, t.total_mati, t.foto, t.deskripsi,
            jt.nama AS nama, COALESCE(NULLIF(t.nama_tampilan,''), jt.nama) AS nama_tampilan,
            jt.nama AS jenis, jt.kategori, jt.keterangan,
            l.nama AS lokasi, l.id AS lokasi_id,
            (SELECT COUNT(*) FROM master_aksi_ternak m WHERE m.jenis_ternak_id = jt.id AND m.aktif = 1) AS jumlah_aksi
       FROM ternak t
       JOIN jenis_ternak jt ON jt.id = t.jenis_ternak_id
       LEFT JOIN lokasi l ON l.id = t.lokasi_id
      WHERE jt.aktif = 1 AND t.status_publikasi = 'dipublikasikan'
      ORDER BY jt.id ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// GET /api/ternak/:jenis — detail satu jenis (statistik + daftar aksi perawatan).
// Hanya bisa diakses publik kalau status_publikasi = 'dipublikasikan'; draft → 404.
app.get('/api/ternak/:jenis', (req, res) => {
  resolusiJenisTernak(req.params.jenis, (row, err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Jenis ternak tidak ditemukan' });
    if (row.status_publikasi !== 'dipublikasikan') {
      return res.status(404).json({ message: 'Jenis ternak tidak ditemukan' });
    }
    db.query(
      `SELECT m.id, m.nama_aksi, m.sub_aksi, m.butuh_input_angka, m.label_input, m.urutan,
              m.batas_harian,
              (SELECT COUNT(*) FROM log_perawatan_ternak lp
                 WHERE lp.ternak_id = ? AND lp.master_aksi_id = m.id) AS jumlah,
              (SELECT COUNT(*) FROM log_perawatan_ternak lh
                 WHERE lh.ternak_id = ? AND lh.master_aksi_id = m.id
                   AND lh.created_at >= CURDATE()) AS jumlah_hari_ini
         FROM master_aksi_ternak m
        WHERE m.jenis_ternak_id = ? AND m.aktif = 1
        ORDER BY m.urutan ASC, m.id ASC`,
      [row.ternak_id, row.ternak_id, row.id],
      (err2, aksi) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({
          ...row,
          id: row.ternak_id,
          jenis_ternak_id: row.id,
          judul: (row.nama_tampilan && String(row.nama_tampilan).trim())
            ? row.nama_tampilan
            : row.nama,
          aksi: (aksi || []).map((a) => ({
            ...a,
            jam_penanda: JAM_PENANDA[a.nama_aksi] || null,
            label: a.sub_aksi ? `${a.nama_aksi} (${a.sub_aksi})` : a.nama_aksi,
          })),
        });
      }
    );
  });
});

// GET /api/ternak/:jenis/riwayat — riwayat perawatan (publik, tanpa login).
// Konsisten dgn detail: draft → 404.
app.get('/api/ternak/:jenis/riwayat', (req, res) => {
  resolusiJenisTernak(req.params.jenis, (row, err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Jenis ternak tidak ditemukan' });
    if (row.status_publikasi !== 'dipublikasikan') {
      return res.status(404).json({ message: 'Jenis ternak tidak ditemukan' });
    }
    db.query(
      `SELECT lpr.id, lpr.catatan, lpr.foto, lpr.nilai_angka, lpr.created_at,
              lpr.nama_perawat, lpr.role_perawat, lpr.jadwal_id, lpr.aktivitas_id,
              m.nama_aksi, m.sub_aksi, m.butuh_input_angka, m.label_input,
              s.nama AS nama_santri,
              sch.nama_aktivitas AS nama_aktivitas
         FROM log_perawatan_ternak lpr
         JOIN master_aksi_ternak m ON m.id = lpr.master_aksi_id
         LEFT JOIN pendaftar_santri s ON s.id = lpr.diinput_oleh
         LEFT JOIN activity_schedules sch ON sch.id = lpr.aktivitas_id
        WHERE lpr.ternak_id = ?
        ORDER BY lpr.created_at DESC
        LIMIT 200`,
      [row.ternak_id],
      (err2, logs) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json((logs || []).map((log) => ({
          ...log,
          label: log.sub_aksi ? `${log.nama_aksi} (${log.sub_aksi})` : log.nama_aksi,
          jenis_tindakan: (log.nama_aksi || '').toLowerCase(),
        })));
      }
    );
  });
});

// Helper auth untuk aksi ternak — mirip pola POST /api/tanaman/:id/aksi.
// POST /api/ternak/:jenis/aksi — konfirmasi perawatan ternak.
// Aksi "butuh_input_angka" (misal Konfirmasi Ayam Mati) otomatis
// mengurangi `total` & menambah `total_mati` pada tabel `ternak`.
app.post('/api/ternak/:jenis/aksi', uploadFoto.single('foto'), authenticateSantriToken, (req, res) => {
  const perawat = {
    id: req.user.userType === 'santri' ? req.user.id : null,
    nama: req.user.nama || req.user.nama_lengkap || req.user.username || 'Petugas',
    role: req.user.userType === 'santri' ? 'Santri' : (req.user.role || 'Petugas'),
  };
  if (req.user.userType === 'santri' && req.user.status_pendaftaran !== 'Diterima') {
    return res.status(403).json({
      message: 'Maaf, Anda belum diterima sebagai santri. Silakan tunggu konfirmasi dari admin.',
      status: req.user.status_pendaftaran,
    });
  }
  const { master_aksi_id, catatan, nilai_angka, jadwal_id, aktivitas_id } = req.body;
  resolusiJenisTernak(req.params.jenis, (row, err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Jenis ternak tidak ditemukan' });
    if (row.status_publikasi !== 'dipublikasikan') {
      return res.status(404).json({ message: 'Jenis ternak tidak ditemukan' });
    }

    const mid = parseInt(String(master_aksi_id).trim(), 10);
    if (!Number.isFinite(mid) || mid <= 0) {
      return res.status(400).json({ error: 'master_aksi_id wajib diisi.' });
    }

    db.query(
      `SELECT m.id, m.nama_aksi, m.sub_aksi, m.butuh_input_angka, m.label_input,
              m.batas_harian
         FROM master_aksi_ternak m
        WHERE m.id = ? AND m.jenis_ternak_id = ? AND m.aktif = 1`,
      [mid, row.id],
      (errM, mRows) => {
        if (errM) return res.status(500).json({ error: errM.message });
        if (!mRows || !mRows.length) {
          return res.status(400).json({ error: 'Aksi tidak tersedia untuk jenis ternak ini.' });
        }
        const aksi = mRows[0];
        const butuhAngka = !!aksi.butuh_input_angka;

        let nilaiFinal = null;
        if (butuhAngka) {
          const angka = parseInt(String(nilai_angka).trim(), 10);
          if (!Number.isFinite(angka) || angka <= 0) {
            return res.status(400).json({ error: aksi.label_input || 'Jumlah wajib berupa angka positif.' });
          }
          if (angka > (Number(row.total) || 0)) {
            return res.status(400).json({ error: `Jumlah melebihi total ternak saat ini (${row.total}).` });
          }
          nilaiFinal = angka;
        } else if (nilai_angka != null && String(nilai_angka).trim() !== '') {
          nilaiFinal = parseInt(String(nilai_angka).trim(), 10) || null;
        }

        const simpanLog = (cbLog) => {
          db.query(
            `INSERT INTO log_perawatan_ternak
               (ternak_id, master_aksi_id, jadwal_id, aktivitas_id, catatan, foto, nilai_angka, diinput_oleh, nama_perawat, role_perawat)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [row.ternak_id, aksi.id,
             jadwal_id ? (parseInt(String(jadwal_id).trim(), 10) || null) : null,
             aktivitas_id ? (parseInt(String(aktivitas_id).trim(), 10) || null) : null,
             catatan || null, req.file ? req.file.filename : null,
             nilaiFinal, perawat.id, perawat.nama, perawat.role],
            (errIns, results) => {
              if (errIns) return cbLog(errIns);
              cbLog(null, results.insertId);
            }
          );
        };

        // Lanjutkan simpan (setelah lolos cek batas harian di bawah).
        const lanjutSimpan = () => {
          // Aksi angka (mis. ayam mati): update statistik ternak dulu.
          if (butuhAngka && nilaiFinal) {
            db.query(
              `UPDATE ternak SET total = GREATEST(0, total - ?), total_mati = IFNULL(total_mati, 0) + ? WHERE id = ?`,
              [nilaiFinal, nilaiFinal, row.ternak_id],
              (errUpd) => {
                if (errUpd) return res.status(500).json({ error: errUpd.message });
                simpanLog((errLog, idLog) => {
                  if (errLog) return res.status(500).json({ error: errLog.message });
                  res.json({
                    message: `${aksi.nama_aksi} berhasil dicatat (total berkurang ${nilaiFinal})`,
                    id: idLog,
                    total: Math.max(0, (Number(row.total) || 0) - nilaiFinal),
                    total_mati: (Number(row.total_mati) || 0) + nilaiFinal,
                  });
                });
              }
            );
          } else {
            simpanLog((errLog, idLog) => {
              if (errLog) return res.status(500).json({ error: errLog.message });
              res.json({ message: `${aksi.nama_aksi} berhasil dicatat`, id: idLog });
            });
          }
        };

        // VALIDASI BATAS HARIAN (backend, wajib): kalau aksi punya batas_harian
        // dan konfirmasi HARI INI sudah mencapai batas → tolak request. Dengan
        // begini pembatasan tidak bisa dilewati lewat panggilan API langsung.
        if (aksi.batas_harian != null) {
          db.query(
            `SELECT COUNT(*) AS cnt FROM log_perawatan_ternak lh
              WHERE lh.ternak_id = ? AND lh.master_aksi_id = ? AND lh.created_at >= CURDATE()`,
            [row.ternak_id, aksi.id],
            (errCnt, cntRows) => {
              if (errCnt) return res.status(500).json({ error: errCnt.message });
              const countHariIni = Number((cntRows && cntRows[0] && cntRows[0].cnt) || 0);
              if (countHariIni >= Number(aksi.batas_harian)) {
                return res.status(400).json({
                  error: `Batas harian untuk aksi ini sudah tercapai (${countHariIni}/${aksi.batas_harian}).`,
                });
              }
              lanjutSimpan();
            }
          );
        } else {
          lanjutSimpan();
        }
      }
    );
  });
});

// ── ADMIN PETERNAKAN ─────────────────────────────────────────────────────────
// GET /api/admin/ternak — daftar SEMUA jenis ternak (termasuk yang masih draft)
// + daftar master jenis ternak (dpakai dropdown "Tambah": jenis yang sudah ada
// ditandai `sudah_ada`). Satu response, satu sumber data dari tabel ternak.
// Khusus admin (token admin_users via alfilaha_admin_token).
app.get('/api/admin/ternak', authenticateAdminToken, (req, res) => {
  db.query(
    `SELECT t.id, t.jenis_ternak_id, t.nama_tampilan, t.status_publikasi,
            t.total, t.total_mati, t.lokasi_id, t.foto, t.deskripsi,
            t.created_at, t.updated_at,
            jt.nama AS jenis, jt.kategori, jt.keterangan,
            COALESCE(NULLIF(t.nama_tampilan,''), jt.nama) AS nama,
            l.nama AS lokasi,
            (SELECT COUNT(*) FROM master_aksi_ternak m
               WHERE m.jenis_ternak_id = jt.id AND m.aktif = 1) AS jumlah_aksi,
            (SELECT COUNT(*) FROM log_perawatan_ternak lp
               WHERE lp.ternak_id = t.id) AS jumlah_riwayat
       FROM ternak t
       JOIN jenis_ternak jt ON jt.id = t.jenis_ternak_id
       LEFT JOIN lokasi l ON l.id = t.lokasi_id
      WHERE jt.aktif = 1
      ORDER BY jt.id ASC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query(
        `SELECT jt.id, jt.nama, jt.kategori,
                (t.id IS NOT NULL) AS sudah_ada
           FROM jenis_ternak jt
           LEFT JOIN ternak t ON t.jenis_ternak_id = jt.id
          WHERE jt.aktif = 1
          ORDER BY jt.id ASC`,
        (err2, jenis) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ ternak: rows || [], jenis: jenis || [] });
        }
      );
    }
  );
});

// GET /api/admin/jenis-ternak — daftar jenis ternak (pilihan tetap: Sapi, Ayam,
// Kambing) + penanda apakah jenis itu sudah punya baris ternak. Dipakai dropdown
// form "Tambah Peternakan" (jenis yang sudah ada otomatis disembunyikan).
app.get('/api/admin/jenis-ternak', authenticateAdminToken, (req, res) => {
  db.query(
    `SELECT jt.id, jt.nama, jt.kategori,
            (t.id IS NOT NULL) AS sudah_ada
       FROM jenis_ternak jt
       LEFT JOIN ternak t ON t.jenis_ternak_id = jt.id
      WHERE jt.aktif = 1
      ORDER BY jt.id ASC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    }
  );
});

// POST /api/admin/ternak — tambah ternak BARU (INSERT nyata ke tabel `ternak`).
// Satu baris per jenis_ternak (UNIQUE uq_ternak_jenis → 409 bila jenis sudah
// ada). Jenis diterima sebagai TEKS manual dan dicocokkan case-insensitive ke
// jenis_ternak (Sapi/Ayam/Kambing) agar daftar aksi perawatan otomatis benar.
// Lokasi boleh lewat id (dropdown) atau nama teks manual. Foto opsional.
app.post('/api/admin/ternak', authenticateAdminToken, uploadFoto.single('foto'), (req, res) => {
  const jenisText = String(req.body.jenis_ternak || '').trim().replace(/\s+/g, ' ');
  const jenisIdRaw = parseInt(String(req.body.jenis_ternak_id || '').trim(), 10);
  const total = parseInt(String(req.body.total || '0').trim(), 10);
  if (!Number.isFinite(total) || total < 0) {
    return res.status(400).json({ error: 'Total harus berupa angka 0 atau lebih.' });
  }
  const status = ['draft', 'dipublikasikan'].includes(String(req.body.status_publikasi || '').trim())
    ? String(req.body.status_publikasi).trim()
    : 'draft';
  const namaTampilan = String(req.body.nama_tampilan || '').trim();
  const deskripsi = String(req.body.deskripsi || '').trim();
  const lokasiRaw = String(req.body.lokasi_id || '').trim();

  const prosesLokasi = (jt, cb) => {
    if (lokasiRaw && /^\d+$/.test(lokasiRaw)) {
      const lid = parseInt(lokasiRaw, 10);
      return db.query('SELECT id FROM lokasi WHERE id = ? AND aktif = 1', [lid], (errL, lRows) => {
        if (errL) return res.status(500).json({ error: errL.message });
        if (!lRows || !lRows.length) return res.status(400).json({ error: 'Lokasi terpilih tidak valid.' });
        cb(lid);
      });
    }
    const namaLokasi = String(req.body.lokasi_nama || '').trim().replace(/\s+/g, ' ');
    if (!namaLokasi) return cb(null);
    db.query('SELECT id FROM lokasi WHERE LOWER(nama) = LOWER(?)', [namaLokasi], (errNm, nmRows) => {
      if (errNm) return res.status(500).json({ error: errNm.message });
      if (nmRows && nmRows.length) return cb(nmRows[0].id);
      db.query(
        "INSERT INTO lokasi (nama, keterangan, aktif) VALUES (?, 'Lokasi ternak', 1)",
        [namaLokasi],
        (errAdd, addRes) => {
          if (errAdd) return res.status(500).json({ error: errAdd.message });
          cb(addRes.insertId);
        }
      );
    });
  };

  const cariJenis = (cb) => {
    if (Number.isFinite(jenisIdRaw) && jenisIdRaw > 0) {
      return db.query('SELECT id, nama FROM jenis_ternak WHERE id = ? AND aktif = 1', [jenisIdRaw], (errJ, jRows) => {
        if (errJ) return res.status(500).json({ error: errJ.message });
        if (!jRows || !jRows.length) return res.status(400).json({ error: 'Jenis ternak tidak dikenali. Gunakan salah satu: Sapi, Ayam, atau Kambing.' });
        cb(jRows[0]);
      });
    }
    if (!jenisText) {
      return res.status(400).json({ error: 'Jenis ternak wajib diisi. Gunakan salah satu: Sapi, Ayam, atau Kambing.' });
    }
    db.query(
      'SELECT id, nama FROM jenis_ternak WHERE LOWER(nama) = LOWER(?) AND aktif = 1 LIMIT 1',
      [jenisText],
      (errJ, jRows) => {
        if (errJ) return res.status(500).json({ error: errJ.message });
        if (!jRows || !jRows.length) {
          return res.status(400).json({ error: 'Jenis ternak tidak dikenali. Gunakan salah satu: Sapi, Ayam, atau Kambing.' });
        }
        cb(jRows[0]);
      }
    );
  };

  cariJenis((jt) => {
    db.query('SELECT id FROM ternak WHERE jenis_ternak_id = ?', [jt.id], (errDup, dupRows) => {
      if (errDup) return res.status(500).json({ error: errDup.message });
      if (dupRows && dupRows.length) {
        return res.status(409).json({ error: `Jenis ternak ${jt.nama} sudah pernah ditambahkan.` });
      }
      prosesLokasi(jt, (lokasiId) => {
        db.query(
          `INSERT INTO ternak
             (jenis_ternak_id, nama_tampilan, total, total_mati, lokasi_id, foto, status_publikasi, deskripsi)
           VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`,
          [jt.id, namaTampilan || jt.nama, total, lokasiId, req.file ? req.file.filename : null,
           status, deskripsi || null],
          (errIns, hasil) => {
            if (errIns && errIns.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ error: `Jenis ternak ${jt.nama} sudah pernah ditambahkan.` });
            }
            if (errIns) return res.status(500).json({ error: errIns.message });
            res.status(201).json({
              message: `${namaTampilan || jt.nama} berhasil ditambahkan${
                status === 'dipublikasikan' ? ' dan dipublikasikan' : ''
              }.`,
              id: hasil && hasil.insertId,
            });
          }
        );
      });
    });
  });
});

// PUT /api/admin/ternak/:id — update nama tampilan, lokasi, foto, total,
// status publikasi. TIDAK mengedit total_mati (murni akumulasi dari log
// "Konfirmasi Ayam Mati"). Khusus admin. Foto opsional via multipart `foto`.
app.put('/api/admin/ternak/:id', authenticateAdminToken, uploadFoto.single('foto'), (req, res) => {
  const id = parseInt(String(req.params.id).trim(), 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'ID ternak tidak valid.' });
  }
  const namaTampilan = String(req.body.nama_tampilan || '').trim();
  const deskripsi = String(req.body.deskripsi || '').trim();
  const total = parseInt(String(req.body.total || '0').trim(), 10);
  if (!Number.isFinite(total) || total < 0) {
    return res.status(400).json({ error: 'Total harus berupa angka 0 atau lebih.' });
  }
  const lokasi = String(req.body.lokasi_id || '').trim();
  const lokasiId = lokasi && /^\d+$/.test(lokasi) ? parseInt(lokasi, 10) : null;
  const status = ['draft', 'dipublikasikan'].includes(String(req.body.status_publikasi || '').trim())
    ? String(req.body.status_publikasi).trim()
    : 'draft';
  const simpan = () => {
    if (req.file) {
      db.query(
        `UPDATE ternak t
            JOIN jenis_ternak jt ON jt.id = t.jenis_ternak_id
            SET t.nama_tampilan = COALESCE(NULLIF(?, ''), jt.nama),
                t.lokasi_id = ?,
                t.total = ?,
                t.status_publikasi = ?,
                t.foto = ?,
                t.deskripsi = NULLIF(?, '')
          WHERE t.id = ?`,
        [namaTampilan, lokasiId, total, status, req.file.filename, deskripsi, id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Data ternak berhasil diperbarui' });
        }
      );
    } else {
      db.query(
        `UPDATE ternak t
            JOIN jenis_ternak jt ON jt.id = t.jenis_ternak_id
            SET t.nama_tampilan = COALESCE(NULLIF(?, ''), jt.nama),
                t.lokasi_id = ?,
                t.total = ?,
                t.status_publikasi = ?,
                t.deskripsi = NULLIF(?, '')
          WHERE t.id = ?`,
        [namaTampilan, lokasiId, total, status, deskripsi, id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Data ternak berhasil diperbarui' });
        }
      );
    }
  };
  if (lokasiId) {
    db.query('SELECT id FROM lokasi WHERE id = ? AND aktif = 1', [lokasiId], (errL, lRows) => {
      if (errL) return res.status(500).json({ error: errL.message });
      if (!lRows || !lRows.length) {
        return res.status(400).json({ error: 'Lokasi terpilih tidak valid.' });
      }
      simpan();
    });
  } else {
    simpan();
  }
});

// GET /api/admin/ternak/:id/aksi-rekap — rekap jumlah tiap aksi perawatan
// (READ-ONLY untuk pantauan admin). Sumber data = tabel log_perawatan_ternak
// (COUNT per master_aksi_id), SAMA dengan angka yang tampil di halaman publik.
// Filter rentang via query `rentang`: semua | hari_ini | minggu_ini | bulan_ini.
app.get('/api/admin/ternak/:id/aksi-rekap', authenticateAdminToken, (req, res) => {
  const id = parseInt(String(req.params.id).trim(), 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'ID ternak tidak valid.' });
  }
  const rentang = String(req.query.rentang || 'semua').trim();
  let kondisiLog = 'lp.ternak_id = ?';
  if (rentang === 'hari_ini') {
    kondisiLog += ' AND lp.created_at >= CURDATE()';
  } else if (rentang === 'minggu_ini') {
    kondisiLog += ' AND lp.created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)';
  } else if (rentang === 'bulan_ini') {
    kondisiLog += " AND lp.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";
  } else if (rentang !== 'semua') {
    return res.status(400).json({ error: 'Rentang waktu tidak dikenali.' });
  }

  db.query('SELECT id, jenis_ternak_id FROM ternak WHERE id = ?', [id], (errT, tRows) => {
    if (errT) return res.status(500).json({ error: errT.message });
    if (!tRows || !tRows.length) return res.status(404).json({ message: 'Ternak tidak ditemukan.' });
    const jenisId = tRows[0].jenis_ternak_id;
    db.query(
      `SELECT m.id, m.nama_aksi, m.sub_aksi, m.butuh_input_angka, m.label_input, m.urutan,
              m.batas_harian,
              (SELECT COUNT(*) FROM log_perawatan_ternak lp
                 WHERE ${kondisiLog} AND lp.master_aksi_id = m.id) AS jumlah,
              (SELECT COUNT(*) FROM log_perawatan_ternak lh
                 WHERE lh.ternak_id = ? AND lh.master_aksi_id = m.id
                   AND lh.created_at >= CURDATE()) AS jumlah_hari_ini
         FROM master_aksi_ternak m
        WHERE m.jenis_ternak_id = ? AND m.aktif = 1
        ORDER BY m.urutan ASC, m.id ASC`,
      [id, id, jenisId],
      (err2, aksi) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({
          aksi: (aksi || []).map((a) => ({
            ...a,
            jam_penanda: JAM_PENANDA[a.nama_aksi] || null,
            label: a.sub_aksi ? `${a.nama_aksi} (${a.sub_aksi})` : a.nama_aksi,
          })),
        });
      }
    );
  });
});

// PUT /api/admin/ternak/:id/aksi-batas — simpan batas maksimal harian tiap aksi
// (kolom master_aksi_ternak.batas_harian). Body: { aksi: [ { id, batas_harian } ] }.
// `batas_harian` kosong/null → tidak dibatasi. Khusus admin.
app.put('/api/admin/ternak/:id/aksi-batas', authenticateAdminToken, (req, res) => {
  const id = parseInt(String(req.params.id).trim(), 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'ID ternak tidak valid.' });
  }
  const daftar = Array.isArray(req.body.aksi) ? req.body.aksi : null;
  if (!daftar || !daftar.length) {
    return res.status(400).json({ error: 'Daftar aksi wajib diisi.' });
  }
  const update = [];
  for (const baris of daftar) {
    const aid = parseInt(String(baris.id || '').trim(), 10);
    if (!Number.isFinite(aid) || aid <= 0) {
      return res.status(400).json({ error: 'Terjadi aksi dengan id tidak valid.' });
    }
    const rawBatas = String(baris.batas_harian == null ? '' : baris.batas_harian).trim();
    let batas = null;
    if (rawBatas !== '') {
      batas = parseInt(rawBatas, 10);
      if (!Number.isFinite(batas) || batas < 1) {
        return res.status(400).json({ error: 'Batas harian harus angka ≥ 1 atau boleh dikosongkan (tidak dibatasi).' });
      }
    }
    update.push({ aid, batas });
  }

  db.query('SELECT id, jenis_ternak_id FROM ternak WHERE id = ?', [id], (errT, tRows) => {
    if (errT) return res.status(500).json({ error: errT.message });
    if (!tRows || !tRows.length) return res.status(404).json({ message: 'Ternak tidak ditemukan.' });
    const jenisId = tRows[0].jenis_ternak_id;
    let idx = 0;
    const lanjut = () => {
      if (idx >= update.length) {
        return res.json({ message: 'Batas harian berhasil disimpan.', jumlah: update.length });
      }
      const { aid, batas } = update[idx];
      idx += 1;
      db.query(
        `UPDATE master_aksi_ternak m
            JOIN ternak t ON t.jenis_ternak_id = m.jenis_ternak_id AND t.id = ?
            SET m.batas_harian = ?
          WHERE m.id = ? AND m.jenis_ternak_id = ?`,
        [id, batas, aid, jenisId],
        (errU) => {
          if (errU) return res.status(500).json({ error: errU.message });
          lanjut();
        }
      );
    };
    lanjut();
  });
});

// Helper: validasi id ternak & ambil jenis_ternak_id
function ternakJenisId(id, cb) {
  db.query('SELECT id, jenis_ternak_id FROM ternak WHERE id = ?', [id], (err, rows) => {
    if (err) return cb(err, null);
    if (!rows || !rows.length) return cb(null, null);
    cb(null, rows[0].jenis_ternak_id);
  });
}

// GET /api/admin/ternak/:id/aksi — daftar SEMUA aksi perawatan (termasuk yang
// dinonaktifkan) untuk dikelola admin. Sama seperti aksi-rekap, tapi tidak
// difilter `aktif = 1` dan menambah jumlah log per aksi (untuk melindungi
// riwayat saat hapus).
app.get('/api/admin/ternak/:id/aksi', authenticateAdminToken, (req, res) => {
  const id = parseInt(String(req.params.id).trim(), 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'ID ternak tidak valid.' });
  }
  ternakJenisId(id, (errT, jenisId) => {
    if (errT) return res.status(500).json({ error: errT.message });
    if (jenisId == null) return res.status(404).json({ message: 'Ternak tidak ditemukan.' });
    db.query(
      `SELECT m.id, m.nama_aksi, m.sub_aksi, m.butuh_input_angka, m.label_input,
              m.batas_harian, m.urutan, m.aktif,
              (SELECT COUNT(*) FROM log_perawatan_ternak lp
                 WHERE lp.ternak_id = ? AND lp.master_aksi_id = m.id) AS jumlah_log,
              (SELECT COUNT(*) FROM log_perawatan_ternak lh
                 WHERE lh.ternak_id = ? AND lh.master_aksi_id = m.id
                   AND lh.created_at >= CURDATE()) AS jumlah_hari_ini
         FROM master_aksi_ternak m
        WHERE m.jenis_ternak_id = ?
        ORDER BY m.urutan ASC, m.id ASC`,
      [id, id, jenisId],
      (err2, aksi) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({
          aksi: (aksi || []).map((a) => ({
            ...a,
            jam_penanda: JAM_PENANDA[a.nama_aksi] || null,
            label: a.sub_aksi ? `${a.nama_aksi} (${a.sub_aksi})` : a.nama_aksi,
          })),
        });
      }
    );
  });
});

// POST /api/admin/ternak/:id/aksi — tambah aksi perawatan baru.
// Body: { nama_aksi, sub_aksi?, butuh_input_angka, label_input?, batas_harian?, urutan? }
app.post('/api/admin/ternak/:id/aksi', authenticateAdminToken, (req, res) => {
  const id = parseInt(String(req.params.id).trim(), 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'ID ternak tidak valid.' });
  }
  const namaAksi = String(req.body.nama_aksi || '').trim();
  if (!namaAksi) {
    return res.status(400).json({ error: 'Nama aksi wajib diisi.' });
  }
  if (namaAksi.length > 255) {
    return res.status(400).json({ error: 'Nama aksi terlalu panjang (maksimal 255 karakter).' });
  }
  const subAksi = String(req.body.sub_aksi || '').trim() || null;
  const butuhAngka = !!req.body.butuh_input_angka ? 1 : 0;
  const labelInput = String(req.body.label_input || '').trim() || null;
  if (labelInput && labelInput.length > 255) {
    return res.status(400).json({ error: 'Label input terlalu panjang (maksimal 255 karakter).' });
  }
  let batas = null;
  if (String(req.body.batas_harian ?? '').trim() !== '') {
    batas = parseInt(String(req.body.batas_harian).trim(), 10);
    if (!Number.isFinite(batas) || batas < 1) {
      return res.status(400).json({ error: 'Batas harian harus angka ≥ 1 atau boleh dikosongkan.' });
    }
  }
  ternakJenisId(id, (errT, jenisId) => {
    if (errT) return res.status(500).json({ error: errT.message });
    if (jenisId == null) return res.status(404).json({ message: 'Ternak tidak ditemukan.' });
    const urutanAwal = String(req.body.urutan ?? '').trim() === ''
      ? null
      : parseInt(String(req.body.urutan).trim(), 10);
    let urutan = urutanAwal;
    const insertUrutan = () => {
      const nextUrutan = urutan == null || !Number.isFinite(urutan)
        ? 0
        : urutan;
      db.query(
        `INSERT INTO master_aksi_ternak
           (jenis_ternak_id, nama_aksi, sub_aksi, butuh_input_angka, label_input, batas_harian, urutan, aktif)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [jenisId, namaAksi, subAksi, butuhAngka, labelInput, batas, nextUrutan],
        (errIns) => {
          if (errIns) {
            if (errIns.code === 'ER_DUP_ENTRY') {
              return res.status(400).json({ error: `Aksi "${namaAksi}${subAksi ? ` (${subAksi})` : ''}" sudah ada untuk jenis ternak ini.` });
            }
            return res.status(500).json({ error: errIns.message });
          }
          res.json({ message: 'Aksi perawatan berhasil ditambahkan.' });
        }
      );
    };
    if (urutan != null && Number.isFinite(urutan)) return insertUrutan();
    db.query(
      'SELECT COALESCE(MAX(urutan), 0) + 10 AS next_urutan FROM master_aksi_ternak WHERE jenis_ternak_id = ?',
      [jenisId],
      (errU, uRows) => {
        if (errU) return res.status(500).json({ error: errU.message });
        urutan = uRows[0].next_urutan;
        insertUrutan();
      }
    );
  });
});

// PUT /api/admin/ternak/:id/aksi/:aksiId — ubah aksi / aktifkan / nonaktifkan.
// Body menerima field parsial. `aktif` boleh 0/1 untuk toggle status.
app.put('/api/admin/ternak/:id/aksi/:aksiId', authenticateAdminToken, (req, res) => {
  const id = parseInt(String(req.params.id).trim(), 10);
  const aksiId = parseInt(String(req.params.aksiId).trim(), 10);
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(aksiId) || aksiId <= 0) {
    return res.status(400).json({ error: 'ID tidak valid.' });
  }
  ternakJenisId(id, (errT, jenisId) => {
    if (errT) return res.status(500).json({ error: errT.message });
    if (jenisId == null) return res.status(404).json({ message: 'Ternak tidak ditemukan.' });
    db.query(
      'SELECT id FROM master_aksi_ternak WHERE id = ? AND jenis_ternak_id = ?',
      [aksiId, jenisId],
      (errC, cRows) => {
        if (errC) return res.status(500).json({ error: errC.message });
        if (!cRows || !cRows.length) {
          return res.status(404).json({ message: 'Aksi perawatan tidak ditemukan untuk jenis ternak ini.' });
        }
        const field = {};
        if (req.body.nama_aksi != null) {
          const v = String(req.body.nama_aksi).trim();
          if (!v) return res.status(400).json({ error: 'Nama aksi tidak boleh kosong.' });
          if (v.length > 255) return res.status(400).json({ error: 'Nama aksi terlalu panjang (maksimal 255 karakter).' });
          field.nama_aksi = v;
        }
        if (req.body.sub_aksi !== undefined) {
          field.sub_aksi = String(req.body.sub_aksi || '').trim() || null;
        }
        if (req.body.butuh_input_angka != null) {
          field.butuh_input_angka = !!req.body.butuh_input_angka ? 1 : 0;
        }
        if (req.body.label_input !== undefined) {
          const v = String(req.body.label_input || '').trim();
          if (v.length > 255) return res.status(400).json({ error: 'Label input terlalu panjang.' });
          field.label_input = v || null;
        }
        if (req.body.batas_harian !== undefined) {
          const raw = String(req.body.batas_harian == null ? '' : req.body.batas_harian).trim();
          field.batas_harian = raw === '' ? null : parseInt(raw, 10);
          if (field.batas_harian != null && (!Number.isFinite(field.batas_harian) || field.batas_harian < 1)) {
            return res.status(400).json({ error: 'Batas harian harus angka ≥ 1 atau boleh dikosongkan.' });
          }
        }
        if (req.body.urutan !== undefined) {
          const v = parseInt(String(req.body.urutan).trim(), 10);
          if (!Number.isFinite(v) || v < 0) return res.status(400).json({ error: 'Urutan harus angka ≥ 0.' });
          field.urutan = v;
        }
        if (req.body.aktif !== undefined) {
          field.aktif = !!req.body.aktif ? 1 : 0;
        }
        if (!Object.keys(field).length) {
          return res.status(400).json({ error: 'Tidak ada field yang diubah.' });
        }
        const setCols = Object.keys(field).map((k) => `${k} = ?`).join(', ');
        db.query(
          `UPDATE master_aksi_ternak SET ${setCols} WHERE id = ? AND jenis_ternak_id = ?`,
          [...Object.values(field), aksiId, jenisId],
          (errU) => {
            if (errU) {
              if (errU.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Aksi dengan nama tersebut sudah ada untuk jenis ternak ini.' });
              }
              return res.status(500).json({ error: errU.message });
            }
            res.json({ message: 'Aksi perawatan berhasil diperbarui.' });
          }
        );
      }
    );
  });
});

// DELETE /api/admin/ternak/:id/aksi/:aksiId — hapus aksi. DITOLAK bila sudah
// ada catatan riwayat (log_perawatan_ternak → FK ON DELETE CASCADE akan
// menghapus riwayat). Bila tidak ada riwayat, baris boleh dihapus.
app.delete('/api/admin/ternak/:id/aksi/:aksiId', authenticateAdminToken, (req, res) => {
  const id = parseInt(String(req.params.id).trim(), 10);
  const aksiId = parseInt(String(req.params.aksiId).trim(), 10);
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(aksiId) || aksiId <= 0) {
    return res.status(400).json({ error: 'ID tidak valid.' });
  }
  db.query(
    `SELECT COUNT(*) AS n FROM log_perawatan_ternak WHERE ternak_id = ? AND master_aksi_id = ?`,
    [id, aksiId],
    (errL, lRows) => {
      if (errL) return res.status(500).json({ error: errL.message });
      const n = Number(lRows?.[0]?.n || 0);
      if (n > 0) {
        return res.status(409).json({
          error: `Aksi tidak bisa dihapus karena sudah ada ${n} catatan perawatan. Nonaktifkan aksi ini saja agar tidak tampil, riwayat tetap aman.`,
        });
      }
      db.query(
        'DELETE FROM master_aksi_ternak WHERE id = ? AND jenis_ternak_id = (SELECT jenis_ternak_id FROM ternak WHERE id = ?)',
        [aksiId, id],
        (errD) => {
          if (errD) return res.status(500).json({ error: errD.message });
          res.json({ message: 'Aksi perawatan berhasil dihapus.' });
        }
      );
    }
  );
});

// ── LOKASI ───────────────────────────────────────────────────────────────────
app.get('/api/lokasi', (req, res) => {
  db.query(
    `SELECT l.id, l.nama, l.keterangan, l.aktif, l.created_at,
            (SELECT COUNT(*) FROM kegiatan_lokasi k
              WHERE k.lokasi_id = l.id AND k.aktif = 1) AS jumlah_kegiatan
       FROM lokasi l
      WHERE l.aktif = 1
      ORDER BY l.id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// GET kegiatan per lokasi (satu sumber data untuk form jadwal & halaman lokasi)
app.get('/api/lokasi/:id/kegiatan', (req, res) => {
  const id = req.params.id;
  db.query("SELECT id FROM lokasi WHERE id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0)
      return res.status(404).json({ error: "Lokasi tidak ditemukan" });
    db.query(
      "SELECT id, nama FROM kegiatan_lokasi WHERE lokasi_id = ? AND aktif = 1 ORDER BY nama ASC",
      [id],
      (err2, hasil) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(200).json(hasil || []);
      }
    );
  });
});

// POST tambah satu kegiatan untuk lokasi (dipakai form jadwal & manajemen lokasi)
// Idempoten: bila sudah ada dengan nama sama (per lokasi, tak bedakan besar-kecil huruf) → reaktivasi & kembalikan id yang sama
app.post('/api/lokasi/:id/kegiatan', authenticateAdminToken, (req, res) => {
  const lokasiId = req.params.id;
  const nama = String(req.body.nama || '').trim().replace(/\s+/g, ' ');
  if (!nama) return res.status(400).json({ error: 'Nama kegiatan wajib diisi' });

  db.query("SELECT id FROM lokasi WHERE id = ?", [lokasiId], (err, lokasiRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!lokasiRows || lokasiRows.length === 0) return res.status(404).json({ error: 'Lokasi tidak ditemukan' });

    db.query("SELECT id, aktif FROM kegiatan_lokasi WHERE lokasi_id = ? AND LOWER(nama) = LOWER(?)", [lokasiId, nama], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (rows && rows.length > 0) {
        const existing = rows[0];
        if (existing.aktif !== 1) {
          db.query("UPDATE kegiatan_lokasi SET aktif = 1 WHERE id = ?", [existing.id], (err3) => {
            if (err3) return res.status(500).json({ error: err3.message });
            res.json({ id: existing.id, lokasi_id: parseInt(lokasiId, 10), nama, aktif: 1 });
          });
        } else {
          res.json({ id: existing.id, lokasi_id: parseInt(lokasiId, 10), nama, aktif: 1 });
        }
      } else {
        db.query("INSERT INTO kegiatan_lokasi (lokasi_id, nama) VALUES (?, ?)", [lokasiId, nama], (err4, result) => {
          if (err4) return res.status(500).json({ error: err4.message });
          res.json({ id: result.insertId, lokasi_id: parseInt(lokasiId, 10), nama, aktif: 1 });
        });
      }
    });
  });
});

app.get('/api/lokasi/:id', (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM lokasi WHERE id = ?", [id], (err, lokasi) => {
    if (err) return res.status(500).json({ error: err.message });
    if (lokasi.length === 0) return res.status(404).json({ message: "Lokasi not found" });

    const detail = lokasi[0];
    const loadKegiatan = new Promise((resolve, reject) => {
      db.query("SELECT * FROM kegiatan_lokasi WHERE lokasi_id = ? AND aktif = 1", [id], (err2, results) => {
        if (err2) return reject(err2);
        resolve(results);
      });
    });
    const loadTanaman = new Promise((resolve, reject) => {
      db.query("SELECT id, nama, jenis, gambar FROM tanaman WHERE lokasi_id = ?", [id], (err2, results) => {
        if (err2) return reject(err2);
        resolve(results);
      });
    });
    const loadAktivitas = new Promise((resolve, reject) => {
      db.query("SELECT id, nama_aktivitas, tanggal_mulai, tanggal_selesai, status FROM activity_schedules WHERE lokasi_id = ?", [id], (err2, results) => {
        if (err2) return reject(err2);
        resolve(results);
      });
    });

    Promise.all([loadKegiatan, loadTanaman, loadAktivitas])
      .then(([kegiatan, tanaman, aktivitas]) => {
        detail.kegiatan = kegiatan;
        detail.tanaman = tanaman;
        detail.aktivitas = aktivitas;
        res.json(detail);
      })
      .catch((e) => res.status(500).json({ error: e.message }));
  });
});

app.post('/api/lokasi', authenticateAdminToken, (req, res) => {
  const { nama, nama_lokasi, keterangan } = req.body;
  const namaFinal = String(nama || nama_lokasi || '').trim();
  if (!namaFinal) return res.status(400).json({ error: "Nama lokasi wajib diisi" });

  db.query("INSERT INTO lokasi (nama, keterangan) VALUES (?, ?)", [namaFinal, keterangan || ''], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Nama lokasi sudah ada" });
      return res.status(500).json({ error: err.message });
    }
    const lokasiId = results.insertId;
    // Kegiatan opsional — dipakai API/form lama; form baru cukup nama
    if (Array.isArray(req.body.kegiatan) && req.body.kegiatan.length) {
      simpanKegiatanBatch(lokasiId, req.body.kegiatan, (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: "Berhasil", id: lokasiId });
      });
    } else {
      res.json({ message: "Berhasil", id: lokasiId });
    }
  });
});

app.put('/api/lokasi/:id', authenticateAdminToken, (req, res) => {
  const { nama, keterangan } = req.body;
  const namaFinal = String(nama || '').trim();
  if (!namaFinal) return res.status(400).json({ error: "Nama lokasi wajib diisi" });
  const lokasiId = req.params.id;

  db.query("UPDATE lokasi SET nama=?, keterangan=? WHERE id=?", [namaFinal, keterangan || '', lokasiId], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Nama lokasi sudah ada" });
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) return res.status(404).json({ error: "Lokasi tidak ditemukan" });

    // Sinkronisasi kegiatan hanya bila dikirim eksplisit (`kegiatan` array).
    // Form baru cukup nama → jangan sentuh kegiatan_kegiatan_lokasi lama.
    if (!Array.isArray(req.body.kegiatan)) return res.json({ message: "Berhasil" });

    db.query("SELECT id, nama FROM kegiatan_lokasi WHERE lokasi_id = ?", [lokasiId], (errK, rowsK) => {
      if (errK) return res.status(500).json({ error: errK.message });
      const baru = normalisasiNamaKegiatan(req.body.kegiatan);
      const baruLower = baru.map((n) => n.toLowerCase());
      const mauDihapus = (rowsK || [])
        .filter((k) => !baruLower.includes(k.nama.toLowerCase()))
        .map((k) => k.id);

      cekKegiatanDipakai(mauDihapus, (errDipakai, dipakai) => {
        if (errDipakai) return res.status(500).json({ error: errDipakai.message });
        if (dipakai.length > 0) {
          return res.status(400).json({
            error: "Kegiatan tidak bisa dihapus karena sudah dipakai aktivitas terjadwal: " +
              dipakai.map((d) => `"${d.nama}" (${d.nama_aktivitas})`).join(', ')
          });
        }

        const lanjut = (errH) => {
          if (errH) return res.status(500).json({ error: errH.message });
          simpanKegiatanBatch(lokasiId, baru, (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: "Berhasil", sincronisasi_kegiatan: true });
          });
        };
        if (mauDihapus.length > 0) {
          const ph = mauDihapus.map(() => '?').join(',');
          db.query(`DELETE FROM kegiatan_lokasi WHERE id IN (${ph})`, mauDihapus, lanjut);
        } else {
          lanjut(null);
        }
      });
    });
  });
});

app.delete('/api/lokasi/:id', authenticateAdminToken, (req, res) => {
  const lokasiId = req.params.id;

  db.query('SELECT COUNT(*) as count FROM tanaman WHERE lokasi_id = ?', [lokasiId], (err, tanamanResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (tanamanResults[0].count > 0) {
      return res.status(400).json({ error: `Lokasi masih digunakan oleh ${tanamanResults[0].count} tanaman` });
    }

    // Lokasi dipakai jadwal (aktif atau lama) TIDAK dihapus fisik — cukup dinonaktifkan
    // agar riwayat jadwal tetap tampil. Kegiatan yang masih dipakai jadwal dipertahankan;
    // kegiatan yang tidak dipakai lagi ikut dihapus.
    const selesai = () => {
      db.query('UPDATE lokasi SET aktif = 0 WHERE id = ?', [lokasiId], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        db.query(
          'SELECT id FROM kegiatan_lokasi WHERE lokasi_id = ?',
          [lokasiId],
          (err3, kRows) => {
            if (err3) return res.status(500).json({ error: err3.message });
            const ids = (kRows || []).map((k) => k.id);
            if (!ids.length) {
              return res.json({ message: 'Lokasi dinonaktifkan' });
            }
            db.query(
              'DELETE FROM kegiatan_lokasi WHERE id IN (?) AND id NOT IN (SELECT kegiatan_id FROM aktivitas_kegiatan)',
              [ids],
              (err4, delRes) => {
                if (err4) return res.status(500).json({ error: err4.message });
                const terhapus = delRes?.affectedRows || 0;
                res.json({
                  message:
                    terhapus > 0
                      ? `Lokasi dinonaktifkan, ${terhapus} kegiatan ikut dihapus`
                      : 'Lokasi dinonaktifkan',
                });
              },
            );
          },
        );
      });
    };

    // Cek apakah lokasi masih dipakai oleh jadwal: hanya untuk info, bukan penolakan
    db.query('SELECT COUNT(*) as count FROM activity_schedules WHERE lokasi_id = ?', [lokasiId], (err5, aktivitasResults) => {
      if (err5) return res.status(500).json({ error: err5.message });
      const dipakaiJadwal = aktivitasResults[0].count > 0;
      db.query("SELECT GROUP_CONCAT(nama_aktivitas SEPARATOR ', ') as nama FROM activity_schedules WHERE lokasi_id = ?", [lokasiId], (err6, jRows) => {
        if (err6) return res.status(500).json({ error: err6.message });
        const namaJadwal = (jRows && jRows[0] && jRows[0].nama) || '';
        if (dipakaiJadwal) {
          // Masih dipakai jadwal → nonaktifkan saja, tanpa hapus kegiatan yang terpakai
          db.query('UPDATE lokasi SET aktif = 0 WHERE id = ?', [lokasiId], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({
              message: `Lokasi dinonaktifkan (masih dipakai jadwal: ${namaJadwal})`,
              dipakai_jadwal: true,
            });
          });
        } else {
          selesai();
        }
      });
    });
  });
});

// ── KEGIATAN LOKASI ──────────────────────────────────────────────────────────

// Normalisasi daftar nama kegiatan: trim, rangkap spasi→satu, buang kosong & duplikat (case-insensitive)
function normalisasiNamaKegiatan(arr) {
  const out = [];
  const seen = new Set();
  (Array.isArray(arr) ? arr : []).forEach((raw) => {
    const n = String(raw || '').replace(/\s+/g, ' ').trim();
    const key = n.toLowerCase();
    if (!n || seen.has(key)) return;
    seen.add(key);
    out.push(n);
  });
  return out;
}

// Cari id kegiatan di satu lokasi (abaikan huruf besar-kecil & spasi tepi)
function cariKegiatanId(lokasiId, nama, cb) {
  db.query("SELECT id FROM kegiatan_lokasi WHERE lokasi_id = ? AND LOWER(TRIM(nama)) = LOWER(?)", [lokasiId, nama], (err, rows) => {
    if (err) return cb(err);
    cb(null, rows && rows.length ? rows[0].id : null);
  });
}

// Sisipkan daftar kegiatan yang belum ada di lokasi (idempotent, case-insensitive)
function simpanKegiatanBatch(lokasiId, daftar, cb) {
  const namaList = normalisasiNamaKegiatan(daftar);
  let i = 0;
  const hasil = [];
  const next = () => {
    if (i >= namaList.length) return cb(null, hasil);
    const n = namaList[i++];
    cariKegiatanId(lokasiId, n, (err, id) => {
      if (err) return cb(err);
      if (id) { hasil.push(id); return next(); }
      db.query("INSERT INTO kegiatan_lokasi (lokasi_id, nama) VALUES (?, ?)", [lokasiId, n], (e2, r) => {
        if (e2) {
          if (e2.code === 'ER_DUP_ENTRY') {
            return cariKegiatanId(lokasiId, n, (e3, id3) => {
              if (e3) return cb(e3);
              hasil.push(id3);
              next();
            });
          }
          return cb(e2);
        }
        hasil.push(r.insertId);
        next();
      });
    });
  };
  next();
}

// Kegiatan mana yang sudah dipakai sebuah aktivitas terjadwal?
function cekKegiatanDipakai(kegiatanIds, cb) {
  if (!kegiatanIds.length) return cb(null, []);
  const ph = kegiatanIds.map(() => '?').join(',');
  db.query(
    `SELECT DISTINCT k.id, k.nama, a.nama_aktivitas, a.id AS aktivitas_id
       FROM kegiatan_lokasi k
       JOIN aktivitas_kegiatan ak ON ak.kegiatan_id = k.id
       JOIN activity_schedules a ON a.id = ak.aktivitas_id
      WHERE k.id IN (${ph})`,
    kegiatanIds,
    (err, rows) => {
      if (err) return cb(err);
      cb(null, rows || []);
    }
  );
}

// GET kegiatan per lokasi (satu sumber data untuk form jadwal & detail)
app.get('/api/kegiatan-lokasi', (req, res) => {
  const { lokasi_id } = req.query;
  let q = "SELECT id, lokasi_id, nama FROM kegiatan_lokasi WHERE aktif = 1";
  const params = [];
  if (lokasi_id) { q += " AND lokasi_id = ?"; params.push(lokasi_id); }
  q += " ORDER BY nama ASC";
  db.query(q, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/kegiatan-lokasi', authenticateAdminToken, (req, res) => {
  const { lokasi_id, nama } = req.body;
  if (!lokasi_id || !nama || !nama.trim()) return res.status(400).json({ error: "lokasi_id dan nama wajib diisi" });
  simpanKegiatanBatch(lokasi_id, [nama], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil" });
  });
});

app.delete('/api/kegiatan-lokasi/:id', authenticateAdminToken, (req, res) => {
  cekKegiatanDipakai([req.params.id], (err, dipakai) => {
    if (err) return res.status(500).json({ error: err.message });
    if (dipakai.length > 0) {
      return res.status(400).json({
        error: `Kegiatan "${dipakai[0].nama}" tidak bisa dihapus karena sudah dipakai aktivitas "${dipakai[0].nama_aktivitas}". Hapus kegiatan itu dari jadwal terkait terlebih dahulu.`
      });
    }
    db.query("DELETE FROM kegiatan_lokasi WHERE id = ?", [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Berhasil" });
    });
  });
});

// ── KATEGORI (dipakai form jadwal) ───────────────────────────────────────────
app.get('/api/kategori', (req, res) => {
  db.query("SELECT id, nama, aktif, created_at FROM kategori ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post('/api/kategori', authenticateAdminToken, (req, res) => {
  const { nama } = req.body;
  if (!nama || !nama.trim()) return res.status(400).json({ error: "Nama kategori wajib diisi" });
  db.query("INSERT INTO kategori (nama) VALUES (?)", [nama.trim()], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Nama kategori sudah ada" });
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Berhasil", id: results.insertId });
  });
});

// API untuk aksi perawatan tanaman (siram, pupuk, panen)
app.post('/api/tanaman/:id/aksi', authenticateSantriToken, (req, res) => {
  const tanamanId = Number.parseInt(req.params.id, 10);
  const aksi = String(req.body?.tipe_aksi || '').trim().toLowerCase();
  if (!Number.isInteger(tanamanId) || tanamanId <= 0) {
    return res.status(400).json({ error: 'ID tanaman tidak valid.' });
  }
  if (!AKSI_PERAWATAN.includes(aksi)) {
    return res.status(400).json({ error: 'Aksi tidak valid. Pilih siram, pupuk, atau panen.' });
  }
  if (req.user.userType === 'santri' && req.user.status_pendaftaran !== 'Diterima') {
    return res.status(403).json({
      message: 'Maaf, Anda belum diterima sebagai santri. Silakan tunggu konfirmasi dari admin.',
      status: req.user.status_pendaftaran
    });
  }

  const isSantri = req.user.userType === 'santri';
  const namaPerawat = req.user.nama || req.user.username || 'Petugas';
  const rolePerawat = isSantri ? 'Santri' : (req.user.role || 'Petugas');
  const query = isSantri
    ? `INSERT INTO log_perawatan (tanaman_id, santri_id, jenis_tindakan, nama_perawat, role_perawat, waktu_tindakan)
       VALUES (?, ?, ?, ?, ?, NOW())`
    : `INSERT INTO log_perawatan (tanaman_id, santri_id, jenis_tindakan, nama_perawat, role_perawat, waktu_tindakan)
       VALUES (?, NULL, ?, ?, ?, NOW())`;
  const values = isSantri
    ? [tanamanId, req.user.id, aksi, namaPerawat, rolePerawat]
    : [tanamanId, aksi, namaPerawat, rolePerawat];

  db.query(query, values, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ message: 'Tindakan berhasil dicatat', id: results.insertId });
  });
});

// API untuk riwayat perawatan tanaman (public access)
app.get('/api/tanaman/:id/riwayat', (req, res) => {
  const tanaman_id = req.params.id;
  const query = `
    SELECT l.id, l.tanaman_id, l.jadwal_id, l.jenis_tindakan, l.waktu_tindakan, l.nama_perawat, l.role_perawat,
           l.laporan_singkat, l.gambar,
           t.nama AS nama_tanaman, s.nama AS nama_santri,
           sch.nama_aktivitas AS nama_aktivitas
    FROM log_perawatan l
    JOIN tanaman t ON l.tanaman_id = t.id
    LEFT JOIN pendaftar_santri s ON l.santri_id = s.id
    LEFT JOIN activity_schedules sch ON sch.id = l.jadwal_id
    WHERE l.tanaman_id = ?
    ORDER BY l.waktu_tindakan DESC
  `;

  db.query(query, [tanaman_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST riwayat perawatan — dipakai santri saat konfirmasi/perawatan manual satu tanaman.
// Data masuk ke log_perawatan (SATU sumber riwayat), sehingga langsung tampil
// di admin (GET /api/log_perawatan) dan di detail tanaman (GET /api/tanaman/:id/riwayat).
app.post('/api/tanaman/:id/riwayat', authenticateSantriToken, uploadTugas.single('foto_bukti'), (req, res) => {
  if (req.user.userType !== 'santri') return res.status(403).json({ error: 'Endpoint ini khusus akun santri.' });
  const tanaman_id = req.params.id;
  const { aksi, jadwal_id, laporan_singkat } = req.body;
  const santri_id = req.user.id;
  const gambar = req.file ? req.file.filename : null;

  const aksiVal = AKSI_PERAWATAN.includes(String(aksi || '').toLowerCase())
    ? String(aksi).toLowerCase()
    : null;
  if (!aksiVal) return res.status(400).json({ error: "Aksi tidak valid. Pilih siram, pupuk, atau panen." });

  const jadwalId = jadwal_id ? parseInt(String(jadwal_id).trim(), 10) : null;
  const jadwalFinal = Number.isFinite(jadwalId) && jadwalId > 0 ? jadwalId : null;

  db.query(
    "INSERT INTO log_perawatan (tanaman_id, jadwal_id, santri_id, jenis_tindakan, laporan_singkat, gambar, nama_perawat, role_perawat, waktu_tindakan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
    [tanaman_id, jadwalFinal, santri_id, aksiVal, laporan_singkat || null, gambar,
     req.user.nama || req.user.username || 'Santri', 'Santri'],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Riwayat perawatan berhasil dicatat", id: results.insertId });
    }
  );
});

// LOG PERAWATAN
app.get('/api/log_perawatan', authenticateAdminToken, (req, res) => {
  const query = `
    SELECT l.id, l.tanaman_id, l.jadwal_id, l.jenis_tindakan, l.waktu_tindakan, l.nama_perawat, l.role_perawat,
           l.laporan_singkat, l.gambar, t.nama AS nama_tanaman, s.nama AS nama_santri,
           sch.nama_aktivitas AS nama_aktivitas
    FROM log_perawatan l
    JOIN tanaman t ON l.tanaman_id = t.id
    LEFT JOIN pendaftar_santri s ON l.santri_id = s.id
    LEFT JOIN activity_schedules sch ON sch.id = l.jadwal_id
    ORDER BY l.waktu_tindakan DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
app.post('/api/log_perawatan', authenticateSantriToken, (req, res) => {
  const { tanaman_id, jenis_tindakan } = req.body;
  const santri_id = req.user.id;
  db.query("INSERT INTO log_perawatan (tanaman_id, santri_id, jenis_tindakan) VALUES (?, ?, ?)", [tanaman_id, santri_id, jenis_tindakan], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Perawatan berhasil dicatat" });
  });
});

// FOTO PERKEMBANGAN
app.get('/api/foto_perkembangan/:tanaman_id', authenticateAdminToken, (req, res) => {
  const query = `
    SELECT f.id, f.tanaman_id, f.gambar, f.waktu_upload, s.nama AS nama_pengunggah
    FROM foto_perkembangan f
    JOIN pendaftar_santri s ON f.santri_id = s.id
    WHERE f.tanaman_id = ?
    ORDER BY f.waktu_upload DESC
  `;
  db.query(query, [req.params.tanaman_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/foto_perkembangan', authenticateSantriToken, upload.single('gambar'), (req, res) => {
  if (req.user.userType !== 'santri') return res.status(403).json({ error: 'Endpoint ini khusus akun santri.' });
  const { tanaman_id } = req.body;
  const santri_id = req.user.id;
  const gambar = req.file ? req.file.filename : null;
  
  if (!gambar) return res.status(400).json({ error: "Gambar wajib diunggah" });

  db.query("INSERT INTO foto_perkembangan (tanaman_id, santri_id, gambar) VALUES (?, ?, ?)", [tanaman_id, santri_id, gambar], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Foto perkembangan berhasil diunggah", id: results.insertId });
  });
});

const INTERNAL_ROLE_MAP = Object.freeze({
  Santri: 'santri',
  Petani: 'petugas',
  Asstaidz: 'guru',
  Pengelola: 'petugas',
  santri: 'santri',
  guru: 'guru',
  petugas: 'petugas'
});

app.post('/api/register', async (req, res, next) => {
  try {
    const namaLengkap = String(req.body?.nama_lengkap || '').trim();
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const role = INTERNAL_ROLE_MAP[String(req.body?.role || '').trim()];

    if (!namaLengkap || !username || !password || !role) {
      return res.status(400).json({ message: 'Semua field harus diisi dengan role yang valid!' });
    }
    if (namaLengkap.length > 255 || username.length > 100) {
      return res.status(400).json({ message: 'Nama lengkap atau username terlalu panjang.' });
    }

    const existingUsers = await runQuery('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length) return res.status(400).json({ message: 'Username sudah digunakan.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await runQuery(
      "INSERT INTO users (nama_lengkap, username, password, role, status) VALUES (?, ?, ?, ?, 'pending')",
      [namaLengkap, username, hashedPassword, role]
    );
    return res.status(201).json({ message: 'Registrasi Berhasil. Menunggu persetujuan Admin.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username sudah digunakan.' });
    }
    if (error.code === 'ER_DATA_TOO_LONG' || error.code === 'WARN_DATA_TRUNCATED') {
      return res.status(400).json({ message: 'Data registrasi terlalu panjang.' });
    }
    return next(error);
  }
});

app.post('/api/login', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const internalUsers = await runQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (internalUsers.length > 0) {
      const user = internalUsers[0];
      if (user.status !== 'approved') {
        return res.status(403).json({ error: 'Akun Anda belum disetujui oleh Admin. Harap tunggu konfirmasi.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Password salah!' });
      return res.json({
        message: 'Login berhasil',
        token: jwt.sign(
          { id: user.id, username: user.username, role: user.role, kind: 'internal' },
          JWT_SECRET,
          { expiresIn: '1d' }
        ),
        user: {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          username: user.username,
          role: user.role
        }
      });
    }

    const admins = await runQuery('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (admins.length === 0) return res.status(401).json({ error: 'Username tidak ditemukan!' });
    const isMatch = await bcrypt.compare(password, admins[0].password);
    if (!isMatch) return res.status(401).json({ error: 'Password salah!' });
    const admin = admins[0];
    return res.json({
      message: 'Login admin berhasil',
      token: jwt.sign(
        { id: admin.id, username: admin.username, role: 'admin', kind: 'admin' },
        JWT_SECRET,
        { expiresIn: '1d' }
      ),
      user: {
        id: admin.id,
        nama_lengkap: admin.nama_lengkap || admin.username,
        username: admin.username,
        role: 'admin'
      }
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/login', async (req, res, next) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi.' });

    const admins = await runQuery('SELECT id, username, password, nama_lengkap, role FROM admin_users WHERE username = ?', [username]);
    if (!admins.length) return res.status(401).json({ error: 'Username tidak ditemukan!' });
    const admin = admins[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Password salah!' });

    return res.json({
      message: 'Login berhasil',
      token: jwt.sign(
        { id: admin.id, username: admin.username, role: 'admin', kind: 'admin' },
        JWT_SECRET,
        { expiresIn: '1d' }
      ),
      user: {
        id: admin.id,
        nama: admin.nama_lengkap || admin.username,
        nama_lengkap: admin.nama_lengkap || admin.username,
        username: admin.username,
        role: 'admin',
        status: 'Diterima'
      }
    });
  } catch (error) {
    return next(error);
  }
});

function validateProgramInput(body) {
  const judul = String(body?.judul || '').trim();
  const jenis = String(body?.jenis || '').trim();
  const nama = String(body?.nama || '').trim();
  const status = String(body?.status || 'aktif').trim();
  const batasAkhir = String(body?.batas_akhir || '').trim();
  const keterangan = body?.keterangan == null ? null : String(body.keterangan);

  if (!judul || !jenis || !nama) return { error: 'Judul, jenis, dan nama program wajib diisi.' };
  if (judul.length > 255 || nama.length > 255) return { error: 'Judul atau nama program terlalu panjang.' };
  if (!['pesantren', 'event'].includes(jenis)) return { error: 'Jenis program tidak valid.' };
  if (!['aktif', 'non_aktif'].includes(status)) return { error: 'Status program tidak valid.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(batasAkhir)) return { error: 'Batas akhir harus berformat YYYY-MM-DD.' };
  return { judul, jenis, nama, status, batasAkhir, keterangan };
}

function parsePositiveId(value) {
  const id = Number.parseInt(String(value || ''), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/api/programs', async (req, res, next) => {
  try {
    const rows = await runQuery('SELECT * FROM program_pendaftaran ORDER BY id DESC');
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/programs', authenticateAdminToken, upload.single('poster'), async (req, res, next) => {
  try {
    const input = validateProgramInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });
    const result = await runQuery(
      `INSERT INTO program_pendaftaran
        (judul, jenis, nama, status, batas_akhir, keterangan, poster)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [input.judul, input.jenis, input.nama, input.status, input.batasAkhir, input.keterangan, req.file?.filename || null]
    );
    return res.json({ message: 'Program berhasil ditambahkan', id: result.insertId });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/programs/:id', authenticateAdminToken, upload.single('poster'), async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID program tidak valid.' });
    const input = validateProgramInput(req.body);
    if (input.error) return res.status(400).json({ error: input.error });

    if (req.file) {
      const result = await runQuery(
        `UPDATE program_pendaftaran
            SET judul = ?, jenis = ?, nama = ?, status = ?, batas_akhir = ?, keterangan = ?, poster = ?
          WHERE id = ?`,
        [input.judul, input.jenis, input.nama, input.status, input.batasAkhir, input.keterangan, req.file.filename, id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Program tidak ditemukan.' });
      return res.json({ message: 'Program beserta poster berhasil diperbarui' });
    }

    const result = await runQuery(
      `UPDATE program_pendaftaran
          SET judul = ?, jenis = ?, nama = ?, status = ?, batas_akhir = ?, keterangan = ?
        WHERE id = ?`,
      [input.judul, input.jenis, input.nama, input.status, input.batasAkhir, input.keterangan, id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Program tidak ditemukan.' });
    return res.json({ message: 'Program berhasil diperbarui' });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/programs/:id/status', authenticateAdminToken, async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    const status = String(req.body?.status || '').trim();
    if (!id) return res.status(400).json({ error: 'ID program tidak valid.' });
    if (!['aktif', 'non_aktif'].includes(status)) {
      return res.status(400).json({ error: 'Status program tidak valid.' });
    }
    const result = await runQuery('UPDATE program_pendaftaran SET status = ? WHERE id = ?', [status, id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Program tidak ditemukan.' });
    return res.json({ message: `Status program diperbarui menjadi ${status}` });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/programs/:id', authenticateAdminToken, async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID program tidak valid.' });
    const programs = await runQuery('SELECT poster FROM program_pendaftaran WHERE id = ?', [id]);
    if (!programs.length) return res.status(404).json({ error: 'Program tidak ditemukan.' });
    await runQuery('DELETE FROM program_pendaftaran WHERE id = ?', [id]);
    return res.json({ message: 'Program berhasil dihapus' });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/users', authenticateAdminToken, async (req, res, next) => {
  try {
    const rows = await runQuery(
      'SELECT id, nama_lengkap, username, role, status, created_at FROM users ORDER BY created_at DESC, id DESC'
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

app.put('/api/admin/users/:id/approve', authenticateAdminToken, async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID user tidak valid.' });
    const result = await runQuery("UPDATE users SET status = 'approved' WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User tidak ditemukan.' });
    return res.json({ message: 'User berhasil disetujui' });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/admin/users/:id/reject', authenticateAdminToken, async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID user tidak valid.' });
    const result = await runQuery('DELETE FROM users WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'User tidak ditemukan.' });
    return res.json({ message: 'User berhasil ditolak & dihapus' });
  } catch (error) {
    return next(error);
  }
});
app.post('/api/upload', authenticateAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Gagal" });
  res.json({ url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` });
});

// ============================================================
// SISTEM JADWAL AKTIVITAS PONDOK
// ============================================================

// Pastikan tabel ada saat server start (idempotent)

// Helper: hitung tanggal jatuh tempo berikutnya dari sebuah jadwal
function hitungTanggalJatuhTempo(tanggalMulai, intervalHari, polaPengulangan) {
  const mulai = new Date(tanggalMulai);
  mulai.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (polaPengulangan === 'sekali') return [mulai];

  const tanggalList = [];
  let cur = new Date(mulai);
  // Kumpulkan semua tanggal dari tanggal_mulai sampai hari ini + 1 interval ke depan
  while (cur <= new Date(today.getTime() + intervalHari * 24 * 60 * 60 * 1000)) {
    tanggalList.push(new Date(cur));
    cur = new Date(cur.getTime() + intervalHari * 24 * 60 * 60 * 1000);
  }
  return tanggalList;
}

// Format date ke YYYY-MM-DD (timezone safe)
function toDateStr(d) {
  const dd = new Date(d);
  const y  = dd.getFullYear();
  const m  = String(dd.getMonth() + 1).padStart(2, '0');
  const day= String(dd.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

if (RUN_LEGACY_DATABASE_BOOTSTRAP) {
// ── Buat tabel jadwal saat koneksi pertama (tambahan ke blok tables yang ada)
const jadwalTables = [
  `CREATE TABLE IF NOT EXISTS activity_schedules (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    nama_aktivitas   VARCHAR(255) NOT NULL,
    kategori         VARCHAR(100) NOT NULL,
    deskripsi        TEXT,
    pola_perulangan  ENUM('sekali','harian','mingguan','bulanan','berulang') NOT NULL DEFAULT 'mingguan',
    interval_hari    INT NOT NULL DEFAULT 7,
    tanggal_mulai    DATE NOT NULL,
    tanggal_selesai  DATE NULL,
    penanggung_jawab INT NULL,
    status           ENUM('aktif','nonaktif','selesai') NOT NULL DEFAULT 'aktif',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (penanggung_jawab) REFERENCES pendaftar_santri(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS activity_tasks (
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
    FOREIGN KEY (schedule_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (santri_id)   REFERENCES pendaftar_santri(id)   ON DELETE SET NULL,
    UNIQUE KEY uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)
  )`
];
// ── Buat tabel lokasi/kegiatan saat koneksi pertama ─────────────────────────
const lokasiTables = [
  `CREATE TABLE IF NOT EXISTS kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    aktif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS lokasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    keterangan TEXT,
    aktif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS kegiatan_lokasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lokasi_id INT NOT NULL,
    nama VARCHAR(255) NOT NULL,
    aktif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE CASCADE,
    UNIQUE KEY uq_lokasi_nama (lokasi_id, nama)
  )`,
  `CREATE TABLE IF NOT EXISTS aktivitas_kegiatan (
    aktivitas_id INT NOT NULL,
    kegiatan_id INT NOT NULL,
    PRIMARY KEY (aktivitas_id, kegiatan_id),
    FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (kegiatan_id) REFERENCES kegiatan_lokasi(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS aktivitas_tanaman (
    aktivitas_id INT NOT NULL,
    tanaman_id INT NOT NULL,
    PRIMARY KEY (aktivitas_id, tanaman_id),
    FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (tanaman_id) REFERENCES tanaman(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS aktivitas_santri (
    aktivitas_id INT NOT NULL,
    santri_id INT NOT NULL,
    PRIMARY KEY (aktivitas_id, santri_id),
    FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (santri_id) REFERENCES pendaftar_santri(id) ON DELETE CASCADE
  )`
];
(function createLokasiTablesSeq(idx) {
  if (idx >= lokasiTables.length) return createTernakTablesSeq(0);
  db.query(lokasiTables[idx], (err) => {
    if (err && err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error(`[Lokasi Table ${idx+1}] Error:`, err.message);
    } else {
      console.log(`[Lokasi Table ${idx+1}] Siap ✅`);
    }
    createLokasiTablesSeq(idx + 1);
  });
})(0);

// ── Tabel & seed data PETERNAKAN (Koleksi Ternak) ──────────────────────────
// Skema fleksibel: daftar aksi perawatan TIDAK di-hardcode di kode program,
// melainkan tersimpan di master_aksi_ternak. Setiap jenis ternak punya
// kumpulan aksi sendiri + statistik (total, total_mati) di tabel `ternak`.
const ternakTables = [
  `CREATE TABLE IF NOT EXISTS jenis_ternak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    kategori ENUM('individu','kelompok') NOT NULL DEFAULT 'individu',
    keterangan TEXT,
    aktif TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
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
  )`,
  `CREATE TABLE IF NOT EXISTS ternak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jenis_ternak_id INT NOT NULL,
    nama_tampilan VARCHAR(255) NULL,
    total INT NOT NULL DEFAULT 0,
    total_mati INT NULL DEFAULT NULL,
    lokasi_id INT NULL,
    foto VARCHAR(255) NULL,
    status_publikasi ENUM('draft','dipublikasikan') NOT NULL DEFAULT 'draft',
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jenis_ternak_id) REFERENCES jenis_ternak(id) ON DELETE CASCADE,
    FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE SET NULL,
    UNIQUE KEY uq_ternak_jenis (jenis_ternak_id)
  )`,
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
  )`,
  `CREATE TABLE IF NOT EXISTS aktivitas_ternak (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aktivitas_id INT NOT NULL,
    ternak_id INT NOT NULL,
    master_aksi_id INT NULL,
    FOREIGN KEY (aktivitas_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (ternak_id) REFERENCES ternak(id) ON DELETE CASCADE,
    FOREIGN KEY (master_aksi_id) REFERENCES master_aksi_ternak(id) ON DELETE CASCADE,
    UNIQUE KEY uq_aktivitas_ternak_aksi (aktivitas_id, ternak_id, master_aksi_id)
  )`
];
function createTernakTablesSeq(idx) {
  if (idx >= ternakTables.length) return migrasiTernakSeed();
  db.query(ternakTables[idx], (err) => {
    if (err && err.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error(`[Ternak Table ${idx+1}] Error:`, err.message);
    } else {
      console.log(`[Ternak Table ${idx+1}] Siap ✅`);
    }
    createTernakTablesSeq(idx + 1);
  });
}

// Migrasi master_aksi_ternak untuk DB lama: MySQL unik key memperlakukan NULL
// sub_aksi sebagai beda tiap baris → bisa duplikat. Dipakai kolom `sub_aksi_key`
// (COALESCE(sub_aksi,'')) agar unik benar. Fungsi ini idempotent.
function migrasiTernakSeed() {
  db.query("SHOW COLUMNS FROM master_aksi_ternak LIKE 'batas_harian'", (errCol, rowsCol) => {
    if (errCol || (rowsCol && rowsCol.length)) {
      next_ternak_setp();
    } else {
      db.query('ALTER TABLE master_aksi_ternak ADD COLUMN batas_harian INT NULL', (errAdd) => {
        if (errAdd) console.error('[Ternak Migrasi] tambah batas_harian gagal:', errAdd.message);
        next_ternak_setp();
      });
    }
  });
}
function next_ternak_setp() {
  db.query("SHOW COLUMNS FROM master_aksi_ternak LIKE 'sub_aksi_key'", (errCol, rowsCol) => {
    if (errCol) { seedTernakData(); return; }
    const tambahKolom = (cb) => {
      if (rowsCol && rowsCol.length) return cb();
      db.query("ALTER TABLE master_aksi_ternak ADD COLUMN sub_aksi_key VARCHAR(100) GENERATED ALWAYS AS (COALESCE(sub_aksi, '')) STORED", (errAdd) => {
        if (errAdd) console.error('[Ternak Migrasi] tambah sub_aksi_key gagal:', errAdd.message);
        cb();
      });
    };
    tambahKolom(() => {
      // Hapus duplikat: pertahankan id terkecil tiap kombinasi unik
      db.query(
        `DELETE m1 FROM master_aksi_ternak m1
          JOIN master_aksi_ternak m2
            ON m1.jenis_ternak_id = m2.jenis_ternak_id
           AND m1.nama_aksi = m2.nama_aksi
           AND COALESCE(m1.sub_aksi, '') = COALESCE(m2.sub_aksi, '')
           AND m1.id > m2.id`,
        (errDel) => {
          if (errDel && errDel.code !== 'ER_ROW_IS_REFERENCED_2') console.error('[Ternak Migrasi] hapus duplikat gagal:', errDel.message);
          // Index unik ini ikut menopang FK jenis_ternak_id, buat index
          // biasa penggantinya dulu sebelum index unik lama boleh di-drop.
          db.query("ALTER TABLE master_aksi_ternak ADD INDEX idx_master_aksi_ternak_jenis (jenis_ternak_id)", (eIdx) => {
            if (eIdx && eIdx.code !== 'ER_DUP_KEYNAME') console.error('[Ternak Migrasi] add index jenis gagal:', eIdx.message);
            db.query("SHOW INDEX FROM master_aksi_ternak WHERE Key_name = 'uq_master_aksi_ternak' AND Column_name = 'sub_aksi'", (errI, rowsI) => {
              const swap = () => {
                if (!errI && rowsI && rowsI.length) {
                  db.query("ALTER TABLE master_aksi_ternak DROP INDEX uq_master_aksi_ternak", (eDrop) => {
                    if (eDrop) console.error('[Ternak Migrasi] drop index lama gagal:', eDrop.message);
                    db.query("ALTER TABLE master_aksi_ternak ADD UNIQUE INDEX uq_master_aksi_ternak (jenis_ternak_id, nama_aksi, sub_aksi_key)", (eAdd) => {
                      if (eAdd) console.error('[Ternak Migrasi] add index unik gagal:', eAdd.message);
                      seedTernakData();
                    });
                  });
                } else {
                  seedTernakData();
                }
              };
              swap();
            });
          });
        }
      );
    });
  });
}

// Seed awal (idempotent, aman dijalankan ulang): 3 jenis ternak + aksinya.
function seedTernakData() {
  const jenis = [
    { nama: 'Sapi',   kategori: 'individu',  keterangan: 'Sapi potong/perah pondok' },
    { nama: 'Ayam',   kategori: 'kelompok',  keterangan: 'Ayam petelur (panen telur)' },
    { nama: 'Kambing', kategori: 'individu', keterangan: 'Kambing perah/ternak' },
  ];

  const aksiList = (idByNama) => [
    // Sapi
    { j: idByNama['Sapi'],   nama: 'Beri Pakan Pagi',    sub: null,    angka: false, label: null, urut: 10 },
    { j: idByNama['Sapi'],   nama: 'Beri Pakan Sore',    sub: null,    angka: false, label: null, urut: 20 },
    { j: idByNama['Sapi'],   nama: 'Beri Minum/Air',     sub: null,    angka: false, label: null, urut: 30 },
    { j: idByNama['Sapi'],   nama: 'Bersihkan Kandang',  sub: 'Pagi',  angka: false, label: null, urut: 40 },
    { j: idByNama['Sapi'],   nama: 'Bersihkan Kandang',  sub: 'Sore',  angka: false, label: null, urut: 50 },
    // Ayam
    { j: idByNama['Ayam'],   nama: 'Beri Pakan Pagi',    sub: null,    angka: false, label: null, urut: 10 },
    { j: idByNama['Ayam'],   nama: 'Beri Pakan Sore',    sub: null,    angka: false, label: null, urut: 20 },
    { j: idByNama['Ayam'],   nama: 'Panen Telur',        sub: null,    angka: false, label: null, urut: 25 },
    { j: idByNama['Ayam'],   nama: 'Bersihkan Kandang',  sub: 'Pagi',  angka: false, label: null, urut: 40 },
    { j: idByNama['Ayam'],   nama: 'Bersihkan Kandang',  sub: 'Sore',  angka: false, label: null, urut: 50 },
    { j: idByNama['Ayam'],   nama: 'Konfirmasi Ayam Mati', sub: null,  angka: true,  label: 'Jumlah ekor yang mati', urut: 99 },
    // Kambing
    { j: idByNama['Kambing'], nama: 'Beri Pakan Pagi',   sub: null,    angka: false, label: null, urut: 10 },
    { j: idByNama['Kambing'], nama: 'Beri Pakan Sore',   sub: null,    angka: false, label: null, urut: 20 },
    { j: idByNama['Kambing'], nama: 'Beri Minum/Air',    sub: null,    angka: false, label: null, urut: 30 },
    { j: idByNama['Kambing'], nama: 'Perah Susu',        sub: null,    angka: false, label: null, urut: 35 },
    { j: idByNama['Kambing'], nama: 'Bersihkan Kandang', sub: 'Pagi',  angka: false, label: null, urut: 40 },
    { j: idByNama['Kambing'], nama: 'Bersihkan Kandang', sub: 'Sore',  angka: false, label: null, urut: 50 },
  ].filter((a) => a.j);

  // Langkah 1: pastikan jenis_ternak ada
  db.query(
    `INSERT IGNORE INTO jenis_ternak (nama, kategori, keterangan) VALUES ?`,
    [jenis.map((x) => [x.nama, x.kategori, x.keterangan])],
    (errJ) => {
      if (errJ) console.error('[Ternak Seed] jenis_ternak gagal:', errJ.message);
      // Langkah 2: pastikan master_aksi_ternak ada. Aksi default HANYA di-seed
      // untuk jenis yang BELUM punya aksi sama sekali. Dengan begitu setelah
      // admin mengelola daftar aksi (tambah/hapus/nonaktifkan), restart server
      // tidak mengembalikan aksi bawaan.
      db.query('SELECT id, nama FROM jenis_ternak ORDER BY id', (errJt, jt) => {
        if (errJt || !jt || !jt.length) return;
        const idByNama = {};
        jt.forEach((r) => { idByNama[r.nama] = r.id; });
        db.query(
          'SELECT jenis_ternak_id, COUNT(*) AS n FROM master_aksi_ternak GROUP BY jenis_ternak_id',
          (errCnt, cnt) => {
            if (errCnt) return seedLokasiKandang(idByNama);
            const adaAksi = {};
            (cnt || []).forEach((r) => { adaAksi[r.jenis_ternak_id] = Number(r.n) > 0; });
            const aksi = aksiList(idByNama).filter((a) => !adaAksi[a.j]);
            let done = 0;
            if (!aksi.length) return seedLokasiKandang(idByNama);
            aksi.forEach((a) => {
              db.query(
                `INSERT IGNORE INTO master_aksi_ternak
                   (jenis_ternak_id, nama_aksi, sub_aksi, butuh_input_angka, label_input, urutan)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [a.j, a.nama, a.sub, a.angka ? 1 : 0, a.label, a.urut],
                () => { done++; if (done === aksi.length) seedLokasiKandang(idByNama); }
              );
            });
          }
        );
      });
    }
  );

  // Langkah 3: kategori Peternakan + lokasi kandang untuk tiap jenis
  function seedLokasiKandang(idByNama) {
    db.query(
      "INSERT IGNORE INTO kategori (nama, aktif) VALUES ('Peternakan', 1)",
      () => {
        const map = [
          { nama: 'Kandang Sapi',   jid: idByNama['Sapi'] },
          { nama: 'Kandang Ayam',   jid: idByNama['Ayam'] },
          { nama: 'Kandang Kambing', jid: idByNama['Kambing'] },
        ].filter((l) => l.jid);
        let done = 0;
        if (!map.length) return seedTernakRow(idByNama, {});
        const lokasiByJid = {};
        map.forEach((l) => {
          const namaKecil = l.nama.toLowerCase().replace('kandang ', '');
          db.query(
            "INSERT INTO lokasi (nama, keterangan, aktif) VALUES (?, ?, 1)",
            [l.nama, `Kandang untuk ternak ${namaKecil}`, 1],
            (e, res) => {
              if (!e && res && res.insertId) {
                // Jika lokasi sudah ada (duplicate), ambil id dari DB
                lokasiByJid[l.jid] = res.insertId;
              }
              done++;
              if (done === map.length) {
                // Pastikan kandang yang sudah ada ikut terpetakan
                const namaList = map.map((m) => m.nama);
                const placeholders = namaList.map(() => '?').join(',');
                db.query(
                  `SELECT id, nama FROM lokasi WHERE nama IN (${placeholders})`,
                  namaList,
                  (eL, rowsL) => {
                    if (rowsL) rowsL.forEach((r) => {
                      const m = map.find((x) => x.nama === r.nama);
                      if (m) lokasiByJid[m.jid] = r.id;
                    });
                    seedTernakRow(idByNama, lokasiByJid);
                  }
                );
              }
            }
          );
        });
      }
    );
  }

  // Langkah 4: TIDAK lagi menanam baris ternak otomatis. Tabel `ternak` diisi
  // manual oleh admin lewat form "Tambah Peternakan" (POST /api/admin/ternak),
  // maksimal 1 baris per jenis (ditegakkan UNIQUE uq_ternak_jenis). Startup
  // hanya memastikan kolom migrasi untuk DB lama tetap siap.
  function seedTernakRow(idByNama, lokasiByJid) {
    console.log('[Ternak Seed] ternak menunggu input admin (tidak di-seed otomatis) ✅');
    migrasiStatusTernak();
  }
}

// Migrasi ternak: pastikan kolom nama_tampilan & status_publikasi ada (untuk DB
// lama) lalu backfill — nama_tampilan kosong diisi nama jenis, status draft.
// Idempotent, aman dijalankan tiap startup.
function migrasiStatusTernak() {
  const tambahKolom = (nama, definisi, cb) => {
    db.query(`SHOW COLUMNS FROM ternak LIKE '${nama}'`, (err, rows) => {
      if (err || (rows && rows.length)) return cb();
      db.query(`ALTER TABLE ternak ADD COLUMN ${definisi}`, (err2) => {
        if (err2) console.error(`[Ternak Migrasi] tambah ${nama} gagal:`, err2.message);
        cb();
      });
    });
  };
  tambahKolom('nama_tampilan', 'nama_tampilan VARCHAR(255) NULL AFTER jenis_ternak_id', () => {
    tambahKolom('status_publikasi', `status_publikasi ENUM('draft','dipublikasikan') NOT NULL DEFAULT 'draft'`, () => {
      db.query(
        `UPDATE ternak t JOIN jenis_ternak jt ON jt.id = t.jenis_ternak_id
            SET t.nama_tampilan = COALESCE(NULLIF(t.nama_tampilan,''), jt.nama),
                t.status_publikasi = IFNULL(NULLIF(t.status_publikasi,''), 'draft')`,
        (err) => {
          if (err) console.error('[Ternak Migrasi] backfill ternak gagal:', err.message);
          else console.log('[Ternak Migrasi] ternak: nama_tampilan & status_publikasi siap ✅');
        }
      );
    });
  });
}

// ── Migrasi activity_tasks: unique key wajib menyertakan santri_id ──────────
// (fix multi-santri: index lama (schedule_id,tanggal) membuang task santri ke-2+;
//  urutan penting: tambah index BARU dulu — wajib memenuhi FK schedule_id —
//  baru hapus index lama. idempotent, aman tiap start)
db.query("SHOW INDEX FROM activity_tasks WHERE Key_name = 'uq_schedule_santri_tanggal'", (errNew, rowsNew) => {
  if (errNew) return;
  const dropIndexLama = () => {
    db.query("SHOW INDEX FROM activity_tasks WHERE Key_name = 'uq_schedule_tanggal'", (errOld, rowsOld) => {
      if (errOld || !rowsOld || rowsOld.length === 0) return;
      db.query("ALTER TABLE activity_tasks DROP INDEX uq_schedule_tanggal", (errDrop) => {
        if (errDrop) console.error('[Migrasi] drop uq_schedule_tanggal gagal:', errDrop.message);
        else console.log('[Migrasi] activity_tasks: index lama uq_schedule_tanggal dihapus ✅');
      });
    });
  };
  if (rowsNew && rowsNew.length > 0) {
    console.log('[Migrasi] activity_tasks: unique (schedule_id, santri_id, tanggal_tugas) sudah aktif ✅');
    dropIndexLama();
    return;
  }
  db.query(
    "ALTER TABLE activity_tasks ADD UNIQUE KEY uq_schedule_santri_tanggal (schedule_id, santri_id, tanggal_tugas)",
    (errAdd) => {
      if (errAdd && errAdd.code !== 'ER_DUP_KEYNAME') {
        console.error('[Migrasi] tambah unique (schedule_id, santri_id, tanggal_tugas) gagal:', errAdd.message);
        return;
      }
      console.log('[Migrasi] activity_tasks: unique (schedule_id, santri_id, tanggal_tugas) aktif ✅');
      dropIndexLama();
    }
  );
});

// Unik case-insensitive kegiatan per lokasi (idempotent — aman dijalankan ulang)
db.query("SHOW COLUMNS FROM kegiatan_lokasi LIKE 'nama_lower'", (errMigr, rowsMigr) => {
  if (errMigr) return;
  if (!rowsMigr || rowsMigr.length === 0) {
    db.query(
      "ALTER TABLE kegiatan_lokasi ADD COLUMN nama_lower VARCHAR(255) GENERATED ALWAYS AS (LOWER(TRIM(nama))) STORED",
      (err2) => {
        if (err2) {
          console.error('[Migrasi] tambah kegiatan_lokasi.nama_lower gagal:', err2.message);
          return;
        }
        db.query(
          "ALTER TABLE kegiatan_lokasi ADD UNIQUE KEY uq_lokasi_nama_lower (lokasi_id, nama_lower)",
          (err3) => {
            if (err3 && err3.code !== 'ER_DUP_KEYNAME') {
              console.error('[Migrasi] tambah unique kegiatan_lokasi gagal:', err3.message);
              return;
            }
            console.log('[Migrasi] kegiatan_lokasi: unik case-insensitive (lokasi_id, nama) aktif ✅');
          }
        );
      }
    );
  }
});

// Pastikan kolom FK lokasi/kategori ada (idempotent — aman dijalankan ulang)
db.query("SHOW COLUMNS FROM tanaman LIKE 'lokasi_id'", (err, rows) => {
  if (err) return;
  if (!rows || rows.length === 0) {
    db.query("ALTER TABLE tanaman ADD COLUMN lokasi_id INT NULL, ADD FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE SET NULL", (err2) => {
      if (err2) console.error('[Migrasi] tambah tanaman.lokasi_id gagal:', err2.message);
      else console.log('[Migrasi] tanaman: lokasi_id ditambah ✅');
    });
  }
});
db.query("SHOW COLUMNS FROM activity_schedules LIKE 'lokasi_id'", (err, rows) => {
  if (err) return;
  if (!rows || rows.length === 0) {
    db.query("ALTER TABLE activity_schedules ADD COLUMN kategori_id INT NULL, ADD COLUMN lokasi_id INT NULL, ADD FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL, ADD FOREIGN KEY (lokasi_id) REFERENCES lokasi(id) ON DELETE SET NULL", (err2) => {
      if (err2) console.error('[Migrasi] tambah activity_schedules lokasi/kategori gagal:', err2.message);
      else console.log('[Migrasi] activity_schedules: lokasi_id & kategori_id ditambah ✅');
    });
  }
});
}

// ── CRON: generate tiket activity_tasks setiap hari jam 00:01 ────────────────
function generateTiketHarian() {
  const todayStr = toDateStr(new Date());
  console.log(`[CRON] Generate tiket untuk tanggal: ${todayStr}`);

  const qAktif = `
    SELECT s.*
    FROM activity_schedules s
    WHERE s.status = 'aktif'
      AND s.tanggal_mulai <= ?
      AND (s.tanggal_selesai IS NULL OR s.tanggal_selesai >= ?)
  `;
  db.query(qAktif, [todayStr, todayStr], (err, schedules) => {
    if (err) { console.error('[CRON] Query jadwal aktif gagal:', err.message); return; }

    schedules.forEach((sch) => {
      // Parse penanggung_jawab CSV to array (kolom bisa number untuk data lama)
      const penanggungJawabIds = sch.penanggung_jawab ? String(sch.penanggung_jawab).split(',').map(id => String(id).trim()).filter(Boolean) : [];
      
      if (penanggungJawabIds.length === 0) {
        console.log(`[CRON] Schedule ${sch.id} tidak memiliki penanggung jawab, skip`);
        return;
      }

      // Cek apakah hari ini adalah hari jatuh tempo berdasarkan interval
      const mulai = new Date(sch.tanggal_mulai);
      mulai.setHours(0, 0, 0, 0);
      const today = new Date(todayStr);
      today.setHours(0, 0, 0, 0);
      const selisihHari = Math.round((today - mulai) / (1000 * 60 * 60 * 24));

      let jatuhTempo = false;
      if (sch.pola_perulangan === 'sekali') {
        jatuhTempo = selisihHari === 0;
      } else {
        const intv = parseInt(sch.interval_hari, 10);
        jatuhTempo = selisihHari >= 0 && (Number.isFinite(intv) ? selisihHari % intv === 0 : false);
      }

      if (!jatuhTempo) return;

      // Generate tiket untuk setiap penanggung jawab
      penanggungJawabIds.forEach((santriId) => {
        // Fetch nama santri
        db.query('SELECT nama FROM pendaftar_santri WHERE id=?', [santriId], (err, rows) => {
          if (err) {
            console.error(`[CRON] Gagal fetch nama santri ${santriId}:`, err.message);
            return;
          }
          const namaSantri = rows && rows.length ? rows[0].nama : null;
          if (!namaSantri) return;

          // Insert tiket — IGNORE jika sudah ada (UNIQUE KEY)
          const qInsert = `
            INSERT IGNORE INTO activity_tasks
              (schedule_id, santri_id, nama_santri, tanggal_tugas, status)
            VALUES (?, ?, ?, ?, 'pending')
          `;
          db.query(qInsert, [sch.id, santriId, namaSantri, todayStr], (err) => {
            if (err) console.error(`[CRON] Gagal buat tiket schedule ${sch.id} santri ${santriId}:`, err.message);
            else console.log(`[CRON] ✅ Tiket dibuat: schedule=${sch.id} | santri=${namaSantri} | ${todayStr}`);
          });
        });
      });

      // Jika sekali jalan, tandai master jadi selesai
      if (sch.pola_perulangan === 'sekali') {
        db.query("UPDATE activity_schedules SET status='selesai' WHERE id=?", [sch.id]);
      }
    });
  });
}

const cronHandles = new Set();

// Jadwalkan cron setiap jam 00:01 — tanpa library eksternal
function scheduleCron() {
  const now    = new Date();
  const target = new Date(now);
  target.setHours(0, 1, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1); // besok jika sudah lewat
  const msUntil = target - now;

  const initialTimer = setTimeout(() => {
    generateTiketHarian();
    const interval = setInterval(generateTiketHarian, 24 * 60 * 60 * 1000); // setiap 24 jam
    cronHandles.add(interval);
  }, msUntil);
  cronHandles.add(initialTimer);

  console.log(`[CRON] Dijadwalkan jam 00:01 (dalam ${Math.round(msUntil / 60000)} menit)`);
}

function stopCron() {
  for (const handle of cronHandles) clearTimeout(handle);
  cronHandles.clear();
}

if (process.env.ENABLE_TICKET_CRON === '1') scheduleCron();

// ── ACTIVITY SCHEDULES (MASTER) ──────────────────────────────────────────────

// GET daftar Santri Penerima (khusus admin) — hanya yang berstatus "diterima"
app.get('/api/santri-pemilih', authenticateAdminToken, (req, res) => {
  const { kelas, kamar } = req.query;

  // Dev aid: log jumlah baris per status
  db.query("SELECT status_pendaftaran, COUNT(*) AS c FROM pendaftar_santri GROUP BY status_pendaftaran", (errLog, rowsLog) => {
    if (errLog) console.error('[/api/santri-pemilih] Gagal grouping status:', errLog.message);
    else console.log('[/api/santri-pemilih] Jumlah per status:', (rowsLog || []).map(r => `${r.status_pendaftaran}=${r.c}`).join(' | ') || 'kosong');
  });

  let q = `SELECT id, username, nama, kelas, kamar
           FROM pendaftar_santri
           WHERE LOWER(TRIM(status_pendaftaran)) = 'diterima'`;
  const params = [];
  if (kelas)   { q += ` AND LOWER(TRIM(kelas)) = ?`; params.push(String(kelas).trim()); }
  if (kamar)   { q += ` AND LOWER(TRIM(kamar)) = ?`; params.push(String(kamar).trim()); }
  q += ` ORDER BY nama ASC`;

  db.query(q, params, (err, results) => {
    if (err) {
      console.error('[/api/santri-pemilih] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`[/api/santri-pemilih] Mengembalikan ${results.length} santri diterima`);
    res.json(results || []);
  });
});

// GET daftar santri yang sudah terdaftar (punya akun) — untuk dropdown admin
app.get('/api/santri-terdaftar', authenticateAdminToken, (req, res) => {
  // Ambil semua santri yang sudah punya akun di pendaftar_santri
  const q = `SELECT id, nama, username, status_pendaftaran FROM pendaftar_santri ORDER BY nama ASC`;
  db.query(q, (err, results) => {
    if (err) {
      console.error('[/api/santri-terdaftar] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log(`[/api/santri-terdaftar] Returning ${results.length} santri`);
    res.json(results || []);
  });
});

// GET rekap kinerja santri (HARUS sebelum /api/tugas/:id agar tidak conflict)
app.get('/api/rekap-tugas', authenticateAdminToken, (req, res) => {
  const q = `
    SELECT
      t.santri_id,
      t.nama_santri,
      COUNT(*)                                              AS total_tugas,
      SUM(t.status = 'selesai')                            AS selesai,
      SUM(t.status = 'pending')                            AS pending,
      SUM(t.status = 'dilewati')                           AS dilewati,
      ROUND(SUM(t.status = 'selesai') / COUNT(*) * 100, 1) AS persen_selesai
    FROM activity_tasks t
    GROUP BY t.santri_id, t.nama_santri
    ORDER BY selesai DESC
  `;
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET semua jadwal + nama penanggung jawab
app.get('/api/jadwal', authenticateAdminToken, (req, res) => {
  const q = `
    SELECT s.*, p.nama AS nama_pj, p.username AS username_pj
    FROM activity_schedules s
    LEFT JOIN pendaftar_santri p ON s.penanggung_jawab = p.id
    ORDER BY s.id DESC
  `;
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET detail satu jadwal
app.get('/api/jadwal/:id', authenticateAdminToken, (req, res) => {
  const q = `
    SELECT s.*, p.nama AS nama_pj
    FROM activity_schedules s
    LEFT JOIN pendaftar_santri p ON s.penanggung_jawab = p.id
    WHERE s.id = ?
  `;
  db.query(q, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Tidak ditemukan' });
    db.query(
      `SELECT at.tanaman_id, at.aksi, t.nama, t.gambar
         FROM aktivitas_tanaman at
         JOIN tanaman t ON t.id = at.tanaman_id
        WHERE at.aktivitas_id = ?
        ORDER BY at.id ASC`,
      [req.params.id],
      (err2, plants) => {
        if (err2) return res.status(500).json({ error: err2.message });
        db.query(
          `SELECT atr.ternak_id, atr.master_aksi_id, tr.nama, tk.foto
             FROM aktivitas_ternak atr
             JOIN ternak tk ON tk.id = atr.ternak_id
             JOIN jenis_ternak tr ON tr.id = tk.jenis_ternak_id
            WHERE atr.aktivitas_id = ?
            ORDER BY atr.id ASC`,
          [req.params.id],
          (err3, ternaks) => {
            if (err3) return res.status(500).json({ error: err3.message });
            res.json({
              ...results[0],
              tanaman_terpilih: kelompokkanTanamanPivot(plants),
              ternak_terpilih: kelompokkanTernakPivot(ternaks),
            });
          }
        );
      }
    );
  });
});

// Helper: generate semua tiket untuk satu jadwal dari tanggal_mulai s/d hari ini
function generateTiketUntukJadwal(sch, namaSantri, callback) {
  const todayStr = toDateStr(new Date());
  let mulai = new Date(sch.tanggal_mulai);
  if (isNaN(mulai.getTime())) mulai = new Date(); // tanggal kosong/invalid → pakai hari ini
  mulai.setHours(0, 0, 0, 0);
  const today = new Date(todayStr);
  today.setHours(0, 0, 0, 0);

  const tanggalList = [];
  if (sch.pola_perulangan === 'sekali') {
    // Hanya tanggal_mulai
    tanggalList.push(toDateStr(mulai));
  } else {
    let cur = new Date(mulai);
    while (cur <= today) {
      tanggalList.push(toDateStr(cur));
      cur = new Date(cur.getTime() + sch.interval_hari * 24 * 60 * 60 * 1000);
    }
  }

  if (tanggalList.length === 0) return callback && callback();

  let done = 0;
  tanggalList.forEach((tgl) => {
    db.query(
      `INSERT IGNORE INTO activity_tasks (schedule_id, santri_id, nama_santri, tanggal_tugas, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [sch.id, sch.penanggung_jawab, namaSantri, tgl],
      () => { done++; if (done === tanggalList.length && callback) callback(); }
    );
  });
}

// Helper: kumpulkan santri_ids (bisa dari `santri_ids` array atau `penanggung_jawab` CSV)
function kumpulkanSantriIds(body) {
  const raw = body.santri_ids !== undefined ? body.santri_ids : body.penanggung_jawab;
  let arr = [];
  if (Array.isArray(raw)) arr = raw;
  else if (raw != null && raw !== '') arr = String(raw).split(',');
  const ids = arr.map(id => parseInt(String(id).trim(), 10)).filter(n => Number.isFinite(n) && n > 0);
  return [...new Set(ids)];
}

// Helper: verifikasi semua santri berstatus "diterima" (case & spasi tepi diabaikan).
// cb(invalidIds, err) — invalidIds berisi semua id yang belum/tidak diterima.
function verifikasiSantriDiterima(ids, cb) {
  if (!ids.length) return cb([], null);
  const placeholders = ids.map(() => '?').join(',');
  const q = `SELECT id, status_pendaftaran FROM pendaftar_santri
             WHERE id IN (${placeholders})
             AND LOWER(TRIM(status_pendaftaran)) = 'diterima'`;
  db.query(q, ids, (err, rows) => {
    if (err) return cb([], err);
    const valid = new Set((rows || []).map(r => Number(r.id)));
    cb(ids.filter(id => !valid.has(Number(id))), null);
  });
}

// Helper: ubah array (bisa berisi string/angka) menjadi array id unik positif
function kumpulkanIdArray(raw) {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map(id => parseInt(String(id).trim(), 10)).filter(n => Number.isFinite(n) && n > 0))];
}

// Helper: pastikan ada nama kategori sebagai string (kolom kategori NOT NULL).
// cb(nama) — pakai string lama, atau ambil dari tabel kategori_id, atau fallback 'Lainnya'.
function ambilNamaKategori(kategori, kategoriId, cb) {
  if (kategori && String(kategori).trim()) return cb(String(kategori).trim());
  if (!kategoriId) return cb('Lainnya');
  db.query("SELECT nama FROM kategori WHERE id = ?", [kategoriId], (err, rows) => {
    if (err || !rows || !rows.length) return cb('Lainnya');
    cb(rows[0].nama);
  });
}

// Helper: verifikasi semua kegiatan benar-benar milik lokasi terpilih. cb(err, jumlahCocok)
function verifikasiKegiatanMilikLokasi(lokasiId, kegiatanIds, cb) {
  if (!kegiatanIds.length) return cb(null, 0);
  const placeholders = kegiatanIds.map(() => '?').join(',');
  db.query(
    `SELECT COUNT(*) AS c FROM kegiatan_lokasi WHERE lokasi_id = ? AND id IN (${placeholders})`,
    [lokasiId, ...kegiatanIds],
    (err, rows) => {
      if (err) return cb(err);
      cb(null, rows && rows.length ? rows[0].c : 0);
    }
  );
}

// Helper: pastikan semua tanaman benar-benar milik lokasi terpilih. cb(err, invalid[]) berisi {id, nama}.
function verifikasiTanamanMilikLokasi(lokasiId, tanamanIds, cb) {
  if (!tanamanIds.length) return cb(null, []);
  const placeholders = tanamanIds.map(() => '?').join(',');
  db.query(
    `SELECT t.id, t.nama FROM tanaman t
      WHERE t.id IN (${placeholders})
        AND (t.lokasi_id IS NULL OR t.lokasi_id <> ?)`,
    [...tanamanIds, lokasiId],
    (err, rows) => {
      if (err) return cb(err);
      cb(null, rows || []);
    }
  );
}

// Helper: normalisasi pilihan tanaman menjadi [{ id, aksi: [] }].
// Sumber bisa format baru `tanaman_terpilih` = [{ tanaman_id, aksi: ['siram',...] }]
// atau format lama `tanaman_ids` = [1,2,...] (tanpa aksi, lintas kategori).
function normalisasiTanamanTerpilih(body) {
  const raw = body.tanaman_terpilih;
  const legacy = kumpulkanIdArray(body.tanaman_ids);
  const hasil = new Map();
  const tambah = (id, aksi) => {
    const key = parseInt(String(id).trim(), 10);
    if (!Number.isFinite(key) || key <= 0) return;
    if (!hasil.has(key)) hasil.set(key, new Set());
    if (Array.isArray(aksi)) {
      aksi.forEach((a) => {
        const aStr = String(a).trim().toLowerCase();
        if (AKSI_PERAWATAN.includes(aStr)) hasil.get(key).add(aStr);
      });
    }
  };
  if (Array.isArray(raw) && raw.length > 0) {
    raw.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      tambah(item.tanaman_id !== undefined ? item.tanaman_id : item.id, item.aksi);
    });
  } else {
    legacy.forEach((id) => tambah(id, []));
  }
  return [...hasil.entries()].map(([id, setAksi]) => ({ id, aksi: [...setAksi] }));
}

// Helper: ubah baris pivot aktivitas_tanaman jadi [{ tanaman_id, aksi:[...], nama, gambar }]
function kelompokkanTanamanPivot(rows) {
  const map = new Map();
  (rows || []).forEach((r) => {
    const key = Number(r.tanaman_id);
    if (!map.has(key)) map.set(key, { tanaman_id: key, nama: r.nama, gambar: r.gambar, aksi: [] });
    if (r.aksi) map.get(key).aksi.push(r.aksi);
  });
  return [...map.values()];
}

// Helper: string info tanaman untuk tugas (GROUP_CONCAT "nama||aksi;;nama||aksi")
function tanamanInfoSubquery(aliasS = 's') {
  return `(SELECT GROUP_CONCAT(CONCAT(t.nama, '||', at.aksi) SEPARATOR ';;')
            FROM aktivitas_tanaman at
            JOIN tanaman t ON t.id = at.tanaman_id
           WHERE at.aktivitas_id = ${aliasS}.id AND at.aksi IS NOT NULL)`;
}

// ── Helper ternak (mode Peternakan di Jadwal Aktivitas) ─────────────────────
// Normalisasi pilihan ternak menjadi [{ id, master_aksi_ids: [] }].
// `ternak_terpilih` = [{ ternak_id, aksi: [master_aksi_id, ...] }].
function normalisasiTernakTerpilih(body) {
  const raw = body.ternak_terpilih;
  const hasil = new Map();
  const tambah = (id, aksi) => {
    const key = parseInt(String(id).trim(), 10);
    if (!Number.isFinite(key) || key <= 0) return;
    if (!hasil.has(key)) hasil.set(key, new Set());
    if (Array.isArray(aksi)) {
      aksi.forEach((a) => {
        const aId = parseInt(String(a).trim(), 10);
        if (Number.isFinite(aId) && aId > 0) hasil.get(key).add(aId);
      });
    }
  };
  if (Array.isArray(raw) && raw.length > 0) {
    raw.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      tambah(item.ternak_id !== undefined ? item.ternak_id : item.id, item.aksi);
    });
  }
  return [...hasil.entries()].map(([id, s]) => ({ id, master_aksi_ids: [...s] }));
}

// Helper: ubah baris pivot aktivitas_ternak jadi [{ ternak_id, aksi:[master_aksi_id], nama, foto }]
function kelompokkanTernakPivot(rows) {
  const map = new Map();
  (rows || []).forEach((r) => {
    const key = Number(r.ternak_id);
    if (!map.has(key)) map.set(key, { ternak_id: key, nama: r.nama, foto: r.foto, aksi: [] });
    if (r.master_aksi_id) map.get(key).aksi.push(Number(r.master_aksi_id));
  });
  return [...map.values()];
}

// Helper: string info ternak untuk tugas (GROUP_CONCAT "nama||namaAksi;;nama||namaAksi")
function ternakInfoSubquery(aliasS = 's') {
  return `(SELECT GROUP_CONCAT(CONCAT(tr.nama, '||', m.nama_aksi, IFNULL(CONCAT(' (', m.sub_aksi, ')'), '')) SEPARATOR ';;')
            FROM aktivitas_ternak atr
            JOIN ternak tk ON tk.id = atr.ternak_id
            JOIN jenis_ternak tr ON tr.id = tk.jenis_ternak_id
            JOIN master_aksi_ternak m ON m.id = atr.master_aksi_id
           WHERE atr.aktivitas_id = ${aliasS}.id AND atr.master_aksi_id IS NOT NULL)`;
}

// Helper: simpan relasi kegiatan/tanaman/santri ke pivot (replace seluruhnya)
// tanamanData: [{ id, aksi: [] }] — tiap aksi jadi SATU baris aktivitas_tanaman
// (range multibaris, valid join dgn aksi NULL bila tidak ada aksi).
// ternakData: [{ id, master_aksi_ids: [] }] — tiap aksi jadi SATU baris aktivitas_ternak.
function simpanRelasiAktivitas(aktivitasId, kegiatanIds, tanamanData, ternakData, santriIds, cb) {
  const hapusSemua = (done) => {
    const tasks = [
      cbx => db.query('DELETE FROM aktivitas_kegiatan WHERE aktivitas_id=?', [aktivitasId], cbx),
      cbx => db.query('DELETE FROM aktivitas_tanaman WHERE aktivitas_id=?', [aktivitasId], cbx),
      cbx => db.query('DELETE FROM aktivitas_ternak WHERE aktivitas_id=?', [aktivitasId], cbx),
      cbx => db.query('DELETE FROM aktivitas_santri WHERE aktivitas_id=?', [aktivitasId], cbx),
    ];
    let i = 0;
    const next = () => {
      if (i >= tasks.length) return done(null);
      tasks[i++]((e) => e ? done(e) : next());
    };
    next();
  };

  const insertBatch = (tabel, ids, done) => {
    if (!ids.length) return done(null);
    let i = 0;
    const next = () => {
      if (i >= ids.length) return done(null);
      const id = ids[i++];
      db.query(`INSERT IGNORE INTO ${tabel} (aktivitas_id, ${tabel === 'aktivitas_santri' ? 'santri_id' : 'kegiatan_id'}) VALUES (?, ?)`, [aktivitasId, id], (e) => e ? done(e) : next());
    };
    next();
  };

  // Tanaman dipilih: satu baris per aksi (jika tidak ada aksi → satu baris aksi NULL)
  const insertTanaman = (plants, done) => {
    if (!plants.length) return done(null);
    let i = 0;
    const next = () => {
      if (i >= plants.length) return done(null);
      const p = plants[i++];
      const aksiList = p.aksi && p.aksi.length ? p.aksi : [null];
      let j = 0;
      const nextAksi = () => {
        if (j >= aksiList.length) return next();
        const aksi = aksiList[j++];
        db.query('INSERT IGNORE INTO aktivitas_tanaman (aktivitas_id, tanaman_id, aksi) VALUES (?, ?, ?)', [aktivitasId, p.id, aksi], (e) => e ? done(e) : nextAksi());
      };
      nextAksi();
    };
    next();
  };

  // Ternak dipilih: satu baris per master_aksi_id (pivot aktivitas_ternak)
  const insertTernak = (ternaks, done) => {
    if (!ternaks.length) return done(null);
    let i = 0;
    const next = () => {
      if (i >= ternaks.length) return done(null);
      const t = ternaks[i++];
      const aksiList = t.master_aksi_ids && t.master_aksi_ids.length ? t.master_aksi_ids : [null];
      let j = 0;
      const nextAksi = () => {
        if (j >= aksiList.length) return next();
        const mid = aksiList[j++];
        db.query('INSERT IGNORE INTO aktivitas_ternak (aktivitas_id, ternak_id, master_aksi_id) VALUES (?, ?, ?)', [aktivitasId, t.id, mid], (e) => e ? done(e) : nextAksi());
      };
      nextAksi();
    };
    next();
  };

  hapusSemua((errHapus) => {
    if (errHapus) return cb(errHapus);
    insertBatch('aktivitas_kegiatan', kegiatanIds, (errK) => {
      if (errK) return cb(errK);
      insertTanaman(tanamanData, (errT) => {
        if (errT) return cb(errT);
        insertTernak(ternakData || [], (errTr) => {
          if (errTr) return cb(errTr);
          insertBatch('aktivitas_santri', santriIds, (errS) => cb(errS));
        });
      });
    });
  });
}

// POST buat jadwal baru — langsung generate tiket ke santri (multi-santri support)
// Mode Pertanian/Perkebunan: pilih TANAMAN + aksi (tanaman_terpilih), lokasi/kegiatan opsional.
// Mode Peternakan: pilih TERNAK + aksi (ternak_terpilih), lokasi/kegiatan opsional.
// Mode non-Pertanian/-Peternakan: tetap wajib lokasi + kegiatan (tanaman terkait lokasi, opsional).
app.post('/api/jadwal', authenticateAdminToken, (req, res) => {
  const { nama_aktivitas, kategori, kategori_id, lokasi_id, deskripsi, pola_perulangan, interval_hari, tanggal_mulai, jam_mulai, jam_selesai, tanggal_selesai } = req.body;
  const santriIdArray = kumpulkanSantriIds(req.body);
  const kegiatanIds = kumpulkanIdArray(req.body.kegiatan_lokasi_ids);
  const tanamanData = normalisasiTanamanTerpilih(req.body);
  const ternakData = normalisasiTernakTerpilih(req.body);

  console.log('[POST /api/jadwal] Menerima:', { nama_aktivitas, kategori, kategori_id, lokasi_id, pola_perulangan, tanggal_mulai, santriIdArray, kegiatanIds, tanamanData, ternakData });

  verifikasiSantriDiterima(santriIdArray, (invalid, err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (invalid.length > 0) {
      console.warn(`[POST /api/jadwal] DIBATALKAN — santri belum diterima: ${invalid.join(', ')}`);
      return res.status(400).json({
        error: `Terdapat santri yang belum berstatus "Diterima" (id: ${invalid.join(', ')}). Jadwal tidak disimpan.`
      });
    }

    ambilNamaKategori(kategori, kategori_id, (namaKategori) => {
      const isPertanian = /pertanian|perkebunan/i.test(namaKategori || '');
      const isPeternakan = /peternakan/i.test(namaKategori || '');
      const isProduksi = isPertanian || isPeternakan;

      if (isPertanian && tanamanData.length === 0) {
        return res.status(400).json({ error: 'Kategori pertanian wajib memilih minimal satu tanaman.' });
      }
      if (isPeternakan && ternakData.length === 0) {
        return res.status(400).json({ error: 'Kategori peternakan wajib memilih minimal satu jenis ternak.' });
      }
      if (!isProduksi) {
        if (!lokasi_id) return res.status(400).json({ error: 'Lokasi wajib dipilih.' });
        if (kegiatanIds.length === 0) return res.status(400).json({ error: 'Minimal satu kegiatan harus dipilih.' });
      }
      const lokasiFinal = isProduksi ? (lokasi_id || null) : lokasi_id;

      const simpanJadwal = (tanamanFinal, ternakFinal) => {
        const penanggungJawabString = santriIdArray.length > 0 ? santriIdArray[0] : null;
        const interval = pola_perulangan === 'sekali' ? 1 : parseInt(interval_hari) || 7;

        db.query(
          `INSERT INTO activity_schedules (nama_aktivitas, kategori, kategori_id, lokasi_id, deskripsi, pola_perulangan, interval_hari, tanggal_mulai, jam_mulai, jam_selesai, tanggal_selesai, penanggung_jawab)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [nama_aktivitas, namaKategori, kategori_id || null, lokasiFinal, deskripsi || null, pola_perulangan, interval,
           tanggal_mulai, jam_mulai || '08:00', jam_selesai || '09:00', tanggal_selesai || null, penanggungJawabString],
          (errIns, result) => {
            if (errIns) {
              console.error('[POST /api/jadwal] DB Error:', errIns.message);
              return res.status(500).json({ error: errIns.message });
            }
          const scheduleId = result.insertId;
          console.log(`[POST /api/jadwal] Jadwal tersimpan dengan ID: ${scheduleId}`);

          // Simpan relasi kegiatan/tanaman/ternak (dengan aksi)/santri ke pivot
          simpanRelasiAktivitas(scheduleId, isProduksi ? [] : kegiatanIds, tanamanFinal, ternakFinal, santriIdArray, (errRel) => {
            if (errRel) console.error('[POST /api/jadwal] Gagal simpan relasi:', errRel.message);

            // Generate tiket untuk semua santri yang ditunjuk
            if (santriIdArray.length > 0) {
              let completed = 0;
              const total = santriIdArray.length;

              santriIdArray.forEach((santriId) => {
                db.query('SELECT nama FROM pendaftar_santri WHERE id=?', [santriId], (errNama, rows) => {
                  const namaSantri = rows && rows.length ? rows[0].nama : null;
                  console.log(`[POST /api/jadwal] Generate tiket untuk santri: ${namaSantri} (id=${santriId})`);
                  const sch = { id: scheduleId, pola_perulangan, interval_hari: interval, tanggal_mulai, penanggung_jawab: santriId };
                  generateTiketUntukJadwal(sch, namaSantri, () => {
                    completed++;
                    if (completed === total) {
                      // Jika sekali, tandai selesai
                      if (pola_perulangan === 'sekali') {
                        db.query("UPDATE activity_schedules SET status='selesai' WHERE id=?", [scheduleId]);
                      }
                      res.json({ message: `Jadwal berhasil dibuat dan tiket sudah dikirim ke ${total} santri`, id: scheduleId });
                    }
                  });
                });
              });
            } else {
              res.json({ message: 'Jadwal berhasil dibuat', id: scheduleId });
            }
          });
        }
      );
    }

      // Untuk mode non-Pertanian & non-Peternakan, verifikasi kegiatan & tanaman benar-benar milik lokasi.
      if (!isProduksi) {
        verifikasiKegiatanMilikLokasi(lokasiFinal, kegiatanIds, (errK, jumlahCocok) => {
          if (errK) return res.status(500).json({ error: errK.message });
          if (jumlahCocok !== kegiatanIds.length) {
            return res.status(400).json({
              error: 'Terdapat kegiatan yang bukan milik lokasi yang dipilih. Pilih ulang kegiatan untuk lokasi ini.'
            });
          }
          verifikasiTanamanMilikLokasi(lokasiFinal, tanamanData.map((p) => p.id), (errT, invalidTanaman) => {
            if (errT) return res.status(500).json({ error: errT.message });
            if (invalidTanaman.length > 0) {
              return res.status(400).json({
                error: 'Terdapat tanaman yang bukan milik lokasi terpilih: ' +
                  invalidTanaman.map((t) => `"${t.nama}"`).join(', ') +
                  '. Kaitkan tanaman itu ke lokasi ini lewat Manajemen Tanaman.'
              });
            }
            simpanJadwal(tanamanData, ternakData);
          });
        });
      } else {
        simpanJadwal(tanamanData, ternakData);
      }
    });
  });
});

// PUT update jadwal — jika PJ berubah, regenerate tiket pending mendatang ke PJ baru (multi-santri support)
app.put('/api/jadwal/:id', authenticateAdminToken, (req, res) => {
  const { nama_aktivitas, kategori, kategori_id, lokasi_id, deskripsi, pola_perulangan, interval_hari, tanggal_mulai, jam_mulai, jam_selesai, tanggal_selesai, status } = req.body;
  const santriIdArray = kumpulkanSantriIds(req.body);
  const kegiatanIds = kumpulkanIdArray(req.body.kegiatan_lokasi_ids);
  const tanamanData = normalisasiTanamanTerpilih(req.body);
  const ternakData = normalisasiTernakTerpilih(req.body);
  const penanggungJawabString = santriIdArray.length > 0 ? santriIdArray[0] : null;
  const interval = pola_perulangan === 'sekali' ? 1 : parseInt(interval_hari) || 7;

  verifikasiSantriDiterima(santriIdArray, (invalid, err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (invalid.length > 0) {
      return res.status(400).json({
        error: `Terdapat santri yang belum berstatus "Diterima" (id: ${invalid.join(', ')}). Perubahan tidak disimpan.`
      });
    }

    ambilNamaKategori(kategori, kategori_id, (namaKategori) => {
      const isPertanian = /pertanian|perkebunan/i.test(namaKategori || '');
      const isPeternakan = /peternakan/i.test(namaKategori || '');
      const isProduksi = isPertanian || isPeternakan;

      if (isPertanian && tanamanData.length === 0) {
        return res.status(400).json({ error: 'Kategori pertanian wajib memilih minimal satu tanaman.' });
      }
      if (isPeternakan && ternakData.length === 0) {
        return res.status(400).json({ error: 'Kategori peternakan wajib memilih minimal satu jenis ternak.' });
      }
      if (!isProduksi) {
        if (!lokasi_id) return res.status(400).json({ error: 'Lokasi wajib dipilih.' });
        if (kegiatanIds.length === 0) return res.status(400).json({ error: 'Minimal satu kegiatan harus dipilih.' });
      }
      const lokasiFinal = isProduksi ? (lokasi_id || null) : lokasi_id;

      const updateSchedule = () => {
        db.query(
          `UPDATE activity_schedules SET
             nama_aktivitas=?, kategori=?, kategori_id=?, lokasi_id=?, deskripsi=?, pola_perulangan=?,
             interval_hari=?, tanggal_mulai=?, jam_mulai=?, jam_selesai=?, tanggal_selesai=?,
             penanggung_jawab=?, status=?
           WHERE id=?`,
          [nama_aktivitas, namaKategori, kategori_id || null, lokasiFinal, deskripsi || null, pola_perulangan, interval,
           tanggal_mulai, jam_mulai || '08:00', jam_selesai || '09:00', tanggal_selesai || null, penanggungJawabString, status || 'aktif',
           req.params.id],
          (errUpd) => {
            if (errUpd) return res.status(500).json({ error: errUpd.message });
            simpanRelasiAktivitas(req.params.id, isProduksi ? [] : kegiatanIds, tanamanData, ternakData, santriIdArray, (errRel) => {
              if (errRel) console.error('[PUT /api/jadwal] Gagal simpan relasi:', errRel.message);
              res.json({ message: 'Jadwal berhasil diperbarui' });
            });
          }
        );
      };

      if (!isProduksi) {
        verifikasiKegiatanMilikLokasi(lokasiFinal, kegiatanIds, (errK, jumlahCocok) => {
          if (errK) return res.status(500).json({ error: errK.message });
          if (jumlahCocok !== kegiatanIds.length) {
            return res.status(400).json({
              error: 'Terdapat kegiatan yang bukan milik lokasi yang dipilih. Pilih ulang kegiatan untuk lokasi ini.'
            });
          }
          verifikasiTanamanMilikLokasi(lokasiFinal, tanamanData.map((p) => p.id), (errT, invalidTanaman) => {
            if (errT) return res.status(500).json({ error: errT.message });
            if (invalidTanaman.length > 0) {
              return res.status(400).json({
                error: 'Terdapat tanaman yang bukan milik lokasi terpilih: ' +
                  invalidTanaman.map((t) => `"${t.nama}"`).join(', ') +
                  '. Kaitkan tanaman itu ke lokasi ini lewat Manajemen Tanaman.'
              });
            }
            updateSchedule();
          });
        });
      } else {
        updateSchedule();
      }
    });
  });
});

// DELETE jadwal (cascade ke activity_tasks)
app.delete('/api/jadwal/:id', authenticateAdminToken, (req, res) => {
  db.query('DELETE FROM activity_schedules WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Jadwal dihapus' });
  });
});

// PATCH status jadwal (aktif / nonaktif / selesai)
app.patch('/api/jadwal/:id/status', authenticateAdminToken, (req, res) => {
  const { status } = req.body;
  db.query('UPDATE activity_schedules SET status=? WHERE id=?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Status diubah ke ${status}` });
  });
});

// ── ACTIVITY TASKS (TRANSAKSI) ────────────────────────────────────────────────

// GET semua tiket tugas (admin view)
app.get('/api/tugas', authenticateAdminToken, (req, res) => {
  const q = `
    SELECT t.*, s.nama_aktivitas, s.kategori, s.pola_perulangan
    FROM activity_tasks t
    JOIN activity_schedules s ON t.schedule_id = s.id
    ORDER BY t.tanggal_tugas DESC
  `;
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET tiket HARI INI milik santri yang login
// ⚠️ Harus SEBELUM /api/tugas/:id agar tidak dianggap param
app.get('/api/tugas/hari-ini', authenticateSantriToken, (req, res) => {
  const santriId = req.user.id;
  const todayStr = toDateStr(new Date());
  const q = `
    SELECT t.*, s.nama_aktivitas, s.kategori, s.deskripsi, ${tanamanInfoSubquery()} AS tanaman_info, ${ternakInfoSubquery()} AS ternak_info
    FROM activity_tasks t
    JOIN activity_schedules s ON t.schedule_id = s.id
    WHERE t.santri_id = ? AND t.tanggal_tugas = ?
    ORDER BY t.id ASC
  `;
  db.query(q, [santriId, todayStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET semua tugas milik santri yang login (riwayat lengkap)
app.get('/api/tugas/saya', authenticateSantriToken, (req, res) => {
  const santriId = req.user.id;
  const q = `
    SELECT t.*, s.nama_aktivitas, s.kategori, s.deskripsi, s.pola_perulangan, ${tanamanInfoSubquery()} AS tanaman_info, ${ternakInfoSubquery()} AS ternak_info
    FROM activity_tasks t
    JOIN activity_schedules s ON t.schedule_id = s.id
    WHERE t.santri_id = ?
    ORDER BY t.tanggal_tugas DESC
  `;
  db.query(q, [santriId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET tugas mendatang milik santri yang login (belum lewat, status pending)
app.get('/api/tugas/mendatang', authenticateSantriToken, (req, res) => {
  const santriId = req.user.id;
  const todayStr = toDateStr(new Date());
  const q = `
    SELECT t.*, s.nama_aktivitas, s.kategori, s.deskripsi, ${tanamanInfoSubquery()} AS tanaman_info, ${ternakInfoSubquery()} AS ternak_info
    FROM activity_tasks t
    JOIN activity_schedules s ON t.schedule_id = s.id
    WHERE t.santri_id = ? AND t.tanggal_tugas > ? AND t.status = 'pending'
    ORDER BY t.tanggal_tugas ASC
    LIMIT 10
  `;
  db.query(q, [santriId, todayStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET status santri lain dalam tugas yang sama (monitoring feature)
app.get('/api/tugas/:id/rekan', authenticateSantriToken, (req, res) => {
  const santriId = req.user.id;
  const taskId = req.params.id;
  
  // First get the schedule_id for this task
  db.query('SELECT schedule_id, tanggal_tugas FROM activity_tasks WHERE id=?', [taskId], (err, taskRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!taskRows.length) return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    
    const scheduleId = taskRows[0].schedule_id;
    const tanggalTugas = taskRows[0].tanggal_tugas;
    
    // Get all tasks for the same schedule and date (excluding current santri)
    const q = `
      SELECT t.id, t.santri_id, t.nama_santri, t.status, t.diselesaikan_at, t.catatan, t.foto_bukti
      FROM activity_tasks t
      WHERE t.schedule_id = ? AND t.tanggal_tugas = ? AND t.santri_id != ?
      ORDER BY t.status ASC, t.nama_santri ASC
    `;
    
    db.query(q, [scheduleId, tanggalTugas, santriId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });
});

// POST tiket manual (admin bisa buat tiket ad-hoc)
app.post('/api/tugas', authenticateAdminToken, (req, res) => {
  const { schedule_id, santri_id, nama_santri, tanggal_tugas } = req.body;
  db.query(
    `INSERT IGNORE INTO activity_tasks (schedule_id, santri_id, nama_santri, tanggal_tugas)
     VALUES (?, ?, ?, ?)`,
    [schedule_id, santri_id || null, nama_santri || null, tanggal_tugas],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Tiket tugas dibuat', id: result.insertId });
    }
  );
});

// PATCH tandai selesai — santri upload foto opsional
app.patch('/api/tugas/:id/selesai', authenticateSantriToken, uploadTugas.single('foto_bukti'), (req, res) => {
  const santriId  = req.user.id;
  const { catatan } = req.body;
  const fotoBukti = req.file ? req.file.filename : null;

  db.query('SELECT * FROM activity_tasks WHERE id=?', [req.params.id], (err, rows) => {
    if (err)            return res.status(500).json({ error: err.message });
    if (!rows.length)   return res.status(404).json({ message: 'Tiket tidak ditemukan' });
    if (rows[0].santri_id !== santriId)
                        return res.status(403).json({ message: 'Bukan tugas Anda' });
    if (rows[0].status === 'selesai')
                        return res.status(400).json({ message: 'Tugas sudah ditandai selesai' });

    const scheduleId = rows[0].schedule_id;

    db.query(
      `UPDATE activity_tasks SET status='selesai', catatan=?, foto_bukti=?, diselesaikan_at=NOW() WHERE id=?`,
      [catatan || null, fotoBukti, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Auto-catat riwayat perawatan tanaman & ternak (SATU sumber):
        // - jadwal Pertanian/Perkebunan → log_perawatan (per aksi siram/pupuk/panen)
        // - jadwal Peternakan → log_perawatan_ternak (per aksi dari master_aksi_ternak)
        const namaPerawat = req.user.nama || req.user.username || 'Santri';

        const catatTanaman = (cbDone) => {
          db.query(
            `SELECT at.tanaman_id, at.aksi
               FROM aktivitas_tanaman at
              WHERE at.aktivitas_id = ? AND at.aksi IS NOT NULL`,
            [scheduleId],
            (errPlants, plantRows) => {
              if (errPlants) return cbDone(errPlants);
              const rows = plantRows || [];
              let inserted = 0;
              if (!rows.length) return cbDone(null, 0);
              rows.forEach((pr) => {
                db.query(
                  `INSERT INTO log_perawatan
                     (tanaman_id, jadwal_id, santri_id, jenis_tindakan, laporan_singkat, gambar, nama_perawat, role_perawat, waktu_tindakan)
                   VALUES (?, ?, ?, ?, ?, ?, ?, 'Santri', NOW())`,
                  [pr.tanaman_id, scheduleId, santriId, pr.aksi, catatan || null, fotoBukti, namaPerawat],
                  (errLog) => {
                    if (errLog) console.error('[selesai] Gagal catat riwayat tanaman:', errLog.message);
                    inserted++;
                    if (inserted === rows.length) cbDone(null, rows.length);
                  }
                );
              });
            }
          );
        };

        const catatTernak = (cbDone) => {
          db.query(
            `SELECT atr.ternak_id, atr.master_aksi_id
               FROM aktivitas_ternak atr
              WHERE atr.aktivitas_id = ? AND atr.master_aksi_id IS NOT NULL`,
            [scheduleId],
            (errTernaks, ternakRows) => {
              if (errTernaks) return cbDone(errTernaks);
              const rows = ternakRows || [];
              let inserted = 0;
              if (!rows.length) return cbDone(null, 0);
              rows.forEach((tr) => {
                db.query(
                  `INSERT INTO log_perawatan_ternak
                     (ternak_id, master_aksi_id, jadwal_id, aktivitas_id, catatan, foto, diinput_oleh, nama_perawat, role_perawat)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Santri')`,
                  [tr.ternak_id, tr.master_aksi_id, scheduleId, scheduleId, catatan || null, fotoBukti, santriId, namaPerawat],
                  (errLog) => {
                    if (errLog) console.error('[selesai] Gagal catat riwayat ternak:', errLog.message);
                    inserted++;
                    if (inserted === rows.length) cbDone(null, rows.length);
                  }
                );
              });
            }
          );
        };

        let catatTanamanCount = 0, catatTernakCount = 0;
        catatTanaman((errP, nP) => {
          if (errP) return res.status(500).json({ error: errP.message });
          catatTanamanCount = nP;
          catatTernak((errT, nT) => {
            if (errT) return res.status(500).json({ error: errT.message });
            catatTernakCount = nT;
            res.json({
              message: 'Tugas berhasil ditandai selesai',
              riwayat_dicatat: catatTanamanCount + catatTernakCount,
              tanaman_dicatat: catatTanamanCount,
              ternak_dicatat: catatTernakCount,
            });
          });
        });
      }
    );
  });
});

// PATCH status tiket oleh admin
app.patch('/api/tugas/:id/status', authenticateAdminToken, (req, res) => {
  const { status } = req.body;
  db.query('UPDATE activity_tasks SET status=? WHERE id=?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Status tiket diubah ke ${status}` });
  });
});

// DELETE tiket tugas (admin)
app.delete('/api/tugas/:id', authenticateAdminToken, (req, res) => {
  db.query('DELETE FROM activity_tasks WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Tiket dihapus' });
  });
});

// ── TRIGGER MANUAL CRON ───────────────────────────────────────────────────────
app.post('/api/jadwal/generate-tiket', authenticateAdminToken, (req, res) => {
  generateTiketHarian();
  res.json({ message: 'Generate tiket dijalankan untuk hari ini' });
});

const PORT = process.env.PORT || 5000;

// Error handler JSON — ubah error Multer (ukuran/tipe file) jadi respons JSON yang jelas
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const pesan = err.code === 'LIMIT_FILE_SIZE'
      ? 'Ukuran foto maksimal 5 MB'
      : `Gagal mengunggah file: ${err.message}`;
    return res.status(400).json({ error: pesan });
  }
  if (err && err.message) {
    return res.status(400).json({ error: err.message });
  }
  console.error('[Error handler]', err);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
});

const REQUIRED_MIGRATION_VERSION = '20260925_consolidated';
let server;
let shuttingDown = false;

function connectDatabase() {
  return new Promise((resolve, reject) => {
    db.connect((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function startServer() {
  try {
    await connectDatabase();
    const migrationRows = await runQuery(
      'SELECT version FROM schema_migrations WHERE version = ? LIMIT 1',
      [REQUIRED_MIGRATION_VERSION]
    );
    if (!migrationRows.length) {
      throw new Error(`Migrasi ${REQUIRED_MIGRATION_VERSION} belum dijalankan. Jalankan npm run db:migrate.`);
    }
    server = app.listen(PORT, () => {
      console.log(`🚀 Server Backend berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Server tidak dimulai: ${error.message}`);
    process.exitCode = 1;
    db.destroy();
  }
}

function shutdownServer() {
  if (shuttingDown) return;
  shuttingDown = true;
  stopCron();
  const finish = () => {
    if (db && !db._closing) db.end(() => process.exit(0));
    else process.exit(0);
  };
  if (server) server.close(finish);
  else finish();
  setTimeout(() => process.exit(1), 10000).unref();
}

if (require.main === module) {
  process.once('SIGINT', shutdownServer);
  process.once('SIGTERM', shutdownServer);
  startServer();
}

module.exports = { app, db, startServer, shutdownServer };
