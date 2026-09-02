import { useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";
import { FiDroplet, FiCheckCircle } from "react-icons/fi";

const CekTanaman = () => {
  const [searchCode, setSearchCode] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [tanamanData, setTanamanData] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    setLoading(true);
    setErrorMsg("");
    setShowHistory(false);
    setTanamanData(null);
    setHistoryData([]);

    try {
      // Fetch Tanaman
      const resTanaman = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${searchCode}`);
      if (!resTanaman.ok) {
        throw new Error("Tanaman dengan kode/ID tersebut tidak ditemukan.");
      }
      const dataTanaman = await resTanaman.json();
      setTanamanData(dataTanaman);

      // Fetch History
      const resLogs = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/log_perawatan`);
      if (resLogs.ok) {
        const allLogs = await resLogs.json();
        const filteredLogs = allLogs.filter(log => log.tanaman_id.toString() === searchCode.toString());
        setHistoryData(filteredLogs);
      }

      setShowHistory(true);
    } catch (err) {
      setErrorMsg(err.message || "Gagal mengambil data.");
    } finally {
      setLoading(false);
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
              <img loading="lazy" src={subTitleShape} draggable="false" alt="Shape" />
              CEK TANAMAN
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5">
              Lacak Tanaman Anda
            </h1>
            <p className="font-AlbertSans text-TextColor-0 mt-4 max-w-2xl mx-auto">
              Masukkan ID tanaman untuk melihat kondisi terkini dan riwayat
              perawatan lengkap dari santri.
            </p>
          </div>

          {/* Form Pencarian */}
          <div className="max-w-2xl mx-auto mb-16">
            <form onSubmit={handleSearch} className="bg-white p-8 rounded-lg shadow-lg border border-BorderColor2-0">
              <div className="mb-6">
                <label htmlFor="plant-code" className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-3">
                  ID Tanaman
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="plant-code"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Contoh: 1"
                    className="w-full border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300"
                  />
                  <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-TextColor-0" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="primary-btn w-full flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Mencari..." : "Cek Tanaman"}
                <FaArrowRightLong />
              </button>
            </form>
            
            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center font-semibold">
                {errorMsg}
              </div>
            )}
          </div>

          {/* History Section */}
          {showHistory && tanamanData && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-lg border border-BorderColor2-0 mb-8 flex flex-col md:flex-row gap-8">
                {tanamanData.gambar && (
                  <div className="md:w-1/3 shrink-0 rounded-xl overflow-hidden shadow-inner">
                    <img src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${tanamanData.gambar}`} alt={tanamanData.nama} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-4">
                    Informasi Tanaman
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-AlbertSans text-TextColor-0 mb-2">
                        <span className="font-semibold">ID Tanaman:</span> {tanamanData.id}
                      </p>
                      <p className="font-AlbertSans text-TextColor-0 mb-2">
                        <span className="font-semibold">Nama:</span> {tanamanData.nama}
                      </p>
                      <p className="font-AlbertSans text-TextColor-0">
                        <span className="font-semibold">Jenis:</span> {tanamanData.jenis}
                      </p>
                    </div>
                    <div>
                      <p className="font-AlbertSans text-TextColor-0 mb-2">
                        <span className="font-semibold">Lokasi:</span> {tanamanData.lokasi}
                      </p>
                      <p className="font-AlbertSans text-TextColor-0 mt-2">
                        <span className="font-semibold">Status:</span>{" "}
                        <span className="text-PrimaryColor-0 font-medium">
                          Tumbuh Terawat
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-6">
                Riwayat Perawatan oleh Santri
              </h3>
              
              {historyData.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow border border-BorderColor2-0 text-center">
                  <p className="text-gray-500">Belum ada catatan perawatan untuk tanaman ini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyData.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-lg shadow border border-BorderColor2-0 transition-all duration-300 hover:shadow-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h4 className="font-AlbertSans font-semibold text-xl text-HeadingColor-0 flex items-center gap-2">
                          {item.jenis_tindakan === "siram" ? (
                            <><FiDroplet className="text-blue-500" /> Disiram</>
                          ) : (
                            <><FiCheckCircle className="text-orange-500" /> Diberi Pupuk</>
                          )}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <span className="text-TextColor-0 text-sm font-medium">
                            {new Date(item.waktu_tindakan).toLocaleString("id-ID")}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">
                            Selesai
                          </span>
                        </div>
                      </div>
                      <p className="font-AlbertSans text-TextColor-0 mt-2">
                        Dilakukan oleh Santri: <span className="font-semibold text-gray-800">{item.nama_santri}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!showHistory && !errorMsg && (
            <div className="text-center py-12">
              <p className="font-AlbertSans text-TextColor-0 text-lg">
                Masukkan ID tanaman untuk melihat riwayat perawatan secara real-time
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CekTanaman;
