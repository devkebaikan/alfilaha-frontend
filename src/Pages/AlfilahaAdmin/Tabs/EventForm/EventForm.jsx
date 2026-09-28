import { useState, useEffect } from "react";
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
    <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
      <div className="p-8 border-b border-line flex items-center gap-4 bg-card">
        <button
          onClick={onCancel}
          className="p-2 bg-surface2 hover:bg-surface2 text-muted rounded-xl transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-ink">
            {initialData ? "Edit Event" : "Tambah Event Baru"}
          </h2>
          <p className="text-sm text-muted mt-1">
            Gunakan form di bawah ini untuk mengatur detail acara.
          </p>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Judul Event
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
              placeholder="Contoh: Panen Raya Berkebun"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 text-ink font-medium cursor-pointer"
              >
                <option value="Kegiatan">Kegiatan</option>
                <option value="Event">Event Spesial</option>
                <option value="Pelatihan">Pelatihan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              {initialData
                ? "Ganti Gambar / Poster (Opsional)"
                : "Upload Gambar / Poster (Opsional)"}
            </label>
            <label className="flex-1 border-2 border-dashed border-line rounded-[24px] flex flex-col items-center justify-center text-center bg-surface2 hover:bg-[#F5FAF7] dark:hover:bg-[#1E2A25] dark:bg-[#18211D] hover:border-[#16804B] transition-colors cursor-pointer group min-h-[160px]">
              <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center text-[#16804B] dark:text-[#4ADE80] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <FiUploadCloud size={24} />
              </div>
              <p className="text-ink font-bold mb-1 text-sm">
                {image
                  ? image.name
                  : initialData && existingImage
                    ? existingImage
                    : "Pilih Gambar Baru"}
              </p>
              <p className="text-muted text-xs">
                Maks. 2MB (Format: JPG, PNG)
              </p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Deskripsi Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="bg-card rounded-[20px] border border-line overflow-hidden focus-within:ring-2 focus-within:ring-[#16804B] focus-within:border-[#16804B] transition-all">
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                className="h-40 border-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-10 border-t border-line">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
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
