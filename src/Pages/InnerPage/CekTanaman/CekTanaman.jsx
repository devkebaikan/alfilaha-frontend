import { useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";

const CekTanaman = () => {
  const [searchCode, setSearchCode] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Data dummy untuk history
  const historyData = [
    {
      id: 1,
      date: "01 Agu 2026",
      activity: "Penanaman Bibit",
      description: "Penanaman bibit tomat varietas unggul di area A12",
      status: "Selesai",
    },
    {
      id: 2,
      date: "08 Agu 2026",
      activity: "Penyiraman & Pemupukan",
      description: "Penyiraman rutin dan pemberian pupuk organik kompos",
      status: "Selesai",
    },
    {
      id: 3,
      date: "15 Agu 2026",
      activity: "Pemeriksaan Hama",
      description: "Inspeksi rutin, tidak ditemukan hama atau penyakit",
      status: "Selesai",
    },
    {
      id: 4,
      date: "22 Agu 2026",
      activity: "Perawatan Lanjutan",
      description: "Pemangkasan daun dan pengecekan pertumbuhan buah",
      status: "Selesai",
    },
    {
      id: 5,
      date: "05 Sep 2026",
      activity: "Panen Raya",
      description: "Estimasi panen perdana untuk tanaman ini",
      status: "Terjadwal",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      setShowHistory(true);
    }
  };

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Cek Tanaman + History"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Cek Tanaman + History"}
      />
      <section className="py-28">
        <div className="Container">
          <div className="text-center mb-12">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img src={subTitleShape} draggable="false" alt="Shape" />
              CEK TANAMAN
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5">
              Lacak Tanaman Anda
            </h1>
            <p className="font-AlbertSans text-TextColor-0 mt-4 max-w-2xl mx-auto">
              Masukkan kode tanaman untuk melihat kondisi terkini dan riwayat
              perawatan lengkap dari awal penanaman hingga panen.
            </p>
          </div>

          {/* Form Pencarian */}
          <div className="max-w-2xl mx-auto mb-16">
            <form
              onSubmit={handleSearch}
              className="bg-white p-8 rounded-lg shadow-lg border border-BorderColor2-0"
            >
              <div className="mb-6">
                <label
                  htmlFor="plant-code"
                  className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-3"
                >
                  Kode Tanaman
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="plant-code"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Contoh: TMT-A12-001"
                    className="w-full border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300"
                  />
                  <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-TextColor-0" />
                </div>
              </div>
              <button
                type="submit"
                className="primary-btn w-full flex items-center justify-center gap-2"
              >
                Cek Tanaman
                <FaArrowRightLong />
              </button>
            </form>
          </div>

          {/* History Section */}
          {showHistory && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-lg border border-BorderColor2-0 mb-8">
                <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-4">
                  Informasi Tanaman
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-AlbertSans text-TextColor-0">
                      <span className="font-semibold">Kode:</span> {searchCode}
                    </p>
                    <p className="font-AlbertSans text-TextColor-0 mt-2">
                      <span className="font-semibold">Jenis:</span> Tomat
                      Organik
                    </p>
                  </div>
                  <div>
                    <p className="font-AlbertSans text-TextColor-0">
                      <span className="font-semibold">Lokasi:</span> Area A12
                    </p>
                    <p className="font-AlbertSans text-TextColor-0 mt-2">
                      <span className="font-semibold">Status:</span>{" "}
                      <span className="text-PrimaryColor-0 font-medium">
                        Tumbuh Sehat
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-6">
                Riwayat Perawatan
              </h3>
              <div className="space-y-4">
                {historyData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-6 rounded-lg shadow border border-BorderColor2-0 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <h4 className="font-AlbertSans font-semibold text-xl text-HeadingColor-0">
                        {item.activity}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <span className="text-TextColor-0 text-sm">
                          {item.date}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === "Selesai"
                              ? "bg-PrimaryColor-0 text-white"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <p className="font-AlbertSans text-TextColor-0">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showHistory && (
            <div className="text-center py-12">
              <p className="font-AlbertSans text-TextColor-0 text-lg">
                Masukkan kode tanaman untuk melihat riwayat perawatan
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CekTanaman;
