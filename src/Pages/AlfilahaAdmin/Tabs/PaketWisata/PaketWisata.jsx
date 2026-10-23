import React from "react";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";

const PaketWisata = ({ wisata, onAdd, onEdit, setDeletePaketModal }) => {
  const [selectedWisata, setSelectedWisata] = React.useState(null);
  return (
    <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
      <div className="p-5 sm:p-8 border-b border-line flex justify-between items-center bg-card">
        <div>
          <h2 className="text-xl font-bold text-ink">
            Daftar Paket Wisata
          </h2>
          <p className="text-sm text-muted mt-1">
            Kelola dan atur harga paket wisata edukasi Alfilaha.
          </p>
        </div>
        <button
          onClick={() => onAdd()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
        >
          + Tambah Paket
        </button>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wisata.length > 0 ? (
            wisata.map((item) => (
              <div
                key={`grid-${item.id}`}
                onClick={() => setSelectedWisata(item)}
                className="bg-card border border-line rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-surface2">
                  <img decoding="async"
                    loading="lazy"
                    src={
                      item.gambar
                        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.gambar}`
                        : "/images/service-placeholder.jpg"
                    }
                    alt={item.nama_paket}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/about-thumb.jpg";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-green-700 dark:text-green-300 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm">
                    {item.harga}
                  </div>
                  <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-widest">
                    EDUWISATA
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-ink mb-3 group-hover:text-green-600 dark:text-green-300 transition-colors line-clamp-2">
                    {item.nama_paket}
                  </h3>
                  <p className="text-muted text-sm mb-6 line-clamp-3 flex-1">
                    {item.deskripsi
                      ? typeof item.deskripsi === "string"
                        ? item.deskripsi.replace(/<[^>]+>/g, "")
                        : item.deskripsi
                      : "Tidak ada deskripsi yang tersedia untuk paket ini."}
                  </p>
                  <div
                    className="flex items-center justify-between pt-4 border-t border-line mt-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEdit(item)}
                      className="text-green-600 dark:text-green-300 hover:text-white hover:bg-green-600 bg-green-50 dark:bg-green-500/15 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                    >
                      <FiEdit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeletePaketModal({
                          show: true,
                          id: item.id,
                          nama_paket: item.nama_paket,
                        })
                      }
                      className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 dark:bg-red-500/15 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                    >
                      <FiTrash2 className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted font-bold">
              Belum ada paket wisata yang ditambahkan.
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedWisata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedWisata(null)}
          ></div>
          <div className="bg-card rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="p-5 sm:p-8 border-b border-line flex justify-between items-center bg-surface2">
              <div>
                <h3 className="text-2xl font-extrabold text-ink">
                  Detail Paket Eduwisata
                </h3>
                <p className="text-sm text-muted font-medium mt-1">
                  {selectedWisata.nama_paket}
                </p>
              </div>
              <button
                onClick={() => setSelectedWisata(null)}
                className="text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/15 dark:bg-red-500/15 p-2.5 rounded-full transition-all relative z-10"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 sm:p-8 overflow-y-auto">
              {selectedWisata.gambar && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-line h-64">
                  <img loading="lazy" decoding="async"
                    src={
                      typeof selectedWisata.gambar === "string"
                        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedWisata.gambar}`
                        : URL.createObjectURL(selectedWisata.gambar)
                    }
                    alt={selectedWisata.nama_paket}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Nama Paket
                  </label>
                  <p className="text-ink font-bold text-lg">
                    {selectedWisata.nama_paket}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">
                    Harga
                  </label>
                  <p className="text-green-600 dark:text-green-300 font-extrabold text-lg">
                    {selectedWisata.harga}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-500/15 rounded-2xl p-6 border border-green-100 dark:border-green-500/30">
                <label className="text-xs font-bold text-green-600 dark:text-green-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                  Deskripsi / Fasilitas
                </label>
                <div
                  className="text-ink font-medium leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedWisata.deskripsi }}
                ></div>
              </div>
            </div>

            <div className="p-6 border-t border-line bg-surface2 flex justify-end gap-3">
              <button
                onClick={() => setSelectedWisata(null)}
                className="px-6 py-2.5 bg-card text-ink hover:bg-surface2 border border-line font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedWisata(null);
                  onEdit(selectedWisata);
                }}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                Edit Paket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaketWisata;
