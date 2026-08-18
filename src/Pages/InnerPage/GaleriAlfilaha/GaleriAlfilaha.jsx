import React, { useState, useEffect } from 'react';
import { FiImage, FiFilter, FiMaximize2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GaleriAlfilaha = ({ isHome = false }) => {
  const [galeri, setGaleri] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Updated for navigation

  const categories = [
    'Semua', 'Lahan Pertanian', 'Kegiatan Santri', 
    'Edukasi', 'Panen', 'Camping', 'Kegiatan Masyarakat'
  ];

  useEffect(() => {
    const fetchGaleri = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri`);
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

  let filteredGaleri = activeCategory === 'Semua' 
    ? galeri 
    : galeri.filter(item => item.category === activeCategory);
    
  if (isHome) {
    const targetCategories = ['Kegiatan Santri', 'Edukasi', 'Panen', 'Camping'];
    const homeExamples = [];

    targetCategories.forEach(cat => {
      const dbPhoto = galeri.find(item => item.category === cat);
      if (dbPhoto) {
        homeExamples.push(dbPhoto);
      }
    });

    filteredGaleri = homeExamples;
  }

  // Navigation handlers
  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : filteredGaleri.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev < filteredGaleri.length - 1 ? prev + 1 : 0));
  }; 

  const handleKeyDown = (e) => {
    if (selectedImageIndex !== null) {
      if (e.key === 'ArrowLeft') handlePrevImage(e);
      if (e.key === 'ArrowRight') handleNextImage(e);
      if (e.key === 'Escape') setSelectedImageIndex(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-green-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-green-200/30 blur-3xl"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-yellow-100/40 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-green-600 font-bold tracking-wider uppercase text-sm mb-2 block">
            KOLEKSI VISUAL
          </span>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-3 md:mb-4 leading-tight"
          >
            Galeri <span className="text-PrimaryColor-0">Al-Filaha</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-base md:text-lg"
          >
            Dokumentasi kegiatan, edukasi, dan lingkungan Al-Filaha.
          </motion.p>
        </div>

        {/* Filter Navigation */}
        {!isHome && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex overflow-x-auto justify-start lg:justify-center gap-3 mb-10 pb-4 scrollbar-hide whitespace-nowrap px-2"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {categories.map((cat, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm border ${
                  activeCategory === cat
                    ? 'bg-PrimaryColor-0 text-white border-PrimaryColor-0'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-PrimaryColor-0 hover:text-PrimaryColor-0'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        {/* Gallery Grid */}
        {(loading && !isHome) ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-PrimaryColor-0"></div>
          </div>
        ) : filteredGaleri.length > 0 ? (
          <>
            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredGaleri.map((item, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.4, delay: isHome ? index * 0.1 : 0 }}
                    key={item.id} 
                    className="group rounded-2xl overflow-hidden cursor-pointer relative h-[260px] sm:h-[280px] lg:h-[300px] shadow-sm w-full transition-transform active:scale-95"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={item.isLocal ? item.image_url : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image_url}`} 
                      alt={item.title} 
                      className="block w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                    
                    {/* Normal State Overlay (Always visible at bottom) */}
                    <div 
                      className="absolute left-0 right-0 bottom-0 p-4 sm:p-5 pt-12 flex flex-col justify-end transition-colors duration-300 z-10"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))' }}
                    >
                      <span className="text-green-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider mb-1 drop-shadow-md">
                        {item.category}
                      </span>
                      <h3 className="text-white font-semibold text-base sm:text-lg leading-snug line-clamp-2 drop-shadow-md">
                        {item.title}
                      </h3>
                    </div>

                    {/* Hover Magnifying Glass */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full text-white shadow-lg">
                        <FiMaximize2 size={24} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {isHome && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-10 md:mt-14 text-center"
              >
                <Link to="/galeri" className="inline-flex items-center gap-2 px-8 py-3 bg-PrimaryColor-0 hover:bg-[#0a6658] text-white font-bold rounded-full transition-all shadow-md transform hover:-translate-y-1">
                  Lihat Selengkapnya
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-green-50 text-PrimaryColor-0 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiImage size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Belum ada foto</h3>
            <p className="text-gray-500">
              Belum ada koleksi foto yang diunggah untuk kategori <span className="font-bold">"{activeCategory}"</span>.
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
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-8" 
            style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedImageIndex(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full z-[10000]"
              onClick={() => setSelectedImageIndex(null)}
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Navigation Controls */}
            {filteredGaleri.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/60 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors z-[10000]"
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={28} />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/60 w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full transition-colors z-[10000]"
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
              className="relative flex flex-col items-center justify-center" 
              onClick={e => e.stopPropagation()}
            >
              {/* Image constraints handled by responsive classes */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl w-[92vw] md:w-[85vw] max-w-6xl aspect-[4/3] md:aspect-[16/9] bg-black/80 flex items-center justify-center">
                <img 
                  src={filteredGaleri[selectedImageIndex].isLocal ? filteredGaleri[selectedImageIndex].image_url : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${filteredGaleri[selectedImageIndex].image_url}`} 
                  alt={filteredGaleri[selectedImageIndex].title} 
                  className="block w-full h-full object-contain"
                />
                
                {/* Modal Overlay Text (Inside the Image div) */}
                <div 
                  className="absolute left-0 right-0 bottom-0 pt-20 pb-6 px-6 md:px-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0))' }}
                >
                  <span className="block text-green-300 font-bold text-xs md:text-sm tracking-[0.1em] uppercase mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {filteredGaleri[selectedImageIndex].category}
                  </span>
                  <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {filteredGaleri[selectedImageIndex].title}
                  </h3>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GaleriAlfilaha;
