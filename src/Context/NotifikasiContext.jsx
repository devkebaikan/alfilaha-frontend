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
// v2: dibersihkan agar aksi terima/tolak yang pernah terekam hilang.
const KUNCI_ADMIN_PESAN = "alfilaha-admin-notif-v2";
const MAKS_ADMIN_PESAN = 60;
// Baseline jumlah data yang masuk dari website per sumber (appointment/reservasi/pendaftar)
const KUNCI_MASUK = "alfilaha-notif-masuk-v1";

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
  // Tab admin yang sedang aktif → dipasang oleh AlfilahaAdmin via setAdminTab.
  // Setiap toast yang muncul saat tab admin aktif otomatis direkam sebagai
  // "pesan" agar admin bisa melihatnya lewat ikon lonceng & menuju ke halamannya.
  const [adminTab, setTabAktif] = useState(null);
  const adminTabRef = useRef(null);
  const [adminPesan, setAdminPesan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KUNCI_ADMIN_PESAN)) || [];
    } catch {
      return [];
    }
  });

  const simpanAdminPesan = useCallback((pembaru) => {
    setAdminPesan((prev) => {
      const next = typeof pembaru === "function" ? pembaru(prev) : pembaru;
      try {
        localStorage.setItem(KUNCI_ADMIN_PESAN, JSON.stringify(next));
      } catch {
        // localStorage diblokir — abaikan
      }
      return next;
    });
  }, []);

  const setAdminTab = useCallback((tab) => {
    adminTabRef.current = tab;
    setTabAktif(tab);
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

  const tampilkan = useCallback(
    (pesan, tipe = "success", opsi = {}) => {
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

      // Rekam ke pusat notifikasi admin bila sedang di dalam tab admin
      if (adminTabRef.current && opsi.simpan !== false) {
        simpanAdminPesan((prevList) =>
          [
            {
              id: Date.now(),
              waktu: new Date().toISOString(),
              tipe,
              pesan,
              tab: adminTabRef.current,
              dibaca: false,
            },
            ...prevList,
          ].slice(0, MAKS_ADMIN_PESAN),
        );
      }
    },
    [simpanAdminPesan],
  );

  // Deteksi data yang baru masuk dari website (isi form publik).
  // Membandingkan jumlah total per sumber dengan baseline tersimpan; bila
  // bertambah, catat ke pusat notifikasi + tampilkan toast. Baseline pertama
  // kali dicatat tanpa notif agar tidak membanjiri dengan data lama.
  const pantauPesanMasuk = useCallback(
    (opsi) => {
      const { key, tab, nama, total, satuan } = opsi;
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

      if (prev !== undefined && total > prev) {
        const jumlah = total - prev;
        const pesan =
          jumlah === 1
            ? nama
            : `${jumlah} ${satuan || "pesan baru"} baru dari website.`;
        simpanAdminPesan((prevList) =>
          [
            {
              id: Date.now(),
              waktu: new Date().toISOString(),
              tipe: "info",
              pesan,
              tab,
              dibaca: false,
            },
            ...prevList,
          ].slice(0, MAKS_ADMIN_PESAN),
        );
        tampilkan(pesan, "info", { simpan: false });
      }
    },
    [simpanAdminPesan, tampilkan],
  );

  const api = useMemo(
    () => ({
      // Opsi opsional: { simpan: false } → toast tampil, tapi tidak masuk
      // ke riwayat pusat notifikasi (ikon lonceng).
      success: (p, opsi) => tampilkan(p, "success", opsi),
      error: (p, opsi) => tampilkan(p, "error", opsi),
      warning: (p, opsi) => tampilkan(p, "warning", opsi),
      info: (p, opsi) => tampilkan(p, "info", opsi),
      hapus,
      // pusat notifikasi admin
      adminPesan,
      belumDibaca,
      setAdminTab,
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
      setAdminTab,
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