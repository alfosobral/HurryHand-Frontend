// src/services/authService.js
import { api } from "./apiClient";

export async function signUp(payload) {
  // sin cookies: same-origin/omit
  return api.post("/api/user", payload, { credentials: "same-origin" });
}

export async function login({ email, password }) {
  const data = await api.post("/auth/login", { email, password });
  // guardar token si corresponde
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
}

