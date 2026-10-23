import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiMapPin,
  FiInfo,
  FiLogOut,
  FiUsers,
  FiCheckCircle,
  FiDownload,
  FiGrid,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import ModalBukti from "../../../Shared/ModalBukti/ModalBukti";
import { parseTernakInfo } from "../../../Shared/tugasInfo";
import { ikonAksiUntuk, PALET_WARNA } from "../../../Shared/ikonAksi";
import { kelompokkanRiwayat } from "../../../Shared/RiwayatTimeline/kelompokkanRiwayat";
import { GridAksiTernak } from "./KartuAksiTernak";

// Ikon & warna aksi dipilih otomatis dari nama aksi lewat registry bersama
// (src/Shared/ikonAksi.js), sehingga aksi kustom apa pun tetap mendapat ikon
// yang sesuai tanpa perlu memetakan manual di sini.
const warnaAksi = (nama) => ikonAksiUntuk(nama, "ternak").warna;

const kapital = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : "");

const waktuAksi = (a) => {
  if (a.sub_aksi) return kapital(String(a.sub_aksi).trim());
  const dariLabel = String(a.label || "").match(/\(([^)]+)\)/);
  if (dariLabel) return kapital(dariLabel[1].trim());
  const jam = String(a.jam_penanda || "").match(/(\d{1,2})[.:](\d{2})/);
  if (jam) {
    const h = Number(jam[1]);
    if (h < 11) return "Pagi";
    if (h < 15) return "Siang";
    if (h < 19) return "Sore";
    return "Malam";
  }
  return "";
};

const namaDasarAksi = (a) =>
  String(a.nama_aksi || a.label || "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+(pagi|siang|sore|malam)$/i, " ")
    .replace(/\s+/g, " ")
    .trim();

const batasHarian = (a) => (a.batas_harian == null ? null : Number(a.batas_harian));

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
const fotoUrl = (nama) => (nama ? `${API}/uploads/${nama}` : null);
const thumbUrl = (nama) => {
  if (!nama) return null;
  const m = nama.match(/(\.\w+)$/);
  return m
    ? `${API}/uploads/${nama.replace(m[1], `-thumb${m[1]}`)}`
    : fotoUrl(nama);
};

const TernakDetail = () => {
  // `jenis` menerima dua bentuk:
  //   - id livestock (mis. "65")  → entry spesifik
  //   - slug jenis legacy ("sapi") → entry pertama dari jenis tsb
  // URL di-encode karena nama jenis bisa mengandung spasi.
  const { jenis: param } = useParams();
  const jenis = param ? decodeURIComponent(param) : param;
  const navigate = useNavigate();

  const [ternak, setTernak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [filterRiwayat, setFilterRiwayat] = useState("Semua");

  const [isInternalLoggedIn, setIsInternalLoggedIn] = useState(
    !!localStorage.getItem("authToken"),
  );
  const [internalUserData, setInternalUserData] = useState(null);
  const [isSantriLoggedIn, setIsSantriLoggedIn] = useState(
    !!localStorage.getItem("santri_token"),
  );
  const [santriData, setSantriData] = useState(null);

  const [zoomFoto, setZoomFoto] = useState(null);

  // ── Mode tugas (dibuka via ?tugas=<id> dari Dashboard Santri) ──
  const [searchParams] = useSearchParams();
  const tugasId = searchParams.get("tugas");
  const [tugas, setTugas] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  // Panel tugas disembunyikan otomatis 4 detik setelah tugas selesai.
  const [panelTugasTersembunyi, setPanelTugasTersembunyi] = useState(false);

  useEffect(() => {
    if (!tugasId) {
      setTugas(null);
      return;
    }
    const token = localStorage.getItem("santri_token");
    if (!token) {
      setTugas(null);
      return;
    }
    let batal = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/tugas/${tugasId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!batal) setTugas(data);
      } catch (_) {
        // diamkan: mode tugas opsional, halaman publik tetap tampil
      }
    })();
    return () => {
      batal = true;
    };
  }, [tugasId]);

  const taskMode = Boolean(tugas);
  const tugasSelesai = taskDone || tugas?.status === "selesai";

  const handleTaskSuccess = async () => {
    setShowTaskModal(false);
    setTaskDone(true);
    setTugas((t) => (t ? { ...t, status: "selesai" } : t));
    await Promise.all([fetchTernak(), fetchHistory()]);
  };

  // Tugas yang sudah dikirim tidak bisa dikirim ulang. Pesan "terima kasih"
  // tampil sebentar lalu seluruh panel tugas hilang otomatis.
  useEffect(() => {
    if (!tugasSelesai) return;
    const timer = setTimeout(() => setPanelTugasTersembunyi(true), 4000);
    return () => clearTimeout(timer);
  }, [tugasSelesai]);

  useEffect(() => {
    const updateAuthState = () => {
      const internalToken = localStorage.getItem("authToken");
      const santriToken = localStorage.getItem("santri_token");
      setIsInternalLoggedIn(!!internalToken);
      setIsSantriLoggedIn(!!santriToken);
      try {
        const storedUser = localStorage.getItem("userData");
        setInternalUserData(storedUser ? JSON.parse(storedUser) : null);
      } catch (_) {
        setInternalUserData(null);
      }
      try {
        const storedSantri = localStorage.getItem("santri_data");
        setSantriData(storedSantri ? JSON.parse(storedSantri) : null);
      } catch (_) {
        setSantriData(null);
      }
    };
    updateAuthState();
    // Update saat login/logout lewat event, bukan polling 500ms.
    const onChange = () => updateAuthState();
    window.addEventListener("storage", onChange);
    window.addEventListener("auth-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("auth-change", onChange);
    };
  }, []);

  const isLoggedIn = isInternalLoggedIn || isSantriLoggedIn;
  const isSantriPending =
    isSantriLoggedIn && santriData?.status_pendaftaran === "Menunggu Verifikasi";
  const isSantriRejected =
    isSantriLoggedIn && santriData?.status_pendaftaran === "Ditolak";
  const canShowCareSection = isLoggedIn;
  const fetchTernak = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/ternak/${jenis}`,
      );
      if (!res.ok) throw new Error("Ternak tidak ditemukan");
      setTernak(await res.json());
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      // Preview saja (5 terbaru). Riwayat lengkap ada di halaman tersendiri.
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/ternak/${encodeURIComponent(jenis)}/riwayat?limit=5`,
      );
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.items || [];
        setHistory(
          arr.map((item) => ({
            ...item,
            waktu_tindakan: item.created_at || item.waktu_tindakan,
          })),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    setFilterRiwayat("Semua");
    fetchTernak();
    fetchHistory();
  }, [jenis]);

  const downloadQR = () => {
    if (!ternak) return;
    const canvas = document.getElementById(`qr-canvas-${ternak.id}`);
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      const nama = (ternak.judul || ternak.nama || "").replace(/\s+/g, "_");
      downloadLink.download = `QR_Ternak_${nama}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Tab filter diambil dari katalog aksi ternak (bukan dari riwayat preview
  // yang hanya 5 entri), dengan riwayat sebagai pelengkap.
  const filterOptions = useMemo(
    () => [
      "Semua",
      ...new Set(
        [
          ...(ternak?.aksi || []).map((a) => a.label),
          ...history.map((h) => h.label),
        ].filter(Boolean),
      ),
    ].slice(0, 8),
    [ternak, history],
  );

  // Kelompokkan log per sesi/tugas supaya jelas satu santri menyelesaikan
  // aksi apa saja dalam satu waktu. Filter + grouping di dalam useMemo dengan
  // dependency sederhana agar tidak dihitung ulang tiap render.
  const kelompokRiwayat = useMemo(() => {
    const filteredHistory = history.filter(
      (log) => filterRiwayat === "Semua" || log.label === filterRiwayat,
    );
    return kelompokkanRiwayat(filteredHistory, {
      kunciGrup: (l) =>
        `${l.aktivitas_id || "mandiri"}|${
          l.diinput_oleh || l.nama_perawat || "?"
        }`,
      catatan: (l) => l.catatan,
    });
  }, [history, filterRiwayat]);

  const displayedRiwayat = kelompokRiwayat.slice(0, 4);

  const jamWIB = (t) =>
    new Date(t)
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      .replace(".", ":");
  const tglIndo = (t) =>
    new Date(t).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Aksi dengan nama sama digabung jadi 1 tombol (mis. "Bersihkan Kandang" Pagi/Sore)
  const grupAksi = useMemo(() => {
    const map = new Map();
    (ternak?.aksi || []).forEach((a) => {
      const key = namaDasarAksi(a).toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ ...a, waktu: waktuAksi(a) });
    });
    return [...map.values()].map((items) => {
      const waktuList = [...new Set(items.map((i) => i.waktu).filter(Boolean))];
      return {
        key: namaDasarAksi(items[0]).toLowerCase(),
        nama: namaDasarAksi(items[0]),
        items,
        utama: items[0],
        perluPilihWaktu: waktuList.length > 1,
        waktuList,
        totalJumlah: items.reduce((s, i) => s + (Number(i.jumlah) || 0), 0),
        totalHariIni: items.reduce((s, i) => s + (Number(i.jumlah_hari_ini) || 0), 0),
        perluAngka: items.some((i) => i.butuh_input_angka),
        batas: (() => {
          const list = items.map(batasHarian);
          const seragam = list.every((b) => b === list[0]);
          return list[0] == null || !seragam ? null : list[0];
        })(),
      };
    });
  }, [ternak]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface2">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );
  if (error || !ternak)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface2">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink">
            Ternak tidak ditemukan
          </h2>
          <p className="text-muted">Jenis ternak tersebut tidak tersedia.</p>
        </div>
      </div>
    );

  const palette = warnaAksi(ternak.nama);

  // Aksi yang boleh dikerjakan: seluruhnya (mode normal) atau hanya yang
  // ditugaskan admin (mode tugas via ?tugas=).
  const infoTernakTugas = taskMode ? parseTernakInfo(tugas.ternak_info) : [];
  const assignedAksiIds = new Set(
    infoTernakTugas
      .filter((t) => !t.id || String(t.id) === String(ternak.id))
      .map((t) => Number(t.aksiId))
      .filter(Boolean),
  );
  const grupAksiTampil =
    taskMode && assignedAksiIds.size > 0
      ? grupAksi.filter((g) => g.items.some((it) => assignedAksiIds.has(Number(it.id))))
      : grupAksi;

  // Aksi yang butuh nominal (mis. "Konfirmasi Ayam Mati") → jadi kolom input di
  // modal tugas, lalu nilainya dicatat ke riwayat & total ternak ini.
  const aksiInputAngka = (() => {
    const kandidat = (ternak.aksi || []).filter((a) => a.butuh_input_angka);
    if (!kandidat.length) return null;
    const sesuaiTugas = kandidat.filter(
      (a) => !taskMode || assignedAksiIds.size === 0 || assignedAksiIds.has(Number(a.id)),
    );
    return sesuaiTugas[0] || null;
  })();

  const headerBg = {
    green: "from-green-800 to-green-950",
    slate: "from-slate-800 to-slate-950",
    amber: "from-amber-800 to-amber-950",
  }[palette] || "from-green-800 to-green-950";

  return (
    <div className="min-h-screen bg-surface2 pt-[100px] lg:pt-[140px] pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col mb-6 gap-4">
          <Link
            to="/peternakan"
            className="group inline-flex items-center gap-2.5 w-fit px-4 py-2 rounded-full bg-card border border-line text-sm font-bold text-ink shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-300 hover:text-green-600 hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400 transition-colors group-hover:bg-green-100 dark:group-hover:bg-green-500/25">
              <FiArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            </span>
            Kembali ke Koleksi Ternak
          </Link>

          {isLoggedIn && (internalUserData || santriData) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-surface2 to-card p-5 rounded-2xl shadow-sm border border-line flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-ink">
                    {isSantriLoggedIn ? "Halo" : "Selamat bertugas"}{" "}
                    <span className="text-green-700">
                      {isSantriLoggedIn
                        ? santriData.nama
                        : internalUserData.nama_lengkap}
                    </span>{" "}
                    👋
                  </h2>
                  <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-green-200">
                    {isSantriLoggedIn ? "Santri" : internalUserData.role}
                  </span>
                  {isSantriPending && (
                    <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200">
                      Menunggu Verifikasi
                    </span>
                  )}
                  {isSantriRejected && (
                    <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-red-200">
                      Ditolak
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-1">
                  {isSantriRejected
                    ? "Anda tetap dapat melihat koleksi ternak ini, namun tidak bisa mencatat perawatan karena pendaftaran ditolak."
                    : isSantriPending
                      ? "Anda masih menunggu verifikasi. Silakan pantau status pendaftaran Anda."
                      : "Silakan catat pemberian pakan, minum, kebersihan kandang, hingga panen hasil ternak."}
                </p>
              </div>

              <button
                onClick={() => {
                  if (isSantriLoggedIn) {
                    localStorage.removeItem("santri_token");
                    localStorage.removeItem("santri_data");
                    setIsSantriLoggedIn(false);
                    setSantriData(null);
                  } else {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userData");
                    setIsInternalLoggedIn(false);
                    setInternalUserData(null);
                  }
                  window.location.reload();
                }}
                className="mt-4 sm:mt-0 px-4 py-2 border border-line text-muted bg-card hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/40 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center shrink-0 group"
              >
                <FiLogOut className="mr-2 group-hover:-translate-x-0.5 transition-transform" />
                Logout
              </button>
            </motion.div>
          )}
        </div>

        <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-line flex flex-col md:flex-row">
          <div className="md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-line">
            <div className={`relative h-48 sm:h-56 bg-gradient-to-br ${headerBg}`}>
              {ternak.foto ? (
                <img loading="lazy" decoding="async"
                  src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${ternak.foto}`}
                  alt={ternak.judul || ternak.nama}
                  className="w-full h-full object-cover opacity-85"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-100">
                  <FiUsers size={72} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-2 shadow-sm capitalize">
                  {ternak.nama}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-[1.25] capitalize break-words">
                  {ternak.judul || ternak.nama}
                </h1>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1">
              <div className="flex items-center space-x-3 text-muted mb-6 bg-surface2 p-4 rounded-xl border border-line">
                <FiMapPin className="text-green-500 w-5 h-5 shrink-0" />
                <span className="font-medium text-sm sm:text-base">
                  Lokasi: {ternak.lokasi || "Belum ditentukan"}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center text-lg font-bold text-ink mb-3">
                  <FiInfo className="mr-2 text-green-500" /> Informasi &
                  Deskripsi
                </h3>
                {ternak.deskripsi ? (
                  <div
                    className="text-muted leading-relaxed text-sm sm:text-base prose prose-green prose-sm max-w-none bg-surface2 p-5 rounded-xl border border-line min-h-[120px]"
                    dangerouslySetInnerHTML={{ __html: ternak.deskripsi }}
                  />
                ) : (
                  <p className="text-muted leading-relaxed text-sm sm:text-base bg-surface2 p-5 rounded-xl border border-line min-h-[120px]">
                    Belum ada deskripsi untuk ternak ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-6 sm:p-8 bg-surface2 flex flex-col border-l border-line">
            {/* Panel mode tugas — hanya muncul saat dibuka dari Dashboard Santri */}
            <AnimatePresence>
            {canShowCareSection && taskMode && !panelTugasTersembunyi && (
              <motion.div
                className="mb-6 overflow-hidden"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <div className="rounded-2xl border-2 border-green-200 dark:border-green-500/40 bg-green-50/70 dark:bg-green-500/10 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                      <FiCheckCircle size={22} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-extrabold uppercase tracking-wide text-green-700 dark:text-green-300">
                        Tugas dari Admin
                      </p>
                      <h3 className="text-ink font-extrabold text-lg leading-snug">
                        {tugas?.nama_aktivitas || "Tugas Perawatan"}
                      </h3>
                      {tugas?.deskripsi && (
                        <p className="text-sm text-muted mt-0.5">{tugas.deskripsi}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {(grupAksiTampil.length ? grupAksiTampil : grupAksi).map((g) => (
                          <span
                            key={g.key}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-card dark:bg-white/10 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30 rounded-full px-2.5 py-1"
                          >
                            {g.nama}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {tugasSelesai ? (
                    <div className="mt-4 p-3 rounded-xl bg-green-100 dark:bg-green-500/15 border border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-300 text-sm font-semibold flex items-center gap-2">
                      <FiCheckCircle /> Tugas ini sudah diselesaikan. Terima kasih!
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTaskModal(true)}
                      className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold transition shadow-sm"
                    >
                      <FiCheckCircle size={18} /> Kerjakan Tugas
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard-santri")}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-line text-muted hover:bg-surface2 font-bold transition text-sm"
                  >
                    <FiArrowLeft size={16} /> Kembali ke Dashboard
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            <div className="bg-card rounded-xl border border-line shadow-sm overflow-hidden">
              <GridAksiTernak aksi={ternak.aksi || []} />
            </div>

            {/* QR Code Section - tampil di bawah */}
            <div className="flex-1 flex flex-col justify-center pt-6 min-h-0 w-full">
              <div className="w-full bg-card rounded-xl border border-line p-4 sm:p-5 shadow-sm flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <h3 className="flex items-center text-base font-bold text-ink">
                    <FiGrid className="mr-1.5 text-green-500" /> QR Code
                  </h3>
                  <button
                    onClick={downloadQR}
                    className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors shadow-md text-xs"
                  >
                    <FiDownload size={12} /> Download
                  </button>
                </div>
                <div className="bg-card p-3 rounded-xl shadow-sm border border-line">
                  <QRCodeCanvas
                    id={`qr-canvas-${ternak.id}`}
                    value={`${window.location.origin}/peternakan/${ternak.id}`}
                    size={210}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <p className="text-[11px] text-muted mt-2 text-center">
                  Scan QR untuk akses cepat
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-card rounded-3xl shadow-xl border border-line p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
            <h3 className="flex items-center text-2xl font-bold text-ink">
              <FiClock className="mr-3 text-green-500" /> Riwayat Perawatan
            </h3>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.length > 1 ? (
              filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterRiwayat(f)}
                  className={`px-4 py-2 text-sm rounded-full font-bold transition whitespace-nowrap ${filterRiwayat === f ? "bg-green-600 text-white shadow-md" : "bg-surface2 text-muted hover:bg-gray-200 dark:bg-gray-700"}`}
                >
                  {f}
                </button>
              ))
            ) : (
              <span className="text-sm text-muted">
                Belum ada aksi tercatat.
              </span>
            )}
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-3 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : displayedRiwayat.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-muted mb-4" size={48} />
              <p className="text-muted text-base">
                Belum ada riwayat perawatan untuk ternak ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedRiwayat.map((grup, index) => (
                <div key={grup.key} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400">
                      <FiCheckCircle size={18} />
                    </div>
                    {index !== displayedRiwayat.length - 1 && (
                      <div className="w-0.5 h-full bg-surface2 my-2 transition"></div>
                    )}
                  </div>
                  <div className="pb-4 flex-1 bg-surface2 border border-line rounded-xl p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-ink capitalize">
                          {grup.nama_aktivitas || "Perawatan"}
                        </p>
                        <p className="text-sm text-muted mt-0.5">
                          Oleh{" "}
                          <span className="font-medium text-ink">
                            {grup.perawat || "Santri"}
                          </span>{" "}
                          ({grup.role || "Santri"})
                        </p>
                      </div>
                      <span className="text-xs bg-card text-muted px-3 py-1 rounded-full font-medium shrink-0 border border-line">
                        {jamWIB(grup.waktu)} WIB
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {grup.entri.map((log) => {
                        const Ikon = ikonAksiUntuk(log.nama_aksi, "ternak").Icon;
                        const gaya = PALET_WARNA[warnaAksi(log.nama_aksi)] || PALET_WARNA.slate;
                        return (
                          <div key={log.id} className="flex items-center gap-2 text-sm">
                            <span className={`${gaya.chipText} shrink-0`}>
                              <Ikon size={16} />
                            </span>
                            <span className="text-ink font-medium">{log.label}</span>
                            {typeof log.nilai_angka === "number" && log.nilai_angka > 0 && (
                              <span className="inline-block text-xs bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300 font-bold px-2 py-0.5 rounded-md">
                                {log.nilai_angka} ekor
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {grup.catatan && (
                      <p className="text-sm text-muted mt-3 bg-card border border-line rounded-lg p-2 whitespace-pre-line">
                        {grup.catatan}
                      </p>
                    )}
                    {grup.foto && (
                      <button
                        type="button"
                        onClick={() => setZoomFoto(fotoUrl(grup.foto))}
                        className="mt-3 block max-w-[220px] group/foto"
                        aria-label="Perbesar foto perawatan"
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          src={thumbUrl(grup.foto)}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fotoUrl(grup.foto);
                          }}
                          alt={`Foto ${grup.nama_aktivitas || "perawatan"}`}
                          className="h-32 w-56 object-cover rounded-xl border border-line shadow-sm group-hover/foto:opacity-85 group-hover/foto:shadow-md transition"
                        />
                      </button>
                    )}
                    <p className="text-xs text-muted mt-2">
                      {tglIndo(grup.waktu)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to={`/peternakan/${encodeURIComponent(jenis)}/riwayat`}
            className="group w-full mt-6 flex items-center justify-center gap-2 text-PrimaryColor-0 font-bold py-4 px-6 border-2 border-green-200 dark:border-green-500/30 rounded-xl transition-all duration-300 shadow-sm hover:bg-PrimaryColor-0 hover:text-white hover:border-PrimaryColor-0 hover:shadow-md active:bg-PrimaryColor-0 active:text-white active:border-PrimaryColor-0 active:shadow-md"
          >
            <FiCheckCircle className="text-lg" />
            Lihat Riwayat Lengkap
          </Link>
        </div>
      </div>

      {/* Modal kirim bukti tugas (mode ?tugas=) */}
      <AnimatePresence>
        {showTaskModal && tugas && (
          <ModalBukti
            tugas={tugas}
            token={localStorage.getItem("santri_token")}
            ternakId={ternak.id}
            inputAngka={aksiInputAngka}
            onClose={() => setShowTaskModal(false)}
            onSuccess={handleTaskSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomFoto && (
          <div
            className="fixed inset-0 z-[1100] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setZoomFoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative max-w-4xl w-full bg-black rounded-3xl p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomFoto}
                alt="Foto perawatan"
                className="max-h-[80vh] w-full object-contain rounded-2xl"
              />
              <button
                type="button"
                onClick={() => setZoomFoto(null)}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-card text-ink text-xl font-bold flex items-center justify-center shadow-lg hover:bg-green-50 transition"
                aria-label="Tutup foto"
              >
                ×
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TernakDetail;