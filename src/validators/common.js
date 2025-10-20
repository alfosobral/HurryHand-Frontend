import { passwordStrength } from "../utils/password";

export const required = (msg = "Requerido") => (v) =>
  v == null || String(v).trim() === "" ? msg : "";

export const minLen = (n, msg = `Mínimo ${n} caracteres`) => (v = "") =>
  String(v).length < n ? msg : "";

export const maxLen = (n, msg = `Máximo ${n} caracteres`) => (v = "") =>
  String(v).length > n ? msg : "";

export const email = (msg = "Email inválido") => (v = "") =>
  /\S+@\S+\.\S+/.test(v) ? "" : msg;

export const onlyDigits = (msg = "Solo dígitos") => (v = "") =>
  /^\d*$/.test(String(v)) ? "" : msg;

export const numberRange = (min, max, msg = `Entre ${min} y ${max}`) => (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? "" : msg;
};

export const matchesField = (otherField, msg = "No coincide") => (v, all) =>
  v === all[otherField] ? "" : msg;

export const strongPassword = (msg = "Debe tener mayúscula, minúscula, número y símbolo") => (v = "") =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).+$/.test(v) ? "" : msg;

export const validPhone = (msg = "Teléfono inválido (9 dígitos)") => (v = "") => 
    /^\+?[0-9]{8}$/.test(v) ? "" : msg;

export const validAge = (min = 18, msg = `Debes tener al menos ${min} años`) => (value) => {
  if (!value) return "Fecha requerida";
  const birth = new Date(value);
  if (isNaN(birth)) return "Fecha inválida";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

  return age >= min ? "" : msg;
};

export const strongEnough =
  (minScore = 3, msg = "La contraseña es demasiado débil") =>
  (v = "") => {
    const { score } = passwordStrength(v);
    return score >= minScore ? "" : msg; 
  };


