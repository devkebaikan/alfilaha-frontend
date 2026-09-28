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
          : "border border-line"
      }`}
    >
      {paket.isPopular && (
        <div className="bg-PrimaryColor-0 text-white text-center py-2 font-AlbertSans font-semibold">
          Paling Populer
        </div>
      )}
      <div className="p-5 sm:p-8">
        <div
          className="cursor-pointer group"
          onClick={() => setSelectedDetail(paket)}
        >
          {paket.gambar && (
            <div className="mb-5 sm:mb-6 rounded-xl overflow-hidden h-40 sm:h-48 w-full">
              <img loading="lazy" decoding="async"
                src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${paket.gambar}`}
                alt={paket.nama_paket}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          <h3 className="font-AlbertSans font-bold text-xl sm:text-2xl text-HeadingColor-0 mb-3 sm:mb-4 group-hover:text-PrimaryColor-0 transition-colors">
            {paket.nama_paket}
          </h3>
          <div className="flex items-baseline gap-2 mb-6 border-b border-line pb-6">
            <span className="font-AlbertSans font-bold text-2xl sm:text-3xl text-PrimaryColor-0">
              {paket.harga}
            </span>
          </div>
          <div className="mb-6">
            <div
              className="prose prose-sm text-TextColor-0 font-AlbertSans max-w-none line-clamp-3"
              dangerouslySetInnerHTML={{ __html: paket.deskripsi }}
            />
            <span className="text-PrimaryColor-0 font-semibold text-sm mt-2 block group-hover:underline">
              Klik untuk melihat detail lengkap
            </span>
          </div>
        </div>
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
              <img decoding="async"
                loading="lazy"
                src={subTitleShape}
                draggable="false"
                alt="Shape"
              />
              PAKET WISATA
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-[1.35] sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] px-1 sm:px-2 text-HeadingColor-0 mt-5">
              Pesan Edukasi & <br className="hidden sm:block" />
              Wisata Umum
            </h1>
            <p className="font-AlbertSans text-TextColor-0 text-[16px] sm:text-[17px] mt-5 sm:mt-6 leading-[1.8] max-w-3xl mx-auto px-1 sm:px-2">
              Kami menyiapkan beragam paket, harus paket kegiatan yang bisa
              dibook atau diatur dengan kegiatan lain sesuai kebutuhan Anda.
              Silakan pilih mana yang paling pas untuk rombongan kita.
            </p>
          </div>

          {/* Daftar Paket Utama */}
          <div className="mb-10">
            <h2 className="font-AlbertSans font-bold text-3xl text-HeadingColor-0 mb-8 text-center">
              Pilihan Paket Tersedia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {paketList.length > 0 ? (
                paketList.map((paket) => (
                  <PricingCard key={paket.id} paket={paket} />
                ))
              ) : (
                <div className="col-span-full text-center text-muted py-10 font-bold">
                  Belum ada paket wisata yang tersedia saat ini.
                </div>
              )}
            </div>
          </div>

          {/* Info Tambahan */}
          <div className="mt-10 sm:mt-16 bg-gradient-to-br from-surface2 to-card p-5 sm:p-8 rounded-lg border border-line">
            <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-4">
              Informasi Penting
            </h3>
            <ul className="space-y-2 font-AlbertSans text-TextColor-0">
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
            <p className="font-AlbertSans text-[16px] sm:text-lg text-TextColor-0 mb-6 leading-[1.8] max-w-xl mx-auto px-1 sm:px-2">
              Punya pertanyaan atau ingin paket custom?
            </p>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4 justify-center">
              <Link to="/contact" className="w-full sm:w-auto">
                <button className="primary-btn w-full justify-center !px-3 sm:!px-10 !py-3.5 sm:!py-[14px] !text-[14px] sm:!text-[17px] whitespace-nowrap">
                  <span>Hubungi Kami</span>
                  <FaArrowRightLong className="shrink-0 text-sm sm:text-base" />
                </button>
              </Link>
              <Link to="/pesan-toi" className="w-full sm:w-auto">
                <button className="primary-btn2 w-full justify-center !border-PrimaryColor-0 !border !px-3 sm:!px-10 !py-3.5 sm:!py-4 !text-[14px] sm:!text-[17px] whitespace-nowrap">
                  <span>Pesan Sekarang</span>
                  <FaArrowRightLong className="shrink-0 text-sm sm:text-base" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Detail Paket */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted hover:text-red-600 hover:bg-red-50 shadow-md z-10 transition-colors text-xl font-bold"
            >
              ✕
            </button>

            {/* Modal Image */}
            <div className="w-full h-64 md:h-80 relative">
              <img loading="lazy" decoding="async"
                src={
                  selectedDetail.gambar
                    ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedDetail.gambar}`
                    : "/images/services-plant-4.jpg"
                }
                alt={selectedDetail.nama_paket}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedDetail.nama_paket}
                </h2>
                <div className="inline-block bg-PrimaryColor-0 text-white px-5 py-1.5 rounded-full font-bold text-lg shadow-lg">
                  {selectedDetail.harga}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-HeadingColor-0 mb-4 border-b pb-2">
                Detail Fasilitas & Kegiatan
              </h3>
              <div
                className="prose prose-md text-TextColor-0 font-AlbertSans max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: selectedDetail.deskripsi }}
              />

              <div className="flex gap-4 pt-4 border-t border-line">
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
