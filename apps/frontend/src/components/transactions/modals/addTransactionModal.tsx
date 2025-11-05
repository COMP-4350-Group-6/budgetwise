"use client";

import React from "react";
import styles from "./modals.module.css";
import { TRANSACTION_STRINGS } from "@/constants/strings";
import type { Category } from "@/services/budgetService";

interface AddTransactionModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  description: string;
  setDescription: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (v: string) => void;
  categories: Category[];
  submitting: boolean;
  message: string;
}

export default function AddTransactionModal({
  show,
  onClose,
  onSubmit,
  description,
  setDescription,
  amount,
  setAmount,
  note,
  setNote,
  date,
  setDate,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  submitting,
  message,
}: AddTransactionModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* ===== Header ===== */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {TRANSACTION_STRINGS.add}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ===== Form ===== */}
        <form onSubmit={onSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {TRANSACTION_STRINGS.labels.description}
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Starbucks coffee"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {TRANSACTION_STRINGS.labels.amount}
            </label>
            <input
              type="number"
              className={styles.formInput}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {TRANSACTION_STRINGS.labels.category}{" "}
              <span style={{ fontSize: "0.85em", color: "#666" }}>
                (optional - AI will suggest if empty)
              </span>
            </label>
            <select
              className={styles.formInput}
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">Auto-categorize with AI</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {TRANSACTION_STRINGS.labels.date}
            </label>
            <input
              type="date"
              className={styles.formInput}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {TRANSACTION_STRINGS.labels.description}
            </label>
            <input
              type="text"
              className={styles.formInput}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          {message && <div className={styles.message}>{message}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={submitting}
            >
              {submitting ? "Adding..." : TRANSACTION_STRINGS.add}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}