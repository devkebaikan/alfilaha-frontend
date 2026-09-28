const getAdminToken = () => {
  const token = localStorage.getItem("alfilaha_admin_token");
  return typeof token === "string" ? token.trim() : "";
};

export const getAdminHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminFetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  const token = getAdminToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (typeof FormData !== "undefined" && init.body instanceof FormData) {
    headers.delete("Content-Type");
  }
  return fetch(input, { ...init, headers });
};
