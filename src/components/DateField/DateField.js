import React from "react";
import styles from "./DateField.module.css";

/**
 * DateField (nativo)
 * - value/min/max: strings ISO "YYYY-MM-DD"
 * - onChange recibe el evento estándar (e.target.value ya viene en ISO)
 */
export default function DateField({
  id,
  label,
  value = "",
  onChange,
  onBlur,
  onFocus,
  min,              // "YYYY-MM-DD"
  max,              // "YYYY-MM-DD"
  error,
  touched,
  disabled = false,
  className = "",
  style,
  required,
  ...rest
}) {
  // Asegurar que value sea "", o un ISO válido (evita "Invalid Date")
  const safeValue = typeof value === "string" ? value : "";

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}{required ? " *" : ""}
        </label>
      )}

      <div className={`${styles.inputWrap} ${error && touched ? styles.inputError : ""}`}>
        <input
          id={id}
          name={id}
          type="date"
          className={styles.input}
          value={safeValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          {...rest}
        />
      </div>

      {touched && error && (
        <p className={styles.errorText}>{error}</p>
      )}
    </div>
  );
}
