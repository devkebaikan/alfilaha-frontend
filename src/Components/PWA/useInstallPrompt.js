import { useCallback, useEffect, useRef, useState } from "react";

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_DURASI = 7 * 24 * 60 * 60 * 1000; // tunda 7 hari setelah ditutup

const deteksiIOS = () => {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

const deteksiStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

/**
 * Kelola peluang pemasangan PWA.
 * - Android/Chrome/Edge: memakai event `beforeinstallprompt`.
 * - iOS/Safari: tidak ada event tersebut, jadi kita tampilkan panduan manual.
 */
export function useInstallPrompt() {
  const deferred = useRef(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const standalone = deteksiStandalone();
    const ios = deteksiIOS();
    setIsStandalone(standalone);
    setIsIOS(ios);

    let terakhir = 0;
    try {
      terakhir = Number(localStorage.getItem(DISMISS_KEY)) || 0;
    } catch {
      terakhir = 0;
    }
    const belumKadaluarsa = Date.now() - terakhir <= DISMISS_DURASI;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferred.current = e;
      if (!standalone && !belumKadaluarsa) {
        setIsInstallable(true);
        setDismissed(false);
      }
    };

    const onInstalled = () => {
      deferred.current = null;
      setIsInstallable(false);
      setDismissed(true);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        /* abaikan */
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS tidak memicu beforeinstallprompt — tampilkan panduan selama belum dipasang
    if (ios && !standalone && !belumKadaluarsa) {
      setIsInstallable(true);
      setDismissed(false);
    } else if (standalone || belumKadaluarsa) {
      setDismissed(true);
    }
    if (standalone) setIsInstallable(false);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const ev = deferred.current;
    if (!ev) return false;
    ev.prompt();
    const pilihan = await ev.userChoice;
    deferred.current = null;
    setIsInstallable(false);
    setDismissed(true);
    return pilihan?.outcome === "accepted";
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* abaikan */
    }
  }, []);

  return { isInstallable, isIOS, isStandalone, dismissed, promptInstall, dismiss };
}
