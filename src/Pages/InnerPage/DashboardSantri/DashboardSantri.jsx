import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle, FiClock, FiCalendar, FiList, FiLogOut,
  FiUser, FiUsers, FiX, FiAlertCircle, FiActivity,
  FiAward, FiRefreshCw, FiChevronDown, FiChevronUp,
  FiImage, FiSun, FiTrendingUp, FiBookOpen, FiGrid,
  FiMoon, FiSunrise, FiPlayCircle,
} from "react-icons/fi";
import { kc } from "../../../Shared/kategoriWarna";
import ModalBukti from "../../../Shared/ModalBukti/ModalBukti";
import { AKSI_LABEL, parseTanamanInfo, parseTernakInfo } from "../../../Shared/tugasInfo";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

// Debug: log API URL saat module load
console.log("[DashboardSantri] API URL:", API);

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmtTgl       = (d) => new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
const fmtTglPendek = (d) => new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
const fmtHari      = (d) => new Date(d).toLocaleDateString("id-ID",{weekday:"long"});
const fmtWaktu     = (d) => new Date(d).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
const initials     = (n) => n ? n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";

/**
 * Format jam jadwal (kolom MySQL TIME) agar selalu "HH:MM".
 * Driver mysql2 bisa mengirim "08:00:00" maupun "08:00", jadi potong 5 karakter.
 * Mengembalikan "" bila kosong supaya pemanggil bisa menyembunyikan elemennya.
 */
const fmtJam = (t) => {
  if (!t) return "";
  const s = String(t).trim();
  if (!s) return "";
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return s;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
};

/** Rentang jam jadwal siap tampil, mis. "08:00 - 09:00" atau "" bila kosong. */
const fmtRentangJam = (mulai, selesai) => {
  const a = fmtJam(mulai);
  const b = fmtJam(selesai);
  if (!a) return "";
  return b ? `${a} - ${b}` : a;
};

/** Gradient banner salam — konsisten memakai warna brand hijau Al-Filaha */
const HERO_GRADIENT = "from-[#0a6658] via-[#0d806a] to-[#12a48c]";

/**
 * Parse daftar pelajaran terstruktur yang disimpan backend di deskripsi
 * jadwal kategori Pendidikan. Format yang diharapkan:
 *   Jadwal Pelajaran:
 *   Senin
 *   • B.Inggris (07:00-08:00) — Ustadz Ahmad
 * Mengembalikan { hari, mapel, jam, guru }[] atau [] bila tak cocok.
 */
const parseDaftarPelajaran = (deskripsi) => {
  if (!deskripsi || typeof deskripsi !== "string") return [];
  const idx = deskripsi.indexOf("Jadwal Pelajaran:");
  if (idx === -1) return [];
  const baris = deskripsi.slice(idx).split("\n");
  const hasil = [];
  let hari = "";
  for (const raw of baris) {
    const line = raw.trim();
    if (!line || line === "Jadwal Pelajaran:") continue;
    if (line.startsWith("•")) {
      const isi = line.slice(1).trim();
      const m = isi.match(/^(.+?)\s*\(([^)]+)\)\s*(?:—\s*(.+))?$/);
      if (m) {
        hasil.push({ hari, mapel: m[1].trim(), jam: m[2].trim(), guru: (m[3] || "").trim() });
      } else {
        hasil.push({ hari, mapel: isi, jam: "", guru: "" });
      }
    } else {
      hari = line;
    }
  }
  return hasil;
};

/** Salam + emoji dinamis berdasarkan jam */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 4  && h < 11) return { teks:"Selamat pagi",  emoji:"🌅" };
  if (h >= 11 && h < 15) return { teks:"Selamat siang", emoji:"☀️" };
  if (h >= 15 && h < 18) return { teks:"Selamat sore",  emoji:"🌇" };
  return                         { teks:"Selamat malam", emoji:"🌙" };
};

/** Format tanggal hari ini panjang */
const todayLong = () =>
  new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

/* ══════════════════════════════════════════════════════
   MONITORING REKAN TUGAS
══════════════════════════════════════════════════════ */
const MonitoringRekan = ({ tugas, token, onClose }) => {
  const [rekanList, setRekanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchRekan = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API}/api/tugas/${tugas.id}/rekan`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRekanList(Array.isArray(data) ? data : []);
        } else {
          setErr("Gagal memuat data rekan.");
        }
      } catch (e) {
        setErr("Terjadi kesalahan koneksi.");
      } finally {
        setLoading(false);
      }
    };
    fetchRekan();
  }, [tugas.id, token]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-surface2">
          <div>
            <h3 className="text-lg font-extrabold text-ink">Status Rekan Satu Tugas</h3>
            <p className="text-xs text-muted mt-0.5">{tugas.nama_aktivitas}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-surface2 hover:bg-line text-muted transition">
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
          ) : err ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
              <FiAlertCircle size={16} />
              <span>{err}</span>
            </div>
          ) : rekanList.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <FiUser size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Tidak ada rekan dalam tugas ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rekanList.map((rekan) => (
                <div key={rekan.id} className="flex items-center gap-3 p-4 rounded-xl border-2 border-line bg-surface2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                    rekan.status === 'selesai' ? 'bg-green-600 text-white' :
                    rekan.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {initials(rekan.nama_santri)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm">{rekan.nama_santri}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        rekan.status === 'selesai' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300' :
                        rekan.status === 'pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                      }`}>
                        {rekan.status}
                      </span>
                      {rekan.diselesaikan_at && (
                        <span className="text-xs text-muted">
                          {new Date(rekan.diselesaikan_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  {rekan.status === 'selesai' && (
                    <FiCheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   KARTU TUGAS — dipakai di section "Tugas Saya"
   ══════════════════════════════════════════════════════ */
const KartuTugas = ({ tugas, onSelesai, onMonitoring, onKerjakan, onIkutiKelas }) => {
  const done    = tugas.status === "selesai";
  const skipped = tugas.status === "dilewati";
  const colors  = kc(tugas.kategori);

  // Cek apakah tugas ini hari ini atau mendatang
  const todayISO = new Date().toISOString().split("T")[0];
  const tugasDate = tugas.tanggal_tugas ? tugas.tanggal_tugas.split("T")[0] : "";
  const isToday   = tugasDate === todayISO;
  const isFuture  = tugasDate > todayISO;

  // Jam jadwal diambil dari activity_schedules (sumber sama dengan /admin/jadwal)
  const jamLabel = fmtRentangJam(tugas.jam_mulai, tugas.jam_selesai);
  const jamMulai = fmtJam(tugas.jam_mulai);

  // Tanaman & ternak yang terkait aktivitas ini
  const daftarTanaman = parseTanamanInfo(tugas.tanaman_info);
  const daftarTernak  = parseTernakInfo(tugas.ternak_info);
  const adaChip = daftarTanaman.length > 0 || daftarTernak.length > 0;

  // Bisa dibuka halaman detail kalau salah satu target punya id
  const targetTanaman = daftarTanaman.find((t) => t.id);
  const targetTernak  = daftarTernak.find((t) => t.id);
  const adaTarget     = Boolean(targetTanaman || targetTernak);

  // Untuk kategori Pendidikan: tampilkan daftar pelajaran rapi dari deskripsi
  const daftarPelajaran = parseDaftarPelajaran(tugas.deskripsi);
  const kelompokPelajaran = [];
  daftarPelajaran.forEach((p) => {
    const last = kelompokPelajaran[kelompokPelajaran.length - 1];
    if (last && last.hari === p.hari) last.items.push(p);
    else kelompokPelajaran.push({ hari: p.hari, items: [p] });
  });
  const adaPelajaran = daftarPelajaran.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      className={`rounded-2xl overflow-hidden transition-all ${
        done
          ? "border border-green-200 dark:border-green-500/30 bg-green-50/60 dark:bg-green-500/10 shadow-sm"
          : skipped
          ? "border border-line bg-surface2 opacity-60"
          : "border border-line bg-card shadow-sm hover:shadow-md"
      }`}
    >
      {/* Accent bar atas */}
      {!done && !skipped && <div className={`h-1 w-full ${colors.dot}`} />}

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Ikon kategori */}
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              done ? "bg-green-100 dark:bg-green-500/20" : colors.bg
            }`}
          >
            {done ? (
              <FiCheckCircle size={22} className="text-green-600 dark:text-green-400" />
            ) : (
              <FiClock size={20} className={colors.text} />
            )}
          </div>

          {/* Info utama */}
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colors.bg} ${colors.text}`}>
                {tugas.nama_kategori || tugas.kategori}
              </span>
              {tugas.nama_lokasi && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300">
                  📍 {tugas.nama_lokasi}
                </span>
              )}
              {done ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 flex items-center gap-1">
                  <FiCheckCircle size={9} /> Selesai
                </span>
              ) : !skipped && isToday ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 animate-pulse">
                  Tenggat Hari Ini
                </span>
              ) : !skipped && isFuture ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                  Tugas Mendatang
                </span>
              ) : null}
            </div>

            {/* Judul */}
            <h3
              className={`font-extrabold text-base leading-snug ${
                done ? "text-green-800 dark:text-green-300" : "text-ink"
              }`}
            >
              {tugas.nama_aktivitas}
            </h3>

            {/* Daftar pelajaran (kategori Pendidikan) */}
            {adaPelajaran ? (
              <div
                className={`mt-2.5 ${
                  kelompokPelajaran.length > 1
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
                    : ""
                }`}
              >
                {kelompokPelajaran.map((grp) => (
                  <div
                    key={grp.hari || "_"}
                    className="rounded-xl border border-line bg-surface2/60 overflow-hidden"
                  >
                    {grp.hari && (
                      <div className="px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[11px] font-extrabold uppercase tracking-wide">
                        {grp.hari}
                      </div>
                    )}
                    <div className="divide-y divide-line">
                      {grp.items.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-ink truncate">
                              {p.mapel}
                            </p>
                            {p.guru && (
                              <p className="text-[11px] text-muted truncate flex items-center gap-1 mt-0.5">
                                <FiUser size={10} /> {p.guru}
                              </p>
                            )}
                          </div>
                          {p.jam && (
                            <span className="text-[11px] font-bold text-violet-600 dark:text-violet-300 flex items-center gap-1 shrink-0">
                              <FiClock size={10} /> {p.jam}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              tugas.deskripsi && (
                <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">
                  {tugas.deskripsi}
                </p>
              )
            )}

            {/* Tanggal, jam jadwal, dan waktu selesai */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5">
              <span className="text-xs text-muted flex items-center gap-1 font-medium">
                <FiCalendar size={11} />
                {fmtTgl(tugas.tanggal_tugas)}
              </span>
              {jamLabel && (
                <span
                  className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    !done && !skipped && jamMulai
                      ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      : "bg-surface2 text-muted"
                  }`}
                >
                  <FiClock size={11} />
                  {jamLabel}
                </span>
              )}
              {done && tugas.diselesaikan_at && (
                <span className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                  <FiCheckCircle size={11} /> Pukul {fmtWaktu(tugas.diselesaikan_at)} WIB
                </span>
              )}
            </div>

            {/* Chip tanaman / ternak yang perlu ditangani */}
            {adaChip && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {daftarTanaman.map((t, i) => (
                  <span
                    key={`tanaman-${i}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30 rounded-full px-2.5 py-1"
                  >
                    <FiCheckCircle size={11} />
                    {t.nama}
                    {t.aksi && (
                      <span className="text-muted">
                        · {AKSI_LABEL[t.aksi] || t.aksi}
                      </span>
                    )}
                  </span>
                ))}
                {daftarTernak.map((t, i) => (
                  <span
                    key={`ternak-${i}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 rounded-full px-2.5 py-1"
                  >
                    <FiActivity size={11} />
                    {t.nama}
                    {t.aksi && <span className="text-muted">· {t.aksi}</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Link foto bukti */}
            {done && tugas.foto_bukti && (
              <a
                href={`${API}/uploads/${tugas.foto_bukti}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline"
              >
                <FiImage size={12} /> Lihat Foto Bukti
              </a>
            )}

            {/* Catatan */}
            {done && tugas.catatan && (
              <div className="mt-2.5 px-3 py-2 bg-green-100/60 dark:bg-green-500/12 rounded-xl border border-green-200 dark:border-green-500/25">
                <p className="text-xs text-green-700 dark:text-green-300 font-medium italic">
                  "{tugas.catatan}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Aksi: status rekan (outline) + selesaikan (primary) */}
        <div
          className={`flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 ${
            done || skipped ? "" : "mt-4 pt-4 border-t border-line"
          }`}
        >
          {onIkutiKelas && (
            <button
              type="button"
              onClick={onIkutiKelas}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold border border-green-200 dark:border-green-500/40 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-500/20 hover:border-green-300 dark:hover:border-green-400/60 active:scale-[0.98] transition shadow-sm"
            >
              <FiBookOpen size={14} />
              Ikuti Kelas
            </button>
          )}

          {onMonitoring && (
            <button
              type="button"
              onClick={() => onMonitoring(tugas)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-300 dark:hover:border-blue-400/60 active:scale-[0.98] transition shadow-sm"
            >
              <FiUsers size={14} />
              Status Rekan
              {tugas.jumlah_rekan ? (
                <span className="px-1.5 py-px rounded-full bg-blue-600 dark:bg-blue-400 text-white dark:text-blue-950 text-[10px] font-extrabold">
                  {tugas.jumlah_rekan}
                </span>
              ) : null}
            </button>
          )}

          {!done && !skipped && (
            <>
              {adaTarget && onKerjakan && (
                <button
                  type="button"
                  onClick={() => onKerjakan(tugas)}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold transition shadow-sm text-sm active:scale-[0.98]"
                >
                  <FiPlayCircle size={16} /> Kerjakan
                </button>
              )}
              {/* Hanya tugas hari ini yang bisa diselesaikan langsung dari
                  dashboard. "Selesaikan Awal" (tugas mendatang) dihilangkan. */}
              {isToday && (
                <button
                  type="button"
                  onClick={() => onSelesai(tugas)}
                  className={
                    adaTarget
                      ? "inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl border-2 border-green-600 dark:border-green-500 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-500/10 font-bold transition text-sm active:scale-[0.98]"
                      : "inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold transition shadow-sm text-sm active:scale-[0.98]"
                  }
                >
                  <FiCheckCircle size={16} /> Selesaikan Tugas
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   RIWAYAT GROUP (per aktivitas, collapsible)
══════════════════════════════════════════════════════ */
const RiwayatGroup = ({ group }) => {
  const [open, setOpen] = useState(false);
  const colors  = kc(group.kategori);
  const selesai = group.items.filter((t) => t.status === "selesai").length;
  const total   = group.items.length;
  const persen  = total ? Math.round((selesai / total) * 100) : 0;

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface2 transition text-left"
      >
        {/* Avatar inisial aktivitas */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}
        >
          <span className={`text-sm font-extrabold ${colors.text}`}>
            {group.nama?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink text-sm truncate">{group.nama}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
            >
              {group.kategori}
            </span>
            <span className="text-[11px] text-muted font-medium">
              {selesai}/{total} selesai
            </span>
          </div>
        </div>
        {/* Mini progress */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-14 bg-surface2 border border-line rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${persen}%` }}
            />
          </div>
          {open ? (
            <FiChevronUp size={14} className="text-muted" />
          ) : (
            <FiChevronDown size={14} className="text-muted" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {group.items.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    t.status === "selesai"
                      ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/25"
                      : t.status === "dilewati"
                      ? "bg-surface2 border-line opacity-60"
                      : "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/25"
                  }`}
                >
                  {/* Status icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      t.status === "selesai"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                        : t.status === "dilewati"
                        ? "bg-surface2 text-muted"
                        : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {t.status === "selesai" ? (
                      <FiCheckCircle size={14} />
                    ) : t.status === "dilewati" ? (
                      <FiX size={14} />
                    ) : (
                      <FiClock size={14} />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-ink">
                        {fmtTglPendek(t.tanggal_tugas)} · {fmtHari(t.tanggal_tugas)}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          t.status === "selesai"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300"
                            : t.status === "dilewati"
                            ? "bg-surface2 text-muted"
                            : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    {t.diselesaikan_at && (
                      <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold mt-0.5">
                        ✓ Selesai pukul {fmtWaktu(t.diselesaikan_at)} WIB
                      </p>
                    )}
                    {t.catatan && (
                      <p className="text-[11px] text-muted italic mt-0.5 line-clamp-1">
                        "{t.catatan}"
                      </p>
                    )}
                    {t.foto_bukti && (
                      <a
                        href={`${API}/uploads/${t.foto_bukti}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        <FiImage size={10} /> Foto Bukti
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   KOMPONEN UTAMA — DashboardSantri
══════════════════════════════════════════════════════ */
const DashboardSantri = () => {
  const navigate = useNavigate();

  /* ── Auth ── */
  const token = localStorage.getItem("santri_token");
  let userData = null;
  try {
    const s = localStorage.getItem("santri_data");
    if (s) userData = JSON.parse(s);
  } catch (_) {}

  useEffect(() => {
    if (!token) navigate("/login-santri", { replace: true });
  }, [token, navigate]);

  // Santri yang belum Diterima (Menunggu Verifikasi / Ditolak) tidak boleh masuk dashboard
  useEffect(() => {
    if (token && userData && userData.status_pendaftaran !== 'Diterima') {
      navigate("/status-pendaftaran", { replace: true });
    }
  }, [token, userData, navigate]);

  /* ── State ── */
  const [tugasHariIni,   setTugasHariIni]   = useState([]);
  const [semuaTugas,     setSemuaTugas]      = useState([]);
  const [loadingHI,      setLoadingHI]       = useState(true);
  const [loadingRiwayat, setLoadingRiwayat]  = useState(true);
  const [modalTugas,     setModalTugas]      = useState(null);
  const [monitoringTugas, setMonitoringTugas] = useState(null);
  const [toast,          setToast]           = useState(null);
  const [riwayatOpen,    setRiwayatOpen]     = useState(false);
  const [filterRiwayat,  setFilterRiwayat]   = useState("semua");
  const [kelasSaya,      setKelasSaya]       = useState(null);
  const [jadwalKelasSaya,setJadwalKelasSaya] = useState([]);
  const [loadingKelas,   setLoadingKelas]     = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Fetch data ── */
  const fetchHariIni = useCallback(async () => {
    if (!token) return;
    setLoadingHI(true);
    try {
      const res = await fetch(`${API}/api/tugas/hari-ini`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTugasHariIni(await res.json());
      else if (res.status === 401) navigate("/login-santri");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHI(false);
    }
  }, [token]);

  const fetchRiwayat = useCallback(async () => {
    if (!token) return;
    setLoadingRiwayat(true);
    try {
      const res = await fetch(`${API}/api/tugas/saya`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSemuaTugas(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRiwayat(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHariIni();
    fetchRiwayat();
  }, [fetchHariIni, fetchRiwayat]);

  /* ── Fetch kelas saya + jadwalnya ── */
  const fetchKelasSaya = useCallback(async () => {
    if (!token) return;
    setLoadingKelas(true);
    try {
      const res = await fetch(`${API}/api/santri/kelas-saya`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : null;
      setKelasSaya(data || null);
      if (data?.id) {
        const resJ = await fetch(`${API}/api/pendidikan/jadwal/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJadwalKelasSaya(resJ.ok ? await resJ.json() : []);
      } else {
        setJadwalKelasSaya([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingKelas(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKelasSaya();
  }, [fetchKelasSaya]);

  const handleSelesaiSuccess = (data) => {
    // Simpan id sebelum modal ditutup
    const tugasId = modalTugas?.id;
    setModalTugas(null);
    showToast("Tugas berhasil diselesaikan! Tetap semangat 🌟");

    // Optimistic update — langsung tandai selesai di state tanpa tunggu re-fetch
    if (tugasId) {
      const nowISO = new Date().toISOString();
      const updater = (list) => list.map(t =>
        t.id === tugasId
          ? {
              ...t,
              status: "selesai",
              diselesaikan_at: nowISO,
              foto_bukti: data?.foto_bukti ?? t.foto_bukti ?? null,
              catatan: data?.catatan ?? t.catatan ?? null,
            }
          : t
      );
      // Hapus dari "Tugas Saya" karena sudah selesai (tidak lagi pending)
      setTugasHariIni((list) => list.filter((t) => t.id !== tugasId));
      setSemuaTugas(updater);
    }

    // Sinkronisasi dengan server (untuk dapat data lengkap dari DB)
    fetchHariIni();
    fetchRiwayat();
  };

  // "Kerjakan" mengarahkan santri langsung ke halaman objek yang ditugaskan
  // (tanaman/ternak) dengan membawa id tiket tugas. Di halaman itu santri
  // mengirim bukti (foto opsional, laporan wajib) dan riwayatnya otomatis
  // tercatat pada objek tersebut.
  const handleKerjakan = (tugas) => {
    const tanaman = parseTanamanInfo(tugas.tanaman_info).find((t) => t.id);
    if (tanaman) {
      navigate(`/tanaman/${tanaman.id}?tugas=${tugas.id}`);
      return;
    }
    const ternak = parseTernakInfo(tugas.ternak_info).find((t) => t.id);
    if (ternak) {
      navigate(`/peternakan/${ternak.id}?tugas=${tugas.id}`);
    }
  };

  const handleIkutiKelas = () => {
    if (kelasSaya?.id) navigate(`/kelas/${kelasSaya.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("santri_token");
    localStorage.removeItem("santri_data");
    navigate("/");
  };

  /* ── Statistik ── */
  const stats = {
    total:   semuaTugas.length,
    selesai: semuaTugas.filter((t) => t.status === "selesai").length,
    pending: semuaTugas.filter((t) => t.status === "pending").length,
    persen:  semuaTugas.length
      ? Math.round((semuaTugas.filter((t) => t.status === "selesai").length / semuaTugas.length) * 100)
      : 0,
  };
  const tugasPending       = tugasHariIni.filter((t) => t.status === "pending").length;
  const tugasSelesaiHariIni = tugasHariIni.filter((t) => t.status === "selesai").length;

  /* ── Filter & group riwayat ── */
  const riwayatFiltered = semuaTugas.filter((t) =>
    filterRiwayat === "semua" ? true : t.status === filterRiwayat
  );
  const riwayatByAktivitas = {};
  riwayatFiltered.forEach((t) => {
    const key = t.nama_aktivitas;
    if (!riwayatByAktivitas[key])
      riwayatByAktivitas[key] = { nama: t.nama_aktivitas, kategori: t.kategori, items: [] };
    riwayatByAktivitas[key].items.push(t);
  });
  const riwayatGroups = Object.values(riwayatByAktivitas);

  /* ── Greeting ── */
  const { teks: salamTeks, emoji: salamEmoji } = getGreeting();
  const namaDepan = userData?.username || userData?.nama?.split(" ")[0] || "Santri";

  /* ── Jadwal kelas saya untuk hari ini ── */
  const HARI_NAMA = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const hariIniNama = HARI_NAMA[new Date().getDay() - 1] || "";
  const jadwalHariIniKelas = (jadwalKelasSaya || [])
    .filter((j) => j.hari === hariIniNama)
    .sort((a, b) => String(a.jam_mulai).localeCompare(String(b.jam_mulai)));

  if (!token) return null;

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-surface2 overflow-x-hidden">

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0   }}
            exit={{   opacity: 0, y: -24  }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 whitespace-nowrap max-w-[90vw] ${
              toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
            }`}
          >
            {toast.type === "error" ? (
              <FiAlertCircle size={16} />
            ) : (
              <FiCheckCircle size={16} />
            )}
            <span className="truncate">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Bukti ── */}
      <AnimatePresence>
        {modalTugas && (() => {
          // Ternak + aksi terkait dari tiket tugas (mode "Selesaikan Tugas").
          // Dipakai ModalBukti untuk memunculkan kolom nominal aksi butuh angka.
          const daftarTernakModal = parseTernakInfo(modalTugas.ternak_info);
          const ternakModal = daftarTernakModal.find((t) => t.id);
          return (
            <ModalBukti
              tugas={modalTugas}
              token={token}
              ternakId={ternakModal?.id || null}
              aksiIds={daftarTernakModal.map((t) => t.aksiId).filter(Boolean)}
              onClose={() => setModalTugas(null)}
              onSuccess={handleSelesaiSuccess}
            />
          );
        })()}
      </AnimatePresence>

      {/* ── Modal Monitoring Rekan ── */}
      <AnimatePresence>
        {monitoringTugas && (
          <MonitoringRekan
            tugas={monitoringTugas}
            token={token}
            onClose={() => setMonitoringTugas(null)}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════
          KONTEN UTAMA
      ══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 2xl:pt-36 pb-20">

        {/* ── HERO BANNER GREETING ── */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${HERO_GRADIENT} shadow-lg mb-6`}
        >
          {/* Dekorasi lingkaran */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-4 right-28 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative px-5 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Tanggal */}
              <p className="text-white/80 text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-2">
                <FiCalendar size={13} />
                {todayLong()}
              </p>

              {/* Salam utama */}
              <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
                {salamTeks}, {namaDepan}! {salamEmoji}
              </h1>

              {/* Sub-info */}
              <p className="text-white/80 text-sm mt-1.5 font-medium">
                {loadingHI
                  ? "Sedang memuat tugas..."
                  : tugasPending > 0
                  ? `Ada ${tugasPending} tugas yang menunggu diselesaikan hari ini.`
                  : tugasHariIni.length > 0
                  ? "Luar biasa! Semua tugas hari ini sudah selesai. 🌟"
                  : "Tidak ada tugas untuk hari ini. Selamat beristirahat!"}
              </p>

              {/* Progress bar hari ini */}
              {tugasHariIni.length > 0 && (
                <div className="mt-4 flex items-center gap-3 max-w-xs">
                  <div className="flex-1 bg-white/25 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-white h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          tugasHariIni.length
                            ? Math.round((tugasSelesaiHariIni / tugasHariIni.length) * 100)
                            : 0
                        }%`,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-white font-extrabold text-sm flex-shrink-0">
                    {tugasSelesaiHariIni}/{tugasHariIni.length}
                  </span>
                </div>
              )}
            </div>

            {/* Avatar + info user (desktop) */}
            <div className="hidden sm:flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg backdrop-blur-sm">
                {initials(userData?.username || userData?.nama)}
              </div>
              <p className="text-white font-bold text-sm text-center max-w-[120px] truncate">
                {userData?.username || userData?.nama || "Santri"}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { fetchHariIni(); fetchRiwayat(); showToast("Data diperbarui"); }}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
                  title="Refresh"
                >
                  <FiRefreshCw size={14} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-white/20 hover:bg-red-500/40 text-white transition"
                  title="Keluar"
                >
                  <FiLogOut size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Header mobile (hanya tampil di HP) ── */}
        <div className="sm:hidden flex items-center justify-between mb-5 bg-card rounded-2xl p-3 shadow-sm border border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center font-extrabold text-xs">
              {initials(userData?.username || userData?.nama)}
            </div>
            <div>
              <p className="font-extrabold text-ink text-sm leading-tight truncate max-w-[140px]">
                {userData?.username || userData?.nama || "Santri"}
              </p>
              <p className="text-[10px] text-muted">Dashboard Santri</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => { fetchHariIni(); fetchRiwayat(); showToast("Data diperbarui"); }}
              className="p-2 rounded-xl bg-surface2 text-muted hover:bg-line transition"
            >
              <FiRefreshCw size={14} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/25 font-bold text-xs rounded-xl transition"
            >
              <FiLogOut size={13} /> Keluar
            </button>
          </div>
        </div>

        {/* ── STAT CARDS — 2 kolom di HP, 4 kolom di desktop ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Tugas",
              val:   stats.total,
              icon:  <FiList size={18} />,
              ic:    "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300",
              val_color: "text-ink",
            },
            {
              label: "Selesai",
              val:   stats.selesai,
              icon:  <FiCheckCircle size={18} />,
              ic:    "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
              val_color: "text-green-700 dark:text-green-400",
            },
            {
              label: "Belum Selesai",
              val:   stats.pending,
              icon:  <FiClock size={18} />,
              ic:    "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
              val_color: "text-amber-700 dark:text-amber-400",
            },
            {
              label: "Skor Kinerja",
              val:   `${stats.persen}%`,
              icon:  <FiAward size={18} />,
              ic:    "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
              val_color: stats.persen >= 80
                ? "text-green-600 dark:text-green-400"
                : stats.persen >= 50
                ? "text-amber-500 dark:text-amber-400"
                : "text-red-500 dark:text-red-400",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 sm:p-5 border border-line shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.ic}`}>
                {s.icon}
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold ${s.val_color}`}>{s.val}</p>
              <p className="text-xs text-muted font-semibold mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── PROGRESS BAR KESELURUHAN ── */}
        {stats.total > 0 && (
          <div className="bg-card rounded-2xl p-4 sm:p-5 border border-line shadow-sm mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-bold text-ink flex items-center gap-1.5">
                <FiTrendingUp size={14} className="text-green-600 dark:text-green-400" />
                Progres Keseluruhan
              </p>
              <span
                className={`text-sm font-extrabold ${
                  stats.persen >= 80
                    ? "text-green-600 dark:text-green-400"
                    : stats.persen >= 50
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {stats.persen}%
              </span>
            </div>
            <div className="w-full bg-surface2 border border-line rounded-full h-2.5 overflow-hidden">
              <motion.div
                className={`h-2.5 rounded-full ${
                  stats.persen >= 80
                    ? "bg-green-500"
                    : stats.persen >= 50
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${stats.persen}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted mt-1.5 font-medium">
              {stats.selesai} dari {stats.total} tugas telah diselesaikan
            </p>
          </div>
        )}

        {/* ── KELAS SAYA ── */}
        {!loadingKelas && kelasSaya && (
          <section className="mb-6">
            <div className="bg-card rounded-2xl border border-line shadow-sm overflow-hidden">
              <div className="relative h-36 sm:h-44 bg-gradient-to-br from-[#0a6658] via-[#0d806a] to-[#12a48c]">
                {kelasSaya.foto ? (
                  <img
                    src={`${API}/uploads/${kelasSaya.foto}`}
                    alt={kelasSaya.nama}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60 font-bold">
                    Tanpa Foto Kelas
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-block px-2.5 py-0.5 bg-green-500 text-white text-[10px] font-extrabold rounded-full mb-1.5">
                      KELAS SAYA
                    </span>
                    <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-tight truncate">
                      {kelasSaya.nama}
                    </h3>
                    <p className="text-white/85 text-xs mt-0.5 truncate">
                      Wali Kelas: {kelasSaya.wali_kelas || "-"}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/kelas/${kelasSaya.id}`)}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-700 font-extrabold text-sm shadow-lg hover:bg-green-50 active:scale-[.98] transition"
                  >
                    <FiPlayCircle size={16} /> Ikuti Kelas
                  </button>
                </div>
              </div>

              {/* Jadwal hari ini */}
              <div className="px-4 sm:px-5 py-4">
                <p className="text-xs font-extrabold text-muted uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <FiClock size={13} /> Jadwal Hari Ini
                  {hariIniNama && <span className="text-green-600 dark:text-green-400">— {hariIniNama}</span>}
                </p>
                {jadwalHariIniKelas.length === 0 ? (
                  <p className="text-sm text-muted font-medium py-1">
                    Tidak ada pelajaran hari ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {jadwalHariIniKelas.map((j) => (
                      <div
                        key={j.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-surface2 border border-line"
                      >
                        <div className="w-1.5 self-stretch rounded-full bg-green-500/70" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-ink text-sm truncate">{j.mapel}</p>
                          <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                            <FiUser size={11} />
                            {j.guru_nama_tampil || j.guru_nama || "Guru belum diisi"}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 shrink-0">
                          <FiClock size={12} />
                          {fmtRentangJam(j.jam_mulai, j.jam_selesai)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── BELUM ADA KELAS ── */}
        {!loadingKelas && !kelasSaya && (
          <section className="mb-6">
            <div className="bg-card rounded-2xl border border-dashed border-line p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                <FiBookOpen size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-ink text-sm">
                  Kamu belum terdaftar di kelas
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Hubungi pengajar/admin untuk ditempatkan ke kelas. Setelah itu
                  jadwal & tombol Ikuti Kelas akan muncul di sini.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── TUGAS HARI INI ── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-ink flex items-center gap-2">
              <div className="w-7 h-7 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                <FiCalendar size={15} />
              </div>
              Tugas Saya
              {tugasPending > 0 && (
                <span className="bg-red-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  {tugasPending}
                </span>
              )}
            </h2>
          </div>

          {loadingHI ? (
            <div className="flex justify-center items-center h-36">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : tugasHariIni.length === 0 ? (
            <div className="bg-card rounded-2xl p-10 text-center border border-dashed border-line shadow-sm">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-500/12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiSun size={28} className="text-green-400" />
              </div>
              <h3 className="font-bold text-ink text-base mb-1">Tidak ada tugas aktif</h3>
              <p className="text-muted text-sm">Nikmati harimu atau cek kembali besok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tugasHariIni.map((t) => (
                <KartuTugas 
                  key={t.id} 
                  tugas={t} 
                  onSelesai={setModalTugas} 
                  onMonitoring={setMonitoringTugas} 
                  onKerjakan={handleKerjakan} 
                  onIkutiKelas={kelasSaya?.id ? handleIkutiKelas : null}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── RIWAYAT TUGAS (collapsible, grouped by aktivitas) ── */}
        <section className="mb-6">
          <button
            onClick={() => setRiwayatOpen((p) => !p)}
            className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-line shadow-sm hover:border-green-200 dark:hover:border-green-500/40 transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FiBookOpen size={15} />
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-ink">
                Riwayat Tugas
              </h2>
              <span className="text-xs text-muted font-semibold bg-surface2 border border-line px-2 py-0.5 rounded-full">
                {semuaTugas.length}
              </span>
            </div>
            {riwayatOpen ? (
              <FiChevronUp size={18} className="text-muted" />
            ) : (
              <FiChevronDown size={18} className="text-muted" />
            )}
          </button>

          <AnimatePresence>
            {riwayatOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-b-2xl border border-t-0 border-line shadow-sm">
                  {/* Filter tabs */}
                  <div className="px-4 pt-4 pb-3 flex gap-2 flex-wrap border-b border-line">
                    {["semua", "pending", "selesai", "dilewati"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilterRiwayat(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                          filterRiwayat === f
                            ? "bg-green-600 text-white"
                            : "bg-surface2 text-muted hover:bg-line"
                        }`}
                      >
                        {f}{" "}
                        {f !== "semua" &&
                          `(${semuaTugas.filter((t) => t.status === f).length})`}
                      </button>
                    ))}
                  </div>

                  {loadingRiwayat ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                    </div>
                  ) : riwayatGroups.length === 0 ? (
                    <p className="text-center text-muted py-10 text-sm font-medium">
                      Tidak ada riwayat dengan filter ini.
                    </p>
                  ) : (
                    <div className="divide-y divide-line">
                      {riwayatGroups.map((grp, gi) => (
                        <RiwayatGroup key={gi} group={grp} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── AKSES CEPAT ── */}
        <section>
          <h2 className="text-sm sm:text-base font-extrabold text-ink mb-3 flex items-center gap-2">
            <FiGrid size={15} className="text-muted" /> Akses Cepat
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                to:    "/koleksi-tanaman",
                emoji: "🌱",
                bg:    "bg-green-100 dark:bg-green-500/20 hover:bg-green-200 dark:hover:bg-green-500/30",
                label: "Koleksi Tanaman",
                sub:   "Perawatan tanaman",
              },
              {
                to:    "/status-pendaftaran",
                icon:  <FiUser size={20} className="text-blue-600 dark:text-blue-400" />,
                bg:    "bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30",
                label: "Profil Saya",
                sub:   "Status pendaftaran",
              },
              {
                to:    "/event",
                icon:  <FiCalendar size={20} className="text-purple-600 dark:text-purple-400" />,
                bg:    "bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30",
                label: "Kegiatan",
                sub:   "Info event pondok",
              },
              {
                to:    "/blog_grid",
                icon:  <FiBookOpen size={20} className="text-orange-600 dark:text-orange-400" />,
                bg:    "bg-orange-100 dark:bg-orange-500/20 hover:bg-orange-200 dark:hover:bg-orange-500/30",
                label: "Blog",
                sub:   "Artikel & wawasan",
              },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-2xl border border-line shadow-sm hover:border-line hover:shadow-md transition group"
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 transition text-lg`}
                >
                  {item.emoji ? item.emoji : item.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink text-xs sm:text-sm truncate">
                    {item.label}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted truncate">{item.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted mt-10">
          © 2026 Pondok Pesantren Al-Filaha · Dashboard Santri
        </p>
      </div>
    </div>
  );
};

export default DashboardSantri;
