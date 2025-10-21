// src/pages/Home.js
import React from "react";
import Navbar from "../components/Navbar/Navbar";
import styles from "./styles/Dashboard.module.css";

function formatDuration(iso) {
  if (!iso) return "";
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  if (!m) return iso;
  const h = Number(m[1] || 0);
  const mm = Number(m[2] || 0);
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (mm) parts.push(`${mm}m`);
  return parts.join(" ") || "0m";
}

function formatPrice(price) {
  if (price == null) return "Precio no disponible";
  return new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(price);
}

export default function Home() {

    return (
        <div className={styles.page}>
            <Navbar />
        </div>
        
    )
}
