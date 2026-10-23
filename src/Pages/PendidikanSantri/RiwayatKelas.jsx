import { useState } from "react";

export default function RiwayatKelas() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0,10));
  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Riwayat Kelas</h1>
        <div className="bg-card p-4 rounded-xl border border-line space-y-3">
          <input type="date" value={tanggal} onChange={(e)=>setTanggal(e.target.value)} className="px-3 py-2 border border-line rounded-lg" />
          <p className="text-muted text-sm">Riwayat akan menyesuaikan peran (umum/santri/admin) sesuai spesifikasi.</p>
        </div>
      </div>
    </div>
  );
}
