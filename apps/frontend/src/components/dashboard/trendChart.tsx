"use client";

import React, { useMemo } from "react";
import styles from "./trendChart.module.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TransactionDTO } from "@/services/transactionsService";

// Utilities
import { formatLocalYMD } from "@/utils/dateHelpers";
import { TRANSACTION_STRINGS } from "@/constants/strings/transactionStrings";

/**
 * TrendChart Component
 * ----------------------------------------------------------
 * Displays a line chart of daily spending for the current month.
 * Uses Recharts for visualization.
 * 
 * Responsibilities:
 * - Groups transaction data by date
 * - Calculates total amount spent per day
 * - Provides a visual representation of spending patterns
 * ----------------------------------------------------------
 */
export default function TrendChart({
  transactions,
}: {
  transactions: TransactionDTO[];
}) {
  /**
   * Groups transaction totals by day.
   * 
   * Memoized to avoid unnecessary recalculations on re-render.
   */
  const trendData = useMemo(() => {
    const totalsByDay = new Map<string, number>();

    // Aggregate transactions by local date
    for (const tx of transactions) {
      const dayKey = formatLocalYMD(new Date(tx.occurredAt));
      const previous = totalsByDay.get(dayKey) ?? 0;
      totalsByDay.set(dayKey, previous + Math.abs(tx.amountCents) / 100);
    }

    // Convert to sorted array of { date, amount } objects
    const points = Array.from(totalsByDay, ([date, amount]) => ({ date, amount }));
    points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return points;
  }, [transactions]);

  // ------------------- RENDER -------------------
  return (
    <div className={styles.card}>
      {/* Header Section */}
      <div className={styles.header}>
        <h3>{TRANSACTION_STRINGS.trend.title}</h3>
        <p className={styles.subtitle}>{TRANSACTION_STRINGS.trend.subtitle}</p>
      </div>

      {/* Empty State */}
      {trendData.length === 0 ? (
        <p className={styles.empty}>
          {TRANSACTION_STRINGS.trend.noData}
        </p>
      ) : (
        /* Recharts Visualization */
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" stroke="#7a7a7a" fontSize={10} />
            <YAxis stroke="#7a7a7a" fontSize={10} />
            <Tooltip
              formatter={(value: unknown) => {
                const numericValue =
                  typeof value === "number"
                    ? value
                    : parseFloat(value as string);
                return `$${numericValue.toFixed(2)}`;
              }}
              labelFormatter={(label) => label}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#4E7C66"
              strokeWidth={3}
              dot={{ r: 4, fill: "#4E7C66" }}
              activeDot={{
                r: 6,
                fill: "#4E7C66",
                stroke: "#2F4F3F",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}