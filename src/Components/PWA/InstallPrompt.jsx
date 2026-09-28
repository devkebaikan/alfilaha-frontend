import { FiDownload, FiShare, FiX } from "react-icons/fi";
import { useInstallPrompt } from "./useInstallPrompt";

/**
 * Banner ajakan memasang PWA.
 * Muncul saat browser menawarkan pemasangan (Android/Chrome/Edge) atau
 * saat dibuka di iOS/Safari dengan panduan "Tambahkan ke Layar Utama".
 */
const InstallPrompt = () => {
  const {
    isInstallable,
    isIOS,
    isStandalone,
    dismissed,
    promptInstall,
    dismiss,
  } = useInstallPrompt();

  if (!isInstallable || dismissed || isStandalone) return null;

  return (
    <div
      role="region"
      aria-label="Pasang aplikasi"
      className="fixed inset-x-0 bottom-0 z-[1400] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-xl flex items-center gap-3 bg-card rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-black/5 p-3">
        <img loading="lazy" decoding="async"
          src="/icon-192.png"
          alt=""
          width="44"
          height="44"
          className="w-11 h-11 rounded-xl shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink leading-snug">
            Pasang aplikasi Alfilaha
          </p>
          <p className="text-xs text-muted leading-snug">
            {isIOS
              ? "Ketuk ikon Bagikan, lalu pilih \u201cTambahkan ke Layar Utama\u201d."
              : "Akses lebih cepat langsung dari layar utama."}
          </p>
        </div>

        {isIOS ? (
          <span
            aria-hidden="true"
            className="w-11 h-11 shrink-0 grid place-items-center rounded-xl bg-PrimaryColor-0/10 text-PrimaryColor-0"
          >
            <FiShare size={18} />
          </span>
        ) : (
          <button
            type="button"
            onClick={promptInstall}
            className="shrink-0 min-h-[44px] px-4 rounded-full bg-PrimaryColor-0 text-white text-sm font-semibold inline-flex items-center gap-1.5 transition hover:opacity-90"
          >
            <FiDownload size={16} />
            Pasang
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup ajakan pasang aplikasi"
          className="w-11 h-11 shrink-0 grid place-items-center text-muted hover:text-ink rounded-xl hover:bg-surface2 transition"
        >
          <FiX size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
