import { test, expect } from "@playwright/test";
import {
  loginAsAdmin,
  apiGet,
  apiDeleteSafe,
  createLokasi,
  createTanaman,
  uniqueName,
} from "./helpers.js";

test.describe("Admin - Manajemen Tanaman", () => {
  test("tambah tanaman: dropdown lokasi dari API + lokasi_id tersimpan", async ({
    page,
    request,
  }) => {
    const lokasi = await createLokasi(uniqueName("LokasiTanaman"));
    const nama = uniqueName("Tanaman");
    let tanId = null;

    try {
      await loginAsAdmin(page, request, "tanaman");
      await page.getByRole("button", { name: "Tambah Tanaman" }).click();
      await expect(
        page.getByRole("heading", { name: "Tambah Tanaman Baru" }),
      ).toBeVisible();

      await page.getByPlaceholder("Misal: Pohon Jati").fill(nama);
      await page.getByPlaceholder("Misal: Tanaman Hias / Kayu").fill("Tanaman Hias");

      const lokasiSelect = page
        .locator("select")
        .filter({ hasText: "Pilih Lokasi..." });
      await expect(lokasiSelect).toContainText(lokasi.nama);
      await expect(
        lokasiSelect.locator(`option[value="${lokasi.id}"]`),
      ).toHaveCount(1);
      await lokasiSelect.selectOption(String(lokasi.id));

      await page.getByRole("button", { name: "Simpan Tanaman" }).click();
      await expect(
        page.getByText(`Lokasi: ${lokasi.nama}`, { exact: true }),
      ).toBeVisible();

      const list = await apiGet("/api/tanaman");
      const t = list.find((x) => x.nama === nama);
      expect(t).toBeDefined();
      expect(String(t.lokasi_id)).toBe(String(lokasi.id));
      expect(t.lokasi).toBe(lokasi.nama);
      tanId = t.id;
    } finally {
      if (tanId) await apiDeleteSafe(`/api/tanaman/${tanId}`);
      await apiDeleteSafe(`/api/lokasi/${lokasi.id}`);
    }
  });

  test("edit tanaman: ubah lokasi", async ({ page, request }) => {
    const lokasiA = await createLokasi(uniqueName("LokasiA"));
    const lokasiB = await createLokasi(uniqueName("LokasiB"));
    const nama = uniqueName("TanamanEdit");
    let tanId = null;

    try {
      const created = await createTanaman({ nama, lokasi_id: lokasiA.id });
      tanId = created.id;

      await loginAsAdmin(page, request, "tanaman");
      const card = page
        .locator("div.grid.gap-6 > div")
        .filter({ hasText: nama });
      await expect(card).toHaveCount(1);
      await card.getByRole("button", { name: "Edit", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Edit Tanaman" }),
      ).toBeVisible();

      const lokasiSelect = page
        .locator("select")
        .filter({ hasText: "Pilih Lokasi..." });
      await expect(lokasiSelect).toHaveValue(String(lokasiA.id));
      await lokasiSelect.selectOption(String(lokasiB.id));

      await page.getByRole("button", { name: "Simpan Perubahan" }).click();
      await expect(
        page.getByText(`Lokasi: ${lokasiB.nama}`, { exact: true }),
      ).toBeVisible();

      const list = await apiGet("/api/tanaman");
      const t = list.find((x) => x.id === tanId);
      expect(String(t.lokasi_id)).toBe(String(lokasiB.id));
      expect(t.lokasi).toBe(lokasiB.nama);
    } finally {
      if (tanId) await apiDeleteSafe(`/api/tanaman/${tanId}`);
      await apiDeleteSafe(`/api/lokasi/${lokasiA.id}`);
      await apiDeleteSafe(`/api/lokasi/${lokasiB.id}`);
    }
  });
});