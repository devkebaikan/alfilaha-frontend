import { Link } from "react-router-dom";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import wedgetIcon from "/images/widget-icon.png";
import icon from "/images/notice-icon.png";
import serviceDetailsIcon from "/images/sidebar-icon.png";
import serviceDetailsIcon2 from "/images/sidebar-icon2.png";
import serviceDetailsThumb from "/images/services-plant-5.jpg";
import projectDetialsBoxImg from "/images/services-details-benifis-thumb-1.png";
import projectDetialsBoxImg2 from "/images/services-details-benifis-thumb-2.png";
import {
  FaArrowRight,
  FaArrowRightLong,
  FaRegFolderOpen,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { HiDownload } from "react-icons/hi";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { IoMdCheckmark } from "react-icons/io";

const ServiceDetails5 = () => {
  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Energi Berkelanjutan"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Layanan Kami"}
        breadCrumbIcon2={<FaArrowRightLong />}
        breadCrumbContent={"Energi Berkelanjutan"}
      />
      <section className="py-[120px] bg-white">
        <div className="Container">
          <div className="grid grid-cols-3 gap-[70px]">
            <div className="col-span-3 lg:col-span-2">
              <img
                loading="lazy"
                src={serviceDetailsThumb}
                className="w-full"
              />
              <h2 className="font-AlbertSans font-bold text-[24px] sm:text-4xl text-HeadingColor-0 mt-8">
                Energi Berkelanjutan
              </h2>
              <p className="font-AlbertSans text-TextColor-0 mt-6">
                Fokus pada pengembangan dan edukasi penggunaan sumber energi terbarukan seperti tenaga surya dan biogas, guna mengurangi ketergantungan pada bahan bakar fosil.
              </p>
              <p className="font-AlbertSans text-TextColor-0 mt-7 mb-11">
                Kami menyediakan konsultasi dan pendampingan dalam instalasi teknologi energi bersih untuk kebutuhan domestik maupun pesantren. Langkah ini diyakini mampu menekan biaya operasional sekaligus melestarikan lingkungan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-5 bg-[#f3f4f8] rounded-md px-6 py-7">
                  <div className="w-[72px] h-[72px] rounded-full bg-white flex justify-center items-center">
                    <img loading="lazy" src={serviceDetailsIcon} />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-AlbertSans font-semibold text-[22px] text-HeadingColor-0">
                      Teknologi Bersih
                    </h6>
                    <p className="font-AlbertSans text-TextColor-0 mt-3">
                      Pemanfaatan panel surya dan biogas untuk kemandirian energi yang lebih efisien.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-5 bg-[#f3f4f8] rounded-md px-6 py-7">
                  <div className="w-[72px] h-[72px] rounded-full bg-white flex justify-center items-center">
                    <img loading="lazy" src={serviceDetailsIcon2} />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-AlbertSans font-semibold text-[22px] text-HeadingColor-0">
                      Edukasi Mandiri
                    </h6>
                    <p className="font-AlbertSans text-TextColor-0 mt-3">
                      Pelatihan bagi masyarakat untuk mengelola dan memelihara sumber energi mereka.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-PrimaryColor-0 px-[42px] rounded-md py-7 flex flex-col sm:flex-row sm:items-center gap-8 mt-[62px]">
                <div className=" pr-8 sm:border-r-2 border-[#94c933]">
                  <img loading="lazy" src={icon} />
                </div>
                <div className="flex-1">
                  <p className="font-AlbertSans italic text-lg sm:text-[22px] leading-8 text-white">
                    Beralih ke energi bersih berarti berinvestasi pada masa depan yang lebih cerah dan sehat.
                  </p>
                </div>
              </div>

            </div>
            <div className="col-span-3 lg:col-span-1">
              <div className="bg-[#f3f4f8] rounded-md px-4 sm:px-8 lg:px-6 xl:px-8 pt-7 pb-4 mb-7">
                <h4 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 pb-3 mb-8 relative before:absolute before:bottom-0 before:left-0 before:w-7 before:h-[2px] before:bg-PrimaryColor-0">
                  Kategori Layanan
                </h4>
                <ul className="mt-8">
                  <li>
                    <Link to={"/service_details"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details' || !window.location ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details' || !window.location ? 'text-white' : 'text-PrimaryColor-0')} />
                          Pembersihan Laut
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details2"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details2' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details2' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Daur Ulang Sampah
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details3"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details3' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details3' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Pengurangan Emisi
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details4"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details4' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details4' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Penanaman Pohon
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details5"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details5' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details5' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Energi Berkelanjutan
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                  <li>
                    <Link to={"/service_details6"}>
                      <button className={"w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white " + (window.location?.pathname === '/service_details6' ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0')}>
                        <span className="flex items-center gap-3">
                          <FaRegFolderOpen className={"transition-all duration-500 group-hover:text-white " + (window.location?.pathname === '/service_details6' ? 'text-white' : 'text-PrimaryColor-0')} />
                          Pencegahan Pemanasan
                        </span>
                        <FaArrowRightLong className="text-white" />
                      </button>
                    </Link>
                  </li>
                </ul>
              </div>


            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServiceDetails5;
