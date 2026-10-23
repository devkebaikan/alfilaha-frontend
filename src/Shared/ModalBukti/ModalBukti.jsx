import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiCheckCircle, FiCamera, FiX, FiAlertCircle,
  FiUpload, FiFileText,
} from "react-icons/fi";
import { kc } from "../kategoriWarna";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

/* ══════════════════════════════════════════════════════
   MODAL KIRIM BUKTI — Camera + Gallery + Preview
   Dipakai dashboard Santri & halaman detail (mode tugas).
══════════════════════════════════════════════════════ */
const ModalBukti = ({ tugas, token, tanamanId, aksi, ternakId, aksiIds, inputAngka, onClose, onSuccess }) => {
  const [catatan,  setCatatan]  = useState("");
  const [nilaiAngka, setNilaiAngka] = useState("");
  const [foto,     setFoto]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");
  // Info aksi yang butuh nominal (mis. "Konfirmasi Ayam Mati"). Kalau tidak
  // dikirim langsung oleh halaman detail, diresolve dari data ternak supaya
  // alur "Selesaikan Tugas" di dashboard juga minta nominalnya.
  const [resolvedAngka, setResolvedAngka] = useState(null);
  const cameraRef  = useRef(null);
  const galleryRef = useRef(null);
  const aksiIdsRef = useRef(aksiIds);
  aksiIdsRef.current = aksiIds;
  const kolomAngka = inputAngka || resolvedAngka;
  const colors     = kc(tugas);

  // Deteksi mobile agar input kamera pakai capture="environment"
  const isMobile = /Android|iPhone|iPad|iPod/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  useEffect(() => {
    if (inputAngka || !ternakId) return;
    let batal = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/ternak/${ternakId}`);
        if (!res.ok) return;
        const data = await res.json();
        const ids = new Set((aksiIdsRef.current || []).map(Number).filter(Boolean));
        const kandidat = (data.aksi || []).filter(
          (a) => a.butuh_input_angka && (ids.size === 0 || ids.has(Number(a.id))),
        );
        if (!batal && kandidat.length) setResolvedAngka(kandidat[0]);
      } catch (_) {
        // diamkan: kolom nominal opsional untuk aksi non-angka
      }
    })();
    return () => { batal = true; };
  }, [inputAngka, ternakId]);

  // Bersihkan object URL saat unmount
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { setErr("Ukuran foto maksimal 15 MB."); return; }
    setErr("");
    if (preview) URL.revokeObjectURL(preview);
    setFoto(f);
    setPreview(URL.createObjectURL(f));
    // Reset input agar bisa pilih file yang sama lagi jika mau ganti
    e.target.value = "";
  };

  const clearFoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFoto(null);
    setPreview(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    // Validate catatan is required
    if (!catatan.trim()) {
      setErr("Laporan singkat wajib diisi.");
      setLoading(false);
      return;
    }

    // Aksi butuh jumlah (mis. "Konfirmasi Ayam Mati") → nominal wajib > 0.
    if (kolomAngka) {
      const angka = parseInt(String(nilaiAngka).trim(), 10);
      if (!Number.isFinite(angka) || angka <= 0) {
        setErr(kolomAngka.label_input || "Jumlah wajib diisi dengan angka positif.");
        setLoading(false);
        return;
      }
    }

    const doSubmit = async (method) => {
      const fd = new FormData();
      if (catatan.trim()) fd.append("catatan", catatan.trim());
      if (foto) fd.append("foto_bukti", foto);
      // Kirim target tanaman + aksi dari halaman detail supaya bukti tugas
      // tetap masuk ke riwayat tanaman yang sedang dikerjakan, walau jadwalnya
      // belum punya baris di aktivitas_tanaman.
      if (tanamanId) fd.append("tanaman_id", String(tanamanId));
      if (aksi) fd.append("aksi", String(aksi));
      // Target ternak + nominal (mis. jumlah ayam mati) supaya riwayat & total
      // pada halaman ternak ikut ter-update.
      if (ternakId) fd.append("ternak_id", String(ternakId));
      if (kolomAngka) {
        fd.append("master_aksi_id", String(kolomAngka.id));
        fd.append("nilai_angka", String(parseInt(String(nilaiAngka).trim(), 10)));
      }

      return fetch(`${API}/api/tugas/${tugas.id}/selesai`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
    };

    try {
      let res;
      try {
        // Coba PATCH dulu
        res = await doSubmit("PATCH");
      } catch(patchErr) {
        // PATCH gagal (CORS/network), fallback ke PUT
        console.warn("PATCH gagal, fallback ke PUT:", patchErr.message);
        res = await doSubmit("PUT");
      }

      let data = {};
      try { data = await res.json(); } catch(_) {}

      if (!res.ok) throw new Error(data.message || data.error || `Server error ${res.status}`);
      // Sertakan catatan yang diisi santri ke data response agar optimistic update akurat
      onSuccess({ ...data, catatan: catatan.trim() || null });

    } catch(e) {
      console.error("Submit error:", e.name, e.message);

      // Coba ping untuk diagnosa
      let serverJalan = false;
      try {
        const ping = await fetch(`${API}/api/test`, { signal: AbortSignal.timeout(2000) });
        serverJalan = ping.ok;
      } catch(_) {}

      if (!serverJalan) {
        setErr(`❌ Server backend tidak bisa diakses di ${API}\n\nLangkah:\n1. Buka terminal baru\n2. cd ~/alfilaha-backend\n3. npm start`);
      } else {
        setErr(e.message || "Terjadi kesalahan. Lihat console browser untuk detail.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity:0, y:60 }}
        animate={{ opacity:1, y:0  }}
        exit={{   opacity:0, y:60  }}
        transition={{ type:"spring", damping:25, stiffness:300 }}
        className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
      >
        {/* Accent bar atas */}
        <div className={`h-1.5 w-full flex-shrink-0 ${colors.dot}`} />

        <div className="overflow-y-auto flex-1 overscroll-contain">
          <div className="p-5 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                  <FiFileText size={20} className={colors.text} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-ink leading-snug">Kirim Bukti Tugas</h3>
                  <p className="text-sm text-muted mt-0.5">{tugas.nama_aktivitas}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${colors.text}`}>{tugas.nama_kategori || tugas.kategori}</p>
                  {tugas.nama_lokasi && (
                    <p className="text-xs text-muted mt-0.5">📍 {tugas.nama_lokasi}</p>
                  )}
                </div>
              </div>
              <button onClick={onClose}
                className="p-2 rounded-xl bg-surface2 hover:bg-line text-muted transition flex-shrink-0">
                <FiX size={17} />
              </button>
            </div>

            {/* ── Error ── */}
            {err && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-medium">
                <FiAlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-line">{err}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">

              {/* ── Foto Bukti ── */}
              <div>
                <p className="text-sm font-bold text-ink mb-2.5">
                  Foto Bukti <span className="font-normal text-muted text-xs">(opsional)</span>
                </p>

                {preview ? (
                  /* Preview foto terpilih */
                  <div className="relative rounded-2xl overflow-hidden border-2 border-green-300 dark:border-green-500/40 shadow-sm">
                    <img src={preview} alt="Preview bukti" className="w-full h-52 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      <FiCheckCircle size={11} /> Foto dipilih — {foto?.name}
                    </div>
                    {/* Tombol ganti */}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button type="button" onClick={() => galleryRef.current?.click()}
                        className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-xl shadow-md transition text-xs font-bold flex items-center gap-1">
                        <FiUpload size={13} /> Ganti
                      </button>
                      <button type="button" onClick={clearFoto}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition">
                        <FiX size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Dua pilihan: Kamera / Galeri */
                  <div className="grid grid-cols-2 gap-3">
                    {/* Ambil Foto Langsung */}
                    <button type="button" onClick={() => cameraRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-dashed border-line hover:border-green-400 dark:hover:border-green-500/50 rounded-2xl bg-surface2 hover:bg-green-50 dark:hover:bg-green-500/12 transition group active:scale-95">
                      <div className="w-14 h-14 rounded-2xl bg-card shadow flex items-center justify-center group-hover:shadow-md transition">
                        <FiCamera size={26} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-sm text-ink group-hover:text-green-700 dark:group-hover:text-green-400">Ambil Foto</p>
                        <p className="text-[11px] text-muted mt-0.5">Buka kamera</p>
                      </div>
                    </button>

                    {/* Dari Galeri */}
                    <button type="button" onClick={() => galleryRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-dashed border-line hover:border-blue-400 dark:hover:border-blue-500/50 rounded-2xl bg-surface2 hover:bg-blue-50 dark:hover:bg-blue-500/12 transition group active:scale-95">
                      <div className="w-14 h-14 rounded-2xl bg-card shadow flex items-center justify-center group-hover:shadow-md transition">
                        <FiUpload size={26} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-extrabold text-sm text-ink group-hover:text-blue-700 dark:group-hover:text-blue-400">Dari Galeri</p>
                        <p className="text-[11px] text-muted mt-0.5">Pilih file</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* Input kamera — capture="environment" hanya di HP */}
                {isMobile
                  ? <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
                  : <input ref={cameraRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                }
                {/* Input galeri — selalu tanpa capture */}
                <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>

              {/* ── Jumlah nominal (aksi butuh angka, mis. ayam mati) ── */}
              {kolomAngka && (
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">
                    {kolomAngka.label_input || `Jumlah ${kolomAngka.nama_aksi || "ternak"}`}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      required
                      value={nilaiAngka}
                      onChange={(e) => setNilaiAngka(e.target.value)}
                      placeholder="Contoh: 2"
                      className="w-full px-4 py-3 pr-14 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm text-ink placeholder:text-muted transition"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                      ekor
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-1">
                    Jumlah ini tercatat di riwayat dan mengurangi total ternak.
                  </p>
                </div>
              )}

              {/* ── Laporan singkat ── */}
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">
                  Laporan Singkat <span className="text-red-500">*</span>
                </label>
                <textarea required value={catatan} onChange={e=>setCatatan(e.target.value)} rows={3}
                  placeholder="Ceritakan singkat bagaimana kamu menyelesaikan tugas ini..."
                  className="w-full px-4 py-3 bg-surface2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none text-sm text-ink placeholder:text-muted transition" />
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pb-1">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-green-200 dark:shadow-green-900/40">
                  {loading
                    ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    : <FiCheckCircle size={18} />
                  }
                  {loading ? "Mengirim..." : "Kirim Laporan"}
                </button>
                <button type="button" onClick={onClose}
                  className="px-5 py-3.5 border-2 border-line rounded-xl font-bold text-muted hover:bg-surface2 transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalBukti;
