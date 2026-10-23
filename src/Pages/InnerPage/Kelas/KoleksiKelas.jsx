import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { FiInfo, FiUser, FiUsers, FiCalendar, FiMapPin } from "react-icons/fi";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

// Ubah deskripsi (bisa berisi HTML) menjadi teks singkat satu baris.
const teksDeskripsi = (html) =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const KoleksiKelas = () => {
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await fetch(`${API}/api/kelas`);
        if (res.ok) setKelasList(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchKelas();
  }, []);

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Koleksi Kelas"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Daftar Kelas"}
      />
      <section className="py-16 sm:py-20 lg:py-28 bg-surface2">
        <div className="Container">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-10 w-10 border-4 border-PrimaryColor-0 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {kelasList.map((k) => {
                return (
                  <div
                    key={k.id}
                    className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-line group flex flex-col"
                  >
                    <div className="relative h-52 sm:h-64 overflow-hidden shrink-0">
                      {k.foto ? (
                        <img
                          loading="lazy"
                          decoding="async"
                          src={`${API}/uploads/${k.foto}`}
                          alt={k.nama}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-300 font-bold">
                          Tanpa Foto
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-ink mb-3 group-hover:text-PrimaryColor-0 transition-colors line-clamp-1">
                        {k.nama}
                      </h3>

                      <div className="space-y-1.5 mb-4">
                        <p className="flex items-center gap-2 text-[13px] sm:text-sm text-muted">
                          <FiUser
                            className="text-green-500 shrink-0"
                            size={15}
                          />
                          Wali Kelas:{" "}
                          <span className="font-semibold text-ink">
                            {k.wali_kelas || "-"}
                          </span>
                        </p>
                        <p className="flex items-center gap-2 text-[13px] sm:text-sm text-muted">
                          <FiUsers
                            className="text-green-500 shrink-0"
                            size={15}
                          />
                          Jumlah Santri:{" "}
                          <span className="font-semibold text-ink">
                            {k.jumlah_santri ?? 0} santri
                          </span>
                        </p>
                        <p className="flex items-center gap-2 text-[13px] sm:text-sm text-muted">
                          <FiCalendar
                            className="text-green-500 shrink-0"
                            size={15}
                          />
                          Tahun Ajaran:{" "}
                          <span className="font-semibold text-ink">
                            {k.tahun_ajaran || "-"}
                          </span>
                        </p>
                        <p className="flex items-center gap-2 text-[13px] sm:text-sm text-muted">
                          <FiMapPin
                            className="text-green-500 shrink-0"
                            size={15}
                          />
                          Lokasi:{" "}
                          <span className="font-semibold text-ink">
                            {k.nama_lokasi || "-"}
                          </span>
                        </p>
                      </div>

                      <div className="mb-5 sm:mb-6 rounded-xl border border-line bg-surface2 px-4 py-3">
                        <h4 className="flex items-center text-[11px] font-bold uppercase tracking-wide text-ink mb-1.5">
                          <FiInfo className="mr-1.5 text-green-500" size={14} />
                          Deskripsi
                        </h4>
                        {teksDeskripsi(k.deskripsi) ? (
                          <p className="text-xs sm:text-[13px] leading-relaxed text-muted line-clamp-3">
                            {teksDeskripsi(k.deskripsi)}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-[13px] leading-relaxed text-muted">
                            Belum ada deskripsi untuk kelas ini.
                          </p>
                        )}
                      </div>

                      <div className="mt-auto">
                        <Link
                          to={`/kelas/${k.id}`}
                          className="flex items-center justify-center w-full gap-2 font-bold transition-all duration-300 py-3 border rounded-xl text-PrimaryColor-0 border-green-200 dark:border-green-500/30 hover:bg-PrimaryColor-0 hover:text-white hover:border-PrimaryColor-0 hover:shadow-md active:bg-PrimaryColor-0 active:text-white active:border-PrimaryColor-0 active:shadow-md"
                        >
                          Detail <FaArrowRightLong />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && kelasList.length === 0 && (
            <div className="text-center py-20 text-muted text-lg">
              Belum ada kelas yang dipublikasikan.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default KoleksiKelas;
