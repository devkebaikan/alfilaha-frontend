import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../../Context/AuthContext.jsx";

const LoginSantri = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { simpanLoginSantri, logoutSantri } = useAuth();

  // Memaksa santri untuk selalu memasukkan username dan password (hapus sesi lama)
  useEffect(() => {
    logoutSantri();
  }, [logoutSantri]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftaran/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Simpan sesi lewat satu context autentikasi (token + identitas)
        simpanLoginSantri(data.token, data.user);
        console.log("Santri data saved:", data.user);

        // Redirect sesuai status pendaftaran
        if (
          data.user?.status_pendaftaran === "Diterima" ||
          data.user?.status === "Diterima"
        ) {
          navigate("/dashboard-santri");
        } else {
          navigate("/status-pendaftaran");
        }
      } else {
        setErrorMsg(
          data.message || "Gagal login. Periksa username dan password Anda.",
        );
      }
    } catch (error) {
      setErrorMsg(
        "Koneksi ke server gagal. Pastikan database dan server aktif.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface2 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card p-8 sm:p-10 rounded-xl shadow-sm border border-line animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Masuk sebagai Santri
          </h2>
          <p className="mt-2 text-sm text-muted">
            Masuk untuk memeriksa status pendaftaran dan mengakses halaman santri
          </p>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Username
              </label>
              <input
                type="text"
                required
                className="block w-full px-4 py-3 rounded-lg border border-line bg-surface2 text-ink focus:outline-none focus:ring-2 focus:ring-PrimaryColor-0 focus:bg-card transition-colors duration-150"
                placeholder="Masukkan username yang didaftarkan"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-ink mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="block w-full px-4 py-3 pr-11 rounded-lg border border-line bg-surface2 text-ink focus:outline-none focus:ring-2 focus:ring-PrimaryColor-0 focus:bg-card transition-colors duration-150"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-[38px] flex items-center justify-center w-9 h-9 rounded-lg text-muted hover:text-PrimaryColor-0 hover:bg-green-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-PrimaryColor-0"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-PrimaryColor-0 hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-PrimaryColor-0 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {isLoading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted">
            Belum punya akun?{" "}
            <Link
              to="/pendaftaran"
              className="font-semibold text-PrimaryColor-0 hover:text-green-700 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-PrimaryColor-0 focus-visible:ring-offset-1 rounded-sm"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSantri;
