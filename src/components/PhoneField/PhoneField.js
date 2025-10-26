import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./PhoneField.module.css";

const countries = [
  { code: "+598", name: "Uruguay", flag: "🇺🇾" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+55", name: "Brasil",    flag: "🇧🇷" },
  { code: "+1",  name: "Estados Unidos", flag: "🇺🇸" },
  { code: "+34", name: "España",    flag: "🇪🇸" },
];

export default function PhoneField({
  id,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  touched,
  onCountryChange,
  selectedCountry = "+598",
  className = "",
  style,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState({ top: 0, left: 0, minWidth: 140, maxHeight: 260 });
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const selected = countries.find((c) => c.code === selectedCountry) || countries[0];

  const measure = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const placeBottom = spaceBelow >= spaceAbove;

    setPos({
      top: placeBottom ? rect.bottom + 4 : rect.top - 4,
      left: rect.left,
      minWidth: Math.max(140, rect.width + 20),
      maxHeight: Math.min(260, placeBottom ? spaceBelow : spaceAbove),
    });
  };

  useEffect(() => {
    if (!open) return;
    measure();
    const onScrollResize = () => measure();
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const handleSelect = (code) => {
    onCountryChange?.(code);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const Panel = open
    ? createPortal(
        <div
          ref={panelRef}
          className={styles.panel}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            minWidth: pos.minWidth,
            maxHeight: pos.maxHeight,
          }}
          role="listbox"
          aria-labelledby={`${id}-country-trigger`}
        >
          {countries.map((c, idx) => (
            <div
              key={c.code}
              role="option"
              aria-selected={c.code === selectedCountry}
              className={`${styles.option} ${idx === activeIndex ? styles.optionActive : ""} ${
                c.code === selectedCountry ? styles.optionSelected : ""
              }`}
              onClick={() => handleSelect(c.code)}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {c.flag} {c.code} {c.name}
            </div>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <div className={styles.wrap}>
        <button
          id={`${id}-country-trigger`}
          type="button"
          ref={triggerRef}
          className={styles.select}
          onClick={() => setOpen((v) => !v)}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span>{selected.flag} {selected.code}</span>
          <span className={styles.caret}>▾</span>
        </button>

        <input
          id={id}
          name={id}
          type="text"
          value={value}
          maxLength={8}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={styles.input}
          {...props}
        />
      </div>

      {Panel}

      {touched && error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}