const fs = require("fs");
let file = fs.readFileSync("src/Pages/AlfilahaAdmin/AlfilahaAdmin.jsx", "utf8");

if (!file.includes("LayananManager")) {
  // Imports
  file = file.replace(
    'import PendaftaranManager from "./Tabs/PendaftaranManager/PendaftaranManager";',
    'import PendaftaranManager from "./Tabs/PendaftaranManager/PendaftaranManager";\nimport LayananManager from "./Tabs/Layanan/LayananManager";\nimport LayananForm from "./Tabs/Layanan/LayananForm";',
  );

  // States
  const states = `
  const [layanan, setLayanan] = useState([]);
  const [editingLayanan, setEditingLayanan] = useState(null);
  const [deleteLayananModal, setDeleteLayananModal] = useState({
    show: false,
    id: null,
    title: "",
  });
`;
  file = file.replace(
    "const [wisata, setWisata] = useState([]);",
    states + "const [wisata, setWisata] = useState([]);",
  );

  // API Call and methods
  const apiMethods = `
  const fetchLayanan = async () => {
    try {
      const response = await fetch(
        \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan\`,
      );
      if (response.ok) {
        const data = await response.json();
        setLayanan(data);
      }
    } catch (err) {
      console.error("Backend MySQL offline:", err);
    }
  };

  const handleOpenLayananForm = (item = null) => {
    setEditingLayanan(item);
    setActiveTab("layanan-form");
  };

  const saveLayanan = async (formData, id = null) => {
    try {
      const url = id
        ? \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan/\${id}\`
        : \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan\`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        showToast(\`Layanan berhasil \${id ? "diperbarui" : "ditambahkan"}!\`);
        fetchLayanan();
        setActiveTab("layanan");
      } else {
        showToast(\`Gagal \${id ? "memperbarui" : "menambahkan"} Layanan.\`);
      }
    } catch (err) {
      console.error("Save Layanan Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };

  const confirmHapusLayanan = async (id) => {
    setDeleteLayananModal({ show: false, id: null, title: "" });
    try {
      const response = await fetch(
        \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/layanan/\${id}\`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchLayanan();
        showToast("Layanan berhasil dihapus!");
      } else {
        showToast("Gagal menghapus Layanan dari server!");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      showToast("Gagal terhubung ke database.");
    }
  };
`;
  file = file.replace(
    "const fetchWisata = async () => {",
    apiMethods + "\n  const fetchWisata = async () => {",
  );

  // Effect
  file = file.replace(
    "fetchWisata();",
    "fetchWisata();\n      fetchLayanan();",
  );

  // Sidebar Button
  const sidebarButton = `
          <button
            onClick={() => handleTabChange("layanan")}
            className={\`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group \${
              activeTab === "layanan"
                ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20"
                : "text-green-100/70 hover:bg-white/5 hover:text-white font-medium"
            }\`}
          >
            <div
              className={\`p-2 rounded-xl flex items-center justify-center w-10 h-10 shrink-0 transition-colors \${activeTab === "layanan" ? "bg-green-500 text-white shadow-md" : "bg-white/5 text-green-200/70 group-hover:bg-white/10 group-hover:text-white"}\`}
            >
              <FiCheckCircle size={20} />
            </div>
            <span className="text-sm md:text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              Layanan Kami
            </span>
          </button>
`;
  file = file.replace(
    "Eduwisata\n            </span>\n          </button>",
    "Eduwisata\n            </span>\n          </button>\n" + sidebarButton,
  );

  // Render Tab
  const renderTab = `
            {activeTab === "layanan" && (
              <LayananManager
                layanan={layanan}
                onAdd={() => handleOpenLayananForm()}
                onEdit={handleOpenLayananForm}
                setDeleteLayananModal={setDeleteLayananModal}
              />
            )}
            {activeTab === "layanan-form" && (
              <LayananForm
                initialData={editingLayanan}
                onSave={saveLayanan}
                onCancel={() => setActiveTab("layanan")}
              />
            )}
`;
  file = file.replace(
    '{activeTab === "wisata" && (',
    renderTab + '            {activeTab === "wisata" && (',
  );

  // Delete Modal
  const deleteModal = `
      {/* Delete Layanan Modal */}
      {deleteLayananModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDeleteLayananModal({ show: false, id: null, title: "" })}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 shadow-2xl p-6 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hapus Layanan?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Anda yakin ingin menghapus layanan <span className="font-bold text-gray-700">"{deleteLayananModal.title}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteLayananModal({ show: false, id: null, title: "" })}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold transition flex-1"
              >
                Batal
              </button>
              <button
                onClick={() => confirmHapusLayanan(deleteLayananModal.id)}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md transition flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
`;
  file = file.replace(
    "{/* Delete Modal */}",
    deleteModal + "      {/* Delete Modal */}",
  );

  fs.writeFileSync("src/Pages/AlfilahaAdmin/AlfilahaAdmin.jsx", file, "utf8");
}
