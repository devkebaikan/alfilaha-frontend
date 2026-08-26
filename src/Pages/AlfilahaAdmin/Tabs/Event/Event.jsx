import React, { useState } from "react";
import { FiEdit, FiTrash2, FiCalendar, FiMap, FiClock, FiX, FiActivity, FiTag } from "react-icons/fi";

const Event = ({
  events,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Daftar Event & Kegiatan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola acara dan kegiatan yang diselenggarakan pesantren.
          </p>
        </div>
        <button
          onClick={() => onAdd()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          + Tambah Event
        </button>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 text-sm">
              <th className="px-8 py-5 font-bold uppercase tracking-wider">
                Judul Event
              </th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-8 py-5 font-bold uppercase tracking-wider text-right">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelectedEvent(item)}
                className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer"
              >
                <td className="px-8 py-6 text-gray-800 font-bold text-lg">
                  {item.title}
                </td>
                <td className="px-8 py-6 text-gray-500 font-medium">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </td>
                <td className="px-8 py-6 text-gray-500 font-medium">
                  {item.date &&
                  item.date.includes("-") &&
                  item.date.split("-")[0].length === 4
                    ? `${new Date(item.date).getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][new Date(item.date).getMonth()]} ${new Date(item.date).getFullYear()}`
                    : item.date}
                </td>
                <td className="px-8 py-6 text-right space-x-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(item)}
                    className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-3 rounded-xl transition shadow-sm"
                    title="Edit Event"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-white hover:bg-red-600 bg-red-50 p-3 rounded-xl transition shadow-sm"
                    title="Hapus Event"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL EVENT */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}></div>
          
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-fade-in-up">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-40 h-40 bg-[#DCFCE7] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">Detail Event</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Informasi lengkap kegiatan dan acara.</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all relative z-10">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="w-full md:w-1/3 shrink-0">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                    {selectedEvent.image ? (
                      <img src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedEvent.image}`} alt={selectedEvent.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <FiActivity size={48} className="opacity-20" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h4 className="text-2xl font-bold text-[#263238] mb-3">{selectedEvent.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm font-bold mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#DCFCE7] text-[#14532D] border border-green-200 flex items-center gap-1">
                      <FiTag /> {selectedEvent.category}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <FiCalendar /> {selectedEvent.date && selectedEvent.date.includes("-") && selectedEvent.date.split("-")[0].length === 4 ? `${new Date(selectedEvent.date).getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][new Date(selectedEvent.date).getMonth()]} ${new Date(selectedEvent.date).getFullYear()}` : selectedEvent.date}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm font-medium text-gray-700 leading-relaxed overflow-hidden">
                    <div dangerouslySetInnerHTML={{ __html: selectedEvent.description }} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => {
                  setSelectedEvent(null);
                  onEdit(selectedEvent);
                }} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
                <FiEdit /> Edit Event
              </button>
              <button onClick={() => setSelectedEvent(null)} className="px-6 py-2.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl transition-all">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

    </div>
  );
};

export default Event;
