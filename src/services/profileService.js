import { getJwt } from "../utils/tokens";

const API = process.env.REACT_APP_API_URL;

// Helpers
async function httpJson(path, { method = "GET", headers, body } = {}) {
  const token = getJwt();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text().catch(() => "");
  let data = null; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error((data && data.message) || `HTTP ${res.status}`);
    err.status = res.status; err.payload = data;
    throw err;
  }
  return data;
}

export function getMeByEmail(email) {
  const token = getJwt();
  return fetch(`${API}/api/user/email/${encodeURIComponent(email)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(async (r) => {
    if (!r.ok) throw new Error("No se pudo obtener el usuario");
    return r.json();
  });
}

export function patchName(name)      { return httpJson("/api/user/name",    { method:"PATCH", body:{ name } }); }
export function patchSurname(surname){ return httpJson("/api/user/surname", { method:"PATCH", body:{ surname } }); }
export function patchEmail(email)    { return httpJson("/api/user/email",   { method:"PATCH", body:{ email } }); }
export function patchPhone(phoneNumber){ return httpJson("/api/user/phone", { method:"PATCH", body:{ phoneNumber } }); }
export function patchPassword(currentPassword, newPassword) {
  return httpJson("/api/user/password", { method:"PATCH", body:{ currentPassword, newPassword } });
}

export async function uploadProfilePhoto(file) {
  const token = getJwt();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/user/profile-photo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try {
    const parsed = text ? JSON.parse(text) : null;
    return typeof parsed === "string" ? parsed : (parsed?.url || parsed?.profilePhoto || "");
  } catch { return text; }
}

export async function becomeProvider() {
  const token = getJwt();
  const res = await fetch(`${API}/api/provider`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
  return res.json().catch(() => ({}));
}

export async function listCredentials() {
  const token = getJwt();
  const res = await fetch(`${API}/api/credential/all`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 403) return []; // no provider aún
  if (!res.ok) throw new Error("No se pudieron cargar las credenciales");
  return res.json();
}

export function createCredential(payload) {
  return httpJson("/api/credential", { method: "POST", body: payload });
}
