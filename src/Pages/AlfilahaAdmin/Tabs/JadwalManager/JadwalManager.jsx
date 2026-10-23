import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";
import { adminFetch } from "../../../../adminAuth";
import {
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiRepeat,
  FiList,
  FiBarChart2,
  FiAlertTriangle,
  FiTrendingUp,
  FiBell,
  FiImage,
  FiLogIn,
  FiBookOpen,
  FiBox,
  FiHome,
  FiDroplet,
  FiScissors,
  FiSun,
  FiActivity,
  FiFeather,
  FiHeart,
  FiTag,
  FiPaperclip,
  FiCoffee,
  FiWind,
  FiThermometer,
  FiSquare,
  FiMoreHorizontal,
} from "react-icons/fi";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

/* ── helpers ── */
const toLocalDateStr = (d) => {
  const dd = new Date(d);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const POLA_LABEL = {
  sekali: "Sekali Jalan",
  berulang: "Ulangi Setiap ... Hari",
};

// Label aksi perawatan tanaman (dipakai untuk chip di kartu tanaman)
const AKSI_LABEL = {
  siram: "Siram",
  pupuk: "Pupuk",
  panen: "Panen",
};

// Ikon untuk setiap aksi perawatan — selalu tampil di chip, disesuaikan
// dengan nama aksi (tanaman maupun ternak). Fallback ke ikon generik.
const getAksiIcon = (nama, size = 12) => {
  const n = String(nama || "").toLowerCase();
  if (/siram|air|minum/.test(n)) return <FiDroplet size={size} />;
  if (/pupuk|nutrisi|pakan|makan/.test(n)) return <FiCoffee size={size} />;
  if (/panen|potong|pangkas|pruning|panen|sembelih/.test(n))
    return <FiScissors size={size} />;
  if (/kebersihan|bersih|sanitasi|kandang/.test(n)) return <FiHome size={size} />;
  if (/sakit|sehat|vaksin|obat|kesehatan/.test(n)) return <FiHeart size={size} />;
  if (/suhu|temperature|pemanas/.test(n)) return <FiThermometer size={size} />;
  if (/angin|ventilasi|sirkulasi/.test(n)) return <FiWind size={size} />;
  if (/jemur|sinar|matahari/.test(n)) return <FiSun size={size} />;
  if (/tanam|semai|bibit/.test(n)) return <FiFeather size={size} />;
  if (/tandai|label|catat|timbang/.test(n)) return <FiTag size={size} />;
  if (/cek|periksa|monitor|kontrol|inspeksi/.test(n)) return <FiActivity size={size} />;
  return <FiPaperclip size={size} />;
};

// Ikon untuk aksi/aktivitas kelas (FGD, Kunjungan, Klasikal, dll).
const getAktivitasKelasIcon = (nama, size = 12) => {
  const n = String(nama || "").toLowerCase();
  if (/fgd|diskusi|kelompok/.test(n)) return <FiActivity size={size} />;
  if (/kunjungan|studi|lapangan|tour/.test(n)) return <FiSun size={size} />;
  if (/klasikal|kelas|teori/.test(n)) return <FiBookOpen size={size} />;
  return <FiPaperclip size={size} />;
};

const isKategoriPertanian = (nama) =>
  /pertanian|perkebunan/i.test(String(nama || "").trim());

const isKategoriPeternakan = (nama) =>
  /peternakan/i.test(String(nama || "").trim());

const isKategoriPendidikan = (nama) =>
  /pendidikan|kelas/i.test(String(nama || "").trim());

const getKategoriIcon = (nama) => {
  const n = String(nama || "").toLowerCase();
  if (/peternakan/i.test(n)) return <FiBox size={12} />;
  if (/pendidikan|kelas/i.test(n)) return <FiBookOpen size={12} />;
  if (/pertanian|perkebunan/i.test(n)) return <FiTrendingUp size={12} />;
  if (/kebersihan|bersih/i.test(n)) return <FiHome size={12} />;
  return <FiList size={12} />;
};

const getKategoriStyle = (nama) => {
  const n = String(nama || "").toLowerCase();
  if (/peternakan/i.test(n))
    return "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30";
  if (/pendidikan|kelas/i.test(n))
    return "bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30";
  if (/pertanian|perkebunan/i.test(n))
    return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30";
  if (/kebersihan|bersih/i.test(n))
    return "bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30";
  return "bg-surface2 text-muted border-line";
};

const clsStatus = (s) =>
  ({
    aktif: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    nonaktif: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  })[s] || "bg-surface2 text-muted border-line";

const clsTaskStatus = (s) =>
  ({
    selesai: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    pending: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300",
    dilewati: "bg-surface2 text-muted",
  })[s] || "bg-surface2 text-muted";

const fmtTgl = (d) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "–";
const initials = (n) =>
  n
    ? n
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

/**
 * Pisahkan deskripsi jadwal menjadi { utama, perHari }.
 * Deskripsi mentah menyisipkan blok "Jadwal Pelajaran:" berisi baris hari
 * (Senin/Selasa/...) dan tiap pelajaran diawali "•".
 */
const parseDeskripsiJadwal = (deskripsi) => {
  const teks = String(deskripsi || "");
  const idx = teks.indexOf("Jadwal Pelajaran:");
  if (idx === -1) return { utama: teks.trim(), perHari: [] };

  const utama = teks.slice(0, idx).trim();
  const blok = teks.slice(idx + "Jadwal Pelajaran:".length);
  const baris = blok
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);

  const perHari = [];
  let hariAktif = null;
  baris.forEach((b) => {
    if (b.startsWith("•")) {
      if (!hariAktif) {
        hariAktif = { hari: "", items: [] };
        perHari.push(hariAktif);
      }
      hariAktif.items.push(b.slice(1).trim());
    } else {
      hariAktif = { hari: b, items: [] };
      perHari.push(hariAktif);
    }
  });
  return { utama, perHari };
};

/** "B.Inggris (07:00-08:00) — Ustadz Ahmad" → { mapel, jam, guru } */
const parseBarisPelajaran = (baris) => {
  const m = String(baris).match(/^(.*?)\s*(?:\((\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})\))?\s*(?:—\s*(.*))?$/);
  return {
    mapel: (m?.[1] || baris).trim(),
    jam: (m?.[2] || "").trim(),
    guru: (m?.[3] || "").trim(),
  };
};

/* ═══════════════════════════════════════════════════════════
   FORM JADWAL BARU (Dengan Lokasi & Kategori Dinamis)
═══════════════════════════════════════════════════════════ */
const FormJadwalBaru = ({ initial, onSave, onCancel }) => {
  const isEdit = !!initial?.id;
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    const awal = {
      nama_aktivitas: "",
      kategori_id: "",
      lokasi_id: "",
      kegiatan_lokasi_ids: [],
      tanaman_ids: [],
      tanaman_terpilih: [],
      ternak_terpilih: [],
      jam_mulai: "08:00",
      jam_selesai: "09:00",
      pola_perulangan: "sekali",
      interval_hari: 1,
      tanggal_mulai: toLocalDateStr(new Date()),
      tanggal_selesai: "",
      deskripsi: "",
      santri_ids: [],
      kelas_terpilih: [],
      jadwal_pelajaran: [],
      ...initial,
    };
    // Saat edit: preselected dari penanggung_jawab (CSV id santri lama)
    if (!Array.isArray(awal.santri_ids) && awal.penanggung_jawab) {
      awal.santri_ids = String(awal.penanggung_jawab)
        .split(",")
        .map(Number)
        .filter(Boolean);
    }
    if (!Array.isArray(awal.santri_ids)) awal.santri_ids = [];
    if (Array.isArray(awal.kelas_terpilih)) {
      awal.kelas_terpilih = awal.kelas_terpilih
        .filter((k) => k && k.kelas_id)
        .map((k) => ({
          kelas_id: Number(k.kelas_id),
          aksi: Array.isArray(k.aksi) ? [...k.aksi] : [],
        }));
    } else {
      awal.kelas_terpilih = [];
    }
    // Normalisasi tanaman_terpilih (format baru: [{ tanaman_id, aksi: [] }])
    if (Array.isArray(awal.tanaman_terpilih)) {
      awal.tanaman_terpilih = awal.tanaman_terpilih
        .filter((t) => t && t.tanaman_id)
        .map((t) => ({
          tanaman_id: Number(t.tanaman_id),
          aksi: Array.isArray(t.aksi) ? [...t.aksi] : [],
        }));
    } else {
      awal.tanaman_terpilih = [];
    }
    if (!Array.isArray(awal.tanaman_terpilih)) awal.tanaman_terpilih = [];
    // Normalisasi ternak_terpilih (format baru: [{ ternak_id, aksi: [] }])
    if (Array.isArray(awal.ternak_terpilih)) {
      awal.ternak_terpilih = awal.ternak_terpilih
        .filter((t) => t && t.ternak_id)
        .map((t) => ({
          ternak_id: Number(t.ternak_id),
          aksi: Array.isArray(t.aksi) ? t.aksi.map(Number) : [],
        }));
    } else {
      awal.ternak_terpilih = [];
    }
    return awal;
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Data dari database
  const [kategoriList, setKategoriList] = useState([]);
  const [lokasiList, setLokasiList] = useState([]);
  const [tanamanList, setTanamanList] = useState([]);
  const [santriList, setSantriList] = useState([]);

  // Loading states
  const [, setLoadingKategori] = useState(false);
  const [, setLoadingLokasi] = useState(false);
  const [loadingTanaman, setLoadingTanaman] = useState(false);
  const [loadingSantri, setLoadingSantri] = useState(false);

  // Mode Pertanian/Perkebunan: semua tanaman dari API + daftar aksi global
  const [semuaTanaman, setSemuaTanaman] = useState([]);
  const [loadingSemuaTanaman, setLoadingSemuaTanaman] = useState(false);
  const [aksiList, setAksiList] = useState([]);
  const [aksiLoading, setAksiLoading] = useState(false);
  const [aksiError, setAksiError] = useState("");

  // Mode Peternakan: semua ternak dari API + daftar aksi per jenis ternak
  const [semuaTernak, setSemuaTernak] = useState([]);
  const [loadingSemuaTernak, setLoadingSemuaTernak] = useState(false);
  const [ternakAksiMap, setTernakAksiMap] = useState({});
  const [aksiTernakLoading, setAksiTernakLoading] = useState(false);
  const [aksiTernakError, setAksiTernakError] = useState("");

  // Mode Pendidikan (kelas): daftar kelas, guru, jenis aktivitas perawatan,
  // dan baris jadwal pelajaran yang dikirim ke santri
  const [kelasList, setKelasList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [jenisPerawatanPendidikan, setJenisPerawatanPendidikan] = useState([
    { key: "fgd", label: "FGD" },
    { key: "kunjungan", label: "Kunjungan" },
    { key: "klasikal", label: "Klasikal" },
  ]);
  const [showTambahJenis, setShowTambahJenis] = useState(false);
  const [inputTambahJenis, setInputTambahJenis] = useState("");
  // Jadwal pelajaran yang sudah tersimpan di tiap kelas terpilih
  const [jadwalKelasMap, setJadwalKelasMap] = useState({});
  const [loadingJadwalKelas, setLoadingJadwalKelas] = useState(false);

  // UI states
  const [showKategoriForm, setShowKategoriForm] = useState(false);
  const [kategoriForm, setKategoriForm] = useState({ nama: "" });
  const [santriSearch, setSantriSearch] = useState("");
  const [santriFilterKelas, setSantriFilterKelas] = useState("");
  const [santriError, setSantriError] = useState("");
  const [santriLoginRequired, setSantriLoginRequired] = useState(false);


  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Kategori terpilih & mode Pertanian/Perkebunan (tanaman + aksi, tanpa lokasi)
  const kategoriTerpilih = kategoriList.find(
    (k) => String(k.id) === String(form.kategori_id),
  );
  const isPertanian = isKategoriPertanian(
    kategoriTerpilih?.nama || initial?.kategori,
  );
  const isPeternakan = isKategoriPeternakan(
    kategoriTerpilih?.nama || initial?.kategori,
  );
  const isPendidikan = isKategoriPendidikan(
    kategoriTerpilih?.nama || initial?.kategori,
  );
  const isProduksi = isPertanian || isPeternakan || isPendidikan;

  // Untuk kategori Pendidikan, admin memilih pelajaran dari jadwal kelas.
  // Semua pelajaran terpilih digabung jadi SATU tiket; daftarnya ditampilkan
  // di ringkasan agar admin tahu apa yang akan dikirim ke santri.
  const pelajaranTerpilih = isPendidikan
    ? (form.jadwal_pelajaran || []).filter((j) => j && j.mapel)
    : [];

  // Fetch kategori
  const fetchKategori = async () => {
    setLoadingKategori(true);
    try {
      const res = await adminFetch(`${API}/api/kategori`);
      if (res.ok) {
        const data = await res.json();
        setKategoriList(data);
      }
    } catch (e) {
      console.error("Fetch kategori gagal:", e);
    } finally {
      setLoadingKategori(false);
    }
  };

  // Fetch lokasi
  const fetchLokasi = async () => {
    setLoadingLokasi(true);
    try {
      const res = await adminFetch(`${API}/api/lokasi`);
      if (res.ok) {
        const data = await res.json();
        setLokasiList(data);
      }
    } catch (e) {
      console.error("Fetch lokasi gagal:", e);
    } finally {
      setLoadingLokasi(false);
    }
  };

  // Fetch kegiatan berdasarkan lokasi (endpoint: GET /api/lokasi/:id/kegiatan)
  // Fetch tanaman berdasarkan lokasi
  const fetchTanaman = async (lokasiId) => {
    if (!lokasiId) {
      setTanamanList([]);
      return;
    }
    setLoadingTanaman(true);
    try {
      const res = await adminFetch(`${API}/api/tanaman`);
      if (res.ok) {
        const data = await res.json();
        const lokasiIdNum = parseInt(lokasiId);
        // Hanya tanaman yang benar-benar dikaitkan ke lokasi terpilih
        const filtered = (data || []).filter(
          (t) => parseInt(t.lokasi_id) === lokasiIdNum,
        );
        setTanamanList(filtered);
      }
    } catch (e) {
      console.error("Fetch tanaman gagal:", e);
    } finally {
      setLoadingTanaman(false);
    }
  };

  // Fetch semua tanaman (dipakai di mode Pertanian: pilih koleksi tanaman)
  const fetchSemuaTanaman = async () => {
    setLoadingSemuaTanaman(true);
    try {
      const res = await adminFetch(`${API}/api/tanaman`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSemuaTanaman(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Fetch semua tanaman gagal:", e);
    } finally {
      setLoadingSemuaTanaman(false);
    }
  };

  // Fetch daftar aksi yang tersedia (endpoint per tanaman, bersifat global)
  const fetchAksiGlobal = async () => {
    if (aksiList.length > 0) return;
    const idSumber = semuaTanaman[0]?.id;
    if (!idSumber) return;
    setAksiLoading(true);
    setAksiError("");
    try {
      const res = await adminFetch(
        `${API}/api/tanaman/${idSumber}/aksi`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.aksi)) {
          setAksiList(data.aksi);
        } else {
          setAksiError("Respons server tidak berisi daftar aksi.");
        }
      } else {
        setAksiError(`Server menjawab ${res.status}.`);
      }
    } catch (e) {
      console.error("Fetch aksi tanaman gagal:", e);
      setAksiError("Tidak bisa terhubung ke server.");
    } finally {
      setAksiLoading(false);
    }
  };

  // Fetch semua ternak (dipakai di mode Peternakan: pilih koleksi ternak)
  const fetchSemuaTernak = async () => {
    setLoadingSemuaTernak(true);
    try {
      const res = await adminFetch(`${API}/api/ternak`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSemuaTernak(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Fetch semua ternak gagal:", e);
    } finally {
      setLoadingSemuaTernak(false);
    }
  };

  // Fetch daftar aksi untuk seluruh jenis ternak di koleksi
  const fetchSemuaAksiTernak = async () => {
    if (semuaTernak.length === 0) return;
    setAksiTernakLoading(true);
    setAksiTernakError("");
    const map = {};
    try {
      const hasil = await Promise.all(
        semuaTernak.map(async (tnk) => {
          try {
            const res = await adminFetch(
              `${API}/api/ternak/${encodeURIComponent(tnk.nama)}`,
              { cache: "no-store" },
            );
            if (!res.ok) return { ternak_id: tnk.id, aksi: [] };
            const data = await res.json();
            return {
              ternak_id: Number(data.id),
              aksi: Array.isArray(data?.aksi) ? data.aksi : [],
            };
          } catch (e) {
            return { ternak_id: tnk.id, aksi: [] };
          }
        }),
      );
      hasil.forEach((h) => {
        map[h.ternak_id] = h.aksi;
      });
    } catch (e) {
      console.error("Fetch aksi ternak gagal:", e);
      setAksiTernakError("Tidak bisa memuat daftar aksi ternak.");
    } finally {
      setTernakAksiMap(map);
      setAksiTernakLoading(false);
    }
  };

  // Fetch santri — endpoint khusus admin, selalu fresh (tanpa cache lama)
  const fetchSantri = async () => {
    setLoadingSantri(true);
    setSantriError("");
    setSantriLoginRequired(false);
    try {
      const token = localStorage.getItem("alfilaha_admin_token") || "";
      const res = await adminFetch(`${API}/api/santri-pemilih`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!res.ok) {
        setSantriLoginRequired(res.status === 401 || res.status === 403);
        setSantriError(`Server menjawab ${res.status}`);
        setSantriList([]);
        return;
      }
      const data = await res.json();
      setSantriList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch santri gagal:", e);
      setSantriError("Tidak bisa terhubung ke server");
      setSantriList([]);
    } finally {
      setLoadingSantri(false);
    }
  };

  // Tambah kategori baru
  const addKategori = async (e) => {
    e.preventDefault();
    if (!kategoriForm.nama.trim()) return;

    try {
      const res = await adminFetch(`${API}/api/kategori`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: kategoriForm.nama.trim() }),
      });

      if (res.ok) {
        setKategoriForm({ nama: "" });
        setShowKategoriForm(false);
        fetchKategori();
      } else {
        const errData = await res.json();
        setSaveError(errData.error || "Gagal menambahkan kategori");
      }
    } catch (e) {
      setSaveError("Gagal terhubung ke server");
    }
  };

  // Toggle tanaman selection (mode non-Pertanian: tanaman terkait lokasi)
  const toggleTanaman = (tanamanId) => {
    const current = form.tanaman_ids || [];
    if (current.includes(tanamanId)) {
      set(
        "tanaman_ids",
        current.filter((id) => id !== tanamanId),
      );
    } else {
      set("tanaman_ids", [...current, tanamanId]);
    }
  };

  // Toggle pilih tanaman di mode Pertanian (tanaman_terpilih)
  const toggleTanamanPertanian = (tanamanId) => {
    const cur = Array.isArray(form.tanaman_terpilih)
      ? [...form.tanaman_terpilih]
      : [];
    const id = Number(tanamanId);
    const ada = cur.some((t) => Number(t.tanaman_id) === id);
    if (ada) {
      set(
        "tanaman_terpilih",
        cur.filter((t) => Number(t.tanaman_id) !== id),
      );
    } else {
      set("tanaman_terpilih", [...cur, { tanaman_id: id, aksi: [] }]);
    }
  };

  // Toggle aksi (siram/pupuk/panen) untuk tanaman terpilih
  const toggleAksiTanaman = (tanamanId, aksi) => {
    const cur = Array.isArray(form.tanaman_terpilih)
      ? [...form.tanaman_terpilih]
      : [];
    const idx = cur.findIndex((t) => Number(t.tanaman_id) === Number(tanamanId));
    if (idx === -1) return;
    const entry = {
      ...cur[idx],
      aksi: Array.isArray(cur[idx].aksi) ? [...cur[idx].aksi] : [],
    };
    if (entry.aksi.includes(aksi)) {
      entry.aksi = entry.aksi.filter((a) => a !== aksi);
    } else {
      entry.aksi.push(aksi);
    }
    cur[idx] = entry;
    set("tanaman_terpilih", cur);
  };

  // Toggle pilih ternak di mode Peternakan (ternak_terpilih)
  const toggleTernakPeternakan = (ternakId) => {
    const cur = Array.isArray(form.ternak_terpilih)
      ? [...form.ternak_terpilih]
      : [];
    const id = Number(ternakId);
    const ada = cur.some((t) => Number(t.ternak_id) === id);
    if (ada) {
      set(
        "ternak_terpilih",
        cur.filter((t) => Number(t.ternak_id) !== id),
      );
    } else {
      set("ternak_terpilih", [...cur, { ternak_id: id, aksi: [] }]);
    }
  };

  // Toggle aksi (master_aksi_id) untuk ternak terpilih
  const toggleAksiTernak = (ternakId, masterAksiId) => {
    const cur = Array.isArray(form.ternak_terpilih)
      ? [...form.ternak_terpilih]
      : [];
    const idx = cur.findIndex((t) => Number(t.ternak_id) === Number(ternakId));
    if (idx === -1) return;
    const entry = {
      ...cur[idx],
      aksi: Array.isArray(cur[idx].aksi) ? [...cur[idx].aksi] : [],
    };
    if (entry.aksi.includes(masterAksiId)) {
      entry.aksi = entry.aksi.filter((a) => a !== masterAksiId);
    } else {
      entry.aksi.push(masterAksiId);
    }
    cur[idx] = entry;
    set("ternak_terpilih", cur);
  };

  // Toggle santri selection
  const toggleSantri = (santriId) => {
    const current = form.santri_ids || [];
    if (current.includes(santriId)) {
      set(
        "santri_ids",
        current.filter((id) => id !== santriId),
      );
    } else {
      set("santri_ids", [...current, santriId]);
    }
  };

  // Select all visible santri (hanya hasil yang tampil saat ini)
  const selectAllVisibleSantri = () => {
    const visibleIds = filteredSantri.map((s) => s.id);
    const current = form.santri_ids || [];
    const newIds = [...new Set([...current, ...visibleIds])];
    set("santri_ids", newIds);
  };

  // Toggle semua santri dalam satu kamar (hasil yang tampil di grup tsb)
  const toggleKamarSantri = (kamarKey) => {
    const ids = groupedByKamar[kamarKey]?.map((s) => s.id) || [];
    const current = form.santri_ids || [];
    const semuaTerpilih =
      ids.length > 0 && ids.every((id) => current.includes(id));
    if (semuaTerpilih) {
      set(
        "santri_ids",
        current.filter((id) => !ids.includes(id)),
      );
    } else {
      set("santri_ids", [...new Set([...current, ...ids])]);
    }
  };

  // Kosongkan semua pilihan
  const clearSantriSelection = () => {
    set("santri_ids", []);
  };

  // Handle lokasi change
  const handleLokasiChange = (lokasiId) => {
    set("lokasi_id", lokasiId);
    set("kegiatan_lokasi_ids", []); // Reset kegiatan selection
    set("tanaman_ids", []); // Reset tanaman selection
    fetchTanaman(lokasiId);
  };

  // Load data saat mount
  useEffect(() => {
    fetchKategori();
    fetchLokasi();
    fetchSantri();
  }, []);

  // Load tanaman saat lokasi berubah
  useEffect(() => {
    if (form.lokasi_id) {
      fetchTanaman(form.lokasi_id);
    }
  }, [form.lokasi_id]);

  // Mode Pertanian: muat koleksi tanaman dari API (bukan hardcode)
  useEffect(() => {
    if (isPertanian) {
      fetchSemuaTanaman();
      set("lokasi_id", "");
      set("kegiatan_lokasi_ids", []);
    } else {
      // Pastikan mode non-Pertanian tidak membawa sisa tanaman_terpilih
      setForm((p) => ({ ...p, tanaman_terpilih: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPertanian]);

  // Mode Peternakan: muat koleksi ternak dari API + reset lokasi/kegiatan
  useEffect(() => {
    if (isPeternakan) {
      fetchSemuaTernak();
      set("lokasi_id", "");
      set("kegiatan_lokasi_ids", []);
    } else {
      setForm((p) => ({ ...p, ternak_terpilih: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPeternakan]);

  // Ambil daftar aksi global setelah koleksi tanaman tersedia
  useEffect(() => {
    if (isPertanian && semuaTanaman.length > 0) fetchAksiGlobal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPertanian, semuaTanaman]);

  // Ambil daftar aksi per ternak setelah koleksi ternak tersedia
  useEffect(() => {
    if (isPeternakan && semuaTernak.length > 0) fetchSemuaAksiTernak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPeternakan, semuaTernak]);

  // Saat edit: prefill dari GET /api/jadwal/:id (tanaman_terpilih + aksi + kategori_id)
  useEffect(() => {
    if (!isEdit || !initial?.id) return;
    adminFetch(`${API}/api/jadwal/${initial.id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.error) return;
        const upd = {};
        if (Array.isArray(data.tanaman_terpilih)) {
          upd.tanaman_terpilih = data.tanaman_terpilih
            .filter((t) => t && t.tanaman_id)
            .map((t) => ({
              tanaman_id: Number(t.tanaman_id),
              aksi: Array.isArray(t.aksi) ? [...t.aksi] : [],
            }));
        }
        if (Array.isArray(data.ternak_terpilih)) {
          upd.ternak_terpilih = data.ternak_terpilih
            .filter((t) => t && t.ternak_id)
            .map((t) => ({
              ternak_id: Number(t.ternak_id),
              aksi: Array.isArray(t.aksi) ? t.aksi.map(Number) : [],
            }));
        }
        if (data.kategori_id) upd.kategori_id = String(data.kategori_id);
        if (Object.keys(upd).length)
          setForm((p) => ({ ...p, ...upd }));
      })
      .catch(() => {});
  }, [isEdit]);

  // Saat edit dengan kategori berbasis nama (misal "Pertanian") tanpa kategori_id:
  // cari id kategori yang cocok dari daftar kategori
  useEffect(() => {
    if (form.kategori_id || !initial?.kategori || kategoriList.length === 0)
      return;
    const m = kategoriList.find(
      (k) =>
        String(k.nama).trim().toLowerCase() ===
        String(initial.kategori).trim().toLowerCase(),
    );
    if (m) set("kategori_id", String(m.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategoriList]);

  // Mode Pendidikan: ambil daftar kelas, guru, dan jenis aktivitas perawatan
  useEffect(() => {
    if (!isPendidikan) return;
    (async () => {
      try {
        const [rk, rg, rj] = await Promise.all([
          adminFetch(`${API}/api/admin/kelas`),
          adminFetch(`${API}/api/pendidikan/guru`),
          adminFetch(`${API}/api/pendidikan/jenis-perawatan`),
        ]);
        if (rk.ok) {
          const data = await rk.json();
          setKelasList(Array.isArray(data) ? data : data?.kelas || []);
        }
        if (rg.ok) setGuruList(await rg.json());
        if (rj.ok) {
          const data = await rj.json();
          if (Array.isArray(data) && data.length) {
            setJenisPerawatanPendidikan(
              data.map((d) => ({
                key: String(d.nama).toLowerCase(),
                label: d.nama,
              })),
            );
          }
        }
      } catch (e) {}
    })();
  }, [isPendidikan]);

  // Ambil jadwal pelajaran yang sudah tersimpan untuk setiap kelas terpilih,
  // supaya admin bisa langsung memilih jadwal yang sudah ada.
  const kelasTerpilihKey = (form.kelas_terpilih || [])
    .map((k) => Number(k.kelas_id))
    .filter(Boolean)
    .sort((a, b) => a - b)
    .join(",");
  useEffect(() => {
    if (!isPendidikan) return;
    const ids = kelasTerpilihKey ? kelasTerpilihKey.split(",").map(Number) : [];
    if (ids.length === 0) {
      setJadwalKelasMap({});
      return;
    }
    let batal = false;
    setLoadingJadwalKelas(true);
    (async () => {
      const map = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`${API}/api/pendidikan/jadwal/${id}`);
            if (res.ok) {
              const rows = await res.json();
              map[id] = Array.isArray(rows) ? rows : [];
            } else map[id] = [];
          } catch (e) {
            map[id] = [];
          }
        }),
      );
      if (!batal) {
        setJadwalKelasMap(map);
        setLoadingJadwalKelas(false);
      }
    })();
    return () => {
      batal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendidikan, kelasTerpilihKey]);

  // Toggle pilih kelas (mode Pendidikan)
  const toggleKelas = (kelasId) => {
    setForm((prev) => {
      const list = Array.isArray(prev.kelas_terpilih)
        ? [...prev.kelas_terpilih]
        : [];
      const idx = list.findIndex((k) => Number(k.kelas_id) === Number(kelasId));
      if (idx >= 0) list.splice(idx, 1);
      else list.push({ kelas_id: Number(kelasId), aksi: [] });
      return { ...prev, kelas_terpilih: list };
    });
  };

  // Toggle aksi perawatan per kelas (mode Pendidikan)
  const toggleAksiKelas = (kelasId, aksiKey) => {
    setForm((prev) => {
      const list = (Array.isArray(prev.kelas_terpilih)
        ? prev.kelas_terpilih
        : []
      ).map((k) => ({
        ...k,
        aksi: Array.isArray(k.aksi) ? [...k.aksi] : [],
      }));
      const idx = list.findIndex(
        (k) => Number(k.kelas_id) === Number(kelasId),
      );
      if (idx >= 0) {
        const has =
          list[idx].aksi.includes(aksiKey) || list[idx].aksi.includes(aksiKey.toUpperCase());
        list[idx].aksi = has
          ? list[idx].aksi.filter((a) => a !== aksiKey && a !== aksiKey.toUpperCase())
          : [...list[idx].aksi, aksiKey];
      }
      return { ...prev, kelas_terpilih: list };
    });
  };

  // Jadwal pelajaran lama punya id; baris baru (manual) tidak. Pakai id itu
  // sebagai penanda terpilih.
  const jadwalIdDipakai = (id) =>
    (form.jadwal_pelajaran || []).some(
      (j) => j.pelajaran_id !== undefined && Number(j.pelajaran_id) === Number(id),
    );

  // Klik jadwal pelajaran yang sudah tersimpan → masukkan/keluarkan dari form.
  const toggleJadwalPelajaranAda = (kelasId, item) => {
    setForm((prev) => {
      const list = Array.isArray(prev.jadwal_pelajaran)
        ? [...prev.jadwal_pelajaran]
        : [];
      const idx = list.findIndex(
        (j) =>
          j.pelajaran_id !== undefined &&
          Number(j.pelajaran_id) === Number(item.id),
      );
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push({
          pelajaran_id: Number(item.id),
          kelas_id: Number(kelasId),
          hari: item.hari,
          jam_mulai: String(item.jam_mulai || "").slice(0, 5),
          jam_selesai: String(item.jam_selesai || "").slice(0, 5),
          mapel: item.mapel || "",
          guru_id: item.guru_id || "",
        });
      }
      return { ...prev, jadwal_pelajaran: list };
    });
  };

  // Pilih semua jadwal pelajaran milik sebuah kelas, atau kosongkan bila sudah
  // semua terpilih. Dipakai oleh tombol "Pilih Semua".
  const toggleSemuaJadwalKelas = (kelasId) => {
    const items = jadwalKelasMap[kelasId] || [];
    if (items.length === 0) return;
    setForm((prev) => {
      const list = Array.isArray(prev.jadwal_pelajaran)
        ? [...prev.jadwal_pelajaran]
        : [];
      const semuaTerpilih = items.every((item) =>
        list.some(
          (j) =>
            j.pelajaran_id !== undefined &&
            Number(j.pelajaran_id) === Number(item.id),
        ),
      );
      if (semuaTerpilih) {
        const ids = new Set(items.map((it) => Number(it.id)));
        return {
          ...prev,
          jadwal_pelajaran: list.filter(
            (j) => !(j.pelajaran_id !== undefined && ids.has(Number(j.pelajaran_id))),
          ),
        };
      }
      const sudah = new Set(
        list.filter((j) => j.pelajaran_id !== undefined).map((j) => Number(j.pelajaran_id)),
      );
      items.forEach((item) => {
        if (sudah.has(Number(item.id))) return;
        sudah.add(Number(item.id));
        list.push({
          pelajaran_id: Number(item.id),
          kelas_id: Number(kelasId),
          hari: item.hari,
          jam_mulai: String(item.jam_mulai || "").slice(0, 5),
          jam_selesai: String(item.jam_selesai || "").slice(0, 5),
          mapel: item.mapel || "",
          guru_id: item.guru_id || "",
          guru_nama: item.guru_nama || item.guru_nama_tampil || "",
        });
      });
      return { ...prev, jadwal_pelajaran: list };
    });
  };

  const tambahJenisPerawatan = async () => {
    const nama = inputTambahJenis.trim();
    if (!nama) return;
    try {
      const res = await adminFetch(`${API}/api/pendidikan/jenis-perawatan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setJenisPerawatanPendidikan(data.map((d) => ({ key: String(d.nama).toLowerCase(), label: d.nama })));
        }
        setInputTambahJenis('');
        setShowTambahJenis(false);
      }
    } catch (e) {}
  };

    const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    // Validasi
    if (!form.nama_aktivitas.trim()) {
      setSaveError("Nama aktivitas diperlukan");
      setSaving(false);
      return;
    }
    if (!form.kategori_id) {
      setSaveError("Kategori diperlukan");
      setSaving(false);
      return;
    }
    if (isPertanian) {
      const tanamanFinal = Array.isArray(form.tanaman_terpilih)
        ? form.tanaman_terpilih
        : [];
      if (tanamanFinal.length === 0) {
        setSaveError(
          "Kategori pertanian wajib memilih minimal satu tanaman.",
        );
        setSaving(false);
        return;
      }
      const tanpaAksi = tanamanFinal.filter(
        (t) => !Array.isArray(t.aksi) || t.aksi.length === 0,
      );
      if (tanpaAksi.length > 0) {
        setSaveError(
          `Tanaman "${semuaTanaman.find((x) => Number(x.id) === Number(tanpaAksi[0].tanaman_id))?.nama || tanpaAksi[0].tanaman_id}" belum dicentang aksi perawatannya (siram/pupuk/panen).`,
        );
        setSaving(false);
        return;
      }
    } else if (isPeternakan) {
      const ternakFinal = Array.isArray(form.ternak_terpilih)
        ? form.ternak_terpilih
        : [];
      if (ternakFinal.length === 0) {
        setSaveError(
          "Kategori peternakan wajib memilih minimal satu ternak.",
        );
        setSaving(false);
        return;
      }
      const tanpaAksi = ternakFinal.filter(
        (t) => !Array.isArray(t.aksi) || t.aksi.length === 0,
      );
      if (tanpaAksi.length > 0) {
        setSaveError(
          `Ternak "${semuaTernak.find((x) => Number(x.id) === Number(tanpaAksi[0].ternak_id))?.nama || tanpaAksi[0].ternak_id}" belum dicentang aksi perawatannya.`,
        );
        setSaving(false);
        return;
      }
    } else if (isPendidikan) {
      if (!form.kelas_terpilih || form.kelas_terpilih.length === 0) {
        setSaveError(
          "Kategori pendidikan wajib memilih minimal satu kelas.",
        );
        setSaving(false);
        return;
      }
    }
    // Lokasi wajib untuk semua kategori (kegiatan opsional).
    if (!form.lokasi_id) {
      setSaveError("Lokasi diperlukan");
      setSaving(false);
      return;
    }
    if (!form.santri_ids || form.santri_ids.length === 0) {
      setSaveError("Minimal satu santri harus dipilih");
      setSaving(false);
      return;
    }

    try {
      const namaKategori =
        kategoriTerpilih?.nama || form.kategori || initial?.kategori || "";
      await onSave(namaKategori ? { ...form, kategori: namaKategori } : form);
    } catch (err) {
      setSaveError(err?.message || "Gagal menyimpan jadwal");
    } finally {
      setSaving(false);
    }
  };

  // Filter santri utk display: pencarian (username+nama) + filter kelas (di sisi klien)
  const filteredSantri = santriList.filter((s) => {
    const hay = `${s.username || ""} ${s.nama || ""}`.toLowerCase();
    const q = santriSearch.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (santriFilterKelas && (s.kelas || "") !== santriFilterKelas)
      return false;
    return true;
  });

  // Daftar pilihan kelas unik untuk dropdown filter
  const opsiKelas = [
    ...new Set(santriList.map((s) => (s.kelas || "").trim()).filter(Boolean)),
  ].sort();

  // Kelompokkan hasil filter per kamar (NULL/'' menjadi "Belum ada kamar")
  const kelompokKamarUrut = (arr) => {
    const map = {};
    arr.forEach((s) => {
      const key = (s.kamar || "").trim() || "=tanpa-kamar=";
      (map[key] ||= []).push(s);
    });
    return Object.keys(map)
      .map((k) => ({
        key: k,
        label: k === "=tanpa-kamar=" ? "Belum ada kamar" : k,
        items: map[k],
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };
  const groupedByKamar = {};
  santriList.forEach((s) => {
    const key = (s.kamar || "").trim() || "=tanpa-kamar=";
    (groupedByKamar[key] ||= []).push(s);
  });
  const kelompokKamar = kelompokKamarUrut(filteredSantri);

  const selectedSantriCount = (form.santri_ids || []).length;

  return (
    <div className="bg-card rounded-3xl border border-line shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-line flex items-center gap-4">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-xl bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.07] flex items-center justify-center text-muted transition flex-shrink-0"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-ink">
            {isEdit ? "Edit Jadwal Aktivitas" : "Buat Jadwal Baru"}
          </h2>
          <p className="text-sm text-muted mt-0.5">
            {isEdit
              ? "Perubahan akan mengupdate jadwal yang sudah ada."
              : "Jadwal akan langsung dikirim ke santri yang dipilih."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-6 max-w-4xl">
        {/* Nama Aktivitas */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1.5">
            Nama Aktivitas <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.nama_aktivitas}
            onChange={(e) => set("nama_aktivitas", e.target.value)}
            placeholder="cth: Kelas 11 — Senin"
            className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-base"
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <select
              required
              value={form.kategori_id}
              onChange={(e) => set("kategori_id", e.target.value)}
              className="flex-1 px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base transition"
            >
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowKategoriForm(!showKategoriForm)}
              className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-500/15 hover:bg-green-50 dark:hover:bg-green-500/12 dark:bg-green-500/12 text-green-700 dark:text-green-300 font-bold rounded-xl transition text-sm"
            >
              <FiPlus size={16} />
              {showKategoriForm ? "Tutup" : "Tambah Kategori"}
            </button>
          </div>

          {showKategoriForm && (
            <form onSubmit={addKategori} className="mt-3 flex gap-2">
              <input
                type="text"
                value={kategoriForm.nama}
                onChange={(e) => setKategoriForm({ nama: e.target.value })}
                placeholder="Nama kategori baru..."
                className="flex-1 px-4 py-2 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition duration-300 text-sm"
              >
                Tambah
              </button>
            </form>
          )}
        </div>

        {/* Mode Pertanian/Perkebunan: pilih Tanaman dari Koleksi + aksi */}
        {isPertanian && (
          <div>
            <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-xl mb-3">
              <FiTrendingUp
                size={18}
                className="text-emerald-600 dark:text-emerald-300 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-emerald-800">
                Kategori pertanian/perkebunan: jadwal berbasis{" "}
                <b>Koleksi Tanaman</b>. Pilih tanaman & centang aksi perawatan —
                laporan santri akan otomatis tercatat di riwayat tanaman.
              </p>
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-ink">
                Pilih Tanaman dari Koleksi{" "}
                <span className="text-red-500">*</span>
              </label>
              {!loadingSemuaTanaman && semuaTanaman.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if ((form.tanaman_terpilih || []).length > 0) {
                      set("tanaman_terpilih", []);
                    } else {
                      set(
                        "tanaman_terpilih",
                        semuaTanaman.map((t) => ({
                          tanaman_id: Number(t.id),
                          aksi: [],
                        })),
                      );
                    }
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg border border-green-300 dark:border-green-500/40 text-green-700 dark:text-green-300 font-semibold hover:bg-green-50 dark:hover:bg-green-500/10 dark:bg-green-500/10 transition"
                >
                  {(form.tanaman_terpilih || []).length > 0
                    ? "Kosongkan"
                    : "Pilih Semua"}
                </button>
              )}
            </div>

            {loadingSemuaTanaman ? (
              <div className="flex items-center gap-3 p-4 bg-surface2 border border-line rounded-xl text-muted text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                Memuat koleksi tanaman...
              </div>
            ) : semuaTanaman.length === 0 ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
                <p className="font-bold">Belum ada tanaman di koleksi</p>
                <p className="mt-1 text-amber-600 dark:text-amber-300">
                  Tambahkan tanaman lewat menu Manajemen Tanaman, lalu kembali
                  ke sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {semuaTanaman.map((tanamanItem) => {
                  const isSelected = (form.tanaman_terpilih || []).some(
                    (t) => Number(t.tanaman_id) === Number(tanamanItem.id),
                  );
                  const entry = (form.tanaman_terpilih || []).find(
                    (t) => Number(t.tanaman_id) === Number(tanamanItem.id),
                  );
                  const entryAksi = Array.isArray(entry?.aksi)
                    ? entry.aksi
                    : [];
                  return (
                    <div
                      key={tanamanItem.id}
                      className={`rounded-xl border-2 p-3 transition ${
                        isSelected
                          ? "border-green-500 bg-green-50 dark:bg-green-500/15"
                          : "border-line bg-card hover:border-green-300/60 dark:hover:border-green-500/20"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTanamanPertanian(tanamanItem.id)}
                        className="flex items-center gap-3 w-full text-left"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface2 flex-shrink-0">
                          {tanamanItem.gambar ? (
                            <img loading="lazy" decoding="async"
                              src={`${API}/uploads/${tanamanItem.gambar}`}
                              alt={tanamanItem.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-green-600 dark:text-green-300">
                              <FiImage size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? "bg-green-500 border-green-500"
                                  : "border-line"
                              }`}
                            >
                              {isSelected && (
                                <FiCheckCircle
                                  size={12}
                                  className="text-white"
                                />
                              )}
                            </div>
                            <p className="font-bold text-sm truncate">
                              {tanamanItem.nama}
                            </p>
                          </div>
                          {tanamanItem.jenis && (
                            <p className="text-xs text-muted truncate mt-0.5">
                              {tanamanItem.jenis}
                            </p>
                          )}
                        </div>
                      </button>

                      {/* Aksi perawatan — muncul saat tanaman dipilih */}
                      {isSelected &&
                        (aksiLoading ? (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-500/30">
                            <p className="text-[11px] text-muted">
                              Memuat aksi perawatan...
                            </p>
                          </div>
                        ) : aksiError ? (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-500/30">
                            <p className="text-[11px] font-semibold text-red-500">
                              Gagal memuat aksi perawatan: {aksiError}
                            </p>
                            <button
                              type="button"
                              onClick={() => fetchAksiGlobal()}
                              className="mt-1.5 px-3 py-1 rounded-md bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition"
                            >
                              Muat Ulang
                            </button>
                          </div>
                        ) : aksiList.length === 0 ? (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-500/30">
                            <p className="text-[11px] text-muted">
                              Tidak ada aksi perawatan untuk kategori ini.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-500/30">
                            <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                              Aksi Perawatan
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {aksiList.map((aksi) => {
                                const checked = entryAksi.includes(aksi);
                                return (
                                  <button
                                    key={aksi}
                                    type="button"
                                    onClick={() =>
                                      toggleAksiTanaman(tanamanItem.id, aksi)
                                    }
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                                      checked
                                        ? "bg-green-600 border-green-600 text-white"
                                        : "bg-card border-line text-muted hover:border-green-400/60"
                                    }`}
                                  >
                                    {getAksiIcon(AKSI_LABEL[aksi] || aksi)}
                                    {AKSI_LABEL[aksi] || aksi}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted mt-2">
              {(form.tanaman_terpilih || []).length} tanaman dipilih — tiap
              tanaman boleh dipilih lebih dari satu aksi.
            </p>
          </div>
        )}

        {/* Mode Peternakan: pilih Ternak dari Koleksi + aksi */}
        {isPeternakan && (
          <div>
            <div className="flex items-start gap-3 p-4 bg-teal-50 dark:bg-teal-500/15 border border-teal-200 dark:border-teal-500/30 rounded-xl mb-3">
              <FiTrendingUp
                size={18}
                className="text-teal-600 dark:text-teal-300 flex-shrink-0 mt-0.5"
              />
              <p className="text-sm text-teal-800">
                Kategori peternakan: jadwal berbasis <b>Koleksi Ternak</b>.
                Pilih ternak & centang aksi perawatan (pakan, minum, kebersihan
                kandang, dll) — laporan santri akan otomatis tercatat di
                riwayat ternak.
              </p>
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-ink">
                Pilih Ternak dari Koleksi{" "}
                <span className="text-red-500">*</span>
              </label>
              {!loadingSemuaTernak && semuaTernak.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if ((form.ternak_terpilih || []).length > 0) {
                      set("ternak_terpilih", []);
                    } else {
                      set(
                        "ternak_terpilih",
                        semuaTernak.map((t) => ({
                          ternak_id: Number(t.id),
                          aksi: [],
                        })),
                      );
                    }
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg border border-teal-300 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 font-semibold hover:bg-teal-50 dark:hover:bg-teal-500/10 dark:bg-teal-500/10 transition"
                >
                  {(form.ternak_terpilih || []).length > 0
                    ? "Kosongkan"
                    : "Pilih Semua"}
                </button>
              )}
            </div>

            {loadingSemuaTernak ? (
              <div className="flex items-center gap-3 p-4 bg-surface2 border border-line rounded-xl text-muted text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600" />
                Memuat koleksi ternak...
              </div>
            ) : semuaTernak.length === 0 ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-sm">
                <p className="font-bold">Belum ada ternak di koleksi</p>
                <p className="mt-1 text-amber-600 dark:text-amber-300">
                  Tambahkan ternak lewat menu Manajemen, lalu kembali ke sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {semuaTernak.map((ternakItem) => {
                  const isSelected = (form.ternak_terpilih || []).some(
                    (t) => Number(t.ternak_id) === Number(ternakItem.id),
                  );
                  const entry = (form.ternak_terpilih || []).find(
                    (t) => Number(t.ternak_id) === Number(ternakItem.id),
                  );
                  const entryAksi = Array.isArray(entry?.aksi)
                    ? entry.aksi
                    : [];
                  const daftarAksi =
                    (ternakAksiMap[ternakItem.id] || []) || [];
                  return (
                    <div
                      key={ternakItem.id}
                      className={`rounded-xl border-2 p-3 transition ${
                        isSelected
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-500/15"
                          : "border-line bg-card hover:border-teal-300/60 dark:border-teal-500/20"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTernakPeternakan(ternakItem.id)}
                        className="flex items-center gap-3 w-full text-left"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-teal-600 to-green-800 flex items-center justify-center flex-shrink-0">
                          {ternakItem.foto ? (
                            <img
                              src={`${API}/uploads/${ternakItem.foto}`}
                              alt={ternakItem.nama}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <FiImage size={20} className="text-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? "bg-teal-500 border-teal-500"
                                  : "border-line"
                              }`}
                            >
                              {isSelected && (
                                <FiCheckCircle
                                  size={12}
                                  className="text-white"
                                />
                              )}
                            </div>
                            <p className="font-bold text-sm truncate capitalize">
                              {ternakItem.nama}
                            </p>
                          </div>
                          <p className="text-xs text-muted truncate mt-0.5 capitalize">
                            {ternakItem.kategori || "ternak"} •{" "}
                            {ternakItem.total ?? 0} ekor
                          </p>
                        </div>
                      </button>

                      {/* Aksi perawatan — muncul saat ternak dipilih */}
                      {isSelected &&
                        (aksiTernakLoading ? (
                          <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-500/30">
                            <p className="text-[11px] text-muted">
                              Memuat aksi perawatan...
                            </p>
                          </div>
                        ) : aksiTernakError ? (
                          <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-500/30">
                            <p className="text-[11px] font-semibold text-red-500">
                              Gagal memuat aksi perawatan: {aksiTernakError}
                            </p>
                            <button
                              type="button"
                              onClick={() => fetchSemuaAksiTernak()}
                              className="mt-1.5 px-3 py-1 rounded-md bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
                            >
                              Muat Ulang
                            </button>
                          </div>
                        ) : daftarAksi.length === 0 ? (
                          <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-500/30">
                            <p className="text-[11px] text-muted">
                              Tidak ada aksi perawatan untuk ternak ini.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-teal-200 dark:border-teal-500/30">
                            <p className="text-[11px] font-bold text-muted uppercase tracking-wide mb-1.5">
                              Aksi Perawatan
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {daftarAksi.map((aksi) => {
                                const checked = entryAksi.includes(
                                  Number(aksi.id),
                                );
                                return (
                                  <button
                                    key={aksi.id}
                                    type="button"
                                    onClick={() =>
                                      toggleAksiTernak(
                                        ternakItem.id,
                                        Number(aksi.id),
                                      )
                                    }
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                                      checked
                                        ? "bg-teal-600 border-teal-600 text-white"
                                        : "bg-card border-line text-muted hover:border-teal-400/60"
                                    }`}
                                  >
                                    {getAksiIcon(aksi.label || aksi.nama_aksi)}
                                    {aksi.label || aksi.nama_aksi}
                                    {aksi.butuh_input_angka && (
                                      <span className="text-[9px] font-bold uppercase opacity-80">
                                        • angka
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted mt-2">
              {(form.ternak_terpilih || []).length} ternak dipilih — tiap
              ternak boleh dipilih lebih dari satu aksi.
            </p>
          </div>
        )}

        {isPendidikan && (
          <div>
            <label className="block text-sm font-bold text-ink mb-2">Pilih Kelas</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {kelasList.map((kls) => {
                const isSelected = (form.kelas_terpilih || []).some((k) => Number(k.kelas_id) === Number(kls.id));
                const entry = (form.kelas_terpilih || []).find((k) => Number(k.kelas_id) === Number(kls.id));
                const entryAksi = Array.isArray(entry?.aksi) ? entry.aksi : [];
                return (
                  <div key={kls.id} className={`rounded-xl border-2 p-3 ${isSelected ? "border-violet-500 bg-violet-50 dark:bg-violet-500/15" : "border-line bg-card"}`}>
                    <button type="button" onClick={() => toggleKelas(kls.id)} className="flex items-center gap-3 w-full text-left">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                        {kls.foto ? (
                          <img
                            src={`${API}/uploads/${kls.foto}`}
                            alt={kls.nama}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <FiBookOpen size={20} className="text-white" />
                        )}
                      </div>
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0">{isSelected && <FiCheckCircle size={12} className="text-violet-600" />}</div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{kls.nama}</p>
                        {(kls.wali_kelas || kls.tahun_ajaran) && <p className="text-xs text-muted truncate">{[kls.wali_kelas, kls.tahun_ajaran].filter(Boolean).join(" · ")}</p>}
                      </div>
                    </button>
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-500/30">
                        <p className="text-[11px] font-bold text-muted uppercase mb-1.5">Aktivitas Kelas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {jenisPerawatanPendidikan.map((jp) => {
                            const checked = entryAksi.includes(jp.key) || entryAksi.includes(jp.label);
                            return (
                              <button key={jp.key} type="button" onClick={() => toggleAksiKelas(kls.id, jp.key)} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition ${checked ? "bg-violet-600 border-violet-600 text-white" : "bg-card border-line text-muted"}`}>
                                {getAktivitasKelasIcon(jp.key || jp.label)}
                                {jp.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-2">
                          <button type="button" onClick={() => setShowTambahJenis((v)=>!v)} className="text-xs text-violet-600">+ Tambah Aktivitas Kelas</button>
                          {showTambahJenis && (
                            <div className="flex gap-2 mt-2">
                              <input value={inputTambahJenis} onChange={(e)=>setInputTambahJenis(e.target.value)} placeholder="Nama aktivitas" className="flex-1 px-2 py-1 border border-line rounded text-xs" />
                              <button type="button" onClick={tambahJenisPerawatan} className="px-2 py-1 bg-violet-600 text-white rounded text-xs">Simpan</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Panel besar: daftar jadwal pelajaran kelas terpilih, dikelompokkan
                per hari Senin–Sabtu. Admin tinggal klik untuk memakai. */}
            {(form.kelas_terpilih || []).length > 0 && (
              <div className="mt-6 rounded-2xl border-2 border-violet-200 dark:border-violet-500/30 bg-violet-50/60 dark:bg-violet-500/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FiCalendar className="text-violet-600 dark:text-violet-300" size={20} />
                  <h3 className="text-base font-extrabold text-ink">
                    Jadwal Pelajaran Kelas
                  </h3>
                  <span className="text-xs text-muted">
                    — klik pelajaran untuk mengirimnya ke santri
                  </span>
                </div>

                {pelajaranTerpilih.length > 0 && (
                  <div className="mb-4 rounded-xl border border-violet-300 dark:border-violet-500/40 bg-card p-4">
                    <p className="text-sm font-extrabold text-ink mb-2 flex items-center gap-1.5">
                      <FiCheckCircle size={15} className="text-violet-600 dark:text-violet-300" />
                      Terpilih: {pelajaranTerpilih.length} pelajaran → dikirim
                      sebagai satu tiket
                    </p>
                    <div className="space-y-2">
                      {pelajaranTerpilih.map((j) => (
                        <div
                          key={`${j.pelajaran_id}-${j.hari}`}
                          className="grid grid-cols-[5.5rem_1fr] gap-3 items-start rounded-lg border border-line bg-surface2/50 px-3 py-2"
                        >
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-[11px] font-extrabold whitespace-nowrap">
                            {j.hari}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink truncate">
                              {j.mapel}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted flex-wrap">
                              <span className="inline-flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                                <FiClock size={11} />
                                {j.jam_mulai} - {j.jam_selesai}
                              </span>
                              {j.guru_nama && (
                                <span className="inline-flex items-center gap-1 truncate">
                                  <FiUser size={11} />
                                  {j.guru_nama}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loadingJadwalKelas ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-violet-600" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(form.kelas_terpilih || []).map((kt) => {
                      const klsId = Number(kt.kelas_id);
                      const kls = kelasList.find((k) => Number(k.id) === klsId);
                      const items = jadwalKelasMap[klsId] || [];
                      const semuaTerpilih =
                        items.length > 0 &&
                        items.every(
                          (item) =>
                            typeof item === "object" &&
                            jadwalIdDipakai(item.id),
                        );
                      return (
                        <div
                          key={klsId}
                          className="rounded-xl border border-line bg-card p-4"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                            <p className="font-extrabold text-ink">
                              {kls?.nama || `Kelas ${klsId}`}
                              <span className="ml-2 text-xs font-normal text-muted">
                                {items.length} pelajaran
                              </span>
                            </p>
                            {items.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleSemuaJadwalKelas(klsId)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold border-2 transition ${
                                  semuaTerpilih
                                    ? "bg-violet-600 border-violet-600 text-white"
                                    : "bg-violet-50 dark:bg-violet-500/15 border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/25"
                                }`}
                              >
                                <FiCheckCircle size={15} />
                                {semuaTerpilih ? "Kosongkan Semua" : "Pilih Semua"}
                              </button>
                            )}
                          </div>

                          {items.length === 0 ? (
                            <p className="text-sm text-muted">
                              Belum ada jadwal pelajaran untuk kelas ini.
                              Tambahkan dulu di menu Tahun Ajaran.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(
                                (hari) => {
                                  const daftar = items
                                    .filter(
                                      (it) =>
                                        typeof it === "object" && it.hari === hari,
                                    )
                                    .sort((a, b) =>
                                      String(a.jam_mulai).localeCompare(
                                        String(b.jam_mulai),
                                      ),
                                    );
                                  if (daftar.length === 0) return null;
                                  return (
                                    <div key={hari}>
                                      <p className="text-xs font-extrabold text-violet-600 dark:text-violet-300 uppercase tracking-wide mb-2">
                                        {hari}
                                      </p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {daftar.map((item) => {
                                          const aktif = jadwalIdDipakai(item.id);
                                          const guru =
                                            item.guru_nama || item.guru_nama_tampil;
                                          return (
                                            <button
                                              key={item.id}
                                              type="button"
                                              onClick={() =>
                                                toggleJadwalPelajaranAda(klsId, item)
                                              }
                                              className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition ${
                                                aktif
                                                  ? "border-violet-500 bg-violet-600 text-white"
                                                  : "border-line bg-surface2 hover:border-violet-400/70 dark:hover:border-violet-500/50"
                                              }`}
                                            >
                                              <div
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                  aktif
                                                    ? "bg-white border-white"
                                                    : "border-line"
                                                }`}
                                              >
                                                {aktif && (
                                                  <FiCheckCircle
                                                    size={13}
                                                    className="text-violet-600"
                                                  />
                                                )}
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <p
                                                  className={`font-bold text-sm truncate ${aktif ? "text-white" : "text-ink"}`}
                                                >
                                                  {item.mapel}
                                                </p>
                                                <p
                                                  className={`text-xs mt-0.5 ${aktif ? "text-white/90" : "text-muted"}`}
                                                >
                                                  {String(item.jam_mulai || "").slice(0, 5)}
                                                  {" – "}
                                                  {String(item.jam_selesai || "").slice(0, 5)}
                                                </p>
                                                {guru && (
                                                  <p
                                                    className={`text-xs mt-0.5 truncate ${aktif ? "text-white/80" : "text-muted"}`}
                                                  >
                                                    {guru}
                                                  </p>
                                                )}
                                              </div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}


        {/* Lokasi — wajib untuk semua kategori */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1.5">
            Lokasi <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.lokasi_id}
            onChange={(e) => handleLokasiChange(e.target.value)}
            className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base transition"
          >
            <option value="">-- Pilih Lokasi --</option>
            {lokasiList.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nama}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1">
            Pilih lokasi dari daftar Lokasi &amp; Area
          </p>
        </div>

        {/* Tanaman (Opsional) */}
        {!isPertanian && form.lokasi_id && !loadingTanaman && tanamanList.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-ink mb-2">
              Tanaman Terkait{" "}
              <span className="font-normal text-muted">(opsional)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tanamanList.map((tanaman) => {
                const isSelected = (form.tanaman_ids || []).includes(
                  tanaman.id,
                );
                return (
                  <button
                    key={tanaman.id}
                    type="button"
                    onClick={() => toggleTanaman(tanaman.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                      isSelected
                        ? "border-green-500 bg-green-50 dark:bg-green-500/15"
                        : "border-line bg-card hover:border-green-300/60 dark:hover:border-green-500/20"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-green-500 border-green-500"
                          : "border-line"
                      }`}
                    >
                      {isSelected && (
                        <FiCheckCircle size={12} className="text-white" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{tanaman.nama}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}



        {/* Jam */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">
              Jam Mulai <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="time"
              value={form.jam_mulai}
              onChange={(e) => set("jam_mulai", e.target.value)}
              className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">
              Jam Selesai <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="time"
              value={form.jam_selesai}
              onChange={(e) => set("jam_selesai", e.target.value)}
              className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base transition"
            />
          </div>
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="date"
              value={form.tanggal_mulai}
              onChange={(e) => set("tanggal_mulai", e.target.value)}
              className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base transition"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink mb-1.5">
              Tanggal Berakhir{" "}
              <span className="font-normal text-muted">(opsional)</span>
            </label>
            <input
              type="date"
              value={form.tanggal_selesai}
              min={form.tanggal_mulai}
              onChange={(e) => set("tanggal_selesai", e.target.value)}
              className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base transition"
            />
          </div>
        </div>

        {/* Pola Perulangan */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2">
            Pola Perulangan
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["sekali", "berulang"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  set("pola_perulangan", p);
                  if (p === "sekali") set("interval_hari", 1);
                }}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition text-center ${
                  form.pola_perulangan === p
                    ? "border-green-500 bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300 shadow-sm"
                    : "border-line bg-card text-muted hover:border-green-200/60 dark:border-green-500/20"
                }`}
              >
                {POLA_LABEL[p]}
              </button>
            ))}
          </div>
          {form.pola_perulangan === "berulang" && (
            <div className="mt-3 flex items-center gap-3 bg-surface2 rounded-xl px-4 py-3">
              <FiRepeat size={15} className="text-muted" />
              <span className="text-sm text-muted">Ulangi setiap</span>
              <input
                type="number"
                min={1}
                max={365}
                value={form.interval_hari}
                onChange={(e) => set("interval_hari", e.target.value)}
                className="w-20 px-3 py-1.5 border border-line rounded-lg text-base font-bold text-center focus:ring-2 focus:ring-green-500 outline-none bg-card"
              />
              <span className="text-sm text-muted">hari</span>
            </div>
          )}
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1.5">
            Deskripsi{" "}
            <span className="font-normal text-muted">(opsional)</span>
          </label>
          <textarea
            value={form.deskripsi}
            onChange={(e) => set("deskripsi", e.target.value)}
            rows={2}
            placeholder="Instruksi detail untuk santri..."
            className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none text-base transition"
          />
        </div>

        {/* Pemilih Santri */}
        <div>
          <label className="block text-sm font-bold text-ink mb-1.5">
            Santri Penerima <span className="text-red-500">*</span>
            <span className="font-normal text-muted text-xs ml-2">
              (Bisa pilih lebih dari 1 santri)
            </span>
          </label>

          {loadingSantri ? (
            <div className="flex items-center gap-3 p-4 bg-surface2 border border-line rounded-xl text-muted text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
              Memuat daftar santri...
            </div>
          ) : santriError ? (
            <div className="p-4 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl">
              <p className="font-bold text-red-700 dark:text-red-300">
                Gagal memuat daftar santri
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{santriError}</p>
              {santriLoginRequired ? (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("alfilaha_admin_token");
                    navigate("/admin/login");
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition duration-300"
                >
                  <FiLogIn size={14} /> Login Ulang
                </button>
              ) : (
                <button
                  type="button"
                  onClick={fetchSantri}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition duration-300"
                >
                  <FiRefreshCw size={14} /> Muat Ulang
                </button>
              )}
            </div>
          ) : santriList.length === 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 rounded-xl">
              <p className="font-bold text-amber-700 dark:text-amber-300">
                Belum ada santri yang diterima
              </p>
              <p className="text-amber-600 dark:text-amber-300 text-sm mt-1">
                Santri perlu mendaftar dan disetujui admin terlebih dahulu
              </p>
              <button
                type="button"
                onClick={fetchSantri}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition duration-300"
              >
                <FiRefreshCw size={14} /> Muat Ulang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Counter + Kosongkan */}
              <div
                className={`flex flex-wrap items-center gap-2 p-3 border rounded-xl ${
                  selectedSantriCount > 0
                    ? "bg-green-50 dark:bg-green-500/15 border-green-200 dark:border-green-500/30"
                    : "bg-surface2 border-line"
                }`}
              >
                <span
                  className={`text-xs font-semibold self-center ${selectedSantriCount > 0 ? "text-green-700 dark:text-green-300" : "text-muted"}`}
                >
                  {selectedSantriCount} santri dipilih
                </span>
                {selectedSantriCount > 0 && (
                  <button
                    type="button"
                    onClick={clearSantriSelection}
                    className="text-xs text-red-600 dark:text-red-300 hover:text-red-700 dark:text-red-300 font-semibold"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Search + filter kelas + aksi */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <FiSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Cari nama / username santri..."
                    value={santriSearch}
                    onChange={(e) => setSantriSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base w-full"
                  />
                </div>
                <select
                  value={santriFilterKelas}
                  onChange={(e) => setSantriFilterKelas(e.target.value)}
                  className="px-3 py-2 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base w-full sm:w-40"
                >
                  <option value="">Semua Kelas</option>
                  {opsiKelas.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={fetchSantri}
                  title="Muat ulang daftar santri"
                  className="px-3 py-2 bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.07] text-ink font-bold rounded-xl transition text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <FiRefreshCw size={14} /> Muat Ulang
                </button>
                <button
                  type="button"
                  onClick={selectAllVisibleSantri}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-50 dark:hover:bg-blue-500/12 dark:bg-blue-500/12 text-blue-700 dark:text-blue-300 font-bold rounded-xl transition text-sm whitespace-nowrap"
                >
                  Pilih Semua Hasil
                </button>
              </div>

              {/* Daftar santri — per kelompok kamar, pilihan tetap tersimpan saat pencarian berubah */}
              <div className="max-h-72 overflow-y-auto pr-1 space-y-3">
                {filteredSantri.length === 0 ? (
                  <p className="text-sm text-muted py-4 text-center">
                    Tidak ada santri yang cocok dengan pencarian / filter
                  </p>
                ) : (
                  kelompokKamar.map((group) => {
                    const ids = group.items.map((s) => s.id);
                    const current = form.santri_ids || [];
                    const semuaTerpilih =
                      ids.length > 0 && ids.every((id) => current.includes(id));
                    const sebagianTerpilih = ids.some((id) =>
                      current.includes(id),
                    );
                    return (
                      <div key={group.key}>
                        <button
                          type="button"
                          onClick={() => toggleKamarSantri(group.key)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface2 transition"
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              semuaTerpilih
                                ? "bg-green-500 border-green-500"
                                : sebagianTerpilih
                                  ? "bg-green-100 dark:bg-green-500/20 border-green-400"
                                  : "border-line"
                            }`}
                          >
                            {semuaTerpilih && (
                              <FiCheckCircle size={11} className="text-white" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-ink uppercase tracking-wide">
                            {group.label}
                          </span>
                          <span className="text-[10px] text-muted font-semibold">
                            ({group.items.length})
                          </span>
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                          {group.items.map((santri) => {
                            const isSelected = (form.santri_ids || []).includes(
                              santri.id,
                            );
                            return (
                              <button
                                key={santri.id}
                                type="button"
                                onClick={() => toggleSantri(santri.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition ${
                                  isSelected
                                    ? "border-green-500 bg-green-50 dark:bg-green-500/15"
                                    : "border-line bg-card hover:border-green-300/60 dark:hover:border-green-500/20"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? "bg-green-500 border-green-500"
                                      : "border-line"
                                  }`}
                                >
                                  {isSelected && (
                                    <FiCheckCircle
                                      size={12}
                                      className="text-white"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm truncate">
                                    {santri.username || santri.nama}
                                  </p>
                                  {santri.nama &&
                                    santri.nama !== santri.username && (
                                      <p className="text-xs text-muted truncate">
                                        {santri.nama}
                                      </p>
                                    )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {saveError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-sm font-medium">
            <FiAlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal menyimpan jadwal</p>
              <p className="mt-0.5 text-red-600 dark:text-red-300">{saveError}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={
              saving ||
              santriList.length === 0 ||
              (isPendidikan
                ? (form.kelas_terpilih || []).length === 0
                : isProduksi
                  ? isPertanian
                    ? (form.tanaman_terpilih || []).length === 0
                    : (form.ternak_terpilih || []).length === 0
                  : !(form.kegiatan_lokasi_ids || []).length)
            }
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-green-200/60 hover:shadow-sm"
          >
            {saving ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Menyimpan...
              </>
            ) : (
              <>
                <FiCheckCircle size={18} />
                {isEdit
                  ? "Simpan Perubahan"
                  : `Buat & Kirim ke ${selectedSantriCount} Santri`}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 border-2 border-line rounded-xl font-bold text-muted hover:bg-surface2 transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DETAIL JADWAL
═══════════════════════════════════════════════════════════ */
const DetailJadwal = ({
  jadwal,
  tugasList,
  onBack,
  onEdit,
  onRefresh,
  lastUpdated,
  newSelesaiCount,
}) => {
  const [filterTugas, setFilterTugas] = useState("semua");
  const tugas = tugasList.filter((t) => t.schedule_id === jadwal.id);
  const filtered =
    filterTugas === "semua"
      ? tugas
      : tugas.filter((t) => t.status === filterTugas);
  const stats = {
    total: tugas.length,
    selesai: tugas.filter((t) => t.status === "selesai").length,
    pending: tugas.filter((t) => t.status === "pending").length,
  };
  const persen = stats.total
    ? Math.round((stats.selesai / stats.total) * 100)
    : 0;

  const { utama: deskripsiUtama, perHari: pelajaranPerHari } =
    parseDeskripsiJadwal(jadwal.deskripsi);

  return (
    <div className="space-y-5">
      {/* Back + aksi */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.07] flex items-center justify-center text-muted transition"
        >
          <FiArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-extrabold text-ink text-lg truncate">
              {jadwal.nama_aktivitas}
            </h2>
            {newSelesaiCount > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full animate-pulse border border-emerald-200 dark:border-emerald-500/30">
                <FiBell size={11} /> {newSelesaiCount} baru selesai!
              </span>
            )}
          </div>
          <p className="text-xs text-muted">Detail & Riwayat Tiket Tugas</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Tombol refresh manual */}
          <button
            onClick={onRefresh}
            title="Refresh data terbaru"
            className="flex items-center gap-1.5 px-3 py-2 bg-surface2 hover:bg-surface2 text-muted font-bold rounded-xl text-xs transition border border-line"
          >
            <FiRefreshCw size={13} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/15 hover:bg-green-50 dark:hover:bg-green-500/12 dark:bg-green-500/12 text-green-700 dark:text-green-300 font-bold rounded-xl text-sm transition border border-green-200 dark:border-green-500/30"
          >
            <FiEdit2 size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Info header */}
      <div className="bg-card rounded-2xl border border-line shadow-sm p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getKategoriStyle(jadwal.nama_kategori || jadwal.kategori)}`}>
            {getKategoriIcon(jadwal.nama_kategori || jadwal.kategori)}
            {jadwal.nama_kategori || jadwal.kategori}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${clsStatus(jadwal.status)}`}
          >
            {jadwal.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1">
            <FiRepeat size={10} />
            {POLA_LABEL[jadwal.pola_perulangan] || jadwal.pola_perulangan}
            {jadwal.pola_perulangan === "berulang" &&
              ` · tiap ${jadwal.interval_hari} hari`}
          </span>
          {jadwal.jam_mulai && (
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
              <FiClock size={10} />
              {jadwal.jam_mulai} - {jadwal.jam_selesai}
            </span>
          )}
        </div>
        {deskripsiUtama && (
          <p className="text-sm text-muted mb-4 whitespace-pre-line">
            {deskripsiUtama}
          </p>
        )}

        {pelajaranPerHari.length > 0 && (
          <div className="mb-4 rounded-2xl border border-violet-200 dark:border-violet-500/30 bg-violet-50/50 dark:bg-violet-500/5 p-4">
            <p className="text-sm font-extrabold text-ink mb-3 flex items-center gap-1.5">
              <FiCalendar size={15} className="text-violet-600 dark:text-violet-300" />
              Jadwal Pelajaran
            </p>
            <div className="space-y-4">
              {pelajaranPerHari.map((grup, gi) => (
                <div key={`${grup.hari}-${gi}`}>
                  {grup.hari && (
                    <p className="text-xs font-extrabold text-violet-700 dark:text-violet-300 uppercase tracking-wide mb-1.5">
                      {grup.hari}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {grup.items.map((it, ii) => {
                      const { mapel, jam, guru } = parseBarisPelajaran(it);
                      return (
                        <div
                          key={ii}
                          className="grid grid-cols-[1fr_auto] gap-3 items-start rounded-lg border border-line bg-card px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink truncate">
                              {mapel}
                            </p>
                            {guru && (
                              <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5 truncate">
                                <FiUser size={11} className="shrink-0" />
                                {guru}
                              </p>
                            )}
                          </div>
                          {jam && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 dark:text-green-400 tabular-nums whitespace-nowrap pt-0.5">
                              <FiClock size={11} />
                              {jam}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-surface2 rounded-xl p-3">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
              Penanggung Jawab
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs font-bold flex items-center justify-center">
                {initials(jadwal.nama_pj)}
              </div>
              <p className="font-bold text-ink text-sm">
                {jadwal.nama_pj || "Belum ditentukan"}
              </p>
            </div>
          </div>
          <div className="bg-surface2 rounded-xl p-3">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
              Tanggal Mulai
            </p>
            <p className="font-bold text-ink text-sm">
              {fmtTgl(jadwal.tanggal_mulai)}
            </p>
          </div>
          <div className="bg-surface2 rounded-xl p-3">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
              Berakhir
            </p>
            <p className="font-bold text-ink text-sm">
              {jadwal.tanggal_selesai
                ? fmtTgl(jadwal.tanggal_selesai)
                : "Tidak terbatas"}
            </p>
          </div>
        </div>
        {/* Waktu terakhir refresh */}
        {lastUpdated && (
          <p className="text-[11px] text-muted mt-3 flex items-center gap-1">
            <FiClock size={10} /> Terakhir diperbarui: {lastUpdated}
          </p>
        )}
      </div>

      {/* Progress */}
      {stats.total > 0 && (
        <div className="bg-card rounded-2xl border border-line shadow-sm p-5">
          <div className="flex justify-between mb-2">
            <p className="text-sm font-bold text-ink flex items-center gap-1.5">
              <FiTrendingUp size={14} className="text-green-600 dark:text-green-300" />
              Progres Penyelesaian
            </p>
            <p className="text-sm font-extrabold text-green-600 dark:text-green-300">{persen}%</p>
          </div>
          <div className="w-full bg-surface2 rounded-full h-2.5 mb-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all"
              style={{ width: `${persen}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs font-semibold text-muted">
            <span className="text-green-600 dark:text-green-300">✓ {stats.selesai} selesai</span>
            <span className="text-amber-600 dark:text-amber-300">⏳ {stats.pending} pending</span>
            <span className="text-muted">
              ✕ {stats.total - stats.selesai - stats.pending} dilewati
            </span>
          </div>
        </div>
      )}

      {/* Tabel tiket */}
      <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-extrabold text-ink flex items-center gap-2">
            <FiList size={16} className="text-green-600 dark:text-green-300" />
            Riwayat Tiket ({tugas.length})
          </h3>
          <div className="flex gap-2 flex-wrap">
            {["semua", "pending", "selesai", "dilewati"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterTugas(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${filterTugas === f ? "bg-green-600 text-white" : "bg-surface2 text-muted dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.07]"}`}
              >
                {f}
                {f === "selesai" && stats.selesai > 0 && (
                  <span className="ml-1 bg-emerald-500 text-white text-[10px] px-1.5 rounded-full">
                    {stats.selesai}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted">
            <FiCalendar size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-sm">
              Belum ada tiket tugas{" "}
              {filterTugas !== "semua" ? `dengan status "${filterTugas}"` : ""}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface2 border-b border-line">
                <tr className="text-[11px] text-muted uppercase tracking-widest font-bold">
                  <th className="px-5 py-3">Tanggal Tugas</th>
                  <th className="px-5 py-3">Penanggung Jawab</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Diselesaikan</th>
                  <th className="px-5 py-3">Catatan</th>
                  <th className="px-5 py-3">Foto Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-gray-50/60 dark:hover:bg-white/[0.04] transition-colors ${t.status === "selesai" ? "bg-emerald-50/30 dark:bg-emerald-500/10" : ""}`}
                  >
                    <td className="px-5 py-3 font-bold text-ink text-sm">
                      {fmtTgl(t.tanggal_tugas)}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
                      {t.nama_santri || "–"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${clsTaskStatus(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted">
                      {t.diselesaikan_at
                        ? new Date(t.diselesaikan_at).toLocaleString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                          })
                        : "–"}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted max-w-[180px]">
                      {t.catatan ? (
                        <span className="italic text-muted">
                          "{t.catatan}"
                        </span>
                      ) : (
                        "–"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {t.foto_bukti ? (
                        <a
                          href={`${API}/uploads/${t.foto_bukti}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-50 dark:hover:bg-blue-500/12 dark:bg-blue-500/12 text-blue-700 dark:text-blue-300 font-bold text-[11px] rounded-lg transition border border-blue-200 dark:border-blue-500/30"
                        >
                          <FiImage size={11} /> Lihat Foto
                        </a>
                      ) : (
                        <span className="text-xs text-muted">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   REKAP KINERJA
═══════════════════════════════════════════════════════════ */
const RekapKinerja = ({ rekapList, onBack }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-surface2 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.07] flex items-center justify-center text-muted transition"
      >
        <FiArrowLeft size={18} />
      </button>
      <div>
        <h2 className="font-extrabold text-ink text-lg flex items-center gap-2">
          <FiBarChart2 size={18} className="text-green-600 dark:text-green-300" />
          Rekap Kinerja Santri
        </h2>
        <p className="text-xs text-muted">
          Statistik penyelesaian tugas semua santri
        </p>
      </div>
    </div>
    {rekapList.length === 0 ? (
      <div className="bg-card rounded-2xl border border-line shadow-sm p-16 text-center text-muted">
        <FiBarChart2 size={40} className="mx-auto mb-4 opacity-30" />
        <p className="font-bold text-muted">Belum ada data rekap kinerja.</p>
        <p className="text-sm mt-1">
          Data muncul setelah santri mulai menerima tugas.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rekapList.map((r, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border-2 border-line hover:border-green-200/60 dark:border-green-500/20 shadow-sm p-5 transition-all duration-300 hover:shadow-[0_14px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-none"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                {initials(r.nama_santri)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-ink truncate">
                  {r.nama_santri || "–"}
                </p>
                <p className="text-xs text-muted">
                  {r.total_tugas} total tugas
                </p>
              </div>
              <div
                className={`text-lg font-extrabold ${r.persen_selesai >= 80 ? "text-green-600 dark:text-green-300" : r.persen_selesai >= 50 ? "text-amber-500" : "text-red-500"}`}
              >
                {r.persen_selesai}%
              </div>
            </div>
            <div className="mb-3">
              <div className="w-full bg-surface2 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${r.persen_selesai >= 80 ? "bg-green-500" : r.persen_selesai >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${r.persen_selesai}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 dark:bg-emerald-500/15 rounded-xl p-2">
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                  {r.selesai}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold">
                  Selesai
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/15 rounded-xl p-2">
                <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                  {r.pending}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">Pending</p>
              </div>
              <div className="bg-surface2 rounded-xl p-2">
                <p className="text-lg font-extrabold text-muted">
                  {r.dilewati}
                </p>
                <p className="text-[10px] text-muted font-bold">Dilewati</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   KOMPONEN UTAMA
═══════════════════════════════════════════════════════════ */
const JadwalManager = () => {
  const [view, setView] = useState("list"); // list|form|detail|rekap
  const [jadwalList, setJadwalList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [rekapList, setRekapList] = useState([]);
  const [, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [hapusModal, setHapusModal] = useState(null);
  const [statusBusy, setStatusBusy] = useState(null);

  // Kunci scroll halaman selama modal konfirmasi terbuka
  useEffect(() => {
    document.body.style.overflow = hapusModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hapusModal]);
  // Tracking polling
  const [lastUpdated, setLastUpdated] = useState("");
  const [newSelesaiCount, setNewSelesaiCount] = useState(0);
  const prevSelesaiRef = useRef(0);

  const notif = useNotifikasi();

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [rJ, rT, rR] = await Promise.all([
        adminFetch(`${API}/api/jadwal`),
        adminFetch(`${API}/api/tugas`),
        adminFetch(`${API}/api/rekap-tugas`),
      ]);
      const [j, t, r] = await Promise.all([rJ.json(), rT.json(), rR.json()]);
      const tugasBaru = Array.isArray(t) ? t : [];
      // Hitung berapa tugas yang baru selesai sejak fetch terakhir
      const jumlahSelesaiBaru = tugasBaru.filter(
        (x) => x.status === "selesai",
      ).length;
      if (
        prevSelesaiRef.current > 0 &&
        jumlahSelesaiBaru > prevSelesaiRef.current
      ) {
        setNewSelesaiCount(jumlahSelesaiBaru - prevSelesaiRef.current);
        setTimeout(() => setNewSelesaiCount(0), 8000); // badge hilang 8 detik
      }
      prevSelesaiRef.current = jumlahSelesaiBaru;
      setJadwalList(Array.isArray(j) ? j : []);
      setTugasList(tugasBaru);
      setRekapList(Array.isArray(r) ? r : []);
      // Update waktu refresh
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    } catch (err) {
      console.error(err);
      if (!silent) notif.error("Gagal memuat data dari server");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Fetch santri terpisah dengan fallback — hanya yang Diterima
  const fetchSantri = useCallback(async () => {
    try {
      // Coba endpoint khusus dulu (sudah filter Diterima di server)
      let res = await adminFetch(`${API}/api/santri-terdaftar`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSantriList(data);
          return;
        }
      }
      // Fallback ke endpoint pendaftar_santri, filter manual di sini
      res = await adminFetch(`${API}/api/pendaftar_santri`);
      if (res.ok) {
        const data = await res.json();
        const diterima = Array.isArray(data)
          ? data.filter((s) => s.status_pendaftaran === "Diterima")
          : [];
        setSantriList(diterima);
      }
    } catch (err) {
      console.error("Gagal fetch santri:", err);
      try {
        const res = await adminFetch(`${API}/api/pendaftar_santri`);
        if (res.ok) {
          const data = await res.json();
          setSantriList(
            Array.isArray(data)
              ? data.filter((s) => s.status_pendaftaran === "Diterima")
              : [],
          );
        }
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchSantri();
  }, [fetchAll, fetchSantri]);

  // Polling otomatis: 8 detik saat detail, 30 detik saat list/rekap
  useEffect(() => {
    const interval = view === "detail" ? 8000 : 30000;
    const timer = setInterval(() => fetchAll(true), interval);
    return () => clearInterval(timer);
  }, [view, fetchAll]);

  /* CRUD */
  const handleSave = async (form) => {
    const isEdit = !!form.id;
    const url = isEdit ? `${API}/api/jadwal/${form.id}` : `${API}/api/jadwal`;
    const method = isEdit ? "PUT" : "POST";

    let res;
    try {
      res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (netErr) {
      throw new Error(
        "Tidak bisa terhubung ke server. Pastikan server sudah dijalankan: node server-update.js",
      );
    }

    let data;
    try {
      data = await res.json();
    } catch (_) {
      data = {};
    }

    if (res.status === 404) {
      throw new Error(
        "Endpoint tidak ditemukan (404). Server perlu di-restart dengan file terbaru: Ctrl+C lalu node server-update.js",
      );
    }
    if (!res.ok) {
      throw new Error(
        data.error || data.message || `Server error ${res.status}`,
      );
    }

    // Sukses — tampilkan notifikasi dan reload data
    const jumlahSantri = Array.isArray(form?.santri_ids)
      ? form.santri_ids.length
      : 0;
    notif.success(
      isEdit
        ? `Jadwal "${form.nama_aktivitas}" berhasil diperbarui!`
        : `Jadwal berhasil dikirim ke ${jumlahSantri} santri.`,
    );
    setView("list");
    setEditData(null);
    // Reload data agar list dan stat cards langsung update
    setTimeout(() => {
      fetchAll();
      fetchSantri();
    }, 300);
  };

  const handleHapus = async (id) => {
    try {
      const res = await adminFetch(`${API}/api/jadwal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notif.success("Jadwal dihapus!");
      setHapusModal(null);
      await fetchAll();
    } catch {
      notif.error("Gagal menghapus jadwal");
    }
  };

  // Saklar ON/OFF — optimistis: tampilan langsung berubah, dikembalikan bila server gagal
  const handleToggleStatus = async (id, cur) => {
    if (statusBusy === id) return;
    const next = cur === "aktif" ? "nonaktif" : "aktif";
    setStatusBusy(id);
    setJadwalList((lst) =>
      lst.map((j) => (j.id === id ? { ...j, status: next } : j)),
    );
    try {
      const res = await adminFetch(`${API}/api/jadwal/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      notif.success(`Jadwal ${next === "aktif" ? "diaktifkan" : "dijeda"}!`);
    } catch {
      setJadwalList((lst) =>
        lst.map((j) => (j.id === id ? { ...j, status: cur } : j)),
      );
      notif.error("Gagal mengubah status jadwal");
    } finally {
      setStatusBusy(null);
    }
  };

  /* Filter */
  const filtered = jadwalList.filter((j) => {
    const q = search.toLowerCase();
    return (
      (j.nama_aktivitas?.toLowerCase().includes(q) ||
        j.kategori?.toLowerCase().includes(q) ||
        j.nama_pj?.toLowerCase().includes(q)) &&
      (filterStatus === "semua" || j.status === filterStatus)
    );
  });

  /* Stats */
  const stats = {
    total: jadwalList.length,
    aktif: jadwalList.filter((j) => j.status === "aktif").length,
    nonaktif: jadwalList.filter((j) => j.status === "nonaktif").length,
    pending: tugasList.filter((t) => t.status === "pending").length,
    selesai: tugasList.filter((t) => t.status === "selesai").length,
  };

  /* ── VIEWS ── */
  if (view === "form")
    return (
      <FormJadwalBaru
        initial={editData}
        onSave={handleSave}
        onCancel={() => {
          setView("list");
          setEditData(null);
        }}
      />
    );

  if (view === "detail" && detailData)
    return (
      <DetailJadwal
        jadwal={detailData}
        tugasList={tugasList}
        onBack={() => {
          setView("list");
          setDetailData(null);
          setNewSelesaiCount(0);
        }}
        onEdit={() => {
          setEditData(detailData);
          setView("form");
        }}
        onRefresh={() => fetchAll(false)}
        lastUpdated={lastUpdated}
        newSelesaiCount={newSelesaiCount}
      />
    );

  if (view === "rekap")
    return (
      <RekapKinerja rekapList={rekapList} onBack={() => setView("list")} />
    );

  /* ── LIST UTAMA ── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-ink flex items-center gap-3">
            <div className="w-11 h-11 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-300">
              <FiCalendar size={22} />
            </div>
            Jadwal Aktivitas Pondok
          </h2>
          <p className="text-muted text-sm mt-1 font-medium">
            Buat & kelola jadwal — otomatis masuk ke dashboard santri.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setView("rekap")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-50 dark:hover:bg-blue-500/12 dark:bg-blue-500/12 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-sm transition border border-blue-200 dark:border-blue-500/30"
          >
            <FiBarChart2 size={14} /> Rekap Kinerja
          </button>
          <button
            onClick={() => {
              setEditData(null);
              setView("form");
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition shadow-sm shadow-green-200/60 hover:shadow-sm"
          >
            <FiPlus size={16} /> Jadwal Baru
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: "Total Jadwal",
            val: stats.total,
            bg: "bg-surface2",
            text: "text-ink",
          },
          {
            label: "Aktif",
            val: stats.aktif,
            bg: "bg-emerald-50 dark:bg-emerald-500/15",
            text: "text-emerald-700 dark:text-emerald-300",
          },
          {
            label: "Dijeda",
            val: stats.nonaktif,
            bg: "bg-amber-50 dark:bg-amber-500/15",
            text: "text-amber-700 dark:text-amber-300",
          },
          {
            label: "Tugas Pending",
            val: stats.pending,
            bg: "bg-orange-50 dark:bg-orange-500/15",
            text: "text-orange-700 dark:text-orange-300",
          },
          {
            label: "Tugas Selesai",
            val: stats.selesai,
            bg: "bg-blue-50 dark:bg-blue-500/15",
            text: "text-blue-700 dark:text-blue-300",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}
          >
            <p className={`text-2xl font-extrabold ${s.text}`}>{s.val}</p>
            <p className="text-xs text-muted font-semibold mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aktivitas, kategori, atau nama santri..."
            className="w-full pl-10 pr-4 py-3 bg-card border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-base transition shadow-sm"
          />
          <FiSearch
            className="absolute left-3.5 top-3.5 text-muted"
            size={16}
          />
        </div>
        <div className="flex gap-2">
          {["semua", "aktif", "nonaktif", "selesai"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition border ${filterStatus === s ? "bg-green-600 text-white border-green-600" : "bg-card text-muted border-line hover:border-green-300/60 dark:hover:border-green-500/20 shadow-sm"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-line p-16 text-center shadow-sm">
          <FiCalendar size={40} className="mx-auto text-muted mb-4" />
          <p className="font-bold text-muted text-lg mb-1">
            Tidak ada jadwal ditemukan
          </p>
          <p className="text-muted text-sm">
            Coba ubah filter atau buat jadwal baru.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => {
            const jTugas = tugasList.filter((t) => t.schedule_id === j.id);
            const jSelesai = jTugas.filter(
              (t) => t.status === "selesai",
            ).length;
            const jPersen = jTugas.length
              ? Math.round((jSelesai / jTugas.length) * 100)
              : 0;

            return (
              <div
                key={j.id}
                className="group bg-card border-2 border-line hover:border-green-200/60 dark:hover:border-green-500/20 hover:shadow-[0_14px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-none rounded-2xl p-5 transition-all cursor-pointer"
                onClick={() => {
                  setDetailData(j);
                  setView("detail");
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Kiri */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl font-extrabold text-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      /peternakan/i.test(String(j.nama_kategori||j.kategori||'')) ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
                      /pendidikan|kelas/i.test(String(j.nama_kategori||j.kategori||'')) ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300' :
                      /pertanian|perkebunan/i.test(String(j.nama_kategori||j.kategori||'')) ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                      'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                    }`}>
                      {getKategoriIcon(j.nama_kategori||j.kategori)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${getKategoriStyle(j.nama_kategori || j.kategori)}`}>
                          {getKategoriIcon(j.nama_kategori || j.kategori)}
                          {j.nama_kategori || j.kategori}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${clsStatus(j.status)}`}
                        >
                          {j.status}
                        </span>
                        <span className="text-[11px] text-muted flex items-center gap-1">
                          <FiRepeat size={10} />
                          {POLA_LABEL[j.pola_perulangan]}
                          {j.pola_perulangan !== "sekali" &&
                            ` · ${j.interval_hari} hari`}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-ink text-base truncate">
                        {j.nama_aktivitas}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        {j.nama_pj ? (
                          <span className="text-xs text-muted flex items-center gap-1">
                            <FiUser size={11} />
                            <span className="font-semibold text-ink">
                              {j.nama_pj}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-300 flex items-center gap-1 font-semibold">
                            <FiAlertTriangle size={11} /> Belum ada PJ
                          </span>
                        )}
                        <span className="text-xs text-muted flex items-center gap-1">
                          <FiClock size={11} /> Mulai {fmtTgl(j.tanggal_mulai)}
                        </span>
                      </div>
                      {/* Mini progress */}
                      {jTugas.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-surface2 rounded-full h-1.5 max-w-[120px]">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${jPersen}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted font-semibold">
                            {jSelesai}/{jTugas.length} selesai
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kanan — aksi */}
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {j.status === "selesai" ? (
                      <span
                        title="Selesai"
                        className="p-2.5 rounded-xl border bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
                      >
                        <FiCheckCircle size={16} />
                      </span>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={j.status === "aktif"}
                        title={
                          j.status === "aktif"
                            ? "Aktif, klik untuk nonaktifkan"
                            : "Nonaktif, klik untuk aktifkan"
                        }
                        disabled={statusBusy === j.id}
                        onClick={() => handleToggleStatus(j.id, j.status)}
                        className="flex items-center gap-2 min-h-[44px] rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed select-none"
                      >
                        <span
                          className={`relative inline-flex w-12 h-7 rounded-full transition-colors ${j.status === "aktif" ? "bg-green-600" : "bg-gray-300 dark:bg-gray-700"}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-card shadow-md transition-transform ${j.status === "aktif" ? "translate-x-5" : ""}`}
                          />
                        </span>
                        <span className="hidden sm:inline text-xs font-bold text-muted">
                          {j.status === "aktif" ? "Aktif" : "Nonaktif"}
                        </span>
                      </button>
                    )}
                    <button
                      title="Edit"
                      onClick={() => {
                        setEditData(j);
                        setView("form");
                      }}
                      className="p-2.5 rounded-xl border bg-surface2 text-muted border-line hover:bg-surface2 transition"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      title="Hapus"
                      onClick={() => setHapusModal(j)}
                      className="p-2.5 rounded-xl border bg-red-50 dark:bg-red-500/15 text-red-500 border-red-200 dark:border-red-500/30 hover:bg-red-100/60 dark:hover:bg-red-500/12 transition-colors duration-300"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Hapus */}
      {hapusModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-5">
              <FiTrash2 size={26} />
            </div>
            <h3 className="text-xl font-extrabold text-ink text-center mb-2">
              Hapus Jadwal?
            </h3>
            <p className="text-muted text-center text-sm mb-6">
              Jadwal <strong>"{hapusModal.nama_aktivitas}"</strong> beserta
              seluruh riwayat tiketnya akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleHapus(hapusModal.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setHapusModal(null)}
                className="flex-1 border-2 border-line text-muted font-bold py-3 rounded-xl hover:bg-surface2 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JadwalManager;
