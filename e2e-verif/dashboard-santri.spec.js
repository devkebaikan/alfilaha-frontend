import { test, expect } from "@playwright/test";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const API = "http://localhost:5000";
const JWT_SECRET = "rahasia_negara_jangan_disebar_123";
const DB = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_alfilaha",
};

let db;
let jadwalId = null;
let taskId = null;

const S = Date.now().toString().slice(-6);
const namaJadwal = `E2E Siram Luhurr ${S}`;
const LUHURR_ID = 16;
const LUHURR_USERNAME = "luhurr";
const LUHURR_NAMA = "luhur";
const TANAMAN_ID = 3;

let adminToken;

const loginAdmin = async () => {
  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "admin123" }),
  });
  if (!res.ok) throw new Error(`admin login → ${res.status}: ${await res.text()}`);
  adminToken = (await res.json()).token;
};

const injectSantri = (page) =>
  page.addInitScript(
    ({ token, id, nama, username }) => {
      localStorage.setItem("santri_token", token);
      localStorage.setItem(
        "santri_data",
        JSON.stringify({
          id,
          nama,
          username,
          status_pendaftaran: "Diterima",
        })
      );
    },
    {
      token: jwt.sign({ id: LUHURR_ID, username: LUHURR_USERNAME }, JWT_SECRET, { expiresIn: "1d" }),
      id: LUHURR_ID,
      nama: LUHURR_NAMA,
      username: LUHURR_USERNAME,
    }
  );

test.beforeAll(async () => {
  db = await mysql.createConnection(DB);
  await loginAdmin();
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
    await db.end();
  }
});

test.describe.serial("Dashboard Santri — tugas pertanian dari admin", () => {
  test("TUGAS 1: admin kirim jadwal Pertanian → task muncul di 'Tugas Saya' santri luhurr", async ({
    page,
    request,
  }) => {
    // Admin: buat jadwal Pertanian via UI, kirim ke luhurr
    await page.addInitScript((t) => localStorage.setItem("alfilaha_admin_token", t), adminToken);
    await page.goto("/admin/jadwal");
    await page.getByRole("button", { name: "Jadwal Baru" }).click();
    await expect(page.getByRole("heading", { name: "Buat Jadwal Baru" })).toBeVisible();

    await page.getByPlaceholder("cth: Pembersihan Area Kebun").fill(namaJadwal);
    await page.locator("form select").nth(0).selectOption({ label: "Pertanian" });
    await page.locator("button").filter({ hasText: "Pohon Anggur" }).first().click();
    await expect(page.getByText("Aksi Perawatan", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Siram" }).click();

    const bLuhurr = page
      .getByRole("button", { name: new RegExp(LUHURR_USERNAME, "i") })
      .first();
    await expect(bLuhurr).toBeVisible();
    await bLuhurr.click();
    await expect(page.getByText("1 santri dipilih")).toBeVisible();

    const submitBtn = page.getByRole("button", { name: /Buat & Kirim ke \d+ Santri/ });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await expect(page.getByText(/Jadwal berhasil dikirim ke \d+ santri/)).toBeVisible();

    // DB: schedule + task untuk luhurr pada tanggal hari ini (CURDATE)
    const [sch] = await db.query(
      "SELECT id FROM activity_schedules WHERE nama_aktivitas = ?",
      [namaJadwal]
    );
    expect(sch.length).toBe(1);
    jadwalId = sch[0].id;

    const [tasks] = await db.query(
      `SELECT id, schedule_id, santri_id, nama_santri, tanggal_tugas, status
         FROM activity_tasks
        WHERE schedule_id = ? AND santri_id = ? AND tanggal_tugas = CURDATE()`,
      [jadwalId, LUHURR_ID]
    );
    console.log(
      "\n[BUKTI TUGAS 1] activity_tasks utk luhurr => " + JSON.stringify(tasks)
    );
    expect(tasks.length).toBe(1);
    taskId = tasks[0].id;
    expect(Number(tasks[0].santri_id)).toBe(LUHURR_ID);
    expect(tasks[0].status).toBe("pending");

    // API dashboard santri memuat task (hari ini + riwayat)
    const st = jwt.sign({ id: LUHURR_ID, username: LUHURR_USERNAME }, JWT_SECRET, { expiresIn: "1d" });
    const hari = await request.get(`${API}/api/tugas/hari-ini`, {
      headers: { Authorization: `Bearer ${st}` },
    });
    expect(hari.ok()).toBeTruthy();
    const hariJson = await hari.json();
    expect(hariJson.some((t) => t.id === taskId && t.nama_aktivitas === namaJadwal)).toBeTruthy();
    expect(hariJson.find((t) => t.id === taskId).tanaman_info).toBe("Pohon Anggur||siram");

    const saya = await request.get(`${API}/api/tugas/saya`, {
      headers: { Authorization: `Bearer ${st}` },
    });
    expect(saya.ok()).toBeTruthy();
    const sayaJson = await saya.json();
    expect(sayaJson.some((t) => t.id === taskId)).toBeTruthy();

    // UI dashboard santri luhurr: task MUNCUL di "Tugas Saya"
    await injectSantri(page);
    await page.goto("/dashboard-santri");
    await expect(
      page.getByRole("heading", { name: /Tugas Saya/i })
    ).toBeVisible();
    await expect(page.getByText("Tidak ada tugas aktif")).not.toBeVisible();
    const kartu = page
      .locator("div.rounded-2xl.overflow-hidden")
      .filter({ has: page.getByText(namaJadwal, { exact: false }) });
    await expect(kartu).toBeVisible({ timeout: 15000 });
    await expect(kartu.getByText("Pohon Anggur")).toBeVisible();
    await expect(kartu.getByText("· Siram", { exact: true })).toBeVisible();
  });

  test("TUGAS 2: santri konfirmasi → sinkron riwayat tugas + riwayat tanaman, hilang dari 'Tugas Saya'", async ({
    page,
    request,
  }) => {
    expect(jadwalId).toBeTruthy();
    expect(taskId).toBeTruthy();

    await injectSantri(page);
    await page.goto("/dashboard-santri");

    // Ada di "Tugas Saya" → klik Selesaikan
    const kartu = page
      .locator("div.rounded-2xl.overflow-hidden")
      .filter({ has: page.getByText(namaJadwal, { exact: false }) });
    await expect(kartu).toBeVisible({ timeout: 15000 });
    const selesaikan = kartu.getByRole("button", { name: /Selesaikan/ });
    await expect(selesaikan).toBeVisible();
    await selesaikan.click();

    const modal = page.locator("div.fixed.inset-0.z-\\[999\\]");
    await expect(modal).toBeVisible();
    await modal.getByRole("textbox").fill(`Laporan siram e2e ${S}`);
    await modal.getByRole("button", { name: /Kirim Laporan/ }).click();
    await expect(page.getByText("Tugas berhasil diselesaikan")).toBeVisible();

    // DB 1: task selesai
    const [ut] = await db.query("SELECT status, diselesaikan_at FROM activity_tasks WHERE id = ?", [taskId]);
    expect(ut[0].status).toBe("selesai");
    console.log("\n[BUKTI TUGAS 2a] task", taskId, "=>", JSON.stringify(ut[0]));

    // DB 2: log_perawatan tercatat otomatis (satu sumber utk riwayat tanaman)
    const [logs2] = await db.query(
      "SELECT * FROM log_perawatan WHERE jadwal_id = ? AND tanaman_id = ? ORDER BY id DESC LIMIT 1",
      [jadwalId, TANAMAN_ID]
    );
    console.log("[BUKTI TUGAS 2b] log_perawatan => " + JSON.stringify(logs2[0]));
    expect(logs2.length).toBe(1);
    expect(logs2[0].jenis_tindakan).toBe("siram");
    expect(logs2[0].nama_perawat.toLowerCase()).toBe(LUHURR_NAMA);
    expect(logs2[0].role_perawat).toBe("Santri");
    expect(Number(logs2[0].santri_id)).toBe(LUHURR_ID);
    expect(logs2[0].waktu_tindakan).toBeTruthy();

    // API riwayat tanaman memuat entri baru (luhur, siram, hari ini)
    const rr = await request.get(`${API}/api/tanaman/${TANAMAN_ID}/riwayat`);
    expect(rr.ok()).toBeTruthy();
    const riwayat = await rr.json();
    const cocok = (riwayat || []).filter((i) => i.jadwal_id === jadwalId);
    console.log("[BUKTI TUGAS 2c] /api/tanaman/3/riwayat (entri baru) => " + JSON.stringify(cocok));
    expect(cocok.length).toBe(1);
    expect(String(cocok[0].jenis_tindakan)).toBe("siram");
    expect(String(cocok[0].nama_perawat).toLowerCase()).toBe(LUHURR_NAMA);

    // UI: reload dashboard → tugas hilang dari "Tugas Saya", muncul di "Riwayat Tugas"
    await page.goto("/dashboard-santri");
    await expect(
      page.getByRole("heading", { name: /Tugas Saya/i })
    ).toBeVisible();
    await expect(page.getByText("Tidak ada tugas aktif")).toBeVisible();
    await expect(page.getByText(namaJadwal, { exact: false })).not.toBeVisible();

    // Buka Riwayat Tugas
    await page.getByText("Riwayat Tugas", { exact: true }).click();
    const grupBtn = page
      .getByRole("button", { name: new RegExp(namaJadwal, "i") })
      .first();
    await expect(grupBtn).toBeVisible();
    await grupBtn.click();
    await expect(page.getByText("selesai", { exact: true }).first()).toBeVisible();

    // UI halaman detail Pohon Anggur: riwayat perawatan baru tampil
    await page.goto(`/tanaman/${TANAMAN_ID}`);
    await expect(
      page.getByRole("heading", { name: "Riwayat Aktivitas" })
    ).toBeVisible();
    const riwayatItem = page
      .locator("div.flex.gap-4.group")
      .filter({ hasText: new RegExp(LUHURR_NAMA, "i") })
      .first();
    await expect(riwayatItem).toContainText("Aktivitas Penyiraman");
    await expect(riwayatItem).toContainText("oleh:");
    await expect(riwayatItem).toContainText("Santri");
  });
});