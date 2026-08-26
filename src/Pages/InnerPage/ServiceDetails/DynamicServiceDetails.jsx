import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import serviceDetailsIcon from "/images/sidebar-icon.png";
import {
  FaArrowRightLong,
  FaRegFolderOpen,
} from "react-icons/fa6";
import icon from "/images/notice-icon.png";

const DynamicServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const responseAll = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan`);
        if (responseAll.ok) {
          const dataAll = await responseAll.json();
          setAllServices(dataAll);
        }

        const responseOne = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan/${id}`);
        if (responseOne.ok) {
          const dataOne = await responseOne.json();
          setService(dataOne);
        }
      } catch (error) {
        console.error("Failed to fetch layanan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Service not found.</div>;
  }

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={service.title}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Layanan Kami"}
        breadCrumbIcon2={<FaArrowRightLong />}
        breadCrumbContent={service.title}
      />
      <section className="py-[120px] bg-white">
        <div className="Container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[70px]">
            <div className="lg:col-span-2">
              {service.image && (
                <img
                  loading="lazy"
                  src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${service.image}`}
                  draggable="false"
                  className="w-full rounded-2xl object-cover max-h-[500px]"
                  alt={service.title}
                />
              )}
              <h2 className="font-AlbertSans font-bold text-[24px] sm:text-4xl text-HeadingColor-0 mt-8">
                {service.title}
              </h2>
              <div 
                className="font-AlbertSans text-TextColor-0 mt-6 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
              
              <div className="bg-PrimaryColor-0 px-[42px] rounded-md py-7 flex flex-col sm:flex-row sm:items-center gap-8 mt-[62px]">
                <div className=" pr-8 sm:border-r-2 border-[#94c933]">
                  <img loading="lazy" src={icon} draggable="false" />
                </div>
                <div className="flex-1">
                  <p className="font-AlbertSans italic text-lg sm:text-[22px] leading-8 text-white">
                    Komitmen kami adalah mewujudkan lingkungan yang bersih, sehat, dan lestari untuk generasi mendatang.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#f3f4f8] rounded-md px-4 sm:px-8 lg:px-6 xl:px-8 pt-7 pb-4 mb-7">
                <h4 className="font-AlbertSans font-semibold text-2xl text-HeadingColor-0 pb-3 mb-8 relative before:absolute before:bottom-0 before:left-0 before:w-7 before:h-[2px] before:bg-PrimaryColor-0">
                  Layanan Lainnya
                </h4>
                <ul className="mt-8">
                  {allServices.map((item) => (
                    <li key={item.id}>
                      <Link to={`/service/${item.id}`}>
                        <button className={`w-full font-AlbertSans text-left transition-all duration-500 group px-7 py-4 flex items-center justify-between rounded mb-3 overflow-hidden z-[1] relative before:absolute before:top-0 before:right-0 before:w-0 before:-z-[1] before:h-full before:bg-PrimaryColor-0 before:rounded before:transition-all before:duration-500 hover:before:w-full hover:before:left-0 hover:text-white ${item.id.toString() === id.toString() ? 'bg-PrimaryColor-0 text-white' : 'bg-white text-HeadingColor-0'}`}>
                          <span className="flex items-center gap-3">
                            <FaRegFolderOpen className={`transition-all duration-500 group-hover:text-white ${item.id.toString() === id.toString() ? 'text-white' : 'text-PrimaryColor-0'}`} />
                            {item.title}
                          </span>
                          <FaArrowRightLong className="text-white" />
                        </button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DynamicServiceDetails;
