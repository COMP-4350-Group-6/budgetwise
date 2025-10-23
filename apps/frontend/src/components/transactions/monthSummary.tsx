"use client";

import React from "react";
import styles from "./monthSummary.module.css";

interface Props {
  totalTransactions: number;
  totalSpent: number;
  averageTransaction: number;
}

export default function MonthSummary({
  totalTransactions,
  totalSpent,
  averageTransaction,
}: Props) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>This Month</h2>
      <div className={styles.row}>
        <span className={styles.label}>Total Transactions</span>
        <span className={styles.value}>{totalTransactions}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Total Spent</span>
        <span className={styles.value}>${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Average Transaction</span>
        <span className={styles.value}>${averageTransaction.toFixed(2)}</span>
      </div>
    </div>
  );
}
