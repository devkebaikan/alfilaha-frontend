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
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-slate-500 text-sm">
              <th className="px-8 py-5 font-bold uppercase tracking-wider">
                Judul Layanan
              </th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">
                Deskripsi Singkat
              </th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {layanan.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelectedLayanan(item)}
                className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer"
              >
                <td className="px-8 py-6 text-gray-800 font-bold text-lg">
                  {item.title}
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
                    {item.description ? String(item.description).replace(/<[^>]+>/g, '') : ''}
                  </div>
                </td>
                <td className="px-8 py-6 text-right space-x-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(item)}
                    className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-3 rounded-xl transition shadow-sm border border-green-50 hover:border-green-600 transform hover:-translate-y-0.5"
                    title="Edit Layanan"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteLayananModal({
                        show: true,
                        id: item.id,
                        title: item.title,
                      })
                    }
                    className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-3 rounded-xl transition shadow-sm border border-red-50 hover:border-red-500 transform hover:-translate-y-0.5"
                    title="Hapus Layanan"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {layanan.length === 0 && (
              <tr>
                <td colSpan="3" className="px-8 py-12 text-center text-gray-500">
                  Belum ada layanan yang ditambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
