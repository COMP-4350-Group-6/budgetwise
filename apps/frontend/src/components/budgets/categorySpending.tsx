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

interface Props {
  categories: Category[];
  dashboard: BudgetDashboard | null;
  addingBudgetForCategory: string | null;
  formData: {
    categoryId: string;
    amount: string;
    currency: string;
    period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    startDate: string;
    alertThreshold: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      categoryId: string;
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
  formData,
  setFormData,
  handleSubmitBudget,
  handleAddBudgetToCategory,
  handleDeleteCategory,
  handleCancelBudgetForm,
  formatMoney,
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

  // sort: categories with budgets first, then by newest
  const sorted = [...categories].sort((a, b) => {
    const aHasBudget = dashboard?.categories.some(
      (c) => c.categoryId === a.id && c.budgets.length > 0
    );
    const bHasBudget = dashboard?.categories.some(
      (c) => c.categoryId === b.id && c.budgets.length > 0
    );
    if (aHasBudget && !bHasBudget) return -1;
    if (!aHasBudget && bHasBudget) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayed = showAll ? sorted : sorted.slice(0, 6);

  return (
    <section className={styles.section}>
      <h2 className={styles.subheading}>
        Category Spending Limits (This Month)
      </h2>

      <div className={styles.grid}>
        {displayed.map((category) => {
          const summary = dashboard?.categories.find(
            (c) => c.categoryId === category.id
          );
          const hasBudget = !!summary?.budgets?.length;
          const budget = hasBudget ? summary!.budgets[0] : null;

          const amountCents = budget?.budget?.amountCents || 0;
          const spentCents = budget?.spentCents || 0;
          const remainingCents = amountCents - spentCents;
          const progress =
            amountCents > 0
              ? Math.min((spentCents / amountCents) * 100, 100)
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

              {/* Show if no budget */}
              {!hasBudget && addingBudgetForCategory !== category.id && (
                <p className={styles.noBudgetText}>
                  No budget set up for this category yet.
                </p>
              )}

              {/* Show if budget exists */}
              {hasBudget && (
                <>
                  <div className={styles.budgetDetails}>
                    <div className={styles.budgetRow}>
                      <span>Budgeted</span>
                      <strong>{formatMoney(amountCents, "CAD")}</strong>
                    </div>
                    <div className={styles.budgetRow}>
                      <span>Spent</span>
                      <strong>{formatMoney(spentCents, "CAD")}</strong>
                    </div>
                    <div className={styles.budgetRow}>
                      <span>Remaining</span>
                      <strong
                        className={
                          remainingCents < 0 ? styles.redText : styles.greenText
                        }
                      >
                        {formatMoney(remainingCents, "CAD")}
                      </strong>
                    </div>

                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${
                          progress >= 100
                            ? styles.red
                            : progress >= 80
                            ? styles.yellow
                            : styles.green
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </>
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
                      onClick={handleCancelBudgetForm}
                      className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                      Save Budget
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {categories.length > 6 && (
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
