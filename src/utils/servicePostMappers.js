import { DAY_INDEX_TO_KEY } from "../constants/servicePostConstants";

export function toBackendPayload(form) {
  const normalizedSlots = Object.fromEntries(
    Object.entries(form.weeklySlots || {}).map(([k, hours]) => [
      k,
      (hours || [])
        .map((h) => Number(h))
        .filter((v) => Number.isInteger(v) && v >= 0 && v <= 23),
    ])
  );

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    price: Number(form.rate || 0),
    duration: Number(form.xMinutes || 0),
    availableDates: buildAvailableDates(normalizedSlots, form.validUntil, Number(form.xMinutes || 0)),
    location: form.addLocation ? normalizeLocation(form.location) : null,
  };
}

export function mapBackendErrorsToFields(data) {
  const mapped = {};
  if (data?.validationErrors && typeof data.validationErrors === "object") {
    Object.assign(mapped, data.validationErrors);
  } else if (Array.isArray(data?.errors)) {
    for (const e of data.errors) if (e.field && e.message) mapped[e.field] = e.message;
  } else if (data?.message) {
    const msg = data.message;
    if (/t[ií]tulo|title/i.test(msg)) mapped.title = msg;
    else if (/descrip/i.test(msg)) mapped.description = msg;
    else if (/duraci[óo]n|minutes|duration/i.test(msg)) mapped.xMinutes = msg;
    else if (/tarifa|precio|price/i.test(msg)) mapped.rate = msg;
    else if (/vigencia|válido|valid/i.test(msg)) mapped.validUntil = msg;
    else mapped._general = msg;
  }
  return mapped;
}

function buildAvailableDates(weeklySlots, validUntil, xMinutes) {
  const result = [];
  const any = Object.values(weeklySlots).some((h) => Array.isArray(h) && h.length > 0);
  if (!any || !xMinutes) return result;

  const today = new Date(); today.setHours(0,0,0,0);

  let endDate;
  if (validUntil) {
    const parsed = new Date(validUntil);
    if (!Number.isNaN(parsed.getTime())) { parsed.setHours(23,59,59,999); endDate = parsed; }
  }
  if (!endDate) { const d = new Date(today); d.setDate(d.getDate() + 14); d.setHours(23,59,59,999); endDate = d; }

  for (let cursor = new Date(today); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
    const dayKey = DAY_INDEX_TO_KEY[cursor.getDay()];
    const hours = weeklySlots[dayKey] || [];
    for (const hour of hours) {
      const slotDate = new Date(cursor);
      slotDate.setHours(hour, 0, 0, 0);
      result.push(formatLocal(slotDate));
      if (result.length >= 200) return result;
    }
  }
  return result;
}

function formatLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:00:00`;
}

function blankToNull(v) { if (typeof v !== "string") return null; const t = v.trim(); return t ? t : null; }
function numberOrNull(v) { if (v === undefined || v === null || v === "") return null; const n = Number(v); return Number.isFinite(n) ? n : null; }

export function normalizeLocation(raw) {
  if (!raw) return null;
  const departamento = (raw.department || "").trim();
  const location = {
    departamento: departamento || null,
    neighbourhood: blankToNull(raw.city),
    street: blankToNull(raw.street),
    streetNumber: numberOrNull(raw.doorNumber),
    postalCode: numberOrNull(raw.postalCode),
    aptoNumber: numberOrNull(raw.apartment),
  };
  const hasAny = Object.values(location).some((v) => v !== null);
  return hasAny ? location : null;
}
