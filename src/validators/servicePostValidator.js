export function validateStep1(f) {
  const e = {};
  if (!f.title?.trim()) e.title = "El título es obligatorio.";
  if (!f.description?.trim()) e.description = "La descripción es obligatoria.";
  if (!Number(f.xMinutes)) e.xMinutes = "Seleccioná una duración.";
  if (!String(f.rate).trim()) e.rate = "La tarifa es obligatoria.";
  if (!f.validUntil) e.validUntil = "Indicá hasta qué día es válida.";
  return e;
}
export function validateStep2(f) {
  const any = Object.values(f.weeklySlots || {}).some((arr) => (arr || []).length > 0);
  return any ? {} : { weeklySlots: "Elegí al menos una franja en algún día." };
}
export function validateLocation(loc) {
  if (!loc) return {};
  const e = {};
  if (!loc.department) e.department = "Seleccioná un departamento.";
  if (!loc.city?.trim()) e.city = "Ingresá la ciudad.";
  if (!loc.street?.trim()) e.street = "Ingresá la calle.";
  if (!loc.doorNumber) e.doorNumber = "Ingresá el número de puerta.";
  if (!loc.postalCode) e.postalCode = "Ingresá el código postal.";
  return e;
}
export function validateAll(f) {
  return {
    ...validateStep1(f),
    ...validateStep2(f),
    ...(f.addLocation ? validateLocation(f.location) : {}),
  };
}
