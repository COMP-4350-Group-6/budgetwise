"use client";

import React from "react";
import styles from "./categoryBreakdown.module.css";
import { TRANSACTION_STRINGS } from "@/constants/strings";

interface CategoryBreakdownProps {
  categories: { name: string; total: number }[];
  onCategorizeNow: () => void;
}

/**
 * CategoryBreakdown
 * ----------------------------------------------------------
 * Displays the top spending categories for the current month.
 * Falls back to an empty state if no data is available.
 * ----------------------------------------------------------
 */
export default function CategoryBreakdown({
  categories,
  onCategorizeNow,
}: CategoryBreakdownProps) {
  const hasData = categories && categories.length > 0;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>
        {TRANSACTION_STRINGS.categorySpending.title}
      </h2>

      {hasData ? (
        <ul className={styles.list}>
          {categories.slice(0, 5).map((cat) => (
            <li key={cat.name} className={styles.item}>
              <span className={styles.name}>{cat.name}</span>
              <span className={styles.amount}>
                $
                {cat.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyState}>
          <p>{TRANSACTION_STRINGS.categorySpending.noData}</p>

        </div>
      )}
    </div>
  );
}