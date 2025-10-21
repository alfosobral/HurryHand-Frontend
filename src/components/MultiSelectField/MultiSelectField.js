// src/components/MultiSelectField/MultiSelectField.js
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import s from "./MultiSelectField.module.css";

export default function MultiSelectField({
  id,
  label,
  options = [],          // [{ value, label }]
  values = [],           // ['8','10', ...]
  onChange,              // (nextValues: string[]) => void
  placeholder = "Seleccioná opciones",
  error,
  touched,
  disabled = false,
  maxPanelHeight = 260,
}) {
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    }
  };

  const toggleValue = (val) => {
    if (disabled) return;
    const set = new Set(values.map(String));
    const sval = String(val);
    if (set.has(sval)) set.delete(sval);
    else set.add(sval);
    onChange?.(Array.from(set).sort((a, b) => Number(a) - Number(b)));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
  };

  const selected = options.filter((o) => values.includes(String(o.value)));

  const panelVariants = {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 28, mass: 0.5 } },
    exit:    { opacity: 0, y: 6, scale: 0.985, transition: { type: "tween", duration: 0.15 } },
  };

  const listVariants = {
    hidden: { opacity: 1 },
    show:   { opacity: 1, transition: { staggerChildren: 0.012 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    show:   { opacity: 1, y: 0, transition: { type: "tween", duration: 0.12 } },
  };

  return (
    <div ref={wrapRef} className={s.container}>
      {label && (
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          s.control,
          open && s.open,
          focused && s.focused,
          error && s.error,
          disabled && s.disabled,
        ].filter(Boolean).join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className={s.value}>
          <span className={s.count}>{selected.length ? `${selected.length} ` : ""}</span>
          <span className={s.placeholder}>
            {selected.length ? "seleccionada(s)" : placeholder}
          </span>
        </div>

        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "tween", duration: 0.18 }}
          className={s.chevron}
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-multiselectable="true"
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={s.panel}
            style={{ maxHeight: maxPanelHeight }}
            onWheelCapture={(e) => {
              const el = e.currentTarget;
              const atTop = el.scrollTop === 0 && e.deltaY < 0;
              const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 0 && e.deltaY > 0;
              if (atTop || atBottom) e.stopPropagation();
            }}
          >
            {!!selected.length && (
              <motion.div
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0, transition: { type: "tween", duration: 0.12 } }}
                className={s.clearRow}
              >
                <button type="button" onClick={clearAll} className={s.clearBtn}>
                  Limpiar
                </button>
              </motion.div>
            )}

            <motion.div variants={listVariants} initial="hidden" animate="show">
              {options.length === 0 && (
                <motion.div variants={itemVariants} className={s.empty}>
                  No hay opciones
                </motion.div>
              )}

              {options.map((o) => {
                const checked = values.includes(String(o.value));
                return (
                  <motion.label
                    key={o.value}
                    htmlFor={`${id}-${o.value}`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.4 }}
                    className={[s.item, checked && s.itemChecked].filter(Boolean).join(" ")}
                  >
                    <input
                      id={`${id}-${o.value}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(o.value)}
                      className={s.checkbox}
                    />
                    <span>{o.label}</span>
                  </motion.label>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {touched && error && <p className={s.errorText}>{error}</p>}
    </div>
  );
}
