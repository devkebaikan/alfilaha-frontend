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
  FiCheckSquare,
  FiCoffee,
  FiDroplet,
  FiShoppingBag,
  FiHeart,
  FiAlertTriangle,
  FiPlusCircle,
  FiX,
  FiPower,
  FiEyeOff,
} from "react-icons/fi";
import WebcamCapture from "../../../../Components/WebcamCapture";
import { adminFetch, getAdminHeaders } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
const fotoUrl = (nama) => (nama ? `${API}/uploads/${nama}` : null);

const ikonAksi = (nama) => {
  const n = (nama || "").toLowerCase();
  if (n.includes("pakan")) return <FiCoffee size={22} />;
  if (n.includes("minum") || n.includes("air")) return <FiDroplet size={22} />;
  if (n.includes("bersihkan") || n.includes("kandang"))
    return <FiTrash2 size={22} />;
  if (n.includes("telur")) return <FiShoppingBag size={22} />;
  if (n.includes("susu")) return <FiHeart size={22} />;
  if (n.includes("mati")) return <FiAlertTriangle size={22} />;
  return <FiPlusCircle size={22} />;
};

const warnaAksi = (nama) => {
  const n = (nama || "").toLowerCase();
  if (n.includes("pakan")) return "green";
  if (n.includes("minum") || n.includes("air")) return "blue";
  if (n.includes("bersihkan")) return "orange";
  if (n.includes("telur") || n.includes("panen")) return "amber";
  if (n.includes("susu")) return "purple";
  if (n.includes("mati")) return "red";
  return "teal";
};

const PeternakanManager = () => {
  const notif = useNotifikasi();
  const [ternakList, setTernakList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [rekapAksi, setRekapAksi] = useState([]);
  const [rekapRentang, setRekapRentang] = useState("semua");
  const [rekapLoading, setRekapLoading] = useState(false);
  const [batasForm, setBatasForm] = useState({});
  const [savingBatas, setSavingBatas] = useState(false);
  const lastBatasTernakRef = useRef(null);
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
        }
      } else {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("alfilaha_admin_token");
          window.location.replace("/admin");
          return;
        }
        setTernakList([]);
        showToast(`Gagal memuat data ternak (${res.status})`);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const allAdded = ternakList.length >= 3;

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
    setRekapRentang("semua");
    setRekapAksi([]);
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
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!editing || adding) return;
    let cancelled = false;
    setRekapLoading(true);
    adminFetch(
      `${API}/api/admin/ternak/${editing.id}/aksi-rekap?rentang=${rekapRentang}`,
      {
        cache: "no-store",
      },
    )
      .then((res) => (res.ok ? res.json() : Promise.reject({ status: res.status })))
      .then((d) => {
        if (cancelled) return;
        const aksi = d?.aksi || [];
        setRekapAksi(aksi);
        if (editing && editing.id !== lastBatasTernakRef.current) {
          lastBatasTernakRef.current = editing.id;
          setBatasForm(
            Object.fromEntries(
              aksi.map((a) => [
                a.id,
                a.batas_harian != null ? String(a.batas_harian) : "",
              ]),
            ),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setRekapAksi([]);
      })
      .finally(() => {
        if (!cancelled) setRekapLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing, adding, rekapRentang]);

  const handleSimpanBatas = async () => {
    if (!editing) return;
    const aksi = Object.entries(batasForm).map(([id, v]) => ({
      id: Number(id),
      batas_harian: String(v ?? "").trim() === "" ? null : String(v ?? "").trim(),
    }));
    setSavingBatas(true);
    try {
      const res = await adminFetch(`${API}/api/admin/ternak/${editing.id}/aksi-batas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aksi }),
      });
      const hasil = await res.json();
      showToast(
        res.ok
          ? hasil?.message || "Batas harian berhasil disimpan."
          : hasil?.error || `Gagal menyimpan (${res.status})`,
      );
      if (res.ok) {
        setRekapAksi((prev) =>
          prev.map((a) => ({
            ...a,
            batas_harian:
              String(batasForm[a.id] ?? "").trim() === ""
                ? null
                : Number(String(batasForm[a.id]).trim()),
          })),
        );
      }
    } catch (err) {
      console.error("Simpan batas gagal:", err);
      showToast("Tidak bisa terhubung ke server.");
    } finally {
      setSavingBatas(false);
    }
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
        setRekapAksi([]);
        setRekapRentang("semua");
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

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setAdding(false);
    setEditing(null);
    setRekapAksi([]);
    setRekapRentang("semua");
    setBatasForm({});
    setAksiList([]);
    setAksiModal(null);
    setHapusKonfirmasi(null);
    resetAksiModalForm();
    lastBatasTernakRef.current = null;
    resetForm();
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
    if (adding && !form.jenis_ternak.trim()) {
      showToast("Jenis ternak wajib diisi (Sapi, Ayam, atau Kambing).");
      return;
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
    if (adding) data.append("jenis_ternak", form.jenis_ternak.trim());

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
              {adding ? "Tambah Peternakan" : `Edit Ternak — ${editing?.jenis || ""}`}
            </h2>
            <p className="text-sm text-muted mt-1">
              {adding
                ? "Isi jenis, nama, lokasi, deskripsi, foto, lalu simpan ke database."
                : "Ubah nama tampilan, lokasi, foto, total, dan status publikasi."}
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {adding ? (
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Jenis Ternak <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.jenis_ternak}
                  onChange={(e) =>
                    setForm({ ...form, jenis_ternak: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium"
                  placeholder="Ketik: Sapi, Ayam, atau Kambing"
                />
                <p className="text-xs text-muted mt-1">
                  Ketik salah satu dari: Sapi, Ayam, atau Kambing (tidak peka
                  huruf besar/kecil). Setiap jenis hanya bisa ditambahkan satu
                  kali.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Jenis Ternak
                </label>
                <div className="w-full px-5 py-4 rounded-xl border border-line bg-surface2 text-ink font-medium">
                  {editing?.jenis}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-ink mb-2">
                Nama Tampilan
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
                Deskripsi
              </label>
              <textarea
                rows={4}
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="w-full px-5 py-4 rounded-xl border border-line focus:ring-2 focus:ring-green-500 outline-none transition bg-surface2 focus:bg-card text-ink font-medium resize-y"
                placeholder="Keterangan singkat tentang kandang/ternak ini (opsional)"
              />
              <p className="text-xs text-muted mt-1">
                Opsional. Akan tampil di halaman publik detail jenis ternak.
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
                  Total Ternak Saat Ini
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
                Foto Ternak
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
                {isSaving ? "Menyimpan..." : adding ? "Simpan" : "Simpan"}
              </button>
            </div>
          </form>

          {!adding && editing && (
            <>
              <div className="mt-12 pt-10 border-t border-line">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
                    <FiCheckSquare className="text-green-600 dark:text-green-300" size={22} />
                    Konfirmasi Perawatan
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Jumlah kali tiap aksi perawatan dicatat oleh santri
                    (baca-saja, terhitung dari log_perawatan_ternak).
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: "semua", label: "Semua Waktu" },
                    { val: "hari_ini", label: "Hari Ini" },
                    { val: "minggu_ini", label: "Minggu Ini" },
                    { val: "bulan_ini", label: "Bulan Ini" },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setRekapRentang(r.val)}
                      className={`px-4 py-2 text-sm rounded-full font-bold transition whitespace-nowrap ${
                        rekapRentang === r.val
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-surface2 text-muted dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.12]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {rekapLoading ? (
                <div className="py-12 text-center text-muted font-semibold">
                  Memuat rekap perawatan...
                </div>
              ) : rekapAksi.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-line rounded-2xl bg-surface2 text-muted font-medium">
                  Belum ada aksi perawatan terdaftar untuk jenis ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {rekapAksi.map((a) => {
                    const w = warnaAksi(a.nama_aksi);
                    const wIcon = {
                      green: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300",
                      blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300",
                      orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300",
                      amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
                      purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300",
                      red: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300",
                      teal: "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300",
                    }[w] || "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300";
                    return (
                      <div
                        key={a.id}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-line bg-card text-center shadow-sm"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-inner ${wIcon}`}
                        >
                          {ikonAksi(a.nama_aksi)}
                        </div>
                        <span className="font-bold text-sm text-ink text-center leading-tight">
                          {a.label}
                        </span>
                        {a.jam_penanda && (
                          <span className="text-[10px] text-muted mt-0.5">
                            {a.jam_penanda}
                          </span>
                        )}
                        <span
                          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
                            Number(a.jumlah) > 0
                              ? "bg-green-600 text-white"
                              : "bg-surface2 text-muted"
                          }`}
                        >
                          {Number(a.jumlah) || 0}×
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-muted mt-4">
                Angka dihitung langsung dari tabel log_perawatan_ternak sesuai
                rentang yang dipilih. Konfirmasi perawatan hanya dilakukan santri
                lewat alur Jadwal Aktivitas / Tugas Saya.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-line">
              <div className="mb-5">
                <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
                  <FiCheckSquare className="text-muted" size={22} />
                  Pengaturan Batas Konfirmasi Perawatan
                </h3>
                <p className="text-sm text-muted mt-1">
                  Atur batas maksimal konfirmasi per hari untuk tiap aksi.
                  Kosongkan supaya aksi tidak dibatasi. Berlaku juga sebagai
                  validasi backend — aksi tak bisa dikonfirmasi lagi setelah
                  batas hari ini tercapai.
                </p>
              </div>

              {rekapAksi.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-line rounded-2xl bg-surface2 text-muted font-medium">
                  Belum ada aksi terdaftar untuk jenis ini.
                </div>
              ) : (
                <div>
                  <div className="border border-line rounded-2xl overflow-hidden bg-card shadow-sm">
                    {rekapAksi.map((a) => {
                      const w = warnaAksi(a.nama_aksi);
                      const wIcon = {
                        green: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300",
                        blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300",
                        orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300",
                        amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300",
                        purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300",
                        red: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300",
                        teal: "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-300",
                      }[w] || "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300";
                      const nilai = batasForm[a.id] ?? "";
                      return (
                        <div
                          key={a.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-line last:border-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${wIcon}`}
                            >
                              {ikonAksi(a.nama_aksi)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-ink text-sm truncate">
                                {a.label}
                              </p>
                              <p className="text-xs text-muted">
                                {a.batas_harian != null
                                  ? `Saat ini ${a.batas_harian}× per hari`
                                  : "Tidak dibatasi"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={nilai}
                              onChange={(e) =>
                                setBatasForm({ ...batasForm, [a.id]: e.target.value })
                              }
                              placeholder="Kosong = bebas"
                              className="w-32 px-4 py-2.5 rounded-xl border border-line bg-surface2 focus:bg-card focus:ring-2 focus:ring-green-500 outline-none transition text-ink font-medium"
                            />
                            <span className="text-xs text-muted whitespace-nowrap">
                              kali/hari
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={handleSimpanBatas}
                      disabled={savingBatas}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
                    >
                      <FiSave className="w-4 h-4" />
                      {savingBatas ? "Menyimpan..." : "Simpan Batas"}
                    </button>
                    <span className="text-xs text-muted">
                      Batas dihitung ulang otomatis setiap pergantian hari
                      (berbasis tanggal hari ini).
                    </span>
                  </div>
                </div>
              )}
            </div>

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
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-line animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-line pb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">Manajemen Peternakan</h2>
          <p className="text-sm text-muted mt-1">
            Tambah, ubah, dan publikasikan koleksi ternak. Data yang
            dipublikasikan otomatis tampil di halaman publik /peternakan.
          </p>
        </div>
        {allAdded ? (
          <span className="shrink-0 text-sm font-bold text-muted bg-surface2 border border-line py-3 px-4 rounded-xl">
            Semua jenis ternak sudah ditambahkan.
          </span>
        ) : (
          <button
            onClick={handleAdd}
            className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <FiPlus size={18} /> Tambah Peternakan
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted font-semibold">
          Memuat data ternak...
        </div>
      ) : ternakList.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-line rounded-3xl bg-surface2">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-line text-muted">
            <FiImage className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-ink mb-1">
            Belum Ada Data Ternak
          </h3>
          <p className="text-muted font-medium max-w-md mx-auto mb-6">
            Database ternak masih kosong. Tambahkan peternakan pertama Anda —
            setiap jenis (Sapi, Ayam, Kambing) maksimal satu kali.
          </p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            <FiPlus size={18} /> Tambah Peternakan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ternakList.map((t) => {
            const badge = BADGE[t.status_publikasi] || BADGE.draft;
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
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-xl font-bold text-ink truncate">
                      {t.nama_tampilan || t.nama}
                    </h3>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted mb-1">
                    <span className="font-semibold w-16">Jenis:</span> {t.jenis}
                  </div>
                  <div className="flex items-center text-sm text-muted mb-1">
                    <span className="font-semibold w-16">Lokasi:</span>{" "}
                    {t.lokasi || "-"}
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-4">
                    <div className="bg-green-50 dark:bg-green-500/15 rounded-xl p-3 text-center">
                      <span className="block text-[10px] text-muted font-bold uppercase">
                        Total
                      </span>
                      <span className="block text-lg font-black text-green-700 dark:text-green-300">
                        {t.total ?? 0}
                      </span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-500/15 rounded-xl p-3 text-center">
                      <span className="block text-[10px] text-muted font-bold uppercase">
                        Mati
                      </span>
                      <span className="block text-lg font-black text-red-600 dark:text-red-300">
                        {t.total_mati ?? 0}
                      </span>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-500/15 rounded-xl p-3 text-center">
                      <span className="block text-[10px] text-muted font-bold uppercase">
                        Aksi
                      </span>
                      <span className="block text-lg font-black text-teal-700 dark:text-teal-300">
                        {t.jumlah_aksi ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="flex-1 text-sm font-bold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <FiEdit2 size={15} /> Edit
                    </button>
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
    </div>
  );
};

export default PeternakanManager;