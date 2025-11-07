import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  makeSupabaseTransactionsRepo,
  makeSupabaseCategoriesRepo,
  makeSupabaseBudgetsRepo,
} from "../../src";
import { Transaction, Category, Budget } from "@budget/domain";

/**
 * Integration tests for Supabase persistence adapters.
 * 
 * These tests run against a real Supabase instance (local or cloud).
 * They are skipped unless the required environment variables are set.
 * 
 * To run these tests:
 * 1. Set up Supabase local dev: `supabase start` (in infra/supabase/)
 * 2. Or configure cloud test instance with these env vars:
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY (for testing, use service role)
 * 
 * Example .env:
 * SUPABASE_URL=http://localhost:54321
 * SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const shouldRun = !!SUPABASE_URL && !!SUPABASE_SERVICE_ROLE_KEY;

const testUserId = "test-user-supabase-integration";
const testCategoryId = "test-cat-supabase-integration";
const testBudgetId = "test-budget-supabase-integration";

describe.skipIf(!shouldRun)("Supabase Persistence Adapters (Integration)", () => {
  let client: ReturnType<typeof createClient>;
  let transactionsRepo: ReturnType<typeof makeSupabaseTransactionsRepo>;
  let categoriesRepo: ReturnType<typeof makeSupabaseCategoriesRepo>;
  let budgetsRepo: ReturnType<typeof makeSupabaseBudgetsRepo>;

  beforeAll(() => {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    transactionsRepo = makeSupabaseTransactionsRepo({ client });
    categoriesRepo = makeSupabaseCategoriesRepo({ client });
    budgetsRepo = makeSupabaseBudgetsRepo({ client });
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await client.from("transactions").delete().eq("user_id", testUserId);
    await client.from("budgets").delete().eq("user_id", testUserId);
    await client.from("categories").delete().eq("user_id", testUserId);
    await client.from("users").delete().eq("id", testUserId);

    // Create test user
    await client.from("users").insert({
      id: testUserId,
      email: "test@supabase-integration.test",
      name: "Test User",
      default_currency: "USD",
    });
  });

  afterAll(async () => {
    // Final cleanup
    if (client) {
      await client.from("transactions").delete().eq("user_id", testUserId);
      await client.from("budgets").delete().eq("user_id", testUserId);
      await client.from("categories").delete().eq("user_id", testUserId);
      await client.from("users").delete().eq("id", testUserId);
    }
  });

  describe("Categories Repository", () => {
    it("should create and retrieve a category", async () => {
      const category = new Category({
        id: testCategoryId,
        userId: testUserId,
        name: "Test Groceries",
        description: "Test category for groceries",
        icon: "🛒",
        color: "#4CAF50",
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await categoriesRepo.create(category);

      const retrieved = await categoriesRepo.getById(testCategoryId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.props.name).toBe("Test Groceries");
      expect(retrieved?.props.userId).toBe(testUserId);
      expect(retrieved?.props.icon).toBe("🛒");
    });

    it("should list categories by user with correct sort order", async () => {
      const cat1 = new Category({
        id: `${testCategoryId}-1`,
        userId: testUserId,
        name: "Category A",
        isDefault: false,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const cat2 = new Category({
        id: `${testCategoryId}-2`,
        userId: testUserId,
        name: "Category B",
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await categoriesRepo.create(cat1);
      await categoriesRepo.create(cat2);

      const categories = await categoriesRepo.listByUser(testUserId);

      expect(categories).toHaveLength(2);
      // Should be sorted by sortOrder
      expect(categories[0].props.name).toBe("Category B"); // sortOrder 1
      expect(categories[1].props.name).toBe("Category A"); // sortOrder 2
    });

    it("should filter active categories", async () => {
      const activeCat = new Category({
        id: `${testCategoryId}-active`,
        userId: testUserId,
        name: "Active Category",
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const inactiveCat = new Category({
        id: `${testCategoryId}-inactive`,
        userId: testUserId,
        name: "Inactive Category",
        isDefault: false,
        isActive: false,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await categoriesRepo.create(activeCat);
      await categoriesRepo.create(inactiveCat);

      const activeCategories = await categoriesRepo.listActiveByUser(testUserId);

      expect(activeCategories).toHaveLength(1);
      expect(activeCategories[0].props.name).toBe("Active Category");
    });
  });

  describe("Budgets Repository", () => {
    beforeEach(async () => {
      // Create a test category for budgets
      await client.from("categories").insert({
        id: testCategoryId,
        user_id: testUserId,
        name: "Test Category",
        is_default: false,
        is_active: true,
        sort_order: 1,
      });
    });

    it("should create and retrieve a budget", async () => {
      const budget = new Budget({
        id: testBudgetId,
        userId: testUserId,
        categoryId: testCategoryId,
        name: "Monthly Groceries Budget",
        amountCents: 50000,
        currency: "USD",
        period: "MONTHLY",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
        isActive: true,
        alertThreshold: 80,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await budgetsRepo.create(budget);

      const retrieved = await budgetsRepo.getById(testBudgetId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.props.name).toBe("Monthly Groceries Budget");
      expect(retrieved?.props.amountCents).toBe(50000);
      expect(retrieved?.props.categoryId).toBe(testCategoryId);
    });

    it("should list budgets by user", async () => {
      const budget1 = new Budget({
        id: `${testBudgetId}-1`,
        userId: testUserId,
        categoryId: testCategoryId,
        name: "Budget 1",
        amountCents: 50000,
        currency: "USD",
        period: "MONTHLY",
        startDate: new Date("2025-01-01"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const budget2 = new Budget({
        id: `${testBudgetId}-2`,
        userId: testUserId,
        categoryId: testCategoryId,
        name: "Budget 2",
        amountCents: 30000,
        currency: "USD",
        period: "WEEKLY",
        startDate: new Date("2025-01-01"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await budgetsRepo.create(budget1);
      await budgetsRepo.create(budget2);

      const budgets = await budgetsRepo.listByUser(testUserId);

      expect(budgets).toHaveLength(2);
      expect(budgets.map(b => b.props.name)).toContain("Budget 1");
      expect(budgets.map(b => b.props.name)).toContain("Budget 2");
    });
  });

  describe("Transactions Repository", () => {
    beforeEach(async () => {
      // Create test category and budget
      await client.from("categories").insert({
        id: testCategoryId,
        user_id: testUserId,
        name: "Test Category",
        is_default: false,
        is_active: true,
        sort_order: 1,
      });

      await client.from("budgets").insert({
        id: testBudgetId,
        user_id: testUserId,
        category_id: testCategoryId,
        name: "Test Budget",
        amount_cents: 100000,
        currency: "USD",
        period: "MONTHLY",
        start_date: new Date("2025-01-01").toISOString(),
        is_active: true,
      });
    });

    it("should create and retrieve a transaction", async () => {
      const transaction = new Transaction({
        id: "test-tx-1",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 5000,
        categoryId: testCategoryId,
        note: "Test transaction",
        occurredAt: new Date("2025-01-15T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(transaction);

      const retrieved = await transactionsRepo.getById("test-tx-1");

      expect(retrieved).not.toBeNull();
      expect(retrieved?.props.amountCents).toBe(5000);
      expect(retrieved?.props.note).toBe("Test transaction");
      expect(retrieved?.props.budgetId).toBe(testBudgetId);
    });

    it("should list transactions by budget", async () => {
      const tx1 = new Transaction({
        id: "test-tx-1",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 5000,
        occurredAt: new Date("2025-01-15T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tx2 = new Transaction({
        id: "test-tx-2",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 3000,
        occurredAt: new Date("2025-01-16T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(tx1);
      await transactionsRepo.create(tx2);

      const transactions = await transactionsRepo.listByBudget(testBudgetId);

      expect(transactions).toHaveLength(2);
      // Should be ordered by occurred_at descending
      expect(transactions[0].props.id).toBe("test-tx-2");
      expect(transactions[1].props.id).toBe("test-tx-1");
    });

    it("should list transactions by user in period", async () => {
      const txInRange = new Transaction({
        id: "test-tx-in-range",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 5000,
        occurredAt: new Date("2025-01-15T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const txOutOfRange = new Transaction({
        id: "test-tx-out-range",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 3000,
        occurredAt: new Date("2025-02-15T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(txInRange);
      await transactionsRepo.create(txOutOfRange);

      const transactions = await transactionsRepo.listByUserInPeriod(
        testUserId,
        new Date("2025-01-01T00:00:00Z"),
        new Date("2025-01-31T23:59:59Z")
      );

      expect(transactions).toHaveLength(1);
      expect(transactions[0].props.id).toBe("test-tx-in-range");
    });

    it("should update a transaction", async () => {
      const transaction = new Transaction({
        id: "test-tx-update",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 5000,
        note: "Original note",
        occurredAt: new Date("2025-01-15T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(transaction);

      const updated = new Transaction({
        ...transaction.props,
        amountCents: 6000,
        note: "Updated note",
        updatedAt: new Date(),
      });

      await transactionsRepo.update(updated);

      const retrieved = await transactionsRepo.getById("test-tx-update");

      expect(retrieved?.props.amountCents).toBe(6000);
      expect(retrieved?.props.note).toBe("Updated note");
    });

    it("should delete a transaction", async () => {
      const transaction = new Transaction({
        id: "test-tx-delete",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 5000,
        occurredAt: new Date("2025-01-15T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(transaction);

      await transactionsRepo.delete("test-tx-delete");

      const retrieved = await transactionsRepo.getById("test-tx-delete");

      expect(retrieved).toBeNull();
    });
  });

  describe("Cross-Repository Integration", () => {
    it("should maintain referential integrity between entities", async () => {
      // Create category
      const category = new Category({
        id: testCategoryId,
        userId: testUserId,
        name: "Integration Test Category",
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await categoriesRepo.create(category);

      // Create budget with category
      const budget = new Budget({
        id: testBudgetId,
        userId: testUserId,
        categoryId: testCategoryId,
        name: "Integration Test Budget",
        amountCents: 100000,
        currency: "USD",
        period: "MONTHLY",
        startDate: new Date("2025-01-01"),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await budgetsRepo.create(budget);

      // Create transaction with budget and category
      const transaction = new Transaction({
        id: "integration-tx",
        userId: testUserId,
        budgetId: testBudgetId,
        amountCents: 5000,
        categoryId: testCategoryId,
        occurredAt: new Date("2025-01-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await transactionsRepo.create(transaction);

      // Verify all entities exist and are linked
      const retrievedCategory = await categoriesRepo.getById(testCategoryId);
      const retrievedBudget = await budgetsRepo.getById(testBudgetId);
      const retrievedTransaction = await transactionsRepo.getById("integration-tx");

      expect(retrievedCategory).not.toBeNull();
      expect(retrievedBudget).not.toBeNull();
      expect(retrievedBudget?.props.categoryId).toBe(testCategoryId);
      expect(retrievedTransaction).not.toBeNull();
      expect(retrievedTransaction?.props.budgetId).toBe(testBudgetId);
      expect(retrievedTransaction?.props.categoryId).toBe(testCategoryId);
    });
  });
});
