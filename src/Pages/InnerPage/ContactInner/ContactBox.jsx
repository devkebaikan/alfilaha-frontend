import { Link } from "react-router-dom";
import { FaLocationDot, FaPhoneVolume } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";

const ContactBox = () => {
  return (
    <section>
      <div className="Container mt-[120px]">
        <div className="bg-PrimaryColor-0 rounded-xl text-center pt-10 pb-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <div className="group border-r-2 border-[#bbdd7f]">
            <div className="w-[80px] h-[80px] flex items-center justify-center bg-card rounded-full text-PrimaryColor-0 dark:text-[#4ADE80] relative m-auto z-10 transition-all duration-500 group-hover:text-white before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-SecondaryColor-0 before:transition-all before:duration-500 before:scale-0 before:-z-10 before:rounded-full group-hover:before:scale-100 after:absolute after:-top-[11px] after:-left-[11px] after:w-[102px] after:h-[102px] after:border-2 after:border-white after:rounded-full after:opacity-50 after:animate-ping">
              <FaLocationDot size={"30"} />
            </div>
            <h5 className="font-AlbertSans font-medium text-[22px] text-white mt-6 mb-3">
              Office Address
            </h5>
            <p className="font-AlbertSans text-white hover:text-SecondaryColor-0 transition-colors text-[15px] sm:text-base leading-[1.7]">
              <a
                href="https://maps.app.goo.gl/YkgSNQFk1tjz67n18"
                target="_blank"
                rel="noreferrer"
              >
                Jl. Dusun Tepus, Bulukerto, Sewurejo, <br /> Kec. Mojogedang,
                Kabupaten Karanganyar, Jawa Tengah 57752, Indonesia
              </a>
            </p>
          </div>
          <div className="group border-r-2 border-[#bbdd7f]">
            <div className="w-[80px] h-[80px] flex items-center justify-center bg-card rounded-full text-PrimaryColor-0 dark:text-[#4ADE80] relative m-auto z-10 transition-all duration-500 group-hover:text-white before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-SecondaryColor-0 before:transition-all before:duration-500 before:scale-0 before:-z-10 before:rounded-full group-hover:before:scale-100 after:absolute after:-top-[11px] after:-left-[11px] after:w-[102px] after:h-[102px] after:border-2 after:border-white after:rounded-full after:opacity-50 after:animate-ping">
              <FaPhoneVolume size={"30"} />
            </div>
            <h5 className="font-AlbertSans font-medium text-[22px] text-white mt-6 mb-3">
              Make A Call / Chat
            </h5>
            <ul>
              <li>
                <a
                  href="https://wa.me/6281393864052"
                  target="_blank"
                  rel="noreferrer"
                >
                  <button className="font-AlbertSans text-white transition-all duration-500 hover:text-SecondaryColor-0 mb-2 font-bold tracking-wide">
                    +62 813-9386-4052
                  </button>
                </a>
              </li>
            </ul>
          </div>
          <div className="group">
            <div className="w-[80px] h-[80px] flex items-center justify-center bg-card rounded-full text-PrimaryColor-0 dark:text-[#4ADE80] relative m-auto z-10 transition-all duration-500 group-hover:text-white before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-SecondaryColor-0 before:transition-all before:duration-500 before:scale-0 before:-z-10 before:rounded-full group-hover:before:scale-100 after:absolute after:-top-[11px] after:-left-[11px] after:w-[102px] after:h-[102px] after:border-2 after:border-white after:rounded-full after:opacity-50 after:animate-ping">
              <BiSupport size={"30"} />
            </div>
            <h5 className="font-AlbertSans font-medium text-[22px] text-white mt-6 mb-3">
              Online Support
            </h5>
            <ul>
              <li>
                <a href="#" className="pointer-events-none">
                  <button className="font-AlbertSans text-white transition-all duration-500 hover:text-SecondaryColor-0 mb-2">
                    -
                  </button>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactBox;
