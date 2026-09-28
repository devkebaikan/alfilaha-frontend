import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { useNotifikasi } from "../../Context/NotifikasiContext.jsx";

/**
 * Banner pembaruan PWA.
 * registerType 'prompt' → versi baru ditandai, tidak auto-reload.
 * User memutuskan kapan "Muat Ulang".
 */
const UpdatePrompt = () => {
  const notif = useNotifikasi();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (offlineReady) {
      notif.info("Aplikasi siap dibuka offline.");
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady, notif]);

  if (!needRefresh) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Pembaruan aplikasi tersedia"
      className="fixed inset-x-0 bottom-0 z-[1450] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-xl flex items-center gap-3 bg-gray-900 text-white rounded-2xl shadow-2xl shadow-black/30 p-3">
        <span
          aria-hidden="true"
          className="w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-white/10"
        >
          <FiRefreshCw size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-snug">Versi baru tersedia</p>
          <p className="text-xs text-white/70 leading-snug">
            Muat ulang untuk memakai versi terbaru.
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="shrink-0 min-h-[44px] px-4 rounded-full bg-PrimaryColor-0 text-white text-sm font-semibold transition hover:opacity-90"
        >
          Muat Ulang
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Tutup pemberitahuan pembaruan"
          className="w-11 h-11 shrink-0 grid place-items-center text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
