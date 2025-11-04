import React from "react";
import "./ReviewButton.css";

export default function ReviewButton({ onClick, title = "Hacer reseña", className = "" }) {
  return (
    <button
      type="button"
      className={`review-btn ${className}`}
      onClick={onClick}
      aria-label={title}
      title={title}
    >
      <img
        src="/assets/review-notepad.png" 
        alt="Notepad icon"
        className="review-icon"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      <span className="review-fallback" aria-hidden="true">✏️</span>
    </button>
  );
}
