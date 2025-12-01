import type { Transaction } from "@budget/domain/transaction";

export interface TransactionsRepo {
  getById(id: string): Promise<Transaction | null>;
  listByBudget(budgetId: string, limit?: number): Promise<Transaction[]>;
  listByBudgetInPeriod(budgetId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  listByUserInPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  sumSpentByBudgetInPeriod(budgetId: string, startDate: Date, endDate: Date): Promise<{ totalCents: number; count: number }>;
  sumSpentByCategoryWithoutBudget(userId: string, categoryId: string): Promise<number>;
  create(tx: Transaction): Promise<void>;
  update(tx: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
  clear?(): void; // For testing
}
