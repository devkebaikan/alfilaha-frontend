import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import subTitleShape from "/images/sub-title-shape.png";

const KoleksiTanaman = () => {
  const [tanamanList, setTanamanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    const fetchTanaman = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman`);
        if (res.ok) {
          const data = await res.json();
          setTanamanList(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTanaman();
  }, []);

  const downloadQR = (id, nama) => {
    const canvas = document.getElementById(`qr-canvas-${id}`);
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Tanaman_${nama.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Koleksi Tanaman"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Koleksi Tanaman"}
      />
      <section className="py-28 bg-gray-50/50">
        <div className="Container">
          <div className="text-center mb-12">
            <h5 className="font-AlbertSans font-medium text-PrimaryColor-0 flex items-center justify-center gap-2">
              <img loading="lazy" src={subTitleShape} draggable="false" alt="Shape" />
              KOLEKSI KAMI
            </h5>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mt-5">
              Jelajahi Berbagai Macam <br /> Tanaman di Alfilaha
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
               <div className="animate-spin h-10 w-10 border-4 border-PrimaryColor-0 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tanamanList.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col">
                  <div className="relative h-64 overflow-hidden shrink-0">
                    {t.gambar ? (
                      <img 
                        src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${t.gambar}`} 
                        alt={t.nama} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-300 font-bold">
                        Tanpa Foto
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-green-700 shadow-sm">
                      {t.jenis || "Tanaman"}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-PrimaryColor-0 transition-colors line-clamp-1">
                      {t.nama}
                    </h3>
                    <p className="text-gray-500 mb-6 flex items-center gap-2 text-sm">
                       📍 Lokasi: {t.lokasi}
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setSelectedQR(t)}
                        className="flex items-center justify-center w-full gap-2 text-gray-700 font-bold hover:text-green-800 transition-colors py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                      >
                        Lihat QR
                      </button>
                      <Link to={`/tanaman/${t.id}`} className="flex items-center justify-center w-full gap-2 text-PrimaryColor-0 font-bold hover:text-green-800 transition-colors py-3 border border-green-200 rounded-xl hover:bg-green-50">
                        Detail <FaArrowRightLong />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tanamanList.length === 0 && (
             <div className="text-center py-20 text-gray-500 text-lg">
                Belum ada koleksi tanaman yang dipublikasikan.
             </div>
          )}

        </div>
      </section>

      {/* Modal QR Code */}
      {selectedQR && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedQR(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
              title="Tutup (Esc)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedQR.nama}</h3>
            <p className="text-sm text-gray-500 mb-6">Scan QR untuk melihat detail tanaman</p>
            
            <div className="flex justify-center mb-6">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <QRCodeCanvas 
                  id={`qr-canvas-${selectedQR.id}`}
                  value={`${window.location.origin}/tanaman/${selectedQR.id}`} 
                  size={260} 
                  level={"H"}
                  includeMargin={true}
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => downloadQR(selectedQR.id, selectedQR.nama)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-xl transition-colors shadow-md"
              >
                <FiDownload size={18} /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KoleksiTanaman;
