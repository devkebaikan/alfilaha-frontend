import { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiArrowLeft,
  FiUploadCloud,
  FiSave,
} from "react-icons/fi";
import imageCompression from "browser-image-compression";
import { adminFetch } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";

const API_BASE = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

const GALERI_CATEGORIES = [
  "Lahan Pertanian",
  "Kegiatan Santri",
  "Edukasi",
  "Panen",
  "Camping",
  "Kegiatan Masyarakat",
];

const EMPTY_FORM = { title: "", quality: "200" };

// adminFetch tidak melempar error untuk HTTP 4xx/5xx, jadi response HARUS
// dicek manual — tanpa ini, request yang gagal (mis. 404) terbaca "sukses".
const adminJson = async (url, options = {}) => {
  const res = await adminFetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    // Dua varian backend memakai kunci berbeda: `error` (server.js) dan `message` (server-update.cjs)
    const error = new Error(
      data?.error ||
        data?.message ||
        `Permintaan gagal (${res.status} ${res.statusText})`,
    );
    error.status = res.status;
    error.data = data;
    // Respons non-JSON (mis. HTML "Cannot PUT /api/..." dari Express) = route
    // belum ada di server yang berjalan → backend hampir pasti belum di-restart.
    error.staleServer = !data;
    throw error;
  }
  return data;
};

const GaleriManager = ({ galeriList, activeCategory, fetchGaleri }) => {
  const notif = useNotifikasi();

  // Tab "Semua" bukan kategori valid di DB — form harus mulai dari kategori nyata
  const defaultCategory = GALERI_CATEGORIES.includes(activeCategory)
    ? activeCategory
    : GALERI_CATEGORIES[0];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    category: defaultCategory,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingFoto, setEditingFoto] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setEditingFoto(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...EMPTY_FORM, category: defaultCategory });
  };

  // Muat ulang daftar tanpa menggagalkan aksi yang baru saja berhasil —
  // bila server sempat tidak terjangkau, aksi tetap dianggap sukses.
  const refreshGaleri = async () => {
    try {
      await fetchGaleri();
      return true;
    } catch {
      notif.warning("Perubahan tersimpan, tetapi daftar gagal dimuat ulang.");
      return false;
    }
  };

  // Lepaskan object URL pratinjau agar tidak menahan memori
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Kunci scroll halaman + tutup form dengan tombol Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) closeForm();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, isSubmitting]);

  // Bersihkan form & preview setiap kali pindah tab kategori
  useEffect(() => {
    setIsModalOpen(false);
    setEditingId(null);
    setEditingFoto(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...EMPTY_FORM, category: defaultCategory });
  }, [activeCategory]);

  // "Semua" bukan kategori nyata di database — jangan difilter pakai === "Semua"
  const filteredGaleri =
    activeCategory === "Semua"
      ? galeriList
      : galeriList.filter((item) => item.category === activeCategory);

  const handleImagePick = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notif.warning("Hanya file gambar yang diperbolehkan.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notif.warning("Ukuran gambar maksimal 10 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDelete = async (foto) => {
    if (deletingId !== null) return;
    const confirmed = window.confirm(
      `Hapus foto "${foto.title || "tanpa judul"}"?\n\nTindakan ini tidak dapat dibatalkan.`,
    );
    if (!confirmed) return;

    setDeletingId(foto.id);
    try {
      await adminJson(`${API_BASE}/api/galeri/${foto.id}`, {
        method: "DELETE",
      });
      await refreshGaleri();
      notif.success(`Foto "${foto.title || "tanpa judul"}" berhasil dihapus.`);
    } catch (error) {
      console.error("Error deleting photo:", error);
      if (error.status === 404 && error.staleServer) {
        notif.error(
          'Server belum di-restart — route hapus tidak aktif. Restart backend: pkill -f "node server.js", lalu node server.js.',
        );
      } else if (error.status === 404) {
        // Foto sudah hilang di server — cukup segarkan tampilan
        await refreshGaleri();
        notif.info("Foto sudah tidak ada, daftar diperbarui.");
      } else {
        notif.error(error.message || "Gagal menghapus foto.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setEditingFoto(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...EMPTY_FORM, category: defaultCategory });
    setIsModalOpen(true);
  };

  const openEditModal = (foto) => {
    if (deletingId !== null) return;
    setEditingId(foto.id);
    setEditingFoto(foto);
    setFormData({
      title: foto.title || "",
      category: foto.category || defaultCategory,
      quality: "200",
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = formData.title.trim();
    const category = formData.category;

    if (!title) {
      notif.warning("Judul wajib diisi.");
      return;
    }
    if (!GALERI_CATEGORIES.includes(category)) {
      notif.warning("Kategori tidak valid.");
      return;
    }
    if (!editingId && !imageFile) {
      notif.warning("Gambar wajib dipilih.");
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    form.append("title", title);
    form.append("category", category);

    if (imageFile) {
      try {
        const maxSizeMB = formData.quality === "200" ? 0.4 : 0.15;
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

    const url = editingId
      ? `${API_BASE}/api/galeri/${editingId}`
      : `${API_BASE}/api/galeri`;
    const method = editingId ? "PUT" : "POST";

    try {
      await adminJson(url, { method, body: form });
      const refreshed = await refreshGaleri();
      closeForm();
      if (refreshed) {
        notif.success(
          editingId ? "Foto berhasil diperbarui." : "Foto berhasil ditambahkan.",
        );
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      if (error.status === 404 && error.staleServer) {
        notif.error(
          'Server belum di-restart — route "ubah foto" tidak aktif. Restart backend: pkill -f "node server.js", lalu node server.js.',
        );
      } else if (error.status === 404 && editingId) {
        await refreshGaleri();
        closeForm();
        notif.error("Foto tidak ditemukan — mungkin sudah dihapus.");
      } else {
        notif.error(error.message || "Gagal menyimpan foto.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {!isModalOpen && (
        <div className="bg-card rounded-2xl sm:rounded-[2rem] shadow-sm border border-line p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-ink capitalize">
                Galeri: {activeCategory}
              </h2>
              <p className="text-muted mt-1">
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
                className="border border-line rounded-2xl overflow-hidden group hover:shadow-xl transition-all"
              >
                <div className="h-48 overflow-hidden bg-surface2">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${foto.image_url}`}
                    alt={foto.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 bg-surface2 flex flex-col h-[180px]">
                  <div>
                    <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-md mb-2 inline-block">
                      {foto.category}
                    </span>
                    <h4 className="font-bold text-ink mb-1 line-clamp-2">
                      {foto.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-line mt-auto gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(foto)}
                      disabled={deletingId !== null}
                      className="flex-1 text-green-600 dark:text-green-300 hover:text-white hover:bg-green-600 bg-green-50 dark:bg-green-500/15 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <FiEdit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(foto)}
                      disabled={deletingId !== null}
                      className="flex-1 text-red-500 hover:text-white hover:bg-red-500 bg-red-50 dark:bg-red-500/15 p-2.5 rounded-lg transition shadow-sm text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {deletingId === foto.id ? (
                        <>
                          <FiTrash2 className="w-4 h-4 animate-pulse" />{" "}
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="w-4 h-4" /> Hapus
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredGaleri.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted">
                Belum ada foto di kategori ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inline Form Upload / Edit */}
      {isModalOpen && (
        <div className="bg-card rounded-2xl sm:rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
          <div className="p-6 sm:p-8 border-b border-line flex items-center gap-4 bg-card">
            <button
              type="button"
              onClick={closeForm}
              disabled={isSubmitting}
              className="p-2 bg-surface2 hover:bg-surface2 text-muted rounded-xl transition disabled:opacity-50"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-ink">
                {editingId ? "Edit Foto" : "Upload Foto Baru"}
              </h2>
              <p className="text-sm text-muted mt-1">
                Gunakan form di bawah ini untuk mengelola foto galeri.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 space-y-6 max-w-4xl"
          >
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Kategori
              </label>
              <select
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 text-ink font-medium cursor-pointer"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {GALERI_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Judul Foto
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder="Contoh: Panen Raya 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Kualitas Gambar
              </label>
              <select
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 text-ink font-medium cursor-pointer"
                value={formData.quality}
                onChange={(e) =>
                  setFormData({ ...formData, quality: e.target.value })
                }
              >
                <option value="200">
                  Gambar Besar / Sangat HD (Maks. ~400 KB)
                </option>
                <option value="60">
                  Gambar Standar / Cepat Loading (Maks. ~150 KB)
                </option>
              </select>
              <p className="text-xs text-muted mt-2">
                *Otomatis dikompres agar website tidak berat (tidak blur).
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                {editingId ? "Ganti Gambar (Opsional)" : "Upload Gambar"}
              </label>
              {editingId && !imagePreview && (
                <div className="mb-3 flex items-center gap-3 p-3 rounded-xl border border-line bg-surface2">
                  <img
                    src={`${API_BASE}/uploads/${editingFoto?.image_url}`}
                    alt="Gambar saat ini"
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-line"
                  />
                  <div className="text-sm">
                    <p className="font-bold text-ink">Gambar saat ini</p>
                    <p className="text-muted">
                      Biarkan kosong bila tidak ingin mengganti gambar.
                    </p>
                  </div>
                </div>
              )}
              <label className="flex-1 border-2 border-dashed border-line rounded-[24px] flex flex-col items-center justify-center text-center bg-surface2 hover:bg-[#F5FAF7] dark:hover:bg-[#1E2A25] dark:bg-[#18211D] hover:border-[#16804B] transition-colors cursor-pointer group min-h-[160px] relative overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Pratinjau gambar baru"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center text-[#16804B] dark:text-[#4ADE80] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                      <FiUploadCloud size={24} />
                    </div>
                    <p className="text-ink font-bold mb-1 text-sm">
                      {imageFile
                        ? imageFile.name
                        : editingId
                          ? "Pilih Gambar Baru"
                          : "Pilih Gambar"}
                    </p>
                    <p className="text-muted text-xs">
                      Maks. ~400 KB (Otomatis dikompres)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImagePick(e.target.files[0])}
                  required={!editingId}
                />
              </label>
            </div>

            <div className="flex items-center gap-4 pt-10 border-t border-line">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="px-6 py-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
              >
                <FiSave className="w-5 h-5" />
                {isSubmitting
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Simpan Foto"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GaleriManager;
