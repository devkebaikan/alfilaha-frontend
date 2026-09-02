import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
import { BiChevronDown } from "react-icons/bi";
import Logo from "/images/logo.webp";
import { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

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
    { title: "Tentang", path: "/about" },
    {
      title: "Iven",
      path: "#",
      submenus: [
        { title: "Layanan", path: "/service" },
        { title: "Detail Layanan", path: "/service_details" },
      ],
    },
    {
      title: "Eduwisata",
      path: "#",
      submenus: [
        { title: "Kubus Alfilaha", path: "/kubus-alfilaha" },
        { title: "Paket Wisata", path: "/paket-wisata" },
        { title: "Blog", path: "/blog_grid" },
        { title: "Event & Kegiatan", path: "/event" },
        { title: "Koleksi Tanaman", path: "/koleksi-tanaman" },
        { title: "Form Pesan Tempat", path: "/pesan-tempat" },
      ],
    },
    {
      title: "Blog",
      path: "#",
      submenus: [
        { title: "Grid Artikel", path: "/blog_grid" },
        { title: "Daftar Artikel", path: "/blog_list" },
        { title: "Detail Artikel", path: "/blog_details" },
      ],
    },
    { title: "Galeri", path: "/galeri" },
    { title: "Kontak", path: "/contact" },
  ];

  return (
    <>
      <nav
        className={`w-full transition-all duration-300 bg-black/60 backdrop-blur-md fixed top-0 left-0 z-[50] shadow-sm`}
      >
        <header className="header-section bg-transparent border-b border-white/10 relative">
          <div className="Container relative" ref={searchRef}>
            <div className="flex items-center justify-between h-[70px] lg:h-[100px] px-2 md:px-4 lg:px-0">
              {/* Website Logo */}
              <div className="w-32 sm:w-40 lg:w-48 xl:w-52 flex-shrink-0">
                <Link to="/">
                  <img
                    loading="lazy"
                    draggable="false"
                    src={Logo}
                    className="object-contain w-full h-full max-h-[45px] sm:max-h-[50px] lg:max-h-[70px]"
                    alt="Alfilaha Logo"
                  />
                </Link>
              </div>

              {/* Mobile Right Actions & Toggle Button */}
              <div className="flex items-center gap-3 lg:hidden">
                <button
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none ${isSearchOpen ? "text-PrimaryColor-0" : "text-white"}`}
                >
                  <IoSearch className="w-5 h-5" />
                </button>
                <button
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none"
                  onClick={toggleNavbar}
                  aria-label="Buka menu"
                  aria-expanded={isOpen}
                >
                  <FaBars className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Desktop NavLinks */}
              <div className="hidden lg:flex flex-1 justify-center items-center">
                <ul className="flex items-center space-x-1 xl:space-x-4">
                  {navLinks.map((link, idx) => (
                    <li key={idx} className="group relative">
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 text-[14px] xl:text-[15px] font-AlbertSans font-medium transition-all duration-300 ${
                            isActive && link.path !== "#"
                              ? "text-PrimaryColor-0"
                              : "text-white hover:text-PrimaryColor-0"
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
                        <div className="absolute top-full left-0 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 min-w-[240px]">
                          <ul className="bg-HeadingColor-0 shadow-xl rounded-b-lg overflow-hidden border-t-2 border-PrimaryColor-0">
                            {link.submenus.map((sub, sIdx) => (
                              <li
                                key={sIdx}
                                className="hover:bg-PrimaryColor-0 transition-colors duration-300"
                              >
                                <Link
                                  to={sub.path}
                                  className="block px-6 py-3 text-sm text-white hover:pl-8 transition-all duration-300"
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
              <div className="hidden lg:flex items-center gap-4 xl:gap-6">
                <button
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`text-white transition-colors hover:text-PrimaryColor-0 ${isSearchOpen ? "text-PrimaryColor-0" : ""}`}
                >
                  <IoSearch className="text-2xl" />
                </button>

                <Link
                  to={"/pesan-tempat"}
                  className="px-5 py-2.5 xl:px-6 xl:py-3 bg-PrimaryColor-0 hover:bg-[#0a6658] text-white rounded-full text-sm xl:text-base font-bold transition-all shadow-lg hover:-translate-y-1"
                >
                  Pesan Tempat
                </Link>
                <Link
                  to={"/pendaftaran"}
                  className="px-5 py-2.5 xl:px-6 xl:py-3 bg-PrimaryColor-0 hover:bg-[#0a6658] text-white rounded-full text-sm xl:text-base font-bold transition-all shadow-lg hover:-translate-y-1"
                >
                  Pendaftaran
                </Link>
              </div>
            </div>

            {/* Simple Search Popover (Desktop & Mobile) */}
            {isSearchOpen && (
              <div className="absolute right-4 lg:right-0 top-full mt-2 lg:mt-0 bg-white rounded-lg shadow-xl p-2 w-[calc(100vw-32px)] sm:w-[360px] border border-gray-100 z-[100] animate-fade-in-up before:absolute before:-top-2 before:right-6 lg:before:right-28 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-gray-100">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex relative z-10"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari halaman atau artikel..."
                    className="flex-1 bg-gray-50 text-gray-800 text-sm outline-none px-4 py-3 rounded-l-md border border-gray-200 focus:border-PrimaryColor-0 focus:ring-1 focus:ring-PrimaryColor-0 transition-all"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-PrimaryColor-0 hover:bg-[#0a6658] text-white px-5 rounded-r-md transition-colors flex items-center justify-center"
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-HeadingColor-0/95 backdrop-blur-xl z-[70] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl border-l border-white/10 ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="w-28 sm:w-32"
          >
            <img
              loading="lazy"
              draggable="false"
              src={Logo}
              className="object-contain w-full max-h-[40px]"
              alt="Logo"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
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
                      className="flex items-center justify-between w-full py-3 text-white text-[15px] sm:text-[16px] font-AlbertSans font-medium transition-colors hover:text-PrimaryColor-0"
                      aria-expanded={openDropdown === link.title}
                    >
                      {link.title}
                      <BiChevronDown
                        className={`text-xl transition-transform duration-300 ${openDropdown === link.title ? "rotate-180 text-PrimaryColor-0" : ""}`}
                      />
                    </button>

                    {/* Mobile Submenu Accordion */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdown === link.title ? "max-h-[400px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"}`}
                    >
                      <ul className="flex flex-col pl-4 border-l-2 border-PrimaryColor-0 space-y-1">
                        {link.submenus.map((sub, sIdx) => (
                          <li key={sIdx}>
                            <Link
                              to={sub.path}
                              className="block py-2.5 text-white/70 hover:text-white text-[14px] font-AlbertSans transition-colors"
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
                    className="flex items-center w-full py-3 text-white text-[15px] sm:text-[16px] font-AlbertSans font-medium hover:text-PrimaryColor-0 transition-colors"
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
              className="flex justify-center w-full py-3.5 bg-PrimaryColor-0 text-white rounded-full font-bold transition-colors hover:bg-[#0a6658] shadow-lg"
            >
              Pesan Tempat
            </Link>
            <Link
              to={"/pendaftaran"}
              className="flex justify-center w-full py-3.5 bg-PrimaryColor-0 text-white rounded-full font-bold transition-colors hover:bg-[#0a6658] shadow-lg"
            >
              Pendaftaran
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
