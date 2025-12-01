import type { TransactionsRepo } from "@budget/ports";
import type { TransactionDTO } from "@budget/schemas";
import { toTransactionDTO } from "../presenters";

export interface ListTransactionsParams {
  userId: string;
  /** Explicit start date. If not provided, calculated from `days`. */
  startDate?: Date;
  /** Explicit end date. Defaults to now. */
  endDate?: Date;
  /** Number of days to look back. Defaults to 30. Ignored if startDate/endDate provided. */
  days?: number;
  /** Max number of transactions to return. Defaults to 50. */
  limit?: number;
}

const DEFAULT_DAYS = 30;
const DEFAULT_LIMIT = 50;

export function makeListTransactions(deps: { txRepo: TransactionsRepo }) {
  return async (params: ListTransactionsParams): Promise<TransactionDTO[]> => {
    const { userId, days = DEFAULT_DAYS, limit = DEFAULT_LIMIT } = params;
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (params.startDate && params.endDate) {
      startDate = params.startDate;
      endDate = params.endDate;
    } else {
      endDate = params.endDate ?? now;
      startDate = params.startDate ?? new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const transactions = await deps.txRepo.listByUserInPeriod(userId, startDate, endDate);
    
    // Apply limit (transactions are already sorted by repo)
    return transactions.slice(0, limit).map(toTransactionDTO);
  };
}
