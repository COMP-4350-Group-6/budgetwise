import { describe, it, expect, beforeEach } from 'vitest';
import { makeGetBudgetDashboard } from './get-budget-dashboard';
import { makeCreateBudget } from './create-budget';
import { makeCreateCategory } from '../categories/create-category';
import { makeAddTransaction } from '../transactions/add-transaction';
import { makeInMemBudgetsRepo, makeInMemCategoriesRepo, makeInMemTransactionsRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUlid } from '@budget/adapters-system';

describe('getBudgetDashboard', () => {
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let categoriesRepo: ReturnType<typeof makeInMemCategoriesRepo>;
  let transactionsRepo: ReturnType<typeof makeInMemTransactionsRepo>;
  let getBudgetDashboard: ReturnType<typeof makeGetBudgetDashboard>;
  let createBudget: ReturnType<typeof makeCreateBudget>;
  let createCategory: ReturnType<typeof makeCreateCategory>;
  let addTransaction: ReturnType<typeof makeAddTransaction>;
  let clock: { now: () => Date };
  let id: ReturnType<typeof makeUlid>;

  beforeEach(() => {
    budgetsRepo = makeInMemBudgetsRepo();
    categoriesRepo = makeInMemCategoriesRepo();
    transactionsRepo = makeInMemTransactionsRepo();
    // Mock clock to return a fixed date in January 2025
    clock = { now: () => new Date('2025-01-15T12:00:00Z') };
    id = makeUlid();
    
    getBudgetDashboard = makeGetBudgetDashboard({
      categoriesRepo,
      budgetsRepo,
      transactionsRepo,
      clock,
    });
    
    createBudget = makeCreateBudget({ budgetsRepo, clock, id });
    createCategory = makeCreateCategory({ categoriesRepo, clock, id });
    addTransaction = makeAddTransaction({ txRepo: transactionsRepo, clock, id });
  });

  it('should return empty dashboard when no budgets exist', async () => {
    const dashboard = await getBudgetDashboard('user-123');

    expect(dashboard.categories).toEqual([]);
    expect(dashboard.totalBudgetCents).toBe(0);
    expect(dashboard.totalSpentCents).toBe(0);
    expect(dashboard.overBudgetCount).toBe(0);
    expect(dashboard.alertCount).toBe(0);
  });

  it('should return dashboard with budget but no transactions', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Groceries',
      icon: '🛒',
    });

    await createBudget({
      userId: 'user-123',
      categoryId: category.props.id,
      name: 'Monthly Groceries',
      amountCents: 50000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    const dashboard = await getBudgetDashboard('user-123');

    expect(dashboard.categories).toHaveLength(1);
    expect(dashboard.categories[0].categoryName).toBe('Groceries');
    expect(dashboard.categories[0].totalBudgetCents).toBe(50000);
    expect(dashboard.categories[0].totalSpentCents).toBe(0);
    expect(dashboard.totalBudgetCents).toBe(50000);
    expect(dashboard.totalSpentCents).toBe(0);
  });

  it('should calculate spending correctly with transactions', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Groceries',
      icon: '🛒',
    });

    const budget = await createBudget({
      userId: 'user-123',
      categoryId: category.props.id,
      name: 'Monthly Groceries',
      amountCents: 50000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    // Add some transactions
    await addTransaction({
      userId: 'user-123',
      budgetId: budget.props.id,
      categoryId: budget.props.categoryId,
      amountCents: 10000,
      occurredAt: new Date('2025-01-15'),
    });

    await addTransaction({
      userId: 'user-123',
      budgetId: budget.props.id,
      categoryId: budget.props.categoryId,
      amountCents: 15000,
      occurredAt: new Date('2025-01-20'),
    });

    const dashboard = await getBudgetDashboard('user-123');

    expect(dashboard.categories[0].totalSpentCents).toBe(25000);
    expect(dashboard.categories[0].totalRemainingCents).toBe(25000);
    expect(dashboard.categories[0].overallPercentageUsed).toBe(50);
    expect(dashboard.totalSpentCents).toBe(25000);
  });

  it('should detect over budget status', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Groceries',
      icon: '🛒',
    });

    const budget = await createBudget({
      userId: 'user-123',
      categoryId: category.props.id,
      name: 'Monthly Groceries',
      amountCents: 50000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      alertThreshold: 80,
    });

    // Overspend
    await addTransaction({
      userId: 'user-123',
      budgetId: budget.props.id,
      note: 'Big shopping',
      amountCents: 60000,
      currency: 'USD',
      occurredAt: new Date('2025-01-15'),
    });

    const dashboard = await getBudgetDashboard('user-123');

    expect(dashboard.categories[0].hasOverBudget).toBe(true);
    expect(dashboard.overBudgetCount).toBe(1);
    expect(dashboard.categories[0].budgets[0].isOverBudget).toBe(true);
  });

  it('should detect alert threshold', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Groceries',
      icon: '🛒',
    });

    const budget = await createBudget({
      userId: 'user-123',
      categoryId: category.props.id,
      name: 'Monthly Groceries',
      amountCents: 50000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      alertThreshold: 80,
    });

    // Spend 85% of budget
    await addTransaction({
      userId: 'user-123',
      budgetId: budget.props.id,
      note: 'Shopping',
      amountCents: 42500,
      currency: 'USD',
      occurredAt: new Date('2025-01-15'),
    });

    const dashboard = await getBudgetDashboard('user-123');

    expect(dashboard.categories[0].budgets[0].shouldAlert).toBe(true);
    expect(dashboard.alertCount).toBe(1);
  });

  it('should aggregate multiple budgets per category', async () => {
    const category = await createCategory({
      userId: 'user-123',
      name: 'Food',
      icon: '🍔',
    });

    await createBudget({
      userId: 'user-123',
      categoryId: category.props.id,
      name: 'Groceries',
      amountCents: 50000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    await createBudget({
      userId: 'user-123',
      categoryId: category.props.id,
      name: 'Dining Out',
      amountCents: 30000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    const dashboard = await getBudgetDashboard('user-123');

    expect(dashboard.categories).toHaveLength(1);
    expect(dashboard.categories[0].budgets).toHaveLength(2);
    expect(dashboard.categories[0].totalBudgetCents).toBe(80000);
    expect(dashboard.totalBudgetCents).toBe(80000);
  });

  it('should only return budgets for the specified user', async () => {
    const cat1 = await createCategory({
      userId: 'user-1',
      name: 'Food',
    });

    const cat2 = await createCategory({
      userId: 'user-2',
      name: 'Food',
    });

    await createBudget({
      userId: 'user-1',
      categoryId: cat1.props.id,
      name: 'Budget 1',
      amountCents: 50000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    await createBudget({
      userId: 'user-2',
      categoryId: cat2.props.id,
      name: 'Budget 2',
      amountCents: 30000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    const dashboard1 = await getBudgetDashboard('user-1');
    const dashboard2 = await getBudgetDashboard('user-2');

    expect(dashboard1.totalBudgetCents).toBe(50000);
    expect(dashboard2.totalBudgetCents).toBe(30000);
    expect(dashboard1.categories).toHaveLength(1);
    expect(dashboard2.categories).toHaveLength(1);
  });
});