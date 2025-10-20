import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./PasswordField.module.css";

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  touched,
  show,       // opcional: modo controlado
  onToggle,   // opcional: modo controlado
  className = "",
  style,
  ...rest
}) {
  const [innerShow, setInnerShow] = useState(false);
  const effectiveShow = typeof show === "boolean" ? show : innerShow;
  const toggle = onToggle || (() => setInnerShow(s => !s));

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <div className={styles.wrap}>
        <input
          id={id}
          name={id}
          type={effectiveShow ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          aria-invalid={Boolean(error && touched)}
          aria-describedby={touched && error ? `${id}-error` : undefined}
          className={`${styles.input} ${error && touched ? styles.inputError : ""}`}
          {...rest}
        />
        <button
          type="button"
          onClick={toggle}
          className={styles.toggle}
          aria-label={effectiveShow ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={effectiveShow ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {effectiveShow ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {touched && error && <p id={`${id}-error`} className={styles.errorText}>{error}</p>}
    </div>
  );
}
