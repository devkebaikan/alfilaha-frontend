/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaArrowRightLong, FaCheck } from "react-icons/fa6";
import serviceImg from "/images/services-plant-1.jpg";
import serviceImg2 from "/images/services-plant-2.jpg";
import serviceImg3 from "/images/services-plant-3.jpg";
import serviceImg4 from "/images/services-plant-4.jpg";
import serviceImg5 from "/images/services-plant-5.jpg";
import serviceImg6 from "/images/services-plant-6.jpg";
import serviceShape from "/images/service-shape.png";
import serviceIcon from "/images/service2-icon.png";
import serviceIcon2 from "/images/service2-icon2.png";
import serviceIcon3 from "/images/service2-icon3.png";
import serviceIcon4 from "/images/service2-icon4.png";
import serviceIcon5 from "/images/service2-icon5.png";
import serviceIcon6 from "/images/service2-icon6.png";
import ServiceCard from "./ServiceCard";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";
import { GoArrowUpRight } from "react-icons/go";

const serviceData = [
  {
    id: 1,
    serviceImg: serviceImg,
    serviceIcon: serviceIcon,
    serviceUrl: "/service_details",
    serviceButton: <GoArrowUpRight />,
    serviceButton2: "Selengkapnya",
    serviceTitle: "Pembersihan Laut",
    serviceDesc:
      "Inovasi alternatif untuk kebersihan lingkungan dan kelestarian ekosistem perairan.",
    serviceShape: serviceShape,
  },
  {
    id: 2,
    serviceImg: serviceImg2,
    serviceIcon: serviceIcon2,
    serviceUrl: "/service_details2",
    serviceButton: <GoArrowUpRight />,
    serviceButton2: "Selengkapnya",
    serviceTitle: "Daur Ulang Sampah",
    serviceDesc:
      "Pengelolaan limbah menjadi barang bernilai guna untuk mengurangi dampak lingkungan.",
    serviceShape: serviceShape,
  },
  {
    id: 3,
    serviceImg: serviceImg3,
    serviceIcon: serviceIcon4,
    serviceUrl: "/service_details3",
    serviceButton: <GoArrowUpRight />,
    serviceButton2: "Selengkapnya",
    serviceTitle: "Pengurangan Emisi",
    serviceDesc:
      "Langkah nyata untuk meminimalisir emisi karbon demi udara yang lebih bersih.",
    serviceShape: serviceShape,
  },
  {
    id: 4,
    serviceImg: serviceImg4,
    serviceIcon: serviceIcon3,
    serviceUrl: "/service_details4",
    serviceButton: <GoArrowUpRight />,
    serviceButton2: "Selengkapnya",
    serviceTitle: "Penanaman Pohon",
    serviceDesc:
      "Menghijaukan kembali bumi kita melalui program penanaman pohon berkelanjutan.",
    serviceShape: serviceShape,
  },
  {
    id: 5,
    serviceImg: serviceImg5,
    serviceIcon: serviceIcon5,
    serviceUrl: "/service_details5",
    serviceButton: <GoArrowUpRight />,
    serviceButton2: "Selengkapnya",
    serviceTitle: "Energi Berkelanjutan",
    serviceDesc:
      "Mendorong penggunaan energi ramah lingkungan untuk masa depan yang lebih baik.",
    serviceShape: serviceShape,
  },
  {
    id: 6,
    serviceImg: serviceImg6,
    serviceIcon: serviceIcon6,
    serviceUrl: "/service_details6",
    serviceButton: <GoArrowUpRight />,
    serviceButton2: "Selengkapnya",
    serviceTitle: "Pencegahan Pemanasan",
    serviceDesc:
      "Berbagai inisiatif dan edukasi untuk menahan laju pemanasan global bersama.",
    serviceShape: serviceShape,
  },
];

const ServiceInner = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan`,
        );
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch layanan:", error);
      }
    };
    fetchServices();
  }, []);

  // Use dynamic data if available, otherwise fallback to static data
  const displayData =
    services.length > 0
      ? services.map((item) => ({
          id: item.id,
          serviceImg: item.image
            ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image}`
            : serviceImg,
          serviceIcon: serviceIcon, // Default icon
          serviceUrl: `/service/${item.id}`,
          serviceButton: <GoArrowUpRight />,
          serviceButton2: "Selengkapnya",
          serviceTitle: item.title || "",
          serviceDesc: item.description
            ? String(item.description).replace(/<[^>]+>/g, "")
            : "",
          serviceShape: serviceShape,
        }))
      : serviceData;

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Layanan Kami"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Layanan Kami"}
        bgImage={"/images/service-banner.jpg"}
      />
      <section className="pt-28 pb-[120px] p relative z-10 bg-surface2">
        <div className="Container">
          <div className="text-center">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img decoding="async" loading="lazy" src={subTitleShape} draggable="false" />
              LAYANAN KAMI
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-[1.3] sm:text-[38px] sm:leading-[48px] md:text-[40px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 px-1 sm:px-2">
              Alfilaha Menyediakan Layanan <br />
              Lingkungan Terbaik Untuk Anda
            </h1>
          </div>
          <div className="mt-[60px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {displayData.map(
                ({
                  id,
                  serviceImg,
                  serviceIcon,
                  serviceUrl,
                  serviceButton,
                  serviceButton2,
                  serviceTitle,
                  serviceDesc,
                  serviceShape,
                }) => {
                  return (
                    <div key={id}>
                      <ServiceCard
                        serviceImg={serviceImg}
                        serviceIcon={serviceIcon}
                        serviceUrl={serviceUrl}
                        serviceButton={serviceButton}
                        serviceButton2={serviceButton2}
                        serviceTitle={serviceTitle}
                        serviceDesc={serviceDesc}
                        serviceShape={serviceShape}
                      />
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceInner;
