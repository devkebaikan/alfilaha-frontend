import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiUser, FiPhone, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiX, 
  FiMapPin, FiMail, FiCalendar, FiBook, FiMessageCircle, FiCheck, 
  FiArrowRight, FiArrowLeft, FiAlertCircle, FiInfo
} from "react-icons/fi";
import { FaMosque } from "react-icons/fa";

const steps = [
  { id: 1, title: "Pilih Program", short: "Program" },
  { id: 2, title: "Data Pribadi & Kontak", short: "Biodata" },
  { id: 3, title: "Buat Akun", short: "Akun" },
  { id: 4, title: "Konfirmasi", short: "Konfirmasi" }
];

const Pendaftaran = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProgramDetail, setSelectedProgramDetail] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  const [formData, setFormData] = useState({
    program_id: "",
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    no_wa: "",
    email: "",
    username: "",
    password: "",
    confirm_password: "",
    terms1: false,
    terms2: false
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/programs`);
        if (response.ok) {
          const data = await response.json();
          // Filter to only active programs if you want, but user wants to see it as closed if non-aktif?
          // Actually, if status is non_aktif, we can either not show it or show it as closed.
          // The prompt says: "Jika status program 'Nonaktif', jangan tampilkan ke publik."
          setPrograms(data.filter(p => p.status === 'aktif'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  // Load Draft from LocalStorage
  useEffect(() => {
    const draft = localStorage.getItem("pendaftaran_draft");
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        // Dont load passwords for security
        delete parsedDraft.password;
        delete parsedDraft.confirm_password;
        setFormData(prev => ({ ...prev, ...parsedDraft }));
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Save Draft to LocalStorage whenever formData changes (except passwords)
  useEffect(() => {
    const draft = { ...formData };
    delete draft.password;
    delete draft.confirm_password;
    localStorage.setItem("pendaftaran_draft", JSON.stringify(draft));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
    setErrorMsg("");
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: "", color: "bg-gray-200" };
    if (pwd.length < 6) return { label: "Sangat Lemah", color: "bg-red-500", width: "w-1/4" };
    if (pwd.length < 8) return { label: "Lemah", color: "bg-orange-500", width: "w-2/4" };
    if (pwd.match(/[A-Z]/) && pwd.match(/[0-9]/)) return { label: "Kuat", color: "bg-[#22A05A]", width: "w-full" };
    return { label: "Sedang", color: "bg-blue-500", width: "w-3/4" };
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.program_id) errors.program_id = "Silakan pilih salah satu program pendaftaran.";
    } 
    else if (step === 2) {
      if (!formData.nama) errors.nama = "Nama lengkap wajib diisi.";
      if (!formData.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi.";
      if (!formData.tanggal_lahir) errors.tanggal_lahir = "Tanggal lahir wajib diisi.";
      if (!formData.jenis_kelamin) errors.jenis_kelamin = "Jenis kelamin wajib dipilih.";
      if (!formData.alamat) errors.alamat = "Alamat lengkap wajib diisi.";
      if (!formData.no_wa) {
        errors.no_wa = "Nomor WhatsApp wajib diisi.";
      } else if (!/^(08|\+62)\d{8,13}$/.test(formData.no_wa)) {
        errors.no_wa = "Format nomor WhatsApp tidak valid.";
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Format email tidak valid.";
      }
    } 
    else if (step === 3) {
      if (!formData.username) {
        errors.username = "Username wajib diisi.";
      } else if (formData.username.length < 6 || /\s/.test(formData.username)) {
        errors.username = "Username minimal 6 karakter dan tanpa spasi.";
      }
      if (!formData.password) {
        errors.password = "Password wajib diisi.";
      } else if (formData.password.length < 8) {
        errors.password = "Password minimal 8 karakter.";
      }
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = "Konfirmasi password tidak sama dengan password.";
      }
    } 
    else if (step === 4) {
      if (!formData.terms1) errors.terms1 = "Anda harus menyetujui pernyataan kebenaran data.";
      if (!formData.terms2) errors.terms2 = "Anda harus menyetujui syarat & ketentuan.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftaran`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("santri_token", data.token);
        localStorage.removeItem("pendaftaran_draft"); // Clear draft on success
        setShowSuccessModal(true);
      } else {
        setErrorMsg(data.message || 'Terjadi kesalahan sistem');
      }
    } catch (error) {
      console.error("Error submitting pendaftaran:", error);
      setErrorMsg("Koneksi ke server gagal. Pastikan koneksi internet stabil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const pwdStrength = getPasswordStrength(formData.password);
  const selectedProgram = programs.find(p => p.id === formData.program_id || p.id === parseInt(formData.program_id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAF8] to-[#ECF7F0] pt-32 pb-20 font-sans">
      
      {/* Hero Header */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-8 md:p-12 rounded-[24px] shadow-[0_4px_20px_rgba(20,83,45,0.04)] border border-[#E5EEE8] relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#DCFCE7] rounded-full blur-3xl opacity-40 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          
          <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-[#DCFCE7] text-[#16804B] text-xs font-bold rounded-full mb-2">Penerimaan Santri Baru</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#263238] tracking-tight">Pendaftaran Santri Baru</h1>
            <p className="text-[#6B7280] text-base md:text-lg max-w-xl">Lengkapi formulir berikut untuk bergabung bersama keluarga besar Al Filaha Eco Pesantren.</p>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/login-santri" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-[#16804B] text-[#16804B] hover:bg-[#16804B] hover:text-white rounded-[14px] font-bold transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5">
                <FiUser size={18} /> Sudah Daftar? Login Akun Santri
              </Link>
            </div>
          </div>
          
          <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 relative z-10 hidden md:flex items-center justify-center bg-[#F5FAF7] rounded-full text-[#16804B]">
            <FaMosque size={80} className="opacity-80" />
          </div>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {errorMsg && (
          <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-fade-in-up">
            <FiAlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-1">Gagal Mengirim Pendaftaran</span>
              <span className="text-sm">{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg("")} className="text-red-400 hover:text-red-600 p-1">
              <FiX size={20} />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Stepper Sidebar (Desktop) / Top (Mobile) */}
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(20,83,45,0.04)] border border-[#E5EEE8] p-6 lg:p-8 lg:sticky lg:top-32">
            <h3 className="font-bold text-[#263238] mb-6 hidden lg:block">Tahapan Pendaftaran</h3>
            
            <div className="flex lg:flex-col justify-between lg:justify-start gap-0 lg:gap-6 relative">
              {/* Line connector for Mobile */}
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100 lg:hidden -z-10"></div>
              {/* Line connector for Desktop */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100 hidden lg:block -z-10"></div>

              {steps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4 z-10 bg-white">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors duration-300 shrink-0
                      ${isActive ? 'border-[#16804B] bg-[#16804B] text-white shadow-md' : 
                        isCompleted ? 'border-[#22A05A] bg-[#22A05A] text-white' : 
                        'border-gray-200 bg-white text-gray-400'}
                    `}>
                      {isCompleted ? <FiCheck size={20} /> : step.id}
                    </div>
                    <div className="text-center lg:text-left lg:pt-2">
                      <p className="text-xs lg:text-sm font-bold text-[#263238] hidden lg:block">{step.title}</p>
                      <p className="text-[10px] lg:text-xs font-bold lg:hidden text-[#263238] mt-1 whitespace-nowrap">{step.short}</p>
                      <p className={`text-xs mt-0.5 hidden lg:block ${isActive ? 'text-[#16804B]' : isCompleted ? 'text-[#22A05A]' : 'text-gray-400'}`}>
                        {isActive ? 'Sedang diisi' : isCompleted ? 'Selesai' : 'Belum'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Help Card inside sidebar for Desktop */}
            <div className="hidden lg:block mt-10 bg-[#F5FAF7] p-5 rounded-2xl border border-[#E5EEE8]">
              <h4 className="font-bold text-[#14532D] flex items-center gap-2 mb-2"><FiMessageCircle /> Butuh Bantuan?</h4>
              <p className="text-sm text-[#6B7280] mb-4">Jika mengalami kendala saat mengisi formulir, silakan hubungi admin.</p>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-[#16804B] text-[#16804B] hover:bg-[#16804B] hover:text-white rounded-xl text-sm font-bold transition-colors">
                <FiPhone /> Hubungi Admin
              </a>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 w-full bg-white rounded-[24px] shadow-[0_4px_20px_rgba(20,83,45,0.04)] border border-[#E5EEE8] overflow-hidden">
            <div className="p-6 md:p-10">
              
              {/* STEP 1: PILIH PROGRAM */}
              {currentStep === 1 && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#263238] flex items-center gap-3"><FiBook className="text-[#16804B]" /> Pilih Program Pendaftaran</h2>
                    <p className="text-[#6B7280] mt-2">Silakan pilih program pendidikan atau event yang tersedia.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {loadingPrograms ? (
                      <div className="col-span-2 p-10 text-center text-gray-500">Memuat program...</div>
                    ) : programs.length === 0 ? (
                      <div className="col-span-2 p-10 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                        <p className="font-bold text-gray-600">Saat ini belum ada program pendaftaran yang dibuka.</p>
                        <p className="text-sm text-gray-400 mt-2">Silakan cek kembali nanti atau hubungi admin.</p>
                      </div>
                    ) : (
                      programs.map(program => {
                        const isClosed = program.status === "non_aktif";
                        const isSelected = formData.program_id === program.id || formData.program_id === String(program.id);
                        
                        return (
                          <div 
                            key={program.id} 
                            onClick={() => !isClosed && handleChange({ target: { name: 'program_id', value: program.id } })}
                            className={`rounded-[20px] border-2 transition-all cursor-pointer relative overflow-hidden group
                              ${isClosed ? 'border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed' : 
                                isSelected ? 'border-[#16804B] bg-[#F5FAF7] shadow-md ring-4 ring-[#DCFCE7]' : 'border-[#E5EEE8] hover:border-[#16804B] bg-white'}
                            `}
                          >
                            <div className="h-32 w-full bg-gray-200 relative">
                              <img src={program.poster ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${program.poster}` : "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} alt={program.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              {isClosed && (
                                <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                                  <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg text-sm shadow-lg backdrop-blur-sm">Pendaftaran Ditutup</span>
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-8 h-8 bg-[#16804B] text-white rounded-full flex items-center justify-center shadow-lg">
                                  <FiCheck size={18} />
                                </div>
                              )}
                            </div>
                            <div className="p-5">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider
                                ${program.jenis === 'pesantren' ? 'bg-[#DCFCE7] text-[#16804B]' : 'bg-blue-100 text-blue-700'}`}>
                                {program.jenis}
                              </span>
                              <h4 className="font-bold text-[#263238] mt-3 line-clamp-2 leading-snug">{program.judul}</h4>
                              <p className="text-sm font-semibold text-gray-500 line-clamp-1">{program.nama}</p>
                              
                              <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280] pt-4 border-t border-gray-100 mt-4">
                                <FiCalendar className="shrink-0" /> Batas: {new Date(program.batas_akhir).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                              </div>
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                <button 
                                  type="button"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setSelectedProgramDetail(program); 
                                  }}
                                  className="flex-1 py-2 text-xs sm:text-sm font-bold text-[#16804B] bg-[#F5FAF7] border border-[#DCFCE7] hover:bg-[#DCFCE7] rounded-xl transition-colors"
                                >
                                  Lihat Detail
                                </button>
                                <button 
                                  type="button"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(!isClosed) handleChange({ target: { name: 'program_id', value: program.id } }); 
                                  }}
                                  disabled={isClosed}
                                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors border ${isSelected ? 'bg-[#16804B] border-[#16804B] text-white shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'} ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isSelected ? 'Terpilih' : 'Daftar'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {fieldErrors.program_id && <p className="text-red-500 text-sm mt-4 font-medium flex items-center gap-1"><FiAlertCircle /> {fieldErrors.program_id}</p>}
                </div>
              )}

              {/* STEP 2: DATA PRIBADI & KONTAK */}
              {currentStep === 2 && (
                <div className="animate-fade-in space-y-8">
                  {selectedProgram && (
                    <div className="bg-[#F5FAF7] border border-[#E5EEE8] p-4 rounded-[16px] flex justify-between items-center mb-8">
                      <div>
                        <p className="text-xs text-[#6B7280] font-bold">Program Terpilih</p>
                        <p className="font-bold text-[#14532D]">{selectedProgram.nama}</p>
                      </div>
                      <button onClick={() => setCurrentStep(1)} className="text-[#16804B] hover:text-[#14532D] text-sm font-bold underline">Ganti</button>
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-bold text-[#263238] flex items-center gap-3 border-b border-[#E5EEE8] pb-4 mb-6"><FiUser className="text-[#16804B]" /> Data Pribadi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-[#263238] mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
                        <input type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="Masukkan nama lengkap calon santri" 
                          className={`w-full min-h-[48px] px-4 py-3 rounded-[14px] border ${fieldErrors.nama ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all text-[#263238]`} />
                        {fieldErrors.nama && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.nama}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#263238] mb-2">Tempat Lahir <span className="text-red-500">*</span></label>
                        <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} placeholder="Contoh: Surakarta" 
                          className={`w-full min-h-[48px] px-4 py-3 rounded-[14px] border ${fieldErrors.tempat_lahir ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all`} />
                        {fieldErrors.tempat_lahir && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.tempat_lahir}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#263238] mb-2">Tanggal Lahir <span className="text-red-500">*</span></label>
                        <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} max={today} onChange={handleChange} 
                          className={`w-full min-h-[48px] px-4 py-3 rounded-[14px] border ${fieldErrors.tanggal_lahir ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all`} />
                        {fieldErrors.tanggal_lahir && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.tanggal_lahir}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-[#263238] mb-3">Jenis Kelamin <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                          <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-[14px] cursor-pointer transition-all ${formData.jenis_kelamin === 'L' ? 'border-[#16804B] bg-[#F5FAF7] text-[#14532D] font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            <input type="radio" name="jenis_kelamin" value="L" checked={formData.jenis_kelamin === 'L'} onChange={handleChange} className="w-5 h-5 accent-[#16804B]" /> Laki-laki
                          </label>
                          <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-[14px] cursor-pointer transition-all ${formData.jenis_kelamin === 'P' ? 'border-[#16804B] bg-[#F5FAF7] text-[#14532D] font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                            <input type="radio" name="jenis_kelamin" value="P" checked={formData.jenis_kelamin === 'P'} onChange={handleChange} className="w-5 h-5 accent-[#16804B]" /> Perempuan
                          </label>
                        </div>
                        {fieldErrors.jenis_kelamin && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.jenis_kelamin}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-[#263238] mb-2">Alamat Lengkap <span className="text-red-500">*</span></label>
                        <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows="3" placeholder="Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos" 
                          className={`w-full px-4 py-3 rounded-[14px] border ${fieldErrors.alamat ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all resize-none`}></textarea>
                        {fieldErrors.alamat && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.alamat}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#263238] flex items-center gap-3 border-b border-[#E5EEE8] pb-4 mb-6"><FiPhone className="text-[#16804B]" /> Kontak yang Bisa Dihubungi</h2>
                    <p className="text-sm text-[#6B7280] mb-6 flex gap-2"><FiInfo className="shrink-0 mt-0.5 text-blue-500" /> Nomor WhatsApp dan email digunakan untuk informasi serta proses verifikasi pendaftaran.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-[#263238] mb-2">Nomor WhatsApp <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FiPhone /></span>
                          <input type="tel" name="no_wa" value={formData.no_wa} onChange={handleChange} placeholder="08xxxxxxxxxx" 
                            className={`w-full min-h-[48px] pl-11 pr-4 py-3 rounded-[14px] border ${fieldErrors.no_wa ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all`} />
                        </div>
                        {fieldErrors.no_wa && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.no_wa}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#263238] mb-2">Email Pribadi</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FiMail /></span>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nama@email.com" 
                            className={`w-full min-h-[48px] pl-11 pr-4 py-3 rounded-[14px] border ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all`} />
                        </div>
                        {fieldErrors.email && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.email}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BUAT AKUN */}
              {currentStep === 3 && (
                <div className="animate-fade-in max-w-xl mx-auto">
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#DCFCE7] text-[#16804B] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiLock size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#263238]">Buat Akun Santri</h2>
                    <p className="text-[#6B7280] mt-2 text-sm">Akun ini akan Anda gunakan untuk login dan mengecek status kelulusan secara berkala.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#263238] mb-2">Username <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FiUser /></span>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Minimal 6 karakter, tanpa spasi" 
                          className={`w-full min-h-[48px] pl-11 pr-4 py-3 rounded-[14px] border ${fieldErrors.username ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all bg-gray-50 focus:bg-white`} />
                      </div>
                      {fieldErrors.username && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.username}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#263238] mb-2">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FiLock /></span>
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Minimal 8 karakter" 
                          className={`w-full min-h-[48px] pl-11 pr-12 py-3 rounded-[14px] border ${fieldErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all bg-gray-50 focus:bg-white`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#16804B] outline-none">
                          {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-3">
                          <div className={`h-full transition-all duration-300 ${pwdStrength.width} ${pwdStrength.color}`}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-20 text-right">{pwdStrength.label}</span>
                      </div>
                      {fieldErrors.password && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#263238] mb-2">Konfirmasi Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FiLock /></span>
                        <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Masukkan ulang password" 
                          className={`w-full min-h-[48px] pl-11 pr-12 py-3 rounded-[14px] border ${fieldErrors.confirm_password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'} focus:border-[#16804B] focus:ring-2 focus:ring-[#DCFCE7] outline-none transition-all bg-gray-50 focus:bg-white`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#16804B] outline-none">
                          {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                      </div>
                      {fieldErrors.confirm_password && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.confirm_password}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: KONFIRMASI */}
              {currentStep === 4 && (
                <div className="animate-fade-in max-w-2xl mx-auto">
                  <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-[#263238] mb-2">Tahap Akhir Pendaftaran</h2>
                    <p className="text-[#6B7280] text-sm">Pastikan semua data yang Anda isi sudah benar sebelum mengirimkan pendaftaran.</p>
                  </div>
                  
                  <div className="bg-[#F5FAF7] p-6 rounded-[20px] border border-[#E5EEE8] mb-8">
                    <h4 className="font-bold text-[#14532D] mb-4 border-b border-[#E5EEE8] pb-2">Ringkasan Data</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Program:</span>
                        <span className="font-bold text-[#263238] text-right ml-4">{selectedProgram?.nama}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Nama Lengkap:</span>
                        <span className="font-bold text-[#263238] text-right ml-4">{formData.nama}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Nomor WA:</span>
                        <span className="font-bold text-[#263238] text-right ml-4">{formData.no_wa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6B7280]">Username:</span>
                        <span className="font-bold text-[#263238] text-right ml-4">{formData.username}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className={`flex items-start gap-4 p-5 rounded-[16px] border cursor-pointer transition-colors ${fieldErrors.terms1 ? 'border-red-300 bg-red-50' : formData.terms1 ? 'border-[#16804B] bg-[#DCFCE7]/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" name="terms1" checked={formData.terms1} onChange={handleChange} className="mt-1 w-5 h-5 accent-[#16804B] rounded flex-shrink-0" />
                      <div>
                        <p className={`text-sm font-bold ${fieldErrors.terms1 ? 'text-red-700' : 'text-[#263238]'}`}>Kebenaran Data</p>
                        <p className={`text-xs mt-1 ${fieldErrors.terms1 ? 'text-red-500' : 'text-[#6B7280]'}`}>Saya menyatakan bahwa seluruh data yang saya masukkan adalah benar dan dapat dipertanggungjawabkan.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-4 p-5 rounded-[16px] border cursor-pointer transition-colors ${fieldErrors.terms2 ? 'border-red-300 bg-red-50' : formData.terms2 ? 'border-[#16804B] bg-[#DCFCE7]/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" name="terms2" checked={formData.terms2} onChange={handleChange} className="mt-1 w-5 h-5 accent-[#16804B] rounded flex-shrink-0" />
                      <div>
                        <p className={`text-sm font-bold ${fieldErrors.terms2 ? 'text-red-700' : 'text-[#263238]'}`}>Syarat dan Ketentuan</p>
                        <p className={`text-xs mt-1 ${fieldErrors.terms2 ? 'text-red-500' : 'text-[#6B7280]'}`}>Saya menyetujui syarat dan ketentuan pendaftaran Al Filaha Eco Pesantren. <a href="#" className="text-[#16804B] hover:underline" onClick={(e)=>e.stopPropagation()}>Baca selengkapnya</a></p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

            </div>

            {/* Navigation Buttons Footer */}
            <div className="px-6 md:px-10 py-6 bg-gray-50 border-t border-[#E5EEE8] flex flex-col-reverse md:flex-row items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrev} className="w-full md:w-auto px-8 min-h-[48px] rounded-[14px] border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <FiArrowLeft /> Kembali
                </button>
              ) : (
                <div></div> // empty spacer
              )}

              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="w-full md:w-auto px-8 min-h-[48px] rounded-[14px] bg-[#16804B] hover:bg-[#14532D] text-white font-bold transition-all shadow-md shadow-green-900/10 flex items-center justify-center gap-2">
                  Lanjutkan <FiArrowRight />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full md:w-auto px-10 min-h-[48px] rounded-[14px] bg-[#16804B] hover:bg-[#14532D] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> Mengirim...</>
                  ) : (
                    <><FiCheckCircle size={20} /> Kirim Pendaftaran</>
                  )}
                </button>
              )}
            </div>
            
          </div>
          
          {/* Help Card for Mobile (Bottom) */}
          <div className="lg:hidden w-full mt-2 bg-white p-6 rounded-[24px] border border-[#E5EEE8] shadow-sm">
            <h4 className="font-bold text-[#14532D] flex items-center gap-2 mb-2"><FiMessageCircle /> Butuh Bantuan?</h4>
            <p className="text-sm text-[#6B7280] mb-4">Jika mengalami kendala saat mengisi formulir, silakan hubungi admin.</p>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full min-h-[48px] border-2 border-[#16804B] text-[#16804B] rounded-[14px] font-bold transition-colors">
              <FiPhone /> Hubungi Admin
            </a>
          </div>

        </div>
      </div>

      {/* SUCCESS MODAL UI */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-md p-10 text-center shadow-2xl transform transition-all animate-fade-in-up">
            <div className="mx-auto w-24 h-24 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,160,90,0.4)]">
              <FiCheckCircle className="text-[#16804B] w-12 h-12" />
            </div>
            <h3 className="text-3xl font-extrabold text-[#263238] mb-2">Alhamdulillah!</h3>
            <p className="text-[#6B7280] mb-8 text-lg leading-relaxed">
              Pendaftaran Anda berhasil dikirim. Silakan periksa status pendaftaran Anda.
            </p>
            <button
              onClick={() => navigate("/status-pendaftaran")}
              className="w-full min-h-[48px] bg-[#16804B] hover:bg-[#14532D] text-white font-bold rounded-[14px] shadow-lg hover:-translate-y-1 transition-all text-lg flex items-center justify-center gap-2"
            >
              Lihat Status Pendaftaran <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL PROGRAM */}
      {selectedProgramDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl transform transition-all animate-fade-in-up">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#DCFCE7] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-extrabold text-[#263238]">Detail Program</h3>
                <p className="text-sm text-[#6B7280]">Informasi lengkap dan persyaratan pendaftaran.</p>
              </div>
              <button onClick={() => setSelectedProgramDetail(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all relative z-10">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex gap-4 items-start mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                  <img 
                    src={selectedProgramDetail.poster ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedProgramDetail.poster}` : "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} 
                    alt={selectedProgramDetail.nama} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block
                    ${selectedProgramDetail.jenis === 'pesantren' ? 'bg-[#DCFCE7] text-[#16804B]' : 'bg-blue-100 text-blue-700'}`}>
                    {selectedProgramDetail.jenis}
                  </span>
                  <h4 className="text-xl font-bold text-[#263238] leading-snug">{selectedProgramDetail.judul}</h4>
                  <p className="text-sm font-semibold text-[#16804B] mt-1">{selectedProgramDetail.nama}</p>
                </div>
              </div>

              <div className="bg-[#F5FAF7] border border-[#E5EEE8] p-4 rounded-xl mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#16804B] shadow-sm">
                  <FiCalendar size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Batas Pendaftaran</p>
                  <p className="font-bold text-[#14532D]">{new Date(selectedProgramDetail.batas_akhir).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#263238] mb-3 flex items-center gap-2">
                  <FiInfo className="text-[#16804B]" /> Informasi & Persyaratan
                </h5>
                <div className="prose prose-sm max-w-none text-gray-600 prose-headings:text-[#263238] prose-a:text-[#16804B]">
                  {selectedProgramDetail.keterangan ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedProgramDetail.keterangan }} />
                  ) : (
                    <p className="text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100">Belum ada informasi detail untuk program ini.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedProgramDetail(null)} 
                className="px-6 py-2.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  if(selectedProgramDetail.status !== 'non_aktif') {
                    handleChange({ target: { name: 'program_id', value: selectedProgramDetail.id } });
                    setSelectedProgramDetail(null);
                  }
                }}
                disabled={selectedProgramDetail.status === 'non_aktif'}
                className="px-6 py-2.5 bg-[#16804B] hover:bg-[#14532D] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                {selectedProgramDetail.status === 'non_aktif' ? 'Pendaftaran Ditutup' : 'Pilih & Daftar Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Pendaftaran;
