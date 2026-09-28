import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

const AuthContext = createContext(null);

const bacaSantriDariStorage = () => {
  try {
    const s = localStorage.getItem("santri_data");
    return s ? JSON.parse(s) : null;
  } catch (_) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [santriToken, setSantriToken] = useState(() =>
    localStorage.getItem("santri_token"),
  );
  const [santri, setSantri] = useState(bacaSantriDariStorage);

  // Simpan identitas santri ke state + localStorage (satu sumber kebenaran)
  const simpanLoginSantri = useCallback((token, user) => {
    if (token) {
      localStorage.setItem("santri_token", token);
      setSantriToken(token);
    }
    if (user) {
      const data = {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role || "Santri",
        status: user.status || user.status_pendaftaran,
        status_pendaftaran: user.status_pendaftaran || user.status,
      };
      localStorage.setItem("santri_data", JSON.stringify(data));
      setSantri(data);
    }
  }, []);

  const logoutSantri = useCallback(() => {
    localStorage.removeItem("santri_token");
    localStorage.removeItem("santri_data");
    setSantriToken(null);
    setSantri(null);
  }, []);

  // Muat ulang identitas dari /api/me saat token berubah / halaman dimuat
  // sehingga header tidak memakai data lama.
  useEffect(() => {
    if (!santriToken) return;
    let batal = false;
    fetch(`${API}/api/me`, {
      headers: { Authorization: `Bearer ${santriToken}` },
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (batal || !me) return;
        const data = {
          id: me.id,
          nama: me.nama,
          username: me.username,
          role: me.role || "Santri",
          status: me.status || me.status_pendaftaran,
          status_pendaftaran: me.status_pendaftaran || me.status,
        };
        localStorage.setItem("santri_data", JSON.stringify(data));
        setSantri(data);
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [santriToken]);

  return (
    <AuthContext.Provider
      value={{ santriToken, santri, simpanLoginSantri, logoutSantri }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
