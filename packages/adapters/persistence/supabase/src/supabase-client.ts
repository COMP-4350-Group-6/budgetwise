import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient } from "@supabase/supabase-js";

export interface MakeSupabaseClientOptions {
  supabaseUrl: string;
  serviceRoleKey: string;
}

export function makeSupabaseServiceClient({
  supabaseUrl,
  serviceRoleKey,
}: MakeSupabaseClientOptions): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

