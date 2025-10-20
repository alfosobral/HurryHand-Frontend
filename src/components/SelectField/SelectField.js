import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./SelectField.module.css";

export default function SelectField({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  options = [],
  error,
  touched,
  className = "",
  style,
  arrowOffset = 10,
  disabled = false,
  maxPanelHeight = 260,
  portal = true,
  ...props
}) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(
    Math.max(0, options.findIndex((o) => String(o.value) === String(value)))
  );
  const btnRef = React.useRef(null);
  const [menuPos, setMenuPos] = React.useState({ top:0, left:0, width:0, height:0, placement:"bottom" });

  const measureAndPlace = React.useCallback(() => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;
    const desired = maxPanelHeight;
    const placeBottom = spaceBelow >= Math.min(desired, 180) || spaceBelow >= spaceAbove;

    let top, height, placement;
    if (placeBottom) {
      const h = Math.min(desired, Math.max(120, spaceBelow - 8));
      top = rect.bottom + 8; height = h; placement = "bottom";
    } else {
      const h = Math.min(desired, Math.max(120, spaceAbove - 8));
      top = rect.top - 8 - h; height = h; placement = "top";
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

  React.useEffect(() => {
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      const menuEl = document.getElementById(`${id}-menu`);
      if (menuEl && menuEl.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [id]);

  const emitChange = (newVal) => {
    const evt = { target: { id, name: id, value: newVal }, currentTarget: { id, name: id, value: newVal }, type: "change" };
    onChange?.(evt);
  };

  const selected = options.find((o) => String(o.value) === String(value));
  const selectedLabel = selected ? selected.label : (options[0]?.label ?? "");

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o)=>!o); if (!open) measureAndPlace(); return; }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { e.preventDefault(); setOpen(true); return; }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i=>Math.min(options.length-1, i+1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIndex(i=>Math.max(0, i-1)); }
    if (e.key === "Home")      { e.preventDefault(); setActiveIndex(0); }
    if (e.key === "End")       { e.preventDefault(); setActiveIndex(options.length-1); }
  };

  const panelVariants = {
    initial: { opacity: 0, y: menuPos.placement === "bottom" ? 8 : -8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 420, damping: 28, mass: 0.5 } },
    exit:    { opacity: 0, y: menuPos.placement === "bottom" ? 6 : -6, scale: 0.985, transition: { type: "tween", duration: 0.15 } },
  };

  const Panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          id={`${id}-menu`}
          role="listbox"
          aria-activedescendant={`${id}-opt-${activeIndex}`}
          variants={panelVariants}
          initial="initial" animate="animate" exit="exit"
          className={styles.panel}
          style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width, maxHeight: menuPos.height }}
        >
          {options.length === 0 && (
            <div style={{ padding: "10px 12px", color: "white", opacity: 0.8, fontSize: 13 }}>
              No hay opciones
            </div>
          )}
          {options.map((opt, i) => {
            const isSelected = String(opt.value) === String(value);
            const active = i === activeIndex;
            return (
              <div
                key={opt.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                data-idx={i}
                className={[
                  styles.option,
                  active ? styles.optionActive : "",
                  isSelected ? styles.optionSelected : "",
                ].join(" ")}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => { emitChange(opt.value); setOpen(false); btnRef.current?.focus(); }}
              >
                <span>{opt.label}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <button
        id={id}
        name={id}
        type="button"
        ref={btnRef}
        disabled={disabled}
        onClick={() => { setOpen(o=>!o); if (!open) measureAndPlace(); }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          styles.trigger,
          disabled ? styles.triggerDisabled : "",
          error ? styles.inputError : "",
        ].join(" ")}
        {...props}
      >
        <span className={styles.value}>{selectedLabel}</span>
        <span className={styles.caret} style={{ marginRight: arrowOffset }}>▾</span>
      </button>

      {touched && error && <p className={styles.errorText}>{error}</p>}

      {portal ? createPortal(Panel, document.body) : Panel}
    </div>
  );
}
