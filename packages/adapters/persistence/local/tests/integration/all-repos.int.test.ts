import { describe, it, expect, beforeEach } from 'vitest';
import { makeInMemTransactionsRepo, makeInMemCategoriesRepo, makeInMemBudgetsRepo } from '../../src';
import { Transaction, Category, Budget } from '@budget/domain';

/**
 * Integration tests for the local (in-memory) persistence adapters.
 * Tests cross-repository interactions and data consistency.
 */
describe('Local Persistence Integration', () => {
  let transactionsRepo: ReturnType<typeof makeInMemTransactionsRepo>;
  let categoriesRepo: ReturnType<typeof makeInMemCategoriesRepo>;
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;

  beforeEach(() => {
    transactionsRepo = makeInMemTransactionsRepo();
    categoriesRepo = makeInMemCategoriesRepo();
    budgetsRepo = makeInMemBudgetsRepo();
    
    if (transactionsRepo.clear) transactionsRepo.clear();
    if (categoriesRepo.clear) categoriesRepo.clear();
    if (budgetsRepo.clear) budgetsRepo.clear();
  });

  describe('Budget and Transaction Integration', () => {
    it('should manage transactions within a budget', async () => {
      // Create a budget
      const budget = new Budget({
        id: 'budget-1',
        userId: 'user-1',
        categoryId: 'cat-groceries',
        name: 'January 2025',
        amountCents: 100000, // $1000
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await budgetsRepo.create(budget);

      // Create transactions for this budget
      const tx1 = new Transaction({
        id: 'tx-1',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 5000,
        note: 'Groceries',
        occurredAt: new Date('2025-01-15'),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tx2 = new Transaction({
        id: 'tx-2',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 3000,
        note: 'Gas',
        occurredAt: new Date('2025-01-20'),
        categoryId: 'cat-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(tx1);
      await transactionsRepo.create(tx2);

      // Verify budget exists
      const retrievedBudget = await budgetsRepo.getById('budget-1');
      expect(retrievedBudget).not.toBeNull();
      expect(retrievedBudget?.props.name).toBe('January 2025');

      // Verify transactions are linked to budget
      const budgetTransactions = await transactionsRepo.listByBudget('budget-1');
      expect(budgetTransactions).toHaveLength(2);

      // Calculate total spending (in a real use case)
      const totalSpent = budgetTransactions.reduce((sum, tx) => sum + tx.props.amountCents, 0);
      expect(totalSpent).toBe(8000); // $80
      expect(totalSpent).toBeLessThan(budget.props.amountCents); // Under budget
    });

    it('should filter transactions by date period', async () => {
      const budget = new Budget({
        id: 'budget-1',
        userId: 'user-1',
        categoryId: 'cat-general',
        name: 'January 2025',
        amountCents: 100000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await budgetsRepo.create(budget);

      // Transactions in different months
      const janTx = new Transaction({
        id: 'tx-jan',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 5000,
        note: 'January transaction',
        occurredAt: new Date('2025-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const febTx = new Transaction({
        id: 'tx-feb',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 3000,
        note: 'February transaction',
        occurredAt: new Date('2025-02-05'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(janTx);
      await transactionsRepo.create(febTx);

      // Get transactions within budget period
      const periodTransactions = await transactionsRepo.listByUserInPeriod(
        'user-1',
        budget.props.startDate,
        budget.props.endDate || new Date('2025-01-31')
      );

      expect(periodTransactions).toHaveLength(1);
      expect(periodTransactions[0].props.id).toBe('tx-jan');
    });
  });

  describe('Category and Transaction Integration', () => {
    it('should manage transactions with categories', async () => {
      // Create categories
      const groceriesCategory = new Category({
        id: 'cat-groceries',
        userId: 'user-1',
        name: 'Groceries',
        description: 'Food and household items',
        icon: '🛒',
        color: '#4CAF50',
        isDefault: true,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const transportCategory = new Category({
        id: 'cat-transport',
        userId: 'user-1',
        name: 'Transport',
        description: 'Gas and public transit',
        icon: '🚗',
        color: '#2196F3',
        isDefault: true,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await categoriesRepo.create(groceriesCategory);
      await categoriesRepo.create(transportCategory);

      // Create transactions with categories
      const tx1 = new Transaction({
        id: 'tx-1',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 5000,
        note: 'Weekly shopping',
        categoryId: 'cat-groceries',
        occurredAt: new Date('2025-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tx2 = new Transaction({
        id: 'tx-2',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 3000,
        note: 'Gas fill-up',
        categoryId: 'cat-transport',
        occurredAt: new Date('2025-01-16'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await transactionsRepo.create(tx1);
      await transactionsRepo.create(tx2);

      // Verify categories exist and are sorted
      const userCategories = await categoriesRepo.listByUser('user-1');
      expect(userCategories).toHaveLength(2);
      expect(userCategories[0].props.name).toBe('Groceries');
      expect(userCategories[1].props.name).toBe('Transport');

      // Verify transactions have correct categories
      const transactions = await transactionsRepo.listByBudget('budget-1');
      expect(transactions).toHaveLength(2);
      
      const groceryTxs = transactions.filter(tx => tx.props.categoryId === 'cat-groceries');
      const transportTxs = transactions.filter(tx => tx.props.categoryId === 'cat-transport');
      
      expect(groceryTxs).toHaveLength(1);
      expect(transportTxs).toHaveLength(1);
      expect(groceryTxs[0].props.amountCents).toBe(5000);
    });

    it('should handle category archiving without breaking transactions', async () => {
      const category = new Category({
        id: 'cat-1',
        userId: 'user-1',
        name: 'Old Category',
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await categoriesRepo.create(category);

      // Create transaction with this category
      const tx = new Transaction({
        id: 'tx-1',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 1000,
        categoryId: 'cat-1',
        occurredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await transactionsRepo.create(tx);

      // Archive the category (soft delete)
      const archivedCategory = new Category({
        ...category.props,
        isActive: false,
      });
      await categoriesRepo.update(archivedCategory);

      // Transaction should still exist with the archived category
      const retrievedTx = await transactionsRepo.getById('tx-1');
      expect(retrievedTx).not.toBeNull();
      expect(retrievedTx?.props.categoryId).toBe('cat-1');

      // Category should not appear in active list
      const activeCategories = await categoriesRepo.listActiveByUser('user-1');
      expect(activeCategories).toHaveLength(0);

      // But should appear in full list
      const allCategories = await categoriesRepo.listByUser('user-1');
      expect(allCategories).toHaveLength(1);
      expect(allCategories[0].props.isActive).toBe(false);
    });
  });

  describe('Multi-User Isolation', () => {
    it('should keep data isolated between users', async () => {
      // User 1 data
      const user1Budget = new Budget({
        id: 'budget-user1',
        userId: 'user-1',
        categoryId: 'cat-user1',
        name: 'User 1 Budget',
        amountCents: 100000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user1Category = new Category({
        id: 'cat-user1',
        userId: 'user-1',
        name: 'User One Category',
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user1Tx = new Transaction({
        id: 'tx-user1',
        budgetId: 'budget-user1',
        userId: 'user-1',
        amountCents: 5000,
        occurredAt: new Date('2025-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // User 2 data
      const user2Budget = new Budget({
        id: 'budget-user2',
        userId: 'user-2',
        categoryId: 'cat-user2',
        name: 'User 2 Budget',
        amountCents: 200000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user2Category = new Category({
        id: 'cat-user2',
        userId: 'user-2',
        name: 'User Two Category',
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user2Tx = new Transaction({
        id: 'tx-user2',
        budgetId: 'budget-user2',
        userId: 'user-2',
        amountCents: 7000,
        occurredAt: new Date('2025-01-16'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create all data
      await budgetsRepo.create(user1Budget);
      await budgetsRepo.create(user2Budget);
      await categoriesRepo.create(user1Category);
      await categoriesRepo.create(user2Category);
      await transactionsRepo.create(user1Tx);
      await transactionsRepo.create(user2Tx);

      // Verify isolation
      const user1Budgets = await budgetsRepo.listByUser('user-1');
      const user2Budgets = await budgetsRepo.listByUser('user-2');
      expect(user1Budgets).toHaveLength(1);
      expect(user2Budgets).toHaveLength(1);
      expect(user1Budgets[0].props.name).toBe('User 1 Budget');
      expect(user2Budgets[0].props.name).toBe('User 2 Budget');

      const user1Categories = await categoriesRepo.listByUser('user-1');
      const user2Categories = await categoriesRepo.listByUser('user-2');
      expect(user1Categories).toHaveLength(1);
      expect(user2Categories).toHaveLength(1);

      const user1Period = await transactionsRepo.listByUserInPeriod(
        'user-1',
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );
      const user2Period = await transactionsRepo.listByUserInPeriod(
        'user-2',
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );
      expect(user1Period).toHaveLength(1);
      expect(user2Period).toHaveLength(1);
      expect(user1Period[0].props.amountCents).toBe(5000);
      expect(user2Period[0].props.amountCents).toBe(7000);
    });
  });

  describe('Repository Contract Compliance', () => {
    it('should handle null/not-found cases consistently', async () => {
      expect(await budgetsRepo.getById('non-existent')).toBeNull();
      expect(await categoriesRepo.getById('non-existent')).toBeNull();
      expect(await transactionsRepo.getById('non-existent')).toBeNull();
    });

    it('should return empty arrays for list operations with no results', async () => {
      expect(await budgetsRepo.listByUser('no-user')).toEqual([]);
      expect(await categoriesRepo.listByUser('no-user')).toEqual([]);
      expect(await categoriesRepo.listActiveByUser('no-user')).toEqual([]);
      expect(await transactionsRepo.listByBudget('no-budget')).toEqual([]);
      expect(await transactionsRepo.listByUserInPeriod(
        'no-user',
        new Date('2025-01-01'),
        new Date('2025-01-31')
      )).toEqual([]);
    });

    it('should support CRUD operations consistently', async () => {
      // Create
      const category = new Category({
        id: 'cat-1',
        userId: 'user-1',
        name: 'Test Category',
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await categoriesRepo.create(category);
      
      // Read
      let retrieved = await categoriesRepo.getById('cat-1');
      expect(retrieved?.props.name).toBe('Test Category');
      
      // Update
      const updated = new Category({
        ...category.props,
        name: 'Updated Category',
      });
      await categoriesRepo.update(updated);
      retrieved = await categoriesRepo.getById('cat-1');
      expect(retrieved?.props.name).toBe('Updated Category');
      
      // Delete
      await categoriesRepo.delete('cat-1');
      retrieved = await categoriesRepo.getById('cat-1');
      expect(retrieved).toBeNull();
    });
  });
});
