// Helper bersama untuk halaman/detail riwayat perawatan (tanaman & ternak).
// Dipakai supaya logika pengelompokan dan format tanggal konsisten dan hanya
// ada di satu tempat.

export const jamWIB = (t) =>
  new Date(t)
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    .replace(".", ":");

export const tglIndo = (t) =>
  new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Kelompokkan log menjadi sesi/tugas: satu santri menyelesaikan beberapa aksi
// dalam satu waktu dianggap satu grup. Opsi menyesuaikan bentuk data tanaman
// maupun ternak.
export function kelompokkanRiwayat(logs, opsi = {}) {
  const {
    waktuOf = (l) => l.waktu_tindakan || l.created_at,
    kunciGrup = (l) =>
      `${l.jadwal_id || l.aktivitas_id || "mandiri"}|${
        l.nama_perawat || l.nama_santri || l.diinput_oleh || "?"
      }`,
    namaAktivitas = (l) => l.nama_aktivitas,
    perawat = (l) => l.nama_santri || l.nama_perawat,
    role = (l) => l.role_perawat || l.role,
    catatan = (l) => l.laporan_singkat || l.catatan,
    foto = (l) => l.gambar || l.foto,
  } = opsi;

  const map = new Map();
  const hasil = [];

  (Array.isArray(logs) ? logs : []).forEach((log) => {
    const waktu = new Date(waktuOf(log));
    const stamp = isNaN(waktu.getTime())
      ? String(log.id)
      : `${waktu.toISOString().slice(0, 13)}|${Math.floor(waktu.getMinutes() / 2)}`;
    const key = `${kunciGrup(log)}|${stamp}`;

    let grup = map.get(key);
    if (!grup) {
      grup = {
        key,
        waktu: waktuOf(log),
        nama_aktivitas: namaAktivitas(log),
        perawat: perawat(log),
        role: role(log),
        laporan: catatan(log),
        foto: foto(log),
        entri: [],
      };
      map.set(key, grup);
      hasil.push(grup);
    }
    grup.entri.push(log);
    if (!grup.laporan && catatan(log)) grup.laporan = catatan(log);
    if (!grup.foto && foto(log)) grup.foto = foto(log);
  });

  return hasil;
}
