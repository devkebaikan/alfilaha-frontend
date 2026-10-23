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
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const url = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
        const [resWisata, resBlogs] = await Promise.all([
          fetch(`${url}/api/paket`).catch(() => null),
          // Hanya butuh 3 artikel terbaru & tanpa kolom `content` yang berat.
          fetch(`${url}/api/blogs?limit=3&fields=list`).catch(() => null),
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
    <div className="font-AlbertSans text-ink bg-surface overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative h-[100svh] min-h-[500px] lg:min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <picture className="block w-full h-full animate-kenburns origin-center">
            <source
              media="(min-width: 1280px)"
              srcSet="/images/IMG_0615-1920.jpg"
              type="image/jpeg"
            />
            <img
              src="/images/IMG_0615.JPG"
              srcSet="/images/IMG_0615-640.jpg 640w, /images/IMG_0615.JPG 1024w"
              sizes="100vw"
              width="1024"
              height="682"
              alt="Latar kawasan pertanian Alfilaha"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover object-center"
            />
          </picture>
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
              <span className="bg-PrimaryColor-0 text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-semibold tracking-wider flex items-center gap-2 shadow-md shadow-black/20">
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
              menghubungkan ilmu, alam, dan kemandirian, lengkap dengan program
              pembelajaran, produksi pangan, serta eduwisata.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 w-full sm:w-auto px-4 sm:px-0"
            >
              <a
                href="#empat-pilar"
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-md uppercase text-[15px] px-8 sm:px-9 py-4 font-AlbertSans font-medium bg-PrimaryColor-0 border border-PrimaryColor-0 text-white shadow-md shadow-PrimaryColor-0/20 hover:bg-[#0a6658] hover:border-[#0a6658] hover:shadow-PrimaryColor-0/10 dark:hover:bg-[#085448] dark:hover:border-[#085448] dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Jelajahi Alfilaha
                <img loading="lazy" decoding="async"
                  src={buttonShape}
                  alt="shape"
                  className="ml-2 w-4 h-4 object-contain filter brightness-0 invert"
                />
              </a>
              <a
                href="#kegiatan"
                className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-[17px] bg-white/10 hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-md border border-white/25 hover:border-white/40 dark:hover:border-white/30 text-white font-medium rounded-md uppercase text-sm md:text-[15px] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
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
        className="py-16 sm:py-20 lg:py-[120px] bg-card relative z-20 -mt-4 rounded-t-[3rem] shadow-sm"
      >
        <div className="Container">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-3 sm:px-6">
            <div className="flex justify-center mb-4">
              <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
                Pilar Alfilaha
              </h5>
            </div>
            <h2 className="text-[28px] sm:text-[34px] md:text-[44px] font-bold text-HeadingColor-0 leading-[1.25] max-w-2xl mx-auto px-1 sm:px-2">
              Menanam Ilmu, Menumbuhkan Kemandirian.
            </h2>
            <p className="text-TextColor-0 text-[16px] sm:text-[17px] mt-5 sm:mt-6 leading-[1.8] max-w-xl mx-auto px-1 sm:px-2">
              Sebuah ruang yang mempertemukan pendidikan, pertanian, ketahanan
              pangan, dan pengalaman belajar di alam dalam lingkungan pesantren.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {[
              {
                icon: <FaBookOpen />,
                title: "Pertanian Edukasi",
                desc: "Belajar langsung dari lahan, mulai dari menyemai, merawat, sampai memanen hasil pangan bersama fasilitator.",
                color: "text-[#0c7f6e] dark:text-[#4ade80]",
                bg: "bg-[#e6f2f0] dark:bg-[#0c7f6e]/20",
              },
              {
                icon: <FaLeaf />,
                title: "Ketahanan Pangan",
                desc: "Menumbuhkan kemandirian dari pangan lokal agar lebih mandiri dan tangguh.",
                color: "text-[#d97706] dark:text-[#fbbf24]",
                bg: "bg-[#fef3c7] dark:bg-[#d97706]/20",
              },
              {
                icon: <FaStore />,
                title: "Pertanian Produksi",
                desc: "Dari lahan menjadi nilai, mengolah hasil panen menjadi produk siap pakai dan bernilai jual.",
                color: "text-[#2563eb] dark:text-[#60a5fa]",
                bg: "bg-[#dbeafe] dark:bg-[#2563eb]/20",
              },
              {
                icon: <FaCampground />,
                title: "Eduwisata",
                desc: "Belajar, berjalan, dan menikmati alam bersama keluarga, sekolah, maupun komunitas.",
                color: "text-[#9333ea] dark:text-[#c084fc]",
                bg: "bg-[#f3e8ff] dark:bg-[#9333ea]/20",
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
                className="bg-card rounded-2xl px-5 py-6 sm:px-6 sm:py-7 lg:px-7 lg:py-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-line group transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
              >
                <div
                  className={`w-[80px] h-[80px] rounded-[24px] flex items-center justify-center mb-6 transition-all duration-500 ${pilar.bg} ${pilar.color} group-hover:bg-[#0a6658] group-hover:text-white dark:group-hover:bg-PrimaryColor-0/25 dark:group-hover:text-PrimaryColor-0 transform group-hover:scale-105`}
                >
                  <div className="text-[34px]">{pilar.icon}</div>
                </div>
                <h4 className="text-[19px] sm:text-[22px] font-bold text-HeadingColor-0 mb-2.5 sm:mb-3.5 px-2 sm:px-3 group-hover:text-[#0a6658] dark:group-hover:text-[#0e8f7a] transition-colors duration-300">
                  {pilar.title}
                </h4>
                <p className="text-TextColor-0 text-[15px] sm:text-[16px] leading-relaxed max-w-[34ch] px-1 sm:px-2">
                  {pilar.desc}
                </p>
                <div className="absolute -bottom-10 -right-10 text-9xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  {pilar.icon}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TENTANG AL-FILAHA */}
      <section className="py-16 sm:py-20 lg:py-[120px] bg-surface2 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-PrimaryColor-0/5 rounded-r-full blur-3xl -z-10"></div>
        <div className="Container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.10)] h-[320px] sm:h-[440px] lg:h-[600px] border-[6px] sm:border-[10px] border-white/50 dark:border-white/10 z-10">
                <img loading="lazy" decoding="async"
                  src="/images/kurikulum-2.jpg"
                  alt="Tentang Alfilaha"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-6 sm:-bottom-10 right-2 sm:right-10 bg-card p-4 sm:p-6 rounded-2xl shadow-xl flex items-center gap-3 sm:gap-4 border-l-[6px] border-PrimaryColor-0 z-20"
              >
                <div className="bg-[#e6f2f0] dark:bg-PrimaryColor-0/20 p-4 rounded-full text-PrimaryColor-0">
                  <FaBookOpen className="text-2xl sm:text-3xl" />
                </div>
                <div>
                  <h4 className="font-bold text-HeadingColor-0 text-lg sm:text-xl leading-snug">
                    Ruang Belajar
                  </h4>
                  <p className="text-[13px] sm:text-[15px] text-TextColor-0 leading-relaxed max-w-[24ch]">
                    Ruang kelas yang terbuka, langsung di lahan
                  </p>
                </div>
              </motion.div>
              <div className="hidden lg:block absolute top-1/2 -left-10 w-32 h-32 bg-[url('/images/about-shape-1.png')] bg-contain bg-no-repeat animate-zoomInOut opacity-50"></div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:pl-8 pl-4 pr-2 sm:pl-7 sm:pr-4 lg:pr-0"
            >
              <motion.div variants={fadeInUp} className="flex mb-4">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
                  Tentang Kami
                </h5>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-[28px] sm:text-[34px] md:text-[44px] font-bold text-HeadingColor-0 leading-[1.25] mb-4 sm:mb-5"
              >
                Ruang Belajar Antara Pendidikan, Pertanian, dan Kehidupan
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-TextColor-0 text-[16px] sm:text-[17px] mb-8 leading-[1.8] max-w-xl"
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
                    desc: "Mengakar pada tauhid, menjadikan mengelola dan merawat alam sebagai bagian dari ibadah, bukan sekadar pekerjaan.",
                  },
                  {
                    title: "Kemandirian",
                    desc: "Mendidik generasi agar mampu berdiri di atas kaki sendiri melalui kemandirian pangan dan keterampilan kerja yang nyata.",
                  },
                  {
                    title: "Pertanian Berkelanjutan",
                    desc: "Merawat bumi dengan cara bertani yang ramah lingkungan, efisien, dan bisa dilanjutkan ke generasi berikutnya.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-5 items-start group cursor-pointer"
                  >
                    <div className="w-[42px] h-[42px] rounded-full bg-PrimaryColor-0 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm shadow-black/10 group-hover:scale-[1.05] group-hover:bg-[#0a6658] dark:group-hover:bg-[#085448] group-hover:shadow-none transition-all duration-300">
                      <BsArrowRight className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-HeadingColor-0 text-xl group-hover:text-[#0a6658] dark:group-hover:text-[#0e8f7a] transition-colors duration-300">
                        {item.title}
                      </h4>
                      <p className="text-TextColor-0 text-[15px] sm:text-[16px] leading-relaxed mt-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-12">
                <Link
                  to="/about"
                  className="group/btn inline-flex items-center gap-2 rounded-full bg-PrimaryColor-0 text-white font-medium font-AlbertSans text-[15px] sm:text-[16px] px-7 sm:px-9 py-3.5 border border-PrimaryColor-0 shadow-md shadow-PrimaryColor-0/15 hover:bg-[#0a6658] hover:border-[#0a6658] hover:shadow-PrimaryColor-0/10 dark:hover:bg-[#085448] dark:hover:border-[#085448] dark:hover:shadow-black/20 transition-all duration-300"
                >
                  Lebih Mengenal Kami{" "}
                  <img loading="lazy" decoding="async"
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
      <section className="py-16 sm:py-20 lg:py-[120px] bg-SecondaryColor-0 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/about-bg.jpg')] opacity-5 bg-cover bg-center mix-blend-luminosity"></div>
        <div className="absolute top-20 right-10 w-64 h-64 bg-PrimaryColor-0 rounded-full blur-[100px] opacity-20 -z-0"></div>
        <div className="Container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="order-2 lg:order-1 pl-4 pr-2 sm:pl-7 sm:pr-4 lg:pl-0 lg:pr-0"
            >
              <motion.div variants={fadeInUp} className="flex mb-4">
                <h5 className="font-AlbertSans font-semibold text-[#a5d15a] flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img decoding="async"
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
                className="text-[28px] sm:text-[34px] md:text-[44px] font-bold mb-5 sm:mb-6 leading-[1.25]"
              >
                Pertanian Edukasi
              </motion.h3>
              <motion.div
                variants={fadeInUp}
                className="bg-white/5 p-5 sm:p-6 rounded-2xl border-l-4 border-[#a5d15a] mb-6 sm:mb-8 backdrop-blur-sm"
              >
                <p className="text-white/90 text-[16px] sm:text-[19px] leading-relaxed italic font-serif">
                  &quot;Belajar pertanian tidak hanya dari buku, tetapi langsung
                  dari tanah dan prosesnya.&quot;
                </p>
              </motion.div>
              <motion.p
                variants={fadeInUp}
                className="text-TextColor2-0 mb-8 leading-[1.8] text-[16px] sm:text-[17px] max-w-xl"
              >
                Bersama fasilitator berpengalaman dan para santri, kami membuka
                pintu bagi anak-anak, pelajar, mahasiswa, hingga masyarakat umum
                untuk terjun langsung melalui:
              </motion.p>

              <motion.ul
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-4"
              >
                {[
                  "Praktik budidaya tanaman",
                  "Teknik pembibitan & persemaian",
                  "Cara pengolahan lahan",
                  "Perawatan & pemeliharaan",
                  "Sukacita panen",
                  "Workshop pertanian",
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/25 dark:hover:bg-white/[0.07] dark:hover:border-white/20 transition-colors duration-300 select-none touch-manipulation cursor-default group"
                  >
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#a5d15a] group-active:scale-90 transition-transform duration-200">
                      <BsArrowRight className="text-sm" />
                    </span>
                    <span className="text-white/90 font-medium">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 relative h-[300px] sm:h-[420px] lg:h-[550px] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[6px] sm:border-[8px] border-white/10"
            >
              <img loading="lazy" decoding="async"
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
      <section className="py-16 sm:py-20 lg:py-[120px] bg-card relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[url('/images/about-shape.png')] w-40 h-40 bg-contain bg-no-repeat opacity-20 animate-dance7 hidden lg:block"></div>
        <div className="Container">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 lg:mb-20 px-3 sm:px-6">
            <div className="flex justify-center mb-4">
              <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
                Dari Lahan Untuk Kehidupan
              </h5>
            </div>
            <h2 className="text-[28px] sm:text-[34px] md:text-[44px] font-bold text-HeadingColor-0 leading-[1.25] max-w-2xl mx-auto px-1 sm:px-2">
              Ketahanan Pangan & Produksi
            </h2>
            <p className="text-TextColor-0 text-[16px] sm:text-[17px] mt-5 sm:mt-6 leading-[1.8] max-w-xl mx-auto px-1 sm:px-2">
              Mengubah hasil panen lokal menjadi pangan yang bergizi dan
              bernilai tambah, serta menopang kebutuhan harian pesantren.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[300px] sm:h-[420px] lg:h-[550px] rounded-[2rem] overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.10)] group"
            >
              <img loading="lazy" decoding="async"
                src="/images/services-plant-2.jpg"
                alt="Ketahanan Pangan"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 sm:p-8 lg:p-10">
                <div className="bg-PrimaryColor-0/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl border-l-4 border-[#a5d15a] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white text-[19px] sm:text-[22px] font-bold mb-2">
                    Kemandirian Santri
                  </h3>
                  <p className="text-white/80 text-[13px] sm:text-[15px] leading-relaxed">
                    Membangun fondasi masa depan pesantren melalui kemandirian
                    pangan yang tumbuh dari lahan sendiri.
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
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="p-5 sm:p-6 lg:p-8 bg-card rounded-[2rem] border border-line flex gap-4 sm:gap-6 items-start shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-none hover:border-PrimaryColor-0/30 select-none touch-manipulation transition-shadow duration-300 group"
                >
                  <div className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] bg-[#e6f2f0] dark:bg-PrimaryColor-0/20 text-PrimaryColor-0 rounded-[18px] flex items-center justify-center flex-shrink-0 text-[24px] sm:text-[28px] group-hover:bg-PrimaryColor-0/12 group-hover:text-PrimaryColor-0/80 dark:group-hover:bg-PrimaryColor-0/15 dark:group-hover:text-PrimaryColor-0/80 group-active:scale-95 transition-colors duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-HeadingColor-0 text-[19px] sm:text-[22px] mb-2 sm:mb-3 group-hover:text-PrimaryColor-0/70 dark:group-hover:text-PrimaryColor-0/70 transition-colors duration-300">
                      {item.title}
                    </h4>
                    <p className="text-TextColor-0 text-[14px] sm:text-[16px] leading-relaxed">
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
      <section className="py-[120px] bg-surface2 relative overflow-hidden">
        <div className="Container">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 sm:mb-16 gap-6 sm:gap-8 pl-4 pr-2 sm:pl-7 sm:pr-4 lg:px-0">
            <div className="max-w-2xl">
              <div className="flex mb-4">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
                  Jelajah Alam
                </h5>
              </div>
              <h2 className="text-[28px] sm:text-[34px] md:text-[44px] font-bold text-HeadingColor-0 leading-[1.25]">
                Eduwisata Al-Filaha
              </h2>
              <p className="text-TextColor-0 text-[16px] sm:text-[17px] mt-5 leading-[1.8] max-w-xl">
                Perjalanan menyatu dengan alam yang penuh pembelajaran, didesain
                khusus untuk keluarga, sekolah, dan komunitas.
              </p>
            </div>
            <Link
              to="/paket-wisata"
              className="primary-btn3 shrink-0 w-full sm:w-auto text-center"
            >
              Lihat Semua Paket
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    className="bg-card rounded-[2rem] overflow-hidden shadow-sm border border-line flex flex-col group hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-none transition-all duration-300"
                  >
                    <div
                      className="cursor-pointer flex-1 flex flex-col"
                      onClick={() => setSelectedDetail(paket)}
                    >
                      <div className="h-[200px] sm:h-[240px] overflow-hidden relative flex-shrink-0">
                        <img loading="lazy" decoding="async"
                          src={
                            paket.gambar
                              ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${paket.gambar}`
                              : "/images/services-plant-4.jpg"
                          }
                          alt={paket.nama_paket}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-card border border-line px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-PrimaryColor-0 text-sm sm:text-base font-bold shadow-sm flex items-center gap-2">
                          <FaStore className="text-sm" /> {paket.harga}
                        </div>
                      </div>
                      <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 flex flex-col flex-1">
                        <h4 className="font-bold text-[20px] sm:text-[24px] leading-[1.3] min-h-[2.6em] text-HeadingColor-0 mb-3 sm:mb-4 line-clamp-2 group-hover:text-PrimaryColor-0/70 transition-colors duration-300">
                          {paket.nama_paket}
                        </h4>
                        <p className="text-TextColor-0 mb-5 flex-1 line-clamp-3 text-[14px] sm:text-[16px] leading-relaxed">
                          {paket.deskripsi
                            ? typeof paket.deskripsi === "string"
                              ? paket.deskripsi.replace(/<[^>]+>/g, "")
                              : paket.deskripsi
                            : ""}
                        </p>
                        <span className="w-max inline-flex items-center gap-1.5 text-sm font-semibold text-PrimaryColor-0/80 group-hover:text-PrimaryColor-0 transition-colors duration-300">
                          Klik untuk melihat detail lengkap
                          <BsArrowRight className="text-xs" />
                        </span>
                      </div>
                    </div>
                    <div className="px-5 sm:px-8 pb-5 sm:pb-8 flex-shrink-0">
                      <Link
                        to="/pesan-tempat"
                        state={{ selectedPaket: paket.nama_paket }}
                        className="w-full py-3.5 sm:py-4 px-5 text-center rounded-xl border border-PrimaryColor-0/30 text-PrimaryColor-0 font-semibold text-[15px] sm:text-base hover:bg-PrimaryColor-0/10 hover:border-PrimaryColor-0/50 dark:hover:bg-PrimaryColor-0/15 transition-colors duration-300 flex justify-center items-center gap-2"
                      >
                        Pesan Sekarang
                        <FaArrowRightLong className="text-sm" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              : [1, 2, 3].map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-card rounded-[2rem] overflow-hidden border border-line animate-pulse flex flex-col"
                  >
                    <div className="h-[200px] sm:h-[240px] bg-surface2 flex-shrink-0"></div>
                    <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 flex flex-col flex-1">
                      <div className="w-3/4 h-7 bg-surface2 rounded mb-4 flex-shrink-0"></div>
                      <div className="w-full h-4 bg-surface2 rounded mb-2"></div>
                      <div className="w-full h-4 bg-surface2 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-surface2 rounded mb-5"></div>
                      <div className="w-40 h-4 bg-surface2 rounded"></div>
                    </div>
                    <div className="px-5 sm:px-8 pb-5 sm:pb-8">
                      <div className="w-full h-[46px] sm:h-[50px] bg-surface2 rounded-xl"></div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* 7. GALERI */}
      <div>
        <GaleriAlfilaha isHome={true} />
      </div>

      {/* 8. BLOG / KEGIATAN */}
      <section id="kegiatan" className="py-16 sm:py-20 lg:py-[120px] bg-surface2">
        <div className="Container">
          <div className="flex flex-col items-center lg:flex-row lg:justify-between lg:items-end mb-12 md:mb-16 gap-6 text-center lg:text-left px-4 sm:px-6 lg:px-0">
            <div className="flex flex-col items-center lg:items-start">
              <div className="flex justify-center lg:justify-start mb-4">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
                  Kabar Terbaru
                </h5>
              </div>
              <h2 className="text-[28px] sm:text-[34px] md:text-[44px] font-bold text-HeadingColor-0 leading-[1.25]">
                Kegiatan AlfilahaKabar 
              </h2>
              <p className="text-TextColor-0 text-[16px] sm:text-[17px] mt-5 leading-[1.8] max-w-xl">
                Catatan lapangan, proses belajar, dan cerita dari lahan yang kami bagikan untuk umum. Dari perawatan kebun dan peternakan hingga kegiatan santri sehari-hari, 
                setiap tulisan merekam pengalaman nyata agar bisa menjadi inspirasi dan bahan belajar bagi siapa pun.
              </p>
            </div>
            <Link to="/blog_grid">
              <button className="primary-btn3">
                Lihat Semua Berita{" "}
                <img decoding="async"
                  loading="lazy"
                  src={buttonShape}
                  draggable="false"
                  className="ml-2 filter brightness-0 invert"
                />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                  className="bg-card rounded-[2rem] overflow-hidden shadow-sm border border-line hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-none transition-all group flex flex-col"
                >
                  <div className="h-[200px] sm:h-[260px] overflow-hidden relative">
                    <img loading="lazy" decoding="async"
                      src={
                        blog.image
                          ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${blog.image}`
                          : "/images/blog-new-1.jpg"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-PrimaryColor-0 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-1.5 rounded-full shadow-lg">
                      {blog.date}
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 lg:p-8 flex flex-col flex-1">
                    <h4 className="font-bold text-[19px] sm:text-[22px] text-HeadingColor-0 mb-3 sm:mb-4 line-clamp-2 group-hover:text-[#0a6658] dark:group-hover:text-[#0e8f7a] transition-colors duration-300">
                      <Link to={`/blog_details/${blog.id}`}>{blog.title}</Link>
                    </h4>
                    <p className="text-TextColor-0 text-[14px] sm:text-[16px] line-clamp-3 mb-6 sm:mb-8 flex-1 leading-relaxed">
                      {blog.excerpt
                        ? typeof blog.excerpt === "string"
                          ? blog.excerpt.replace(/<[^>]+>/g, "")
                          : blog.excerpt
                        : ""}
                        
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
      <section id="kontak" className="py-16 sm:py-20 lg:py-[120px] bg-card relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-surface2 -z-10 hidden lg:block rounded-l-[4rem]"></div>
        <div className="Container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:pr-10 pl-4 pr-2 sm:pl-7 sm:pr-4 lg:pl-0 lg:pr-0"
            >
              <motion.div variants={fadeInUp} className="flex mb-4">
                <h5 className="font-AlbertSans font-semibold text-PrimaryColor-0 flex items-center gap-2 uppercase tracking-[0.1em]">
                  <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
                  Hubungi Kami
                </h5>
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-[28px] sm:text-[34px] md:text-[44px] font-bold text-HeadingColor-0 leading-[1.25] mb-4 sm:mb-5"
              >
                Pintu Kami Selalu Terbuka
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-TextColor-0 mb-8 sm:mb-10 text-[16px] sm:text-[17px] leading-[1.8] max-w-xl"
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
                        className="hover:text-[#0a6658] transition-colors duration-300"
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
                    className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-card rounded-2xl shadow-sm border border-line hover:border-[#0a6658] hover:shadow-sm transition-all duration-300 group"
                  >
                    <div className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] bg-[#e6f2f0] dark:bg-PrimaryColor-0/20 rounded-full flex items-center justify-center flex-shrink-0 text-PrimaryColor-0 text-xl sm:text-2xl group-hover:bg-[#0a6658] group-hover:text-white dark:group-hover:bg-PrimaryColor-0/25 dark:group-hover:text-PrimaryColor-0 transition-colors duration-300">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-HeadingColor-0 text-[17px] sm:text-[19px]">
                        {info.title}
                      </h4>
                      <p className="text-TextColor-0 text-[13px] sm:text-[15px] mt-1 break-words">
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
                  className="inline-flex items-center gap-2 rounded-full bg-PrimaryColor-0 text-white font-medium font-AlbertSans text-[16px] py-[18px] px-10 border border-PrimaryColor-0 shadow-md shadow-PrimaryColor-0/20 hover:bg-[#0a6658] hover:border-[#0a6658] hover:shadow-PrimaryColor-0/10 dark:hover:bg-[#085448] dark:hover:border-[#085448] dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
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
              className="h-[320px] sm:h-[450px] lg:h-[700px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.10)] border-[6px] sm:border-[10px] border-white/50 dark:border-white/10 relative z-10"
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

      {/* Modal Detail Paket */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90svh] overflow-y-auto shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-surface2 rounded-full flex items-center justify-center text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-md z-10 transition-colors text-xl font-bold"
            >
              ✕
            </button>

            {/* Modal Image */}
            <div className="w-full h-52 sm:h-64 md:h-80 relative shrink-0">
              <img loading="lazy" decoding="async"
                src={
                  selectedDetail.gambar
                    ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedDetail.gambar}`
                    : "/images/services-plant-4.jpg"
                }
                alt={selectedDetail.nama_paket}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 line-clamp-2">
                  {selectedDetail.nama_paket}
                </h2>
                <div className="inline-block bg-PrimaryColor-0 text-white px-4 sm:px-5 py-1.5 rounded-full font-bold text-sm sm:text-lg shadow-lg">
                  {selectedDetail.harga}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-HeadingColor-0 mb-4 border-b pb-2">
                Detail Fasilitas & Kegiatan
              </h3>
              <div
                className="prose prose-md text-TextColor-0 font-AlbertSans max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: selectedDetail.deskripsi }}
              />

              <div className="flex gap-4 pt-4 border-t border-BorderColor2-0">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="flex-1 py-3 px-6 rounded-xl border border-line text-ink font-semibold hover:bg-surface2 transition-colors"
                >
                  Tutup
                </button>
                <Link
                  to="/pesan-tempat"
                  state={{ selectedPaket: selectedDetail.nama_paket }}
                  className="flex-1"
                >
                  <button className="w-full py-3 px-6 rounded-xl bg-PrimaryColor-0 text-white font-semibold hover:bg-[#0a6658] dark:hover:bg-[#085448] flex items-center justify-center gap-2 transition-colors duration-300">
                    Pesan Sekarang <FaArrowRightLong />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home1;
