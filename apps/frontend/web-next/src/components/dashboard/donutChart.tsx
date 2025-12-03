"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./donutChart.module.css";
import { COLORS } from "@/constants/colors";
import { TRANSACTION_STRINGS } from "@/constants/strings";

/**
 * DonutChart Component
 * ----------------------------------------------------------
 * Displays a donut visualization of category spending.
 * Includes a legend with percentages per category.
 * ----------------------------------------------------------
 */
interface DonutChartProps {
  dashboard: {
    categories?: {
      categoryName: string;
      totalSpentCents: number;
    }[];
  } | null;
}

export default function DonutChart({ dashboard }: DonutChartProps) {
  /**
   * Converts raw dashboard data into percentage breakdowns.
   * Memoized for performance.
   */
  const data = useMemo(() => {
    if (!dashboard?.categories || dashboard.categories.length === 0) return [];

    const total = dashboard.categories.reduce(
      (sum, cat) => sum + cat.totalSpentCents,
      0
    );

    return dashboard.categories.map((cat, i) => {
      const percent = total ? (cat.totalSpentCents / total) * 100 : 0;
      const isZero = cat.totalSpentCents === 0;

      return {
        name: cat.categoryName,
        value: cat.totalSpentCents,
        percent,
        color: isZero
          ? COLORS.zeroCategory
          : COLORS.palette[i % COLORS.palette.length],
      };
    });
  }, [dashboard]);

  // ------------------ RENDER ------------------
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <h3>{TRANSACTION_STRINGS.categorySpending.title}</h3>
        <p className={styles.subtitle}>
          {TRANSACTION_STRINGS.categorySpending.subtitle}
        </p>
      </div>

      {data.length === 0 ? (
        <p className={styles.empty}>
          {TRANSACTION_STRINGS.categorySpending.noData}
        </p>
      ) : (
        <div className={styles.wrapper}>
          {/* Donut Visualization */}
          <div className={styles.chart}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${(value / 100).toFixed(2)}`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className={styles.legend}>
            {data.map((d, i) => (
              <div key={i} className={styles.legendItem}>
                <div className={styles.label}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: d.color }}
                  ></span>
                  <span className={styles.name}>{d.name}</span>
                </div>
                <span className={styles.percent}>{d.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
