import type { TransactionsRepo } from "@budget/ports";

export function makeDeleteTransaction(deps: { txRepo: TransactionsRepo }) {
  return async (input: { transactionId: string; userId: string }): Promise<boolean> => {
    const existing = await deps.txRepo.getById(input.transactionId);
    if (!existing || existing.props.userId !== input.userId) {
      return false;
    }

    await deps.txRepo.delete(input.transactionId);
    return true;
  };
}

