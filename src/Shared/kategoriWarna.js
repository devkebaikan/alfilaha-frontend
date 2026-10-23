/* ─── KATEGORI WARNA (shared) ────────────────────────────────────────────── */
export const KATEGORI_COLOR = {
  Kepondokan: { bg:"bg-blue-100 dark:bg-blue-500/20",   text:"text-blue-700 dark:text-blue-300",   dot:"bg-blue-500",   ring:"ring-blue-200"  },
  Akademik:   { bg:"bg-purple-100 dark:bg-purple-500/20", text:"text-purple-700 dark:text-purple-300", dot:"bg-purple-500", ring:"ring-purple-200"},
  Kebersihan: { bg:"bg-cyan-100 dark:bg-cyan-500/20",   text:"text-cyan-700 dark:text-cyan-300",   dot:"bg-cyan-500",   ring:"ring-cyan-200"  },
  Pertanian:  { bg:"bg-green-100 dark:bg-green-500/20",  text:"text-green-700 dark:text-green-300",  dot:"bg-green-500",  ring:"ring-green-200" },
  Ibadah:     { bg:"bg-orange-100 dark:bg-orange-500/20", text:"text-orange-700 dark:text-orange-300", dot:"bg-orange-500", ring:"ring-orange-200"},
  Olahraga:   { bg:"bg-red-100 dark:bg-red-500/20",    text:"text-red-700 dark:text-red-300",    dot:"bg-red-500",    ring:"ring-red-200"   },
  Lainnya:    { bg:"bg-gray-100 dark:bg-white/10",   text:"text-gray-600 dark:text-gray-300",   dot:"bg-gray-400",   ring:"ring-gray-200"  },
};

export const kc = (k) => {
  // Terima dua bentuk input:
  //   - object tugas/jadwal  → pakai nama_kategori, fallback ke kategori
  //   - string kategori langsung
  let categoryName = "Lainnya";
  if (typeof k === "string" && k.trim()) {
    categoryName = k.trim();
  } else if (k && typeof k === "object") {
    categoryName = k.nama_kategori || k.kategori || "Lainnya";
  }
  return KATEGORI_COLOR[categoryName] || KATEGORI_COLOR.Lainnya;
};
