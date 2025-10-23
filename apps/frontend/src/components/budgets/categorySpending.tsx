"use client";

import React from "react";
import styles from "./categorySpending.module.css";
import type { Category, BudgetDashboard } from "@/services/budgetService";
import type { BudgetPeriod } from "@budget/schemas";

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
  // Empty State
  if (categories.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.subheading}>Category Spending Limits (This Month)</h2>

        <div className={styles.emptyContainer}>
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>No Categories Yet</h3>
            <p className={styles.emptySubtitle}>
              Click{" "}
              <span className={styles.highlight}>
                “Add Default Categories”
              </span>{" "}
              above to get started.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Normal Category Grid
  return (
    <section className={styles.section}>
      <h2 className={styles.subheading}>Category Spending Limits (This Month)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const categorySummary = dashboard?.categories.find(
            (c) => c.categoryId === category.id
          );

          return (
            <div key={category.id} className={styles.card}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleAddBudgetToCategory(category.id)}
                    className="text-blue-500 hover:text-blue-700 text-lg px-2 py-1 rounded hover:bg-blue-50"
                    title="Add budget to this category"
                  >
                    ➕
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteCategory(category.id, category.name)
                    }
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                    title="Delete category"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {category.description}
                </p>
              )}

              {/* Budget Form */}
              {addingBudgetForCategory === category.id ? (
                <form
                  onSubmit={handleSubmitBudget}
                  className="mt-4 space-y-3 border-t pt-3"
                >
                  <input
                    type="text"
                    placeholder="Budget Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={styles.input}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className={styles.input}
                    required
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
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate: e.target.value,
                      })
                    }
                    className={styles.input}
                    required
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Alert Threshold (%)"
                    value={formData.alertThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        alertThreshold: e.target.value,
                      })
                    }
                    className={styles.input}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className={styles.primaryBtn}>
                      Create Budget
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelBudgetForm}
                      className={styles.secondaryBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : categorySummary ? (
                <>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Budgeted:</span>
                      <span className="font-semibold">
                        {formatMoney(categorySummary.totalBudgetCents, "CAD")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spent:</span>
                      <span className="font-semibold">
                        {formatMoney(categorySummary.totalSpentCents, "CAD")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining:</span>
                      <span
                        className={`font-semibold ${
                          categorySummary.totalRemainingCents < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatMoney(
                          categorySummary.totalRemainingCents,
                          "CAD"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        categorySummary.hasOverBudget
                          ? "bg-red-600"
                          : categorySummary.overallPercentageUsed >= 80
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          categorySummary.overallPercentageUsed,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {categorySummary.budgets.length} budget(s) •{" "}
                    {categorySummary.overallPercentageUsed.toFixed(1)}% used
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  No budgets in this category yet
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
