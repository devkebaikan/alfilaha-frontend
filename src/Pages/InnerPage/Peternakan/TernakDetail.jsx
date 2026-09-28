import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiMapPin,
  FiInfo,
  FiLogOut,
  FiUsers,
  FiCoffee,
  FiDroplet,
  FiTrash2,
  FiShoppingBag,
  FiCheckCircle,
  FiAlertTriangle,
  FiHeart,
  FiPlusCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ikonAksi = (nama) => {
  const n = (nama || "").toLowerCase();
  if (n.includes("pakan")) return <FiCoffee size={22} />;
  if (n.includes("minum") || n.includes("air")) return <FiDroplet size={22} />;
  if (n.includes("bersihkan") || n.includes("kandang"))
    return <FiTrash2 size={22} />;
  if (n.includes("telur")) return <FiShoppingBag size={22} />;
  if (n.includes("susu")) return <FiHeart size={22} />;
  if (n.includes("mati")) return <FiAlertTriangle size={22} />;
  return <FiPlusCircle size={22} />;
};

const warnaAksi = (nama) => {
  const n = (nama || "").toLowerCase();
  if (n.includes("pakan")) return "green";
  if (n.includes("minum") || n.includes("air")) return "blue";
  if (n.includes("bersihkan")) return "orange";
  if (n.includes("telur") || n.includes("panen")) return "amber";
  if (n.includes("susu")) return "purple";
  if (n.includes("mati")) return "red";
  return "teal";
};

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
  const { jenis } = useParams();
  const navigate = useNavigate();

  const [ternak, setTernak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [filterRiwayat, setFilterRiwayat] = useState("Semua");

  const [isInternalLoggedIn, setIsInternalLoggedIn] = useState(
    !!localStorage.getItem("authToken"),
  );
  const [internalUserData, setInternalUserData] = useState(null);
  const [isSantriLoggedIn, setIsSantriLoggedIn] = useState(
    !!localStorage.getItem("santri_token"),
  );
  const [santriData, setSantriData] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [pilihWaktu, setPilihWaktu] = useState(null);
  const [nilaiAngka, setNilaiAngka] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [zoomFoto, setZoomFoto] = useState(null);

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
    const interval = setInterval(updateAuthState, 500);
    return () => clearInterval(interval);
  }, []);

  const isLoggedIn = isInternalLoggedIn || isSantriLoggedIn;
  const isSantriPending =
    isSantriLoggedIn && santriData?.status_pendaftaran === "Menunggu Verifikasi";
  const isSantriRejected =
    isSantriLoggedIn && santriData?.status_pendaftaran === "Ditolak";
  const canShowCareSection = isLoggedIn;
  const isCareDisabled = isSantriPending || isSantriRejected;
  const careLockTitle = isSantriRejected
    ? "Pendaftaran Ditolak"
    : "Menunggu Verifikasi";
  const careLockMsg = isSantriRejected
    ? "Akses perawatan dinonaktifkan karena pendaftaran Anda ditolak. Anda tetap dapat melihat koleksi ternak, namun tidak bisa mencatat perawatan."
    : "Anda masih dalam status Menunggu Verifikasi. Silakan tunggu konfirmasi dari admin untuk melakukan tindakan perawatan.";

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
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/ternak/${jenis}/riwayat`,
      );
      if (res.ok) {
        const data = await res.json();
        setHistory(
          data.map((item) => ({
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
    setShowAllHistory(false);
    setFilterRiwayat("Semua");
    fetchTernak();
    fetchHistory();
  }, [jenis]);

  const handlePerawatan = async () => {
    if (!confirmAction) return;

    let token;
    if (isSantriLoggedIn && santriData?.status_pendaftaran === "Diterima") {
      token = localStorage.getItem("santri_token");
    } else if (isInternalLoggedIn) {
      token = localStorage.getItem("authToken");
    } else {
      alert("Silakan login terlebih dahulu untuk mencatat tindakan");
      navigate("/pendaftaran");
      return;
    }

    setActionLoading(true);
    try {
      const useFoto = !!fotoFile;
      const sendBody = useFoto ? new FormData() : {
        master_aksi_id: confirmAction.id,
        catatan: confirmAction.catatan || undefined,
        jadwal_id: confirmAction.jadwal_id || undefined,
        aktivitas_id: confirmAction.aktivitas_id || undefined,
      };
      if (useFoto) {
        sendBody.append("master_aksi_id", String(confirmAction.id));
        if (confirmAction.catatan) sendBody.append("catatan", confirmAction.catatan);
        if (confirmAction.jadwal_id) sendBody.append("jadwal_id", String(confirmAction.jadwal_id));
        if (confirmAction.aktivitas_id) sendBody.append("aktivitas_id", String(confirmAction.aktivitas_id));
        if (confirmAction.butuh_input_angka) sendBody.append("nilai_angka", String(parseInt(nilaiAngka, 10) || 0));
        sendBody.append("foto", fotoFile);
      } else if (confirmAction.butuh_input_angka) {
        sendBody.nilai_angka = parseInt(nilaiAngka, 10);
      }
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/ternak/${jenis}/aksi`,
        {
          method: "POST",
          headers: useFoto
            ? { Authorization: `Bearer ${token}` }
            : {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
          body: useFoto ? sendBody : JSON.stringify(sendBody),
        },
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.message || errData.error || "Gagal mencatat tindakan",
        );
      }
      const data = await res.json();
      fetchHistory();
      fetchTernak();
      if (confirmAction.butuh_input_angka && data?.total != null) {
        setSuccessMsg(
          `${confirmAction.label} berhasil dicatat — total kini ${data.total} ekor (mati ${data.total_mati})`,
        );
      } else {
        setSuccessMsg(`${confirmAction.label} berhasil dicatat!`);
      }
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
      setNilaiAngka("");
      setFotoFile(null);
    }
  };

  const filterOptions = [
    "Semua",
    ...new Set(history.map((h) => h.label)),
  ].slice(0, 8);

  const filteredHistory = history.filter(
    (log) => filterRiwayat === "Semua" || log.label === filterRiwayat,
  );
  const displayedHistory = showAllHistory
    ? filteredHistory
    : filteredHistory.slice(0, 4);

  const jumlahSantriTerlibat = new Set(
    history.map((log) => log.nama_santri || log.nama_perawat),
  ).size;

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
  const headerBg = {
    green: "from-green-800 to-green-950",
    slate: "from-slate-800 to-slate-950",
    amber: "from-amber-800 to-amber-950",
  }[palette] || "from-green-800 to-green-950";

  const statVariant = (warna) => {
    const map = {
      green: {
        card: "bg-green-50 dark:bg-green-500/10 border-line",
        icon: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300",
      },
      red: { card: "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/30", icon: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300" },
      blue: {
        card: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/30",
        icon: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300",
      },
      amber: {
        card: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/30",
        icon: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
      },
    };
    return map[warna] || map.green;
  };

  return (
    <div className="min-h-screen bg-surface2 pt-[100px] lg:pt-[140px] pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col mb-6 gap-4">
          <Link
            to="/peternakan"
            className="inline-flex items-center text-green-600 dark:text-green-400 font-bold hover:text-green-800 dark:hover:text-green-300 transition w-fit"
          >
            <FiArrowLeft className="mr-2" /> Kembali ke Koleksi Ternak
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
                  {ternak.kategori}
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
            {canShowCareSection && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h3 className="text-ink font-bold text-xl flex items-center">
                    Konfirmasi Perawatan
                  </h3>
                  <span className="text-xs bg-surface2 text-muted px-3 py-1 rounded-full font-medium">
                    {grupAksi.length} jenis aksi
                  </span>
                </div>

                {isCareDisabled && (
                  <div
                    className={`mb-4 p-4 rounded-2xl border flex gap-3 items-start text-sm ${isSantriRejected ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}
                  >
                    <FiInfo className="shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold">{careLockTitle}</p>
                      <p className="mt-0.5 leading-relaxed">{careLockMsg}</p>
                    </div>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center font-semibold animate-pulse shadow-sm text-sm">
                    {successMsg}
                  </div>
                )}

                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${isSantriRejected ? "opacity-50 grayscale pointer-events-none select-none" : ""}`}
                >
                  {grupAksi.map((g) => {
                    const a = g.utama;
                    const w = warnaAksi(g.nama);
                    const c = w === "red" ? "red" : w === "blue" ? "blue" : w === "orange" ? "orange" : w === "amber" ? "amber" : w === "purple" ? "purple" : "green";
                    const btn = {
                      green: "bg-card hover:bg-green-50 dark:hover:bg-green-500/15 border-2 border-line hover:border-green-300",
                      blue: "bg-card hover:bg-blue-50 dark:hover:bg-blue-500/15 border-2 border-blue-100 dark:border-blue-500/30 hover:border-blue-300 dark:hover:border-blue-400",
                      orange: "bg-card hover:bg-orange-50 dark:hover:bg-orange-500/15 border-2 border-orange-100 dark:border-orange-500/30 hover:border-orange-300 dark:hover:border-orange-400",
                      amber: "bg-card hover:bg-amber-50 dark:hover:bg-amber-500/15 border-2 border-amber-100 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-400",
                      purple: "bg-card hover:bg-purple-50 dark:hover:bg-purple-500/15 border-2 border-purple-100 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-400",
                      red: "bg-card hover:bg-red-50 dark:hover:bg-red-500/15 border-2 border-red-100 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-400",
                    }[c];
                    const icon = {
                      green: "bg-green-100 text-green-600",
                      blue: "bg-blue-100 dark:bg-blue-500/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30 text-blue-600 dark:text-blue-300",
                      orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300",
                      amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
                      purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300",
                      red: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300",
                    }[c];
                    const txt = {
                      green: "text-green-800 dark:text-green-300",
                      blue: "text-blue-800 dark:text-blue-300",
                      orange: "text-orange-800 dark:text-orange-300",
                      amber: "text-amber-800 dark:text-amber-300",
                      purple: "text-purple-800 dark:text-purple-300",
                      red: "text-red-800 dark:text-red-300",
                    }[c];
                    const jumlahHariIni = g.totalHariIni;
                    const jumlahShown = g.totalJumlah;
                    const disabled = actionLoading || isCareDisabled;
                    return (
                      <button
                        key={g.key}
                        onClick={() => {
                          setNilaiAngka("");
                          setFotoFile(null);
                          if (g.perluPilihWaktu) setPilihWaktu(g);
                          else setConfirmAction(a);
                        }}
                        disabled={disabled}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group shadow-sm ${btn} ${disabled ? "opacity-80 cursor-not-allowed bg-surface2 border-line hover:bg-surface2 hover:border-line hover:-translate-y-0 hover:shadow-none" : ""}`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition shadow-inner ${icon} ${disabled ? "bg-gray-200 dark:bg-gray-700 text-muted" : ""}`}
                        >
                          {ikonAksi(g.nama)}
                        </div>
                        <span
                          className={`font-bold text-sm text-center leading-tight ${disabled ? "text-muted" : txt}`}
                        >
                          {isSantriRejected
                            ? "Ditolak"
                            : isSantriPending
                              ? "Menunggu Verifikasi"
                              : g.nama}
                        </span>
                        {g.perluPilihWaktu && !isCareDisabled ? (
                          <span className="text-[10px] font-bold text-muted mt-1 inline-flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {g.waktuList.join(" / ")}
                          </span>
                        ) : (
                          a.jam_penanda &&
                          !isCareDisabled && (
                            <span className="text-[10px] text-muted mt-1">
                              {a.jam_penanda}
                            </span>
                          )
                        )}
                        {g.batas != null ? (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full bg-green-600 text-white shadow-sm">
                            {jumlahHariIni}/{g.batas}
                          </span>
                        ) : (
                          <span
                            className={`mt-1.5 inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full ${
                              jumlahShown > 0
                                ? "bg-green-50 border border-line text-green-700"
                                : "bg-surface2 border border-line text-muted"
                            }`}
                          >
                            {jumlahShown}×
                          </span>
                        )}
                        {g.perluAngka && !isCareDisabled && (
                          <span className="text-[10px] text-red-500 mt-1 font-bold bg-red-50 px-2 py-0.5 rounded">
                            Butuh jumlah
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start space-x-3 bg-card p-4 rounded-xl border border-line shadow-sm">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <FiUsers className="text-blue-600 w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted mb-1">
                    Kategori Ternak
                  </span>
                  <span className="font-bold text-ink text-sm capitalize">
                    {ternak.kategori || "individu"}
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-card p-4 rounded-xl border border-line shadow-sm">
                <div className="p-2 bg-teal-50 rounded-lg shrink-0">
                  <FiUsers className="text-teal-600 w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted mb-1">
                    Santri Terlibat
                  </span>
                  <span className="font-bold text-ink text-sm">
                    {jumlahSantriTerlibat} Orang
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div
                className={`flex items-start space-x-3 border p-4 rounded-xl shadow-sm ${statVariant("green").card}`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${statVariant("green").icon}`}
                >
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted mb-1">
                    Total {ternak.judul || ternak.nama}
                  </span>
                  <span className="font-extrabold text-ink text-lg">
                    {ternak.total ?? 0} ekor
                  </span>
                </div>
              </div>
              <div
                className={`flex items-start space-x-3 border p-4 rounded-xl shadow-sm ${statVariant("red").card}`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${statVariant("red").icon}`}
                >
                  <FiAlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted mb-1">
                    Total Mati
                  </span>
                  <span className="font-extrabold text-ink text-lg">
                    {ternak.total_mati ?? 0} ekor
                  </span>
                </div>
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
                  onClick={() => {
                    setFilterRiwayat(f);
                    setShowAllHistory(false);
                  }}
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
          ) : displayedHistory.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-muted mb-4" size={48} />
              <p className="text-muted text-base">
                Belum ada riwayat perawatan untuk ternak ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedHistory.map((log, index) => (
                <div key={log.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-surface2 text-muted`}
                    >
                      {ikonAksi(log.nama_aksi)}
                    </div>
                    {index !== displayedHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-surface2 my-2 group-hover:bg-gray-200 dark:bg-gray-700 transition"></div>
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-base font-bold text-ink">
                        {log.label}
                      </p>
                      <span className="text-xs bg-surface2 text-muted px-3 py-1 rounded-full font-medium">
                        {new Date(log.waktu_tindakan)
                          .toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          .replace(".", ":")}{" "}
                        WIB
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      Dicatat oleh:{" "}
                      <span className="font-medium text-ink">
                        {log.nama_santri || log.nama_perawat} (
                        {log.role_perawat || "Santri"})
                      </span>
                      {typeof log.nilai_angka === "number" && log.nilai_angka > 0 && (
                        <span className="ml-2 inline-block text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md">
                          Jumlah: {log.nilai_angka} ekor
                        </span>
                      )}
                    </p>
                    {log.catatan && (
                      <p className="text-sm text-muted mt-1 bg-surface2 border border-line rounded-lg p-2">
                        {log.catatan}
                      </p>
                    )}
                    {log.foto && (
                      <button
                        type="button"
                        onClick={() => setZoomFoto(fotoUrl(log.foto))}
                        className="mt-3 block max-w-[220px] group/foto"
                        aria-label="Perbesar foto perawatan"
                      >
                        <img
                          loading="lazy"
                          decoding="async"
                          src={thumbUrl(log.foto)}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fotoUrl(log.foto);
                          }}
                          alt={`Foto ${log.label}`}
                          className="h-32 w-56 object-cover rounded-xl border border-line shadow-sm group-hover/foto:opacity-85 group-hover/foto:shadow-md transition"
                        />
                      </button>
                    )}
                    <p className="text-xs text-muted mt-1">
                      {new Date(log.waktu_tindakan).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {log.nama_aktivitas && ` • ${log.nama_aktivitas}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showAllHistory && filteredHistory.length > 4 && (
            <button
              onClick={() => setShowAllHistory(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 text-green-600 font-bold py-4 px-6 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all shadow-sm"
            >
              <FiCheckCircle className="text-lg" />
              Lihat Riwayat Lengkap ({filteredHistory.length})
            </button>
          )}
          {showAllHistory && filteredHistory.length > 4 && (
            <button
              onClick={() => setShowAllHistory(false)}
              className="w-full mt-6 flex items-center justify-center gap-2 text-muted font-bold py-4 px-6 border-2 border-line rounded-xl hover:bg-surface2 hover:border-line transition-all shadow-sm"
            >
              <FiCheckCircle className="text-lg" />
              Tutup Sebagian Riwayat
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {pilihWaktu && (
          <div
            className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPilihWaktu(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-3">
                  {ikonAksi(pilihWaktu.nama)}
                </div>
                <h3 className="text-lg font-bold text-ink">
                  {pilihWaktu.nama}
                </h3>
                <p className="text-sm text-muted mt-1">
                  Pilih waktu untuk{" "}
                  <span className="font-semibold text-ink">
                    {pilihWaktu.nama}
                  </span>
                </p>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  {pilihWaktu.items.map((item) => {
                    const jamIni = Number(item.jumlah_hari_ini) || 0;
                    const batas = batasHarian(item);
                    const habis =
                      batas != null && jamIni >= batas;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={actionLoading || isCareDisabled || habis}
                        onClick={() => {
                          setNilaiAngka("");
                          setFotoFile(null);
                          setConfirmAction(item);
                          setPilihWaktu(null);
                        }}
                        className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                          habis
                            ? "bg-surface2 border-line text-muted cursor-not-allowed opacity-70"
                            : "bg-card border-green-200 dark:border-green-500/40 hover:-translate-y-1 hover:border-green-400 hover:shadow-md"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 px-2 py-0.5 rounded-full">
                          <FiClock className="w-3 h-3" />
                          {item.waktu || "Waktu"}
                        </span>
                        {item.jam_penanda && (
                          <span className="text-xs text-muted">
                            {item.jam_penanda}
                          </span>
                        )}
                        <span className="text-sm font-bold text-ink mt-1">
                          {Number(item.jumlah) || 0}× tercatat
                        </span>
                        <span className="text-[10px] text-muted">
                          {habis
                            ? `Batas harian tercapai (${jamIni}/${batas})`
                            : batas != null
                              ? `Hari ini ${jamIni}/${batas}`
                              : "Siap dicatat"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setPilihWaktu(null)}
                  className="mt-5 w-full py-3 px-4 rounded-xl border border-line text-ink font-bold hover:bg-surface2 transition"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && canShowCareSection && (
          <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`bg-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative ${isCareDisabled ? "opacity-70" : ""}`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmAction.sub_aksi ? "bg-orange-100 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400" : "bg-green-100 dark:bg-green-500/20 text-green-500 dark:text-green-400"} ${isCareDisabled ? "opacity-50" : ""}`}
                >
                  {ikonAksi(confirmAction.nama_aksi)}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  Konfirmasi Tindakan
                </h3>
                <p className="text-muted text-sm mb-4">
                  {isCareDisabled ? (
                    careLockMsg
                  ) : (
                    <>
                      Apakah Anda yakin ingin mencatat{" "}
                      <strong>{confirmAction.label}</strong>? Data akan tersimpan
                      di riwayat.
                    </>
                  )}
                </p>

                {confirmAction.butuh_input_angka && !isCareDisabled && (
                  <div className="w-full mb-4">
                    <label className="block text-sm font-bold text-ink text-left mb-2">
                      {confirmAction.label_input || "Jumlah ekor"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={ternak.total ?? undefined}
                      value={nilaiAngka}
                      onChange={(e) => setNilaiAngka(e.target.value)}
                      placeholder={`Maksimal ${ternak.total ?? 0} ekor`}
                      className="w-full px-4 py-3 border-2 border-line rounded-xl text-center text-lg font-bold text-ink focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
                    />
                    <p className="text-left text-[11px] text-muted mt-2">
                      Total {(ternak.judul || ternak.nama).toLowerCase()} akan
                      berkurang sesuai jumlah tersebut.
                    </p>
                  </div>
                )}

                {!isCareDisabled && (
                  <div className="w-full mb-4 text-left">
                    <label className="block text-sm font-bold text-ink mb-2">
                      Foto bukti (opsional)
                    </label>
                    {fotoFile && (
                      <div className="relative mb-3">
                        <img
                          src={URL.createObjectURL(fotoFile)}
                          alt="Pratinjau foto"
                          className="w-full max-h-52 object-cover rounded-xl border border-line shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFotoFile(null)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white text-lg font-bold flex items-center justify-center hover:bg-black/80 transition"
                          aria-label="Hapus foto"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-surface2 file:text-ink file:font-bold hover:file:bg-gray-200 dark:bg-gray-700 transition"
                    />
                  </div>
                )}

                <div className="flex w-full gap-3">
                  <button
                    onClick={() => {
                      setConfirmAction(null);
                      setNilaiAngka("");
                      setFotoFile(null);
                    }}
                    disabled={actionLoading || isCareDisabled}
                    className={`flex-1 py-3 px-4 rounded-xl border border-line text-ink font-bold hover:bg-surface2 transition ${isCareDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handlePerawatan}
                    disabled={
                      actionLoading ||
                      isCareDisabled ||
                      (confirmAction.butuh_input_angka &&
                        (!nilaiAngka || parseInt(nilaiAngka, 10) <= 0))
                    }
                    className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition shadow-md flex items-center justify-center ${
                      isCareDisabled ||
                      (confirmAction.butuh_input_angka &&
                        (!nilaiAngka || parseInt(nilaiAngka, 10) <= 0))
                        ? "opacity-50 cursor-not-allowed bg-gray-400"
                        : confirmAction.butuh_input_angka
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {actionLoading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : isCareDisabled ? (
                      careLockTitle
                    ) : (
                      "Ya, Catat!"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
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