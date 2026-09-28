import { useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiSearch,
  FiFilter,
  FiMap,
  FiUsers,
  FiX,
  FiTrash2,
} from "react-icons/fi";

const Reservasi = ({
  reservasi,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  updateStatusReservasi,
  setRejectModal,
  setDeleteModal,
}) => {
  const [selectedReservasi, setSelectedReservasi] = useState(null);

  return (
    <div className="space-y-6">
      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 shadow-lg border border-blue-400 flex items-center space-x-5 text-white relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-card opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-card opacity-10 rounded-full mix-blend-overlay"></div>
          <div className="w-14 h-14 bg-white/20 dark:bg-white/[0.06] backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/20 shadow-inner">
            <FiCalendar className="text-2xl" />
          </div>
          <div className="z-10">
            <p className="text-sm text-blue-100 font-semibold tracking-wide mb-0.5">
              Total Reservasi Hari Ini
            </p>
            <p className="text-3xl font-extrabold">{reservasi.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-6 shadow-lg border border-orange-300 dark:border-orange-500/40 flex items-center space-x-5 text-white relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-card opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-card opacity-10 rounded-full mix-blend-overlay"></div>
          <div className="w-14 h-14 bg-white/20 dark:bg-white/[0.06] backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/20 shadow-inner">
            <FiClock className="text-2xl" />
          </div>
          <div className="z-10">
            <p className="text-sm text-orange-100 font-semibold tracking-wide mb-0.5">
              Menunggu Konfirmasi
            </p>
            <p className="text-3xl font-extrabold">
              {reservasi.filter((r) => r.status === "Pending").length}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 shadow-lg border border-emerald-400 flex items-center space-x-5 text-white relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-card opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-card opacity-10 rounded-full mix-blend-overlay"></div>
          <div className="w-14 h-14 bg-white/20 dark:bg-white/[0.06] backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/20 shadow-inner">
            <FiCheck className="text-2xl" />
          </div>
          <div className="z-10">
            <p className="text-sm text-emerald-100 font-semibold tracking-wide mb-0.5">
              Selesai
            </p>
            <p className="text-3xl font-extrabold">
              {reservasi.filter((r) => r.status === "Diterima").length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
        <div className="p-5 sm:p-8 border-b border-line bg-gradient-to-r from-card to-surface2 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">
              Form Pesan Tempat
            </h2>
            <p className="text-sm text-muted mt-1.5 font-medium">
              Kelola daftar pelanggan yang telah melakukan reservasi dari
              website.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative shrink-0">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari nama / kontak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-card border border-line rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none w-full sm:w-60"
              />
            </div>
            <div className="relative shrink-0">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-11 pr-10 py-2.5 bg-card border border-line rounded-xl text-sm font-bold text-ink focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer w-full sm:w-auto"
              >
                <option value="Semua">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Diterima">Diterima</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">
                ▼
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300 px-5 py-2.5 rounded-xl text-sm font-bold border border-green-100 dark:border-green-500/30 shadow-sm flex items-center justify-center space-x-2 shrink-0">
              <FiCalendar className="w-5 h-5" />
              <span>{reservasi.length} Reservasi</span>
            </div>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface2 border-b border-line text-muted text-sm">
                <th className="px-6 py-5 font-bold uppercase tracking-wider">
                  Pemesan
                </th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">
                  Waktu Kunjungan
                </th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">
                  Paket & Peserta
                </th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(() => {
                const filtered = reservasi.filter((item) => {
                  const matchesSearch =
                    item.nama
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    item.whatsapp.includes(searchQuery);
                  const matchesFilter =
                    filterStatus === "Semua" || item.status === filterStatus;
                  return matchesSearch && matchesFilter;
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-surface2 rounded-full mb-4">
                          <FiSearch className="w-8 h-8 text-muted" />
                        </div>
                        <h3 className="text-lg font-bold text-ink">
                          Belum ada reservasi
                        </h3>
                        <p className="text-muted mt-1">
                          Coba sesuaikan kata kunci pencarian atau filter status
                          Anda.
                        </p>
                      </td>
                    </tr>
                  );
                }

                return filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedReservasi(item)}
                    className="odd:bg-card even:bg-surface2 hover:!bg-[#F1F6F3] dark:hover:!bg-white/[0.035] dark:bg-green-500/10 hover:shadow-md dark:hover:shadow-none transition-all duration-300 group border-l-4 border-transparent hover:!border-[#16804B] dark:hover:!border-green-600 cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="font-extrabold text-ink text-base">
                        {item.nama}
                      </div>
                      <div className="text-xs text-muted mt-1 font-medium">
                        {item.whatsapp}
                      </div>
                      {item.instansi && (
                        <div className="text-[10px] uppercase font-bold tracking-wider text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-500/15 inline-block px-2 py-1 rounded-md mt-2.5 border border-green-100 dark:border-green-500/30">
                          {item.instansi}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-ink font-bold text-sm">
                        <FiCalendar className="mr-2 text-green-500" />
                        {item.tanggal.split(" ")[0]}
                      </div>
                      <div className="text-xs text-muted mt-1.5 font-medium ml-6">
                        Jam: {item.tanggal.split(" ")[1] || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-ink font-bold text-sm">
                        <FiMap className="mr-2 text-blue-500" />
                        {item.jumlah.split(" - ")[1] || item.jumlah}
                      </div>
                      <div className="flex items-center text-xs text-muted mt-1.5 font-medium ml-6">
                        <FiUsers className="mr-1.5 text-muted" />
                        {item.jumlah.split(" - ")[0]}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm ${item.status === "Pending" ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30" : item.status === "Diterima" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td
                      className="px-6 py-5 text-right space-x-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.status === "Pending" && (
                        <>
                          <button
                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-xl font-bold text-xs transition duration-300 shadow-sm hover:shadow-sm transform hover:-translate-y-0.5"
                            onClick={() =>
                              updateStatusReservasi(item.id, "Diterima")
                            }
                            title="Konfirmasi Pesanan"
                          >
                            <FiCheck className="inline-block w-4 h-4" />
                          </button>
                          <button
                            className="text-orange-500 bg-orange-50 dark:bg-orange-500/15 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600/80 px-3 py-2 rounded-xl font-bold text-xs transition duration-300 border border-orange-100 dark:border-orange-500/30 hover:border-orange-600 dark:hover:border-orange-600/60 shadow-sm hover:shadow-sm dark:hover:shadow-none transform hover:-translate-y-0.5"
                            onClick={() =>
                              setRejectModal({
                                show: true,
                                id: item.id,
                                nama: item.nama,
                              })
                            }
                            title="Tolak Reservasi"
                          >
                            <FiX className="inline-block w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        className="text-red-500 hover:text-white hover:bg-red-600 dark:hover:bg-red-600/80 bg-red-50 dark:bg-red-500/15 p-2 rounded-xl transition duration-300 shadow-sm border border-red-50 dark:border-red-500/30 hover:border-red-600 dark:hover:border-red-600/60 transform hover:-translate-y-0.5"
                        title="Hapus"
                        onClick={() =>
                          setDeleteModal({
                            show: true,
                            id: item.id,
                            nama: item.nama,
                          })
                        }
                      >
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

      {/* MODAL DETAIL RESERVASI */}
      {selectedReservasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedReservasi(null)}
          ></div>

          <div className="bg-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-fade-in-up">
            <div className="px-8 py-6 border-b border-line flex justify-between items-center bg-card relative overflow-hidden">
              <div className="absolute right-0 top-0 w-40 h-40 bg-[#DCFCE7] dark:bg-[#12331F] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-ink tracking-tight">
                  Detail Reservasi
                </h3>
                <p className="text-sm text-muted font-medium mt-1">
                  Informasi lengkap pesanan pelanggan.
                </p>
              </div>
              <button
                onClick={() => setSelectedReservasi(null)}
                className="text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/15 dark:bg-red-500/15 p-2.5 rounded-full transition-all relative z-10"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-8 custom-scrollbar">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#16804B] to-[#14532D] text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white ring-2 ring-line">
                  {selectedReservasi.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#263238] dark:text-[#E2E8E6]">
                    {selectedReservasi.nama}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                    <span
                      className={`px-3 py-1 rounded-full ${selectedReservasi.status === "Diterima" ? "bg-[#DCFCE7] dark:bg-[#12331F] text-[#14532D] dark:text-[#6EE7A0]" : selectedReservasi.status === "Ditolak" ? "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300" : "bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300"}`}
                    >
                      {selectedReservasi.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5FAF7] dark:bg-[#18211D] border border-[#E5EEE8] dark:border-[#2A3530] p-5 rounded-[20px] mb-8">
                <h5 className="text-xs font-bold text-[#16804B] dark:text-[#4ADE80] uppercase tracking-wider mb-2">
                  Paket & Peserta
                </h5>
                <div>
                  <p className="font-extrabold text-[#263238] dark:text-[#E2E8E6] text-lg">
                    {selectedReservasi.jumlah.split(" - ")[1] ||
                      selectedReservasi.jumlah}
                  </p>
                  <p className="text-muted text-sm font-medium mt-1 flex items-center gap-1">
                    <FiUsers /> {selectedReservasi.jumlah.split(" - ")[0]}{" "}
                    Peserta
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Nomor WhatsApp
                    </p>
                    <p className="font-bold text-[#16804B] dark:text-[#4ADE80] text-lg">
                      {selectedReservasi.whatsapp}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Instansi / Asal Sekolah
                    </p>
                    <p className="font-bold text-ink">
                      {selectedReservasi.instansi || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Alamat Email
                    </p>
                    <p className="font-bold text-ink">
                      {selectedReservasi.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Tanggal Kunjungan
                    </p>
                    <p className="font-bold text-ink flex items-center gap-2">
                      <FiCalendar className="text-[#16804B] dark:text-[#4ADE80]" />{" "}
                      {selectedReservasi.tanggal.split(" ")[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Jam Kedatangan
                    </p>
                    <p className="font-bold text-ink flex items-center gap-2">
                      <FiClock className="text-[#16804B] dark:text-[#4ADE80]" />{" "}
                      {selectedReservasi.tanggal.split(" ")[1] || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                  Pesan Tambahan
                </p>
                <div className="bg-surface2 border border-line p-4 rounded-xl text-sm font-medium text-ink leading-relaxed">
                  {selectedReservasi.pesan || (
                    <span className="text-muted italic">
                      Tidak ada pesan tambahan.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-line bg-surface2 flex justify-end gap-3">
              {selectedReservasi.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      updateStatusReservasi(selectedReservasi.id, "Diterima");
                      setSelectedReservasi(null);
                    }}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all duration-300 hover:shadow-sm flex items-center gap-2"
                  >
                    <FiCheck /> Konfirmasi
                  </button>
                  <button
                    onClick={() => {
                      setRejectModal({
                        show: true,
                        id: selectedReservasi.id,
                        nama: selectedReservasi.nama,
                      });
                      setSelectedReservasi(null);
                    }}
                    className="px-6 py-2.5 bg-orange-50 dark:bg-orange-500/15 hover:bg-orange-600 dark:hover:bg-orange-600/80 text-orange-600 dark:text-orange-300 hover:text-white border border-orange-200 dark:border-orange-500/30 hover:border-orange-600 dark:hover:border-orange-600/60 font-bold rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <FiX /> Tolak
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedReservasi(null)}
                className="px-6 py-2.5 bg-card text-ink hover:bg-surface2 border border-line font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
};

export default Reservasi;
