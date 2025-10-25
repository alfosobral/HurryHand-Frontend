import { getJwt } from "../utils/tokens";

const BASE_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:8080").replace(/\/$/, "");

const DEFAULT_TIMEOUT_MS = 15000;

function withTimeout(ms, upstreamSignal) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new DOMException("Timeout","AbortError")), ms);
  if (upstreamSignal) upstreamSignal.addEventListener("abort", () => ctrl.abort(upstreamSignal.reason));
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

function getAuthToken() {
  return getJwt();
}

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
    credentials = "omit",        // ⬅️ igual que tu fetch “crudo”
    mode = "cors",
    auth = false,                // ⬅️ NO agregamos Authorization salvo que lo pidas
  } = {}
) {
  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const finalHeaders = new Headers({
    // Tu fetch simple solo ponía Content-Type. Dejamos Accept opcional.
    ...headers,
  });

  // Body JSON por defecto si pasás un objeto y no es FormData/Blob
  let finalBody;
  const upper = method.toUpperCase();
  if (upper !== "GET" && upper !== "HEAD" && body != null) {
    const shouldJson =
      !isFormData(body) && !isBlob(body) && !isArrayBuffer(body) &&
      (!finalHeaders.has("Content-Type") || finalHeaders.get("Content-Type")?.includes("application/json"));

    if (shouldJson) {
      finalHeaders.set("Content-Type", "application/json");
      finalBody = typeof body === "string" ? body : JSON.stringify(body);
    } else {
      finalBody = body;
      if (isFormData(body) && finalHeaders.has("Content-Type")) {
        finalHeaders.delete("Content-Type"); // deja que el navegador ponga el boundary
      }
    }
  }

  // ⬅️ Authorization solo si lo pedís explícitamente
  if (auth) {
    const token = getAuthToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const { signal: timeoutSignal, clear } = withTimeout(timeout, signal);

  try {
    const res = await fetch(url, {
      method: upper,
      headers: finalHeaders,
      body: finalBody,
      signal: timeoutSignal,
      credentials,   // ⬅️ por defecto “omit”, como tu fetch que anda
      mode,
    });

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const err = new Error((data && data.message) || `HTTP ${res.status}`);
      err.status = res.status;
      err.payload = data;
      throw err;
    }

    return data;
  } finally {
    clear();
  }
}

export const api = {
  get: (p, opt) => apiFetch(p, { ...opt, method: "GET" }),
  post: (p, body, opt) => apiFetch(p, { ...opt, method: "POST", body }),
  put: (p, body, opt) => apiFetch(p, { ...opt, method: "PUT", body }),
  patch: (p, body, opt) => apiFetch(p, { ...opt, method: "PATCH", body }),
  del: (p, opt) => apiFetch(p, { ...opt, method: "DELETE" }),
};
