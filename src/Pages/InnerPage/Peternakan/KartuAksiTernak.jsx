import { FiCheckCircle } from "react-icons/fi";
import { konfigurasiAksiSemantis } from "../../../Shared/ikonAksi";

// Gaya ikon + warna otomatis untuk sebuah aksi ternak (mendukung aksi kustom
// buatan admin). Selaras dengan kartu "Total <Ternak>" / "Total Mati".
export const gayaAksiTernak = (nama) =>
  konfigurasiAksiSemantis(String(nama || "").trim(), "ternak") || {
    label: "Perawatan",
    Icon: FiCheckCircle,
    card: "bg-slate-50 dark:bg-slate-500/10 border-line",
    chipBg: "bg-slate-50 dark:bg-slate-500/15",
    chipText: "text-slate-600 dark:text-slate-300",
    chipSolid: "bg-slate-600 border-slate-600 text-white",
    valueText: "text-slate-700 dark:text-slate-300",
  };

/**
 * Kartu satu aksi perawatan ternak.
 *
 * Gaya menyatu dengan kartu di halaman tanaman: latar kartu abu-abu netral
 * (bukan warna per kategori), ikon kotak rounded di kiri dengan warna kategori
 * tetap dipertahankan, teks di kanan.
 *
 * Isi (rata kiri, dari atas ke bawah):
 *   1. Nama aksi LENGKAP (tanpa elipsis, wrap maksimal 2 baris)
 *   2. Angka jumlah konfirmasi (rapat di bawah nama aksi)
 *
 * Badge "Butuh jumlah" dipasang absolute di pojok kartu supaya TIDAK menambah
 * tinggi, sehingga semua kartu tetap sama tinggi.
 */
export function KartuAksiTernak({ aksi }) {
  const g = gayaAksiTernak(aksi?.nama_aksi || aksi?.label);
  const total = Number(aksi?.jumlah) || 0;
  const nama = aksi?.label || aksi?.nama_aksi || "Perawatan";
  const butuhAngka = Boolean(aksi?.butuh_input_angka);
  const Icon = g.Icon;

  return (
    <div
      className="relative flex items-center gap-3 border border-line bg-surface2 p-4 rounded-xl shadow-sm h-full"
    >
      <div className={`p-2 rounded-lg shrink-0 ${g.chipBg}`}>
        <Icon className={`w-5 h-5 ${g.chipText}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted leading-snug break-words">
          {nama}
        </p>
        <p className="font-extrabold text-2xl leading-tight text-ink">
          {total}
        </p>
      </div>

      {butuhAngka && (
        <span className="absolute bottom-2.5 right-2.5 text-[9px] font-bold leading-none bg-white/85 dark:bg-black/30 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30 rounded-full px-1.5 py-0.5">
          Butuh jumlah
        </span>
      )}
    </div>
  );
}

/**
 * Susun urutan tampil kartu aksi:
 *   - aksi sejenis (mis. "Bersihkan Kandang" Pagi & Sore) selalu berdampingan
 *   - aksi "panen / hasil" ditempatkan mendekati akhir
 *   - aksi "konfirmasi / mati" ditempatkan paling akhir
 * Urutan asli (`urutan`) tetap dipakai sebagai pengurut utama di dalam kategori.
 */
const namaAksiKunci = (a) => String(a?.nama_aksi || a?.label || "").toLowerCase();

const kategoriAksi = (a) => {
  const k = namaAksiKunci(a);
  if (/konfirmasi|mati|sakit|penyakit|mortalitas|bangkai/.test(k)) return 2;
  if (/panen|petik|pungut|harvest|hasil/.test(k)) return 1;
  return 0;
};

export function urutkanAksi(daftar = []) {
  const minUrut = new Map();
  daftar.forEach((a, i) => {
    const key = namaAksiKunci(a);
    const u = Number(a?.urutan);
    const v = Number.isFinite(u) ? u : i;
    if (!minUrut.has(key) || v < minUrut.get(key)) minUrut.set(key, v);
  });

  return daftar
    .map((a, i) => ({ a, i }))
    .sort((x, y) => {
      const kat = kategoriAksi(x.a) - kategoriAksi(y.a);
      if (kat) return kat;
      const grup =
        minUrut.get(namaAksiKunci(x.a)) - minUrut.get(namaAksiKunci(y.a));
      if (grup) return grup;
      const ux = Number(x.a?.urutan);
      const uy = Number(y.a?.urutan);
      const nx = Number.isFinite(ux) ? ux : x.i;
      const ny = Number.isFinite(uy) ? uy : y.i;
      if (nx !== ny) return nx - ny;
      return x.i - y.i;
    })
    .map(({ a }) => a);
}

/**
 * Ringkasan satu baris di kartu koleksi ternak — selaras dgn halaman
 * pertanian: "<ikon> 24x Siram • <ikon> 7x Pupuk ...".
 * Angka diambil dari `aksi[].jumlah` (hasil hitung backend dari riwayat).
 * `aksi === undefined` → masih memuat.
 */
export function RingkasanAksiTernak({ aksi }) {
  if (!aksi) {
    return <span className="text-xs text-muted">Memuat riwayat…</span>;
  }
  if (!aksi.length) {
    return (
      <span className="text-xs text-muted">Belum ada aksi perawatan.</span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-[13px]">
      {urutkanAksi(aksi).map((a) => {
        const g = gayaAksiTernak(a.nama_aksi);
        const Ikon = g.Icon;
        const n = Number(a.jumlah) || 0;
        const nama = a.label || a.nama_aksi || "Perawatan";
        return (
          <span
            key={a.id ?? nama}
            className="inline-flex items-center gap-1.5 font-semibold text-muted"
            title={`${nama}: total ${n}x`}
          >
            <Ikon className={`${g.chipText} w-3.5 h-3.5 shrink-0`} />
            <span className="text-ink font-bold">{n}x</span>
            {nama}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Grid responsif kartu aksi perawatan ternak.
 *
 * 2 kolom di layar kecil ke atas, 1 kolom di HP sempit — supaya label tetap
 * terbaca penuh. Jarak antar kartu (gap-3) sama dengan grid kartu Total, dan
 * `items-stretch` membuat semua kartu sama tinggi.
 */
export function GridAksiTernak({ aksi = [] }) {
  if (!aksi.length) {
    return (
      <p className="px-4 py-6 text-sm text-muted text-center">
        Belum ada aksi perawatan terdaftar.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch p-4">
      {urutkanAksi(aksi).map((a) => (
        <KartuAksiTernak key={a.id ?? a.nama_aksi} aksi={a} />
      ))}
    </div>
  );
}
