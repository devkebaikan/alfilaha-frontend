import { test, expect } from "@playwright/test";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

const API = "http://localhost:5000";
const DB = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_alfilaha",
};

let db;

const S = Date.now().toString().slice(-6);
const S_USER = `e2e_aksi_${S}`;
const S_PASS = "AksiE2E123!";
const S_NAMA = `E2E Aksi Santri ${S}`;

let adminToken;
let santriToken;
let santriId;
let jadwalPertanianId = null;
const namaJadwal = `E2E Aksi ${Date.now()}`;

const loginAdmin = async () => {
  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "admin123" }),
  });
  if (!res.ok) throw new Error(`admin login → ${res.status}: ${await res.text()}`);
  adminToken = (await res.json()).token;
};

const createSantri = async () => {
  const hash = bcrypt.hashSync(S_PASS, 10);
  const [ins] = await db.query(
    `INSERT INTO pendaftar_santri
       (nama, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, no_wa, email, username, password, status_pendaftaran)
     VALUES (?, 'Palu', '2005-01-01', 'L', 'Alamat e2e aksi', '08129998888', ?, ?, ?, 'Diterima')`,
    [S_NAMA, `e2e_aksi_${S}@example.com`, S_USER, hash]
  );
  santriId = ins.insertId;
  const lr = await fetch(`${API}/api/pendaftaran/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: S_USER, password: S_PASS }),
  });
  if (!lr.ok) throw new Error(`santri login → ${lr.status}: ${await lr.text()}`);
  santriToken = (await lr.json()).token;
};

const injectAdmin = (page) =>
  page.addInitScript(
    (t) => localStorage.setItem("alfilaha_admin_token", t),
    adminToken
  );

const injectSantri = (page) =>
  page.addInitScript(
    ({ token, data }) => {
      localStorage.setItem("santri_token", token);
      localStorage.setItem("santri_data", JSON.stringify(data));
    },
    {
      token: santriToken,
      data: {
        id: santriId,
        nama: S_NAMA,
        username: S_USER,
        status_pendaftaran: "Diterima",
      },
    }
  );

test.beforeAll(async () => {
  db = await mysql.createConnection(DB);
  await loginAdmin();
  await createSantri();
});

test.afterAll(async () => {
  if (db) {
    if (jadwalPertanianId) {
      for (const q of [
        "DELETE FROM log_perawatan WHERE jadwal_id = ?",
        "DELETE FROM activity_tasks WHERE schedule_id = ?",
        "DELETE FROM aktivitas_kegiatan WHERE aktivitas_id = ?",
        "DELETE FROM aktivitas_santri WHERE aktivitas_id = ?",
        "DELETE FROM aktivitas_tanaman WHERE aktivitas_id = ?",
        "DELETE FROM activity_schedules WHERE id = ?",
      ]) {
        try {
          await db.query(q, [jadwalPertanianId]);
        } catch (e) {
          console.warn("cleanup jadwal:", e.message);
        }
      }
    }
    if (santriId) {
      try {
        await db.query("DELETE FROM pendaftar_santri WHERE id = ?", [santriId]);
      } catch (e) {
        console.warn("cleanup santri:", e.message);
      }
    }
    await db.end();
  }
});

test.describe.serial("TUGAS 1 & 2 — aksi perawatan + riwayat otomatis", () => {
  test("TUGAS 1: admin buat jadwal Pertanian — chip aksi tampil, toggle, submit, tersimpan di aktivitas_tanaman", async ({
    page,
    request,
  }) => {
    await injectAdmin(page);
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
    await expect(
      page.getByText("Kategori pertanian/perkebunan: jadwal berbasis")
    ).toBeVisible();

    // Pilih Pohon Anggur → chip aksi muncul (bukan "Memuat aksi perawatan...")
    await page.locator("button").filter({ hasText: "Pohon Anggur" }).first().click();
    await expect(page.getByText("Aksi Perawatan", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Siram" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pupuk" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Panen" })).toBeVisible();

    // Toggle Siram & Panen aktif; Pupuk tetap nonaktif
    await page.getByRole("button", { name: "Siram" }).click();
    await page.getByRole("button", { name: "Panen" }).click();
    await expect(page.getByRole("button", { name: "Siram" })).toHaveClass(/bg-green-600/);
    await expect(page.getByRole("button", { name: "Panen" })).toHaveClass(/bg-green-600/);
    await expect(page.getByRole("button", { name: "Pupuk" })).not.toHaveClass(/bg-green-600/);

    // Pilih 1 santri
    const santriBtn = page
      .getByRole("button", { name: new RegExp(S_USER, "i") })
      .first();
    await expect(santriBtn).toBeVisible();
    await santriBtn.click();
    await expect(page.getByText("1 santri dipilih")).toBeVisible();

    // Submit
    const submitBtn = page.getByRole("button", {
      name: /Buat & Kirim ke \d+ Santri/,
    });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await expect(
      page.getByText(/Jadwal berhasil dikirim ke \d+ santri/)
    ).toBeVisible();

    // DB: schedule + aktivitas_tanaman berisi aksi
    const [sch] = await db.query(
      "SELECT id FROM activity_schedules WHERE nama_aktivitas = ?",
      [namaJadwal]
    );
    expect(sch.length).toBe(1);
    jadwalPertanianId = sch[0].id;

    const [at] = await db.query(
      "SELECT tanaman_id, aksi FROM aktivitas_tanaman WHERE aktivitas_id = ? ORDER BY id ASC",
      [jadwalPertanianId]
    );
    console.log(
      "\n[BUKTI TUGAS 1] aktivitas_tanaman utk jadwal " +
        jadwalPertanianId +
        " => " +
        JSON.stringify(at)
    );
    expect(at.length).toBeGreaterThanOrEqual(2);
    expect(at.map((r) => r.aksi)).toContain("siram");
    expect(at.map((r) => r.aksi)).toContain("panen");
    expect(at.every((r) => Number(r.tanaman_id) === 3)).toBe(true);

    // GET /api/jadwal/:id mengembalikan tanaman_terpilih dengan aksi (prefill edit)
    const r2 = await request.get(`${API}/api/jadwal/${jadwalPertanianId}`);
    expect(r2.ok()).toBeTruthy();
    const jDetail = await r2.json();
    console.log(
      "\n[BUKTI TUGAS 1] GET /api/jadwal/:" + jadwalPertanianId + " => " +
        JSON.stringify(jDetail.tanaman_terpilih)
    );
    expect(Array.isArray(jDetail.tanaman_terpilih)).toBe(true);
    expect(jDetail.tanaman_terpilih[0]).toMatchObject({
      tanaman_id: 3,
      aksi: expect.arrayContaining(["siram", "panen"]),
    });
  });

  test("TUGAS 2: santri konfirmasi tugas → log_perawatan + riwayat di halaman detail tanaman", async ({
    page,
    request,
  }) => {
    // Pastikan tiket hari ini ada
    const [rows] = await db.query(
      "SELECT id FROM activity_tasks WHERE schedule_id = ? AND santri_id = ? AND tanggal_tugas = CURDATE()",
      [jadwalPertanianId, santriId]
    );
    let taskId = rows.length > 0 ? rows[0].id : null;
    if (!taskId) {
      const [ins] = await db.query(
        "INSERT INTO activity_tasks (schedule_id, santri_id, nama_santri, tanggal_tugas, status) VALUES (?, ?, ?, CURDATE(), 'pending')",
        [jadwalPertanianId, santriId, S_NAMA]
      );
      taskId = ins.insertId;
    }

    await injectSantri(page);
    await page.goto("/dashboard-santri");

    // Buka tugas pertanian & kirim laporan
    const kartuBtn = page
      .locator("div.rounded-2xl.overflow-hidden")
      .filter({ has: page.getByText(namaJadwal, { exact: false }) })
      .getByRole("button", { name: /Selesaikan/ })
      .first();
    await expect(kartuBtn).toBeVisible({ timeout: 15000 });
    await kartuBtn.click();

    const modal = page.locator("div.fixed.inset-0.z-\\[999\\]");
    await expect(modal).toBeVisible();

    await modal
      .getByRole("textbox")
      .fill(`Laporan siram e2e ${Date.now()}`);
    await modal.getByRole("button", { name: /Kirim Laporan/ }).click();
    await expect(page.getByText("Tugas berhasil diselesaikan")).toBeVisible();

    // DB: log_perawatan tercatat otomatis
    const [logs] = await db.query(
      "SELECT * FROM log_perawatan WHERE jadwal_id = ? AND tanaman_id = 3 ORDER BY id DESC LIMIT 1",
      [jadwalPertanianId]
    );
    console.log(
      "\n[BUKTI TUGAS 2] log_perawatan utk santri " +
        santriId +
        " => " +
        JSON.stringify(logs[0])
    );
    expect(logs.length).toBe(1);
    expect(logs[0].jenis_tindakan).toBe("siram");
    expect(logs[0].nama_perawat).toBe(S_NAMA);
    expect(logs[0].role_perawat).toBe("Santri");
    expect(logs[0].santri_id).toBe(santriId);

    // API riwayat tanaman memuat entri baru
    const rr = await request.get(`${API}/api/tanaman/3/riwayat`);
    expect(rr.ok()).toBeTruthy();
    const riwayat = await rr.json();
    expect(
      riwayat.some(
        (i) =>
          i.nama_perawat === S_NAMA &&
          (i.jenis_tindakan === "siram" || i.tipe_aksi === "siram")
      )
    ).toBe(true);

    // UI halaman detail tanaman
    await page.goto("/tanaman/3");
    await expect(page.getByText("Riwayat Aktivitas")).toBeVisible();
    await expect(page.getByText(S_NAMA, { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Penyiraman").first()).toBeVisible();
  });
});