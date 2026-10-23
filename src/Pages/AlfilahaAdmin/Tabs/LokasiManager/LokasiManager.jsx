import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";
import { adminFetch } from "../../../../adminAuth";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiMap,
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiGrid,
  FiCalendar,
} from "react-icons/fi";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

const serverError = async (response) => {
  let snippet = "";
  try {
    const text = await response.text();
    const obj = JSON.parse(text);
    snippet = obj.error || obj.message || text;
  } catch {
    snippet = "";
  }
  snippet = String(snippet || "").slice(0, 200);
  return `Server menjawab ${response.status}${snippet ? `: ${snippet}` : ""}`;
};

const LokasiManager = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // list, detail, form
  const [lokasiList, setLokasiList] = useState([]);
  const [selectedLokasi, setSelectedLokasi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const notif = useNotifikasi();

  // Form state
  const [formData, setFormData] = useState({
    nama: "",
    keterangan: "",
    kegiatan: [],
  });
  const [kegiatanInput, setKegiatanInput] = useState("");

  // Kegiatan form state
  const [kegiatanForm, setKegiatanForm] = useState({ nama: "" });
  const [showKegiatanForm, setShowKegiatanForm] = useState(false);

  // Fetch lokasi list
  const fetchLokasi = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminFetch(`${API}/api/lokasi`);
      if (!response.ok) throw new Error(await serverError(response));
      const data = await response.json();
      setLokasiList(data);
    } catch (err) {
      notif.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detail lokasi (kegiatan diambil dari endpoint khusus kegiatan)
  const fetchLokasiDetail = async (id) => {
    setLoading(true);
    setError("");
    try {
      const [detailRes, kegiatanRes] = await Promise.all([
        adminFetch(`${API}/api/lokasi/${id}`),
        adminFetch(`${API}/api/lokasi/${id}/kegiatan`),
      ]);
      if (!detailRes.ok) throw new Error(await serverError(detailRes));
      if (!kegiatanRes.ok) throw new Error(await serverError(kegiatanRes));
      const detail = await detailRes.json();
      const kegiatan = await kegiatanRes.json();
      setSelectedLokasi({ ...detail, kegiatan: Array.isArray(kegiatan) ? kegiatan : [] });
      setView("detail");
    } catch (err) {
      notif.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create/Update lokasi
  const saveLokasi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = selectedLokasi
        ? `${API}/api/lokasi/${selectedLokasi.id}`
        : `${API}/api/lokasi`;
      const method = selectedLokasi ? "PUT" : "POST";

      const response = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.nama,
        }),
      });

      if (!response.ok) {
        throw new Error(await serverError(response));
      }

      notif.success(
        selectedLokasi
          ? "Lokasi berhasil diperbarui"
          : "Lokasi berhasil ditambahkan",
      );
      setFormData({ nama: "", keterangan: "", kegiatan: [] });
      setSelectedLokasi(null);
      setView("list");
      fetchLokasi();
    } catch (err) {
      notif.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete lokasi
  const deleteLokasi = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) return;

    setLoading(true);
    setError("");
    try {
      const response = await adminFetch(`${API}/api/lokasi/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await serverError(response));
      }

      notif.success("Lokasi berhasil dihapus");
      fetchLokasi();
    } catch (err) {
      notif.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create kegiatan lokasi
  const addKegiatan = async (e) => {
    e.preventDefault();
    if (!kegiatanForm.nama.trim()) return;

    setLoading(true);
    setError("");
    try {
      const response = await adminFetch(`${API}/api/kegiatan-lokasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lokasi_id: selectedLokasi.id,
          nama: kegiatanForm.nama.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await serverError(response));
      }

      notif.success("Kegiatan berhasil ditambahkan");
      setKegiatanForm({ nama: "" });
      setShowKegiatanForm(false);
      fetchLokasiDetail(selectedLokasi.id);
    } catch (err) {
      notif.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete kegiatan lokasi
  const deleteKegiatan = async (kegiatanId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) return;

    setLoading(true);
    setError("");
    try {
      const response = await adminFetch(`${API}/api/kegiatan-lokasi/${kegiatanId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(await serverError(response));

      notif.success("Kegiatan berhasil dihapus");
      fetchLokasiDetail(selectedLokasi.id);
    } catch (err) {
      notif.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLokasi();
  }, []);

  // Reset form when opening form view
  const openForm = async (lokasi = null) => {
    setView("form");
    setError("");
    setKegiatanInput("");
    if (lokasi) {
      setSelectedLokasi(lokasi);
      // Form disederhanakan: hanya nama lokasi. Kegiatan dikelola di detail view.
      setFormData({ nama: lokasi.nama, keterangan: "", kegiatan: [] });
    } else {
      setSelectedLokasi(null);
      setFormData({ nama: "", keterangan: "", kegiatan: [] });
    }
  };

  // Tambah chip kegiatan pada form lokasi
  const addKegiatanChip = () => {
    const nama = kegiatanInput.trim().replace(/\s+/g, " ");
    if (!nama) return;
    if (formData.kegiatan.some((k) => k.toLowerCase() === nama.toLowerCase())) {
      setError("Kegiatan ini sudah ada dalam daftar");
      return;
    }
    setFormData({ ...formData, kegiatan: [...formData.kegiatan, nama] });
    setKegiatanInput("");
    setError("");
  };

  // Hapus chip kegiatan pada form lokasi
  const removeKegiatanChip = (nama) => {
    setFormData({
      ...formData,
      kegiatan: formData.kegiatan.filter((k) => k !== nama),
    });
  };

  // Pecah keterangan (data lama, mis. "panen, pupuk, menyiram") menjadi chip kegiatan.
  // Hanya ditawarkan ketika belum ada kegiatan & keterangan dipisah koma.
  const pecahKeteranganJadiKegiatan = (keterangan) => {
    return keterangan
      .split(",")
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter(
        (v, i, arr) =>
          arr.findIndex((q) => q.toLowerCase() === v.toLowerCase()) === i,
      );
  };
  const sugestiKegiatanLama =
    view === "form" &&
    !!selectedLokasi &&
    (formData.kegiatan || []).length === 0 &&
    !!formData.keterangan &&
    formData.keterangan.includes(",") &&
    pecahKeteranganJadiKegiatan(formData.keterangan).length >= 2;
  const daftarSugestiLama = sugestiKegiatanLama
    ? pecahKeteranganJadiKegiatan(formData.keterangan)
    : [];

  const jadikanKegiatan = () => {
    setFormData({ ...formData, kegiatan: daftarSugestiLama });
    setError("");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        {view !== "list" && (
          <button
            onClick={() => {
              setView("list");
              setSelectedLokasi(null);
              setError("");
            }}
            className="flex items-center gap-2 text-muted hover:text-green-600 dark:text-green-300 font-bold mb-4 transition-colors"
          >
            <FiArrowLeft size={18} />
            Kembali ke Daftar Lokasi
          </button>
        )}
        <h1 className="text-2xl font-black text-ink">
          {view === "list" && "Manajemen Lokasi & Area"}
          {view === "form" &&
            (selectedLokasi ? "Edit Lokasi" : "Tambah Lokasi Baru")}
          {view === "detail" && `Detail: ${selectedLokasi?.nama}`}
        </h1>
        <p className="text-sm text-muted mt-1">
          {view === "list" &&
            "Kelola lokasi, kegiatan per lokasi, dan area dalam pondok"}
          {view === "form" &&
            "Atur informasi lokasi dan area untuk kegiatan santri"}
          {view === "detail" &&
            "Lihat detail lengkap lokasi beserta kegiatan dan aktivitas"}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
          <FiAlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Terjadi kesalahan</p>
            <p className="mt-0.5 text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0 max-w-[16rem]">
              <FiSearch
                className="pointer-events-none absolute inset-y-0 left-3 my-auto text-muted"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari lokasi..."
                className="w-full pl-10 pr-4 py-2.5 bg-card border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base"
              />
            </div>
            <button
              onClick={() => openForm()}
              className="flex-shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-sm shadow-green-200 whitespace-nowrap"
            >
              <FiPlus size={18} />
              Lokasi
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : lokasiList.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-line">
              <FiMap size={48} className="mx-auto text-muted mb-4" />
              <p className="text-muted font-medium">
                Belum ada lokasi yang ditambahkan
              </p>
              <button
                onClick={() => openForm()}
                className="mt-4 text-green-600 dark:text-green-300 font-bold hover:text-green-700 dark:text-green-300"
              >
                Tambah lokasi pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lokasiList.map((lokasi) => (
                <div
                  key={lokasi.id}
                  className="bg-card rounded-2xl border border-line p-5 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <FiMap size={24} className="text-green-600 dark:text-green-300" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openForm(lokasi);
                        }}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/15 dark:bg-blue-500/15 rounded-lg text-blue-600 dark:text-blue-300 transition-colors"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLokasi(lokasi.id);
                        }}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-500/15 dark:bg-red-500/15 rounded-lg text-red-600 dark:text-red-300 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-ink text-lg mb-1">
                    {lokasi.nama}
                  </h3>
                  {lokasi.keterangan && (
                    <p className="text-sm text-muted line-clamp-2 mb-3">
                      {lokasi.keterangan}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300 text-xs font-bold">
                      <FiCheckCircle size={13} />
                      {lokasi.jumlah_kegiatan ?? 0} kegiatan
                    </span>
                  </div>
                  <button
                    onClick={() => fetchLokasiDetail(lokasi.id)}
                    className="w-full py-2 bg-green-50 dark:bg-green-500/15 hover:bg-green-100 dark:hover:bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-bold rounded-xl transition-colors text-sm"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM VIEW */}
      {view === "form" && (
        <div className="bg-card rounded-2xl border border-line p-6 max-w-2xl">
          <form onSubmit={saveLokasi} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-1.5">
                Nama Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="contoh: Kebun 1, Asrama A, Masjid Utama"
                className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base"
              />
              <p className="text-xs text-muted mt-1">
                Lokasi cukup pakai nama. Kegiatan di lokasi dikelola dari tampilan
                detail setelah lokasi dibuat.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={18} />
                    {selectedLokasi ? "Simpan Perubahan" : "Tambah Lokasi"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-6 py-3 border-2 border-line rounded-xl font-bold text-muted hover:bg-surface2 transition"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL VIEW */}
      {view === "detail" && selectedLokasi && (
        <div className="space-y-6">
          {/* Lokasi Info */}
          <div className="bg-card rounded-2xl border border-line p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <FiMap size={32} className="text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-ink">
                  {selectedLokasi.nama}
                </h2>
                {selectedLokasi.keterangan && (
                  <p className="text-muted mt-1">
                    {selectedLokasi.keterangan}
                  </p>
                )}
              </div>
              <button
                onClick={() => openForm(selectedLokasi)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 dark:hover:bg-blue-500/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold rounded-xl transition"
              >
                <FiEdit2 size={16} />
                Edit
              </button>
            </div>
          </div>

          {/* Kegiatan di Lokasi */}
          <div className="bg-card rounded-2xl border border-line p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <FiGrid size={20} className="text-green-600 dark:text-green-300" />
                Kegiatan di Lokasi Ini
              </h3>
              <button
                onClick={() => setShowKegiatanForm(!showKegiatanForm)}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-500/15 hover:bg-green-100 dark:hover:bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-bold rounded-xl transition text-sm"
              >
                <FiPlus size={16} />
                Tambah Kegiatan
              </button>
            </div>

            {showKegiatanForm && (
              <form onSubmit={addKegiatan} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={kegiatanForm.nama}
                  onChange={(e) => setKegiatanForm({ nama: e.target.value })}
                  placeholder="Nama kegiatan baru..."
                  className="flex-1 px-4 py-2 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-60"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => setShowKegiatanForm(false)}
                  className="px-4 py-2 border border-line rounded-xl font-bold text-muted hover:bg-surface2 transition"
                >
                  Batal
                </button>
              </form>
            )}

            {selectedLokasi.kegiatan && selectedLokasi.kegiatan.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedLokasi.kegiatan.map((kegiatan) => (
                  <span
                    key={kegiatan.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-800 rounded-full text-sm font-semibold"
                  >
                    {kegiatan.nama}
                    <button
                      onClick={() => deleteKegiatan(kegiatan.id)}
                      className="text-green-600 dark:text-green-300 hover:text-red-600 dark:text-red-300 transition-colors"
                      aria-label={`Hapus kegiatan ${kegiatan.nama}`}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <FiInfo size={32} className="mx-auto mb-2 text-muted" />
                <p className="text-sm">Belum ada kegiatan di lokasi ini</p>
              </div>
            )}
          </div>

          {/* Tanaman di Lokasi */}
          <div className="bg-card rounded-2xl border border-line p-6">
            <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <FiGrid size={20} className="text-green-600 dark:text-green-300" />
              Tanaman di Lokasi Ini
            </h3>

            {selectedLokasi.tanaman && selectedLokasi.tanaman.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedLokasi.tanaman.map((tanaman) => (
                  <div
                    key={tanaman.id}
                    className="flex items-center gap-3 p-3 bg-surface2 rounded-xl"
                  >
                    {tanaman.gambar && (
                      <img loading="lazy" decoding="async"
                        src={`${API}/uploads/${tanaman.gambar}`}
                        alt={tanaman.nama}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-ink">{tanaman.nama}</p>
                      <p className="text-xs text-muted">{tanaman.jenis}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <FiInfo size={32} className="mx-auto mb-2 text-muted" />
                <p className="text-sm">Belum ada tanaman di lokasi ini</p>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                  Kaitkan tanaman ke lokasi ini lewat Manajemen Tanaman agar
                  bisa dipilih pada form jadwal.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/admin/tanaman")}
                  className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2"
                >
                  Buka Manajemen Tanaman
                </button>
              </div>
            )}
          </div>

          {/* Aktivitas di Lokasi */}
          <div className="bg-card rounded-2xl border border-line p-6">
            <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <FiCalendar size={20} className="text-green-600 dark:text-green-300" />
              Aktivitas Terjadwal di Lokasi Ini
            </h3>

            {selectedLokasi.aktivitas && selectedLokasi.aktivitas.length > 0 ? (
              <div className="space-y-3">
                {selectedLokasi.aktivitas.map((aktivitas) => (
                  <div key={aktivitas.id} className="p-4 bg-surface2 rounded-xl">
                    <p className="font-bold text-ink">
                      {aktivitas.nama_aktivitas}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      {aktivitas.tanggal_mulai} -{" "}
                      {aktivitas.tanggal_selesai || "Tanpa batas"}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-bold ${
                        aktivitas.status === "aktif"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                          : "bg-surface2 text-muted"
                      }`}
                    >
                      {aktivitas.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <FiInfo size={32} className="mx-auto mb-2 text-muted" />
                <p className="text-sm">
                  Belum ada aktivitas terjadwal di lokasi ini
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LokasiManager;
