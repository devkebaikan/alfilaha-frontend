import React, { useState, useEffect, useMemo } from "react";
import { adminFetch } from "../../../../adminAuth";
import {
  FiCheck,
  FiClock,
  FiCalendar,
  FiFileText,
  FiMessageSquare,
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiImage,
  FiPieChart,
  FiZap,
  FiArrowLeft,
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

const Beranda = ({
  reservasi = [],
  blogs = [],
  events = [],
  appointments = [],
  handleTabChange,
}) => {
  const [period, setPeriod] = useState("30 Hari");
  const [pendaftar, setPendaftar] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // KPI Calculations
  const totalReservasi = reservasi.length;
  const pendingReservasi = reservasi.filter(
    (r) => r.status === "Pending",
  ).length;
  const totalPesan = appointments.length;
  const totalPendaftar = pendaftar.length;
  const totalProgramAktif = programs.filter((p) => p.status === "aktif").length;

  // Format Tanggal Hari Ini
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // DATA: Trend Pendaftar vs Reservasi
  const trendData = useMemo(() => {
    const counts = {};
    reservasi.forEach((r) => {
      if (r.tanggal) {
        const datePart = r.tanggal.split(" ")[0]; // YYYY-MM-DD
        if (!counts[datePart])
          counts[datePart] = { Reservasi: 0, Pendaftar: 0 };
        counts[datePart].Reservasi += 1;
      }
    });

    pendaftar.forEach((p) => {
      if (p.created_at) {
        const datePart = p.created_at.split("T")[0]; // YYYY-MM-DD
        if (!counts[datePart])
          counts[datePart] = { Reservasi: 0, Pendaftar: 0 };
        counts[datePart].Pendaftar += 1;
      }
    });

    const sortedDates = Object.keys(counts).sort();
    const recentDates = sortedDates.slice(-7);

    if (recentDates.length === 0) return [];

    return recentDates.map((date) => {
      const d = new Date(date);
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      return {
        date,
        name: dayName,
        Reservasi: counts[date].Reservasi,
        Pendaftar: counts[date].Pendaftar,
      };
    });
  }, [reservasi, pendaftar]);

  // DATA: Status Reservasi
  const statusData = useMemo(() => {
    const diterima = reservasi.filter((r) => r.status === "Diterima").length;
    const pending = reservasi.filter((r) => r.status === "Pending").length;
    const ditolak = reservasi.filter((r) => r.status === "Ditolak").length;
    return [
      { name: "Diterima", value: diterima, color: STATUS_COLORS["Diterima"] },
      { name: "Pending", value: pending, color: STATUS_COLORS["Pending"] },
      { name: "Ditolak", value: ditolak, color: STATUS_COLORS["Ditolak"] },
    ].filter((item) => item.value > 0);
  }, [reservasi]);

  // DATA: Agenda Terdekat
  const upcomingEvents = useMemo(() => {
    return [...events].slice(0, 3);
  }, [events]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-line border-t-[#16804B]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-12 px-2 sm:px-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 bg-white dark:bg-[#131E1A] p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-green-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-ink tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-400">
            Dashboard Overview
          </h1>
          <p className="text-muted mt-3 font-medium flex items-center gap-3">
            Ringkasan aktivitas dan performa pendaftaran Alfilaha.
            <span className="bg-green-100 dark:bg-green-500/20 text-green-800 px-3 py-1 rounded-full text-xs font-black tracking-wide">
              {today}
            </span>
          </p>
        </div>
        <div className="relative z-10 flex bg-gray-100 dark:bg-white/[0.06] rounded-2xl p-1.5 border border-white dark:border-white/10 shadow-inner">
          {["7 Hari", "30 Hari", "3 Bulan"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                period === p
                  ? "bg-card text-[#16804B] dark:text-[#4ADE80] shadow-[0_4px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
                  : "text-muted [@media(hover:hover)]:hover:text-ink [@media(hover:hover)]:hover:bg-white/40 dark:[@media(hover:hover)]:hover:bg-white/[0.12] dark:bg-white/[0.06]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Primary Dark Card (Pendaftar Santri) */}
        <div className="bg-gradient-to-br from-[#14532D] via-[#16804B] to-[#10b981] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_40px_rgba(22,128,75,0.25)] relative overflow-hidden group [@media(hover:hover)]:hover:-translate-y-1.5 transition-all duration-300">
          <div className="absolute -right-10 -top-6 sm:p-10 w-48 h-48 bg-white/[0.07] dark:bg-white/[0.05] rounded-full [@media(hover:hover)]:group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full"></div>
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-black text-white/70 uppercase tracking-widest">
                Total Santri Terdaftar
              </p>
              <h3 className="text-5xl font-black text-white mt-2 drop-shadow-lg">
                {totalPendaftar}
              </h3>
            </div>
            <div className="w-16 h-16 rounded-[1.25rem] bg-white/20 dark:bg-white/[0.08] text-white flex items-center justify-center shrink-0 shadow-inner border border-white/20 [@media(hover:hover)]:group-hover:scale-110 transition-transform duration-500">
              <FiUsers className="text-3xl drop-shadow-sm" />
            </div>
          </div>
          <div className="relative z-10 mt-2 flex justify-between items-center w-full">
            <div className="flex items-center text-xs font-black text-green-50 bg-black/25 px-4 py-2 rounded-full border border-white/10 shadow-inner">
              <FiTrendingUp className="mr-2" size={14} /> Pendaftaran Aktif
            </div>
            <button
              onClick={() => handleTabChange("pendaftaran")}
              className="text-white [@media(hover:hover)]:hover:text-green-200 p-2 rounded-full [@media(hover:hover)]:hover:bg-white/10 dark:[@media(hover:hover)]:hover:bg-white/[0.10] dark:bg-white/[0.06] transition-colors"
            >
              <FiArrowLeft className="rotate-180 w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Glass Cards */}
        {[
          {
            title: "Program Aktif",
            value: totalProgramAktif,
            icon: <FiBookOpen />,
            color: "purple",
            action: () => handleTabChange("pendaftaran"),
            desc: "Pendaftaran & Event",
          },
          {
            title: "Total Reservasi",
            value: totalReservasi,
            icon: <FiClock />,
            color: "orange",
            action: () => handleTabChange("reservasi"),
            desc:
              pendingReservasi > 0
                ? `${pendingReservasi} Menunggu konfirmasi`
                : "Semua terselesaikan",
          },
          {
            title: "Pesan Masuk",
            value: totalPesan,
            icon: <FiMessageSquare />,
            color: "blue",
            action: () => handleTabChange("appointment"),
            desc: "Inbox belum dibaca",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={item.action}
            className={`bg-white dark:bg-[#131E1A] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/60 relative overflow-hidden group [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer`}
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}-100/70 rounded-bl-[100px] -z-10 [@media(hover:hover)]:group-hover:scale-125 transition-transform duration-500`}
            ></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-black text-muted uppercase tracking-widest">
                  {item.title}
                </p>
                <h3 className="text-4xl font-black text-ink mt-2">
                  {item.value}
                </h3>
              </div>
              <div
                className={`w-14 h-14 rounded-[1.25rem] bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0 shadow-inner border border-${item.color}-100/50 [@media(hover:hover)]:group-hover:scale-110 [@media(hover:hover)]:group-hover:-rotate-3 transition-all duration-300`}
              >
                {React.cloneElement(item.icon, { className: "text-2xl" })}
              </div>
            </div>
            <div
              className={`flex items-center text-xs font-black text-${item.color}-700 bg-${item.color}-50/60 w-max px-4 py-2 rounded-full border border-${item.color}-100`}
            >
              {item.title === "Total Reservasi" && pendingReservasi > 0 && (
                <FiAlertCircle className="mr-2" size={14} />
              )}
              <span>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TREN GRAFIK (FULL WIDTH) */}
      <div className="bg-white dark:bg-[#131E1A] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/60 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-green-50/30 -z-10 pointer-events-none"></div>
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Tren Aktivitas Keseluruhan
            </h2>
            <p className="text-sm text-muted font-medium mt-2">
              Perkembangan jumlah pendaftar santri dan reservasi berdasarkan
              periode.
            </p>
          </div>
          <div className="bg-green-50 text-[#16804B] dark:bg-green-500/15 dark:text-[#4ADE80] px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 border border-green-100 dark:border-green-500/30 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16804B]"></span>
            </span>
            Live Data
          </div>
        </div>
        <div className="w-full h-[360px] pb-4">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 15, right: 15, left: -25, bottom: 15 }}
              >
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: "#64748b", fontWeight: "bold" }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: "#64748b", fontWeight: "bold" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "1px solid rgba(15,23,42,0.08)",
                    boxShadow: "0 20px 40px -10px rgb(0 0 0 / 0.15)",
                    padding: "16px",
                    backgroundColor: "#ffffff",
                  }}
                  labelStyle={{
                    fontWeight: "900",
                    color: "#0f172a",
                    marginBottom: "12px",
                    fontSize: "16px",
                  }}
                  itemStyle={{
                    fontWeight: "800",
                    fontSize: "14px",
                    padding: "4px 0",
                  }}
                />
                <Area
                  type="monotone"
                  name="Pendaftar Santri"
                  dataKey="Pendaftar"
                  stroke="#3b82f6"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#colorPen)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  name="Reservasi Wisata"
                  dataKey="Reservasi"
                  stroke="#10b981"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#colorRes)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted bg-surface2 rounded-3xl border-2 border-dashed border-line">
              <FiActivity size={48} className="mb-4 opacity-30 text-muted" />
              <p className="font-extrabold text-muted text-lg">
                Belum Ada Data Tren
              </p>
              <p className="text-sm mt-2 text-center font-medium max-w-sm">
                Data chart akan muncul otomatis setelah ada pendaftar santri
                atau reservasi yang masuk.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-6 sm:p-8">
        {/* INSIGHT CERDAS */}
        <div className="bg-white dark:bg-[#131E1A] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/60">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 dark:to-amber-500/20 rounded-2xl shadow-inner border border-white">
              <FiZap className="text-orange-600 dark:text-orange-300 text-2xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Insight Cerdas
            </h2>
          </div>
          <p className="text-sm text-muted font-medium mb-8 pl-[4.5rem]">
            Ringkasan analisis otomatis dari data sistem terkini.
          </p>

          <div className="space-y-5">
            {/* Pendaftaran Insight */}
            <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-blue-50 dark:from-blue-500/20 to-indigo-50 border border-blue-100/50 shadow-sm relative overflow-hidden group [@media(hover:hover)]:hover:shadow-md transition-shadow">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-200/40 rounded-full transform translate-x-10 -translate-y-10 [@media(hover:hover)]:group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <FiUsers className="text-blue-600 dark:text-blue-300 w-5 h-5" />
                <h4 className="font-extrabold text-ink text-lg">
                  Gelombang Pendaftaran
                </h4>
              </div>
              <p className="text-[15px] font-medium text-ink relative z-10 leading-relaxed pl-8">
                {totalPendaftar > 0
                  ? `Sistem mencatat ada ${totalPendaftar} calon santri yang telah mendaftar. Terus pantau dan lakukan verifikasi data secara berkala.`
                  : "Belum ada calon santri yang mendaftar. Pastikan program pendaftaran publik sudah aktif."}
              </p>
            </div>

            {/* Reservasi Insight */}
            <div
              className={`p-6 rounded-[1.5rem] border shadow-sm relative overflow-hidden group [@media(hover:hover)]:hover:shadow-md transition-shadow ${pendingReservasi > 0 ? "bg-gradient-to-br from-orange-50 dark:from-orange-500/20 to-amber-50 border-orange-100/50" : "bg-gradient-to-br from-green-50 dark:from-green-500/20 to-emerald-50 border-green-100/50"}`}
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-current opacity-10 rounded-full transform translate-x-10 -translate-y-10 [@media(hover:hover)]:group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <FiClock
                  className={`${pendingReservasi > 0 ? "text-orange-600 dark:text-orange-300" : "text-green-600 dark:text-green-300"} w-5 h-5`}
                />
                <h4 className="font-extrabold text-ink text-lg">
                  Tindakan Reservasi
                </h4>
              </div>
              <p className="text-[15px] font-medium text-ink relative z-10 leading-relaxed pl-8">
                {pendingReservasi > 0
                  ? `Perhatian: Ada ${pendingReservasi} reservasi wisata yang masih menunggu konfirmasi Anda. Segera proses agar pelanggan tidak menunggu lama.`
                  : `Total ${totalReservasi} reservasi telah diproses. Tidak ada reservasi pending, semua antrian terkendali dengan baik.`}
              </p>
            </div>
          </div>
        </div>

        {/* STATUS RESERVASI */}
        <div className="bg-white dark:bg-[#131E1A] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/60 flex flex-col">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Distribusi Status Reservasi
            </h2>
            <p className="text-sm text-muted font-medium mt-2">
              Analisa visual penerimaan reservasi wisata & fasilitas.
            </p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:p-10 my-4">
            <div className="w-[200px] h-[200px] shrink-0 relative">
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
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.15)",
                        fontWeight: "800",
                        padding: "10px 16px",
                      }}
                      itemStyle={{ fontWeight: "900" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface2 rounded-full border-2 border-dashed border-line">
                  <FiPieChart size={32} className="text-muted mb-2" />
                </div>
              )}
            </div>

            <div className="space-y-4 w-full sm:w-auto flex-1">
              {statusData.length > 0 ? (
                statusData.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between bg-gray-50/80 dark:bg-surface2 p-4 rounded-2xl border border-line shadow-sm"
                  >
                    <div className="flex items-center">
                      <span
                        className="w-4 h-4 rounded-full mr-4 shadow-inner"
                        style={{ backgroundColor: s.color }}
                      ></span>
                      <span className="font-extrabold text-ink text-sm">
                        {s.name}
                      </span>
                    </div>
                    <span className="font-black text-ink bg-card px-4 py-1.5 rounded-xl shadow-sm border border-gray-100/50 dark:border-line">
                      {s.value}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted font-medium">
                  Grafik kosong. Belum ada data.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => handleTabChange("reservasi")}
            className="mt-6 w-full py-4 rounded-[1.25rem] bg-[#1a1a1a] [@media(hover:hover)]:hover:bg-[#16804B] text-white font-black text-sm transition-all duration-300 shadow-xl shadow-gray-900/20 [@media(hover:hover)]:hover:shadow-[#16804B]/30 flex items-center justify-center gap-3 group"
          >
            Kelola Reservasi Sekarang
            <FiArrowLeft className="rotate-180 [@media(hover:hover)]:group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* AGENDA & AKSI CEPAT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-6 sm:p-8">
        {/* Agenda Terdekat */}
        <div className="bg-white dark:bg-[#131E1A] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/60 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-ink tracking-tight">
                Agenda Terdekat
              </h2>
              <p className="text-sm text-muted font-medium mt-2">
                Jadwal event yang akan datang bulan ini.
              </p>
            </div>
            <button
              onClick={() => handleTabChange("event")}
              className="text-[#16804B] dark:text-[#4ADE80] [@media(hover:hover)]:hover:text-white [@media(hover:hover)]:hover:bg-[#16804B] text-sm font-black bg-green-50 dark:bg-green-500/15 px-5 py-2.5 rounded-xl transition-all shadow-sm border border-green-100 dark:border-green-500/30"
            >
              Lihat Semua
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-5">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center p-5 rounded-[1.5rem] border border-line [@media(hover:hover)]:hover:border-green-200 dark:border-green-500/30 [@media(hover:hover)]:hover:shadow-[0_12px_24px_rgba(22,128,75,0.08)] transition-all bg-card group cursor-pointer relative overflow-hidden"
                  onClick={() => handleTabChange("event")}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#16804B] opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity rounded-l-full"></div>
                  <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-b from-green-50 dark:from-green-500/20 to-emerald-100 dark:to-emerald-500/20 text-[#16804B] dark:text-[#4ADE80] flex flex-col items-center justify-center shrink-0 border border-green-200/50 [@media(hover:hover)]:group-hover:from-[#16804B] [@media(hover:hover)]:group-hover:to-emerald-700 [@media(hover:hover)]:group-hover:text-white transition-all duration-300 shadow-sm">
                    {(() => {
                      let monthStr =
                        ev.date.split(" ")[1] || ev.date.substring(0, 3);
                      let dayStr = ev.date.split(" ")[0] || "12";

                      if (
                        ev.date &&
                        ev.date.includes("-") &&
                        ev.date.split("-")[0].length === 4
                      ) {
                        const dateObj = new Date(ev.date);
                        if (!isNaN(dateObj)) {
                          const months = [
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
                          monthStr = months[dateObj.getMonth()];
                          dayStr = dateObj.getDate().toString();
                        }
                      }

                      return (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-wider mb-0.5">
                            {monthStr}
                          </span>
                          <span className="text-xl font-black leading-none">
                            {dayStr}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="ml-5 flex-1 overflow-hidden">
                    <h4 className="font-extrabold text-ink text-lg truncate [@media(hover:hover)]:group-hover:text-[#16804B] dark:text-[#4ADE80] transition-colors">
                      {ev.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-surface2 text-muted px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200/50">
                        {ev.category || "Event Publik"}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-muted [@media(hover:hover)]:group-hover:bg-green-50 dark:[@media(hover:hover)]:hover:bg-green-500/15 dark:bg-green-500/15 [@media(hover:hover)]:group-hover:text-[#16804B] dark:text-[#4ADE80] transition-colors shrink-0">
                    <FiArrowLeft className="rotate-180" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-10 bg-surface2 rounded-2xl sm:rounded-[2rem] border-2 border-dashed border-line">
                <div className="bg-card p-5 rounded-full shadow-sm mb-4">
                  <FiCalendar className="text-muted w-10 h-10" />
                </div>
                <p className="text-muted font-extrabold text-base">
                  Tidak ada event terdaftar.
                </p>
                <p className="text-sm text-muted font-medium mt-1">
                  Tambahkan event baru agar muncul di sini.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#131E1A] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white/60">
          <h2 className="text-3xl font-extrabold text-ink mb-2 tracking-tight">
            Aksi Cepat
          </h2>
          <p className="text-sm text-muted font-medium mb-10">
            Jalan pintas ke fitur-fitur yang paling sering Anda gunakan.
          </p>

          <div className="grid grid-cols-2 gap-5 lg:gap-6">
            {[
              {
                title: "Kelola Pendaftaran",
                icon: <FiUsers />,
                tab: "pendaftaran",
                color:
                  "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 [@media(hover:hover)]:hover:bg-blue-600 [@media(hover:hover)]:hover:text-white",
                border: "border-blue-100/60 shadow-blue-500/10",
              },
              {
                title: "Kelola Galeri",
                icon: <FiImage />,
                tab: "galeri-semua",
                color:
                  "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 [@media(hover:hover)]:hover:bg-emerald-600 [@media(hover:hover)]:hover:text-white",
                border: "border-emerald-100/60 shadow-emerald-500/10",
              },
              {
                title: "Tambah Event",
                icon: <FiCalendar />,
                tab: "event",
                color:
                  "bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 [@media(hover:hover)]:hover:bg-purple-600 [@media(hover:hover)]:hover:text-white",
                border: "border-purple-100/60 shadow-purple-500/10",
              },
              {
                title: "Kotak Pesan Masuk",
                icon: <FiMessageSquare />,
                tab: "appointment",
                color:
                  "bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-300 [@media(hover:hover)]:hover:bg-orange-600 [@media(hover:hover)]:hover:text-white",
                border: "border-orange-100/60 shadow-orange-500/10",
              },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleTabChange(action.tab)}
                className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] transition-all duration-300 border shadow-md [@media(hover:hover)]:hover:shadow-2xl group ${action.color} ${action.border}`}
              >
                <div className="transform [@media(hover:hover)]:group-hover:scale-125 [@media(hover:hover)]:group-hover:-translate-y-2 transition-all duration-300 drop-shadow-sm">
                  {React.cloneElement(action.icon, {
                    className: "w-10 h-10 mb-4",
                  })}
                </div>
                <span className="text-[15px] font-black tracking-tight text-center">
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
