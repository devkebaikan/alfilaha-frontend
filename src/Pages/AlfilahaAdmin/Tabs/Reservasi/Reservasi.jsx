import React from 'react';
import { FiCalendar, FiClock, FiCheck, FiSearch, FiFilter, FiMap, FiUsers, FiX, FiTrash2 } from 'react-icons/fi';

const Reservasi = ({ 
  reservasi, 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus, 
  updateStatusReservasi, 
  setRejectModal, 
  setDeleteModal 
}) => {
  return (
    <div className="space-y-6">
      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 shadow-lg border border-blue-400 flex items-center space-x-5 text-white relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white opacity-10 rounded-full mix-blend-overlay"></div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/20 shadow-inner">
            <FiCalendar className="text-2xl" />
          </div>
          <div className="z-10">
            <p className="text-sm text-blue-100 font-semibold tracking-wide mb-0.5">Total Reservasi Hari Ini</p>
            <p className="text-3xl font-extrabold">{reservasi.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-6 shadow-lg border border-orange-300 flex items-center space-x-5 text-white relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white opacity-10 rounded-full mix-blend-overlay"></div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/20 shadow-inner">
            <FiClock className="text-2xl" />
          </div>
          <div className="z-10">
            <p className="text-sm text-orange-100 font-semibold tracking-wide mb-0.5">Menunggu Konfirmasi</p>
            <p className="text-3xl font-extrabold">{reservasi.filter(r => r.status === 'Pending').length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 shadow-lg border border-emerald-400 flex items-center space-x-5 text-white relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white opacity-10 rounded-full mix-blend-overlay"></div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/20 shadow-inner">
            <FiCheck className="text-2xl" />
          </div>
          <div className="z-10">
            <p className="text-sm text-emerald-100 font-semibold tracking-wide mb-0.5">Selesai</p>
            <p className="text-3xl font-extrabold">{reservasi.filter(r => r.status === 'Diterima').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-white to-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Form Pesan Tempat</h2>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">Kelola daftar pelanggan yang telah melakukan reservasi dari website.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative shrink-0">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari nama / kontak..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none w-full sm:w-60"
              />
            </div>
            <div className="relative shrink-0">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer w-full sm:w-auto"
              >
                <option value="Semua">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Diterima">Diterima</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
            </div>
            <div className="bg-green-50 text-green-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-green-100 shadow-sm flex items-center justify-center space-x-2 shrink-0">
              <FiCalendar className="w-5 h-5" />
              <span>{reservasi.length} Reservasi</span>
            </div>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm">
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Pemesan</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Waktu Kunjungan</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Paket & Peserta</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(() => {
                const filtered = reservasi.filter((item) => {
                  const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        item.whatsapp.includes(searchQuery);
                  const matchesFilter = filterStatus === 'Semua' || item.status === filterStatus;
                  return matchesSearch && matchesFilter;
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                          <FiSearch className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Belum ada reservasi</h3>
                        <p className="text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter status Anda.</p>
                      </td>
                    </tr>
                  );
                }

                return filtered.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer">
                    <td className="px-6 py-5">
                      <div className="font-extrabold text-gray-900 text-base">{item.nama}</div>
                      <div className="text-xs text-gray-500 mt-1 font-medium">{item.whatsapp}</div>
                      {item.instansi && <div className="text-[10px] uppercase font-bold tracking-wider text-green-700 bg-green-50 inline-block px-2 py-1 rounded-md mt-2.5 border border-green-100">{item.instansi}</div>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-gray-800 font-bold text-sm">
                        <FiCalendar className="mr-2 text-green-500" />
                        {item.tanggal.split(' ')[0]}
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5 font-medium ml-6">
                        Jam: {item.tanggal.split(' ')[1] || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-gray-800 font-bold text-sm">
                        <FiMap className="mr-2 text-blue-500" />
                        {item.jumlah.split(' - ')[1] || item.jumlah}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1.5 font-medium ml-6">
                        <FiUsers className="mr-1.5 text-gray-400" />
                        {item.jumlah.split(' - ')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm ${item.status === 'Pending' ? 'bg-orange-100 text-orange-600 border border-orange-200' : item.status === 'Diterima' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      {item.status === 'Pending' && (
                        <>
                          <button className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-xl font-bold text-xs transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5" onClick={() => updateStatusReservasi(item.id, 'Diterima')} title="Konfirmasi Pesanan">
                            <FiCheck className="inline-block w-4 h-4" />
                          </button>
                          <button className="text-orange-500 bg-orange-50 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-xl font-bold text-xs transition border border-orange-100 hover:border-orange-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" onClick={() => setRejectModal({ show: true, id: item.id, nama: item.nama })} title="Tolak Reservasi">
                            <FiX className="inline-block w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2 rounded-xl transition shadow-sm border border-red-50 hover:border-red-500 transform hover:-translate-y-0.5" title="Hapus" onClick={() => setDeleteModal({ show: true, id: item.id, nama: item.nama })}>
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reservasi;
