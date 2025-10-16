import { describe, it, expect, beforeEach } from 'vitest';
import { makeListBudgets } from './list-budgets';
import { makeCreateBudget } from './create-budget';
import { makeUpdateBudget } from './update-budget';
import { makeInMemBudgetsRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUlid } from '@budget/adapters-system';

describe('listBudgets (focused usecase tests)', () => {
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let listBudgets: ReturnType<typeof makeListBudgets>;
  let createBudget: ReturnType<typeof makeCreateBudget>;
  let updateBudget: ReturnType<typeof makeUpdateBudget>;
  let clock: ReturnType<typeof makeSystemClock>;
  let id: ReturnType<typeof makeUlid>;

  beforeEach(() => {
    budgetsRepo = makeInMemBudgetsRepo();
    clock = makeSystemClock();
    id = makeUlid();
    listBudgets = makeListBudgets({ budgetsRepo });
    createBudget = makeCreateBudget({ budgetsRepo, clock, id });
    updateBudget = makeUpdateBudget({ budgetsRepo, clock });
  });

  it('returns empty list when user has no budgets', async () => {
    const resultAll = await listBudgets('user-empty', false);
    const resultActive = await listBudgets('user-empty', true);
    expect(resultAll).toEqual([]);
    expect(resultActive).toEqual([]);
  });

  it('lists all budgets for the user when activeOnly=false', async () => {
    const b1 = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'A',
      amountCents: 10000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });
    const b2 = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-2',
      name: 'B',
      amountCents: 20000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });
    // Make b2 inactive
    await updateBudget(b2.props.id, 'user-1', { isActive: false });

    // Another user's budget should not appear
    await createBudget({
      userId: 'user-2',
      categoryId: 'cat-3',
      name: 'C',
      amountCents: 30000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    const result = await listBudgets('user-1', false);
    expect(result).toHaveLength(2);
    const ids = result.map(b => b.props.id);
    expect(ids).toContain(b1.props.id);
    expect(ids).toContain(b2.props.id);
  });

  it('lists only active budgets when activeOnly=true', async () => {
    const b1 = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'Groceries',
      amountCents: 50000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });
    const b2 = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-2',
      name: 'Dining Out',
      amountCents: 25000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });
    await updateBudget(b2.props.id, 'user-1', { isActive: false });

    const result = await listBudgets('user-1', true);
    expect(result).toHaveLength(1);
    expect(result[0].props.id).toBe(b1.props.id);
    expect(result[0].props.isActive).toBe(true);
  });

  it('does not include budgets from other users', async () => {
    await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'U1-Budget',
      amountCents: 11111,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });
    const u2 = await createBudget({
      userId: 'user-2',
      categoryId: 'cat-2',
      name: 'U2-Budget',
      amountCents: 22222,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    const result = await listBudgets('user-2', false);
    expect(result).toHaveLength(1);
    expect(result[0].props.userId).toBe('user-2');
    expect(result[0].props.id).toBe(u2.props.id);
  });
});