/* eslint-disable no-unused-vars */
import processIcon from "/images/work-icon.png";
import processIcon2 from "/images/work-icon2.png";
import processIcon3 from "/images/work-icon3.png";
import processShape from "/images/work-shape3.png";
import processShape2 from "/images/work-shape4.png";
import ProcessCard from "./ProcessCard";

const processData = [
  {
    id: 1,
    processIcon: processIcon,
    boxNumber: "1",
    processTitle: "Temukan Kami Online",
    processDesc: "Kunjungi situs web kami untuk mengetahui lebih lanjut.",
  },
  {
    id: 2,
    processIcon: processIcon2,
    boxNumber: "2",
    processTitle: "Pilih Layanan",
    processDesc: "Tentukan program yang sesuai dengan kebutuhan Anda.",
  },
  {
    id: 3,
    processIcon: processIcon3,
    boxNumber: "3",
    processTitle: "Jadwalkan Pertemuan",
    processDesc: "Tentukan waktu terbaik untuk berdiskusi dengan ahli kami.",
  },
];

const Process = () => {
  return (
    <section className="pt-[90px] pb-10 relative">
      <div className="processShape">
        <img loading="lazy"
          src={processShape}
          className="absolute left-0 top-1/3 -translate-y-1/2 animate-dance3 hidden 2xl:block"
        />
      </div>
      <div className="processShape2">
        <img loading="lazy"
          src={processShape2}
          className="absolute right-[5%] top-[20%] -translate-y-1/2 animate-movebtn hidden 2xl:block"
        />
      </div>
      <div className="Container">
        <div className="text-center">
          <div>
            <h5 className="font-AlbertSans font-medium text-SecondaryColor-0">
              PROSES KERJA
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[35px] xl:leading-[45px] 2xl:text-[44px] 2xl:leading-[54px] text-HeadingColor-0 mt-3 mb-3">
              Langkah Mudah Bekerja Sama
            </h1>
            <p className="font-AlbertSans text-TextColor-0 font-light lg:w-3/5 2xl:w-3/4 mx-auto">
              Kami memastikan setiap tahapan berjalan dengan transparan, terarah, dan 
              <br className="hidden md:block" /> efisien demi mencapai hasil yang optimal.
            </p>
          </div>
        </div>
        <div className="pb-16 mt-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {processData.map(
              ({ id, processIcon, processTitle, boxNumber, processDesc }) => {
                return (
                  <div key={id}>
                    <ProcessCard
                      processIcon={processIcon}
                      boxNumber={boxNumber}
                      processTitle={processTitle}
                      processDesc={processDesc}
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
