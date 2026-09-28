/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";

const BreadCrumb = ({
  breadCrumbTitle,
  breadCrumbIcon,
  url,
  breadCrumbLink,
  breadCrumbIcon2,
  breadCrumbContent,
  bgImage = "/images/breadcrumb-bg.webp",
  overlayClass = "bg-black/60",
}) => {
  return (
    <div
      className="relative bg-no-repeat bg-cover bg-center flex items-center h-[240px] sm:h-[400px] lg:h-[530px] text-center pt-20"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`absolute inset-0 ${overlayClass}`}></div>
      <div className="Container relative z-10">
        <h1 className="font-AlbertSans font-extrabold text-[26px] sm:text-4xl lg:text-[46px] text-white capitalize leading-[1.25] max-w-3xl mx-auto px-1 sm:px-2">
          {breadCrumbTitle}
        </h1>
        <ul className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-center mt-6 sm:mt-7 leading-relaxed px-1 sm:px-2">
          <div className="flex gap-2 sm:gap-4 items-center justify-center">
            <li>
              <Link to={"/"}>
                <button className="font-AlbertSans text-white flex items-center gap-2 transition-all duration-500 hover:text-PrimaryColor-0 dark:hover:text-[#4ADE80]">
                  <IoHome className="text-PrimaryColor-0 dark:text-[#4ADE80]" />
                  Alfilaha
                </button>
              </Link>
            </li>
            <li>
              <div className="text-white hidden sm:block">{breadCrumbIcon}</div>
            </li>
            <li>
              <Link to={url}>
                <button className="font-AlbertSans capitalize text-white opacity-70">
                  {breadCrumbLink}
                </button>
              </Link>
            </li>
          </div>
          <li className="hidden md:block">
            <div className="text-white hidden sm:block">{breadCrumbIcon2}</div>
          </li>
          <li>
            <Link to={url}>
              <button className="font-AlbertSans capitalize text-white opacity-70">
                {breadCrumbContent}
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BreadCrumb;
