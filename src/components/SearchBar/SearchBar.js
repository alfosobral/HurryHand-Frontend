// src/components/SearchBar/SearchBar.js
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./SearchBar.module.css";

export default function SearchBar({
  onSearch,
  width = "40%",
  maxWidth = 500,
  minWidth = 200,
  delay = 300, // milisegundos de debounce
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // === Efecto debounce ===
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay]);

  // === Efecto para llamar onSearch automáticamente ===
  useEffect(() => {
    if (onSearch) onSearch(debouncedQuery.trim());
  }, [debouncedQuery, onSearch]);

  const normalizedWidth =
    typeof width === "number" ? `${width}%` : width || "40%";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form}
      style={{ width: normalizedWidth, maxWidth, minWidth }}
    >
      <input
        type="text"
        placeholder="Buscar..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.input}
        aria-label="Buscar"
      />
      <button
        type="submit"
        className={styles.button}
        onMouseDown={(e) => e.preventDefault()} // evita perder el focus del input
      >
        <FaSearch />
      </button>
    </form>
  );
}
