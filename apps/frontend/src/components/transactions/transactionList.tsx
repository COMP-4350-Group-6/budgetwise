"use client";

import React from "react";
import styles from "./transactionList.module.css";
import { Pencil } from "lucide-react";
import type { TransactionDTO } from "@/services/transactionsService";
import type { Category } from "@/services/budgetService";
import { TRANSACTION_STRINGS, GENERAL_STRINGS } from "@/constants/strings";

interface TransactionListProps {
  transactions: TransactionDTO[];
  loading: boolean;
  onEdit: (tx: TransactionDTO) => void;
  categorizingId: string | null;
  categories?: Category[];
}

/**
 * TransactionList
 * ----------------------------------------------------------
 * Displays the user's recent transactions in a scrollable list.
 * Includes loading state, empty state, and edit option.
 * ----------------------------------------------------------
 */
export default function TransactionList({
  transactions,
  loading,
  onEdit,
  categorizingId,
  categories = [],
}: TransactionListProps) {
  // Safely resolve a readable category label
  const getCategoryLabel = (categoryId?: string) => {
    if (!categoryId) return TRANSACTION_STRINGS.labels.uncategorized ?? "Uncategorized";
    const cat = categories.find((c) => c.id === categoryId);
    return (cat?.name || TRANSACTION_STRINGS.labels.uncategorized) ?? "Uncategorized";
  };

  return (
    <div className={styles.sectionBlock}>
      <div className={styles.card}>
        {loading ? (
          <div className={styles.emptyState}>
            {GENERAL_STRINGS.status?.loading || "Loading..."}
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.emptyState}>
            {TRANSACTION_STRINGS.messages.noTransactions}
          </div>
        ) : (
          transactions.map((tx) => {
            const amount = (Math.abs(tx.amountCents) / 100).toFixed(2);
            const isExpense = tx.amountCents < 0;

            return (
              <div key={tx.id} className={styles.transactionItem}>
                {/* Left Icon */}
                <div className={styles.transactionIcon} aria-hidden>
                  <div className={styles.iconDot} />
                </div>

                {/* Middle Content */}
                <div className={styles.transactionContent}>
                  <div className={styles.transactionMerchant}>
                    {tx.note || TRANSACTION_STRINGS.labels.description}
                  </div>
                  <div className={styles.transactionMeta}>
                    <span className={styles.categoryBadge}>
                      {categorizingId === tx.id
                        ? TRANSACTION_STRINGS.messages.categorizing ?? "Categorizing…"
                        : getCategoryLabel(tx.categoryId)}
                    </span>
                    <span className={styles.transactionDate}>
                      {new Date(tx.occurredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right Amount + Edit */}
                <div className={styles.transactionRight}>
                <div
                  className={`${styles.transactionAmount} ${
                    isExpense ? styles.expense : styles.income
                  }`}
                >
                  {isExpense ? "-" : "+"}${amount}
                </div>

                <button
                  className={styles.editBtn}
                  onClick={() => onEdit(tx)}
                  aria-label={TRANSACTION_STRINGS.edit}
                >
                  <Pencil size={16} />
                </button>
              </div>
                </div>
            );
          })
        )}
      </div>
    </div>
  );
}