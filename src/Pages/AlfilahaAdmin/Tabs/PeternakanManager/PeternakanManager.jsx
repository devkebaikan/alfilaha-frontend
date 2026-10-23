import { useState, useEffect, useRef } from "react";
import {
  FiArrowLeft,
  FiSave,
  FiCamera,
  FiUploadCloud,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiImage,
  FiAlertTriangle,
  FiPlusCircle,
  FiX,
  FiPower,
  FiEyeOff,
  FiDownload,
  FiGrid,
  FiSearch,
} from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";
import WebcamCapture from "../../../../Components/WebcamCapture";
import { adminFetch, getAdminHeaders } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";
import { ikonAksiUntuk } from "../../../../Shared/ikonAksi";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
const fotoUrl = (nama) => (nama ? `${API}/uploads/${nama}` : null);

const formatTanggalAwal = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Ikon & warna aksi dipilih otomatis dari nama aksi lewat registry bersama
// (src/Shared/ikonAksi.js) — sama dengan yang dipakai halaman detail ternak.
const ikonAksi = (nama) => {
  const { Icon } = ikonAksiUntuk(nama, "ternak");
  return <Icon size={22} />;
};

const warnaAksi = (nama) => ikonAksiUntuk(nama, "ternak").warna;

const PeternakanManager = () => {
  const notif = useNotifikasi();
  const [ternakList, setTernakList] = useState([]);
  const [jenisTersedia, setJenisTersedia] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const fileInputRef = useRef(null);
  const [aksiList, setAksiList] = useState([]);
  const [aksiLoading, setAksiLoading] = useState(false);
  const [aksiModal, setAksiModal] = useState(null);
  const [aksiModalForm, setAksiModalForm] = useState({
    nama_aksi: "",
    sub_aksi: "",
    butuh_input_angka: false,
    label_input: "",
    batas_harian: "",
    urutan: "",
  });
  const [aksiSaving, setAksiSaving] = useState(false);
  const [hapusKonfirmasi, setHapusKonfirmasi] = useState(null);
  const [hapusTernak, setHapusTernak] = useState(null);
  const [hapusTernakSaving, setHapusTernakSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    jenis_ternak: "",
    nama_tampilan: "",
    deskripsi: "",
    lokasi_id: "",
    lokasi_nama: "",
    total: "",
    status_publikasi: "draft",
  });

  const showToast = (msg) => {
    const gagal = /gagal|wajib diisi|harus angka|tidak bisa|error/i.test(msg || "");
    notif[gagal ? "error" : "success"](msg);
  };

  const fetchTernak = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`${API}/api/admin/ternak`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTernakList(data);
        } else {
          setTernakList(data?.ternak || []);
          setJenisTersedia(
            Array.isArray(data?.jenis) ? data.jenis : [],
          );
        }
      } else {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("alfilaha_admin_token");
          window.location.replace("/admin");
          return;
        }
        setTernakList([]);
        showToast(`Gagal memuat data object (${res.status})`);
      }
    } catch (err) {
      console.error("Fetch ternak admin gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLokasi = async () => {
    try {
      const res = await adminFetch(`${API}/api/lokasi`);
      if (res.ok) setLokasiList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAksi = async () => {
    if (!editing || adding) return;
    setAksiLoading(true);
    try {
      const res = await adminFetch(
        `${API}/api/admin/ternak/${editing.id}/aksi`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const d = await res.json();
        setAksiList(d?.aksi || []);
      } else {
        setAksiList([]);
      }
    } catch (err) {
      console.error("Fetch aksi admin gagal:", err);
      setAksiList([]);
    } finally {
      setAksiLoading(false);
    }
  };

  useEffect(() => {
    if (!editing || adding) return;
    fetchAksi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, adding]);

  useEffect(() => {
    fetchTernak();
    fetchLokasi();
  }, []);

  const resetForm = () => {
    setForm({
      jenis_ternak: "",
      nama_tampilan: "",
      deskripsi: "",
      lokasi_id: "",
      lokasi_nama: "",
      total: "",
      status_publikasi: "draft",
    });
    setGambar(null);
    setPreview(null);
    setCreatedAt(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const handleAdd = () => {
    resetForm();
    setAdding(true);
    setEditing(null);
    setIsFormOpen(true);
  };

  const handleEdit = (t) => {
    resetForm();
    setAdding(false);
    setEditing(t);
    setAksiList([]);
    setAksiModal(null);
    setHapusKonfirmasi(null);
    setForm({
      jenis_ternak: t.jenis || "",
      nama_tampilan: t.nama_tampilan || "",
      deskripsi: t.deskripsi || "",
      lokasi_id: t.lokasi_id ? String(t.lokasi_id) : "",
      lokasi_nama: "",
      total: t.total != null ? String(t.total) : "0",
      status_publikasi: t.status_publikasi || "draft",
    });
    setPreview(fotoUrl(t.foto));
    setCreatedAt(t.created_at || null);
    setIsFormOpen(true);
  };

  const resetAksiModalForm = () => {
    setAksiModalForm({
      nama_aksi: "",
      sub_aksi: "",
      butuh_input_angka: false,
      label_input: "",
      batas_harian: "",
      urutan: "",
    });
  };

  const openAksiTambah = () => {
    resetAksiModalForm();
    setAksiModal({ editing: false });
    setHapusKonfirmasi(null);
  };

  const openAksiEdit = (a) => {
    setAksiModalForm({
      nama_aksi: a.nama_aksi || "",
      sub_aksi: a.sub_aksi || "",
      butuh_input_angka: !!a.butuh_input_angka,
      label_input: a.label_input || "",
      batas_harian: a.batas_harian != null ? String(a.batas_harian) : "",
      urutan: a.urutan != null ? String(a.urutan) : "",
    });
    setAksiModal({ editing: true, aksi: a });
    setHapusKonfirmasi(null);
  };

  const tutupAksiModal = () => {
    setAksiModal(null);
    resetAksiModalForm();
  };

  const simpanAksi = async () => {
    if (!editing) return;
    const nama = aksiModalForm.nama_aksi.trim();
    if (!nama) {
      showToast("Nama aksi wajib diisi.");
      return;
    }
    const payload = {
      nama_aksi: nama,
      sub_aksi: aksiModalForm.sub_aksi || "",
      butuh_input_angka: aksiModalForm.butuh_input_angka,
      label_input: aksiModalForm.label_input.trim() || "",
      batas_harian: aksiModalForm.batas_harian.trim() || "",
      urutan: aksiModalForm.urutan.trim() || "",
    };
    setAksiSaving(true);
    try {
      const url = aksiModal?.editing
        ? `${API}/api/admin/ternak/${editing.id}/aksi/${aksiModal.aksi.id}`
        : `${API}/api/admin/ternak/${editing.id}/aksi`;
      const res = await adminFetch(url, {
        method: aksiModal?.editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const hasil = await res.json();
      showToast(
        res.ok
          ? hasil?.message || "Aksi perawatan berhasil disimpan."
          : hasil?.error || `Gagal menyimpan (${res.status})`,
      );
      if (res.ok) {
        tutupAksiModal();
        fetchAksi();
      }
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("alfilaha_admin_token");
        window.location.replace("/admin");
      }
    } catch (err) {
      console.error("Simpan aksi gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setAksiSaving(false);
    }
  };

  const toggleAksiAktif = async (a) => {
    if (!editing) return;
    setAksiSaving(true);
    try {
      const res = await adminFetch(
        `${API}/api/admin/ternak/${editing.id}/aksi/${a.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aktif: a.aktif ? 0 : 1 }),
        },
      );
      const hasil = await res.json();
      showToast(res.ok ? "Status aksi diperbarui." : hasil?.error || `Gagal (${res.status})`);
      if (res.ok) fetchAksi();
    } catch (err) {
      console.error("Ubah status aksi gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setAksiSaving(false);
    }
  };

  const mintaHapusAksi = (a) => {
    if (Number(a.jumlah_log) > 0) {
      showToast(
        `Aksi sudah punya ${a.jumlah_log} catatan riwayat — nonaktifkan saja agar riwayat tetap aman.`,
      );
      return;
    }
    setHapusKonfirmasi(a);
  };

  const confirmHapusAksi = async () => {
    if (!editing || !hapusKonfirmasi) return;
    const a = hapusKonfirmasi;
    setAksiSaving(true);
    try {
      const res = await adminFetch(
        `${API}/api/admin/ternak/${editing.id}/aksi/${a.id}`,
        { method: "DELETE" },
      );
      const hasil = await res.json();
      showToast(res.ok ? hasil?.message || "Aksi dihapus." : hasil?.error || `Gagal (${res.status})`);
      if (res.ok) {
        setHapusKonfirmasi(null);
        fetchAksi();
      }
    } catch (err) {
      console.error("Hapus aksi gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setAksiSaving(false);
    }
  };

  const mintaHapusTernak = (t) => {
    setHapusTernak(t);
  };

  const confirmHapusTernak = async () => {
    if (!hapusTernak || hapusTernakSaving) return;
    setHapusTernakSaving(true);
    try {
      const res = await adminFetch(
        `${API}/api/admin/ternak/${hapusTernak.id}`,
        { method: "DELETE" },
      );
      const hasil = await res.json();
      showToast(
        res.ok
          ? hasil?.message || "Data object dihapus."
          : hasil?.error || `Gagal (${res.status})`,
      );
      if (res.ok) {
        setHapusTernak(null);
        if (editing && editing.id === hapusTernak.id) handleCloseForm();
        fetchTernak();
      }
    } catch (err) {
      console.error("Hapus ternak gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setHapusTernakSaving(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setAdding(false);
    setEditing(null);
    setAksiList([]);
    setAksiModal(null);
    setHapusKonfirmasi(null);
    resetAksiModalForm();
    resetForm();
  };

  const downloadQR = (id, nama) => {
    const canvas = document.getElementById(`qr-canvas-${id}`);
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Object_${String(nama || "")
      .replace(/\s+/g, "_")
      .trim()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        showToast("Hanya file gambar JPG/PNG/WebP yang diperbolehkan.");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("Ukuran foto maksimal 5 MB.");
        e.target.value = "";
        return;
      }
      setGambar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setGambar(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!form.jenis_ternak.trim()) {
      showToast("Jenis object wajib diisi.");
      return;
    }
    if (!form.nama_tampilan.trim()) {
      showToast("Nama tampilan wajib diisi.");
      return;
    }
    // Duplikat sejati dicegah juga oleh backend (jenis + nama + lokasi).
    // Cek di sini biar umpan balik cepat tanpa perlu round-trip.
    if (form.jenis_ternak.trim() && form.nama_tampilan.trim()) {
      const lokasiKey = String(form.lokasi_id || "").trim();
      const kembar = ternakList.find(
        (t) =>
          (!editing || t.id !== editing.id) &&
          String(t.jenis || "").toLowerCase() ===
            form.jenis_ternak.trim().toLowerCase() &&
          String(t.nama_tampilan || "").trim().toLowerCase() ===
            form.nama_tampilan.trim().toLowerCase() &&
          String(t.lokasi_id == null ? "" : t.lokasi_id) === lokasiKey,
      );
      if (kembar) {
        showToast(
          `Data "${kembar.nama_tampilan}" (${kembar.jenis}) di lokasi yang sama sudah ada. Ubah nama tampilan atau pilih lokasi lain.`,
        );
        return;
      }
    }
    const total = parseInt(form.total, 10);
    if (!Number.isFinite(total) || total < 0) {
      showToast("Total harus berupa angka 0 atau lebih.");
      return;
    }

    setIsSaving(true);
    const data = new FormData();
    data.append("nama_tampilan", form.nama_tampilan.trim());
    data.append("deskripsi", form.deskripsi.trim());
    data.append("total", String(total));
    data.append("status_publikasi", form.status_publikasi);
    if (lokasiList.length > 0) {
      if (form.lokasi_id) data.append("lokasi_id", form.lokasi_id);
    } else if (form.lokasi_nama.trim()) {
      data.append("lokasi_nama", form.lokasi_nama.trim());
    }
    if (gambar) data.append("foto", gambar);

    const url = adding
      ? `${API}/api/admin/ternak`
      : `${API}/api/admin/ternak/${editing.id}`;
    const method = adding ? "POST" : "PUT";
    data.append("jenis_ternak", form.jenis_ternak.trim());

    try {
      const res = await adminFetch(url, {
        method,
        headers: getAdminHeaders(),
        body: data,
      });
      const hasil = await res.json();
      if (res.ok) {
        showToast(hasil?.message || "Data berhasil disimpan.");
        handleCloseForm();
        fetchTernak();
      } else {
        showToast(hasil?.error || `Gagal menyimpan (${res.status})`);
      }
    } catch (err) {
      console.error("Simpan ternak gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  const BADGE = {
    draft: {
      label: "Draft",
      cls: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    },
    dipublikasikan: {
      label: "Dipublikasikan",
      cls: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
    },
  };

  const hapusTernakModal = hapusTernak ? (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-ink mb-2">Hapus Data Object?</h3>
        <p className="text-sm text-muted">
          Data{" "}
          <strong className="text-ink">
            {hapusTernak.nama_tampilan || hapusTernak.jenis}
          </strong>{" "}
          ({hapusTernak.jenis}) akan dihapus permanen dan tidak bisa
          dikembalikan. Seluruh riwayat perawatan dan aktivitas terjadwalnya
          juga ikut terhapus.
        </p>
        <div className="flex items-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => setHapusTernak(null)}
            className="flex-1 py-3.5 px-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={confirmHapusTernak}
            disabled={hapusTernakSaving}
            className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FiTrash2 size={16} />
            {hapusTernakSaving ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

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
              {adding ? "Tambah Object" : `Edit Object — ${editing?.jenis || ""}`}
            </h2>
            <p className="text-sm text-muted mt-1">
              {adding
                ? "Isi nama, jenis, lokasi, deskripsi, foto, lalu simpan ke database."
                : "Ubah nama object, lokasi, foto, total, dan status publikasi."}
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Nama Object
              </label>
              <input
                type="text"
                value={form.nama_tampilan}
                onChange={(e) =>
                  setForm({ ...form, nama_tampilan: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder={adding ? "Misal: Sapi, Sapi Perah, Ayam Petelur" : "Misal: Sapi Perah"}
              />
              <p className="text-xs text-muted mt-1">
                Kosongkan untuk memakai nama asli jenis.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Jenis Object <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                list="daftar-jenis-ternak"
                value={form.jenis_ternak}
                onChange={(e) =>
                  setForm({ ...form, jenis_ternak: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder="Contoh: Sapi, Ayam, Kambing, Bebek, Kelinci"
              />
              <datalist id="daftar-jenis-ternak">
                {jenisTersedia.map((j) => (
                  <option key={j.id} value={j.nama}>
                    {j.kategori}
                  </option>
                ))}
              </datalist>
              <p className="text-xs text-muted mt-1">
                {adding
                  ? "Ketik bebas (tidak peka huruf besar/kecil). Jenis yang belum pernah ada akan dibuat otomatis dengan daftar aksi perawatan umum. Satu jenis boleh punya banyak data — yang tidak boleh sama persis adalah gabungan jenis + nama object + lokasi."
                  : "Ubah jenis object bila perlu. Mengetik jenis yang belum ada akan membuat jenis baru beserta aksi perawatan umum, lalu data ini dipindahkan ke jenis tersebut."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Tanggal Awal
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={formatTanggalAwal(adding ? new Date() : createdAt)}
                className="w-full px-5 py-4 rounded-xl border border-line bg-surface2 text-muted font-medium cursor-not-allowed"
              />
              <p className="text-xs text-muted mt-1.5">
                Terisi otomatis sesuai tanggal object ditambahkan.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Deskripsi
              </label>
              <textarea
                rows={4}
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium resize-y"
                placeholder="Keterangan singkat tentang object ini (opsional)"
              />
              <p className="text-xs text-muted mt-1">
                Opsional. Akan tampil di halaman publik detail jenis object.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Lokasi / Kandang
                </label>
                {lokasiList.length > 0 ? (
                  <select
                    value={form.lokasi_id}
                    onChange={(e) =>
                      setForm({ ...form, lokasi_id: e.target.value })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                  >
                    <option value="">Pilih Lokasi...</option>
                    {lokasiList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nama}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.lokasi_nama}
                    onChange={(e) =>
                      setForm({ ...form, lokasi_nama: e.target.value })
                    }
                    className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                    placeholder="Nama kandang/lokasi, misal: Kandang Sapi Barat"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Total Object Saat Ini
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.total}
                  onChange={(e) =>
                    setForm({ ...form, total: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Status Publikasi
              </label>
              <div className="inline-flex rounded-xl border border-line bg-surface2 p-1 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, status_publikasi: "draft" })
                  }
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition ${
                    form.status_publikasi === "draft"
                      ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shadow-sm"
                      : "text-muted hover:bg-card"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, status_publikasi: "dipublikasikan" })
                  }
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition ${
                    form.status_publikasi === "dipublikasikan"
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-muted hover:bg-card"
                  }`}
                >
                  Dipublikasikan
                </button>
              </div>
              <p className="text-xs text-muted mt-2">
                Draft = tidak muncul di halaman publik /peternakan.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Foto Object
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
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </label>
                  {preview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="py-3 px-4 bg-red-50 dark:bg-red-500/15 hover:bg-red-100 dark:hover:bg-red-500/20 dark:bg-red-500/20 text-red-500 hover:text-red-700 dark:text-red-300 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                    >
                      <FiTrash2 size={18} /> Hapus
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted">
                  Format JPG/PNG/WebP, maksimum 5 MB. "Hapus" hanya menghapus
                  pilihan di form, file lama tetap tersimpan di server.
                </p>
              </div>
              {preview ? (
                <div className="mt-4">
                  <p className="text-xs text-muted mb-2">Preview Gambar:</p>
                  <div className="relative h-48 w-full max-w-sm rounded-xl overflow-hidden border border-line shadow-inner">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 h-48 w-full max-w-sm rounded-xl border border-dashed border-line bg-surface2 flex flex-col items-center justify-center gap-2 text-muted">
                  <FiImage className="w-8 h-8" />
                  <span className="text-xs font-semibold">Belum ada foto</span>
                </div>
              )}
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
                disabled={isSaving}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
              >
                <FiSave className="w-5 h-5" />
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
              {!adding && editing && (
                <button
                  type="button"
                  onClick={() => mintaHapusTernak(editing)}
                  className="ml-auto px-6 py-4 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 font-bold rounded-xl transition flex items-center gap-2"
                >
                  <FiTrash2 className="w-5 h-5" />
                  Hapus
                </button>
              )}
            </div>
          </form>

          {!adding && editing && (
            <>
            <div className="mt-10 pt-8 border-t border-line">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
                    <FiPlusCircle className="text-green-600 dark:text-green-300" size={22} />
                    Kelola Aksi Perawatan
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Tentukan daftar aksi yang bisa dikonfirmasi santri di halaman
                    publik (beri pakan, beri minum, kebersihan, dll.). Aksi yang
                    dinonaktifkan tidak muncul di publik namun riwayatnya tetap
                    tersimpan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAksiTambah}
                  className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                >
                  <FiPlus size={16} /> Tambah Aksi
                </button>
              </div>

              {aksiLoading ? (
                <div className="py-12 text-center text-muted font-semibold">
                  Memuat daftar aksi...
                </div>
              ) : aksiList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-line rounded-2xl bg-surface2 text-muted font-medium">
                  Belum ada aksi perawatan. Klik "Tambah Aksi" untuk membuat
                  daftar aksi pertama (mis. Beri Pakan Pagi, Beri Minum/Air).
                </div>
              ) : (
                <div className="border border-line rounded-2xl overflow-hidden shadow-sm">
                  {aksiList.map((a) => {
                    const w = warnaAksi(a.nama_aksi);
                    const wIcon = {
                      green: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300",
                      blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300",
                      orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300",
                      amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
                      purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300",
                      red: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300",
                      teal: "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300",
                      lime: "bg-lime-100 dark:bg-lime-500/20 text-lime-600 dark:text-lime-300",
                    }[w] || "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300";
                    return (
                      <div
                        key={a.id}
                        className={`flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-line last:border-0 ${a.aktif ? "" : "bg-surface2/60 opacity-80"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${wIcon}`}>
                            {ikonAksi(a.nama_aksi)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-ink text-sm truncate">{a.label}</p>
                              {!a.aktif && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-100 dark:bg-white/[0.08] text-muted border border-line px-2 py-0.5 rounded-full">
                                  <FiEyeOff size={11} /> Nonaktif
                                </span>
                              )}
                              {a.butuh_input_angka && (
                                <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 dark:border-red-500/30 px-2 py-0.5 rounded-full">
                                  Butuh jumlah
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mt-1">
                              {a.jam_penanda && <span>{a.jam_penanda}</span>}
                              <span>
                                {a.batas_harian != null
                                  ? `Batas ${a.batas_harian}×/hari`
                                  : "Tanpa batas"}
                              </span>
                              {Number(a.jumlah_log) > 0 && (
                                <span className="font-bold text-ink">
                                  {a.jumlah_log}× tercatat
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleAksiAktif(a)}
                            disabled={aksiSaving}
                            title={a.aktif ? "Nonaktifkan" : "Aktifkan"}
                            className={`p-2.5 rounded-xl border transition text-sm font-bold shadow-sm ${a.aktif ? "bg-green-50 dark:bg-green-500/15 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-100" : "bg-surface2 border-line text-muted hover:bg-gray-200 dark:hover:bg-white/[0.12]"}`}
                          >
                            <FiPower size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openAksiEdit(a)}
                            className="p-2.5 rounded-xl border border-line bg-surface2 text-muted hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition text-sm font-bold"
                            title="Edit aksi"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => mintaHapusAksi(a)}
                            disabled={aksiSaving}
                            className="p-2.5 rounded-xl border border-line bg-surface2 text-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition text-sm font-bold"
                            title="Hapus aksi"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>
          )}
        </div>

        {aksiModal && (
          <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-card rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-ink">
                    {aksiModal.editing ? "Edit Aksi Perawatan" : "Tambah Aksi Perawatan"}
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    {aksiModal.editing
                      ? `Mengubah: ${aksiModal.aksi.label}`
                      : "Aksi baru akan tampil di halaman publik setelah disimpan."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={tutupAksiModal}
                  className="p-2 bg-surface2 hover:bg-gray-200 dark:hover:bg-white/[0.12] text-muted rounded-xl transition"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Nama Aksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={aksiModalForm.nama_aksi}
                    onChange={(e) =>
                      setAksiModalForm({ ...aksiModalForm, nama_aksi: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                    placeholder="Misal: Beri Pakan Pagi, Beri Minum/Air"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-2">
                    Sub-aksi / Waktu (opsional)
                  </label>
                  <input
                    type="text"
                    list="subaksi-list"
                    value={aksiModalForm.sub_aksi}
                    onChange={(e) =>
                      setAksiModalForm({ ...aksiModalForm, sub_aksi: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                    placeholder="Pagi / Siang / Sore / Malam, atau kosongkan"
                  />
                  <datalist id="subaksi-list">
                    <option value="Pagi" />
                    <option value="Siang" />
                    <option value="Sore" />
                    <option value="Malam" />
                  </datalist>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-line bg-surface2 px-4 py-3">
                  <div>
                    <p className="font-bold text-ink text-sm">Butuh input jumlah</p>
                    <p className="text-xs text-muted">
                      Muncul kolom jumlah ekor saat konfirmasi (mis. Ayam mati).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAksiModalForm({
                        ...aksiModalForm,
                        butuh_input_angka: !aksiModalForm.butuh_input_angka,
                      })
                    }
                    className={`w-12 h-7 rounded-full transition relative ${aksiModalForm.butuh_input_angka ? "bg-red-500" : "bg-gray-300 dark:bg-white/[0.15]"}`}
                  >
                    <span
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${aksiModalForm.butuh_input_angka ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                </div>

                {aksiModalForm.butuh_input_angka && (
                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Label input jumlah (opsional)
                    </label>
                    <input
                      type="text"
                      value={aksiModalForm.label_input}
                      onChange={(e) =>
                        setAksiModalForm({ ...aksiModalForm, label_input: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                      placeholder="Misal: Jumlah ekor yang mati"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Batas harian (opsional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={aksiModalForm.batas_harian}
                      onChange={(e) =>
                        setAksiModalForm({ ...aksiModalForm, batas_harian: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                      placeholder="Kosong = bebas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Urutan tampil (opsional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={aksiModalForm.urutan}
                      onChange={(e) =>
                        setAksiModalForm({ ...aksiModalForm, urutan: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                      placeholder="Otomatis di akhir"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-8 mt-8 border-t border-line">
                <button
                  type="button"
                  onClick={tutupAksiModal}
                  className="flex-1 py-3.5 px-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={simpanAksi}
                  disabled={aksiSaving}
                  className="flex-1 py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSave size={16} />
                  {aksiSaving ? "Menyimpan..." : aksiModal.editing ? "Simpan" : "Tambah"}
                </button>
              </div>
            </div>
          </div>
        )}

        {hapusKonfirmasi && (
          <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Hapus Aksi?</h3>
              <p className="text-sm text-muted">
                Aksi <strong className="text-ink">{hapusKonfirmasi.label}</strong>{" "}
                akan dihapus permanen. Aksi ini belum punya riwayat tercatat,
                jadi aman dihapus.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setHapusKonfirmasi(null)}
                  className="flex-1 py-3.5 px-4 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmHapusAksi}
                  disabled={aksiSaving}
                  className="flex-1 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiTrash2 size={16} />
                  {aksiSaving ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
        {hapusTernakModal}
      </div>
    );
  }

  const filteredTernak = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ternakList;
    return ternakList.filter((t) =>
      [t.nama, t.nama_tampilan, t.jenis, t.lokasi]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  })();

  return (
    <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-line animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-line pb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">Manajemen Object</h2>
          <p className="text-sm text-muted mt-1">
            Kelola daftar object dan cetak QR Code
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FiPlus size={18} /> Tambah Object
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <FiSearch className="pointer-events-none absolute inset-y-0 left-4 my-auto text-muted w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama, jenis, atau lokasi..."
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-red-500 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted font-semibold">
          Memuat data object...
        </div>
      ) : ternakList.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-line rounded-3xl bg-surface2">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-line text-muted">
            <FiImage className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-1">
            Belum Ada Data Object
          </h3>
          <p className="text-muted font-medium max-w-md mx-auto mb-6">
            Database object masih kosong. Tambahkan object pertama
            Anda — jenis boleh apa saja, misalnya Sapi, Ayam, Bebek, atau
            Kelinci.
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            <FiPlus size={18} /> Tambah Object
          </button>
        </div>
      ) : filteredTernak.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-line rounded-3xl bg-surface2">
          <FiSearch className="w-10 h-10 mx-auto mb-4 text-muted" />
          <h3 className="text-lg font-bold text-ink mb-1">
            Object Tidak Ditemukan
          </h3>
          <p className="text-muted font-medium max-w-md mx-auto">
            Tidak ada data yang cocok dengan "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTernak.map((t) => {
            const badge = BADGE[t.status_publikasi] || BADGE.draft;
            // QR hanya berlaku untuk livestock yang sudah dipublikasikan;
            // endpoint publik menolak draft dengan 404.
            const isDraft = t.status_publikasi !== "dipublikasikan";
            return (
              <div
                key={t.id}
                className="border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-card flex flex-col group"
              >
                {t.foto ? (
                  <div className="h-48 overflow-hidden relative border-b border-line">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={fotoUrl(t.foto)}
                      alt={t.nama_tampilan || t.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-50 to-green-50 dark:from-surface2 dark:to-surface2 flex items-center justify-center text-muted border-b border-line">
                    <FiImage className="w-12 h-12" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-ink mb-2">
                    {t.nama_tampilan || t.nama}
                  </h3>
                  <div className="flex items-center text-sm text-muted mb-2">
                    <span className="font-semibold w-28 shrink-0">Jenis:</span>{" "}
                    {t.jenis}
                  </div>
                  <div className="flex items-center text-sm text-muted mb-2">
                    <span className="font-semibold w-28 shrink-0">
                      Tanggal Awal:
                    </span>{" "}
                    <span className="font-bold text-ink">
                      {formatTanggalAwal(t.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted mb-6">
                    <span className="font-semibold w-28 shrink-0">Lokasi:</span>{" "}
                    {t.lokasi || "-"}
                  </div>

                  <div className="mt-auto bg-surface2 p-4 rounded-xl border border-line flex flex-col items-center gap-4">
                    {isDraft ? (
                      <div className="w-full flex flex-col items-center gap-2 py-4 px-3 text-center">
                        <FiAlertTriangle
                          size={30}
                          className="text-amber-500"
                        />
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          QR belum aktif
                        </p>
                        <p className="text-[11px] text-muted leading-relaxed">
                          Publikasikan dulu object ini, QR akan otomatis bisa
                          dipakai.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-card rounded-xl shadow-sm border border-line">
                        <QRCodeCanvas
                          id={`qr-canvas-${t.id}`}
                          value={`${window.location.origin}/peternakan/${t.id}`}
                          size={130}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 w-full">
                      <button
                        onClick={() => handleEdit(t)}
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
                        onClick={() =>
                          downloadQR(t.id, t.nama_tampilan || t.nama)
                        }
                        className="text-xs font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                        disabled={isDraft}
                      >
                        Unduh
                      </button>
                      <button
                        onClick={() => mintaHapusTernak(t)}
                        title="Hapus data object"
                        className="text-xs font-bold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCameraOpen && (
        <WebcamCapture
          onCapture={(file) => {
            setGambar(file);
            setPreview(URL.createObjectURL(file));
            setIsCameraOpen(false);
          }}
          onCancel={() => setIsCameraOpen(false)}
        />
      )}
      {hapusTernakModal}
    </div>
  );
};

export default PeternakanManager;