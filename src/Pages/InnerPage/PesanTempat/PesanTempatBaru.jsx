import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiSend,
  FiUser,
  FiUsers,
  FiBriefcase,
  FiPackage,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";
import { useNotifikasi } from "../../../Context/NotifikasiContext";

const BagianJudul = ({ ikon, judul }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="w-11 h-11 rounded-2xl bg-PrimaryColor-0/10 text-PrimaryColor-0 grid place-items-center shrink-0 shadow-sm shadow-PrimaryColor-0/10">
      {ikon}
    </span>
    <div>
      <h3 className="font-AlbertSans font-bold text-xl sm:text-2xl text-HeadingColor-0 leading-tight">
        {judul}
      </h3>
      <span className="block w-10 h-1 rounded-full bg-PrimaryColor-0/70 mt-1.5"></span>
    </div>
  </div>
);

const IconBungkus = ({ isi }) => (
  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
    {isi}
  </span>
);

// ── Notifikasi hasil pengiriman ────────────────────────────────────
// satu komponen untuk 3 kondisi: sukses, gagal, dan peringatan.
const GAYA_NOTIF = {
  sukses: {
    insin: "bg-green-500",
    tease: "bg-[#DCFCE7] dark:bg-[#14532D]/50 text-[#16804B] dark:text-[#4ADE80]",
    garis: "border-green-200 dark:border-green-500/30",
    chip: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300",
    judul: "text-HeadingColor-0",
  },
  gagal: {
    insin: "bg-red-500",
    tease: "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-300",
    garis: "border-red-200 dark:border-red-500/30",
    chip: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300",
    judul: "text-HeadingColor-0",
  },
  peringatan: {
    insin: "bg-amber-500",
    tease: "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300",
    garis: "border-amber-200 dark:border-amber-500/30",
    chip: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
    judul: "text-HeadingColor-0",
  },
};

const NotifKirim = ({ jenis, ikon, judul, children, aksi, onTutup }) => {
  const gaya = GAYA_NOTIF[jenis];
  return (
    <div
      role="status"
      className={`notif-banner max-w-4xl mx-auto mb-8 relative overflow-hidden rounded-3xl bg-card border ${gaya.garis} shadow-lg shadow-black/5`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-1.5 ${gaya.insin}`}
        aria-hidden="true"
      ></span>
      <div className="flex items-start gap-4 p-5 sm:p-6 pl-7">
        <span
          className={`notif-ikon w-12 h-12 shrink-0 rounded-2xl grid place-items-center ${gaya.tease}`}
        >
          {ikon}
        </span>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-AlbertSans font-bold text-lg sm:text-xl ${gaya.judul}`}
          >
            {judul}
          </h3>
          <div className="text-sm text-muted mt-1.5 leading-relaxed">
            {children}
          </div>
          {aksi && <div className="mt-4 flex flex-wrap gap-2.5">{aksi}</div>}
        </div>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup notifikasi"
          className="w-9 h-9 shrink-0 -mt-1 -mr-1 grid place-items-center rounded-xl text-muted hover:text-ink hover:bg-surface2 transition"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};

// Chip ringkasan data yang baru dikirim (hanya di notifikasi sukses)
const ChipRingkas = ({ ikon, label, nilai }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${GAYA_NOTIF.sukses.chip}`}
  >
    {ikon}
    <span className="opacity-70 font-semibold">{label}:</span>
    <span className="truncate max-w-[46vw] sm:max-w-none">{nilai || "-"}</span>
  </span>
);

const DAFTAR_INFO_PENTING = [
  "Reservasi minimal H-7 untuk memastikan ketersediaan",
  "Tim kami menghubungi Anda untuk konfirmasi dalam 1x24 jam",
  "Pembayaran: DP 50% saat konfirmasi, pelunasan H-3 sebelum kegiatan",
  "Untuk pertanyaan lebih lanjut, hubungi kami via WhatsApp",
];

// Kartu "Informasi Penting": tampil di atas form (mobile) & di sidebar (desktop)
const KartuInfoPenting = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-PrimaryColor-0 to-[#5a8f00] p-6 sm:p-7 text-white shadow-xl shadow-PrimaryColor-0/20 ${className}`}
  >
    <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
    <div className="pointer-events-none absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-black/10"></div>
    <div className="relative">
      <h3 className="font-AlbertSans font-bold text-lg mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-white/20 grid place-items-center">
          <FiInfo size={15} />
        </span>
        Informasi Penting
      </h3>
      <ul className="space-y-3.5">
        {DAFTAR_INFO_PENTING.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-white/20 grid place-items-center text-[10px] shrink-0">
              ✓
            </span>
            <span className="font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const TombolAksi = ({ children, onClick, utama = false, ikon }) => (
  <button
    type="button"
    onClick={onClick}
    className={
      utama
        ? "inline-flex items-center gap-2 min-h-[42px] px-4 rounded-xl bg-[#16804B] hover:bg-[#14532D] text-white text-sm font-bold transition-colors"
        : "inline-flex items-center gap-2 min-h-[42px] px-4 rounded-xl border border-line text-sm font-bold text-HeadingColor-0 hover:bg-surface2 transition-colors"
    }
  >
    {ikon}
    {children}
  </button>
);

const PesanTempat = () => {
  const location = useLocation();
  const notif = useNotifikasi();
  const selectedPaket = location.state?.selectedPaket || "";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    instansi: "",
    paket: selectedPaket,
    peserta: "",
    tanggal: "",
    waktu: "",
    message: "",
  });
  const [paketList, setPaketList] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [status, setStatus] = useState("");
  const [terkirim, setTerkirim] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // Helper untuk mendapatkan API URL utama
  const getApiUrl = () => {
    const defaultApi =
      import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
    if (defaultApi.includes("localhost")) return ""; // Gunakan proxy
    return defaultApi;
  };

  useEffect(() => {
    const fetchPaket = async () => {
      try {
        setFetchError("");
        let response = await fetch(`/api/paket`).catch(() => null);

        if (!response || !response.ok) {
          const directUrl = `http://${window.location.hostname}:5000/api/paket`;
          response = await fetch(directUrl).catch(() => null);
        }

        if (response && response.ok) {
          const data = await response.json();
          if (data) {
            setPaketList(data);
          }
        }
      } catch (err) {
        console.error(
          "Gagal memuat paket wisata, menggunakan data fallback:",
          err,
        );
      }
    };
    fetchPaket();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("");
    setFetchError("");

    const ringkas = {
      nama: formData.name,
      paket: formData.paket,
      tanggal: formData.tanggal,
      waktu: formData.waktu,
      peserta: formData.peserta,
    };

    try {
      const reservationData = {
        nama: formData.name,
        whatsapp: formData.phone,
        email: formData.email,
        instansi: formData.instansi,
        tanggal: `${formData.tanggal} ${formData.waktu}`,
        jumlah: formData.peserta + " Orang - " + formData.paket,
        pesan: formData.message,
      };

      let response = await fetch(`${getApiUrl()}/api/reservasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      }).catch(() => null);

      if (!response || !response.ok) {
        // Fallback langsung ke IP jika proxy gagal
        const directUrl = `http://${window.location.hostname}:5000/api/reservasi`;
        response = await fetch(directUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reservationData),
        }).catch(() => null);
      }

      if (response && response.ok) {
        setStatus("success");
        setTerkirim(ringkas);
        setFormData({
          name: "",
          phone: "",
          email: "",
          instansi: "",
          paket: "",
          peserta: "",
          tanggal: "",
          waktu: "",
          message: "",
        });
        notif.success("Reservasi berhasil dikirim! Tim kami akan segera menghubungi Anda.");
      } else {
        setStatus("error");
        notif.error("Gagal mengirim reservasi. Silakan coba beberapa saat lagi.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      notif.error("Gagal terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tutupNotif = () => {
    setStatus("");
    setFetchError("");
    setTerkirim(null);
  };

  const kembaliKeForm = () => {
    setStatus("");
    setTerkirim(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fieldClass = "w-full py-3.5 pl-11 pr-4 rounded-xl bg-surface border border-line text-ink placeholder:text-muted/60 text-sm font-medium shadow-sm outline-none transition-all duration-300 focus:border-PrimaryColor-0 focus:ring-4 focus:ring-PrimaryColor-0/15";

  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Form Pesan Tempat"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Form Pesan Tempat"}
        bgImage={"/images/pesan-tempat-bg.jpg"}
      />
      <section className="py-16 md:py-28 bg-gradient-to-b from-surface2 to-card relative overflow-hidden">
        {/* Dekorasi lembut */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-PrimaryColor-0/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-PrimaryColor-0/10 blur-3xl"></div>

        <div className="Container relative">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-PrimaryColor-0/10 text-PrimaryColor-0 text-xs font-bold uppercase tracking-[0.2em] mb-5">
              <FiCalendar className="text-sm" />
              Reservasi
            </span>
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] text-HeadingColor-0 mb-4">
              Reservasi Tempat
            </h1>
            <p className="font-AlbertSans text-TextColor-0 text-[16px] sm:text-[17px] md:text-lg mt-5 sm:mt-6 leading-[1.8] max-w-2xl mx-auto px-1 sm:px-2">
              Isi formulir di bawah ini untuk melakukan reservasi. Tim kami akan
              menghubungi Anda dalam waktu 1x24 jam.
            </p>
          </div>

          {/* Informasi Penting — mobile: tampil di atas, tepat di bawah judul */}
          <div className="lg:hidden mb-8">
            <KartuInfoPenting />
          </div>

          {status === "success" && (
            <NotifKirim
              jenis="sukses"
              ikon={<FiCheckCircle size={26} />}
              judul="Reservasi Berhasil Dikirim!"
              onTutup={tutupNotif}
              aksi={
                <>
                  <TombolAksi utama onClick={kembaliKeForm} ikon={<FaArrowRightLong />}>
                    Kirim Reservasi Lain
                  </TombolAksi>
                  <TombolAksi
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    Kembali ke Atas
                  </TombolAksi>
                </>
              }
            >
              Terima kasih,{" "}
              <span className="font-bold text-ink">{terkirim?.nama || "Anda"}</span>{" "}
              telah memesan paket{" "}
              <span className="font-bold text-ink">{terkirim?.paket || "-"}</span>.
              Tim kami akan menghubungi Anda lewat WhatsApp dalam waktu 1x24 jam
              untuk konfirmasi.
              {(terkirim?.tanggal || terkirim?.peserta) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {terkirim?.tanggal && (
                    <ChipRingkas
                      ikon={<FiCalendar size={13} />}
                      label="Tanggal"
                      nilai={terkirim.tanggal}
                    />
                  )}
                  {terkirim?.waktu && (
                    <ChipRingkas
                      ikon={<FiClock size={13} />}
                      label="Jam"
                      nilai={terkirim.waktu}
                    />
                  )}
                  {terkirim?.peserta && (
                    <ChipRingkas
                      ikon={<FiUsers size={13} />}
                      label="Peserta"
                      nilai={`${terkirim.peserta} orang`}
                    />
                  )}
                </div>
              )}
            </NotifKirim>
          )}

          {status === "error" && (
            <NotifKirim
              jenis="gagal"
              ikon={<FiAlertCircle size={26} />}
              judul="Reservasi Belum Terkirim"
              onTutup={tutupNotif}
              aksi={
                <>
                  <TombolAksi utama onClick={kembaliKeForm} ikon={<FiRefreshCw size={15} />}>
                    Coba Lagi
                  </TombolAksi>
                  <TombolAksi
                    onClick={() => {
                      tutupNotif();
                      window.location.href =
                        "https://wa.me/6281234567890?text=" +
                        encodeURIComponent(
                          `Halo, saya ingin bertanya soal reservasi paket(${formData.paket || "kosong"}).`,
                        );
                    }}
                  >
                    Hubungi via WhatsApp
                  </TombolAksi>
                </>
              }
            >
              Data Anda sudah tersimpan di formulir, jadi tidak perlu mengetik
              ulang. Pastikan koneksi internet stabil lalu coba kirim kembali.
            </NotifKirim>
          )}

          {fetchError && (
            <NotifKirim
              jenis="peringatan"
              ikon={<FiInfo size={26} />}
              judul="Daftar Paket Belum Termuat"
              onTutup={tutupNotif}
              aksi={
                <TombolAksi
                  utama
                  ikon={<FiRefreshCw size={15} />}
                  onClick={() => window.location.reload()}
                >
                  Muat Ulang Halaman
                </TombolAksi>
              }
            >
              Backend mungkin sedang mati di port 5000, sehingga pilihan paket
              belum bisa ditampilkan. Anda masih bisa reservasi lewat WhatsApp.
            </NotifKirim>
          )}

          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* ── FORM CARD ─────────────────────────────────────────── */}
            <div
              ref={formRef}
              className="bg-card rounded-3xl p-6 sm:p-10 shadow-xl shadow-black/5 border border-line scroll-mt-8"
            >
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Informasi Kontak */}
                <div>
                  <BagianJudul
                    ikon={<FiUser size={20} />}
                    judul="Informasi Kontak"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiUser size={16} />} />
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Nama Anda"
                          required
                          className={fieldClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        No. WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiPhone size={16} />} />
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="08xxxxxxxxxx"
                          required
                          className={fieldClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiMail size={16} />} />
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="nama@email.com"
                          required
                          className={fieldClass}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted leading-relaxed">
                        Email dipakai untuk mengonfirmasi detail reservasi
                        Anda.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="instansi"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        Instansi/Sekolah
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiBriefcase size={16} />} />
                        <input
                          type="text"
                          name="instansi"
                          id="instansi"
                          value={formData.instansi}
                          onChange={handleChange}
                          placeholder="Nama instansi/sekolah"
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Reservasi */}
                <div className="border-t border-line pt-10">
                  <BagianJudul
                    ikon={<FiCalendar size={20} />}
                    judul="Detail Reservasi"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="paket"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        Pilih Paket <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiPackage size={16} />} />
                        <select
                          name="paket"
                          id="paket"
                          value={formData.paket}
                          onChange={handleChange}
                          required
                          className={`${fieldClass} appearance-none pr-10 ${formData.paket ? "text-ink" : "text-muted/60"}`}
                        >
                          <option value="">-- Silakan Pilih Paket Wisata --</option>
                          {paketList.map((paket) => (
                            <option key={paket.id} value={paket.nama_paket}>
                              {paket.nama_paket} - {paket.harga}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-muted text-xs">
                          ▼
                        </span>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="peserta"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        Jumlah Peserta <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiUsers size={16} />} />
                        <input
                          type="number"
                          name="peserta"
                          id="peserta"
                          value={formData.peserta}
                          onChange={handleChange}
                          placeholder="Minimal 10 orang"
                          min="10"
                          required
                          className={fieldClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="tanggal"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        Tanggal Kunjungan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiCalendar size={16} />} />
                        <input
                          type="date"
                          name="tanggal"
                          id="tanggal"
                          value={formData.tanggal}
                          onChange={handleChange}
                          required
                          className={fieldClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="waktu"
                        className="block font-AlbertSans font-semibold text-HeadingColor-0 mb-2 text-sm"
                      >
                        Waktu Kedatangan
                      </label>
                      <div className="relative">
                        <IconBungkus isi={<FiClock size={16} />} />
                        <input
                          type="time"
                          name="waktu"
                          id="waktu"
                          value={formData.waktu}
                          onChange={handleChange}
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catatan Tambahan */}
                <div className="border-t border-line pt-10">
                  <BagianJudul
                    ikon={<FiMessageSquare size={20} />}
                    judul="Catatan Tambahan"
                  />
                  <div className="relative">
                    <IconBungkus isi={<FiMessageSquare size={16} />} />
                    <textarea
                      name="message"
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tambahkan catatan atau permintaan khusus (opsional)"
                      rows="5"
                      className="w-full py-3.5 pl-11 pr-4 rounded-xl bg-surface border border-line text-ink placeholder:text-muted/60 text-sm font-medium shadow-sm outline-none transition-all duration-300 focus:border-PrimaryColor-0 focus:ring-4 focus:ring-PrimaryColor-0/15 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
                  <p className="font-AlbertSans text-sm text-muted">
                    <span className="text-red-500">*</span> Wajib diisi
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`primary-btn w-full sm:w-auto flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Reservasi"}
                    {isSubmitting ? <FiSend /> : <FaArrowRightLong />}
                  </button>
                </div>
              </form>
            </div>

            {/* ── SIDEBAR ───────────────────────────────────────────── */}
            <aside className="space-y-6 lg:sticky lg:top-8">
              {/* Kontak */}
              <div className="bg-card rounded-3xl p-6 border border-line shadow-lg shadow-black/5">
                <h3 className="font-AlbertSans font-bold text-lg text-HeadingColor-0 mb-5 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-PrimaryColor-0/10 text-PrimaryColor-0 grid place-items-center">
                    <FiPhone size={15} />
                  </span>
                  Hubungi Kami
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 grid place-items-center shrink-0">
                      <FiPhone size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                        WhatsApp
                      </p>
                      <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-sm text-HeadingColor-0 hover:text-PrimaryColor-0 transition"
                      >
                        +62 812-3456-7890
                      </a>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 opacity-60">
                    <span className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 grid place-items-center shrink-0">
                      <FiMail size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                        Email
                      </p>
                      <span className="font-bold text-sm text-muted inline-flex items-center gap-2">
                        Belum tersedia
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          Segera
                        </span>
                      </span>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 grid place-items-center shrink-0">
                      <FiClock size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                        Jam Operasional
                      </p>
                      <span className="font-bold text-sm text-HeadingColor-0">
                        Senin - Sabtu, 08.00 - 16.00 WIB
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Informasi Penting — hanya desktop (mobile ada di atas form) */}
              <div className="hidden lg:block">
                <KartuInfoPenting />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default PesanTempat;