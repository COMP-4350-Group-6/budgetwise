import type { Budget } from "@budget/domain/budget";
import type { BudgetsRepo } from "@budget/ports";

export function makeInMemBudgetsRepo(): BudgetsRepo {
  const budgets = new Map<string, Budget>();

  return {
    async getById(id: string): Promise<Budget | null> {
      return budgets.get(id) || null;
    },

    async listByUser(userId: string): Promise<Budget[]> {
      return Array.from(budgets.values())
        .filter(b => b.props.userId === userId);
    },

    async listActiveByUser(userId: string, date?: Date): Promise<Budget[]> {
      const checkDate = date || new Date();
      return Array.from(budgets.values())
        .filter(b => b.props.userId === userId && b.isActive(checkDate));
    },

    async listByCategory(userId: string, categoryId: string): Promise<Budget[]> {
      return Array.from(budgets.values())
        .filter(b => b.props.userId === userId && b.props.categoryId === categoryId);
    },

    async create(budget: Budget): Promise<void> {
      budgets.set(budget.id, budget);
    },

    async update(budget: Budget): Promise<void> {
      budgets.set(budget.id, budget);
    },

    async delete(id: string): Promise<void> {
      budgets.delete(id);
    },
  };
}