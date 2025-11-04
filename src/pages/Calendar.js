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
    <div className="calendar-root">
      {/* contenido base (sin blur). El blur se aplica en el overlay usando backdrop-filter */}
      <div>
        <Navbar />
        <div className="calendar-wrap">
          <div className="calendar-container">
            <Card className="calendar-card">
            <header className="calendar-header">
              <h2>Mi Calendario</h2>
              <p>
                Visualiza tus reservas confirmadas, pendientes o canceladas.
              </p>
            </header>

            {error && (
              <div
                className="calendar-error"
              >
                <span>{error}</span>
                <button
                  className="calendar-retry"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && calendarEvents.length === 0 && (
              <div className="calendar-empty">
                <strong>No tienes reservas todavía</strong>
                <div className="calendar-empty-note">
                  Cuando reserves un servicio, aparecerá aquí en tu calendario.
                </div>
              </div>
            )}

            <div className="calendar-body">
              {loading ? (
                <div className="calendar-loading">
                  <p className="calendar-loading-text">Cargando eventos...</p>
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
                    className="calendar-rbc"
                    eventPropGetter={(event) => ({ style: { backgroundColor: getEventColor(event.status), borderColor: getEventColor(event.status) } })}
                    onSelectEvent={(e) => handleEventClick(e)}
                  />
                </div>
              )}
            </div>
            {selectedEvent && (
              <div className="calendar-modal-overlay">
                <div className="calendar-modal-backdrop" onClick={() => setSelectedEvent(null)} />
                <Card className="calendar-modal-card">
                  <button onClick={() => setSelectedEvent(null)} aria-label="Cerrar" className="calendar-modal-close">✕</button>
                  <h3 className="calendar-modal-title">{selectedEvent.title}</h3>
                  <div className="calendar-modal-details">
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
        className="ChangeTheme"
      
      />
    </div>
  );
}
