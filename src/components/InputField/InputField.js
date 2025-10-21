import React from "react";
import useFocusWithin, { mergeHandlers } from "../../hooks/useFocusWithin";
import styles from "./InputField.module.css";

export default function InputField({
  id, label, value, onChange, onBlur, onFocus,
  error, touched, className = "", style, ...rest
}) {
  const { focused, focusWithinProps } = useFocusWithin();

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <div
        className={`${styles.inputWrap} ${touched && error ? styles.inputError : ""}`}
        data-focus={focused ? "true" : "false"}
        /* combinamos handlers para no pisar los tuyos */
        onFocus={mergeHandlers(onFocus, focusWithinProps.onFocus)}
        onBlur={mergeHandlers(onBlur, focusWithinProps.onBlur)}
      >
        <input
          id={id}
          name={id}
          className={styles.input}
          value={value}
          onChange={onChange}
          /* dejamos estos en el input por si tu UI los necesita */
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        />
      </div>

      {touched && error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
