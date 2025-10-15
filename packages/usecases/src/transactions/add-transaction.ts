import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";
import type { Currency } from "@budget/domain/money";

export function makeAddTransaction(deps: {
  clock: ClockPort;
  id: IdPort;
  txRepo: TransactionsRepo;
}) {
  return async (input: {
    userId: string;
    budgetId: string;
    amountCents: number;
    categoryId?: string;
    note?: string;
    occurredAt: Date;
    // Allow optional currency to be passed by callers/tests; not persisted on Transaction
    currency?: Currency;
  }) => {
    const now = deps.clock.now();
    const tx = new Transaction({
      id: deps.id.ulid(),
      userId: input.userId,
      budgetId: input.budgetId,
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      note: input.note,
      occurredAt: input.occurredAt,
      createdAt: now,
      updatedAt: now,
    });
    await deps.txRepo.create(tx);
    return tx;
  };
}
