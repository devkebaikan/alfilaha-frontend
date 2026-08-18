import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const KelolaArtikel = ({ articles, showToast }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
        <h2 className="text-xl font-bold text-gray-800">Semua Artikel</h2>
        <button
          onClick={() =>
            showToast(
              "Fitur ini akan segera aktif setelah disambungkan ke MySQL!",
            )
          }
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          + Tambah Artikel Baru
        </button>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm">
              <th className="px-8 py-5 font-bold uppercase tracking-wider">
                Judul Artikel
              </th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">
                Tanggal Dibuat
              </th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.map((item) => (
              <tr
                key={item.id}
                className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer"
              >
                <td className="px-8 py-6 text-gray-800 font-bold text-lg">
                  {item.title}
                </td>
                <td className="px-8 py-6 text-gray-500 font-medium">
                  {item.date}
                </td>
                <td className="px-8 py-6 text-right space-x-3">
                  <button
                    className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-3 rounded-xl transition shadow-sm"
                    title="Edit Artikel"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 p-3 rounded-xl transition shadow-sm"
                    title="Hapus Artikel"
                  >
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

export default KelolaArtikel;
