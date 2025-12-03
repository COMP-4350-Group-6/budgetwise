import type {
  AuthUser,
  AuthSession,
  AuthResult,
  SignupInput,
  LoginInput,
  OAuthProvider,
} from '@budget/schemas';

/**
 * Client-side authentication provider port.
 * Handles the actual communication with auth provider (Supabase, Firebase, etc.)
 * This is a LOW-LEVEL adapter interface - do not use directly in components.
 */
export interface AuthProviderPort {
  // Core auth operations
  signup(input: SignupInput): Promise<AuthResult<AuthSession>>;
  login(input: LoginInput): Promise<AuthResult<AuthSession>>;
  logout(): Promise<AuthResult<void>>;

  // Session management
  getSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthResult<AuthSession>>;

  // Password management
  sendPasswordResetEmail(email: string): Promise<AuthResult<void>>;
  resetPassword(token: string, newPassword: string): Promise<AuthResult<void>>;

  // OAuth (optional extension)
  loginWithOAuth?(provider: OAuthProvider): Promise<AuthResult<AuthSession>>;
}

// Re-export types for convenience
export type { AuthUser, AuthSession, AuthResult, SignupInput, LoginInput, OAuthProvider };