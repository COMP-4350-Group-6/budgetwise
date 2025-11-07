"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./quickActions.module.css";

export default function QuickActions({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className={styles.actions}>
      <div className={styles.card}>
        <div className={styles.top}>
          <h3>Add a Transaction</h3>
          <p>Quickly log new spending into your budget.</p>
        </div>
        <button
          className={styles.primary}
          onClick={() => router.push("/transactions")}
        >
          + Add Transaction
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.top}>
          <h3>Manage Budgets</h3>
          <p>Adjust your budget allocations anytime.</p>
        </div>
        <button
          className={styles.secondary}
          onClick={() => router.push("/budget")}
        >
          ⚙️ Manage Budgets
        </button>
      </div>
    </div>
  );
}