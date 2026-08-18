import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaLeaf,
  FaBookOpen,
  FaCampground,
  FaStore,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";
import GaleriAlfilaha from "../InnerPage/GaleriAlfilaha/GaleriAlfilaha";

import subTitleShape from "/images/sub-title-shape.png";
import buttonShape from "/images/button-shape-1.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const Home1 = () => {
  const [wisata, setWisata] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const url = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
        const [resWisata, resBlogs] = await Promise.all([
          fetch(`${url}/api/paket`).catch(() => null),
          fetch(`${url}/api/blogs`).catch(() => null),
        ]);

        if (resWisata && resWisata.ok) setWisata(await resWisata.json());
        if (resBlogs && resBlogs.ok) {
          const b = await resBlogs.json();
          setBlogs(b.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchApi();
  }, []);

  return (
    <div className="font-AlbertSans text-gray-800 bg-[#f8fcfb] overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative h-[100svh] min-h-[500px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[url('/images/IMG_0615.JPG')] bg-cover bg-center animate-kenburns origin-center"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16 md:mt-20">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeInUp}
              className="flex justify-center mb-4 md:mb-6"
            >
              <span className="bg-PrimaryColor-0 text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-semibold tracking-wider flex items-center gap-2 shadow-lg">
                <FaLeaf /> SELAMAT DATANG DI ALFILAHA
              </span>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-[76px] font-extrabold tracking-tight mb-4 md:mb-8 text-white font-AlbertSans leading-tight md:leading-tight">
                Belajar, Bertani, dan <br className="hidden md:block" />
                <span className="text-[#a5d15a]">Bertumbuh Bersama Alam</span>
              </h1>
            </motion.div>
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
            >
              Kawasan pertanian dan edukasi berbasis pesantren yang
              menghubungkan ilmu, alam, dan kemandirian.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 w-full sm:w-auto px-4 sm:px-0"
            >
              <a
                href="#empat-pilar"
                className="w-full sm:w-auto primary-btn3 shadow-xl shadow-PrimaryColor-0/30 hover:-translate-y-1 transition-transform flex justify-center items-center"
              >
                Jelajahi Alfilaha
                <img
                  src={buttonShape}
                  alt="shape"
                  className="ml-2 w-4 h-4 object-contain filter brightness-0 invert"
                />
              </a>
              <a
                href="#kegiatan"
                className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-[17px] bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium rounded-md uppercase text-sm md:text-[15px] transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                Kegiatan Kami <BsArrowRight className="text-lg" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. EMPAT PILAR SECTION */}
      <section
        id="empat-pilar"
        className="py-[120px] bg-white relative z-20 -mt-10 rounded-t-[3rem] shadow-sm"
      >
        <div className="Container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex justify-center mb-3">
              <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                <img loading="lazy" src={subTitleShape} draggable="false" />
                Pilar Alfilaha
              </h5>
            </div>
            <h2 className="text-[32px] md:text-[44px] font-bold text-HeadingColor-0 leading-tight">
              Menanam Ilmu, Menumbuhkan Kemandirian.
            </h2>
            <p className="text-TextColor-0 text-lg mt-5">
              Sebuah ruang yang mempertemukan pendidikan, pertanian, ketahanan
              pangan, dan pengalaman belajar di alam dalam lingkungan pesantren.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaBookOpen />,
                title: "Pertanian Edukasi",
                desc: "Belajar langsung dari lahan.",
                color: "text-[#0c7f6e]",
                bg: "bg-[#e6f2f0]",
              },
              {
                icon: <FaLeaf />,
                title: "Ketahanan Pangan",
                desc: "Menumbuhkan kemandirian dari pangan.",
                color: "text-[#d97706]",
                bg: "bg-[#fef3c7]",
              },
              {
                icon: <FaStore />,
                title: "Pertanian Produksi",
                desc: "Dari lahan, menghasilkan manfaat.",
                color: "text-[#2563eb]",
                bg: "bg-[#dbeafe]",
              },
              {
                icon: <FaCampground />,
                title: "Eduwisata",
                desc: "Belajar, beraktivitas, dan menikmati alam.",
                color: "text-[#9333ea]",
                bg: "bg-[#f3e8ff]",
              },
            ].map((pilar, idx) => (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: idx * 0.1, duration: 0.5 },
                  },
                }}
                whileHover={{ y: -10 }}
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-BorderColor2-0 group transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
              >
                <div
                  className={`w-[80px] h-[80px] rounded-[24px] flex items-center justify-center mb-6 transition-all duration-500 ${pilar.bg} ${pilar.color} group-hover:bg-PrimaryColor-0 group-hover:text-white transform group-hover:rotate-12 group-hover:scale-110`}
                >
                  <div className="text-[34px]">{pilar.icon}</div>
                </div>
                <h4 className="text-[22px] font-bold text-HeadingColor-0 mb-3 group-hover:text-PrimaryColor-0 transition-colors">
                  {pilar.title}
                </h4>
                <p className="text-TextColor-0">{pilar.desc}</p>
                <div className="absolute -bottom-10 -right-10 text-9xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  {pilar.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TENTANG AL-FILAHA */}
      <section className="py-[120px] bg-[#f8fcfb] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-PrimaryColor-0/5 rounded-r-full blur-3xl -z-10"></div>
        <div className="Container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-shadow h-[600px] border-[10px] border-white z-10">
                <img
                  src="/images/kurikulum-2.jpg"
                  alt="Tentang Alfilaha"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-10 right-10 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border-l-[6px] border-PrimaryColor-0 z-20"
              >
                <div className="bg-[#e6f2f0] p-4 rounded-full text-PrimaryColor-0">
                  <FaBookOpen className="text-3xl" />
                </div>
                <div>
                  <h4 className="font-bold text-HeadingColor-0 text-xl">
                    Ruang Belajar
                  </h4>
                  <p className="text-[15px] text-TextColor-0">
                    Terbuka di Alam
                  </p>
                </div>
              </motion.div>
              <div className="absolute top-1/2 -left-10 w-32 h-32 bg-[url('/images/about-shape-1.png')] bg-contain bg-no-repeat animate-zoomInOut opacity-50"></div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:pl-8"
            >
              <motion.div variants={fadeInUp} className="flex mb-3">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img loading="lazy" src={subTitleShape} draggable="false" />
                  Tentang Kami
                </h5>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-[32px] md:text-[44px] font-bold text-HeadingColor-0 leading-tight mb-6"
              >
                Ruang Belajar Antara Pendidikan, Pertanian, dan Kehidupan
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-TextColor-0 text-[17px] mb-8 leading-relaxed"
              >
                Alfilaha hadir sebagai ruang belajar yang mempertemukan
                pendidikan, pertanian, dan kehidupan. Di sini, lahan bukan hanya
                tempat menghasilkan pangan, tetapi juga menjadi ruang untuk
                belajar, berkarya, dan membangun kemandirian.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-7">
                {[
                  {
                    title: "Keislaman",
                    desc: "Mengakar pada tauhid, menjadikan pengelolaan alam sebagai ibadah.",
                  },
                  {
                    title: "Kemandirian",
                    desc: "Mendidik generasi yang mampu berdiri di atas kaki sendiri.",
                  },
                  {
                    title: "Pertanian Berkelanjutan",
                    desc: "Merawat bumi dengan metode agrikultur yang ramah lingkungan.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 items-start group">
                    <div className="w-[42px] h-[42px] rounded-full bg-PrimaryColor-0 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md group-hover:scale-110 transition-transform">
                      <BsArrowRight className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-HeadingColor-0 text-xl group-hover:text-PrimaryColor-0 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-TextColor-0 mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12">
                <Link
                  to="/about"
                  className="primary-btn2 shadow-xl shadow-PrimaryColor-0/30"
                >
                  Lebih Mengenal Kami{" "}
                  <img
                    src={buttonShape}
                    alt="shape"
                    className="ml-2 w-4 h-4 object-contain filter brightness-0 invert"
                  />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. PERTANIAN EDUKASI */}
      <section className="py-[120px] bg-SecondaryColor-0 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/about-bg.jpg')] opacity-5 bg-cover bg-center mix-blend-luminosity"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-PrimaryColor-0 rounded-full blur-[100px] opacity-20 -z-0"></div>
        <div className="Container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="order-2 lg:order-1"
            >
              <motion.div variants={fadeInUp} className="flex mb-3">
                <h5 className="font-AlbertSans font-semibold text-[#a5d15a] flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img
                    loading="lazy"
                    src={subTitleShape}
                    draggable="false"
                    className="filter brightness-0 invert opacity-80"
                  />
                  Program Unggulan
                </h5>
              </motion.div>
              <motion.h3
                variants={fadeInUp}
                className="text-[32px] md:text-[44px] font-bold mb-6 leading-tight"
              >
                Pertanian Edukasi
              </motion.h3>
              <motion.div
                variants={fadeInUp}
                className="bg-white/5 p-6 rounded-2xl border-l-4 border-[#a5d15a] mb-8 backdrop-blur-sm"
              >
                <p className="text-white/90 text-[19px] leading-relaxed italic font-serif">
                  &quot;Belajar pertanian tidak hanya dari buku, tetapi langsung
                  dari tanah dan prosesnya.&quot;
                </p>
              </motion.div>
              <motion.p
                variants={fadeInUp}
                className="text-TextColor2-0 mb-8 leading-relaxed text-[17px]"
              >
                Bersama fasilitator berpengalaman dan para santri, kami membuka
                pintu bagi anak-anak, pelajar, mahasiswa, hingga masyarakat umum
                untuk terjun langsung melalui:
              </motion.p>

              <motion.ul
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
              >
                {[
                  "Praktik budidaya tanaman",
                  "Teknik pembibitan & persemaian",
                  "Cara pengolahan lahan",
                  "Perawatan & pemeliharaan",
                  "Sukacita panen",
                  "Workshop pertanian",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10 hover:bg-PrimaryColor-0 hover:border-PrimaryColor-0 transition-all cursor-default"
                  >
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#a5d15a]">
                      <BsArrowRight className="text-sm" />
                    </span>
                    <span className="text-white/90 font-medium">{item}</span>
                  </li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 relative h-[550px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-white/10"
            >
              <img
                src="/images/planting-tree.jpg"
                alt="Edukasi"
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. KETAHANAN PANGAN & PRODUKSI */}
      <section className="py-[120px] bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[url('/images/about-shape.png')] w-40 h-40 bg-contain bg-no-repeat opacity-20 animate-dance7 hidden lg:block"></div>
        <div className="Container">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="flex justify-center mb-3">
              <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                <img loading="lazy" src={subTitleShape} draggable="false" />
                Dari Lahan Untuk Kehidupan
              </h5>
            </div>
            <h2 className="text-[32px] md:text-[44px] font-bold text-HeadingColor-0 leading-tight">
              Ketahanan Pangan & Produksi
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[550px] rounded-[2rem] overflow-hidden shadow-shadow group"
            >
              <img
                src="/images/services-plant-2.jpg"
                alt="Ketahanan Pangan"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-10">
                <div className="bg-PrimaryColor-0/90 backdrop-blur-md p-6 rounded-2xl border-l-4 border-[#a5d15a] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white text-[22px] font-bold mb-2">
                    Kemandirian Santri
                  </h3>
                  <p className="text-white/80 text-[15px]">
                    Membangun fondasi masa depan melalui kemandirian pangan di
                    pesantren.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6"
            >
              {[
                {
                  title: "Kemandirian Pangan Pesantren",
                  desc: "Memastikan piring para santri terisi dari hasil keringat dan tanah mereka sendiri.",
                  icon: <FaStore />,
                },
                {
                  title: "Budidaya & Pangan Lokal",
                  desc: "Memprioritaskan komoditas lokal yang tangguh dan bergizi untuk ketahanan jangka panjang.",
                  icon: <FaLeaf />,
                },
                {
                  title: "Pengolahan & Diversifikasi",
                  desc: "Mengolah hasil panen mentah menjadi aneka ragam makanan bernilai tambah tinggi.",
                  icon: <FaCampground />,
                },
              ].map((item, idx) => (
                <motion.div
                  variants={fadeInUp}
                  key={idx}
                  className="p-8 bg-white rounded-[2rem] border border-BorderColor2-0 flex gap-6 items-start shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-shadow hover:border-transparent transition-all group"
                >
                  <div className="w-[60px] h-[60px] bg-[#e6f2f0] text-PrimaryColor-0 rounded-[18px] flex items-center justify-center flex-shrink-0 text-[28px] group-hover:bg-PrimaryColor-0 group-hover:text-white transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-HeadingColor-0 text-[22px] mb-3 group-hover:text-PrimaryColor-0 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-TextColor-0 text-[16px] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. EDUWISATA (Using Data from API) */}
      <section className="py-[120px] bg-[#f8fcfb] relative overflow-hidden">
        <div className="Container">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="flex mb-3">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img loading="lazy" src={subTitleShape} draggable="false" />
                  Jelajah Alam
                </h5>
              </div>
              <h2 className="text-[32px] md:text-[44px] font-bold text-HeadingColor-0 leading-tight">
                Eduwisata Al-Filaha
              </h2>
              <p className="text-TextColor-0 text-[17px] mt-4">
                Perjalanan menyatu dengan alam yang penuh pembelajaran, didesain
                khusus untuk keluarga, sekolah, dan komunitas.
              </p>
            </div>
            <Link to="/pesan-tempat" className="primary-btn3 shrink-0">
              Lihat Semua Paket
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wisata.length > 0
              ? wisata.map((paket, idx) => (
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { delay: idx * 0.1, duration: 0.5 },
                      },
                    }}
                    whileHover={{ y: -10 }}
                    key={paket.id || idx}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-BorderColor2-0 flex flex-col group hover:shadow-shadow transition-all duration-300"
                  >
                    <div className="h-[240px] overflow-hidden relative">
                      <img
                        src={
                          paket.image
                            ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${paket.image}`
                            : "/images/services-plant-4.jpg"
                        }
                        alt={paket.nama_paket}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-5 right-5 bg-white px-5 py-2 rounded-full text-PrimaryColor-0 font-bold shadow-lg flex items-center gap-2">
                        <FaStore className="text-sm" /> {paket.harga}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <h4 className="font-bold text-[24px] text-HeadingColor-0 mb-4 group-hover:text-PrimaryColor-0 transition-colors">
                        {paket.nama_paket}
                      </h4>
                      <p className="text-TextColor-0 mb-8 flex-1 line-clamp-3 text-[16px] leading-relaxed">
                        {paket.deskripsi}
                      </p>
                      <Link
                        to="/pesan-tempat"
                        className="w-full py-4 text-center bg-[#f8fcfb] text-HeadingColor-0 font-semibold rounded-xl hover:bg-PrimaryColor-0 hover:text-white transition-colors duration-300 flex justify-center items-center gap-2"
                      >
                        Pesan Sekarang <FaArrowRightLong />
                      </Link>
                    </div>
                  </motion.div>
                ))
              : [1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-BorderColor2-0 flex flex-col p-6"
                  >
                    <div className="w-full h-[200px] bg-gray-200 rounded-xl mb-4"></div>
                    <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="w-1/2 h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="w-full h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="w-full h-12 bg-gray-200 rounded-xl mt-auto"></div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* 7. GALERI */}
      <div className="py-20 bg-white">
        <GaleriAlfilaha isHome={true} />
      </div>

      {/* 8. BLOG / KEGIATAN */}
      <section id="kegiatan" className="py-[120px] bg-[#f8fcfb]">
        <div className="Container">
          <div className="flex flex-col items-center lg:flex-row lg:justify-between lg:items-end mb-12 md:mb-16 gap-6 text-center lg:text-left">
            <div className="flex flex-col items-center lg:items-start">
              <div className="flex justify-center lg:justify-start mb-3">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img loading="lazy" src={subTitleShape} draggable="false" />
                  Kabar Terbaru
                </h5>
              </div>
              <h2 className="text-[32px] md:text-[44px] font-bold text-HeadingColor-0 leading-tight">
                Kegiatan Alfilaha
              </h2>
            </div>
            <Link to="/blog_grid">
              <button className="primary-btn3">
                Lihat Semua Berita{" "}
                <img
                  loading="lazy"
                  src={buttonShape}
                  draggable="false"
                  className="ml-2 filter brightness-0 invert"
                />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.length > 0 ? (
              blogs.map((blog, idx) => (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { delay: idx * 0.1, duration: 0.5 },
                    },
                  }}
                  key={blog.id}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-BorderColor2-0 hover:shadow-shadow transition-all group flex flex-col"
                >
                  <div className="h-[260px] overflow-hidden relative">
                    <img
                      src={
                        blog.image
                          ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${blog.image}`
                          : "/images/blog-new-1.jpg"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-5 left-5 bg-PrimaryColor-0 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                      {blog.date}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h4 className="font-bold text-[22px] text-HeadingColor-0 mb-4 line-clamp-2 group-hover:text-PrimaryColor-0 transition-colors">
                      <Link to={`/blog_details/${blog.id}`}>{blog.title}</Link>
                    </h4>
                    <p className="text-TextColor-0 text-[16px] line-clamp-3 mb-8 flex-1 leading-relaxed">
                      {blog.excerpt}
                    </p>
                    <div className="pt-6 border-t border-BorderColor2-0">
                      <Link
                        to={`/blog_details/${blog.id}`}
                        className="inline-flex items-center gap-2 text-PrimaryColor-0 font-bold hover:gap-3 transition-all text-[15px] uppercase tracking-wide"
                      >
                        Baca Selengkapnya{" "}
                        <FaArrowRightLong className="text-lg" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-TextColor-0 col-span-3 text-center">
                Belum ada berita terbaru.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 9. KONTAK / KUNJUNGI KAMI */}
      <section id="kontak" className="py-[120px] bg-white relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f8fcfb] -z-10 hidden lg:block rounded-l-[4rem]"></div>
        <div className="Container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:pr-10"
            >
              <motion.div variants={fadeInUp} className="flex mb-3">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img loading="lazy" src={subTitleShape} draggable="false" />
                  Hubungi Kami
                </h5>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-[32px] md:text-[44px] font-bold text-HeadingColor-0 leading-tight mb-6"
              >
                Pintu Kami Selalu Terbuka
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-TextColor-0 mb-10 text-[17px] leading-relaxed"
              >
                Rencanakan kunjungan Anda hari ini atau diskusikan ide
                kolaborasi bersama kami. Kami selalu menyambut siapa saja yang
                ingin bertumbuh bersama alam.
              </motion.p>

              <motion.div variants={fadeInUp} className="space-y-6">
                {[
                  {
                    icon: <FaMapMarkerAlt />,
                    title: "Lokasi",
                    desc: (
                      <a
                        href="https://maps.app.goo.gl/YkgSNQFk1tjz67n18"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-PrimaryColor-0 transition-colors"
                      >
                        Jl. Dusun Tepus, Bulukerto, Sewurejo, Kec. Mojogedang,
                        Kabupaten Karanganyar, Jawa Tengah 57752, Indonesia
                      </a>
                    ),
                  },
                  {
                    icon: <FaWhatsapp />,
                    title: "WhatsApp",
                    desc: "+62 812-3456-7890",
                  },
                  { icon: <FaEnvelope />, title: "Email", desc: "-" },
                ].map((info, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-BorderColor2-0 hover:border-PrimaryColor-0 hover:shadow-md transition-all group"
                  >
                    <div className="w-[60px] h-[60px] bg-[#e6f2f0] rounded-full flex items-center justify-center flex-shrink-0 text-PrimaryColor-0 text-2xl group-hover:bg-PrimaryColor-0 group-hover:text-white transition-colors">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-HeadingColor-0 text-[19px]">
                        {info.title}
                      </h4>
                      <p className="text-TextColor-0 text-[15px] mt-1">
                        {info.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12">
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="primary-btn2 inline-flex items-center gap-2 shadow-xl shadow-PrimaryColor-0/30 hover:-translate-y-1 transform transition-all text-[16px] py-[18px]"
                >
                  <FaWhatsapp className="text-[22px]" /> Hubungi via WhatsApp
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-[550px] lg:h-[700px] rounded-[2.5rem] overflow-hidden shadow-shadow border-[10px] border-white relative z-10"
            >
              <iframe
                src="https://maps.google.com/maps?q=-7.5823424,110.9985186&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home1;
