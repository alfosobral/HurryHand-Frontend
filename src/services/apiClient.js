const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const DEFAULT_TIMEOUT_MS = 15000;

function withTimeout(ms, signal) {
  const ctrl = new AbortController();
  const id = setTimeout(
    () => ctrl.abort(new DOMException("Timeout", "AbortError")),
    ms
  );
  if (signal) signal.addEventListener("abort", () => ctrl.abort(signal.reason));
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

function getAuthToken() {
  return localStorage.getItem("token");
}

// Helpers para detectar payloads especiales
const isFormData = (b) => typeof FormData !== "undefined" && b instanceof FormData;
const isBlob = (b) => typeof Blob !== "undefined" && b instanceof Blob;
const isArrayBuffer = (b) =>
  typeof ArrayBuffer !== "undefined" && (b instanceof ArrayBuffer || ArrayBuffer.isView?.(b));

export async function apiFetch(
  path,
  {
    method = "GET",
    headers,
    body,
    timeout = DEFAULT_TIMEOUT_MS,
    signal,
    // IMPORTANTE: por defecto NO incluimos cookies; así se comporta como tu fetch “directo”
    credentials = "same-origin", // "omit" | "same-origin" | "include"
  } = {}
) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  // Armado de headers (no forzar Content-Type si el body es FormData/Blob/etc.)
  const finalHeaders = new Headers({
    Accept: "application/json",
    ...headers,
  });

  const token = getAuthToken();
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  const methodUpper = method.toUpperCase();

  // No adjuntar body en GET/HEAD
  let finalBody = undefined;
  if (methodUpper !== "GET" && methodUpper !== "HEAD" && body != null) {
    const shouldJson =
      !isFormData(body) && !isBlob(body) && !isArrayBuffer(body) && // no json para binarios
      (finalHeaders.get("Content-Type")?.includes("application/json") ||
        // si no especificaron content-type y es un objeto plano, asumimos JSON
        !finalHeaders.has("Content-Type"));

    if (shouldJson) {
      finalHeaders.set("Content-Type", "application/json");
      finalBody = typeof body === "string" ? body : JSON.stringify(body);
    } else {
      // Dejar que el navegador ponga el boundary correcto si es FormData
      finalBody = body;
      // Si es FormData y el dev puso Content-Type manualmente, lo quitamos
      if (isFormData(body) && finalHeaders.has("Content-Type")) {
        finalHeaders.delete("Content-Type");
      }
    }
  }

  const { signal: timeoutSignal, clear } = withTimeout(timeout, signal);

  try {
    const resp = await fetch(url, {
      method: methodUpper,
      headers: finalHeaders,
      body: finalBody,
      signal: timeoutSignal,
      credentials, // ← ahora configurable, default "same-origin" (como tu fetch que sí funcionó)
    });

    // 204 => sin contenido
    if (resp.status === 204) return null;

    const text = await resp.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text; // no era JSON
    }

    if (!resp.ok) {
      const err = new Error(
        (data && data.message) || `HTTP ${resp.status}`
      );
      err.status = resp.status;
      err.payload = data;
      throw err;
    }

    return data;
  } finally {
    clear();
  }
}

// Azúcares por verbo
export const api = {
  get: (p, opt) => apiFetch(p, { ...opt, method: "GET" }),
  post: (p, body, opt) => apiFetch(p, { ...opt, method: "POST", body }),
  put: (p, body, opt) => apiFetch(p, { ...opt, method: "PUT", body }),
  patch: (p, body, opt) => apiFetch(p, { ...opt, method: "PATCH", body }),
  del: (p, opt) => apiFetch(p, { ...opt, method: "DELETE" }),
};
