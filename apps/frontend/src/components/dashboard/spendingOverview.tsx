"use client";

import React, { useMemo, useState } from "react";
import styles from "./spendingOverview.module.css";
import type { TransactionDTO } from "@/services/transactionsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

// Constants & Utils
import { TRANSACTION_STRINGS } from "@/constants/strings/transactionStrings";
import {
  formatDayShort,
  getWeekRangeLabel,
  formatMonthLong,
} from "@/utils/dateHelpers";

/**
 * Displays spending data in two modes:
 * - Weekly bar chart view
 * - Monthly calendar heatmap view
 */
export default function SpendingOverview({
  transactions,
}: {
  transactions: TransactionDTO[];
}) {
  const [viewMode, setViewMode] = useState<"week" | "calendar">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const router = useRouter();

  // Monday-first day labels for the weekly chart
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ---------- WEEK RANGE (memoized) ----------
  const { startOfWeek, endOfWeek, weekRangeLabel } = useMemo(() => {
    const now = new Date();
    const ref = new Date(now);
    ref.setDate(now.getDate() + weekOffset * 7);

    // Monday-start week
    const start = new Date(ref);
    start.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return {
      startOfWeek: start,
      endOfWeek: end,
      weekRangeLabel: getWeekRangeLabel(start, end),
    };
  }, [weekOffset]);

  // Short label for header, e.g. "Tue"
  const selectedDayLabel = useMemo(() => {
    if (!selectedDay) return null;
    const d = new Date(selectedDay);
    return formatDayShort(d);
  }, [selectedDay]);

  // ---------- WEEKLY BAR CHART DATA ----------
  const weeklyData = useMemo(() => {
    const totals = new Map<string, number>();

    for (const tx of transactions) {
      const date = new Date(tx.occurredAt);
      if (date >= startOfWeek && date <= endOfWeek) {
        // JS day: 0=Sun..6=Sat → convert to Monday-first index 0..6
        const jsIndex = date.getDay();
        const index = (jsIndex + 6) % 7; // Mon=0, Tue=1, ..., Sun=6
        const day = dayNames[index];

        const prev = totals.get(day) ?? 0;
        totals.set(day, prev + Math.abs(tx.amountCents) / 100);
      }
    }

    // Ensure consistent Mon..Sun order
    return dayNames.map((day) => ({
      day,
      amount: totals.get(day) ?? 0,
    }));
  }, [transactions, startOfWeek, endOfWeek, dayNames]);

  // ---------- SELECTED DAY TRANSACTIONS ----------
  // Same logic for both week & calendar: match actual calendar date
  const selectedTx = useMemo(() => {
    if (!selectedDay) return [];

    return transactions.filter((tx) => {
      const d = new Date(tx.occurredAt);
      return d.toDateString() === selectedDay;
    });
  }, [selectedDay, transactions]);

  // ---------- CALENDAR HEATMAP ----------
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

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const totalsByDay = new Map<number, number>();
    for (const tx of transactions) {
      const d = new Date(tx.occurredAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const key = d.getDate();
        const prev = totalsByDay.get(key) ?? 0;
        totalsByDay.set(key, prev + Math.abs(tx.amountCents) / 100);
      }
    }

    return Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const date = new Date(year, month, dayNum);
      return { date, total: totalsByDay.get(dayNum) ?? 0 };
    });
  }, [transactions, currentMonth]);

  const monthLabel = `${formatMonthLong(
    currentMonth
  )} ${currentMonth.getFullYear()}`;

  const legendLabels = {
    low: "< $50",
    mid: "$50–$150",
    high: "> $150",
  };

  // ---------- RENDER ----------
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <h3>
          {viewMode === "week"
            ? `${TRANSACTION_STRINGS.weekOf} ${weekRangeLabel}`
            : monthLabel}
        </h3>

        <div className={styles.controls}>
          {viewMode === "calendar" ? (
            <>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  )
                }
              >
                ◀
              </button>
              <button onClick={() => setCurrentMonth(new Date())}>Today</button>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )
                }
              >
                ▶
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setWeekOffset((o) => o - 1)}>◀</button>
              <button onClick={() => setWeekOffset(0)}>Today</button>
              <button onClick={() => setWeekOffset((o) => o + 1)}>▶</button>
            </>
          )}

          <button
            className={`${styles.toggleBtn} ${
              viewMode === "calendar" ? styles.active : ""
            }`}
            onClick={() =>
              setViewMode((prev) => (prev === "week" ? "calendar" : "week"))
            }
          >
            {viewMode === "week"
              ? TRANSACTION_STRINGS.calendarView
              : TRANSACTION_STRINGS.weeklyView}
          </button>
        </div>
      </div>

      {/* CONDITIONAL VIEWS */}
      {viewMode === "calendar" ? (
        <>
          {/* CALENDAR GRID */}
          <div className={styles.grid}>
            {calendarDays.map((d, i) => {
              const selected = selectedDay === d.date.toDateString();
              const today = isToday(d.date);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(d.date.toDateString())}
                  className={`${styles.day} ${getHeatClass(d.total)} 
                    ${today ? styles.today : ""} 
                    ${selected ? styles.selected : ""}`}
                >
                  {d.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* LEGEND */}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.low}`}></span>
              <span>Low {legendLabels.low}</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.mid}`}></span>
              <span>Medium {legendLabels.mid}</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.high}`}></span>
              <span>High {legendLabels.high}</span>
            </div>
          </div>

          {/* DAILY TRANSACTIONS (CALENDAR VIEW) */}
          <div className={styles.todaysSection}>
            <div className={styles.txHeader}>
              <h4>
                {selectedDayLabel
                  ? `${selectedDayLabel}'s ${TRANSACTION_STRINGS.messages.todayTransactions}`
                  : TRANSACTION_STRINGS.messages.todayTransactions}
              </h4>
              <button
                onClick={() => router.push("/transactions")}
                className={styles.addMini}
              >
                + {TRANSACTION_STRINGS.add}
              </button>
            </div>

            {selectedTx.length === 0 ? (
              <p className={styles.empty}>
                {TRANSACTION_STRINGS.messages.noTransactions}
              </p>
            ) : (
              <ul className={styles.txList}>
                {selectedTx.map((tx) => (
                  <li key={tx.id} className={styles.txItem}>
                    <span className={styles.txName}>
                      {tx.note || TRANSACTION_STRINGS.labels.description}
                    </span>

                    <span className={styles.txAmount}>
                      ${(Math.abs(tx.amountCents) / 100).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          {/* WEEKLY BAR CHART */}
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={weeklyData}
                barSize={35}
                margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                <XAxis dataKey="day" stroke="#555" fontSize={12} />
                <YAxis stroke="#555" fontSize={12} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Bar
                  dataKey="amount"
                  fill="#4E7C66"
                  radius={[6, 6, 0, 0]}
                  onClick={(data) => {
                    const dayLabel = (data.payload as { day: string }).day;
                    const index = dayNames.indexOf(dayLabel);
                    if (index === -1) return;

                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + index);
                    setSelectedDay(date.toDateString());
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* DAILY TRANSACTIONS (WEEK VIEW) */}
          <div className={styles.todaysSection}>
            <div className={styles.txHeader}>
              <h4>
                {selectedDayLabel
                  ? `${selectedDayLabel}'s ${TRANSACTION_STRINGS.messages.todayTransactions}`
                  : TRANSACTION_STRINGS.messages.todayTransactions}
              </h4>
              <button
                onClick={() => router.push("/transactions")}
                className={styles.addMini}
              >
                + {TRANSACTION_STRINGS.add}
              </button>
            </div>

            {selectedTx.length === 0 ? (
              <p className={styles.empty}>
                {TRANSACTION_STRINGS.messages.noTransactions}
              </p>
            ) : (
              <ul className={styles.txList}>
                {selectedTx.map((tx) => (
                  <li key={tx.id} className={styles.txItem}>
                    <span className={styles.txName}>
                      {tx.note || TRANSACTION_STRINGS.labels.description}
                    </span>

                    <span className={styles.txAmount}>
                      ${(Math.abs(tx.amountCents) / 100).toFixed(2)}
                    </span>
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