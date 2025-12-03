import { createClient, SupabaseClient, AuthError as SupabaseAuthError, Session, User } from "@supabase/supabase-js";
import type { 
  AuthProviderPort, 
  AuthUser, 
  AuthSession, 
  AuthResult, 
  SignupInput,
  LoginInput 
} from "@budget/ports";
import type { AuthErrorCode } from "@budget/schemas";

export type SupabaseAuthOptions = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

// Map Supabase user to our AuthUser type
function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    name: (meta.name as string) || "",
    defaultCurrency: (meta.defaultCurrency as string) || "USD",
    createdAt: user.created_at,
  };
}

// Map Supabase session to our AuthSession type
function mapSession(session: Session, user: AuthUser): AuthSession {
  return {
    user,
    tokens: {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ? session.expires_at * 1000 : undefined,
    },
  };
}

// Map Supabase errors to our error codes
function mapError(error: SupabaseAuthError): { code: AuthErrorCode; message: string } {
  const message = error.message;
  
  if (message.includes('Invalid login credentials')) {
    return { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
  }
  if (message.includes('User already registered')) {
    return { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists' };
  }
  if (message.includes('Email not confirmed')) {
    return { code: 'EMAIL_NOT_CONFIRMED', message: 'Please confirm your email before logging in' };
  }
  if (message.includes('Password should be')) {
    return { code: 'WEAK_PASSWORD', message };
  }
  if (message.includes('JWT expired') || message.includes('session expired')) {
    return { code: 'SESSION_EXPIRED', message: 'Your session has expired. Please log in again.' };
  }
  if (message.includes('Invalid token') || message.includes('invalid JWT')) {
    return { code: 'INVALID_TOKEN', message: 'Invalid authentication token' };
  }
  
  return { code: 'UNKNOWN_ERROR', message };
}

/**
 * Supabase implementation of AuthProviderPort.
 * This is the low-level adapter that talks to Supabase.
 */
export function makeSupabaseAuthProvider(opts: SupabaseAuthOptions): AuthProviderPort {
  const client: SupabaseClient = createClient(opts.supabaseUrl, opts.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return {
    async signup(input: SignupInput): Promise<AuthResult<AuthSession>> {
      try {
        const { data, error } = await client.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            data: {
              name: input.name,
              defaultCurrency: input.defaultCurrency || 'USD',
            },
          },
        });

        if (error) {
          return { success: false, error: mapError(error) };
        }

        // Handle email confirmation required
        if (data.user && !data.session) {
          // User created but needs email confirmation
          const user = mapUser(data.user);
          if (!user) {
            return { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Failed to create user' } };
          }
          // Return a partial session (no tokens until confirmed)
          return {
            success: true,
            data: {
              user,
              tokens: { accessToken: '', refreshToken: '' },
            },
          };
        }

        if (!data.session || !data.user) {
          return { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Signup failed' } };
        }

        const user = mapUser(data.user)!;
        return { success: true, data: mapSession(data.session, user) };
      } catch (e) {
        return { 
          success: false, 
          error: { code: 'NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' } 
        };
      }
    },

    async login(input: LoginInput): Promise<AuthResult<AuthSession>> {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          return { success: false, error: mapError(error) };
        }

        if (!data.session || !data.user) {
          return { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Login failed' } };
        }

        const user = mapUser(data.user)!;
        return { success: true, data: mapSession(data.session, user) };
      } catch (e) {
        return { 
          success: false, 
          error: { code: 'NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' } 
        };
      }
    },

    async logout(): Promise<AuthResult<void>> {
      try {
        const { error } = await client.auth.signOut();
        if (error) {
          return { success: false, error: mapError(error) };
        }
        return { success: true };
      } catch (e) {
        return { 
          success: false, 
          error: { code: 'NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' } 
        };
      }
    },

    async getSession(): Promise<AuthSession | null> {
      try {
        const { data, error } = await client.auth.getSession();
        if (error || !data.session) return null;
        
        const user = mapUser(data.session.user);
        if (!user) return null;
        
        return mapSession(data.session, user);
      } catch {
        return null;
      }
    },

    async refreshSession(): Promise<AuthResult<AuthSession>> {
      try {
        const { data, error } = await client.auth.refreshSession();
        
        if (error) {
          return { success: false, error: mapError(error) };
        }

        if (!data.session || !data.user) {
          return { success: false, error: { code: 'SESSION_EXPIRED', message: 'Session expired' } };
        }

        const user = mapUser(data.user)!;
        return { success: true, data: mapSession(data.session, user) };
      } catch (e) {
        return { 
          success: false, 
          error: { code: 'NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' } 
        };
      }
    },

    async sendPasswordResetEmail(email: string): Promise<AuthResult<void>> {
      try {
        // Get origin safely for both browser and server environments
        const origin = typeof globalThis !== 'undefined' && 'location' in globalThis 
          ? (globalThis as unknown as { location: { origin: string } }).location.origin 
          : '';
        
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/reset-password`,
        });
        
        if (error) {
          return { success: false, error: mapError(error) };
        }
        return { success: true };
      } catch (e) {
        return { 
          success: false, 
          error: { code: 'NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' } 
        };
      }
    },

    async resetPassword(token: string, newPassword: string): Promise<AuthResult<void>> {
      try {
        // For Supabase, we need to verify the token first to establish session
        const { error: verifyError } = await client.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        });

        if (verifyError) {
          return { success: false, error: mapError(verifyError) };
        }

        // Now that session is established, update the password
        const { error } = await client.auth.updateUser({ password: newPassword });
        
        if (error) {
          return { success: false, error: mapError(error) };
        }
        return { success: true };
      } catch (e) {
        return { 
          success: false, 
          error: { code: 'NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' } 
        };
      }
    },
  };
}

// Export the client instance getter for advanced use cases
export function getSupabaseClient(opts: SupabaseAuthOptions): SupabaseClient {
  return createClient(opts.supabaseUrl, opts.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

// Export token verifier for server-side usage
export { makeSupabaseTokenVerifier } from "./token-verifier";
export type { TokenVerifierOptions } from "./token-verifier";
export type { TokenVerifierPort as SupabaseTokenVerifier } from "@budget/ports";