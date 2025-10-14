import { makeSupabaseAuthClient } from "@budget/adapters-auth-supabase";
import { makeAuthClientUsecases } from "@budget/usecases";

export type MakeWebAuthClientOptions = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function makeWebAuthClientContainer(opts: MakeWebAuthClientOptions) {
  const auth = makeSupabaseAuthClient({
    supabaseUrl: opts.supabaseUrl,
    supabaseAnonKey: opts.supabaseAnonKey,
  });

  return {
    ports: { auth },
    usecases: {
      auth: makeAuthClientUsecases({ auth }),
    },
  };
}


