import { useState, useEffect, useRef, useMemo } from "react";
import {
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiSave,
  FiCamera,
  FiUploadCloud,
  FiSearch,
  FiX,
  FiImage,
  FiCalendar,
  FiClipboard,
  FiDownload,
  FiAlertTriangle,
} from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";
import WebcamCapture from "../../../../Components/WebcamCapture";
import { adminFetch } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
const fotoUrl = (nama) => (nama ? `${API}/uploads/${nama}` : null);

// Rentang tahun ajaran siap pilih (mis. 2024/2025 s/d 2035/2036).
const TAHUN_MULAI = 2024;
const TAHUN_AKHIR = 2035;
const daftarTahunBawaan = Array.from(
  { length: TAHUN_AKHIR - TAHUN_MULAI + 1 },
  (_, i) => {
    const mulai = TAHUN_MULAI + i;
    return `${mulai}/${mulai + 1}`;
  },
);

const JENIS_AKTIVITAS = [
  {
    value: "fgd",
    label: "FGD",
    chip: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
    dot: "bg-blue-500",
  },
  {
    value: "kunjungan",
    label: "Kunjungan",
    chip: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  {
    value: "klasikal",
    label: "Klasikal",
    chip: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
    dot: "bg-green-500",
  },
];
const INFO_JENIS = Object.fromEntries(JENIS_AKTIVITAS.map((j) => [j.value, j]));

const BADGE_STATUS = {
  draft: {
    label: "Draft",
    cls: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  },
  dipublikasikan: {
    label: "Dipublikasikan",
    cls: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
  },
};

// Nilai tanggal API (JSON) & Date objek dikembalikan menjadi "YYYY-MM-DD"
// memakai komponen lokal, supaya tidak bergeser hari karena zona waktu.
const tanggalInput = (value) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const tanggalPanjang = (value) => {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Deskripsi boleh berisi HTML (editor) atau teks biasa.
const teksDeskripsi = (html) =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const KelasManager = () => {
  const notif = useNotifikasi();
  const [kelasList, setKelasList] = useState([]);
  const [aktivitasList, setAktivitasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tahunList, setTahunList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);

  // Form kelas (tambah / edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    tahun_ajaran: "",
    wali_kelas: "",
    deskripsi: "",
    jumlah_santri: "",
    status: "draft",
    lokasi_id: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const fileInputRef = useRef(null);
  const qrRefs = useRef({});

  // Modal aktivitas per kelas
  const [modalKelas, setModalKelas] = useState(null);
  const [showFormAktivitas, setShowFormAktivitas] = useState(false);
  const [editingAktivitasId, setEditingAktivitasId] = useState(null);
  const [formAktivitas, setFormAktivitas] = useState({
    jenis: "fgd",
    tanggal: tanggalInput(new Date()),
    judul: "",
    catatan: "",
  });
  const [fotoAktivitasFile, setFotoAktivitasFile] = useState(null);
  const [fotoAktivitasPreview, setFotoAktivitasPreview] = useState(null);
  const [aktivitasSaving, setAktivitasSaving] = useState(false);
  const inputFotoAktivitasRef = useRef(null);
  const [modalSantri, setModalSantri] = useState(null);
  const [santriTerdaftar, setSantriTerdaftar] = useState([]);
  const [santriTersedia, setSantriTersedia] = useState([]);
  const [selectedSantri, setSelectedSantri] = useState("");

  const showToast = (msg) => {
    const gagal = /gagal|wajib diisi|tidak valid|tidak ditemukan|ditolak/i.test(
      msg || "",
    );
    notif[gagal ? "error" : "success"](msg);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`${API}/api/admin/kelas`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setKelasList(Array.isArray(data) ? data : data?.kelas || []);
        setAktivitasList(
          Array.isArray(data?.aktivitas) ? data.aktivitas : [],
        );
      } else {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("alfilaha_admin_token");
          window.location.replace("/admin");
          return;
        }
        showToast(`Gagal memuat data kelas (${res.status})`);
      }
    } catch (err) {
      console.error("Fetch kelas admin gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuruTahun = async () => {
    try {
      const rt = await adminFetch(`${API}/api/admin/tahun-ajaran`);
      if (rt.ok) setTahunList(await rt.json());
    } catch (e) {}
  };

  const fetchLokasi = async () => {
    try {
      const rl = await fetch(`${API}/api/lokasi`);
      if (rl.ok) {
        const data = await rl.json();
        setLokasiList(Array.isArray(data) ? data : []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
    fetchGuruTahun();
    fetchLokasi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({
      nama: "",
      tahun_ajaran: "",
      wali_kelas: "",
      deskripsi: "",
      jumlah_santri: "",
      status: "draft",
      lokasi_id: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setCreatedAt(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdd = () => {
    resetForm();
    setEditingId(null);
    fetchGuruTahun();
    fetchLokasi();
    setIsFormOpen(true);
  };

  const handleEdit = async (k) => {
    resetForm();
    setEditingId(k.id);
    fetchGuruTahun();
    fetchLokasi();
    setFormData({
      nama: k.nama || "",
      tahun_ajaran: k.tahun_ajaran || "",
      wali_kelas: k.wali_kelas || "",
      deskripsi: k.deskripsi || "",
      jumlah_santri: k.jumlah_santri === undefined || k.jumlah_santri === null ? "" : String(k.jumlah_santri),
      status: k.status === "dipublikasikan" ? "dipublikasikan" : "draft",
      lokasi_id: k.lokasi_id ? String(k.lokasi_id) : "",
    });
    setCreatedAt(k.created_at || null);
    if (k.foto) setImagePreview(fotoUrl(k.foto));
    else setImagePreview(null);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();
    data.append("nama", formData.nama);
    data.append("tahun_ajaran", formData.tahun_ajaran);
    data.append("wali_kelas", formData.wali_kelas);
    data.append("deskripsi", formData.deskripsi);
    data.append("jumlah_santri", formData.jumlah_santri || "0");
    data.append("status", formData.status);
    if (formData.lokasi_id) data.append("lokasi_id", formData.lokasi_id);
    const lokasiTerpilih = lokasiList.find(
      (l) => String(l.id) === String(formData.lokasi_id),
    );
    if (lokasiTerpilih) data.append("nama_lokasi", lokasiTerpilih.nama);
    if (imageFile) data.append("foto", imageFile);

    try {
      // Simpan tahun ajaran ke master data bila belum ada (agar tersimpan permanen).
      if (formData.tahun_ajaran && !tahunList.some((t) => t.tahun === formData.tahun_ajaran)) {
        try {
          await adminFetch(`${API}/api/admin/tahun-ajaran`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tahun: formData.tahun_ajaran }),
          });
        } catch (e) {}
      }

      const url = editingId
        ? `${API}/api/admin/kelas/${editingId}`
        : `${API}/api/admin/kelas`;
      const res = await adminFetch(url, {
        method: editingId ? "PUT" : "POST",
        body: data,
      });
      if (res.ok) {
        await fetchData();
        handleCloseForm();
        showToast(
          `Kelas "${formData.nama}" berhasil ${
            editingId ? "diperbarui" : "ditambahkan"
          }.`,
        );
      } else {
        const pesan = await res.json().catch(() => ({}));
        showToast(pesan.error || `Gagal ${editingId ? "memperbarui" : "menambahkan"} kelas.`);
      }
    } catch (err) {
      console.error(err);
      showToast("Koneksi ke server gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (k) => {
    const konfirmasi = window.confirm(
      `Yakin ingin menghapus kelas "${k.nama}"?\nSemua riwayat aktivitas pada kelas ini juga akan ikut terhapus.`,
    );
    if (!konfirmasi) return;
    try {
      const res = await adminFetch(`${API}/api/admin/kelas/${k.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
        showToast("Kelas berhasil dihapus.");
      } else {
        const pesan = await res.json().catch(() => ({}));
        showToast(pesan.error || "Gagal menghapus kelas.");
      }
    } catch (err) {
      console.error(err);
      showToast("Koneksi ke server gagal.");
    }
  };

  // ── QR Code: unduh PNG & cetak ────────────────────────────────────────────
  const qrCanvas = (id) => qrRefs.current[id]?.querySelector("canvas");

  const downloadQR = (k) => {
    const originalCanvas = qrCanvas(k.id);
    if (!originalCanvas) return;

    const scale = 5;
    const padding = 40;
    const qrSize = originalCanvas.width * scale;
    const totalSize = qrSize + padding * 2;

    const canvas = document.createElement("canvas");
    canvas.width = totalSize;
    canvas.height = totalSize + 60;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(originalCanvas, padding, padding, qrSize, qrSize);

    ctx.fillStyle = "#166534";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(k.nama, canvas.width / 2, canvas.height - 32);
    if (k.tahun_ajaran) {
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#4b5563";
      ctx.fillText(k.tahun_ajaran, canvas.width / 2, canvas.height - 12);
    }

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${String(k.nama).replace(/\s+/g, "_")}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast("QR Code berhasil diunduh.");
  };

  // ── Aktivitas kelas ───────────────────────────────────────────────────────
  const aktivitasKelas = (kelasId) =>
    aktivitasList.filter((a) => Number(a.kelas_id) === Number(kelasId));

  const tutupModalAktivitas = () => {
    setModalKelas(null);
    setShowFormAktivitas(false);
    setEditingAktivitasId(null);
  };

  const tambahAktivitas = () => {
    setEditingAktivitasId(null);
    setFormAktivitas({
      jenis: "fgd",
      tanggal: tanggalInput(new Date()),
      judul: "",
      catatan: "",
    });
    setFotoAktivitasFile(null);
    setFotoAktivitasPreview(null);
    if (inputFotoAktivitasRef.current) inputFotoAktivitasRef.current.value = "";
    setShowFormAktivitas(true);
  };

  const editAktivitas = (a) => {
    setEditingAktivitasId(a.id);
    setFormAktivitas({
      jenis: a.jenis || "fgd",
      tanggal: tanggalInput(a.tanggal),
      judul: a.judul || "",
      catatan: a.catatan || "",
    });
    setFotoAktivitasFile(null);
    setFotoAktivitasPreview(a.foto ? fotoUrl(a.foto) : null);
    if (inputFotoAktivitasRef.current) inputFotoAktivitasRef.current.value = "";
    setShowFormAktivitas(true);
  };

  const submitAktivitas = async (e) => {
    e.preventDefault();
    if (!modalKelas) return;
    setAktivitasSaving(true);

    const data = new FormData();
    data.append("jenis", formAktivitas.jenis);
    data.append("tanggal", formAktivitas.tanggal);
    data.append("judul", formAktivitas.judul);
    data.append("catatan", formAktivitas.catatan);
    if (fotoAktivitasFile) data.append("foto", fotoAktivitasFile);

    try {
      const url = editingAktivitasId
        ? `${API}/api/admin/aktivitas-kelas/${editingAktivitasId}`
        : `${API}/api/admin/kelas/${modalKelas.id}/aktivitas`;
      const res = await adminFetch(url, {
        method: editingAktivitasId ? "PUT" : "POST",
        body: data,
      });
      if (res.ok) {
        await fetchData();
        setShowFormAktivitas(false);
        setEditingAktivitasId(null);
        setFotoAktivitasFile(null);
        setFotoAktivitasPreview(null);
        if (inputFotoAktivitasRef.current) inputFotoAktivitasRef.current.value = "";
        showToast(
          editingAktivitasId
            ? "Aktivitas berhasil diperbarui."
            : "Aktivitas berhasil ditambahkan.",
        );
      } else {
        const pesan = await res.json().catch(() => ({}));
        showToast(pesan.error || "Gagal menyimpan aktivitas.");
      }
    } catch (err) {
      console.error(err);
      showToast("Koneksi ke server gagal.");
    } finally {
      setAktivitasSaving(false);
    }
  };

  const hapusAktivitas = async (a) => {
    const konfirmasi = window.confirm(
      `Yakin ingin menghapus aktivitas "${a.judul}"?`,
    );
    if (!konfirmasi) return;
    try {
      const res = await adminFetch(
        `${API}/api/admin/aktivitas-kelas/${a.id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        await fetchData();
        showToast("Aktivitas berhasil dihapus.");
      } else {
        const pesan = await res.json().catch(() => ({}));
        showToast(pesan.error || "Gagal menghapus aktivitas.");
      }
    } catch (err) {
      console.error(err);
      showToast("Koneksi ke server gagal.");
    }
  };


  const bukaModalSantri = async (k) => {
    setModalSantri(k);
    await loadPenempatan(k.id);
  };
  const loadPenempatan = async (kelasId) => {
    try {
      const [r1, r2] = await Promise.all([
        adminFetch(`${API}/api/pendidikan/penempatan/${kelasId}`),
        adminFetch(`${API}/api/pendidikan/santri-tersedia/${kelasId}`),
      ]);
      if (r1.ok) setSantriTerdaftar(await r1.json());
      if (r2.ok) setSantriTersedia(await r2.json());
    } catch (e) {}
  };
  const tambahSantri = async () => {
    if (!modalSantri || !selectedSantri) return;
    try {
      const res = await adminFetch(`${API}/api/pendidikan/penempatan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelas_id: modalSantri.id, santri_id: selectedSantri, tahun_ajaran: modalSantri.tahun_ajaran }),
      });
      if (res.ok) {
        setSelectedSantri("");
        await loadPenempatan(modalSantri.id);
        await fetchData();
        showToast("Santri ditambahkan");
      }
    } catch (e) {}
  };
  const hapusSantri = async (id) => {
    try {
      const res = await adminFetch(`${API}/api/pendidikan/penempatan/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadPenempatan(modalSantri.id);
        await fetchData();
        showToast("Santri dihapus");
      }
    } catch (e) {}
  };

  const filteredKelas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return kelasList;
    return kelasList.filter((k) =>
      [k.nama, k.tahun_ajaran, k.wali_kelas, k.status, k.nama_lokasi]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [kelasList, searchQuery]);

  // Gabungan tahun dari DB + rentang bawaan, urut menurun, unik.
  const opsiTahun = useMemo(() => {
    const dariDb = (tahunList || [])
      .map((t) => String(t.tahun || "").trim())
      .filter(Boolean);
    const unik = Array.from(new Set([...dariDb, ...daftarTahunBawaan]));
    return unik.sort((a, b) => b.localeCompare(a));
  }, [tahunList]);

  // ── FORM TAMBAH / EDIT KELAS ─────────────────────────────────────────────
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
              {editingId ? "Edit Kelas" : "Tambah Kelas"}
            </h2>
            <p className="text-sm text-muted mt-1">
              {editingId
                ? "Ubah informasi kelas di bawah ini."
                : "Isi data kelas; status \"Dipublikasikan\" membuat kelas tampil di halaman publik."}
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Nama Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                placeholder="Misal: Kelas 7A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Tahun Ajaran
                </label>
                <select
                  required
                  value={formData.tahun_ajaran}
                  onChange={(e) =>
                    setFormData({ ...formData, tahun_ajaran: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                >
                  <option value="">-- Pilih Tahun Ajaran --</option>
                  {opsiTahun.map((t) => (
                    <option key={t} value={t}>
                      {t}
                      {tahunList.find((x) => x.tahun === t)?.aktif
                        ? " (Aktif)"
                        : ""}
                    </option>
                  ))}
                </select>

              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Wali Kelas
                </label>
                <input
                  type="text"
                  value={formData.wali_kelas}
                  onChange={(e) =>
                    setFormData({ ...formData, wali_kelas: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                  placeholder="Tulis nama wali kelas (boleh manual)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Lokasi
                </label>
                <select
                  value={formData.lokasi_id}
                  onChange={(e) =>
                    setFormData({ ...formData, lokasi_id: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                >
                  <option value="">-- Pilih Lokasi --</option>
                  {lokasiList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nama}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted mt-1.5">
                  Pilih dari menu Lokasi &amp; Area. Tambah lokasi baru di menu
                  tersebut.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Jumlah Santri
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.jumlah_santri}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah_santri: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                  placeholder="Misal: 24"
                />
                <p className="text-xs text-muted mt-1.5">
                  Isi 0 bila jumlah ingin dihitung otomatis dari data santri.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Status Publikasi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                >
                  <option value="draft">Draft (belum tampil publik)</option>
                  <option value="dipublikasikan">Dipublikasikan</option>
                </select>
                <p className="text-xs text-muted mt-1.5">
                  Hanya kelas berstatus dipublikasikan yang muncul di halaman
                  /kelas.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Foto Kelas
              </label>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex-1 cursor-pointer bg-green-50 dark:bg-green-500/15 hover:bg-green-100 dark:hover:bg-green-500/20 text-green-700 dark:text-green-300 py-3 px-4 rounded-xl border border-green-200 dark:border-green-500/30 text-center font-bold transition flex items-center justify-center gap-2 text-sm"
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
                    <img
                      loading="lazy"
                      decoding="async"
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>


            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Deskripsi Kelas
              </label>
              <textarea
                rows={5}
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium resize-y"
                placeholder="Keterangan singkat tentang kelas ini (opsional)"
              />
              <p className="text-xs text-muted mt-1">
                Akan tampil di halaman detail kelas publik.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-line">
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
                {isSaving
                  ? "Menyimpan..."
                  : editingId
                    ? "Simpan Perubahan"
                    : "Simpan Kelas"}
              </button>
            </div>
          </form>
        </div>

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
  }

  // ── DAFTAR KELAS ─────────────────────────────────────────────────────────
  return (
    <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-line animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-line pb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">Manajemen Kelas</h2>
          <p className="text-sm text-muted mt-1">
            Kelola data kelas, aktivitas kelas, dan QR Code
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FiPlus size={18} /> Tambah Kelas
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <FiSearch className="pointer-events-none absolute inset-y-0 left-4 my-auto text-muted w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama kelas, tahun ajaran, atau wali kelas..."
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
          Memuat data kelas...
        </div>
      ) : kelasList.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-line rounded-3xl bg-surface2">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-line text-muted">
            <FiClipboard className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-1">
            Belum Ada Data Kelas
          </h3>
          <p className="text-muted font-medium max-w-md mx-auto mb-6">
            Database kelas masih kosong. Tambahkan kelas pertama Anda.
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            <FiPlus size={18} /> Tambah Kelas
          </button>
        </div>
      ) : filteredKelas.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-line rounded-3xl bg-surface2">
          <FiSearch className="w-10 h-10 mx-auto mb-4 text-muted" />
          <h3 className="text-lg font-bold text-ink mb-1">
            Kelas Tidak Ditemukan
          </h3>
          <p className="text-muted font-medium max-w-md mx-auto">
            Tidak ada data yang cocok dengan "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredKelas.map((k) => {
            const badge = BADGE_STATUS[k.status] || BADGE_STATUS.draft;
            const qrAktif = k.status === "dipublikasikan";
            return (
              <div
                key={k.id}
                className="border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-card flex flex-col group"
              >
                {k.foto ? (
                  <div className="h-48 overflow-hidden relative border-b border-line">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={fotoUrl(k.foto)}
                      alt={k.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-sm bg-white/90 dark:bg-black/60 ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                ) : (
                  <div className="h-48 relative bg-gradient-to-br from-gray-50 to-green-50 dark:from-surface2 dark:to-surface2 flex items-center justify-center text-muted border-b border-line">
                    <FiImage className="w-12 h-12" />
                    <span
                      className={`absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full border ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-ink mb-2">{k.nama}</h3>
                  <div className="flex items-center text-sm text-muted mb-2">
                    <span className="font-semibold w-32 shrink-0">
                      Tahun Ajaran:
                    </span>{" "}
                    {k.tahun_ajaran || "-"}
                  </div>
                  <div className="flex items-center text-sm text-muted mb-2">
                    <span className="font-semibold w-32 shrink-0">
                      Wali Kelas:
                    </span>{" "}
                    {k.wali_kelas || "-"}
                  </div>
                  <div className="flex items-center text-sm text-muted mb-2">
                    <span className="font-semibold w-32 shrink-0">
                      Lokasi:
                    </span>{" "}
                    {k.nama_lokasi || "-"}
                  </div>
                  <div className="flex items-center text-sm text-muted mb-6">
                    <span className="font-semibold w-32 shrink-0">
                      Jumlah Santri:
                    </span>{" "}
                    <span className="font-bold text-ink">
                      {(k.jumlah_santri ?? 0)} santri
                    </span>
                  </div>

                  <div className="mt-auto bg-surface2 p-4 rounded-xl border border-line flex flex-col items-center gap-4">
                    <div
                      className="p-3 bg-card rounded-xl shadow-sm border border-line"
                      ref={(el) => (qrRefs.current[k.id] = el)}
                    >
                      <QRCodeCanvas
                        value={`${window.location.origin}/kelas/${k.id}`}
                        size={130}
                      />
                    </div>
                    {!qrAktif && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold text-center flex items-center gap-1.5">
                        <FiAlertTriangle size={13} /> QR baru bisa dipindai
                        setelah kelas dipublikasikan.
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() =>
                          window.open(`/kelas/${k.id}`, "_blank", "noopener")
                        }
                        className="col-span-2 text-sm font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                      >
                        Lihat Halaman Publik
                      </button>
                      <button
                        onClick={() => handleEdit(k)}
                        className="text-xs font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => downloadQR(k)}
                        className="text-xs font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-200 py-2.5 rounded-lg flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <FiDownload size={13} /> Unduh QR
                      </button>
                      <button
                        onClick={() => handleDelete(k)}
                        title="Hapus data kelas"
                        className="col-span-2 text-xs font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 py-2.5 rounded-lg flex items-center justify-center transition shadow-sm"
                      >
                        <FiTrash2 size={13} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Aktivitas Kelas ─────────────────────────────────────────── */}
      {modalKelas && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-3xl max-h-[90vh] rounded-3xl border border-line shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-line flex items-start justify-between gap-4 bg-surface2">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-widest text-green-600">
                  Riwayat Aktivitas Kelas
                </p>
                <h3 className="text-xl font-bold text-ink truncate">
                  {modalKelas.nama}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {JENIS_AKTIVITAS.map((j) => {
                    const jumlah = aktivitasKelas(modalKelas.id).filter(
                      (a) => a.jenis === j.value,
                    ).length;
                    return (
                      <span
                        key={j.value}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${j.chip}`}
                      >
                        {j.label}: {jumlah}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={tutupModalAktivitas}
                className="p-2 rounded-xl bg-card border border-line text-muted hover:text-red-500 transition shrink-0"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {showFormAktivitas ? (
                <form onSubmit={submitAktivitas} className="space-y-5">
                  <div className="flex items-center gap-2 text-ink font-bold">
                    <FiArrowLeft size={16} />
                    {editingAktivitasId ? "Edit Aktivitas" : "Tambah Aktivitas"}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-ink mb-2">
                        Jenis <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formAktivitas.jenis}
                        onChange={(e) =>
                          setFormAktivitas({
                            ...formAktivitas,
                            jenis: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                      >
                        {JENIS_AKTIVITAS.map((j) => (
                          <option key={j.value} value={j.value}>
                            {j.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ink mb-2">
                        Tanggal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formAktivitas.tanggal}
                        onChange={(e) =>
                          setFormAktivitas({
                            ...formAktivitas,
                            tanggal: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3.5 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Judul <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formAktivitas.judul}
                      onChange={(e) =>
                        setFormAktivitas({
                          ...formAktivitas,
                          judul: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                      placeholder="Misal: Diskusi kelompok materi tahfidz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Catatan
                    </label>
                    <textarea
                      rows={4}
                      value={formAktivitas.catatan}
                      onChange={(e) =>
                        setFormAktivitas({
                          ...formAktivitas,
                          catatan: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium resize-y"
                      placeholder="Catatan kegiatan (opsional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Foto Aktivitas (Opsional)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="flex-1 cursor-pointer bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 py-3 px-4 rounded-xl border border-blue-200 dark:border-blue-500/30 text-center font-bold transition flex items-center justify-center gap-2 text-sm">
                        <FiUploadCloud size={18} /> Pilih Foto
                        <input
                          type="file"
                          accept="image/*"
                          ref={inputFotoAktivitasRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setFotoAktivitasFile(file);
                            setFotoAktivitasPreview(URL.createObjectURL(file));
                          }}
                          className="hidden"
                        />
                      </label>
                      {fotoAktivitasPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setFotoAktivitasFile(null);
                            setFotoAktivitasPreview(null);
                            if (inputFotoAktivitasRef.current)
                              inputFotoAktivitasRef.current.value = "";
                          }}
                          className="py-3 px-4 bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-300 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                        >
                          <FiTrash2 size={18} /> Hapus Foto
                        </button>
                      )}
                    </div>
                    {fotoAktivitasPreview && (
                      <div className="mt-3 relative h-44 w-full max-w-sm rounded-xl overflow-hidden border border-line shadow-inner">
                        <img
                          loading="lazy"
                          decoding="async"
                          src={fotoAktivitasPreview}
                          alt="Preview Aktivitas"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-line">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFormAktivitas(false);
                        setEditingAktivitasId(null);
                      }}
                      className="px-5 py-3 bg-surface2 hover:bg-gray-200 dark:hover:bg-white/[0.12] text-ink font-bold rounded-xl transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={aktivitasSaving}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiSave size={17} />
                      {aktivitasSaving
                        ? "Menyimpan..."
                        : editingAktivitasId
                          ? "Simpan Perubahan"
                          : "Simpan Aktivitas"}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <button
                    onClick={tambahAktivitas}
                    className="w-full mb-5 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-xl shadow-md transition"
                  >
                    <FiPlus size={18} /> Tambah Aktivitas
                  </button>

                  {aktivitasKelas(modalKelas.id).length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-line rounded-2xl bg-surface2">
                      <FiCalendar className="w-9 h-9 mx-auto mb-3 text-muted" />
                      <p className="text-muted font-semibold">
                        Belum ada aktivitas untuk kelas ini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aktivitasKelas(modalKelas.id).map((a) => {
                        const info = INFO_JENIS[a.jenis] || {
                          label: a.jenis,
                          chip: "",
                        };
                        return (
                          <div
                            key={a.id}
                            className="border border-line rounded-xl p-4 bg-surface2 flex gap-4"
                          >
                            {a.foto ? (
                              <img
                                loading="lazy"
                                decoding="async"
                                src={fotoUrl(a.foto)}
                                alt={a.judul}
                                className="w-20 h-20 rounded-lg object-cover border border-line shrink-0"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg border border-dashed border-line flex items-center justify-center text-muted shrink-0">
                                <FiImage size={18} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${info.chip}`}
                                    >
                                      {info.label}
                                    </span>
                                    <span className="text-xs text-muted font-semibold">
                                      {tanggalPanjang(a.tanggal)}
                                    </span>
                                  </div>
                                  <p className="font-bold text-ink mt-1 truncate">
                                    {a.judul}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => editAktivitas(a)}
                                    className="text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 py-1.5 px-3 rounded-lg transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => hapusAktivitas(a)}
                                    className="text-xs font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-200 py-1.5 px-3 rounded-lg transition"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                              {a.catatan && (
                                <p className="text-sm text-muted mt-2 whitespace-pre-line">
                                  {a.catatan}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {modalSantri && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-3xl border border-line shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-line flex justify-between items-center">
              <h3 className="text-xl font-bold text-ink">Penempatan Santri - {modalSantri.nama}</h3>
              <button onClick={() => setModalSantri(null)} className="p-2 rounded-xl bg-card border border-line text-muted">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <select className="flex-1 px-4 py-3 border border-line rounded-xl" value={selectedSantri} onChange={(e) => setSelectedSantri(e.target.value)}>
                  <option value="">-- Pilih Santri --</option>
                  {santriTersedia.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama_lengkap}</option>
                  ))}
                </select>
                <button onClick={tambahSantri} className="px-5 py-3 bg-green-600 text-white rounded-xl font-bold">Tambah</button>
              </div>
              <div className="border border-line rounded-xl overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-surface2">
                    <tr><th className="px-4 py-2 text-left">Nama</th><th className="px-4 py-2 text-right">Aksi</th></tr>
                  </thead>
                  <tbody>
                    {santriTerdaftar.map((st) => (
                      <tr key={st.id} className="border-t border-line">
                        <td className="px-4 py-2">{st.nama_lengkap}</td>
                        <td className="px-4 py-2 text-right"><button onClick={() => hapusSantri(st.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">Hapus</button></td>
                      </tr>
                    ))}
                    {santriTerdaftar.length === 0 && <tr><td colSpan="2" className="px-4 py-3 text-center text-muted">Belum ada santri</td></tr>}
                  </tbody>
                </table>
              </div>
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

export default KelasManager;