import React, { useState, useMemo } from 'react';
import { 
  FiCheck, FiClock, FiCalendar, FiFileText, FiMessageSquare, 
  FiActivity, FiTrendingUp, FiAlertCircle, FiImage, FiPieChart, FiZap, FiArrowLeft
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
  'Diterima': '#10b981',
  'Pending': '#f59e0b',
  'Ditolak': '#ef4444'
};

const Beranda = ({ reservasi = [], blogs = [], events = [], appointments = [], handleTabChange }) => {
  const [period, setPeriod] = useState('30 Hari');

  // KPI Calculations
  const totalReservasi = reservasi.length;
  const pendingReservasi = reservasi.filter(r => r.status === 'Pending').length;
  const totalPesan = appointments.length;
  
  // Format Tanggal Hari Ini
  const today = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // DATA: Trend Reservasi
  const trendData = useMemo(() => {
    const counts = {};
    reservasi.forEach(r => {
      if (r.tanggal) {
        const datePart = r.tanggal.split(' ')[0]; // YYYY-MM-DD
        counts[datePart] = (counts[datePart] || 0) + 1;
      }
    });
    
    const sortedDates = Object.keys(counts).sort();
    const recentDates = sortedDates.slice(-7);
    
    if (recentDates.length === 0) return [];
    
    return recentDates.map(date => {
      const d = new Date(date);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      return {
        date,
        name: dayName,
        Reservasi: counts[date]
      };
    });
  }, [reservasi]);

  // DATA: Status Reservasi
  const statusData = useMemo(() => {
    const diterima = reservasi.filter(r => r.status === 'Diterima').length;
    const pending = reservasi.filter(r => r.status === 'Pending').length;
    const ditolak = reservasi.filter(r => r.status === 'Ditolak').length;
    return [
      { name: 'Diterima', value: diterima, color: STATUS_COLORS['Diterima'] },
      { name: 'Pending', value: pending, color: STATUS_COLORS['Pending'] },
      { name: 'Ditolak', value: ditolak, color: STATUS_COLORS['Ditolak'] },
    ].filter(item => item.value > 0);
  }, [reservasi]);

  // DATA: Aktivitas Terbaru
  const recentActivities = useMemo(() => {
    let activities = [];
    reservasi.slice(0, 3).forEach(r => {
      activities.push({
        id: `res-${r.id}`,
        title: `Reservasi ${r.status === 'Pending' ? 'baru' : 'diperbarui'} dari ${r.nama}`,
        time: r.tanggal || 'Baru saja',
        type: 'reservasi',
      });
    });
    appointments.slice(0, 2).forEach(a => {
      activities.push({
        id: `app-${a.id}`,
        title: `Pesan baru dari ${a.name}`,
        time: a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID') : 'Baru saja',
        type: 'pesan',
      });
    });
    return activities.slice(0, 5);
  }, [reservasi, appointments]);

  // DATA: Agenda Terdekat
  const upcomingEvents = useMemo(() => {
    return [...events].slice(0, 3);
  }, [events]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-12 px-2 sm:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            Ringkasan aktivitas dan performa Alfilaha. 
            <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{today}</span>
          </p>
        </div>
        <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50 shadow-inner">
          {['7 Hari', '30 Hari', '3 Bulan'].map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                period === p 
                ? 'bg-white text-green-700 shadow-[0_2px_10px_rgba(0,0,0,0.05)] ring-1 ring-gray-900/5' 
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Primary Dark Card */}
        <div className="bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 rounded-[2rem] p-7 shadow-[0_15px_35px_rgba(16,185,129,0.2)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-bold text-green-100/80 uppercase tracking-wider">Total Reservasi</p>
              <h3 className="text-4xl font-black text-white mt-2 drop-shadow-md">{totalReservasi}</h3>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 shadow-inner border border-white/10">
              <FiCheck className="text-2xl" />
            </div>
          </div>
          <div className="relative z-10 flex items-center text-sm font-bold text-green-50 bg-black/10 w-max px-3 py-1.5 rounded-full backdrop-blur-md">
            <FiTrendingUp className="mr-1.5" /> <span>Performa Stabil</span>
          </div>
        </div>

        {/* Glass Cards */}
        {[
          { title: 'Menunggu Konfirmasi', value: pendingReservasi, icon: <FiClock />, color: 'orange', action: () => handleTabChange('reservasi'), desc: pendingReservasi > 0 ? 'Perlu tindakan →' : 'Semua terselesaikan' },
          { title: 'Event Aktif', value: events.length, icon: <FiCalendar />, color: 'purple', action: () => handleTabChange('event'), desc: 'Lihat semua event →' },
          { title: 'Pesan Masuk', value: totalPesan, icon: <FiMessageSquare />, color: 'blue', action: () => handleTabChange('appointment'), desc: 'Cek kotak masuk →' }
        ].map((item, idx) => (
          <div key={idx} onClick={item.action} className={`bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_15px_35px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{item.title}</p>
                <h3 className="text-4xl font-black text-gray-900 mt-2">{item.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 group-hover:bg-${item.color}-100`}>
                {React.cloneElement(item.icon, { className: 'text-2xl' })}
              </div>
            </div>
            <div className={`flex items-center text-sm font-bold text-${item.color}-600 bg-${item.color}-50/50 w-max px-3 py-1.5 rounded-full`}>
              {item.title === 'Menunggu Konfirmasi' && <FiAlertCircle className="mr-1.5" />}
              <span>{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TREN RESERVASI (FULL WIDTH) */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 lg:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Tren Reservasi</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Perkembangan jumlah reservasi berdasarkan periode.</p>
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-100">
            <FiActivity /> Live Data
          </div>
        </div>
        <div className="w-full h-[320px]">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 'bold' }} allowDecimals={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  labelStyle={{ fontWeight: '900', color: '#1e293b', marginBottom: '8px', fontSize: '15px' }}
                  itemStyle={{ fontWeight: 'bold', color: '#10b981' }}
                />
                <Area type="monotone" dataKey="Reservasi" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorRes)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <FiActivity size={36} className="mb-4 opacity-40 text-gray-400" />
              <p className="font-extrabold text-gray-500">Belum Ada Data Tren</p>
              <p className="text-sm mt-1 text-center font-medium max-w-xs">Data chart akan muncul otomatis setelah ada reservasi yang masuk.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* INSIGHT CERDAS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 lg:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl">
              <FiZap className="text-orange-600 text-xl" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Insight Cerdas</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-8 pl-14">Ringkasan otomatis dari data terkini sistem.</p>
          
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/50 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-green-200/40 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform"></div>
              <h4 className="font-extrabold text-gray-800 text-base mb-1.5 relative z-10">Tinjauan Reservasi</h4>
              <p className="text-sm font-medium text-gray-600 relative z-10 leading-relaxed">
                {totalReservasi > 0 ? `Terdapat total ${totalReservasi} reservasi tercatat di sistem saat ini. Performa stabil dan berjalan baik.` : 'Sistem sedang menunggu reservasi pertama. Tetap pantau!'}
              </p>
            </div>
            <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden group ${pendingReservasi > 0 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100/50' : 'bg-gray-50 border-gray-100'}`}>
              <div className="absolute right-0 top-0 w-24 h-24 bg-orange-200/40 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform"></div>
              <h4 className="font-extrabold text-gray-800 text-base mb-1.5 relative z-10">Status Prioritas</h4>
              <p className="text-sm font-medium text-gray-600 relative z-10 leading-relaxed">
                {pendingReservasi > 0 ? `Ada ${pendingReservasi} reservasi yang masih berstatus menunggu konfirmasi. Segera tindaklanjuti untuk pengalaman pengguna yang baik.` : 'Tidak ada reservasi pending. Semua antrian sudah ditangani dengan cepat.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-200/40 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform"></div>
              <h4 className="font-extrabold text-gray-800 text-base mb-1.5 relative z-10">Interaksi Publik</h4>
              <p className="text-sm font-medium text-gray-600 relative z-10 leading-relaxed">
                {totalPesan > 0 ? `Telah masuk ${totalPesan} pesan pertanyaan/kontak melalui website. Pastikan untuk merespon pertanyaan klien tepat waktu.` : 'Belum ada pesan kontak masuk dari form website.'}
              </p>
            </div>
          </div>
        </div>

        {/* STATUS RESERVASI */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 lg:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-gray-900">Distribusi Status</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Rasio konfirmasi tiket masuk.</p>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
            <div className="w-[180px] h-[180px] shrink-0 relative">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-full border-2 border-dashed border-gray-200">
                  <FiPieChart size={28} className="text-gray-300 mb-1" />
                </div>
              )}
            </div>
            
            <div className="space-y-4 w-full sm:w-auto flex-1">
              {statusData.length > 0 ? statusData.map(s => (
                <div key={s.name} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                  <div className="flex items-center">
                    <span className="w-3.5 h-3.5 rounded-full mr-3 shadow-inner" style={{ backgroundColor: s.color }}></span>
                    <span className="font-bold text-gray-600 text-sm">{s.name}</span>
                  </div>
                  <span className="font-black text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">{s.value}</span>
                </div>
              )) : <p className="text-center text-sm text-gray-400 font-medium">Grafik kosong.</p>}
            </div>
          </div>
          
          <button onClick={() => handleTabChange('reservasi')} className="mt-4 w-full py-3.5 rounded-xl bg-gray-900 hover:bg-green-700 text-white font-bold text-sm transition-colors shadow-lg shadow-gray-900/20 hover:shadow-green-700/30 flex items-center justify-center gap-2">
            Kelola Reservasi Sekarang <FiArrowLeft className="rotate-180" />
          </button>
        </div>
      </div>

      {/* AGENDA & AKSI CEPAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Agenda Terdekat */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 lg:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Agenda Terdekat</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Jadwal event yang akan datang.</p>
            </div>
            <button onClick={() => handleTabChange('event')} className="text-green-600 hover:text-white hover:bg-green-600 text-sm font-bold bg-green-50 px-4 py-2 rounded-xl transition-all shadow-sm">Lihat Semua</button>
          </div>
          
          <div className="flex-1 flex flex-col gap-5">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-center p-5 rounded-[1.5rem] border border-gray-100 hover:border-green-200 hover:shadow-[0_8px_20px_rgba(16,185,129,0.08)] transition-all bg-white group cursor-pointer relative overflow-hidden" onClick={() => handleTabChange('event')}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-green-50 to-emerald-100 text-green-700 flex flex-col items-center justify-center shrink-0 border border-green-200/50 group-hover:from-green-600 group-hover:to-emerald-700 group-hover:text-white transition-all duration-300 shadow-sm">
                    {(() => {
                      let monthStr = ev.date.split(' ')[1] || ev.date.substring(0,3);
                      let dayStr = ev.date.split(' ')[0] || '12';
                      
                      if (ev.date && ev.date.includes('-') && ev.date.split('-')[0].length === 4) {
                        const dateObj = new Date(ev.date);
                        if (!isNaN(dateObj)) {
                          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                          monthStr = months[dateObj.getMonth()];
                          dayStr = dateObj.getDate().toString();
                        }
                      }
                      
                      return (
                        <>
                          <span className="text-[10px] font-black uppercase tracking-wider mb-0.5">{monthStr}</span>
                          <span className="text-xl font-black leading-none">{dayStr}</span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="ml-5 flex-1 overflow-hidden">
                    <h4 className="font-extrabold text-gray-900 text-base lg:text-lg truncate group-hover:text-green-700 transition-colors">{ev.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">{ev.category || 'Event'}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                    <FiArrowLeft className="rotate-180" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-[1.5rem] border-2 border-dashed border-gray-100">
                <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                  <FiCalendar className="text-gray-300 w-8 h-8" />
                </div>
                <p className="text-gray-500 font-bold text-sm">Belum ada agenda mendatang terdaftar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 lg:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">⚡ Aksi Cepat</h2>
          <p className="text-sm text-gray-500 font-medium mb-8">Pintasan ke fitur utama sistem manajemen.</p>
          
          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            {[
              { title: 'Tulis Artikel', icon: <FiFileText />, tab: 'blog-form', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white', border: 'border-emerald-100' },
              { title: 'Kelola Galeri', icon: <FiImage />, tab: 'galeri-semua', color: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white', border: 'border-blue-100' },
              { title: 'Tambah Event', icon: <FiCalendar />, tab: 'event', color: 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white', border: 'border-purple-100' },
              { title: 'Lihat Pesan', icon: <FiMessageSquare />, tab: 'appointment', color: 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white', border: 'border-orange-100' },
            ].map((action, idx) => (
              <button 
                key={idx} 
                onClick={() => handleTabChange(action.tab)} 
                className={`flex flex-col items-center justify-center p-6 lg:p-8 rounded-[1.5rem] transition-all duration-300 border shadow-sm hover:shadow-xl group ${action.color} ${action.border}`}
              >
                <div className="transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  {React.cloneElement(action.icon, { className: 'w-10 h-10 mb-4' })}
                </div>
                <span className="text-sm lg:text-base font-extrabold">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Beranda;
