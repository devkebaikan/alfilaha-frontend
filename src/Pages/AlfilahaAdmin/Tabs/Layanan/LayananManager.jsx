import React from "react";
import { FiEdit, FiTrash2, FiX } from "react-icons/fi";

const LayananManager = ({
  layanan,
  onAdd,
  onEdit,
  setDeleteLayananModal,
}) => {
  const [selectedLayanan, setSelectedLayanan] = React.useState(null);
  
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="p-5 sm:p-8 border-b border-gray-50 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Daftar Layanan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola layanan yang ditampilkan di website Alfilaha.
          </p>
        </div>
        <button
          onClick={() => onAdd()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          + Tambah Layanan
        </button>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {layanan.length > 0 ? (
            layanan.map((item) => (
              <div
                key={`grid-${item.id}`}
                onClick={() => setSelectedLayanan(item)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    loading="lazy"
                    src={
                      item.image
                        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${item.image}`
                        : "/images/service-placeholder.jpg"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.onerror = null; e.target.src = "/images/about-thumb.jpg"; }}
                  />
                  <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-widest">
                    LAYANAN
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-1">
                    {item.description
                      ? (typeof item.description === 'string' ? item.description.replace(/<[^>]+>/g, '') : item.description)
                      : "Tidak ada deskripsi yang tersedia untuk layanan ini."}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(item)}
                      className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                    >
                      <FiEdit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteLayananModal({
                          show: true,
                          id: item.id,
                          title: item.title,
                        })
                      }
                      className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                    >
                      <FiTrash2 className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500 font-bold">
              Belum ada layanan yang ditambahkan.
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLayanan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedLayanan(null)}></div>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="p-5 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-800">Detail Layanan</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{selectedLayanan.title}</p>
              </div>
              <button onClick={() => setSelectedLayanan(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all relative z-10">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-5 sm:p-8 overflow-y-auto">
              {selectedLayanan.image && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64">
                  <img src={typeof selectedLayanan.image === 'string' ? (`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedLayanan.image}`) : URL.createObjectURL(selectedLayanan.image)} alt={selectedLayanan.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <label className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-2 mb-3">Deskripsi</label>
                <div className="text-gray-700 font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: selectedLayanan.description}}></div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setSelectedLayanan(null)} className="px-6 py-2.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl transition-all">Tutup</button>
              <button onClick={() => { setSelectedLayanan(null); onEdit(selectedLayanan); }} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">Edit Layanan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayananManager;
