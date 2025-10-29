import type { Category } from "@budget/domain";
import type { CategoriesRepo } from "@budget/ports";

import type { SupabasePersistenceDeps } from "./types";
import { fromCategory, toCategory, type CategoryRow } from "./mappers";

export function makeSupabaseCategoriesRepo({ client }: SupabasePersistenceDeps): CategoriesRepo {
  const table = "categories";

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
      return toCategory(data);
    },

    async listByUser(userId: string) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(toCategory);
    },

    async listActiveByUser(userId: string) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(toCategory);
    },

    async create(category: Category) {
      const { error } = await client
        .from(table)
        .insert(fromCategory(category));

      if (error) throw error;
    },

    async update(category: Category) {
      const { error } = await client
        .from(table)
        .update(fromCategory(category))
        .eq("id", category.id)
        .eq("user_id", category.props.userId);

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

