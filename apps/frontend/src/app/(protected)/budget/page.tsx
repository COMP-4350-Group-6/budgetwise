"use client";

import React, { useState, useEffect } from "react";
import styles from "./budget.module.css";
import { budgetService, categoryService } from "@/services/budgetService";
import type { BudgetDashboard, Category } from "@/services/budgetService";
import {
  CreateBudgetInput,
  BudgetPeriod,
  Currency,
} from "@budget/schemas";
import { transactionsService } from "@/services/transactionsService";

export default function BudgetPage() {
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [addingBudgetForCategory, setAddingBudgetForCategory] =
    useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    amount: "",
    currency: "CAD",
    period: "MONTHLY" as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
    startDate: new Date().toISOString().split("T")[0],
    alertThreshold: "80",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#4ECDC4",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const cats = await categoryService.listCategories(true);
      setCategories(cats);

      if (cats.length === 0) {
        const seeded = await categoryService.seedDefaultCategories();
        setCategories(seeded);
      }

      const [dash, transactions] = await Promise.all([
        budgetService.getDashboard(),
        transactionsService.listTransactions(),
      ]);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const currentMonthTransactions = transactions.filter((t) => {
        const d = new Date(t.occurredAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const totalSpentCents = currentMonthTransactions.reduce(
        (sum, t) => sum + t.amountCents,
        0
      );

      // Category-level spending
      const categorySpentMap: Record<string, number> = {};
      for (const t of currentMonthTransactions) {
        if (t.categoryId) {
          categorySpentMap[t.categoryId] =
            (categorySpentMap[t.categoryId] || 0) + t.amountCents;
        }
      }

      // Update category stats dynamically
      const updatedCategories = dash.categories.map((c) => {
        const spent = categorySpentMap[c.categoryId] || 0;
        const remaining = c.totalBudgetCents - spent;
        const percentageUsed =
          c.totalBudgetCents > 0 ? (spent / c.totalBudgetCents) * 100 : 0;
        return {
          ...c,
          totalSpentCents: spent,
          totalRemainingCents: remaining,
          overallPercentageUsed: percentageUsed,
          hasOverBudget: remaining < 0,
        };
      });

      setDashboard({
        ...dash,
        categories: updatedCategories,
        totalSpentCents,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load budget data";
      setError(errorMessage);
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (cents: number, currency = "USD"): string => {
    const amount = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.createCategory({
        name: categoryFormData.name,
        description: categoryFormData.description || undefined,
        icon: categoryFormData.icon || undefined,
        color: categoryFormData.color,
        isActive: true,
      });

      setShowCategoryForm(false);
      setCategoryFormData({
        name: "",
        description: "",
        icon: "",
        color: "#4ECDC4",
      });
      loadDashboard();
    } catch (err) {
      console.error("Category creation error:", err);
      alert(
        "Failed to create category: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleSeedDefaults = async () => {
    try {
      await categoryService.seedDefaultCategories();
      loadDashboard();
    } catch (err) {
      console.error("Seed defaults error:", err);
      alert(
        "Failed to seed default categories: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${categoryName}"? This will fail if the category has active budgets.`
      )
    ) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      loadDashboard();
    } catch (err) {
      console.error("Category deletion error:", err);
      alert(
        "Failed to delete category: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleAddBudgetToCategory = (categoryId: string) => {
    setAddingBudgetForCategory(categoryId);
    setFormData({
      categoryId: categoryId,
      name: "",
      amount: "",
      currency: "CAD",
      period: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      alertThreshold: "80",
    });
  };

  const handleCancelBudgetForm = () => {
    setAddingBudgetForCategory(null);
    setFormData({
      categoryId: "",
      name: "",
      amount: "",
      currency: "CAD",
      period: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      alertThreshold: "80",
    });
  };

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetData: CreateBudgetInput = {
        categoryId: formData.categoryId,
        name: formData.name,
        amountCents: Math.round(parseFloat(formData.amount) * 100),
        currency: formData.currency as Currency,
        period: formData.period,
        startDate: new Date(formData.startDate),
        alertThreshold: parseInt(formData.alertThreshold),
      };

      await budgetService.createBudget(budgetData);
      handleCancelBudgetForm();
      loadDashboard();
    } catch (err) {
      console.error("Budget creation error:", err);
      alert(
        "Failed to create budget: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading budget data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full h-full bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <button
            onClick={loadDashboard}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <h1 className={styles.heading}>Budget</h1>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Budget Overview</h2>

        <div className={styles.grid}>
          {/* --- Monthly Income (commented out) ---
          <div className={styles.card}>
            <h3 className={styles.label}>Monthly Income</h3>
            <p className={styles.amount}>--</p>
            <ul className={styles.list}>
              <li>No income sources added yet</li>
            </ul>
            <div className={styles.inputRow}>
              <input
                type="number"
                placeholder="Amount"
                className={styles.input}
              />
              <button className={styles.primaryBtn}>Add Income</button>
            </div>
          </div>
          */}

          <div className={styles.progressCard}>
            <div>
              <h3 className={styles.label}>Budget Adherence</h3>
              <p className={styles.amount}>
                {dashboard
                  ? formatMoney(dashboard.totalSpentCents, "CAD")
                  : "--"}
              </p>
              <p className={styles.description}>
                Spent out of{" "}
                {dashboard
                  ? formatMoney(dashboard.totalBudgetCents, "CAD")
                  : "--"}{" "}
                total budget (this month).
              </p>
            </div>

            <div className={styles.progressBar}>
              {dashboard ? (
                <div
                  className={`h-2 rounded-full transition-all ${
                    dashboard.totalBudgetCents > 0 &&
                    dashboard.totalSpentCents / dashboard.totalBudgetCents >= 0.8
                      ? "bg-yellow-500"
                      : dashboard.totalSpentCents >
                        dashboard.totalBudgetCents
                      ? "bg-red-600"
                      : "bg-green-600"
                  }`}
                  style={{
                    width:
                      dashboard.totalBudgetCents > 0
                        ? `${Math.min(
                            (dashboard.totalSpentCents /
                              dashboard.totalBudgetCents) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              ) : (
                <div className="h-2 bg-gray-200 rounded-full w-full" />
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {dashboard?.totalSpentCents
                ? "Tracking current month's spending"
                : "No spending yet this month"}
            </p>

            <button className={styles.linkBtn}>View Insights →</button>
          </div>

          {/* --- Actions --- */}
          <div className={styles.actionsCol}>
            <div className={styles.card}>
              <h4 className={styles.actionTitle}>New Spending Category</h4>
              <p className={styles.actionText}>
                Create a new expense category.
              </p>
              {!showCategoryForm ? (
                <>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className={styles.primaryBtn}
                  >
                    Add Category
                  </button>
                  <button
                    onClick={handleSeedDefaults}
                    className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-1.5 px-3 rounded transition-colors"
                  >
                    Add Default Categories
                  </button>
                </>
              ) : (
                <form onSubmit={handleCreateCategory} className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Category Name (A-Z only)"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        name: e.target.value,
                      })
                    }
                    className={styles.input}
                    required
                    pattern="[a-zA-Z\s]+"
                    title="Category name can only contain letters A-Z and spaces"
                  />
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={categoryFormData.icon}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        icon: e.target.value,
                      })
                    }
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        description: e.target.value,
                      })
                    }
                    className={styles.input}
                  />
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        color: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className={styles.primaryBtn}>
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      className={styles.secondaryBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className={styles.card}>
              <h4 className={styles.actionTitle}>Create New Savings Goal</h4>
              <p className={styles.actionText}>
                Plan for future goals or purchases.
              </p>
              <button className={styles.secondaryBtn}>Set Goal</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Category Spending Limits --- */}
      <section className={styles.section}>
        <h2 className={styles.subheading}>Category Spending Limits (This Month)</h2>
        {categories.length === 0 ? (
          <div className={styles.emptyText}>
            No spending categories available yet.
          </div>
        ) : (
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
                            {formatMoney(
                              categorySummary.totalBudgetCents,
                              "CAD"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Spent:</span>
                          <span className="font-semibold">
                            {formatMoney(
                              categorySummary.totalSpentCents,
                              "CAD"
                            )}
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
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.subheading}>Savings Goals</h2>
        <div className={styles.emptyText}>
          No savings goals have been created yet.
        </div>
      </section>
    </div>
  );
}
