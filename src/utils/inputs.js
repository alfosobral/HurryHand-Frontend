// Solo dígitos (útil en onChange sanitizando el valor)
export const onlyDigits = (v = "") => String(v).replace(/\D+/g, "");

// Bloquea caracteres no numéricos en tipeo (teclado)
export const blockNonDigits = (e) => {
  if (e.data && /\D/.test(e.data)) e.preventDefault();
};

// Crea un onChange que sanitiza con una función (p. ej. onlyDigits)
export const makeSanitizedChange = (setValues, sanitizer) => (field) => (e) => {
  const raw = e?.target?.value ?? "";
  const clean = sanitizer(raw);
  setValues((s) => ({ ...s, [field]: clean }));
};

// onPaste que limpia lo pegado con un sanitizer
export const makeSanitizedPaste = (setValues, sanitizer) => (field) => (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text");
  const clean = sanitizer(text);
  setValues((s) => ({ ...s, [field]: clean }));
};

export const onlyDigitsMax = (n) => (v = "") =>
  String(v).replace(/\D+/g, "").slice(0, n);