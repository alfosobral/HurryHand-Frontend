import React from "react";
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
  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}

      <div className={styles.wrap}>
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange?.(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={styles.select}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>

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

      {touched && error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
