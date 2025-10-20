import React, { forwardRef } from "react";
import styles from "./InputField.module.css";

const InputField = forwardRef(
  (
    {
      id,
      label,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      error,
      touched,
      type = "text",
      className = "",
      style,
      ...rest
    },
    ref
  ) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const errorId = error && touched ? `${inputId}-error` : undefined;

    return (
      <div className={`${styles.container} ${className}`} style={style}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}

        <input
          id={inputId}
          name={inputId}
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          className={`${styles.input} ${error && touched ? styles.inputError : ""}`}
          aria-invalid={Boolean(error && touched)}
          aria-describedby={errorId}
          {...rest}
        />

        {touched && error && (
          <p id={errorId} className={styles.errorText}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

export default InputField;
