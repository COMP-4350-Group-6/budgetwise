import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { AuthClientPort } from "@budget/ports";

export type MakeSupabaseAuthClientOptions = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function mapUser(user: any) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id as string,
    email: user.email as string,
    name: (meta.name as string) || "",
    defaultCurrency: (meta.defaultCurrency as string) || "USD",
    createdAt: user.created_at as string,
  };
}

export function makeSupabaseAuthClient(opts: MakeSupabaseAuthClientOptions): AuthClientPort {
  const client: SupabaseClient = createClient(opts.supabaseUrl, opts.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return {
    async signup(input) {
      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            defaultCurrency: input.defaultCurrency,
          },
        },
      });
      if (error) throw error;
      // Supabase may require email confirmation; nothing else to return per port.
    },

    async login(input) {
      const { error } = await client.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error) throw error;
    },

    async logout() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },

    async refreshToken() {
      // Supabase auto-refreshes; MVP no-op.
    },

    async getMe() {
      const { data } = await client.auth.getUser();
      return mapUser(data.user);
    },

    async getSessionToken(): Promise<string | null> {
      const { data, error } = await client.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return null;
      }
      if (!data.session) {
        console.error("No active session found");
        return null;
      }
      const token = data.session.access_token;
      console.log("Retrieved session token:", token ? `${token.substring(0, 20)}...` : "null");
      return token || null;
    },
  };
}


