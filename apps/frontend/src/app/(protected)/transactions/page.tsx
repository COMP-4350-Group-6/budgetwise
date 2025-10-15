"use client";

import React from "react";
import styles from "./transactions.module.css";

export default function TransactionsPage() {
  return (
    <div className={styles.shell}>
      {/* ===== Page Heading ===== */}
      <h1 className={styles.pageTitle}>Transaction Management</h1>

      {/* ===== Add New Transaction ===== */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Add New Transaction</h2>
        <p className={styles.sectionSubtitle}>
          Enter details for a recent expense or income.
        </p>

        <form className={styles.formGrid}>
          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <input
              type="text"
              placeholder="e.g., Coffee, Salary, Groceries"
              className={styles.input}
            />
          </div>

          {/* Amount */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Amount</label>
            <input
              type="number"
              placeholder="$ e.g., 5.50"
              className={styles.input}
            />
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <select className={styles.input}>
              <option value="">Select a category</option>
              {/* Later dynamically populated */}
            </select>
          </div>

          {/* Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Date</label>
            <input type="date" className={styles.input} />
          </div>

          {/* Payment Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Payment Type</label>
            <select className={styles.input}>
              <option value="">Select payment type</option>
              <option value="cash">Cash</option>
              <option value="debit">Debit Card</option>
              <option value="credit">Credit Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Notes (Optional)</label>
            <textarea
              placeholder="Any additional details..."
              className={styles.textarea}
              rows={1}
            />
          </div>
        </form>

        <div className={styles.submitContainer}>
          <button type="submit" className={styles.primaryBtn}>
            Add Transaction
          </button>
        </div>
      </section>

      {/* ===== Recent Transactions ===== */}
      <section className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>Recent Transactions</h2>

          <div className={styles.filterGroup}>
            <input
              type="text"
              placeholder="Search transactions..."
              className={styles.searchInput}
            />
            <select className={styles.filterSelect}>
              <option>All Categories</option>
            </select>
            <button className={styles.filterBtn}>Date Range</button>
          </div>
        </div>

        <div className={styles.emptyState}>
          No transactions available yet.
        </div>
      </section>

      {/* ===== Recurring Payments ===== */}
      <section className={styles.card}>
        <div className={styles.headerRow}>
          <h2 className={styles.sectionTitle}>
            Recurring Payments & Subscriptions
          </h2>
          <button className={styles.primaryBtn}>
            + Add Recurring Payment
          </button>
        </div>

        <div className={styles.emptyState}>
          No recurring payments or subscriptions yet.
        </div>
      </section>
    </div>
  );
}