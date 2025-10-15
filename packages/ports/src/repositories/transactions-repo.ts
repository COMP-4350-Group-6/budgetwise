import type { Transaction } from "@budget/domain/transaction";

export interface TransactionsRepo {
  getById(id: string): Promise<Transaction | null>;
  listByBudget(budgetId: string, limit?: number): Promise<Transaction[]>;
  listByUserInPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  create(tx: Transaction): Promise<void>;
  update(tx: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
