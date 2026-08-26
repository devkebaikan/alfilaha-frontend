const fs = require('fs');
const file = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/Tabs/Galeri/GaleriManager.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update the Header
content = content.replace(
  /<div className="px-8 py-6 border-b border-gray-50 flex items-center gap-4 bg-white">/,
  `<div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-white">`
);

content = content.replace(
  /<div>\n\s*<h3 className="text-2xl font-extrabold text-gray-800 tracking-tight">\n\s*\{editingId \? "Edit Foto" : "Upload Foto Baru"\}\n\s*<\/h3>\n\s*<\/div>/,
  `<div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "Edit Foto" : "Upload Foto Baru"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Gunakan form di bawah ini untuk mengelola foto galeri.
                </p>
              </div>`
);

// 2. Update Form Wrapper
content = content.replace(
  /<form onSubmit=\{handleSubmit\} className="p-8">/,
  `<form onSubmit={handleSubmit} className="p-8 space-y-6 max-w-4xl">`
);
content = content.replace(/<div className="mb-4">/g, `<div>`);
content = content.replace(/<div className="mb-6">/g, `<div>`);

// 3. Update Inputs
const selectStyle = `w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer`;
const inputStyle = `w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium`;

content = content.replace(
  /className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"/g,
  `className="${selectStyle}"` // We will just use selectStyle, it's fine for select, we'll fix input next
);
// Fix the input specifically:
content = content.replace(
  /<input\n\s*type="text"\n\s*className="[^"]*"\n\s*placeholder="Contoh: Panen Raya 2024"\n\s*value=\{formData\.title\}\n\s*onChange=\{\(e\) =>\n\s*setFormData\(\{ \.\.\.formData, title: e\.target\.value \}\)\n\s*\}\n\s*required\n\s*\/>/,
  `<input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="${inputStyle}"
                  placeholder="Contoh: Panen Raya 2024"
                />`
);

// 4. File Upload UI Update
content = content.replace(
  /<label className="block text-sm font-bold text-gray-700 mb-2">\n\s*File Gambar \(JPG\/PNG\)\n\s*<\/label>\n\s*<input\n\s*type="file"\n\s*accept="image\/\*"\n\s*className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-green-500 cursor-pointer"\n\s*onChange=\{\(e\) => setImageFile\(e\.target\.files\[0\]\)\}\n\s*required=\{!editingId\}\n\s*\/>\n\s*\{editingId && \(\n\s*<p className="text-xs text-gray-500 mt-2">\n\s*\*Kosongkan jika tidak ingin mengubah gambar\.\n\s*<\/p>\n\s*\)\}/,
  `<label className="block text-sm font-bold text-gray-700 mb-2">
                  {editingId ? "Ganti Gambar (Opsional)" : "Upload Gambar"}
                </label>
                <label className="flex-1 border-2 border-dashed border-gray-300 rounded-[24px] flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-[#F5FAF7] hover:border-[#16804B] transition-colors cursor-pointer group min-h-[160px] relative overflow-hidden">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#16804B] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={24} />
                  </div>
                  <p className="text-gray-700 font-bold mb-1 text-sm">
                    {imageFile ? imageFile.name : (editingId ? "Pilih Gambar Baru" : "Pilih Gambar")}
                  </p>
                  <p className="text-gray-400 text-xs">Maks. ~400 KB (Otomatis dikompres)</p>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!editingId} />
                </label>`
);

// We need to add FiUploadCloud, FiSave to imports if not present
if (!content.includes('FiUploadCloud')) {
  content = content.replace(/import \{ FiPlus, FiTrash2, FiEdit, FiX, FiArrowLeft \} from "react-icons\/fi";/, 'import { FiPlus, FiTrash2, FiEdit, FiX, FiArrowLeft, FiUploadCloud, FiSave } from "react-icons/fi";');
}

// 5. Update Footer Buttons
content = content.replace(
  /<div className="pt-10 border-t border-gray-100 flex items-center gap-4 mt-8">/,
  `<div className="flex items-center gap-4 pt-10 border-t border-gray-100">`
);
content = content.replace(
  /<button\n\s*type="submit"\n\s*disabled=\{isSubmitting\}\n\s*className="px-8 py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"\n\s*>\n\s*\{isSubmitting \? "Menyimpan\.\.\." : "Simpan Foto"\}\n\s*<\/button>/,
  `<button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-5 h-5" />
                  {isSubmitting ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Foto")}
                </button>`
);
content = content.replace(
  /<button\n\s*type="button"\n\s*onClick=\{\(\) => setIsModalOpen\(false\)\}\n\s*className="px-6 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"\n\s*>\n\s*Batal\n\s*<\/button>/,
  `<button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>`
);

fs.writeFileSync(file, content);
console.log("Updated styles!");
