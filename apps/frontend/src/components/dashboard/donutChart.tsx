"use client";
import React, { useMemo } from "react";
import styles from "./donutChart.module.css";

interface CategoryData {
  name: string;
  percent: number;
  color: string;
}

interface DonutChartProps {
  dashboard: {
    categories?: {
      categoryName: string;
      totalSpentCents: number;
    }[];
  } | null;
}

export default function DonutChart({ dashboard }: DonutChartProps) {
  const data: CategoryData[] = useMemo(() => {
    if (!dashboard?.categories) return [];

    const total = dashboard.categories.reduce(
      (sum, c) => sum + c.totalSpentCents,
      0
    );

    const palette = [
      "#4caf50",
      "#81c784",
      "#aed581",
      "#ffb74d",
      "#ef5350",
      "#ba68c8",
      "#64b5f6",
    ];

    return dashboard.categories.map((cat, i) => ({
      name: cat.categoryName,
      percent: total ? (cat.totalSpentCents / total) * 100 : 0,
      color: palette[i % palette.length],
    }));
  }, [dashboard]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Spending by Category</h3>
        <p className={styles.subtitle}>This month</p>
      </div>

      {data.length === 0 ? (
        <p className={styles.empty}>No category data yet</p>
      ) : (
        <div className={styles.list}>
          {data.map((d: CategoryData, i: number) => (
            <div key={i} className={styles.row}>
              <span
                className={styles.swatch}
                style={{ backgroundColor: d.color }}
              />
              <span className={styles.name}>{d.name}</span>
              <span className={styles.value}>{d.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}