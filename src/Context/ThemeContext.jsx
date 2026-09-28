import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "alfilaha-theme";
const VALID = ["light", "dark"];

const prefersDark = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

//(localStorage) → (preferensi sistem) → default "light"
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (VALID.includes(saved)) return saved;
  } catch {
    // localStorage bisa diblokir (mode privat / iframe) — abaikan, pakai preferensi sistem
  }
  return prefersDark() ? "dark" : "light";
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Simpan pilihan pengguna
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Gagal menyimpan tidak boleh menghentikan aplikasi
    }
  }, [theme]);

  // Sinkronkan ke elemen <html>: data-theme untuk CSS variable, class "dark" untuk varian dark:
  const applyTheme = useCallback((next) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Ikuti perubahan preferensi sistem HANYA selama pengguna belum memilih sendiri
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => {
      let sudahMemilih = false;
      try {
        sudahMemilih = VALID.includes(localStorage.getItem(STORAGE_KEY));
      } catch {
        sudahMemilih = true; // storage tidak bisa dibaca — anggap pilihan pengguna sakral
      }
      if (!sudahMemilih) setTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const api = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme harus dipakai di dalam <ThemeProvider>");
  return ctx;
};
