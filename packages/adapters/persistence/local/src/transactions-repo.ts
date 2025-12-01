import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";

export function makeInMemTransactionsRepo(): TransactionsRepo {
  const byId = new Map<string, Transaction>();
  return {
    async getById(id) { return byId.get(id) ?? null; },
    async listByBudget(budgetId, lim = 50) {
      return Array.from(byId.values()).filter(t => t.props.budgetId === budgetId).slice(0, lim);
    },
    async listByBudgetInPeriod(budgetId: string, startDate: Date, endDate: Date) {
      return Array.from(byId.values())
        .filter(tx =>
          tx.props.budgetId === budgetId &&
          tx.props.occurredAt >= startDate &&
          tx.props.occurredAt <= endDate
        )
        .sort((a, b) => b.props.occurredAt.getTime() - a.props.occurredAt.getTime());
    },
    async listByUserInPeriod(userId: string, startDate: Date, endDate: Date) {
      return Array.from(byId.values())
        .filter(tx =>
          tx.props.userId === userId &&
          tx.props.occurredAt >= startDate &&
          tx.props.occurredAt <= endDate
        )
        .sort((a, b) => b.props.occurredAt.getTime() - a.props.occurredAt.getTime());
    },
    async sumSpentByBudgetInPeriod(budgetId: string, startDate: Date, endDate: Date) {
      const txs = Array.from(byId.values()).filter(tx =>
        tx.props.budgetId === budgetId &&
        tx.props.occurredAt >= startDate &&
        tx.props.occurredAt <= endDate
      );
      return {
        totalCents: txs.reduce((sum, tx) => sum + Math.abs(tx.props.amountCents), 0),
        count: txs.length,
      };
    },
    async sumSpentByCategoryWithoutBudget(userId: string, categoryId: string) {
      return Array.from(byId.values())
        .filter(tx =>
          tx.props.userId === userId &&
          tx.props.categoryId === categoryId &&
          !tx.props.budgetId
        )
        .reduce((sum, tx) => sum + Math.abs(tx.props.amountCents), 0);
    },
    async create(tx) { byId.set(tx.props.id, tx); },
    async update(tx) { byId.set(tx.props.id, tx); },
    async delete(id) { byId.delete(id); },

    // For testing
    clear() {
      byId.clear();
    },
  };
}
