import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";
import type { Currency } from "@budget/domain/money";
import type { TransactionDTO } from "@budget/schemas";
import { toTransactionDTO } from "../presenters";

export function makeAddTransaction(deps: {
  clock: ClockPort;
  id: IdPort;
  txRepo: TransactionsRepo;
}) {
  return async (input: {
    userId: string;
    budgetId?: string;
    amountCents: number;
    categoryId?: string;
    note?: string;
    occurredAt: Date;
    // Allow optional currency to be passed by callers/tests; not persisted on Transaction
    currency?: Currency;
  }): Promise<TransactionDTO> => {
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
    return toTransactionDTO(tx);
  };
}
