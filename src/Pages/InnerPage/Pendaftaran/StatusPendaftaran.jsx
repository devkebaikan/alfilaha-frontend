import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiCheckCircle, 
  FiClock, 
  FiUser, 
  FiLogOut, 
  FiEdit3, 
  FiPrinter,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiInfo,
  FiMessageCircle,
  FiArrowRight,
  FiFileText,
  FiXCircle
} from "react-icons/fi";
import { FaMosque } from "react-icons/fa";

const StatusPendaftaran = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("santri_token");
    if (!token) {
      navigate("/pendaftaran");
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftaran/status`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          localStorage.removeItem("santri_token");
          navigate("/pendaftaran");
        }
      } catch (error) {
        console.error("Gagal mengambil data status:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs`);
        if (response.ok) {
          const data = await response.json();
          const activePrograms = data.filter(p => p.status === 'aktif');
          setPrograms(activePrograms);
        }
      } catch (error) {
        console.error("Gagal mengambil data program:", error);
      }
    };

    fetchStatus();
    fetchPrograms();
  }, [navigate]);

  const handleConfirmLogout = () => {
    localStorage.removeItem("santri_token");
    navigate("/pendaftaran");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F7FAF8] to-[#ECF7F0]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#16804B]"></div>
      </div>
    );
  }

  const currentStatus = userData?.status_pendaftaran || "Menunggu Verifikasi";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FAF8] to-[#ECF7F0] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background Islamic Pattern & Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-5 pointer-events-none rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#DCFCE7] opacity-30 rounded-full blur-3xl -translate-x-1/2 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto relative z-10 space-y-8">
        
        {/* WELCOME CARD & PROGRESS */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(20,83,45,0.04)] border border-[#E5EEE8] p-8 sm:p-10 lg:p-12 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Col: Welcome */}
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#DCFCE7] text-[#16804B] rounded-full flex items-center justify-center">
                <FaMosque size={28} />
              </div>
              
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263238] tracking-tight">
                  Selamat Datang, {userData?.nama ? userData.nama.split(' ')[0] : ''}!
                </h1>
                <p className="text-[#6B7280] mt-2 text-lg">
                  Pendaftaran Anda telah berhasil dan akun Anda sudah aktif di sistem Al Filaha.
                </p>
              </div>

              <div className={`p-6 rounded-[20px] border inline-block w-full mt-2 shadow-sm ${
                currentStatus === 'Diterima' ? 'bg-green-50 border-green-200' : 
                currentStatus === 'Ditolak' ? 'bg-red-50 border-red-200' : 
                'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-xs font-bold mb-4 uppercase tracking-wider ${
                  currentStatus === 'Diterima' ? 'text-green-600' : 
                  currentStatus === 'Ditolak' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>Status Pendaftaran Saat Ini</p>
                
                <div className="flex items-center gap-4 mb-5">
                  <div className={`p-3 rounded-full flex items-center justify-center ${
                    currentStatus === 'Diterima' ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' : 
                    currentStatus === 'Ditolak' ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 
                    'bg-blue-500 text-white shadow-lg shadow-blue-500/40'
                  }`}>
                    {currentStatus === 'Diterima' ? <FiCheckCircle size={28} /> : 
                     currentStatus === 'Ditolak' ? <FiInfo size={28} /> : 
                     <FiClock size={28} className="animate-pulse" />}
                  </div>
                  <span className={`text-2xl font-extrabold ${
                    currentStatus === 'Diterima' ? 'text-green-700' : 
                    currentStatus === 'Ditolak' ? 'text-red-700' : 
                    'text-blue-700'
                  }`}>
                    {currentStatus}
                  </span>
                </div>
                
                <div className={`text-sm p-4 rounded-xl border flex gap-3 items-start ${
                  currentStatus === 'Diterima' ? 'bg-white/70 border-green-100 text-green-800' : 
                  currentStatus === 'Ditolak' ? 'bg-white/70 border-red-100 text-red-800' : 
                  'bg-white/70 border-blue-100 text-blue-800'
                }`}>
                  <FiInfo className="shrink-0 mt-1 text-lg" />
                  <div className="font-medium leading-relaxed">
                    {currentStatus === 'Diterima' ? (
                      <p>
                        <strong className="font-extrabold text-green-700 text-base block mb-1">ALHAMDULILLAH, SELAMAT! 🎉</strong>
                        Kamu telah resmi diterima menjadi bagian dari keluarga besar Al Filaha Eco Pesantren. Siapkan dirimu untuk perjalanan menuntut ilmu yang penuh berkah. Silakan cek informasi verifikasi untuk langkah selanjutnya!
                      </p>
                    ) : currentStatus === 'Ditolak' ? (
                      <p>
                        <strong className="font-extrabold text-red-700 text-base block mb-1">TETAP SEMANGAT! 💪</strong>
                        Mohon maaf, saat ini kamu belum dapat bergabung dengan kami. Jangan berkecil hati, jadikan ini sebagai motivasi untuk terus belajar. Insya Allah selalu ada jalan kebaikan di tempat yang lain!
                      </p>
                    ) : (
                      <p>
                        <strong className="font-extrabold text-blue-700 text-base block mb-1">DATA SEDANG DIPROSES ⏳</strong>
                        Tim admin kami sedang meninjau dan memverifikasi data pendaftaranmu. Harap bersabar, informasi kelulusan akan diumumkan di sini atau melalui WhatsApp/Email.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button className="px-5 py-3 bg-[#16804B] hover:bg-[#14532D] text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-sm">
                  <FiFileText /> Informasi Verifikasi
                </button>
                <button 
                  onClick={() => navigate("/pendaftaran")}
                  className="px-5 py-3 bg-[#DCFCE7] hover:bg-green-200 text-[#14532D] font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <FiCheckCircle /> Daftar Program Lain
                </button>
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="px-5 py-3 bg-white border-2 border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <FiLogOut /> Keluar
                </button>
              </div>
            </div>

            {/* Right Col: Stepper */}
            <div className="lg:pl-12 lg:border-l border-[#E5EEE8] flex flex-col justify-center">
              <h3 className="text-lg font-bold text-[#263238] mb-8">Progress Pendaftaran</h3>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gray-300">
                
                {/* Step 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#22A05A] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <FiCheckCircle size={20} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-[#E5EEE8] shadow-sm ml-4 md:ml-0 text-left md:group-even:text-right">
                    <h4 className="font-bold text-[#16804B]">Data Dikirim</h4>
                    <p className="text-sm text-[#6B7280]">Selesai</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${currentStatus === 'Menunggu Verifikasi' ? 'bg-blue-500 text-white animate-pulse' : 'bg-[#22A05A] text-white'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                    {currentStatus === 'Menunggu Verifikasi' ? <FiClock size={20} /> : <FiCheckCircle size={20} />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border ${currentStatus === 'Menunggu Verifikasi' ? 'border-blue-200 bg-blue-50/50' : 'border-[#E5EEE8]'} shadow-sm ml-4 md:ml-0 text-left md:group-even:text-right`}>
                    <h4 className={`font-bold ${currentStatus === 'Menunggu Verifikasi' ? 'text-blue-700' : 'text-[#16804B]'}`}>Menunggu Verifikasi</h4>
                    <p className="text-sm text-[#6B7280]">{currentStatus === 'Menunggu Verifikasi' ? 'Sedang diproses' : 'Selesai'}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${currentStatus === 'Diterima' || currentStatus === 'Ditolak' ? 'bg-[#22A05A] text-white' : 'bg-gray-200 text-gray-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                    <FiCheckCircle size={20} />
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm ml-4 md:ml-0 text-left md:group-even:text-right ${currentStatus === 'Diterima' || currentStatus === 'Ditolak' ? '' : 'opacity-70'}`}>
                    <h4 className={`font-bold ${currentStatus === 'Diterima' || currentStatus === 'Ditolak' ? 'text-[#16804B]' : 'text-gray-400'}`}>Verifikasi Selesai</h4>
                    <p className={`text-sm ${currentStatus === 'Diterima' || currentStatus === 'Ditolak' ? 'text-gray-500' : 'text-gray-400'}`}>{currentStatus === 'Diterima' || currentStatus === 'Ditolak' ? 'Sudah berhasil diverifikasi' : 'Belum aktif'}</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${currentStatus === 'Diterima' ? 'bg-[#22A05A] text-white' : currentStatus === 'Ditolak' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                    {currentStatus === 'Ditolak' ? <FiXCircle size={20} /> : <FaMosque size={16} />}
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm ml-4 md:ml-0 text-left md:group-even:text-right ${currentStatus === 'Diterima' || currentStatus === 'Ditolak' ? '' : 'opacity-70'}`}>
                    <h4 className={`font-bold ${currentStatus === 'Diterima' ? 'text-[#16804B]' : currentStatus === 'Ditolak' ? 'text-red-600' : 'text-gray-400'}`}>{currentStatus === 'Ditolak' ? 'Pendaftaran Ditolak' : 'Diterima sebagai Santri'}</h4>
                    <p className={`text-sm ${currentStatus === 'Diterima' || currentStatus === 'Ditolak' ? 'text-gray-500' : 'text-gray-400'}`}>{currentStatus === 'Diterima' ? 'Aktif' : currentStatus === 'Ditolak' ? 'Mohon Maaf' : 'Belum aktif'}</p>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DETAIL PENDAFTARAN */}
          <div className="lg:col-span-2 bg-white rounded-[24px] shadow-[0_8px_30px_rgba(20,83,45,0.04)] border border-[#E5EEE8] p-8 sm:p-10 animate-fade-in-up delay-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F5FAF7] rounded-xl flex items-center justify-center text-[#16804B]">
                  <FiUser size={24} />
                </div>
                <h2 className="text-2xl font-bold text-[#263238]">Detail Pendaftaran Anda</h2>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-[#E5EEE8] hover:border-[#16804B] text-[#263238] rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <FiEdit3 /> Edit Data
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2.5 bg-[#F5FAF7] hover:bg-[#DCFCE7] text-[#16804B] rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  <FiPrinter /> Cetak Bukti
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="pb-4 border-b border-[#E5EEE8]">
                <p className="text-sm text-[#6B7280] mb-1 font-medium flex items-center gap-2"><FiUser className="text-gray-400" /> Nama Lengkap</p>
                <p className="font-bold text-[#263238] text-lg">{userData?.nama}</p>
              </div>
              <div className="pb-4 border-b border-[#E5EEE8]">
                <p className="text-sm text-[#6B7280] mb-1 font-medium flex items-center gap-2"><FiUser className="text-gray-400" /> Username Akun</p>
                <p className="font-bold text-[#263238] text-lg">{userData?.username}</p>
              </div>
              <div className="pb-4 border-b border-[#E5EEE8]">
                <p className="text-sm text-[#6B7280] mb-1 font-medium flex items-center gap-2"><FiCalendar className="text-gray-400" /> Tempat, Tanggal Lahir</p>
                <p className="font-bold text-[#263238] text-lg">{userData?.tempat_lahir}, {formatDate(userData?.tanggal_lahir)}</p>
              </div>
              <div className="pb-4 border-b border-[#E5EEE8]">
                <p className="text-sm text-[#6B7280] mb-1 font-medium flex items-center gap-2"><FiUser className="text-gray-400" /> Jenis Kelamin</p>
                <p className="font-bold text-[#263238] text-lg">{userData?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div className="pb-4 border-b border-[#E5EEE8] sm:col-span-2">
                <p className="text-sm text-[#6B7280] mb-1 font-medium flex items-center gap-2"><FiPhone className="text-gray-400" /> Nomor WhatsApp</p>
                <p className="font-bold text-[#263238] text-lg">{userData?.no_wa}</p>
              </div>
              <div className="pb-4 border-b border-[#E5EEE8] sm:col-span-2">
                <p className="text-sm text-[#6B7280] mb-1 font-medium flex items-center gap-2"><FiMail className="text-gray-400" /> Email</p>
                <p className="font-bold text-[#263238] text-lg">{userData?.email || <span className="text-gray-400 italic">Belum diisi</span>}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-[#6B7280] mb-1 font-medium flex items-center gap-2"><FiMapPin className="text-gray-400" /> Alamat Lengkap</p>
                <p className="font-bold text-[#263238] text-lg leading-relaxed">{userData?.alamat}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* NEXT STEPS CARD */}
            <div className="bg-[#14532D] text-white rounded-[24px] shadow-lg border border-[#16804B] p-8 animate-fade-in-up delay-200">
              <h3 className="text-xl font-bold mb-6">Apa yang perlu dilakukan?</h3>
              <ul className="space-y-5 mb-8">
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#16804B] flex items-center justify-center shrink-0 font-bold">1</div>
                  <p className="text-gray-200 leading-relaxed text-sm mt-1">Pastikan data pribadi Anda sudah benar.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#16804B] flex items-center justify-center shrink-0 font-bold">2</div>
                  <p className="text-gray-200 leading-relaxed text-sm mt-1">Tunggu proses verifikasi dari admin.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#16804B] flex items-center justify-center shrink-0 font-bold">3</div>
                  <p className="text-gray-200 leading-relaxed text-sm mt-1">Pantau WhatsApp atau email untuk informasi selanjutnya.</p>
                </li>
              </ul>
              
              <div className="pt-6 border-t border-[#16804B]">
                <p className="text-sm text-gray-300 mb-4">Jika membutuhkan bantuan, hubungi admin Al Filaha.</p>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="w-full px-4 py-3.5 bg-white text-[#14532D] hover:bg-gray-50 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                  <FiMessageCircle size={20} /> Hubungi via WhatsApp
                </a>
              </div>
            </div>

            {/* PROGRAM CARD (Lihat Pendaftaran Lainnya) */}
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(20,83,45,0.04)] border border-[#E5EEE8] p-6 animate-fade-in-up delay-300 flex flex-col">
              <h3 className="text-lg font-bold text-[#263238] mb-4">Lihat Pendaftaran Lainnya</h3>
              
              <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-4">
                {programs.length > 0 ? (
                  programs.map(prog => (
                    <div key={prog.id} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100 hover:border-green-200 transition-colors">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img 
                          src={prog.poster ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${prog.poster}` : "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"} 
                          alt={prog.judul} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block uppercase tracking-wider ${prog.jenis === 'pesantren' ? 'text-[#16804B] bg-[#DCFCE7]' : 'text-purple-700 bg-purple-100'}`}>
                          {prog.jenis === 'pesantren' ? 'Pesantren' : 'Event'}
                        </span>
                        <h4 className="font-bold text-[#263238] text-sm line-clamp-2 leading-tight">{prog.judul}</h4>
                        <p className="text-[11px] text-[#6B7280] mt-1 font-medium">Batas: {formatDate(prog.batas_akhir)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 h-full">
                    <FiInfo className="text-gray-400 mb-2" size={24} />
                    <p className="text-sm font-medium text-gray-500">Belum ada program pendaftaran lain yang aktif.</p>
                  </div>
                )}
              </div>
              
              <button onClick={() => navigate("/pendaftaran")} className="w-full mt-4 py-3 text-[#16804B] font-bold text-sm border-2 border-[#E5EEE8] hover:border-[#16804B] hover:bg-green-50 rounded-xl transition-all flex items-center justify-center gap-2">
                Lihat Semua Program <FiArrowRight />
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-sm p-8 text-center shadow-2xl transform transition-all animate-fade-in-up">
            <div className="mx-auto w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm ring-1 ring-red-100">
              <FiLogOut size={32} className="ml-1" />
            </div>
            <h3 className="text-xl font-extrabold text-[#263238] mb-2 tracking-tight">Yakin Ingin Keluar?</h3>
            <p className="text-[#6B7280] mb-8 text-sm">
              Sesi Anda akan diakhiri. Anda perlu memasukkan username dan password kembali untuk mengecek status pendaftaran.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPendaftaran;
