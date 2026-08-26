const fs = require('fs');
const file = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/Tabs/Appointment/Appointment.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('selectedAppointment')) {
  content = content.replace(
    /const Appointment = \(\{[^\}]*\}\) => \{/,
    `const Appointment = ({
  appointments,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  updateStatusAppointment,
  setDeleteModal,
}) => {
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);`
  );

  // Add onClick to tr
  content = content.replace(
    /<tr\n\s*key=\{item\.id\}\n\s*className="odd:bg-white even:bg-slate-50 hover:!bg-indigo-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-indigo-500 cursor-pointer"/g,
    `<tr
                    key={item.id}
                    onClick={() => setSelectedAppointment(item)}
                    className="odd:bg-white even:bg-slate-50 hover:!bg-indigo-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-indigo-500 cursor-pointer"`
  );

  // Add stopPropagation to td aksi
  content = content.replace(
    /<td className="px-6 py-5 text-right space-x-2">/g,
    `<td className="px-6 py-5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>`
  );

  // Add the modal JSX just before the final </div>
  const modalJSX = `
      {/* DETAIL MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedAppointment(null)}></div>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-800">Detail Pesan Masuk</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">Informasi lengkap dari {selectedAppointment.name}</p>
              </div>
              <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all relative z-10">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                  <p className="text-gray-900 font-bold text-lg">{selectedAppointment.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <div>
                    <span className={\`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm \${selectedAppointment.status === "Pending" ? "bg-orange-100 text-orange-600 border border-orange-200" : selectedAppointment.status === "Diterima" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}\`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                  <p className="text-gray-800 font-medium flex items-center gap-2"><FiMail className="text-indigo-500"/> {selectedAppointment.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">No HP / WhatsApp</label>
                  <p className="text-gray-800 font-medium">{selectedAppointment.number || "-"}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alamat</label>
                  <p className="text-gray-800 font-medium">{selectedAppointment.address || "-"}</p>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-3"><FiMessageSquare /> Isi Pesan</label>
                <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{selectedAppointment.message || "-"}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-3">
              <button onClick={() => setSelectedAppointment(null)} className="px-6 py-2.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl transition-all">Tutup</button>
              {selectedAppointment.status === "Pending" && (
                <div className="flex gap-2">
                  <button onClick={() => { updateStatusAppointment(selectedAppointment.id, "Ditolak"); setSelectedAppointment(null); }} className="px-6 py-2.5 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 font-bold rounded-xl transition-all">Tolak</button>
                  <button onClick={() => { updateStatusAppointment(selectedAppointment.id, "Diterima"); setSelectedAppointment(null); }} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">Terima</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
  `;

  content = content.replace(/<\/div>\n\s*<\/div>\n\s*\);\n\};\n\nexport default Appointment;/, `    </div>\n${modalJSX}\n    </div>\n  );\n};\n\nexport default Appointment;`);
  
  fs.writeFileSync(file, content);
  console.log("Appointment detail modal added");
}
