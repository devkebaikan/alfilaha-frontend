import { Link } from "react-router-dom";
import { FaLinkedinIn, FaPinterestP, FaXTwitter } from "react-icons/fa6";
import buttonShape from "/images/button-shape-1.png";
import bannerImg from "/images/banner-thumb.png";
import shape from "/images/sub-title-shape.png";
import bannerShape from "/images/banner-shape.png";

const Banner = () => {
  return (
    <section className="bg-[url('/images/hero-bg.jpg')] bg-cover bg-center bg-no-repeat h-[650px] sm:h-[680px] lg:h-[660px] xl:h-[872px] flex items-center relative z-10 overflow-hidden">
      <img decoding="async"
        loading="lazy"
        src={bannerShape}
        draggable="false"
        className="absolute top-0 -left-5 animate-dance2 hidden lg:block"
      />
      <div className="Container">
        <div className="grid lg:grid-cols-2 items-center pt-[70px] lg:pt-[90px] gap-16 lg:gap-0">
          <div className="relative">
            <h5 className="font-AlbertSans text-PrimaryColor-0 font-medium flex items-center gap-2 mb-5">
              <img decoding="async" loading="lazy" src={shape} />
              KEBUN ALFILAHA
            </h5>
            <h1 className="font-AlbertSans font-extrabold text-HeadingColor-0 text-[30px] leading-[36px] sm:text-[56px] sm:leading-[60px] md:text-[68x] lg:text-[50px] xl:text-[65px] 2xl:text-[76px] xl:leading-[72px] 2xl:leading-[82px]">
              Menghidupkan Sunnah <br />
              di Atas Tanah
            </h1>
            <p className="font-AlbertSans text-[16px] sm:text-lg text-TextColor-0 mb-10 mt-5 sm:mt-6 leading-[1.8] max-w-2xl px-1 sm:px-2">
              Lebih dari sekadar lahan pertanian. Ini adalah laboratorium tempat
              mempraktikkan budaya regeneratif dan tga adab utama.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to={"/project"}>
                <button className="primary-btn">
                  {`Lihat Hasil Kebun Kita`}
                  <img decoding="async" loading="lazy" src={buttonShape} draggable="false" />
                </button>
              </Link>
            </div>
            <div className="hidden xl:flex gap-[100px] items-center -rotate-90 absolute top-1/2 -translate-y-1/2 md:-left-[23%] lg:-left-[35%] xl:-left-[32%] 2xl:-left-[50%]">
              <h5 className="font-AlbertSans text-HeadingColor-0 relative before:absolute before:top-1/2 before:-right-[82px] before:w-16 before:h-[1px] before:bg-HeadingColor-0">
                FOLLOW US
              </h5>
              <ul className="flex gap-7 items-center">
                <li>
                  <Link
                    to={"/"}
                    className="rotate-45 transition-all duration-500 text-HeadingColor-0 hover:text-PrimaryColor-0"
                  >
                    <FaLinkedinIn />
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/"}
                    className="rotate-45 transition-all duration-500 text-HeadingColor-0 hover:text-PrimaryColor-0"
                  >
                    <FaXTwitter />
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/"}
                    className="rotate-45 transition-all duration-500 text-HeadingColor-0 hover:text-PrimaryColor-0"
                  >
                    <FaPinterestP />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="absolute -z-10 top-0 lg:-right-[27rem] xl:-right-[18rem] 2xl:right-0 hidden lg:block">
            <img decoding="async"
              loading="lazy"
              src={bannerImg}
              draggable="false"
              className="lg:w-8/12 xl:w-9/12 2xl:w-[inherit]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
