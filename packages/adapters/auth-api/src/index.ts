import type { 
  AuthProviderPort,
  AuthSession,
  AuthResult,
  SignupInput,
  LoginInput,
  AuthUser,
} from "@budget/ports";
import type { AuthError } from "@budget/schemas";

export type ApiAuthProviderOptions = {
  /** Base URL of the API (e.g., "http://localhost:8787" or "https://api.budgetwise.ca") */
  apiUrl: string;
};

/**
 * Auth provider that uses the API with HttpOnly cookies.
 * Implements AuthProviderPort so it can be used with the existing auth client.
 * 
 * This adapter calls API endpoints and the API manages session via HttpOnly cookies.
 * No tokens are exposed to JavaScript - secure against XSS.
 */
export function makeApiAuthProvider(opts: ApiAuthProviderOptions): AuthProviderPort {
  const { apiUrl } = opts;

  async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: AuthError }> {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // Send/receive HttpOnly cookies
      });

      const data = await response.json().catch(() => ({})) as T | { error?: AuthError; message?: string };

      if (!response.ok) {
        const errorData = data as { error?: AuthError; message?: string };
        return { 
          error: errorData.error || { 
            code: "UNKNOWN_ERROR", 
            message: errorData.message || "Request failed" 
          } 
        };
      }

      return { data: data as T };
    } catch (error) {
      return {
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  }

  return {
    async signup(input: SignupInput): Promise<AuthResult<AuthSession>> {
      const { data, error } = await apiFetch<{ user: AuthUser }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
      });

      if (error || !data) {
        return { success: false, error };
      }

      // API sets HttpOnly cookie, we return a session without tokens
      // The tokens exist in the cookie but are not accessible to JS
      return {
        success: true,
        data: {
          user: data.user,
          tokens: {
            accessToken: "", // Not accessible (HttpOnly)
            refreshToken: "", // Not accessible (HttpOnly)
          },
        },
      };
    },

    async login(input: LoginInput): Promise<AuthResult<AuthSession>> {
      const { data, error } = await apiFetch<{ user: AuthUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });

      if (error || !data) {
        return { success: false, error };
      }

      return {
        success: true,
        data: {
          user: data.user,
          tokens: {
            accessToken: "", // Not accessible (HttpOnly)
            refreshToken: "", // Not accessible (HttpOnly)
          },
        },
      };
    },

    async logout(): Promise<AuthResult<void>> {
      const { error } = await apiFetch<{ message: string }>("/auth/logout", {
        method: "POST",
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    },

    async getSession(): Promise<AuthSession | null> {
      const { data, error } = await apiFetch<{ user: AuthUser }>("/auth/me");

      if (error || !data) {
        return null;
      }

      return {
        user: data.user,
        tokens: {
          accessToken: "", // Not accessible (HttpOnly)
          refreshToken: "", // Not accessible (HttpOnly)
        },
      };
    },

    async refreshSession(): Promise<AuthResult<AuthSession>> {
      const { data, error } = await apiFetch<{ user: AuthUser }>("/auth/refresh", {
        method: "POST",
      });

      if (error || !data) {
        return { 
          success: false, 
          error: error || { code: "SESSION_EXPIRED", message: "Session expired" } 
        };
      }

      return {
        success: true,
        data: {
          user: data.user,
          tokens: {
            accessToken: "",
            refreshToken: "",
          },
        },
      };
    },

    async sendPasswordResetEmail(email: string): Promise<AuthResult<void>> {
      const { error } = await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    },

    async resetPassword(token: string, newPassword: string): Promise<AuthResult<void>> {
      const { error } = await apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    },
  };
}
