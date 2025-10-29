// src/pages/Home.js
import React from "react";
import Navbar from "../components/Navbar/Navbar";
import ServiceCard from "../components/ServiceCard/ServiceCard";
import { listServicePosts } from "../services/servicePosts";
import styles from "./styles/Dashboard.module.css";
import { useQuery } from "@tanstack/react-query";

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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["servicePosts", { page: 1, size: 12 }],
    queryFn: () => listServicePosts({ page: 1, size: 12 }),
  });

  const posts = data?.content ?? [];
  const bullet = "\u2022";
  const noServicesMessage = `Todavía no hay servicios publicados.`;

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.mainWrap}>
        <div className={styles.gridWrap}>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className={styles.skeleton} />
            ))}

          {isError && (
            <div className={styles.error}>
              No pudimos cargar los servicios. {error?.message}
            </div>
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <div className={styles.message}>{noServicesMessage}</div>
          )}

          {posts.map((post) => {
            const description = `${formatPrice(post.price)} ${bullet} ${formatDuration(post.duration)}`;
            const image =
              Array.isArray(post.photosURLs) && post.photosURLs.length > 0
                ? post.photosURLs[0]
                : undefined;

            return (
              <ServiceCard
                id={post.id}
                key={`${post.title}-${description}`}
                image={image}
                rating={post.rating}
                name={post.title}
                description={description}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
