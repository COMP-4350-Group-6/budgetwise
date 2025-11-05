"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Download, Plus, Upload } from "lucide-react";
import styles from "./transactions.module.css";

import { apiFetch } from "@/lib/apiClient";
import { parseCSV } from "@/lib/csvParser";
import { categoryService, budgetService } from "@/services/budgetService";
import { transactionsService } from "@/services/transactionsService";

import type { Category, Budget } from "@/services/budgetService";
import type {
  TransactionDTO,
  AddTransactionInput,
} from "@/services/transactionsService";

import FinancialSummary from "@/components/transactions/financialSummary";
import CategoryBreakdown from "@/components/transactions/categoryBreakdown";
import TransactionList from "@/components/transactions/transactionList";
import TransactionFilters from "@/components/transactions/transactionFilters";
import {
  AddTransactionModal,
  ImportCsvModal,
  EditTransactionModal,
  UploadInvoiceModal,
} from "@/components/transactions/modals";

import { TRANSACTION_STRINGS } from "@/constants/strings";

export default function TransactionsPage() {
  const router = useRouter();

  // ===== Data State =====
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== Modals =====
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ===== Add Transaction Fields =====
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ===== Edit Fields =====
  const [editTx, setEditTx] = useState<TransactionDTO | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ===== Invoice Upload =====
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [parsingInvoice, setParsingInvoice] = useState(false);

  // ===== CSV Import =====
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<
    AddTransactionInput[]
  >([]);
  const [parseErrors, setParseErrors] = useState<
    Array<{ row: number; error: string }>
  >([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors: Array<{ index: number; error: string; data: unknown }>;
  } | null>(null);

  // ===== Filters =====
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

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
        const bs = await budgetService.listBudgets(true);
        setCategories(cats);
        setBudgets(bs);
        await loadTransactions();
      } catch (e) {
        console.error("Error loading data", e);
      }
    };
    load();
  }, []);

  // ===== Summary Calculations =====
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthTx = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          new Date(tx.occurredAt) >= startOfMonth &&
          new Date(tx.occurredAt) <= endOfMonth
      ),
    [transactions]
  );

  const totalTransactions = monthTx.length;
  const totalSpent = monthTx.reduce(
    (sum, tx) => sum + Math.abs(tx.amountCents) / 100,
    0
  );
  const averageTransaction =
    totalTransactions > 0 ? totalSpent / totalTransactions : 0;

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    monthTx.forEach((tx) => {
      const name =
        categories.find((c) => c.id === tx.categoryId)?.name ||
        TRANSACTION_STRINGS.labels.uncategorized;
      totals.set(
        name,
        (totals.get(name) ?? 0) + Math.abs(tx.amountCents) / 100
      );
    });
    return Array.from(totals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [monthTx, categories]);

  // ===== Add Transaction =====
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(amount || "0") * 100);
    if (cents <= 0 || !description) {
      setMessage(TRANSACTION_STRINGS.messages.failure);
      return;
    }

    try {
      setSubmitting(true);
      const result = await transactionsService.addTransaction({
        categoryId: selectedCategoryId || undefined,
        amountCents: cents,
        note: note || description,
        occurredAt: new Date(date),
      });

      setTransactions((prev) => [result.transaction, ...prev]);
      setShowAddModal(false);
      setDescription("");
      setAmount("");
      setNote("");
      setSelectedCategoryId("");
      setMessage(TRANSACTION_STRINGS.messages.successAdd);
    } catch {
      setMessage(TRANSACTION_STRINGS.messages.failure);
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Edit Transaction =====
  const openEditModal = (tx: TransactionDTO) => {
    setEditTx(tx);
    setEditAmount((Math.abs(tx.amountCents) / 100).toFixed(2));
    setEditCategoryId(tx.categoryId || "");
    setEditDate(tx.occurredAt.split("T")[0]);
    setEditNote(tx.note || "");
    setEditMessage("");
    setShowEditModal(true);
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTx) return;
    const cents = Math.round(parseFloat(editAmount || "0") * 100);
    if (cents <= 0) {
      setEditMessage("Invalid amount.");
      return;
    }

    try {
      setEditSubmitting(true);
      const updatedTx = await transactionsService.updateTransaction(editTx.id, {
        amountCents: editTx.amountCents < 0 ? -cents : cents,
        categoryId: editCategoryId || undefined,
        note: editNote,
        occurredAt: new Date(editDate),
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === editTx.id ? updatedTx : t))
      );
      setShowEditModal(false);
    } catch {
      setEditMessage(TRANSACTION_STRINGS.messages.failure);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!editTx) return;
    try {
      setDeleting(true);
      await transactionsService.deleteTransaction(editTx.id);
      setTransactions((prev) => prev.filter((t) => t.id !== editTx.id));
      setShowDeleteConfirm(false);
      setShowEditModal(false);
    } catch {
      setEditMessage(TRANSACTION_STRINGS.messages.failure);
    } finally {
      setDeleting(false);
    }
  };

  // ===== CSV Import =====
  const handleCSVFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const text = await file.text();
    const result = parseCSV(text);
    setParsedTransactions(result.transactions);
    setParseErrors(result.errors);
  };

  const handleImportTransactions = async () => {
    if (parsedTransactions.length === 0) return;
    try {
      setImporting(true);
      const result = await transactionsService.bulkImportTransactions(
        parsedTransactions
      );
      setImportResult(result);
      if (result.imported > 0) await loadTransactions();
    } finally {
      setImporting(false);
    }
  };

  // ===== Export =====
  const handleExport = () => {
    if (transactions.length === 0) {
      alert(TRANSACTION_STRINGS.errors.noTransactions);
      return;
    }

    const headers = ["Date", "Category", "Amount", "Note"];
    const rows = transactions.map((tx) => {
      const cat =
        categories.find((c) => c.id === tx.categoryId)?.name ||
        TRANSACTION_STRINGS.labels.uncategorized;
      return [
        new Date(tx.occurredAt).toLocaleDateString(),
        cat,
        (tx.amountCents / 100).toFixed(2),
        tx.note || "",
      ];
    });

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <div className={styles.pageContainer}>
      {/* ===== HEADER ===== */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Transactions</h1>
        </div>
        <div className={styles.headerRight}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleExport}
          >
            <Download size={16} style={{ marginRight: 6 }} /> Export CSV
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => {
              setShowCSVModal(true);
            }}
          >
            <Upload size={16} style={{ marginRight: 6 }} /> Import CSV
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
      <TransactionFilters
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        dateRange={dateRange}
        setDateRange={setDateRange}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
      />

      {/* ===== TRANSACTION LIST (FILTERED OR FULL) ===== */}
      {(() => {
        const filteredTransactions = transactions.filter((tx) => {
          const matchesCategory =
            !filterCategory || tx.categoryId === filterCategory;

          const matchesSearch =
            !searchQuery ||
            (tx.note &&
              tx.note.toLowerCase().includes(searchQuery.toLowerCase()));

          const txDate = new Date(tx.occurredAt).getTime();
          const nowMs = Date.now();
          let withinRange = true;

          if (dateRange === "7") withinRange = txDate >= nowMs - 7 * 86400000;
          else if (dateRange === "30")
            withinRange = txDate >= nowMs - 30 * 86400000;
          else if (dateRange === "90")
            withinRange = txDate >= nowMs - 90 * 86400000;
          else if (dateRange === "custom" && customStart && customEnd) {
            withinRange =
              txDate >= new Date(customStart).getTime() &&
              txDate <= new Date(customEnd).getTime();
          }

          return matchesCategory && matchesSearch && withinRange;
        });

        const isFiltering =
          !!searchQuery || !!filterCategory || dateRange === "custom";

        return (
          <div className={styles.sectionBlock}>
            <TransactionList
              transactions={isFiltering ? filteredTransactions : transactions}
              loading={loading}
              onEdit={openEditModal}
              categories={categories}
            />
          </div>
        );
      })()}
      {/* ===== SUMMARY + CATEGORIES ===== */}
      <div className={styles.sectionBlock}>
        <FinancialSummary
          totalTransactions={totalTransactions}
          totalSpent={totalSpent}
          averageTransaction={averageTransaction}
        />
      </div>
      <div className={styles.sectionBlock}>
        <CategoryBreakdown
          categories={categoryTotals}
          onCategorizeNow={() => router.push("/transactions")}
        />
      </div>

      {/* ===== MODALS ===== */}
      <AddTransactionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTransaction}
        description={description}
        setDescription={setDescription}
        amount={amount}
        setAmount={setAmount}
        note={note}
        setNote={setNote}
        date={date}
        setDate={setDate}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        categories={categories}
        submitting={submitting}
        message={message}
      />

      <EditTransactionModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        editTx={editTx}
        editAmount={editAmount}
        editCategoryId={editCategoryId}
        editDate={editDate}
        editNote={editNote}
        editMessage={editMessage}
        setEditAmount={setEditAmount}
        setEditCategoryId={setEditCategoryId}
        setEditDate={setEditDate}
        setEditNote={setEditNote}
        setEditMessage={setEditMessage}
        editSubmitting={editSubmitting}
        deleting={deleting}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        categories={categories}
      />

      <UploadInvoiceModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUpload={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onloadend = () => setUploadedImage(reader.result as string);
          reader.readAsDataURL(file);
        }}
        onParseInvoice={async () => {
          if (!uploadedImage) return;
          setParsingInvoice(true);
          const parsed = await transactionsService.parseInvoice(uploadedImage);
          if (parsed) {
            setDescription(parsed.description || parsed.merchant);
            setAmount((parsed.total / 100).toFixed(2));
            setNote(parsed.description || parsed.merchant);
            setDate(parsed.date);
            setShowAddModal(true);
            setShowUploadModal(false);
          }
          setParsingInvoice(false);
        }}
        uploadedImage={uploadedImage}
        uploadMessage={uploadMessage}
        parsingInvoice={parsingInvoice}
        setUploadedImage={setUploadedImage}
        setUploadMessage={setUploadMessage}
      />

      {/* ===== IMPORT CSV MODAL ===== */}
      <ImportCsvModal
        show={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onFileSelect={handleCSVFileSelect}
        onImport={handleImportTransactions}
        csvFile={csvFile}
        parsedTransactions={parsedTransactions}
        parseErrors={parseErrors}
        importResult={importResult}
        importing={importing}
      />
    </div>
  );
}
