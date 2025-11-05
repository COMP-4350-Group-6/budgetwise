"use client";

import React from "react";
import styles from "./modals.module.css";
import { TRANSACTION_STRINGS, GENERAL_STRINGS } from "@/constants/strings";
import type { Category } from "@/services/budgetService";

interface EditTransactionModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: () => void;

  editTx: any;
  editAmount: string;
  editCategoryId: string;
  editDate: string;
  editNote: string;
  editMessage: string;

  setEditAmount: (v: string) => void;
  setEditCategoryId: (v: string) => void;
  setEditDate: (v: string) => void;
  setEditNote: (v: string) => void;
  setEditMessage: (v: string) => void; 

  editSubmitting: boolean;
  deleting: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  categories: Category[];
}

export default function EditTransactionModal({
  show,
  onClose,
  onSubmit,
  onDelete,
  editTx,
  editAmount,
  editCategoryId,
  editDate,
  editNote,
  editMessage,
  setEditAmount,
  setEditCategoryId,
  setEditDate,
  setEditNote,
  setEditMessage,
  editSubmitting,
  deleting,
  showDeleteConfirm,
  setShowDeleteConfirm,
  categories,
}: EditTransactionModalProps) {
  if (!show || !editTx) return null;

  return (
    <>
      <div className={styles.modal} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{TRANSACTION_STRINGS.edit}</h2>
            <button className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {TRANSACTION_STRINGS.labels.amount}
              </label>
              <input
                type="number"
                className={styles.formInput}
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                step="0.01"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {TRANSACTION_STRINGS.labels.category}
              </label>
              <select
                className={styles.formInput}
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
              >
                <option value="">
                  {TRANSACTION_STRINGS.labels.category}
                </option>
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
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
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
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
              />
            </div>

            {editMessage && (
              <div className={styles.message}>{editMessage}</div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onClose}
              >
                {GENERAL_STRINGS.actions.cancel}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => {
                  setEditMessage(""); // ✅ now valid
                  setShowDeleteConfirm(true);
                }}
                disabled={deleting || editSubmitting}
              >
                {TRANSACTION_STRINGS.delete}
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={editSubmitting}
              >
                {editSubmitting ? "Saving..." : GENERAL_STRINGS.actions.save}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ===== DELETE CONFIRM ===== */}
      {showDeleteConfirm && (
        <div
          className={styles.modal}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {TRANSACTION_STRINGS.delete}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowDeleteConfirm(false)}
              >
                ✕
              </button>
            </div>

            <p className={styles.confirmText}>
              {TRANSACTION_STRINGS.messages.confirmDelete}
            </p>

            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                {GENERAL_STRINGS.actions.cancel}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={onDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : TRANSACTION_STRINGS.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}