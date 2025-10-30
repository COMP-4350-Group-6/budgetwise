"use client";

import React, { useState, JSX } from "react";
import styles from "./categorySpending.module.css";
import type { Category, BudgetDashboard } from "@/services/budgetService";
import type { BudgetPeriod } from "@budget/schemas";
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
  ChevronDown,
  ChevronUp,
  Wallet,
} from "lucide-react";

interface Props {
  categories: Category[];
  dashboard: BudgetDashboard | null;
  addingBudgetForCategory: string | null;
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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [subcategories, setSubcategories] = useState<Record<string, string[]>>({});
  const [showAll, setShowAll] = useState(false);

  if (!categories || categories.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.subheading}>Category Spending Limits (This Month)</h2>
        <div className={styles.emptyState}>No categories available yet.</div>
      </section>
    );
  }

  const displayedCategories = showAll ? categories : categories.slice(0, 6);

  const handleAddSubcategory = (categoryId: string) => {
    if (!subcategoryInput.trim()) return;
    setSubcategories((prev) => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), subcategoryInput.trim()],
    }));
    setSubcategoryInput("");
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.subheading}>Category Spending Limits (This Month)</h2>

      <div className={styles.grid}>
        {displayedCategories.map((category) => {
          const categorySummary = dashboard?.categories.find(
            (c) => c.categoryId === category.id
          );
          const hasBudgets = categorySummary?.budgets?.length;
          const progress =
            categorySummary && categorySummary.totalBudgetCents > 0
              ? (categorySummary.totalSpentCents /
                  categorySummary.totalBudgetCents) *
                100
              : 0;

          const isExpanded = expanded === category.id;

          return (
            <div
              key={category.id}
              className={`${styles.card} ${
                category.isActive ? styles.activeCard : styles.inactiveCard
              }`}
            >
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
                      setExpanded((prev) =>
                        prev === category.id ? null : category.id
                      )
                    }
                    className={styles.iconBtn}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
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

              <p className={styles.statText}>
                Spent: {formatMoney(categorySummary?.totalSpentCents || 0, "CAD")} /{" "}
                {formatMoney(categorySummary?.totalBudgetCents || 0, "CAD")}
              </p>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${
                    progress >= 100
                      ? styles.red
                      : progress >= 80
                      ? styles.yellow
                      : styles.green
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* Expandable budgets */}
              {isExpanded && hasBudgets && (
                <div className={styles.budgetList}>
                  {categorySummary!.budgets.map((b) => {
                    const amt = b.budget.amountCents;
                    const spent = b.spentCents;
                    const pct = amt > 0 ? (spent / amt) * 100 : 0;
                    return (
                      <div key={b.budget.id} className={styles.budgetItem}>
                        <div className={styles.budgetMeta}>
                          <strong>{b.budget.name}</strong> – {b.budget.period}
                        </div>
                        <div className={styles.budgetAmounts}>
                          {formatMoney(spent, "CAD")} / {formatMoney(amt, "CAD")}
                        </div>
                        <div className={styles.progressBarSmall}>
                          <div
                            className={`${styles.progressFill} ${
                              pct >= 100
                                ? styles.red
                                : pct >= 80
                                ? styles.yellow
                                : styles.green
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Budget Form */}
              {addingBudgetForCategory === category.id && (
                <form onSubmit={handleSubmitBudget} className={styles.addBudgetForm}>
                  <input
                    type="text"
                    placeholder="Budget name (e.g. Rent)"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className={styles.input}
                  />
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

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => {
                        handleCancelBudgetForm();
                        setExpanded(null);
                      }}
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

              {/* Subcategory input */}
              {isExpanded && (
                <div className={styles.subcategoryForm}>
                  <input
                    type="text"
                    placeholder="Add subcategory (e.g. Rent)"
                    value={subcategoryInput}
                    onChange={(e) => setSubcategoryInput(e.target.value)}
                    className={styles.input}
                  />
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => {
                        setSubcategoryInput("");
                        setExpanded(null);
                      }}
                      className={`${styles.btn} ${styles.btnSecondary}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddSubcategory(category.id)}
                      className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                      Add Subcategory
                    </button>
                  </div>

                  {subcategories[category.id]?.length ? (
                    <ul className={styles.subcategoryList}>
                      {subcategories[category.id].map((sub, idx) => (
                        <li
                          key={`sub-${category.id}-${idx}`}
                          className={`${styles.subcategoryItem} ${
                            formData.name === sub
                              ? styles.activeSubcategory
                              : ""
                          }`}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              categoryId: category.id,
                              name: sub,
                            })
                          }
                        >
                          {sub}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
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