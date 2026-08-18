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
    <footer className="bg-[url('/images/footer-bg-new.jpg')] bg-no-repeat bg-center bg-cover relative z-10 pt-28 overflow-hidden before:absolute before:inset-0 before:bg-black/70 before:-z-10">
      <img
        loading="lazy"
        src={footerLine}
        draggable="false"
        className="absolute -z-10 right-0 -bottom-20 opacity-70"
      />
      <img
        loading="lazy"
        src={footerShape3}
        draggable="false"
        className="absolute -z-10 top-0 left-0 animate-dance2"
      />
      <div className="Container">
        <div className="relative">
          <div className="bg-[url('/images/footer-social.jpg')] bg-no-repeat bg-cover bg-center relative rounded-md ">
            <div className="flex flex-col gap-7 lg:gap-0 lg:flex-row lg:items-center lg:justify-between p-10 mb-[90px]">
              <div>
                <h2 className="font-AlbertSans font-bold text-white text-[30px] sm:text-[40px]">
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
            <div className="md:flex justify-center items-center w-full absolute top-1/4 left-16 md:left-1/3 lg:left-16 hidden ">
              <img
                loading="lazy"
                src={footerShape2}
                draggable="false"
                className="animate-zoomInOut"
              />
            </div>
          </div>
          <img
            loading="lazy"
            src={footerShape}
            draggable="false"
            className="absolute -z-10 -bottom-[70px] -right-[10px] animate-dance2"
          />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Link to={"/"} className="inline-block">
              <img 
                loading="lazy" 
                src={footerLogo} 
                draggable={false} 
                className="w-40 sm:w-48 md:w-56 lg:w-64 object-contain"
                alt="Alfilaha Footer Logo"
              />
            </Link>
            <p className="font-AlbertSans text-white mt-7 mb-5">
              Pesantren, kebun, dan ruang belajar terbuka untuk keluarga,
              sekolah, dan komunitas.
            </p>
            <div>
              <h6 className="font-AlbertSans font-medium text-white text-lg pl-8 relative before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:bg-PrimaryColor-0 before:w-[22px] before:h-[2px]">
                Kontak
              </h6>
              <Link to={"/"} className="mt-[18px] block">
                <button className="flex items-center gap-3 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0">
                  <FaPhone className="text-PrimaryColor-0" />
                  +62 812-3456-7890
                </button>
              </Link>
              <Link to={"/"} className="mt-[18px] block pointer-events-none">
                <button className="flex items-center gap-3 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0">
                  <MdEmail size={"18"} className="text-PrimaryColor-0" />-
                </button>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-AlbertSans text-2xl text-white font-semibold mb-[30px]">
              Halaman
            </h4>
            <ul>
              <li>
                <Link to={"/"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Pondok Pesantren
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/kubus-alfilaha"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Kubus Alfilaha
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/paket-wisata"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Paket Wisata
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/blog_grid"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Blog
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/event"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Event & Kegiatan
                  </button>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-AlbertSans text-2xl text-white font-semibold mb-[30px]">
              Layanan
            </h4>
            <ul>
              <li>
                <Link to={"/pesan-tempat"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Form Pesan Tempat
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/cek-tanaman"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Cek Tanaman + History
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/appointment"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Pendaftaran Santri
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/faq_inner"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 mb-[18px] opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    FAQ
                  </button>
                </Link>
              </li>
              <li>
                <Link to={"/contact"}>
                  <button className="flex items-center gap-2 font-AlbertSans text-white transition-all duration-500 hover:text-PrimaryColor-0 hover:gap-1 opacity-60 hover:!opacity-100">
                    <FaChevronRight className="text-xs opacity-60" />
                    Hubungi Kami
                  </button>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-AlbertSans text-2xl text-white font-semibold mb-8">
              Alamat & Maps
            </h4>
            <p className="font-AlbertSans text-TextColor-0 font-medium mb-[22px] flex gap-3">
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
              className="w-full h-[58px] rounded-full border border-PrimaryColor-0 bg-PrimaryColor-0 gap-2 px-6 py-2 text-white font-AlbertSans uppercase flex items-center justify-center relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:rounded-full before:bg-[#041e15] before:-z-10 before:scale-0 before:transition-all before:duration-500 hover:before:scale-100"
            >
              Buka di Google Maps <FaArrowRightLong />
            </a>
          </div>
        </div>
        <div className="text-left sm:text-center pb-6 mt-[108px]">
          <p className="font-AlbertSans text-white">
            © 2026 Alfilaha. Seluruh hak cipta dilindungi
            <span className="text-PrimaryColor-0"> Alfilaha</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
