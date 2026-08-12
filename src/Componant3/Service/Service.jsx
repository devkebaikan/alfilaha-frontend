/* eslint-disable no-unused-vars */
import { FaArrowRightLong, FaStarOfLife } from "react-icons/fa6";
import serviceThumb from "/images/services-1.jpg";
import serviceThumb2 from "/images/services-2.jpg";
import serviceThumb3 from "/images/services-3.jpg";
import serviceThumb4 from "/images/services-4.jpg";
import serviceIcon from "/images/service-icon4.png";
import serviceIcon2 from "/images/service-icon5.png";
import serviceIcon3 from "/images/service-icon6.png";
import serviceIcon4 from "/images/service-icon7.png";
import ServiceCard from "./ServiceCard";

const serviceData = [
  {
    id: 1,
    serviceIcon: serviceIcon,
    serviceThumb: serviceThumb,
    serviceTitle: `Seri Merawat Bumi`,
    serviceDesc:
      "Kelas dasar berkebun, mengenal peran serangga, dan memelihara ayam halaman.",
    serviceUrl: "/service_details",
    serviceBtn: `Selengkapnya`,
    serviceBtnIcon: <FaArrowRightLong />,
  },
  {
    id: 2,
    serviceIcon: serviceIcon2,
    serviceThumb: serviceThumb2,
    serviceTitle: `Seri Hasil Bumi`,
    serviceDesc:
      "Meracik jamu tradisional dan seduhan teh sehat dari hasil kebun sendiri.",
    serviceUrl: "/service_details",
    serviceBtn: `Selengkapnya`,
    serviceBtnIcon: <FaArrowRightLong />,
  },
  {
    id: 3,
    serviceIcon: serviceIcon3,
    serviceThumb: serviceThumb3,
    serviceTitle: `Seri Nol Sampah`,
    serviceDesc:
      "Praktik kompos sisa dapur, eco-enzyme, dan upcycling plastik.",
    serviceUrl: "/service_details",
    serviceBtn: `Selengkapnya`,
    serviceBtnIcon: <FaArrowRightLong />,
  },
  {
    id: 4,
    serviceIcon: serviceIcon4,
    serviceThumb: serviceThumb4,
    serviceTitle: `Seri Eksplorasi`,
    serviceDesc:
      "Membuat karya seni bahan alam dan jalan-jalan tadabur alam.",
    serviceUrl: "/service_details",
    serviceBtn: `Selengkapnya`,
    serviceBtnIcon: <FaArrowRightLong />,
  },
];

const Service = () => {
  return (
    <section className="pt-28 -mb-[204px] relative bg-[#f5f8ed]">
      <div className="Container">
        <div className="grid grid-cols-1 lg:items-center lg:grid-cols-2 gap-1 mb-9">
          <div>
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2">
              <FaStarOfLife />
              PAKET EDUKASI TEMATIK
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-2 mb-6">
              Pilih Kegiatan yang Pas
              <br /> untuk Rombongan Kita.
            </h1>
          </div>
          <div>
            <p className="font-AlbertSans text-TextColor-0 font-light">
              Bawa keluarga, sekolah, atau komunitas kita. Tinggalkan layar
              kaca, mari sentuh tanah dan rasakan udara segar. Kita punya
              banyak pilihan kegiatan, silakan pilih yang paling pas untuk
              rombongan.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:items-center lg:grid-cols-4 gap-7 xl:ml-[45px] 2xl:ml-[19.5rem]">
        {serviceData.map(
          ({
            id,
            serviceThumb,
            serviceIcon,
            serviceTitle,
            serviceDesc,
            serviceUrl,
            serviceBtn,
            serviceBtnIcon,
          }) => {
            return (
              <div key={id}>
                <ServiceCard
                  serviceThumb={serviceThumb}
                  serviceIcon={serviceIcon}
                  serviceTitle={serviceTitle}
                  serviceDesc={serviceDesc}
                  serviceUrl={serviceUrl}
                  serviceBtn={serviceBtn}
                  serviceBtnIcon={serviceBtnIcon}
                />
              </div>
            );
          }
        )}
      </div>
    </section>
  );
};

export default Service;
