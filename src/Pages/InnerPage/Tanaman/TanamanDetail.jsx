import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiDroplet,
  FiCheckCircle,
  FiMapPin,
  FiInfo,
  FiClock,
  FiCalendar,
  FiArrowLeft,
  FiUsers,
  FiShoppingBag,
  FiLogOut,
  FiDownload,
  FiGrid,
  FiImage,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";

const TanamanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tanaman, setTanaman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [filterRiwayat, setFilterRiwayat] = useState("Semua");
  const [showAllHistory, setShowAllHistory] = useState(false);
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

      console.log(
        "Updating auth state - santriToken:",
        !!santriToken,
        "internalToken:",
        !!internalToken,
      );

      setIsInternalLoggedIn(!!internalToken);
      setIsSantriLoggedIn(!!santriToken);

      try {
        const storedUser = localStorage.getItem("userData");
        setInternalUserData(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {
        console.error("Gagal membaca data user internal", e);
        setInternalUserData(null);
      }

      try {
        const storedSantri = localStorage.getItem("santri_data");
        const parsedSantriData = storedSantri ? JSON.parse(storedSantri) : null;
        setSantriData(parsedSantriData);
        console.log("Santri data updated:", parsedSantriData);
      } catch (e) {
        console.error("Gagal membaca data santri", e);
        setSantriData(null);
      }
    };

    // Initial load
    updateAuthState();

    // Check periodically for localStorage changes
    const interval = setInterval(updateAuthState, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const isLoggedIn = isInternalLoggedIn || isSantriLoggedIn;

  // Cek apakah santri sudah diterima (untuk aksi perawatan)
  const isSantriPending =
    isSantriLoggedIn &&
    santriData?.status_pendaftaran === "Menunggu Verifikasi";
  const isSantriRejected =
    isSantriLoggedIn && santriData?.status_pendaftaran === "Ditolak";
  // Panel perawatan tetap tampil (diredupkan untuk ditolak) dengan catatan tetap login
  const canShowCareSection = isLoggedIn;
  const isCareDisabled = isSantriPending || isSantriRejected;
  const careLockTitle = isSantriRejected
    ? "Pendaftaran Ditolak"
    : "Menunggu Verifikasi";
  const careLockMsg = isSantriRejected
    ? "Akses perawatan dinonaktifkan karena pendaftaran Anda ditolak. Anda tetap dapat melihat koleksi tanaman, namun tidak bisa mencatat siram, pupuk, atau panen."
    : "Anda masih dalam status Menunggu Verifikasi. Silakan tunggu konfirmasi dari admin untuk melakukan tindakan perawatan.";

  const [selectedFoto, setSelectedFoto] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

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

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      // History bisa dilihat oleh siapa saja (publik), tidak perlu auth
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}/riwayat`,
      );
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((item) => ({
          ...item,
          jenis_tindakan: item.tipe_aksi || item.jenis_tindakan,
          waktu_tindakan: item.created_at || item.waktu_tindakan,
        }));
        setHistory(mappedData); // Ambil semua data riwayat
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTanaman();
    fetchHistory();
  }, [id]);

  const handlePerawatan = async (jenis_tindakan) => {
    console.log("Debug - isSantriLoggedIn:", isSantriLoggedIn);
    console.log("Debug - santriData:", santriData);
    console.log("Debug - isInternalLoggedIn:", isInternalLoggedIn);
    console.log("Debug - internalUserData:", internalUserData);

    let token, namaPerawat, rolePerawat, userId;

    // Prioritaskan santri login
    const santriToken = localStorage.getItem("santri_token");
    const santriDataCheck = localStorage.getItem("santri_data");

    if (santriToken && santriDataCheck) {
      // Gunakan login santri
      const parsedSantriData = JSON.parse(santriDataCheck);
      console.log("Debug - Using santri login:", parsedSantriData);

      // Cek apakah santri sudah diterima
      if (parsedSantriData.status_pendaftaran !== "Diterima") {
        alert(
          "Maaf, Anda belum diterima sebagai santri. Silakan tunggu konfirmasi dari admin.",
        );
        return;
      }

      token = santriToken;
      namaPerawat = parsedSantriData.nama;
      rolePerawat = "Santri";
      userId = parsedSantriData.id;
    } else if (isInternalLoggedIn && internalUserData) {
      // Gunakan login internal
      const internalToken = localStorage.getItem("authToken");
      token = internalToken;
      namaPerawat = internalUserData.nama_lengkap;
      rolePerawat = internalUserData.role;
      userId = internalUserData.id;
    } else {
      // Belum login sama sekali, arahkan ke login santri
      console.log("Debug - No login found, redirecting to login");
      alert("Silakan login terlebih dahulu untuk mencatat tindakan");
      navigate("/pendaftaran");
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}/aksi`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipe_aksi: jenis_tindakan,
            nama_perawat: namaPerawat,
            role_perawat: rolePerawat,
            user_id: userId, // Tambahkan user_id untuk foreign key constraint
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || errorData.error || "Gagal mencatat tindakan",
        );
      }

      fetchHistory(); // Refresh riwayat
      setSuccessMsg(
        `${jenis_tindakan === "siram" ? "Penyiraman" : jenis_tindakan === "pupuk" ? "Pemupukan" : "Panen"} berhasil dicatat!`,
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(false);
      setNotification({
        isOpen: true,
        jenis: jenis_tindakan,
        timestamp: new Date(),
      });

      // Auto close after 3 seconds
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
    }
  };

  const filteredHistory = history.filter((log) => {
    if (filterRiwayat === "Semua") return true;
    if (filterRiwayat === "Penyiraman") return log.jenis_tindakan === "siram";
    if (filterRiwayat === "Pemupukan") return log.jenis_tindakan === "pupuk";
    if (filterRiwayat === "Panen") return log.jenis_tindakan === "panen";
    return true;
  });

  const getTodayCount = (jenis) => {
    const today = new Date().toLocaleDateString("en-CA");
    return history.filter(
      (log) =>
        log.jenis_tindakan === jenis &&
        new Date(log.waktu_tindakan).toLocaleDateString("en-CA") === today,
    ).length;
  };

  const getLimit = (jadwalStr) => {
    if (!jadwalStr) return 0; // Default 0 (disabled) if admin hasn't set
    const match = jadwalStr.match(/(\d+)x/);
    return match ? parseInt(match[1]) : 0;
  };

  const isSiramDisabled =
    actionLoading || getTodayCount("siram") >= getLimit(tanaman?.jadwal_siram);
  const isPupukDisabled =
    actionLoading || getTodayCount("pupuk") >= getLimit(tanaman?.jadwal_pupuk);
  const isPanenDisabled =
    actionLoading || getTodayCount("panen") >= getLimit(tanaman?.jadwal_panen);

  const displayedHistory = showAllHistory
    ? filteredHistory
    : filteredHistory.slice(0, 4);

  // Calculate jumlah aktivitas and jumlah santri yang terlibat
  const jumlahSantriTerlibat = new Set(
    history.map(
      (log) => log.nama_lengkap || log.nama_perawat || log.nama_santri,
    ),
  ).size;

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
            className="inline-flex items-center text-green-600 font-bold hover:text-green-800 transition w-fit"
          >
            <FiArrowLeft className="mr-2" /> Kembali ke Daftar Tanaman
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
              <div className="flex items-start space-x-3 bg-card p-4 rounded-xl border border-line shadow-sm">
                <div className="p-2 bg-green-50 rounded-lg shrink-0">
                  <FiCalendar className="text-green-600 w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted mb-1">
                    Usia Tanaman
                  </span>
                  <span className="font-bold text-ink text-sm">
                    {tanaman.usia || "6 Bulan"}
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-card p-4 rounded-xl border border-line shadow-sm">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <FiDroplet className="text-blue-600 w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted mb-1">
                    Jadwal Siram
                  </span>
                  <span className="font-bold text-ink text-sm">
                    {tanaman.jadwal_siram || "2x Sehari"}
                  </span>
                </div>
              </div>
              <div className="flex items-start space-x-3 bg-card p-4 rounded-xl border border-line shadow-sm">
                <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                  <FiUsers className="text-orange-600 w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-muted mb-1">
                    Kelompok Perawat
                  </span>
                  {(() => {
                    const pj = tanaman.penanggung_jawab || "Belum ada";
                    const parts = pj.split(" - ");
                    return (
                      <div className="flex flex-col">
                        <span className="font-bold text-ink text-sm leading-tight">
                          {parts[0]}
                        </span>
                        {parts.length > 1 && (
                          <span className="text-xs font-medium text-muted mt-1 leading-snug">
                            {parts.slice(1).join(" - ")}
                          </span>
                        )}
                      </div>
                    );
                  })()}
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

            {canShowCareSection && (
              <div className="mt-12 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h3 className="text-ink font-bold text-xl flex items-center">
                    Konfirmasi Perawatan
                  </h3>
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
                  className={`grid grid-cols-3 gap-4 ${isSantriRejected ? "opacity-50 grayscale pointer-events-none select-none" : ""}`}
                >
                  <button
                    onClick={() => setConfirmAction("siram")}
                    disabled={isSiramDisabled || isCareDisabled}
                    className={`flex flex-col items-center justify-center p-4 bg-card hover:bg-blue-50 border-2 border-blue-100 hover:border-blue-300 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group shadow-sm ${isSiramDisabled || isCareDisabled ? "opacity-80 cursor-not-allowed bg-surface2 border-line hover:bg-surface2 hover:border-line hover:-translate-y-0 hover:shadow-none" : ""}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition shadow-inner ${isSiramDisabled || isCareDisabled ? "bg-gray-200 dark:bg-gray-700 text-muted" : "bg-blue-100 group-hover:bg-blue-200 text-blue-600"}`}
                    >
                      {(isSiramDisabled || isCareDisabled) && !actionLoading ? (
                        <FiCheckCircle size={24} />
                      ) : (
                        <FiDroplet size={24} />
                      )}
                    </div>
                    <span
                      className={`font-bold text-sm ${isSiramDisabled || isCareDisabled ? "text-muted" : "text-blue-800"}`}
                    >
                      {isSantriRejected
                        ? "Ditolak"
                        : isSantriPending
                          ? "Menunggu Verifikasi"
                          : isSiramDisabled && !actionLoading
                            ? "Selesai Hari Ini"
                            : "Siram Air"}
                    </span>
                    {!tanaman?.jadwal_siram && !isCareDisabled && (
                      <span className="text-[10px] text-muted mt-1 font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Belum Diatur Admin
                      </span>
                    )}
                    {!isSiramDisabled &&
                      !isCareDisabled &&
                      tanaman?.jadwal_siram && (
                        <span className="text-[10px] text-muted mt-1">
                          {getTodayCount("siram")}/
                          {getLimit(tanaman.jadwal_siram)} Hari ini
                        </span>
                      )}
                    {isSiramDisabled &&
                      actionLoading === false &&
                      tanaman?.jadwal_siram &&
                      !isCareDisabled && (
                        <span className="text-[10px] text-green-600 mt-1 font-bold bg-green-100 px-2 py-0.5 rounded">
                          Sudah Dikerjakan
                        </span>
                      )}
                  </button>

                  <button
                    onClick={() => setConfirmAction("pupuk")}
                    disabled={isPupukDisabled || isCareDisabled}
                    className={`flex flex-col items-center justify-center p-4 bg-card hover:bg-orange-50 border-2 border-orange-100 hover:border-orange-300 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group shadow-sm ${isPupukDisabled || isCareDisabled ? "opacity-80 cursor-not-allowed bg-surface2 border-line hover:bg-surface2 hover:border-line hover:-translate-y-0 hover:shadow-none" : ""}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition shadow-inner ${isPupukDisabled || isCareDisabled ? "bg-gray-200 dark:bg-gray-700 text-muted" : "bg-orange-100 group-hover:bg-orange-200 text-orange-600"}`}
                    >
                      {(isPupukDisabled || isCareDisabled) && !actionLoading ? (
                        <FiCheckCircle size={24} />
                      ) : (
                        <FiCheckCircle size={24} />
                      )}
                    </div>
                    <span
                      className={`font-bold text-sm ${isPupukDisabled || isCareDisabled ? "text-muted" : "text-orange-800"}`}
                    >
                      {isSantriRejected
                        ? "Ditolak"
                        : isSantriPending
                          ? "Menunggu Verifikasi"
                          : isPupukDisabled && !actionLoading
                            ? "Selesai Hari Ini"
                            : "Beri Pupuk"}
                    </span>
                    {!tanaman?.jadwal_pupuk && !isCareDisabled && (
                      <span className="text-[10px] text-muted mt-1 font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Belum Diatur Admin
                      </span>
                    )}
                    {!isPupukDisabled &&
                      !isCareDisabled &&
                      tanaman?.jadwal_pupuk && (
                        <span className="text-[10px] text-muted mt-1">
                          {getTodayCount("pupuk")}/
                          {getLimit(tanaman.jadwal_pupuk)} Hari ini
                        </span>
                      )}
                    {isPupukDisabled &&
                      actionLoading === false &&
                      tanaman?.jadwal_pupuk &&
                      !isCareDisabled && (
                        <span className="text-[10px] text-green-600 mt-1 font-bold bg-green-100 px-2 py-0.5 rounded">
                          Sudah Dikerjakan
                        </span>
                      )}
                  </button>

                  <button
                    onClick={() => setConfirmAction("panen")}
                    disabled={isPanenDisabled || isCareDisabled}
                    className={`flex flex-col items-center justify-center p-4 bg-card hover:bg-green-50 border-2 border-line hover:border-green-300 rounded-2xl hover:-translate-y-1 hover:shadow-md transition-all duration-300 group shadow-sm ${isPanenDisabled || isCareDisabled ? "opacity-80 cursor-not-allowed bg-surface2 border-line hover:bg-surface2 hover:border-line hover:-translate-y-0 hover:shadow-none" : ""}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition shadow-inner ${isPanenDisabled || isCareDisabled ? "bg-gray-200 dark:bg-gray-700 text-muted" : "bg-green-100 group-hover:bg-green-200 text-green-600"}`}
                    >
                      {(isPanenDisabled || isCareDisabled) && !actionLoading ? (
                        <FiCheckCircle size={24} />
                      ) : (
                        <FiShoppingBag size={24} />
                      )}
                    </div>
                    <span
                      className={`font-bold text-sm ${isPanenDisabled || isCareDisabled ? "text-muted" : "text-green-800"}`}
                    >
                      {isSantriRejected
                        ? "Ditolak"
                        : isSantriPending
                          ? "Menunggu Verifikasi"
                          : isPanenDisabled && !actionLoading
                            ? "Selesai Hari Ini"
                            : "Panen"}
                    </span>
                    {!tanaman?.jadwal_panen && !isCareDisabled && (
                      <span className="text-[10px] text-muted mt-1 font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                        Belum Diatur Admin
                      </span>
                    )}
                    {!isPanenDisabled &&
                      !isCareDisabled &&
                      tanaman?.jadwal_panen && (
                        <span className="text-[10px] text-muted mt-1">
                          {getTodayCount("panen")}/
                          {getLimit(tanaman.jadwal_panen)} Hari ini
                        </span>
                      )}
                    {isPanenDisabled &&
                      actionLoading === false &&
                      tanaman?.jadwal_panen &&
                      !isCareDisabled && (
                        <span className="text-[10px] text-green-600 mt-1 font-bold bg-green-100 px-2 py-0.5 rounded">
                          Sudah Dikerjakan
                        </span>
                      )}
                  </button>
                </div>
              </div>
            )}

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
            {["Semua", "Penyiraman", "Pemupukan", "Panen"].map((f) => (
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
            ))}
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-3 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          ) : displayedHistory.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-muted mb-4" size={48} />
              <p className="text-muted text-base">
                Belum ada riwayat perawatan untuk kategori ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedHistory.map((log, index) => (
                <div key={log.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${log.jenis_tindakan === "siram" ? "bg-blue-100 text-blue-600" : log.jenis_tindakan === "panen" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}
                    >
                      {log.jenis_tindakan === "siram" ? (
                        <FiDroplet size={18} />
                      ) : log.jenis_tindakan === "panen" ? (
                        <FiShoppingBag size={18} />
                      ) : (
                        <FiCheckCircle size={18} />
                      )}
                    </div>
                    {index !== displayedHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-surface2 my-2 group-hover:bg-gray-200 dark:bg-gray-700 transition"></div>
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-base font-bold text-ink">
                        Aktivitas{" "}
                        {log.jenis_tindakan === "siram"
                          ? "Penyiraman"
                          : log.jenis_tindakan === "panen"
                            ? "Panen"
                            : "Pemupukan"}
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
                      {log.jenis_tindakan === "siram"
                        ? "Disiram"
                        : log.jenis_tindakan === "panen"
                          ? "Dipanen"
                          : "Dipupuk"}{" "}
                      oleh:{" "}
                      <span className="font-medium text-ink">
                        {log.nama_lengkap ||
                          log.nama_perawat ||
                          log.nama_santri}{" "}
                        ({log.role || log.role_perawat || "Santri"})
                      </span>
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(log.waktu_tindakan).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </p>
                    {log.gambar && (
                      <div
                        className="mt-2 text-sm font-bold text-green-600 flex items-center cursor-pointer hover:text-green-700 transition w-fit bg-green-50 px-3 py-1.5 rounded-md border border-line"
                        onClick={() => setSelectedFoto(log)}
                      >
                        <FiImage className="mr-2" /> Lihat Bukti Foto
                      </div>
                    )}
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
              <FiGrid className="text-lg" />
              Lihat Riwayat Lengkap ({filteredHistory.length})
            </button>
          )}
          {showAllHistory && filteredHistory.length > 4 && (
            <button
              onClick={() => setShowAllHistory(false)}
              className="w-full mt-6 flex items-center justify-center gap-2 text-muted font-bold py-4 px-6 border-2 border-line rounded-xl hover:bg-surface2 hover:border-line transition-all shadow-sm"
            >
              <FiGrid className="text-lg" />
              Tutup Sebagian Riwayat
            </button>
          )}
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
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmAction === "siram" ? "bg-blue-100 text-blue-500" : confirmAction === "panen" ? "bg-green-100 text-green-500" : "bg-orange-100 text-orange-500"} ${isCareDisabled ? "opacity-50" : ""}`}
                >
                  {confirmAction === "siram" ? (
                    <FiDroplet size={32} />
                  ) : confirmAction === "panen" ? (
                    <FiShoppingBag size={32} />
                  ) : (
                    <FiCheckCircle size={32} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  Konfirmasi Tindakan
                </h3>
                <p className="text-muted text-sm mb-6">
                  {isCareDisabled ? (
                    careLockMsg
                  ) : (
                    <>
                      Apakah Anda yakin ingin mencatat aktivitas{" "}
                      <strong>
                        {confirmAction === "siram"
                          ? "Penyiraman"
                          : confirmAction === "panen"
                            ? "Panen"
                            : "Pemupukan"}
                      </strong>
                      ? Data akan tersimpan di riwayat.
                    </>
                  )}
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    disabled={actionLoading || isCareDisabled}
                    className={`flex-1 py-3 px-4 rounded-xl border border-line text-ink font-bold hover:bg-surface2 transition ${isCareDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      if (!isCareDisabled) {
                        await handlePerawatan(confirmAction);
                        setConfirmAction(null);
                      }
                    }}
                    disabled={actionLoading || isCareDisabled}
                    className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition shadow-md flex items-center justify-center ${isCareDisabled ? "opacity-50 cursor-not-allowed bg-gray-400" : confirmAction === "siram" ? "bg-blue-600 hover:bg-blue-700" : confirmAction === "panen" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}`}
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
