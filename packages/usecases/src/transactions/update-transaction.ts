import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";
import type { ClockPort } from "@budget/ports";

export function makeUpdateTransaction(deps: {
  clock: ClockPort;
  txRepo: TransactionsRepo;
}) {
  return async (input: {
    transactionId: string;
    userId: string;
    budgetId?: string;
    categoryId?: string;
    amountCents?: number;
    note?: string;
    occurredAt?: Date;
  }) => {
    const existing = await deps.txRepo.getById(input.transactionId);
    if (!existing || existing.props.userId !== input.userId) {
      return null;
    }

    const now = deps.clock.now();

    const updated = new Transaction({
      ...existing.props,
      budgetId: input.budgetId ?? existing.props.budgetId,
      categoryId: input.categoryId ?? existing.props.categoryId,
      amountCents: input.amountCents ?? existing.props.amountCents,
      note: input.note ?? existing.props.note,
      occurredAt: input.occurredAt ?? existing.props.occurredAt,
      updatedAt: now,
    });

    await deps.txRepo.update(updated);
    return updated;
  };
}

