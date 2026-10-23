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
import ActionMenu from "../../../../Shared/ActionMenu";

const UserManager = () => {
  const notif = useNotifikasi();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama_lengkap: "", username: "", password: "", peran: [] });
  const [menuTerbuka, setMenuTerbuka] = useState(null);

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

  // Persetujuan/penolakan user hanya jadi toast — lonceng hanya untuk
  // peristiwa dari luar panel admin.
  const showNotification = (message, type) => {
    notif[type === "success" ? "success" : "error"](message);
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
        setMenuTerbuka(null);
      }
    } catch (err) {
      showNotification("Gagal menyetujui user.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users/${id}/reject`,
        {
          method: "PUT",
          headers: getAdminHeaders(),
        },
      );
      if (res.ok) {
        showNotification("User berhasil ditolak/dihapus.", "success");
        fetchUsers();
        setMenuTerbuka(null);
      } else {
        showNotification("Gagal menolak user.", "error");
      }
    } catch (err) {
      showNotification("Gagal menolak user.", "error");
    }
  };

  const toggleFormRole = (p) => {
    setForm((prev) => {
      const has = prev.peran.includes(p);
      return {
        ...prev,
        peran: has ? prev.peran.filter((r) => r !== p) : [...prev.peran, p],
      };
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users`,
        {
          method: "POST",
          headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (res.ok) {
        showNotification("User berhasil ditambahkan.", "success");
        setShowForm(false);
        setForm({ nama_lengkap: "", username: "", password: "", peran: [] });
        fetchUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        showNotification(data.message || "Gagal menambahkan user.", "error");
      }
    } catch (err) {
      showNotification("Gagal menambahkan user.", "error");
    }
  };


  const toggleRole = async (userId, peran, active) => {
    try {
      const url = active
        ? `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users/${userId}/roles/${peran}`
        : `${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users/${userId}/roles`;
      const res = await fetch(url, {
        method: active ? 'DELETE' : 'POST',
        headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
        body: active ? null : JSON.stringify({ peran }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };


  const filteredUsers = users.filter((u) => {
    const match = u.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
    if (!roleFilter) return match;
    const list = Array.isArray(u.peran_list) ? u.peran_list : [];
    return match && list.includes(roleFilter);
  });

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

        <div className="flex gap-2 w-full sm:w-auto">
          <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)} className="px-3 py-2 border border-line rounded-xl text-sm"><option value="">Semua Peran</option><option value="guru">Guru</option><option value="santri">Santri</option><option value="petugas">Petugas</option></select>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiSearch className="text-muted" /></div>
            <input type="text" placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-line rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"/>
          </div>
          <button onClick={()=>setShowForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold">Tambah User</button>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-ink uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-ink uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-ink uppercase tracking-wider">
                  Peran
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-ink uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-ink uppercase tracking-wider">
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
                    <span className="text-ink bg-surface2 px-2 py-1 rounded text-sm font-semibold">
                      @{user.username}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1 flex-wrap">
                      {["guru","santri","petugas"].map((p) => {
                        const has = Array.isArray(user.peran_list) && user.peran_list.includes(p);
                        return (
                          <button
                            key={p}
                            onClick={() => toggleRole(user.id, p, has)}
                            className={`px-2 py-0.5 text-[10px] rounded ${has ? "bg-green-100 text-green-700" : "bg-surface2 text-muted border border-line"}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === "rejected" ? (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-200">
                        <FiX /> Ditolak
                      </span>
                    ) : user.status === "pending" ? (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-200">
                        <FiClock /> Menunggu
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-bold rounded-full bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-200">
                        <FiCheck /> Disetujui
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <ActionMenu
                        terbuka={menuTerbuka === user.id}
                        onToggle={() =>
                          setMenuTerbuka((cur) =>
                            cur === user.id ? null : user.id,
                          )
                        }
                        onTutup={() => setMenuTerbuka(null)}
                        items={
                          user.status === "pending"
                            ? [
                                {
                                  label: "Terima",
                                  icon: <FiCheck size={15} />,
                                  onClick: () => handleApprove(user.id),
                                },
                                {
                                  label: "Tolak",
                                  icon: <FiTrash2 size={15} />,
                                  danger: true,
                                  onClick: () => handleReject(user.id),
                                },
                              ]
                            : [
                                {
                                  label: "Hapus",
                                  icon: <FiTrash2 size={15} />,
                                  danger: true,
                                  onClick: () => handleReject(user.id),
                                },
                              ]
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card p-6 rounded-2xl w-full max-w-md border border-line">
            <h3 className="font-bold text-lg mb-4">Tambah User</h3>
            <form onSubmit={handleAddUser} className="space-y-3">
              <input required className="w-full px-3 py-2 border border-line rounded-lg" placeholder="Nama Lengkap" value={form.nama_lengkap} onChange={(e)=>setForm({...form,nama_lengkap:e.target.value})} />
              <input required className="w-full px-3 py-2 border border-line rounded-lg" placeholder="Username" value={form.username} onChange={(e)=>setForm({...form,username:e.target.value})} />
              <input required type="password" className="w-full px-3 py-2 border border-line rounded-lg" placeholder="Password awal" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
              <div className="flex gap-2 flex-wrap">
                {["guru","santri","petugas"].map((p)=>(
                  <label key={p} className="flex items-center gap-1 px-2 py-1 border border-line rounded-lg">
                    <input type="checkbox" checked={form.peran.includes(p)} onChange={()=>toggleFormRole(p)} /> {p}
                  </label>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={()=>setShowForm(false)} className="px-4 py-2 border border-line rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
