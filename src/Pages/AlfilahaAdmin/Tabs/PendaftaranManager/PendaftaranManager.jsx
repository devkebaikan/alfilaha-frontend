import React, { useState, useEffect } from "react";
import { 
  FiPlus, FiTrash2, FiCheckCircle, FiXCircle, FiUploadCloud, 
  FiUsers, FiFileText, FiSearch, FiMoreVertical, FiClock, FiCheck, FiX,
  FiMapPin, FiCalendar, FiMessageCircle, FiEdit3, FiArrowLeft
} from "react-icons/fi";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const PendaftaranManager = () => {
  const [activeTab, setActiveTab] = useState("pendaftar"); 
  
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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });
  const [formData, setFormData] = useState({
    judul_program: "",
    jenis: "pesantren",
    nama_program: "",
    poster: null,
    keterangan: "",
    batas_akhir: "",
    status: "aktif"
  });

  useEffect(() => {
    fetchPendaftar();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs`);
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data program:", error);
    }
  };

  const fetchPendaftar = async () => {
    setLoadingPendaftar(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftar_santri`);
      if (response.ok) {
        const data = await response.json();
        setPendaftar(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data pendaftar:", error);
    } finally {
      setLoadingPendaftar(false);
    }
  };

  const handleUpdateStatusPendaftar = async (id, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftar_santri/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchPendaftar(); 
      }
    } catch (error) {
      console.error("Gagal update status:", error);
    }
  };

  const handleDeletePendaftar = (id) => {
    setDeleteModal({ isOpen: true, id, type: 'pendaftar' });
  };

  const handleToggleStatusProgram = async (id) => {
    const prog = programs.find(p => p.id === id);
    if (!prog) return;
    const newStatus = prog.status === "aktif" ? "non_aktif" : "aktif";
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) fetchPrograms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProgram = (id) => {
    setDeleteModal({ isOpen: true, id, type: 'program' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    const { id, type } = deleteModal;
    
    if (type === 'pendaftar') {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftar_santri/${id}`, { method: 'DELETE' });
        if (response.ok) fetchPendaftar();
      } catch (error) {
        console.error("Gagal menghapus data:", error);
      }
    } else if (type === 'program') {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs/${id}`, { method: 'DELETE' });
        if (response.ok) fetchPrograms();
      } catch (err) {
        console.error(err);
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
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    fd.append("batas_akhir", formattedDate);
    fd.append("keterangan", formData.keterangan);
    if (formData.poster && typeof formData.poster !== 'string') {
      fd.append("poster", formData.poster);
    }

    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs/${editId}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: fd
      });
      if (response.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ judul_program: "", jenis: "pesantren", nama_program: "", poster: null, keterangan: "", batas_akhir: "", status: "aktif" });
        fetchPrograms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProgram = (prog) => {
    setIsEditing(true);
    setEditId(prog.id);
    let formattedDate = prog.batas_akhir;
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    setFormData({
      judul_program: prog.judul,
      jenis: prog.jenis,
      nama_program: prog.nama,
      poster: prog.poster, // string URL atau nama file
      keterangan: prog.keterangan || "",
      batas_akhir: formattedDate,
      status: prog.status
    });
    setIsModalOpen(true);
  };

  // Filter pendaftar based on search
  const filteredPendaftar = pendaftar.filter(p => 
    p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.no_wa.includes(searchQuery)
  );

  // Stats
  const totalMenunggu = pendaftar.filter(p => p.status_pendaftaran === "Menunggu Verifikasi").length;
  const totalDiterima = pendaftar.filter(p => p.status_pendaftaran === "Diterima").length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {!isModalOpen && (
        <>
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] overflow-hidden">
        <div className="bg-gradient-to-r from-[#14532D] to-[#16804B] p-6 sm:p-8 relative overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Pusat Pendaftaran</h2>
              <p className="text-green-100 font-medium text-sm sm:text-base">Kelola data pendaftaran santri dan program yang tersedia.</p>
            </div>
            
            {/* Tabs / Segmented Control */}
            <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl w-full md:w-auto">
              <button 
                onClick={() => setActiveTab("pendaftar")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-bold transition-all duration-300 ${activeTab === 'pendaftar' ? 'bg-white text-[#14532D] shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <FiUsers size={18} /> Data Santri
              </button>
              <button 
                onClick={() => setActiveTab("program")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-bold transition-all duration-300 ${activeTab === 'program' ? 'bg-white text-[#14532D] shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <FiFileText size={18} /> Program
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB CONTENT: PENDAFTAR */}
      {activeTab === 'pendaftar' && (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* STATS & TOOLBAR */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FiSearch size={20} /></span>
                  <input 
                    type="text" 
                    placeholder="Cari nama santri atau No. WA..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none transition-all text-[#263238] font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="px-5 py-3 bg-[#DCFCE7] text-[#14532D] rounded-2xl flex items-center gap-3 border border-[#16804B]/20 flex-1 sm:flex-none">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-[#16804B] font-bold"><FiClock /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#16804B]">Menunggu</p>
                    <p className="text-xl font-black leading-none">{totalMenunggu}</p>
                  </div>
                </div>
                <div className="px-5 py-3 bg-blue-50 text-blue-900 rounded-2xl flex items-center gap-3 border border-blue-200 flex-1 sm:flex-none">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 font-bold"><FiCheck /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Diterima</p>
                    <p className="text-xl font-black leading-none">{totalDiterima}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] flex flex-col justify-center items-center text-center">
               <p className="text-gray-500 font-medium mb-1">Total Pendaftar</p>
               <h3 className="text-4xl font-black text-[#14532D]">{pendaftar.length}</h3>
            </div>
          </div>

          {/* TABLE DATA */}
          <div className="bg-white rounded-2xl sm:rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                    <th className="py-5 px-6 font-bold w-[30%]">Profil Santri</th>
                    <th className="py-5 px-6 font-bold">Kontak & Asal</th>
                    <th className="py-5 px-6 font-bold">Tanggal Daftar</th>
                    <th className="py-5 px-6 font-bold">Status Verifikasi</th>
                    <th className="py-5 px-6 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingPendaftar ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#16804B]"></div>
                        <p className="mt-2 text-gray-500 font-medium">Memuat data pendaftar...</p>
                      </td>
                    </tr>
                  ) : filteredPendaftar.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <FiUsers size={32} />
                        </div>
                        <p className="text-lg font-bold text-gray-800">Tidak ada data pendaftar</p>
                        <p className="text-gray-500 text-sm mt-1">Belum ada santri yang mendaftar atau cocok dengan pencarian.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPendaftar.map((p) => (
                      <tr key={p.id} onClick={() => setSelectedSantri(p)} className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DCFCE7] to-green-100 text-[#14532D] flex items-center justify-center font-bold text-lg shadow-sm border border-white">
                              {p.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#263238] text-base">{p.nama}</div>
                              <div className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                                {p.jenis_kelamin === 'L' ? <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> : <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>}
                                {p.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-700 text-sm">{p.no_wa}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <FiMapPin className="shrink-0" /> <span className="truncate max-w-[150px]">{p.tempat_lahir}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                            <FiCalendar /> {new Date(p.created_at).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                          </div>
                          {p.program_judul && (
                            <div className="mt-2 text-[10px] font-bold text-[#16804B] bg-[#DCFCE7] px-2 py-1 rounded w-max truncate max-w-[150px]" title={p.program_judul}>
                              {p.program_judul}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6" onClick={e => e.stopPropagation()}>
                          <div className="relative inline-block w-48">
                            <select 
                              value={p.status_pendaftaran}
                              onChange={(e) => handleUpdateStatusPendaftar(p.id, e.target.value)}
                              className={`appearance-none w-full text-xs font-bold rounded-xl px-4 py-2.5 outline-none cursor-pointer border shadow-sm transition-all focus:ring-2 focus:ring-offset-1 ${
                                p.status_pendaftaran === 'Diterima' ? 'bg-[#DCFCE7] text-[#14532D] border-[#16804B]/20 focus:ring-[#16804B]' :
                                p.status_pendaftaran === 'Ditolak' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500' :
                                'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500'
                              }`}
                            >
                              <option value="Menunggu Verifikasi">⏳ Menunggu Verifikasi</option>
                              <option value="Diterima">✅ Terima Santri</option>
                              <option value="Ditolak">❌ Tolak</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleDeletePendaftar(p.id)} title="Hapus Data" className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100">
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer Mock */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm text-gray-500">
              <span>Menampilkan {filteredPendaftar.length} pendaftar</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROGRAM */}
      {activeTab === 'program' && (
        <div className="animate-fade-in-up space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#263238]">Daftar Program Publik</h3>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditId(null);
                setFormData({ judul_program: "", jenis: "pesantren", nama_program: "", poster: null, keterangan: "", batas_akhir: "", status: "aktif" });
                setIsModalOpen(true);
              }}
              className="bg-[#16804B] hover:bg-[#14532D] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-900/20 hover:-translate-y-0.5"
            >
              <FiPlus size={20} /> Buat Program Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div key={prog.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5EEE8] overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="h-32 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  {/* Dynamic Image for poster */}
                  <img src={prog.poster ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${prog.poster}` : "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} alt="Poster" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 z-20">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${prog.jenis === 'pesantren' ? 'bg-[#DCFCE7] text-[#14532D]' : 'bg-purple-100 text-purple-700'}`}>
                      {prog.jenis === 'pesantren' ? 'Pesantren' : 'Event'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 z-20 right-4">
                    <h4 className="font-bold text-white text-lg leading-tight line-clamp-1">{prog.judul}</h4>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-sm font-bold text-gray-500 mb-4">{prog.nama}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <FiCalendar className="text-[#16804B]" /> 
                    <span className="font-medium">Batas Akhir:</span> 
                    <span className="font-bold text-gray-800">{new Date(prog.batas_akhir).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={prog.status === 'aktif'}
                          onChange={() => handleToggleStatusProgram(prog.id)}
                        />
                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16804B]"></div>
                      </label>
                      <span className={`text-sm font-bold ${prog.status === 'aktif' ? 'text-[#16804B]' : 'text-gray-400'}`}>
                        {prog.status === 'aktif' ? 'Status: Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditProgram(prog)} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-2.5 rounded-xl transition-all">
                        <FiEdit3 size={18} />
                      </button>
                      <button onClick={() => handleDeleteProgram(prog.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
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
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition">
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">{isEditing ? 'Edit Program Pendaftaran' : 'Buat Program Pendaftaran'}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{isEditing ? 'Perbarui informasi program.' : 'Publikasikan program baru ke halaman pendaftaran publik.'}</p>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form id="programForm" onSubmit={handleSubmitProgram} className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
                
                {/* KOLOM KIRI */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Judul Pendaftaran Utama <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required value={formData.judul_program}
                      onChange={(e) => setFormData({...formData, judul_program: e.target.value})}
                      placeholder="Misal: Pendaftaran Santri Baru 2026"
                      className="w-full min-h-[48px] px-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none bg-gray-50 focus:bg-white transition-all text-gray-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Program Spesifik <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required value={formData.nama_program}
                      onChange={(e) => setFormData({...formData, nama_program: e.target.value})}
                      placeholder="Misal: Kelas Tahfidz Intensif"
                      className="w-full min-h-[48px] px-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none bg-gray-50 focus:bg-white transition-all text-gray-800 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Jenis <span className="text-red-500">*</span></label>
                      <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                        <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-all ${formData.jenis === 'pesantren' ? 'bg-white shadow-sm text-[#14532D]' : 'text-gray-500'}`}>
                          <input type="radio" name="jenis" value="pesantren" className="hidden" onChange={(e) => setFormData({...formData, jenis: e.target.value})} checked={formData.jenis === 'pesantren'} />
                          Pesantren
                        </label>
                        <label className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-sm font-bold transition-all ${formData.jenis === 'event' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500'}`}>
                          <input type="radio" name="jenis" value="event" className="hidden" onChange={(e) => setFormData({...formData, jenis: e.target.value})} checked={formData.jenis === 'event'} />
                          Event
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Batas Akhir <span className="text-red-500">*</span></label>
                      <input 
                        type="date" required value={formData.batas_akhir}
                        onChange={(e) => setFormData({...formData, batas_akhir: e.target.value})}
                        className="w-full min-h-[48px] px-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#16804B] focus:border-[#16804B] outline-none bg-gray-50 focus:bg-white transition-all text-gray-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN */}
                <div className="space-y-6 flex flex-col">
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Poster Program</label>
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-[24px] flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-[#F5FAF7] hover:border-[#16804B] transition-colors cursor-pointer group min-h-[160px]">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#16804B] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <FiUploadCloud size={24} />
                      </div>
                      <p className="text-gray-700 font-bold mb-1 text-sm">
                        {formData.poster ? (typeof formData.poster === 'string' ? formData.poster : formData.poster.name) : "Upload Poster"}
                      </p>
                      <p className="text-gray-400 text-xs">Rekomendasi 16:9 (Max. 2MB)</p>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({...formData, poster: e.target.files[0]})} />
                    </label>
                  </div>

                  {/* TOGGLE STATUS */}
                  <div className="bg-[#F5FAF7] p-5 rounded-[20px] border border-[#E5EEE8] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#14532D] text-sm">Status Publikasi</h4>
                      <p className="text-xs text-[#6B7280]">Langsung buka pendaftaran?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.status === 'aktif'}
                        onChange={(e) => setFormData({...formData, status: e.target.checked ? 'aktif' : 'non_aktif'})}
                      />
                      <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#16804B]"></div>
                    </label>
                  </div>
                </div>
                
                {/* FULL WIDTH */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Informasi Tambahan / Syarat Ketentuan</label>
                  <div className="bg-white rounded-[20px] border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#16804B] focus-within:border-[#16804B] transition-all">
                    <ReactQuill 
                      theme="snow" 
                      value={formData.keterangan} 
                      onChange={(val) => setFormData({...formData, keterangan: val})}
                      className="h-40 border-none"
                    />
                  </div>
                </div>

              </form>
            </div>
            
            {/* Form Footer */}
            <div className="pt-10 border-t border-gray-100 flex items-center gap-4 mt-8">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">
                Batal
              </button>
              <button form="programForm" type="submit" className="px-8 py-4 bg-[#16804B] hover:bg-[#14532D] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                <FiCheckCircle size={20} /> {isEditing ? 'Simpan Perubahan' : 'Publish Program'}
              </button>
            </div>
            
        </div>
      )}

      {/* MODAL DETAIL SANTRI */}
      {selectedSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedSantri(null)}></div>
          
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-fade-in-up">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-40 h-40 bg-[#DCFCE7] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">Detail Pendaftar</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Informasi lengkap calon santri.</p>
              </div>
              <button onClick={() => setSelectedSantri(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all relative z-10">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#16804B] to-[#14532D] text-white flex items-center justify-center font-bold text-3xl shadow-lg border-4 border-white ring-2 ring-gray-50">
                  {selectedSantri.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#263238]">{selectedSantri.nama}</h4>
                  <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                    <span className={`px-3 py-1 rounded-full ${selectedSantri.status_pendaftaran === 'Diterima' ? 'bg-[#DCFCE7] text-[#14532D]' : selectedSantri.status_pendaftaran === 'Ditolak' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                      {selectedSantri.status_pendaftaran}
                    </span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <FiCalendar /> {new Date(selectedSantri.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5FAF7] border border-[#E5EEE8] p-5 rounded-[20px] mb-8">
                <h5 className="text-xs font-bold text-[#16804B] uppercase tracking-wider mb-2">Program Pilihan</h5>
                {selectedSantri.program_judul ? (
                  <div>
                    <p className="font-extrabold text-[#263238] text-lg">{selectedSantri.program_judul}</p>
                    <p className="text-gray-600 text-sm font-medium">{selectedSantri.program_nama}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic font-medium">Belum terhubung ke program spesifik (Data Lama)</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tempat, Tanggal Lahir</p>
                    <p className="font-bold text-gray-800">{selectedSantri.tempat_lahir}, {new Date(selectedSantri.tanggal_lahir).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Jenis Kelamin</p>
                    <p className="font-bold text-gray-800">{selectedSantri.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Username Akun</p>
                    <p className="font-bold text-gray-800">{selectedSantri.username}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor WhatsApp</p>
                    <p className="font-bold text-[#16804B] flex items-center gap-2"><FiMessageCircle /> {selectedSantri.no_wa}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Email</p>
                    <p className="font-bold text-gray-800">{selectedSantri.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</p>
                    <p className="font-bold text-gray-800 leading-relaxed">{selectedSantri.alamat}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedSantri(null)} className="px-6 py-2.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl transition-all">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #f8fafc; }
        .ql-container.ql-snow { border: none !important; }
      `}} />

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl animate-fade-in-up text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTrash2 className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Konfirmasi Hapus</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus {deleteModal.type === 'pendaftar' ? 'data santri' : 'program pendaftaran'} ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null, type: null })}
                className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/30 transition flex items-center justify-center gap-2"
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
