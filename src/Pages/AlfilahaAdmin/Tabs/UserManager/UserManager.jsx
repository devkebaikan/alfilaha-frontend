import { useState, useEffect } from "react";
import {
  FiCheck,
  FiX,
  FiTrash2,
  FiUserCheck,
  FiClock,
  FiSearch,
} from "react-icons/fi";
import { getAdminHeaders } from "../../../../adminAuth";
import { useNotifikasi } from "../../../../Context/NotifikasiContext";

const UserManager = () => {
  const notif = useNotifikasi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users`,
        { headers: getAdminHeaders() },
      );
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Persetujuan/penolakan user hanya jadi toast, tidak masuk riwayat lonceng
  const showNotification = (message, type) => {
    notif[type === "success" ? "success" : "error"](message, { simpan: false });
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users/${id}/approve`,
        {
          method: "PUT",
          headers: getAdminHeaders(),
        },
      );
      if (res.ok) {
        showNotification("User berhasil disetujui!", "success");
        setUsers(
          users.map((u) => (u.id === id ? { ...u, status: "approved" } : u)),
        );
      }
    } catch (err) {
      showNotification("Gagal menyetujui user.", "error");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Yakin ingin menolak dan menghapus user ini?")) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users/${id}/reject`,
          {
            method: "DELETE",
            headers: getAdminHeaders(),
          },
        );
        if (res.ok) {
          showNotification("User berhasil ditolak dan dihapus.", "success");
          setUsers(users.filter((u) => u.id !== id));
        }
      } catch (err) {
        showNotification("Gagal menolak user.", "error");
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-card rounded-[2rem] shadow-xl p-8 border border-line min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink">
            Manajemen Akun Internal
          </h2>
          <p className="text-sm text-muted mt-1">
            Persetujuan pendaftaran Santri, Petani, Asstaidz, dan Pengelola
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-muted" />
          </div>
          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-surface2 rounded-2xl border border-dashed border-line">
          <FiUserCheck className="mx-auto h-12 w-12 text-muted mb-3" />
          <p className="text-muted font-medium">Belum ada data pendaftar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface2">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-muted uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-line">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-surface2 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-ink">
                      {user.nama_lengkap}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-muted bg-surface2 px-2 py-1 rounded text-sm">
                      @{user.username}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === "rejected" ? (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-500/20 text-red-800">
                        <FiX /> Ditolak
                      </span>
                    ) : user.status === "pending" ? (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-800">
                        <FiClock /> Menunggu
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-500/20 text-green-800">
                        <FiCheck /> Disetujui
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FiCheck /> Terima
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="bg-red-50 dark:bg-red-500/15 hover:bg-red-100 dark:hover:bg-red-500/20 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FiTrash2 /> Tolak
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReject(user.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/15 p-2 rounded-lg transition-colors"
                        title="Hapus User"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManager;
