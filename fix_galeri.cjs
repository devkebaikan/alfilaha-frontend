const fs = require('fs');
const file = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/Tabs/Galeri/GaleriManager.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{\/\* Modal Upload \/ Edit \*\/\}\n\s*\{isModalOpen && \(\n\s*<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/50 backdrop-blur-sm p-4">\n\s*<div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">\n\s*<div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">/,
  `{/* Inline Form Upload / Edit */}
      {isModalOpen && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up mt-8">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition">
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>`
);

content = content.replace(
  /<h3 className="font-bold text-lg text-gray-800">\n\s*\{editingId \? "Edit Foto" : "Upload Foto Baru"\}\n\s*<\/h3>\n\s*<button\n\s*onClick=\{\(\) => setIsModalOpen\(false\)\}\n\s*className="text-gray-400 hover:text-gray-600 transition-colors"\n\s*>\n\s*<FiX size=\{24\} \/>\n\s*<\/button>\n\s*<\/div>\n\s*<form onSubmit=\{handleSubmit\} className="p-6">/,
  `                <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                  {editingId ? "Edit Foto" : "Upload Foto Baru"}
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">`
);

content = content.replace(
  /<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">\n\s*<button\n\s*type="button"\n\s*onClick=\{\(\) => setIsModalOpen\(false\)\}\n\s*className="px-6 py-2\.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"\n\s*>\n\s*Batal\n\s*<\/button>\n\s*<button\n\s*type="submit"\n\s*disabled=\{isSubmitting\}\n\s*className="px-6 py-2\.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"\n\s*>\n\s*\{isSubmitting \? "Menyimpan\.\.\." : "Simpan"\}\n\s*<\/button>\n\s*<\/div>\n\s*<\/form>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/,
  `<div className="pt-10 border-t border-gray-100 flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Foto"}
                </button>
              </div>
            </form>
        </div>
      )}`
);

content = content.replace(
  /<div className="flex justify-between items-center mb-8">/,
  `{!isModalOpen && (
    <>
      <div className="flex justify-between items-center mb-8">`
);

content = content.replace(
  /\{\/\* Modal Upload \/ Edit \*\/\}/,
  `   </>
  )}
  
  {/* Modal Upload / Edit */}`
);

if (!content.includes('FiArrowLeft')) {
  content = content.replace(/FiPlus, FiTrash2, FiEdit, FiX/, 'FiPlus, FiTrash2, FiEdit, FiX, FiArrowLeft');
}

fs.writeFileSync(file, content);
console.log("GaleriManager refactored successfully!");
