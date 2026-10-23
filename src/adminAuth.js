const getAdminToken = () => {
  const token = localStorage.getItem("alfilaha_admin_token");
  return typeof token === "string" ? token.trim() : "";
};

export const getAdminHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Baca payload JWT tanpa verifikasi (hanya untuk cek kedaluwarsa/klaim).
const decodeJwtPayload = (token) => {
  try {
    const part = String(token).split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Token admin masih valid? Dipakai untuk mencegah tampilan dashboard terbuka
 * dengan token kedaluwarsa / format lama (yang akan ditolak server dengan 403).
 */
export const isAdminTokenValid = () => {
  const token = getAdminToken();
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.id) return false;
  const role = String(payload.role || "").toLowerCase();
  const kind = String(
    payload.kind || (role === "admin" ? "admin" : ""),
  ).toLowerCase();
  if (kind !== "admin") return false;
  if (payload.exp && payload.exp * 1000 < Date.now()) return false;
  return true;
};

const clearAdminSession = () => {
  localStorage.removeItem("alfilaha_admin_token");
  try {
    window.dispatchEvent(new CustomEvent("alfilaha-admin-unauthorized"));
  } catch {
    /* abaikan bila environment tidak punya window */
  }
};

export const adminFetch = async (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  const token = getAdminToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (typeof FormData !== "undefined" && init.body instanceof FormData) {
    headers.delete("Content-Type");
  }
  const res = await fetch(input, { ...init, headers });
  // Token hilang/kadaluarsa/tidak valid → paksa login ulang agar tidak
  // berulang kali gagal 403 tanpa penjelasan.
  if ((res.status === 401 || res.status === 403) && token) {
    clearAdminSession();
  }
  return res;
};
