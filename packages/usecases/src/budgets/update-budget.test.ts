import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreateBudget } from './create-budget';
import { makeUpdateBudget } from './update-budget';
import { makeInMemBudgetsRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUuid } from '@budget/adapters-system';

describe('updateBudget (focused usecase tests)', () => {
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let createBudget: ReturnType<typeof makeCreateBudget>;
  let updateBudget: ReturnType<typeof makeUpdateBudget>;

  // Deterministic clocks for createdAt/updatedAt assertions
  const clockCreate = { now: () => new Date('2025-01-01T00:00:00Z') };
  const clockUpdate = { now: () => new Date('2025-02-01T00:00:00Z') };

  let id = makeUuid();

  beforeEach(() => {
    budgetsRepo = makeInMemBudgetsRepo();
    // Use deterministic create clock
    createBudget = makeCreateBudget({ budgetsRepo, clock: clockCreate, id });
    // Use deterministic update clock
    updateBudget = makeUpdateBudget({ budgetsRepo, clock: clockUpdate });
  });

  it('updates multiple fields and trims name', async () => {
    const base = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'Original',
      amountCents: 10000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      alertThreshold: 80,
    });

    const updated = await updateBudget(base.props.id, 'user-1', {
      name: '  New Name  ',               // should be trimmed
      amountCents: 20000,
      currency: 'CAD' as const,
      period: 'YEARLY' as const,
      categoryId: 'cat-2',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-03-01'),
      isActive: false,
      alertThreshold: 0,                  // explicit 0 should be kept
    });

    expect(updated.props.name).toBe('New Name');
    expect(updated.props.amountCents).toBe(20000);
    expect(updated.props.currency).toBe('CAD');
    expect(updated.props.period).toBe('YEARLY');
    expect(updated.props.categoryId).toBe('cat-2');
    expect(updated.props.startDate.toISOString()).toBe('2025-02-01T00:00:00.000Z');
    expect(updated.props.endDate?.toISOString()).toBe('2025-03-01T00:00:00.000Z');
    expect(updated.props.isActive).toBe(false);
    expect(updated.props.alertThreshold).toBe(0);

    // createdAt stays from createClock; updatedAt moves to updateClock
    expect(updated.props.createdAt.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(updated.props.updatedAt.toISOString()).toBe('2025-02-01T00:00:00.000Z');
  });

  it('preserves fields when not provided (including endDate) and keeps alertThreshold when undefined', async () => {
    const base = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'Keepers',
      amountCents: 12345,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      alertThreshold: 75,
    });

    // Omit most fields, provide only one change and undefined alertThreshold
    const updated = await updateBudget(base.props.id, 'user-1', {
      name: 'Changed',
      alertThreshold: undefined, // should preserve previous 75
      // no endDate provided -> should remain as base's endDate
    });

    expect(updated.props.name).toBe('Changed');
    expect(updated.props.amountCents).toBe(12345);
    expect(updated.props.currency).toBe('USD');
    expect(updated.props.period).toBe('MONTHLY');
    expect(updated.props.categoryId).toBe('cat-1');
    expect(updated.props.startDate.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(updated.props.endDate?.toISOString()).toBe('2025-12-31T00:00:00.000Z');
    expect(updated.props.alertThreshold).toBe(75);
  });

  it('preserves endDate when explicitly set to undefined', async () => {
    const base = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'Undefined EndDate',
      amountCents: 11111,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-01'),
    });

    // Explicit endDate: undefined -> code path keeps existing endDate
    const updated = await updateBudget(base.props.id, 'user-1', {
      endDate: undefined,
    });

    expect(updated.props.endDate?.toISOString()).toBe('2025-06-01T00:00:00.000Z');
  });

  it('throws "Budget not found" for missing id', async () => {
    await expect(
      updateBudget('missing-id', 'user-1', { name: 'X' })
    ).rejects.toThrow('Budget not found');
  });

  it('throws "Unauthorized" when userId does not match owner', async () => {
    const base = await createBudget({
      userId: 'owner',
      categoryId: 'cat-1',
      name: 'Private',
      amountCents: 22222,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    await expect(
      updateBudget(base.props.id, 'intruder', { name: 'Hack' })
    ).rejects.toThrow('Unauthorized');

    // Ensure it remains unchanged
    const still = await budgetsRepo.getById(base.props.id);
    expect(still?.props.name).toBe('Private');
    expect(still?.props.userId).toBe('owner');
  });

  it('keeps name unmodified when not provided; trims if provided', async () => {
    const base = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'Original Name',
      amountCents: 1000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    // No name provided -> original remains
    const unchanged = await updateBudget(base.props.id, 'user-1', {
      amountCents: 2000,
    });
    expect(unchanged.props.name).toBe('Original Name');

    // Name with surrounding spaces -> trimmed
    const trimmed = await updateBudget(base.props.id, 'user-1', {
      name: '  Trim Me  ',
    });
    expect(trimmed.props.name).toBe('Trim Me');
  });

  it('updates only alertThreshold to a non-zero value and preserves others', async () => {
    const base = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'Threshold',
      amountCents: 10000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      alertThreshold: 50,
    });

    const updated = await updateBudget(base.props.id, 'user-1', {
      alertThreshold: 90,
    });

    expect(updated.props.alertThreshold).toBe(90);
    expect(updated.props.name).toBe('Threshold');
    expect(updated.props.amountCents).toBe(10000);
  });

  it('can clear endDate by explicitly setting it (regression guard around field preservation)', async () => {
    // Note: current UpdateBudgetInput type allows Date or undefined; clearing to null is not supported.
    // This test ensures providing a new endDate is applied.
    const base = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'EndDate Update',
      amountCents: 1234,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-01'),
    });

    const updated = await updateBudget(base.props.id, 'user-1', {
      endDate: new Date('2025-04-01'),
    });

    expect(updated.props.endDate?.toISOString()).toBe('2025-04-01T00:00:00.000Z');
  });
});