export const API = "http://localhost:5000";

export const loginAdmin = async (request) => {
  const res = await request.post(`${API}/api/login`, {
    data: { username: "admin", password: "admin123" },
  });
  if (!res.ok()) throw new Error(`Login admin gagal: ${res.status()}`);
  const data = await res.json();
  return data.token;
};

export const loginAsAdmin = async (page, request, tab = "beranda") => {
  const token = await loginAdmin(request);
  await page.addInitScript(
    (t) => localStorage.setItem("alfilaha_admin_token", t),
    token,
  );
  await page.goto(`/admin/${tab}`);
};

export const apiGet = async (path) => {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
};

export const apiDeleteSafe = async (path) => {
  try {
    await fetch(`${API}${path}`, { method: "DELETE" });
  } catch {
    /* abaikan saat cleanup */
  }
};

export const apiDelete = async (path) => {
  const res = await fetch(`${API}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`DELETE ${path} -> ${res.status}`);
  return res.json();
};

export const createLokasi = async (nama, kegiatan = []) => {
  const res = await fetch(`${API}/api/lokasi`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, keterangan: "Lokasi hasil uji e2e", kegiatan }),
  });
  if (!res.ok)
    throw new Error(`create lokasi -> ${res.status}: ${await res.text()}`);
  return res.json();
};

export const createTanaman = async ({ nama, lokasi_id, jenis = "Tanaman Hias" }) => {
  const fd = new FormData();
  fd.append("nama", nama);
  fd.append("jenis", jenis);
  fd.append("lokasi_id", String(lokasi_id));
  const res = await fetch(`${API}/api/tanaman`, { method: "POST", body: fd });
  if (!res.ok)
    throw new Error(`create tanaman -> ${res.status}: ${await res.text()}`);
  return res.json();
};

export const uniqueName = (prefix) => `${prefix} E2E ${Date.now()}`;