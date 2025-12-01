import type { TransactionsRepo } from "@budget/ports";
import type { TransactionDTO } from "@budget/schemas";
import { toTransactionDTO } from "../presenters";

export function makeGetTransaction(deps: { txRepo: TransactionsRepo }) {
  return async (transactionId: string): Promise<TransactionDTO | null> => {
    const transaction = await deps.txRepo.getById(transactionId);
    return transaction ? toTransactionDTO(transaction) : null;
  };
}
