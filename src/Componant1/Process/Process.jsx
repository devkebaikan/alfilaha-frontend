/* eslint-disable no-unused-vars */
import processIcon from "/images/process-icon.png";
import processIcon2 from "/images/process-icon2.png";
import processIcon3 from "/images/process-icon3.png";
import boxShape from "/images/process-arrow.png";
import boxShape2 from "/images/process-arrow2.png";
import subTitleShape from "/images/sub-title-shape.png";
import ProcessCard from "./ProcessCard";

const processData = [
  {
    id: 1,
    processIcon: processIcon,
    boxShape: boxShape,
    processTitle: "Pengumpulan Limbah",
    processDesc:
      "Tahap awal untuk memilah dan mengumpulkan material limbah agar siap dikelola secara bertanggung jawab.",
  },

  {
    id: 2,
    processIcon: processIcon2,
    boxShape: boxShape2,
    processTitle: "Daur Ulang Edukatif",
    processDesc:
      "Mengolah limbah yang terkumpul menjadi barang atau material baru yang memiliki nilai guna dan edukasi.",
  },
  {
    id: 3,
    processIcon: processIcon3,
    processTitle: "Lingkungan Bersih",
    processDesc:
      "Menikmati hasil dari proses pengelolaan yang baik, menciptakan ekosistem hijau yang sehat dan asri.",
  },
];

const Process = () => {
  return (
    <section className="pb-10 relative z-10 pt-28">
      <div className="processShape"></div>
      <div className="Container">
        <div className="text-center">
          <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2 justify-center">
            <img loading="lazy" src={subTitleShape} draggable="false" />
            PROSES KERJA
          </h5>
          <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 mb-3">
            Langkah Nyata Melestarikan Alam
          </h1>
        </div>
        <div className="pb-16 mt-[60px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {processData.map(
              ({ id, processIcon, processTitle, boxShape, processDesc }) => {
                return (
                  <div key={id}>
                    <ProcessCard
                      processIcon={processIcon}
                      boxShape={boxShape}
                      processTitle={processTitle}
                      processDesc={processDesc}
                    />
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
