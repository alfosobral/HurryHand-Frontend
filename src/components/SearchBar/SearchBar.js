// src/components/SearchBar.js
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./SearchBar.module.css";

export default function SearchBar({
  onSearch,
  width = "40%",
  maxWidth = 500,
  minWidth = 200,
}) {
  const [query, setQuery] = useState("");

  const normalizedWidth =
    typeof width === "number" ? `${width}%` : width || "40%";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
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
