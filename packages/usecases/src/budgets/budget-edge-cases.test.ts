import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreateBudget } from './create-budget';
import { makeUpdateBudget } from './update-budget';
import { makeGetBudgetStatus } from './get-budget-status';
import { makeAddTransaction } from '@budget/usecases/transactions/add-transaction';
import { makeInMemBudgetsRepo, makeInMemTransactionsRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUlid } from '@budget/adapters-system';

describe('Budget Edge Cases & Boundary Tests', () => {
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let transactionsRepo: ReturnType<typeof makeInMemTransactionsRepo>;
  let createBudget: ReturnType<typeof makeCreateBudget>;
  let updateBudget: ReturnType<typeof makeUpdateBudget>;
  let getBudgetStatus: ReturnType<typeof makeGetBudgetStatus>;
  let addTransaction: ReturnType<typeof makeAddTransaction>;
  let clock: { now: () => Date };
  let id: ReturnType<typeof makeUlid>;

  beforeEach(() => {
    budgetsRepo = makeInMemBudgetsRepo();
    transactionsRepo = makeInMemTransactionsRepo();
    // Mock clock to return a fixed date in January 2025
    clock = { now: () => new Date('2025-01-15T12:00:00Z') };
    id = makeUlid();
    
    createBudget = makeCreateBudget({ budgetsRepo, clock, id });
    updateBudget = makeUpdateBudget({ budgetsRepo, clock });
    getBudgetStatus = makeGetBudgetStatus({ budgetsRepo, transactionsRepo, clock });
    addTransaction = makeAddTransaction({ txRepo: transactionsRepo, clock, id });
  });

  describe('Boundary Cases - Amount', () => {
    it('should handle minimum valid budget amount (0 cents)', async () => {
      // Reasoning: Budget of $0 is technically valid (e.g., "no spending" budget)
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'No Spending Challenge',
        amountCents: 0,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      expect(budget.props.amountCents).toBe(0);
    });

    it('should handle very large budget amounts (near MAX_SAFE_INTEGER)', async () => {
      // Reasoning: Test system can handle very wealthy users or corporate budgets
      // MAX_SAFE_INTEGER in JavaScript is 9,007,199,254,740,991 
      // In cents, this is AROUND ~90 trillion dollars
      const largeBudget = 900000000000000; // 9 trillion cents = 90 billion dollars
      
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Corporate Annual Budget',
        amountCents: largeBudget,
        currency: 'USD',
        period: 'YEARLY',
        startDate: new Date('2025-01-01'),
      });

      expect(budget.props.amountCents).toBe(largeBudget);
    });

    it('should handle 1 cent budgets', async () => {
      // Reasoning: Extreme minimalist budget, tests penny-level precision
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Penny Budget',
        amountCents: 1,
        currency: 'USD',
        period: 'DAILY',
        startDate: new Date('2025-01-01'),
      });

      expect(budget.props.amountCents).toBe(1);
    });
  });

  describe('Boundary Cases - Alert Threshold', () => {
    it('should handle 0% alert threshold', async () => {
      // Reasoning: User wants to be alerted immediately on any spending
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Strict Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        alertThreshold: 0,
      });

      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        amountCents: 1,
        occurredAt: new Date('2025-01-05'),
      });

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.shouldAlert).toBe(true);
    });

    it('should handle 100% alert threshold', async () => {
      // Reasoning: User only wants alert when completely spent
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Relaxed Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        alertThreshold: 100,
      });

      // Spend 99%
      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        note: 'Almost all',
        amountCents: 49500,
        currency: 'USD',
        occurredAt: new Date('2025-01-05'),
      });

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.shouldAlert).toBe(false);
      expect(status?.percentageUsed).toBeGreaterThanOrEqual(99);
    });

    it('should handle exactly at threshold boundary', async () => {
      // Reasoning: Test >= vs > logic for threshold
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Test Budget',
        amountCents: 10000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
        alertThreshold: 80,
      });

      // Spend exactly 80%
      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        note: 'Exactly at threshold',
        amountCents: 8000,
        currency: 'USD',
        occurredAt: new Date('2025-01-05'),
      });

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.percentageUsed).toBe(80);
      expect(status?.shouldAlert).toBe(true); // Should trigger at exactly threshold
    });
  });

  describe('Extreme Cases - Dates', () => {
    it('should handle budget starting far in the past', async () => {
      // Reasoning: Legacy budgets or historical data import
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Historical Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'YEARLY',
        startDate: new Date(Date.UTC(1900, 0, 1)),
      });

      expect(budget.props.startDate.getUTCFullYear()).toBe(1900);
    });

    it('should handle budget starting far in the future', async () => {
      // Reasoning: Long-term planning or future budget setup
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Future Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'YEARLY',
        startDate: new Date('2099-12-31'),
      });

      expect(budget.props.startDate.getFullYear()).toBe(2099);
    });

    it('should handle very short-lived budget (same start and end date)', async () => {
      // Reasoning: One-day special event budget
      const date = new Date('2025-01-01');
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Single Day Event',
        amountCents: 50000,
        currency: 'USD',
        period: 'DAILY',
        startDate: date,
        endDate: date,
      });

      expect(budget.props.startDate).toEqual(budget.props.endDate);
    });

    it('should handle multi-year budget span', async () => {
      // Reasoning: Long-term savings goals or retirement planning
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: '10-Year Retirement Savings',
        amountCents: 500000000, // $5 million
        currency: 'USD',
        period: 'YEARLY',
        startDate: new Date(Date.UTC(2025, 0, 1)),
        endDate: new Date(Date.UTC(2035, 11, 31)),
      });

      const yearsDiff = budget.props.endDate!.getUTCFullYear() - budget.props.startDate.getUTCFullYear();
      expect(yearsDiff).toBe(10);
    });
  });

  describe('Extreme Cases - String Lengths', () => {
    it('should handle maximum length budget name (100 chars)', async () => {
      // Reasoning: Test schema boundary for name field
      const longName = 'A'.repeat(100);
      
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: longName,
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      expect(budget.props.name).toHaveLength(100);
    });

    it('should handle minimum length budget name (1 char)', async () => {
      // Reasoning: Test minimum viable name
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'A',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      expect(budget.props.name).toHaveLength(1);
    });

    it('should handle special characters and Unicode in name', async () => {
      // Reasoning: International users with non-ASCII characters
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: '月間食費 🍱 (Monthly Food)',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      expect(budget.props.name).toContain('🍱');
      expect(budget.props.name).toContain('月間食費');
    });
  });

  describe('Edge Cases - Budget Periods', () => {
    it('should handle DAILY budget with many transactions', async () => {
      // Reasoning: High-frequency spending like daily coffee budget
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Daily Coffee',
        amountCents: 500, // $5 per day
        currency: 'USD',
        period: 'DAILY',
        startDate: new Date('2025-01-01'),
      });

      // Add 10 small transactions in one day
      for (let i = 0; i < 10; i++) {
        await addTransaction({
          userId: 'user-123',
          budgetId: budget.props.id,
          categoryId: budget.props.categoryId,
          note: `Coffee #${i + 1}`,
          amountCents: 50, // 50 cents each
          currency: 'USD',
          occurredAt: new Date('2025-01-15T10:00:00Z'),
        });
      }

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.spentCents).toBe(500);
      expect(status?.isOverBudget).toBe(false);
      expect(status?.transactionCount).toBe(10);
    });

    it('should handle YEARLY budget covering all periods', async () => {
      // Reasoning: Annual budget that should accommodate monthly tracking
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Annual Travel Budget',
        amountCents: 1200000, // $12,000 per year
        currency: 'USD',
        period: 'YEARLY',
        startDate: new Date('2025-01-01'),
      });

      // Add spending across different months
      const months = [1, 3, 6, 9, 12];
      for (const month of months) {
        await addTransaction({
          userId: 'user-123',
          budgetId: budget.props.id,
          categoryId: budget.props.categoryId,
          note: `Travel in month ${month}`,
          amountCents: 200000, // $2,000 per trip
          currency: 'USD',
          occurredAt: new Date(`2025-${month.toString().padStart(2, '0')}-15`),
        });
      }

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.spentCents).toBe(1000000); // $10,000 total
      expect(status?.percentageUsed).toBeCloseTo(83.33, 1);
    });
  });

  describe('Edge Cases - Overspending', () => {
    it('should handle extreme overspending (10x budget)', async () => {
      // Reasoning: Emergency scenarios or budget violations
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Small Budget',
        amountCents: 10000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        note: 'Huge expense',
        amountCents: 100000, // 10x over budget
        currency: 'USD',
        occurredAt: new Date('2025-01-15'),
      });

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.isOverBudget).toBe(true);
      expect(status?.percentageUsed).toBe(1000);
      expect(status?.remainingCents).toBe(-90000);
    });

    it('should handle spending exactly to the penny', async () => {
      // Reasoning: Perfect budget adherence
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Precise Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        note: 'Exact amount',
        amountCents: 50000,
        currency: 'USD',
        occurredAt: new Date('2025-01-15'),
      });

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.remainingCents).toBe(0);
      expect(status?.percentageUsed).toBe(100);
      expect(status?.isOverBudget).toBe(false); // Not over, exactly at limit
    });

    it('should handle one cent over budget', async () => {
      // Reasoning: Minimal overspending detection
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Precise Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        note: 'Just over',
        amountCents: 50001,
        currency: 'USD',
        occurredAt: new Date('2025-01-15'),
      });

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.isOverBudget).toBe(true);
      expect(status?.remainingCents).toBe(-1);
    });
  });

  describe('Edge Cases - Updates', () => {
    it('should handle updating budget amount while transactions exist', async () => {
      // Reasoning: Budget adjustments mid-period
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Flexible Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      // Add transaction
      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        note: 'Purchase',
        amountCents: 30000,
        currency: 'USD',
        occurredAt: new Date('2025-01-15'),
      });

      // Increase budget
      const updated = await updateBudget(budget.props.id, 'user-123', {
        amountCents: 100000, // Double the budget
      });

      const status = await getBudgetStatus(updated.props.id, 'user-123');
      expect(status?.percentageUsed).toBe(30); // 30k of 100k
      expect(status?.isOverBudget).toBe(false);
    });

    it('should handle decreasing budget below current spending', async () => {
      // Reasoning: Budget cuts mid-period
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Cut Budget',
        amountCents: 100000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      await addTransaction({
        userId: 'user-123',
        budgetId: budget.props.id,
        categoryId: budget.props.categoryId,
        note: 'Purchase',
        amountCents: 60000,
        currency: 'USD',
        occurredAt: new Date('2025-01-15'),
      });

      // Cut budget below spending
      const updated = await updateBudget(budget.props.id, 'user-123', {
        amountCents: 50000, // Below current $600 spending
      });

      const status = await getBudgetStatus(updated.props.id, 'user-123');
      expect(status?.isOverBudget).toBe(true);
      expect(status?.percentageUsed).toBe(120);
    });
  });

  describe('Edge Cases - Concurrent Transactions', () => {
    it('should handle multiple transactions added simultaneously', async () => {
      // Reasoning: Batch import or multiple users with shared budget
      const budget = await createBudget({
        userId: 'user-123',
        categoryId: 'cat-123',
        name: 'Shared Budget',
        amountCents: 100000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01'),
      });

      // Add multiple transactions concurrently
      const promises = Array.from({ length: 100 }, (_, i) =>
        addTransaction({
          userId: 'user-123',
          budgetId: budget.props.id,
          categoryId: budget.props.categoryId,
          note: `Transaction ${i}`,
          amountCents: 500,
          currency: 'USD',
          occurredAt: new Date('2025-01-15'),
        })
      );

      await Promise.all(promises);

      const status = await getBudgetStatus(budget.props.id, 'user-123');
      expect(status?.transactionCount).toBe(100);
      expect(status?.spentCents).toBe(50000); // 100 × $5
    });
  });
});