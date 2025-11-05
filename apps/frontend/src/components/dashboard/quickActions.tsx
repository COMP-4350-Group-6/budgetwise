"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./quickActions.module.css";
import { QUICK_ACTIONS_STRINGS } from "@/constants/strings";
import { Settings, PlusCircle } from "lucide-react";

/**
 * QuickActions
 * ----------------------------------------------------------
 * Provides fast access to core user actions:
 * - Add new transactions
 * - Manage existing budgets
 * ----------------------------------------------------------
 */

export default function QuickActions({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <section className={styles.actions}>
      {/* --- Add Transaction --- */}
      <div className={styles.card}>
        <header className={styles.top}>
          <h3>{QUICK_ACTIONS_STRINGS.addTransc}</h3>
          <p>{QUICK_ACTIONS_STRINGS.transcDescription}</p>
        </header>
        <button
          type="button"
          className={styles.primary}
          onClick={() => router.push("/transactions")}
        >
          <PlusCircle size={16} aria-hidden="true" />
          <span>{QUICK_ACTIONS_STRINGS.addTransc}</span>
        </button>
      </div>

      {/* --- Manage Budgets --- */}
      <div className={styles.card}>
        <header className={styles.top}>
          <h3>{QUICK_ACTIONS_STRINGS.manageBudgets}</h3>
          <p>{QUICK_ACTIONS_STRINGS.budgetsDescription}</p>
        </header>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => router.push("/budget")}
        >
          <Settings size={14} aria-hidden="true" />
          <span>{QUICK_ACTIONS_STRINGS.manageBudgets}</span>
        </button>
      </div>
    </section>
  );
}
