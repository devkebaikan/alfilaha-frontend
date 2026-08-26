const fs = require('fs');
const file = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/Tabs/PendaftaranManager/PendaftaranManager.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the modal overlay logic with inline page logic
// From:
/*
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-fade-in-up">
            
            {/* Modal Header *\/}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
*/
// To:
/*
      {isModalOpen && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up mt-8">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition">
                <FiArrowLeft className="w-5 h-5" />
              </button>
*/

content = content.replace(
  /\{\/\* MODAL CREATE PROGRAM \*\/\}\n\s*\{isModalOpen && \(\n\s*<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">\n\s*<div className="absolute inset-0 bg-gray-900\/40 backdrop-blur-sm" onClick=\{\(\) => setIsModalOpen\(false\)\}\><\/div>\n\s*<div className="bg-white rounded-\[32px\] w-full max-w-4xl max-h-\[95vh\] overflow-hidden shadow-2xl relative z-10 flex flex-col animate-fade-in-up">\n\s*\{\/\* Modal Header \*\/\}\n\s*<div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">\n\s*<div>\n\s*<h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">\{isEditing \? 'Edit Program Pendaftaran' : 'Buat Program Pendaftaran'\}<\/h3>\n\s*<p className="text-sm text-gray-500 font-medium mt-1">\{isEditing \? 'Perbarui informasi program.' : 'Publikasikan program baru ke halaman pendaftaran publik.'\}<\/p>\n\s*<\/div>\n\s*<button onClick=\{\(\) => setIsModalOpen\(false\)\} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2\.5 rounded-full transition-all">\n\s*<FiX size=\{24\} \/>\n\s*<\/button>\n\s*<\/div>/,
  `{/* INLINE FORM CREATE PROGRAM */}
      {isModalOpen && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition">
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">{isEditing ? 'Edit Program Pendaftaran' : 'Buat Program Pendaftaran'}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">{isEditing ? 'Perbarui informasi program.' : 'Publikasikan program baru ke halaman pendaftaran publik.'}</p>
              </div>
            </div>`
);

// Close the tags properly. 
// Before:
/*
                {/* Modal Footer *\/}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-[32px]">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" className="bg-[#16804B] hover:bg-[#14532D] text-white px-8 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                    <FiSave /> {isEditing ? 'Simpan Perubahan' : 'Buat Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
*/
// After:
/*
                {/* Modal Footer *\/}
                <div className="pt-10 border-t border-gray-100 flex items-center gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                  <button type="submit" className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                    <FiSave /> {isEditing ? 'Simpan Perubahan' : 'Buat Program'}
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}
*/

content = content.replace(
  /\{\/\* Modal Footer \*\/\}\n\s*<div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-\[32px\]">\n\s*<button type="button" onClick=\{\(\) => setIsModalOpen\(false\)\} className="px-6 py-2\.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"\>Batal<\/button>\n\s*<button type="submit" className="bg-\[\#16804B\] hover:bg-\[\#14532D\] text-white px-8 py-2\.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0\.5"\>\n\s*<FiSave \/> \{isEditing \? 'Simpan Perubahan' : 'Buat Program'\}\n\s*<\/button>\n\s*<\/div>\n\s*<\/form>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/,
  `{/* Form Footer */}
                <div className="pt-10 border-t border-gray-100 flex items-center gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Batal</button>
                  <button type="submit" className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                    <FiSave /> {isEditing ? 'Simpan Perubahan' : 'Buat Program'}
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}`
);

// Wrap the main content with `{!isModalOpen && (`
content = content.replace(
  /<div className="mb-10 flex justify-between items-end">/,
  `{!isModalOpen && (
    <>
      <div className="mb-10 flex justify-between items-end">`
);

content = content.replace(
  /\{\/\* MODAL CONFIRM DELETE \*\/\}/,
  `   </>
  )}
  
  {/* MODAL CONFIRM DELETE */}`
);

// We need to add FiArrowLeft import if not present
if (!content.includes('FiArrowLeft')) {
  content = content.replace(/FiPlus, FiTrash2, FiEdit2, FiCalendar, FiClock, FiCheckCircle, FiX, FiInfo, FiSave/, 'FiPlus, FiTrash2, FiEdit2, FiCalendar, FiClock, FiCheckCircle, FiX, FiInfo, FiSave, FiArrowLeft');
}

fs.writeFileSync(file, content);
console.log("PendaftaranManager refactored successfully!");
