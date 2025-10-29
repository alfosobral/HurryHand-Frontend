const API = process.env.REACT_APP_API_URL;

function toSearchParams(obj) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (s === "") return;
    sp.set(k, s);
  });
  return sp.toString();
}


async function parseJsonResponse(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || `Error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function listServicePosts({
  page = 1,
  size = 12,
  sortBy = "PRICE",      
  direction = "DESC",
  query = "",
  signal, 
} = {}) {
  const qs = toSearchParams({
    page,
    size,
    sortBy,
    direction,
    query, 
  });
  const url = `${API}/api/service-post/all${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  return parseJsonResponse(res);
}

export async function createServicePost(payload) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/service-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res);
}

export async function uploadPhotosOnly(files) {
  if (!files || files.length === 0) return [];
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/service-post/photos`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // NO Content-Type para FormData
    },
    credentials: "include",
    body: formData,
  });
  return parseJsonResponse(res);
}

export async function uploadServicePostPhoto(file, servicePostId) {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("servicePostId", servicePostId);
  const token = localStorage.getItem("token");
  const res = await fetch(`${API}/api/service-post/servicepost-photos`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: formData,
  });
  const data = await parseJsonResponse(res);
  return Array.isArray(data) ? data[0] : data;
}

export async function createServicePostMultipart(payload, files = []) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append(
    "servicePost",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  (files || []).forEach((file) => formData.append("photos", file));

  const res = await fetch(`${API}/api/service-post`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // NO Content-Type: dejar que el navegador ponga el boundary
    },
    credentials: "include", // si tu backend usa cookies/sesión
    body: formData,
  });

  return parseJsonResponse(res);
}

export async function getServicePostById(id) {
  if (!id) throw new Error("El ID del servicio es requerido");

  try {
    const res = await fetch(`${API}/api/service-post/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await parseJsonResponse(res);
    console.log("📥 getServicePostById response:", data);
    return data;
  } catch (err) {
    console.error("❗ getServicePostById error", err);
    throw err;
  }
}


