import { test, expect } from "@playwright/test";
import mysql from "mysql2/promise";

const API = "http://localhost:5001";
const DB = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_alfilaha",
};

let db;

const uniqueName = (p) => `${p} E2E ${Date.now()}`;
const apiGet = async (path) => {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(`GET ${path} -> ${r.status}: ${await r.text()}`);
  return r.json();
};
const loginAdmin = async (page, request) => {
  const res = await request.post(`${API}/api/login`, {
    data: { username: "admin", password: "admin123" },
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  await page.addInitScript(
    (t) => localStorage.setItem("alfilaha_admin_token", t),
    data.token,
  );
};

test.beforeAll(async () => {
  db = await mysql.createConnection(DB);
});

test.afterAll(async () => {
  await db.end();
});

test.describe.serial("Bug kegiatan lokasi di form jadwal (uji 1-7)", () => {
  const namaLokasi = uniqueName("Uji Masjid");
  const kegiatan1 = "Menyapu Halaman";
  const kegiatan2 = "Kultum Subuh";
  const namaAktivitas = uniqueName("Aktivitas Uji");
  let lokasiId = null;

  test.afterAll(async () => {
    try {
      await db.query("DELETE FROM activity_schedules WHERE nama_aktivitas = ?", [
        namaAktivitas,
      ]);
    } catch (e) {
      console.warn("cleanup jadwal:", e.message);
    }
    if (lokasiId) {
      try {
        await db.query("DELETE FROM kegiatan_lokasi WHERE lokasi_id = ?", [
          lokasiId,
        ]);
        await db.query("DELETE FROM lokasi WHERE id = ?", [lokasiId]);
      } catch (e) {
        console.warn("cleanup DB:", e.message);
      }
    }
    await db.end();
  });

  test("1-3: buat 'Uji Masjid' + 2 kegiatan via form; bukti DB & endpoint", async ({
    page,
    request,
  }) => {
    await loginAdmin(page, request);
    await page.goto("/admin/lokasi");
    await page.getByRole("button", { name: "Tambah Lokasi" }).click();
    await expect(
      page.getByRole("heading", { name: "Tambah Lokasi Baru" }),
    ).toBeVisible();

    await page
      .getByPlaceholder("contoh: Kebun 1, Asrama A, Masjid Utama")
      .fill(namaLokasi);
    await page
      .getByPlaceholder("Deskripsi singkat tentang lokasi ini...")
      .fill("Lokasi Uji Masjid hasil verifikasi e2e");

    const ki = page.getByPlaceholder("Nama kegiatan, lalu tekan Tambah...");
    await ki.fill(kegiatan1);
    await page
      .locator("form")
      .getByRole("button", { name: "Tambah", exact: true })
      .click();
    await ki.fill(kegiatan2);
    await page
      .locator("form")
      .getByRole("button", { name: "Tambah", exact: true })
      .click();

    await expect(page.getByText(kegiatan1, { exact: true })).toBeVisible();
    await expect(page.getByText(kegiatan2, { exact: true })).toBeVisible();

    await page
      .locator("form")
      .getByRole("button", { name: "Tambah Lokasi", exact: true })
      .click();
    await expect(page.getByText("Lokasi berhasil ditambahkan")).toBeVisible();

    // Buah 1: lokasi tersimpan + list API menunjukkan jumlah_kegiatan
    const list = await apiGet("/api/lokasi");
    const created = list.find((l) => l.nama === namaLokasi);
    expect(created).toBeDefined();
    expect(created.jumlah_kegiatan).toBe(2);
    lokasiId = created.id;

    // Buah 2: bukti di database
    const [rows] = await db.query(
      "SELECT id, nama FROM kegiatan_lokasi WHERE lokasi_id = ? ORDER BY nama",
      [lokasiId],
    );
    console.log(
      "\n[BUKTI 1-3] SELECT * kegiatan_lokasi utk lokasi " +
        lokasiId +
        " (" +
        namaLokasi +
        ") => " +
        JSON.stringify(rows),
    );
    expect(rows.map((r) => r.nama).sort()).toEqual(
      [kegiatan1, kegiatan2].sort(),
    );

    // Buah 3: endpoint GET /api/lokasi/:id/kegiatan
    const res = await fetch(`${API}/api/lokasi/${lokasiId}/kegiatan`);
    expect(res.status).toBe(200);
    const data = await res.json();
    console.log(
      "\n[BUKTI 1-3] GET /api/lokasi/" +
        lokasiId +
        "/kegiatan => " +
        JSON.stringify(data),
    );
    expect(Array.isArray(data)).toBe(true);
    expect(data.map((k) => k.nama).sort()).toEqual(
      [kegiatan1, kegiatan2].sort(),
    );

    // Kartu manajemen tampilkan jumlah kegiatan
    const card = page
      .locator("div.grid.gap-4 > div")
      .filter({ hasText: namaLokasi });
    await expect(card.getByText("2 kegiatan")).toBeVisible();
  });

  test("4: form jadwal menampilkan kegiatan + baris debug", async ({
    page,
    request,
  }) => {
    await loginAdmin(page, request);
    await page.goto("/admin/jadwal");
    await page.getByRole("button", { name: "Jadwal Baru" }).click();
    await expect(
      page.getByRole("heading", { name: "Buat Jadwal Baru" }),
    ).toBeVisible();

    await page.getByPlaceholder("cth: Pembersihan Area Kebun").fill(namaAktivitas);
    await page.locator("form select").nth(0).selectOption({ label: "Kebersihan" });
    await page.locator("form select").nth(1).selectOption(String(lokasiId));

    // Baris debug (selalu tampil selama lokasi terpilih)
    const debug = page.locator("p.font-mono");
    await expect(debug).toContainText(`id lokasi: ${lokasiId}`);
    await expect(debug).toContainText("kegiatan diterima: 2");
    await expect(debug).toContainText(
      `URL: ${API}/api/lokasi/${lokasiId}/kegiatan`,
    );

    // Duabelas kartu kegiatan muncul (bukan "Belum ada kegiatan...")
    await expect(page.getByText(kegiatan1, { exact: true })).toBeVisible();
    await expect(page.getByText(kegiatan2, { exact: true })).toBeVisible();
    await expect(page.getByText("Belum ada kegiatan di lokasi ini")).toHaveCount(
      0,
    );
  });

  test("5: pilih kegiatan + santri, simpan jadwal, bukti aktivitas dibuat", async ({
    page,
    request,
  }) => {
    await loginAdmin(page, request);
    await page.goto("/admin/jadwal");
    await page.getByRole("button", { name: "Jadwal Baru" }).click();

    await page
      .getByPlaceholder("cth: Pembersihan Area Kebun")
      .fill(namaAktivitas);
    await page
      .locator("form select")
      .nth(0)
      .selectOption({ label: "Kebersihan" });
    await page.locator("form select").nth(1).selectOption(String(lokasiId));

    await expect(page.getByText(kegiatan1, { exact: true })).toBeVisible();
    await page.getByText(kegiatan1, { exact: true }).click();
    await expect(page.getByText("1 kegiatan dipilih")).toBeVisible();

    // Pilih semua santri yang diterima
    await page
      .getByRole("button", { name: "Pilih Semua Hasil" })
      .click();

    const submit = page.getByRole("button", {
      name: /Buat & Kirim ke \d+ Santri/,
    });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(
      page.getByText("Jadwal berhasil dibuat & dikirim ke santri!"),
    ).toBeVisible();

    // Bukti di database: aktivitas + kegiatan terverifikasi milik lokasi
    const [rows] = await db.query(
      `SELECT s.id, s.lokasi_id, ak.kegiatan_id, k.nama AS kegiatan
         FROM activity_schedules s
         JOIN aktivitas_kegiatan ak ON ak.aktivitas_id = s.id
         JOIN kegiatan_lokasi k ON k.id = ak.kegiatan_id
        WHERE s.nama_aktivitas = ?`,
      [namaAktivitas],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].lokasi_id).toBe(lokasiId);
    expect(rows[0].kegiatan).toBe(kegiatan1);
  });

  test("6: + Tambah kegiatan dari form jadwal => kartu baru & tercentang", async ({
    page,
    request,
  }) => {
    const namaBaru = ("Kegiatan Cepat " + uniqueName(""))
      .trim()
      .replace(/\s+/g, " ");
    await loginAdmin(page, request);
    await page.goto("/admin/jadwal");
    await page.getByRole("button", { name: "Jadwal Baru" }).click();

    await page.getByPlaceholder("cth: Pembersihan Area Kebun").fill(namaAktivitas);
    await page.locator("form select").nth(0).selectOption({ label: "Kebersihan" });
    await page.locator("form select").nth(1).selectOption(String(lokasiId));
    await expect(page.getByText(kegiatan2, { exact: true })).toBeVisible();

    const inline = page.getByPlaceholder(
      "Tambah kegiatan baru untuk lokasi ini, tekan Enter...",
    );
    await inline.fill(namaBaru);
    await inline.press("Enter");

    // Kartu baru muncul sebagai kegiatan setelah lokasi
    const kartuBaru = page
      .getByRole("button", { name: namaBaru, exact: false })
      .first();
    await expect(kartuBaru).toBeVisible();

    // Tercentang otomatis
    await expect(page.getByText("1 kegiatan dipilih")).toBeVisible();

    // Bukti DB: baris kegiatan_lokasi tersimpan
    const [rows] = await db.query(
      "SELECT id, lokasi_id, nama FROM kegiatan_lokasi WHERE lokasi_id = ? AND LOWER(nama) = LOWER(?)",
      [lokasiId, namaBaru],
    );
    console.log(
      "\n[BUKTI 6] kegiatan_lokasi setelah + Tambah kegiatan => " +
        JSON.stringify(rows),
    );
    expect(rows.length).toBe(1);
    expect(rows[0].lokasi_id).toBe(lokasiId);

    // Idempoten: nama yang sama tidak membuat duplikat
    await inline.fill(namaBaru);
    await inline.press("Enter");
    await expect(page.getByText(namaBaru, { exact: false }).first()).toBeVisible();
    const [rows2] = await db.query(
      "SELECT COUNT(*) AS total FROM kegiatan_lokasi WHERE lokasi_id = ? AND LOWER(nama) = LOWER(?)",
      [lokasiId, namaBaru],
    );
    expect(rows2[0].total).toBe(1);
  });

  test("8: POST /api/jadwal pola 'berulang' diterima (regresi enum)", async ({
    request,
  }) => {
    // Dulu: form mengirim 'berulang' sementara kolom hanya ENUM('sekali','harian',...)
    // => "Data truncated for column 'pola_perulangan'" (HTTP 500).
    const kats = await apiGet("/api/kategori");
    const kegiatanList = await apiGet(`/api/lokasi/${lokasiId}/kegiatan`);
    expect(kegiatanList.length).toBeGreaterThan(0);
    const bodyUji = {
      nama_aktivitas: uniqueName("Aktivitas Pola Uji"),
      kategori_id: kats[0].id,
      lokasi_id: lokasiId,
      kegiatan_lokasi_ids: [kegiatanList[0].id],
      santri_ids: [],
      jam_mulai: "07:00",
      jam_selesai: "08:00",
      tanggal_mulai: new Date().toISOString().split("T")[0],
      pola_perulangan: "berulang",
      interval_hari: 2,
      deskripsi: "uji regresi pola berulang",
    };
    const res = await request.post(`${API}/api/jadwal`, { data: bodyUji });
    const text = await res.text();
    console.log(
      "\n[BUKTI 8] POST /api/jadwal (berulang) -> " +
        res.status() +
        " : " +
        text,
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBeTruthy();

    // Verifikasi tersimpan dengan pola berulang tanpa potongan data
    const [rows] = await db.query(
      "SELECT id, pola_perulangan, interval_hari FROM activity_schedules WHERE id = ?",
      [body.id],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].pola_perulangan).toBe("berulang");
    expect(rows[0].interval_hari).toBe(2);

    // Bersihkan
    for (const q of [
      "DELETE FROM aktivitas_kegiatan WHERE aktivitas_id = ?",
      "DELETE FROM aktivitas_santri WHERE aktivitas_id = ?",
      "DELETE FROM aktivitas_tanaman WHERE aktivitas_id = ?",
      "DELETE FROM activity_tasks WHERE schedule_id = ?",
      "DELETE FROM activity_schedules WHERE id = ?",
    ]) {
      try {
        await db.query(q, [body.id]);
      } catch (e) {
        console.warn("cleanup test 8:", e.message);
      }
    }
  });

  test("7: hapus lokasi uji", async () => {
    // Lokasi punya jadwal dari uji 5 → backend menolak hapus (guard aktivitas).
    // Lepas dulu relasi jadwal via DB, lalu hapus lokasi (soft-delete aktif=0)
    try {
      await db.query("DELETE FROM activity_schedules WHERE nama_aktivitas = ?", [
        namaAktivitas,
      ]);
    } catch (e) {
      console.warn("lepas jadwal:", e.message);
    }

    const res = await fetch(`${API}/api/lokasi/${lokasiId}`, {
      method: "DELETE",
    });
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.message).toMatch(/Lokasi dinonaktifkan/);

    const detail = await apiGet(`/api/lokasi/${lokasiId}`);
    expect(detail.aktif).toBe(0);

    const list = await apiGet("/api/lokasi");
    expect(list.find((l) => l.id === lokasiId)).toBeUndefined();
  });
});