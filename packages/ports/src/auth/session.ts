import type {
  AuthUser,
  AuthSession,
  AuthState,
  AuthStateChangeCallback,
} from '@budget/schemas';

/**
 * Client-side session port.
 * Manages session state and provides reactive updates.
 * Separates session concerns from auth operations.
 */
export interface SessionPort {
  // Get current state
  getState(): AuthState;
  getUser(): AuthUser | null;
  getAccessToken(): string | null;

  // Check auth status
  isAuthenticated(): boolean;
  isLoading(): boolean;

  // State subscriptions (for reactive UI updates)
  subscribe(callback: AuthStateChangeCallback): () => void;

  // Session lifecycle (called by auth service, not components)
  initialize(): Promise<void>;
  setSession(session: AuthSession): void;
  clearSession(): void;
}

// Re-export types for convenience
export type { AuthUser, AuthSession, AuthState, AuthStateChangeCallback };