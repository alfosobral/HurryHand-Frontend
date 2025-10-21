// src/components/CheckboxField/CheckboxField.js
import React from "react";
import s from "./CheckBox.module.css";

export default function CheckboxField({
  id,
  label,
  checked,
  onChange,
  error,
}) {
  return (
    <label className={s.row} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        name={id}
        checked={checked}
        onChange={onChange}
        className={s.input}
      />
      <span className={s.text}>{label}</span>
      {error && <span className={s.error}>{error}</span>}
    </label>
  );
}
