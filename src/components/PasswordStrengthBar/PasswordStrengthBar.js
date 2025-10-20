import React from "react";
import styles from "./PasswordStrengthBar.module.css";

export default function PasswordStrengthBar({
  score,
  value,
  label,
  getStrength,
  showLabel = true,
  className = "",
  style
}) {
  let s = typeof score === "number" ? score : 0;
  let l = label ?? "";
  if (typeof score !== "number" && typeof value === "string") {
    const fn = getStrength || (window.passwordStrength ?? null);
    if (fn) {
      const res = fn(value);
      s = res?.score ?? 0;
      l = label ?? res?.label ?? "";
    }
  }

  const pct = (Math.max(0, Math.min(s, 4)) / 4) * 100;

  return (
    <div className={`${styles.wrapper} ${className}`} style={style}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={s}
        aria-label="Fortaleza de la contraseña"
      >
        <div
          className={`${styles.fill} ${styles[`level-${s}`]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && l && <div className={styles.label}>{l}</div>}
    </div>
  );
}
