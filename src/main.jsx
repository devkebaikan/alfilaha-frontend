import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import router from "./Router/Router.jsx";
import { RouterProvider } from "react-router-dom";
import { SiteProvider } from "./Context/SiteContext.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { NotifikasiProvider } from "./Context/NotifikasiContext.jsx";
import { ThemeProvider } from "./Context/ThemeContext.jsx";
import InstallPrompt from "./Components/PWA/InstallPrompt.jsx";
import UpdatePrompt from "./Components/PWA/UpdatePrompt.jsx";
// import { HelmetProvider } from "react-helmet-async";
// import HelmetChanger from "./Shared/Helmet/Helmet.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

const mulai = () =>
  root.render(
    <React.StrictMode>
      <React.StrictMode>
        {/* <HelmetProvider context={HelmetChanger}> */}
        <ThemeProvider>
          <AuthProvider>
            <SiteProvider>
              <NotifikasiProvider>
                <RouterProvider router={router} />
                <InstallPrompt />
                <UpdatePrompt />
              </NotifikasiProvider>
            </SiteProvider>
          </AuthProvider>
        </ThemeProvider>
        {/* </HelmetProvider> */}
      </React.StrictMode>
    </React.StrictMode>,
  );

// Mode dev: service worker sisa sesi lama (devOptions.enabled) masih bisa
// terdaftar di browser — /sw.js sekarang tak dilayani sehingga SW lama tak bisa
// diperbarui/dilepas otomatis. SW itu meng-cache modul dev
// (StaleWhileRevalidate) dan bisa menyajikan hash chunk basi dari
// node_modules/.vite → campur hash → dua instance React → error
// "Cannot read properties of null (reading 'useState')".
// Bersihkan sekali lalu muat ulang. Di build produksi cabang ini dihapus Vite.
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(async (regs) => {
      await Promise.all(regs.map((r) => r.unregister()));
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (regs.length && !sessionStorage.getItem("sw_dev_dibuang")) {
        sessionStorage.setItem("sw_dev_dibuang", "1");
        window.location.reload();
        return;
      }
      mulai();
    })
    .catch(mulai);
} else {
  mulai();
}
