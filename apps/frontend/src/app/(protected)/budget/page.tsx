"use client";

import React, { useState, useEffect } from "react";
import styles from "./budget.module.css";
import { budgetService, categoryService } from "@/services/budgetService";
import type { BudgetDashboard, Category } from "@/services/budgetService";
import CategorySpendingSection from "@/components/budgets/categorySpending";
import { CreateBudgetInput, Currency } from "@budget/schemas";
import { transactionsService } from "@/services/transactionsService";
import SavingsGoalsSection from "@/components/budgets/savingsGoals";


export default function BudgetPage() {
  const [dashboard, setDashboard] = useState<BudgetDashboard | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [addingBudgetForCategory, setAddingBudgetForCategory] = useState<string | null>(null);
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
      const cats = await categoryService.listCategories(true);
      setCategories(cats.length ? cats : await categoryService.seedDefaultCategories());

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

      const totalSpentCents = monthlyTx.reduce((sum, t) => sum + t.amountCents, 0);

      const categorySpentMap: Record<string, number> = {};
      for (const t of monthlyTx) {
        if (t.categoryId) {
          categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amountCents;
        }
      }

      const updatedCats = dash.categories.map((c) => {
        const spent = categorySpentMap[c.categoryId] || 0;
        const remaining = c.totalBudgetCents - spent;
        const percent = c.totalBudgetCents > 0 ? (spent / c.totalBudgetCents) * 100 : 0;
        return { ...c, totalSpentCents: spent, totalRemainingCents: remaining, overallPercentageUsed: percent, hasOverBudget: remaining < 0 };
      });

      setDashboard({ ...dash, categories: updatedCats, totalSpentCents });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load budget data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (cents: number, currency = "USD"): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

  // === Handlers ===
  const handleAddBudgetToCategory = (categoryId: string) => {
    setAddingBudgetForCategory(categoryId);
    setFormData({
      categoryId,
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
      alert("Failed to create budget: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Delete "${categoryName}"? This will fail if it has active budgets.`)) return;
    try {
      await categoryService.deleteCategory(categoryId);
      loadDashboard();
    } catch (err) {
      alert("Failed to delete category: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleSeedDefaults = async () => {
    await categoryService.seedDefaultCategories();
    loadDashboard();
  };

  // === UI Rendering ===
  if (loading) return <div className={styles.loading}>Loading budget data...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Budget</h1>

      <section className={styles.section}>

        <div className={styles.unifiedCard}>
          <div className={styles.topSection}>
            <h3 className={styles.label}>Budget Adherence</h3>
            <p className={styles.amount}>
              {dashboard ? formatMoney(dashboard.totalSpentCents, "CAD") : "--"}
            </p>
            <p className={styles.description}>
              Spent out of{" "}
              {dashboard ? formatMoney(dashboard.totalBudgetCents, "CAD") : "--"} total budget (this month).
            </p>

            <div className={styles.progressBar}>
              {dashboard ? (
                <div
                  className={styles.progressFill}
                  style={{
                    width:
                      dashboard.totalBudgetCents > 0
                        ? `${Math.min((dashboard.totalSpentCents / dashboard.totalBudgetCents) * 100, 100)}%`
                        : "0%",
                  }}
                />
              ) : (
                <div className={styles.progressPlaceholder} />
              )}
            </div>

            <p className={styles.note}>
              {dashboard?.totalSpentCents
                ? "Tracking current month's spending"
                : "No spending yet this month"}
            </p>

            <button className={styles.linkBtn}>View Insights →</button>
          </div>

          <div className={styles.bottomActions}>
            <div className={styles.actionBox}>
              <h4 className={styles.actionTitle}>New Spending Category</h4>
              <p className={styles.actionText}>Create a new expense category.</p>
              <button onClick={() => setShowCategoryForm(true)} className={styles.primaryBtn}>
                Add Category
              </button>
              <button onClick={handleSeedDefaults} className={`${styles.primaryBtn} ${styles.gradientAlt}`}>
                Add Default Categories
              </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.actionBox}>
              <h4 className={styles.actionTitle}>Create New Savings Goal</h4>
              <p className={styles.actionText}>Plan for future goals or purchases.</p>
              <button className={styles.secondaryBtn}>Set Goal</button>
            </div>
          </div>
        </div>
      </section>

      <CategorySpendingSection
        categories={categories}
        dashboard={dashboard}
        addingBudgetForCategory={addingBudgetForCategory}
        formData={formData}
        setFormData={setFormData}
        handleSubmitBudget={handleSubmitBudget}
        handleAddBudgetToCategory={handleAddBudgetToCategory}
        handleDeleteCategory={handleDeleteCategory}
        handleCancelBudgetForm={handleCancelBudgetForm}
        formatMoney={formatMoney}
      />
      
      <SavingsGoalsSection
        goals={dashboard?.savingsGoals || []}
        formatMoney={formatMoney}
      />
    </div>
  );
}
