import aboutThumb from "/images/planting-tree.jpg";
import aboutAward from "/images/about-award.png";
import aboutIcon from "/images/about-icon.png";
import aboutIcon2 from "/images/about-icon2.png";
import aboutShape from "/images/about-shape.png";
import aboutShape2 from "/images/about-shape-1.png";
import buttonShape from "/images/button-shape-1.png";
import subTitleShape from "/images/sub-title-shape.png";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <section className="py-[120px] bg-[url('/images/about-bg.jpg')] bg-no-repeat bg-center bg-cover relative">
      <img loading="lazy"
        src={aboutShape2}
        draggable="false"
        className="absolute top-32 right-20 animate-zoomInOut hidden 2xl:block"
      />
      <div className="Container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[92px] lg:gap-5 xl:gap-24 items-center">
          <div className="relative z-10">
            <img loading="lazy" src={aboutThumb} draggable="false" className="w-full h-[400px] sm:h-[500px] lg:h-[650px] rounded-3xl shadow-2xl object-cover" alt="Tentang Alfilaha" />
            <img loading="lazy"
              src={aboutAward}
              draggable="false"
              className="absolute bottom-10 left-0 animate-movebtn hidden sm:block"
            />
          </div>
          <div className="relative">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2">
              <img loading="lazy" src={subTitleShape} draggable="false" />
              TENTANG ALFILAHA
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 mb-3">
              Belajar Hidup dalam <br />
              Semua Dimensi
            </h1>
            <div className="flex gap-6 mt-12">
              <div>
                <img loading="lazy" src={aboutIcon} draggable="false" />
              </div>
              <div className="flex-1">
                <h5 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 -mt-2">
                  Ruang Tumbuh Nyata
                </h5>
                <p className="font-AlbertSans text-TextColor-0 pt-3">
                  Anak muda butuh ruang tumbuh dan pengalaman nyata. Di
                  Pesantren Alfilaha, belajar hidup mencakup semua dimensi.
                </p>
              </div>
            </div>
            <div className="flex gap-6 mt-9 pb-9 mb-10 border-b border-BorderColor2-0">
              <div>
                <img loading="lazy" src={aboutIcon2} draggable="false" />
              </div>
              <div className="flex-1">
                <h5 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 -mt-2">
                  Agama Melebur dalam Keseharian
                </h5>
                <p className="font-AlbertSans text-TextColor-0 pt-3">
                  Kita tidak memisahkan agama dari keseharian, semuanya
                  melebur dalam setiap kegiatan.
                </p>
              </div>
            </div>
            <Link to={"/about"}>
              <button className="primary-btn">
                {`Selengkapnya`}
                <img loading="lazy" src={buttonShape} draggable="false" />
              </button>
            </Link>
            <img loading="lazy"
              src={aboutShape}
              draggable="false"
              className="absolute -bottom-0 left-1/2 animate-dance3 hidden sm:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
