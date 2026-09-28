import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifikasi } from "../../../Context/NotifikasiContext.jsx";
import {
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiList,
  FiLogOut,
  FiUser,
  FiCamera,
  FiX,
  FiAlertCircle,
  FiAward,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiSun,
  FiTrendingUp,
  FiBookOpen,
  FiGrid,
  FiUpload,
  FiFileText,
  FiRepeat,
  FiFeather,
} from "react-icons/fi";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

// Debug: log API URL saat module load
console.log("[DashboardSantri] API URL:", API);

// Label aksi perawatan (siram/pupuk/panen) untuk ditampilkan di kartu tugas
const AKSI_LABEL = {
  siram: "Siram",
  pupuk: "Pupuk",
  panen: "Panen",
};

// Tokenisasi "nama||aksi;;nama||aksi" menjadi [{ nama, aksi }]
const parseTanamanInfo = (raw) =>
  (Array.isArray(raw)
    ? raw
    : typeof raw === "string" && raw.trim()
      ? raw.split(";;")
      : []
  )
    .map((chunk) => {
      const [nama, aksi] = String(chunk).split("||");
      return { nama: (nama || "").trim(), aksi: (aksi || "").trim() };
    })
    .filter((t) => t.nama);

/* ─── KATEGORI WARNA ─────────────────────────────────────────────────────── */
const KATEGORI_COLOR = {
  Kepondokan: {
    bg: "bg-blue-100 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    ring: "ring-blue-200 dark:ring-blue-500/30",
  },
  Akademik: {
    bg: "bg-purple-100 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    ring: "ring-purple-200 dark:ring-purple-500/30",
  },
  Kebersihan: {
    bg: "bg-cyan-100 dark:bg-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    ring: "ring-cyan-200 dark:ring-cyan-500/30",
  },
  Pertanian: {
    bg: "bg-green-100 dark:bg-green-500/20",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500",
    ring: "ring-green-200 dark:ring-green-500/30",
  },
  Peternakan: {
    bg: "bg-teal-100 dark:bg-teal-500/20",
    text: "text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500",
    ring: "ring-teal-200 dark:ring-teal-500/30",
  },
  Ibadah: {
    bg: "bg-orange-100 dark:bg-orange-500/20",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    ring: "ring-orange-200 dark:ring-orange-500/30",
  },
  Olahraga: {
    bg: "bg-red-100 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
    ring: "ring-red-200 dark:ring-red-500/30",
  },
  Lainnya: {
    bg: "bg-surface2",
    text: "text-muted",
    dot: "bg-gray-400",
    ring: "ring-line",
  },
};
const kc = (k) => {
  // Use nama_kategori if available, fallback to kategori
  const categoryName = k?.nama_kategori || k?.kategori || "Lainnya";
  return KATEGORI_COLOR[categoryName] || KATEGORI_COLOR.Lainnya;
};

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmtTgl = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const fmtTglPendek = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const fmtHari = (d) =>
  new Date(d).toLocaleDateString("id-ID", { weekday: "long" });
const fmtWaktu = (d) =>
  new Date(d).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
const initials = (n) =>
  n
    ? n
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

/** Salam + emoji dinamis berdasarkan jam */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 4 && h < 11)
    return {
      teks: "Selamat pagi",
      emoji: "🌅",
      gradient: "from-amber-500 via-orange-400 to-yellow-400",
    };
  if (h >= 11 && h < 15)
    return {
      teks: "Selamat siang",
      emoji: "☀️",
      gradient: "from-emerald-600 via-green-500 to-teal-400",
    };
  if (h >= 15 && h < 18)
    return {
      teks: "Selamat sore",
      emoji: "🌇",
      gradient: "from-orange-600 via-amber-500 to-yellow-400",
    };
  return {
    teks: "Selamat malam",
    emoji: "🌙",
    gradient: "from-indigo-700 via-purple-600 to-blue-500",
  };
};

/** Format tanggal hari ini panjang */
const todayLong = () =>
  new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ══════════════════════════════════════════════════════
   MODAL KIRIM BUKTI — Camera langsung + Gallery + Preview
══════════════════════════════════════════════════════ */
const TIPE_FOTO_IZIN = ["image/jpeg", "image/png", "image/webp"];
const MAX_UKURAN_FOTO = 5 * 1024 * 1024; // 5 MB

// Terjemahkan error getUserMedia jadi pesan Bahasa Indonesia yang jelas
const mapKameraError = (e) => {
  const nama = e?.name || "unknown";
  if (nama === "NotAllowedError" || nama === "PermissionDeniedError")
    return {
      kode: nama,
      teknis: nama,
      pesan:
        "Izin kamera ditolak. Klik ikon gembok di kiri alamat → Izin → Kamera → Izinkan, lalu coba lagi.",
    };
  if (nama === "NotFoundError" || nama === "DevicesNotFoundError")
    return { kode: nama, teknis: nama, pesan: "Kamera tidak ditemukan pada perangkat ini." };
  if (nama === "NotReadableError" || nama === "TrackStartError")
    return {
      kode: nama,
      teknis: nama,
      pesan: "Kamera sedang dipakai aplikasi atau tab lain. Tutup aplikasi itu lalu coba lagi.",
    };
  if (nama === "OverconstrainedError")
    return {
      kode: nama,
      teknis: nama,
      pesan: "Kamera tidak mendukung mode yang diminta. Mencoba ulang dengan pengaturan dasar…",
    };
  if (nama === "SecurityError" || nama === "NotSupportedError")
    return {
      kode: nama,
      teknis: nama,
      pesan: "Kamera tidak dapat diakses: halaman ini harus dibuka melalui HTTPS atau localhost.",
    };
  return {
    kode: nama,
    teknis: nama,
    pesan: "Tidak dapat mengakses kamera. Gunakan tombol 'Coba lagi' atau pilih foto dari Galeri.",
  };
};

const ModalBukti = ({ tugas, token, onClose, onSuccess, onSending }) => {
  const notif = useNotifikasi();
  const [sukses, setSukses] = useState(false);
  const payloadRef = useRef(null);
  const [catatan, setCatatan] = useState("");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [modeKamera, setModeKamera] = useState(false);
  const [kameraError, setKameraError] = useState(null);
  const [punyaMultiKamera, setPunyaMultiKamera] = useState(false);
  const [facing, setFacing] = useState("environment");
  const [menungguKonfirmasi, setMenungguKonfirmasi] = useState(false);
  const galleryRef = useRef(null);
  const fallbackRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [kameraStream, setKameraStream] = useState(null);
  const colors = kc(tugas);

  // Daftar tanaman + aksi dari field "nama||aksi;;nama||aksi" (tugas pertanian/perkebunan)
  const daftarTanaman = (Array.isArray(tugas.tanaman_info)
    ? tugas.tanaman_info
    : typeof tugas.tanaman_info === "string" && tugas.tanaman_info.trim()
      ? tugas.tanaman_info.split(";;")
      : []
  )
    .map((chunk) => {
      const [nama, aksi] = String(chunk).split("||");
      return { nama: (nama || "").trim(), aksi: (aksi || "").trim() };
    })
    .filter((t) => t.nama);

  // Hentikan semua track kamera (saat: Batal, pindah Galeri, foto diambil, modal ditutup, unmount)
  const hentikanKamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch (_) { /* track mungkin sudah berhenti */ }
      });
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setKameraStream(null);
  };

  // Stop kamera saat komponen dilepas
  useEffect(() => {
    return () => hentikanKamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bersihkan object URL pratinjau saat diganti / modal ditutup
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Pasang stream ke <video> setelah elemen ter-mount, lalu play (await dengan try/catch)
  useEffect(() => {
    const v = videoRef.current;
    if (!kameraStream || !v) return;
    v.srcObject = kameraStream;
    v.play().catch(() => { /* autoplay mungkin diblokir; preview diam di frame */ });
  }, [kameraStream]);

  // Nyalakan kamera langsung di dalam modal (getUserMedia → video element)
  const mulaiKamera = async (fCtx) => {
    setKameraError(null);
    // Konteks tidak aman (bukan HTTPS/localhost): mediaDevices tidak tersedia
    if (!navigator.mediaDevices?.getUserMedia) {
      setKameraError({
        kode: "SecurityError",
        teknis: "SecurityError",
        pesan:
          "Kamera tidak dapat diakses: halaman ini harus dibuka melalui HTTPS atau localhost.",
      });
      return;
    }
    // Hentikan stream lama sebelum membuat yang baru (hindari stream ganda, termasuk StrictMode)
    hentikanKamera();

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: fCtx || "environment" },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });
    } catch (e) {
      if (
        e.name === "OverconstrainedError" ||
        e.name === "NotFoundError" ||
        e.name === "DevicesNotFoundError"
      ) {
        console.error("getUserMedia pertama gagal:", e.name, e.message);
        // Coba ulang dengan pengaturan dasar — tanpa facingMode / resolusi khusus
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (e2) {
          console.error("getUserMedia (retry dasar) gagal:", e2.name, e2.message);
          setKameraError(mapKameraError(e2));
          return;
        }
      } else {
        console.error("getUserMedia gagal:", e.name, e.message);
        setKameraError(mapKameraError(e));
        return;
      }
    }

    streamRef.current = stream;
    setKameraStream(stream);

    // Deteksi jumlah kamera → baru tampilkan tombol "Balik kamera"
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setPunyaMultiKamera(
        devices.filter((d) => d.kind === "videoinput").length > 1,
      );
    } catch (err) {
      setPunyaMultiKamera(false);
    }
  };

  const bukaKamera = () => {
    setErr("");
    setModeKamera(true);
    mulaiKamera(facing);
  };

  // Minta izin kamera ulang (tombol "Coba lagi" di panel error)
  const cobaKameraLagi = () => mulaiKamera(facing);

  // Pantau izin kamera: saat berubah menjadi "granted", nyalakan kamera otomatis
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    let hidup = true;
    navigator.permissions
      .query({ name: "camera" })
      .then((status) => {
        if (!hidup) return;
        const mulai = () => {
          if (hidup && modeKamera && kameraError) mulaiKamera(facing);
        };
        status.addEventListener("change", mulai);
      })
      .catch(() => { /* query izin tidak didukung browser */ });
    return () => {
      hidup = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeKamera, kameraError, facing]);

  const balikKamera = () => {
    const baru = facing === "environment" ? "user" : "environment";
    setFacing(baru);
    hentikanKamera();
    mulaiKamera(baru);
  };

  const batalKamera = () => {
    hentikanKamera();
    setModeKamera(false);
    setKameraError(null);
  };

  // Tangkap frame dari video → resize (sisi terpanjang maks 1280 px) → JPEG 0.8
  const ambilFotoLangsung = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setErr("Kamera belum siap. Tunggu sebentar atau coba lagi.");
      return;
    }
    const MAX = 1280;
    let w = video.videoWidth || 640;
    let h = video.videoHeight || 480;
    const skala = Math.max(w, h) > MAX ? MAX / Math.max(w, h) : 1;
    const cw = Math.max(1, Math.round(w * skala));
    const ch = Math.max(1, Math.round(h * skala));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    canvas.getContext("2d").drawImage(video, 0, 0, cw, ch);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErr("Gagal mengambil gambar dari kamera.");
          return;
        }
        const file = new File([blob], `bukti-kamera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        // Foto sudah diambil → matikan lampu/stream kamera
        hentikanKamera();
        setModeKamera(false);
        setKameraError(null);
        setErr("");
        if (preview) URL.revokeObjectURL(preview);
        setFoto(file);
        setPreview(URL.createObjectURL(file));
        setMenungguKonfirmasi(true);
      },
      "image/jpeg",
      0.8,
    );
  };

  // Buang foto terpilih (revoke URL) — dipakai saat ulangi / ganti / hapus
  const buangFotoKeadaan = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFoto(null);
    setMenungguKonfirmasi(false);
  };

  const ulangiJepret = () => {
    buangFotoKeadaan();
    setModeKamera(true);
    mulaiKamera(facing);
  };

  const gunakanJepret = () => setMenungguKonfirmasi(false);

  const gantiFoto = () => {
    hentikanKamera();
    buangFotoKeadaan();
    setErr("");
  };

  const hapusFoto = () => {
    hentikanKamera();
    buangFotoKeadaan();
    setErr("");
  };

  const bukaGaleri = () => {
    hentikanKamera(); // berhenti saat pindah ke Galeri
    setModeKamera(false);
    setKameraError(null);
    setErr("");
    galleryRef.current?.click();
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!TIPE_FOTO_IZIN.includes(f.type)) {
      notif.warning("Foto harus berformat JPG, PNG, atau WebP.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_UKURAN_FOTO) {
      notif.warning("Ukuran foto maksimal 5 MB.");
      e.target.value = "";
      return;
    }
    setErr("");
    if (modeKamera) hentikanKamera();
    setModeKamera(false);
    setKameraError(null);
    if (preview) URL.revokeObjectURL(preview);
    setFoto(f);
    setPreview(URL.createObjectURL(f));
    setMenungguKonfirmasi(false);
    // Reset input agar bisa pilih file yang sama lagi jika mau ganti
    e.target.value = "";
  };

  const tutupModal = () => {
    hentikanKamera();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFoto(null);
    onClose();
  };

  // Akhiri tampilan sukses → tutup modal & serahkan ke parent (optimistic update + sorot kartu)
  const tuntaskanSukses = () => {
    hentikanKamera();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFoto(null);
    onSuccess(payloadRef.current || {});
  };

  // Tampilan sukses ditutup otomatis sekitar 3 detik
  useEffect(() => {
    if (!sukses) return;
    const t = setTimeout(() => tuntaskanSukses(), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sukses]);

  const submit = async (e) => {
    e.preventDefault();

    if (loading || sukses) return;

    if (!catatan.trim()) {
      setErr("Laporan singkat wajib diisi.");
      return;
    }

    setLoading(true);
    setErr("");
    onSending?.(true);

    const doSubmit = async (method) => {
      const fd = new FormData();
      if (catatan.trim()) fd.append("catatan", catatan.trim());
      if (foto) fd.append("foto_bukti", foto);

      return fetch(`${API}/api/tugas/${tugas.id}/selesai`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
    };

    try {
      let res;
      try {
        // Coba PATCH dulu
        res = await doSubmit("PATCH");
      } catch (patchErr) {
        // PATCH gagal (CORS/network), fallback ke PUT
        console.warn("PATCH gagal, fallback ke PUT:", patchErr.message);
        res = await doSubmit("PUT");
      }

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok)
        throw new Error(
          data.message || data.error || `Server error ${res.status}`,
        );
      // Simpan data respons untuk optimistic update di parent (setelah modal sukses ditutup)
      payloadRef.current = { ...data, catatan: catatan.trim() || null };
      setSukses(true);
    } catch (e) {
      console.error("Submit error:", e.name, e.message);

      // Coba ping untuk diagnosa
      let serverJalan = false;
      try {
        const ping = await fetch(`${API}/api/test`, {
          signal: AbortSignal.timeout(2000),
        });
        serverJalan = ping.ok;
      } catch (_) {}

      if (!serverJalan) {
        notif.error(
          "Gagal mengirim laporan. Periksa koneksi internet lalu coba lagi.",
        );
      } else {
        notif.error(
          e.message || "Gagal mengirim laporan. Periksa koneksi lalu coba lagi.",
        );
      }
    } finally {
      setLoading(false);
      onSending?.(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col"
      >
        {/* Accent bar atas */}
        <div className={`h-1.5 w-full flex-shrink-0 ${colors.dot}`} />

        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="p-5 sm:p-6">
            {sukses ? (
              /* ── Tampilan Sukses — laporan terkirim ── */
              <div className="text-center py-6 sm:py-10">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-green-600 text-white grid place-items-center animate-[notif-pop_.5s_ease-out] motion-reduce:animate-none">
                    <FiCheckCircle size={30} />
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-ink mt-5">
                  Laporan terkirim!
                </h3>
                <p className="text-sm text-muted mt-1.5 font-semibold">
                  {tugas.nama_aktivitas} —{" "}
                  {tugas.nama_kategori || tugas.kategori}
                </p>
                <p className="text-sm text-muted mt-3">
                  Terima kasih, laporanmu sudah diterima.
                </p>
                <button
                  type="button"
                  onClick={tuntaskanSukses}
                  className="mt-6 w-full min-h-[44px] bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition shadow-md shadow-green-200 flex items-center justify-center gap-2"
                >
                  <FiCheckCircle size={18} /> Tutup
                </button>
              </div>
            ) : (
              <>
            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}
                >
                  <FiFileText size={20} className={colors.text} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-ink leading-snug">
                    Kirim Bukti Tugas
                  </h3>
                  <p className="text-sm text-muted mt-0.5">
                    {tugas.nama_aktivitas}
                  </p>
                  <p className={`text-sm font-semibold mt-0.5 ${colors.text}`}>
                    {tugas.nama_kategori || tugas.kategori}
                  </p>
                  {tugas.nama_lokasi && (
                    <p className="text-xs text-muted mt-0.5">
                      📍 {tugas.nama_lokasi}
                    </p>
                  )}
                  {daftarTanaman.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {daftarTanaman.map((t, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30"
                        >
                          <FiFeather size={11} />
                          {t.nama}
                          {t.aksi && (
                            <>
                              <span className="text-green-300">•</span>
                              {t.aksi}
                            </>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={tutupModal}
                aria-label="Tutup"
                className="p-2 rounded-xl bg-surface2 hover:bg-gray-200 dark:bg-gray-700 text-muted transition flex-shrink-0"
              >
                <FiX size={17} />
              </button>
            </div>

            {/* ── Error ── */}
            {err && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-medium">
                <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* ── Foto Bukti ── */}
              <div>
                <p className="text-sm font-bold text-ink mb-2.5">
                  Foto Bukti{" "}
                  <span className="font-normal text-muted text-xs">
                    (opsional)
                  </span>
                </p>

                {preview ? (
                  /* Pratinjau foto — tombol Ulangi/Gunakan saat jepret, atau Ganti/Hapus setelah dipakai */
                  <div className="relative rounded-2xl overflow-hidden border-2 border-green-300 dark:border-green-500/40 shadow-sm">
                    <img loading="lazy" decoding="async"
                      src={preview}
                      alt="Preview bukti"
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      <FiCheckCircle size={11} /> Foto dipilih — {foto?.name}
                    </div>
                    {menungguKonfirmasi ? (
                      /* Hasil jepret kamera: putuskan pakai / ulangi */
                      <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <button
                          type="button"
                          onClick={ulangiJepret}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-card text-ink font-bold text-sm rounded-xl transition hover:bg-surface2"
                        >
                          <FiRepeat size={15} /> Ulangi
                        </button>
                        <button
                          type="button"
                          onClick={gunakanJepret}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition"
                        >
                          <FiCheckCircle size={15} /> Gunakan foto
                        </button>
                      </div>
                    ) : (
                      /* Foto final: ganti / hapus */
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={gantiFoto}
                          className="min-h-[44px] px-3 bg-white/90 hover:bg-card text-ink rounded-xl shadow-md transition text-xs font-bold flex items-center gap-1"
                        >
                          <FiUpload size={13} /> Ganti foto
                        </button>
                        <button
                          type="button"
                          onClick={hapusFoto}
                          className="min-h-[44px] px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition flex items-center gap-1 text-xs font-bold"
                        >
                          <FiX size={13} /> Hapus foto
                        </button>
                      </div>
                    )}
                  </div>
                ) : modeKamera ? (
                  /* ── Kamera langsung (getUserMedia) di dalam modal ── */
                  <div className="rounded-2xl overflow-hidden border-2 border-line bg-black">
                    {kameraError ? (
                      <div className="p-5 text-center">
                        <FiCamera size={30} className="text-gray-500 mx-auto mb-3" />
                        <p className="text-sm font-bold text-white">
                          {kameraError.pesan}
                        </p>
                        {kameraError.teknis && (
                          <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                            {kameraError.teknis}
                          </p>
                        )}
                        {kameraError.kode === "NotAllowedError" && (
                          <p className="text-xs text-gray-400 mt-1">
                            Aktifkan izin kamera lalu coba lagi, atau gunakan
                            pemilih berkas di bawah.
                          </p>
                        )}
                        <div className="flex flex-col gap-2 mt-4">
                          <button
                            type="button"
                            onClick={cobaKameraLagi}
                            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-sm"
                          >
                            <FiRepeat size={16} /> Coba lagi
                          </button>
                          {/* Cadangan: input file dengan capture — hanya sebagai fallback error kamera */}
                          <button
                            type="button"
                            onClick={() => fallbackRef.current?.click()}
                            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-card text-ink font-bold rounded-xl transition text-sm"
                          >
                            <FiUpload size={16} /> Buka Pemilih Berkas (cadangan)
                          </button>
                          <button
                            type="button"
                            onClick={batalKamera}
                            className="w-full min-h-[44px] flex items-center justify-center gap-2 text-gray-400 hover:text-white font-bold rounded-xl transition text-sm"
                          >
                            Kembali
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 object-cover bg-black"
                        />
                        <div className="flex items-center justify-center gap-4 p-3 bg-black/80">
                          {punyaMultiKamera && (
                            <button
                              type="button"
                              onClick={balikKamera}
                              className="min-h-[44px] px-3 flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-bold rounded-xl transition"
                            >
                              <FiRepeat size={16} /> Balik kamera
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={ambilFotoLangsung}
                            className="w-16 h-16 rounded-full bg-card hover:bg-surface2 text-green-600 dark:text-green-300 shadow-lg transition flex items-center justify-center active:scale-95"
                            aria-label="Ambil foto"
                          >
                            <FiCamera size={26} />
                          </button>
                          <button
                            type="button"
                            onClick={batalKamera}
                            className="min-h-[44px] px-3 flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-bold rounded-xl transition"
                          >
                            <FiX size={16} /> Batal
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Dua pilihan: Kamera langsung / Galeri */
                  <div className="grid grid-cols-2 gap-3">
                    {/* Ambil Foto Langsung (getUserMedia) */}
                    <button
                      type="button"
                      onClick={bukaKamera}
                      className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-dashed border-line hover:border-green-400 rounded-2xl bg-surface2 hover:bg-green-50 dark:hover:bg-green-500/15 transition group active:scale-95"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-card shadow flex items-center justify-center group-hover:shadow-md transition">
                        <FiCamera size={26} className="text-green-600 dark:text-green-300" />
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-sm text-ink group-hover:text-green-700 dark:group-hover:text-green-300">
                          Ambil Foto
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          Buka kamera
                        </p>
                      </div>
                    </button>

                    {/* Dari Galeri */}
                    <button
                      type="button"
                      onClick={bukaGaleri}
                      className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-dashed border-line hover:border-blue-400 rounded-2xl bg-surface2 hover:bg-blue-50 dark:hover:bg-blue-500/15 transition group active:scale-95"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-card shadow flex items-center justify-center group-hover:shadow-md transition">
                        <FiUpload size={26} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-sm text-ink group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          Dari Galeri
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          Pilih file
                        </p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Input Galeri — accept="image/*" tanpa capture */}
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                {/* Input cadangan kamera — hanya muncul saat kamera error (fallback) */}
                <input
                  ref={fallbackRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {/* ── Laporan singkat ── */}
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">
                  Laporan Singkat <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan singkat bagaimana kamu menyelesaikan tugas ini..."
                  className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none text-base transition"
                />
              </div>

              {/* ── Actions ── (sticky: tombol utama selalu terlihat) */}
              <div className="sticky bottom-0 flex gap-3 pt-3 pb-2 px-5 sm:px-6 -mx-5 sm:-mx-6 bg-card border-t border-line">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 min-h-[44px] bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-green-200"
                >
                  {loading ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <FiCheckCircle size={18} />
                  )}
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </button>
                <button
                  type="button"
                  onClick={tutupModal}
                  className="px-5 min-h-[44px] py-3.5 border-2 border-line rounded-xl font-bold text-muted hover:bg-surface2 active:bg-surface2 transition"
                >
                  Batal
                </button>
              </div>
            </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MONITORING REKAN TUGAS
══════════════════════════════════════════════════════ */
const MonitoringRekan = ({ tugas, token, onClose }) => {
  const [rekanList, setRekanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchRekan = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API}/api/tugas/${tugas.id}/rekan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRekanList(Array.isArray(data) ? data : []);
        } else {
          setErr("Gagal memuat data rekan.");
        }
      } catch (e) {
        setErr("Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };
    fetchRekan();
  }, [tugas.id, token]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface2">
          <div>
            <h3 className="text-lg font-extrabold text-ink">
              Status Rekan Satu Tugas
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {tugas.nama_aktivitas}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:bg-gray-700 text-muted transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : err ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
              <FiAlertCircle size={16} />
              <span>{err}</span>
            </div>
          ) : rekanList.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <FiUser size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Tidak ada rekan dalam tugas ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rekanList.map((rekan) => (
                <div
                  key={rekan.id}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 bg-surface2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                      rekan.status === "selesai"
                        ? "bg-green-600 text-white"
                        : rekan.status === "pending"
                          ? "bg-amber-500 text-white"
                          : "bg-gray-400 text-white"
                    }`}
                  >
                    {initials(rekan.nama_santri)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm">
                      {rekan.nama_santri}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          rekan.status === "selesai"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                            : rekan.status === "pending"
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : "bg-surface2 text-muted"
                        }`}
                      >
                        {rekan.status}
                      </span>
                      {rekan.diselesaikan_at && (
                        <span className="text-xs text-muted">
                          {new Date(rekan.diselesaikan_at).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {rekan.status === "selesai" && (
                    <FiCheckCircle
                      size={20}
                      className="text-green-600 dark:text-green-300 flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   KARTU TUGAS HARI INI
══════════════════════════════════════════════════════ */
const KartuTugas = ({
  tugas,
  onSelesai,
  onMonitoring,
  menyelesaikanId,
  tugasTersorot,
}) => {
  const done = tugas.status === "selesai";
  const skipped = tugas.status === "dilewati";
  const colors = kc(tugas.kategori);
  const tersorot = tugas.id === tugasTersorot;

  // Cek apakah tugas ini hari ini atau mendatang
  const todayISO = new Date().toISOString().split("T")[0];
  const tugasDate = tugas.tanggal_tugas
    ? tugas.tanggal_tugas.split("T")[0]
    : "";
  const isToday = tugasDate === todayISO;
  const isFuture = tugasDate > todayISO;

  // Tanaman + aksi dari field "nama||aksi;;nama||aksi" (tugas pertanian/perkebunan)
  const daftarTanaman = parseTanamanInfo(tugas.tanaman_info);

  // Ternak + aksi dari field "nama||namaAksi (sub)" (tugas peternakan)
  const daftarTernak = parseTanamanInfo(tugas.ternak_info);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl overflow-hidden transition-all ${
        tersorot
          ? "ring-2 ring-green-400 shadow-lg shadow-green-100"
          : ""
      } ${
        done
          ? "border border-green-200 dark:border-green-500/30 bg-green-50/60 dark:bg-green-500/10 shadow-sm"
          : skipped
            ? "border border-line bg-surface2 opacity-60"
            : "border-0 bg-card shadow-md hover:shadow-lg"
      }`}
    >
      {/* Accent bar atas */}
      {!done && !skipped && <div className={`h-1 w-full ${colors.dot}`} />}

      <div className="p-4 sm:p-5">
        {/* Baris kartu: kiri (ikon + teks) & kanan (tombol aksi) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Ikon kategori */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              done ? "bg-green-100 dark:bg-green-500/20" : colors.bg
            }`}
          >
            {done ? (
              <FiCheckCircle size={22} className="text-green-600 dark:text-green-300" />
            ) : (
              <FiClock size={20} className={colors.text} />
            )}
          </div>

          {/* Info utama */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colors.bg} ${colors.text}`}
              >
                {tugas.nama_kategori || tugas.kategori}
              </span>
              {tugas.nama_lokasi && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">
                  📍 {tugas.nama_lokasi}
                </span>
              )}
              {done ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 flex items-center gap-1">
                  <FiCheckCircle size={9} /> Selesai
                </span>
              ) : !skipped && isToday ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 animate-pulse">
                  Tenggat Hari Ini
                </span>
              ) : !skipped && isFuture ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                  Tugas Mendatang
                </span>
              ) : null}
            </div>

            {/* Judul */}
            <h3
              className={`font-extrabold text-base leading-snug ${
                done ? "text-green-800 dark:text-green-300" : "text-ink"
              }`}
            >
              {tugas.nama_aktivitas}
            </h3>

            {/* Tanaman + aksi (tugas pertanian/perkebunan) */}
            {daftarTanaman.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {daftarTanaman.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-full px-3 py-1"
                  >
                    <FiCheckCircle size={12} />
                    {t.nama}
                    {t.aksi && (
                      <span className="text-muted font-semibold">
                        · {AKSI_LABEL[t.aksi] || t.aksi}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Ternak + aksi (tugas peternakan) */}
            {daftarTernak.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {daftarTernak.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-full px-3 py-1"
                  >
                    <FiCheckCircle size={12} />
                    {t.nama}
                    {t.aksi && (
                      <span className="text-muted font-semibold">
                        · {t.aksi}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Deskripsi */}
            {tugas.deskripsi && (
              <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">
                {tugas.deskripsi}
              </p>
            )}

            {/* Tanggal & waktu selesai */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <span className="text-xs text-muted flex items-center gap-1 font-medium">
                <FiCalendar size={11} />
                {fmtTgl(tugas.tanggal_tugas)}
              </span>
              {done && tugas.diselesaikan_at && (
                <span className="text-xs text-green-600 dark:text-green-300 font-bold flex items-center gap-1">
                  <FiCheckCircle size={11} /> Pukul{" "}
                  {fmtWaktu(tugas.diselesaikan_at)} WIB
                </span>
              )}
            </div>

            {/* Link foto bukti */}
            {done && tugas.foto_bukti && (
              <a
                href={`${API}/uploads/${tugas.foto_bukti}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline"
              >
                <FiImage size={12} /> Lihat Foto Bukti
              </a>
            )}

            {/* Catatan */}
            {done && tugas.catatan && (
              <div className="mt-2.5 px-3 py-2 bg-green-100/60 dark:bg-green-500/20 rounded-xl border border-green-200 dark:border-green-500/30">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium italic">
                  "{tugas.catatan}"
                </p>
              </div>
            )}

            {/* Tombol monitoring rekan */}
            {onMonitoring && (
              <button
                onClick={() => onMonitoring(tugas)}
                className="mt-2 sm:mt-0 text-xs text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <FiUser size={12} /> Lihat status rekan
              </button>
            )}
          </div>
        </div>

        {/* Aksi (kanan): tombol selesaikan / status selesai */}
        {!done && !skipped ? (
          <button
            onClick={() => onSelesai(tugas)}
            disabled={menyelesaikanId === tugas.id}
            className="shrink-0 w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-sm rounded-xl transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {menyelesaikanId === tugas.id ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : null}
            {menyelesaikanId === tugas.id
              ? "Mengirim..."
              : isToday
                ? "Selesaikan Tugas"
                : "Selesaikan Awal"}
          </button>
        ) : done ? (
          <div className="shrink-0 self-start sm:self-center inline-flex items-center gap-2 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-3.5 py-2 rounded-xl text-sm font-bold">
            <FiCheckCircle size={15} /> Selesai
          </div>
        ) : null}
        </div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   RIWAYAT GROUP (per aktivitas, collapsible)
══════════════════════════════════════════════════════ */
const RiwayatGroup = ({ group }) => {
  const [open, setOpen] = useState(false);
  const colors = kc(group.kategori);
  const selesai = group.items.filter((t) => t.status === "selesai").length;
  const total = group.items.length;
  const persen = total ? Math.round((selesai / total) * 100) : 0;

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface2 transition text-left"
      >
        {/* Avatar inisial aktivitas */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}
        >
          <span className={`text-sm font-extrabold ${colors.text}`}>
            {group.nama?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink text-sm truncate">
            {group.nama}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
            >
              {group.kategori}
            </span>
            <span className="text-[11px] text-muted font-medium">
              {selesai}/{total} selesai
            </span>
          </div>
        </div>
        {/* Mini progress */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-14 bg-surface2 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${persen}%` }}
            />
          </div>
          {open ? (
            <FiChevronUp size={14} className="text-muted" />
          ) : (
            <FiChevronDown size={14} className="text-muted" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {group.items.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    t.status === "selesai"
                      ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/30"
                      : t.status === "dilewati"
                        ? "bg-surface2 border-line opacity-60"
                        : "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/30"
                  }`}
                >
                  {/* Status icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      t.status === "selesai"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300"
                        : t.status === "dilewati"
                          ? "bg-surface2 text-muted"
                          : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300"
                    }`}
                  >
                    {t.status === "selesai" ? (
                      <FiCheckCircle size={14} />
                    ) : t.status === "dilewati" ? (
                      <FiX size={14} />
                    ) : (
                      <FiClock size={14} />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-ink">
                        {fmtTglPendek(t.tanggal_tugas)} ·{" "}
                        {fmtHari(t.tanggal_tugas)}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          t.status === "selesai"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                            : t.status === "dilewati"
                              ? "bg-surface2 text-muted"
                              : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    {t.diselesaikan_at && (
                      <p className="text-[11px] text-green-600 dark:text-green-300 font-semibold mt-0.5">
                        ✓ Selesai pukul {fmtWaktu(t.diselesaikan_at)} WIB
                      </p>
                    )}
                    {t.catatan && (
                      <p className="text-[11px] text-muted italic mt-0.5 line-clamp-1">
                        "{t.catatan}"
                      </p>
                    )}
                    {t.foto_bukti && (
                      <a
                        href={`${API}/uploads/${t.foto_bukti}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-600 dark:text-blue-300 font-bold hover:underline"
                      >
                        <FiImage size={10} /> Foto Bukti
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   KOMPONEN UTAMA — DashboardSantri
══════════════════════════════════════════════════════ */
const DashboardSantri = () => {
  const navigate = useNavigate();

  /* ── Auth ── */
  const token = localStorage.getItem("santri_token");
  let userData = null;
  try {
    const s = localStorage.getItem("santri_data");
    if (s) userData = JSON.parse(s);
  } catch (_) {}

  useEffect(() => {
    if (!token) navigate("/login-santri", { replace: true });
  }, [token, navigate]);

  // Santri yang belum Diterima (Menunggu Verifikasi / Ditolak) tidak boleh masuk dashboard
  useEffect(() => {
    if (token && userData && userData.status_pendaftaran !== "Diterima") {
      navigate("/status-pendaftaran", { replace: true });
    }
  }, [token, userData, navigate]);

  /* ── State ── */
  const [tugasHariIni, setTugasHariIni] = useState([]);
  const [semuaTugas, setSemuaTugas] = useState([]);
  const [loadingHI, setLoadingHI] = useState(true);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);
  const [modalTugas, setModalTugas] = useState(null);
  const [menyelesaikanId, setMenyelesaikanId] = useState(null);
  const [monitoringTugas, setMonitoringTugas] = useState(null);
  const [tugasTersorot, setTugasTersorot] = useState(null);
  const [riwayatOpen, setRiwayatOpen] = useState(false);
  const [filterRiwayat, setFilterRiwayat] = useState("semua");

  // Kunci scroll halaman selama modal terbuka
  useEffect(() => {
    const terkunci = !!(modalTugas || monitoringTugas);
    document.body.style.overflow = terkunci ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalTugas, monitoringTugas]);

  const notif = useNotifikasi();

  /* ── Fetch data ── */
  const fetchHariIni = useCallback(async () => {
    if (!token) return;
    setLoadingHI(true);
    try {
      const res = await fetch(`${API}/api/tugas/hari-ini`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTugasHariIni(await res.json());
      else if (res.status === 401) {
        notif.error("Sesi berakhir. Silakan masuk kembali.");
        navigate("/login-santri");
      }
    } catch (err) {
      console.error(err);
      notif.error("Gagal memuat tugas. Periksa koneksi internetmu.");
    } finally {
      setLoadingHI(false);
    }
  }, [token, notif]);

  const fetchRiwayat = useCallback(async () => {
    if (!token) return;
    setLoadingRiwayat(true);
    try {
      const res = await fetch(`${API}/api/tugas/saya`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSemuaTugas(await res.json());
    } catch (err) {
      console.error(err);
      notif.error("Gagal memuat tugas. Periksa koneksi internetmu.");
    } finally {
      setLoadingRiwayat(false);
    }
  }, [token, notif]);

  useEffect(() => {
    fetchHariIni();
    fetchRiwayat();
  }, [fetchHariIni, fetchRiwayat]);

  const handleSelesaiSuccess = (data) => {
    // Simpan id sebelum modal ditutup
    const tugasId = modalTugas?.id;
    setModalTugas(null);
    notif.success("Tugas berhasil diselesaikan! Tetap semangat.");

    // Optimistic update — langsung tandai selesai di state tanpa tunggu re-fetch
    if (tugasId) {
      const nowISO = new Date().toISOString();
      const updater = (list) =>
        list.map((t) =>
          t.id === tugasId
            ? {
                ...t,
                status: "selesai",
                diselesaikan_at: nowISO,
                foto_bukti: data?.foto_bukti ?? t.foto_bukti ?? null,
                catatan: data?.catatan ?? t.catatan ?? null,
              }
            : t,
        );
      setTugasHariIni(updater);
      setSemuaTugas(updater);
      // Sorotan halus sesaat pada kartu yang baru selesai
      setTugasTersorot(tugasId);
      setTimeout(() => setTugasTersorot(null), 2400);
    }

    // Sinkronisasi dengan server (untuk dapat data lengkap dari DB)
    fetchHariIni();
    fetchRiwayat();
  };

  const handleLogout = () => {
    localStorage.removeItem("santri_token");
    localStorage.removeItem("santri_data");
    navigate("/");
  };

  /* ── Statistik ── */
  const stats = {
    total: semuaTugas.length,
    selesai: semuaTugas.filter((t) => t.status === "selesai").length,
    pending: semuaTugas.filter((t) => t.status === "pending").length,
    persen: semuaTugas.length
      ? Math.round(
          (semuaTugas.filter((t) => t.status === "selesai").length /
            semuaTugas.length) *
            100,
        )
      : 0,
  };
  // Tugas aktif = belum selesai (baru muncul, setelah selesai pindah ke riwayat)
  const tugasAktif = tugasHariIni.filter((t) => t.status === "pending");
  const tugasPending = tugasAktif.length;
  const tugasSelesaiHariIni = tugasHariIni.filter(
    (t) => t.status === "selesai",
  ).length;

  /* ── Filter & group riwayat ── */
  const riwayatFiltered = semuaTugas.filter((t) =>
    filterRiwayat === "semua" ? true : t.status === filterRiwayat,
  );
  const riwayatByAktivitas = {};
  riwayatFiltered.forEach((t) => {
    const key = t.nama_aktivitas;
    if (!riwayatByAktivitas[key])
      riwayatByAktivitas[key] = {
        nama: t.nama_aktivitas,
        kategori: t.kategori,
        items: [],
      };
    riwayatByAktivitas[key].items.push(t);
  });
  const riwayatGroups = Object.values(riwayatByAktivitas);

  /* ── Greeting ── */
  const { teks: salamTeks, emoji: salamEmoji, gradient } = getGreeting();
  const namaDepan =
    userData?.username || userData?.nama?.split(" ")[0] || "Santri";

  if (!token) return null;

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-surface2 overflow-x-hidden">
      {/* ── Modal Bukti ── */}
      <AnimatePresence>
        {modalTugas && (
          <ModalBukti
            tugas={modalTugas}
            token={token}
            onClose={() => setModalTugas(null)}
            onSending={(sending) =>
              setMenyelesaikanId(sending ? modalTugas.id : null)
            }
            onSuccess={handleSelesaiSuccess}
          />
        )}
      </AnimatePresence>

      {/* ── Modal Monitoring Rekan ── */}
      <AnimatePresence>
        {monitoringTugas && (
          <MonitoringRekan
            tugas={monitoringTugas}
            token={token}
            onClose={() => setMonitoringTugas(null)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          KONTEN UTAMA
      ══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {/* ── HERO BANNER GREETING ── */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} shadow-lg mb-6`}
        >
          {/* Dekorasi lingkaran */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-4 right-28 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative px-5 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Tanggal */}
              <p className="text-white/80 text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-2">
                <FiCalendar size={13} />
                {todayLong()}
              </p>

              {/* Salam utama */}
              <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
                {salamTeks}, {namaDepan}! {salamEmoji}
              </h1>

              {/* Sub-info */}
              <p className="text-white/80 text-sm mt-1.5 font-medium">
                {loadingHI
                  ? "Sedang memuat tugas..."
                  : tugasPending > 0
                    ? `Ada ${tugasPending} tugas yang menunggu diselesaikan hari ini.`
                    : tugasHariIni.length > 0
                      ? "Luar biasa! Semua tugas hari ini sudah selesai. 🌟"
                      : "Tidak ada tugas untuk hari ini. Selamat beristirahat!"}
              </p>

              {/* Progress bar hari ini */}
              {tugasHariIni.length > 0 && (
                <div className="mt-4 flex items-center gap-3 max-w-xs">
                  <div className="flex-1 bg-white/25 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-card h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          tugasHariIni.length
                            ? Math.round(
                                (tugasSelesaiHariIni / tugasHariIni.length) *
                                  100,
                              )
                            : 0
                        }%`,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-white font-extrabold text-sm flex-shrink-0">
                    {tugasSelesaiHariIni}/{tugasHariIni.length}
                  </span>
                </div>
              )}
            </div>

            {/* Avatar + info user (desktop) */}
            <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg backdrop-blur-sm">
                {initials(userData?.username || userData?.nama)}
              </div>
              <p className="text-white font-bold text-sm text-center max-w-[120px] truncate">
                {userData?.username || userData?.nama || "Santri"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    fetchHariIni();
                    fetchRiwayat();
                    notif.info("Data diperbarui");
                  }}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                  title="Refresh"
                >
                  <FiRefreshCw size={14} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-white/20 hover:bg-red-500/40 text-white transition"
                  title="Keluar"
                >
                  <FiLogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Header mobile (hanya tampil di HP) ── */}
        <div className="sm:hidden flex items-center justify-between mb-5 bg-card rounded-2xl p-3 shadow-sm border border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
              {initials(userData?.username || userData?.nama)}
            </div>
            <div>
              <p className="font-extrabold text-ink text-sm leading-tight truncate max-w-[140px]">
                {userData?.username || userData?.nama || "Santri"}
              </p>
              <p className="text-[10px] text-muted">Dashboard Santri</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                fetchHariIni();
                fetchRiwayat();
                notif.info("Data diperbarui");
              }}
              className="p-2 rounded-xl bg-surface2 text-muted hover:bg-gray-200 dark:bg-gray-700 transition"
            >
              <FiRefreshCw size={14} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold text-xs rounded-xl transition"
            >
              <FiLogOut size={13} /> Keluar
            </button>
          </div>
        </div>

        {/* ── STAT CARDS — 2 kolom di HP, 4 kolom di desktop ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Tugas",
              val: stats.total,
              icon: <FiList size={18} />,
              ic: "bg-surface2 text-muted",
              val_color: "text-ink",
            },
            {
              label: "Selesai",
              val: stats.selesai,
              icon: <FiCheckCircle size={18} />,
              ic: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300",
              val_color: "text-green-700 dark:text-green-300",
            },
            {
              label: "Belum Selesai",
              val: stats.pending,
              icon: <FiClock size={18} />,
              ic: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
              val_color: "text-amber-700 dark:text-amber-300",
            },
            {
              label: "Skor Kinerja",
              val: `${stats.persen}%`,
              icon: <FiAward size={18} />,
              ic: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300",
              val_color:
                stats.persen >= 80
                  ? "text-green-600 dark:text-green-300"
                  : stats.persen >= 50
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-red-500 dark:text-red-400",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 sm:p-5 border border-line shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.ic}`}
              >
                {s.icon}
              </div>
              <p
                className={`text-2xl sm:text-3xl font-extrabold ${s.val_color}`}
              >
                {s.val}
              </p>
              <p className="text-xs text-muted font-semibold mt-1 leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── PROGRESS BAR KESELURUHAN ── */}
        {stats.total > 0 && (
          <div className="bg-card rounded-2xl p-4 sm:p-5 border border-line shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                <FiTrendingUp size={14} className="text-green-600 dark:text-green-300" />
                Progres Keseluruhan
              </p>
              <span
                className={`text-sm font-extrabold ${
                  stats.persen >= 80
                    ? "text-green-600 dark:text-green-300"
                    : stats.persen >= 50
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-red-500 dark:text-red-400"
                }`}
              >
                {stats.persen}%
              </span>
            </div>
            <div className="w-full bg-surface2 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-2.5 rounded-full ${
                  stats.persen >= 80
                    ? "bg-green-500"
                    : stats.persen >= 50
                      ? "bg-amber-400"
                      : "bg-red-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${stats.persen}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted mt-1.5 font-medium">
              {stats.selesai} dari {stats.total} tugas telah diselesaikan
            </p>
          </div>
        )}

        {/* ── TUGAS HARI INI ── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-ink flex items-center gap-2">
              <div className="w-7 h-7 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center text-green-600 dark:text-green-300">
                <FiCalendar size={15} />
              </div>
              Tugas Saya
              {tugasPending > 0 && (
                <span className="bg-red-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  {tugasPending}
                </span>
              )}
            </h2>
          </div>

          {loadingHI ? (
            <div className="flex justify-center items-center h-36">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : tugasAktif.length === 0 ? (
            <div className="bg-card rounded-2xl p-10 text-center border border-dashed border-line shadow-sm">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiSun size={28} className="text-green-400" />
              </div>
              <h3 className="font-bold text-muted text-base mb-1">
                Tidak ada tugas aktif
              </h3>
              <p className="text-muted text-sm">
                Nikmati harimu atau cek kembali besok.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tugasAktif.map((t) => (
                <KartuTugas
                  key={t.id}
                  tugas={t}
                  onSelesai={setModalTugas}
                  onMonitoring={setMonitoringTugas}
                  menyelesaikanId={menyelesaikanId}
                  tugasTersorot={tugasTersorot}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── RIWAYAT TUGAS (collapsible, grouped by aktivitas) ── */}
        <section className="mb-6">
          <button
            onClick={() => setRiwayatOpen((p) => !p)}
            className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-line shadow-sm hover:border-green-200 dark:hover:border-green-500/40 transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                <FiBookOpen size={15} />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-ink">
                Riwayat Tugas
              </h2>
              <span className="text-xs text-muted font-semibold bg-surface2 px-2 py-0.5 rounded-full">
                {semuaTugas.length}
              </span>
            </div>
            {riwayatOpen ? (
              <FiChevronUp size={18} className="text-muted" />
            ) : (
              <FiChevronDown size={18} className="text-muted" />
            )}
          </button>

          <AnimatePresence>
            {riwayatOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-b-2xl border border-t-0 border-line shadow-sm">
                  {/* Filter tabs */}
                  <div className="px-4 pt-4 pb-3 flex gap-2 flex-wrap border-b border-line">
                    {["semua", "pending", "selesai", "dilewati"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilterRiwayat(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                          filterRiwayat === f
                            ? "bg-green-600 text-white"
                            : "bg-surface2 text-muted hover:bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        {f}{" "}
                        {f !== "semua" &&
                          `(${semuaTugas.filter((t) => t.status === f).length})`}
                      </button>
                    ))}
                  </div>

                  {loadingRiwayat ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                    </div>
                  ) : riwayatGroups.length === 0 ? (
                    <p className="text-center text-muted py-10 text-sm font-medium">
                      Tidak ada riwayat dengan filter ini.
                    </p>
                  ) : (
                    <div className="divide-y divide-line">
                      {riwayatGroups.map((grp, gi) => (
                        <RiwayatGroup key={gi} group={grp} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── AKSES CEPAT ── */}
        <section>
          <h2 className="text-sm sm:text-base font-extrabold text-ink mb-3 flex items-center gap-2">
            <FiGrid size={15} className="text-muted" /> Akses Cepat
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                to: "/koleksi-tanaman",
                emoji: "🌱",
                bg: "bg-green-100 dark:bg-green-500/20 hover:bg-green-200 dark:hover:bg-green-500/25",
                label: "Koleksi Tanaman",
                sub: "Perawatan tanaman",
              },
              {
                to: "/status-pendaftaran",
                icon: <FiUser size={20} className="text-blue-600 dark:text-blue-300" />,
                bg: "bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/25",
                label: "Profil Saya",
                sub: "Status pendaftaran",
              },
              {
                to: "/event",
                icon: <FiCalendar size={20} className="text-purple-600 dark:text-purple-300" />,
                bg: "bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/25",
                label: "Kegiatan",
                sub: "Info event pondok",
              },
              {
                to: "/blog_grid",
                icon: <FiBookOpen size={20} className="text-orange-600 dark:text-orange-300" />,
                bg: "bg-orange-100 dark:bg-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/25",
                label: "Blog",
                sub: "Artikel & wawasan",
              },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-2xl border border-line shadow-sm hover:border-line hover:shadow-md transition group"
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 transition text-lg`}
                >
                  {item.emoji ? item.emoji : item.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink text-xs sm:text-sm truncate">
                    {item.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted truncate">
                    {item.sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted mt-10">
          © 2026 Pondok Pesantren Al-Filaha · Dashboard Santri
        </p>
      </div>
    </div>
  );
};

export default DashboardSantri;
