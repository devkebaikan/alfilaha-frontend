import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";

const DURASI = { success: 4000, info: 4000, warning: 6000, error: 6000 };
const MAKS_TAMPIL = 3;
const JENDELA_DUPLIKAT = 1500;

// Riwayat pesan untuk "pusat notifikasi" admin (persist di localStorage)
// v3: isinya HANYA peristiwa dari luar panel admin — data yang masuk dari
// website publik dan tugas yang selesai dikerjakan Santri. Aksi admin sendiri
// (kirim tugas, tambah/ubah/hapus data) tidak lagi dicatat supaya daftar
// notifikasi tidak menumpuk.
const KUNCI_ADMIN_PESAN = "alfilaha-admin-notif-v3";
const MAKS_ADMIN_PESAN = 30;
// Notifikasi yang sudah lewat 1 hari dibuang otomatis.
const MAKS_USIA_PESAN = 24 * 60 * 60 * 1000;
// Baseline jumlah data yang masuk dari website per sumber
const KUNCI_MASUK = "alfilaha-notif-masuk-v1";

const buangKedaluwarsa = (list) => {
  if (!Array.isArray(list)) return [];
  const batas = Date.now() - MAKS_USIA_PESAN;
  return list.filter((p) => {
    const waktu = p && p.waktu ? new Date(p.waktu).getTime() : 0;
    return !waktu || waktu >= batas;
  });
};

const GAYA = {
  success: { border: "border-green-500", ikonWadah: "bg-green-100 dark:bg-green-500/20", ikonWarna: "text-green-700 dark:text-green-300", label: "Berhasil" },
  error: { border: "border-red-500", ikonWadah: "bg-red-100 dark:bg-red-500/20", ikonWarna: "text-red-700 dark:text-red-300", label: "Gagal" },
  warning: { border: "border-amber-500", ikonWadah: "bg-amber-100 dark:bg-amber-500/20", ikonWarna: "text-amber-700 dark:text-amber-300", label: "Perhatian" },
  info: { border: "border-sky-500", ikonWadah: "bg-sky-100 dark:bg-sky-500/20", ikonWarna: "text-sky-700 dark:text-sky-300", label: "Info" },
};

const IKON = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

const NotifikasiContext = createContext(null);

const ToastItem = ({ toast, onTutup }) => {
  const { id, tipe, pesan } = toast;
  const Ikon = IKON[tipe];
  const gaya = GAYA[tipe];
  const timerRef = useRef(null);

  const mulaiTimer = useCallback(() => {
    timerRef.current = setTimeout(() => onTutup(id), DURASI[tipe]);
  }, [id, tipe, onTutup]);

  useEffect(() => {
    mulaiTimer();
    return () => clearTimeout(timerRef.current);
  }, [mulaiTimer]);

  // Jeda saat disentuh / di-hover / difokus, lanjut saat dilepas
  const pause = () => clearTimeout(timerRef.current);
  const resume = () => {
    clearTimeout(timerRef.current);
    mulaiTimer();
  };

  const keluar = tipe === "error" || tipe === "warning";
  const Akse = keluar ? "alert" : "status";

  return (
    <div
      role={Akse}
      aria-live={keluar ? "assertive" : "polite"}
      aria-atomic="true"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onTouchCancel={resume}
      className={`notif-toast pointer-events-auto flex items-start gap-3 bg-card rounded-2xl border-l-4 pl-4 pr-1.5 py-2.5 shadow-xl shadow-black/10 ring-1 ring-black/5 ${gaya.border}`}
    >
      <span
        className={`mt-0.5 w-8 h-8 rounded-full grid place-items-center flex-shrink-0 ${gaya.ikonWadah} ${gaya.ikonWarna}`}
      >
        <Ikon size={17} />
      </span>
      <p className="flex-1 min-w-0 text-sm font-semibold text-ink leading-snug py-1.5">
        {pesan}
      </p>
      <button
        type="button"
        onClick={() => onTutup(id)}
        aria-label="Tutup notifikasi"
        className="w-11 h-11 shrink-0 -my-1 grid place-items-center text-muted hover:text-ink rounded-xl hover:bg-surface2 transition"
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

export const NotifikasiProvider = ({ children }) => {
  const [daftar, setDaftar] = useState([]);
  const riwayat = useRef(new Map()); // "tipe::pesan" → timestamps
  const counter = useRef(0);

  // ── Pusat notifikasi admin ─────────────────────────────────────────
  // Berisi peristiwa dari luar panel admin saja: data yang masuk dari
  // website publik dan tugas yang selesai dikerjakan Santri.
  const [adminPesan, setAdminPesan] = useState(() => {
    try {
      const mentah = JSON.parse(localStorage.getItem(KUNCI_ADMIN_PESAN));
      return buangKedaluwarsa(mentah).slice(0, MAKS_ADMIN_PESAN);
    } catch {
      return [];
    }
  });
  // Cermin daftar saat ini supaya penggabungan notifikasi bisa dihitung
  // tanpa menunggu render berikutnya.
  const listRef = useRef(adminPesan);
  const seq = useRef(0);

  const simpanAdminPesan = useCallback((pembaru) => {
    setAdminPesan((prev) => {
      const kasar = typeof pembaru === "function" ? pembaru(prev) : pembaru;
      const next = buangKedaluwarsa(kasar).slice(0, MAKS_ADMIN_PESAN);
      listRef.current = next;
      try {
        localStorage.setItem(KUNCI_ADMIN_PESAN, JSON.stringify(next));
      } catch {
        // localStorage diblokir — abaikan
      }
      return next;
    });
  }, []);

  const bacaPesan = useCallback(
    (id) =>
      simpanAdminPesan((prevList) =>
        prevList.map((p) => (p.id === id ? { ...p, dibaca: true } : p)),
      ),
    [simpanAdminPesan],
  );

  const bacaSemua = useCallback(
    () =>
      simpanAdminPesan((prevList) =>
        prevList.map((p) => ({ ...p, dibaca: true })),
      ),
    [simpanAdminPesan],
  );

  const hapusPesan = useCallback(
    (id) =>
      simpanAdminPesan((prevList) => prevList.filter((p) => p.id !== id)),
    [simpanAdminPesan],
  );

  const hapusSemuaPesan = useCallback(
    () => simpanAdminPesan([]),
    [simpanAdminPesan],
  );

  const belumDibaca = adminPesan.filter((p) => !p.dibaca).length;

  const hapus = useCallback((id) => {
    setDaftar((d) => d.filter((x) => x.id !== id));
  }, []);

  // Toast ringan di pojok layar. Sengaja TIDAK masuk ke pusat notifikasi:
  // toast adalah umpan balik aksi admin sendiri, sedangkan lonceng hanya
  // untuk peristiwa dari luar panel admin.
  const tampilkan = useCallback((pesan, tipe = "success") => {
    if (!pesan) return;
    const kunci = `${tipe}::${pesan}`;
    const sekarang = Date.now();
    const terakhir = riwayat.current.get(kunci);
    if (terakhir && sekarang - terakhir < JENDELA_DUPLIKAT) return;

    // Rapikan riwayat yang sudah basi agar Map tidak membengkak
    if (riwayat.current.size > 80) {
      const batas = sekarang - JENDELA_DUPLIKAT;
      for (const [k, v] of riwayat.current) {
        if (v < batas) riwayat.current.delete(k);
      }
    }
    riwayat.current.set(kunci, sekarang);

    counter.current += 1;
    setDaftar((d) => [...d, { id: counter.current, pesan, tipe }]);
  }, []);

  // Rekam satu peristiwa dari luar panel admin ke pusat notifikasi.
  // Kalau sumber yang sama belum dibaca, jumlah pada entri itu ditambah
  // alih-alih membuat baris baru — inilah yang mencegah daftar menumpuk.
  const catatPesanMasuk = useCallback(
    ({ kunci, tab, nama, satuan, jumlah }) => {
      const waktu = new Date().toISOString();
      const prevList = listRef.current;
      const idx = prevList.findIndex((p) => p.kunci === kunci && !p.dibaca);
      const total = idx >= 0 ? (prevList[idx].jumlah || 1) + jumlah : jumlah;
      const entri = idx >= 0
        ? { ...prevList[idx], waktu, jumlah: total }
        : {
            id: `${Date.now()}-${++seq.current}`,
            waktu,
            tipe: "info",
            kunci,
            pesan: nama,
            tab,
            dibaca: false,
            jumlah,
          };
      const next = buangKedaluwarsa([
        entri,
        ...prevList.filter((_, i) => i !== idx),
      ]).slice(0, MAKS_ADMIN_PESAN);
      listRef.current = next;
      simpanAdminPesan(next);

      const pesan =
        jumlah === 1
          ? nama
          : `${jumlah} ${satuan || "data"} baru masuk.`;
      tampilkan(pesan, "info");
    },
    [simpanAdminPesan, tampilkan],
  );

  // Deteksi data yang baru masuk dari website (isi form publik) atau dari
  // Santri yang menyelesaikan tugas. Membandingkan jumlah total per sumber
  // dengan baseline tersimpan; bila bertambah, catat ke pusat notifikasi +
  // tampilkan toast. Baseline pertama kali dicatat tanpa notif agar tidak
  // membanjiri dengan data lama.
  const pantauPesanMasuk = useCallback(
    (opsi) => {
      const { key, total } = opsi;
      if (!key || typeof total !== "number") return;

      let peta = {};
      try {
        peta = JSON.parse(localStorage.getItem(KUNCI_MASUK)) || {};
      } catch {
        peta = {};
      }
      const prev = peta[key];
      if (total === prev) return;

      peta[key] = total;
      try {
        localStorage.setItem(KUNCI_MASUK, JSON.stringify(peta));
      } catch {
        // localStorage diblokir — abaikan
      }

      if (prev === undefined || total < prev) return;
      catatPesanMasuk({ ...opsi, kunci: key, jumlah: total - prev });
    },
    [catatPesanMasuk],
  );

  const api = useMemo(
    () => ({
      success: (p) => tampilkan(p, "success"),
      error: (p) => tampilkan(p, "error"),
      warning: (p) => tampilkan(p, "warning"),
      info: (p) => tampilkan(p, "info"),
      hapus,
      // pusat notifikasi admin
      adminPesan,
      belumDibaca,
      bacaPesan,
      bacaSemua,
      hapusPesan,
      hapusSemuaPesan,
      pantauPesanMasuk,
    }),
    [
      tampilkan,
      hapus,
      adminPesan,
      belumDibaca,
      bacaPesan,
      bacaSemua,
      hapusPesan,
      hapusSemuaPesan,
      pantauPesanMasuk,
    ],
  );

  return (
    <NotifikasiContext.Provider value={api}>
      {children}
      {/* Kontainer toast — tidak memblokir halaman (pointer-events-none) */}
      <div
        role="region"
        aria-label="Notifikasi aplikasi"
        className="fixed top-[calc(0.75rem+env(safe-area-inset-top))] inset-x-4 z-[1500] flex flex-col gap-2 pointer-events-none min-[640px]:left-auto min-[640px]:right-4 min-[640px]:w-[420px] min-[640px]:max-w-[calc(100vw-2rem)]"
      >
        {daftar.slice(0, MAKS_TAMPIL).map((t) => (
          <ToastItem key={t.id} toast={t} onTutup={hapus} />
        ))}
      </div>
    </NotifikasiContext.Provider>
  );
};

export const useNotifikasi = () => {
  const ctx = useContext(NotifikasiContext);
  if (!ctx)
    throw new Error("useNotifikasi harus dipakai di dalam <NotifikasiProvider>");
  return ctx;
};