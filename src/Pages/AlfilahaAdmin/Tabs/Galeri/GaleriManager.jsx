import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiEdit, FiX, FiArrowLeft, FiUploadCloud, FiSave } from "react-icons/fi";
import imageCompression from "browser-image-compression";

const GaleriManager = ({ galeriList, activeCategory, fetchGaleri }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: activeCategory,
    quality: "200",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Tutup form setiap kali pindah tab kategori
  useEffect(() => {
    setIsModalOpen(false);
  }, [activeCategory]);

  // Filter gambar hanya untuk kategori yang sedang diklik di sidebar
  const filteredGaleri = galeriList.filter(
    (item) => item.category === activeCategory,
  );

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) {
      try {
        await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri/${id}`,
          {
            method: "DELETE",
          },
        );
        fetchGaleri();
      } catch (error) {
        console.error("Error deleting photo:", error);
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", category: activeCategory, quality: "200" });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (foto) => {
    setEditingId(foto.id);
    setFormData({ title: foto.title, category: foto.category, quality: "200" });
    setImageFile(null); // Optional to change image
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && (!imageFile || !formData.title)) {
      alert("Judul dan gambar wajib diisi!");
      return;
    }
    if (editingId && !formData.title) {
      alert("Judul wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    form.append("title", formData.title);
    form.append("category", formData.category);

    if (imageFile) {
      try {
        const maxSizeMB = formData.quality === "200" ? 0.40 : 0.15;
        const options = {
          maxSizeMB: maxSizeMB,
          maxWidthOrHeight: formData.quality === "200" ? 1920 : 1080,
          useWebWorker: true,
          initialQuality: 0.9,
        };
        const compressedFile = await imageCompression(imageFile, options);
        form.append("image", compressedFile, compressedFile.name);
      } catch (error) {
        console.error("Error compressing image:", error);
        form.append("image", imageFile); // fallback to original if compression fails
      }
    }

    try {
      const url = editingId
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri/${editingId}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri`;

      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method: method,
        body: form,
      });
      setIsModalOpen(false);
      setImageFile(null);
      setEditingId(null);
      setFormData({ title: "", category: activeCategory });
      fetchGaleri();
    } catch (error) {
      console.error("Error saving photo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {!isModalOpen && (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            Galeri: {activeCategory}
          </h2>
          <p className="text-gray-500 mt-1">
            Total {filteredGaleri.length} foto.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors"
        >
          <FiPlus /> Tambah Foto Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredGaleri.map((foto) => (
          <div
            key={foto.id}
            className="border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-xl transition-all"
          >
            <div className="h-48 overflow-hidden bg-gray-100">
              <img
                src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${foto.image_url}`}
                alt={foto.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4 bg-gray-50 flex flex-col h-[180px]">
              <div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md mb-2 inline-block">
                  {foto.category}
                </span>
                <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">
                  {foto.title}
                </h4>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <button
                  onClick={() => openEditModal(foto)}
                  className="text-green-600 hover:text-white hover:bg-green-600 bg-green-50 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                >
                  <FiEdit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(foto.id)}
                  className="text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center gap-1"
                >
                  <FiTrash2 className="w-4 h-4" /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredGaleri.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Belum ada foto di kategori ini.
          </div>
        )}
      </div>

        </div>
      )}

      {/* Inline Form Upload / Edit */}
      {isModalOpen && (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
            <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center gap-4 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition">
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "Edit Foto" : "Upload Foto Baru"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Gunakan form di bawah ini untuk mengelola foto galeri.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-w-4xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Lahan Pertanian">Lahan Pertanian</option>
                  <option value="Kegiatan Santri">Kegiatan Santri</option>
                  <option value="Edukasi">Edukasi</option>
                  <option value="Panen">Panen</option>
                  <option value="Camping">Camping</option>
                  <option value="Kegiatan Masyarakat">
                    Kegiatan Masyarakat
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Judul Foto
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  placeholder="Contoh: Panen Raya 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Kualitas Gambar
                </label>
                <select
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 text-gray-800 font-medium cursor-pointer"
                  value={formData.quality}
                  onChange={(e) =>
                    setFormData({ ...formData, quality: e.target.value })
                  }
                >
                  <option value="200">Gambar Besar / Sangat HD (Maks. ~400 KB)</option>
                  <option value="60">
                    Gambar Standar / Cepat Loading (Maks. ~150 KB)
                  </option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  *Otomatis dikompres agar website tidak berat (tidak blur).
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
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
                </label>
              </div>

              <div className="flex items-center gap-4 pt-10 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-5 h-5" />
                  {isSubmitting ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Foto")}
                </button>
              </div>
            </form>
        </div>
      )}
    </div>
  );
};

export default GaleriManager;
