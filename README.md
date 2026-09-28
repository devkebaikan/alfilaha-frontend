# Alfilaha

Aplikasi web Alfilaha dengan frontend React/Vite dan backend Node.js/Express.

## Kebutuhan

- Node.js 18 atau lebih baru
- MariaDB yang sedang berjalan melalui XAMPP
- File `.env` yang berisi konfigurasi database dan `JWT_SECRET`

## Menjalankan

```bash
npm install
npm run db:migrate
npm run backend
```

Terminal kedua:

```bash
npm run dev
```

Frontend memakai `VITE_PUBLIC_API` atau `http://localhost:5000` secara langsung. Server backend berjalan di port 5000.

Untuk menjalankan migrasi dan backend dalam satu perintah:

```bash
bash START_SERVER.sh
```

Migrasi database harus dijalankan eksplisit dengan `npm run db:migrate` atau oleh `START_SERVER.sh`. Server tidak menjalankan DDL/seed otomatis.

## Cutover backend

Setelah memastikan port 5000 dapat dikendalikan dari environment yang sesuai:

```bash
bash ganti_backend.sh
```

Script menghentikan proses lokal yang terdeteksi, menjalankan migrasi, lalu menjalankan `server-update.cjs`. Jika port masih dijawab proses lain, script berhenti tanpa memaksa proses tersebut.

## Database

Backup aplikasi dapat dibuat dengan:

```bash
/opt/lampp/bin/mysqldump -uroot db_alfilaha > db_alfilaha-backup.sql
```

Gunakan `DB_NAME` jika nama database berbeda. Jangan menjalankan migrasi lama secara bersamaan dengan `scripts/db-migrate.cjs`.

## Verifikasi

```bash
curl http://localhost:5000/api/test
npm run lint
npm run build
```

Endpoint yang membutuhkan admin memakai header:

```text
Authorization: Bearer <token>
```
