"use client";

import React from "react";
import styles from "./financialSummary.module.css";
import { TRANSACTION_STRINGS } from "@/constants/strings";

interface FinancialSummaryProps {
  totalTransactions: number;
  totalSpent: number;
  averageTransaction: number;
}

/**
 * FinancialSummary
 * ----------------------------------------------------------
 * Displays this month's financial summary:
 * Total transactions, total spent, and average transaction.
 * Uses string constants for all text.
 * ----------------------------------------------------------
 */
export default function FinancialSummary({
  totalTransactions,
  totalSpent,
  averageTransaction,
}: FinancialSummaryProps) {
  const { labels } = TRANSACTION_STRINGS;

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{TRANSACTION_STRINGS.trend.subtitle}</h2>

      <div className={styles.row}>
        <span className={styles.label}>{labels.totalTransaction}</span>
        <span className={styles.value}>{totalTransactions}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{labels.totalSpent}</span>
        <span className={styles.value}>{formatCurrency(totalSpent)}</span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{labels.averageTransaction}</span>
        <span className={styles.value}>{formatCurrency(averageTransaction)}</span>
      </div>
    </div>
  );
}