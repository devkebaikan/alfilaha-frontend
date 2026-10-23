import { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiUploadCloud,
  FiUsers,
  FiFileText,
  FiSearch,
  FiClock,
  FiCheck,
  FiX,
  FiMapPin,
  FiCalendar,
  FiMessageCircle,
  FiEdit3,
  FiArrowLeft,
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getAdminHeaders } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";
import ActionMenu from "../../../../Shared/ActionMenu";

const PendaftaranManager = () => {
  const notif = useNotifikasi();
  const [activeTab, setActiveTab] = useState("pendaftar");
  const [menuTerbuka, setMenuTerbuka] = useState(null);

  // States for Pendaftar Santri
  const [pendaftar, setPendaftar] = useState([]);
  const [loadingPendaftar, setLoadingPendaftar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSantri, setSelectedSantri] = useState(null);

  // States for Program
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    type: null,
  });
  const [formData, setFormData] = useState({
    judul_program: "",
    jenis: "pesantren",
    nama_program: "",
    poster: null,
    keterangan: "",
    batas_akhir: "",
    status: "aktif",
  });

  useEffect(() => {
    fetchPendaftar();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs`,
      );
      if (response.ok) {
        const data = await response.json();
        setPrograms(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Gagal mengambil data program:", error);
      setPrograms([]);
    }
  };

  const fetchPendaftar = async () => {
    setLoadingPendaftar(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftar_santri`,
        { headers: getAdminHeaders() },
      );
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setPendaftar(list);
      }
    } catch (error) {
      console.error("Gagal mengambil data pendaftar:", error);
      setPendaftar([]);
    } finally {
      setLoadingPendaftar(false);
    }
  };

  const handleUpdateStatusPendaftar = async (id, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftar_santri/${id}/status`,
        {
          method: "PUT",
          headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (response.ok) {
        fetchPendaftar();
        const labelStatus = {
          pending: "Sedang Diproses",
          diterima: "Diterima",
          ditolak: "Ditolak",
          batal: "Batal",
        };
        notif.success(
          `Status pendaftar diubah menjadi "${labelStatus[newStatus] || newStatus}".`,
        );
      } else {
        notif.error("Gagal mengubah status pendaftar.");
      }
    } catch (error) {
      console.error("Gagal update status:", error);
      notif.error("Koneksi ke server gagal.");
    }
  };

  const handleDeletePendaftar = (id) => {
    setDeleteModal({ isOpen: true, id, type: "pendaftar" });
  };

  const handleToggleStatusProgram = async (id) => {
    const prog = programs.find((p) => p.id === id);
    if (!prog) return;
    const newStatus = prog.status === "aktif" ? "non_aktif" : "aktif";
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs/${id}/status`,
        {
          method: "PUT",
          headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (response.ok) {
        fetchPrograms();
        notif.success(`Program "${prog?.judul_program || ""}" diubah menjadi ${newStatus === "aktif" ? "aktif" : "non-aktif"}.`);
      } else {
        notif.error("Gagal mengubah status program.");
      }
    } catch (err) {
      console.error(err);
      notif.error("Koneksi ke server gagal.");
    }
  };

  const handleDeleteProgram = (id) => {
    setDeleteModal({ isOpen: true, id, type: "program" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    const { id, type } = deleteModal;

    if (type === "pendaftar") {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftar_santri/${id}`,
          { method: "DELETE", headers: getAdminHeaders() },
        );
        if (response.ok) {
          fetchPendaftar();
          notif.success("Data pendaftar berhasil dihapus.");
        } else {
          notif.error("Gagal menghapus data pendaftar.");
        }
      } catch (error) {
        console.error("Gagal menghapus data:", error);
        notif.error("Koneksi ke server gagal.");
      }
    } else if (type === "program") {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs/${id}`,
          { method: "DELETE", headers: getAdminHeaders() },
        );
        if (response.ok) {
          fetchPrograms();
          notif.success("Program berhasil dihapus.");
        } else {
          notif.error("Gagal menghapus program.");
        }
      } catch (err) {
        console.error(err);
        notif.error("Koneksi ke server gagal.");
      }
    }

    setDeleteModal({ isOpen: false, id: null, type: null });
  };

  const handleSubmitProgram = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("judul", formData.judul_program);
    fd.append("jenis", formData.jenis);
    fd.append("nama", formData.nama_program);
    fd.append("status", formData.status);

    // Pastikan format tanggal_lahir atau batas_akhir YYYY-MM-DD
    let formattedDate = formData.batas_akhir;
    if (formattedDate && formattedDate.includes("T")) {
      formattedDate = formattedDate.split("T")[0];
    }
    fd.append("batas_akhir", formattedDate);
    fd.append("keterangan", formData.keterangan);
    if (formData.poster && typeof formData.poster !== "string") {
      fd.append("poster", formData.poster);
    }

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs/${editId}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAdminHeaders(),
        body: fd,
      });
      if (response.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
          judul_program: "",
          jenis: "pesantren",
          nama_program: "",
          poster: null,
          keterangan: "",
          batas_akhir: "",
          status: "aktif",
        });
        fetchPrograms();
        notif.success(`Program ${isEditing ? "diperbarui" : "ditambahkan"} berhasil!`);
      } else {
        notif.error("Gagal menyimpan program.");
      }
    } catch (err) {
      console.error(err);
      notif.error("Koneksi ke server gagal.");
    }
  };

  const handleEditProgram = (prog) => {
    setIsEditing(true);
    setEditId(prog.id);
    let formattedDate = prog.batas_akhir;
    if (formattedDate && formattedDate.includes("T")) {
      formattedDate = formattedDate.split("T")[0];
    }
    setFormData({
      judul_program: prog.judul,
      jenis: prog.jenis,
      nama_program: prog.nama,
      poster: prog.poster, // string URL atau nama file
      keterangan: prog.keterangan || "",
      batas_akhir: formattedDate,
      status: prog.status,
    });
    setIsModalOpen(true);
  };

  // Filter pendaftar based on search
  const filteredPendaftar = pendaftar.filter(
    (p) =>
      (p?.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p?.no_wa || "").includes(searchQuery),
  );

  // Stats
  const totalMenunggu = pendaftar.filter(
    (p) => p?.status_pendaftaran === "Menunggu Verifikasi",
  ).length;
  const totalDiterima = pendaftar.filter(
    (p) => p?.status_pendaftaran === "Diterima",
  ).length;
  const totalDitolak = pendaftar.filter(
    (p) => p?.status_pendaftaran === "Ditolak" || p?.status_pendaftaran === "Tertolak",
  ).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {!isModalOpen && (
        <>
          {/* HEADER SECTION */}
          <div className="bg-card rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] dark:border-[#2A3530] overflow-hidden">
            <div className="bg-gradient-to-r from-[#14532D] to-[#16804B] p-6 sm:p-8 relative overflow-hidden">
              {/* Decorative Pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-card opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                    Pusat Pendaftaran
                  </h2>
                  <p className="text-green-100 font-medium text-sm sm:text-base">
                    Kelola data pendaftaran santri dan program yang tersedia.
                  </p>
                </div>

                {/* Tabs / Segmented Control */}
                <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab("pendaftar")}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-bold transition-all duration-300 ${activeTab === "pendaftar" ? "bg-card dark:bg-[#eef4f2] text-[#14532D] shadow-lg" : "text-white/80 hover:text-[#D8E4E0] hover:bg-white/[0.06] dark:hover:bg-white/[0.06] dark:hover:text-[#C9D8D3] dark:bg-white/[0.06]"}`}
                  >
                    <FiUsers size={18} /> Data Santri
                  </button>
                  <button
                    onClick={() => setActiveTab("program")}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-bold transition-all duration-300 ${activeTab === "program" ? "bg-card dark:bg-[#eef4f2] text-[#14532D] shadow-lg" : "text-white/80 hover:text-[#D8E4E0] hover:bg-white/[0.06] dark:hover:bg-white/[0.06] dark:hover:text-[#C9D8D3] dark:bg-white/[0.06]"}`}
                  >
                    <FiFileText size={18} /> Program
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TAB CONTENT: PENDAFTAR */}
          {activeTab === "pendaftar" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* STATS & TOOLBAR */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="lg:col-span-3 bg-card p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] dark:border-[#2A3530] flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
                        <FiSearch size={20} />
                      </span>
                      <input
                        type="text"
                        placeholder="Cari nama santri atau No. WA..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-surface2 border border-line rounded-2xl focus:bg-card focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none transition-all text-[#263238] dark:text-[#E2E8E6] font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                    <div className="px-5 py-3 bg-[#DCFCE7] dark:bg-[#12331F] text-[#14532D] dark:text-[#6EE7A0] rounded-2xl flex items-center gap-3 border border-[#16804B]/20 flex-1 sm:flex-none">
                      <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center shadow-sm text-[#16804B] dark:text-[#4ADE80] font-bold">
                        <FiClock />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#16804B] dark:text-[#4ADE80]">
                          Menunggu
                        </p>
                        <p className="text-xl font-black leading-none">
                          {totalMenunggu}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-blue-50 dark:bg-blue-500/15 text-blue-900 rounded-2xl flex items-center gap-3 border border-blue-200 dark:border-blue-500/30 flex-1 sm:flex-none">
                      <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center shadow-sm text-blue-600 dark:text-blue-300 font-bold">
                        <FiCheck />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
                          Diterima
                        </p>
                        <p className="text-xl font-black leading-none">
                          {totalDiterima}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-red-50 dark:bg-red-500/15 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-500/30 flex-1 sm:flex-none">
                      <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center shadow-sm text-red-600 dark:text-red-300 font-bold">
                        <FiX />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-300">
                          Tertolak
                        </p>
                        <p className="text-xl font-black leading-none">
                          {totalDitolak}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] dark:border-[#2A3530] flex flex-col justify-center items-center text-center">
                  <p className="text-muted font-medium mb-1">
                    Total Pendaftar
                  </p>
                  <h3 className="text-4xl font-black text-[#14532D] dark:text-[#6EE7A0]">
                    {pendaftar.length}
                  </h3>
                </div>
              </div>

              {/* TABLE DATA */}
              <div className="bg-card rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] dark:border-[#2A3530] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                      <tr className="bg-surface2 text-muted text-sm border-b border-line">
                        <th className="py-5 px-6 font-bold w-[30%]">
                          Profil Santri
                        </th>
                        <th className="py-5 px-6 font-bold">Kontak & Asal</th>
                        <th className="py-5 px-6 font-bold">Tanggal Daftar</th>
                        <th className="py-5 px-6 font-bold">
                          Status Verifikasi
                        </th>
                        <th className="py-5 px-6 font-bold text-center">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {loadingPendaftar ? (
                        <tr>
                          <td colSpan="5" className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#16804B]"></div>
                            <p className="mt-2 text-muted font-medium">
                              Memuat data pendaftar...
                            </p>
                          </td>
                        </tr>
                      ) : filteredPendaftar.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-16 text-center">
                            <div className="w-20 h-20 bg-surface2 rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
                              <FiUsers size={32} />
                            </div>
                            <p className="text-lg font-bold text-ink">
                              Tidak ada data pendaftar
                            </p>
                            <p className="text-muted text-sm mt-1">
                              Belum ada santri yang mendaftar atau cocok dengan
                              pencarian.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredPendaftar.map((p) => (
                          <tr
                            key={p.id}
                            onClick={() => setSelectedSantri(p)}
                            className="group hover:bg-surface2 transition-colors cursor-pointer"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DCFCE7] dark:from-[#12331F] to-green-100 dark:to-green-500/20 text-[#14532D] dark:text-[#6EE7A0] flex items-center justify-center font-bold text-lg shadow-sm border border-white">
                                  {(p?.nama || "U").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-[#263238] dark:text-[#E2E8E6] text-base">
                                    {p?.nama || "Tanpa Nama"}
                                  </div>
                                  <div className="text-xs font-medium text-muted flex items-center gap-1 mt-0.5">
                                    {p?.jenis_kelamin === "L" ? (
                                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                                    ) : (
                                      <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
                                    )}
                                    {p?.jenis_kelamin === "L"
                                      ? "Laki-Laki"
                                      : p?.jenis_kelamin === "P"
                                        ? "Perempuan"
                                        : "Tidak Disebutkan"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-bold text-ink text-sm">
                                {p?.no_wa || "-"}
                              </div>
                              <div className="text-xs text-muted mt-1 flex items-center gap-1">
                                <FiMapPin className="shrink-0" />{" "}
                                <span className="truncate max-w-[150px]">
                                  {p?.tempat_lahir || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface2 rounded-lg text-xs font-bold text-muted">
                                <FiCalendar />{" "}
                                {p?.created_at
                                  ? new Date(p.created_at).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )
                                  : "-"}
                              </div>
                              {p.program_judul && (
                                <div
                                  className="mt-2 text-[10px] font-bold text-[#16804B] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#12331F] px-2 py-1 rounded w-max truncate max-w-[150px]"
                                  title={p.program_judul}
                                >
                                  {p.program_judul}
                                </div>
                              )}
                            </td>
                            <td
                              className="py-4 px-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(() => {
                                const st = p.status_pendaftaran;
                                const diterima = st === "Diterima";
                                const ditolak =
                                  st === "Ditolak" || st === "Tertolak";
                                const cls = diterima
                                  ? "bg-[#DCFCE7] dark:bg-[#12331F] text-[#14532D] dark:text-[#6EE7A0] border-[#16804B]/20"
                                  : ditolak
                                    ? "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30"
                                    : "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30";
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${cls}`}
                                  >
                                    {diterima ? (
                                      <FiCheck size={14} />
                                    ) : ditolak ? (
                                      <FiX size={14} />
                                    ) : (
                                      <FiClock size={14} />
                                    )}
                                    {st}
                                  </span>
                                );
                              })()}
                            </td>
                            <td
                              className="py-4 px-6 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-center">
                                <ActionMenu
                                  terbuka={menuTerbuka === `pendaftar-${p.id}`}
                                  onToggle={() =>
                                    setMenuTerbuka((cur) =>
                                      cur === `pendaftar-${p.id}`
                                        ? null
                                        : `pendaftar-${p.id}`,
                                    )
                                  }
                                  onTutup={() => setMenuTerbuka(null)}
                                  items={[
                                    {
                                      label: "Terima Santri",
                                      icon: <FiCheck size={15} />,
                                      onClick: () =>
                                        handleUpdateStatusPendaftar(
                                          p.id,
                                          "Diterima",
                                        ),
                                    },
                                    {
                                      label: "Menunggu Verifikasi",
                                      icon: <FiClock size={15} />,
                                      onClick: () =>
                                        handleUpdateStatusPendaftar(
                                          p.id,
                                          "Menunggu Verifikasi",
                                        ),
                                    },
                                    {
                                      label: "Tolak",
                                      icon: <FiX size={15} />,
                                      danger: true,
                                      onClick: () =>
                                        handleUpdateStatusPendaftar(
                                          p.id,
                                          "Ditolak",
                                        ),
                                    },
                                    { type: "divider" },
                                    {
                                      label: "Hapus",
                                      icon: <FiTrash2 size={15} />,
                                      danger: true,
                                      onClick: () =>
                                        handleDeletePendaftar(p.id),
                                    },
                                  ]}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer Mock */}
                <div className="px-6 py-4 border-t border-line bg-surface2 flex justify-between items-center text-sm text-muted">
                  <span>Menampilkan {filteredPendaftar.length} pendaftar</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PROGRAM */}
          {activeTab === "program" && (
            <div className="animate-fade-in-up space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#263238] dark:text-[#E2E8E6]">
                  Daftar Program Publik
                </h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditId(null);
                    setFormData({
                      judul_program: "",
                      jenis: "pesantren",
                      nama_program: "",
                      poster: null,
                      keterangan: "",
                      batas_akhir: "",
                      status: "aktif",
                    });
                    setIsModalOpen(true);
                  }}
                  className="bg-[#16804B] hover:bg-[#14532D] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/20 hover:-translate-y-0.5"
                >
                  <FiPlus size={20} /> Buat Program Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((prog) => (
                  <div
                    key={prog.id}
                    className="bg-card rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] dark:border-[#2A3530] overflow-hidden group hover:shadow-xl transition-all duration-300"
                  >
                    <div className="h-32 bg-surface2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                      {/* Dynamic Image for poster */}
                      <img loading="lazy" decoding="async"
                        src={
                          prog.poster
                            ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${prog.poster}`
                            : "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                        }
                        alt="Poster"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${prog.jenis === "pesantren" ? "bg-[#DCFCE7] dark:bg-[#12331F] text-[#14532D] dark:text-[#6EE7A0]" : "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300"}`}
                        >
                          {prog.jenis === "pesantren" ? "Pesantren" : "Event"}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 z-20 right-4">
                        <h4 className="font-bold text-white text-lg leading-tight line-clamp-1">
                          {prog.judul}
                        </h4>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-sm font-bold text-muted mb-4">
                        {prog?.nama}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-muted mb-6 bg-surface2 p-3 rounded-xl border border-line">
                        <FiCalendar className="text-[#16804B] dark:text-[#4ADE80]" />
                        <span className="font-medium">Batas Akhir:</span>
                        <span className="font-bold text-ink">
                          {prog?.batas_akhir
                            ? new Date(prog.batas_akhir).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-line">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={prog.status === "aktif"}
                              onChange={() =>
                                handleToggleStatusProgram(prog.id)
                              }
                            />
                            <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16804B]"></div>
                          </label>
                          <span
                            className={`text-sm font-bold ${prog.status === "aktif" ? "text-[#16804B] dark:text-[#4ADE80]" : "text-muted"}`}
                          >
                            {prog.status === "aktif"
                              ? "Status: Aktif"
                              : "Non-Aktif"}
                          </span>
                        </div>

                        <ActionMenu
                          terbuka={menuTerbuka === `program-${prog.id}`}
                          onToggle={() =>
                            setMenuTerbuka((cur) =>
                              cur === `program-${prog.id}`
                                ? null
                                : `program-${prog.id}`,
                            )
                          }
                          onTutup={() => setMenuTerbuka(null)}
                          items={[
                            {
                              label: "Edit",
                              icon: <FiEdit3 size={15} />,
                              onClick: () => handleEditProgram(prog),
                            },
                            { type: "divider" },
                            {
                              label: "Hapus",
                              icon: <FiTrash2 size={15} />,
                              danger: true,
                              onClick: () => handleDeleteProgram(prog.id),
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* INLINE FORM CREATE PROGRAM */}
      {isModalOpen && (
        <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
          <div className="p-8 border-b border-line flex items-center gap-4 bg-card">
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 bg-surface2 hover:bg-surface2 text-muted rounded-xl transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-2xl font-extrabold text-ink tracking-tight">
                {isEditing
                  ? "Edit Program Pendaftaran"
                  : "Buat Program Pendaftaran"}
              </h3>
              <p className="text-sm text-muted font-medium mt-1">
                {isEditing
                  ? "Perbarui informasi program."
                  : "Publikasikan program baru ke halaman pendaftaran publik."}
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="overflow-y-auto p-8 custom-scrollbar">
            <form
              id="programForm"
              onSubmit={handleSubmitProgram}
              className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8"
            >
              {/* KOLOM KIRI */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Judul Pendaftaran Utama{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.judul_program}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        judul_program: e.target.value,
                      })
                    }
                    placeholder="Misal: Pendaftaran Santri Baru 2026"
                    className="w-full min-h-[48px] px-4 rounded-2xl border border-line focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none bg-surface2 focus:bg-card transition-all text-ink font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Nama Program Spesifik{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_program}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_program: e.target.value })
                    }
                    placeholder="Misal: Kelas Tahfidz Intensif"
                    className="w-full min-h-[48px] px-4 rounded-2xl border border-line focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none bg-surface2 focus:bg-card transition-all text-ink font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Jenis <span className="text-red-500">*</span>
                    </label>
                    <div className="flex bg-surface2 p-1.5 rounded-2xl border border-line">
                      <label
                        className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-all ${formData.jenis === "pesantren" ? "bg-card shadow-sm text-[#14532D] dark:text-[#6EE7A0]" : "text-muted"}`}
                      >
                        <input
                          type="radio"
                          name="jenis"
                          value="pesantren"
                          className="hidden"
                          onChange={(e) =>
                            setFormData({ ...formData, jenis: e.target.value })
                          }
                          checked={formData.jenis === "pesantren"}
                        />
                        Pesantren
                      </label>
                      <label
                        className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-all ${formData.jenis === "event" ? "bg-card shadow-sm text-purple-700 dark:text-purple-300" : "text-muted"}`}
                      >
                        <input
                          type="radio"
                          name="jenis"
                          value="event"
                          className="hidden"
                          onChange={(e) =>
                            setFormData({ ...formData, jenis: e.target.value })
                          }
                          checked={formData.jenis === "event"}
                        />
                        Event
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Batas Akhir <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.batas_akhir}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          batas_akhir: e.target.value,
                        })
                      }
                      className="w-full min-h-[48px] px-4 rounded-2xl border border-line focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none bg-surface2 focus:bg-card transition-all text-ink font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-6 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-bold text-ink mb-2">
                    Poster Program
                  </label>
                  <label className="flex-1 border-2 border-dashed border-line rounded-[24px] flex flex-col items-center justify-center text-center bg-surface2 hover:bg-[#F5FAF7] dark:hover:bg-[#1E2A25] dark:bg-[#18211D] hover:border-[#16804B] transition-colors cursor-pointer group min-h-[160px]">
                    <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center text-[#16804B] dark:text-[#4ADE80] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <FiUploadCloud size={24} />
                    </div>
                    <p className="text-ink font-bold mb-1 text-sm">
                      {formData.poster
                        ? typeof formData.poster === "string"
                          ? formData.poster
                          : formData.poster.name
                        : "Upload Poster"}
                    </p>
                    <p className="text-muted text-xs">
                      Rekomendasi 16:9 (Max. 2MB)
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({ ...formData, poster: e.target.files[0] })
                      }
                    />
                  </label>
                </div>

                {/* TOGGLE STATUS */}
                <div className="bg-[#F5FAF7] dark:bg-[#18211D] p-5 rounded-[20px] border border-[#E5EEE8] dark:border-[#2A3530] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#14532D] dark:text-[#6EE7A0] text-sm">
                      Status Publikasi
                    </h4>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      Langsung buka pendaftaran?
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.status === "aktif"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.checked ? "aktif" : "non_aktif",
                        })
                      }
                    />
                    <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-card after:border-line after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#16804B]"></div>
                  </label>
                </div>
              </div>

              {/* FULL WIDTH */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-bold text-ink mb-2">
                  Informasi Tambahan / Syarat Ketentuan
                </label>
                <div className="bg-card rounded-[20px] border border-line overflow-hidden focus-within:ring-2 focus-within:ring-[#16804B] focus-within:border-[#16804B] transition-all">
                  <ReactQuill
                    theme="snow"
                    value={formData.keterangan}
                    onChange={(val) =>
                      setFormData({ ...formData, keterangan: val })
                    }
                    className="h-40 border-none"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Form Footer */}
          <div className="pt-10 border-t border-line flex items-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.07] text-ink font-bold rounded-xl transition"
            >
              Batal
            </button>
            <button
              form="programForm"
              type="submit"
              className="px-8 py-4 bg-[#16804B] hover:bg-[#14532D] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <FiCheckCircle size={20} />{" "}
              {isEditing ? "Simpan Perubahan" : "Publish Program"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL SANTRI */}
      {selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedSantri(null)}
          ></div>

          <div className="bg-card rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-fade-in-up">
            <div className="px-8 py-6 border-b border-line flex justify-between items-center bg-card relative overflow-hidden">
              <div className="absolute right-0 top-0 w-40 h-40 bg-[#DCFCE7] dark:bg-[#12331F] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-ink tracking-tight">
                  Detail Pendaftar
                </h3>
                <p className="text-sm text-muted font-medium mt-1">
                  Informasi lengkap calon santri.
                </p>
              </div>
              <button
                onClick={() => setSelectedSantri(null)}
                className="text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/15 dark:bg-red-500/15 p-2.5 rounded-full transition-all relative z-10"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-8 custom-scrollbar">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#16804B] to-[#14532D] text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white ring-2 ring-line">
                  {(selectedSantri?.nama || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#263238] dark:text-[#E2E8E6]">
                    {selectedSantri?.nama || "Tanpa Nama"}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                    <span
                      className={`px-3 py-1 rounded-full ${selectedSantri?.status_pendaftaran === "Diterima" ? "bg-[#DCFCE7] dark:bg-[#12331F] text-[#14532D] dark:text-[#6EE7A0]" : selectedSantri?.status_pendaftaran === "Ditolak" || selectedSantri?.status_pendaftaran === "Tertolak" ? "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300" : "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"}`}
                    >
                      {selectedSantri?.status_pendaftaran === "Ditolak" || selectedSantri?.status_pendaftaran === "Tertolak"
                        ? "Ditolak"
                        : selectedSantri?.status_pendaftaran || "Menunggu"}
                    </span>
                    <span className="text-muted flex items-center gap-1">
                      <FiCalendar />{" "}
                      {selectedSantri?.created_at
                        ? new Date(
                            selectedSantri.created_at,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5FAF7] dark:bg-[#18211D] border border-[#E5EEE8] dark:border-[#2A3530] p-5 rounded-[20px] mb-8">
                <h5 className="text-xs font-bold text-[#16804B] dark:text-[#4ADE80] uppercase tracking-wider mb-2">
                  Program Pilihan
                </h5>
                {selectedSantri.program_judul ? (
                  <div>
                    <p className="font-extrabold text-[#263238] dark:text-[#E2E8E6] text-lg">
                      {selectedSantri.program_judul}
                    </p>
                    <p className="text-muted text-sm font-medium">
                      {selectedSantri.program_nama}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted text-sm italic font-medium">
                    Belum terhubung ke program spesifik (Data Lama)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Tempat, Tanggal Lahir
                    </p>
                    <p className="font-bold text-ink">
                      {selectedSantri?.tempat_lahir || "-"},{" "}
                      {selectedSantri?.tanggal_lahir
                        ? new Date(
                            selectedSantri.tanggal_lahir,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Jenis Kelamin
                    </p>
                    <p className="font-bold text-ink">
                      {selectedSantri?.jenis_kelamin === "L"
                        ? "Laki-Laki"
                        : selectedSantri?.jenis_kelamin === "P"
                          ? "Perempuan"
                          : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Username Akun
                    </p>
                    <p className="font-bold text-ink">
                      {selectedSantri?.username || "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Nomor WhatsApp
                    </p>
                    <p className="font-bold text-[#16804B] dark:text-[#4ADE80] flex items-center gap-2">
                      <FiMessageCircle /> {selectedSantri?.no_wa || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Alamat Email
                    </p>
                    <p className="font-bold text-ink">
                      {selectedSantri?.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
                      Alamat Lengkap
                    </p>
                    <p className="font-bold text-ink leading-relaxed">
                      {selectedSantri?.alamat || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-line bg-surface2 flex justify-end">
              <button
                onClick={() => setSelectedSantri(null)}
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
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #f8fafc; }
        .ql-container.ql-snow { border: none !important; }
      `,
        }}
      />

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-card rounded-[24px] p-8 max-w-md w-full shadow-2xl animate-fade-in-up text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrash2 className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-ink mb-2">
              Konfirmasi Hapus
            </h2>
            <p className="text-muted mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus{" "}
              {deleteModal.type === "pendaftar"
                ? "data santri"
                : "program pendaftaran"}{" "}
              ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: false, id: null, type: null })
                }
                className="flex-1 px-6 py-3.5 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.07] text-ink font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-black/25 transition flex items-center justify-center gap-2"
              >
                <FiTrash2 size={18} /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendaftaranManager;
