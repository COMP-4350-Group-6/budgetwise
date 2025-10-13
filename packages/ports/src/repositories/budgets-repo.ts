import type { Budget } from "@budget/domain/budget";

export interface BudgetsRepo {
  getById(id: string): Promise<Budget | null>;
  listByUser(userId: string): Promise<Budget[]>;
  listActiveByUser(userId: string, date?: Date): Promise<Budget[]>;
  listByCategory(userId: string, categoryId: string): Promise<Budget[]>;
  create(budget: Budget): Promise<void>;
  update(budget: Budget): Promise<void>;
  delete(id: string): Promise<void>;
}