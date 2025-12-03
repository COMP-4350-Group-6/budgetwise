/**
 * Dependency interfaces for API routes.
 * 
 * This file defines the function signatures that routes need injected.
 * Input/output types are imported from @budget/schemas.
 * 
 * Why this file exists:
 * - Routes need explicit interfaces for their dependencies (testability, clarity)
 * - These interfaces are API-layer specific (not part of usecases package)
 * - deps.ts wires actual usecases to these interfaces
 */

import type { AuthProviderPort } from "@budget/ports";
import type {
  // DTOs (outputs)
  TransactionDTO,
  CategoryDTO,
  BudgetDTO,
  BudgetStatus,
  BudgetDashboard,
  CategorizationResult,
  ParsedInvoice,
  // Usecase inputs
  AddTransactionInput,
  ModifyTransactionInput,
  DeleteTransactionInput,
  ListTransactionsInput,
  CategorizeTransactionInput,
  ParseInvoiceInput,
  BulkImportTransactionsInput,
  BulkImportResult,
  AddCategoryInput,
  ModifyCategoryInput,
  SeedDefaultCategoriesResult,
  AddBudgetInput,
  ModifyBudgetInput,
  UpdateBudgetInput,
} from "@budget/schemas";

/** Token verifier interface - matches what Container provides */
import type { TokenVerifierPort } from "@budget/ports/auth";
export type TokenVerifier = TokenVerifierPort;

// ============================================================================
// Transaction Route Dependencies
// ============================================================================

export interface TransactionDeps {
  addTransaction: (input: AddTransactionInput) => Promise<TransactionDTO>;
  updateTransaction: (input: ModifyTransactionInput) => Promise<TransactionDTO | null>;
  deleteTransaction: (input: DeleteTransactionInput) => Promise<boolean>;
  listTransactions: (input: ListTransactionsInput) => Promise<TransactionDTO[]>;
  getTransaction: (id: string) => Promise<TransactionDTO | null>;
  bulkImportTransactions: (input: BulkImportTransactionsInput) => Promise<BulkImportResult>;
  
  // Optional AI features
  categorizeTransaction?: (input: CategorizeTransactionInput) => Promise<CategorizationResult | null>;
  parseInvoice?: (input: ParseInvoiceInput) => Promise<ParsedInvoice | null>;
}

// ============================================================================
// Category Route Dependencies
// ============================================================================

export interface CategoryDeps {
  createCategory: (input: AddCategoryInput) => Promise<CategoryDTO>;
  listCategories: (userId: string, activeOnly?: boolean) => Promise<CategoryDTO[]>;
  updateCategory: (id: string, userId: string, updates: Partial<ModifyCategoryInput>) => Promise<CategoryDTO>;
  deleteCategory: (id: string, userId: string) => Promise<void>;
  seedDefaultCategories: (userId: string) => Promise<SeedDefaultCategoriesResult>;
  getCategory: (id: string) => Promise<CategoryDTO | null>;
}

// ============================================================================
// Budget Route Dependencies
// ============================================================================

export interface BudgetDeps {
  createBudget: (input: AddBudgetInput) => Promise<BudgetDTO>;
  listBudgets: (userId: string, activeOnly?: boolean) => Promise<BudgetDTO[]>;
  updateBudget: (id: string, userId: string, updates: UpdateBudgetInput) => Promise<BudgetDTO>;
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
  tokenVerifier: TokenVerifier;
  // Optional auth infrastructure
  authProvider?: AuthProviderPort;
  cookieDomain?: string;
}

// Re-export for convenience
export type { AuthProviderPort } from "@budget/ports";
