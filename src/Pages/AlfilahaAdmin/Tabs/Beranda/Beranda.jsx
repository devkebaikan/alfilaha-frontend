import React, { useState, useMemo } from 'react';
import { 
  FiCheck, FiClock, FiCalendar, FiFileText, FiMessageSquare, 
  FiActivity, FiTrendingUp, FiAlertCircle, FiImage, FiPieChart, FiZap 
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
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Ringkasan aktivitas dan performa Alfllaha. <span className="text-gray-400">({today})</span></p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {['7 Hari', '30 Hari', '3 Bulan'].map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                period === p ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-500">Total Reservasi</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalReservasi}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <FiCheck className="text-xl" />
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-green-600">
            <FiTrendingUp className="mr-1.5" /> <span>Update terkini</span>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer hover:border-orange-200" onClick={() => handleTabChange('reservasi')}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-500">Menunggu Konfirmasi</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{pendingReservasi}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <FiClock className="text-xl" />
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-orange-600">
            <FiAlertCircle className="mr-1.5" /> <span>{pendingReservasi > 0 ? 'Perlu tindakan →' : 'Semua terselesaikan'}</span>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer hover:border-purple-200" onClick={() => handleTabChange('event')}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-500">Event Aktif</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{events.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FiCalendar className="text-xl" />
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-purple-600">
             <span>Lihat semua event →</span>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer hover:border-blue-200" onClick={() => handleTabChange('appointment')}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-500">Pesan Masuk</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalPesan}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FiMessageSquare className="text-xl" />
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-blue-600">
             <span>Cek kotak masuk →</span>
          </div>
        </div>
      </div>

      {/* TREN RESERVASI (FULL WIDTH) */}
      <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Tren Reservasi</h2>
          <p className="text-sm text-gray-500 font-medium">Perkembangan jumlah reservasi berdasarkan periode.</p>
        </div>
        <div className="w-full h-[300px] mt-2">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="Reservasi" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorRes)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
              <FiActivity size={32} className="mb-3 opacity-50" />
              <p className="font-bold">Belum Ada Data Tren</p>
              <p className="text-xs mt-1 text-center">Data reservasi akan muncul setelah ada pemesanan.</p>
            </div>
          )}
        </div>
      </div>

      {/* PAKET TERPOPULER & STATUS RESERVASI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Paket Terpopuler */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-gray-900">📊 Paket Terpopuler</h2>
            <p className="text-sm text-gray-500 font-medium">Paket/program berdasarkan jumlah reservasi.</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="w-14 h-14 bg-white shadow-sm text-gray-300 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle size={24} />
            </div>
            <h3 className="font-bold text-gray-700 mb-1">Data belum tersedia</h3>
            <p className="text-sm text-gray-500 max-w-xs">Statistik ini membutuhkan pencatatan kategori paket yang belum direkam dalam database form reservasi Anda.</p>
          </div>
        </div>

        {/* Status Reservasi */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="mb-2">
            <h2 className="text-xl font-extrabold text-gray-900">📋 Status Reservasi</h2>
            <p className="text-sm text-gray-500 font-medium">Distribusi konfirmasi tiket.</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[160px] my-2">
            {statusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300">
                <FiPieChart size={32} className="mb-2" />
                <p className="font-bold text-sm">Tidak Ada Data</p>
              </div>
            )}
          </div>
          <div className="space-y-3 mt-2">
            {statusData.length > 0 ? statusData.map(s => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: s.color }}></span>
                  <span className="font-bold text-gray-600">{s.name}</span>
                </div>
                <span className="font-extrabold text-gray-900">{s.value}</span>
              </div>
            )) : <p className="text-center text-sm text-gray-500">Data kosong.</p>}
          </div>
          <button onClick={() => handleTabChange('reservasi')} className="mt-6 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 font-bold text-sm transition-colors border border-gray-100">
            Lihat Reservasi →
          </button>
        </div>
      </div>

      {/* INSIGHT & AGENDA TERDEKAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Insight */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1 flex items-center gap-2"><FiZap className="text-orange-500" /> Insight</h2>
          <p className="text-sm text-gray-500 font-medium mb-6">Ringkasan cerdas dari data terkini.</p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
              <h4 className="font-bold text-gray-800 text-sm mb-1">Tinjauan Reservasi</h4>
              <p className="text-sm text-gray-600">{totalReservasi > 0 ? `Terdapat total ${totalReservasi} reservasi tercatat di sistem saat ini.` : 'Sistem sedang menunggu reservasi pertama.'}</p>
            </div>
            <div className={`p-4 rounded-xl border ${pendingReservasi > 0 ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
              <h4 className="font-bold text-gray-800 text-sm mb-1">Perlu Perhatian</h4>
              <p className="text-sm text-gray-600">{pendingReservasi > 0 ? `Ada ${pendingReservasi} reservasi yang masih berstatus menunggu konfirmasi.` : 'Tidak ada reservasi pending. Semua sudah ditangani.'}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <h4 className="font-bold text-gray-800 text-sm mb-1">Interaksi Pengunjung</h4>
              <p className="text-sm text-gray-600">{totalPesan > 0 ? `Telah masuk ${totalPesan} pesan pertanyaan melalui website.` : 'Belum ada pesan masuk dari website.'}</p>
            </div>
          </div>
        </div>

        {/* Agenda Terdekat */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">📅 Agenda Terdekat</h2>
              <p className="text-sm text-gray-500 font-medium">Event yang akan datang.</p>
            </div>
            <button onClick={() => handleTabChange('event')} className="text-green-600 hover:text-green-700 text-sm font-bold bg-green-50 px-3 py-1.5 rounded-lg transition-colors">Semua →</button>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-center p-4 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all bg-white group cursor-pointer" onClick={() => handleTabChange('event')}>
                  <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex flex-col items-center justify-center shrink-0 border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors">
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
                          <span className="text-xs font-bold uppercase">{monthStr}</span>
                          <span className="text-lg font-black leading-none mt-0.5">{dayStr}</span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="ml-4 flex-1 overflow-hidden">
                    <h4 className="font-bold text-gray-800 text-base truncate group-hover:text-green-700 transition-colors">{ev.title}</h4>
                    <p className="text-xs font-medium text-gray-500 mt-1">{ev.category || 'Event Alfllaha'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                <FiCalendar className="text-gray-300 w-10 h-10 mb-2" />
                <p className="text-gray-500 font-bold text-sm">Belum ada agenda mendatang.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AKTIVITAS TERBARU & AKSI CEPAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">🕘 Aktivitas Terbaru</h2>
          <p className="text-sm text-gray-500 font-medium mb-6">Log notifikasi terkini dari sistem.</p>
          <div className="relative border-l-2 border-gray-100 ml-4 space-y-6 pb-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((act, i) => (
                <div key={`${act.id}-${i}`} className="relative pl-6 group">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${act.type === 'reservasi' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <h4 className="text-sm font-bold text-gray-800">{act.title}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-gray-400">{act.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm pl-6 font-medium">Belum ada aktivitas terbaru.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">⚡ Aksi Cepat</h2>
          <p className="text-sm text-gray-500 font-medium mb-6">Navigasi instan ke manajemen sistem.</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleTabChange('event')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-colors border border-gray-100 hover:border-green-200 shadow-sm">
              <FiCalendar className="w-8 h-8 mb-3" />
              <span className="text-sm font-extrabold">Tambah Event</span>
            </button>
            <button onClick={() => handleTabChange('blog-form')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-colors border border-gray-100 hover:border-green-200 shadow-sm">
              <FiFileText className="w-8 h-8 mb-3" />
              <span className="text-sm font-extrabold">Tulis Artikel</span>
            </button>
            <button onClick={() => handleTabChange('galeri-semua')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-colors border border-gray-100 hover:border-green-200 shadow-sm">
              <FiImage className="w-8 h-8 mb-3" />
              <span className="text-sm font-extrabold">Kelola Galeri</span>
            </button>
            <button onClick={() => handleTabChange('appointment')} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-colors border border-gray-100 hover:border-green-200 shadow-sm">
              <FiMessageSquare className="w-8 h-8 mb-3" />
              <span className="text-sm font-extrabold">Lihat Pesan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Beranda;
