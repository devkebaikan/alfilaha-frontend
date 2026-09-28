import { FaStarOfLife } from "react-icons/fa6";
import WhyChooseImg from "/images/why-choose-thumb.jpg";
import boxImg from "/images/why-choose-icon.png";
import boxImg2 from "/images/why-choose-icon2.png";

const WhyChoose = () => {
  return (
    <section className="pt-[320px] pb-[120px] bg-[url('/images/why-choose-us-bg.jpg')] bg-cover bg-center bg-no-repeat relative">
      <div className="Container">
        <div className="grid grid-cols-1 lg:items-center lg:grid-cols-2 2xl:gap-20">
          <div className="bg-SecondaryColor-0 rounded-t-md">
            <img decoding="async"
              loading="lazy"
              src={WhyChooseImg}
              draggable="false"
              className="w-full lg:w-[inherit] max-w-[inherit] rounded-r-md lg:-ml-[30em] xl:-ml-[25rem] 2xl:-ml-[20rem] mb-10 lg:mb-0"
            />
          </div>
          <div>
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2">
              <FaStarOfLife />
              CAMPING & OUTBOUND
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-[1.35] sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] px-1 sm:px-2 text-white mt-2 mb-6">
              Ruang Lebih Lama
              <br /> untuk Rombongan Kita.
            </h1>
            <p className="font-AlbertSans text-TextColor-0 font-light">
              Untuk rombongan sekolah atau perusahaan yang butuh ruang dan waktu
              lebih lama untuk belajar bersama alam.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-7 mt-12">
              <div>
                <img decoding="async" loading="lazy" src={boxImg} draggable="false" />
              </div>
              <div className="flex-1">
                <h5 className="font-AlbertSans font-semibold text-xl text-white">
                  Kapasitas Besar
                </h5>
                <p className="font-AlbertSans text-TextColor-0 mt-3">
                  Lapangan luas dan asrama bersih menanti rombongan kita.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-7 mt-12">
              <div>
                <img decoding="async" loading="lazy" src={boxImg2} draggable="false" />
              </div>
              <div className="flex-1">
                <h5 className="font-AlbertSans font-semibold text-xl text-white">
                  Team Building
                </h5>
                <p className="font-AlbertSans text-TextColor-0 mt-3">
                  Permainan seru untuk menguji kekompakan dan kepemimpinan.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-7 mt-12">
              <div>
                <img decoding="async" loading="lazy" src={boxImg} draggable="false" />
              </div>
              <div className="flex-1">
                <h5 className="font-AlbertSans font-semibold text-xl text-white">
                  Malam Keakraban
                </h5>
                <p className="font-AlbertSans text-TextColor-0 mt-3">
                  Api unggun, udara sejuk, dan cerita-cerita hangat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
