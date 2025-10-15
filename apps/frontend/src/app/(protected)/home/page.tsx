"use client";

import React from "react";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <h1 className={styles.heading}>Home</h1>

      <section className={styles.gridSection}>
        {/* ---- Budget Overview ---- */}
        <div className={styles.card}>
          <h2 className={styles.subheading}>Budget Overview</h2>
          <p className={styles.subtitle}>Your current financial status.</p>

          <div className={styles.textGroup}>
            <div className={styles.row}>
              <span>Total Balance:</span>
              <span className={styles.boldGray}>--</span>
            </div>
            <div className={styles.row}>
              <span>Budget Used:</span>
              <span className={styles.boldRed}>--</span>
            </div>
            <div className={styles.row}>
              <span>Remaining:</span>
              <span className={styles.boldGreen}>--</span>
            </div>
          </div>

          <div className={styles.progress}>
            <div className={styles.progressFill} />
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.primaryBtn}>View Transactions</button>
            <button className={styles.secondaryBtn}>Manage Budgets</button>
          </div>
        </div>

        {/* ---- Spending Categories ---- */}
        <div className={styles.card}>
          <h2 className={styles.subheading}>Spending Categories</h2>
          <p className={styles.subtitle}>Distribution of your expenses.</p>

          <div className={styles.chartPlaceholder}>(Pie Chart Coming Soon)</div>

          <div className={styles.tagsContainer}>{/* future dynamic tags */}</div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.subheading}>Recent Transactions</h2>
          <button className={styles.linkBtn}>View All →</button>
        </div>
        <div className={styles.emptyState}>
          No recent transactions available yet.
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.subheading}>Quick Actions</h2>
        <p className={styles.subtitle}>Perform common tasks easily.</p>

        <div className={styles.buttonGroup}>
          <button className={styles.primaryBtn}>+ Add New Transaction</button>
          <button className={styles.secondaryBtn}>Set New Savings Goal</button>
        </div>
      </section>
    </div>
  );
}