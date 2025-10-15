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

describe('Budget constructor validation', () => {
  function base(overrides: Partial<BudgetProps> = {}): BudgetProps {
    return {
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
      ...overrides,
    };
  }

  it('throws on non-integer amountCents', () => {
    expect(() => new Budget(base({ amountCents: 10000.5 })))
      .toThrow('amountCents must be integer');
  });

  it('throws on negative amountCents', () => {
    expect(() => new Budget(base({ amountCents: -1 })))
      .toThrow('Budget amount cannot be negative');
  });

  it('throws on empty name', () => {
    expect(() => new Budget(base({ name: '' })))
      .toThrow('Budget name cannot be empty');
  });

  it('throws when categoryId is missing/empty', () => {
    expect(() => new Budget(base({ categoryId: '' })))
      .toThrow('Budget must have a category');
  });

  it('throws when endDate is before startDate', () => {
    expect(() => new Budget(base({
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-01-09'),
    }))).toThrow('End date cannot be before start date');
  });

  it('throws when alertThreshold is below 0', () => {
    expect(() => new Budget(base({ alertThreshold: -1 })))
      .toThrow('Alert threshold must be between 0 and 100');
  });

  it('throws when alertThreshold is above 100', () => {
    expect(() => new Budget(base({ alertThreshold: 101 })))
      .toThrow('Alert threshold must be between 0 and 100');
  });

  it('allows alertThreshold of 0 and 100', () => {
    expect(() => new Budget(base({ alertThreshold: 0 }))).not.toThrow();
    expect(() => new Budget(base({ alertThreshold: 100 }))).not.toThrow();
  });
});

describe('Budget getters and amount()', () => {
  it('amount() returns Money with correct cents and currency', () => {
    const b = new Budget({
      id: 'b2',
      userId: 'u1',
      categoryId: 'c1',
      name: 'Money Check',
      amountCents: 12345,
      currency: 'CAD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    });
    const m = b.amount;
    expect(m.cents).toBe(12345);
    expect(m.currency).toBe('CAD');
    expect(m.toAmount()).toBe(123.45);
    expect(b.id).toBe('b2');
    expect(b.name).toBe('Money Check');
    expect(b.period).toBe('MONTHLY');
    expect(b.categoryId).toBe('c1');
  });
});

describe('Budget.isActive(date)', () => {
  function mk(overrides: Partial<BudgetProps> = {}) {
    return new Budget({
      id: 'b3',
      userId: 'u1',
      categoryId: 'c1',
      name: 'Active Check',
      amountCents: 5000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-01-20'),
      isActive: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      ...overrides,
    });
  }

  it('returns false when budget is globally inactive', () => {
    const b = mk({ isActive: false });
    expect(b.isActive(new Date('2025-01-15'))).toBe(false);
  });

  it('returns false when date is before startDate', () => {
    const b = mk();
    expect(b.isActive(new Date('2025-01-09'))).toBe(false);
  });

  it('returns true on exact startDate', () => {
    const b = mk({ startDate: new Date('2025-01-10') });
    expect(b.isActive(new Date('2025-01-10'))).toBe(true);
  });

  it('returns true within the inclusive window', () => {
    const b = mk();
    expect(b.isActive(new Date('2025-01-15'))).toBe(true);
  });

  it('returns true on exact endDate (inclusive)', () => {
    const b = mk({ endDate: new Date('2025-01-20') });
    expect(b.isActive(new Date('2025-01-20'))).toBe(true);
  });

  it('returns false after endDate', () => {
    const b = mk();
    expect(b.isActive(new Date('2025-01-21'))).toBe(false);
  });

  it('active with no endDate when started and not globally paused', () => {
    const b = mk({ endDate: undefined });
    expect(b.isActive(new Date('2025-01-25'))).toBe(true);
  });
});