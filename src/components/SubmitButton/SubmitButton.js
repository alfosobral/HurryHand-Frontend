import React from "react";
import styles from "./SubmitButton.module.css";

/**
 * SubmitButton
 * Props:
 *  - children: contenido del botón
 *  - disabled?: boolean
 *  - loading?: boolean  (muestra spinner y bloquea el click)
 *  - type?: "button" | "submit" | "reset"  (default: "submit")
 *  - className?, style?, ...rest
 */
export default function SubmitButton({
  children,
  disabled = false,
  loading = false,
  type = "submit",
  className = "",
  style,
  onClick,
  onChange,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`${styles.button} ${className}`}
      style={style}
      disabled={isDisabled}
      onClick={onClick}
      onChange={onChange}
      aria-busy={loading ? "true" : "false"}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span>{loading ? "Procesando..." : children}</span>
    </button>
  );
}
