"use client";

import React from "react";
import styles from "./budget.module.css";

export default function BudgetPage() {
  return (
    <div className={styles.shell}>
      <h1 className={styles.heading}>Budget</h1>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Budget Overview</h2>

        <div className={styles.grid}>
          {/* --- Monthly Income --- */}
          <div className={styles.card}>
            <h3 className={styles.label}>Monthly Income</h3>
            <p className={styles.amount}>--</p>

            <ul className={styles.list}>
              <li>No income sources added yet</li>
            </ul>

            <div className={styles.inputRow}>
              <input
                type="number"
                placeholder="Amount"
                className={styles.input}
              />
              <button className={styles.primaryBtn}>Add Income</button>
            </div>
          </div>

          {/* --- Budget Adherence --- */}
          <div className={styles.progressCard}>
            <div>
              <h3 className={styles.label}>Budget Adherence</h3>
              <p className={styles.amount}>--</p>
              <p className={styles.description}>
                Budget performance details will appear here.
              </p>
            </div>

            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>

            <button className={styles.linkBtn}>View Insights →</button>
          </div>

          {/* --- Quick Actions --- */}
          <div className={styles.actionsCol}>
            <div className={styles.card}>
              <h4 className={styles.actionTitle}>New Spending Category</h4>
              <p className={styles.actionText}>
                Create a new expense category.
              </p>
              <button className={styles.primaryBtn}>Add Category</button>
            </div>

            <div className={styles.card}>
              <h4 className={styles.actionTitle}>Create New Savings Goal</h4>
              <p className={styles.actionText}>
                Plan for future goals or purchases.
              </p>
              <button className={styles.secondaryBtn}>Set Goal</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Category Spending --- */}
      <section className={styles.section}>
        <h2 className={styles.subheading}>Category Spending Limits</h2>
        <div className={styles.emptyText}>
          No spending categories available yet.
        </div>
      </section>

      {/* --- Savings Goals --- */}
      <section className={styles.section}>
        <h2 className={styles.subheading}>Savings Goals</h2>
        <div className={styles.emptyText}>
          No savings goals have been created yet.
        </div>
      </section>
    </div>
  );
}