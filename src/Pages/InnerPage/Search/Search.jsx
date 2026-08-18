import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { motion } from "framer-motion";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import BlogCard from "../BlogGrid/BlogCard";

const STATIC_PAGES = [
  {
    title: "Beranda Utama",
    path: "/",
    desc: "Halaman utama Alfilaha dengan sekilas informasi dan layanan",
    type: "Halaman",
  },
  {
    title: "Tentang Kami (About)",
    path: "/about",
    desc: "Informasi mengenai sejarah, visi, misi, dan tim profesional Alfilaha",
    type: "Halaman",
  },
  {
    title: "Layanan Lingkungan",
    path: "/service",
    desc: "Layanan terbaik kami: penanaman pohon, restorasi hutan, daur ulang, komposting",
    type: "Layanan",
  },
  {
    title: "Kubus Alfilaha",
    path: "/kubus-alfilaha",
    desc: "Program unggulan dan inovatif Kubus Alfilaha untuk ketahanan pangan",
    type: "Program",
  },
  {
    title: "Paket Wisata Edukasi",
    path: "/paket-wisata",
    desc: "Daftar paket wisata edukasi alam, camping, outbond, dan edukasi pertanian",
    type: "Program",
  },
  {
    title: "Event & Kegiatan",
    path: "/event",
    desc: "Agenda dan kegiatan terdekat yang diadakan di lingkungan Alfilaha",
    type: "Halaman",
  },
  {
    title: "Galeri Dokumentasi",
    path: "/galeri",
    desc: "Koleksi foto dan video kegiatan, panen, edukasi, dan lingkungan Alfilaha",
    type: "Halaman",
  },
  {
    title: "Pesan Tempat (Reservasi)",
    path: "/pesan-tempat",
    desc: "Formulir pendaftaran, reservasi paket wisata, dan pemesanan tempat",
    type: "Halaman",
  },
  {
    title: "Cek Tanaman",
    path: "/cek-tanaman",
    desc: "Informasi detail perkembangan tanaman, panen, dan edukasi botani",
    type: "Layanan",
  },
  {
    title: "Kontak Kami",
    path: "/contact",
    desc: "Hubungi tim Alfilaha, lokasi peta, dan formulir pesan",
    type: "Halaman",
  },
  {
    title: "Donasi Lingkungan",
    path: "/donation_inner",
    desc: "Berpartisipasi dalam program donasi lingkungan dan kemanusiaan",
    type: "Halaman",
  },
  {
    title: "Dashboard Admin",
    path: "/admin",
    desc: "Halaman manajemen internal Alfilaha (Admin)",
    type: "Sistem",
  },
];

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/blogs`,
        );
        if (response.ok) {
          const data = await response.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error("Backend Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Filter based on query
  const searchStr = query.toLowerCase().trim();

  const filteredPages = STATIC_PAGES.filter(
    (page) =>
      page.title.toLowerCase().includes(searchStr) ||
      page.desc.toLowerCase().includes(searchStr) ||
      page.type.toLowerCase().includes(searchStr),
  );

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchStr) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchStr)),
  );

  const totalResults = filteredPages.length + filteredBlogs.length;

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={`Pencarian`}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Beranda"}
        breadCrumbIcon2={<FaArrowRightLong />}
        breadCrumbContent={"Hasil Pencarian"}
        bgImage={"/images/blog-new-1.jpg"}
      />

      <section className="pt-20 pb-28 min-h-[50vh] bg-[#fdfdfd]">
        <div className="Container">
          <div className="mb-14 border-b border-gray-100 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 font-AlbertSans">
                Hasil pencarian:{" "}
                <span className="text-PrimaryColor-0">"{query}"</span>
              </h2>
              <p className="text-gray-500 mt-2">
                Ditemukan {totalResults} hasil yang relevan di seluruh halaman.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-PrimaryColor-0"></div>
            </div>
          ) : (
            <>
              {totalResults > 0 ? (
                <div className="space-y-12">
                  {/* Static Pages Results */}
                  {filteredPages.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        Halaman & Layanan{" "}
                        <span className="bg-gray-100 text-gray-500 text-sm py-1 px-3 rounded-full">
                          {filteredPages.length}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPages.map((page, index) => (
                          <Link
                            to={page.path}
                            key={index}
                            className="block group"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-PrimaryColor-0 transition-all"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-HeadingColor-0 group-hover:text-PrimaryColor-0 transition-colors">
                                  {page.title}
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                  {page.type}
                                </span>
                              </div>
                              <p className="text-sm text-TextColor-0 line-clamp-2">
                                {page.desc}
                              </p>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blog Results */}
                  {filteredBlogs.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        Artikel Blog{" "}
                        <span className="bg-gray-100 text-gray-500 text-sm py-1 px-3 rounded-full">
                          {filteredBlogs.length}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {filteredBlogs.map((item, index) => {
                          const dateDisplay =
                            item.date &&
                            item.date.includes("-") &&
                            item.date.split("-")[0].length === 4
                              ? `${new Date(item.date).getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][new Date(item.date).getMonth()]} ${new Date(item.date).getFullYear()}`
                              : item.date;

                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              key={item.id}
                            >
                              <BlogCard
                                blogThumb={
                                  item.image
                                    ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image}`
                                    : "/images/blog-new-1.jpg"
                                }
                                thumbContent={dateDisplay}
                                blogUrl={`/blog_details/${item.id}`}
                                blogTitle={item.title}
                                blogDesc={item.excerpt}
                                btnContent={"Baca Selengkapnya"}
                                btnIcon={<FaArrowRightLong />}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-6">
                    <IoSearch size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Tidak Ditemukan
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Maaf, kami tidak dapat menemukan artikel atau halaman yang
                    cocok dengan kata kunci{" "}
                    <span className="font-bold">"{query}"</span>. Silakan coba
                    dengan kata kunci lain.
                  </p>
                  <Link to="/" className="primary-btn">
                    Kembali ke Beranda
                    <FaArrowRightLong size={"20"} />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Search;
