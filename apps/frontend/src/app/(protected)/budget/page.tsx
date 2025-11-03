"use client";

import React, { useState, useEffect } from "react";
import styles from "./budget.module.css";
import { useRouter } from "next/navigation";
import { budgetService, categoryService } from "@/services/budgetService";
import type { BudgetDashboard, Category } from "@/services/budgetService";
import CategorySpendingSection from "@/components/budgets/categorySpending";
import SavingsGoal from "@/components/budgets/savingsGoal";
import { CreateBudgetInput, Currency } from "@budget/schemas";
import { transactionsService } from "@/services/transactionsService";
import type { UpdateBudgetInput } from "@/services/budgetService";

export default function BudgetPage() {
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [addingBudgetForCategory, setAddingBudgetForCategory] = useState<
    string | null
  >(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    categoryId: "",
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
    color: "#4E7C66",
    parentId: "",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Auto seed default categories if none exist
      let cats = await categoryService.listCategories(true);
      if (cats.length === 0) {
        await categoryService.seedDefaultCategories();
        cats = await categoryService.listCategories(true);
      }
      setCategories(cats);

      const [dash, transactions] = await Promise.all([
        budgetService.getDashboard(),
        transactionsService.listTransactions(),
      ]);
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      const monthlyTx = transactions.filter((t) => {
        const d = new Date(t.occurredAt);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      const totalSpentCents = monthlyTx.reduce(
        (sum, t) => sum + t.amountCents,
        0
      );

      const categorySpentMap: Record<string, number> = {};
      for (const t of monthlyTx) {
        const catId = t.categoryId;
        if (!catId) continue;
        categorySpentMap[catId] =
          (categorySpentMap[catId] || 0) + t.amountCents;
      }

      const updatedCats = dash.categories.map((c) => {
        const catKey = c.categoryId;
        const spent = categorySpentMap[catKey] || 0;

        const remaining = Math.max(c.totalBudgetCents - spent, 0);
        const percent =
          c.totalBudgetCents > 0 ? (spent / c.totalBudgetCents) * 100 : 0;

        return {
          ...c,
          totalSpentCents: spent,
          totalRemainingCents: remaining,
          overallPercentageUsed: percent,
          hasOverBudget: remaining < 0,
        };
      });

      setDashboard({
        ...dash,
        categories: updatedCats,
        totalSpentCents,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load budget data"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (cents: number, currency = "CAD"): string =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
    }).format(cents / 100);

  const handleAddBudgetToCategory = (categoryId: string) => {
    setEditingBudgetId(null);
    setAddingBudgetForCategory(categoryId);
    setFormData({
      categoryId,
      amount: "",
      currency: "CAD",
      period: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      alertThreshold: "",
    });
  };

  const handleCancelBudgetForm = () => {
    setAddingBudgetForCategory(null);
    setEditingBudgetId(null);
  };

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
<<<<<<< HEAD
      const cat = categories.find((c) => c.id === formData.categoryId);
      const hiddenName = cat ? `${cat.name} Budget` : "Budget"; // not shown to users

      const budgetData: CreateBudgetInput = {
        categoryId: formData.categoryId,
        name: hiddenName,
        amountCents: Math.round(parseFloat(formData.amount || "0") * 100),
        currency: formData.currency as Currency,
        period: formData.period,
        startDate: new Date(formData.startDate),
        ...(isNaN(alertThresholdValue) ? { alertThreshold: null } : { alertThreshold: alertThresholdValue }),
      };

      await budgetService.createBudget(budgetData);

      setAddingBudgetForCategory(null);
      setFormData({
        categoryId: "",
        amount: "",
        currency: "CAD",
        period: "MONTHLY",
        startDate: new Date().toISOString().split("T")[0],
        alertThreshold: "80",
      });

      await loadDashboard();
    } catch (err) {
      console.error("Budget creation failed:", err);
      alert("Failed to create budget. Please try again.");
=======
      if (editingBudgetId) {
        // Update budget - send only changed fields
        const updateData: UpdateBudgetInput = {
          name: formData.name,
          amountCents: Math.round(parseFloat(formData.amount) * 100),
          currency: formData.currency as Currency,
          period: formData.period,
          startDate: new Date(formData.startDate),
          alertThreshold: parseInt(formData.alertThreshold),
        };
        await budgetService.updateBudget(editingBudgetId, updateData);
      } else {
        // Create budget - send all required fields
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
      }
      setAddingBudgetForCategory(null);
      setEditingBudgetId(null);
      await loadDashboard();
    } catch (err) {
      alert(
        `Failed to ${editingBudgetId ? "update" : "create"} budget: ` +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleEditBudget = (
    categoryId: string,
    budget: BudgetDashboard["categories"][number]["budgets"][number]
  ) => {
    setEditingBudgetId(budget.budget.id);
    setAddingBudgetForCategory(categoryId);
    setFormData({
      categoryId,
      name: budget.budget.name,
      amount: String(budget.budget.amountCents / 100),
      currency: budget.budget.currency,
      period: budget.budget.period,
      startDate: budget.budget.startDate.split("T")[0],
      alertThreshold: String(budget.budget.alertThreshold ?? 80),
    });
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!budgetId) {
      console.error("Delete budget called with no ID");
      alert("Error: Budget ID is missing.");
      return;
    }
    if (!confirm("Delete this budget? This cannot be undone.")) return;
    try {
      await budgetService.deleteBudget(budgetId);
      await loadDashboard();
    } catch (err) {
      console.error("Delete budget error:", err);
      alert(
        "Failed to delete budget: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
>>>>>>> origin/front/csv-upload
    }
  };

  const handleDeleteCategory = async (
    categoryId: string,
    categoryName: string
  ) => {
    if (
      !confirm(
        `Delete "${categoryName}"? This will fail if it has active budgets.`
      )
    )
      return;
    try {
      await categoryService.deleteCategory(categoryId);
      loadDashboard();
    } catch (err) {
      alert(
        "Failed to delete category: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCategory = await categoryService.createCategory({
        name: categoryFormData.name,
        description: categoryFormData.description || "",
        icon: categoryFormData.icon || "",
        color: categoryFormData.color || "#4E7C66",
        isActive: true,
      });

      setCategories((prev) => [newCategory, ...prev]); // add to top
      setShowCategoryForm(false);
      setCategoryFormData({
        name: "",
        description: "",
        icon: "",
        color: "#4E7C66",
        parentId: "",
      });
    } catch (err) {
      console.error("Failed to create category:", err);
      alert("Error creating category. Please try again.");
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading budget data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Budget Overview</h1>

      {/* ===== SUMMARY BLOCK ===== */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>This Month’s Spending</h2>
        <p className={styles.amount}>
          {dashboard ? formatMoney(dashboard.totalSpentCents, "CAD") : "--"}
        </p>
        <p className={styles.subtext}>
          Spent out of{" "}
          {dashboard ? formatMoney(dashboard.totalBudgetCents, "CAD") : "--"}{" "}
          total
        </p>

        <div className={styles.progressBar}>
          {dashboard ? (
            <div
              className={styles.progressFill}
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
            <div className={styles.progressPlaceholder} />
          )}
        </div>
        <p className={styles.note}>
          {dashboard?.totalSpentCents
            ? "Tracking current month’s spending"
            : "No spending yet this month"}
        </p>
      </section>

      {/* ===== SAVINGS Goal SECTION ===== */}
      <section className={styles.card}>
        <SavingsGoal />
      </section>

      {/* ===== CATEGORY MANAGEMENT ===== */}
      <section className={styles.card}>
        <div className={styles.actionRow}>
          <div>
            <h3 className={styles.actionTitle}>Manage Categories</h3>
            <p className={styles.actionText}>
              Add and manage budget categories for tracking spending.
            </p>
          </div>
          <div className={styles.actionButtons}>
            <button
              onClick={() => setShowCategoryForm(true)}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Add Category
            </button>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY SPENDING SECTION ===== */}
      <section className={styles.card}>
        <CategorySpendingSection
          categories={categories}
          dashboard={dashboard}
          addingBudgetForCategory={addingBudgetForCategory}
          editingBudgetId={editingBudgetId}
          formData={formData}
          setFormData={setFormData}
          handleSubmitBudget={handleSubmitBudget}
          handleAddBudgetToCategory={handleAddBudgetToCategory}
          handleDeleteCategory={handleDeleteCategory}
          handleCancelBudgetForm={handleCancelBudgetForm}
          formatMoney={formatMoney}
          onEditBudget={handleEditBudget}
          onDeleteBudget={handleDeleteBudget}
        />
      </section>

      {/* ===== ADD CATEGORY MODAL ===== */}
      {showCategoryForm && (
        <div
          className={styles.modal}
          onClick={() => setShowCategoryForm(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Category</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowCategoryForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Groceries"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Color</label>
                <input
                  type="color"
                  className={styles.formInput}
                  value={categoryFormData.color}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      color: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setShowCategoryForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
