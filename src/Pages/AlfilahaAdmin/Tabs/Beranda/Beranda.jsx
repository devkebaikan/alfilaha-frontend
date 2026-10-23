import React, { useState, useEffect, useMemo } from "react";
import { adminFetch } from "../../../../adminAuth";
import { useTheme } from "../../../../Context/ThemeContext";
import {
  FiClock,
  FiCalendar,
  FiMessageSquare,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiImage,
  FiPieChart,
  FiZap,
  FiArrowRight,
  FiUsers,
  FiBookOpen,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const STATUS_COLORS = {
  Diterima: "#10b981",
  Pending: "#f59e0b",
  Ditolak: "#ef4444",
};

const PERIOD_HARI = { "7 Hari": 7, "30 Hari": 30, "3 Bulan": 90 };

const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// Satu template dipakai semua panel supaya radius, padding, border, dan
// bayangan konsisten dari atas sampai bawah halaman.
const KARTU =
  "bg-card rounded-3xl border border-line shadow-[0_8px_30px_rgba(15,23,42,0.05)] p-5 sm:p-8";

const kunciTanggal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

// "YYYY-MM-DD HH:MM" maupun "YYYY-MM-DDTHH:MM" -> "YYYY-MM-DD"
const potongTanggal = (mentah) => {
  if (!mentah) return null;
  const bagian = String(mentah)
    .split(" ")[0]
    .split("T")[0];
  return /^\d{4}-\d{2}-\d{2}$/.test(bagian) ? bagian : null;
};

const bagianTanggalEvent = (mentah) => {
  const kunci = potongTanggal(mentah);
  if (kunci) {
    const [, bulan, hari] = kunci.split("-").map(Number);
    return { bulan: BULAN[bulan - 1], hari: String(hari) };
  }
  const bagian = String(mentah || "")
    .trim()
    .split(" ");
  return {
    bulan: bagian[1] || String(mentah || "").substring(0, 3) || "-",
    hari: bagian[0] || "-",
  };
};

const Beranda = ({
  reservasi = [],
  events = [],
  appointments = [],
  handleTabChange,
}) => {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState("30 Hari");
  const [pendaftar, setPendaftar] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Stempel waktu data terakhir — induk me-poll reservasi & pesan tiap 2 detik,
  // jadi angka ini ikut hidup dan pill "Live" tidak sekadar hiasan.
  const [waktuUpdate, setWaktuUpdate] = useState(() => new Date());

  useEffect(() => {
    setWaktuUpdate(new Date());
  }, [reservasi, pendaftar, appointments, programs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPendaftar, resPrograms] = await Promise.all([
          adminFetch(
            `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftar_santri`,
          ),
          adminFetch(
            `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs`,
          ),
        ]);
        if (resPendaftar.ok) {
          const data = await resPendaftar.json();
          setPendaftar(Array.isArray(data) ? data : []);
        }
        if (resPrograms.ok) {
          const data = await resPrograms.json();
          setPrograms(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setPendaftar([]);
        setPrograms([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // KPI
  const totalReservasi = reservasi.length;
  const pendingReservasi = reservasi.filter((r) => r.status === "Pending").length;
  const totalPesan = appointments.length;
  const totalPendaftar = pendaftar.length;
  const totalProgramAktif = programs.filter((p) => p.status === "aktif").length;

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jumlahHari = PERIOD_HARI[period] ?? 7;

  // Deret harian diisi nol untuk tanggal tanpa aktivitas, supaya sumbu X
  // berurutan rapi. (Sebelumnya hanya tanggal yang punya data sehingga
  // rentangnya loncat-loncat dan tombol periode tidak pernah dipakai.)
  const trendData = useMemo(() => {
    const hitung = { Reservasi: {}, Pendaftar: {} };
    reservasi.forEach((r) => {
      const kunci = potongTanggal(r.tanggal);
      if (kunci) hitung.Reservasi[kunci] = (hitung.Reservasi[kunci] || 0) + 1;
    });
    pendaftar.forEach((p) => {
      const kunci = potongTanggal(p.created_at);
      if (kunci) hitung.Pendaftar[kunci] = (hitung.Pendaftar[kunci] || 0) + 1;
    });

    const hasil = [];
    const akhir = new Date();
    for (let i = jumlahHari - 1; i >= 0; i--) {
      const d = new Date(akhir);
      d.setDate(akhir.getDate() - i);
      const kunci = kunciTanggal(d);
      hasil.push({
        name:
          jumlahHari <= 7
            ? d.toLocaleDateString("id-ID", { weekday: "short" })
            : `${d.getDate()} ${BULAN[d.getMonth()]}`,
        Reservasi: hitung.Reservasi[kunci] || 0,
        Pendaftar: hitung.Pendaftar[kunci] || 0,
      });
    }
    return hasil;
  }, [reservasi, pendaftar, jumlahHari]);

  const adaDataTren = trendData.some((d) => d.Reservasi > 0 || d.Pendaftar > 0);

  const totalPeriode = useMemo(
    () =>
      trendData.reduce(
        (akum, d) => ({
          Reservasi: akum.Reservasi + d.Reservasi,
          Pendaftar: akum.Pendaftar + d.Pendaftar,
        }),
        { Reservasi: 0, Pendaftar: 0 },
      ),
    [trendData],
  );

  // Legend seri — warna dot disalin persis dari stroke <Area> di bawah.
  const seriLegend = [
    {
      nama: "Pendaftar Santri",
      warna: "#3b82f6",
      nilai: totalPeriode.Pendaftar,
    },
    { nama: "Reservasi", warna: "#10b981", nilai: totalPeriode.Reservasi },
  ];

  const jamUpdate = waktuUpdate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusData = useMemo(() => {
    const diterima = reservasi.filter((r) => r.status === "Diterima").length;
    const pending = reservasi.filter((r) => r.status === "Pending").length;
    const ditolak = reservasi.filter((r) => r.status === "Ditolak").length;
    return [
      { name: "Diterima", value: diterima, color: STATUS_COLORS.Diterima },
      { name: "Pending", value: pending, color: STATUS_COLORS.Pending },
      { name: "Ditolak", value: ditolak, color: STATUS_COLORS.Ditolak },
    ].filter((item) => item.value > 0);
  }, [reservasi]);

  const upcomingEvents = useMemo(() => [...events].slice(0, 3), [events]);

  // Warna chart menyesuaikan tema — sebelumnya tooltip selalu latar putih
  // dan grid line nyaris putih, jadi menyilaukan di mode gelap.
  const gayaChart = {
    grid: isDark ? "#26312D" : "#EEF2F0",
    tick: isDark ? "#93A29B" : "#64748b",
    panel: isDark ? "#18211D" : "#ffffff",
    garis: isDark ? "#2E3A35" : "rgba(15,23,42,0.08)",
    teks: isDark ? "#E8F0EE" : "#0f172a",
    teksKecil: isDark ? "#B0B0B0" : "#475569",
  };

  const tooltipProps = {
    contentStyle: {
      borderRadius: "16px",
      border: `1px solid ${gayaChart.garis}`,
      boxShadow: "0 16px 32px -12px rgba(0,0,0,0.35)",
      padding: "12px 16px",
      backgroundColor: gayaChart.panel,
      color: gayaChart.teks,
    },
    labelStyle: {
      fontWeight: 800,
      fontSize: "14px",
      marginBottom: "8px",
      color: gayaChart.teks,
    },
    itemStyle: { fontWeight: 700, fontSize: "13px", color: gayaChart.teksKecil },
  };

  // Class warna ditulis literal (bukan template `bg-${color}-50`) supaya
  // benar-benar dibuat oleh Tailwind — versi lama tidak pernah ter-generate.
  const kartuKpi = [
    {
      label: "Program Aktif",
      nilai: totalProgramAktif,
      ket: "Pendaftaran & Event",
      tab: "pendaftaran",
      Ikon: FiBookOpen,
      blob: "bg-purple-100/60 dark:bg-purple-500/10",
      kotak:
        "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
      chip:
        "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    },
    {
      label: "Total Reservasi",
      nilai: totalReservasi,
      ket:
        pendingReservasi > 0
          ? `${pendingReservasi} menunggu konfirmasi`
          : "Semua terselesaikan",
      tab: "reservasi",
      Ikon: FiClock,
      blob: "bg-orange-100/60 dark:bg-orange-500/10",
      kotak:
        "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
      chip:
        "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
      peringatan: pendingReservasi > 0,
    },
    {
      label: "Pesan Masuk",
      nilai: totalPesan,
      ket: "Pesan & pertanyaan",
      tab: "appointment",
      Ikon: FiMessageSquare,
      blob: "bg-blue-100/60 dark:bg-blue-500/10",
      kotak: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
      chip: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
  ];

  const aksiCepat = [
    {
      title: "Kelola Pendaftaran",
      Ikon: FiUsers,
      tab: "pendaftaran",
      warna:
        "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 [@media(hover:hover)]:hover:bg-blue-600 [@media(hover:hover)]:hover:text-white",
      garis: "border-blue-100/60 shadow-blue-500/10",
    },
    {
      title: "Kelola Galeri",
      Ikon: FiImage,
      tab: "galeri-semua",
      warna:
        "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 [@media(hover:hover)]:hover:bg-emerald-600 [@media(hover:hover)]:hover:text-white",
      garis: "border-emerald-100/60 shadow-emerald-500/10",
    },
    {
      title: "Tambah Event",
      Ikon: FiCalendar,
      tab: "event",
      warna:
        "bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 [@media(hover:hover)]:hover:bg-purple-600 [@media(hover:hover)]:hover:text-white",
      garis: "border-purple-100/60 shadow-purple-500/10",
    },
    {
      title: "Kotak Pesan Masuk",
      Ikon: FiMessageSquare,
      tab: "appointment",
      warna:
        "bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-300 [@media(hover:hover)]:hover:bg-orange-600 [@media(hover:hover)]:hover:text-white",
      garis: "border-orange-100/60 shadow-orange-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-line border-t-[#16804B]"></div>
        <p className="text-sm font-bold text-muted">Memuat data dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-4">
      {/* HEADER */}
      <div
        className={`${KARTU} relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5`}
      >
        <div className="pointer-events-none hidden"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-ink tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted mt-2 font-medium">
            Ringkasan aktivitas dan performa pendaftaran Alfilaha.
          </p>
          <span className="inline-flex items-center gap-2 mt-4 bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide">
            <FiCalendar size={13} className="shrink-0" />
            {today}
          </span>
        </div>

        <div className="relative z-10 flex bg-surface2 rounded-2xl p-1.5 border border-line w-full sm:w-auto sm:self-start">
          {Object.keys(PERIOD_HARI).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${
                period === p
                  ? "bg-card text-[#16804B] dark:text-[#4ADE80] shadow-sm"
                  : "text-muted [@media(hover:hover)]:hover:text-ink [@media(hover:hover)]:hover:bg-white/70 dark:[@media(hover:hover)]:hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Kartu utama */}
        <div className="bg-gradient-to-br from-[#14532D] via-[#16804B] to-[#10b981] rounded-3xl p-5 sm:p-8 shadow-[0_20px_40px_rgba(22,128,75,0.25)] relative overflow-hidden group [@media(hover:hover)]:hover:-translate-y-1.5 transition-all duration-300">
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/10"></div>

          <div className="relative z-10 flex justify-between items-start gap-4">
            <div>
              <p className="text-xs font-black text-white/70 uppercase tracking-widest">
                Total Santri Terdaftar
              </p>
              <p className="text-4xl sm:text-5xl font-black text-white mt-2 drop-shadow-lg">
                {totalPendaftar}
              </p>
            </div>
            <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/20 transition-transform duration-500 [@media(hover:hover)]:group-hover:scale-110">
              <FiUsers className="text-2xl sm:text-3xl drop-shadow-sm" />
            </span>
          </div>

          <div className="relative z-10 mt-4 sm:mt-6 flex justify-between items-center gap-3">
            <span className="flex items-center text-xs font-black text-green-50 bg-black/25 px-4 py-2 rounded-full border border-white/10">
              <FiTrendingUp className="mr-2" size={14} /> Pendaftaran Aktif
            </span>
            <button
              type="button"
              aria-label="Buka data pendaftaran"
              onClick={() => handleTabChange("pendaftaran")}
              className="text-white [@media(hover:hover)]:hover:text-green-200 [@media(hover:hover)]:hover:bg-white/10 p-2.5 rounded-full transition-colors"
            >
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {kartuKpi.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleTabChange(item.tab)}
            className={`${KARTU} relative overflow-hidden text-left group transition-all duration-300 [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]`}
          >
            <div
              className={`pointer-events-none hidden`}
            ></div>

            <div className="relative z-10 flex justify-between items-start gap-4">
              <div>
                <p className="text-xs font-black text-muted uppercase tracking-widest">
                  {item.label}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-ink mt-2">{item.nilai}</p>
              </div>
              <span
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 [@media(hover:hover)]:group-hover:scale-110 [@media(hover:hover)]:group-hover:-rotate-3 ${item.kotak}`}
              >
                <item.Ikon className="w-6 h-6" />
              </span>
            </div>

            <span
              className={`relative z-10 mt-4 sm:mt-6 flex items-center gap-2 text-xs font-black w-max px-4 py-2 rounded-full ${item.chip}`}
            >
              {item.peringatan && <FiAlertCircle size={14} />}
              {item.ket}
            </span>
          </button>
        ))}
      </div>

      {/* TREN GRAFIK */}
      <div className={`${KARTU} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-green-50/40 dark:to-green-500/5"></div>

        <div className="relative z-10">
          <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                Tren Aktivitas Keseluruhan
              </h2>
              <p className="text-sm text-muted font-medium mt-1.5">
                Pendaftar santri dan reservasi selama{" "}
                <span className="font-bold text-ink">{period}</span> terakhir.
              </p>
            </div>
            <div className="self-start sm:self-auto flex flex-col items-start sm:items-end gap-2.5">
              {/* Legend seri — warnanya sama persis dengan garis di chart */}
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                {seriLegend.map((s) => (
                  <li key={s.nama} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: s.warna }}
                    ></span>
                    <span className="font-bold text-muted">{s.nama}</span>
                    <span className="font-black text-ink tabular-nums">
                      {s.nilai}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Pill live + waktu update terakhir (data di-polling tiap 2 detik) */}
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 dark:bg-green-500/15 text-[#16804B] dark:text-[#4ADE80] px-3.5 py-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-current"></span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                  Live
                </span>
                <span className="w-px h-3 bg-current opacity-30"></span>
                <span className="text-[11px] font-bold tracking-tight opacity-80">
                  Diperbarui {jamUpdate}
                </span>
              </span>
            </div>
          </div>

          <div className="w-full h-[280px] sm:h-[340px]">
            {adaDataTren ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorResNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPenNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={gayaChart.grid}
                    strokeOpacity={0.4}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={true}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: gayaChart.tick, fontWeight: 600 }}
                    dy={10}
                    interval={jumlahHari <= 7 ? 0 : Math.ceil(jumlahHari / 8)}
                    minTickGap={12}
                    stroke={gayaChart.grid}
                    strokeOpacity={0.3}
                  />
                  <YAxis
                    axisLine={true}
                    tickLine={false}
                    width={40}
                    tick={{ fontSize: 11, fill: gayaChart.tick, fontWeight: 600 }}
                    allowDecimals={false}
                    stroke={gayaChart.grid}
                    strokeOpacity={0.3}
                  />
                  <Tooltip
                    {...tooltipProps}
                    contentStyle={{
                      ...tooltipProps.contentStyle,
                      borderRadius: "12px",
                      boxShadow:
                        "0 10px 40px -10px rgba(15,23,42,0.25)",
                      border: `1px solid ${gayaChart.grid}`,
                    }}
                  />
                  <Area
                    type="monotone"
                    name="Pendaftar Santri"
                    dataKey="Pendaftar"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPenNew)"
                    dot={{
                      r: 3,
                      stroke: "#3b82f6",
                      strokeWidth: 2,
                      fill: isDark ? "#0f172a" : "#ffffff",
                    }}
                    activeDot={{ r: 5 }}
                    animationDuration={1000}
                  />
                  <Area
                    type="monotone"
                    name="Reservasi Wisata"
                    dataKey="Reservasi"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorResNew)"
                    dot={{
                      r: 3,
                      stroke: "#10b981",
                      strokeWidth: 2,
                      fill: isDark ? "#0f172a" : "#ffffff",
                    }}
                    activeDot={{ r: 5 }}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center bg-surface2 rounded-3xl border-2 border-dashed border-line px-6">
                <FiActivity size={44} className="mb-4 opacity-30 text-muted" />
                <p className="font-black text-ink text-lg">Belum Ada Data Tren</p>
                <p className="text-sm mt-2 text-muted font-medium max-w-sm">
                  Belum ada pendaftar santri atau reservasi pada rentang{" "}
                  <span className="font-bold text-ink">{period}</span> terakhir.
                  Coba ganti periode di atas atau tunggu data baru masuk.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INSIGHT + STATUS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* INSIGHT CERDAS */}
        <div className={KARTU}>
          <div className="flex items-start gap-4 mb-6">
            <span className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 rounded-2xl shrink-0">
              <FiZap className="text-orange-600 dark:text-orange-300 text-xl w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                Insight Cerdas
              </h2>
              <p className="text-sm text-muted font-medium mt-1">
                Ringkasan analisis otomatis dari data sistem terkini.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Pendaftaran */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 dark:from-blue-500/20 to-indigo-50 border border-blue-100/50 relative group transition-shadow [@media(hover:hover)]:hover:shadow-md">
              <div className="relative z-10 flex items-start gap-3">
                <FiUsers className="text-blue-600 dark:text-blue-300 w-5 h-5 shrink-0 mt-1" />
                <div>
                  <h4 className="font-black text-ink text-base">
                    Gelombang Pendaftaran
                  </h4>
                  <p className="text-sm font-medium text-ink leading-relaxed mt-1">
                    {totalPendaftar > 0
                      ? `Sistem mencatat ${totalPendaftar} calon santri telah mendaftar. Terus pantau dan verifikasi data secara berkala.`
                      : "Belum ada calon santri yang mendaftar. Pastikan program pendaftaran publik sudah aktif."}
                  </p>
                </div>
              </div>
            </div>

            {/* Reservasi */}
            <div
              className={`p-5 rounded-3xl border relative group transition-shadow [@media(hover:hover)]:hover:shadow-md ${
                pendingReservasi > 0
                  ? "bg-gradient-to-br from-orange-50 dark:from-orange-500/20 to-amber-50 border-orange-100/50"
                  : "bg-gradient-to-br from-green-50 dark:from-green-500/20 to-emerald-50 border-green-100/50"
              }`}
            >
              <div className="relative z-10 flex items-start gap-3">
                <FiClock
                  className={`w-5 h-5 shrink-0 mt-1 ${
                    pendingReservasi > 0
                      ? "text-orange-600 dark:text-orange-300"
                      : "text-green-600 dark:text-green-300"
                  }`}
                />
                <div>
                  <h4 className="font-black text-ink text-base">
                    Tindakan Reservasi
                  </h4>
                  <p className="text-sm font-medium text-ink leading-relaxed mt-1">
                    {pendingReservasi > 0
                      ? `Ada ${pendingReservasi} reservasi wisata yang masih menunggu konfirmasi. Segera proses agar pelanggan tidak menunggu lama.`
                      : `Total ${totalReservasi} reservasi telah diproses. Tidak ada reservasi pending, semua antrian terkendali.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATUS RESERVASI */}
        <div className={`${KARTU} flex flex-col`}>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
              Distribusi Status Reservasi
            </h2>
            <p className="text-sm text-muted font-medium mt-1">
              Analisa visual penerimaan reservasi wisata & fasilitas.
            </p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 py-6 sm:py-8">
            <div className="w-[200px] h-[200px] shrink-0">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipProps} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface2 rounded-full border-2 border-dashed border-line">
                  <FiPieChart size={32} className="text-muted mb-2" />
                </div>
              )}
            </div>

            <div className="space-y-3 w-full sm:w-auto sm:min-w-[240px]">
              {statusData.length > 0 ? (
                statusData.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between gap-4 bg-surface2 p-4 rounded-2xl border border-line"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      ></span>
                      <span className="font-black text-ink text-sm truncate">
                        {s.name}
                      </span>
                    </span>
                    <span className="font-black text-ink bg-card px-3.5 py-1 rounded-xl text-sm">
                      {s.value}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted font-medium py-6">
                  Grafik kosong. Belum ada data reservasi.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTabChange("reservasi")}
            className="w-full py-4 rounded-2xl bg-[#16804B] hover:bg-[#14532D] text-white font-black text-sm transition-all duration-300 shadow-lg shadow-[#16804B]/20 flex items-center justify-center gap-2 group"
          >
            Kelola Reservasi Sekarang
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* AGENDA + AKSI CEPAT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Agenda Terdekat */}
        <div className={`${KARTU} flex flex-col`}>
          <div className="flex justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                Agenda Terdekat
              </h2>
              <p className="text-sm text-muted font-medium mt-1">
                Jadwal event yang akan datang.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTabChange("event")}
              className="shrink-0 text-[#16804B] dark:text-[#4ADE80] hover:text-white hover:bg-[#16804B] text-sm font-black bg-green-50 dark:bg-green-500/15 px-4 py-2.5 rounded-xl transition-all"
            >
              Lihat Semua
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => {
                const { bulan, hari } = bagianTanggalEvent(ev.date);
                return (
                  <div
                    key={ev.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleTabChange("event")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTabChange("event");
                      }
                    }}
                    className="flex items-center p-4 rounded-3xl border border-line bg-surface2 cursor-pointer group transition-all hover:border-green-300 dark:hover:border-green-500/40 hover:shadow-[0_12px_24px_rgba(22,128,75,0.08)]"
                  >
                    <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-green-50 dark:from-green-500/20 to-emerald-100 dark:to-emerald-500/20 text-[#16804B] dark:text-[#4ADE80] flex flex-col items-center justify-center shrink-0 transition-all duration-300 [@media(hover:hover)]:group-hover:from-[#16804B] [@media(hover:hover)]:group-hover:to-emerald-700 [@media(hover:hover)]:group-hover:text-white">
                      <span className="text-[10px] font-black uppercase tracking-wider mb-0.5">
                        {bulan}
                      </span>
                      <span className="text-lg sm:text-xl font-black leading-none">
                        {hari}
                      </span>
                    </span>

                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <h4 className="font-black text-ink text-base leading-snug line-clamp-2 transition-colors [@media(hover:hover)]:group-hover:text-[#16804B] dark:text-[#4ADE80]">
                        {ev.title}
                      </h4>
                      <span className="inline-block mt-1.5 bg-card text-muted px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-line">
                        {ev.category || "Event Publik"}
                      </span>
                    </div>

                    <span className="w-9 h-9 rounded-full bg-card flex items-center justify-center text-muted shrink-0 transition-colors [@media(hover:hover)]:group-hover:text-[#16804B]">
                      <FiArrowRight />
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface2 rounded-3xl border-2 border-dashed border-line">
                <span className="bg-card p-4 rounded-full shadow-sm mb-4">
                  <FiCalendar className="text-muted w-8 h-8" />
                </span>
                <p className="text-ink font-black text-base">
                  Tidak ada event terdaftar.
                </p>
                <p className="text-sm text-muted font-medium mt-1">
                  Tambahkan event baru agar muncul di sini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className={KARTU}>
          <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
            Aksi Cepat
          </h2>
          <p className="text-sm text-muted font-medium mt-1 mb-6">
            Jalan pintas ke fitur yang paling sering Anda gunakan.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {aksiCepat.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => handleTabChange(action.tab)}
                className={`p-4 sm:p-6 rounded-3xl border transition-all duration-300 group flex flex-col items-center justify-center gap-3 text-center ${action.warna} ${action.garis}`}
              >
                <action.Ikon className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-110 [@media(hover:hover)]:group-hover:-translate-y-1" />
                <span className="text-sm font-black leading-snug">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Beranda;
