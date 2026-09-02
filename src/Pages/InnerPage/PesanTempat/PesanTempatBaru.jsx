import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaArrowRightLong } from "react-icons/fa6";
import BreadCrumb from "../../../Shared/BreadCrumb/BreadCrumb";

const PesanTempat = () => {
  const location = useLocation();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <BreadCrumb
        breadCrumbTitle={"Form Pesan Tempat"}
        breadCrumbIcon={<FaArrowRightLong />}
        breadCrumbLink={"Form Pesan Tempat"}
        bgImage={"/images/pesan-tempat-bg.jpg"}
      />
      <section className="py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="Container">
          <div className="text-center mb-12">
            <h1 className="font-AlbertSans font-bold text-[22px] leading-8 sm:text-[38px] sm:leading-[48px] md:text-[44px] md:leading-[54px] lg:text-[32px] lg:leading-[42px] xl:text-[40px] xl:leading-[50px] 2xl:text-[46px] 2xl:leading-[56px] text-HeadingColor-0 mb-4">
              Reservasi Tempat
            </h1>
            <p className="font-AlbertSans text-TextColor-0 max-w-2xl mx-auto">
              Isi formulir di bawah ini untuk melakukan reservasi. Tim kami akan
              menghubungi Anda dalam waktu 1x24 jam.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg border border-BorderColor2-0">
            {status === "success" && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center font-bold border border-green-200">
                ✅ Reservasi berhasil dikirim! Tim kami akan segera menghubungi
                Anda.
              </div>
            )}
            {status === "error" && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center font-bold border border-red-200">
                ❌ Gagal mengirim reservasi. Pastikan backend server menyala.
              </div>
            )}
            {fetchError && (
              <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg text-sm border border-yellow-300">
                ⚠️ Peringatan: Gagal memuat daftar paket ({fetchError}). Apakah
                backend menyala di port 5000?
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Kontak */}
              <div>
                <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-6">
                  Informasi Kontak
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nama Anda"
                      required
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                      required
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="instansi"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      Instansi/Sekolah
                    </label>
                    <input
                      type="text"
                      name="instansi"
                      id="instansi"
                      value={formData.instansi}
                      onChange={handleChange}
                      placeholder="Nama instansi/sekolah"
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Detail Reservasi */}
              <div className="border-t border-BorderColor2-0 pt-6">
                <h3 className="font-AlbertSans font-bold text-2xl text-HeadingColor-0 mb-6">
                  Detail Reservasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="paket"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      Pilih Paket *
                    </label>
                    <select
                      name="paket"
                      id="paket"
                      value={formData.paket}
                      onChange={handleChange}
                      required
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    >
                      <option value="">-- Silakan Pilih Paket Wisata --</option>
                      {paketList.map((paket) => (
                        <option key={paket.id} value={paket.nama_paket}>
                          {paket.nama_paket} - {paket.harga}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="peserta"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      Jumlah Peserta *
                    </label>
                    <input
                      type="number"
                      name="peserta"
                      id="peserta"
                      value={formData.peserta}
                      onChange={handleChange}
                      placeholder="Minimal 10 orang"
                      min="10"
                      required
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tanggal"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      Tanggal Kunjungan *
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      id="tanggal"
                      value={formData.tanggal}
                      onChange={handleChange}
                      required
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="waktu"
                      className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                    >
                      Waktu Kedatangan
                    </label>
                    <input
                      type="time"
                      name="waktu"
                      id="waktu"
                      value={formData.waktu}
                      onChange={handleChange}
                      className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div className="border-t border-BorderColor2-0 pt-6">
                <label
                  htmlFor="message"
                  className="block font-AlbertSans font-medium text-HeadingColor-0 mb-2"
                >
                  Catatan Tambahan
                </label>
                <textarea
                  name="message"
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tambahkan catatan atau permintaan khusus (opsional)"
                  rows="5"
                  className="border border-BorderColor2-0 rounded py-3 px-4 outline-none focus:border-PrimaryColor-0 transition-all duration-300 resize-none w-full"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6">
                <p className="font-AlbertSans text-sm text-TextColor-0">
                  * Wajib diisi
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`primary-btn w-full sm:w-auto flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Reservasi"}
                  <FaArrowRightLong />
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="max-w-4xl mx-auto mt-8 bg-PrimaryColor-0 bg-opacity-10 p-6 rounded-lg border border-PrimaryColor-0">
            <h4 className="font-AlbertSans font-semibold text-lg text-HeadingColor-0 mb-3">
              Informasi Penting:
            </h4>
            <ul className="space-y-2 font-AlbertSans text-TextColor-0">
              <li>• Reservasi minimal H-7 untuk memastikan ketersediaan</li>
              <li>
                • Tim kami akan menghubungi Anda untuk konfirmasi dalam 1x24 jam
              </li>
              <li>
                • Pembayaran: DP 50% saat konfirmasi, pelunasan H-3 sebelum
                kegiatan
              </li>
              <li>
                • Untuk pertanyaan lebih lanjut, hubungi kami melalui WhatsApp
                atau email
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default PesanTempat;
