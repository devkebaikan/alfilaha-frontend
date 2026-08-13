import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiMenu, FiHome, FiSettings, FiLogOut, FiUploadCloud, FiCheck, FiArrowLeft, FiEdit, FiTrash2, FiMap, FiCalendar, FiMessageSquare, FiStar, FiUsers, FiTrendingUp, FiX, FiSearch, FiFilter, FiEye, FiEyeOff, FiActivity, FiClock, FiGrid, FiPlus, FiBell, FiFileText } from 'react-icons/fi';
import Beranda from './Tabs/Beranda/Beranda';
import KelolaArtikel from './Tabs/KelolaArtikel/KelolaArtikel';
import BlogGrid from './Tabs/BlogGrid/BlogGrid';
import Event from './Tabs/Event/Event';
import PaketWisata from './Tabs/PaketWisata/PaketWisata';
import Reservasi from './Tabs/Reservasi/Reservasi';
import Appointment from './Tabs/Appointment/Appointment';

const AlfilahaAdmin = () => {
  const navigate = useNavigate();
  
  // STATE LOGIN
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('alfilaha_admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [logoutModal, setLogoutModal] = useState(false);
  
  // STATE DASHBOARD
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || 'beranda');

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('beranda');
    }
  }, [tab]);

  const handleTabChange = (tabName) => {
    navigate(`/admin/${tabName}`);
    if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close sidebar on mobile after clicking
  };
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const fileInputRef = useRef(null);

  const formatRupiah = (value) => {
    let numberString = value.toString().replace(/[^0-9]/g, '');
    if (numberString) {
      return 'Rp ' + new Intl.NumberFormat('id-ID').format(numberString);
    }
    return '';
  };

  // DATA DUMMY / LOCAL STORAGE
  const defaultData = {
    title: 'Solusi Agrikultur Modern Alfilaha',
    subtitle: 'Kami menyediakan teknologi terbaik untuk hasil panen yang lebih maksimal, berkah, dan berkelanjutan.',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  };

  const [homeData, setHomeData] = useState(() => {
    const saved = localStorage.getItem('alfilaha_home_data');
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [articles, setArticles] = useState([
    { id: 1, title: 'Menjaga Kualitas Beras Organik', date: '12 Okt 2023', image: '/images/blog-new-1.jpg', excerpt: 'Beras organik bebas dari pestisida buatan dan pupuk sintetis, sehingga lebih aman bagi...' },
    { id: 2, title: 'Promo Spesial Ramadhan 1445H', date: '15 Okt 2023', image: '/images/blog-new-2.jpg', excerpt: 'Menyambut bulan suci Ramadhan, Alfilaha memberikan promo khusus untuk semua jenis...' },
    { id: 3, title: 'Pentingnya Irigasi yang Tepat', date: '20 Okt 2023', image: '/images/blog-new-3.jpg', excerpt: 'Sistem irigasi yang efisien adalah kunci keberhasilan pertanian modern untuk...' }
  ]);

  const [blogs, setBlogs] = useState([]);
  const [addBlogModal, setAddBlogModal] = useState({ show: false, title: '', date: '', excerpt: '', image: null });
  const [editBlogModal, setEditBlogModal] = useState({ show: false, id: null, title: '', date: '', excerpt: '', image: null, existingImage: '' });
  const [deleteBlogModal, setDeleteBlogModal] = useState({ show: false, id: null, title: '' });


  const [events, setEvents] = useState([]);
  const [addEventModal, setAddEventModal] = useState({ show: false, title: '', category: 'Kegiatan', date: '', description: '', image: null });
  const [editEventModal, setEditEventModal] = useState({ show: false, id: null, title: '', category: '', date: '', description: '', image: null, existingImage: '' });
  const [deleteEventModal, setDeleteEventModal] = useState({ show: false, id: null, title: '' });

  const [wisata, setWisata] = useState([]);
  const [editWisataModal, setEditWisataModal] = useState({ show: false, id: null, nama_paket: '', harga: '', deskripsi: '' });
  const [addWisataModal, setAddWisataModal] = useState({ show: false, nama_paket: '', harga: '', deskripsi: '' });
  const [deletePaketModal, setDeletePaketModal] = useState({ show: false, id: null, nama_paket: '' });

  const [reservasi, setReservasi] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, nama: '' });
  const [rejectModal, setRejectModal] = useState({ show: false, id: null, nama: '' });

  const [appointments, setAppointments] = useState([]);
  const [deleteAppointmentModal, setDeleteAppointmentModal] = useState({ show: false, id: null, type: '' });

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments`);
      if (!response.ok) throw new Error("Gagal mengambil data appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Backend MySQL offline:", error);
    }
  };

  const fetchReservasi = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/reservasi`);
      if (!response.ok) throw new Error("Gagal mengambil data MySQL");
      const data = await response.json();
      setReservasi(data);
    } catch (error) {
      console.error("Backend MySQL offline:", error);
    }
  };

  const fetchWisata = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket`);
      if(response.ok) {
        const data = await response.json();
        setWisata(data);
      }
    } catch(err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const updateWisata = async (e) => {
    e.preventDefault();
    let finalHarga = editWisataModal.harga.trim();
    if (!finalHarga.toLowerCase().startsWith('rp')) {
      finalHarga = `Rp ${finalHarga}`;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket/${editWisataModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_paket: editWisataModal.nama_paket,
          harga: finalHarga,
          deskripsi: editWisataModal.deskripsi
        })
      });

      if(response.ok) {
        showToast("Data paket wisata berhasil diperbarui!");
        setEditWisataModal({ show: false, id: null, nama_paket: '', harga: '', deskripsi: '' });
        fetchWisata();
      } else {
        showToast("Gagal memperbarui paket.");
      }
    } catch(err) {
      console.error("Update Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const tambahWisata = async (e) => {
    e.preventDefault();
    let finalHarga = addWisataModal.harga.trim();
    if (!finalHarga.toLowerCase().startsWith('rp')) {
      finalHarga = `Rp ${finalHarga}`;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_paket: addWisataModal.nama_paket,
          harga: finalHarga,
          deskripsi: addWisataModal.deskripsi
        })
      });

      if(response.ok) {
        showToast("Paket wisata baru berhasil ditambahkan!");
        setAddWisataModal({ show: false, nama_paket: '', harga: '', deskripsi: '' });
        fetchWisata();
      } else {
        showToast("Gagal menambahkan paket.");
      }
    } catch(err) {
      console.error("Add Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusWisata = async (id) => {
    setDeletePaketModal({ show: false, id: null, nama_paket: '' });
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket/${id}`, { method: "DELETE" });
      if(response.ok) {
        fetchWisata();
        showToast("Data paket wisata berhasil dihapus!");
      } else {
        showToast("Gagal menghapus data dari server!");
      }
    } catch(err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events`);
      if(response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch(err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const addEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', addEventModal.title);
    formData.append('category', addEventModal.category);
    formData.append('date', addEventModal.date);
    formData.append('description', addEventModal.description);
    if (addEventModal.image) formData.append('image', addEventModal.image);

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events`, {
        method: "POST",
        body: formData
      });
      if(response.ok) {
        showToast("Event berhasil ditambahkan!");
        setAddEventModal({ show: false, title: '', category: 'Kegiatan', date: '', description: '', image: null });
        fetchEvents();
      } else {
        showToast("Gagal menambahkan Event.");
      }
    } catch(err) {
      console.error("Add Event Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const updateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editEventModal.title);
    formData.append('category', editEventModal.category);
    formData.append('date', editEventModal.date);
    formData.append('description', editEventModal.description);
    if (editEventModal.image) formData.append('image', editEventModal.image);

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events/${editEventModal.id}`, {
        method: "PUT",
        body: formData
      });
      if(response.ok) {
        showToast("Event berhasil diperbarui!");
        setEditEventModal({ show: false, id: null, title: '', category: '', date: '', description: '', image: null, existingImage: '' });
        fetchEvents();
      } else {
        showToast("Gagal memperbarui Event.");
      }
    } catch(err) {
      console.error("Update Event Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusEvent = async (id) => {
    setDeleteEventModal({ show: false, id: null, title: '' });
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events/${id}`, { method: "DELETE" });
      if(response.ok) {
        fetchEvents();
        showToast("Event berhasil dihapus!");
      } else {
        showToast("Gagal menghapus Event dari server!");
      }
    } catch(err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs`);
      if(response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch(err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const addBlog = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', addBlogModal.title);
    formData.append('date', addBlogModal.date);
    formData.append('excerpt', addBlogModal.excerpt);
    if (addBlogModal.image) formData.append('image', addBlogModal.image);

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs`, {
        method: "POST",
        body: formData
      });
      if(response.ok) {
        showToast("Blog berhasil ditambahkan!");
        setAddBlogModal({ show: false, title: '', date: '', excerpt: '', image: null });
        fetchBlogs();
      } else {
        showToast("Gagal menambahkan Blog.");
      }
    } catch(err) {
      console.error("Add Blog Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const updateBlog = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editBlogModal.title);
    formData.append('date', editBlogModal.date);
    formData.append('excerpt', editBlogModal.excerpt);
    if (editBlogModal.image) formData.append('image', editBlogModal.image);

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs/${editBlogModal.id}`, {
        method: "PUT",
        body: formData
      });
      if(response.ok) {
        showToast("Blog berhasil diperbarui!");
        setEditBlogModal({ show: false, id: null, title: '', date: '', excerpt: '', image: null, existingImage: '' });
        fetchBlogs();
      } else {
        showToast("Gagal memperbarui Blog.");
      }
    } catch(err) {
      console.error("Update Blog Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusBlog = async (id) => {
    setDeleteBlogModal({ show: false, id: null, title: '' });
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs/${id}`, { method: "DELETE" });
      if(response.ok) {
        fetchBlogs();
        showToast("Blog berhasil dihapus!");
      } else {
        showToast("Gagal menghapus Blog dari server!");
      }
    } catch(err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchReservasi();
      fetchWisata();
      fetchEvents();
      fetchBlogs();
      fetchAppointments();
      // Auto refresh tiap 2 detik untuk update otomatis dari form
      const interval = setInterval(() => {
        fetchReservasi();
        fetchAppointments();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const updateStatusReservasi = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/reservasi/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      
      if(response.ok) {
        fetchReservasi();
        showToast(`Reservasi berhasil ${status === 'Diterima' ? 'diterima' : 'ditolak'}!`);
      } else {
        showToast("Gagal memperbarui status di MySQL!");
      }
    } catch (error) {
      console.error("Backend Error:", error);
      showToast("Koneksi ke database MySQL terputus.");
    }
  };

  const confirmHapusReservasi = async (id) => {
    setDeleteModal({ show: false, id: null, nama: '' });
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/reservasi/${id}`, { method: "DELETE" });
      if(response.ok) {
        fetchReservasi();
        showToast("Data berhasil dihapus!");
      } else {
        showToast("Gagal menghapus data dari server!");
      }
    } catch(err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  const updateStatusAppointment = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      
      if(response.ok) {
        fetchAppointments();
        showToast(`Appointment berhasil ${status === 'Diterima' ? 'diterima' : 'ditolak'}!`);
      } else {
        showToast("Gagal memperbarui status di MySQL!");
      }
    } catch (error) {
      console.error("Backend Error:", error);
      showToast("Koneksi ke database MySQL terputus.");
    }
  };

  const confirmHapusAppointment = async (id) => {
    setDeleteAppointmentModal({ show: false, id: null, type: '' });
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments/${id}`, { method: "DELETE" });
      if(response.ok) {
        fetchAppointments();
        showToast("Data appointment berhasil dihapus!");
      } else {
        showToast("Gagal menghapus data dari server!");
      }
    } catch(err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };



  // HANDLER LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    // Animasi proses (delay 1.5 detik)
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('alfilaha_admin_token', data.token);
        setIsLoggedIn(true);
        showToast('Login Berhasil! Selamat datang di Dashboard.');
      } else {
        setLoginError(data.error || 'Username atau Password salah!');
      }
    } catch (err) {
      setLoginError('Koneksi ke server gagal. Pastikan backend menyala.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setLogoutModal(true);
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // HANDLER UPDATE HOME
  const handleHomeChange = (e) => {
    setHomeData({ ...homeData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHomeData({ ...homeData, imageUrl: URL.createObjectURL(file) });
    }
  };

  const saveHomeData = (e) => {
    e.preventDefault();
    showToast('Perubahan halaman utama berhasil disimpan!');
  };

  // ==========================================
  // RENDER LOGIN SCREEN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden transition-all">
          <div className="bg-white p-10 text-center border-b border-gray-100 flex flex-col items-center">
            <img loading="lazy" src="/images/logo.png" alt="Alfilaha Logo" className="h-16 mb-3 object-contain" />
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Administrator Panel</p>
          </div>
          <div className="p-8">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 text-center font-bold border border-red-100">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  placeholder="Masukkan Username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                    placeholder="Masukkan Password"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loginLoading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all flex items-center justify-center space-x-3 ${
                  loginLoading ? 'bg-green-400 cursor-wait' : 'bg-green-600 hover:bg-green-700 hover:-translate-y-1 hover:shadow-green-500/30'
                }`}
              >
                {loginLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Masuk Dashboard</span>
                )}
              </button>
            </form>
            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <button onClick={() => navigate('/')} className="text-gray-400 hover:text-green-600 text-sm font-bold transition flex items-center justify-center mx-auto space-x-2">
                <FiArrowLeft /> <span>Kembali ke Website Utama</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER DASHBOARD SCREEN
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800 selection:bg-green-200">
      
      {/* SIDEBAR & MOBILE OVERLAY */}
      {isSidebarOpen && <div className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}
      <aside className={`fixed lg:static top-0 left-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-gray-100 flex flex-col items-start justify-center">
          <img loading="lazy" src="/images/logo.png" alt="Alfilaha Logo" className="h-10 mb-2 object-contain" />
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold pl-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-5 space-y-3">
          <button
            onClick={() => handleTabChange('beranda')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'beranda' 
              ? 'bg-green-50 text-green-900 font-bold shadow-inner' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <FiHome className="text-xl" />
            <span>Beranda Website</span>
          </button>
          
          <button
            onClick={() => handleTabChange('wisata')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'wisata' 
              ? 'bg-green-50 text-green-900 font-bold shadow-inner' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <FiMap className="text-xl" />
            <span>Paket Wisata</span>
          </button>
          
          <button
            onClick={() => handleTabChange('reservasi')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'reservasi' 
              ? 'bg-green-50 text-green-900 font-bold shadow-inner' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <FiCalendar className="text-xl" />
            <span>Reservasi</span>
          </button>

          <button
            onClick={() => handleTabChange('appointment')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'appointment' 
              ? 'bg-green-50 text-green-900 font-bold shadow-inner' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <FiMessageSquare className="text-xl" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={() => handleTabChange('artikel')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'artikel' 
              ? 'bg-green-50 text-green-700 font-bold shadow-inner' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <FiEdit className="text-xl" />
            <span>Kelola Artikel</span>
          </button>

          <button
            onClick={() => handleTabChange('event')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'event' 
              ? 'bg-green-50 text-green-700 font-bold shadow-inner' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <FiActivity className="text-xl" />
            <span>Event & Kegiatan</span>
          </button>

          <button
            onClick={() => handleTabChange('blogGrid')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'blogGrid' 
              ? 'bg-green-50 text-green-700 font-bold shadow-inner' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium'
            }`}
          >
            <FiGrid className="text-xl" />
            <span>Blog Grid</span>
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100 space-y-3">
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold text-gray-600 hover:text-green-700 transition bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-100">
            <FiArrowLeft />
            <span>Website Utama</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold text-red-500 hover:text-white transition hover:bg-red-500 rounded-xl border border-red-50 hover:border-red-500 bg-red-50">
            <FiLogOut />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        
        {/* HEADER */}
        <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 shadow-sm shrink-0 sticky top-0 z-40">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl mr-3 transition">
              <FiMenu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight hidden sm:block">Dashboard Overview</h2>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="relative cursor-pointer hover:bg-gray-100 p-2.5 rounded-full transition" onClick={() => handleTabChange('reservasi')} title="Reservasi Pending">
              <FiBell className="w-6 h-6 text-gray-500" />
              {reservasi.filter(r => r.status === 'Pending').length > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 py-2 px-5 rounded-full border border-gray-100">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">Admin Utama</p>
                <p className="text-[11px] text-green-600 font-bold uppercase tracking-wider">Online</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-6xl mx-auto">
            
            {activeTab === 'beranda' && <Beranda reservasi={reservasi} blogs={blogs} events={events} handleTabChange={handleTabChange} />}
            {activeTab === 'artikel' && <KelolaArtikel articles={articles} showToast={showToast} />}
            {activeTab === 'blogGrid' && <BlogGrid blogs={blogs} setAddBlogModal={setAddBlogModal} setEditBlogModal={setEditBlogModal} setDeleteBlogModal={setDeleteBlogModal} />}
            {activeTab === 'event' && <Event events={events} setAddEventModal={setAddEventModal} setEditEventModal={setEditEventModal} setDeleteEventModal={setDeleteEventModal} />}
            {activeTab === 'wisata' && <PaketWisata wisata={wisata} setAddWisataModal={setAddWisataModal} setEditWisataModal={setEditWisataModal} setDeletePaketModal={setDeletePaketModal} />}
            {activeTab === 'reservasi' && <Reservasi reservasi={reservasi} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} updateStatusReservasi={updateStatusReservasi} setRejectModal={setRejectModal} setDeleteModal={setDeleteModal} />}
            {activeTab === 'appointment' && <Appointment appointments={appointments} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} updateStatusAppointment={updateStatusAppointment} setDeleteModal={setDeleteAppointmentModal} />}



          </div>
        </div>
      </main>

      {/* REJECT MODAL */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setRejectModal({ show: false, id: null, nama: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-orange-100">
              <FiX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Tolak Reservasi?</h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Apakah Anda yakin ingin menolak permohonan reservasi atas nama <span className="font-bold text-gray-800">"{rejectModal.nama}"</span>? Status pesanan akan diubah menjadi <span className="font-bold text-orange-500 uppercase tracking-wider">Ditolak</span> dan tidak dapat dikembalikan ke status Pending.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setRejectModal({ show: false, id: null, nama: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Kembali
              </button>
              <button 
                onClick={() => {
                  updateStatusReservasi(rejectModal.id, 'Ditolak');
                  setRejectModal({ show: false, id: null, nama: '' });
                }}
                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteModal({ show: false, id: null, nama: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Hapus Reservasi?</h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Data atas nama <span className="font-bold text-gray-800">"{deleteModal.nama}"</span> akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeleteModal({ show: false, id: null, nama: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button 
                onClick={() => confirmHapusReservasi(deleteModal.id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE APPOINTMENT MODAL */}
      {deleteAppointmentModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteAppointmentModal({ show: false, id: null, type: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Hapus Appointment?</h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Data appointment ini akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeleteAppointmentModal({ show: false, id: null, type: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button 
                onClick={() => confirmHapusAppointment(deleteAppointmentModal.id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WISATA MODAL */}
      {editWisataModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditWisataModal({ show: false, id: null, nama_paket: '', harga: '', deskripsi: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6">Ubah Paket Wisata</h3>
            <form onSubmit={updateWisata} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Paket</label>
                <input type="text" required value={editWisataModal.nama_paket} onChange={(e) => setEditWisataModal({...editWisataModal, nama_paket: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Harga & Satuan</label>
                <input type="text" required value={editWisataModal.harga} onChange={(e) => setEditWisataModal({...editWisataModal, harga: formatRupiah(e.target.value)})} placeholder="Contoh: Rp 50.000" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Fasilitas / Deskripsi</label>
                <textarea required value={editWisataModal.deskripsi} onChange={(e) => setEditWisataModal({...editWisataModal, deskripsi: e.target.value})} rows="3" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setEditWisataModal({ show: false, id: null, nama_paket: '', harga: '', deskripsi: '' })} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAMBAH WISATA MODAL */}
      {addWisataModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setAddWisataModal({ show: false, nama_paket: '', harga: '', deskripsi: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6">Tambah Paket Wisata</h3>
            <form onSubmit={tambahWisata} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Paket</label>
                <input type="text" required value={addWisataModal.nama_paket} onChange={(e) => setAddWisataModal({...addWisataModal, nama_paket: e.target.value})} placeholder="Contoh: Paket Wisata Lebaran" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Harga & Satuan</label>
                <input type="text" required value={addWisataModal.harga} onChange={(e) => setAddWisataModal({...addWisataModal, harga: formatRupiah(e.target.value)})} placeholder="Contoh: Rp 50.000" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Fasilitas / Deskripsi</label>
                <textarea required value={addWisataModal.deskripsi} onChange={(e) => setAddWisataModal({...addWisataModal, deskripsi: e.target.value})} rows="3" placeholder="Contoh: Free souvenir, lunch, dsb..." className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setAddWisataModal({ show: false, nama_paket: '', harga: '', deskripsi: '' })} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition">Tambahkan Paket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PAKET WISATA MODAL */}
      {deletePaketModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeletePaketModal({ show: false, id: null, nama_paket: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Hapus Paket?</h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Paket <span className="font-bold text-gray-800">"{deletePaketModal.nama_paket}"</span> akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setDeletePaketModal({ show: false, id: null, nama_paket: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button 
                onClick={() => confirmHapusWisata(deletePaketModal.id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {addEventModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setAddEventModal({ ...addEventModal, show: false })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-xl mr-3"><FiActivity /></span>
              Tambah Event Baru
            </h3>
            <form onSubmit={addEvent} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Event</label>
                <input type="text" required value={addEventModal.title} onChange={(e) => setAddEventModal({...addEventModal, title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" placeholder="Contoh: Panen Raya Berkebun" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                  <select value={addEventModal.category} onChange={(e) => setAddEventModal({...addEventModal, category: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer">
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Event">Event Spesial</option>
                    <option value="Pelatihan">Pelatihan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
                  <input type="date" required value={addEventModal.date} onChange={(e) => setAddEventModal({...addEventModal, date: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Gambar / Poster</label>
                <input type="file" accept="image/*" onChange={(e) => setAddEventModal({...addEventModal, image: e.target.files[0]})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
                {addEventModal.image && (
                  <div className="mt-4 relative h-32 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <img loading="lazy" src={URL.createObjectURL(addEventModal.image)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Singkat</label>
                <textarea required rows="3" value={addEventModal.description} onChange={(e) => setAddEventModal({...addEventModal, description: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" placeholder="Tuliskan detail acara di sini..."></textarea>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setAddEventModal({ ...addEventModal, show: false })} className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">Simpan Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editEventModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setEditEventModal({ ...editEventModal, show: false })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-xl mr-3"><FiEdit /></span>
              Edit Event
            </h3>
            <form onSubmit={updateEvent} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Event</label>
                <input type="text" required value={editEventModal.title} onChange={(e) => setEditEventModal({...editEventModal, title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                  <select value={editEventModal.category} onChange={(e) => setEditEventModal({...editEventModal, category: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer">
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Event">Event Spesial</option>
                    <option value="Pelatihan">Pelatihan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
                  <input type="date" required value={editEventModal.date} onChange={(e) => setEditEventModal({...editEventModal, date: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ganti Gambar (Opsional)</label>
                <input type="file" accept="image/*" onChange={(e) => setEditEventModal({...editEventModal, image: e.target.files[0]})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
                {editEventModal.image && (
                  <div className="mt-4 relative h-32 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <img loading="lazy" src={URL.createObjectURL(editEventModal.image)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {editEventModal.existingImage && <p className="text-xs text-gray-500 mt-2">Gambar saat ini: {editEventModal.existingImage}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Singkat</label>
                <textarea required rows="3" value={editEventModal.description} onChange={(e) => setEditEventModal({...editEventModal, description: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"></textarea>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditEventModal({ ...editEventModal, show: false })} className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EVENT MODAL */}
      {deleteEventModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteEventModal({ show: false, id: null, title: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Hapus Event?</h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Data event <span className="font-bold text-gray-800">"{deleteEventModal.title}"</span> akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteEventModal({ show: false, id: null, title: '' })} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
              <button onClick={() => confirmHapusEvent(deleteEventModal.id)} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md transition">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {logoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setLogoutModal(false)}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiLogOut className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Keluar Dashboard?</h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Sesi Anda akan diakhiri dan Anda perlu masuk kembali menggunakan Username dan Password.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setLogoutModal(false);
                  localStorage.removeItem('alfilaha_admin_token');
                  setIsLoggedIn(false);
                  setUsername('');
                  setPassword('');
                }}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BLOG MODAL */}
      {addBlogModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setAddBlogModal({ show: false, title: '', date: '', excerpt: '', image: null })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6">Tambah Artikel Blog</h3>
            <form onSubmit={addBlog} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Artikel</label>
                <input type="text" required value={addBlogModal.title} onChange={(e) => setAddBlogModal({...addBlogModal, title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Posting</label>
                <input type="date" required value={addBlogModal.date} onChange={(e) => setAddBlogModal({...addBlogModal, date: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Gambar Utama</label>
                <input type="file" required accept="image/*" onChange={(e) => setAddBlogModal({...addBlogModal, image: e.target.files[0]})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
                {addBlogModal.image && (
                  <div className="mt-4 relative h-32 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <img loading="lazy" src={URL.createObjectURL(addBlogModal.image)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cuplikan (Excerpt)</label>
                <textarea required rows="3" value={addBlogModal.excerpt} onChange={(e) => setAddBlogModal({...addBlogModal, excerpt: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"></textarea>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setAddBlogModal({ show: false, title: '', date: '', excerpt: '', image: null })} className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">Simpan Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BLOG MODAL */}
      {editBlogModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEditBlogModal({ show: false, id: null, title: '', date: '', excerpt: '', image: null, existingImage: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6">Edit Artikel Blog</h3>
            <form onSubmit={updateBlog} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Artikel</label>
                <input type="text" required value={editBlogModal.title} onChange={(e) => setEditBlogModal({...editBlogModal, title: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Posting</label>
                <input type="date" required value={editBlogModal.date} onChange={(e) => setEditBlogModal({...editBlogModal, date: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ganti Gambar (Opsional)</label>
                <input type="file" accept="image/*" onChange={(e) => setEditBlogModal({...editBlogModal, image: e.target.files[0]})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium" />
                {editBlogModal.image && (
                  <div className="mt-4 relative h-32 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <img loading="lazy" src={URL.createObjectURL(editBlogModal.image)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {editBlogModal.existingImage && <p className="text-xs text-gray-500 mt-2">Gambar saat ini: {editBlogModal.existingImage}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cuplikan (Excerpt)</label>
                <textarea required rows="3" value={editBlogModal.excerpt} onChange={(e) => setEditBlogModal({...editBlogModal, excerpt: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"></textarea>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditBlogModal({ show: false, id: null, title: '', date: '', excerpt: '', image: null, existingImage: '' })} className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BLOG MODAL */}
      {deleteBlogModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteBlogModal({ show: false, id: null, title: '' })}></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">Hapus Blog?</h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Artikel blog <span className="font-bold text-gray-800">"{deleteBlogModal.title}"</span> akan dihapus permanen. Apakah Anda yakin?
            </p>
            <div className="flex space-x-3 border-t border-gray-50 pt-5">
              <button 
                onClick={() => setDeleteBlogModal({ show: false, id: null, title: '' })} 
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button 
                onClick={() => confirmHapusBlog(deleteBlogModal.id)} 
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div className={`fixed bottom-10 right-10 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} z-50`}>
        <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border border-gray-800">
          <div className="bg-green-500 p-2 rounded-full text-white shadow-inner">
            <FiCheck className="w-5 h-5 font-bold" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide">Sukses!</p>
            <p className="text-xs text-gray-300 mt-0.5">{toast.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlfilahaAdmin;
