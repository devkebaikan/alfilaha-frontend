import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiArrowLeft, FiSave, FiUploadCloud } from "react-icons/fi";

const EventForm = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kegiatan");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCategory(initialData.category || "Kegiatan");
      setDate(initialData.date || "");
      setDescription(initialData.description || "");
      setExistingImage(initialData.existingImage || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("description", description);
    if (image) formData.append("image", image);

    onSave(formData, initialData?.id);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-white">
        <button
          onClick={onCancel}
          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? "Edit Event" : "Tambah Event Baru"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gunakan form di bawah ini untuk mengatur detail acara.
          </p>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Judul Event
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
              placeholder="Contoh: Panen Raya Berkebun"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer"
              >
                <option value="Kegiatan">Kegiatan</option>
                <option value="Event">Event Spesial</option>
                <option value="Pelatihan">Pelatihan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {initialData ? "Ganti Gambar / Poster (Opsional)" : "Upload Gambar / Poster (Opsional)"}
            </label>
            <label className="flex-1 border-2 border-dashed border-gray-300 rounded-[24px] flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-[#F5FAF7] hover:border-[#16804B] transition-colors cursor-pointer group min-h-[160px]">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#16804B] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <FiUploadCloud size={24} />
              </div>
              <p className="text-gray-700 font-bold mb-1 text-sm">
                {image ? image.name : (initialData && existingImage ? existingImage : "Pilih Gambar Baru")}
              </p>
              <p className="text-gray-400 text-xs">Maks. 2MB (Format: JPG, PNG)</p>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Lengkap <span className="text-red-500">*</span></label>
            <div className="bg-white rounded-[20px] border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#16804B] focus-within:border-[#16804B] transition-all">
              <ReactQuill 
                theme="snow" 
                value={description} 
                onChange={setDescription}
                className="h-40 border-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              {initialData ? "Simpan Perubahan" : "Simpan Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
