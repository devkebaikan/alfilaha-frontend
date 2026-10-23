import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

export default function KelasSantri() {
  const [status, setStatus] = useState(null);
  const [showAbsen, setShowAbsen] = useState(false);
  const [showIzin, setShowIzin] = useState(false);
  const [jadwal, setJadwal] = useState([]);
  const { santriToken } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        if (!santriToken) return;
        const res = await fetch(`${API}/api/santri/jadwal-pelajaran`, {
          headers: { Authorization: `Bearer ${santriToken}` },
        });
        if (res.ok) {
          setJadwal(await res.json());
        }
      } catch (e) {}
    })();
  }, [santriToken]);

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <h1 className="text-2xl font-bold">Kelas Santri</h1>
        <div className="bg-card p-4 rounded-xl border border-line">
          <h2 className="font-bold mb-2">Kehadiran hari ini</h2>
          {!status && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg" onClick={() => setShowAbsen(true)}>Absen</button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg" onClick={() => setShowIzin(true)}>Izin</button>
            </div>
          )}
          {status && <div className="font-semibold">{status}</div>}
        </div>
        <div className="bg-card p-4 rounded-xl border border-line">
          <h2 className="font-bold mb-2">Jadwal Pelajaran</h2>
          {jadwal.length === 0 ? (
            <p className="text-muted text-sm">Belum ada jadwal pelajaran.</p>
          ) : (
            <div className="space-y-2">
              {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].map((h) => (
                <div key={h}>
                  <h3 className="font-semibold text-sm mt-2">{h}</h3>
                  {jadwal.filter((j)=>j.hari===h).sort((a,b)=>a.jam_mulai.localeCompare(b.jam_mulai)).map((j,idx)=>(
                    <div key={idx} className="flex justify-between text-sm py-1 border-b border-line">
                      <span>{j.jam_mulai}-{j.jam_selesai} · {j.mapel}</span>
                      <span className="text-muted">{j.guru_nama || '-'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showAbsen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-xl max-w-md w-full">
            <h3 className="font-bold mb-2">Ikut pelajaran sampai selesai?</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => { setStatus("Hadir"); setShowAbsen(false); }}>Ya, sampai selesai</button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={() => { setStatus("Hadir, pulang lebih awal"); setShowAbsen(false); }}>Tidak, pulang lebih awal</button>
            </div>
            <button className="mt-3 text-muted" onClick={() => setShowAbsen(false)}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}
