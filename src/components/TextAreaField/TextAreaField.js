// src/components/TextAreaField/TextAreaField.js
import React from "react";
import s from "./TextAreaField.module.css";

export default function TextAreaField({
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
  rows = 6,
  ...props
}) {
  const [focused, setFocused] = React.useState(false);

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={s.container}>
      {label && (
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        rows={rows}
        className={[
          s.textarea,
          focused && s.focused,
          error && s.error,
        ].filter(Boolean).join(" ")}
        {...props}
      />
      {touched && error && <p className={s.errorText}>{error}</p>}
    </div>
  );
}
