import React from "react";
import styles from "./categoryBreakdown.module.css";

interface CategoryBreakdownProps {
  categories: { name: string; total: number }[];
  onCategorizeNow: () => void;
}

export default function CategoryBreakdown({
  categories,
  onCategorizeNow,
}: CategoryBreakdownProps) {
  const hasData = categories && categories.length > 0;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Top Categories</h2>

      {hasData ? (
        <ul className={styles.list}>
          {categories.slice(0, 5).map((cat) => (
            <li key={cat.name} className={styles.item}>
              <span className={styles.name}>{cat.name}</span>
              <span className={styles.amount}>
                ${cat.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyState}>
          <p>Not enough data yet!</p>
        </div>
      )}
    </div>
  );
}