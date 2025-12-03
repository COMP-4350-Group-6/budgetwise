import type { AuthClientPort, AuthProviderPort, SessionPort } from '@budget/ports';
import type { AuthUser, AuthResult, AuthStateChangeCallback, SignupInput, LoginInput } from '@budget/schemas';

export type AuthClientDeps = {
  provider: AuthProviderPort;
  session: SessionPort;
};

/**
 * High-level auth client for use in UI components.
 * Combines auth operations with session management.
 */
export function makeAuthClient(deps: AuthClientDeps): AuthClientPort {
  const { provider, session } = deps;

  return {
    async signup(input: SignupInput): Promise<AuthResult<{ user: AuthUser; requiresConfirmation: boolean }>> {
      const result = await provider.signup(input);
      
      if (!result.success || !result.data) {
        return { 
          success: false, 
          error: result.error || { code: 'UNKNOWN_ERROR', message: 'Signup failed' }
        };
      }

      const authSession = result.data;
      const requiresConfirmation = !authSession.tokens.accessToken;

      if (!requiresConfirmation) {
        // Full session available, user is logged in
        session.setSession(authSession);
      }

      return {
        success: true,
        data: {
          user: authSession.user,
          requiresConfirmation,
        },
      };
    },

    async login(input: LoginInput): Promise<AuthResult<{ user: AuthUser }>> {
      const result = await provider.login(input);
      
      if (!result.success || !result.data) {
        return { 
          success: false, 
          error: result.error || { code: 'UNKNOWN_ERROR', message: 'Login failed' }
        };
      }

      session.setSession(result.data);
      
      return {
        success: true,
        data: { user: result.data.user },
      };
    },

    async logout(): Promise<AuthResult<void>> {
      const result = await provider.logout();
      
      // Clear session regardless of logout result
      session.clearSession();
      
      return result;
    },

    async requestPasswordReset(email: string): Promise<AuthResult<void>> {
      return provider.sendPasswordResetEmail(email);
    },

    async confirmPasswordReset(token: string, newPassword: string): Promise<AuthResult<void>> {
      return provider.resetPassword(token, newPassword);
    },

    getUser(): AuthUser | null {
      return session.getUser();
    },

    getAccessToken(): string | null {
      return session.getAccessToken();
    },

    isAuthenticated(): boolean {
      return session.isAuthenticated();
    },

    subscribe(callback: AuthStateChangeCallback): () => void {
      return session.subscribe(callback);
    },

    async initialize(): Promise<void> {
      return session.initialize();
    },
  };
}
