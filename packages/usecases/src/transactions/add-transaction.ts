import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";

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
