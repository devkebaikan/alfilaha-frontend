import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiPlus, FiTrash2, FiDownload, FiArrowLeft, FiSave, FiCamera, FiUploadCloud } from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import WebcamCapture from "../../../../Components/WebcamCapture";

const TanamanManager = () => {
  const [tanaman, setTanaman] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama: "", jenis: "", lokasi: "", deskripsi: "", kondisi: "Sehat", usia: "", jadwal_siram: "", penanggung_jawab: "", kebutuhan_air: "Cukup", terakhir_dipupuk: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const qrRefs = useRef({});
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  const fetchTanaman = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman`);
      if (res.ok) setTanaman(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTanaman();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append("nama", formData.nama);
    data.append("jenis", formData.jenis);
    data.append("lokasi", formData.lokasi);
    data.append("deskripsi", formData.deskripsi);
    data.append("kondisi", formData.kondisi);
    data.append("usia", formData.usia);
    data.append("jadwal_siram", formData.jadwal_siram);
    data.append("penanggung_jawab", formData.penanggung_jawab);
    data.append("kebutuhan_air", formData.kebutuhan_air);
    data.append("terakhir_dipupuk", formData.terakhir_dipupuk);
    if (imageFile) data.append("gambar", imageFile);

    try {
      const url = editingId 
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${editingId}` 
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman`;
      
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        body: data,
      });
      if (res.ok) {
        fetchTanaman();
        handleCloseForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ nama: "", jenis: "", lokasi: "", deskripsi: "", kondisi: "Sehat", usia: "", jadwal_siram: "", penanggung_jawab: "", kebutuhan_air: "Cukup", terakhir_dipupuk: "" });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      nama: t.nama || "",
      jenis: t.jenis || "",
      lokasi: t.lokasi || "",
      deskripsi: t.deskripsi || "",
      kondisi: t.kondisi || "Sehat",
      usia: t.usia || "",
      jadwal_siram: t.jadwal_siram || "",
      penanggung_jawab: t.penanggung_jawab || "",
      kebutuhan_air: t.kebutuhan_air || "Cukup",
      terakhir_dipupuk: t.terakhir_dipupuk || ""
    });
    setImageFile(null);
    if (t.gambar) {
      setImagePreview(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${t.gambar}`);
    } else {
      setImagePreview(null);
    }
    setIsFormOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tanaman ini?")) return;
    try {
      await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}`, { method: "DELETE" });
      fetchTanaman();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQR = (id, nama) => {
    const originalCanvas = qrRefs.current[id]?.querySelector("canvas");
    if (!originalCanvas) return;

    // Skala 5x (sekitar 350px) + bingkai putih agar terlihat rapi
    const scale = 5; 
    const padding = 40; 
    const qrSize = originalCanvas.width * scale;
    const totalSize = qrSize + (padding * 2);
    
    const canvas = document.createElement("canvas");
    canvas.width = totalSize;
    canvas.height = totalSize + 40; // Tambahan space untuk teks di bawah
    
    const ctx = canvas.getContext("2d");
    
    // Background putih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gambar QR Code di tengah (Anti-blur)
    ctx.imageSmoothingEnabled = false; 
    ctx.drawImage(originalCanvas, padding, padding, qrSize, qrSize);

    // Tambahkan teks nama tanaman di bawah QR
    ctx.fillStyle = "#166534"; // text-green-800
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(nama, canvas.width / 2, canvas.height - 25);

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${nama.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    }),
    []
  );

  const formats = ["header", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet"];

  if (isFormOpen) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-white">
          <button
            onClick={handleCloseForm}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Tanaman" : "Tambah Tanaman Baru"}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {editingId ? "Ubah informasi tanaman di bawah ini." : "Gunakan form di bawah untuk mendaftarkan tanaman dan menghasilkan QR Code otomatis."}
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nama Tanaman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                placeholder="Misal: Pohon Jati"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Jenis</label>
              <input
                type="text"
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                placeholder="Misal: Tanaman Hias / Kayu"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lokasi <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
              >
                <option value="">Pilih Lokasi...</option>
                <option value="Kebun A">Kebun A</option>
                <option value="Kebun B">Kebun B</option>
                <option value="Kebun C">Kebun C</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kondisi Tanaman</label>
                <select
                  value={formData.kondisi}
                  onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                >
                  <option value="Sehat">Sehat</option>
                  <option value="Subur">Subur</option>
                  <option value="Kurang Subur">Kurang Subur</option>
                  <option value="Layu">Layu</option>
                  <option value="Kering">Kering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Usia Tanaman</label>
                <input
                  type="text"
                  value={formData.usia}
                  onChange={(e) => setFormData({ ...formData, usia: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  placeholder="Misal: 6 Bulan"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Jadwal Siram</label>
                <select
                  value={formData.jadwal_siram}
                  onChange={(e) => setFormData({ ...formData, jadwal_siram: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                >
                  <option value="">Pilih Jadwal...</option>
                  <option value="1x Sehari">1x Sehari</option>
                  <option value="2x Sehari">2x Sehari</option>
                  <option value="3x Sehari">3x Sehari</option>
                  <option value="4x Sehari">4x Sehari</option>
                  <option value="5x Sehari">5x Sehari</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Perawat / Penanggung Jawab</label>
                <select
                  value={formData.penanggung_jawab}
                  onChange={(e) => setFormData({ ...formData, penanggung_jawab: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                >
                  <option value="">Pilih Penanggung Jawab...</option>
                  <option value="Kelompok A">Kelompok A</option>
                  <option value="Kelompok B">Kelompok B</option>
                  <option value="Kelompok C">Kelompok C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kebutuhan Air</label>
                <select
                  value={formData.kebutuhan_air}
                  onChange={(e) => setFormData({ ...formData, kebutuhan_air: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                >
                  <option value="Cukup">Cukup</option>
                  <option value="Banyak">Banyak (Basah)</option>
                  <option value="Sedikit">Sedikit (Kering)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Terakhir Dipupuk</label>
                <input
                  type="text"
                  value={formData.terakhir_dipupuk}
                  onChange={(e) => setFormData({ ...formData, terakhir_dipupuk: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white text-gray-800 font-medium"
                  placeholder="Misal: 2 hari lalu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Upload Foto Tanaman
              </label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 cursor-pointer bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-xl border border-green-200 text-center font-bold transition flex items-center justify-center gap-2 text-sm"
                  >
                    <FiCamera size={18} /> Ambil Foto (Kamera)
                  </button>
                  <label className="flex-1 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-xl border border-blue-200 text-center font-bold transition flex items-center justify-center gap-2 text-sm">
                    <FiUploadCloud size={18} /> Pilih dari Galeri
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <FiTrash2 size={18} /> Hapus
                    </button>
                  )}
                </div>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Preview Gambar:</p>
                  <div className="relative h-48 w-full max-w-sm rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="pb-12">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Deskripsi / Info Detail Tanaman
              </label>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.deskripsi}
                  onChange={(val) => setFormData({ ...formData, deskripsi: val })}
                  modules={modules}
                  formats={formats}
                  className="h-64 mb-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-10 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
              >
                <FiSave className="w-5 h-5" />
                {isLoading ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Simpan Tanaman")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-50 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Tanaman</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar tanaman dan cetak QR Code</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
        >
          <FiPlus className="mr-2" /> Tambah Tanaman
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tanaman.map((t) => {
          const qrUrl = `${window.location.origin}/tanaman/${t.id}`;
          return (
            <div key={t.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col group">
              {t.gambar ? (
                <div className="h-48 overflow-hidden relative border-b border-gray-100">
                  <img src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${t.gambar}`} alt={t.nama} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              ) : (
                <div className="h-48 bg-green-50 flex items-center justify-center text-green-300 font-bold border-b border-gray-100">Tanpa Foto</div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t.nama}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="font-semibold w-16">Jenis:</span> {t.jenis}
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="font-semibold w-16">Kondisi:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.kondisi === 'Sehat' || t.kondisi === 'Subur' ? 'bg-green-100 text-green-700' : t.kondisi === 'Kurang Subur' || t.kondisi === 'Layu' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {t.kondisi || 'Sehat'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <span className="font-semibold w-16">Lokasi:</span> {t.lokasi}
                </div>
                
                <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200" ref={(el) => (qrRefs.current[t.id] = el)}>
                    <QRCodeCanvas value={qrUrl} size={130} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <button onClick={() => setSelectedTanaman(t)} className="col-span-3 text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm">
                      Lihat Detail
                    </button>
                    <button onClick={() => handleEdit(t)} className="text-xs font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm">
                      Edit
                    </button>
                    <button onClick={() => downloadQR(t.id, t.nama)} className="text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm">
                      Unduh
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {tanaman.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 text-gray-400 text-2xl">🌱</div>
             <h3 className="text-lg font-bold text-gray-700 mb-1">Belum Ada Tanaman</h3>
             <p className="text-gray-500 font-medium">Klik tombol "Tambah Tanaman" untuk mulai mendaftarkan.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Tanaman */}
      {selectedTanaman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800">Detail Tanaman</h2>
              <button 
                onClick={() => setSelectedTanaman(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {selectedTanaman.gambar && (
                <div className="w-full h-64 rounded-2xl overflow-hidden mb-6 border border-gray-100">
                  <img 
                    src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedTanaman.gambar}`} 
                    alt={selectedTanaman.nama} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h3 className="text-3xl font-bold text-green-800 mb-2">{selectedTanaman.nama}</h3>
              <p className="text-gray-500 font-medium mb-6">{selectedTanaman.jenis}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 mb-1">Kondisi</span>
                  <span className={`px-2 py-1 rounded font-bold text-xs inline-block ${selectedTanaman.kondisi === 'Sehat' || selectedTanaman.kondisi === 'Subur' ? 'bg-green-100 text-green-700' : selectedTanaman.kondisi === 'Kurang Subur' || selectedTanaman.kondisi === 'Layu' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedTanaman.kondisi || 'Sehat'}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 mb-1">Lokasi</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedTanaman.lokasi}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 mb-1">Usia Tanaman</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedTanaman.usia || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 mb-1">Jadwal Siram</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedTanaman.jadwal_siram || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 mb-1">Perawat</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedTanaman.penanggung_jawab || '-'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-500 mb-1">Kebutuhan Air</span>
                  <span className="font-bold text-blue-700 text-sm">{selectedTanaman.kebutuhan_air || 'Cukup'}</span>
                </div>
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50 col-span-2">
                  <span className="block text-xs text-orange-600 mb-1">Terakhir Dipupuk</span>
                  <span className="font-bold text-orange-800 text-sm">{selectedTanaman.terakhir_dipupuk || 'Belum ada data'}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Informasi & Deskripsi</h4>
                <div 
                  className="prose prose-sm text-gray-600 max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedTanaman.deskripsi || '<p>Tidak ada deskripsi tersedia.</p>' }}
                />
              </div>
              
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedTanaman(null)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isCameraOpen && (
        <WebcamCapture 
          onCapture={(file) => {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsCameraOpen(false);
          }}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
};

export default TanamanManager;
