import { api } from "./apiClient";

const EVENTS_ENDPOINT = "/api/appointment/all/my";

function normalizeEvent(raw = {}) {
  const startIso = raw.appointmentDateTime || raw.startAt || raw.start;
  if (!startIso) return null;

  const durationMinutes = Number(
    raw.durationMinutes ?? raw.duration ?? raw.estimatedDuration ?? 0
  );

  let endIso = raw.endAt || raw.end;
  if (!endIso) {
    const startDate = new Date(startIso);
    if (!Number.isNaN(startDate.getTime()) && durationMinutes > 0) {
      endIso = new Date(startDate.getTime() + durationMinutes * 60000).toISOString();
    }
  }

  if (!endIso) return null;

  return {
    id: raw.appointmentId
      ?? raw.id
      ?? raw.uuid
      ?? `${startIso}-${endIso}-${raw.servicePostTitle ?? raw.title ?? "event"}`,
    title: raw.servicePostTitle || raw.title || "Reserva",
    start: startIso,
    end: endIso,
    status: raw.status || raw.appointmentStatus || "UNKNOWN",
  };
}

export async function listMyEvents() {
  try {
    const data = await api.get(EVENTS_ENDPOINT, {
      auth: true,
      credentials: "include",
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[calendarService] raw events", data);
    }
    const events = Array.isArray(data) ? data : [];
    return events
      .map(normalizeEvent)
      .filter(Boolean);
  } catch (err) {
    const status = err?.status;
    if (status === 404) {
      console.info(`[calendarService] ${EVENTS_ENDPOINT} devolvió 404 — sin eventos.`);
      return [];
    }
    if (status && status >= 500 && status < 600) {
      console.warn(`[calendarService] Error ${status} en ${EVENTS_ENDPOINT}.`, err);
      return [];
    }

    console.error("[calendarService] Error obteniendo eventos:", err);
    throw err;
  }
}
