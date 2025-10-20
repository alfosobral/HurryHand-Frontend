import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/* ===================== Utils ===================== */
const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const parseISO = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return Number.isNaN(d.getTime()) ? null : d;
};
// display <-> value
const formatDisplay = (d) => (d ? `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}` : "");
const isoFromDisplay = (display) => {
  const raw = display.replace(/\D/g, "");
  if (raw.length !== 8) return "";
  const dd = +raw.slice(0, 2), mm = +raw.slice(2, 4), yyyy = +raw.slice(4, 8);
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return "";
  return toISO(d);
};
const sameDay = (a, b) => a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const cutDate = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());

/* =================== Componente =================== */
export default function DateField({
  id,
  label,
  value,                 // ISO 'YYYY-MM-DD'
  onChange,
  onBlur,
  onFocus,
  placeholder = "DD-MM-AAAA",
  error,
  touched,
  min,                   // ISO opcional
  max,                   // ISO opcional
  disabled = false,
  arrowOffset = 10,
  maxPanelHeight = 340,
  portal = true,
  style,
  ...props
}) {
  // Estado derivado de value externo
  const selectedDate = parseISO(value);
  const [draft, setDraft] = React.useState(formatDisplay(selectedDate));
  React.useEffect(() => { setDraft(formatDisplay(selectedDate)); }, [value]);

  // Focus + popover
  const [focused, setFocused] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  // Vista del calendario
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(selectedDate?.getMonth() ?? today.getMonth()); // 0..11

  const minDate = parseISO(min);
  const maxDate = parseISO(max);

  const inputRef = React.useRef(null);

  /* ---------- Posición del popover (portal) ---------- */
  const [menuPos, setMenuPos] = React.useState({ top: 0, left: 0, width: 0, height: 0, placement: "bottom" });
  const measureAndPlace = React.useCallback(() => {
    const trigger = inputRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const desired = maxPanelHeight;
    const placeBottom = spaceBelow >= Math.min(desired, 220) || spaceBelow >= spaceAbove;

    let top, height, placement;
    if (placeBottom) {
      const h = Math.min(desired, Math.max(220, spaceBelow - 8));
      top = rect.bottom + 8;
      height = h;
      placement = "bottom";
    } else {
      const h = Math.min(desired, Math.max(220, spaceAbove - 8));
      top = rect.top - 8 - h;
      height = h;
      placement = "top";
    }
    setMenuPos({ top, left: rect.left, width: rect.width, height, placement });
  }, [maxPanelHeight]);

  React.useEffect(() => {
    if (!open) return;
    measureAndPlace();
    const onScroll = () => measureAndPlace();
    const onResize = () => measureAndPlace();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, measureAndPlace]);

  // Cerrar por click afuera
  React.useEffect(() => {
    const onDown = (e) => {
      const panel = document.getElementById(`${id}-calendar`);
      if (inputRef.current?.contains(e.target)) return;
      if (panel && panel.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [id]);

  /* ---------- Input enmascarado (DD-MM-AAAA) ---------- */
  const handleFocus = (e) => { setFocused(true); onFocus?.(e); };
  const handleBlur  = (e) => { setFocused(false); onBlur?.(e); };

  const handleInputChange = (e) => {
    // Solo dígitos, auto-guiones
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = "";
    if (raw.length > 0) formatted += raw.slice(0, 2);
    if (raw.length > 2) formatted += "-" + raw.slice(2, 4);
    if (raw.length > 4) formatted += "-" + raw.slice(4, 8);
    setDraft(formatted);

    // Si completa 8 dígitos y es válida + dentro de rango -> emitir ISO
    if (raw.length === 8) {
      const iso = isoFromDisplay(formatted);
      if (iso) {
        const d = parseISO(iso);
        const okMin = !minDate || cutDate(d) >= cutDate(minDate);
        const okMax = !maxDate || cutDate(d) <= cutDate(maxDate);
        if (okMin && okMax) emitChange(iso);
      }
    }
  };

  // Bloquear non-digit en teclado (igual limpiamos en onChange)
  const onKeyDown = (e) => {
    const allowedKeys = [
      "Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End",
      // abrir calendario rápido
      "Enter","Escape"
    ];
    if (e.altKey && (e.key === "ArrowDown" || e.key === "Down")) {
      e.preventDefault(); setOpen(true); measureAndPlace(); return;
    }
    if (allowedKeys.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const emitChange = (iso) => {
    const evt = { target: { id, name: id, value: iso }, currentTarget: { id, name: id, value: iso }, type: "change" };
    onChange?.(evt);
  };

  /* ---------- Calendario ---------- */
  const weeks = React.useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = (first.getDay() + 6) % 7; // Lunes=0
    const startDate = new Date(viewYear, viewMonth, 1 - startDay);
    const out = [];
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + w * 7 + d);
        row.push(day);
      }
      out.push(row);
    }
    return out;
  }, [viewYear, viewMonth]);

  const isDisabled = (d) => {
    if (minDate && cutDate(d) < cutDate(minDate)) return true;
    if (maxDate && cutDate(d) > cutDate(maxDate)) return true;
    return false;
  };
  const isOtherMonth = (d) => d.getMonth() !== viewMonth;

  const prevMonth = () => setViewMonth((m) => (m === 0 ? (setViewYear((y) => y - 1), 11) : m - 1));
  const nextMonth = () => setViewMonth((m) => (m === 11 ? (setViewYear((y) => y + 1), 0) : m + 1));
  const prevYear  = () => setViewYear((y) => y - 1);
  const nextYear  = () => setViewYear((y) => y + 1);

  const selectDay = (d) => {
    if (disabled || isDisabled(d)) return;
    const iso = toISO(d);
    emitChange(iso);
    setDraft(formatDisplay(d));
    setOpen(false);
    inputRef.current?.focus();
  };

  const panelVariants = {
    initial: { opacity: 0, y: menuPos.placement === "bottom" ? 8 : -8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 28, mass: 0.5 } },
    exit:    { opacity: 0, y: menuPos.placement === "bottom" ? 6 : -6, scale: 0.985, transition: { type: "tween", duration: 0.15 } },
  };

  /* ---------- Estética (alineada al resto) ---------- */
  const borderColor = error ? "#ef4444" : (focused || open) ? "#42b3fd" : "#cbd5e1";
  const boxShadow   = (focused || open) ? "0 0 0 5px rgba(37,99,235,.15)" : "none";
  const transform   = (focused || open) ? "scale(1.02)" : "scale(1)";

  /* ---------- Render ---------- */
  const CalendarPanel = (
    <AnimatePresence>
      {open && (
        <motion.div
          id={`${id}-calendar`}
          role="dialog"
          aria-label={`${label || "Calendario"}`}
          variants={panelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          tabIndex={-1}
          style={{
            position: portal ? "fixed" : "absolute",
            zIndex: 1000,
            top: portal ? menuPos.top : "calc(100% + 8px)",
            left: portal ? menuPos.left : 0,
            width: portal ? menuPos.width : "100%",
            maxHeight: menuPos.height,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,.25)",
            background: "rgba(255,255,255,.08)",
            borderRadius: 12,
            boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
            padding: 10,
            backdropFilter: "blur(4px)",
            color: "#7f7d7dff",
            boxSizing: "border-box",
          }}
        >
          {/* Header: Año - Mes + navegación rápida */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={prevYear}  style={navBtnStyle} aria-label="Año anterior">«</button>
              <button type="button" onClick={prevMonth} style={navBtnStyle} aria-label="Mes anterior">‹</button>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {monthLabel(viewMonth)} {viewYear}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={nextMonth} style={navBtnStyle} aria-label="Mes siguiente">›</button>
              <button type="button" onClick={nextYear}  style={navBtnStyle} aria-label="Año siguiente">»</button>
            </div>
          </div>

          {/* Días de la semana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6, fontSize: 12, opacity: 0.8 }}>
            {["L","M","X","J","V","S","D"].map((d) => <div key={d} style={{ textAlign:"center" }}>{d}</div>)}
          </div>

          {/* Grilla de días */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
            {weeks.flat().map((d, i) => {
              const disabledDay = isDisabled(d);
              const selected = selectedDate && sameDay(d, selectedDate);
              const other = isOtherMonth(d);
              const todayMark = sameDay(d, new Date());

              const baseBg = selected ? "rgba(46,163,255,0.25)" : "rgba(255,255,255,0.05)";
              const opacity = disabledDay ? 0.35 : other ? 0.55 : 1;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(d)}
                  disabled={disabledDay}
                  style={{
                    padding: "8px 0",
                    borderRadius: 10,
                    border: selected ? "1px solid #2ea3ff" : "1px solid rgba(255,255,255,0.18)",
                    background: baseBg,
                    color: "#7f7d7dff",
                    cursor: disabledDay ? "not-allowed" : "pointer",
                    opacity,
                  }}
                >
                  <span style={{ fontWeight: todayMark ? 800 : 500 }}>{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Acciones rápidas */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <button
              type="button"
              onClick={() => { const t = new Date(); setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); }}
              style={quickBtnStyle}
            >
              Ir a hoy
            </button>
            <button
              type="button"
              onClick={() => { const t = new Date(); if (!isDisabled(t)) selectDay(t); }}
              style={quickBtnStyle}
            >
              Seleccionar hoy
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div style={{ marginBottom: 14, width: "100%", position: "relative", ...style }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 14, color: "#ffffffff", marginBottom: 6, display: "block" }}>
          {label}
        </label>
      )}

      {/* Input enmascarado con estética común */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 12,
          border: `4px solid ${borderColor}`,
          padding: "6px 8px",
          transform,
          transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
          boxShadow,
          background: disabled ? "#ffffff55" : "#ffffff77",
          boxSizing: "border-box",
        }}
      >
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="text"
          disabled={disabled}
          value={draft}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          onFocus={handleFocus}
          onBlur={(e) => { 
            // al salir, si es válido lo normalizamos; si no, dejamos lo tipeado
            const iso = isoFromDisplay(draft);
            if (iso) {
              const d = parseISO(iso);
              const okMin = !minDate || cutDate(d) >= cutDate(minDate);
              const okMax = !maxDate || cutDate(d) <= cutDate(maxDate);
              if (okMin && okMax) emitChange(iso);
            }
            onBlur?.(e);
            setFocused(false);
          }}
          placeholder={placeholder}
          inputMode="numeric"
          maxLength={10}  // DD-MM-AAAA = 10 chars
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            outline: "none",
            border: "none",
            background: "transparent",
            fontSize: 14,
            color: "#0b1220",
            padding: "4px 6px",
          }}
          {...props}
        />

        {/* Botón popover calendario */}
        <motion.button
          type="button"
          onClick={() => { setOpen((o) => !o); if (!open) measureAndPlace(); }}
          whileTap={{ scale: 0.97 }}
          aria-label="Abrir calendario"
          style={{
            marginLeft: "auto",
            marginRight: arrowOffset,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            background: "none",
            border: "none",
            color: "#000000ff",
            cursor: "pointer",
          }}
        >
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "tween", duration: 0.18 }}
            style={{ lineHeight: 0 }}
          >
            ▾
          </motion.span>
        </motion.button>
      </div>

      {/* Popover calendario */}
      {portal ? createPortal(CalendarPanel, document.body) : CalendarPanel}

      {touched && error && (
        <p style={{ color: "#dc2626", fontSize: 13, marginTop: 6 }}>{error}</p>
      )}
    </div>
  );
}

/* ================= Estilos auxiliares ================= */
const navBtnStyle = {
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.08)",
  color: "#000000ff",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};
const quickBtnStyle = {
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.08)",
  color: "#000000ff",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};
function monthLabel(m) {
  return ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][m] || "";
}
