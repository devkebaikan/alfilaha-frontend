import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const Event = ({ events, setAddEventModal, setEditEventModal, setDeleteEventModal }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Event & Kegiatan</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola acara dan kegiatan yang diselenggarakan pesantren.</p>
        </div>
        <button onClick={() => setAddEventModal({ show: true, title: '', category: 'Kegiatan', date: '', description: '', image: null })} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          + Tambah Event
        </button>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm">
              <th className="px-8 py-5 font-bold uppercase tracking-wider">Judul Event</th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">Kategori</th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">Tanggal</th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.map((item) => (
              <tr key={item.id} className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer">
                <td className="px-8 py-6 text-gray-800 font-bold text-lg">{item.title}</td>
                <td className="px-8 py-6 text-gray-500 font-medium">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">{item.category}</span>
                </td>
                <td className="px-8 py-6 text-gray-500 font-medium">
                  {item.date && item.date.includes('-') && item.date.split('-')[0].length === 4 ? `${new Date(item.date).getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][new Date(item.date).getMonth()]} ${new Date(item.date).getFullYear()}` : item.date}
                </td>
                <td className="px-8 py-6 text-right space-x-3">
                  <button onClick={() => setEditEventModal({ show: true, id: item.id, title: item.title, category: item.category, date: item.date, description: item.description, image: null, existingImage: item.image })} className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-3 rounded-xl transition shadow-sm" title="Edit Event">
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button onClick={() => setDeleteEventModal({ show: true, id: item.id, title: item.title })} className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 p-3 rounded-xl transition shadow-sm" title="Hapus Event">
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

export default Event;
