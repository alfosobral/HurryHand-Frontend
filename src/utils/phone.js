export const toE164 = (countryCode, phone) => {
  const cc = digits(countryCode || "+598");   // "+598" -> "598"
  const num = digits(phone || "");
  return `+${cc}${num}`;
};

export const digits = (s) => String(s || "").replace(/\D+/g, "");

export function splitE164(full = "", countries = []) {
  if (!full) return { countryCode: "+598", phoneNumber: "" };
  const found = countries.find((c) => full.startsWith(c.code));
  if (found) return { countryCode: found.code, phoneNumber: full.slice(found.code.length) };
  return { countryCode: "+598", phoneNumber: full };
}