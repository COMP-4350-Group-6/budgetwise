import type { SupabaseClient } from "@supabase/supabase-js";

export interface SupabasePersistenceConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}

export interface SupabasePersistenceDeps {
  client: SupabaseClient;
}


