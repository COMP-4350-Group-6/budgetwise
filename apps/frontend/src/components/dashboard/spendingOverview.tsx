"use client";
import React, { useMemo, useState } from "react";
import styles from "./spendingOverview.module.css";
import type { TransactionDTO } from "@/services/transactionsService";
import CalendarCard from "./calendarCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";

type ViewMode = "week" | "calendar";

export default function SpendingOverview({ transactions }: { transactions: TransactionDTO[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const router = useRouter();

  //  Week calculations
  const now = new Date();
  const ref = new Date();
  ref.setDate(now.getDate() + weekOffset * 7);

  const startOfWeek = new Date(ref);
  startOfWeek.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weekRangeLabel = useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startOfWeek.toLocaleDateString("en-US", opts)} – ${endOfWeek.toLocaleDateString("en-US", opts)}`;
  }, [startOfWeek, endOfWeek]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 🧾 Weekly data for chart
  const weeklyData = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of transactions) {
      const date = new Date(tx.occurredAt);
      if (date >= startOfWeek && date <= endOfWeek) {
        const day = dayNames[date.getDay()];
        const prev = totals.get(day) ?? 0;
        totals.set(day, prev + Math.abs(tx.amountCents) / 100);
      }
    }
    return dayNames.map((day) => ({
      day,
      amount: totals.get(day) ?? 0,
    }));
  }, [transactions, weekOffset]);

  // 📅 Transactions for selected day
  const selectedTx = useMemo(() => {
    if (!selectedDay) return [];
    return transactions.filter(
      (tx) =>
        dayNames[new Date(tx.occurredAt).getDay()] === selectedDay &&
        new Date(tx.occurredAt) >= startOfWeek &&
        new Date(tx.occurredAt) <= endOfWeek
    );
  }, [selectedDay, transactions, startOfWeek, endOfWeek]);

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h3>Week of {weekRangeLabel}</h3>
        </div>

        <div className={styles.controls}>
          <button onClick={() => setWeekOffset((o) => o - 1)}>◀</button>
          <button onClick={() => setWeekOffset(0)}>Today</button>
          <button onClick={() => setWeekOffset((o) => o + 1)}>▶</button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "calendar" ? styles.active : ""}`}
            onClick={() => setViewMode((prev) => (prev === "week" ? "calendar" : "week"))}
          >
            {viewMode === "week" ? "Calendar View" : "Weekly View"}
          </button>
        </div>
      </div>

      {/* View Switch */}
      {viewMode === "calendar" ? (
        <CalendarCard transactions={transactions} />
      ) : (
        <>
          {/* WEEKLY BAR CHART */}
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={35} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                <XAxis dataKey="day" stroke="#555" fontSize={12} />
                <YAxis stroke="#555" fontSize={12} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Bar
                  dataKey="amount"
                  fill="#4E7C66"
                  radius={[6, 6, 0, 0]}
                  onClick={(data) => setSelectedDay((data.payload as { day: string }).day)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DAILY TRANSACTIONS */}
          <div className={styles.todaysSection}>
            <div className={styles.txHeader}>
              <h4>
                {selectedDay
                  ? `${selectedDay}'s Transactions`
                  : "Today's Transactions"}
              </h4>
              <button
                onClick={() => router.push("/transactions")}
                className={styles.addMini}
              >
                + Add
              </button>
            </div>

            {selectedTx.length === 0 ? (
              <p className={styles.empty}>No transactions logged.</p>
            ) : (
              <ul className={styles.txList}>
                {selectedTx.map((tx, i) => (
                  <li key={i}>
                    <span>{tx.note || "Transaction"}</span>
                    <span>${(Math.abs(tx.amountCents) / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}