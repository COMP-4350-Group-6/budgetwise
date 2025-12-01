import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreateBudget } from './create-budget';
import { makeInMemBudgetsRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUlid } from '@budget/adapters-system';

describe('createBudget', () => {
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let createBudget: ReturnType<typeof makeCreateBudget>;
  let clock: ReturnType<typeof makeSystemClock>;
  let id: ReturnType<typeof makeUlid>;

  beforeEach(() => {
    budgetsRepo = makeInMemBudgetsRepo();
    clock = makeSystemClock();
    id = makeUlid();
    createBudget = makeCreateBudget({ budgetsRepo, clock, id });
  });

  it('should create a new budget with valid data', async () => {
    const input = {
      userId: 'user-123',
      categoryId: 'cat-123',
      name: 'Monthly Groceries',
      amountCents: 50000, // $500
      currency: 'CAD' as const,
      period: 'MONTHLY' as const,
      startDate: new Date('2025-01-01'),
    };

    const budget = await createBudget(input);

    expect(budget).toHaveProperty('id');
    expect(budget.userId).toBe(input.userId);
    expect(budget.categoryId).toBe(input.categoryId);
    expect(budget.name).toBe(input.name);
    expect(budget.amountCents).toBe(input.amountCents);
    expect(budget.currency).toBe(input.currency);
    expect(budget.period).toBe(input.period);
    expect(budget.isActive).toBe(true);
    expect(budget.id).toBeDefined();
    expect(budget.createdAt).toBeInstanceOf(Date);
    expect(budget.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a budget with optional alert threshold', async () => {
    const input = {
      userId: 'user-123',
      categoryId: 'cat-123',
      name: 'Monthly Groceries',
      amountCents: 50000,
      currency: 'CAD' as const,
      period: 'MONTHLY' as const,
      startDate: new Date('2025-01-01'),
      alertThreshold: 80,
    };

    const budget = await createBudget(input);

    expect(budget.alertThreshold).toBe(80);
  });

  it('should create a budget with end date', async () => {
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    
    const input = {
      userId: 'user-123',
      categoryId: 'cat-123',
      name: 'Yearly Travel',
      amountCents: 200000,
      currency: 'CAD' as const,
      period: 'YEARLY' as const,
      startDate,
      endDate,
    };

    const budget = await createBudget(input);

    expect(budget.endDate).toEqual(endDate);
  });

  it('should persist the budget to the repository', async () => {
    const input = {
      userId: 'user-123',
      categoryId: 'cat-123',
      name: 'Monthly Groceries',
      amountCents: 50000,
      currency: 'CAD' as const,
      period: 'MONTHLY' as const,
      startDate: new Date('2025-01-01'),
    };

    const budget = await createBudget(input);
    const retrieved = await budgetsRepo.getById(budget.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.props.id).toBe(budget.id);
    expect(retrieved?.props.name).toBe(input.name);
  });

  it('should create multiple budgets for different categories', async () => {
    const budget1 = await createBudget({
      userId: 'user-123',
      categoryId: 'cat-groceries',
      name: 'Groceries',
      amountCents: 50000,
      currency: 'CAD' as const,
      period: 'MONTHLY' as const,
      startDate: new Date('2025-01-01'),
    });

    const budget2 = await createBudget({
      userId: 'user-123',
      categoryId: 'cat-entertainment',
      name: 'Entertainment',
      amountCents: 20000,
      currency: 'CAD' as const,
      period: 'MONTHLY' as const,
      startDate: new Date('2025-01-01'),
    });

    expect(budget1.id).not.toBe(budget2.id);
    expect(budget1.categoryId).not.toBe(budget2.categoryId);
  });
});