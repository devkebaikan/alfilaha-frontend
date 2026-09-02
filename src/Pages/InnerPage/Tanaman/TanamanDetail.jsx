import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiDroplet, FiCheckCircle, FiMapPin, FiInfo, FiClock, FiCalendar, FiArrowLeft, FiActivity, FiUsers, FiImage, FiCamera, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";


const TanamanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tanaman, setTanaman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [filterRiwayat, setFilterRiwayat] = useState("Semua");
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, jenis: "", timestamp: null });

  const [fotoPerkembangan, setFotoPerkembangan] = useState([]);
  const [fotoLoading, setFotoLoading] = useState(true);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTanaman = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}`);
      if (!res.ok) throw new Error("Tanaman tidak ditemukan");
      setTanaman(await res.json());
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/log_perawatan?tanaman_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data); // Ambil semua data riwayat
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchFotoPerkembangan = async () => {
    try {
      setFotoLoading(true);
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/foto_perkembangan/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFotoPerkembangan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFotoLoading(false);
    }
  };

  useEffect(() => {
    fetchTanaman();
    fetchHistory();
    fetchFotoPerkembangan();
  }, [id]);

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("santri_token");
    if (!token) {
      alert("Anda harus login sebagai petugas/santri untuk mengunggah foto.");
      navigate(`/login-perawatan?redirect=/tanaman/${id}`);
      return;
    }

    const formData = new FormData();
    formData.append("tanaman_id", id);
    formData.append("gambar", file);

    setActionLoading(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/foto_perkembangan`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Foto perkembangan berhasil diunggah!");
        fetchFotoPerkembangan(); // Refresh foto
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert(data.message || data.error || "Gagal mengunggah foto.");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePerawatan = async (jenis_tindakan) => {
    setActionLoading(true);
    
    const formData = new FormData();
    formData.append("tanaman_id", id);
    formData.append("jenis_tindakan", jenis_tindakan);
    formData.append("nama_perawat", "Santri");
    formData.append("role_perawat", "Santri");

    try {
      await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/log_perawatan`, {
        method: "POST",
        body: formData
      });
      fetchHistory(); // Refresh riwayat
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      setNotification({
        isOpen: true,
        jenis: jenis_tindakan,
        timestamp: new Date()
      });
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
    }
  };

  const filteredHistory = history.filter(log => {
    if (filterRiwayat === "Semua") return true;
    if (filterRiwayat === "Penyiraman") return log.jenis_tindakan === "siram";
    if (filterRiwayat === "Pemupukan") return log.jenis_tindakan === "pupuk";
    return true;
  });

  const displayedHistory = showAllHistory ? filteredHistory : filteredHistory.slice(0, 5);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-10 w-10 border-4 border-green-500 rounded-full border-t-transparent"></div></div>;
  if (error || !tanaman) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h2 className="text-2xl font-bold text-gray-800">Tanaman tidak ditemukan</h2><p className="text-gray-500">Mungkin QR Code sudah usang atau tanaman telah dihapus.</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-[100px] lg:pt-[140px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/koleksi-tanaman" className="inline-flex items-center text-green-600 font-bold mb-6 hover:text-green-800 transition">
          <FiArrowLeft className="mr-2" /> Kembali ke Daftar Tanaman
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          <div className="md:w-3/5 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
            <div className="relative h-64 sm:h-80 bg-green-900">
              {tanaman.gambar ? (
                <img src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${tanaman.gambar}`} alt={tanaman.nama} className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-100">Tanpa Gambar</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-2 shadow-sm">{tanaman.jenis}</span>
                <h1 className="text-3xl font-extrabold text-white leading-tight">{tanaman.nama}</h1>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1">
              <div className="flex items-center space-x-3 text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <FiMapPin className="text-green-500 w-5 h-5 shrink-0" />
                <span className="font-medium text-sm sm:text-base">Lokasi: {tanaman.lokasi}</span>
              </div>

              <div className="mb-8">
                <h3 className="flex items-center text-lg font-bold text-gray-900 mb-3">
                  <FiActivity className="mr-2 text-green-500" /> Kondisi Tanaman
                </h3>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Kesehatan Umum</span>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                      tanaman.kondisi === 'Kurang Subur' || tanaman.kondisi === 'Layu' ? 'text-orange-600 bg-orange-50' :
                      tanaman.kondisi === 'Kering' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                    }`}>{tanaman.kondisi || 'Sehat'}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-5">
                    <div className={`h-2.5 rounded-full bg-gradient-to-r ${
                      tanaman.kondisi === 'Kurang Subur' || tanaman.kondisi === 'Layu' ? 'from-orange-400 to-orange-500' :
                      tanaman.kondisi === 'Kering' ? 'from-red-400 to-red-500' : 'from-green-400 to-green-500'
                    }`} style={{ width: tanaman.kondisi === 'Subur' ? '100%' : tanaman.kondisi === 'Kurang Subur' ? '60%' : tanaman.kondisi === 'Layu' ? '40%' : tanaman.kondisi === 'Kering' ? '10%' : '85%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                      <span className="block text-gray-500 text-xs mb-1">Kebutuhan Air</span>
                      <span className="font-semibold text-blue-700 flex items-center"><FiDroplet className="mr-1"/> {tanaman.kebutuhan_air || 'Cukup'}</span>
                    </div>
                    <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100/50">
                      <span className="block text-gray-500 text-xs mb-1">Terakhir Dipupuk</span>
                      <span className="font-semibold text-orange-700 flex items-center"><FiCheckCircle className="mr-1"/> {tanaman.terakhir_dipupuk || 'Belum ada data'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="flex items-center text-lg font-bold text-gray-900 mb-3">
                  <FiInfo className="mr-2 text-green-500" /> Informasi & Deskripsi
                </h3>
                {tanaman.deskripsi ? (
                  <div 
                    className="text-gray-600 leading-relaxed text-sm sm:text-base prose prose-green prose-sm max-w-none bg-gray-50/50 p-4 rounded-xl border border-gray-100"
                    dangerouslySetInnerHTML={{ __html: tanaman.deskripsi }}
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    Belum ada deskripsi untuk tanaman ini.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="p-2 bg-green-50 rounded-lg shrink-0">
                    <FiCalendar className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-0.5">Usia Tanaman</span>
                    <span className="font-bold text-gray-800 text-sm">{tanaman.usia || '6 Bulan'}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                    <FiDroplet className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-0.5">Jadwal Siram</span>
                    <span className="font-bold text-gray-800 text-sm">{tanaman.jadwal_siram || '2x Sehari'}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                    <FiUsers className="text-orange-600 w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-0.5">Perawat</span>
                    <span className="font-bold text-gray-800 text-sm">{tanaman.penanggung_jawab || 'Kelompok 03'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center text-lg font-bold text-gray-900 mb-3">
                  <FiImage className="mr-2 text-green-500" /> Perkembangan (Growth Tracker)
                </h3>
                <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                  {fotoPerkembangan.map((foto) => (
                    <div key={foto.id} onClick={() => setSelectedFoto(foto)} className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-gray-100 relative group cursor-pointer shadow-sm">
                      <img src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${foto.gambar}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" alt="Perkembangan tanaman" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center p-1">
                        <span className="text-white text-[10px] text-center font-bold">{new Date(foto.waktu_upload).toLocaleDateString("id-ID", { month: 'short', year: 'numeric' })}</span>
                        <span className="text-white text-xs font-bold mt-1">Lihat</span>
                      </div>
                    </div>
                  ))}
                  
                  <label className={`w-28 h-28 shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-green-400 hover:text-green-500 transition shadow-sm ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FiCamera className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Tambah</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadFoto} disabled={actionLoading} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-2/5 p-6 sm:p-8 bg-gray-50 flex flex-col border-l border-gray-100">
            <div className="mb-8">
              <h3 className="text-gray-900 font-bold mb-4 text-xl flex items-center">
                Konfirmasi Perawatan
              </h3>
              
              {successMsg && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center font-semibold animate-pulse shadow-sm text-sm">
                  {successMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handlePerawatan("siram")}
                  disabled={actionLoading}
                  className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50 border-2 border-blue-100 hover:border-blue-300 rounded-2xl transition group shadow-sm disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mb-2 transition shadow-inner">
                    <FiDroplet size={24} />
                  </div>
                  <span className="font-bold text-blue-800 text-sm">Siram Air</span>
                </button>
                
                <button 
                  onClick={() => handlePerawatan("pupuk")}
                  disabled={actionLoading}
                  className="flex flex-col items-center justify-center p-4 bg-white hover:bg-orange-50 border-2 border-orange-100 hover:border-orange-300 rounded-2xl transition group shadow-sm disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 text-orange-600 rounded-full flex items-center justify-center mb-2 transition shadow-inner">
                    <FiCheckCircle size={24} />
                  </div>
                  <span className="font-bold text-orange-800 text-sm">Beri Pupuk</span>
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="flex items-center text-lg font-bold text-gray-900">
                  <FiClock className="mr-2 text-gray-500" /> Riwayat
                </h3>
              </div>

              <div className="flex space-x-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                {['Semua', 'Penyiraman', 'Pemupukan'].map(f => (
                  <button 
                    key={f}
                    onClick={() => { setFilterRiwayat(f); setShowAllHistory(false); }}
                    className={`px-3 py-1.5 text-xs rounded-full font-bold transition whitespace-nowrap ${filterRiwayat === f ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin h-6 w-6 border-2 border-green-500 rounded-full border-t-transparent"></div>
                </div>
              ) : displayedHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FiCalendar className="mx-auto text-gray-300 mb-3" size={36} />
                  <p className="text-gray-500 text-sm">Belum ada riwayat perawatan untuk kategori ini.</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  {displayedHistory.map((log, index) => (
                    <div key={log.id} className="flex gap-3 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${log.jenis_tindakan === 'siram' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {log.jenis_tindakan === 'siram' ? <FiDroplet size={14} /> : <FiCheckCircle size={14} />}
                        </div>
                        {index !== displayedHistory.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-1 group-hover:bg-gray-200 transition"></div>}
                      </div>
                      <div className="pb-3 w-full">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-gray-800">
                            {log.jenis_tindakan === 'siram' ? 'Disiram' : 'Diberi Pupuk'}
                          </p>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                            {new Date(log.waktu_tindakan).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }).replace('.', ':')} WIB
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Oleh: <span className="font-medium text-gray-700">{(log.nama_santri === "Anonim / Pengunjung" || log.nama_santri === "Pengunjung") ? "Santri" : (log.nama_santri || "Santri")}</span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(log.waktu_tindakan).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        {log.gambar && (
                          <div 
                            className="mt-2 text-xs font-bold text-green-600 flex items-center cursor-pointer hover:text-green-700 transition w-fit bg-green-50 px-2 py-1 rounded-md border border-green-100"
                            onClick={() => setSelectedFoto(log)}
                          >
                            <FiImage className="mr-1" /> Lihat Bukti Foto
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showAllHistory && filteredHistory.length > 5 && (
                <button 
                  onClick={() => setShowAllHistory(true)} 
                  className="w-full text-center text-sm text-green-600 font-bold mt-2 py-3 border border-green-100 rounded-xl hover:bg-green-50 transition"
                >
                  Lihat Semua Riwayat ({filteredHistory.length})
                </button>
              )}
              {showAllHistory && filteredHistory.length > 5 && (
                <button 
                  onClick={() => setShowAllHistory(false)} 
                  className="w-full text-center text-sm text-gray-500 font-bold mt-2 py-3 border border-green-100 rounded-xl hover:bg-gray-50 transition"
                >
                  Tutup Sebagian Riwayat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
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
              alt="Perkembangan Membesar" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl ring-4 ring-white/10"
            />
            <div className="mt-5 text-center">
              <span className="bg-green-600/90 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-xl backdrop-blur-md">
                Diunggah pada: {new Date(selectedFoto.waktu_upload || selectedFoto.waktu_tindakan).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {notification.isOpen && (
          <div className="fixed top-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none px-4">
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
              className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center p-2 pr-5 pointer-events-auto max-w-sm w-full sm:w-auto"
            >
              {/* Kiri: Ikon Animasi */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-3 shadow-sm bg-green-50 text-green-500"
              >
                <motion.svg
                  className="w-5 h-5"
                  viewBox="0 0 50 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                    d="M14,26 L22,33.5 L35,16"
                  />
                </motion.svg>
              </motion.div>
              
              {/* Tengah: Teks */}
              <div className="flex flex-col justify-center py-1">
                <span className="text-sm font-bold text-gray-800 leading-tight">
                  {notification.jenis === 'siram' ? 'Berhasil Disiram!' : 'Berhasil Dipupuk!'}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 font-medium">
                  {notification.jenis === 'siram' ? 'Tanaman segar kembali' : 'Nutrisi bertambah'} • {notification.timestamp ? `${notification.timestamp.getHours().toString().padStart(2, '0')}:${notification.timestamp.getMinutes().toString().padStart(2, '0')} WIB` : ''}
                </span>
              </div>
              
              {/* Kanan: Tombol Silang */}
              <button 
                onClick={() => setNotification({ isOpen: false, jenis: "", timestamp: null })}
                className="ml-auto pl-6 text-gray-300 hover:text-gray-500 transition-colors focus:outline-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TanamanDetail;
