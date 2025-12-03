"use client";

import React from "react";
import styles from "./transactionFilters.module.css";
import type { CategoryDTO } from "@budget/schemas";
import { TRANSACTION_STRINGS } from "@/constants/strings";

/**
 * Props for TransactionFilters component.
 * Handles filtering, search, and date range selection.
 */
interface TransactionFiltersProps {
  categories: CategoryDTO[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterCategory: string;
  setFilterCategory: (id: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  customStart: string;
  setCustomStart: (date: string) => void;
  customEnd: string;
  setCustomEnd: (date: string) => void;
}

/**
 * TransactionFilters
 * ----------------------------------------------------------
 * Reusable filter bar for transactions.
 * Includes search input, category dropdown, and date range filter.
 * ----------------------------------------------------------
 */
export default function TransactionFilters({
  categories,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  dateRange,
  setDateRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
}: TransactionFiltersProps) {
  return (
    <div className={styles.filterRow}>
      {/*  Search Input */}
      <input
        type="text"
        placeholder={TRANSACTION_STRINGS.messages.searchPlaceholder ?? "Search..."}
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/*  Filters Group */}
      <div className={styles.filterGroup}>
        {/* Category Selector */}
        <select
          className={styles.filterSelect}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">{TRANSACTION_STRINGS.labels.category}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Date Range Selector */}
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

        {/* Custom Date Pickers */}
        {dateRange === "custom" && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className={styles.dateInput}
              max={new Date().toISOString().split("T")[0]}
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className={styles.dateInput}
              max={new Date().toISOString().split("T")[0]}
            />
          </>
        )}
      </div>
    </div>
  );
}