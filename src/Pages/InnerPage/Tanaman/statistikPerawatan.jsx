import { FiDroplet, FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import { konfigurasiAksiSemantis } from "../../../Shared/ikonAksi";

// Konfigurasi kartu "riwayat perawatan" per tanaman.
// Angkanya BUKAN statis: diambil dari API (/api/tanaman & /api/tanaman/:id)
// yang menghitungnya dari tabel `log_perawatan` di database.
export const JENIS_PERAWATAN = [
  {
    key: "siram",
    label: "Siram Air",
    ringkas: "Siram",
    Icon: FiDroplet,
    chipBg: "bg-blue-50 dark:bg-blue-500/15",
    chipText: "text-blue-600 dark:text-blue-400",
    valueText: "text-blue-700 dark:text-blue-400",
    chipSolid: "bg-blue-600 border-blue-600 text-white",
  },
  {
    key: "pupuk",
    label: "Beri Pupuk",
    ringkas: "Pupuk",
    Icon: FiTrendingUp,
    chipBg: "bg-orange-50 dark:bg-orange-500/15",
    chipText: "text-orange-600 dark:text-orange-400",
    valueText: "text-orange-700 dark:text-orange-400",
    chipSolid: "bg-orange-600 border-orange-600 text-white",
  },
  {
    key: "panen",
    label: "Panen",
    ringkas: "Panen",
    Icon: FiShoppingBag,
    chipBg: "bg-green-50 dark:bg-green-500/15",
    chipText: "text-green-600 dark:text-green-400",
    valueText: "text-green-700 dark:text-green-400",
    chipSolid: "bg-green-600 border-green-600 text-white",
  },
];

/** Jumlah kali suatu aksi sudah dilakukan. Selalu angka (0 bila belum ada). */
export const totalPerawatan = (tanaman, key) => {
  const n = Number(tanaman?.[`total_${key}`]);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Tanggal aksi terakhir, atau null bila belum pernah. */
export const terakhirPerawatan = (tanaman, key) =>
  tanaman?.[`terakhir_${key}`] || null;

// Nama aksi baku (key di JENIS_PERAWATAN) selalu dipetakan ke dirinya sendiri,
// supaya nilai canonical dari database ("siram"/"pupuk"/"panen") tidak pernah
// hilang. Alias lain (kapitalisasi/istilah lain) dipetakan ke key yang sama.
const NORMALISASI_AKSI = {
  ...Object.fromEntries(JENIS_PERAWATAN.map((j) => [j.key, j.key])),
  penyiraman: "siram",
  siraman: "siram",
  menyiram: "siram",
  disiram: "siram",
  pukul: "pupuk",
  fertilized: "pupuk",
  memupuk: "pupuk",
  dipupuk: "pupuk",
  pemupukan: "pupuk",
  pemanenan: "panen",
  harvesting: "panen",
  dipanen: "panen",
};

export const normalisasiAksi = (nilai) => {
  const key = String(nilai || "")
    .trim()
    .toLowerCase();
  if (!key) return null;
  return NORMALISASI_AKSI[key] || key;
};

/** Gaya ikon/warna untuk sebuah aksi (baku maupun kustom). */
export function styleAksi(aksi) {
  return konfigurasiAksi(aksi) || null;
}

// Konfigurasi tampilan (ikon + warna + label) untuk aksi apa pun.
// Aksi baku memakai JENIS_PERAWATAN (warnanya khas); aksi kustom dipilih
// otomatis dari namanya (mis. "tanam" → ikon bibit) lewat registry bersama.
export function konfigurasiAksi(aksi) {
  const key = normalisasiAksi(aksi);
  if (!key) return null;
  const baku = JENIS_PERAWATAN.find((j) => j.key === key);
  if (baku) return baku;
  return konfigurasiAksiSemantis(key, "tanaman");
}

// Susun daftar aksi untuk kartu/tab/ringkasan:
// aksi baku (siram/pupuk/panen) → aksi dari katalog tanaman → aksi yang muncul di riwayat.
export function daftarAksi(aksi = [], riwayat = []) {
  const hasil = [];
  const tambah = (raw) => {
    const konf = konfigurasiAksi(raw);
    if (!konf) return;
    if (!hasil.some((h) => h.key === konf.key)) hasil.push(konf);
  };
  JENIS_PERAWATAN.forEach((j) => tambah(j.key));
  (Array.isArray(aksi) ? aksi : []).forEach(tambah);
  (Array.isArray(riwayat) ? riwayat : []).forEach((r) =>
    tambah(r?.jenis_tindakan ?? r?.tipe_aksi),
  );
  return hasil;
}

/**
 * Hitung total + tanggal terakhir per aksi LANGSUNG dari daftar riwayat
 * perawatan yang diambil dari database (`/api/tanaman/:id/riwayat`).
 *
 * Dipakai sebagai sumber utama supaya halaman tidak bergantung pada field
 * agregat dari backend — dan otomatis ikut bertambah begitu Santri mengirim
 * laporan, karena halaman memanggil ulang endpoint riwayat itu.
 */
export function statistikDariRiwayat(riwayat) {
  const hasil = {};
  const slot = (key) => (hasil[key] = hasil[key] || { total: 0, terakhir: null });

  for (const item of Array.isArray(riwayat) ? riwayat : []) {
    if (!item) continue;
    const key = normalisasiAksi(item.jenis_tindakan ?? item.tipe_aksi);
    if (!key) continue;
    const waktu =
      item.waktu_tindakan ?? item.created_at ?? item.waktu_aksi ?? null;
    const s = slot(key);
    s.total += 1;
    if (waktu && (!s.terakhir || new Date(waktu) > new Date(s.terakhir))) {
      s.terakhir = waktu;
    }
  }
  return hasil;
}

// Sumber angka untuk satu aksi: pakai riwayat bila sudah dimuat (paling
// real-time & berasal dari database), selain itu jatuh ke agregat `total_*`
// dari API. Mendukung aksi kustom (bukan hanya siram/pupuk/panen).
export function statAksi(tanaman, riwayat, key) {
  if (Array.isArray(riwayat)) {
    const dariRiwayat = statistikDariRiwayat(riwayat);
    return dariRiwayat[key] || { total: 0, terakhir: null };
  }
  return {
    total: totalPerawatan(tanaman, key),
    terakhir: terakhirPerawatan(tanaman, key),
  };
}

const selisihHari = (date) => {
  const tengah = new Date();
  tengah.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((tengah - target) / 86400000);
};

/** "Hari ini" / "Kemarin" / "3 hari lalu" / "23 Sep 2026". */
export function formatTanggalPerawatan(value) {
  if (!value) return "Belum pernah";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum pernah";
  const selisih = selisihHari(date);
  if (selisih === 0) return "Hari ini";
  if (selisih === 1) return "Kemarin";
  if (selisih > 1 && selisih < 7) return `${selisih} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Kartu statistik satu aksi di halaman detail tanaman:
 * ikon + label + angka tebal "Nx" + "Terakhir: <tanggal>".
 */
export function KartuPerawatan({ tanaman, item, riwayat }) {
  const stat = statAksi(tanaman, riwayat, item.key);
  const total = stat.total;
  const terakhir = formatTanggalPerawatan(stat.terakhir);
  const { Icon } = item;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 sm:space-x-0 bg-card p-3 sm:p-4 rounded-xl border border-line shadow-sm h-full">
      <div className={`p-2 rounded-lg shrink-0 ${item.chipBg}`}>
        <Icon className={`${item.chipText} w-5 h-5`} />
      </div>
      <div className="min-w-0">
        <span className="block text-xs text-muted mb-1">{item.label}</span>
        <span
          className={`block font-bold text-lg sm:text-xl leading-tight ${item.valueText}`}
        >
          {total}x
        </span>
        <span className="block text-[10px] sm:text-[11px] text-muted mt-0.5 leading-snug break-words">
          Terakhir: {terakhir}
        </span>
      </div>
    </div>
  );
}

/** Ringkasan satu baris di kartu koleksi: "Siram 12x • Pupuk 3x • Panen 1x". */
export function RingkasanPerawatan({ tanaman, riwayat, items }) {
  const daftar =
    Array.isArray(items) && items.length
      ? items
      : daftarAksi([], Array.isArray(riwayat) ? riwayat : []);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-[13px]">
      {daftar.map((j) => {
        const Ikon = j.Icon;
        const n = statAksi(tanaman, riwayat, j.key).total;
        return (
          <span
            key={j.key}
            className="inline-flex items-center gap-1.5 font-semibold text-muted"
            title={`${j.label}: total ${n}x`}
          >
            <Ikon className={`${j.chipText} w-3.5 h-3.5 shrink-0`} />
            <span className="text-ink font-bold">{n}x</span>
            {j.ringkas}
          </span>
        );
      })}
    </div>
  );
}
