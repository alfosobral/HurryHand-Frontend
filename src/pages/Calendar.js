import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as RBCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import esLocale from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles/CalendarOverrides.css";

import Navbar from "../components/Navbar/Navbar";
import Card from "../components/Card/Card";
import { listMyEvents } from "../services/calendarService";
import ChangeTheme from "../components/ChangeTheme/ChangeTheme";

function ensureDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getEventColor(status) {
  switch (status) {
    case "CONFIRMED":
      return "#28a745";
    case "PENDING":
      return "#ffc107";
    case "CANCELLED":
      return "#dc3545";
    default:
      return "#3788d8";
  }
}

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialDate, setInitialDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listMyEvents();
      if (process.env.NODE_ENV !== "production") {
        console.log("[Calendar] normalized events", data);
      }
      setEvents(data);
      if (!initialDate && Array.isArray(data) && data.length) {
        const first = data
          .map((ev) => ensureDate(ev.start ?? ev.appointmentDateTime))
          .filter(Boolean)
          .sort((a, b) => a - b)[0];
        if (first) {
          setInitialDate(first.toISOString());
          setCurrentDate(first);
        }
      }
    } catch (err) {
      const message = err?.payload?.message || err?.message || "No se pudo cargar tus reservas.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [initialDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const calendarEvents = useMemo(() => {
    const mapped = events
        .map((event) => {
          const rawStart = event.start ?? event.startAt ?? event.appointmentDateTime;
          let start = ensureDate(rawStart);

          let end = ensureDate(event.end ?? event.endAt);
          if (!end && start) {
            const durationMinutes = Number(
              event.durationMinutes ?? event.duration ?? event.estimatedDuration ?? 0
            );
            if (durationMinutes > 0) {
              end = new Date(start.getTime() + durationMinutes * 60000);
            }
          }

          if (!start || !end) return null;
          const color = getEventColor(event.status);
          return {
            id: event.id ?? event.appointmentId ?? `${start.toISOString()}-${end.toISOString()}`,
            title: (event.title || event.servicePostTitle || "Reserva"),
            start,
            end,
            status: event.status || event.appointmentStatus,
            // react-big-calendar usa estos campos, pero guardamos color para un accessor opcional
            bgColor: color,
          };
        })
        .filter(Boolean);
    if (process.env.NODE_ENV !== "production") {
      console.log("[Calendar] calendarEvents", mapped);
    }
    return mapped;
  }, [events]);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const localizer = useMemo(() =>
    dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { es: esLocale } }),
  []);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* contenido base (sin blur). El blur se aplica en el overlay usando backdrop-filter */}
      <div>
        <Navbar />
        <div
          style={{
            padding: "120px 24px 40px",
            background: "var(--bg)",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
            <Card style={{ width: "100%", maxWidth: "100%", padding: "32px", gap: "16px" }}>
            <header style={{ marginBottom: "12px" }}>
              <h2 style={{ margin: "0 0 4px 0" }}>Mi Calendario</h2>
              <p style={{ margin: 0, color: "var(--placeholder)" }}>
                Visualiza tus reservas confirmadas, pendientes o canceladas.
              </p>
            </header>

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#f8d7da",
                  border: "1px solid #f5c6cb",
                  borderRadius: "8px",
                  color: "#721c24",
                  fontSize: "14px",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span>{error}</span>
                <button
                  onClick={loadEvents}
                  style={{
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: "#0ea5e9",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && calendarEvents.length === 0 && (
              <div
                style={{
                  padding: "18px",
                  textAlign: "center",
                  color: "#0f5132",
                  background: "#d1e7dd",
                  border: "1px solid #badbcc",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <strong>No tienes reservas todavía</strong>
                <div style={{ marginTop: "8px" }}>
                  Cuando reserves un servicio, aparecerá aquí en tu calendario.
                </div>
              </div>
            )}

            <div style={{ minHeight: "620px", position: "relative" }}>
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "var(--placeholder)",
                  }}
                >
                  <p style={{ margin: 0 }}>Cargando eventos...</p>
                </div>
              ) : (
                <div>
                  <RBCalendar
                    localizer={localizer}
                    culture="es"
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    view={currentView}
                    onView={setCurrentView}
                    date={currentDate}
                    onNavigate={(d) => setCurrentDate(d)}
                    style={{ height: 650 }}
                    components={{
                      event: ({ event }) => (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, textAlign: "center", width: "100%", height: "100%" }}>
                          <span style={{ padding: 2 }}>{event.title}</span>
                        </div>
                      )
                    }}
                    formats={{ eventTimeRangeFormat: () => "" }}
                    eventPropGetter={(event) => ({ style: { backgroundColor: getEventColor(event.status), borderColor: getEventColor(event.status) } })}
                    onSelectEvent={(e) => handleEventClick(e)}
                  />
                </div>
              )}
            </div>
            {selectedEvent && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  background: "rgba(0,0,0,0.01)", // casi transparente, evita el tinte gris
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                }}
              >
                <div style={{ position: "absolute", inset: 0 }} onClick={() => setSelectedEvent(null)} />
                <Card style={{ width: 420, maxWidth: "90vw", position: "relative", zIndex: 10000 }}>
                  <button onClick={() => setSelectedEvent(null)} aria-label="Cerrar" style={{ position: "absolute", left: 12, top: 12, background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
                  <h3 style={{ marginTop: 0 }}>{selectedEvent.title}</h3>
                  <div style={{ color: "#555", fontSize: 14 }}>
                    <div><strong>Inicio:</strong> {selectedEvent.start?.toLocaleString("es-ES", { hour12: false })}</div>
                    <div><strong>Fin:</strong> {selectedEvent.end?.toLocaleString("es-ES", { hour12: false })}</div>
                    <div><strong>Estado:</strong> {selectedEvent.status || "N/A"}</div>
                  </div>
                </Card>
              </div>
            )}
            </Card>
          </div>
        </div>
      </div>
      {/* flotante permanente */}
      <ChangeTheme
        style={{
          position: "fixed",
          left: "16px",
          bottom: "16px",
          zIndex: 10000,
        }}
      />
    </div>
  );
}
