import type { User } from "@budget/domain";
import type { UsersRepo } from "@budget/ports";

import type { SupabasePersistenceDeps } from "./types";
import { fromUser, toUser, type UserRow } from "./mappers";

export function makeSupabaseUsersRepo({ client }: SupabasePersistenceDeps): UsersRepo {
  const table = "profiles";

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
      return toUser(data);
    },

    async getByEmail(email: string) {
      const { data, error } = await client
        .from(table)
        .select()
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return toUser(data);
    },

    async create(user: User) {
      const { error } = await client
        .from(table)
        .insert(fromUser(user));

      if (error) throw error;
    },

    async update(user: User) {
      const { error } = await client
        .from(table)
        .update(fromUser(user))
        .eq("id", user.id);

      if (error) throw error;
    },

    async delete(id: string) {
      const { error } = await client
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },

    async exists(id: string) {
      const { data, error } = await client
        .from(table)
        .select("id")
        .eq("id", id)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    },
  };
}

