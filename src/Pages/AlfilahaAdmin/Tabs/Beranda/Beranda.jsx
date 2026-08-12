import React from 'react';
import { FiCheck, FiClock, FiFileText, FiCalendar, FiX } from 'react-icons/fi';

const Beranda = ({ reservasi, blogs, events, handleTabChange }) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* OVERVIEW STATS (KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <FiCheck className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold">Total Reservasi</p>
            <p className="text-2xl font-extrabold text-gray-800">{reservasi.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition relative overflow-hidden">
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0">
            <FiClock className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold">Menunggu Konfirmasi</p>
            <p className="text-2xl font-extrabold text-gray-800">{reservasi.filter(r => r.status === 'Pending').length}</p>
          </div>
          {reservasi.filter(r => r.status === 'Pending').length > 0 && (
            <div className="absolute top-0 right-0 w-2 h-full bg-orange-500"></div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <FiFileText className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold">Total Artikel Blog</p>
            <p className="text-2xl font-extrabold text-gray-800">{blogs.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <FiCalendar className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold">Total Event Aktif</p>
            <p className="text-2xl font-extrabold text-gray-800">{events.length}</p>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Reservasi Terbaru</h2>
            <p className="text-sm text-gray-500 mt-1">5 aktivitas pemesanan terakhir yang masuk ke sistem.</p>
          </div>
          <button onClick={() => handleTabChange('reservasi')} className="text-green-600 font-bold text-sm hover:text-green-700 bg-green-50 px-4 py-2 rounded-xl transition">
            Lihat Semua
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm">
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Nama & Kontak</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Instansi</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider">Tanggal & Jumlah</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reservasi.slice(0, 5).map((item) => (
                <tr key={`recent-${item.id}`} className="hover:bg-slate-50 transition">
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-800 text-lg">{item.nama}</div>
                    <div className="text-sm text-gray-500 font-medium">{item.whatsapp}</div>
                  </td>
                  <td className="px-8 py-6 text-gray-600 font-medium">{item.instansi || '-'}</td>
                  <td className="px-8 py-6">
                    <div className="text-gray-800 font-bold">{item.tanggal}</div>
                    <div className="text-sm text-gray-500 font-medium">{item.jumlah}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      item.status === 'Diterima' ? 'bg-green-50 text-green-700 border-green-200' : 
                      item.status === 'Ditolak' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {item.status === 'Pending' && <FiClock className="mr-1.5" />}
                      {item.status === 'Diterima' && <FiCheck className="mr-1.5" />}
                      {item.status === 'Ditolak' && <FiX className="mr-1.5" />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {reservasi.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-gray-500 font-bold">
                    Belum ada data reservasi masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Beranda;
