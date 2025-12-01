/**
 * Dependency interfaces for API routes.
 * 
 * This file defines ONLY the function signatures that routes need injected.
 * DTOs and data types should be imported directly from @budget/schemas.
 * 
 * Why this file exists:
 * - Routes need explicit interfaces for their dependencies (testability, clarity)
 * - These interfaces are API-layer specific (not part of usecases package)
 * - deps.ts wires actual usecases to these interfaces
 */

import type {
  TransactionDTO,
  CategoryDTO,
  BudgetDTO,
  BudgetStatus,
  BudgetDashboard,
  CategorizationResult,
  ParsedInvoice,
  Currency,
  BudgetPeriod,
} from "@budget/schemas";

// ============================================================================
// Transaction Route Dependencies
// ============================================================================

export interface TransactionDeps {
  addTransaction: (input: {
    userId: string;
    budgetId?: string;
    categoryId?: string;
    amountCents: number;
    note?: string;
    occurredAt: Date;
  }) => Promise<TransactionDTO>;
  
  updateTransaction: (input: {
    transactionId: string;
    userId: string;
    budgetId?: string;
    categoryId?: string;
    amountCents?: number;
    note?: string;
    occurredAt?: Date;
  }) => Promise<TransactionDTO | null>;
  
  deleteTransaction: (input: {
    transactionId: string;
    userId: string;
  }) => Promise<boolean>;
  
  listTransactions: (params: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    days?: number;
    limit?: number;
  }) => Promise<TransactionDTO[]>;
  getTransaction: (id: string) => Promise<TransactionDTO | null>;
  
  bulkImportTransactions: (input: {
    userId: string;
    transactions: Array<{
      budgetId?: string;
      categoryId?: string;
      amountCents: number;
      note?: string;
      occurredAt: Date;
    }>;
    autoCategorize?: (transactionId: string, userId: string) => Promise<{ categoryId: string } | null>;
  }) => Promise<{
    imported: number;
    failed: number;
    total: number;
    success: TransactionDTO[];
    errors: Array<{ index: number; error: string; data: unknown }>;
  }>;
  
  // Optional AI features
  categorizeTransaction?: (input: { transactionId: string; userId: string }) => Promise<CategorizationResult | null>;
  parseInvoice?: (input: { userId: string; imageBase64: string }) => Promise<ParsedInvoice | null>;
}

// ============================================================================
// Category Route Dependencies
// ============================================================================

export interface CategoryDeps {
  createCategory: (input: {
    userId: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
  }) => Promise<CategoryDTO>;
  
  listCategories: (userId: string, activeOnly?: boolean) => Promise<CategoryDTO[]>;
  
  updateCategory: (id: string, userId: string, updates: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
  }) => Promise<CategoryDTO>;
  
  deleteCategory: (id: string, userId: string) => Promise<void>;
  seedDefaultCategories: (userId: string) => Promise<{
    categories: CategoryDTO[];
    created: number;
    message: string;
  }>;
  getCategory: (id: string) => Promise<CategoryDTO | null>;
}

// ============================================================================
// Budget Route Dependencies
// ============================================================================

export interface BudgetDeps {
  createBudget: (input: {
    userId: string;
    categoryId: string;
    name: string;
    amountCents: number;
    currency: Currency;
    period: BudgetPeriod;
    startDate: Date;
    endDate?: Date;
    alertThreshold?: number;
    isActive?: boolean;
  }) => Promise<BudgetDTO>;
  
  listBudgets: (userId: string, activeOnly?: boolean) => Promise<BudgetDTO[]>;
  
  updateBudget: (id: string, userId: string, updates: {
    categoryId?: string;
    name?: string;
    amountCents?: number;
    currency?: Currency;
    period?: BudgetPeriod;
    startDate?: Date;
    endDate?: Date;
    alertThreshold?: number;
    isActive?: boolean;
  }) => Promise<BudgetDTO>;
  
  deleteBudget: (id: string, userId: string) => Promise<void>;
  getBudgetStatus: (id: string, userId: string) => Promise<BudgetStatus | null>;
  getBudgetDashboard: (userId: string) => Promise<BudgetDashboard>;
  
  // For validation
  getCategory: (id: string) => Promise<CategoryDTO | null>;
}

// ============================================================================
// Combined App Dependencies
// ============================================================================

export interface AppDeps {
  transactions: TransactionDeps;
  categories: CategoryDeps;
  budgets: BudgetDeps;
}
