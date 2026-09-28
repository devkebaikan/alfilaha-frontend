import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiArrowLeft, FiSave, FiUploadCloud } from "react-icons/fi";

const WisataForm = ({ initialData, onSave, onCancel }) => {
  const [namaPaket, setNamaPaket] = useState("");
  const [harga, setHarga] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [existingGambar, setExistingGambar] = useState("");

  useEffect(() => {
    if (initialData) {
      setNamaPaket(initialData.nama_paket || "");
      setHarga(initialData.harga || "");
      setDeskripsi(initialData.deskripsi || "");
      setExistingGambar(initialData.gambar || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nama_paket", namaPaket);
    formData.append("harga", harga);
    formData.append("deskripsi", deskripsi);
    if (gambar) formData.append("gambar", gambar);

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
            {initialData ? "Edit Paket Wisata" : "Tambah Paket Wisata"}
          </h2>
          <p className="text-sm text-muted mt-1">
            Gunakan form di bawah ini untuk mengatur detail paket wisata.
          </p>
        </div>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Nama Paket <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaPaket}
                onChange={(e) => setNamaPaket(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder="Contoh: Edukasi Basic"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Harga / Rentang Harga <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium cursor-pointer"
              >
                <option value="" disabled>
                  -- Pilih Harga Paket --
                </option>
                <option value="Rp 20.000 / orang">Rp 20.000 / orang</option>
                <option value="Rp 100.000 / orang">Rp 100.000 / orang</option>
                <option value="Rp 150.000 / keluarga">
                  Rp 150.000 / keluarga
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              {initialData
                ? "Ganti Gambar (Opsional)"
                : "Upload Gambar (Opsional)"}
            </label>
            <label className="flex-1 border-2 border-dashed border-line rounded-[24px] flex flex-col items-center justify-center text-center bg-surface2 hover:bg-[#F5FAF7] dark:hover:bg-[#1E2A25] dark:bg-[#18211D] hover:border-[#16804B] transition-colors cursor-pointer group min-h-[160px]">
              <div className="w-14 h-14 bg-card rounded-full flex items-center justify-center text-[#16804B] dark:text-[#4ADE80] shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <FiUploadCloud size={24} />
              </div>
              <p className="text-ink font-bold mb-1 text-sm">
                {gambar
                  ? gambar.name
                  : initialData && existingGambar
                    ? existingGambar
                    : "Pilih Gambar Baru"}
              </p>
              <p className="text-muted text-xs">
                Maks. 2MB (Format: JPG, PNG)
              </p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setGambar(e.target.files[0])}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Fasilitas / Deskripsi <span className="text-red-500">*</span>
            </label>
            <div className="bg-card rounded-[20px] border border-line overflow-hidden focus-within:ring-2 focus-within:ring-[#16804B] focus-within:border-[#16804B] transition-all">
              <ReactQuill
                theme="snow"
                value={deskripsi}
                onChange={setDeskripsi}
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
              {initialData ? "Simpan Perubahan" : "Simpan Paket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WisataForm;
