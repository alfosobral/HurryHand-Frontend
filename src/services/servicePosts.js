const API = "http://localhost:8080";

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
} = {}) {
  const payload = { page, size, sortBy, direction };
  if (query && query.trim()) payload.query = query.trim();

  try {
    console.log("📡 listServicePosts payload:", payload);
    const res = await fetch(`${API}/api/service-post/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await parseJsonResponse(res);
    console.log("📥 listServicePosts response:", data);
    return data;
  } catch (err) {
    console.error("❗ listServicePosts error", err);
    throw err;
  }
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
  const API =  "http://localhost:8080";
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
    console.log("getServicePostById response:", data);
    return data;
  } catch (err) {
    console.error("getServicePostById error", err);
    throw err;
  }
}



export async function deleteServicePost(servicePostId, token) {
  try {
    const response = await fetch(`${API}/api/service-post/${servicePostId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar el servicio.");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error en deleteServicePost:", error);
    throw error;
  }
}

export async function deleteAvailableDate(servicePostId, date, token) {
  try {
    const url = `${API}/api/service-post/${servicePostId}/available-dates?date=${encodeURIComponent(date)}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al eliminar la fecha disponible.");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error en deleteAvailableDate:", error);
    throw error;
  }
}


