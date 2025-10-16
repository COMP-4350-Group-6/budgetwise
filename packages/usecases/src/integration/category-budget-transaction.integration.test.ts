import { describe, it, expect, beforeEach } from 'vitest';

import { makeCreateCategory } from '../categories/create-category';
import { makeCreateBudget } from '../budgets/create-budget';
import { makeGetBudgetDashboard } from '../budgets/get-budget-dashboard';
import { makeAddTransaction } from '../transactions/add-transaction';

import { makeInMemCategoriesRepo, makeInMemBudgetsRepo, makeInMemTransactionsRepo } from '@budget/adapters-persistence-local';
import { makeUlid } from '@budget/adapters-system';

describe('Usecases Integration: Category + Budget + Transaction -> Dashboard', () => {
  const userId = 'user-1';

  let categoriesRepo: ReturnType<typeof makeInMemCategoriesRepo>;
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let transactionsRepo: ReturnType<typeof makeInMemTransactionsRepo>;
  let id: ReturnType<typeof makeUlid>;
  // Fixed clock anchored mid-month so transactions fall within the MONTHLY period
  const clock = { now: () => new Date('2025-01-15T12:00:00Z') };

  let createCategory: ReturnType<typeof makeCreateCategory>;
  let createBudget: ReturnType<typeof makeCreateBudget>;
  let addTransaction: ReturnType<typeof makeAddTransaction>;
  let getBudgetDashboard: ReturnType<typeof makeGetBudgetDashboard>;

  beforeEach(() => {
    categoriesRepo = makeInMemCategoriesRepo();
    budgetsRepo = makeInMemBudgetsRepo();
    transactionsRepo = makeInMemTransactionsRepo();
    id = makeUlid();

    createCategory = makeCreateCategory({ categoriesRepo, clock, id });
    createBudget = makeCreateBudget({ budgetsRepo, clock, id });
    addTransaction = makeAddTransaction({ txRepo: transactionsRepo, clock, id });
    getBudgetDashboard = makeGetBudgetDashboard({ categoriesRepo, budgetsRepo, transactionsRepo, clock });
  });

  it('reflects category totals after adding a transaction to its budget', async () => {
    // 1) Category
    const category = await createCategory({
      userId,
      name: 'Food',
      isActive: true,
    });

    // 2) Budget under that category
    const budget = await createBudget({
      userId,
      categoryId: category.props.id,
      name: 'Groceries',
      amountCents: 50_000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      alertThreshold: 80,
    });

    // 3) Add transaction to the budget (spend 42,500)
    await addTransaction({
      userId,
      budgetId: budget.props.id,
      categoryId: category.props.id,
      amountCents: 42_500,
      occurredAt: new Date('2025-01-15'),
    });

    // 4) Dashboard should aggregate the budget under the category
    const dashboard = await getBudgetDashboard(userId);

    // Find our category summary
    const cat = dashboard.categories.find(c => c.categoryId === category.props.id);
    expect(cat).toBeDefined();
    expect(cat!.totalBudgetCents).toBe(50_000);
    expect(cat!.totalSpentCents).toBe(42_500);
    expect(cat!.totalRemainingCents).toBe(7_500);

    // Budget-level details also reflect spend
    const status = cat!.budgets.find(b => b.budget.id === budget.props.id);
    expect(status).toBeDefined();
    expect(status!.spentCents).toBe(42_500);
    expect(status!.remainingCents).toBe(7_500);

    // Should trigger alert at 85% when threshold is 80
    expect(status!.shouldAlert).toBe(true);

    // Dashboard aggregates
    expect(dashboard.totalBudgetCents).toBeGreaterThan(0);
    expect(dashboard.totalSpentCents).toBeGreaterThan(0);
  });
});