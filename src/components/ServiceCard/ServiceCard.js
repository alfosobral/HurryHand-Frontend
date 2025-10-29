import React from "react";
import { FaStar } from "react-icons/fa";
import Card from "../Card/Card";
import { useNavigate } from "react-router-dom";
import styles from "./ServiceCard.module.css";

export default function ServiceCard({ id, image, rating, name, description }) {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/service-post/${id}`);

  const safeRating = Number.isFinite(rating) ? rating : 0;
  const rounded = Math.round(safeRating * 10) / 10;

  return (
    <Card
      className={styles.cardRoot}
      onClick={handleClick}
    >
        {image && <img className={styles.image} src={image} alt={name} />}
        <div className={styles.header}>
          <h3 className={styles.title}>{name}</h3>
          <span className={styles.rating}>
            <FaStar color="#FFD700" />
            {rounded}
          </span>
        </div>
        <p className={styles.description}>{description}</p>
    </Card>
  );
}
