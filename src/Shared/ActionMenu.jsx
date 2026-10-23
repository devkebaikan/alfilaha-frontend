import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiMoreVertical } from "react-icons/fi";

// Menu aksi (⋮) generik untuk baris tabel / kartu admin.
//
// - Terbuka dikontrol induk (`terbuka`) supaya hanya satu menu yang aktif.
// - Menu dirender lewat portal ke <body> dengan posisi `fixed`, sehingga tidak
//   terpotong oleh kartu lain maupun tepi layar.
// - Bila ruang di bawah tombol sempit, menu otomatis muncul ke atas.
//
// `items` berupa array; setiap item adalah salah satu dari:
//   { label, icon, onClick, danger }  -> tombol menu
//   { type: "divider" }               -> garis pemisah

const LEBAR_MENU = 200; // px, lebar minimal menu
const TINGGI_ITEM = 42; // px, perkiraan tinggi satu item
const TINGGI_DIVIDER = 9; // px, perkiraan tinggi pemisah
const JARAK = 8; // px, jarak menu dari tombol

const ActionMenu = ({ terbuka, onToggle, onTutup, items = [] }) => {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const onTutupRef = useRef(onTutup);
  const [pos, setPos] = useState(null);

  const tinggiMenu =
    items.filter((i) => i.type !== "divider").length * TINGGI_ITEM +
    items.filter((i) => i.type === "divider").length * TINGGI_DIVIDER +
    8;

  // Selalu pakai callback onTutup terbaru tanpa perlu re-subscribe listener.
  useEffect(() => {
    onTutupRef.current = onTutup;
  });

  useEffect(() => {
    if (!terbuka) {
      setPos(null);
      return;
    }

    // Hitung posisi fixed menu relatif terhadap tombol ⋮.
    const hitungPosisi = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const bukaKeAtas =
        r.bottom + JARAK + tinggiMenu > vh && r.top > tinggiMenu + JARAK;

      // Rata kanan terhadap tombol, lalu di-clamp agar tetap di dalam layar.
      let left = r.right - LEBAR_MENU;
      left = Math.max(JARAK, Math.min(left, vw - LEBAR_MENU - JARAK));

      if (bukaKeAtas) {
        setPos({ left, bottom: vh - r.top + JARAK, top: "auto" });
      } else {
        setPos({ left, top: r.bottom + JARAK, bottom: "auto" });
      }
    };
    hitungPosisi();

    const onDown = (e) => {
      const diDalam =
        btnRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target);
      if (!diDalam) onTutupRef.current();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onTutupRef.current();
    };

    window.addEventListener("scroll", hitungPosisi, true);
    window.addEventListener("resize", hitungPosisi);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", hitungPosisi, true);
      window.removeEventListener("resize", hitungPosisi);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [terbuka, tinggiMenu]);

  const jalankan = (fn) => (e) => {
    e.stopPropagation();
    fn?.();
    onTutup();
  };

  return (
    <div className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        type="button"
        onClick={onToggle}
        aria-label="Menu aksi"
        aria-haspopup="menu"
        aria-expanded={terbuka}
        title="Menu aksi"
        className="w-10 h-10 rounded-xl border bg-surface2 text-muted border-line hover:text-ink dark:hover:bg-white/[0.07] inline-flex items-center justify-center transition"
      >
        <FiMoreVertical size={18} />
      </button>

      {terbuka &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              width: LEBAR_MENU,
            }}
            className="z-[1300] bg-card border border-line rounded-xl shadow-2xl shadow-black/25 overflow-hidden py-1"
          >
            {items.map((item, idx) =>
              item.type === "divider" ? (
                <div key={`divider-${idx}`} className="my-1 border-t border-line" />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={jalankan(item.onClick)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition text-left ${
                    item.danger
                      ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                      : "text-ink hover:bg-black/5 dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {item.icon && (
                    <span className={item.danger ? "" : "text-muted"}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default ActionMenu;
