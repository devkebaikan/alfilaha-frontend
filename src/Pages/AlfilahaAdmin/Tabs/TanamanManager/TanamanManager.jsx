import { useState, useEffect, useRef, useMemo } from "react";
import {
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiSave,
  FiCamera,
  FiUploadCloud,
} from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import WebcamCapture from "../../../../Components/WebcamCapture";
import { adminFetch } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";

const TanamanManager = () => {
  const notif = useNotifikasi();
  const [tanaman, setTanaman] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "",
    lokasi: "",
    lokasi_id: "",
    deskripsi: "",
    kondisi: "Sehat",
    usia: "",
    jadwal_siram: "",
    jadwal_pupuk: "",
    jadwal_panen: "",
    nama_kelompok: "",
    anggota_kelompok: "",
    kebutuhan_air: "Cukup",
    terakhir_dipupuk: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const qrRefs = useRef({});
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  const existingGroups = useMemo(() => {
    const groups = new Set();
    tanaman.forEach((t) => {
      if (t.penanggung_jawab && t.penanggung_jawab.trim() !== "") {
        const parts = t.penanggung_jawab.split(" - ");
        if (parts[0]) groups.add(parts[0].trim());
      }
    });
    return Array.from(groups);
  }, [tanaman]);

  const fetchTanaman = async () => {
    try {
      const res = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman`,
      );
      if (res.ok) setTanaman(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLokasi = async () => {
    try {
      const res = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/lokasi`,
      );
      if (res.ok) setLokasiList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTanaman();
    fetchLokasi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append("nama", formData.nama);
    data.append("jenis", formData.jenis);
    data.append("lokasi", formData.lokasi);
    if (formData.lokasi_id) data.append("lokasi_id", formData.lokasi_id);
    data.append("deskripsi", formData.deskripsi);
    data.append("kondisi", formData.kondisi);
    data.append("usia", formData.usia);
    data.append("jadwal_siram", formData.jadwal_siram);

    let combinedPJ = formData.nama_kelompok.trim();
    if (formData.anggota_kelompok.trim()) {
      combinedPJ = combinedPJ
        ? `${combinedPJ} - ${formData.anggota_kelompok.trim()}`
        : formData.anggota_kelompok.trim();
    }
    data.append("penanggung_jawab", combinedPJ);

    data.append("kebutuhan_air", formData.kebutuhan_air);
    data.append("terakhir_dipupuk", formData.terakhir_dipupuk);
    data.append("jadwal_pupuk", formData.jadwal_pupuk);
    data.append("jadwal_panen", formData.jadwal_panen);
    if (imageFile) data.append("gambar", imageFile);

    try {
      const url = editingId
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${editingId}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman`;

      const res = await adminFetch(url, {
        method: editingId ? "PUT" : "POST",
        body: data,
      });
      if (res.ok) {
        fetchTanaman();
        handleCloseForm();
        notif.success(
          `Tanaman "${formData.nama || editingId}" berhasil ${editingId ? "diperbarui" : "ditambahkan"}!`,
        );
      } else {
        notif.error(
          `Gagal ${editingId ? "memperbarui" : "menambahkan"} tanaman.`,
        );
      }
    } catch (err) {
      console.error(err);
      notif.error("Koneksi ke server gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      nama: "",
      jenis: "",
      lokasi: "",
      lokasi_id: "",
      deskripsi: "",
      kondisi: "Sehat",
      usia: "",
      jadwal_siram: "",
      jadwal_pupuk: "",
      jadwal_panen: "",
      nama_kelompok: "",
      anggota_kelompok: "",
      kebutuhan_air: "Cukup",
      terakhir_dipupuk: "",
    });
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (t) => {
    setEditingId(t.id);

    let nk = "";
    let ak = "";
    if (t.penanggung_jawab) {
      const parts = t.penanggung_jawab.split(" - ");
      nk = parts[0] || "";
      if (parts.length > 1) {
        ak = parts.slice(1).join(" - ");
      }
    }

    setFormData({
      nama: t.nama || "",
      jenis: t.jenis || "",
      lokasi: t.lokasi || "",
      lokasi_id: t.lokasi_id ? String(t.lokasi_id) : "",
      deskripsi: t.deskripsi || "",
      kondisi: t.kondisi || "Sehat",
      usia: t.usia || "",
      jadwal_siram: t.jadwal_siram || "",
      jadwal_pupuk: t.jadwal_pupuk || "",
      jadwal_panen: t.jadwal_panen || "",
      nama_kelompok: nk,
      anggota_kelompok: ak,
      kebutuhan_air: t.kebutuhan_air || "Cukup",
      terakhir_dipupuk: t.terakhir_dipupuk || "",
    });
    setImageFile(null);
    if (t.gambar) {
      setImagePreview(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${t.gambar}`,
      );
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
      const res = await adminFetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/tanaman/${id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Server menolak penghapusan");
      fetchTanaman();
      notif.success("Tanaman berhasil dihapus!");
    } catch (err) {
      console.error(err);
      notif.error("Gagal menghapus tanaman.");
    }
  };

  const downloadQR = (id, nama) => {
    const originalCanvas = qrRefs.current[id]?.querySelector("canvas");
    if (!originalCanvas) return;

    // Skala 5x (sekitar 350px) + bingkai putih agar terlihat rapi
    const scale = 5;
    const padding = 40;
    const qrSize = originalCanvas.width * scale;
    const totalSize = qrSize + padding * 2;

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

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
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
    [],
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
  ];

  if (isFormOpen) {
    return (
      <div className="bg-card rounded-[2rem] shadow-sm border border-line overflow-hidden animate-fade-in-up">
        <div className="p-8 border-b border-line flex items-center gap-4 bg-card">
          <button
            onClick={handleCloseForm}
            className="p-2 bg-surface2 hover:bg-surface2 text-muted rounded-xl transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-ink">
              {editingId ? "Edit Tanaman" : "Tambah Tanaman Baru"}
            </h2>
            <p className="text-sm text-muted mt-1">
              {editingId
                ? "Ubah informasi tanaman di bawah ini."
                : "Gunakan form di bawah untuk mendaftarkan tanaman dan menghasilkan QR Code otomatis."}
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Nama Tanaman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder="Misal: Pohon Jati"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Jenis
              </label>
              <input
                type="text"
                value={formData.jenis}
                onChange={(e) =>
                  setFormData({ ...formData, jenis: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder="Misal: Tanaman Hias / Kayu"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.lokasi_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const lokasi = lokasiList.find((l) => String(l.id) === id);
                  setFormData({
                    ...formData,
                    lokasi_id: id,
                    lokasi: lokasi ? lokasi.nama : "",
                  });
                }}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
              >
                <option value="">Pilih Lokasi...</option>
                {lokasiList.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Kondisi Tanaman
                </label>
                <select
                  value={formData.kondisi}
                  onChange={(e) =>
                    setFormData({ ...formData, kondisi: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                >
                  <option value="Sehat">Sehat</option>
                  <option value="Subur">Subur</option>
                  <option value="Kurang Subur">Kurang Subur</option>
                  <option value="Layu">Layu</option>
                  <option value="Kering">Kering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Usia Tanaman
                </label>
                <input
                  type="text"
                  value={formData.usia}
                  onChange={(e) =>
                    setFormData({ ...formData, usia: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                  placeholder="Misal: 6 Bulan"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Jadwal Siram
                </label>
                <select
                  value={formData.jadwal_siram}
                  onChange={(e) =>
                    setFormData({ ...formData, jadwal_siram: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
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
                <label className="block text-sm font-bold text-ink mb-2">
                  Jadwal Pupuk
                </label>
                <select
                  value={formData.jadwal_pupuk}
                  onChange={(e) =>
                    setFormData({ ...formData, jadwal_pupuk: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
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
                <label className="block text-sm font-bold text-ink mb-2">
                  Jadwal Panen
                </label>
                <select
                  value={formData.jadwal_panen}
                  onChange={(e) =>
                    setFormData({ ...formData, jadwal_panen: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
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
                <label className="block text-sm font-bold text-ink mb-2">
                  Kebutuhan Air
                </label>
                <select
                  value={formData.kebutuhan_air}
                  onChange={(e) =>
                    setFormData({ ...formData, kebutuhan_air: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                >
                  <option value="Cukup">Cukup</option>
                  <option value="Banyak">Banyak (Basah)</option>
                  <option value="Sedikit">Sedikit (Kering)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Terakhir Dipupuk
                </label>
                <input
                  type="text"
                  value={formData.terakhir_dipupuk}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      terakhir_dipupuk: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                  placeholder="Misal: 2 hari lalu"
                />
              </div>
            </div>

            <div className="bg-gray-50/80 dark:bg-surface2 p-6 sm:p-8 rounded-2xl border border-line">
              <h4 className="text-sm font-extrabold text-green-800 mb-6 border-b border-line pb-3 uppercase tracking-wider">
                Informasi Perawat / Penanggung Jawab
              </h4>
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Nama Kelompok Perawat
                  </label>
                  <input
                    type="text"
                    list="daftar-kelompok"
                    value={formData.nama_kelompok}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_kelompok: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-card text-ink font-medium shadow-sm"
                    placeholder="Misal: Kelompok Melati"
                  />
                  <datalist id="daftar-kelompok">
                    {existingGroups.map((group, idx) => (
                      <option key={idx} value={group} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Nama-nama Anggota Kelompok
                  </label>
                  <input
                    type="text"
                    value={formData.anggota_kelompok}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anggota_kelompok: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-card text-ink font-medium shadow-sm"
                    placeholder="Misal: Ali, Budi, Citra"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Upload Foto Tanaman
              </label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 cursor-pointer bg-green-50 dark:bg-green-500/15 hover:bg-green-100 dark:hover:bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 py-3 px-4 rounded-xl border border-green-200 dark:border-green-500/30 text-center font-bold transition flex items-center justify-center gap-2 text-sm"
                  >
                    <FiCamera size={18} /> Ambil Foto (Kamera)
                  </button>
                  <label className="flex-1 cursor-pointer bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 dark:hover:bg-blue-500/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 py-3 px-4 rounded-xl border border-blue-200 dark:border-blue-500/30 text-center font-bold transition flex items-center justify-center gap-2 text-sm">
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
                      className="py-3 px-4 bg-red-50 dark:bg-red-500/15 hover:bg-red-100 dark:hover:bg-red-500/20 dark:bg-red-500/20 text-red-500 hover:text-red-700 dark:text-red-300 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <FiTrash2 size={18} /> Hapus
                    </button>
                  )}
                </div>
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-xs text-muted mb-2">Preview Gambar:</p>
                  <div className="relative h-48 w-full max-w-sm rounded-xl overflow-hidden border border-line shadow-inner">
                    <img loading="lazy" decoding="async"
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pb-12">
              <label className="block text-sm font-bold text-ink mb-2">
                Deskripsi / Info Detail Tanaman
              </label>
              <div className="bg-card rounded-xl border border-line overflow-hidden">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.deskripsi}
                  onChange={(val) =>
                    setFormData({ ...formData, deskripsi: val })
                  }
                  modules={modules}
                  formats={formats}
                  className="h-64 mb-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-10 border-t border-line">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
              >
                <FiSave className="w-5 h-5" />
                {isLoading
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Simpan Tanaman"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-line animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-line pb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">
            Manajemen Tanaman
          </h2>
          <p className="text-sm text-muted mt-1">
            Kelola daftar tanaman dan cetak QR Code
          </p>
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
            <div
              key={t.id}
              className="border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-card flex flex-col group"
            >
              {t.gambar ? (
                <div className="h-48 overflow-hidden relative border-b border-line">
                  <img loading="lazy" decoding="async"
                    src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${t.gambar}`}
                    alt={t.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ) : (
                <div className="h-48 bg-green-50 dark:bg-green-500/15 flex items-center justify-center text-green-300 font-bold border-b border-line">
                  Tanpa Foto
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-ink mb-2">
                  {t.nama}
                </h3>
                <div className="flex items-center text-sm text-muted mb-2">
                  <span className="font-semibold w-16">Jenis:</span> {t.jenis}
                </div>
                <div className="flex items-center text-sm text-muted mb-2">
                  <span className="font-semibold w-16">Kondisi:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.kondisi === "Sehat" || t.kondisi === "Subur" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300" : t.kondisi === "Kurang Subur" || t.kondisi === "Layu" ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"}`}
                  >
                    {t.kondisi || "Sehat"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted mb-6">
                  <span className="font-semibold w-16">Lokasi:</span> {t.lokasi}
                </div>

                <div className="mt-auto bg-surface2 p-4 rounded-xl border border-line flex flex-col items-center gap-4">
                  <div
                    className="p-3 bg-card rounded-xl shadow-sm border border-line"
                    ref={(el) => (qrRefs.current[t.id] = el)}
                  >
                    <QRCodeCanvas value={qrUrl} size={130} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <button
                      onClick={() => setSelectedTanaman(t)}
                      className="col-span-3 text-sm font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                    >
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-xs font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => downloadQR(t.id, t.nama)}
                      className="text-xs font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                    >
                      Unduh
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs font-bold bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 dark:bg-red-500/20 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {tanaman.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-line rounded-3xl bg-surface2">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-line text-muted text-2xl">
              🌱
            </div>
            <h3 className="text-lg font-bold text-ink mb-1">
              Belum Ada Tanaman
            </h3>
            <p className="text-muted font-medium">
              Klik tombol "Tambah Tanaman" untuk mulai mendaftarkan.
            </p>
          </div>
        )}
      </div>

      {/* Modal Detail Tanaman */}
      {selectedTanaman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-white/95 dark:bg-[#212A26]/95 backdrop-blur-sm border-b border-line p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-ink">
                Detail Tanaman
              </h2>
              <button
                onClick={() => setSelectedTanaman(null)}
                className="p-2 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-muted rounded-full transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {selectedTanaman.gambar && (
                <div className="w-full h-64 rounded-2xl overflow-hidden mb-6 border border-line">
                  <img loading="lazy" decoding="async"
                    src={`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/uploads/${selectedTanaman.gambar}`}
                    alt={selectedTanaman.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="text-3xl font-bold text-green-800 mb-2">
                {selectedTanaman.nama}
              </h3>
              <p className="text-muted font-medium mb-6">
                {selectedTanaman.jenis}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <span className="block text-xs text-muted mb-1">
                    Kondisi
                  </span>
                  <span
                    className={`px-2 py-1 rounded font-bold text-xs inline-block ${selectedTanaman.kondisi === "Sehat" || selectedTanaman.kondisi === "Subur" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300" : selectedTanaman.kondisi === "Kurang Subur" || selectedTanaman.kondisi === "Layu" ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"}`}
                  >
                    {selectedTanaman.kondisi || "Sehat"}
                  </span>
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <span className="block text-xs text-muted mb-1">
                    Lokasi
                  </span>
                  <span className="font-bold text-ink text-sm">
                    {selectedTanaman.lokasi}
                  </span>
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <span className="block text-xs text-muted mb-1">
                    Usia Tanaman
                  </span>
                  <span className="font-bold text-ink text-sm">
                    {selectedTanaman.usia || "-"}
                  </span>
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <span className="block text-xs text-muted mb-1">
                    Jadwal Siram
                  </span>
                  <span className="font-bold text-ink text-sm">
                    {selectedTanaman.jadwal_siram || "-"}
                  </span>
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line flex flex-col justify-center">
                  <span className="block text-xs text-muted mb-1">
                    Perawat
                  </span>
                  {(() => {
                    const pj = selectedTanaman.penanggung_jawab || "-";
                    const parts = pj.split(" - ");
                    return (
                      <div className="flex flex-col">
                        <span className="font-bold text-ink text-sm leading-tight">
                          {parts[0]}
                        </span>
                        {parts.length > 1 && (
                          <span className="text-xs font-medium text-muted mt-1 leading-snug">
                            {parts.slice(1).join(" - ")}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-surface2 p-4 rounded-xl border border-line">
                  <span className="block text-xs text-muted mb-1">
                    Kebutuhan Air
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                    {selectedTanaman.kebutuhan_air || "Cukup"}
                  </span>
                </div>
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50 col-span-2">
                  <span className="block text-xs text-orange-600 dark:text-orange-300 mb-1">
                    Terakhir Dipupuk
                  </span>
                  <span className="font-bold text-orange-800 text-sm">
                    {selectedTanaman.terakhir_dipupuk || "Belum ada data"}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-ink mb-3 border-b border-line pb-2">
                  Informasi & Deskripsi
                </h4>
                <div
                  className="prose prose-sm text-muted max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedTanaman.deskripsi ||
                      "<p>Tidak ada deskripsi tersedia.</p>",
                  }}
                />
              </div>
            </div>
            <div className="p-6 border-t border-line bg-surface2 flex justify-end">
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
