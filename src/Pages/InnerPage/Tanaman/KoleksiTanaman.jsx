import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { FiInfo } from "react-icons/fi";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";

// Ubah deskripsi (bisa berisi HTML) menjadi teks singkat satu baris.
const teksDeskripsi = (html) =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const KoleksiTanaman = () => {
  const [tanamanList, setTanamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [santriRejected, setSantriRejected] = useState(false);

  useEffect(() => {
    const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

    const fetchTanaman = async () => {
      try {
        const res = await fetch(`${API}/api/tanaman`);
        if (res.ok) setTanamanList(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTanaman();

    // Deteksi santri dengan status ditolak -> koleksi tetap muncul tapi diredupkan
    try {
      const s = localStorage.getItem("santri_data");
      if (s) {
        const parsed = JSON.parse(s);
        setSantriRejected(parsed.status_pendaftaran === "Ditolak");
      }
    } catch (_) {
      // abaikan
    }
  }, []);

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Koleksi Tanaman"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Koleksi Tanaman"}
      />
      <section className="py-16 sm:py-20 lg:py-28 bg-surface2">
        <div className="Container">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-PrimaryColor-0 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              {santriRejected && (
                <div className="max-w-xl mx-auto mb-8 bg-red-50 border-2 border-red-200 text-red-800 rounded-2xl p-5 flex items-center gap-3 text-left animate-fade-in-up">
                  <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      Koleksi dalam mode terkunci
                    </p>
                    <p className="text-xs leading-relaxed mt-0.5">
                      Pendaftaran Anda ditolak, sehingga koleksi tanaman tetap
                      dapat dilihat tetapi tidak bisa dicatat perawatan (siram,
                      pupuk, panen).
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                {tanamanList.map((t) => (
                  <div
                    key={t.id}
                    className={`bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-line group flex flex-col ${santriRejected ? "opacity-50 grayscale" : ""}`}
                  >
                    <div className="relative h-52 sm:h-64 overflow-hidden shrink-0">
                      {t.gambar ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${t.gambar}`}
                          alt={t.nama}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-300 font-bold">
                          Tanpa Foto
                        </div>
                      )}
                      {santriRejected && (
                        <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 1a5 5 0 015 5v3h1a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9a2 2 0 012-2h1V6a5 5 0 015-5zm0 2a3 3 0 00-3 3v3h6V6a3 3 0 00-3-3z" />
                          </svg>
                          Terkunci
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-ink mb-2 group-hover:text-PrimaryColor-0 transition-colors line-clamp-1">
                        {t.nama}
                      </h3>
                      <p className="text-muted mb-4 flex items-center gap-2 text-[13px] sm:text-sm">
                        📍 Lokasi: {t.lokasi || t.nama_lokasi}
                      </p>
                      {/* Informasi & Deskripsi singkat (dari database). */}
                      <div className="mb-5 sm:mb-6 rounded-xl border border-line bg-surface2 px-4 py-3">
                        <h4 className="flex items-center text-[11px] font-bold uppercase tracking-wide text-ink mb-1.5">
                          <FiInfo className="mr-1.5 text-green-500" size={14} />
                          Informasi &amp; Deskripsi
                        </h4>
                        {teksDeskripsi(t.deskripsi) ? (
                          <p className="text-xs sm:text-[13px] leading-relaxed text-muted line-clamp-3">
                            {teksDeskripsi(t.deskripsi)}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-[13px] leading-relaxed text-muted">
                            Belum ada deskripsi untuk tanaman ini.
                          </p>
                        )}
                      </div>
                      <div className="mt-auto">
                        <Link
                          to={`/tanaman/${t.id}`}
                          className={`flex items-center justify-center w-full gap-2 font-bold transition-all duration-300 py-3 border rounded-xl ${
                            santriRejected
                              ? "text-muted border-line bg-surface2 pointer-events-none"
                              : "text-PrimaryColor-0 border-green-200 dark:border-green-500/30 hover:bg-PrimaryColor-0 hover:text-white hover:border-PrimaryColor-0 hover:shadow-md active:bg-PrimaryColor-0 active:text-white active:border-PrimaryColor-0 active:shadow-md"
                          }`}
                        >
                          {santriRejected ? (
                            "Terkunci"
                          ) : (
                            <>
                              Detail <FaArrowRightLong />
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && tanamanList.length === 0 && (
            <div className="text-center py-20 text-muted text-lg">
              Belum ada koleksi tanaman yang dipublikasikan.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default KoleksiTanaman;
