import aboutThumb from "/images/planting-tree.jpg";
import aboutThumb2 from "/images/services-plant-3.jpg";
import subTitleShape from "/images/sub-title-shape.png";
import aboutIcon from "/images/about2-icon.png";
import aboutIcon2 from "/images/about2-icon2.png";
import { Link } from "react-router-dom";
import buttonShape from "/images/button-shape-1.png";
import aboutShape from "/images/about2-shape.png";
import aboutShape2 from "/images/testi-shape-3.png";
const About = () => {
  return (
    <section className="py-16 lg:py-[120px] bg-[url('/images/about-bg.jpg')] bg-cover bg-center bg-no-repeat relative overflow-hidden">
      <img
        loading="lazy"
        src={aboutShape}
        draggable="false"
        className="absolute -bottom-52 -right-20"
      />
      <img
        loading="lazy"
        src={aboutShape2}
        draggable="false"
        className="absolute top-32 right-20 animate-zoomInOut hidden 2xl:block"
      />

      <div className="Container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-5 xl:gap-20 items-center">
          <div className="relative z-10 mx-auto lg:mx-0 w-full max-w-[498px]">
            <img
              loading="lazy"
              src={aboutThumb}
              draggable="false"
              className="rounded-2xl shadow-xl w-full h-[350px] sm:h-[450px] lg:h-[550px] object-cover"
            />
            <img
              loading="lazy"
              src={aboutThumb2}
              draggable="false"
              className="absolute bottom-[-10%] right-[-5%] hidden sm:block rounded-2xl shadow-2xl w-[340px] h-[339px] object-cover border-8 border-white"
            />
          </div>
          <div className="text-center lg:text-left mt-4 lg:mt-0">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center lg:justify-start gap-2">
              <img loading="lazy" src={subTitleShape} draggable="false" />
              TENTANG ALFILAHA
            </h5>
            <h1 className="font-AlbertSans font-bold text-[28px] leading-10 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-4 mb-4">
              Menjaga Lingkungan <br className="hidden sm:block" />
              Untuk Masa Depan Hijau
            </h1>
            <p className="font-AlbertSans text-TextColor-0 font-light mx-auto lg:mx-0 max-w-2xl lg:max-w-none">
              {`Alfilaha Eco Pesantren mengintegrasikan pendidikan pesantren dengan pertanian berkelanjutan. Kami berkomitmen untuk mendidik generasi mandiri sambil melestarikan dan memberdayakan sumber daya alam di sekitar kita demi masa depan yang lebih baik.`}
            </p>
            <div className="grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-7 mt-8 border-t border-BorderColor2-0 pt-8 text-left">
              <div className="flex gap-4 sm:gap-6 items-start">
                <div className="bg-[#ebf5da] w-[55px] h-[55px] sm:w-[65px] sm:h-[65px] shrink-0 rounded flex items-center justify-center">
                  <img loading="lazy" src={aboutIcon} draggable="false" className="w-8 sm:w-auto" />
                </div>
                <div className="flex-1">
                  <h5 className="font-AlbertSans font-semibold text-xl sm:text-[22px] text-HeadingColor-0 mb-1">
                    Daur Ulang Edukatif
                  </h5>
                  <p className="font-AlbertSans text-TextColor-0 text-sm sm:text-[17px] leading-relaxed">
                    Inovasi alternatif dalam pengelolaan lingkungan
                  </p>
                </div>
              </div>
              <div className="flex gap-4 sm:gap-6 items-start">
                <div className="bg-[#ebf5da] w-[55px] h-[55px] sm:w-[65px] sm:h-[65px] shrink-0 rounded flex items-center justify-center">
                  <img loading="lazy" src={aboutIcon2} draggable="false" className="w-8 sm:w-auto" />
                </div>
                <div className="flex-1">
                  <h5 className="font-AlbertSans font-semibold text-xl sm:text-[22px] text-HeadingColor-0 mb-1">
                    Lingkungan Aman
                  </h5>
                  <p className="font-AlbertSans text-TextColor-0 text-sm sm:text-[17px] leading-relaxed">
                    Menciptakan ruang hidup yang sehat dan asri
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
