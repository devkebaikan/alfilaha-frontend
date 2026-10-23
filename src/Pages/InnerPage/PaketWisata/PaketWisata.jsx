import { useState, useEffect } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";

const PaketWisata = () => {
  const [paketList, setPaketList] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const fetchPaket = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket`,
        );
        if (response.ok) {
          const data = await response.json();
          setPaketList(data);
        }
      } catch (err) {
        console.error("Gagal memuat paket wisata:", err);
      }
    };
    fetchPaket();
  }, []);

  const PricingCard = ({ paket }) => (
    <div
      className={`bg-card rounded-lg overflow-hidden transition-all duration-500 hover:shadow-xl ${
        paket.isPopular
          ? "border-2 border-PrimaryColor-0 relative"
          : "border border-BorderColor2-0"
      }`}
    >
      {paket.isPopular && (
        <div className="bg-PrimaryColor-0 text-white text-center py-2 font-AlbertSans font-semibold">
          Paling Populer
        </div>
      )}
      <div className="p-8 flex flex-col h-full">
        <div
          className="cursor-pointer group flex-1 flex flex-col"
          onClick={() => setSelectedDetail(paket)}
        >
          {paket.gambar && (
            <div className="mb-6 -mx-8 -mt-8 overflow-hidden h-56 sm:h-64 w-[calc(100%+4rem)]">
              <img
                src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${paket.gambar}`}
                alt={paket.nama_paket}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div> 
          )}
          <h3 className="font-AlbertSans font-bold text-2xl text-ink mb-4 group-hover:text-PrimaryColor-0 transition-colors">
            {paket.nama_paket}
          </h3>
          <div className="flex items-baseline gap-2 mb-6 border-b border-BorderColor2-0 pb-6">
            <span className="font-AlbertSans font-bold text-2xl sm:text-3xl text-PrimaryColor-0">
              {paket.harga}
            </span>
          </div>
          <div className="mb-6 flex-1">
            <div
              className="prose prose-sm text-muted font-AlbertSans max-w-none line-clamp-3 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: paket.deskripsi }}
            />
          </div>
          <span className="text-PrimaryColor-0 font-semibold text-sm mt-auto block group-hover:underline">
            Klik untuk melihat detail lengkap
          </span>
        </div>
        <div className="mt-4">
          <Link to="/pesan-tempat" state={{ selectedPaket: paket.nama_paket }}>
            <button
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-md transition-all duration-300 font-AlbertSans font-semibold ${
                paket.isPopular
                  ? "bg-PrimaryColor-0 text-white hover:bg-opacity-90"
                  : "border-2 border-PrimaryColor-0 text-PrimaryColor-0 hover:bg-PrimaryColor-0 hover:text-white"
              }`}
            >
              Pesan Sekarang
              <FaArrowRightLong />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Paket Edukasi & Wisata"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Paket Edukasi & Wisata"}
        bgImage={"/images/services-plant-2.jpg"}
        overlayClass={"bg-black/70"}
      />
      <section className="py-28">
        <div className="Container">
          <div className="text-center mb-16">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img
                loading="lazy"
                src={subTitleShape}
                draggable="false"
                alt="Shape"
              />
              PAKET WISATA
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-ink mt-5">
              Pesan Edukasi & <br className="hidden sm:block" />
              Wisata Umum
            </h1>
            <p className="font-AlbertSans text-muted mt-4 max-w-3xl mx-auto">
              Kami menyiapkan beragam paket, harus paket kegiatan yang bisa
              dibook atau diatur dengan kegiatan lain sesuai kebutuhan Anda.
              Silakan pilih mana yang paling pas untuk rombongan kita.
            </p>
          </div>

          {/* Daftar Paket Utama */}
          <div className="mb-10">
            <h2 className="font-AlbertSans font-bold text-3xl text-ink mb-8 text-center">
              Pilihan Paket Tersedia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paketList.length > 0 ? (
                paketList.map((paket) => (
                  <PricingCard key={paket.id} paket={paket} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-10 font-bold">
                  Belum ada paket wisata yang tersedia saat ini.
                </div>
              )}
            </div>
          </div>

          {/* Info Tambahan */}
          <div className="mt-16 bg-gradient-to-br from-surface2 to-card dark:from-slate-800/60 dark:to-slate-900/40 p-8 rounded-lg border border-BorderColor2-0">
            <h3 className="font-AlbertSans font-bold text-2xl text-ink mb-4">
              Informasi Penting
            </h3>
            <ul className="space-y-2 font-AlbertSans text-muted">
              <li>• Harga dapat berubah sewaktu-waktu tanpa pemberitahuan</li>
              <li>
                • Reservasi minimal H-7 untuk memastikan kesiapan fasilitas
              </li>
              <li>
                • Paket dapat dikustomisasi sesuai kebutuhan kelompok (hubungi
                kami)
              </li>
              <li>
                • Pembayaran: DP 50% saat booking, pelunasan H-3 sebelum
                kegiatan
              </li>
              <li>
                • Gratis 1 peserta untuk setiap 20 peserta (berlaku untuk
                rombongan sekolah)
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="font-AlbertSans text-lg text-muted mb-6">
              Punya pertanyaan atau ingin paket custom?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="primary-btn">
                  Hubungi Kami
                  <FaArrowRightLong />
                </button>
              </Link>
              <Link to="/pesan-tempat">
                <button className="primary-btn2 !border-PrimaryColor-0 !border">
                  Pesan Sekarang
                  <FaArrowRightLong />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Detail Paket */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-line">
            {/* Close button */}
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 shadow-md z-10 transition-colors text-xl font-bold border border-line"
            >
              ✕
            </button>

            {/* Modal Image */}
            <div className="w-full h-64 md:h-80 relative">
              <img
                src={
                  selectedDetail.gambar
                    ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedDetail.gambar}`
                    : "/images/services-plant-4.jpg"
                }
                alt={selectedDetail.nama_paket}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
                  {selectedDetail.nama_paket}
                </h2>
                <div className="inline-block bg-PrimaryColor-0 text-white px-5 py-1.5 rounded-full font-bold text-lg shadow-lg">
                  {selectedDetail.harga}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-ink mb-4 border-b pb-2 border-BorderColor2-0">
                Detail Fasilitas & Kegiatan
              </h3>
              <div
                className="prose prose-md text-muted font-AlbertSans max-w-none mb-8 dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: selectedDetail.deskripsi }}
              />

              <div className="flex gap-4 pt-4 border-t border-BorderColor2-0">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <Link
                  to="/pesan-tempat"
                  state={{ selectedPaket: selectedDetail.nama_paket }}
                  className="flex-1"
                >
                  <button className="w-full py-3 px-6 rounded-xl bg-PrimaryColor-0 text-white font-semibold hover:bg-opacity-90 flex items-center justify-center gap-2 transition-colors">
                    Pesan Sekarang <FaArrowRightLong />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaketWisata;
