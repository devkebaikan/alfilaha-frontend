import React, { useState, useEffect } from "react";
import {
  FiImage,
  FiFilter,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import subTitleShape from "/images/sub-title-shape.png";

const GaleriAlfilaha = ({ isHome = false }) => {
  const [galeri, setGaleri] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Updated for navigation

  const categories = [
    "Semua",
    "Lahan Pertanian",
    "Kegiatan Santri",
    "Edukasi",
    "Panen",
    "Camping",
    "Kegiatan Masyarakat",
  ];

  useEffect(() => {
    const fetchGaleri = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri`,
        );
        if (response.ok) {
          const data = await response.json();
          setGaleri(data);
        }
      } catch (error) {
        console.error("Gagal menarik data Galeri:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGaleri();
  }, []);

  let filteredGaleri =
    activeCategory === "Semua"
      ? galeri
      : galeri.filter((item) => item.category === activeCategory);

  if (isHome) {
    const targetCategories = ["Kegiatan Santri", "Edukasi", "Panen", "Camping"];
    const homeExamples = [];

    targetCategories.forEach((cat) => {
      const dbPhoto = galeri.find((item) => item.category === cat);
      if (dbPhoto) {
        homeExamples.push(dbPhoto);
      }
    });

    filteredGaleri = homeExamples.slice(0, 3);
  }

  // Navigation handlers
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev > 0 ? prev - 1 : filteredGaleri.length - 1,
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev < filteredGaleri.length - 1 ? prev + 1 : 0,
    );
  };

  const handleKeyDown = (e) => {
    if (selectedImageIndex !== null) {
      if (e.key === "ArrowLeft") handlePrevImage(e);
      if (e.key === "ArrowRight") handleNextImage(e);
      if (e.key === "Escape") setSelectedImageIndex(null);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <section
      className={
        isHome
          ? "py-16 sm:py-20 lg:py-[120px] bg-surface2 relative overflow-hidden"
          : "py-14 sm:py-16 md:py-24 bg-gradient-to-b from-card to-surface2 relative overflow-hidden"
      }
    >
      <div
        className={
          isHome
            ? "Container relative z-10"
            : "container mx-auto px-4 sm:px-6 relative z-10"
        }
      >
        {/* Header Section */}
        {isHome ? (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 sm:mb-16 gap-6 sm:gap-8 pl-4 pr-2 sm:pl-7 sm:pr-4 lg:px-0">
            <div className="max-w-2xl">
              <div className="flex mb-4">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img
                    decoding="async"
                    loading="lazy"
                    src={subTitleShape}
                    draggable="false"
                    alt=""
                  />
                  Koleksi Visual
                </h5>
              </div>
              <h2 className="text-[28px] sm:text-[34px] md:text-[44px] font-bold text-HeadingColor-0 leading-[1.25]">
                Galeri <span className="text-PrimaryColor-0">Al-Filaha</span>
              </h2>
              <p className="text-TextColor-0 text-[16px] sm:text-[17px] mt-5 leading-[1.8] max-w-xl">
Dokumentasi kegiatan, edukasi, dan lingkungan Al-Filaha. Temukan potret keseharian santri, kegiatan belajar dan eduwisata, serta suasana asri kebun, peternakan, dan area pondok. Setiap foto adalah cerita kecil tentang tumbuh, belajar, dan hidup selaras dengan alam. </p>
            </div>
            <Link
              to="/galeri"
              className="primary-btn3 shrink-0 w-full sm:w-auto text-center"
            >
              Lihat Semua Galeri
            </Link>
          </div>
        ) : (
          <div className="text-center max-w-3xl mx-auto mb-10 px-3 sm:px-6">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm mb-3 block">
              KOLEKSI VISUAL
            </span>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[28px] sm:text-[34px] md:text-5xl font-extrabold text-ink mb-3 md:mb-4 leading-[1.25]"
            >
              Galeri <span className="text-PrimaryColor-0">Al-Filaha</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-muted text-base md:text-lg leading-[1.8] max-w-xl mx-auto"
            >
Dokumentasi kegiatan, edukasi, dan lingkungan Al-Filaha. Temukan potret keseharian santri, kegiatan belajar dan eduwisata, serta suasana asri kebun, peternakan, dan area pondok yang kami rawat bersama. Setiap foto menjadi cerita kecil tentang tumbuh, belajar, dan hidup selaras dengan alam.            </motion.p>
          </div>
        )}

        {/* Filter Navigation */}
        {!isHome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex overflow-x-auto justify-start lg:justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-10 pb-3 scrollbar-hide whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-2"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-[13px] sm:text-sm font-semibold transition-all duration-300 shadow-sm border ${
                  activeCategory === cat
                    ? "bg-PrimaryColor-0 text-white border-PrimaryColor-0"
                    : "bg-card text-muted border-line hover:border-PrimaryColor-0 hover:text-PrimaryColor-0"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Gallery Grid */}
        {loading && !isHome ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-PrimaryColor-0"></div>
          </div>
        ) : filteredGaleri.length > 0 ? (
          <>
            <motion.div
              layout
              className={`grid ${
                isHome
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                  : "gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {filteredGaleri.map((item, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{
                      duration: 0.4,
                      delay: isHome ? index * 0.1 : 0,
                    }}
                    key={item.id}
                    className={`group overflow-hidden cursor-pointer relative w-full bg-card border border-line shadow-sm transition-transform active:scale-[0.98] ${
                      isHome
                        ? "rounded-[2rem] hover:shadow-shadow dark:hover:shadow-none transition-all duration-300"
                        : "rounded-2xl"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <div
                      className={`relative overflow-hidden ${
                        isHome
                          ? "h-[280px] sm:h-[360px]"
                          : "h-[210px] sm:h-[240px] md:h-[260px] lg:h-[300px]"
                      }`}
                    >
                      <img decoding="async"
                        src={
                          item.isLocal
                            ? item.image_url
                            : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image_url}`
                        }
                        alt={item.title}
                        className="block w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-[1.04]"
                        loading="lazy"
                      />

                      {/* Overlay Caption (tablet ke atas) */}
                      <div
                        className="hidden sm:flex absolute left-0 right-0 bottom-0 p-4 sm:p-5 pt-12 flex-col justify-end transition-colors duration-300 z-10"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
                        }}
                      >
                        <span className="text-green-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider mb-1 drop-shadow-md">
                          {item.category}
                        </span>
                        <h3 className="text-white font-semibold text-base sm:text-lg leading-snug line-clamp-2 drop-shadow-md">
                          {item.title}
                        </h3>
                      </div>

                      {/* Hover Magnifying Glass */}
                      <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                        <div className="bg-white/15 dark:bg-black/45 backdrop-blur-sm p-3 rounded-full text-white shadow-md dark:shadow-none">
                          <FiMaximize2 size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Caption (mobile, tidak menumpuk di atas gambar) */}
                    <div className="sm:hidden px-4 py-3.5">
                      <span className="block text-PrimaryColor-0 font-bold text-[11px] uppercase tracking-wider mb-1">
                        {item.category}
                      </span>
                      <h3 className="text-ink font-semibold text-[15px] leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-24 bg-surface2 rounded-3xl border border-line shadow-sm">
            <div className="w-20 h-20 bg-green-50 text-PrimaryColor-0 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiImage size={32} />
            </div>
            <h3 className="text-2xl font-bold text-ink mb-2">
              Belum ada foto
            </h3>
            <p className="text-muted">
              Belum ada koleksi foto yang diunggah untuk kategori{" "}
              <span className="font-bold">"{activeCategory}"</span>.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && filteredGaleri[selectedImageIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto"
            style={{
              background: "rgba(0, 0, 0, 0.88)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Close Button */}
            <button
              className="fixed top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 w-11 h-11 flex items-center justify-center text-white hover:text-white transition-colors bg-black/50 hover:bg-black/70 rounded-full z-[10000]"
              onClick={() => setSelectedImageIndex(null)}
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6 md:w-7 md:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            {/* Navigation Controls (tablet ke atas) */}
            {filteredGaleri.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="hidden sm:flex absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 w-12 h-12 md:w-14 md:h-14 items-center justify-center rounded-full transition-colors z-[10000]"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={28} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="hidden sm:flex absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 w-12 h-12 md:w-14 md:h-14 items-center justify-center rounded-full transition-colors z-[10000]"
                  aria-label="Next image"
                >
                  <FiChevronRight size={28} />
                </button>
              </>
            )}

            {/* Modal Image Container */}
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col items-center w-full max-w-5xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-black/70 flex items-center justify-center">
                <img decoding="async"
                  src={
                    filteredGaleri[selectedImageIndex].isLocal
                      ? filteredGaleri[selectedImageIndex].image_url
                      : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${filteredGaleri[selectedImageIndex].image_url}`
                  }
                  alt={filteredGaleri[selectedImageIndex].title}
                  className="block w-full h-auto max-h-[52svh] sm:max-h-[68svh] md:max-h-[72svh] object-contain"
                />
              </div>

              {/* Caption di bawah gambar supaya tidak menutupi foto */}
              <div className="w-full mt-3 sm:mt-5 text-center sm:text-left px-1">
                <span className="block text-green-300 font-bold text-[11px] sm:text-xs tracking-[0.1em] uppercase mb-1.5">
                  {filteredGaleri[selectedImageIndex].category}
                </span>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-snug line-clamp-3 sm:line-clamp-2">
                  {filteredGaleri[selectedImageIndex].title}
                </h3>
              </div>

              {/* Navigasi mobile: tombol besar di bawah, tidak menutupi gambar */}
              {filteredGaleri.length > 1 && (
                <div className="sm:hidden flex items-center justify-between gap-3 w-full mt-4">
                  <button
                    onClick={handlePrevImage}
                    className="flex items-center justify-center gap-1.5 h-12 px-5 rounded-full bg-white/10 active:bg-white/20 text-white text-sm font-semibold"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft size={20} /> Sebelumnya
                  </button>
                  <span className="text-xs text-white/70 tabular-nums">
                    {selectedImageIndex + 1} / {filteredGaleri.length}
                  </span>
                  <button
                    onClick={handleNextImage}
                    className="flex items-center justify-center gap-1.5 h-12 px-5 rounded-full bg-white/10 active:bg-white/20 text-white text-sm font-semibold"
                    aria-label="Next image"
                  >
                    Selanjutnya <FiChevronRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GaleriAlfilaha;
