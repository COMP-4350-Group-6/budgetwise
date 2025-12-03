import { makeApiAuthProvider } from "@budget/adapters-auth-api";
import { makeSessionManager, makeAuthClient } from "@budget/usecases";

export type WebAuthApiOptions = {
  /** Base URL of the API (e.g., "http://localhost:8787" or "https://api.budgetwise.ca") */
  apiUrl: string;
};

/**
 * Creates the web auth client container using API-based authentication.
 * 
 * This container uses HttpOnly cookies managed by the API instead of
 * client-side tokens. This is more secure against XSS attacks.
 * 
 * Usage:
 * ```typescript
 * const container = makeWebAuthApiContainer({ apiUrl: 'http://localhost:8787' });
 * 
 * // Initialize on app start (checks for existing session via /auth/me)
 * await container.authClient.initialize();
 * 
 * // Use in components
 * const result = await container.authClient.login({ email, password });
 * if (result.success) {
 *   // Redirect to dashboard
 * }
 * ```
 */
export function makeWebAuthApiContainer(opts: WebAuthApiOptions) {
  // Create the API-based provider (uses HttpOnly cookies)
  const provider = makeApiAuthProvider({
    apiUrl: opts.apiUrl,
  });

  // Create session manager (manages reactive state in-memory)
  const session = makeSessionManager(provider);

  // Create high-level auth client (what components use)
  const authClient = makeAuthClient({ provider, session });

  return { authClient, provider, session };
}

/** Container type - use this in apps instead of importing port interfaces */
export type WebAuthApiContainerType = ReturnType<typeof makeWebAuthApiContainer>;

// Re-export data types only (not port interfaces)
export type { AuthUser, AuthResult, AuthState, SignupInput, LoginInput } from "@budget/schemas";
