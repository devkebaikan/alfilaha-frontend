import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const LoginInternal = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Login gagal. Periksa username dan password.",
        );
      }

      // Simpan data di local storage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      setShowSuccess(true);
      navigate("/koleksi-tanaman");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface2 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-ink">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          Atau{" "}
          <Link
            to="/register-petani"
            className="font-medium text-PrimaryColor-0 hover:text-green-500"
          >
            daftar akun baru
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-ink">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-muted" />
                </div>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="focus:ring-PrimaryColor-0 focus:border-PrimaryColor-0 block w-full pl-10 sm:text-sm border-line rounded-md py-2 px-3 border"
                  placeholder="Username Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-muted" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-PrimaryColor-0 focus:border-PrimaryColor-0 block w-full pl-10 sm:text-sm border-line rounded-md py-2 px-3 border"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-PrimaryColor-0 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-PrimaryColor-0 disabled:opacity-50"
              >
                {loading ? "Masuk..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-5">
                <FiCheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-ink mb-2">
                Login Berhasil!
              </h3>
              <p className="text-muted">
                Mengarahkan ke halaman koleksi tanaman...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginInternal;
