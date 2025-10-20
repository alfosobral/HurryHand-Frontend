// utils/helpers.js
export const digits = (s) => String(s || "").replace(/\D+/g, "");

// Uruguay por defecto si no guardás countryCode:
export const toE164 = (countryCode, phone) => {
  const cc = digits(countryCode || "+598");   // "+598" -> "598"
  const num = digits(phone || "");
  return `+${cc}${num}`;
};
