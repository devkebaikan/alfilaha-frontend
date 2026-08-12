import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const PaketWisata = ({ wisata, setAddWisataModal, setEditWisataModal, setDeletePaketModal }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Paket Wisata</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola dan atur harga paket wisata edukasi Alfilaha.</p>
        </div>
        <button onClick={() => setAddWisataModal({ show: true, nama_paket: '', harga: '', deskripsi: '' })} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          + Tambah Paket
        </button>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-slate-500 text-sm">
              <th className="px-8 py-5 font-bold uppercase tracking-wider">Nama Paket</th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">Harga & Info</th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {wisata.map((item) => (
              <tr key={item.id} className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer">
                <td className="px-8 py-6 text-gray-800 font-bold text-lg">{item.nama_paket}</td>
                <td className="px-8 py-6">
                  <div className="text-green-600 font-extrabold">{item.harga}</div>
                  <div className="text-xs text-gray-500 mt-2 line-clamp-2 max-w-sm">{item.deskripsi}</div>
                </td>
                <td className="px-8 py-6 text-right space-x-3">
                  <button onClick={() => setEditWisataModal({ show: true, id: item.id, nama_paket: item.nama_paket, harga: item.harga, deskripsi: item.deskripsi })} className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-3 rounded-xl transition shadow-sm border border-green-50 hover:border-green-600 transform hover:-translate-y-0.5" title="Edit Paket">
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button onClick={() => setDeletePaketModal({ show: true, id: item.id, nama_paket: item.nama_paket })} className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-3 rounded-xl transition shadow-sm border border-red-50 hover:border-red-500 transform hover:-translate-y-0.5" title="Hapus Paket">
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaketWisata;
