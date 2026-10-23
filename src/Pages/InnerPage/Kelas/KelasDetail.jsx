import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiUsers,
  FiUser,
  FiInfo,
  FiDownload,
  FiImage,
  FiX,
  FiBookOpen,
  FiMapPin,
  FiCheckCircle,
  FiHeart,
  FiCamera,
  FiUpload,
} from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
const fotoUrl = (nama) => (nama ? `${API}/uploads/${nama}` : null);

const JENIS_AKTIVITAS = [
  {
    value: "fgd",
    label: "FGD",
    icon: FiUsers,
    chip: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
    bubble: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    bar: "bg-blue-500",
  },
  {
    value: "kunjungan",
    label: "Kunjungan",
    icon: FiMapPin,
    chip: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    bubble: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  {
    value: "klasikal",
    label: "Klasikal",
    icon: FiBookOpen,
    chip: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
    bubble: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    bar: "bg-green-500",
  },
];
const INFO_JENIS = Object.fromEntries(
  JENIS_AKTIVITAS.map((j) => [j.value, j]),
);

const tanggalPanjang = (value) => {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const fmtJam = (t) => {
  if (!t) return "";
  const s = String(t).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return s;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
};
const fmtRentang = (a, b) => {
  const x = fmtJam(a);
  const y = fmtJam(b);
  if (!x) return "";
  return y ? `${x} - ${y}` : x;
};
const hariIniNama = () =>
  HARI[new Date().getDay() - 1] ??
  new Date().toLocaleDateString("id-ID", { weekday: "long" });

const hariDariTanggal = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return HARI[d.getDay() - 1] || null;
};

/** Tanggal terdekat (mulai hari ini) untuk nama hari tertentu, format "21 Okt". */
const tanggalTerdekat = (namaHari) => {
  const idx = HARI.indexOf(namaHari);
  if (idx < 0) return "-";
  const now = new Date();
  const todayIdx = now.getDay() - 1;
  let selisih = idx - todayIdx;
  if (selisih < 0) selisih += 7;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + selisih);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};

const KelasDetail = () => {
  const { id } = useParams();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("santri_token") : null;
  const [kelas, setKelas] = useState(null);
  const [jadwal, setJadwal] = useState([]);
  const [absensi, setAbsensi] = useState(null);
  const [riwayatAbsen, setRiwayatAbsen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("semua");
  const [fotoTerpilih, setFotoTerpilih] = useState(null);

  const [modal, setModal] = useState(null); // 'absen' | 'sakit'
  const [busy, setBusy] = useState(false);
  const [sakitFoto, setSakitFoto] = useState(null);
  const [sakitFotoPreview, setSakitFotoPreview] = useState(null);
  const [sakitDeskripsi, setSakitDeskripsi] = useState("");
  const [kameraAktif, setKameraAktif] = useState(false);
  const [toast, setToast] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const hariIni = hariIniNama();

  const muatRiwayat = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/santri/absensi/riwayat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const semua = res.ok ? await res.json() : [];
      setRiwayatAbsen(
        (Array.isArray(semua) ? semua : []).filter(
          (r) => Number(r.kelas_id) === Number(id),
        ),
      );
    } catch {
      /* abaikan */
    }
  }, [id, token]);

  useEffect(() => {
    let batal = false;
    const fetchKelas = async () => {
      try {
        const res = await fetch(`${API}/api/kelas/${id}`);
        if (!res.ok) throw new Error("Kelas tidak ditemukan");
        const data = await res.json();
        if (!batal) setKelas(data);
      } catch (err) {
        console.error(err);
        if (!batal) setError(true);
      } finally {
        if (!batal) setLoading(false);
      }
    };
    const fetchJadwal = async () => {
      try {
        const res = await fetch(`${API}/api/pendidikan/jadwal/${id}`);
        if (res.ok && !batal) setJadwal(await res.json());
      } catch {
        /* abaikan */
      }
    };
    const fetchAbsensi = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/santri/absensi/hari-ini/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && !batal) setAbsensi(await res.json());
      } catch {
        /* abaikan */
      }
    };
    fetchKelas();
    fetchJadwal();
    fetchAbsensi();
    muatRiwayat();
    return () => {
      batal = true;
    };
  }, [id, token, muatRiwayat]);

  /* ── Kamera (untuk Sakit) ── */
  const matikanKamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setKameraAktif(false);
  }, []);

  const nyalakanKamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setKameraAktif(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch {
      showToast("Tidak bisa mengakses kamera. Gunakan upload foto.", "error");
    }
  };

  const ambilDariKamera = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `sakit-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setSakitFoto(file);
        setSakitFotoPreview(URL.createObjectURL(blob));
        matikanKamera();
      },
      "image/jpeg",
      0.85,
    );
  };

  const pilihFoto = (file) => {
    if (!file) return;
    setSakitFoto(file);
    setSakitFotoPreview(URL.createObjectURL(file));
  };

  useEffect(() => () => matikanKamera(), [matikanKamera]);

  const kirim = async (status) => {
    if (busy || !token) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("kelas_id", id);
      fd.append("status", status);
      if (status === "hadir") {
        fd.append("jawaban_sampai_selesai", "ya");
      } else {
        fd.append("deskripsi", sakitDeskripsi.trim());
        if (sakitFoto) fd.append("foto", sakitFoto);
      }
      const res = await fetch(`${API}/api/santri/absensi`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Gagal menyimpan absensi", "error");
        return;
      }
      showToast(
        status === "hadir"
          ? "Absensi tercatat. Semangat belajar hari ini!"
          : "Laporan sakit terkirim. Semoga lekas sembuh.",
      );
      setModal(null);
      setSakitDeskripsi("");
      setSakitFoto(null);
      setSakitFotoPreview(null);
      matikanKamera();
      setAbsensi({ status });
      muatRiwayat();
    } catch {
      showToast("Tidak bisa terhubung ke server", "error");
    } finally {
      setBusy(false);
    }
  };

  const ringkasan = kelas?.ringkasan || { fgd: 0, kunjungan: 0, klasikal: 0 };
  const totalAktivitas = kelas?.aktivitas?.length || 0;

  const daftarTab = useMemo(
    () => [
      { key: "semua", label: "Semua", jumlah: totalAktivitas },
      ...JENIS_AKTIVITAS.map((j) => ({
        key: j.value,
        label: j.label,
        jumlah: ringkasan[j.value] || 0,
      })),
    ],
    [ringkasan, totalAktivitas],
  );

  const aktivitasTampil = useMemo(() => {
    const list = Array.isArray(kelas?.aktivitas) ? kelas.aktivitas : [];
    const terfilter =
      filter === "semua" ? list : list.filter((a) => a.jenis === filter);
    return [...terfilter].sort((a, b) => {
      const ta = new Date(a.tanggal).getTime();
      const tb = new Date(b.tanggal).getTime();
      if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
      return tb - ta;
    });
  }, [kelas, filter]);

  const jadwalPerHari = useMemo(() => {
    const map = {};
    HARI.forEach((h) => (map[h] = []));
    (jadwal || []).forEach((j) => {
      if (map[j.hari]) map[j.hari].push(j);
    });
    HARI.forEach((h) =>
      map[h].sort((a, b) =>
        String(a.jam_mulai).localeCompare(String(b.jam_mulai)),
      ),
    );
    return map;
  }, [jadwal]);

  const jadwalHariIni = jadwalPerHari[hariIni] || [];
  const daftarMapelKelas = [
    ...new Set((jadwal || []).map((j) => j.mapel).filter(Boolean)),
  ];
  const sudahAbsen = !!absensi;

  const downloadQR = () => {
    const canvas = document.getElementById(`qr-canvas-kelas-${kelas.id}`);
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Kelas_${String(kelas.nama).replace(/\s+/g, "_")}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface2">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent"></div>
      </div>
    );

  if (error || !kelas)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface2">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-ink">Kelas tidak ditemukan</h2>
          <p className="text-muted">
            Mungkin QR Code sudah usang atau kelas telah dihapus.
          </p>
          <Link
            to="/kelas"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition"
          >
            <FiArrowLeft size={18} /> Kembali ke Daftar Kelas
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-surface2 pt-[100px] lg:pt-[140px] pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col mb-6 gap-4">
          <Link
            to="/kelas"
            className="group inline-flex items-center gap-2.5 w-fit px-4 py-2 rounded-full bg-card border border-line text-sm font-bold text-ink shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-300 hover:text-green-600 hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400 transition-colors group-hover:bg-green-100 dark:group-hover:bg-green-500/25">
              <FiArrowLeft
                size={14}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </span>
            Kembali ke Daftar Kelas
          </Link>
        </div>

        {/* ── Info Kelas ───────────────────────────────────────────────── */}
        <div className="bg-card rounded-3xl shadow-xl overflow-hidden border border-line flex flex-col md:flex-row">
          <div className="md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-line">
            <div className="relative h-48 sm:h-64 bg-gradient-to-br from-green-800 to-green-950">
              {kelas.foto ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={fotoUrl(kelas.foto)}
                  alt={kelas.nama}
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-100 font-bold">
                  Tanpa Foto
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-2 shadow-sm">
                  {kelas.tahun_ajaran || "Kelas"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-[1.25] break-words">
                  {kelas.nama}
                </h1>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <div className="p-2 bg-green-50 dark:bg-green-500/15 rounded-lg w-fit mb-2">
                    <FiCalendar className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <span className="block text-xs text-muted mb-1">
                    Tahun Ajaran
                  </span>
                  <span className="block font-bold text-ink text-sm break-words">
                    {kelas.tahun_ajaran || "-"}
                  </span>
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <div className="p-2 bg-green-50 dark:bg-green-500/15 rounded-lg w-fit mb-2">
                    <FiUser className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <span className="block text-xs text-muted mb-1">
                    Wali Kelas
                  </span>
                  <span className="block font-bold text-ink text-sm break-words">
                    {kelas.wali_kelas || "-"}
                  </span>
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <div className="p-2 bg-green-50 dark:bg-green-500/15 rounded-lg w-fit mb-2">
                    <FiUsers className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <span className="block text-xs text-muted mb-1">
                    Jumlah Santri
                  </span>
                  <span className="block font-bold text-ink text-sm break-words">
                    {kelas.jumlah_santri ?? 0} santri
                  </span>
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <div className="p-2 bg-green-50 dark:bg-green-500/15 rounded-lg w-fit mb-2">
                    <FiMapPin className="text-green-600 dark:text-green-400 w-5 h-5" />
                  </div>
                  <span className="block text-xs text-muted mb-1">
                    Lokasi
                  </span>
                  <span className="block font-bold text-ink text-sm break-words">
                    {kelas.nama_lokasi || "-"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="flex items-center text-lg font-bold text-ink mb-3">
                  <FiInfo className="mr-2 text-green-500" /> Deskripsi Kelas
                </h3>
                {kelas.deskripsi ? (
                  <div
                    className="text-muted leading-relaxed text-sm sm:text-base prose prose-green prose-sm max-w-none bg-surface2 p-5 rounded-xl border border-line"
                    dangerouslySetInnerHTML={{ __html: kelas.deskripsi }}
                  />
                ) : (
                  <p className="text-muted leading-relaxed text-sm sm:text-base bg-surface2 p-5 rounded-xl border border-line">
                    Belum ada deskripsi untuk kelas ini.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-6 sm:p-8 bg-surface2 flex flex-col">
            {/* Ringkasan aktivitas per jenis */}
            <div className="grid grid-cols-3 gap-3">
              {JENIS_AKTIVITAS.map((j) => {
                const Icon = j.icon;
                const jumlah = ringkasan[j.value] || 0;
                return (
                  <div
                    key={j.value}
                    className="bg-card p-3 sm:p-4 rounded-xl border border-line shadow-sm text-center"
                  >
                    <div
                      className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center mb-2 ${j.bubble}`}
                    >
                      <Icon size={18} />
                    </div>
                    <p className="text-xl font-extrabold text-ink leading-none">
                      {jumlah}
                    </p>
                    <p className="text-[11px] font-semibold text-muted mt-1">
                      {j.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-muted mt-3 flex items-center gap-2">
              <FiClock className="text-green-500" size={16} />
              Total {totalAktivitas} riwayat aktivitas kelas
            </p>

            {/* QR Code */}
            <div className="mt-6 flex-1 flex flex-col justify-center">
              <div className="w-full bg-card rounded-xl border border-line p-4 sm:p-5 shadow-sm flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-3">
                  <h3 className="flex items-center text-base font-bold text-ink">
                    <FiImage className="mr-1.5 text-green-500" /> QR Code Kelas
                  </h3>
                  <button
                    onClick={downloadQR}
                    className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg transition-colors shadow-md text-xs"
                  >
                    <FiDownload size={12} /> Download
                  </button>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-line">
                  <QRCodeCanvas
                    id={`qr-canvas-kelas-${kelas.id}`}
                    value={`${window.location.origin}/kelas/${kelas.id}`}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <p className="text-[11px] text-muted mt-2 text-center">
                  Scan QR untuk akses cepat halaman kelas ini
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Jadwal Pelajaran + Absensi ───────────────────────────────── */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-card rounded-3xl shadow-xl border border-line overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 sm:px-8 py-5 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                  <FiBookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink text-lg sm:text-xl">
                    Jadwal Pelajaran
                  </h3>
                  <p className="text-xs text-muted">
                    {jadwal.length} jadwal · Hari ini {hariIni} ·{" "}
                    {jadwalHariIni.length} pelajaran
                  </p>
                </div>
              </div>

              {/* Tombol Absen & Sakit di pojok kanan */}
              {token && (
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
                  <button
                    disabled={sudahAbsen}
                    onClick={() => setModal("absen")}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition ${
                      sudahAbsen
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white active:scale-[.98]"
                    }`}
                  >
                    <FiCheckCircle size={16} /> Absen
                  </button>
                  <button
                    disabled={sudahAbsen}
                    onClick={() => setModal("sakit")}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition border-2 ${
                      sudahAbsen
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed"
                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-[.98]"
                    }`}
                  >
                    <FiHeart size={16} /> Sakit
                  </button>
                </div>
              )}
            </div>

            {sudahAbsen && (
              <div className="flex items-start gap-3 px-6 sm:px-8 py-3.5 bg-surface2 border-b border-line">
                <FiCheckCircle
                  size={16}
                  className={
                    absensi.status === "izin"
                      ? "text-amber-500"
                      : "text-green-500"
                  }
                />
                <p className="text-xs text-muted">
                  Kamu sudah absen hari ini dengan status{" "}
                  <span className="font-bold text-ink">
                    {absensi.status === "izin" ? "Sakit" : "Hadir"}
                  </span>
                  .
                </p>
              </div>
            )}

            {jadwal.length === 0 ? (
              <div className="p-10 text-center">
                <FiBookOpen size={36} className="mx-auto text-muted/50 mb-3" />
                <p className="text-muted text-sm font-medium">
                  Belum ada jadwal pelajaran untuk kelas ini.
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="w-full min-w-[640px] border border-line rounded-xl overflow-hidden border-collapse">
                  <thead>
                    <tr className="bg-surface2 text-left">
                      <th className="px-4 py-3 text-xs font-extrabold text-ink uppercase tracking-wide border-b border-r border-line w-28">
                        Hari
                      </th>
                      <th className="px-4 py-3 text-xs font-extrabold text-ink uppercase tracking-wide border-b border-r border-line w-36">
                        Jam
                      </th>
                      <th className="px-4 py-3 text-xs font-extrabold text-ink uppercase tracking-wide border-b border-r border-line w-28">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-xs font-extrabold text-ink uppercase tracking-wide border-b border-r border-line">
                        Mata Pelajaran
                      </th>
                      <th className="px-4 py-3 text-xs font-extrabold text-ink uppercase tracking-wide border-b border-line w-52">
                        Guru
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {HARI.map((h) => {
                      const list = jadwalPerHari[h] || [];
                      if (list.length === 0) return null;
                      const ini = h === hariIni;
                      return list.map((j, i) => (
                        <tr
                          key={j.id}
                          className={
                            ini
                              ? "bg-green-50/60 dark:bg-green-500/10"
                              : "hover:bg-surface2/50 transition"
                          }
                        >
                          {i === 0 && (
                            <td
                              rowSpan={list.length}
                              className="px-4 py-3 border-r-2 border-b-2 border-line align-middle text-center"
                            >
                              <span
                                className={`inline-flex flex-col items-center gap-1 text-sm font-bold ${
                                  ini
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-ink"
                                }`}
                              >
                                {h}
                                {ini && (
                                  <span className="text-[10px] font-extrabold bg-green-600 text-white px-1.5 py-0.5 rounded-full">
                                    INI
                                  </span>
                                )}
                              </span>
                            </td>
                          )}
                          <td
                            className={`px-4 py-3 border-r border-line align-top ${
                              i === list.length - 1
                                ? "border-b-2 border-line"
                                : "border-b border-line"
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 tabular-nums whitespace-nowrap">
                              <FiClock size={12} />
                              {fmtRentang(j.jam_mulai, j.jam_selesai)}
                            </span>
                          </td>
                          {i === 0 && (
                            <td
                              rowSpan={list.length}
                              className="px-4 py-3 border-r border-b-2 border-line align-middle text-center"
                            >
                              <span className="text-xs font-semibold text-muted whitespace-nowrap">
                                {tanggalTerdekat(h)}
                              </span>
                            </td>
                          )}
                          <td
                            className={`px-4 py-3 border-r border-line align-top ${
                              i === list.length - 1
                                ? "border-b-2 border-line"
                                : "border-b border-line"
                            }`}
                          >
                            <span className="text-sm font-bold text-ink">
                              {j.mapel}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 align-top ${
                              i === list.length - 1
                                ? "border-b-2 border-line"
                                : "border-b border-line"
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted font-semibold">
                              <FiUser size={12} className="shrink-0" />
                              {j.guru_nama_tampil ||
                                j.guru_nama ||
                                "Guru belum diisi"}
                            </span>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Riwayat Aktivitas ───────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-card rounded-3xl shadow-xl border border-line p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
              <h3 className="flex items-center text-2xl font-bold text-ink">
                <FiClock className="mr-3 text-green-500" /> Riwayat Aktivitas
              </h3>
            </div>

            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {daftarTab.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 text-sm rounded-full font-bold transition whitespace-nowrap flex items-center gap-2 ${
                    filter === tab.key
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-surface2 text-muted hover:bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      filter === tab.key
                        ? "bg-white/25 text-white"
                        : "bg-card text-ink border border-line"
                    }`}
                  >
                    {tab.jumlah}
                  </span>
                </button>
              ))}
              {token && (
                <button
                  onClick={() => setFilter("absensi")}
                  className={`px-4 py-2 text-sm rounded-full font-bold transition whitespace-nowrap flex items-center gap-2 ${
                    filter === "absensi"
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-surface2 text-muted hover:bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <FiCheckCircle size={14} /> Absensi
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      filter === "absensi"
                        ? "bg-white/25 text-white"
                        : "bg-card text-ink border border-line"
                    }`}
                  >
                    {riwayatAbsen.length}
                  </span>
                </button>
              )}
            </div>

            {filter === "absensi" ? (
              riwayatAbsen.length === 0 ? (
                <div className="text-center py-12">
                  <FiCheckCircle className="mx-auto text-muted mb-4" size={48} />
                  <p className="text-muted text-base">
                    Belum ada riwayat absensi untuk kelas ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {riwayatAbsen.map((r) => {
                    const hadir = r.status === "hadir";
                    const mapelHariIni = (
                      jadwalPerHari[hariDariTanggal(r.tanggal)] || []
                    ).map((j) => j.mapel);
                    const mapelTampil = mapelHariIni.length
                      ? mapelHariIni
                      : daftarMapelKelas;
                    return (
                      <div
                        key={r.id}
                        className="flex items-start gap-4 px-4 py-3.5 rounded-2xl bg-surface2 border border-line"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            hadir
                              ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                              : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {hadir ? (
                            <FiCheckCircle size={18} />
                          ) : (
                            <FiHeart size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted font-semibold">
                              {tanggalPanjang(r.tanggal)}
                            </span>
                            {r.waktu_server && (
                              <span className="text-xs text-muted font-semibold flex items-center gap-1">
                                <FiClock size={11} />
                                {new Date(r.waktu_server).toLocaleTimeString(
                                  "id-ID",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-base font-bold text-ink truncate">
                              {r.nama_santri || "Santri"}
                            </p>
                            <span
                              className={`shrink-0 inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                hadir
                                  ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30"
                                  : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
                              }`}
                            >
                              {hadir ? "Hadir" : "Sakit"}
                            </span>
                          </div>
                          <p className="text-xs text-muted mt-1 flex items-start gap-1.5">
                            <FiBookOpen size={11} className="mt-0.5 shrink-0" />
                            <span className="font-semibold">
                              {mapelTampil.length
                                ? mapelTampil.join(", ")
                                : "Belum ada jadwal pelajaran"}
                            </span>
                          </p>
                          {r.deskripsi && (
                            <p className="text-sm text-muted mt-1.5 italic">
                              "{r.deskripsi}"
                            </p>
                          )}
                          {r.foto && (
                            <a
                              href={fotoUrl(r.foto)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                            >
                              <FiImage size={12} /> Lihat Foto Bukti
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : aktivitasTampil.length === 0 ? (
              <div className="text-center py-12">
                <FiCalendar className="mx-auto text-muted mb-4" size={48} />
                <p className="text-muted text-base">
                  {totalAktivitas === 0
                    ? "Belum ada riwayat aktivitas untuk kelas ini."
                    : "Belum ada aktivitas untuk jenis ini."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {aktivitasTampil.map((a, index) => {
                  const info = INFO_JENIS[a.jenis] || {
                    label: a.jenis,
                    icon: FiClock,
                    chip: "",
                    bubble: "bg-surface2 text-muted",
                  };
                  const Icon = info.icon;
                  return (
                    <div key={a.id} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${info.bubble}`}
                        >
                          <Icon size={18} />
                        </div>
                        {index !== aktivitasTampil.length - 1 && (
                          <div className="w-0.5 h-full bg-surface2 my-2 transition"></div>
                        )}
                      </div>
                      <div className="pb-4 flex-1 bg-surface2 border border-line rounded-xl p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${info.chip}`}
                              >
                                {info.label}
                              </span>
                              <span className="text-xs text-muted font-semibold">
                                {tanggalPanjang(a.tanggal)}
                              </span>
                            </div>
                            <p className="text-base font-bold text-ink mt-1.5">
                              {a.judul}
                            </p>
                          </div>
                        </div>

                        {a.catatan && (
                          <p className="text-sm text-muted mt-3 bg-card border border-line rounded-lg p-3 whitespace-pre-line">
                            {a.catatan}
                          </p>
                        )}

                        {a.foto && (
                          <button
                            type="button"
                            onClick={() => setFotoTerpilih(a)}
                            className="mt-3 inline-flex items-center text-sm font-bold text-green-600 dark:text-green-400 hover:text-green-700 transition bg-card px-3 py-1.5 rounded-md border border-line"
                          >
                            <FiImage className="mr-2" /> Lihat Foto Aktivitas
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox Foto Aktivitas ───────────────────────────────────── */}
      {fotoTerpilih && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm transition-all"
          onClick={() => setFotoTerpilih(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFotoTerpilih(null)}
              className="absolute -top-10 right-0 text-white hover:text-muted transition z-50 p-2"
              title="Tutup (Esc)"
            >
              <FiX size={24} />
            </button>
            <img
              loading="lazy"
              decoding="async"
              src={fotoUrl(fotoTerpilih.foto)}
              alt={fotoTerpilih.judul}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl ring-4 ring-white/10"
            />
            <div className="mt-5 text-center">
              <span className="bg-green-600/90 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-xl backdrop-blur-md">
                {fotoTerpilih.judul} — {tanggalPanjang(fotoTerpilih.tanggal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold text-white ${
              toast.type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Absen (konfirmasi) ── */}
      <AnimatePresence>
        {modal === "absen" && (
          <ModalShell onClose={() => setModal(null)}>
            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
              <FiCheckCircle size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center">
              Konfirmasi Absensi
            </h3>
            <p className="text-sm text-muted text-center mt-2 leading-relaxed">
              Apakah kamu yakin akan mengikuti{" "}
              <span className="font-bold text-ink">
                seluruh pelajaran hari ini
              </span>{" "}
              dengan penuh tanggung jawab? Absensi dicatat{" "}
              <span className="font-bold text-ink">sekali sehari</span> dan tidak
              dapat diubah setelah tersimpan.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl border border-line font-bold text-muted hover:bg-surface2 transition"
              >
                Batal
              </button>
              <button
                disabled={busy}
                onClick={() => kirim("hadir")}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition disabled:opacity-60"
              >
                {busy ? "Menyimpan..." : "Ya, Saya Hadir"}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ── Modal Sakit ── */}
      <AnimatePresence>
        {modal === "sakit" && (
          <ModalShell
            onClose={() => {
              matikanKamera();
              setModal(null);
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
              <FiHeart size={26} />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center">
              Lapor Sakit
            </h3>
            <p className="text-sm text-muted text-center mt-2">
              Keterangan wajib diisi, foto opsional.
            </p>

            <div className="mt-5">
              {sakitFotoPreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-line">
                  <img
                    src={sakitFotoPreview}
                    alt="Bukti sakit"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    onClick={() => {
                      setSakitFoto(null);
                      setSakitFotoPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : kameraAktif ? (
                <div className="relative rounded-2xl overflow-hidden border border-line bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-44 object-cover"
                  />
                  <div className="flex gap-2 p-3">
                    <button
                      onClick={matikanKamera}
                      className="flex-1 py-2.5 rounded-xl border border-line font-bold text-muted bg-card hover:bg-surface2 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={ambilDariKamera}
                      className="flex-[2] py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition flex items-center justify-center gap-2"
                    >
                      <FiCamera size={16} /> Ambil Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={nyalakanKamera}
                    className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 border-dashed border-line hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-500/5 transition"
                  >
                    <FiCamera
                      size={22}
                      className="text-green-600 dark:text-green-400"
                    />
                    <span className="text-xs font-bold text-ink">
                      Ambil Foto
                    </span>
                  </button>
                  <label className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 border-dashed border-line hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-500/5 transition cursor-pointer">
                    <FiUpload
                      size={22}
                      className="text-green-600 dark:text-green-400"
                    />
                    <span className="text-xs font-bold text-ink">
                      Upload Foto
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pilihFoto(e.target.files?.[0])}
                    />
                  </label>
                </div>
              )}
              <p className="text-[11px] text-muted mt-2 flex items-center gap-1">
                <FiImage size={12} /> Foto bersifat opsional.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-ink mb-1.5">
                Keterangan Sakit <span className="text-red-500">*</span>
              </label>
              <textarea
                value={sakitDeskripsi}
                onChange={(e) => setSakitDeskripsi(e.target.value)}
                rows={3}
                placeholder="Contoh: Demam dan sakit kepala sejak semalam..."
                className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  matikanKamera();
                  setModal(null);
                }}
                className="flex-1 py-3 rounded-xl border border-line font-bold text-muted hover:bg-surface2 transition"
              >
                Batal
              </button>
              <button
                disabled={busy || !sakitDeskripsi.trim()}
                onClick={() => kirim("izin")}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition disabled:opacity-50"
              >
                {busy ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Kerangka modal seragam. */
const ModalShell = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-card w-full max-w-md rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
    >
      {children}
    </motion.div>
  </motion.div>
);

export default KelasDetail;
