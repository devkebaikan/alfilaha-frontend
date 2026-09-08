import React, { useState, useEffect } from "react";
import { FiCheck, FiX, FiTrash2, FiUserCheck, FiClock, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users`);
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

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };  

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users/${id}/approve`, {
        method: "PUT"
      });
      if (res.ok) {
        showNotification("User berhasil disetujui!", "success");
        setUsers(users.map(u => u.id === id ? { ...u, status: 'approved' } : u));
      }
    } catch (err) {
      showNotification("Gagal menyetujui user.", "error");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Yakin ingin menolak dan menghapus user ini?")) {
      try {
        const res = await fetch(`${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/admin/users/${id}/reject`, {
          method: "DELETE"
        });
        if (res.ok) {
          showNotification("User berhasil ditolak dan dihapus.", "success");
          setUsers(users.filter(u => u.id !== id));
        }
      } catch (err) {
        showNotification("Gagal menolak user.", "error");
      }
    }
  };

  const filteredUsers = users.filter((u) => 
    u.nama_lengkap.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 min-h-[500px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Akun Internal</h2>
          <p className="text-sm text-gray-500 mt-1">Persetujuan pendaftaran Santri, Guru, dan Petugas</p>
        </div>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
          />
        </div>
      </div>

      {notification.show && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {notification.type === 'success' ? <FiCheck className="shrink-0" /> : <FiX className="shrink-0" />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <FiUserCheck className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-500 font-medium">Belum ada data pendaftar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{user.nama_lengkap}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">@{user.username}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === 'pending' ? (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        <FiClock /> Menunggu
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <FiCheck /> Disetujui
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FiCheck /> Terima
                        </button>
                        <button 
                          onClick={() => handleReject(user.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FiTrash2 /> Tolak
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleReject(user.id)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
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
