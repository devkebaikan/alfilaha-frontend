import { test, expect } from "@playwright/test";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const API = "http://localhost:5000";
const OLD_JWT_SECRET = "rahasia_negara_jangan_disebar_123";
const DB = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_alfilaha",
};

let db;
let jadwalId = null;
const namaJadwal = `E2E Santri ${Date.now()}`;
const S = Date.now().toString().slice(-6);
const testSantri = [
  { username: `e2e_santri_a_${S}`, nama: `E2E Santri A ${S}` },
  { username: `e2e_santri_b_${S}`, nama: `E2E Santri B ${S}` },
];
let testSantriIds = [];

test.beforeAll(async () => {
  db = await mysql.createConnection(DB);
  const hash = bcrypt.hashSync("E2E123!abc", 10);
  for (const t of testSantri) {
    const [ins] = await db.query(
      `INSERT INTO pendaftar_santri
         (nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_wa, email, username, password, status_pendaftaran)
       VALUES (?, 'Palu', '2005-01-01', 'L', 'Alamat e2e santri', '08129111111', ?, ?, ?, 'Diterima')`,
      [t.nama, `${t.username}@example.com`, t.username, hash]
    );
    testSantriIds.push(ins.insertId);
  }
});

test.afterAll(async () => {
  if (db) {
    if (jadwalId) {
      for (const q of [
        "DELETE FROM log_perawatan WHERE jadwal_id = ?",
        "DELETE FROM activity_tasks WHERE schedule_id = ?",
        "DELETE FROM aktivitas_kegiatan WHERE aktivitas_id = ?",
        "DELETE FROM aktivitas_santri WHERE aktivitas_id = ?",
        "DELETE FROM aktivitas_tanaman WHERE aktivitas_id = ?",
        "DELETE FROM activity_schedules WHERE id = ?",
      ]) {
        try {
          await db.query(q, [jadwalId]);
        } catch (e) {
          console.warn("cleanup jadwal:", e.message);
        }
      }
    }
    if (testSantriIds.length) {
      try {
        await db.query("DELETE FROM pendaftar_santri WHERE id IN (?)", [
          testSantriIds,
        ]);
      } catch (e) {
        console.warn("cleanup santri:", e.message);
      }
    }
    await db.end();
  }
});

test("BUG 403 santri-pemilih: sesi admin lama tetap bisa memuat daftar santri & submit jadwal", async ({
  page,
  request,
}) => {
  const [admins] = await db.query(
    "SELECT id, username FROM admin_users WHERE username = 'admin' LIMIT 1"
  );
  expect(admins.length).toBe(1);
  const admin = admins[0];

  // Simulasi sesi browser yang TERSISA dari backend lama: token ditandatangani
  // dengan JWT_SECRET backend lama (sebelum fix, ini 403 di /api/santri-pemilih).
  const staleToken = jwt.sign(
    { id: admin.id, username: admin.username },
    OLD_JWT_SECRET,
    { expiresIn: "1d" }
  );
  await page.addInitScript(
    (t) => {
      localStorage.setItem("alfilaha_admin_token", t);
      localStorage.setItem(
        "alfilaha_admin_user",
        JSON.stringify({ id: 1, username: "admin", role: "Admin" })
      );
    },
    staleToken
  );

  await page.goto("/admin/jadwal");
  await page.getByRole("button", { name: "Jadwal Baru" }).click();
  await expect(
    page.getByRole("heading", { name: "Buat Jadwal Baru" })
  ).toBeVisible();

  await page.getByPlaceholder("cth: Pembersihan Area Kebun").fill(namaJadwal);
  await page
    .locator("form select")
    .nth(0)
    .selectOption({ label: "Pertanian" });
  await page.locator("button").filter({ hasText: "Pohon Anggur" }).first().click();
  await expect(page.getByText("Aksi Perawatan", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Siram" }).click();

  // BUG:#1 — daftar santri harus MUNCUL, bukan error merah
  await expect(page.getByText("Santri Penerima")).toBeVisible();
  await expect(
    page.getByText("Gagal memuat daftar santri", { exact: true })
  ).not.toBeVisible();
  await expect(page.getByText("Memuat daftar santri...")).not.toBeVisible();

  // Centang 2 santri uji (username unik, bukan substring satu sama lain)
  const b1 = page.getByRole("button", {
    name: new RegExp(testSantri[0].username, "i"),
  });
  const b2 = page.getByRole("button", {
    name: new RegExp(testSantri[1].username, "i"),
  });
  await expect(b1).toBeVisible();
  await expect(b2).toBeVisible();
  await b1.click();
  await expect(page.getByText("1 santri dipilih")).toBeVisible();
  await b2.click();
  await expect(page.getByText("2 santri dipilih")).toBeVisible();

  // Submit "Buat & Kirim ke 2 Santri" sampai berhasil
  const submitBtn = page.getByRole("button", {
    name: /Buat & Kirim ke \d+ Santri/,
  });
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();
  await expect(
    page.getByText(/Jadwal berhasil dikirim ke \d+ santri/)
  ).toBeVisible();

  // BUKTI DB: jadwal tersimpan + 2 task santri dibuat
  const [sch] = await db.query(
    "SELECT id FROM activity_schedules WHERE nama_aktivitas = ?",
    [namaJadwal]
  );
  expect(sch.length).toBe(1);
  jadwalId = sch[0].id;

  const [tasks] = await db.query(
    "SELECT schedule_id, santri_id, status FROM activity_tasks WHERE schedule_id = ? ORDER BY id ASC",
    [jadwalId]
  );
  console.log(
    "\n[BUKTI BUG 403] jadwal " + jadwalId + " => task santri = " +
      JSON.stringify(tasks)
  );
  expect(tasks.length).toBe(2);

  const [at] = await db.query(
    "SELECT tanaman_id, aksi FROM aktivitas_tanaman WHERE aktivitas_id = ?",
    [jadwalId]
  );
  console.log(
    "[BUKTI BUG 403] aktivitas_tanaman jadwal " + jadwalId + " => " +
      JSON.stringify(at)
  );
  expect(at.length).toBeGreaterThanOrEqual(1);
  expect(Number(at[0].tanaman_id)).toBe(3);

  // Endpoint santri-pemilih dengan TOKEN LAMA (yang tadinya 403) kini 200
  const rApi = await request.get(`${API}/api/santri-pemilih`, {
    headers: { Authorization: `Bearer ${staleToken}` },
  });
  expect(rApi.ok()).toBeTruthy();
  const list = await rApi.json();
  console.log(
    "[BUKTI BUG 403] GET /api/santri-pemilih dgn token lama => 200, " +
      (Array.isArray(list) ? list.length : 0) + " santri"
  );
  expect(Array.isArray(list)).toBe(true);
  expect(list.length).toBeGreaterThanOrEqual(2);
});