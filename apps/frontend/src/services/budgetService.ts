import { apiFetch } from "../lib/apiClient";
import type { CreateBudgetInput, UpdateBudgetInput } from "@budget/schemas";

// Types
export interface Category {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  amountCents: number;
  currency: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  alertThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStatus {
  budget: Budget;
  spentCents: number;
  remainingCents: number;
  percentageUsed: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
  transactionCount: number;
}

export interface CategoryBudgetSummary {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  budgets: BudgetStatus[];
  totalBudgetCents: number;
  totalSpentCents: number;
  totalRemainingCents: number;
  overallPercentageUsed: number;
  hasOverBudget: boolean;
}

export interface BudgetDashboard {
  categories: CategoryBudgetSummary[];
  totalBudgetCents: number;
  totalSpentCents: number;
  overBudgetCount: number;
  alertCount: number;

  // new field . frontend only for now
  savingsGoals?: {
    id: string;
    name: string;
    targetCents: number;
    savedCents: number;
  }[];
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

// Re-export schema types for convenience
export type { CreateBudgetInput, UpdateBudgetInput } from "@budget/schemas";

// Category API Functions
export const categoryService = {
  async listCategories(activeOnly = false): Promise<Category[]> {
    const query = activeOnly ? '?active=true' : '';
    const response = await apiFetch<{ categories: Category[] }>(
      `/categories${query}`,
      {},
      true
    );
    return response.categories;
  },

  async seedDefaultCategories(): Promise<Category[]> {
    const response = await apiFetch<{ categories: Category[]; message: string }>(
      '/categories/seed',
      { method: 'POST' },
      true
    );
    return response.categories;
  },

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const response = await apiFetch<{ category: Category }>(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      true
    );
    return response.category;
  },

  async updateCategory(id: string, updates: UpdateCategoryInput): Promise<Category> {
    const response = await apiFetch<{ category: Category }>(
      `/categories/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      true
    );
    return response.category;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiFetch<{ message: string }>(
      `/categories/${id}`,
      { method: 'DELETE' },
      true
    );
  },
};

// Budget API Functions
export const budgetService = {
  async getDashboard(): Promise<BudgetDashboard> {
    const response = await apiFetch<{ dashboard: BudgetDashboard }>(
      '/budgets/dashboard',
      {},
      true
    );
    return response.dashboard;
  },

  async getBudgetStatus(id: string): Promise<BudgetStatus> {
    const response = await apiFetch<{ status: BudgetStatus }>(
      `/budgets/${id}/status`,
      {},
      true
    );
    return response.status;
  },

  async listBudgets(activeOnly = false): Promise<Budget[]> {
    const query = activeOnly ? '?active=true' : '';
    const response = await apiFetch<{ budgets: Budget[] }>(
      `/budgets${query}`,
      {},
      true
    );
    return response.budgets;
  },

  async createBudget(input: CreateBudgetInput): Promise<Budget> {
    const response = await apiFetch<{ budget: Budget }>(
      '/budgets',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      true
    );
    return response.budget;
  },

  async updateBudget(id: string, updates: UpdateBudgetInput): Promise<Budget> {
    const response = await apiFetch<{ budget: Budget }>(
      `/budgets/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      },
      true
    );
    return response.budget;
  },

  async deleteBudget(id: string): Promise<void> {
    await apiFetch<{ message: string }>(
      `/budgets/${id}`,
      { method: 'DELETE' },
      true
    );
  },
};