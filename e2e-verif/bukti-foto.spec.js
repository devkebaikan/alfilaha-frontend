import { test, expect } from "@playwright/test";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const API = "http://localhost:5001";
const UPLOADS = "/home/fauzan/alfilaha-backend/uploads";

const S = Date.now().toString().slice(-6);
const USERNAME = `e2e_bukti_${S}`;
const PASSWORD = "BuktiE2e123!";
const NAMA = `E2E Bukti ${S}`;

const LABELS = {
  1: `UJI1 Tanpa Foto ${S}`,
  2: `UJI2 Kamera ${S}`,
  3: `UJI3 Tolak Izin ${S}`,
  4: `UJI4 Galeri Besar ${S}`,
  5: `UJI5 Tutup Kamera ${S}`,
};

let db;
let token;
let santriId;
const taskIds = {};

async function buatJadwalDanTugas(label) {
  const [r] = await db.query(
    `INSERT INTO activity_schedules
       (nama_aktivitas, kategori, deskripsi, pola_perulangan, interval_hari,
        tanggal_mulai, penanggung_jawab, status, kategori_id, jam_mulai, jam_selesai)
     VALUES (?, 'Kebersihan', 'tugas uji bukti foto e2e', 'sekali', 1,
        CURDATE(), ?, 'aktif', 1, '08:00:00', '09:00:00')`,
    [label, santriId]
  );
  const scheduleId = r.insertId;
  const [t] = await db.query(
    `INSERT INTO activity_tasks (schedule_id, santri_id, nama_santri, tanggal_tugas, status)
     VALUES (?, ?, ?, CURDATE(), 'pending')`,
    [scheduleId, santriId, NAMA]
  );
  return { jadwalId: scheduleId, taskId: t.insertId };
}

function injectAuthData(page) {
  return page.addInitScript(
    ({ token, santriId, NAMA }) => {
      localStorage.setItem("santri_token", token);
      localStorage.setItem(
        "santri_data",
        JSON.stringify({
          id: santriId,
          nama: NAMA,
          username: USERNAME,
          status_pendaftaran: "Diterima",
        })
      );
    },
    { token, santriId, NAMA }
  );
}

async function bukaTugas(page, label) {
  const kartuBtn = page
    .locator("div.rounded-2xl.overflow-hidden")
    .filter({ has: page.getByText(label, { exact: true }) })
    .getByRole("button", { name: /Selesaikan/ })
    .first();
  await expect(kartuBtn).toBeVisible();
  await kartuBtn.click();
  const modal = page.locator("div.fixed.inset-0.z-\\[999\\]");
  await expect(modal).toBeVisible();
  await expect(modal.getByText(label, { exact: true })).toBeVisible();
  return modal;
}

test.beforeAll(async () => {
  db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_alfilaha",
  });

  const hash = bcrypt.hashSync(PASSWORD, 10);
  const [ins] = await db.query(
    `INSERT INTO pendaftar_santri
       (nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_wa, email, username, password, status_pendaftaran)
     VALUES (?, 'Palu', '2005-01-01', 'L', 'Alamat e2e', '081234567890', ?, ?, ?, 'Diterima')`,
    [NAMA, `e2e_${S}@example.com`, USERNAME, hash]
  );
  santriId = ins.insertId;

  for (const k of Object.keys(LABELS)) {
    const { jadwalId, taskId } = await buatJadwalDanTugas(LABELS[k]);
    taskIds[k] = taskId;
  }

  const lr = await fetch(`${API}/api/pendaftaran/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  if (!lr.ok) throw new Error(`Login gagal: ${await lr.text()}`);
  token = (await lr.json()).token;
});

test.afterAll(async () => {
  if (db) {
    await db.query("DELETE FROM activity_schedules WHERE penanggung_jawab = ?", [santriId]);
    await db.query("DELETE FROM pendaftar_santri WHERE id = ?", [santriId]);
    await db.end();
  }
});

test("UJI1: laporan tanpa foto berhasil dikirim & status selesai", async ({ page }) => {
  await injectAuthData(page);
  await page.goto("/dashboard-santri");
  const modal = await bukaTugas(page, LABELS[1]);

  await modal.getByRole("textbox").fill(`catatan e2e tanpa foto ${S}`);
  await modal.getByRole("button", { name: /Kirim Laporan/ }).click();

  await expect(page.getByText(/Tugas berhasil diselesaikan/)).toBeVisible();
  await expect(modal).not.toBeVisible();

  const [rows] = await db.query(
    "SELECT status, foto_bukti, catatan FROM activity_tasks WHERE id = ?",
    [taskIds[1]]
  );
  expect(rows[0].status).toBe("selesai");
  expect(rows[0].foto_bukti).toBeNull();
  expect(rows[0].catatan).toBe(`catatan e2e tanpa foto ${S}`);
});

test("UJI2: kamera langsung — ambil, ulangi, gunakan, kirim dengan foto", async ({ page }) => {
  await injectAuthData(page);
  await page.goto("/dashboard-santri");
  const modal = await bukaTugas(page, LABELS[2]);

  await modal.getByRole("button", { name: /Ambil Foto/ }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const v = document.querySelector("video");
        return v && v.srcObject && v.videoWidth > 0
          ? v.srcObject.getVideoTracks().filter((t) => t.readyState === "live").length
          : 0;
      })
    )
    .toBeGreaterThan(0);

  await modal.getByRole("button", { name: "Ambil foto", exact: true }).click();
  await expect(modal.getByRole("button", { name: /Gunakan foto/ })).toBeVisible();
  await expect(modal.getByRole("button", { name: "Ulangi", exact: true })).toBeVisible();
  await expect(modal.locator('img[src^="blob:"]')).toBeVisible();

  // Ulangi jepret → kamera nyala lagi → ambil lagi
  await modal.getByRole("button", { name: "Ulangi", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const v = document.querySelector("video");
        return v && v.srcObject ? v.srcObject.getVideoTracks().filter((t) => t.readyState === "live").length : 0;
      })
    )
    .toBeGreaterThan(0);
  await modal.getByRole("button", { name: "Ambil foto", exact: true }).click();
  await expect(modal.getByRole("button", { name: /Gunakan foto/ })).toBeVisible();
  await modal.getByRole("button", { name: /Gunakan foto/ }).click();
  await expect(modal.getByRole("button", { name: /Ganti foto/ })).toBeVisible();

  await modal.getByRole("textbox").fill(`catatan bukti kamera ${S}`);
  await modal.getByRole("button", { name: /Kirim Laporan/ }).click();
  await expect(page.getByText(/Tugas berhasil diselesaikan/)).toBeVisible();

  const [rows] = await db.query(
    "SELECT status, foto_bukti FROM activity_tasks WHERE id = ?",
    [taskIds[2]]
  );
  expect(rows[0].status).toBe("selesai");
  expect(rows[0].foto_bukti).toBeTruthy();
  expect(fs.existsSync(path.join(UPLOADS, rows[0].foto_bukti))).toBe(true);

  const [chk] = await db.query("SELECT status FROM activity_tasks WHERE id = ?", [taskIds[1]]);
  expect(chk[0].status).toBe("selesai");
});

test("UJI3: izin kamera ditolak → pesan jelas + tombol cadangan", async ({ page }) => {
  await page.addInitScript(() => {
    const fake = {
      getUserMedia() {
        return Promise.reject(
          Object.assign(new Error("denied"), { name: "NotAllowedError" })
        );
      },
      enumerateDevices() {
        return Promise.resolve([]);
      },
    };
    try {
      Object.defineProperty(Navigator.prototype, "mediaDevices", {
        configurable: true,
        value: fake,
      });
    } catch {
      Object.defineProperty(navigator, "mediaDevices", { value: fake });
    }
  });
  await injectAuthData(page);
  await page.goto("/dashboard-santri");
  const modal = await bukaTugas(page, LABELS[3]);

  await modal.getByRole("button", { name: /Ambil Foto/ }).click();
  await expect(modal.getByText(/Izin kamera ditolak/)).toBeVisible();
  await expect(modal.getByText("NotAllowedError", { exact: true })).toBeVisible();
  await expect(
    modal.getByRole("button", { name: /Buka Pemilih Berkas/ })
  ).toBeVisible();
  await expect(modal.getByRole("button", { name: "Coba lagi", exact: true })).toBeVisible();
  await expect(modal.getByRole("button", { name: "Kembali", exact: true })).toBeVisible();
});

test("UJI4: foto galeri >5MB ditolak dengan pesan jelas", async ({ page }) => {
  await injectAuthData(page);
  await page.goto("/dashboard-santri");
  const modal = await bukaTugas(page, LABELS[4]);

  const inputGaleri = modal.locator('input[type="file"]').first();
  await inputGaleri.setInputFiles({
    name: "bukti-besar.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(modal.getByText("Ukuran foto maksimal 5 MB.")).toBeVisible();
  await expect(modal.locator('img[src^="blob:"]')).toHaveCount(0);

  // Galeri tetap berfungsi untuk ukuran normal (JPEG terima)
  await inputGaleri.setInputFiles({
    name: "foto-kecil.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(64 * 1024),
  });
  await expect(modal.locator('img[src^="blob:"]')).toBeVisible();
});

test("UJI5: kamera mati saat modal ditutup (tombol X)", async ({ page }) => {
  await page.addInitScript(() => {
    window.__stopCalled = 0;
    const proto = MediaStreamTrack.prototype;
    const orig = proto.stop;
    proto.stop = function () {
      window.__stopCalled += 1;
      return orig.apply(this, arguments);
    };
  });
  await injectAuthData(page);
  await page.goto("/dashboard-santri");
  const modal = await bukaTugas(page, LABELS[5]);

  await modal.getByRole("button", { name: /Ambil Foto/ }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const v = document.querySelector("video");
        return v && v.srcObject ? v.srcObject.getVideoTracks().filter((t) => t.readyState === "live").length : 0;
      })
    )
    .toBeGreaterThan(0);

  await modal.getByRole("button", { name: "Tutup", exact: true }).click();
  await expect(modal).not.toBeVisible();

  const stopCalled = await page.evaluate(() => window.__stopCalled);
  expect(stopCalled).toBeGreaterThan(0);
  const videoHilang = await page.evaluate(() => document.querySelector("video") === null);
  expect(videoHilang).toBe(true);
});