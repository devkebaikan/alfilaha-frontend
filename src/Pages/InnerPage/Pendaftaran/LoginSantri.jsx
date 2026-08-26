import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginSantri = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigate = useNavigate();

  // Memaksa santri untuk selalu memasukkan username dan password (hapus sesi lama)
  useEffect(() => {
    localStorage.removeItem("santri_token");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/pendaftaran/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan token untuk sesi Auto-Login
        localStorage.setItem("santri_token", data.token);
        
        // Redirect ke halaman status
        navigate("/status-pendaftaran");
      } else {
        setErrorMsg(data.message || "Gagal login. Periksa username dan password Anda.");
      }
    } catch (error) {
      setErrorMsg("Koneksi ke server gagal. Pastikan database dan server aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2rem] shadow-xl border border-gray-100 animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Login Santri
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Masuk untuk mengecek status pendaftaran Anda.
          </p>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 text-center animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                placeholder="Masukkan username yang didaftarkan"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-gray-400 hover:text-green-600 transition-colors"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${
              isLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-md`}
          >
            {isLoading ? "Memeriksa..." : "Masuk ke Portal"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link to="/pendaftaran" className="font-bold text-green-600 hover:text-green-500 transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSantri;
