import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const API = import.meta.env.VITE_PUBLIC_API || "http://localhost:5000";

export default function BerandaSantri() {
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const navigate = useNavigate();
  const { santriToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!santriToken) return;
        const res = await fetch(`${API}/api/santri/jadwal-pelajaran`, {
          headers: { Authorization: `Bearer ${santriToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][new Date().getDay()];
          const list = Array.isArray(data) ? data.filter((j) => j.hari === hari) : [];
          setJadwalHariIni(list);
        }
      } catch (e) {}
    };
    fetchData();
  }, [santriToken]);

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">Beranda Santri</h1>
        <div className="bg-card p-6 rounded-xl border border-line">
          <h2 className="font-bold mb-2">Jadwal Pelajaran Hari Ini</h2>
          {jadwalHariIni.length === 0 ? (
            <p className="text-muted text-sm mb-3">Tidak ada jadwal pelajaran hari ini.</p>
          ) : (
            <div className="space-y-2 mb-3">
              {jadwalHariIni.map((j, idx) => (
                <div key={idx} className="flex justify-between text-sm border-b border-line pb-1">
                  <span>{j.jam_mulai}-{j.jam_selesai} · {j.mapel}</span>
                  <span className="text-muted">{j.guru_nama || '-'}</span>
                </div>
              ))}
            </div>
          )}
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg" onClick={() => navigate("/pendidikan/kelas")}>Lihat Kelas</button>
        </div>
      </div>
    </div>
  );
}
