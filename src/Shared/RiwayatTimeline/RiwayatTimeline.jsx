import { useEffect, useRef, useState } from "react";
import {
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiSearch,
  FiImage,
  FiX,
} from "react-icons/fi";
import { jamWIB, tglIndo } from "./kelompokkanRiwayat";

/**
 * Timeline riwayat perawatan yang dipakai bersama oleh halaman tanaman & ternak.
 * Bagian yang berbeda per objek diserahkan lewat render prop `renderEntri`.
 */
const RiwayatTimeline = ({
  judul = "Riwayat",
  groups = [],
  loading = false,
  emptyText = "Belum ada riwayat.",
  filterTabs = [],
  activeFilter = "Semua",
  onFilterChange,
  search = "",
  onSearchChange,
  searchPlaceholder = "Cari aktivitas / perawat...",
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  renderEntri,
  fotoUrl,
  thumbUrl,
}) => {
  const sentinelRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

  // Infinite scroll: muat halaman berikutnya saat sentinel terlihat.
  useEffect(() => {
    if (!hasMore || loadingMore || !onLoadMore) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-line p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-line flex-wrap gap-3">
        <h3 className="flex items-center text-2xl font-bold text-ink">
          <FiClock className="mr-3 text-green-500" /> {judul}
        </h3>
        {onSearchChange && (
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-2 text-sm rounded-full bg-surface2 border border-line text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-500/40 w-56"
            />
          </div>
        )}
      </div>

      {filterTabs.length > 0 && (
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange?.(tab.key)}
              className={`px-4 py-2 text-sm rounded-full font-bold transition whitespace-nowrap ${
                activeFilter === tab.key
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-surface2 text-muted hover:bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <FiCalendar className="mx-auto text-muted mb-4" size={48} />
          <p className="text-muted text-base">{emptyText}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((grup, index) => {
            const fotoNama = grup.foto;
            const bisaFoto = Boolean(fotoNama && fotoUrl);
            return (
              <div key={grup.key} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400">
                    <FiCheckCircle size={18} />
                  </div>
                  {index !== groups.length - 1 && (
                    <div className="w-0.5 h-full bg-surface2 my-2 transition"></div>
                  )}
                </div>
                <div className="pb-4 flex-1 bg-surface2 border border-line rounded-xl p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-bold text-ink capitalize">
                        {grup.nama_aktivitas || "Perawatan"}
                      </p>
                      <p className="text-sm text-muted mt-0.5">
                        Oleh{" "}
                        <span className="font-medium text-ink">
                          {grup.perawat || "Santri"}
                        </span>{" "}
                        ({grup.role || "Santri"})
                      </p>
                    </div>
                    <span className="text-xs bg-card text-muted px-3 py-1 rounded-full font-medium shrink-0 border border-line">
                      {jamWIB(grup.waktu)} WIB
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">{renderEntri?.(grup)}</div>

                  {grup.laporan && (
                    <p className="text-sm text-muted mt-3 bg-card border border-line rounded-lg p-2 whitespace-pre-line">
                      {grup.laporan}
                    </p>
                  )}

                  {bisaFoto && (
                    <button
                      type="button"
                      onClick={() => setLightbox(fotoUrl(fotoNama))}
                      className="mt-3 block max-w-[220px] group/foto"
                      aria-label="Perbesar foto perawatan"
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src={(thumbUrl || fotoUrl)(fotoNama)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fotoUrl(fotoNama);
                        }}
                        alt={`Foto ${grup.nama_aktivitas || "perawatan"}`}
                        className="h-32 w-56 object-cover rounded-xl border border-line shadow-sm group-hover/foto:opacity-85 group-hover/foto:shadow-md transition"
                      />
                    </button>
                  )}

                  <p className="text-xs text-muted mt-2">{tglIndo(grup.waktu)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <>
          <div ref={sentinelRef} className="h-1" />
          <button
            onClick={() => onLoadMore?.()}
            disabled={loadingMore}
            className="w-full mt-6 flex items-center justify-center gap-2 text-green-600 font-bold py-4 px-6 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all shadow-sm disabled:opacity-60"
          >
            {loadingMore ? (
              <span className="animate-spin h-5 w-5 border-2 border-green-500 rounded-full border-t-transparent" />
            ) : (
              <>
                <FiImage className="text-lg" /> Muat Lebih Banyak
              </>
            )}
          </button>
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Tutup"
            className="absolute top-4 right-4 text-white/90 hover:text-white bg-black/40 rounded-full p-2"
            onClick={() => setLightbox(null)}
          >
            <FiX size={20} />
          </button>
          <img
            src={lightbox}
            alt="Bukti perawatan"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default RiwayatTimeline;
