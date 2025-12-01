/**
 * Dependency wiring for the API.
 * 
 * This module maps the composition container's usecases to the explicit
 * AppDeps interface that routes expect. The API layer only uses usecases,
 * never repos directly.
 */

import type { makeContainer } from "@budget/composition-cloudflare-worker";
import type { AppDeps } from "./types";

/**
 * Maps the container usecases to explicit AppDeps.
 * Routes receive only the specific functions they need.
 */
export function createAppDeps(container: ReturnType<typeof makeContainer>): AppDeps {
  const { usecases } = container;

  return {
    transactions: {
      addTransaction: usecases.addTransaction,
      updateTransaction: usecases.updateTransaction,
      deleteTransaction: usecases.deleteTransaction,
      listTransactions: usecases.listTransactions,
      getTransaction: usecases.getTransaction,
      bulkImportTransactions: usecases.bulkImportTransactions,
      categorizeTransaction: usecases.categorizeTransaction,
      parseInvoice: usecases.parseInvoice,
    },
    categories: {
      createCategory: usecases.createCategory,
      listCategories: usecases.listCategories,
      updateCategory: usecases.updateCategory,
      deleteCategory: usecases.deleteCategory,
      seedDefaultCategories: usecases.seedDefaultCategories,
      getCategory: usecases.getCategory,
    },
    budgets: {
      createBudget: usecases.createBudget,
      listBudgets: usecases.listBudgets,
      updateBudget: usecases.updateBudget,
      deleteBudget: usecases.deleteBudget,
      getBudgetStatus: usecases.getBudgetStatus,
      getBudgetDashboard: usecases.getBudgetDashboard,
      getCategory: usecases.getCategory,
    },
  };
}
