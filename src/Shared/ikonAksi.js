import {
  FiDroplet,
  FiShoppingBag,
  FiCoffee,
  FiTrash2,
  FiAlertTriangle,
  FiSun,
  FiSunrise,
  FiSunset,
  FiScissors,
  FiPackage,
  FiFeather,
  FiStar,
  FiZap,
  FiTruck,
  FiGift,
  FiTarget,
  FiLayers,
} from "react-icons/fi";
import {
  GiPlantSeed,
  GiPlantRoots,
  GiFertilizerBag,
  GiSickle,
  GiSpray,
  GiSpade,
  GiEggClutch,
  GiMilkCarton,
  GiSyringe,
} from "react-icons/gi";

// Katalog ikon aksi perawatan (tanaman & ternak), terpusat di satu tempat.
// Dipakai supaya ikon/warna untuk SETIAP aksi — termasuk aksi kustom yang
// dibuat admin lewat "Kelola Aksi" — dipilih otomatis dari nama aksinya
// (mis. "tanam" → bibit, "semprot" → spray, "perah susu" → susu).
//
// Aturan dicek berurutan; yang pertama cocok dipakai. Aturan ber-konteks
// "tanaman"/"ternak" hanya berlaku di konteks itu, "umum" berlaku di
// keduanya. Taruh yang paling spesifik di atas.
export const KATALOG_IKON = [
  // ── Ternak ──
  // Pakan pagi vs sore dibedakan ikonnya (matahari terbit/terbenam), bukan
  // sama-sama cangkir kopi; taruh di atas aturan "pakan" umum.
  {
    konteks: "ternak",
    cocok: /pakan.*pagi|pagi.*pakan|sarapan/,
    Icon: FiSunrise,
    warna: "green",
  },
  {
    konteks: "ternak",
    cocok: /pakan.*sore|sore.*pakan|pakan.*malam|malam.*pakan|senja/,
    Icon: FiSunset,
    warna: "green",
  },
  {
    konteks: "ternak",
    cocok:
      /pakan|makan|feed|hijauan|ransum|pellet|dedak|konsentrat|rumput|nutrisi|vitamin/,
    Icon: FiCoffee,
    warna: "green",
  },
  { konteks: "ternak", cocok: /telur|egg|ovipos/, Icon: GiEggClutch, warna: "amber" },
  { konteks: "ternak", cocok: /susu|perah|milk/, Icon: GiMilkCarton, warna: "purple" },

  // ── Tanaman ──
  {
    konteks: "tanaman",
    cocok: /pupuk|fertilizer|kompos|manure|hara|nutrisi|pemupukan/,
    Icon: GiFertilizerBag,
    warna: "orange",
  },
  {
    konteks: "tanaman",
    cocok: /tanam|semai|bibit|benih|kecambah|sprout|seed|nurseri|pindah/,
    Icon: GiPlantSeed,
    warna: "amber",
  },
  {
    konteks: "tanaman",
    cocok: /cangkul|olah tanah|bajak|gembur|spade|soil|tanah/,
    Icon: GiSpade,
    warna: "indigo",
  },

  // ── Umum (tanaman + ternak) ──
  {
    konteks: "umum",
    cocok: /semprot|pestisida|hama|insektisida|fungisida|herbisida|spray/,
    Icon: GiSpray,
    warna: "lime",
  },
  {
    konteks: "umum",
    cocok: /vaksin|obat|suntik|injeksi|kesehatan|sehat|medical|periksa/,
    Icon: GiSyringe,
    warna: "red",
  },
  {
    konteks: "umum",
    cocok: /sakit|mati|penyakit|dead|mortalitas|bangkai/,
    Icon: FiAlertTriangle,
    warna: "red",
  },
  {
    konteks: "umum",
    cocok:
      /pangkas|potong|prune|trim|gulma|rumput|siangi|penyiangan|tebas|sickle|kuku|gigi/,
    Icon: GiSickle,
    warna: "teal",
  },
  {
    konteks: "umum",
    cocok: /bersih|sanitasi|steril|cuci|kandang|disinfekt/,
    Icon: FiTrash2,
    warna: "orange",
  },
  {
    konteks: "umum",
    cocok: /panen|petik|pungut|harvest|hasil/,
    Icon: FiShoppingBag,
    warna: "green",
  },
  {
    konteks: "umum",
    cocok: /siram|air|minum|water|watering|penyiraman/,
    Icon: FiDroplet,
    warna: "blue",
  },
  {
    konteks: "umum",
    cocok: /rawat|perawatan|akar|root|tumbuh|growth/,
    Icon: GiPlantRoots,
    warna: "green",
  },
];

// Kelas Tailwind per warna. Ditulis literal (bukan dirangkai) supaya tetap
// terdeteksi Tailwind saat build. `card` dipakai untuk latar kartu (mis. kartu
// statistik aksi perawatan), `chip*` untuk ikon/badge.
export const PALET_WARNA = {
  blue: {
    card: "bg-blue-50 dark:bg-blue-500/10 border-line",
    chipBg: "bg-blue-50 dark:bg-blue-500/15",
    chipText: "text-blue-600 dark:text-blue-400",
    valueText: "text-blue-700 dark:text-blue-400",
    chipSolid: "bg-blue-600 border-blue-600 text-white",
  },
  orange: {
    card: "bg-orange-50 dark:bg-orange-500/10 border-line",
    chipBg: "bg-orange-50 dark:bg-orange-500/15",
    chipText: "text-orange-600 dark:text-orange-400",
    valueText: "text-orange-700 dark:text-orange-400",
    chipSolid: "bg-orange-600 border-orange-600 text-white",
  },
  green: {
    card: "bg-green-50 dark:bg-green-500/10 border-line",
    chipBg: "bg-green-50 dark:bg-green-500/15",
    chipText: "text-green-600 dark:text-green-400",
    valueText: "text-green-700 dark:text-green-400",
    chipSolid: "bg-green-600 border-green-600 text-white",
  },
  amber: {
    card: "bg-amber-50 dark:bg-amber-500/10 border-line",
    chipBg: "bg-amber-50 dark:bg-amber-500/15",
    chipText: "text-amber-600 dark:text-amber-400",
    valueText: "text-amber-700 dark:text-amber-400",
    chipSolid: "bg-amber-600 border-amber-600 text-white",
  },
  teal: {
    card: "bg-teal-50 dark:bg-teal-500/10 border-line",
    chipBg: "bg-teal-50 dark:bg-teal-500/15",
    chipText: "text-teal-600 dark:text-teal-400",
    valueText: "text-teal-700 dark:text-teal-400",
    chipSolid: "bg-teal-600 border-teal-600 text-white",
  },
  violet: {
    card: "bg-violet-50 dark:bg-violet-500/10 border-line",
    chipBg: "bg-violet-50 dark:bg-violet-500/15",
    chipText: "text-violet-600 dark:text-violet-400",
    valueText: "text-violet-700 dark:text-violet-400",
    chipSolid: "bg-violet-600 border-violet-600 text-white",
  },
  rose: {
    card: "bg-rose-50 dark:bg-rose-500/10 border-line",
    chipBg: "bg-rose-50 dark:bg-rose-500/15",
    chipText: "text-rose-600 dark:text-rose-400",
    valueText: "text-rose-700 dark:text-rose-400",
    chipSolid: "bg-rose-600 border-rose-600 text-white",
  },
  cyan: {
    card: "bg-cyan-50 dark:bg-cyan-500/10 border-line",
    chipBg: "bg-cyan-50 dark:bg-cyan-500/15",
    chipText: "text-cyan-600 dark:text-cyan-400",
    valueText: "text-cyan-700 dark:text-cyan-400",
    chipSolid: "bg-cyan-600 border-cyan-600 text-white",
  },
  lime: {
    card: "bg-lime-50 dark:bg-lime-500/10 border-line",
    chipBg: "bg-lime-50 dark:bg-lime-500/15",
    chipText: "text-lime-600 dark:text-lime-400",
    valueText: "text-lime-700 dark:text-lime-400",
    chipSolid: "bg-lime-600 border-lime-600 text-white",
  },
  indigo: {
    card: "bg-indigo-50 dark:bg-indigo-500/10 border-line",
    chipBg: "bg-indigo-50 dark:bg-indigo-500/15",
    chipText: "text-indigo-600 dark:text-indigo-400",
    valueText: "text-indigo-700 dark:text-indigo-400",
    chipSolid: "bg-indigo-600 border-indigo-600 text-white",
  },
  fuchsia: {
    card: "bg-fuchsia-50 dark:bg-fuchsia-500/10 border-line",
    chipBg: "bg-fuchsia-50 dark:bg-fuchsia-500/15",
    chipText: "text-fuchsia-600 dark:text-fuchsia-400",
    valueText: "text-fuchsia-700 dark:text-fuchsia-400",
    chipSolid: "bg-fuchsia-600 border-fuchsia-600 text-white",
  },
  sky: {
    card: "bg-sky-50 dark:bg-sky-500/10 border-line",
    chipBg: "bg-sky-50 dark:bg-sky-500/15",
    chipText: "text-sky-600 dark:text-sky-400",
    valueText: "text-sky-700 dark:text-sky-400",
    chipSolid: "bg-sky-600 border-sky-600 text-white",
  },
  emerald: {
    card: "bg-emerald-50 dark:bg-emerald-500/10 border-line",
    chipBg: "bg-emerald-50 dark:bg-emerald-500/15",
    chipText: "text-emerald-600 dark:text-emerald-400",
    valueText: "text-emerald-700 dark:text-emerald-400",
    chipSolid: "bg-emerald-600 border-emerald-600 text-white",
  },
  red: {
    card: "bg-red-50 dark:bg-red-500/10 border-line",
    chipBg: "bg-red-50 dark:bg-red-500/15",
    chipText: "text-red-600 dark:text-red-400",
    valueText: "text-red-700 dark:text-red-400",
    chipSolid: "bg-red-600 border-red-600 text-white",
  },
  purple: {
    card: "bg-purple-50 dark:bg-purple-500/10 border-line",
    chipBg: "bg-purple-50 dark:bg-purple-500/15",
    chipText: "text-purple-600 dark:text-purple-400",
    valueText: "text-purple-700 dark:text-purple-400",
    chipSolid: "bg-purple-600 border-purple-600 text-white",
  },
  slate: {
    card: "bg-slate-50 dark:bg-slate-500/10 border-line",
    chipBg: "bg-slate-50 dark:bg-slate-500/15",
    chipText: "text-slate-600 dark:text-slate-300",
    valueText: "text-slate-700 dark:text-slate-300",
    chipSolid: "bg-slate-600 border-slate-600 text-white",
  },
};

// Ikon + warna cadangan untuk nama aksi yang tidak cocok aturan mana pun.
// Dipilih deterministik dari nama, supaya satu aksi selalu tampil sama.
const PALET_KUSTOM = [
  { Icon: FiSun, warna: "amber" },
  { Icon: FiScissors, warna: "teal" },
  { Icon: FiPackage, warna: "violet" },
  { Icon: FiFeather, warna: "rose" },
  { Icon: FiStar, warna: "cyan" },
  { Icon: FiZap, warna: "lime" },
  { Icon: FiTruck, warna: "indigo" },
  { Icon: FiGift, warna: "fuchsia" },
  { Icon: FiTarget, warna: "sky" },
  { Icon: FiLayers, warna: "emerald" },
];

const hashKata = (key) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h;
};

const paletKustom = (key) => PALET_KUSTOM[hashKata(key) % PALET_KUSTOM.length];

/** Ikon + nama warna untuk sebuah aksi. `konteks`: "tanaman" | "ternak" | "umum". */
export function ikonAksiUntuk(nama, konteks = "umum") {
  const key = String(nama || "").trim().toLowerCase();
  const aturan = KATALOG_IKON.find(
    (r) => (r.konteks === konteks || r.konteks === "umum") && r.cocok.test(key),
  );
  if (aturan) return { Icon: aturan.Icon, warna: aturan.warna };
  return paletKustom(key);
}

/**
 * Konfigurasi tampilan lengkap (ikon + kelas warna + label) untuk aksi apa pun
 * yang ditentukan otomatis dari namanya. Berguna untuk aksi kustom tanaman.
 */
export function konfigurasiAksiSemantis(nama, konteks = "umum") {
  const key = String(nama || "").trim().toLowerCase();
  if (!key) return null;
  const { Icon, warna } = ikonAksiUntuk(key, konteks);
  const label = key.replace(/^\w/, (c) => c.toUpperCase());
  return {
    key,
    label,
    ringkas: label.length > 10 ? `${label.slice(0, 9)}…` : label,
    Icon,
    ...(PALET_WARNA[warna] || PALET_WARNA.slate),
  };
}
