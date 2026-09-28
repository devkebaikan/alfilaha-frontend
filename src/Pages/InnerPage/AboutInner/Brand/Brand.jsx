import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import brandThumb from "/images/brand-1.png";
import brandThumb2 from "/images/brand-2.png";
import brandThumb3 from "/images/brand-3.png";
import brandThumb4 from "/images/brand-4.png";
import brandThumb5 from "/images/brand-5.png";
import brandShape from "/images/brand-shape.png";

const Brand = () => {
  const settings = {
    loop: true,
    spaceBetween: 16,
    speed: 1000,
    autoplay: true,
    breakpoints: {
      320: {
        slidesPerView: 2,
      },
      576: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 4,
        spaceBetween: 24,
      },
      992: {
        slidesPerView: 5,
        spaceBetween: 30,
      },
    },
  };
  return (
    <div className="Container relative z-10">
      <div className="pt-12 sm:pt-[80px] pb-10 sm:pb-[72px] px-5 sm:px-8 lg:px-10 rounded-md bg-[url('/images/brand-bg-new.webp')] bg-no-repeat bg-center bg-cover text-center relative z-10 before:absolute before:inset-0 before:bg-black/50 before:backdrop-blur-sm before:rounded-md before:-z-10">
        <img decoding="async"
          loading="lazy"
          src={brandShape}
          draggable="false"
          className="absolute -z-10 -top-[50px] -right-[60px] animate-dance2 hidden sm:block"
        />
        <h4 className="text-center text-base sm:text-2xl text-white font-AlbertSans font-semibold inline-block relative before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-6 sm:before:-left-12 before:h-[1px] before:w-5 sm:before:w-10 before:bg-white after:absolute after:top-1/2 after:-translate-y-1/2 after:-right-6 sm:after:-right-12 after:h-[1px] after:w-5 sm:after:w-10 after:bg-white mb-8 sm:mb-14">
          Dipercaya oleh lebih dari 100.000+ Pelanggan
        </h4>
        <Swiper {...settings}>
          <SwiperSlide>
            <div>
              <img decoding="async"
                loading="lazy"
                src={brandThumb}
                draggable="false"
                className="m-auto max-h-[42px] sm:max-h-[56px] lg:max-h-none object-contain"
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
              <img decoding="async"
                loading="lazy"
                src={brandThumb2}
                draggable="false"
                className="m-auto max-h-[42px] sm:max-h-[56px] lg:max-h-none object-contain"
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
              <img decoding="async"
                loading="lazy"
                src={brandThumb3}
                draggable="false"
                className="m-auto max-h-[42px] sm:max-h-[56px] lg:max-h-none object-contain"
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
              <img decoding="async"
                loading="lazy"
                src={brandThumb4}
                draggable="false"
                className="m-auto max-h-[42px] sm:max-h-[56px] lg:max-h-none object-contain"
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
              <img decoding="async"
                loading="lazy"
                src={brandThumb5}
                draggable="false"
                className="m-auto max-h-[42px] sm:max-h-[56px] lg:max-h-none object-contain"
              />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div>
              <img decoding="async"
                loading="lazy"
                src={brandThumb}
                draggable="false"
                className="m-auto max-h-[42px] sm:max-h-[56px] lg:max-h-none object-contain"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default Brand;
