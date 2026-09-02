import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiDroplet, FiSearch, FiCalendar, FiClock, FiActivity, FiImage } from "react-icons/fi";

const LogManager = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [selectedFoto, setSelectedFoto] = useState(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/log_perawatan`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchSearch = log.nama_santri?.toLowerCase().includes(search.toLowerCase()) || log.nama_tanaman?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Semua" ? true : log.jenis_tindakan === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[600px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <FiActivity size={24} />
            </div>
            Laporan Perawatan
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Monitoring aktivitas penyiraman dan pemupukan kebun.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Cari Petugas / Tanaman..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FiSearch className="absolute left-4 top-3.5 text-gray-400" size={18} />
          </div>
          <select 
            className="py-3 px-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none cursor-pointer font-medium text-gray-700"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Semua">Semua Tindakan</option>
            <option value="siram">Hanya Siram Air</option>
            <option value="pupuk">Hanya Beri Pupuk</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FiActivity className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-500">Tidak ada log perawatan</h3>
          <p className="text-gray-400 mt-2">Belum ada aktivitas yang dicatat atau sesuai dengan pencarian Anda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 uppercase text-[11px] tracking-widest border-b border-gray-200">
                <th className="px-6 py-5 font-bold">Waktu Tindakan</th>
                <th className="px-6 py-5 font-bold">Pelaksana (Perawat)</th>
                <th className="px-6 py-5 font-bold">Jenis Tindakan</th>
                <th className="px-6 py-5 font-bold">Pohon/Tanaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-green-50/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center text-gray-500 shadow-sm group-hover:border-green-300 group-hover:text-green-600 transition-colors">
                        <FiCalendar size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{new Date(log.waktu_tindakan).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-green-700 font-bold bg-green-50 border border-green-200 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                            <FiClock size={10} /> 
                            {new Date(log.waktu_tindakan).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }).replace('.', ':')} WIB
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      {log.nama_santri !== "Anonim / Pengunjung" && log.nama_santri !== "Pengunjung" && (
                        <span className="font-bold text-gray-900">{log.nama_santri}</span>
                      )}
                      <span className={`inline-flex items-center justify-center mt-1.5 px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider w-max shadow-sm border ${
                        log.role_perawat === 'Petani' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        log.role_perawat === 'Pengunjung' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {log.role_perawat || 'Santri'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.jenis_tindakan === "siram" ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                          <FiDroplet size={14} />
                        </div>
                        <span className="font-bold text-blue-700 text-sm">Menyiram Air</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                          <FiCheckCircle size={14} />
                        </div>
                        <span className="font-bold text-orange-700 text-sm">Memberi Pupuk</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-800 font-bold text-xs shadow-sm">
                      🌱 {log.nama_tanaman}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Foto (Image Viewer) */}
      {selectedFoto && (
        <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm transition-all" onClick={() => setSelectedFoto(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedFoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition z-50 p-2"
              title="Tutup (Esc)"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <img 
              src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedFoto.gambar}`} 
              alt="Bukti Perawatan" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl ring-4 ring-white/10"
            />
            <div className="mt-5 text-center">
              <span className="bg-green-600/90 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-xl backdrop-blur-md">
                Diunggah pada: {new Date(selectedFoto.waktu_tindakan).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogManager;
