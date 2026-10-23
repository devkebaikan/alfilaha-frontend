import { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiChevronRight,
  FiSave,
  FiUser,
} from "react-icons/fi";
import { adminFetch } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const barisKosong = (hari = "Senin") => ({
  hari,
  jam_mulai: "07:00",
  jam_selesai: "08:00",
  mapel: "",
  guru_id: "",
  guru_nama: "",
});

export default function TahunAjaranManager() {
  const notif = useNotifikasi();

  // ── Jadwal pelajaran per kelas ──
  const [kelasList, setKelasList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [kelasAktif, setKelasAktif] = useState(null);
  const [jadwalList, setJadwalList] = useState([]);
  const [hariAktif, setHariAktif] = useState("Senin");
  const [loadingJadwal, setLoadingJadwal] = useState(false);
  const [savingJadwal, setSavingJadwal] = useState(false);

  const fetchKelasGuru = useCallback(async () => {
    try {
      const [rk, rg] = await Promise.all([
        adminFetch(`${API}/api/admin/kelas`),
        adminFetch(`${API}/api/pendidikan/guru`),
      ]);
      if (rk.ok) {
        const data = await rk.json();
        setKelasList(Array.isArray(data) ? data : data?.kelas || []);
      }
      if (rg.ok) setGuruList(await rg.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchKelasGuru();
  }, [fetchKelasGuru]);

  // ── Jadwal pelajaran ──
  const muatJadwal = async (kelas, hari = "Senin") => {
    setLoadingJadwal(true);
    try {
      const res = await fetch(`${API}/api/pendidikan/jadwal/${kelas.id}`);
      let tersimpan = [];
      if (res.ok) {
        const rows = await res.json();
        tersimpan = (Array.isArray(rows) ? rows : []).map((r) => ({
          id: r.id,
          hari: r.hari || "Senin",
          jam_mulai: String(r.jam_mulai || "07:00").slice(0, 5),
          jam_selesai: String(r.jam_selesai || "08:00").slice(0, 5),
          mapel: r.mapel || "",
          guru_id: r.guru_id || "",
          guru_nama: r.guru_nama || r.guru_nama_tampil || "",
        }));
      }
      // Selalu sediakan satu baris input kosong untuk menambah pelajaran baru.
      setJadwalList([
        ...tersimpan,
        { ...barisKosong(hari), _key: `draft-${Date.now()}` },
      ]);
    } catch (e) {
      setJadwalList([{ ...barisKosong(hari), _key: `draft-${Date.now()}` }]);
    } finally {
      setLoadingJadwal(false);
    }
  };

  const bukaJadwal = async (kelas) => {
    setKelasAktif(kelas);
    setHariAktif("Senin");
    await muatJadwal(kelas, "Senin");
  };

  // Pastikan selalu ada satu baris input kosong untuk hari yang sedang aktif.
  const pindahHari = (hari) => {
    setHariAktif(hari);
    setJadwalList((prev) => {
      const adaDraft = prev.some((j) => !j.id && j.hari === hari);
      if (adaDraft) return prev;
      return [
        ...prev,
        { ...barisKosong(hari), _key: `draft-${hari}-${Date.now()}` },
      ];
    });
  };

  const tambahBaris = (hari) => {
    setJadwalList((prev) => {
      // Jangan menumpuk baris kosong: cukup satu baris input per hari.
      const adaKosong = prev.some(
        (j) => !j.id && j.hari === hari && !String(j.mapel || "").trim(),
      );
      if (adaKosong) return prev;
      return [
        ...prev,
        {
          ...barisKosong(hari),
          _key: `draft-${hari}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        },
      ];
    });
  };

  const updateBaris = (key, field, val) => {
    setJadwalList((prev) =>
      prev.map((j) =>
        (j._key ?? j.id) === key ? { ...j, [field]: val } : j,
      ),
    );
  };

  const hapusBaris = (key) => {
    setJadwalList((prev) =>
      prev.filter((j) => (j._key ?? j.id) !== key),
    );
  };

  const simpanJadwal = async () => {
    if (!kelasAktif) return;
    setSavingJadwal(true);
    const hariSimpan = hariAktif;
    try {
      const res = await adminFetch(`${API}/api/pendidikan/jadwal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kelas_id: kelasAktif.id,
          tahun_ajaran: kelasAktif.tahun_ajaran || null,
          jadwal: jadwalList
            .filter((j) => j.id || String(j.mapel || "").trim())
            .map((j) => ({
              hari: j.hari,
              jam_mulai: j.jam_mulai,
              jam_selesai: j.jam_selesai,
              mapel: j.mapel,
              guru_id: j.guru_id,
              guru_nama: j.guru_nama,
            })),
        }),
      });
      if (res.ok) {
        notif.success(`Jadwal pelajaran "${kelasAktif.nama}" disimpan.`);
        await muatJadwal(kelasAktif, hariSimpan);
      } else {
        const p = await res.json().catch(() => ({}));
        notif.error(p.error || "Gagal menyimpan jadwal.");
      }
    } catch (e) {
      notif.error("Koneksi ke server gagal.");
    } finally {
      setSavingJadwal(false);
    }
  };

  const urutJam = (a, b) =>
    String(a.jam_mulai).localeCompare(String(b.jam_mulai));

  // Baris yang sudah tersimpan di server (punya id) untuk hari aktif.
  const jadwalTersimpan = jadwalList
    .filter((j) => j.id && j.hari === hariAktif)
    .sort(urutJam);

  // Baris input baru (belum tersimpan) — selalu ada minimal satu.
  const jadwalDraft = jadwalList.filter((j) => !j.id).sort(urutJam);

  return (
    <div className="bg-card rounded-[2rem] p-8 shadow-sm border border-line">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink">Jadwal Pelajaran</h2>
        <p className="text-sm text-muted mt-1">
          Kelola jadwal pelajaran tiap kelas.
        </p>
      </div>

      {/* ── Jadwal Pelajaran per Kelas ── */}
      <div className="border-t border-line pt-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 flex items-center justify-center">
            <FiCalendar size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-ink">Pilih Kelas</h3>
            <p className="text-sm text-muted">
              Pilih kelas untuk menambah atau mengubah jadwal pelajarannya.
            </p>
          </div>
        </div>

        {!kelasAktif ? (
          <div className="mt-5">
            {kelasList.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">
                Belum ada kelas. Tambahkan kelas terlebih dahulu di menu Kelas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kelasList.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => bukaJadwal(k)}
                    className="group flex items-center justify-between gap-3 p-4 rounded-2xl border border-line bg-surface2 hover:border-green-300/70 dark:hover:border-green-500/30 hover:bg-card transition text-left"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{k.nama}</p>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {[k.tahun_ajaran, k.wali_kelas]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <FiChevronRight className="text-muted group-hover:text-green-600 transition shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setKelasAktif(null)}
                  className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <FiChevronRight className="rotate-180" /> Ganti Kelas
                </button>
                <p className="font-extrabold text-ink text-lg mt-1 truncate">
                  {kelasAktif.nama}
                </p>
                <p className="text-xs text-muted">
                  {kelasAktif.tahun_ajaran || "Tanpa tahun ajaran"}
                </p>
              </div>
              <button
                type="button"
                onClick={simpanJadwal}
                disabled={savingJadwal}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition disabled:opacity-50"
              >
                <FiSave size={16} />
                {savingJadwal ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {HARI.map((h) => {
                const jumlah = jadwalList.filter((j) => j.hari === h).length;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => pindahHari(h)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition flex items-center gap-1.5 ${hariAktif === h ? "bg-green-600 text-white border-green-600" : "bg-card text-muted border-line hover:border-green-300/60"}`}
                  >
                    {h}
                    {jumlah > 0 && (
                      <span
                        className={`text-[10px] px-1.5 rounded-full ${hariAktif === h ? "bg-white/25" : "bg-surface2 text-ink"}`}
                      >
                        {jumlah}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <datalist id="daftar-guru-jadwal">
              {guruList.map((g) => (
                <option key={g.id} value={g.nama_lengkap || g.username} />
              ))}
            </datalist>

            <div className="space-y-3">
              {/* Daftar pelajaran yang sudah tersimpan di hari ini */}
              <div className="rounded-2xl border border-line bg-surface2 p-4 space-y-2">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wide">
                  Pelajaran tersimpan — {hariAktif}
                </p>
                {loadingJadwal ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                  </div>
                ) : jadwalTersimpan.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">
                    Belum ada pelajaran tersimpan untuk hari {hariAktif}.
                  </p>
                ) : (
                  jadwalTersimpan.map((j) => (
                    <div
                      key={j.id}
                      className="flex flex-wrap gap-2 items-center bg-card p-3 rounded-xl border border-line"
                    >
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-300 text-xs font-bold">
                        <FiClock size={13} />
                        {j.jam_mulai} – {j.jam_selesai}
                      </span>
                      <span className="font-bold text-sm text-ink flex-1 min-w-[120px]">
                        {j.mapel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${j.guru_nama ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-surface2 text-muted"}`}
                      >
                        <FiUser size={13} />
                        {j.guru_nama || "Guru belum diisi"}
                      </span>
                      <button
                        type="button"
                        onClick={() => hapusBaris(j.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15 rounded-lg transition"
                        title="Hapus pelajaran"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Baris input untuk menambah pelajaran baru */}
              <div className="rounded-2xl border border-dashed border-line bg-surface2 p-4 space-y-2">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wide">
                  Tambah pelajaran — {hariAktif}
                </p>
                {jadwalDraft
                  .filter((j) => j.hari === hariAktif)
                  .map((j) => {
                    const key = j._key;
                    return (
                      <div
                        key={key}
                        className="flex flex-wrap gap-2 items-center bg-card p-3 rounded-xl border border-line"
                      >
                        <div className="flex items-center gap-1.5">
                          <FiClock size={14} className="text-muted" />
                          <input
                            type="time"
                            value={j.jam_mulai}
                            onChange={(e) =>
                              updateBaris(key, "jam_mulai", e.target.value)
                            }
                            className="px-2 py-1.5 border border-line rounded-lg text-sm bg-surface2"
                          />
                          <span className="text-muted">-</span>
                          <input
                            type="time"
                            value={j.jam_selesai}
                            onChange={(e) =>
                              updateBaris(key, "jam_selesai", e.target.value)
                            }
                            className="px-2 py-1.5 border border-line rounded-lg text-sm bg-surface2"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Mata Pelajaran"
                          value={j.mapel}
                          onChange={(e) =>
                            updateBaris(key, "mapel", e.target.value)
                          }
                          className="px-3 py-1.5 border border-line rounded-lg text-sm flex-1 min-w-[140px] bg-surface2"
                        />
                        <input
                          type="text"
                          list="daftar-guru-jadwal"
                          placeholder="Nama guru (boleh tulis manual)"
                          value={j.guru_nama}
                          onChange={(e) => {
                            const val = e.target.value;
                            const match = guruList.find(
                              (g) =>
                                (g.nama_lengkap || g.username)
                                  .toLowerCase()
                                  .trim() === val.toLowerCase().trim(),
                            );
                            updateBaris(key, "guru_nama", val);
                            updateBaris(key, "guru_id", match ? match.id : "");
                          }}
                          className="px-3 py-1.5 border border-line rounded-lg text-sm bg-surface2 min-w-[160px] flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => hapusBaris(key)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15 rounded-lg transition"
                          title="Hapus baris"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                <button
                  type="button"
                  onClick={() => tambahBaris(hariAktif)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                >
                  <FiPlus size={15} /> Tambah Pelajaran
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
