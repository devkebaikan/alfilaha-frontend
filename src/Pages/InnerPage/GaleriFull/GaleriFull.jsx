import { FaArrowRightLong } from "react-icons/fa6";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import GaleriAlfilaha from "../GaleriAlfilaha/GaleriAlfilaha";

const GaleriFull = () => {
  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Galeri"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Galeri"}
        bgImage={"/images/IMG_0615.JPG"}
      />
      <div className="bg-[#f8fcfb]">
        <GaleriAlfilaha isHome={false} />
      </div>
    </>
  );
};

export default GaleriFull;
