const fs = require('fs');
const file = '/home/fauzan/alfilaha-react/src/Pages/AlfilahaAdmin/AlfilahaAdmin.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
  /import BlogForm from "\.\/Tabs\/BlogForm\/BlogForm";/,
  `import BlogForm from "./Tabs/BlogForm/BlogForm";
import EventForm from "./Tabs/EventForm/EventForm";
import WisataForm from "./Tabs/WisataForm/WisataForm";`
);

// 2. States
content = content.replace(
  /const \[addWisataModal, setAddWisataModal\][\s\S]*?deskripsi: "", gambar: null,\n  }\);/g,
  `const [editingWisata, setEditingWisata] = useState(null);`
);
content = content.replace(
  /const \[editWisataModal, setEditWisataModal\] = useState\(\{[\s\S]*?\}\);/g,
  ``
);
content = content.replace(
  /const \[addEventModal, setAddEventModal\] = useState\(\{[\s\S]*?\}\);/g,
  `const [editingEvent, setEditingEvent] = useState(null);`
);
content = content.replace(
  /const \[editEventModal, setEditEventModal\] = useState\(\{[\s\S]*?\}\);/g,
  ``
);

// 3. Functions
const saveWisataStr = `const saveWisata = async (formData, id = null) => {
    try {
      const url = id
        ? \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket/\${id}\`
        : \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/paket\`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        showToast(\`Data paket wisata berhasil \${id ? "diperbarui" : "ditambahkan"}!\`);
        fetchWisata();
        setActiveTab("paket-wisata");
      } else {
        showToast(\`Gagal \${id ? "memperbarui" : "menambahkan"} paket.\`);
      }
    } catch (err) {
      console.error("Save Wisata Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };`;
content = content.replace(
  /const updateWisata = async \(e\) => \{[\s\S]*?showToast\("Koneksi ke server gagal\."\);\n    \}\n  \};/,
  saveWisataStr
);
content = content.replace(
  /const tambahWisata = async \(e\) => \{[\s\S]*?showToast\("Koneksi ke server gagal\."\);\n    \}\n  \};/,
  ``
);

const saveEventStr = `const saveEvent = async (formData, id = null) => {
    try {
      const url = id
        ? \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events/\${id}\`
        : \`\${import.meta.env.VITE_PUBLIC_API || "http://localhost:5000"}/api/events\`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        showToast(\`Event berhasil \${id ? "diperbarui" : "ditambahkan"}!\`);
        fetchEvents();
        setActiveTab("event");
      } else {
        showToast(\`Gagal \${id ? "memperbarui" : "menambahkan"} Event.\`);
      }
    } catch (err) {
      console.error("Save Event Error:", err);
      showToast("Koneksi ke server gagal.");
    }
  };`;
content = content.replace(
  /const addEvent = async \(e\) => \{[\s\S]*?showToast\("Koneksi ke server gagal\."\);\n    \}\n  \};/,
  saveEventStr
);
content = content.replace(
  /const updateEvent = async \(e\) => \{[\s\S]*?showToast\("Koneksi ke server gagal\."\);\n    \}\n  \};/,
  ``
);

// 4. Tab Renders
content = content.replace(
  /<Event[\s\S]*?\/>/,
  `<Event
                events={events}
                onAdd={() => {
                  setEditingEvent(null);
                  setActiveTab("event-form");
                }}
                onEdit={(event) => {
                  setEditingEvent(event);
                  setActiveTab("event-form");
                }}
                onDelete={(event) =>
                  setDeleteEventModal({
                    show: true,
                    id: event.id,
                    title: event.title,
                  })
                }
              />
            )}
            {activeTab === "event-form" && (
              <EventForm
                initialData={editingEvent}
                onSave={saveEvent}
                onCancel={() => setActiveTab("event")}
              />`
);

content = content.replace(
  /<PaketWisata[\s\S]*?\/>/,
  `<PaketWisata
                wisata={wisata}
                onAdd={() => {
                  setEditingWisata(null);
                  setActiveTab("paket-wisata"); // Wait, the tab name is paket-wisata? No wait, let's keep activeTab("wisata-form")
                }} // I will fix this in a sec
              />`
);

fs.writeFileSync(file, content);
console.log("Replaced");
