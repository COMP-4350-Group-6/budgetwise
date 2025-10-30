"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./transactions.module.css";
import { categoryService, budgetService } from "@/services/budgetService";
import { transactionsService } from "@/services/transactionsService";
import type { Category, Budget } from "@/services/budgetService";
import type { TransactionDTO } from "@/services/transactionsService";
import FinancialSummary from "@/components/transactions/financialSummary";
import CategoryBreakdown from "@/components/transactions/categoryBreakdown";
import { apiFetch } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { Camera, Download, Plus,Pencil } from "lucide-react";

export default function TransactionsPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [categorizingId, setCategorizingId] = useState<string | null>(null);

  // ===== Add Modal State =====
  const [showAddModal, setShowAddModal] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBudgetId, setSelectedBudgetId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ===== Invoice Upload State =====
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [parsingInvoice, setParsingInvoice] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // ===== Edit Modal State =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTx, setEditTx] = useState<TransactionDTO | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ===== Filters =====
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // ===== Pagination =====
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ===== Load Data =====
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const resp = await apiFetch<{ transactions: TransactionDTO[] }>(
        "/transactions?days=90&limit=500",
        {},
        true
      );
      setTransactions(resp.transactions);
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await categoryService.listCategories(true);
        setCategories(cats);
        const bs = await budgetService.listBudgets(true);
        setBudgets(bs);
        await loadTransactions();
      } catch (e) {
        console.error("Error loading page data", e);
      }
    };
    load();
  }, []);

  // ===== Derived: Month / Budget Stats for Snapshot =====
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const daysElapsed = Math.min(now.getDate(), new Date(year, month + 1, 0).getDate());
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthTx = useMemo(
    () =>
      transactions.filter((tx) => {
        const t = new Date(tx.occurredAt);
        return t >= startOfMonth && t <= endOfMonth;
      }),
    [transactions, month, year]
  );

  const totalSpentThisMonth = monthTx
    .reduce((sum, tx) => sum + (tx.amountCents > 0 ? tx.amountCents : 0), 0) / 100;

  const totalTransactions = monthTx.length;
  const averageTransaction =
    totalTransactions > 0 ? totalSpentThisMonth / totalTransactions : 0;

  const lastMonthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const lastMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  const lastMonthTx = useMemo(
    () =>
      transactions.filter((tx) => {
        const t = new Date(tx.occurredAt);
        return t >= lastMonthStart && t <= lastMonthEnd;
      }),
    [transactions, month, year]
  );

  const totalSpentLastMonth = lastMonthTx
    .filter((tx) => tx.amountCents < 0)
    .reduce((s, tx) => s + Math.abs(tx.amountCents) / 100, 0);

  // Sum all active budgets (fallback to 0)
  const totalBudgetThisMonth =
    budgets?.reduce((s, b) => s + (b.amountCents ?? 0), 0) / 100 || 0;

  // ===== Category Totals (for breakdown) =====
  const categoryMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categories]);

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    monthTx.forEach((tx) => {
      if (tx.amountCents < 0) {
        const name = categoryMap.get(tx.categoryId || "") || "Uncategorized";
        totals.set(name, (totals.get(name) ?? 0) + Math.abs(tx.amountCents) / 100);
      }
    });
    return Array.from(totals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [monthTx, categoryMap]);

  // ===== Add & Edit Transactions =====
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setMessage("Transaction date cannot be in the future.");
      return;
    }

    const cents = Math.round(parseFloat(amount || "0") * 100);
    if (cents <= 0 || (!description && !note)) {
      setMessage("Please provide amount and description.");
      return;
    }
    try {
      setSubmitting(true);
      const hadCategorySelected = Boolean(selectedCategoryId);
      const hadNoteOrDescription = Boolean(note || description);

      const result = await transactionsService.addTransaction({
        budgetId: selectedBudgetId || undefined,
        categoryId: selectedCategoryId || undefined,
        amountCents: cents,
        note: note || description || undefined,
        occurredAt: selectedDate,
      });

      const newTx = result.transaction;
      setTransactions((prev) => {
        const withoutCurrent = prev.filter((tx) => tx.id !== newTx.id);
        const merged = [newTx, ...withoutCurrent];
        return merged.sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        );
      });

      // Clear form
      setDescription("");
      setAmount("");
      setNote("");
      setSelectedCategoryId("");
      setSelectedBudgetId("");
      setShowAddModal(false);

      // Auto-categorize if needed
      if (!hadCategorySelected && newTx.id && hadNoteOrDescription) {
        const txId = newTx.id;
        setCategorizingId(txId);
        transactionsService
          .categorizeTransaction(txId)
          .then((response) => {
            if (response) {
              setTransactions((prev) =>
                prev.map((tx) =>
                  tx.id === txId
                    ? {
                        ...tx,
                        categoryId: response.categoryId,
                        updatedAt: new Date().toISOString(),
                      }
                    : tx
                )
              );
            }
          })
          .catch((err) => console.error("Auto-categorization failed:", err))
          .finally(() => setCategorizingId(null));
      }
    } catch {
      setMessage("Failed to add transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (tx: TransactionDTO) => {
    setEditTx(tx);
    setEditAmount((tx.amountCents / 100).toFixed(2));
    setEditCategoryId(tx.categoryId || "");
    setEditDate(tx.occurredAt.split("T")[0]);
    setEditNote(tx.note || "");
    setEditMessage("");
    setDeleting(false);
    setShowDeleteConfirm(false);
    setShowEditModal(true);
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTx) return;
    const cents = Math.round(parseFloat(editAmount || "0") * 100);
    if (!editCategoryId || cents <= 0) {
      setEditMessage("Please fill all required fields.");
      return;
    }
    try {
      setEditSubmitting(true);
      await transactionsService.updateTransaction(editTx.id, {
        amountCents: cents,
        categoryId: editCategoryId,
        note: editNote,
        occurredAt: new Date(editDate),
      });
      await loadTransactions();
      setShowEditModal(false);
    } catch {
      setEditMessage("Failed to update transaction.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!editTx) return;
    try {
      setDeleting(true);
      await transactionsService.deleteTransaction(editTx.id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== editTx.id));
      setShowDeleteConfirm(false);
      setShowEditModal(false);
      setEditTx(null);
    } catch (err) {
      console.error("Failed to delete transaction", err);
      setEditMessage("Failed to delete transaction.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  // ===== Handle Invoice Upload =====
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadMessage("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setUploadMessage("");
    };
    reader.onerror = () => {
      setUploadMessage("Failed to read image");
    };
    reader.readAsDataURL(file);
  };

  const handleParseInvoice = async () => {
    if (!uploadedImage) {
      setUploadMessage("Please upload an image first");
      return;
    }

    try {
      setParsingInvoice(true);
      setUploadMessage("Parsing invoice with AI...");

      const parsed = await transactionsService.parseInvoice(uploadedImage);
      if (!parsed) {
        setUploadMessage("Could not parse invoice. Please try again or enter manually.");
        return;
      }

      setDescription(parsed.merchant);
      setAmount((parsed.total / 100).toFixed(2));
      setNote(parsed.invoiceNumber ? `Invoice #${parsed.invoiceNumber}` : "");
      setDate(parsed.date);

      if (parsed.suggestedCategory) {
        const matchedCat = categories.find(
          (c) => c.name.toLowerCase() === parsed.suggestedCategory?.toLowerCase()
        );
        if (matchedCat) setSelectedCategoryId(matchedCat.id);
      }

      setShowUploadModal(false);
      setUploadedImage(null);
      setShowAddModal(true);
      setUploadMessage("");
    } catch (error) {
      console.error("Invoice parsing error:", error);
      setUploadMessage("Failed to parse invoice. Please try again.");
    } finally {
      setParsingInvoice(false);
    }
  };

  // ===== Filter + Search =====
  const filteredTransactions = transactions.filter((tx) => {
    const matchesCategory = !filterCategory || tx.categoryId === filterCategory;
    const matchesSearch =
      !searchQuery ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (description && description.toLowerCase().includes(searchQuery.toLowerCase()));

    const txDate = new Date(tx.occurredAt).getTime();
    const nowMs = Date.now();
    let withinRange = true;
    if (dateRange === "7") withinRange = txDate >= nowMs - 7 * 24 * 60 * 60 * 1000;
    else if (dateRange === "30") withinRange = txDate >= nowMs - 30 * 24 * 60 * 60 * 1000;
    else if (dateRange === "90") withinRange = txDate >= nowMs - 90 * 24 * 60 * 60 * 1000;
    else if (dateRange === "custom" && customStart && customEnd) {
      withinRange =
        txDate >= new Date(customStart).getTime() &&
        txDate <= new Date(customEnd).getTime();
    }

    return matchesCategory && matchesSearch && withinRange;
  });

  // ===== Pagination Logic with Ellipses =====
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 3) {
        pages.push(1, "…");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) {
        pages.push("…", totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTransactions.length, itemsPerPage]);

  // ==== Export ====
  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export.");
      return;
    }
    const headers = ["Date", "Category", "Amount ($)", "Type", "Note"];
    const rows = filteredTransactions.map((tx) => {
      const cat = categories.find((c) => c.id === tx.categoryId)?.name || "Uncategorized";
      const amount = (Math.abs(tx.amountCents) / 100).toFixed(2);
      const type = tx.amountCents < 0 ? "Expense" : "Income";
      const d = new Date(tx.occurredAt);
      const date = d.toLocaleDateString();
      return [date, cat, amount, type, tx.note || ""];
    });

    const totalSpent = filteredTransactions
      .filter((tx) => tx.amountCents < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amountCents) / 100, 0)
      .toFixed(2);

    const totalIncome = filteredTransactions
      .filter((tx) => tx.amountCents > 0)
      .reduce((sum, tx) => sum + tx.amountCents / 100, 0)
      .toFixed(2);

    rows.push([]);
    rows.push(["", "Total Income", totalIncome, "", ""]);
    rows.push(["", "Total Expenses", totalSpent, "", ""]);

    const csvContent = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.pageContainer}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Transactions</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleExport}>
            <Download size={16} style={{ marginRight: 6 }} /> Export CSV
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setShowUploadModal(true)}
          >
            <Camera size={16} style={{ marginRight: 6 }} /> Upload Invoice
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} style={{ marginRight: 6 }} /> Add Transaction
          </button>
        </div>
      </div> 

      {/* ===== FILTERS ===== */}
      <div className={styles.filterRow}>
        <input
          type="text"
          placeholder="Search..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className={styles.dateInput}
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className={styles.dateInput}
              />
            </>
          )}
        </div>
      </div>

      {/* ===== TRANSACTIONS LIST ===== */}
    <div className={styles.sectionBlock}>
      <div className={styles.card}>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : currentTransactions.length === 0 ? (
          <div className={styles.emptyState}>No transactions found.</div>
        ) : (
          currentTransactions.map((tx) => {
            const cat = categories.find((c) => c.id === tx.categoryId);
            const amount = (Math.abs(tx.amountCents) / 100).toFixed(2);
            const isExpense = tx.amountCents < 0;

            return (
              <div key={tx.id} className={styles.transactionItem}>
                <div className={styles.transactionIcon} aria-hidden>
                  
                  <div className={styles.iconDot} />
                </div>
                <div className={styles.transactionContent}>
                  <div className={styles.transactionMerchant}>
                    {tx.note || "Transaction"}
                  </div>
                  <div className={styles.transactionMeta}>
                    <span className={styles.categoryBadge}>
                      {categorizingId === tx.id ? "Categorizing…" : cat?.name || "Uncategorized"}
                    </span>
                    <span className={styles.transactionDate}>
                      {new Date(tx.occurredAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.transactionAmount} ${
                    isExpense ? styles.expense : styles.income
                  }`}
                >
                  {isExpense ? "-" : "+"}${amount}
                </div>
                <button
                  className={styles.editBtn}
                  onClick={() => openEditModal(tx)}
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
        {/* ===== FINANCIAL SUMMARY SECTION ===== */}

      <div className={styles.sectionBlock}>
        <FinancialSummary
          totalTransactions={monthTx.length}
          totalSpent={totalSpentThisMonth}
          averageTransaction={averageTransaction}
        />
      </div>

      <div className={styles.sectionBlock}>
        <CategoryBreakdown
          categories={categoryTotals}
          onCategorizeNow={() => router.push("/transactions")}
        />
      </div>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <div className={styles.pagination}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.arrowBtn}
              aria-label="Previous page"
            >
              ←
            </button>

            {getPageNumbers().map((p, i) =>
              p === "…" ? (
                <span key={`dots-${i}`} className={styles.ellipsis}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p as number)}
                  className={`${styles.pageNumberBtn} ${p === currentPage ? styles.activePage : ""}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.arrowBtn}
              aria-label="Next page"
            >
              →
            </button>
          </div>

          <div className={styles.pageSizeControl}>
            <label>Items per page:</label>
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}



      {/* ===== EDIT MODAL ===== */}
      {showEditModal && editTx && (
        <div className={styles.modal} onClick={() => setShowEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Transaction</h2>
              <button className={styles.closeBtn} onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditTransaction}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select
                  className={styles.formInput}
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notes</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>

              {editMessage && <div className={styles.message}>{editMessage}</div>}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => {
                    setEditMessage("");
                    setShowDeleteConfirm(true);
                  }}
                  disabled={deleting || editSubmitting}
                >
                  Delete
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={editSubmitting}>
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && editTx && (
        <div className={styles.modal} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete Transaction</h2>
              <button className={styles.closeBtn} onClick={() => setShowDeleteConfirm(false)}>
                ✕
              </button>
            </div>
            <p className={styles.confirmText}>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDeleteTransaction}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD MODAL ===== */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Transaction</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Starbucks coffee"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount</label>
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
                  Category{" "}
                  <span style={{ fontSize: "0.85em", color: "#666", fontWeight: "normal" }}>
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
                <label className={styles.formLabel}>Date</label>
                <input
                  type="date"
                  className={styles.formInput}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Notes</label>
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
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={submitting}>
                  {submitting ? "Adding..." : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== UPLOAD INVOICE MODAL ===== */}
      {showUploadModal && (
        <div className={styles.modal} onClick={() => setShowUploadModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Upload Invoice</h2>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedImage(null);
                  setUploadMessage("");
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.uploadSection}>
              {!uploadedImage ? (
                <div className={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    id="invoice-upload"
                  />
                  <label htmlFor="invoice-upload" className={styles.uploadLabel}>
                    <div className={styles.uploadIcon}>📸</div>
                    <p>Click to upload invoice image</p>
                    <p className={styles.uploadHint}>PNG, JPG up to 5MB</p>
                  </label>
                </div>
              ) : (
                <div className={styles.imagePreview}>
                  <img src={uploadedImage} alt="Invoice preview" className={styles.previewImage} />
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setUploadedImage(null)}>
                    Change Image
                  </button>
                </div>
              )}
            </div>

            {uploadMessage && <div className={styles.message}>{uploadMessage}</div>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedImage(null);
                  setUploadMessage("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleParseInvoice}
                disabled={!uploadedImage || parsingInvoice}
              >
                {parsingInvoice ? "Parsing..." : "Parse Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}