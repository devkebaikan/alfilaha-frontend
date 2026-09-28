import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  apiGet,
  apiDeleteSafe,
  createLokasi,
  createTanaman,
  uniqueName,
  API,
} from "./helpers.js";

test.describe("Admin - Manajemen Lokasi & Area", () => {
  test("login admin lewat form UI", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Administrator Panel")).toBeVisible();
    await page.getByPlaceholder("Masukkan Username").fill("admin");
    await page.getByPlaceholder("Masukkan Password").fill("admin123");
    await page.getByRole("button", { name: "Masuk Dashboard" }).click();
    await expect(page.getByText("Lokasi & Area")).toBeVisible();
  });

  test("tambah lokasi dengan kegiatan (normalisasi spasi)", async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request, "lokasi");
    const name = uniqueName("Lokasi");
    let createdId = null;

    try {
      await page.getByRole("button", { name: "Tambah Lokasi" }).click();
      await expect(
        page.getByRole("heading", { name: "Tambah Lokasi Baru" }),
      ).toBeVisible();

      await page
        .getByPlaceholder("contoh: Kebun 1, Asrama A, Masjid Utama")
        .fill(name);
      await page
        .getByPlaceholder("Deskripsi singkat tentang lokasi ini...")
        .fill("Lokasi hasil uji e2e");

      const kegiatanInput = page.getByPlaceholder(
        "Nama kegiatan, lalu tekan Tambah...",
      );
      await kegiatanInput.fill("Menyapu  Halaman"); // spasi ganda → harus dinormalisasi
      await page
        .locator("form")
        .getByRole("button", { name: "Tambah", exact: true })
        .click();
      await kegiatanInput.fill("Penyiraman Tanaman");
      await page
        .locator("form")
        .getByRole("button", { name: "Tambah", exact: true })
        .click();

      await expect(page.getByText("Menyapu Halaman", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Penyiraman Tanaman", { exact: true }),
      ).toBeVisible();

      await page
        .locator("form")
        .getByRole("button", { name: "Tambah Lokasi", exact: true })
        .click();

      await expect(page.getByText("Lokasi berhasil ditambahkan")).toBeVisible();
      const card = page
        .locator("div.grid.gap-4 > div")
        .filter({ hasText: name });
      await expect(card).toHaveCount(1);

      const list = await apiGet("/api/lokasi");
      const created = list.find((l) => l.nama === name);
      expect(created).toBeDefined();
      createdId = created.id;

      const detail = await apiGet(`/api/lokasi/${createdId}`);
      expect(detail.kegiatan.map((k) => k.nama).sort()).toEqual([
        "Menyapu Halaman",
        "Penyiraman Tanaman",
      ]);

      await card.getByRole("button", { name: "Lihat Detail" }).click();
      await expect(page.getByText("Menyapu Halaman", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Penyiraman Tanaman", { exact: true }),
      ).toBeVisible();
    } finally {
      if (createdId) await apiDeleteSafe(`/api/lokasi/${createdId}`);
    }
  });

  test("edit lokasi: hapus & tambah kegiatan", async ({ page, request }) => {
    const name = uniqueName("EditLokasi");
    const { id } = await createLokasi(name, [
      "Menyapu  Halaman",
      "Penyiraman Tanaman",
    ]);
    let createdId = id;

    try {
      await loginAsAdmin(page, request, "lokasi");
      const card = page
        .locator("div.grid.gap-4 > div")
        .filter({ hasText: name });
      await expect(card).toHaveCount(1);
      await card.getByRole("button", { name: "Lihat Detail" }).click();
      await expect(
        page.getByText("Penyiraman Tanaman", { exact: true }),
      ).toBeVisible();

      await page.getByRole("button", { name: "Edit", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Edit Lokasi" })).toBeVisible();
      await expect(
        page.getByPlaceholder("contoh: Kebun 1, Asrama A, Masjid Utama"),
      ).toHaveValue(name);

      await page
        .getByRole("button", { name: "Hapus kegiatan Menyapu Halaman" })
        .click();
      await expect(
        page.getByText("Menyapu Halaman", { exact: true }),
      ).toHaveCount(0);

      const kegiatanInput = page.getByPlaceholder(
        "Nama kegiatan, lalu tekan Tambah...",
      );
      await kegiatanInput.fill("Menyiram Tanaman");
      await page
        .locator("form")
        .getByRole("button", { name: "Tambah", exact: true })
        .click();

      await page
        .locator("form")
        .getByRole("button", { name: "Simpan Perubahan", exact: true })
        .click();
      await expect(page.getByText("Lokasi berhasil diperbarui")).toBeVisible();

      const detail = await apiGet(`/api/lokasi/${createdId}`);
      expect(detail.kegiatan.map((k) => k.nama).sort()).toEqual([
        "Menyiram Tanaman",
        "Penyiraman Tanaman",
      ]);

      const cardAfter = page
        .locator("div.grid.gap-4 > div")
        .filter({ hasText: name });
      await cardAfter.first().getByRole("button", { name: "Lihat Detail" }).click();
      await expect(
        page.getByText("Menyiram Tanaman", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Menyapu Halaman", { exact: true }),
      ).toHaveCount(0);
    } finally {
      if (createdId) await apiDeleteSafe(`/api/lokasi/${createdId}`);
    }
  });

  test("nama lokasi duplikat (beda huruf besar) ditolak", async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request, "lokasi");
    const name = uniqueName("Dup");
    const { id } = await createLokasi(name);

    try {
      await page.getByRole("button", { name: "Tambah Lokasi" }).click();
      await page
        .getByPlaceholder("contoh: Kebun 1, Asrama A, Masjid Utama")
        .fill(name.toLowerCase()); // case beda → harus ditolak
      await page
        .locator("form")
        .getByRole("button", { name: "Tambah Lokasi", exact: true })
        .click();
      await expect(page.getByText("Terjadi kesalahan")).toBeVisible();
      await expect(page.getByText(/Nama lokasi sudah ada/)).toBeVisible();
    } finally {
      await apiDeleteSafe(`/api/lokasi/${id}`);
    }
  });

  test("hapus lokasi via UI (soft delete)", async ({ page, request }) => {
    const name = uniqueName("Hapus");
    const { id } = await createLokasi(name);

    try {
      await loginAsAdmin(page, request, "lokasi");
      const card = page
        .locator("div.grid.gap-4 > div")
        .filter({ hasText: name });
      await expect(card).toHaveCount(1);
      await card.hover();
      page.once("dialog", (dialog) => dialog.accept());
      await card.getByRole("button").nth(1).click();

      await expect(page.getByText("Lokasi berhasil dihapus")).toBeVisible();
      await expect(card).toHaveCount(0);

      const detail = await apiGet(`/api/lokasi/${id}`);
      expect(detail.aktif).toBe(0);
    } finally {
      await apiDeleteSafe(`/api/lokasi/${id}`);
    }
  });

  test("lokasi yang dipakai tanaman tidak bisa dihapus", async () => {
    const name = uniqueName("Guard");
    const { id } = await createLokasi(name);
    let tanId = null;

    try {
      tanId = (
        await createTanaman({ nama: uniqueName("Tanaman"), lokasi_id: id })
      ).id;
      const res = await fetch(`${API}/api/lokasi/${id}`, { method: "DELETE" });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/masih digunakan/);
    } finally {
      if (tanId) await apiDeleteSafe(`/api/tanaman/${tanId}`);
      await apiDeleteSafe(`/api/lokasi/${id}`);
    }
  });
});