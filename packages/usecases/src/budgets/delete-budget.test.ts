import { describe, it, expect, beforeEach } from 'vitest';
import { makeCreateBudget } from './create-budget';
import { makeDeleteBudget } from './delete-budget';
import { makeInMemBudgetsRepo } from '@budget/adapters-persistence-local';
import { makeSystemClock, makeUlid } from '@budget/adapters-system';

describe('deleteBudget (focused usecase tests)', () => {
  let budgetsRepo: ReturnType<typeof makeInMemBudgetsRepo>;
  let createBudget: ReturnType<typeof makeCreateBudget>;
  let deleteBudget: ReturnType<typeof makeDeleteBudget>;
  let clock: ReturnType<typeof makeSystemClock>;
  let id: ReturnType<typeof makeUlid>;

  beforeEach(() => {
    budgetsRepo = makeInMemBudgetsRepo();
    clock = makeSystemClock();
    id = makeUlid();
    createBudget = makeCreateBudget({ budgetsRepo, clock, id });
    deleteBudget = makeDeleteBudget({ budgetsRepo });
  });

  it('deletes an existing budget for the same user', async () => {
    const budget = await createBudget({
      userId: 'user-1',
      categoryId: 'cat-1',
      name: 'To Delete',
      amountCents: 12345,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    // Sanity check it exists
    const found = await budgetsRepo.getById(budget.id);
    expect(found?.props.id).toBe(budget.id);

    // Delete and verify gone
    await expect(deleteBudget(budget.id, 'user-1')).resolves.toBeUndefined();

    const after = await budgetsRepo.getById(budget.id);
    expect(after).toBeNull();

    // Verify user listing is empty
    const list = await budgetsRepo.listByUser('user-1');
    expect(list).toHaveLength(0);
  });

  it('throws "Budget not found" when id does not exist', async () => {
    await expect(deleteBudget('non-existent-id', 'user-1'))
      .rejects.toThrow('Budget not found');
  });

  it('throws "Unauthorized" when deleting a budget owned by another user', async () => {
    const budget = await createBudget({
      userId: 'owner',
      categoryId: 'cat-1',
      name: 'Owner Budget',
      amountCents: 5000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    await expect(deleteBudget(budget.id, 'intruder'))
      .rejects.toThrow('Unauthorized');

    // Ensure it still exists after failed delete
    const stillThere = await budgetsRepo.getById(budget.id);
    expect(stillThere).not.toBeNull();
    expect(stillThere?.props.userId).toBe('owner');
  });

  it('throws "Budget not found" if attempting to delete twice', async () => {
    const budget = await createBudget({
      userId: 'user-2',
      categoryId: 'cat-2',
      name: 'Delete Twice',
      amountCents: 1000,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: new Date('2025-01-01'),
    });

    // First delete works
    await expect(deleteBudget(budget.id, 'user-2')).resolves.toBeUndefined();

    // Second delete should report not found
    await expect(deleteBudget(budget.id, 'user-2'))
      .rejects.toThrow('Budget not found');
  });
});