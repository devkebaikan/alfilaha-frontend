/* eslint-disable no-unused-vars */
import serviceImg from "/images/kurikulum-1.jpg";
import serviceImg2 from "/images/kurikulum-2.jpg";
import serviceImg3 from "/images/kurikulum-3.jpg";
import serviceIcon from "/images/service-icon1.png";
import serviceIcon2 from "/images/service-icon2.png";
import serviceIcon3 from "/images/service-icon3.png";
import serviceShape from "/images/service-shape.png";
import subTitleShape from "/images/sub-title-shape.png";
import { Swiper, SwiperSlide } from "swiper/react";
import ServiceNavigation from "./ServiceNavigation";
import ServiceCard from "./ServiceCard";
import { GoArrowUpRight } from "react-icons/go";

const ServiceData = [
  {
    id: 1,
    serviceImg: serviceImg,
    serviceIcon: serviceIcon,
    serviceUrl: "/service_details",
    serviceButton: <GoArrowUpRight />,
    serviceTitle: "Tahsin Ways (Spiritual)",
    serviceDesc:
      "Mengenal Allah, Memahami syariat-Nya. Kita mencoba bahwa belajar hidup mencakup semua dimensi. Kita tidak memisahkan agama dari keseharian. Semuanya melebur.",
    serviceShape: serviceShape,
  },
  {
    id: 2,
    serviceImg: serviceImg2,
    serviceIcon: serviceIcon2,
    serviceUrl: "/service_details",
    serviceButton: <GoArrowUpRight />,
    serviceTitle: "Living With Nature (Alam)",
    serviceDesc:
      "Alam adalah guru besar. Kita belajar dari siklus alami untuk menumbuhkan syukur dan tanggung jawab menjaga bumi.",
    serviceShape: serviceShape,
  },
  {
    id: 3,
    serviceImg: serviceImg3,
    serviceIcon: serviceIcon3,
    serviceUrl: "/service_details",
    serviceButton: <GoArrowUpRight />,
    serviceTitle: "Life Skills (Kecakapan)",
    serviceDesc:
      "Lulus dari sini, kita ingin mandiri. Harus bersamaan bagi orang lain dengan sehingga soft skill (kepemimpinan, empati, komunikasi) dan hard skill (pertanian, pengelolaan hasil bumi, dll) sebagai hal karya di masa depan.",
    serviceShape: serviceShape,
  },
];

const Service = () => {
  const settings = {
    loop: true,
    spaceBetween: 30,
    speed: 1000,
    autoplay: true,
    breakpoints: {
      320: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 3,
      },
    },
  };
  return (
    <section className="relative pt-28 pb-[120px] bg-[url('/images/service-bg.jpg')] bg-cover bg-no-repeat bg-center">
      <div className="Container">
        <div className="md:-mb-[11.2rem]">
          <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2">
            <img loading="lazy" src={subTitleShape} draggable="false" alt="Shape" />
            KURIKULUM KITA
          </h5>
          <h1 className="font-AlbertSans font-bold text-xl leading-6 sm:text-[38px] sm:leading-[48px] md:text-[40px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 mb-3 border-b border-BorderColor2-0 pb-9">
            Tiga Kurikulum <br />
            Utama Kita
          </h1>
        </div>
        <div className="mt-[40px]">
          <Swiper {...settings}>
            {ServiceData.map(
              ({
                id,
                serviceImg,
                serviceIcon,
                serviceUrl,
                serviceButton,
                serviceTitle,
                serviceDesc,
                serviceShape,
              }) => {
                return (
                  <>
                    <SwiperSlide key={id} >
                      <div className="pt-[120px] sm:pt-[180px]">
                        <ServiceCard
                          serviceImg={serviceImg}
                          serviceIcon={serviceIcon}
                          serviceUrl={serviceUrl}
                          serviceButton={serviceButton}
                          serviceTitle={serviceTitle}
                          serviceDesc={serviceDesc}
                          serviceShape={serviceShape}
                        />
                      </div>
                    </SwiperSlide>
                  </>
                );
              }
            )}
            <ServiceNavigation />
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Service;
