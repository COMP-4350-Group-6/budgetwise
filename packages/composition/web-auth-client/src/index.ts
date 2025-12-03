import { makeSupabaseAuthProvider } from "@budget/adapters-auth-supabase";
import { makeSessionManager, makeAuthClient } from "@budget/usecases";

export type WebAuthClientOptions = {
  supabaseUrl: string;
  supabasePublishableKey: string;
};

/**
 * Creates the web auth client container with all dependencies wired up.
 * 
 * Usage:
 * ```typescript
 * const container = makeWebAuthClientContainer({ supabaseUrl, supabasePublishableKey });
 * 
 * // Initialize on app start
 * await container.authClient.initialize();
 * 
 * // Use in components
 * const result = await container.authClient.login({ email, password });
 * if (result.success) {
 *   // Redirect to dashboard
 * } else {
 *   // Show error: result.error.message
 * }
 * ```
 */
export function makeWebAuthClientContainer(opts: WebAuthClientOptions) {
  // Create the low-level provider (talks to Supabase)
  const provider = makeSupabaseAuthProvider({
    supabaseUrl: opts.supabaseUrl,
    supabaseAnonKey: opts.supabasePublishableKey,
  });

  // Create session manager (manages reactive state)
  const session = makeSessionManager(provider);

  // Create high-level auth client (what components use)
  const authClient = makeAuthClient({ provider, session });

  return { authClient, provider, session };
}

/** Container type - use this in apps instead of importing port interfaces */
export type WebAuthClientContainerType = ReturnType<typeof makeWebAuthClientContainer>;


