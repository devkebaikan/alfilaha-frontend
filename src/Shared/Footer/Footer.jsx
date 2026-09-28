import { Link } from "react-router-dom";
import footerLogo from "/images/logo.png";
import footerShape from "/images/footer-social-shape.png";
import footerShape2 from "/images/footer-shape2.png";
import footerShape3 from "/images/footer-shape.png";
import footerLine from "/images/footer-line.png";
import {
  FaArrowRightLong,
  FaChevronRight,
  FaLocationDot,
  FaPhone,
  FaWhatsapp,
  FaInstagram,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-[url('/images/footer-bg-new.webp')] bg-no-repeat bg-center bg-cover relative z-10 pt-28 overflow-hidden before:absolute before:inset-0 before:bg-black/70 before:-z-10">
      <img decoding="async"
        loading="lazy"
        src={footerLine}
        draggable="false"
        className="absolute -z-10 right-0 -bottom-20 opacity-70"
      />
      <img decoding="async"
        loading="lazy"
        src={footerShape3}
        draggable="false"
        className="absolute -z-10 top-0 left-0 animate-dance2"
      />
      <div className="Container">
        <div className="relative">
          <div className="bg-[url('/images/footer-social.jpg')] bg-no-repeat bg-cover bg-center relative rounded-3xl overflow-hidden">
            <div className="flex flex-col gap-6 sm:gap-7 lg:gap-0 lg:flex-row lg:items-center lg:justify-between p-6 sm:p-10 mb-16 sm:mb-[90px]">
              <div>
                <h2 className="font-AlbertSans font-bold text-white text-[22px] sm:text-[30px] lg:text-[40px] leading-[1.25] max-w-[20ch]">
                  Ikuti Alfilaha di Media Sosial
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h5 className="font-AlbertSans font-semibold text-white text-lg uppercase">
                  Ikuti Kami :
                </h5>
                <ul className="flex gap-3">
                  <li>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white overflow-hidden transition-all duration-500 hover:text-PrimaryColor-0 relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:-z-10 before:bg-white before:transition-all before:duration-500 before:scale-0 hover:before:scale-100"
                    >
                      <FaWhatsapp />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/alfilaha_id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white overflow-hidden transition-all duration-500 hover:text-PrimaryColor-0 relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:-z-10 before:bg-white before:transition-all before:duration-500 before:scale-0 hover:before:scale-100"
                    >
                      <FaInstagram />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            {/* Ornamen hanya di layar besar — di HP/tablet menimpa teks */}
            <div className="hidden lg:flex justify-center items-center w-full absolute top-1/4 left-1/3 pointer-events-none">
              <img decoding="async"
                loading="lazy"
                src={footerShape2}
                draggable="false"
                className="animate-zoomInOut"
              />
            </div>
          </div>
          <img decoding="async"
            loading="lazy"
            src={footerShape}
            draggable="false"
            className="absolute -z-10 -bottom-[70px] -right-[10px] animate-dance2"
          />
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-8 sm:gap-y-10 md:grid-cols-2 md:gap-8 xl:grid-cols-4 xl:gap-6 mt-10 sm:mt-12 lg:mt-16">
          <div className="col-span-2 xl:col-span-1">
            <Link to={"/"} className="inline-block">
              <img decoding="async"
                loading="lazy"
                src={footerLogo}
                draggable={false}
                className="w-40 sm:w-48 md:w-52 lg:w-64 object-contain"
                alt="Alfilaha Footer Logo"
              />
            </Link>
            <p className="font-AlbertSans text-white mt-6 sm:mt-7 mb-6 text-[15px] sm:text-base leading-relaxed">
              Pesantren, kebun, dan ruang belajar terbuka untuk keluarga,
              sekolah, dan komunitas.
            </p>
            <h6 className="font-AlbertSans font-medium text-white text-lg pl-8 relative before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:bg-PrimaryColor-0 before:w-[22px] before:h-[2px]">
              Kontak
            </h6>
            {/* HP/tablet: dua kartu kontak berdampingan */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-1">
              <Link
                to={"/"}
                className="flex items-center gap-2.5 min-h-[56px] px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-PrimaryColor-0 hover:bg-white/10 transition-colors xl:rounded-none xl:border-0 xl:bg-transparent xl:px-0 xl:py-0 xl:hover:bg-transparent"
              >
                <span className="w-9 h-9 shrink-0 rounded-xl bg-PrimaryColor-0/20 text-PrimaryColor-0 grid place-items-center">
                  <FaPhone size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-white/60">
                    WhatsApp
                  </span>
                  <span className="block font-AlbertSans text-white text-[14px] xl:text-base leading-[1.6] break-words">
                    +62 812-3456-7890
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-2.5 min-h-[56px] px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 xl:rounded-none xl:border-0 xl:bg-transparent xl:px-0 xl:py-0">
                <span className="w-9 h-9 shrink-0 rounded-xl bg-PrimaryColor-0/20 text-PrimaryColor-0 grid place-items-center">
                  <MdEmail size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-white/60">
                    Email
                  </span>
                  <span className="block font-AlbertSans text-white/60 text-[14px] xl:text-base leading-[1.6] flex items-center gap-1.5">
                    Belum tersedia
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
                      Segera
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-AlbertSans text-lg sm:text-xl md:text-2xl text-white font-semibold mb-5 md:mb-[30px]">
              Halaman
            </h4>
            <ul>
              <li>
                <Link to={"/"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Pondok Pesantren
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/kubus-alfilaha"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Kubus Alfilaha
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/paket-wisata"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Paket Wisata
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/blog_grid"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Blog
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/event"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Event & Kegiatan
                  </button>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-AlbertSans text-lg sm:text-xl md:text-2xl text-white font-semibold mb-5 md:mb-[30px]">
              Layanan
            </h4>
            <ul>
              <li>
                <Link to={"/pesan-tempat"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Form Pesan Tempat
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/cek-tanaman"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Cek Tanaman + History
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/appointment"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Pendaftaran Santri
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/faq_inner"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-3 md:mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    FAQ
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/contact"}>
                  <button className="flex items-start gap-2 font-AlbertSans text-sm xl:text-base text-white text-left leading-snug transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60 shrink-0 mt-1" />
                    Hubungi Kami
                  </button>
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 xl:col-span-1 border-t border-white/10 pt-8 xl:border-0 xl:pt-0">
            <h4 className="font-AlbertSans text-lg sm:text-xl md:text-2xl text-white font-semibold mb-5 md:mb-8">
              Alamat & Maps
            </h4>
            <p className="font-AlbertSans text-TextColor-0 font-medium mb-5 sm:mb-[22px] flex gap-3 text-[15px] sm:text-base leading-relaxed">
              <FaLocationDot className="text-PrimaryColor-0 mt-1 shrink-0" />
              <a
                href="https://maps.app.goo.gl/YkgSNQFk1tjz67n18"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                Jl. Dusun Tepus, Bulukerto, Sewurejo, Kec. Mojogedang, Kabupaten
                Karanganyar, Jawa Tengah 57752, Indonesia
              </a>
            </p>
            <a
              href="https://maps.app.goo.gl/YkgSNQFk1tjz67n18"
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-[52px] sm:min-h-[58px] rounded-full border border-PrimaryColor-0 bg-PrimaryColor-0 gap-2 px-4 sm:px-6 py-2 text-white font-AlbertSans uppercase text-sm sm:text-base text-center flex items-center justify-center relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:rounded-full before:bg-[#041e15] before:-z-10 before:scale-0 before:transition-all before:duration-500 hover:before:scale-100"
            >
              Buka di Google Maps <FaArrowRightLong />
            </a>
          </div>
        </div>
        <div className="text-left sm:text-center pb-6 sm:pb-8 mt-14 sm:mt-20 lg:mt-[108px]">
          <p className="font-AlbertSans text-white text-sm sm:text-base">
            © 2026 Alfilaha. Seluruh hak cipta dilindungi
            <span className="text-PrimaryColor-0"> Alfilaha</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
