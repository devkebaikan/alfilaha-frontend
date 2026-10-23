import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  FiDroplet,
  FiCheckCircle,
  FiMapPin,
  FiInfo,
  FiClock,
  FiCalendar,
  FiArrowLeft,
  FiLogOut,
  FiDownload,
  FiGrid,
  FiImage,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
  KartuPerawatan,
  daftarAksi,
  konfigurasiAksi,
  normalisasiAksi,
} from "./statistikPerawatan";
import ModalBukti from "../../../Shared/ModalBukti/ModalBukti";
import { AKSI_LABEL, parseTanamanInfo } from "../../../Shared/tugasInfo";
import { kelompokkanRiwayat } from "../../../Shared/RiwayatTimeline/kelompokkanRiwayat";

// Info tampilan (ikon/warna/label) untuk aksi apa pun, termasuk aksi kustom.
const infoAksi = (aksi) =>
  konfigurasiAksi(aksi) || {
    key: String(aksi || "").toLowerCase(),
    label: "Perawatan",
    ringkas: "Perawatan",
    Icon: FiCheckCircle,
    chipBg: "bg-gray-100 dark:bg-gray-500/15",
    chipText: "text-gray-600 dark:text-gray-400",
    valueText: "text-gray-700",
    chipSolid: "bg-gray-600 border-gray-600 text-white",
  };

const AksiIcon = ({ aksi, size = 18 }) => {
  const Ikon = infoAksi(aksi).Icon;
  return <Ikon size={size} />;
};

const TanamanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tanaman, setTanaman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [filterRiwayat, setFilterRiwayat] = useState("Semua");
  const [aksiCatalog, setAksiCatalog] = useState([]);
  const [notification, setNotification] = useState({
    isOpen: false,
    jenis: "",
    timestamp: null,
  });

  // Cek login internal (petugas/petani)
  const [isInternalLoggedIn, setIsInternalLoggedIn] = useState(
    !!localStorage.getItem("authToken"),
  );
  const [internalUserData, setInternalUserData] = useState(null);

  // Cek login santri
  const [isSantriLoggedIn, setIsSantriLoggedIn] = useState(
    !!localStorage.getItem("santri_token"),
  );
  const [santriData, setSantriData] = useState(null);

  // Update login state when localStorage changes
  useEffect(() => {
    const updateAuthState = () => {
      const internalToken = localStorage.getItem("authToken");
      const santriToken = localStorage.getItem("santri_token");

      setIsInternalLoggedIn(!!internalToken);
      setIsSantriLoggedIn(!!santriToken);

      try {
        const storedUser = localStorage.getItem("userData");
        setInternalUserData(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {
        setInternalUserData(null);
      }

      try {
        const storedSantri = localStorage.getItem("santri_data");
        setSantriData(storedSantri ? JSON.parse(storedSantri) : null);
      } catch (e) {
        setSantriData(null);
      }
    };

    // Initial load
    updateAuthState();

    // Update saat login/logout: event "storage" (antar tab) dan "auth-change"
    // (tab yang sama). Tidak lagi polling tiap 500ms agar ringan.
    const onChange = () => updateAuthState();
    window.addEventListener("storage", onChange);
    window.addEventListener("auth-change", onChange);

    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("auth-change", onChange);
    };
  }, []);

  const isLoggedIn = isInternalLoggedIn || isSantriLoggedIn;

  // Cek apakah santri sudah diterima (untuk aksi perawatan)
  const isSantriPending =
    isSantriLoggedIn &&
    santriData?.status_pendaftaran === "Menunggu Verifikasi";
  const isSantriRejected =
    isSantriLoggedIn && santriData?.status_pendaftaran === "Ditolak";
  // Panel tugas hanya tampil bila pengguna login
  const canShowCareSection = isLoggedIn;

  const [selectedFoto, setSelectedFoto] = useState(null);

  // ── Mode tugas (dibuka via ?tugas=<id> dari Dashboard Santri) ──
  // Hanya aktif bila ada tiket tugas milik santri yang login; tanpa itu halaman
  // tampil sama seperti versi publik.
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
        const res = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tugas/${tugasId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
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
  const assignedAksi = taskMode
    ? [...new Set(
        parseTanamanInfo(tugas.tanaman_info)
          .filter((t) => !t.id || String(t.id) === String(id))
          .map((t) => t.aksi)
          .filter(Boolean),
      )]
    : [];
  const aksiTugas = assignedAksi.length ? assignedAksi : ["siram", "pupuk", "panen"];
  const tugasSelesai = taskDone || tugas?.status === "selesai";

  const handleTaskSuccess = async () => {
    setShowTaskModal(false);
    setTaskDone(true);
    setTugas((t) => (t ? { ...t, status: "selesai" } : t));
    await Promise.all([fetchHistory(), refreshStatistik()]);
  };

  // Tugas yang sudah dikirim tidak bisa dikirim ulang. Pesan "terima kasih"
  // tampil sebentar lalu seluruh panel tugas hilang otomatis.
  useEffect(() => {
    if (!tugasSelesai) return;
    const timer = setTimeout(() => setPanelTugasTersembunyi(true), 4000);
    return () => clearTimeout(timer);
  }, [tugasSelesai]);

  const fetchTanaman = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}`,
      );
      if (!res.ok) throw new Error("Tanaman tidak ditemukan");
      setTanaman(await res.json());
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Refresh ringan khusus angka perawatan (total_*/terakhir_*) tanpa menyentuh
  // state loading/error, dipakai setelah Santri mengirim laporan dan oleh
  // polling ringan — sehingga hitungan ikut naik tanpa refresh manual.
  const refreshStatistik = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setTanaman((prev) => (prev ? { ...prev, ...data } : data));
    } catch (err) {
      // diamkan: kegagalan polling tidak boleh mengganggu halaman
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      // Preview saja (5 terbaru). Riwayat lengkap ada di halaman tersendiri.
      // History bisa dilihat oleh siapa saja (publik), tidak perlu auth.
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}/riwayat?limit=5`,
      );
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.items || [];
        const mappedData = arr.map((item) => ({
          ...item,
          jenis_tindakan: item.tipe_aksi || item.jenis_tindakan,
          waktu_tindakan: item.created_at || item.waktu_tindakan,
        }));
        setHistory(mappedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Katalog aksi perawatan untuk tanaman ini (bisa kustom, dikelola di admin).
  const fetchAksi = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}/aksi`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setAksiCatalog(Array.isArray(data?.aksi) ? data.aksi : []);
    } catch (err) {
      // diamkan: kartu tetap tampil memakai aksi baku + riwayat
    }
  };

  useEffect(() => {
    fetchTanaman();
    fetchHistory();
    fetchAksi();
  }, [id]);

  // Angka perawatan ikut naik otomatis saat Santri mengirim laporan (mis. lewat
  // Dashboard Santri / PATCH /api/tugas/:id/selesai). Poll ringan hanya saat
  // tab sedang terlihat agar tidak membebani server.
  useEffect(() => {
    const POLL_MS = 60000;
    let timer = null;

    const mulaiPoll = () => {
      stopPoll();
      if (document.visibilityState === "visible") {
        timer = setInterval(refreshStatistik, POLL_MS);
      }
    };
    const stopPoll = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshStatistik();
      mulaiPoll();
    };

    mulaiPoll();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopPoll();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [id]);

  // Kelompokkan log per sesi/tugas supaya jelas satu santri mengerjakan
  // aksi apa saja dalam satu waktu (bukan baris terpisah-pisah). Filter dan
  // grouping dihitung di dalam useMemo dengan dependency sederhana agar tidak
  // dihitung ulang tiap render (penyebab halaman berat).
  const kelompokRiwayat = useMemo(() => {
    const filteredHistory = history.filter((log) => {
      if (filterRiwayat === "Semua") return true;
      return normalisasiAksi(log.jenis_tindakan) === filterRiwayat;
    });
    return kelompokkanRiwayat(filteredHistory);
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

  // Kartu & ringkasan memakai agregat dari API (/api/tanaman/:id) — bukan
  // menghitung dari riwayat preview yang kini hanya 5 entri.
  const riwayatPerawatan = undefined;

  // Daftar kartu & tab aksi: aksi baku + katalog tanaman + aksi yang ada di riwayat.
  const daftarKartu = daftarAksi(aksiCatalog, history);

  const downloadQR = () => {
    const canvas = document.getElementById(`qr-canvas-${tanaman.id}`);
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Tanaman_${tanaman.nama.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface2">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );
  if (error || !tanaman)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface2">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink">
            Tanaman tidak ditemukan
          </h2>
          <p className="text-muted">
            Mungkin QR Code sudah usang atau tanaman telah dihapus.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-surface2 pt-[100px] lg:pt-[140px] pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col mb-6 gap-4">
          <Link
            to="/koleksi-tanaman"
            className="group inline-flex items-center gap-2.5 w-fit px-4 py-2 rounded-full bg-card border border-line text-sm font-bold text-ink shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-300 hover:text-green-600 hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400 transition-colors group-hover:bg-green-100 dark:group-hover:bg-green-500/25">
              <FiArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            </span>
            Kembali ke Daftar Tanaman
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
                    ? "Anda tetap dapat melihat koleksi tanaman ini, namun tidak bisa mencatat perawatan karena pendaftaran ditolak."
                    : isSantriPending
                      ? "Anda masih menunggu verifikasi. Silakan pantau status pendaftaran Anda."
                      : "Silakan catat aktivitas penyiraman, pemupukan, atau panen untuk tanaman ini."}
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
                className="mt-4 sm:mt-0 px-4 py-2 border border-line text-muted bg-card hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center shrink-0 group"
              >
                <FiLogOut className="mr-2 group-hover:-translate-x-0.5 transition-transform" />
                Logout
              </button>
            </motion.div>
          )}
        </div>

        <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-line flex flex-col md:flex-row">
          <div className="md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-line">
            <div className="relative h-48 sm:h-56 bg-gradient-to-br from-green-800 to-green-900">
              {tanaman.gambar ? (
                <img loading="lazy" decoding="async"
                  src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${tanaman.gambar}`}
                  alt={tanaman.nama}
                  className="w-full h-full object-cover opacity-85"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-100">
                  Tanpa Gambar
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-2 shadow-sm">
                  {tanaman.jenis}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-[1.25] break-words">
                  {tanaman.nama}
                </h1>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1">
              <div className="flex items-center space-x-3 text-muted mb-6 bg-surface2 p-4 rounded-xl border border-line">
                <FiMapPin className="text-green-500 w-5 h-5 shrink-0" />
                <span className="font-medium text-sm sm:text-base">
                  Lokasi: {tanaman.lokasi}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center text-lg font-bold text-ink mb-3">
                  <FiInfo className="mr-2 text-green-500" /> Informasi &
                  Deskripsi
                </h3>
                {tanaman.deskripsi ? (
                  <div
                    className="text-muted leading-relaxed text-sm sm:text-base prose prose-green prose-sm max-w-none bg-surface2 p-5 rounded-xl border border-line min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: tanaman.deskripsi }}
                  />
                ) : (
                  <p className="text-muted leading-relaxed text-sm sm:text-base bg-surface2 p-5 rounded-xl border border-line min-h-[200px]">
                    Belum ada deskripsi untuk tanaman ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-6 sm:p-8 bg-surface2 flex flex-col border-l border-line">
            {/* Info Cards - samping kanan gambar */}
            <div className="grid grid-cols-2 gap-3">
              {tanaman.usia && String(tanaman.usia).trim() !== "" && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 sm:space-x-0 bg-card p-3 sm:p-4 rounded-xl border border-line shadow-sm h-full">
                  <div className="p-2 bg-green-50 dark:bg-green-500/15 rounded-lg shrink-0">
                    <FiCalendar className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs text-muted mb-1">
                      Usia Tanaman
                    </span>
                    <span className="block font-bold text-ink text-sm break-words">
                      {tanaman.usia}
                    </span>
                  </div>
                </div>
              )}
              {daftarKartu.map((item) => (
                <KartuPerawatan
                  key={item.key}
                  tanaman={tanaman}
                  item={item}
                  riwayat={riwayatPerawatan}
                />
              ))}
            </div>


            {/* Panel mode tugas — hanya muncul saat dibuka dari Dashboard Santri */}
            <AnimatePresence>
            {canShowCareSection && taskMode && !panelTugasTersembunyi && (
              <motion.div
                className="mt-12 mb-6 overflow-hidden"
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
                        {aksiTugas.map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-card dark:bg-white/10 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30 rounded-full px-2.5 py-1"
                          >
                            <FiDroplet size={11} /> {AKSI_LABEL[a] || a}
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
                  id={`qr-canvas-${tanaman.id}`}
                  value={`${window.location.origin}/tanaman/${tanaman.id}`}
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

      {/* Riwayat Section - Full Width at Bottom */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-card rounded-3xl shadow-xl border border-line p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
            <h3 className="flex items-center text-2xl font-bold text-ink">
              <FiClock className="mr-3 text-green-500" /> Riwayat Aktivitas
            </h3>
          </div>

          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { key: "Semua", label: "Semua" },
              ...daftarKartu.map((j) => ({ key: j.key, label: j.label })),
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterRiwayat(tab.key)}
                className={`px-4 py-2 text-sm rounded-full font-bold transition whitespace-nowrap ${filterRiwayat === tab.key ? "bg-green-600 text-white shadow-md" : "bg-surface2 text-muted hover:bg-gray-200 dark:bg-gray-700"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-3 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : displayedRiwayat.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-muted mb-4" size={48} />
              <p className="text-muted text-base">
                Belum ada riwayat perawatan untuk kategori ini.
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
                      {grup.entri.map((log) => (
                        <div key={log.id} className="flex items-center gap-2 text-sm">
                          <span
                            className={`${infoAksi(log.jenis_tindakan).chipText} shrink-0`}
                          >
                            <AksiIcon aksi={log.jenis_tindakan} size={16} />
                          </span>
                          <span className="text-ink font-medium">
                            {infoAksi(log.jenis_tindakan).label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {grup.laporan && (
                      <p className="text-sm text-muted mt-3 bg-card border border-line rounded-lg p-2 whitespace-pre-line">
                        {grup.laporan}
                      </p>
                    )}
                    {grup.foto && (
                      <button
                        type="button"
                        onClick={() => setSelectedFoto(grup.entri.find((e) => e.gambar) || grup.entri[0])}
                        className="mt-3 inline-flex items-center text-sm font-bold text-green-600 dark:text-green-400 hover:text-green-700 transition bg-card px-3 py-1.5 rounded-md border border-line"
                      >
                        <FiImage className="mr-2" /> Lihat Bukti Foto
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
            to={`/tanaman/${id}/riwayat`}
            className="group w-full mt-6 flex items-center justify-center gap-2 text-PrimaryColor-0 font-bold py-4 px-6 border-2 border-green-200 dark:border-green-500/30 rounded-xl transition-all duration-300 shadow-sm hover:bg-PrimaryColor-0 hover:text-white hover:border-PrimaryColor-0 hover:shadow-md active:bg-PrimaryColor-0 active:text-white active:border-PrimaryColor-0 active:shadow-md"
          >
            <FiGrid className="text-lg" />
            Lihat Riwayat Lengkap
          </Link>
        </div>
      </div>

      {selectedFoto && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm transition-all"
          onClick={() => setSelectedFoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedFoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-muted transition z-50 p-2"
              title="Tutup (Esc)"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <img loading="lazy" decoding="async"
              src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedFoto.gambar}`}
              alt="Perkembangan Membesar"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl ring-4 ring-white/10"
            />
            <div className="mt-5 text-center">
              <span className="bg-green-600/90 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-xl backdrop-blur-md">
                Diunggah pada:{" "}
                {new Date(
                  selectedFoto.waktu_upload || selectedFoto.waktu_tindakan,
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal kirim bukti tugas (mode ?tugas=) */}
      <AnimatePresence>
        {showTaskModal && tugas && (
          <ModalBukti
            tugas={tugas}
            token={localStorage.getItem("santri_token")}
            tanamanId={id}
            aksi={aksiTugas[0]}
            onClose={() => setShowTaskModal(false)}
            onSuccess={handleTaskSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification.isOpen && (
          <div className="fixed top-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
              className="bg-card rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-line flex items-center p-2 pr-5 pointer-events-auto max-w-sm w-full sm:w-auto"
            >
              {/* Kiri: Ikon Animasi */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-3 shadow-sm bg-green-50 text-green-500"
              >
                <motion.svg
                  className="w-5 h-5"
                  viewBox="0 0 50 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                    d="M14,26 L22,33.5 L35,16"
                  />
                </motion.svg>
              </motion.div>

              {/* Tengah: Teks */}
              <div className="flex flex-col justify-center py-1">
                <span className="text-sm font-bold text-ink leading-tight">
                  {notification.jenis === "siram"
                    ? "Berhasil Disiram!"
                    : notification.jenis === "panen"
                      ? "Berhasil Dipanen!"
                      : "Berhasil Dipupuk!"}
                </span>
                <span className="text-[11px] text-muted mt-0.5 font-medium">
                  {notification.jenis === "siram"
                    ? "Tanaman segar kembali"
                    : notification.jenis === "panen"
                      ? "Hasil panen telah dicatat"
                      : "Nutrisi bertambah"}{" "}
                  •{" "}
                  {notification.timestamp
                    ? `${notification.timestamp.getHours().toString().padStart(2, "0")}:${notification.timestamp.getMinutes().toString().padStart(2, "0")} WIB`
                    : ""}
                </span>
              </div>

              {/* Kanan: Tombol Silang */}
              <button
                onClick={() =>
                  setNotification({ isOpen: false, jenis: "", timestamp: null })
                }
                className="ml-auto pl-6 text-muted hover:text-muted transition-colors focus:outline-none"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TanamanDetail;
