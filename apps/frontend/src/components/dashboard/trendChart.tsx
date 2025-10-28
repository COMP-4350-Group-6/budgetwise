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

function formatLocalYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function TrendChart({ transactions }: { transactions: TransactionDTO[] }) {
  // 👉 group spend per local calendar day
  const trendData = useMemo(() => {
    const totalsByDay = new Map<string, number>();

    for (const tx of transactions) {
      const dayKey = formatLocalYMD(new Date(tx.occurredAt));
      const prev = totalsByDay.get(dayKey) ?? 0;
      totalsByDay.set(dayKey, prev + Math.abs(tx.amountCents) / 100);
    }


    const pts = Array.from(totalsByDay, ([date, amount]) => ({ date, amount }));

    // sort by date ascending
    pts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return pts;
  }, [transactions]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Monthly Spending Trend</h3>
        <p className={styles.subtitle}>This month’s daily spend</p>
      </div>

      {trendData.length === 0 ? (
        <p className={styles.empty}>No transaction data yet 📉</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <XAxis dataKey="date" stroke="#7a7a7a" fontSize={10} />
            <YAxis stroke="#7a7a7a" fontSize={10} />
            <Tooltip
              formatter={(v: any) => {
                const num = typeof v === "number" ? v : parseFloat(String(v));
                return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
              }}
              labelFormatter={(label) => label} // show YYYY-MM-DD correctly
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#4e7c66"
              strokeWidth={3}
              dot={{ r: 4, fill: "#4e7c66" }}
              activeDot={{ r: 6, fill: "#4e7c66", stroke: "#2f4f3f", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}