"use client";

import React, { useEffect, useState } from "react";
import styles from "./transactions.module.css";
import { categoryService, budgetService } from "@/services/budgetService";
import { transactionsService } from "@/services/transactionsService";
import type { Category, Budget } from "@/services/budgetService";
import { apiFetch } from "@/lib/apiClient";
import type { TransactionDTO } from "@/services/transactionsService";

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const [recent, setRecent] = useState<TransactionDTO[]>([]);
  const [recentLoading, setRecentLoading] = useState<boolean>(false);

  const loadRecent = async () => {
    try {
      setRecentLoading(true);
      const resp = await apiFetch<{ transactions: TransactionDTO[] }>(
        "/transactions?days=30&limit=20",
        {},
        true
      );
      setRecent(resp.transactions);
    } catch (e) {
      console.error("Failed to load recent transactions", e);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await categoryService.listCategories(true);
        setCategories(cats);
        const bs = await budgetService.listBudgets(true);
        setBudgets(bs);
        await loadRecent();
      } catch (e) {
        console.error("Failed to load categories/budgets", e);
      }
    };
    load();
  }, []);

  const filteredBudgets = selectedCategoryId
    ? budgets.filter((b) => b.categoryId === selectedCategoryId)
    : [];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!selectedCategoryId) {
      setMessage("Please select a category.");
      return;
    }
    const cents = Math.round(parseFloat(amount || "0") * 100);
    if (!Number.isFinite(cents) || cents === 0) {
      setMessage("Enter a non-zero amount.");
      return;
    }
    try {
      setSubmitting(true);
      await transactionsService.addTransaction({
        budgetId: selectedBudgetId,
        categoryId: selectedCategoryId,
        amountCents: cents,
        note: note || description || undefined,
        occurredAt: new Date(date),
      });
      setDescription("");
      setAmount("");
      setNote("");
      setDate(new Date().toISOString().split("T")[0]);
      setSelectedBudgetId("");
      await loadRecent();
      setMessage("Transaction added.");
    } catch (err) {
      console.error("Add transaction error", err);
      setMessage(err instanceof Error ? err.message : "Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  };

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

        <form className={styles.formGrid} onSubmit={onSubmit}>
          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <input
              type="text"
              placeholder="e.g., Coffee, Salary, Groceries"
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Amount</label>
            <input
              type="number"
              placeholder="$ e.g., 5.50"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.input}
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedBudgetId("");
              }}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget (optional, filtered by category) */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Budget (optional)</label>
            <select
              className={styles.input}
              value={selectedBudgetId}
              onChange={(e) => setSelectedBudgetId(e.target.value)}
              disabled={!selectedCategoryId}
            >
              <option value="">
                {selectedCategoryId ? "No budget (unassigned)" : "Select category first"}
              </option>
              {selectedCategoryId &&
                filteredBudgets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} • {(b.amountCents / 100).toFixed(2)} {b.currency}
                  </option>
                ))}
            </select>
          </div>

          {/* Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Date</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Notes (Optional)</label>
            <textarea
              placeholder="Any additional details..."
              className={styles.textarea}
              rows={1}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className={styles.submitContainer}>
            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? "Adding..." : "Add Transaction"}
            </button>
            {message && <span className="ml-3 text-sm text-gray-600">{message}</span>}
          </div>
        </form>

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

        {recentLoading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : recent.length === 0 ? (
          <div className={styles.emptyState}>No transactions available yet.</div>
        ) : (
          <ul>
            {recent.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const budget = budgets.find((b) => b.id === tx.budgetId);
              const amount = (tx.amountCents / 100).toFixed(2);
              const currency = budget?.currency ?? "CAD";
              const dateStr = new Date(tx.occurredAt).toLocaleDateString();
              return (
                <li key={tx.id}>
                  <div>
                    <strong>{cat ? cat.name : "Uncategorized"}</strong>
                    {" • "}
                    <span>{budget ? budget.name : "Unassigned"}</span>
                  </div>
                  <div>
                    <span>{dateStr}</span>
                    {tx.note ? <span>{" • "}{tx.note}</span> : null}
                  </div>
                  <div>
                    <span>{currency} {amount}</span>
                  </div>
                  <hr />
                </li>
              );
            })}
          </ul>
        )}
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