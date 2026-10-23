/* ─── INFO TANAMAN / TERNAK pada tugas ────────────────────────────────────
   Backend mengembalikan string ringkas pada kolom `tanaman_info` / `ternak_info`:
     - tanaman: "tanaman_id||nama||aksi"
     - ternak : "ternak_id||nama||master_aksi_id||namaAksi"
   Beberapa entri dipisah ";;". Format lama tanpa id tetap didukung.
   ───────────────────────────────────────────────────────────────────────── */
export const AKSI_LABEL = {
  siram: "Siram",
  pupuk: "Pupuk",
  panen: "Panen",
};

export const pecahInfo = (raw) =>
  Array.isArray(raw)
    ? raw
    : typeof raw === "string" && raw.trim()
    ? raw.split(";;")
    : [];

export const parseTanamanInfo = (raw) =>
  pecahInfo(raw)
    .map((chunk) => {
      const parts = String(chunk).split("||");
      if (parts.length >= 3) {
        const [id, nama, aksi] = parts;
        return {
          id: parseInt(id, 10) || null,
          nama: (nama || "").trim(),
          aksi: (aksi || "").trim(),
        };
      }
      const [nama, aksi] = parts;
      return { id: null, nama: (nama || "").trim(), aksi: (aksi || "").trim() };
    })
    .filter((t) => t.nama);

export const parseTernakInfo = (raw) =>
  pecahInfo(raw)
    .map((chunk) => {
      const parts = String(chunk).split("||");
      if (parts.length >= 4) {
        const [id, nama, aksiId, aksi] = parts;
        return {
          id: parseInt(id, 10) || null,
          nama: (nama || "").trim(),
          aksiId: parseInt(aksiId, 10) || null,
          aksi: (aksi || "").trim(),
        };
      }
      const [nama, aksi] = parts;
      return { id: null, nama: (nama || "").trim(), aksiId: null, aksi: (aksi || "").trim() };
    })
    .filter((t) => t.nama);
