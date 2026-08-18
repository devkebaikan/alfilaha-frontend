import { FaArrowRightLong } from "react-icons/fa6";
import { FaLeaf, FaUsers, FaBalanceScale } from "react-icons/fa";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";

const KubusAlfilaha = () => {
  const pilarData = [
    {
      id: 1,
      icon: <FaLeaf size={50} />,
      title: "Menjaga Bumi",
      subtitle: "Earth Care",
      color: "bg-green-500",
      description:
        "Termasuk bersyukur dan mengingatkan kita bahwa tidak ada produk. Di Kebun Alfilaha, kita menanam dan menyambut rasa syukur dan tanggung jawab.",
      principles: [
        "Pertanian organik tanpa pestisida kimia",
        "Komposting dan pengolahan sampah berkelanjutan",
        "Konservasi air dan energi terbarukan",
        "Reboisasi dan pelestarian keanekaragaman hayati",
      ],
    },
    {
      id: 2,
      icon: <FaUsers size={50} />,
      title: "Peduli Manusia",
      subtitle: "People Care",
      color: "bg-blue-500",
      description:
        "Sayuran dan buah yang tumbuh di sini tidak bisa berkembang sendiri. Tanpa manusia berbagi serta. Tanpa berbagi kita dengan alam atau dibagikan sekitar kita.",
      principles: [
        "Pendidikan gratis untuk anak tidak mampu",
        "Berbagi hasil panen dengan masyarakat sekitar",
        "Program kesehatan dan sanitasi komunitas",
        "Pelatihan keterampilan untuk kemandirian ekonomi",
      ],
    },
    {
      id: 3,
      icon: <FaBalanceScale size={50} />,
      title: "Pembagian yang Adil",
      subtitle: "Fair Share",
      color: "bg-yellow-500",
      description:
        "Kita panen keselarasan. Kita adilkan sesuainya. Sisa panen dan sumber daya dikembalikan ke alam atau dibagikan dengan adil. Semuanya simbang.",
      principles: [
        "Sistem ekonomi saling berbagi (sharing economy)",
        "Pembagian hasil panen secara adil",
        "Akses pendidikan dan fasilitas untuk semua",
        "Transparansi pengelolaan dana dan sumber daya",
      ],
    },
  ];

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Kubus Alfilaha"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Kubus Alfilaha"}
        bgImage={"/images/kubus-bg.jpg"}
      />
      <section className="py-28">
        <div className="Container">
          <div className="text-center mb-16">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img
                loading="lazy"
                src={subTitleShape}
                draggable="false"
                alt="Shape"
              />
              KUBUS ALFILAHA
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5">
              Menghidupkan Sunnah <br className="hidden sm:block" />
              di Atas Tanah
            </h1>
            <p className="font-AlbertSans text-TextColor-0 mt-4 max-w-3xl mx-auto">
              Bukan sekadar ater produksi, ini adalah cara perspektif kita
              menakarkan budaya regenerasi dan tiga hal ini utama.
            </p>
          </div>

          {/* Tiga Pilar */}
          <div className="space-y-12">
            {pilarData.map((pilar, index) => (
              <div
                key={pilar.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`${
                    index % 2 === 1 ? "lg:order-2" : ""
                  } bg-white p-8 rounded-lg shadow-lg border border-BorderColor2-0`}
                >
                  <div
                    className={`${pilar.color} w-20 h-20 rounded-full flex items-center justify-center text-white mb-6`}
                  >
                    {pilar.icon}
                  </div>
                  <h2 className="font-AlbertSans font-bold text-3xl text-HeadingColor-0 mb-2">
                    {pilar.title}
                  </h2>
                  <p className="font-AlbertSans text-PrimaryColor-0 text-xl font-medium mb-4">
                    {pilar.subtitle}
                  </p>
                  <p className="font-AlbertSans text-TextColor-0 text-lg leading-relaxed">
                    {pilar.description}
                  </p>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-lg border border-BorderColor2-0">
                    <h3 className="font-AlbertSans font-semibold text-xl text-HeadingColor-0 mb-6">
                      Prinsip & Praktik:
                    </h3>
                    <ul className="space-y-4">
                      {pilar.principles.map((principle, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 font-AlbertSans text-TextColor-0"
                        >
                          <div
                            className={`${pilar.color} w-2 h-2 rounded-full mt-2 flex-shrink-0`}
                          />
                          <span>{principle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center bg-PrimaryColor-0 text-white p-12 rounded-lg">
            <h2 className="font-AlbertSans font-bold text-3xl mb-4">
              Mari Bergabung dengan Gerakan Kami
            </h2>
            <p className="font-AlbertSans text-lg mb-8 max-w-2xl mx-auto">
              Jadilah bagian dari komunitas yang peduli pada bumi, sesama, dan
              keadilan. Bersama kita ciptakan masa depan yang berkelanjutan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="primary-btn2 !bg-white !text-HeadingColor-0 hover:!bg-gray-100">
                Hubungi Kami
                <FaArrowRightLong />
              </button>
              <button className="primary-btn2 !border-white !border">
                Pelajari Lebih Lanjut
                <FaArrowRightLong />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default KubusAlfilaha;
