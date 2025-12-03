/**
 * Test helpers for API route tests.
 * This file creates a test app instance using in-memory repositories.
 * It provides a reset() function for test isolation between test cases.
 */

import { makeContainer } from "@budget/composition-cloudflare-worker";
import { createApp } from "./app";
import type { AppDeps, TokenVerifier } from "./types";

/**
 * Creates a mock token verifier for testing.
 * Extracts userId from the token itself to support multi-user tests.
 * 
 * Token patterns:
 * - "test-token" → user-test-123
 * - "user-1" or contains "user-1" → user-1
 * - "user-2" or contains "user-2" → user-2  
 * - "different-user" → different-user
 * - Any other → uses token as userId
 */
function createTestTokenVerifier(): TokenVerifier {
  return {
    async verify(token: string) {
      // Extract userId from token for test flexibility
      let userId = "user-test-123";
      
      if (token.includes("user-1")) {
        userId = "user-1";
      } else if (token.includes("user-2")) {
        userId = "user-2";
      } else if (token.includes("different-user")) {
        userId = "different-user";
      } else if (token === "test-token" || token.startsWith("test-")) {
        userId = "user-test-123";
      } else if (token.startsWith("Bearer ")) {
        // Shouldn't happen but handle it
        userId = token.slice(7);
      } else {
        // Use token as userId for flexibility
        userId = token;
      }
      
      return {
        success: true as const,
        data: {
          userId,
          email: `${userId}@example.com`,
          expiresAt: Date.now() + 3600000,
        },
      };
    },
    decode(token: string) {
      let userId = "user-test-123";
      if (token.includes("user-1")) userId = "user-1";
      else if (token.includes("user-2")) userId = "user-2";
      else if (token.includes("different-user")) userId = "different-user";
      return { userId, email: `${userId}@example.com` };
    },
  };
}

// Create a single container instance for all tests (in-memory mode)
const testContainer = makeContainer();

// Create test dependencies with mock token verifier
function createTestAppDeps(): AppDeps {
  const { usecases } = testContainer;
  
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
    tokenVerifier: createTestTokenVerifier(),
  };
}

// Create the app with test dependencies
const deps = createTestAppDeps();
export const app = createApp(deps);

/**
 * Reset all in-memory repositories for test isolation.
 * Call this in beforeEach() to ensure tests don't affect each other.
 */
export function resetTestData(): void {
  testContainer.reset();
}

// For backwards compatibility with existing tests that use `container.reset()`
export const container = {
  reset: resetTestData,
};
