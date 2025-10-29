import type { Transaction } from "@budget/domain";
import type { TransactionsRepo } from "@budget/ports";

import type { SupabasePersistenceDeps } from "./types";
import { fromTransaction, toTransaction, type TransactionRow } from "./mappers";

export function makeSupabaseTransactionsRepo({ client }: SupabasePersistenceDeps): TransactionsRepo {
  const table = "transactions";

  return {
    async getById(id: string) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("id", id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return toTransaction(data);
    },

    async listByBudget(budgetId: string, limit = 50) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("budget_id", budgetId)
        .order("occurred_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []).map(toTransaction);
    },

    async listByUserInPeriod(userId: string, startDate: Date, endDate: Date) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("user_id", userId)
        .gte("occurred_at", startDate.toISOString())
        .lte("occurred_at", endDate.toISOString())
        .order("occurred_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(toTransaction);
    },

    async create(tx: Transaction) {
      const { error } = await client
        .from(table)
        .insert(fromTransaction(tx));

      if (error) throw error;
    },

    async update(tx: Transaction) {
      const { error } = await client
        .from(table)
        .update(fromTransaction(tx))
        .eq("id", tx.props.id)
        .eq("user_id", tx.props.userId);

      if (error) throw error;
    },

    async delete(id: string) {
      const { error } = await client
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
  };
}

