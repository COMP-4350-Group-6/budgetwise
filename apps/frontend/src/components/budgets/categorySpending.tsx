"use client";

import React, { useState, JSX } from "react";
import styles from "./categorySpending.module.css";
import type { Category, BudgetDashboard } from "@/services/budgetService";
import type { BudgetPeriod } from "@budget/schemas";
import { budgetService } from "@/services/budgetService";
import {
  Home,
  Car,
  Heart,
  UtensilsCrossed,
  ShoppingCart,
  Film,
  Plane,
  PhoneCall,
  ShoppingBag,
  Plus,
  Trash2,
  Lightbulb,
  
  Wallet,
} from "lucide-react";

export interface Props {
  categories: Category[];
  dashboard: BudgetDashboard | null;
  addingBudgetForCategory: string | null;
  editingBudgetId: string | null;
  formData: {
    categoryId: string;
    name: string;
    amount: string;
    currency: string;
    period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    startDate: string;
    alertThreshold: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      categoryId: string;
      name: string;
      amount: string;
      currency: string;
      period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
      startDate: string;
      alertThreshold: string;
    }>
  >;
  handleSubmitBudget: (e: React.FormEvent) => void;
  handleAddBudgetToCategory: (categoryId: string) => void;
  handleDeleteCategory: (id: string, name: string) => void;
  handleCancelBudgetForm: () => void;
  formatMoney: (cents: number, currency?: string) => string;
  onEditBudget: (
    categoryId: string,
    budget: BudgetDashboard["categories"][number]["budgets"][number]
  ) => void;
  onDeleteBudget: (budgetId: string) => void;
}

const iconMap: Record<string, JSX.Element> = {
  Housing: <Home size={18} />,
  Transportation: <Car size={18} />,
  Food: <UtensilsCrossed size={18} />,
  Groceries: <ShoppingCart size={18} />,
  Dining: <UtensilsCrossed size={18} />,
  Entertainment: <Film size={18} />,
  Travel: <Plane size={18} />,
  Healthcare: <Heart size={18} />,
  Subscriptions: <PhoneCall size={18} />,
  Utilities: <Lightbulb size={18} />,
  Shopping: <ShoppingBag size={18} />,
};

export default function CategorySpendingSection({
  categories,
  dashboard,
  addingBudgetForCategory,
  editingBudgetId,
  formData,
  setFormData,
  handleSubmitBudget,
  handleAddBudgetToCategory,
  handleDeleteCategory,
  handleCancelBudgetForm,
  formatMoney,
  onEditBudget,
  onDeleteBudget,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  if (!categories || categories.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.subheading}>
          Category Spending Limits (This Month)
        </h2>
        <div className={styles.emptyState}>No categories available yet.</div>
      </section>
    );
  }

  // Separate categories into budgeted and non-budgeted
  const categoriesWithBudgets = categories
    .filter((category) => {
      const summary = dashboard?.categories.find((c) => c.categoryId === category.id);
      return (summary?.budgets?.length || 0) > 0;
    })
    .sort((a, b) => {
      // Sort by budget period: DAILY < WEEKLY < MONTHLY < YEARLY
      const periodOrder = { DAILY: 1, WEEKLY: 2, MONTHLY: 3, YEARLY: 4 };
      const aSummary = dashboard?.categories.find((c) => c.categoryId === a.id);
      const bSummary = dashboard?.categories.find((c) => c.categoryId === b.id);
      const aPeriod = aSummary?.budgets?.[0]?.budget?.period || 'YEARLY';
      const bPeriod = bSummary?.budgets?.[0]?.budget?.period || 'YEARLY';
      return periodOrder[aPeriod] - periodOrder[bPeriod];
    });

  const categoriesWithoutBudgets = categories.filter((category) => {
    const summary = dashboard?.categories.find((c) => c.categoryId === category.id);
    return (summary?.budgets?.length || 0) === 0;
  });

  const renderCategory = (category: Category) => {
    const categorySummary = dashboard?.categories.find(
      (c) => c.categoryId === category.id
    );
    const hasBudgets = (categorySummary?.budgets?.length || 0) > 0;
    const singleBudget = hasBudgets ? categorySummary!.budgets[0] : null;
    
    const totalSpentCents = categorySummary?.totalSpentCents || 0;
    const totalBudgetCents = categorySummary?.totalBudgetCents || 0;
    const progress =
totalBudgetCents > 0
        ? Math.min((totalSpentCents / totalBudgetCents) * 100, 100)
        : 0;

    return (
      <div
        key={category.id}
        className={`${styles.card} ${
          category.isActive ? styles.activeCard : styles.inactiveCard
        }`}
      >
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap}>
              {iconMap[category.name] || <Wallet size={18} />}
            </div>
            <div>
              <h3 className={styles.categoryName}>{category.name}</h3>
              <p className={styles.categoryDesc}>
                {category.description || "No description provided"}
              </p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              onClick={() =>
                addingBudgetForCategory === category.id
                  ? handleCancelBudgetForm()
                  : handleAddBudgetToCategory(category.id)
              }
              className={`${styles.iconBtn} ${styles.addBtn}`}
              title="Add Budget"
              disabled={hasBudgets}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() =>
                handleDeleteCategory(category.id, category.name)
              }
              className={`${styles.iconBtn} ${styles.deleteBtn}`}
              title="Delete Category"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Only show category-level spending if NO budget exists */}
        {!hasBudgets && (
          <>
            <p className={styles.statText}>
              Spent: {formatMoney(totalSpentCents, "CAD")} of total monthly spending
            </p>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${styles.green}`}
                style={{ width: `${Math.min((totalSpentCents / (dashboard?.totalSpentCents || 1)) * 100, 100)}%` }}
              />
            </div>
          </>
        )}

        {/* Single budget details + actions (only visible when budget exists) */}
        {singleBudget && (
          <div className={styles.budgetList}>
            <div className={styles.budgetItem}>
              <div className={styles.budgetMeta}>
                {singleBudget.budget.name} – {singleBudget.budget.period.charAt(0) + singleBudget.budget.period.slice(1).toLowerCase().replace(/_/g, ' ')}
              </div>
              <div className={styles.amountRow}>
                <span className={styles.spentAmount}>
                  {formatMoney(totalSpentCents, "CAD")}
                </span>
                <span className={styles.budgetLimit}>
                  / {formatMoney(singleBudget.budget.amountCents, "CAD")}
                </span>
              </div>
              <div className={styles.progressBarSmall}>
                <div
                  className={`${styles.progressFill} ${(() => {
                    const amt = singleBudget.budget.amountCents;
                    const spent = totalSpentCents;
                    const pct = amt > 0 ? (spent / amt) * 100 : 0;
                    return pct >= 100 ? styles.red : pct >= 80 ? styles.yellow : styles.green;
                  })()}`}
                  style={{ width: `${Math.min(
                    singleBudget.budget.amountCents > 0
                      ? (totalSpentCents / singleBudget.budget.amountCents) * 100
                      : 0,
                    100
                  )}%` }}
                />
              </div>
              <div className={styles.statusRow}>
                <div className={`${styles.statusBadge} ${(() => {
                  const amt = singleBudget.budget.amountCents;
                  const spent = totalSpentCents;
                  const pct = amt > 0 ? (spent / amt) * 100 : 0;
                  return pct >= 100 ? styles.danger : pct >= 80 ? styles.warning : styles.safe;
                })()}`}>
                  <span className={styles.statusIndicator}></span>
                  <span>
                    {(() => {
                      const amt = singleBudget.budget.amountCents;
                      const spent = totalSpentCents;
                      const pct = amt > 0 ? (spent / amt) * 100 : 0;
                      return pct >= 100 ? 'Over budget' : pct >= 80 ? 'Watch spending' : 'On track';
                    })()}
                  </span>
                </div>
                <span className={`${styles.remaining} ${totalSpentCents > singleBudget.budget.amountCents ? styles.over : ''}`}>
                  {totalSpentCents > singleBudget.budget.amountCents 
                    ? `${formatMoney(totalSpentCents - singleBudget.budget.amountCents, "CAD")} over`
                    : `${formatMoney(singleBudget.budget.amountCents - totalSpentCents, "CAD")} left`
                  }
                </span>
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => onEditBudget(category.id, singleBudget)}
              >
                Edit Budget
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger || styles.deleteBtn}`}
                onClick={() => {
                  const budgetId = singleBudget.budget?.id;
                  if (!budgetId) {
                    console.error("Budget ID not found:", singleBudget);
                    alert("Error: Budget ID is missing. Please refresh the page.");
                    return;
                  }
                  onDeleteBudget(budgetId);
                }}
              >
                Delete Budget
              </button>
            </div>
          </div>
        )}

        {/* Inline Add Budget */}
        {addingBudgetForCategory === category.id && (
          <form
            onSubmit={handleSubmitBudget}
            className={styles.addBudgetForm}
          >
            <input
              type="number"
              placeholder="Amount (e.g. 1000)"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
              className={styles.input}
            />
            <select
              value={formData.period}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  period: e.target.value as BudgetPeriod,
                })
              }
              className={styles.input}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="Alert threshold (%)"
              value={formData.alertThreshold}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  alertThreshold: e.target.value,
                })
              }
              className={styles.input}
            />
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => handleCancelBudgetForm()}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                {editingBudgetId ? "Update Budget" : "Save Budget"}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <section className={styles.section}>
      {/* Budgeted Categories */}
      {categoriesWithBudgets.length > 0 && (
        <>
          <h2 className={styles.subheading}>
            Budgeted Categories
          </h2>
          <div className={styles.grid}>
            {categoriesWithBudgets.map(renderCategory)}
          </div>
        </>
      )}

      {/* Non-Budgeted Categories */}
      {categoriesWithoutBudgets.length > 0 && (
        <>
          <h2 className={styles.subheading} style={{ marginTop: categoriesWithBudgets.length > 0 ? '40px' : '0' }}>
            Categories Without Budgets
          </h2>
          <div className={styles.grid}>
            {categoriesWithoutBudgets.map(renderCategory)}
          </div>
        </>
      )}

      {categories.length > 12 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={styles.showMoreBtn}
        >
          {showAll ? "Show less" : "Show all categories"}
        </button>
      )}
    </section>
  );
}