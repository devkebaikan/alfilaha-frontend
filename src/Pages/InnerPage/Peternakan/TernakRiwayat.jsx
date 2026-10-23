import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import RiwayatTimeline from "../../../Shared/RiwayatTimeline/RiwayatTimeline";
import { kelompokkanRiwayat } from "../../../Shared/RiwayatTimeline/kelompokkanRiwayat";
import { ikonAksiUntuk, PALET_WARNA } from "../../../Shared/ikonAksi";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";
const fotoUrl = (nama) => (nama ? `${API}/uploads/${nama}` : null);
const thumbUrl = (nama) => {
  if (!nama) return null;
  const m = nama.match(/(\.\w+)$/);
  return m
    ? `${API}/uploads/${nama.replace(m[1], `-thumb${m[1]}`)}`
    : fotoUrl(nama);
};

const TernakRiwayat = () => {
  const { jenis: param } = useParams();
  const jenis = param ? decodeURIComponent(param) : param;

  const [ternak, setTernak] = useState(null);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const LIMIT = 5;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchRiwayat = useCallback(
    async (targetPage, reset) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const params = new URLSearchParams({ page: targetPage, limit: LIMIT });
        if (debouncedSearch) params.set("q", debouncedSearch);
        if (filter && filter !== "Semua") params.set("aksi", filter);
        const res = await fetch(
          `${API}/api/ternak/${encodeURIComponent(jenis)}/riwayat?${params.toString()}`,
        );
        if (!res.ok) throw new Error("Gagal memuat riwayat");
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.items || [];
        setItems((prev) => (reset ? arr : [...prev, ...arr]));
        setTotal(Number(data.total) || arr.length);
        setHasMore(Boolean(data.hasMore));
        setPage(targetPage);
      } catch (err) {
        console.error(err);
      } finally {
        if (reset) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [jenis, debouncedSearch, filter],
  );

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/ternak/${encodeURIComponent(jenis)}`);
        if (res.ok && !batal) setTernak(await res.json());
      } catch (_) {
        /* diamkan */
      }
    })();
    return () => {
      batal = true;
    };
  }, [jenis]);

  useEffect(() => {
    fetchRiwayat(1, true);
  }, [fetchRiwayat]);

  const filterTabs = useMemo(() => {
    const labels = [...new Set((ternak?.aksi || []).map((a) => a.label).filter(Boolean))];
    return [{ key: "Semua", label: "Semua" }, ...labels.map((l) => ({ key: l, label: l }))];
  }, [ternak]);

  const groups = useMemo(
    () =>
      kelompokkanRiwayat(items, {
        kunciGrup: (l) =>
          `${l.aktivitas_id || l.jadwal_id || "mandiri"}|${
            l.diinput_oleh || l.nama_perawat || "?"
          }`,
        catatan: (l) => l.catatan,
      }),
    [items],
  );

  const renderEntri = (grup) =>
    grup.entri.map((log) => {
      const Ikon = ikonAksiUntuk(log.nama_aksi, "ternak").Icon;
      const gaya =
        PALET_WARNA[ikonAksiUntuk(log.nama_aksi, "ternak").warna] ||
        PALET_WARNA.slate;
      return (
        <div key={log.id} className="flex items-center gap-2 text-sm">
          <span className={`${gaya.chipText} shrink-0`}>
            <Ikon size={16} />
          </span>
          <span className="text-ink font-medium">{log.label}</span>
          {typeof log.nilai_angka === "number" && log.nilai_angka > 0 && (
            <span className="inline-block text-xs bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300 font-bold px-2 py-0.5 rounded-md">
              {log.nilai_angka} ekor
            </span>
          )}
        </div>
      );
    });

  return (
    <div className="min-h-screen bg-surface2 pt-[100px] lg:pt-[140px] pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          to="/peternakan"
          className="group inline-flex items-center gap-2.5 w-fit px-4 py-2 rounded-full bg-card border border-line text-sm font-bold text-ink shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-300 hover:text-green-600 hover:-translate-y-0.5"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400 transition-colors group-hover:bg-green-100 dark:group-hover:bg-green-500/25">
            <FiArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          </span>
          Kembali ke Koleksi Ternak
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">
          Riwayat Perawatan
        </h1>
        <p className="text-muted mt-1">
          {ternak?.judul || ternak?.nama
            ? `Ternak: ${ternak.judul || ternak.nama}`
            : "Memuat..."}
          {total > 0 ? ` · ${total} catatan` : ""}
        </p>
      </div>

      <RiwayatTimeline
        judul="Riwayat Perawatan"
        groups={groups}
        loading={loading}
        emptyText="Belum ada riwayat perawatan untuk ternak ini."
        filterTabs={filterTabs}
        activeFilter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari aktivitas / perawat..."
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={() => fetchRiwayat(page + 1, false)}
        renderEntri={renderEntri}
        fotoUrl={fotoUrl}
        thumbUrl={thumbUrl}
      />
      </div>
    </div>
  );
};

export default TernakRiwayat;
