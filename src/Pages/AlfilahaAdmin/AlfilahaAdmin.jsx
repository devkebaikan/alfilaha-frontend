import { useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { adminFetch } from "../../adminAuth";
import {
  FiMenu,
  FiHome,
  FiSettings,
  FiLogOut,
  FiAlertTriangle,
  FiArrowLeft,
  FiTrash2,
  FiMap,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiX,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiBell,
  FiFileText,
  FiCheckCircle,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useTheme } from "../../Context/ThemeContext.jsx";
import { useNotifikasi } from "../../Context/NotifikasiContext.jsx";
import Beranda from "./Tabs/Beranda/Beranda";
import BlogGrid from "./Tabs/BlogGrid/BlogGrid";
import Event from "./Tabs/Event/Event";
import PaketWisata from "./Tabs/PaketWisata/PaketWisata";
import Reservasi from "./Tabs/Reservasi/Reservasi";
import BlogForm from "./Tabs/BlogForm/BlogForm";
import EventForm from "./Tabs/EventForm/EventForm";
import WisataForm from "./Tabs/WisataForm/WisataForm";
import GaleriManager from "./Tabs/Galeri/GaleriManager";
import Appointment from "./Tabs/Appointment/Appointment";
import PendaftaranManager from "./Tabs/PendaftaranManager/PendaftaranManager";
import LayananManager from "./Tabs/Layanan/LayananManager";
import LayananForm from "./Tabs/Layanan/LayananForm";
import TanamanManager from "./Tabs/TanamanManager/TanamanManager";
import PeternakanManager from "./Tabs/PeternakanManager/PeternakanManager";

import UserManager from "./Tabs/UserManager/UserManager";
import JadwalManager from "./Tabs/JadwalManager/JadwalManager";
import LokasiManager from "./Tabs/LokasiManager/LokasiManager";

const NAMA_TAB = {
  beranda: "Dashboard",
  wisata: "Eduwisata",
  "wisata-form": "Eduwisata",
  layanan: "Layanan",
  "layanan-form": "Layanan",
  reservasi: "Reservasi",
  appointment: "Pesan & Pertanyaan",
  "blog-grid": "Artikel",
  "blog-form": "Artikel",
  event: "Event",
  "event-form": "Event",
  pendaftaran: "Pendaftaran Santri",
  tanaman: "Tanaman",
  peternakan: "Peternakan",
  jadwal: "Jadwal",
  lokasi: "Lokasi",
  users: "Akun Internal",
};
const namaTab = (tab) =>
  NAMA_TAB[tab] || (tab && tab.startsWith("galeri-") ? "Galeri" : tab || "Admin");

const WAKTU_PESAN = {
  success: { ikon: FiCheckCircle, wadah: "bg-green-100 dark:bg-green-500/20", warna: "text-green-700 dark:text-green-300" },
  error: { ikon: FiAlertTriangle, wadah: "bg-red-100 dark:bg-red-500/20", warna: "text-red-700 dark:text-red-300" },
  warning: { ikon: FiAlertTriangle, wadah: "bg-amber-100 dark:bg-amber-500/20", warna: "text-amber-700 dark:text-amber-300" },
  info: { ikon: FiBell, wadah: "bg-sky-100 dark:bg-sky-500/20", warna: "text-sky-700 dark:text-sky-300" },
};

const AlfilahaAdmin = () => {
  const navigate = useNavigate();
  // Preferensi tampilan milik admin sendiri: bisa pilih mode terang / gelap
  const { isDark, toggleTheme } = useTheme();
  const notif = useNotifikasi();
  const [notifOpen, setNotifOpen] = useState(false);

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

  // Beri tahu pusat notifikasi tab admin yang sedang aktif
  useEffect(() => {
    if (isLoggedIn) notif.setAdminTab(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn]);

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deleteBlogModal, setDeleteBlogModal] = useState({
    show: false,
    id: null,
    title: "",
  });

  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  const [deleteEventModal, setDeleteEventModal] = useState({
    show: false,
    id: null,
    title: "",
  });

  const [layanan, setLayanan] = useState([]);
  const [editingLayanan, setEditingLayanan] = useState(null);
  const [deleteLayananModal, setDeleteLayananModal] = useState({
    show: false,
    id: null,
    title: "",
  });
  const [wisata, setWisata] = useState([]);

  const [editingWisata, setEditingWisata] = useState(null);
  const [deletePaketModal, setDeletePaketModal] = useState({
    show: false,
    id: null,
    nama_paket: "",
  });

  const [galeri, setGaleri] = useState([]);
  const [isGaleriOpen, setIsGaleriOpen] = useState(false); // Sidebar Galeri Dropdown

  const fetchGaleri = async () => {
    try {
      const response = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri`,
      );
      if (!response.ok) {
        throw new Error(`Server merespons ${response.status}`);
      }
      const data = await response.json();
      setGaleri(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal menarik data Galeri", err);
      // Teruskan error agar pemanggil (mis. setelah Edit/Hapus) bisa memberi tahu pengguna
      throw err;
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
      const response = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/appointments`,
      );
      if (!response.ok) throw new Error("Gagal mengambil data appointments");
      const data = await response.json();
      setAppointments(data);
      if (isLoggedIn)
        notif.pantauPesanMasuk({
          key: "appointment",
          tab: "appointment",
          nama: "Ada pesan konsultasi baru dari website.",
          satuan: "pesan masuk",
          total: data.length,
        });
    } catch (error) {
      console.error("Backend MySQL offline:", error);
    }
  };

  const fetchReservasi = async () => {
    try {
      const response = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/reservasi`,
      );
      if (!response.ok) throw new Error("Gagal mengambil data MySQL");
      const data = await response.json();
      setReservasi(data);
      if (isLoggedIn)
        notif.pantauPesanMasuk({
          key: "reservasi",
          tab: "reservasi",
          nama: "Ada reservasi baru dari website.",
          satuan: "reservasi",
          total: data.length,
        });
    } catch (error) {
      console.error("Backend MySQL offline:", error);
    }
  };

  const fetchLayanan = async () => {
    try {
      const response = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan`,
      );
      if (response.ok) {
        const data = await response.json();
        setLayanan(data);
      }
    } catch (err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const handleOpenLayananForm = (item = null) => {
    setEditingLayanan(item);
    setActiveTab("layanan-form");
  };

  const saveLayanan = async (formData, id = null) => {
    try {
      const url = id
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan/${id}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan`;
      const method = id ? "PUT" : "POST";

      const response = await adminFetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        showToast(`Layanan berhasil ${id ? "diperbarui" : "ditambahkan"}!`);
        fetchLayanan();
        setActiveTab("layanan");
      } else {
        showToast(`Gagal ${id ? "memperbarui" : "menambahkan"} Layanan.`);
      }
    } catch (err) {
      console.error("Save Layanan Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusLayanan = async (id) => {
    setDeleteLayananModal({ show: false, id: null, title: "" });
    try {
      const response = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan/${id}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchLayanan();
        showToast("Layanan berhasil dihapus!");
      } else {
        showToast("Gagal menghapus Layanan dari server!");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };

  const fetchWisata = async () => {
    try {
      const response = await adminFetch(
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

  const saveWisata = async (formData, id = null) => {
    try {
      const url = id
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket/${id}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket`;
      const method = id ? "PUT" : "POST";

      const response = await adminFetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        showToast(
          `Data paket wisata berhasil ${id ? "diperbarui" : "ditambahkan"}!`,
        );
        fetchWisata();
        setActiveTab("wisata");
      } else {
        showToast(`Gagal ${id ? "memperbarui" : "menambahkan"} paket.`);
      }
    } catch (err) {
      console.error("Save Wisata Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusWisata = async (id) => {
    setDeletePaketModal({ show: false, id: null, nama_paket: "" });
    try {
      const response = await adminFetch(
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
      const response = await adminFetch(
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

  const saveEvent = async (formData, id = null) => {
    try {
      const url = id
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events/${id}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events`;
      const method = id ? "PUT" : "POST";

      const response = await adminFetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        showToast(`Event berhasil ${id ? "diperbarui" : "ditambahkan"}!`);
        fetchEvents();
        setActiveTab("event");
      } else {
        showToast(`Gagal ${id ? "memperbarui" : "menambahkan"} Event.`);
      }
    } catch (err) {
      console.error("Save Event Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusEvent = async (id) => {
    setDeleteEventModal({ show: false, id: null, title: "" });
    try {
      const response = await adminFetch(
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
      const response = await adminFetch(
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

      const response = await adminFetch(url, {
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
      const response = await adminFetch(
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
      fetchGaleri().catch(() => {});
      fetchLayanan();
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
      const response = await adminFetch(
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
          true,
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
      const response = await adminFetch(
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
      const response = await adminFetch(
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
          true,
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
      const response = await adminFetch(
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
      const response = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/login`,
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

  // `tanpaSimpan: true` → toast tetap muncul, tapi tidak masuk ke riwayat lonceng
  const showToast = (msg, tanpaSimpan = false) => {
    const gagal = /gagal|terputus|koneksi|error|tidak bisa/i.test(msg || "");
    notif[gagal ? "error" : "success"](msg, { simpan: !tanpaSimpan });
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
          <div className="bg-white/10 dark:bg-white/[0.06] backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="p-8 sm:p-10 pb-6 text-center flex flex-col items-center">
              <img decoding="async"
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
                      className="block w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-white/30 focus:border-white/40 outline-none transition-all bg-white/5 dark:bg-white/[0.06] focus:bg-white/10 dark:bg-white/[0.06] text-white placeholder-green-100/30 font-medium"
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
                      className="block w-full pl-11 pr-12 py-3.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-white/30 focus:border-white/40 outline-none transition-all bg-white/5 dark:bg-white/[0.06] focus:bg-white/10 dark:bg-white/[0.06] text-white placeholder-green-100/30 font-medium"
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
                        ? "bg-white/50 dark:bg-white/[0.06] cursor-wait"
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
    <div className="min-h-screen bg-surface2 flex font-sans text-ink selection:bg-green-200">
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
          <img decoding="async"
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
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "beranda" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
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
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "wisata" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiMap size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Eduwisata
            </span>
          </button>

          <button
            onClick={() => handleTabChange("layanan")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "layanan"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "layanan" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiCheckCircle size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Layanan Kami
            </span>
          </button>

          <button
            onClick={() => handleTabChange("tanaman")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "tanaman"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "tanaman" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiMap size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Manajemen Tanaman
            </span>
          </button>

          <button
            onClick={() => handleTabChange("peternakan")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "peternakan"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "peternakan" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiCheckCircle size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Manajemen Peternakan
            </span>
          </button>

          <button
            onClick={() => handleTabChange("jadwal")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "jadwal"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "jadwal" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiCalendar size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Jadwal Aktivitas
            </span>
          </button>

          <button
            onClick={() => handleTabChange("lokasi")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "lokasi"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "lokasi" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiMap size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Lokasi & Area
            </span>
          </button>

          <button
            onClick={() => handleTabChange("users")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "users"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "users" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiUsers size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Manajemen Akun
            </span>
          </button>

          <button
            onClick={() => handleTabChange("reservasi")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "reservasi"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "reservasi" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
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
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "appointment" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
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
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "blog-grid" || activeTab === "blog-form" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
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
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "event" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiCalendar size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Event
            </span>
          </button>

          <button
            onClick={() => handleTabChange("pendaftaran")}
            className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === "pendaftaran"
                ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
            }`}
          >
            <div
              className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab === "pendaftaran" ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
            >
              <FiUsers size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Pendaftaran
            </span>
          </button>

          <div className="pt-3 mt-3 border-t border-white/10">
            <button
              onClick={() => setIsGaleriOpen(!isGaleriOpen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab.startsWith("galeri-")
                  ? "bg-white/10 dark:bg-white/[0.06] text-white font-bold shadow-lg ring-1 ring-white/20"
                  : "text-green-100/70 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white font-medium"
              }`}
            >
              <div className="flex items-center space-x-4 overflow-hidden flex-1">
                <div
                  className={`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors ${activeTab.startsWith("galeri-") ? "bg-green-500 text-white shadow-md" : "bg-white/5 dark:bg-white/[0.06] text-green-200/70 group-hover:bg-white/10 dark:bg-white/[0.06] group-hover:text-white"}`}
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
                          : "text-green-100/60 hover:bg-white/5 dark:bg-white/[0.06] hover:text-white"
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
            className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold text-green-100/70 hover:text-white transition-colors bg-white/5 dark:bg-white/[0.06] hover:bg-white/10 dark:bg-white/[0.06] rounded-xl border border-white/10"
          >
            <FiArrowLeft />
            <span>Website Utama</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
            }
            aria-pressed={isDark}
            title={isDark ? "Mode terang" : "Mode gelap"}
            className="w-full flex items-center justify-center space-x-2 py-3.5 text-sm font-bold text-green-100/70 hover:text-white transition-colors bg-white/5 dark:bg-white/[0.06] hover:bg-white/10 dark:hover:bg-white/[0.12] rounded-xl border border-white/10"
          >
            {isDark ? <FiSun /> : <FiMoon />}
            <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F4F7F6] dark:bg-[#0B1210]">
        {/* HEADER */}
        <header className="h-20 sm:h-24 bg-white dark:bg-[#0E1A16] border-b border-gray-200/80 dark:border-line flex items-center justify-between px-4 sm:px-6 md:px-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] shrink-0 relative z-40">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-muted hover:bg-green-50 dark:hover:bg-green-500/15 hover:text-green-600 dark:text-green-300 rounded-xl mr-3 transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-ink tracking-tight truncate max-w-[160px] sm:max-w-none">
                {activeTab === "beranda" && "Dashboard Overview"}
                {activeTab === "wisata" && "Manajemen Eduwisata"}
                {(activeTab === "layanan" || activeTab === "layanan-form") &&
                  "Manajemen Layanan"}
                {activeTab === "reservasi" && "Daftar Reservasi"}
                {activeTab === "appointment" && "Pesan & Pertanyaan"}
                {(activeTab === "blog-grid" || activeTab === "blog-form") &&
                  "Manajemen Artikel"}
                {activeTab === "event" && "Manajemen Event"}
                {activeTab === "pendaftaran" && "Pendaftaran Santri"}
                {activeTab === "tanaman" && "Manajemen Tanaman"}
                {activeTab === "peternakan" && "Manajemen Peternakan"}

                {activeTab === "jadwal" && "Jadwal Aktivitas Pondok"}
                {activeTab === "lokasi" && "Manajemen Lokasi & Area"}
                {activeTab === "users" && "Manajemen Akun Internal"}
                {activeTab.startsWith("galeri-") && "Galeri Alfilaha"}
              </h2>
              <p className="text-xs font-semibold text-muted mt-0.5 hidden sm:block">
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
            {/* Toggle tema — admin bebas memilih mode terang / gelap */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
              }
              aria-pressed={isDark}
              title={isDark ? "Mode terang" : "Mode gelap"}
              className="group flex items-center justify-center w-11 h-11 rounded-full bg-surface2 text-ink border border-line hover:bg-green-50 dark:hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-300 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 shrink-0"
            >
              {isDark ? (
                <FiSun className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <FiMoon className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </button>

            {/* NOTIFIKASI ADMIN — ikon lonceng + panel pesan */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Pusat notifikasi"
                aria-expanded={notifOpen}
                className={`relative flex items-center justify-center w-11 h-11 rounded-full bg-surface2 text-ink border border-line hover:bg-green-50 dark:hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-300 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 ${notifOpen ? "text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-500/15" : ""}`}
              >
                <FiBell className="w-5 h-5" />
                {notif.belumDibaca > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-card">
                    {notif.belumDibaca > 99 ? "99+" : notif.belumDibaca}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="fixed left-3 right-3 top-20 sm:left-auto sm:right-4 sm:top-24 sm:w-[380px] lg:absolute lg:right-0 lg:top-auto lg:mt-2 lg:w-[380px] z-50 bg-card rounded-2xl border border-line shadow-2xl shadow-black/20 overflow-hidden overscroll-contain">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface2/60">
                      <div className="flex items-center gap-2">
                        <FiBell className="text-green-600 dark:text-green-300 w-5 h-5" />
                        <h3 className="font-bold text-ink text-sm">
                          Notifikasi
                        </h3>
                        {notif.belumDibaca > 0 && (
                          <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {notif.belumDibaca} baru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {notif.belumDibaca > 0 && (
                          <button
                            type="button"
                            onClick={notif.bacaSemua}
                            className="text-[11px] font-bold text-green-600 dark:text-green-300 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition"
                          >
                            Tandai dibaca
                          </button>
                        )}
                        {notif.adminPesan.length > 0 && (
                          <button
                            type="button"
                            onClick={notif.hapusSemuaPesan}
                            title="Hapus semua"
                            aria-label="Hapus semua notifikasi"
                            className="text-muted hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain">
                      {notif.adminPesan.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                          <FiBell className="w-10 h-10 text-muted mx-auto mb-3" />
                          <p className="text-sm font-bold text-ink">
                            Belum ada notifikasi
                          </p>
                          <p className="text-xs text-muted mt-1">
                            Aktivitas tambah / ubah / hapus di panel admin akan
                            muncul di sini.
                          </p>
                        </div>
                      ) : (
                        notif.adminPesan.slice(0, 40).map((p) => {
                          const gaya = WAKTU_PESAN[p.tipe] || WAKTU_PESAN.info;
                          const Ikon = gaya.ikon;
                          const waktu = p.waktu
                            ? new Date(p.waktu).getTime()
                            : null;
                          const selisih = waktu
                            ? Date.now() - waktu
                            : Infinity;
                          const rel = selisih < 60000
                            ? "Baru saja"
                            : selisih < 3600000
                              ? `${Math.round(selisih / 60000)} mnt lalu`
                              : selisih < 86400000
                                ? `${Math.round(selisih / 3600000)} jam lalu`
                                : `${Math.round(selisih / 86400000)} hari lalu`;
                          return (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => {
                                handleTabChange(p.tab);
                                notif.bacaPesan(p.id);
                                setNotifOpen(false);
                              }}
                              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface2 transition border-b border-line/60 last:border-b-0 ${p.dibaca ? "" : "bg-green-50/50 dark:bg-green-500/[0.06]"}`}
                            >
                              <span
                                className={`mt-0.5 w-9 h-9 rounded-full grid place-items-center shrink-0 ${gaya.wadah} ${gaya.warna}`}
                              >
                                <Ikon size={16} />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm font-semibold text-ink leading-snug">
                                  {p.pesan}
                                </span>
                                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                                    {namaTab(p.tab)}
                                  </span>
                                  <span className="text-[11px] text-muted font-medium">
                                    {rel}
                                  </span>
                                </span>
                              </span>
                              {!p.dibaca && (
                                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2"></span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4 bg-card py-2 px-4 rounded-full border border-line shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-ink">Admin</p>
                <div className="flex items-center justify-end space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[10px] text-green-600 dark:text-green-300 font-bold uppercase tracking-wider">
                    Online
                  </p>
                </div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white ring-2 ring-line">
                A
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === "tanaman" && <TanamanManager />}
            {activeTab === "peternakan" && <PeternakanManager />}
            {activeTab === "jadwal" && <JadwalManager />}
            {activeTab === "lokasi" && <LokasiManager />}
            {activeTab === "users" && <UserManager />}
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
                onAdd={() => {
                  setEditingEvent(null);
                  setActiveTab("event-form");
                }}
                onEdit={(event) => {
                  setEditingEvent(event);
                  setActiveTab("event-form");
                }}
                onDelete={(event) =>
                  setDeleteEventModal({
                    show: true,
                    id: event.id,
                    title: event.title,
                  })
                }
              />
            )}
            {activeTab === "event-form" && (
              <EventForm
                initialData={editingEvent}
                onSave={saveEvent}
                onCancel={() => setActiveTab("event")}
              />
            )}
            {activeTab === "pendaftaran" && <PendaftaranManager />}

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

            {activeTab === "layanan" && (
              <LayananManager
                layanan={layanan}
                onAdd={() => handleOpenLayananForm()}
                onEdit={handleOpenLayananForm}
                setDeleteLayananModal={setDeleteLayananModal}
              />
            )}
            {activeTab === "layanan-form" && (
              <LayananForm
                initialData={editingLayanan}
                onSave={saveLayanan}
                onCancel={() => setActiveTab("layanan")}
              />
            )}
            {activeTab === "wisata" && (
              <PaketWisata
                wisata={wisata}
                onAdd={() => {
                  setEditingWisata(null);
                  setActiveTab("wisata-form");
                }}
                onEdit={(paket) => {
                  setEditingWisata(paket);
                  setActiveTab("wisata-form");
                }}
                setDeletePaketModal={setDeletePaketModal}
              />
            )}
            {activeTab === "wisata-form" && (
              <WisataForm
                initialData={editingWisata}
                onSave={saveWisata}
                onCancel={() => setActiveTab("wisata")}
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
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/15 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-orange-100 dark:border-orange-500/30">
              <FiX className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Tolak Reservasi?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Apakah Anda yakin ingin menolak permohonan reservasi atas nama{" "}
              <span className="font-bold text-ink">
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
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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

      {/* DELETE LAYANAN MODAL */}
      {deleteLayananModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setDeleteLayananModal({ show: false, id: null, title: "" })
            }
          ></div>
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-500/30">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Hapus Layanan?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Data layanan{" "}
              <span className="font-bold text-ink">
                "{deleteLayananModal.title}"
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeleteLayananModal({ show: false, id: null, title: "" })
                }
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => confirmHapusLayanan(deleteLayananModal.id)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
              >
                Ya, Hapus
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
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-500/30">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Hapus Reservasi?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Data atas nama{" "}
              <span className="font-bold text-ink">
                "{deleteModal.nama}"
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeleteModal({ show: false, id: null, nama: "" })
                }
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-500/30">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Hapus Appointment?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Data appointment ini akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeleteAppointmentModal({ show: false, id: null, type: "" })
                }
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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

      {/* DELETE PAKET WISATA MODAL */}
      {deletePaketModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setDeletePaketModal({ show: false, id: null, nama_paket: "" })
            }
          ></div>
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-500/30">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Hapus Paket?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Paket{" "}
              <span className="font-bold text-ink">
                "{deletePaketModal.nama_paket}"
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeletePaketModal({ show: false, id: null, nama_paket: "" })
                }
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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

      {/* DELETE EVENT MODAL */}
      {deleteEventModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setDeleteEventModal({ show: false, id: null, title: "" })
            }
          ></div>
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-500/30">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Hapus Event?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Data event{" "}
              <span className="font-bold text-ink">
                "{deleteEventModal.title}"
              </span>{" "}
              akan dihapus permanen.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setDeleteEventModal({ show: false, id: null, title: "" })
                }
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-500/30">
              <FiLogOut className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Keluar Dashboard?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Sesi Anda akan diakhiri dan Anda perlu masuk kembali menggunakan
              Username dan Password.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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
          <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl transform transition-all animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/15 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100 dark:border-red-500/30">
              <FiTrash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Hapus Blog?
            </h3>
            <p className="text-muted text-center text-sm font-medium mb-8">
              Artikel blog{" "}
              <span className="font-bold text-ink">
                "{deleteBlogModal.title}"
              </span>{" "}
              akan dihapus permanen. Apakah Anda yakin?
            </p>
            <div className="flex space-x-3 border-t border-line pt-5">
              <button
                onClick={() =>
                  setDeleteBlogModal({ show: false, id: null, title: "" })
                }
                className="flex-1 px-4 py-3 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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

      {/* TOAST NOTIFICATION — kini memakai sistem notifikasi global */}
    </div>
  );
};

export default AlfilahaAdmin;
