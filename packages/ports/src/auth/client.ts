import type {
  AuthUser,
  AuthResult,
  AuthStateChangeCallback,
  SignupInput,
  LoginInput,
} from '@budget/schemas';

/**
 * High-level auth client interface for use in components/hooks.
 * Combines auth operations with session management and navigation.
 */
export interface AuthClientPort {
  // Auth operations with built-in state management
  signup(input: SignupInput): Promise<AuthResult<{ user: AuthUser; requiresConfirmation: boolean }>>;
  login(input: LoginInput): Promise<AuthResult<{ user: AuthUser }>>;
  logout(): Promise<AuthResult<void>>;

  // Password reset flow
  requestPasswordReset(email: string): Promise<AuthResult<void>>;
  confirmPasswordReset(token: string, newPassword: string): Promise<AuthResult<void>>;

  // Session access
  getUser(): AuthUser | null;
  getAccessToken(): string | null;
  isAuthenticated(): boolean;

  // Reactive state
  subscribe(callback: AuthStateChangeCallback): () => void;

  // Initialization
  initialize(): Promise<void>;
}