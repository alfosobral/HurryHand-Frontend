import React from "react";
import "./TextAreaForReview.css";

export default function TextAreaForReview({
  id,
  value,
  onChange,
  placeholder = "Escribe tu comentario...",
  rows = 6,
  className = "",
}) {
  return (
    <div className={`textarea-for-review ${className}`}>
      <textarea
        id={id}
        className="textarea-for-review-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}
