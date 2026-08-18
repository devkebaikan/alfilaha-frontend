import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import logo from "/images/logo.png"; // Pastikan path logo sesuai

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Simpan token ke localStorage
        localStorage.setItem("admin_token", data.token);
        // Redirect ke dashboard
        navigate("/alfilaha-admin");
      } else {
        setError(
          data.error || "Gagal masuk, periksa kembali username & password!",
        );
      }
    } catch (err) {
      setError("Koneksi ke server gagal. Pastikan backend menyala.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 font-AlbertSans relative overflow-hidden">
      {/* Dekorasi Latar Belakang */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-white/40 relative z-10">
        <div className="text-center mb-10">
          <img
            loading="lazy"
            src={logo}
            alt="Alfilaha Logo"
            className="h-16 mx-auto mb-6"
          />
          <h2 className="text-3xl font-extrabold text-gray-800">
            Admin Portal
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Silakan masuk untuk mengelola website.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="Masukkan username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isLoading ? "Memeriksa..." : "Masuk ke Dashboard"}
            {!isLoading && (
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium">
            &copy; 2024 Alfilaha Agrikultur. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
