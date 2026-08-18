import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiMenu,
  FiHome,
  FiSettings,
  FiLogOut,
  FiUploadCloud,
  FiCheck,
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiMap,
  FiCalendar,
  FiMessageSquare,
  FiStar,
  FiUsers,
  FiTrendingUp,
  FiX,
  FiSearch,
  FiFilter,
  FiEye,
  FiEyeOff,
  FiActivity,
  FiClock,
  FiGrid,
  FiPlus,
  FiBell,
  FiFileText,
} from "react-icons/fi";
import Beranda from "./Tabs/Beranda/Beranda";
import BlogGrid from "./Tabs/BlogGrid/BlogGrid";
import Event from "./Tabs/Event/Event";
import PaketWisata from "./Tabs/PaketWisata/PaketWisata";
import Reservasi from "./Tabs/Reservasi/Reservasi";
import BlogForm from "./Tabs/BlogForm/BlogForm";
import GaleriManager from "./Tabs/Galeri/GaleriManager";
import Appointment from "./Tabs/Appointment/Appointment";

const AlfilahaAdmin = () => {
  const navigate = useNavigate();

  // STATE LOGIN
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("alfilaha_admin_token"),
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [logoutModal, setLogoutModal] = useState(false);

  // STATE DASHBOARD
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || "beranda");

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("beranda");
    }
  }, [tab]);

  // If not logged in and accessing a specific tab, redirect to /admin
  useEffect(() => {
    if (!isLoggedIn && tab) {
      navigate("/admin", { replace: true });
    }
  }, [isLoggedIn, tab, navigate]);

  const handleTabChange = (tabName) => {
    navigate(`/admin/${tabName}`);
    if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close sidebar on mobile after clicking
  };
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const fileInputRef = useRef(null);

  const formatRupiah = (value) => {
    let numberString = value.toString().replace(/[^0-9]/g, "");
    if (numberString) {
      return "Rp " + new Intl.NumberFormat("id-ID").format(numberString);
    }
    return "";
  };

  // DATA DUMMY / LOCAL STORAGE
  const defaultData = {
    title: "Solusi Agrikultur Modern Alfilaha",
    subtitle:
      "Kami menyediakan teknologi terbaik untuk hasil panen yang lebih maksimal, berkah, dan berkelanjutan.",
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  };

  const [homeData, setHomeData] = useState(() => {
    const saved = localStorage.getItem("alfilaha_home_data");
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deleteBlogModal, setDeleteBlogModal] = useState({
    show: false,
    id: null,
    title: "",
  });

  const [events, setEvents] = useState([]);
  const [addEventModal, setAddEventModal] = useState({
    show: false,
    title: "",
    category: "Kegiatan",
    date: "",
    description: "",
    image: null,
  });
  const [editEventModal, setEditEventModal] = useState({
    show: false,
    id: null,
    title: "",
    category: "",
    date: "",
    description: "",
    image: null,
    existingImage: "",
  });
  const [deleteEventModal, setDeleteEventModal] = useState({
    show: false,
    id: null,
    title: "",
  });

  const [wisata, setWisata] = useState([]);
  const [editWisataModal, setEditWisataModal] = useState({
    show: false,
    id: null,
    nama_paket: "",
    harga: "",
    deskripsi: "",
  });
  const [addWisataModal, setAddWisataModal] = useState({
    show: false,
    nama_paket: "",
    harga: "",
    deskripsi: "",
  });
  const [deletePaketModal, setDeletePaketModal] = useState({
    show: false,
    id: null,
    nama_paket: "",
  });

  const [galeri, setGaleri] = useState([]);
  const [isGaleriOpen, setIsGaleriOpen] = useState(false); // Sidebar Galeri Dropdown

  const fetchGaleri = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri`,
      );
      if (response.ok) {
        const data = await response.json();
        setGaleri(data);
      }
    } catch (err) {
      console.error("Gagal menarik data Galeri", err);
    }
  };

  const [reservasi, setReservasi] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    id: null,
    nama: "",
  });
  const [rejectModal, setRejectModal] = useState({
    show: false,
    id: null,
    nama: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [deleteAppointmentModal, setDeleteAppointmentModal] = useState({
    show: false,
    id: null,
    type: "",
  });

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments`,
      );
      if (!response.ok) throw new Error("Gagal mengambil data appointments");
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Backend MySQL offline:", error);
    }
  };

  const fetchReservasi = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/reservasi`,
      );
      if (!response.ok) throw new Error("Gagal mengambil data MySQL");
      const data = await response.json();
      setReservasi(data);
    } catch (error) {
      console.error("Backend MySQL offline:", error);
    }
  };

  const fetchWisata = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket`,
      );
      if (response.ok) {
        const data = await response.json();
        setWisata(data);
      }
    } catch (err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const updateWisata = async (e) => {
    e.preventDefault();
    let finalHarga = editWisataModal.harga.trim();
    if (!finalHarga.toLowerCase().startsWith("rp")) {
      finalHarga = `Rp ${finalHarga}`;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket/${editWisataModal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_paket: editWisataModal.nama_paket,
            harga: finalHarga,
            deskripsi: editWisataModal.deskripsi,
          }),
        },
      );

      if (response.ok) {
        showToast("Data paket wisata berhasil diperbarui!");
        setEditWisataModal({
          show: false,
          id: null,
          nama_paket: "",
          harga: "",
          deskripsi: "",
        });
        fetchWisata();
      } else {
        showToast("Gagal memperbarui paket.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const tambahWisata = async (e) => {
    e.preventDefault();
    let finalHarga = addWisataModal.harga.trim();
    if (!finalHarga.toLowerCase().startsWith("rp")) {
      finalHarga = `Rp ${finalHarga}`;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_paket: addWisataModal.nama_paket,
            harga: finalHarga,
            deskripsi: addWisataModal.deskripsi,
          }),
        },
      );

      if (response.ok) {
        showToast("Paket wisata baru berhasil ditambahkan!");
        setAddWisataModal({
          show: false,
          nama_paket: "",
          harga: "",
          deskripsi: "",
        });
        fetchWisata();
      } else {
        showToast("Gagal menambahkan paket.");
      }
    } catch (err) {
      console.error("Add Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusWisata = async (id) => {
    setDeletePaketModal({ show: false, id: null, nama_paket: "" });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchWisata();
        showToast("Data paket wisata berhasil dihapus!");
      } else {
        showToast("Gagal menghapus data dari server!");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events`,
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const addEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", addEventModal.title);
    formData.append("category", addEventModal.category);
    formData.append("date", addEventModal.date);
    formData.append("description", addEventModal.description);
    if (addEventModal.image) formData.append("image", addEventModal.image);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (response.ok) {
        showToast("Event berhasil ditambahkan!");
        setAddEventModal({
          show: false,
          title: "",
          category: "Kegiatan",
          date: "",
          description: "",
          image: null,
        });
        fetchEvents();
      } else {
        showToast("Gagal menambahkan Event.");
      }
    } catch (err) {
      console.error("Add Event Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const updateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", editEventModal.title);
    formData.append("category", editEventModal.category);
    formData.append("date", editEventModal.date);
    formData.append("description", editEventModal.description);
    if (editEventModal.image) formData.append("image", editEventModal.image);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events/${editEventModal.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );
      if (response.ok) {
        showToast("Event berhasil diperbarui!");
        setEditEventModal({
          show: false,
          id: null,
          title: "",
          category: "",
          date: "",
          description: "",
          image: null,
          existingImage: "",
        });
        fetchEvents();
      } else {
        showToast("Gagal memperbarui Event.");
      }
    } catch (err) {
      console.error("Update Event Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusEvent = async (id) => {
    setDeleteEventModal({ show: false, id: null, title: "" });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchEvents();
        showToast("Event berhasil dihapus!");
      } else {
        showToast("Gagal menghapus Event dari server!");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs`,
      );
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const handleOpenBlogForm = (blog = null) => {
    setEditingBlog(blog);
    setActiveTab("blog-form");
  };

  const saveBlog = async (formData, id = null) => {
    try {
      const url = id
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs/${id}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs`;

      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        showToast(`Blog berhasil ${id ? "diperbarui" : "ditambahkan"}!`);
        fetchBlogs();
        setActiveTab("blog-grid");
      } else {
        showToast(`Gagal ${id ? "memperbarui" : "menambahkan"} Blog.`);
      }
    } catch (err) {
      console.error("Save Blog Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusBlog = async (id) => {
    setDeleteBlogModal({ show: false, id: null, title: "" });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchBlogs();
        showToast("Blog berhasil dihapus!");
      } else {
        showToast("Gagal menghapus Blog dari server!");
      }
    } catch (err) {
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
      fetchGaleri();
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
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/reservasi/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (response.ok) {
        fetchReservasi();
        showToast(
          `Reservasi berhasil ${status === "Diterima" ? "diterima" : "ditolak"}!`,
        );
      } else {
        showToast("Gagal memperbarui status di MySQL!");
      }
    } catch (error) {
      console.error("Backend Error:", error);
      showToast("Koneksi ke database MySQL terputus.");
    }
  };

  const confirmHapusReservasi = async (id) => {
    setDeleteModal({ show: false, id: null, nama: "" });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/reservasi/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchReservasi();
        showToast("Data berhasil dihapus!");
      } else {
        showToast("Gagal menghapus data dari server!");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  const updateStatusAppointment = async (id, status) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (response.ok) {
        fetchAppointments();
        showToast(
          `Appointment berhasil ${status === "Diterima" ? "diterima" : "ditolak"}!`,
        );
      } else {
        showToast("Gagal memperbarui status di MySQL!");
      }
    } catch (error) {
      console.error("Backend Error:", error);
      showToast("Koneksi ke database MySQL terputus.");
    }
  };

  const confirmHapusAppointment = async (id) => {
    setDeleteAppointmentModal({ show: false, id: null, type: "" });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchAppointments();
        showToast("Data appointment berhasil dihapus!");
      } else {
        showToast("Gagal menghapus data dari server!");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  // HANDLER LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    // Animasi proses (delay 1.5 detik)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("alfilaha_admin_token", data.token);
        setIsLoggedIn(true);
        showToast("Login Berhasil! Selamat datang di Dashboard.");
      } else {
        setLoginError(data.error || "Username atau Password salah!");
      }
    } catch (err) {
      setLoginError("Koneksi ke server gagal. Pastikan backend menyala.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setLogoutModal(true);
  };

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
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
    showToast("Perubahan halaman utama berhasil disimpan!");
  };

  // ==========================================
  // RENDER LOGIN SCREEN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-emerald-900">
        {/* Subtle animated background shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="p-8 sm:p-10 pb-6 text-center flex flex-col items-center">
              <img
                loading="lazy"
                src="/images/logo.png"
                alt="Alfilaha Logo"
                className="h-20 mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              />
              <h2 className="text-2xl font-bold text-white tracking-wide">
                Administrator Panel
              </h2>
              <p className="mt-2 text-green-100/70 text-sm font-medium">
                Masuk untuk mengelola sistem Alfilaha
              </p>
            </div>

            <div className="px-6 sm:px-8 pb-8 sm:pb-10">
              {loginError && (
                <div className="bg-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6 text-center font-bold border border-red-500/30 flex items-center justify-center space-x-2">
                  <FiX className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-green-50 mb-1.5 ml-1">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUsers className="h-5 w-5 text-green-200/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-white/30 focus:border-white/40 outline-none transition-all bg-white/5 focus:bg-white/10 text-white placeholder-green-100/30 font-medium"
                      placeholder="Masukkan Username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-50 mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiSettings className="h-5 w-5 text-green-200/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-white/30 focus:border-white/40 outline-none transition-all bg-white/5 focus:bg-white/10 text-white placeholder-green-100/30 font-medium"
                      placeholder="Masukkan Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-200/50 hover:text-white focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`relative w-full overflow-hidden rounded-xl text-green-950 font-bold text-lg py-3.5 shadow-lg transition-all flex items-center justify-center space-x-2 group ${
                      loginLoading
                        ? "bg-white/50 cursor-wait"
                        : "bg-white hover:bg-green-50 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)]"
                    }`}
                  >
                    <div className="relative flex items-center justify-center space-x-2">
                      {loginLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-green-900"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span>Masuk Dashboard</span>
                          <FiArrowLeft className="w-5 h-5 rotate-180 transform group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-white/10">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex justify-center items-center space-x-2 text-sm font-medium text-green-100/60 hover:text-white transition-colors group"
                >
                  <FiArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  <span>Kembali ke Website Utama</span>
                </button>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-green-100/40 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} Alfilaha. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER DASHBOARD SCREEN
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-800 selection:bg-green-200">
      {/* SIDEBAR & MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-green-950/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-72 bg-gradient-to-b from-green-950 to-emerald-950 flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-8 border-b border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
          <img
            loading="lazy"
            src="/images/logo.png"
            alt="Alfilaha Logo"
            className="h-14 mb-3 object-contain drop-shadow-lg relative z-10"
          />
          <p className="text-green-300 text-[10px] uppercase tracking-[0.2em] font-bold relative z-10">
            Admin Workspace
          </p>
        </div>

        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          <button
            onClick={() => handleTabChange("beranda")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "beranda"
                ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "beranda" ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}`}
            >
              <FiHome size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Beranda
            </span>
          </button>

          <button
            onClick={() => handleTabChange("wisata")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "wisata"
                ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "wisata" ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}`}
            >
              <FiMap size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Eduwisata
            </span>
          </button>

          <button
            onClick={() => handleTabChange("reservasi")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "reservasi"
                ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "reservasi" ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}`}
            >
              <FiBell size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Reservasi
            </span>
            {reservasi.filter((r) => r.status === "Pending").length > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shrink-0">
                {reservasi.filter((r) => r.status === "Pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("appointment")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "appointment"
                ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "appointment" ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}`}
            >
              <FiMessageSquare size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Pesan Masuk
            </span>
            {appointments.filter((r) => r.status === "Pending").length > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shrink-0">
                {appointments.filter((r) => r.status === "Pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("blog-grid")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "blog-grid" || activeTab === "blog-form"
                ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "blog-grid" || activeTab === "blog-form" ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}`}
            >
              <FiFileText size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Artikel
            </span>
          </button>

          <button
            onClick={() => handleTabChange("event")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "event"
                ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "event" ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}`}
            >
              <FiCalendar size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Event
            </span>
          </button>

          <div className="pt-3 mt-3 border-t border-white/10">
            <button
              onClick={() => setIsGaleriOpen(!isGaleriOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab.startsWith("galeri-")
                  ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                  : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
              }`}
            >
              <div className="flex items-center space-x-4 overflow-hidden flex-1">
                <div
                  className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab.startsWith("galeri-") ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}`}
                >
                  <FiGrid size={20} />
                </div>
                <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
                  Galeri
                </span>
              </div>
              <span
                className={`transform transition-transform shrink-0 ml-2 ${isGaleriOpen ? "rotate-180 text-white" : "text-green-200/50"}`}
              >
                ▼
              </span>
            </button>
            {isGaleriOpen && (
              <div className="mt-2 pl-14 space-y-1">
                {[
                  "Semua",
                  "Lahan Pertanian",
                  "Kegiatan Santri",
                  "Edukasi",
                  "Panen",
                  "Camping",
                  "Kegiatan Masyarakat",
                ].map((cat) => {
                  const slug =
                    cat === "Semua"
                      ? "galeri-semua"
                      : `galeri-${cat.toLowerCase().replace(/ /g, "-")}`;
                  return (
                    <button
                      key={slug}
                      onClick={() => handleTabChange(slug)}
                      className={`block w-full text-left py-2.5 px-4 rounded-xl text-sm transition-all truncate ${
                        activeTab === slug
                          ? "bg-green-500/20 text-green-300 font-bold"
                          : "text-green-100/60 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="p-6 border-t border-white/10 space-y-3 bg-green-950/30">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold text-green-100/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
          >
            <FiArrowLeft />
            <span>Website Utama</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold text-rose-400 hover:text-white transition-colors hover:bg-rose-500 rounded-xl border border-rose-400/20 hover:border-rose-500 bg-rose-500/10"
          >
            <FiLogOut />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F4F7F6]">
        {/* HEADER */}
        <header className="h-20 sm:h-24 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between px-4 sm:px-6 md:px-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] shrink-0 sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-xl mr-3 transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-800 tracking-tight truncate max-w-[160px] sm:max-w-none">
                {activeTab === "beranda" && "Dashboard Overview"}
                {activeTab === "wisata" && "Manajemen Eduwisata"}
                {activeTab === "reservasi" && "Daftar Reservasi"}
                {activeTab === "appointment" && "Pesan & Pertanyaan"}
                {(activeTab === "blog-grid" || activeTab === "blog-form") &&
                  "Manajemen Artikel"}
                {activeTab === "event" && "Manajemen Event"}
                {activeTab.startsWith("galeri-") && "Galeri Alfilaha"}
              </h2>
              <p className="text-xs font-semibold text-gray-500 mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-4 bg-white py-2 px-4 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">Admin Utama</p>
                <div className="flex items-center justify-end space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                    Online
                  </p>
                </div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white ring-2 ring-gray-50">
                A
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === "beranda" && (
              <Beranda
                reservasi={reservasi}
                blogs={blogs}
                events={events}
                appointments={appointments}
                handleTabChange={handleTabChange}
              />
            )}
            {activeTab === "blog-grid" && (
              <BlogGrid
                blogs={blogs}
                onAddClick={() => handleOpenBlogForm()}
                onEditClick={handleOpenBlogForm}
                setDeleteBlogModal={setDeleteBlogModal}
              />
            )}
            {activeTab === "appointment" && (
              <Appointment
                appointments={appointments}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                updateStatusAppointment={updateStatusAppointment}
                setDeleteModal={setDeleteAppointmentModal}
              />
            )}
            {activeTab === "blog-form" && (
              <BlogForm
                initialData={editingBlog}
                onSave={saveBlog}
                onCancel={() => setActiveTab("blog-grid")}
                showToast={showToast}
              />
            )}
            {activeTab === "event" && (
              <Event
                events={events}
                onAdd={() => setAddEventModal({ ...addEventModal, show: true })}
                onEdit={(event) =>
                  setEditEventModal({
                    show: true,
                    ...event,
                    existingImage: event.image,
                  })
                }
                onDelete={(event) =>
                  setDeleteEventModal({
                    show: true,
                    id: event.id,
                    title: event.title,
                  })
                }
              />
            )}

            {activeTab.startsWith("galeri-") && (
              <GaleriManager
                galeriList={galeri}
                activeCategory={
                  activeTab === "galeri-semua"
                    ? "Semua"
                    : activeTab
                        .replace("galeri-", "")
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")
                }
                fetchGaleri={fetchGaleri}
              />
            )}
            {activeTab === "wisata" && (
              <PaketWisata
                wisata={wisata}
                setAddWisataModal={setAddWisataModal}
                setEditWisataModal={setEditWisataModal}
                setDeletePaketModal={setDeletePaketModal}
              />
            )}
            {activeTab === "reservasi" && (
              <Reservasi
                reservasi={reservasi}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                updateStatusReservasi={updateStatusReservasi}
                setRejectModal={setRejectModal}
                setDeleteModal={setDeleteModal}
              />
            )}
          </div>
        </div>
      </main>

      {/* REJECT MODAL */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setRejectModal({ show: false, id: null, nama: "" })}
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-orange-100">
              <FiX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">
              Tolak Reservasi?
            </h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Apakah Anda yakin ingin menolak permohonan reservasi atas nama{" "}
              <span className="font-bold text-gray-800">
                "{rejectModal.nama}"
              </span>
              ? Status pesanan akan diubah menjadi{" "}
              <span className="font-bold text-orange-500 uppercase tracking-wider">
                Ditolak
              </span>{" "}
              dan tidak dapat dikembalikan ke status Pending.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setRejectModal({ show: false, id: null, nama: "" })
                }
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  updateStatusReservasi(rejectModal.id, "Ditolak");
                  setRejectModal({ show: false, id: null, nama: "" });
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
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteModal({ show: false, id: null, nama: "" })}
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">
              Hapus Reservasi?
            </h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Data atas nama{" "}
              <span className="font-bold text-gray-800">
                "{deleteModal.nama}"
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeleteModal({ show: false, id: null, nama: "" })
                }
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
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setDeleteAppointmentModal({ show: false, id: null, type: "" })
            }
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">
              Hapus Appointment?
            </h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Data appointment ini akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeleteAppointmentModal({ show: false, id: null, type: "" })
                }
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() =>
                  confirmHapusAppointment(deleteAppointmentModal.id)
                }
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
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setEditWisataModal({
                show: false,
                id: null,
                nama_paket: "",
                harga: "",
                deskripsi: "",
              })
            }
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6">
              Ubah Paket Wisata
            </h3>
            <form onSubmit={updateWisata} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nama Paket
                </label>
                <input
                  type="text"
                  required
                  value={editWisataModal.nama_paket}
                  onChange={(e) =>
                    setEditWisataModal({
                      ...editWisataModal,
                      nama_paket: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Harga & Satuan
                </label>
                <input
                  type="text"
                  required
                  value={editWisataModal.harga}
                  onChange={(e) =>
                    setEditWisataModal({
                      ...editWisataModal,
                      harga: formatRupiah(e.target.value),
                    })
                  }
                  placeholder="Contoh: Rp 50.000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Fasilitas / Deskripsi
                </label>
                <textarea
                  required
                  value={editWisataModal.deskripsi}
                  onChange={(e) =>
                    setEditWisataModal({
                      ...editWisataModal,
                      deskripsi: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setEditWisataModal({
                      show: false,
                      id: null,
                      nama_paket: "",
                      harga: "",
                      deskripsi: "",
                    })
                  }
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAMBAH WISATA MODAL */}
      {addWisataModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setAddWisataModal({
                show: false,
                nama_paket: "",
                harga: "",
                deskripsi: "",
              })
            }
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6">
              Tambah Paket Wisata
            </h3>
            <form onSubmit={tambahWisata} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Nama Paket
                </label>
                <input
                  type="text"
                  required
                  value={addWisataModal.nama_paket}
                  onChange={(e) =>
                    setAddWisataModal({
                      ...addWisataModal,
                      nama_paket: e.target.value,
                    })
                  }
                  placeholder="Contoh: Paket Wisata Lebaran"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Harga & Satuan
                </label>
                <input
                  type="text"
                  required
                  value={addWisataModal.harga}
                  onChange={(e) =>
                    setAddWisataModal({
                      ...addWisataModal,
                      harga: formatRupiah(e.target.value),
                    })
                  }
                  placeholder="Contoh: Rp 50.000"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Fasilitas / Deskripsi
                </label>
                <textarea
                  required
                  value={addWisataModal.deskripsi}
                  onChange={(e) =>
                    setAddWisataModal({
                      ...addWisataModal,
                      deskripsi: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Contoh: Free souvenir, lunch, dsb..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setAddWisataModal({
                      show: false,
                      nama_paket: "",
                      harga: "",
                      deskripsi: "",
                    })
                  }
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                >
                  Tambahkan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PAKET WISATA MODAL */}
      {deletePaketModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setDeletePaketModal({ show: false, id: null, nama_paket: "" })
            }
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">
              Hapus Paket?
            </h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Paket{" "}
              <span className="font-bold text-gray-800">
                "{deletePaketModal.nama_paket}"
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeletePaketModal({ show: false, id: null, nama_paket: "" })
                }
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
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setAddEventModal({ ...addEventModal, show: false })}
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-xl mr-3">
                <FiActivity />
              </span>
              Tambah Event Baru
            </h3>
            <form onSubmit={addEvent} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Judul Event
                </label>
                <input
                  type="text"
                  required
                  value={addEventModal.title}
                  onChange={(e) =>
                    setAddEventModal({
                      ...addEventModal,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  placeholder="Contoh: Panen Raya Berkebun"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={addEventModal.category}
                    onChange={(e) =>
                      setAddEventModal({
                        ...addEventModal,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer"
                  >
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Event">Event Spesial</option>
                    <option value="Pelatihan">Pelatihan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={addEventModal.date}
                    onChange={(e) =>
                      setAddEventModal({
                        ...addEventModal,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Upload Gambar / Poster
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAddEventModal({
                      ...addEventModal,
                      image: e.target.files[0],
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                />
                {addEventModal.image && (
                  <div className="mt-4 relative h-32 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <img
                      loading="lazy"
                      src={URL.createObjectURL(addEventModal.image)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  required
                  rows="3"
                  value={addEventModal.description}
                  onChange={(e) =>
                    setAddEventModal({
                      ...addEventModal,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  placeholder="Tuliskan detail acara di sini..."
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setAddEventModal({ ...addEventModal, show: false })
                  }
                  className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  Simpan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editEventModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setEditEventModal({ ...editEventModal, show: false })
            }
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <h3 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-xl mr-3">
                <FiEdit />
              </span>
              Edit Event
            </h3>
            <form onSubmit={updateEvent} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Judul Event
                </label>
                <input
                  type="text"
                  required
                  value={editEventModal.title}
                  onChange={(e) =>
                    setEditEventModal({
                      ...editEventModal,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={editEventModal.category}
                    onChange={(e) =>
                      setEditEventModal({
                        ...editEventModal,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer"
                  >
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Event">Event Spesial</option>
                    <option value="Pelatihan">Pelatihan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={editEventModal.date}
                    onChange={(e) =>
                      setEditEventModal({
                        ...editEventModal,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Ganti Gambar (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditEventModal({
                      ...editEventModal,
                      image: e.target.files[0],
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                />
                {editEventModal.image && (
                  <div className="mt-4 relative h-32 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <img
                      loading="lazy"
                      src={URL.createObjectURL(editEventModal.image)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {editEventModal.existingImage && (
                  <p className="text-xs text-gray-500 mt-2">
                    Gambar saat ini: {editEventModal.existingImage}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  required
                  rows="3"
                  value={editEventModal.description}
                  onChange={(e) =>
                    setEditEventModal({
                      ...editEventModal,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setEditEventModal({ ...editEventModal, show: false })
                  }
                  className="flex-1 px-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE EVENT MODAL */}
      {deleteEventModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setDeleteEventModal({ show: false, id: null, title: "" })
            }
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">
              Hapus Event?
            </h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Data event{" "}
              <span className="font-bold text-gray-800">
                "{deleteEventModal.title}"
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeleteEventModal({ show: false, id: null, title: "" })
                }
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => confirmHapusEvent(deleteEventModal.id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {logoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setLogoutModal(false)}
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiLogOut className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">
              Keluar Dashboard?
            </h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Sesi Anda akan diakhiri dan Anda perlu masuk kembali menggunakan
              Username dan Password.
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
                  localStorage.removeItem("alfilaha_admin_token");
                  setIsLoggedIn(false);
                  setUsername("");
                  setPassword("");
                }}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE BLOG MODAL */}
      {deleteBlogModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setDeleteBlogModal({ show: false, id: null, title: "" })
            }
          ></div>
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 text-center mb-2">
              Hapus Blog?
            </h3>
            <p className="text-gray-500 text-center text-sm font-medium mb-8">
              Artikel blog{" "}
              <span className="font-bold text-gray-800">
                "{deleteBlogModal.title}"
              </span>{" "}
              akan dihapus permanen. Apakah Anda yakin?
            </p>
            <div className="flex space-x-3 border-t border-gray-50 pt-5">
              <button
                onClick={() =>
                  setDeleteBlogModal({ show: false, id: null, title: "" })
                }
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
      <div
        className={`fixed bottom-10 right-10 transition-all duration-500 transform ${toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"} z-50`}
      >
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
