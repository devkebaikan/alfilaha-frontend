import { Link } from "react-router-dom";
import FaqAccordion from "./FaqAccordion";
import subTitleShape from "/images/sub-title-shape.png";
import buttonShape from "/images/button-shape-1.png";
import faqIcon from "/images/faq-icon.png";
import faqMainShape from "/images/faqs-shape2.png";

const Faq = () => {
  //  All Faqs and  answers.
  const faqs = [
    {
      faqIcon: faqIcon,
      title: "Bagaimana Cara Bergabung dengan Alfilaha?",
      text: "Anda bisa menghubungi kami melalui halaman kontak atau pesan di media sosial kami untuk informasi lebih lanjut tentang kolaborasi.",
      active: true,
    },
    {
      faqIcon: faqIcon,
      title: "Apa Itu Pertanian Regeneratif?",
      text: "Metode bertani yang tidak hanya mengambil hasil, namun juga fokus pada pemulihan tanah dan ekosistem agar alam tetap lestari.",
      active: false,
    },
    {
      faqIcon: faqIcon,
      title: "Kapan Waktu Terbaik Untuk Berkunjung?",
      text: "Kami menyarankan Anda untuk membuat janji temu terlebih dahulu agar kami bisa menyiapkan panduan terbaik saat berkunjung ke kebun.",
      active: false,
    },
    {
      faqIcon: faqIcon,
      title: "Apakah Saya Bisa Berdonasi Melalui Website?",
      text: "Ya, tentu saja. Anda dapat melihat program donasi kami di halaman Donasi dan mengikuti langkah mudah untuk berkontribusi secara online.",
      active: false,
    },
  ];

  return (
    <section
      className="relative overflow-hidden py-28 bg-[url('/images/faq-bg.jpg')] bg-cover bg-no-repeat
     bg-center"
    >
      <div className="Container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
          <div className="relative">
            <img loading="lazy"
              src={faqMainShape}
              className="absolute -top-28 right-10 animate-movebtn"
            />
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center gap-2">
              <img loading="lazy" src={subTitleShape} draggable="false" />
              FAQ
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5 mb-6">
              Pertanyaan yang <br />
              Sering Diajukan
            </h1>
            <p className="font-AlbertSans text-TextColor-0 font-light mb-9">
              {`Kami telah merangkum beberapa pertanyaan umum untuk memudahkan Anda memahami visi, misi, dan aktivitas yang kami jalankan di Alfilaha.`}
            </p>
            <Link to={"/about"}>
              <button className="primary-btn">
                {`Selengkapnya`}
                <img loading="lazy" src={buttonShape} draggable="false" />
              </button>
            </Link>
          </div>
          <div className="w-full mx-auto">
            <div>
              {faqs.map((faq, index) => (
                <FaqAccordion
                  key={index}
                  faqIcon={faq.faqIcon}
                  title={faq.title}
                  id={`faqs-${index}`}
                  active={faq.active}
                >
                  {faq.text}
                </FaqAccordion>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
