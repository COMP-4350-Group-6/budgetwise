import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";

export function makeInMemTransactionsRepo(): TransactionsRepo {
  const byId = new Map<string, Transaction>();
  return {
    async getById(id) { return byId.get(id) ?? null; },
    async listByBudget(budgetId, lim = 50) {
      return Array.from(byId.values()).filter(t => t.props.budgetId === budgetId).slice(0, lim);
    },
    async create(tx) { byId.set(tx.props.id, tx); },
    async update(tx) { byId.set(tx.props.id, tx); },
    async delete(id) { byId.delete(id); }
  };
}
