import { useState, useEffect } from "react";
import { FaArrowRightLong, FaCheck } from "react-icons/fa6";
import { Link } from "react-router-dom";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";

const PaketWisata = () => {
  const [paketList, setPaketList] = useState([]);

  useEffect(() => {
    const fetchPaket = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket`);
        if(response.ok) {
          const data = await response.json();
          setPaketList(data);
        }
      } catch(err) {
        console.error("Gagal memuat paket wisata:", err);
      }
    };
    fetchPaket();
  }, []);

  const PricingCard = ({ paket, category }) => (
    <div
      className={`bg-white rounded-lg overflow-hidden transition-all duration-500 hover:shadow-xl ${
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
      <div className="p-8">
        <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-4">
          {paket.nama_paket}
        </h3>
        <div className="flex items-baseline gap-2 mb-6 border-b border-BorderColor2-0 pb-6">
          <span className="font-AlbertSans font-bold text-2xl sm:text-3xl text-PrimaryColor-0">
            {paket.harga}
          </span>
        </div>
        <div className="mb-6">
          <ul className="space-y-3">
            {paket.deskripsi && paket.deskripsi.split('\n').map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <FaCheck className="text-PrimaryColor-0 mt-1 flex-shrink-0" />
                <span className="font-AlbertSans text-TextColor-0">
                  {feature.trim()}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/pesan-tempat">
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
              <img loading="lazy" src={subTitleShape} draggable="false" alt="Shape" />
              PAKET WISATA
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5">
              Pesan Edukasi & <br className="hidden sm:block" />
              Wisata Umum
            </h1>
            <p className="font-AlbertSans text-TextColor-0 mt-4 max-w-3xl mx-auto">
              Kami menyiapkan beragam paket, harus paket kegiatan yang bisa dibook atau diatur dengan kegiatan lain sesuai kebutuhan Anda. Silakan pilih mana yang paling pas untuk rombongan kita.
            </p>
          </div>

          {/* Daftar Paket Utama */}
          <div className="mb-10">
            <h2 className="font-AlbertSans font-bold text-3xl text-HeadingColor-0 mb-8 text-center">
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
          <div className="mt-16 bg-gradient-to-br from-gray-50 to-white p-8 rounded-lg border border-BorderColor2-0">
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
            <p className="font-AlbertSans text-lg text-TextColor-0 mb-6">
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
    </>
  );
};

export default PaketWisata;
