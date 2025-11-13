import type { Budget } from "@budget/domain";
import type { BudgetsRepo } from "@budget/ports";

import type { SupabasePersistenceDeps } from "./types";
import { fromBudget, toBudget, type BudgetRow } from "./mappers";

export function makeSupabaseBudgetsRepo({ client }: SupabasePersistenceDeps): BudgetsRepo {
  const table = "budgets";

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
      return toBudget(data);
    },

    async listByUser(userId: string) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(toBudget);
    },

    async listActiveByUser(userId: string, date?: Date) {
      let query = client
        .from(table)
        .select()
        .eq("user_id", userId)
        .eq("is_active", true);

      if (date) {
        query = query
          .lte("start_date", date.toISOString())
          .or(`end_date.is.null,end_date.gte.${date.toISOString()}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(toBudget);
    },

    async listByCategory(userId: string, categoryId: string) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("user_id", userId)
        .eq("category_id", categoryId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(toBudget);
    },

    async create(budget: Budget) {
      const { error } = await client
        .from(table)
        .insert(fromBudget(budget));

      if (error) throw error;
    },

    async update(budget: Budget) {
      const { error } = await client
        .from(table)
        .update(fromBudget(budget))
        .eq("id", budget.id)
        .eq("user_id", budget.props.userId);

      if (error) throw error;
    },

    async delete(id: string, userId?: string) {
      let query = client
        .from(table)
        .delete()
        .eq("id", id);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { error } = await query;
      if (error) throw error;
    },
  };
}

