const fs = require('fs');
const file = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/Tabs/PaketWisata/PaketWisata.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('selectedWisata')) {
  // 1. Add FiX to imports if needed
  if (!content.includes('FiX')) {
    content = content.replace(/import \{ FiEdit, FiTrash2 \} from "react-icons\/fi";/, 'import { FiEdit, FiTrash2, FiX } from "react-icons/fi";');
  }

  // 2. Add selectedWisata state
  content = content.replace(
    /const PaketWisata = \(\{[^\}]*\}\) => \{/,
    `const PaketWisata = ({
  wisata,
  onAdd,
  onEdit,
  setDeletePaketModal,
}) => {
  const [selectedWisata, setSelectedWisata] = React.useState(null);`
  );

  // 3. Add onClick to tr
  content = content.replace(
    /<tr\n\s*key=\{item\.id\}\n\s*className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer"/g,
    `<tr
                key={item.id}
                onClick={() => setSelectedWisata(item)}
                className="odd:bg-white even:bg-slate-50 hover:!bg-green-50 hover:shadow-md transition-all duration-300 group border-l-4 border-transparent hover:!border-green-500 cursor-pointer"`
  );

  // 4. Add stopPropagation to td aksi
  // It already has it: <td className="px-8 py-6 text-right space-x-3" onClick={e => e.stopPropagation()}>
  
  // 5. Add the Modal JSX at the end
  const modalJSX = `
      {/* DETAIL MODAL */}
      {selectedWisata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedWisata(null)}></div>
          <div className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-800">Detail Paket Eduwisata</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{selectedWisata.nama_paket}</p>
              </div>
              <button onClick={() => setSelectedWisata(null)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all relative z-10">
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {selectedWisata.gambar && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64">
                  <img src={typeof selectedWisata.gambar === 'string' ? (\`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/\${selectedWisata.gambar}\`) : URL.createObjectURL(selectedWisata.gambar)} alt={selectedWisata.nama_paket} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Paket</label>
                  <p className="text-gray-900 font-bold text-lg">{selectedWisata.nama_paket}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Harga</label>
                  <p className="text-green-600 font-extrabold text-lg">{selectedWisata.harga}</p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <label className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-2 mb-3">Deskripsi / Fasilitas</label>
                <div className="text-gray-700 font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{__html: selectedWisata.deskripsi}}></div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setSelectedWisata(null)} className="px-6 py-2.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-bold rounded-xl transition-all">Tutup</button>
              <button onClick={() => { setSelectedWisata(null); onEdit(selectedWisata); }} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">Edit Paket</button>
            </div>
          </div>
        </div>
      )}
  `;
  
  content = content.replace(/<\/div>\n\s*<\/div>\n\s*\);\n\};\n\nexport default PaketWisata;/, `    </div>\n${modalJSX}\n    </div>\n  );\n};\n\nexport default PaketWisata;`);
  
  fs.writeFileSync(file, content);
  console.log("PaketWisata detail modal added");
}
