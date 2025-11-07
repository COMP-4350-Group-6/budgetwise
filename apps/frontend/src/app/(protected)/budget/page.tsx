"use client";

import React, { useState, useMemo, useEffect } from "react";
import styles from "./budget.module.css";
import { useRouter } from "next/navigation";
import type { BudgetDashboard, Category } from "@/services/budgetService";
import CategorySpendingSection from "@/components/budgets/categorySpending";
import SavingsGoal from "@/components/budgets/savingsGoal";
import { CreateBudgetInput, Currency } from "@budget/schemas";
import type { UpdateBudgetInput } from "@/services/budgetService";
import {
  useDashboard,
  useCategories,
  useAllTransactions,
  useSeedDefaultCategories,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  useDeleteCategory,
  useCreateCategory,
} from "@/hooks/apiQueries";
import {
  Home,
  Building2,
  Car,
  Bus,
  Bike,
  Fuel,
  Heart,
  Pill,
  Activity,
  UtensilsCrossed,
  Coffee,
  ShoppingCart,
  Film,
  Gamepad2,
  Music,
  Plane,
  Palmtree,
  PhoneCall,
  Wifi,
  Tv,
  ShoppingBag,
  Shirt,
  Lightbulb,
  Droplets,
  Zap,
  Wallet,
  DollarSign,
  PiggyBank,
  GraduationCap,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export default function BudgetPage() {
  const router = useRouter();
  
  // ===== Data Loading with React Query =====
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories(true);
  const { data: transactions = [], isLoading: transactionsLoading } = useAllTransactions(90, 500);
  const seedCategoriesMutation = useSeedDefaultCategories();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const deleteCategoryMutation = useDeleteCategory();
  const createCategoryMutation = useCreateCategory();

  const loading = dashboardLoading || categoriesLoading || transactionsLoading;

  // Auto-seed categories if none exist
  useEffect(() => {
    if (!categoriesLoading && categoriesData.length === 0) {
      seedCategoriesMutation.mutate();
    }
  }, [categoriesData.length, categoriesLoading, seedCategoriesMutation]);

  // Process dashboard data with monthly transactions
  const dashboard = useMemo(() => {
    if (!dashboardData) return null;

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

    const updatedCats = dashboardData.categories.map((c) => {
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

    return {
      ...dashboardData,
      categories: updatedCats,
      totalSpentCents,
    };
  }, [dashboardData, transactions]);

  const categories = categoriesData;
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [addingBudgetForCategory, setAddingBudgetForCategory] = useState<
    string | null
  >(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

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
    icon: "Wallet",
    color: "#4E7C66",
    parentId: "",
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  const iconGroups: { category: string; icons: { name: string; Icon: LucideIcon }[] }[] = [
    {
      category: "Housing",
      icons: [
        { name: "Home", Icon: Home },
        { name: "Building2", Icon: Building2 },
      ],
    },
    {
      category: "Transportation",
      icons: [
        { name: "Car", Icon: Car },
        { name: "Bus", Icon: Bus },
        { name: "Bike", Icon: Bike },
        { name: "Fuel", Icon: Fuel },
      ],
    },
    {
      category: "Food & Dining",
      icons: [
        { name: "UtensilsCrossed", Icon: UtensilsCrossed },
        { name: "Coffee", Icon: Coffee },
        { name: "ShoppingCart", Icon: ShoppingCart },
      ],
    },
    {
      category: "Entertainment",
      icons: [
        { name: "Film", Icon: Film },
        { name: "Gamepad2", Icon: Gamepad2 },
        { name: "Music", Icon: Music },
      ],
    },
    {
      category: "Travel",
      icons: [
        { name: "Plane", Icon: Plane },
        { name: "Palmtree", Icon: Palmtree },
      ],
    },
    {
      category: "Healthcare",
      icons: [
        { name: "Heart", Icon: Heart },
        { name: "Pill", Icon: Pill },
        { name: "Activity", Icon: Activity },
      ],
    },
    {
      category: "Utilities",
      icons: [
        { name: "Lightbulb", Icon: Lightbulb },
        { name: "Droplets", Icon: Droplets },
        { name: "Zap", Icon: Zap },
      ],
    },
    {
      category: "Subscriptions",
      icons: [
        { name: "PhoneCall", Icon: PhoneCall },
        { name: "Wifi", Icon: Wifi },
        { name: "Tv", Icon: Tv },
      ],
    },
    {
      category: "Shopping",
      icons: [
        { name: "ShoppingBag", Icon: ShoppingBag },
        { name: "Shirt", Icon: Shirt },
      ],
    },
    {
      category: "Finance",
      icons: [
        { name: "Wallet", Icon: Wallet },
        { name: "DollarSign", Icon: DollarSign },
        { name: "PiggyBank", Icon: PiggyBank },
      ],
    },
    {
      category: "Education",
      icons: [
        { name: "GraduationCap", Icon: GraduationCap },
        { name: "BookOpen", Icon: BookOpen },
      ],
    },
  ];

  const getAllIcons = () => {
    const allIcons: { name: string; Icon: LucideIcon }[] = [];
    iconGroups.forEach(group => {
      allIcons.push(...group.icons);
    });
    return allIcons;
  };

  const getIconComponent = (iconName: string) => {
    const allIcons = getAllIcons();
    const option = allIcons.find(opt => opt.name === iconName);
    return option ? option.Icon : Wallet;
  };

  const SelectedIcon = getIconComponent(categoryFormData.icon);

  const formatMoney = (cents: number, currency = "CAD"): string =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
    }).format(cents / 100);

  const handleAddBudgetToCategory = (categoryId: string) => {
    setEditingBudgetId(null);
    setAddingBudgetForCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    setFormData({
      categoryId,
      name: category ? `${category.name} Budget` : "Budget",
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
        await updateBudgetMutation.mutateAsync({ id: editingBudgetId, updates: updateData });
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
        await createBudgetMutation.mutateAsync(budgetData);
      }
      setAddingBudgetForCategory(null);
      setEditingBudgetId(null);
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
      startDate: budget.budget?.startDate
        ? budget.budget.startDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
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
      await deleteBudgetMutation.mutateAsync(budgetId);
    } catch (err) {
      console.error("Delete budget error:", err);
      alert(
        "Failed to delete budget: " +
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
        `Delete "${categoryName}"? This will fail if it has active budgets.`
      )
    )
      return;
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
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
      await createCategoryMutation.mutateAsync({
        name: categoryFormData.name,
        description: categoryFormData.description || "",
        icon: categoryFormData.icon || "",
        color: categoryFormData.color || "#4E7C66",
        isActive: true,
      });

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
                <label className={styles.formLabel}>Icon</label>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={styles.emojiButton}
                    onClick={() => setShowIconPicker(!showIconPicker)}
                  >
                    <SelectedIcon size={20} />
                    <span style={{ marginLeft: '8px', fontSize: '14px' }}>Choose icon</span>
                  </button>
                  {showIconPicker && (
                    <div className={styles.iconPickerDropdown}>
                      {iconGroups.map((group) => (
                        <div key={group.category} className={styles.iconGroup}>
                          <div className={styles.iconGroupLabel}>{group.category}</div>
                          <div className={styles.iconGroupGrid}>
                            {group.icons.map(({ name, Icon }) => (
                              <button
                                key={name}
                                type="button"
                                className={styles.iconOption}
                                onClick={() => {
                                  setCategoryFormData({
                                    ...categoryFormData,
                                    icon: name,
                                  });
                                  setShowIconPicker(false);
                                }}
                                title={name}
                              >
                                <Icon size={18} />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
