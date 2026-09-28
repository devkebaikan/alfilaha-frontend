import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
import { BiChevronDown } from "react-icons/bi";
import Logo from "/logo-navbar.png";
import { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiLayout, FiSun, FiMoon } from "react-icons/fi";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useTheme } from "../../Context/ThemeContext.jsx";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // ── Auth santri — satu context autentikasi (bukan baca localStorage langsung) ─
  const { santriToken, santri: santriData, logoutSantri } = useAuth();

  // ── Tema light/dark — hanya memengaruhi tampilan, tidak logika bisnis ─
  const { isDark, toggleTheme } = useTheme();

  // Redirect: status belum diterima tidak boleh membuka dashboard-santri
  useEffect(() => {
    if (
      (santriData?.status_pendaftaran === "Menunggu Verifikasi" ||
        santriData?.status_pendaftaran === "Ditolak") &&
      location.pathname === "/dashboard-santri"
    ) {
      navigate("/status-pendaftaran");
    }
  }, [location.pathname, santriData, navigate]);

  const isLoggedIn = !!santriToken;

  const initials = (data) => {
    if (!data) return "S";
    const name = data.username || data.nama;
    return name ? name.charAt(0).toUpperCase() : "S";
  };

  // Nama tampilan = username; fallback "Santri" hanya bila username benar-benar hilang
  const namaTampilan = (data) => {
    if (data?.username) return data.username;
    const firstWord = data?.nama?.split(" ")[0];
    return firstWord || "Santri";
  };

  const handleLogout = () => {
    logoutSantri();
    setProfileOpen(false);
    navigate("/");
  };

  // Tutup dropdown profil saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const queryStr = searchQuery.toLowerCase().trim();

      const DIRECT_ROUTES = [
        { keywords: ["beranda", "home", "awal"], path: "/" },
        { keywords: ["tentang", "about", "profil", "sejarah"], path: "/about" },
        {
          keywords: [
            "layanan",
            "service",
            "penanaman",
            "daur ulang",
            "komposting",
          ],
          path: "/service",
        },
        { keywords: ["kubus", "program kubus"], path: "/kubus-alfilaha" },
        {
          keywords: ["wisata", "paket", "edukasi", "camping", "outbond"],
          path: "/paket-wisata",
        },
        { keywords: ["event", "kegiatan", "agenda"], path: "/event" },
        {
          keywords: ["galeri", "foto", "dokumentasi", "video", "gallery"],
          path: "/galeri",
        },
        {
          keywords: ["pesan", "reservasi", "booking", "daftar"],
          path: "/pesan-tempat",
        },
        {
          keywords: ["cek tanaman", "tanaman", "botani", "pertumbuhan"],
          path: "/cek-tanaman",
        },
        {
          keywords: ["kontak", "hubungi", "lokasi", "alamat", "peta"],
          path: "/contact",
        },
        { keywords: ["donasi", "sumbangan"], path: "/donation_inner" },
        { keywords: ["blog", "artikel", "berita", "news"], path: "/blog_grid" },
        { keywords: ["admin", "dashboard", "panel"], path: "/admin" },
      ];

      const directMatch = DIRECT_ROUTES.find((route) =>
        route.keywords.some(
          (kw) =>
            kw === queryStr ||
            (queryStr.length >= 4 &&
              (kw.includes(queryStr) || queryStr.includes(kw))),
        ),
      );

      setIsSearchOpen(false);
      setSearchQuery("");

      if (directMatch) {
        navigate(directMatch.path);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    {
      title: "Tentang",
      path: "#",
      submenus: [
        { title: "Tentang Alfilaha", path: "/about" },
        { title: "Kubus Alfilaha", path: "/kubus-alfilaha" },
      ],
    },
    {
      title: "Layanan",
      path: "#",
      submenus: [
        { title: "Paket Wisata", path: "/paket-wisata" },
        { title: "Event & Kegiatan", path: "/event" },
        { title: "Pesantren", path: "/service" },
        { title: "Pesan Tempat", path: "/pesan-tempat" },
      ],
    },
    {
      title: "Ekosistem",
      path: "#",
      submenus: [
        { title: "Kategori", path: "/koleksi-tanaman" },
        { title: "Peternakan", path: "/peternakan" },
        { title: "Bisnis", path: "/bisnis" },
      ],
    },
    { title: "Blog", path: "/blog_grid" },
    { title: "Galeri", path: "/galeri" },
    { title: "Kontak", path: "/contact" },
  ];

  return (
    <>
      <nav
        className={`safe-top w-full transition-all duration-300 bg-black/80 backdrop-blur-lg fixed top-0 left-0 z-[50] shadow-lg`}
      >
        <header className="header-section bg-transparent border-b border-white/10 relative">
          <div className="Container relative" ref={searchRef}>
            <div className="flex items-center justify-between h-[70px] lg:h-[90px] xl:h-[100px] px-0">
              {/* Website Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center gap-2 sm:gap-3">
                  <img decoding="async"
                    loading="lazy"
                    draggable="false"
                    src={Logo}
                    className="object-contain h-[45px] sm:h-[50px] lg:h-[60px] xl:h-[70px] w-auto"
                    alt="Alfilaha Logo"
                  />
                  <span className="flex flex-col leading-[1.2]">
                    <span className="text-white font-extrabold text-lg lg:text-[22px] xl:text-2xl tracking-tight">
                      alfilaha
                    </span>
                    <span className="text-white/70 text-[12px] lg:text-[13px] xl:text-sm font-medium mt-1">
                      ecopesantren
                    </span>
                  </span>
                </Link>
              </div>

              {/* Mobile Right Actions & Toggle Button */}
              <div className="flex items-center gap-3 xl:hidden">
                <button
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`flex items-center justify-center w-11 h-11 rounded-full bg-white/10 dark:bg-white/[0.08] hover:bg-white/20 dark:hover:bg-white/[0.16] transition-colors focus:outline-none ${isSearchOpen ? "text-[#0d806a]" : "text-white"}`}
                >
                  <IoSearch className="w-5 h-5" />
                </button>
                {/* Toggle tema (mobile) */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={
                    isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
                  }
                  aria-pressed={isDark}
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 dark:bg-white/[0.08] hover:bg-white/20 dark:hover:bg-white/[0.16] transition-colors focus:outline-none text-white"
                >
                  {isDark ? (
                    <FiSun className="w-5 h-5" />
                  ) : (
                    <FiMoon className="w-5 h-5" />
                  )}
                </button>
                <button
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 dark:bg-white/[0.08] hover:bg-white/20 dark:hover:bg-white/[0.16] transition-colors focus:outline-none"
                  onClick={toggleNavbar}
                  aria-label="Buka menu"
                  aria-expanded={isOpen}
                >
                  <FaBars className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Desktop NavLinks */}
              <div className="hidden lg:flex flex-1 justify-center items-center">
                <ul className="flex items-center gap-3 xl:gap-5">
                  {navLinks.map((link, idx) => (
                    <li key={idx} className="group relative">
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          `flex items-center px-2.5 py-2 lg:px-3 lg:py-2 xl:px-3 xl:py-2 text-[13px] lg:text-[14px] xl:text-[16px] font-AlbertSans font-semibold transition-all duration-300 ${
                            isActive && link.path !== "#"
                              ? "text-[#0d806a]"
                              : "text-white hover:text-[#0d806a]"
                          }`
                        }
                      >
                        {link.title}
                        {link.submenus && (
                          <BiChevronDown className="ml-1 text-lg group-hover:-rotate-180 transition-transform duration-300" />
                        )}
                      </NavLink>

                      {/* Desktop Dropdown */}
                      {link.submenus && (
                        <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 min-w-[180px] lg:min-w-[200px]">
                          <ul className="bg-black/95 backdrop-blur-xl shadow-xl rounded-lg overflow-hidden border border-white/10">
                            {link.submenus.map((sub, sIdx) => (
                              <li
                                key={sIdx}
                                className="hover:bg-[#0d806a]/20 transition-colors duration-300"
                              >
                                <Link
                                  to={sub.path}
                                  className="block px-4 py-2.5 lg:px-5 lg:py-3 text-sm text-white hover:text-[#0d806a] transition-all duration-300"
                                >
                                  {sub.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desktop Right Actions */}
              <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                <button
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`text-white transition-colors hover:text-[#0d806a] ${isSearchOpen ? "text-[#0d806a]" : ""}`}
                >
                  <IoSearch className="text-xl xl:text-2xl" />
                </button>

                {/* ── Toggle tema: ☀ saat gelap (→「 mode terang), 🌙 saat terang (→「 mode gelap) ── */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={
                    isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"
                  }
                  aria-pressed={isDark}
                  title={isDark ? "Mode terang" : "Mode gelap"}
                  className="text-white transition-colors hover:text-[#0d806a] flex items-center justify-center"
                >
                  {isDark ? (
                    <FiSun className="text-[20px] xl:text-[22px] transition-transform duration-300 hover:rotate-45" />
                  ) : (
                    <FiMoon className="text-[20px] xl:text-[22px] transition-transform duration-300 hover:-rotate-12" />
                  )}
                </button>

                <Link
                  to={"/pesan-tempat"}
                  className="whitespace-nowrap px-3 py-1.5 lg:px-3 lg:py-1.5 xl:px-5 xl:py-2.5 border-2 border-white/30 hover:border-[#0d806a] text-white hover:text-[#0d806a] rounded-full text-[12px] lg:text-[12px] xl:text-[14px] font-bold transition-all"
                >
                  Pesan Tempat
                </Link>

                {/* ── Auth: Avatar atau tombol Pendaftaran ── */}
                {isLoggedIn ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen((p) => !p)}
                      className="flex items-center gap-2 px-3 py-1.5 lg:px-3 lg:py-1.5 xl:px-4 xl:py-2 bg-white/10 dark:bg-white/[0.08] hover:bg-white/20 dark:hover:bg-white/[0.16] text-white rounded-full font-bold transition-all border border-white/20 hover:border-white/40"
                    >
                      {/* Avatar inisial — huruf pertama username */}
                      <span className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full bg-[#0d806a] flex items-center justify-center text-white text-xs lg:text-xs xl:text-sm font-extrabold flex-shrink-0">
                        {initials(santriData)}
                      </span>
                      <span
                        title={namaTampilan(santriData)}
                        className="text-[12px] lg:text-[12px] xl:text-sm max-w-[60px] lg:max-w-[70px] xl:max-w-[90px] truncate hidden lg:block"
                      >
                        {namaTampilan(santriData)}
                      </span>
                      <span
                        title={namaTampilan(santriData)}
                        className="text-[12px] lg:text-[12px] xl:text-sm truncate lg:hidden font-extrabold"
                      >
                        {namaTampilan(santriData)}
                      </span>
                      <BiChevronDown
                        className={`text-base transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown profil */}
                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-3 w-56 bg-card rounded-2xl shadow-2xl border border-line overflow-hidden z-[100]"
                        >
                          {/* Info user */}
                          <div className="px-5 py-4 border-b border-line bg-gradient-to-r from-surface2 to-card">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d806a] to-[#0a6658] flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                                {initials(
                                  santriData?.username || santriData?.nama,
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  title={namaTampilan(santriData)}
                                  className="font-extrabold text-ink text-sm truncate"
                                >
                                  {namaTampilan(santriData)}
                                </p>
                                <p className="text-xs text-muted truncate">
                                  {santriData?.role || "Santri"}
                                </p>
                              </div>
                            </div>
                            {santriData?.status_pendaftaran ===
                              "Menunggu Verifikasi" && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/20 px-2 py-1 rounded-full">
                                  Menunggu Verifikasi
                                </p>
                              </div>
                            )}
                            {santriData?.status_pendaftaran === "Diterima" && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="text-[11px] font-bold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-500/20 px-2 py-1 rounded-full">
                                  Akun Aktif
                                </p>
                              </div>
                            )}
                            {santriData?.status_pendaftaran === "Ditolak" && (
                              <div className="mt-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <p className="text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/20 px-2 py-1 rounded-full">
                                  Pendaftaran Ditolak
                                </p>
                              </div>
                            )}
                          </div>
                          {/* Menu items */}
                          <div className="py-2">
                            {/* Halaman Saya - hanya untuk santri yang sudah diterima */}
                            {santriData?.status_pendaftaran === "Diterima" && (
                              <button
                                onClick={() => {
                                  setProfileOpen(false);
                                  navigate("/dashboard-santri");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-700 dark:hover:text-green-400 transition-colors rounded-lg mx-2"
                              >
                                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                  <FiLayout
                                    size={16}
                                    className="text-green-600"
                                  />
                                </div>
                                <div className="flex flex-col items-start">
                                  <span>Halaman Saya</span>
                                  <span className="text-[10px] text-muted font-normal">
                                    Akses dashboard santri
                                  </span>
                                </div>
                              </button>
                            )}

                            {/* Status Pendaftaran - hanya untuk yang masih menunggu */}
                            {santriData?.status_pendaftaran ===
                              "Menunggu Verifikasi" && (
                              <button
                                onClick={() => {
                                  setProfileOpen(false);
                                  navigate("/status-pendaftaran");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 transition-colors rounded-lg mx-2"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                  <FiUser size={16} className="text-blue-600" />
                                </div>
                                <div className="flex flex-col items-start">
                                  <span>Status Pendaftaran</span>
                                  <span className="text-[10px] text-muted font-normal">
                                    Cek status verifikasi
                                  </span>
                                </div>
                              </button>
                            )}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors rounded-lg mx-2 mt-1"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                <FiLogOut size={16} />
                              </div>
                              <span>Keluar</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link
                      to={"/pendaftaran"}
                      className="whitespace-nowrap px-3 py-1.5 lg:px-3 lg:py-1.5 xl:px-4 xl:py-2 border-2 border-white/30 hover:border-[#0d806a] text-white hover:text-[#0d806a] rounded-full text-[12px] lg:text-[12px] xl:text-[14px] font-bold transition-all"
                    >
                      Pendaftaran
                    </Link>
                    <Link
                      to={"/donation_inner"}
                      className="whitespace-nowrap px-3 py-1.5 lg:px-3 lg:py-1.5 xl:px-6 xl:py-3 bg-[#0d806a] hover:bg-[#0a6658] text-white rounded-full text-[12px] lg:text-[12px] xl:text-[14px] font-bold transition-all shadow-lg hover:-translate-y-1"
                    >
                      Donasi
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Simple Search Popover (Desktop & Mobile) */}
            {isSearchOpen && (
              <div className="absolute right-4 lg:right-0 top-full mt-2 lg:mt-0 bg-card rounded-lg shadow-xl p-2 w-[calc(100vw-32px)] sm:w-[360px] border border-line z-[100] animate-fade-in-up before:absolute before:-top-2 before:right-6 lg:before:right-28 before:w-4 before:h-4 before:bg-card before:rotate-45 before:border-l before:border-t before:border-line">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex relative z-10"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari halaman atau artikel..."
                    className="flex-1 bg-surface2 text-ink text-sm outline-none px-4 py-3 rounded-l-md border border-line focus:border-[#0d806a] focus:ring-1 focus:ring-[#0d806a] transition-all"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-[#0d806a] hover:bg-[#0a6658] text-white px-5 rounded-r-md transition-colors flex items-center justify-center"
                  >
                    <IoSearch size={20} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 xl:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`safe-top safe-bottom fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-black/95 backdrop-blur-xl z-[70] transform transition-transform duration-300 ease-in-out xl:hidden shadow-2xl border-l border-white/10 ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5"
          >
            <img decoding="async"
              loading="lazy"
              draggable="false"
              src={Logo}
              className="object-contain h-[40px] w-auto"
              alt="Logo"
            />
            <span className="flex flex-col leading-none">
              <span className="text-white font-extrabold text-lg tracking-tight">
                alfilaha
              </span>
              <span className="text-white/70 text-xs font-medium mt-1">
                ecopesantren
              </span>
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 dark:bg-white/[0.08] hover:bg-white/20 dark:hover:bg-white/[0.16] text-white transition-colors"
            aria-label="Tutup menu"
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          <ul className="flex flex-col space-y-2">
            {navLinks.map((link, idx) => (
              <li key={idx} className="border-b border-white/5 pb-2">
                {link.submenus ? (
                  <div className="flex flex-col">
                    <button
                      onClick={() => toggleDropdown(link.title)}
                      className="flex items-center justify-between w-full py-3 text-white text-[15px] sm:text-[16px] font-AlbertSans font-medium transition-colors hover:text-[#0d806a]"
                      aria-expanded={openDropdown === link.title}
                    >
                      {link.title}
                      <BiChevronDown
                        className={`text-xl transition-transform duration-300 ${openDropdown === link.title ? "rotate-180 text-[#0d806a]" : ""}`}
                      />
                    </button>

                    {/* Mobile Submenu Accordion */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdown === link.title ? "max-h-[400px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"}`}
                    >
                      <ul className="flex flex-col pl-4 border-l-2 border-[#0d806a] space-y-1">
                        {link.submenus.map((sub, sIdx) => (
                          <li key={sIdx}>
                            <Link
                              to={sub.path}
                              className="block py-2.5 text-white/70 hover:text-[#0d806a] text-[14px] font-AlbertSans transition-colors"
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className="flex items-center w-full py-3 text-white text-[15px] sm:text-[16px] font-AlbertSans font-medium hover:text-[#0d806a] transition-colors"
                  >
                    {link.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
            <Link
              to={"/pesan-tempat"}
              className="flex justify-center w-full py-3.5 border-2 border-white/30 text-white rounded-full font-bold transition-colors hover:border-[#0d806a] hover:text-[#0d806a]"
            >
              Pesan Tempat
            </Link>

            {/* ── Auth mobile: Avatar+menu atau tombol Pendaftaran & Donasi ── */}
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                {/* Info santri */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-2xl border border-white/10">
                  <span className="w-10 h-10 rounded-full bg-[#0d806a] flex items-center justify-center text-white font-extrabold text-base flex-shrink-0">
                    {initials(santriData?.username || santriData?.nama)}
                  </span>
                  <div className="min-w-0">
                    <p
                      title={namaTampilan(santriData)}
                      className="font-extrabold text-white text-sm truncate"
                    >
                      {namaTampilan(santriData)}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {santriData?.role || "Santri"}
                    </p>
                    {santriData?.status_pendaftaran ===
                      "Menunggu Verifikasi" && (
                      <p className="text-[10px] font-bold text-amber-300 mt-1 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Masih di verifikasi
                      </p>
                    )}
                    {santriData?.status_pendaftaran === "Ditolak" && (
                      <p className="text-[10px] font-bold text-red-300 mt-1 bg-red-500/20 px-2 py-0.5 rounded-full">
                        Pendaftaran ditolak
                      </p>
                    )}
                  </div>
                </div>
                {/* Tombol menu */}
                {/* Halaman Saya - hanya untuk santri yang sudah diterima */}
                {santriData?.status_pendaftaran === "Diterima" && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/dashboard-santri");
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-green-700 rounded-full font-bold transition-colors hover:bg-green-50 shadow"
                  >
                    <FiLayout size={16} /> Halaman Saya
                  </button>
                )}

                {/* Status Pendaftaran - hanya untuk yang masih menunggu */}
                {santriData?.status_pendaftaran === "Menunggu Verifikasi" && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/status-pendaftaran");
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-blue-700 rounded-full font-bold transition-colors hover:bg-blue-50 shadow"
                  >
                    <FiUser size={16} /> Status Pendaftaran
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/20 text-red-300 rounded-full font-bold hover:bg-red-500/30 transition-colors"
                >
                  <FiLogOut size={16} /> Keluar
                </button>
              </div>
            ) : (
              <>
                <Link
                  to={"/pendaftaran"}
                  className="flex justify-center w-full py-3.5 border-2 border-white/30 text-white rounded-full font-bold transition-colors hover:border-[#0d806a] hover:text-[#0d806a]"
                >
                  Pendaftaran
                </Link>
                <Link
                  to={"/donation_inner"}
                  className="flex justify-center w-full py-3.5 bg-[#0d806a] text-white rounded-full font-bold transition-colors hover:bg-[#0a6658] shadow-lg"
                >
                  Donasi
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
