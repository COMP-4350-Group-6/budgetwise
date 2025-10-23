"use client";

import React from "react";
import styles from "./topCategories.module.css";

interface CategorySummary {
  name: string;
  total: number;
}

interface Props {
  categories: CategorySummary[];
}

export default function TopCategories({ categories }: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Top Categories</h2>
      {categories.length === 0 ? (
        <p className={styles.empty}>No categories found.</p>
      ) : (
        categories.map((cat) => (
          <div key={cat.name} className={styles.row}>
            <div className={styles.category}>
              <span className={styles.label}>{cat.name}</span>
            </div>
            <span className={styles.value}>
              ${cat.total.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
