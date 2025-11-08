import { describe, it, expect, beforeEach } from 'vitest';
import { makeInMemTransactionsRepo } from './transactions-repo';
import { Transaction } from '@budget/domain/transaction';

describe('makeInMemTransactionsRepo', () => {
  let repo: ReturnType<typeof makeInMemTransactionsRepo>;

  beforeEach(() => {
    repo = makeInMemTransactionsRepo();
    if (repo.clear) repo.clear();
  });

  describe('create and getById', () => {
    it('should store and retrieve a transaction by ID', async () => {
      const tx = new Transaction({
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

      await repo.create(tx);
      const retrieved = await repo.getById('tx-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.props.id).toBe('tx-1');
      expect(retrieved?.props.note).toBe('Groceries');
      expect(retrieved?.props.amountCents).toBe(5000);
    });

    it('should return null for non-existent ID', async () => {
      const result = await repo.getById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing transaction', async () => {
      const tx = new Transaction({
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

      await repo.create(tx);

      const updated = new Transaction({
        ...tx.props,
        note: 'Groceries - Updated',
        amountCents: 6000,
      });

      await repo.update(updated);
      const retrieved = await repo.getById('tx-1');

      expect(retrieved?.props.note).toBe('Groceries - Updated');
      expect(retrieved?.props.amountCents).toBe(6000);
    });
  });

  describe('delete', () => {
    it('should remove a transaction by ID', async () => {
      const tx = new Transaction({
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

      await repo.create(tx);
      await repo.delete('tx-1');
      const retrieved = await repo.getById('tx-1');

      expect(retrieved).toBeNull();
    });
  });

  describe('listByBudget', () => {
    it('should return transactions for a specific budget', async () => {
      const tx1 = new Transaction({
        id: 'tx-1',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 5000,
        note: 'Transaction 1',
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
        note: 'Transaction 2',
        occurredAt: new Date('2025-01-16'),
        categoryId: 'cat-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tx3 = new Transaction({
        id: 'tx-3',
        budgetId: 'budget-2',
        userId: 'user-1',
        amountCents: 2000,
        note: 'Transaction 3',
        occurredAt: new Date('2025-01-17'),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repo.create(tx1);
      await repo.create(tx2);
      await repo.create(tx3);

      const results = await repo.listByBudget('budget-1');

      expect(results).toHaveLength(2);
      expect(results.map(t => t.props.id)).toContain('tx-1');
      expect(results.map(t => t.props.id)).toContain('tx-2');
      expect(results.map(t => t.props.id)).not.toContain('tx-3');
    });

    it('should respect the limit parameter', async () => {
      // Create 10 transactions for the same budget
      for (let i = 0; i < 10; i++) {
        const tx = new Transaction({
          id: `tx-${i}`,
          budgetId: 'budget-1',
          userId: 'user-1',
          amountCents: 1000,
          note: `Transaction ${i}`,
          occurredAt: new Date('2025-01-15'),
          categoryId: 'cat-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await repo.create(tx);
      }

      const results = await repo.listByBudget('budget-1', 5);
      expect(results).toHaveLength(5);
    });

    it('should return empty array for budget with no transactions', async () => {
      const results = await repo.listByBudget('non-existent-budget');
      expect(results).toEqual([]);
    });
  });

  describe('listByUserInPeriod', () => {
    it('should return transactions for a user within a date range', async () => {
      const tx1 = new Transaction({
        id: 'tx-1',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 5000,
        note: 'In range',
        occurredAt: new Date('2025-01-15T12:00:00Z'),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tx2 = new Transaction({
        id: 'tx-2',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 3000,
        note: 'Also in range',
        occurredAt: new Date('2025-01-20T12:00:00Z'),
        categoryId: 'cat-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tx3 = new Transaction({
        id: 'tx-3',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 2000,
        note: 'Out of range',
        occurredAt: new Date('2025-02-01T12:00:00Z'),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const tx4 = new Transaction({
        id: 'tx-4',
        budgetId: 'budget-1',
        userId: 'user-2',
        amountCents: 4000,
        note: 'Different user',
        occurredAt: new Date('2025-01-16T12:00:00Z'),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repo.create(tx1);
      await repo.create(tx2);
      await repo.create(tx3);
      await repo.create(tx4);

      const results = await repo.listByUserInPeriod(
        'user-1',
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-31T23:59:59Z')
      );

      expect(results).toHaveLength(2);
      expect(results.map(t => t.props.id)).toContain('tx-1');
      expect(results.map(t => t.props.id)).toContain('tx-2');
      expect(results.map(t => t.props.id)).not.toContain('tx-3');
      expect(results.map(t => t.props.id)).not.toContain('tx-4');
    });

    it('should include transactions on the boundary dates', async () => {
      const txStart = new Transaction({
        id: 'tx-start',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 1000,
        note: 'On start date',
        occurredAt: new Date('2025-01-01T00:00:00Z'),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const txEnd = new Transaction({
        id: 'tx-end',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 2000,
        note: 'On end date',
        occurredAt: new Date('2025-01-31T23:59:59Z'),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repo.create(txStart);
      await repo.create(txEnd);

      const results = await repo.listByUserInPeriod(
        'user-1',
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-31T23:59:59Z')
      );

      expect(results).toHaveLength(2);
      expect(results.map(t => t.props.id)).toContain('tx-start');
      expect(results.map(t => t.props.id)).toContain('tx-end');
    });
  });

  describe('clear', () => {
    it('should remove all transactions', async () => {
      const tx1 = new Transaction({
        id: 'tx-1',
        budgetId: 'budget-1',
        userId: 'user-1',
        amountCents: 5000,
        note: 'Transaction 1',
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
        note: 'Transaction 2',
        occurredAt: new Date('2025-01-16'),
        categoryId: 'cat-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repo.create(tx1);
      await repo.create(tx2);

      if (repo.clear) repo.clear();

      const result1 = await repo.getById('tx-1');
      const result2 = await repo.getById('tx-2');
      const results = await repo.listByBudget('budget-1');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(results).toEqual([]);
    });
  });
});
