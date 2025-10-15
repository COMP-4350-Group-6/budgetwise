import { describe, it, expect } from 'vitest';
import { Budget } from './budget';
import type { BudgetProps } from './budget';

function makeBudget(overrides: Partial<BudgetProps> = {}): Budget {
  const base: BudgetProps = {
    id: 'b1',
    userId: 'u1',
    categoryId: 'c1',
    name: 'Test Budget',
    amountCents: 10000,
    currency: 'USD',
    period: 'MONTHLY',
    startDate: new Date('2025-01-01'),
    isActive: true,
    alertThreshold: undefined,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };
  return new Budget({ ...base, ...overrides });
}

describe('Budget.shouldAlert', () => {
  it('does not alert when no threshold is set', () => {
    const budget = makeBudget({ alertThreshold: undefined });
    expect(budget.shouldAlert(5000)).toBe(false);
  });

  it('alerts on any spend when threshold is 0 (but not when spent is 0)', () => {
    const budget = makeBudget({ alertThreshold: 0, amountCents: 50000 });
    expect(budget.shouldAlert(0)).toBe(false);
    expect(budget.shouldAlert(1)).toBe(true);
  });

  it('alerts at the threshold boundary (>=)', () => {
    const budget = makeBudget({ alertThreshold: 80, amountCents: 10000 });
    expect(budget.shouldAlert(8000)).toBe(true);
    expect(budget.shouldAlert(7999)).toBe(false);
  });

  it('with zero budget and non-zero threshold alerts on any spend > 0', () => {
    const budget = makeBudget({ amountCents: 0, alertThreshold: 50 });
    expect(budget.shouldAlert(0)).toBe(false);
    expect(budget.shouldAlert(1)).toBe(true);
  });
});