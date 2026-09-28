import React from "react";
import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiSearch,
  FiFilter,
  FiMail,
  FiX,
  FiTrash2,
  FiMessageSquare,
} from "react-icons/fi";

const Appointment = ({
  appointments,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  updateStatusAppointment,
  setDeleteModal,
}) => {
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);
  return (
    <div className="space-y-6">
      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-6 shadow-lg border border-green-400 flex items-center space-x-5 text-white relative overflow-hidden group">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-card opacity-10 rounded-full mix-blend-overlay group-hover:scale-110 transition-transform duration-500"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-card opacity-10 rounded-full mix-blend-overlay"></div>
          <div className="w-14 h-14 bg-white/20 dark:bg-white/[0.06] backdrop-blur-sm text-white rounded-2xl flex items-center justify-center shrink-0 z-10 border border-white/20 shadow-inner">
            <FiCalendar className="text-2xl" />
          </div>
          <div className="z-10">
            <p className="text-sm text-green-100 font-semibold tracking-wide mb-0.5">
              Total Appointment
            </p>
            <p className="text-3xl font-extrabold">{appointments.length}</p>
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
              {appointments.filter((r) => r.status === "Pending").length}
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
              {appointments.filter((r) => r.status === "Diterima").length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
        <div className="p-5 sm:p-8 border-b border-line bg-gradient-to-r from-card to-surface2 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-ink tracking-tight">
              Form Book Appointment
            </h2>
            <p className="text-sm text-muted mt-1.5 font-medium">
              Kelola daftar konsultasi yang telah dikirim dari website.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative shrink-0">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari nama / email..."
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
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface2 border-b border-line text-muted text-sm">
                <th className="px-6 py-5 font-bold uppercase tracking-wider">
                  Klien
                </th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">
                  Email & Kontak
                </th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">
                  Pesan
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
                const filtered = appointments.filter((item) => {
                  const matchesSearch =
                    item.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    item.email
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase());
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
                          Belum ada appointment
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
                    onClick={() => setSelectedAppointment(item)}
                    className="odd:bg-card even:bg-surface2 hover:!bg-[#F1F6F3] dark:hover:!bg-white/[0.035] dark:bg-green-500/10 hover:shadow-md dark:hover:shadow-none transition-all duration-300 group border-l-4 border-transparent hover:!border-[#16804B] dark:hover:!border-green-600 cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="font-extrabold text-ink text-base">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted mt-1 font-medium">
                        {item.address || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-ink font-bold text-sm">
                        <FiMail className="mr-2 text-green-500" />
                        {item.email}
                      </div>
                      <div className="text-xs text-muted mt-1.5 font-medium ml-6">
                        No: {item.number || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-[250px]">
                      <div className="flex items-start text-ink text-sm">
                        <FiMessageSquare className="mr-2 text-muted mt-1 shrink-0" />
                        <p
                          className="text-muted truncate"
                          title={item.message}
                        >
                          {item.message || "-"}
                        </p>
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
                              updateStatusAppointment(item.id, "Diterima")
                            }
                            title="Terima"
                          >
                            <FiCheck className="inline-block w-4 h-4" />
                          </button>
                          <button
                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl font-bold text-xs transition duration-300 shadow-sm hover:shadow-sm transform hover:-translate-y-0.5"
                            onClick={() =>
                              updateStatusAppointment(item.id, "Ditolak")
                            }
                            title="Tolak"
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
                            type: "appointment",
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

      {/* DETAIL MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedAppointment(null)}
          ></div>
          <div className="bg-card rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="p-5 sm:p-8 border-b border-line flex justify-between items-center bg-surface2">
              <div>
                <h3 className="text-2xl font-extrabold text-ink">
                  Detail Pesan Masuk
                </h3>
                <p className="text-sm text-muted font-medium mt-1">
                  Informasi lengkap dari {selectedAppointment.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/15 dark:bg-red-500/15 p-2.5 rounded-full transition-all relative z-10"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 sm:p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <p className="text-ink font-bold text-lg">
                    {selectedAppointment.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Status
                  </label>
                  <div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm ${selectedAppointment.status === "Pending" ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30" : selectedAppointment.status === "Diterima" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30"}`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Email
                  </label>
                  <p className="text-ink font-medium flex items-center gap-2">
                    <FiMail className="text-green-500" />{" "}
                    {selectedAppointment.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    No HP / WhatsApp
                  </label>
                  <p className="text-ink font-medium">
                    {selectedAppointment.number || "-"}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Alamat
                  </label>
                  <p className="text-ink font-medium">
                    {selectedAppointment.address || "-"}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-500/15 rounded-2xl p-6 border border-green-100 dark:border-green-500/30">
                <label className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <FiMessageSquare /> Isi Pesan
                </label>
                <p className="text-ink font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedAppointment.message || "-"}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-line bg-surface2 flex justify-between items-center gap-3">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-6 py-2.5 bg-card text-ink hover:bg-surface2 border border-line font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
              {selectedAppointment.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      updateStatusAppointment(
                        selectedAppointment.id,
                        "Ditolak",
                      );
                      setSelectedAppointment(null);
                    }}
                    className="px-6 py-2.5 bg-card text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30 hover:border-red-300 dark:hover:border-red-500/50 font-bold rounded-xl transition-all duration-300"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      updateStatusAppointment(
                        selectedAppointment.id,
                        "Diterima",
                      );
                      setSelectedAppointment(null);
                    }}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all duration-300 hover:shadow-sm flex items-center gap-2"
                  >
                    Terima
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;
