import React, { useId } from "react";
import useTheme from "../../hooks/useTheme";
import styles from "./ChangeTheme.module.css";

export default function ChangeTheme({
  className = "",
  style,
  showText = false,
  labels = { light: "Light", dark: "Dark" },
}) {
  const { isDark, toggle } = useTheme();
  const id = useId();

  return (
    <div className={`${styles.wrap} ${className}`} style={style}>
      {/* input accesible */}
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        checked={isDark}
        onChange={toggle}
        aria-label={`Cambiar a ${isDark ? labels.light : labels.dark}`}
      />
      {/* pista + perilla */}
      <label htmlFor={id} className={styles.track} title={isDark ? labels.dark : labels.light}>
        <span className={`${styles.icon} ${styles.sun}`} aria-hidden>☀️</span>
        <span className={`${styles.icon} ${styles.moon}`} aria-hidden>🌙</span>
        <span className={styles.thumb} />
      </label>

      {showText && (
        <span className={styles.label}>{isDark ? labels.dark : labels.light}</span>
      )}
    </div>
  );
}
