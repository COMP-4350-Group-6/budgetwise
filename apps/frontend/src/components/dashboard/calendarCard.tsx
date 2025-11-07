"use client";
import React, { useMemo, useState } from "react";
import styles from "./calendarCard.module.css";
import type { TransactionDTO } from "@/services/transactionsService";

function formatLocalYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarCard({ transactions }: { transactions: TransactionDTO[] }) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const days = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Build spend totals per local date
    const totalsByDay = new Map<string, number>();
    for (const tx of transactions) {
      const key = formatLocalYMD(new Date(tx.occurredAt));
      const prev = totalsByDay.get(key) ?? 0;
      totalsByDay.set(key, prev + Math.abs(tx.amountCents) / 100);
    }

    const arr: { date: Date; total: number }[] = [];
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const key = formatLocalYMD(d);
      arr.push({
        date: d,
        total: totalsByDay.get(key) ?? 0,
      });
    }
    return arr;
  }, [transactions, current]);

  const monthName = current.toLocaleString("default", { month: "long" });
  const year = current.getFullYear();

  const getHeatClass = (val: number) => {
    if (val === 0) return styles.none;
    if (val < 50) return styles.low;
    if (val < 150) return styles.mid;
    return styles.high;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Spending Calendar</h3>
        <div className={styles.nav}>
          <button onClick={() => setCurrent(new Date(year, current.getMonth() - 1))}>
            ←
          </button>
          <span className={styles.monthLabel}>
            {monthName} {year}
          </span>
          <button onClick={() => setCurrent(new Date(year, current.getMonth() + 1))}>
            →
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {days.map((d, i) => {
          const isSelected = selected?.toDateString() === d.date.toDateString();
          const today = isToday(d.date);

          return (
            <button
              key={i}
              onClick={() => setSelected(d.date)}
              className={`${styles.day} ${getHeatClass(d.total)} 
                ${today ? styles.today : ""} 
                ${isSelected ? styles.selected : ""}`}
            >
              {d.date.getDate()}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={styles.preview}>
          <h4>
            {selected.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </h4>
          {transactions
            .filter(
              (tx) =>
                new Date(tx.occurredAt).toDateString() === selected.toDateString()
            )
            .map((tx, i) => (
              <div key={i} className={styles.txRow}>
                <span>{tx.note || "Transaction"}</span>
                <span>${(Math.abs(tx.amountCents) / 100).toFixed(2)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}