// Quita todo lo que no sea dígito
export const unmaskDigits = (v = "") => v.replace(/\D+/g, "");

// Formatea CI uruguaya simple: 12345678 -> 1.234.567-8
export const formatUruguayanCI = (v = "") => {
  const d = unmaskDigits(v).slice(0, 8);
  if (!d) return "";
  const core = d.slice(0, -1);
  const dv = d.slice(-1);
  const withDots = core
    .replace(/^(\d{1})(\d{3})(\d{3})$/, "$1.$2.$3")
    .replace(/^(\d{1})(\d{3})$/, "$1.$2")
    .replace(/^(\d{1})$/, "$1");
  return dv ? `${withDots}-${dv}` : withDots;
};
