import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit, FiX } from 'react-icons/fi';

const GaleriManager = ({ galeriList, activeCategory, fetchGaleri }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: activeCategory });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filter gambar hanya untuk kategori yang sedang diklik di sidebar
  const filteredGaleri = galeriList.filter(item => item.category === activeCategory);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
      try {
        await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri/${id}`, {
          method: 'DELETE',
        });
        fetchGaleri();
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', category: activeCategory });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (foto) => {
    setEditingId(foto.id);
    setFormData({ title: foto.title, category: foto.category });
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
    form.append('title', formData.title);
    form.append('category', formData.category);
    if (imageFile) {
      form.append('image', imageFile);
    }

    try {
      const url = editingId 
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri/${editingId}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/galeri`;
      
      const method = editingId ? 'PUT' : 'POST';

      await fetch(url, {
        method: method,
        body: form,
      });
      setIsModalOpen(false);
      setImageFile(null);
      setEditingId(null);
      setFormData({ title: '', category: activeCategory });
      fetchGaleri();
    } catch (error) {
      console.error('Error saving photo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            Galeri: {activeCategory}
          </h2>
          <p className="text-gray-500 mt-1">Total {filteredGaleri.length} foto.</p>
        </div>
        <button onClick={openAddModal} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
          <FiPlus /> Tambah Foto Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGaleri.map((foto) => (
          <div key={foto.id} className="border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-xl transition-all">
            <div className="h-48 overflow-hidden bg-gray-100">
              <img src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${foto.image_url}`} alt={foto.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4 bg-gray-50 flex flex-col h-[180px]">
              <div>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md mb-2 inline-block">{foto.category}</span>
                <h4 className="font-bold text-gray-800 mb-1 line-clamp-2">{foto.title}</h4>
              </div>
              <div className="flex justify-end gap-3 mt-auto pt-3 border-t border-gray-200">
                <button onClick={() => openEditModal(foto)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm font-semibold transition-colors">
                  <FiEdit/> Edit
                </button>
                <button onClick={() => handleDelete(foto.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-semibold transition-colors">
                  <FiTrash2/> Hapus
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

      {/* Modal Upload / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">{editingId ? 'Edit Foto' : 'Upload Foto Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Lahan Pertanian">Lahan Pertanian</option>
                  <option value="Kegiatan Santri">Kegiatan Santri</option>
                  <option value="Edukasi">Edukasi</option>
                  <option value="Panen">Panen</option>
                  <option value="Camping">Camping</option>
                  <option value="Kegiatan Masyarakat">Kegiatan Masyarakat</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Foto</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  placeholder="Contoh: Panen Raya 2024"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">File Gambar (JPG/PNG)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:outline-none focus:border-green-500 cursor-pointer"
                  onChange={e => setImageFile(e.target.files[0])}
                  required={!editingId}
                />
                {editingId && (
                  <p className="text-xs text-gray-500 mt-2">*Kosongkan jika tidak ingin mengubah gambar.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriManager;
