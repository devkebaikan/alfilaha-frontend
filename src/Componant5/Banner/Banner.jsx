import { useState } from "react";
import FsLightbox from "fslightbox-react";
import { Link } from "react-router-dom";
import { FaAnglesRight, FaLocationDot } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./banner.css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { IoIosSend, IoMdPlay } from "react-icons/io";

const Banner = () => {
  const [toggler, setToggler] = useState(false);
  const settings = {
    loop: true,
    speed: 2000,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    duration: 3000,
  };
  const pagination = {
    clickable: true,
    renderBullet: function (index, className) {
      return '<span class="' + className + ' pagination-bullet"></span>';
    },
  };
  return (
    <div className="relative z-10 banner5">
      <Swiper {...settings} pagination={pagination} modules={[Pagination]}>
        <SwiperSlide>
          <section className="banner5-scene bg-[url('/images/banner-bg-backup.jpg')] bg-cover bg-left lg:bg-center bg-no-repeat h-[750px] sm:h-[730px] md:h-[750px] lg:h-[950px] xl:h-[950px] flex items-center relative">
            <div className="banner5-dim-layer" aria-hidden="true"></div>
            <div className="Container relative z-10">
              <div className="flex items-center pt-36 gap-16 lg:gap-0">
                <div className="relative banner-content max-w-[800px]">
                  <h5 className="banner5-tag font-AlbertSans text-PrimaryColor-0 text-[18px] sm:text-[22px] font-medium bg-[#030804]/80 backdrop-blur-sm inline-block px-[24px] py-2 border border-BorderColor4-0 rounded-md mb-6">
                    Pondok Pesantren Alfilaha
                  </h5>
                  <h1 className="banner5-title font-AlbertSans font-extrabold text-white text-[36px] sm:text-[56px] md:text-[70px] lg:text-[60px] xl:text-[70px] leading-[1.2] mb-6">
                    Pesantren Alfilaha <br />
                    Sekolah Kehidupan
                  </h1>
                  <p className="banner5-copy font-AlbertSans text-[17px] sm:text-xl text-white/90 mb-12 max-w-[650px] leading-relaxed drop-shadow-md">
                    Bukan sekadar menghafal kitab. Kita mencetak pemuda mandiri
                    yang paham agama, menyatu
                    dengan alam, dan punya keahlian hidup.
                  </p>
                  <div>
                    <Link to={"/appointment"}>
                      <button className="primary-btn3 banner5-cta">
                        {`PELAJARI SISTEM PENDAFTARAN KITA`}
                        <FaAnglesRight />
                      </button>
                    </Link>
                  </div>
{/* <div className="banner-contact hidden xl:flex gap-[100px] items-center -rotate-90 absolute top-full -translate-y-1/2 md:-left-[23%] lg:-left-[35%] xl:-left-[55%] 2xl:-left-[80%]">
                    <ul className="flex items-center gap-[34px]">
                      <li>
                        <Link
                          to={"/"}
                          className="flex gap-2 font-AlbertSans text-TextColor2-0 text-[17px] items-center"
                        >
                          <IoIosSend
                            size={"22"}
                            className="text-PrimaryColor-0"
                          />
                          info@example.com
                        </Link>
                      </li>
                      <li>
                        <p className="flex gap-2 font-AlbertSans text-TextColor2-0 text-[17px] items-center pl-8 border-l border-BorderColor-0">
                          <FaLocationDot
                            size={"18"}
                            className="text-PrimaryColor-0"
                          />
                          27 Division St, Sans fransisco , USA
                        </p>
                      </li>
                    </ul>
                  </div> */}
                </div>
              </div>
{/* <div className="banner5-livecam relative -bottom-[9.1rem] bg-[url('/images/video-bg.png')] bg-no-repeat bg-cover bg-center rounded-md 2xl:inline-block hidden">
                <div className="flex items-center justify-center gap-[80px] py-[85px] px-[130px]">
                  <h4 className="banner5-livecam-text text-lg font-AlbertSans font-medium text-white">
                    Live Cam 470x200
                  </h4>
                  <button className="h-[50px] w-[50px] rounded-full bg-PrimaryColor-0 flex justify-center items-center relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-PrimaryColor-0 before:opacity-50 before:-z-10 before:rounded-full before:animate-ping">
                    <IoMdPlay
                      size={"22"}
                      className="text-white"
                      onClick={() => setToggler(!toggler)}
                    />
                  </button>
                </div>
                <FsLightbox
                  toggler={toggler}
                  sources={[
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                  ]}
                />
              </div> */}
            </div>
          </section>
        </SwiperSlide>
        <SwiperSlide>
          <section className="banner5-scene bg-[url('/images/hero-slider-2.jpg')] bg-cover bg-left lg:bg-center bg-no-repeat h-[750px] sm:h-[730px] md:h-[750px] lg:h-[950px] xl:h-[950px] flex items-center relative">
            <div className="banner5-dim-layer" aria-hidden="true"></div>
            <div className="Container relative z-10">
              <div className="flex items-center pt-36 gap-16 lg:gap-0">
                <div className="relative banner-content max-w-[800px]">
                  <h5 className="banner5-tag font-AlbertSans text-PrimaryColor-0 text-[18px] sm:text-[22px] font-medium bg-[#030804]/80 backdrop-blur-sm inline-block px-[24px] py-2 border border-BorderColor4-0 rounded-md mb-6">
                    Pondok Pesantren Alfilaha
                  </h5>
                  <h1 className="banner5-title font-AlbertSans font-extrabold text-white text-[36px] sm:text-[56px] md:text-[70px] lg:text-[60px] xl:text-[70px] leading-[1.2] mb-6">
                    Pesantren Alfilaha <br />
                    Sekolah Kehidupan
                  </h1>
                  <p className="banner5-copy font-AlbertSans text-[17px] sm:text-xl text-white/90 mb-12 max-w-[650px] leading-relaxed drop-shadow-md">
                    Bukan sekadar menghafal kitab. Kita mencetak pemuda mandiri
                    yang paham agama, menyatu
                    dengan alam, dan punya keahlian hidup.
                  </p>
                  <div>
                    <Link to={"/appointment"}>
                      <button className="primary-btn3 banner5-cta">
                        {`PELAJARI SISTEM PENDAFTARAN KITA`}
                        <FaAnglesRight />
                      </button>
                    </Link>
                  </div>
{/* <div className="banner-contact hidden xl:flex gap-[100px] items-center -rotate-90 absolute top-full -translate-y-1/2 md:-left-[23%] lg:-left-[35%] xl:-left-[55%] 2xl:-left-[80%]">
                    <ul className="flex items-center gap-[34px]">
                      <li>
                        <Link
                          to={"/"}
                          className="flex gap-2 font-AlbertSans text-TextColor2-0 text-[17px] items-center"
                        >
                          <IoIosSend
                            size={"22"}
                            className="text-PrimaryColor-0"
                          />
                          info@example.com
                        </Link>
                      </li>
                      <li>
                        <p className="flex gap-2 font-AlbertSans text-TextColor2-0 text-[17px] items-center pl-8 border-l border-BorderColor-0">
                          <FaLocationDot
                            size={"18"}
                            className="text-PrimaryColor-0"
                          />
                          27 Division St, Sans fransisco , USA
                        </p>
                      </li>
                    </ul>
                  </div> */}
                </div>
              </div>
{/* <div className="banner5-livecam relative -bottom-[9.1rem] bg-[url('/images/video-bg.png')] bg-no-repeat bg-cover bg-center rounded-md 2xl:inline-block hidden">
                <div className="flex items-center justify-center gap-[80px] py-[85px] px-[130px]">
                  <h4 className="banner5-livecam-text text-lg font-AlbertSans font-medium text-white">
                    Live Cam 470x200
                  </h4>
                  <button className="h-[50px] w-[50px] rounded-full bg-PrimaryColor-0 flex justify-center items-center relative z-10 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-PrimaryColor-0 before:opacity-50 before:-z-10 before:rounded-full before:animate-ping">
                    <IoMdPlay
                      size={"22"}
                      className="text-white"
                      onClick={() => setToggler(!toggler)}
                    />
                  </button>
                </div>
                <FsLightbox
                  toggler={toggler}
                  sources={[
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                  ]}
                />
              </div> */}
            </div>
          </section>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Banner;
