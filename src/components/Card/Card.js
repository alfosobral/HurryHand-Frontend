import React from 'react'
import styles from "./Card.module.css";

export default function Card({as: Tag = "div", children, className = "", style, ...rest }) {
  return (
    <Tag className={`${styles.card} ${className}`} style={style} {...rest}>
      {children}
    </Tag>
  );
}